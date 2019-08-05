import React from 'react';
import {interp, parseCheck, unparse_cons, unparse_list, initEnv, RAPP_T, RFUNCT_T, RBOOL_T, RLIST_T} from './interpreter.js';
import {gray, pink, yellow, allBools, isBooleanFormula} from './header.js';
import toBSL from './prettyprint.js';
import './App.css';

/*****************************
  Universal Constants I Want
*****************************/
// value to indicate a dry run, i.e. don't actually change the underlying structure, just say
// if the given value exists or not
const dryRun = {yo: 'don\'t actually change anything'};
// image path
const imgPath = './images/';


/*********************
    Key Management
*********************/
// variable used by takeKey and peekKey to generate keys
let keyCount = 0;

// Number
// returns a unique key
function takeKey() {
    return keyCount++;
}

// [Number] -> Number (the brackets here mean optional, not array)
// returns current key without changing it
// shoud be used to look at current state of key without actually taking it
// optionally takes a number as an argument, in which case it returns the key that number
// of steps ahead of the current key
function peekKey(lookahead) {
    if (lookahead === undefined) {
        return keyCount;
    } else {
        return keyCount + lookahead;
    }
}

/**************
    Unparser
**************/
let unparse = unparse_cons;

/*****************
    Deep Equals
*****************/
// Program -> Program -> Boolean
// checks if two programs are equivalent, recurs on lists and applications
// may not quite work on functions because I use js functions, not data represented closures or something
//    thus 2 functions are only equal if they're a reference to the same object
function deepEquals(proga, progb) {
    if (proga.type !== progb.type) {
        return false;
    }

    if (proga.type === RLIST_T) {
        if (proga.value === null || progb.value === null) {
            return proga.value === progb.value;
        }
        return deepEquals(proga.value.a, progb.value.a) && deepEquals(proga.value.d, progb.value.d);
    }

    // this case will prolly never even happen...
    if (proga.type === RAPP_T) {
        if (proga.value.args.length !== progb.value.args.length) {
            return false;
        }
        let functCheck = deepEquals(proga.value.funct, progb.value.funct);
        let argCheck = proga.value.args.map((arga, i) => deepEquals(arga, progb.value.args[i])).every((elem) => elem);
        return functCheck && argCheck;
    }

    return proga.value === progb.value;
}

/*********************
   React Components
*********************/

/*** Buttons ***/
// Button that probably removes something
function RemButton(props){
    return (
        <div className='cross_button'>
          <input
            type={'image'}
            style={props.style}
            src={'./images/smallCross.png'}
            alt='Remove'
            title={props.title}
            onClick={props.onClick}/>
        </div>
    );
}

/*** Inputs ***/
class ValidatedInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {text: ''};

        this.textChange = this.textChange.bind(this);
    }

    textChange(e) {
        let text = e.target.value;

        this.setState((state) => ({text}));

        if (this.props.isValid(text)) {
            this.props.onValid(text);
        } else if (text === '' && !this.props.dummy) {
            this.props.onEmpty();
        }

    }

    render() {
        let className;
        if (this.props.dummy && this.state.text === '') { // empty dummy
            className = 'dummy_input';
        } else if (this.props.isValid(this.state.text)) { // valid
            className = 'valid_input';
        } else if (this.state.text === '') { // empty non-dummy
            className = 'empty_input';
        } else { // invalid
            className = 'invalid_input';
        }
        
        let size;
        if (this.state.text.length === 0)
            size = this.props.placeholder.length;
        else
            size = Math.max(this.state.text.length + 2, 4);

        return (
            <input
              className={className}
              size={size}
              placeholder={this.props.placeholder}
              type={'text'}
              value={this.state.text}
              onChange={this.textChange}
            />
        );
    }
}

/*** Table Sections ***/
// let's put everything in one table woo
function Succinct(props) {

    function tableChange(newTab, oldTab) {
        const exists = props.tables.indexOf(oldTab) !== -1;

        let alteredTabs;
        if (exists) {
            alteredTabs = props.tables.map((table) => table === oldTab ? newTab : table);
        } else {
            alteredTabs = [...props.tables, newTab];
        }

        props.programChange(alteredTabs);
    }

    function remTable(deadTab) {
        let aliveTabs = props.tables.filter((table) => table !== deadTab);
        props.programChange(aliveTabs);
    }

    // String -> Boolean
    function validName(text, modTab) {
        function lookup(name, env) {
            return env.reduce((acc, variable) => {
                if (acc) {
                    return true;
                }

                return variable.name === name;

            }, false);
        }

        let tableVars = props.tables.filter((table) => table !== modTab).map((otherTab) => ({name: otherTab.name, binding: null}));
        let paramVars = modTab.params.map((param) => ({name: param, binding: null}));
        let env = [...initEnv, ...tableVars, ...paramVars];

        const varRE = /^[a-zA-Z+\-*/?=><]+$/; // change me

        return varRE.test(text) && !lookup(text, env);
    }

    const reals = props.tables.map((table) => (
        <div key={table.key} className='table_method' >
          <div className='full_cell'>
            <ValidatedInput
              dummy={false}
              placeholder='Table Name'
              isValid={(text) => validName(text, table)}
              onValid={(text) => tableChange({...table,
                                              name: text},
                                             table)}
              onEmpty={() => tableChange({...table,
                                          name: yellow},
                                         table)}
            />
            <RemButton
              onClick={() => remTable(table)}
              title='Remove this table'
            />
          </div>
          <SuccinctTab
            table={table}
            tableNames={props.tables.map((table) => table.name)}
            tableChange={(newTab) => tableChange(newTab, table)}
          />
        </div>
    ));

    const dummy = (
        <div key={peekKey()} className='table_method'>
          <div className='full_cell'>
            <ValidatedInput
              dummy={true}
              placeholder='Table Name'
              isValid={(text) => validName(text, {params: []})}
              onValid={(text) => tableChange({name: text,
                                              examples: [],
                                              formulas: [],
                                              params: [],
                                              key: takeKey()},
                                             {})}
            />
          </div>
          <SuccinctTab
            table={{name: yellow,
                    examples: [],
                    formulas: [],
                    params: [],
                    key: peekKey()}}
            tableNames={props.tables.map((table) => table.name)}
            tableChange={(newTab) => tableChange(newTab, {})}
          />
        </div>
    );

    return (
        <div>
          {[...reals, dummy]}
        </div>
    );
}

function SuccinctTab(props) {
    function paramsExamplesChange(params, examples) {
        props.tableChange({...props.table, params, examples});
    }

    function formulasChange(formulas) {
        props.tableChange({...props.table, formulas});
    }

    function examplesFormulasChange(examples, formulas) {
        props.tableChange({...props.table, examples, formulas});
    }

    return (
        <table className={'html_table'}>
          <SuccinctHead
            params={props.table.params}
            examples={props.table.examples}
            tableNames={props.tableNames}
            paramsExamplesChange={paramsExamplesChange}

            formulas={props.table.formulas}
            formulasChange={formulasChange}
          />
          <SuccinctBody
            examples={props.table.examples}
            formulas={props.table.formulas}
            paramNames={props.table.params.map((param) => param.name)}
            examplesFormulasChange={examplesFormulasChange}
            formulasChange={formulasChange}
          />
        </table>
    );
}

function SuccinctHead(props) {
    // String -> Boolean
    // checks if the given string is a valid program
    function validProg(text) {
        let isgood = true;

        try {
            parseCheck(text);
        } catch(e) {
            if (e instanceof SyntaxError) {
                isgood = false;
            } else { // this should never happen
                throw e;
            }
        }

        return isgood;
    }

    // Formula -> Side Effect
    // removes a given formula from the tree
    function remFormula(deadForm) {
        const aliveForms = props.formulas.filter((formula) => formula !== deadForm);
        props.formulasChange(aliveForms);
    }

    // Formula -> Formula -> Side Effect
    // replaces one formula with another one
    function formulaChange(newForm, oldForm) {

        let alteredForms;
        if (props.formulas.indexOf(oldForm) === -1) {
            alteredForms = [...props.formulas, newForm];
        } else {
            alteredForms = props.formulas.map((form) => form === oldForm ? newForm : form);
        }
        props.formulasChange(alteredForms);
    }

    // Formula -> Number -> Number
    // gives the maximum depth of a Formula, second parameter is an accumulator
    function maxDepth(formula, curMax) {
        if (!isBooleanFormula(formula)) {
            return curMax;
        } else {
            return formula.thenChildren.reduce((acc, child) => Math.max(acc, maxDepth(child, curMax + 1)), curMax + 1);
        }
    }

    function countWidth(formula) {
        if (!isBooleanFormula(formula)) {
            return 1;
        } else {
            return formula.thenChildren.reduce((acc, child) => acc + countWidth(child), 2);
        }
    }


    // Number -> [Number]
    // takes a number, returns an array that counts from 1 to that number, input of 0 gives empty array
    // e.g. countUp(5) -> [1, 2, 3, 4, 5]
    function countUp(num) {
        // special case: want an empty array for 0
        if (num === 0) {
            return [];
        } else if (num === 1)
            return [1];
        else
            return [...countUp(num - 1), num];
    }

    const abyss = props.formulas.reduce((acc, formula) => Math.max(acc, maxDepth(formula, 0)), 0);
    const numParams = props.params.length;

    const reals = props.formulas.map((formula) => (
        <th key={formula.key} colSpan={countWidth(formula)} >
          <div className='full_cell'>
            <ValidatedInput
              placeholder={'Formula'}
              dummy={false}
              isValid={validProg}
              onValid={(text) => formulaChange({...formula,
                                                prog: parseCheck(text)},
                                               formula)}
              onEmpty={() => formulaChange({...formula,
                                            prog: yellow},
                                           formula)}
            />
            <RemButton
              title={'Remove formula'}
              onClick={() => remFormula(formula)}
            />
          </div>
        </th>
    ));

    const dummy = (
        <th key={peekKey()} colSpan={1}>
          <div className='full_cell'>
            <ValidatedInput
              dummy={true}
              placeholder='Formula'
              isValid={validProg}
              onValid={(text) => formulaChange({prog: parseCheck(text),
                                                outputs: props.examples.map((_) => yellow),
                                                key: takeKey()},
                                               {})}
            />
          </div>
        </th>
    );

    const children = countUp(abyss).map((depth) => (
        <tr key={depth}>
          <th colSpan={numParams + 2}>{/* empty cell to align with example RemButton and Parameters */}</th>
          {props.formulas.map((formula) => (
              <DepictFormula
                key={formula.key}
                formula={formula}
                depth={depth}
                numExamples={props.examples.length}
                formulaChange={(newForm) => formulaChange(newForm, formula)}
              />
          ))}
        </tr>
    ));

    return (
        <thead>
          <tr>
            <Parameters
              params={props.params}
              examples={props.examples}
              tableNames={props.tableNames}
              paramsExamplesChange={props.paramsExamplesChange}
            />
            {/* top level formulas */}
            {[...reals, dummy]}
          </tr>
          {/* rest of formulas */}
          {children}
        </thead>
    );
}

function Parameters(props) {
    // 
    function validParam(text, modParam) {
        function lookup(name, env) {
            return env.reduce((acc, variable) => {
                if (acc) {
                    return true;
                }

                return variable.name === name;

            }, false);
        }

        // These are not technically Variables, see note above
        let paramVars = props.params.filter((param) => param !== modParam).map((param) => ({name: param.name, binding: null}));
        let tableVars = props.tableNames.map((name) => ({name: name, binding: null}));
        let env = [...initEnv, ...tableVars, ...paramVars];

        const varRE = /^[a-zA-Z+\-*/?=><]+$/; // change me

        return varRE.test(text) && !lookup(text, env);
    }

    function remParam(deadParam) {
        const deadIndex = props.params.indexOf(deadParam);
        const aliveParams = props.params.filter((param) => param !== deadParam);

        // need to maintain #inputs = #params
        const modExamples = props.examples.map((example => ({...example,
                                                             inputs: example.inputs.filter((_, i) => i !== deadIndex)})));

        props.paramsExamplesChange(aliveParams, modExamples);
    }

    // String -> Number -> Side Effect
    // changes the name of the given parameter
    // if that parameter doesn't exist yet, it makes it
    function paramChange(newParam, modParam) {

        let alteredParams, alteredExamples;
        if (props.params.indexOf(modParam) === -1) {
            alteredParams = [...props.params, newParam];
            // need to maintain #inputs = #params
            alteredExamples = props.examples.map((example) => ({...example,
                                                                inputs: [...example.inputs, {prog: yellow, key: takeKey()}]}));
        } else {
            alteredParams = props.params.map((param) => param === modParam ? newParam : param);
            // examples don't actually change
            alteredExamples = props.examples;
        }

        props.paramsExamplesChange(alteredParams, alteredExamples);
    }

    const reals = props.params.map((param) => (
        <th key={param.key} >
          <div className='full_cell'>
            <ValidatedInput
              dummy={false}
              placeholder='Parameter'
              isValid={(text) => validParam(text, param)}
              onValid={(text) => paramChange({...param,
                                              name: text},
                                             param)}
              onEmpty={() => paramChange({...param,
                                          name: yellow},
                                         param)}
            />
            <RemButton
              title='remove this parameter'
              onClick={() => remParam(param)}
            />
          </div>
        </th>
    ));

    const dummy = (
        <th key={peekKey()}>
          <div className='full_cell'>
            <ValidatedInput
              dummy={true}
              placeholder='Parameter'
              isValid={(text) => validParam(text, {})}
              onValid={(text) => paramChange({name: text,
                                              key: takeKey()},
                                             {})}
            />
          </div>
        </th>
    );

    return (
        <React.Fragment>
          <th>{/* empty cell to align with example RemButtons */}</th>
          <React.Fragment>
            {[...reals, dummy]}
          </React.Fragment>
        </React.Fragment>
    );
}

/*
  props: formula, depth, kill, formulaChange
*/
function DepictFormula(props) {
    function validProg(text) {
        let isgood = true;

        try {
            parseCheck(text);
        } catch(e) {
            if (e instanceof SyntaxError) {
                isgood = false;
            } else {
                throw e;
            }
        }

        return isgood;
    }

    // this is pretty macabre...
    function remChild(deadChild) {
        const aliveChildren = props.formula.thenChildren.filter((child) => child !== deadChild);
        props.formulaChange({...props.formula, thenChildren: aliveChildren});
    }

    function childChange(newChild, modChild) {
        let children;
        if (props.formula.thenChildren.indexOf(modChild) === -1) {
            children = [...props.formula.thenChildren, newChild];
        } else {
            children = props.formula.thenChildren.map((child) => child === modChild ? newChild : child);
        }
        props.formulaChange({...props.formula, thenChildren: children});
    }

    function countWidth(formula) {
        if (!isBooleanFormula(formula)) {
            return 1;
        } else {
            return formula.thenChildren.reduce((acc, child) => acc + countWidth(child), 2);
        }
    }

    if (props.depth > 1) {
        return (
            <React.Fragment>
              <th>{/* empty cell to align with parent input */}</th>
              {isBooleanFormula(props.formula) ?
               <React.Fragment>
                 {props.formula.thenChildren.map((child) => (
                     <DepictFormula
                       key={child.key}
                       formula={child}
                       depth={props.depth - 1}
                       numExamples={props.numExamples}
                       formulaChange={(formula) => childChange(formula, child)}
                     />))}
                 <th>{/* empty cell to align with child input */}</th>
               </React.Fragment>
               : <script/> }
            </React.Fragment>
        );
    } else {
        if (isBooleanFormula(props.formula)) {
            const reals = props.formula.thenChildren.map((child) => (
                <th key={child.key} colSpan={countWidth(child)} >
                  <div className='full_cell'>
                    <ValidatedInput
                      dummy={false}
                      placeholder={'Formula'}
                      isValid={validProg}
                      onValid={(text) => childChange({...child,
                                                      prog: parseCheck(text)},
                                                     child)}
                      onEmpty={() => childChange({...child,
                                                  prog: yellow},
                                                 child)}
                    />
                    <RemButton
                      title={'Remove formula'}
                      onClick={() => remChild(child)}
                    />
                  </div>
                </th>
            ));

            const dummy = (
                <th key={peekKey()} colSpan={1}>
                  <div className='full_cell'>
                    <ValidatedInput
                      dummy={true}
                      placeholder='Formula'
                      isValid={validProg}
                      onValid={(text) => childChange({prog: parseCheck(text),
                                                      outputs: Array(props.numExamples).fill(yellow),
                                                      key: takeKey()},
                                                     {})}
                    />
                  </div>
                </th>
            );

            return (
                <React.Fragment>
                  <th>{/* empty cell to align with parent input */}</th>
                   <React.Fragment>
                     {[...reals, dummy]}
                   </React.Fragment>
                </React.Fragment>
            );
        } else {

            return (
                <React.Fragment>
                  <th>{/* empty cell to align with parent input */}</th>
                </React.Fragment>
            );
        }
    }
}

function SuccinctBody(props) {
    function remExample(deadExample) {
        const deadIndex = props.examples.indexOf(deadExample);
        // Formula -> Formula
        // removes the output at deadIndex from the given formula and all of its children (if it has any) so stuff works
        function removeOutputFromFormula(formula) {
            let outputs = formula.outputs.filter((_, i) => i !== deadIndex);

            if (isBooleanFormula(formula)) {
                const thenChildren = formula.thenChildren.map(removeOutputFromFormula);
                return {...formula,
                        outputs,
                        thenChildren};
            } else {
                return {...formula,
                        outputs};
            }
        }


        const aliveExamples = props.examples.filter((example) => example !== deadExample);
        const alteredForms = props.formulas.map(removeOutputFromFormula);
        props.examplesFormulasChange(aliveExamples, alteredForms);
    }

    function exampleChange(newExample, oldExample) {
        const exists = props.examples.indexOf(oldExample) !== -1;

        if (newExample === dryRun) {
            return exists;
        }

        // Formula -> Formula
        // adds an init output to the given formula and all of its children (if it has any) so stuff works
        function addAnotherOutputToFormula(formula) {
            let outputs = [...formula.outputs, yellow];

            if (isBooleanFormula(formula)) {
                const thenChildren = formula.thenChildren.map(addAnotherOutputToFormula);
                return {...formula,
                        outputs,
                        thenChildren};
            } else {
                return {...formula,
                        outputs};
            }
        }

        let alteredExamples, alteredForms;
        if (exists) {
            alteredExamples = props.examples.map((example) => example === oldExample ? newExample : example);
            alteredForms = props.formulas;
        } else {
            alteredExamples = [...props.examples, newExample];
            alteredForms = props.formulas.map(addAnotherOutputToFormula);
        }

        props.examplesFormulasChange(alteredExamples, alteredForms);
        return true; // this doesn't actually do anything
    }

    const reals = props.examples.map((example, i) => (
          <tr key={example.key}>
            <td>
              <RemButton
                onClick={() => remExample(example)}
                title={'Remove this example'}
              />
            </td>
            <Inputs
              dummy={false}
              inputs={example.inputs}
              inputsChange={(inputs) => exampleChange({...example, inputs},
                                                      example)}
            />
            <td>{/* empty cell to align with param dummy input */}</td>
            <Outputs
              dummy={false}
              formulas={props.formulas}
              want={example.want}
              row={i}
            />
            <td>{/* empty cell to align with top level formula dummy input */}</td>
            <Want
              dummy={false}
              wantChange={(want) => exampleChange({...example, want},
                                                  example)}
            />
          </tr>
    ));
    
    const dummy = (
          <tr key={peekKey(props.paramNames.length)}>
            <td>{/* empty cell to offset rembutton */}</td>
            <Inputs
              dummy={true}
              inputs={props.paramNames.map((_, i) => ({key: peekKey(i)}))}
              inputsChange={(inputs) => exampleChange({inputs,
                                                       want: yellow,
                                                       key: takeKey()},
                                                      {})}
            />
            <td>{/* empty cell to align with param dummy input */}</td>
            <Outputs
              dummy={true}
              formulas={props.formulas}
            />
            <td>{/* empty cell to align with top level formula dummy input */}</td>
            <Want
              dummy={true}
              wantChange={(want) => exampleChange({want,
                                                   inputs: props.paramNames.map((_) => ({prog: yellow, key: takeKey()})),
                                                   key: takeKey()},
                                                  {})}
            />
          </tr>
    );

    return (
        <tbody>
          {[...reals, dummy]}
        </tbody>
    );
}

function Inputs(props) {
    function validProg(text) {
        try {
            interp(parseCheck(text), initEnv);
        } catch(e) {
            return false;
        }
        return true;
    }

    function inputChange(newInput, oldInput) {
        let alteredInputs;
        if (props.dummy) {
            alteredInputs = props.inputs.map((input) => input === oldInput ? {...newInput, key: takeKey()} : {prog: yellow, key: takeKey()});
        } else {
            alteredInputs = props.inputs.map((input) => input === oldInput ? newInput : input);
        }
        props.inputsChange(alteredInputs);
    }

    return (
        <React.Fragment>
          {props.inputs.map((input, i) => (
              <td key={input.key} >
                <ValidatedInput
                  dummy={props.dummy}
                  placeholder={'Input'}
                  isValid={validProg}
                  onValid={props.dummy ?
                           (text) => inputChange({prog: interp(parseCheck(text), initEnv)},
                                                  input)
                           :
                           (text) => inputChange({...input,
                                                  prog: interp(parseCheck(text), initEnv)},
                                                 input)}
                  
                  onEmpty={() => inputChange({...input,
                                              prog: yellow},
                                             input)}
                />
              </td>
          ))}
        </React.Fragment>
    );
}

function Outputs(props) {
    function countWidth(formula) {
        if (!isBooleanFormula(formula)) {
            return 1;
        } else {
            return formula.thenChildren.reduce((acc, child) => acc + countWidth(child), 2);
        }
    }

    if (props.dummy) {
        return (
            <React.Fragment>
            {props.formulas.map((formula) => (
                <td key={formula.key} colSpan={countWidth(formula)}>{/* empty cell */}</td>
            ))}
            </React.Fragment>
        );
    } else {
        return (
            <React.Fragment>
              {props.formulas.map((formula) => (
                  <React.Fragment key={formula.key}>
                    <TestCell
                      output={formula.outputs[props.row]}
                      want={props.want}
                    />
                    {isBooleanFormula(formula) ?
                     <React.Fragment>
                       <Outputs
                         formulas={formula.thenChildren}
                         want={props.want}
                         row={props.row}
                       />
                       <td>{/* empty cell to align with dummy child */}</td>
                     </React.Fragment>
                     : <script/> }
                  </React.Fragment>
              ))}
            </React.Fragment>
        );
    }
}

function TestCell(props) {

    if (props.output === gray) {
        return (
            <td className={'gray'}>
            </td>
        );
    }

    if (props.output === pink) {
        return (
            <td className={'pink'}>
            </td>
        );
    }

    if (props.output === yellow) {
        return (
            <td className={'yellow'}>
            </td>
        );
    }

    let output = props.output;
    let want = yellow;

    if (props.want !== yellow) {
        try {
            want = interp(props.want, initEnv);
        } catch (e) {
            output = e;
        }
    }

    let text, error;
    if (output instanceof Error) {
        text = output.message;
        error = true;
    } else {
        text = unparse(output);
        error = false;
    }

    let img;
    if (error) {
        img = <img
                src={imgPath + 'frowneyface.png'}
                alt='Error!'
                style={{float: 'right'}}
                title={"Oh no! You got an error!"}/>;
    }else if (want === yellow) { // I should make this better
        img = '';
    } else if (deepEquals(output, want)) {
        img =  <img
                 src={imgPath + 'smileyface.png'}
                 alt='Yay!'
                 style={{float: 'right'}}
                 title={"Yay! It's right!"}/>;
    } else {
        img = '';
    }

    return (
        <td className={'output'}>
          {text}
          {img}
        </td>
    );
}

function Want(props) {
    function validProg(text) {
        try {
            interp(parseCheck(text), initEnv);
        } catch(e) {
            return false;
        }
        return true;
    }

    return (
        <td>
          <ValidatedInput
            dummy={props.dummy}
            placeholder={'Want'}
            isValid={validProg}
            onValid={(text) => props.wantChange(interp(parseCheck(text), initEnv))}
            onEmpty={() => props.wantChange(yellow)}
          />
        </td>
    );
}

/*
  notes:
  #inputs === #params
  #outputs === #examples
  ---------------------
  |#inputs !== #outputs| (well it can but not always)
  ---------------------
*/

class App extends React.Component {
    constructor(props){
        super(props);
        let tables = [{examples: [{inputs: [{prog: yellow, key: takeKey()}], want: yellow, key: takeKey()}],
                       formulas: [{prog: yellow, outputs: [yellow], key: takeKey()}],
                       params: [{name: yellow, key: takeKey()}],
                       name: yellow,
                       key: takeKey()}];
        this.state = {tables};

        this.programChange = this.programChange.bind(this);
    }

    calculate(program) {
        function makeLookup(table) {
            function lookup(args) {
                if (args.length !== table.params.length) {
                    throw new Error('Arity Mismatch, expected ' + table.params.length + ' argument' + (table.params.length === 1 ? '' : 's'));
                }

                let expr = table.examples.reduce((acc, example) => {
                    if (acc !== undefined) {
                        return acc;
                    }

                    // I have no idea what should happen if this is called on a table with no params
                    if (example.inputs.reduce((acc, input, i) => {
                        return acc && deepEquals(input.prog, args[i]);
                    }, true)) {
                        if (example.want === yellow) {
                            throw new ReferenceError(`(${table.name} ${args.map(unparse).join(' ')}) doesn't have a want`);
                        } else {
                            return example.want;
                        }
                    }

                    return undefined;
                }, undefined);

                if (expr === undefined) {
                    // it's like a reference error in the super meta table language
                    throw new ReferenceError(args.map(unparse).join() + ' is not an example in ' + table.name);
                }

                return expr;
            }

            return lookup;
        }

        let lookups = program.map((table) => ({name: table.name, binding: {value: makeLookup(table), type: RFUNCT_T}}));
        let globalEnv = [...initEnv, ...lookups];

        function calcTable(table) {
            function calcFormula(formula, examples) {
                let outputs = examples.map((example) => {
                    if (example === gray) {
                        return gray;
                    } else if (example === pink) {
                        return pink;
                    } else if (!example.inputs.every((input) => input.prog !== yellow) || formula.prog === yellow) {
                        // if any of the inputs or the formula isn't initialized, return yellow
                        return yellow;
                    }

                    let localEnv = table.params.map((param, i) => ({name: param.name, binding: example.inputs[i].prog}));
                    let env = [...globalEnv, ...localEnv];

                    try {
                        var output = interp(formula.prog, env);
                    } catch (e) {
                        output = e;
                    }

                    return output;
                });

                if (allBools(outputs) || (formula.thenChildren !== undefined && formula.thenChildren.length !== 0)) {
                    function maybeSpecial(example, output) {
                        if (example === gray || output.value === false)
                            return gray;
                        else if (typeof output.value !== 'boolean')
                            return pink;
                        else
                            return example;
                    }

                    if (formula.thenChildren === undefined) {
                        var thenChildren = [];
                    } else {
                        let subExamples = examples.map((example, i) => maybeSpecial(example, outputs[i]));
                        thenChildren = formula.thenChildren.map((formula) => calcFormula(formula, subExamples));
                    }

                    return {...formula,
                            outputs,
                            thenChildren};
                } else {
                    let newFormula = {...formula,
                                      outputs};
                    delete newFormula.thenChildren;
                    return newFormula;
                }
            }

            if (table.name === yellow || !table.params.every((param) => param.name !== yellow)) { // if the table or any of the table's parameters don't have a name yet, freeze outputs
                return {...table}; 
            } else {
                let formulas = table.formulas.map((formula) => calcFormula(formula, table.examples));
                return {...table,
                        formulas};
            }

        }

        return program.map(calcTable);
    }

    programChange(newProg) {
        let calkedProg = this.calculate(newProg);
        //console.log(calkedProg);
        //console.log('next key: ', peekKey());
        //console.log(toBSL(calkedProg));
        this.setState((state) => {
            return {tables: calkedProg};
        });
    }

    render(){
        return (
            <div>
              <input
                type='radio'
                name='unparse_mode_button'
                id='cons_mode_button'
                onInput={() => {unparse = unparse_cons; this.setState((state) => state);}}
                defaultChecked={true}
              />
              <label htmlFor='cons_mode_button'>cons mode</label>

              <input
                type='radio'
                name='unparse_mode_button'
                id='list_mode_button'
                onInput={() => {unparse = unparse_list; this.setState((state) => state);}}
              />
              <label htmlFor='list_mode_button'>list mode</label>

              <Succinct
                tables={this.state.tables}
                programChange={this.programChange}
              />
              <textarea
                rows={20}
                cols={100}
                className='bsl_io'
                readOnly={true}
                value={toBSL(this.state.tables, unparse, 100, 50)}
              />
            </div>
        );
    }
}

export default App;
