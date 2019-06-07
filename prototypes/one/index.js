//import React from 'react';
//import ReactDOM from 'react-dom';
//import './index.css';

/*****************************
  Universal Constants I Want
*****************************/
// value to put in child columns that don't have an outExpr for that row, not sure what this should be
const grayVal = undefined;
// value to use to signal errors, not sure what this should be either.
const errorVal = undefined;
// global CSS stuff
const cellHeight = '30px';
const tableBorders = '1';

const colors = ['white', 'pink', 'coral', 'cadetblue', 'yellow', 'cornflowerblue', 'mediumpurple',
                'crimson', 'cyan', 'orchid', 'fuchsia', 'blueviolet', 'salmon', 'gold'];

/*********************
   Functions I Want
*********************/
// String
// returns a string containing one random lowercase latin character
function randomChar(){
    const a = 0x61;
    let char = Math.round(Math.random() * 26);
    char += a;
    return String.fromCharCode(char);
}

// Boolean -> N -> Boolean
// returns true if elem is a Boolean and acc is true, else returns false
function isBool(acc, elem){
    const val = acc && typeof elem == 'boolean' ;
    return val;
}

// Number -> Number
function trueColorIndex(n){
    return n % colors.length;
}

// Number -> Number
function falseColorIndex(n){
    return (n + (colors.length / 2)) % colors.length;
}

/*********************
   React Components
*********************/

/*** Buttons ***/
//button that probably tests a table
function TestButton(props){
    return (
        <input
          type={'image'}
          style={props.style}
          src={'./images/check.png'}
          title={props.title}
          onClick={props.onClick}/>
    );
}

// Button that probably adds something
function AddButton(props){
    return (
        <input
          type={'image'}
          style={props.style}
          src={'./images/plus.png'}
          title={props.title}
          onClick={props.onClick}/>
    );
}

// Button from image given from path
function PathButton(props){
    return (
        <input
          type={'image'}
          style={props.style}
          src={props.path}
          title={props.title}
          onClick={props.onClick}/>
    );
}

// Button that probably removes something
function RemButton(props){
    return (
        <input
          type={'image'}
          style={props.style}
          src={'./images/cross.png'}
          title={props.title}
          onClick={props.onClick}/>
    );
}

//button that says "Add Then Column"
function AddThenColumnButton(props){
    return (
        <button onClick={props.onClick}>
          Add Then Column
        </button>
    );
}

//button that says "Add Else Column"
function AddElseColumnButton(props){
    return (
        <button onClick={props.onClick}>
          Add Else Column
        </button>
    );
}

/*** Inputs ***/
// changes width according to length of text it holds
function DynamicInput(props){
    return (
        <input
          style={props.style}
          size={props.value.length + 1}
          type={'text'}
          value={props.value}
          onChange={props.onChange} />
    );
}

/*** Cells ***/
//cell that contains the output of a relevent fexpr applied to relevent inputs
function TestCell(props){
    const outText = String(props.outExpr);
    props.style.height = cellHeight;

    if (outText === props.wantText) {
        props.style.backgroundColor = 'palegreen';
    }

    function makeText(){
        if (props.outExpr === grayVal) {
            return '';
        } else {
            return outText;
        }
    }

    return (
        <td
          border={'1'}
          style={props.style}>
          {makeText()}
        </td>
    );
}

/*** Table Sections ***/
function Parameters(props){
    /*
      Props: examples, params
             paramChange(e, index), inTextChange(e, example, index), addParam(), addExample() remParam(index), remExample(example)
     */

    const style={backgroundColor: 'white'};
    
    return (
        <div
          style={{float: 'left'}}>
          <img
            style={{float: 'left'}}
            src={'./images/parameters.png'}/>
          <AddButton
            style={{clear: 'left', float: 'right'}}
            title={'Add Parameter (in column)'}
            onClick={props.addParam}/>

          <table border={'0'} style={{float: 'left', clear: 'both'}}>
            <tbody>
              <tr>
                <td style={{height: '34px'}}>
                </td>
              </tr>
              {props.examples.map((example, i) =>
                                  <tr key={i}>
                                  <td style={{height: '36px'}}>
                                      <RemButton
                                        style={{}}
                                        title={'Remove Example (row)'}
                                        onClick={() => props.remExample(example)}
                                      />
                                    </td>
                                  </tr>
                                 )}
            </tbody>
          </table>

          <table border={tableBorders} style={{minWidth: '180px', float: 'right', clear: 'right'}}>
            <tbody>
              <tr>
                {props.params.map((param, i) =>
                                  <td
                                    key={i}
                                    style={{height: cellHeight}}
                                    border={'1'}>
                                    <RemButton
                                      style={{float: 'right'}}
                                      title={'Remove Parameter (in column)'}
                                      onClick={() => props.remParam(i)} />
                                    <DynamicInput
                                      style={{float: 'left'}}
                                      type={'text'}
                                      value={param}
                                      onChange={(e) => props.paramChange(e, i)} />
                                  </td>
                                 )}
              </tr>
              {props.examples.map((example, i) =>
                                  <tr key={i}>
                                    {example.inTexts.map((inText, j) =>
                                                         <td
                                                           key={j}
                                                           style={{height: cellHeight}}
                                                           border={'1'}>
                                                           <DynamicInput
                                                             type={'text'}
                                                             value={inText}
                                                             onChange={(e) => props.inTextChange(e, example, j)}
                                                           />
                                                         </td>
                                                        )}
                                  </tr>
                                 )}
            </tbody>
          </table>
          <AddButton
            style={{clear: 'both', float: 'left'}}
            title={'Add Example (row)'}
            onClick={props.addExample}
          />
        </div>
    );
}

function Functs(props){
    /*
      Props: numRows, fexprs, wantTexts
             fexprChange(e, fexpr), addFexpr(), addThenChild(fexpr), addElseChild(fexpr), remFexpr(fexpr)
     */

    // [Fexpr] -> [Boolean] -> String -> [N] -> [{N, String}]
    // uses side effects to build a shallow 2d array from a tree type thing
    function rotateFexprs(fexprs, boolArr, acc, rotatedExprs){
        fexprs.forEach((fexpr) => {
            let passedInvalidRows = 0;
            let thenBoolArr = [];
            let elseBoolArr = [];

            boolArr.forEach((bool, j) => {
                if (bool) {
                    const outExpr = fexpr.outExprs[j - passedInvalidRows];
                    let style = {backgroundColor: colors[acc]};

                    if (outExpr === true) {
                        style.color = colors[trueColorIndex(acc + 1)];
                    } else if (outExpr === false) {
                        style.color = colors[falseColorIndex(acc + 1)];
                    }

                    rotatedExprs[j].push({outExpr: outExpr, style: style});
                    thenBoolArr.push(outExpr);
                    elseBoolArr.push(!outExpr);
                } else {
                    passedInvalidRows ++;
                    rotatedExprs[j].push({outExpr: grayVal, style: {backgroundColor: 'gray'}});
                    thenBoolArr.push(false);
                    elseBoolArr.push(false);
                }
            });

            if (fexpr.thenChildren.length || fexpr.elseChildren.length) { // fexpr has children
                rotateFexprs(fexpr.thenChildren, thenBoolArr, trueColorIndex(acc + 1), rotatedExprs);
                rotateFexprs(fexpr.elseChildren, elseBoolArr, falseColorIndex(acc + 1), rotatedExprs);
            }
        });
    }

    // [Fexpr] -> Number -> [{Fexpr, Style}]
    // takes a list of fexprs and an accumulator, returns flattened list of objects containing a fexpr and its associated css style
    function flattenFexprs(fexprs, acc){
        return fexprs.map((fexpr) =>
                          [{fexpr: fexpr, style: {backgroundColor: colors[acc]},
                            thenColor: colors[trueColorIndex(acc + 1)], elseColor: colors[falseColorIndex(acc + 1)]},
                           flattenFexprs(fexpr.thenChildren, trueColorIndex(acc + 1)),
                           flattenFexprs(fexpr.elseChildren, falseColorIndex(acc + 1))].flat()).flat();
    }


    let cellInfoss = new Array(props.numRows).fill(0).map((elem) => []);
    const trueArr = new Array(props.numRows).fill(true);
    rotateFexprs(props.fexprs, trueArr, 0, cellInfoss);

    return (
        <div
          style={{float: 'left'}}>
          <img
            style={{float: 'left'}}
            src={'./images/functions.png'}/>
          <AddButton
            style={{clear: 'left', float: 'right'}}
            title={'Add Function (out column)'}
            onClick={props.addFexpr}/>
          <table border={tableBorders} style={{minWidth: '200px', clear: 'both'}}>
            <tbody>
              <tr>
                {flattenFexprs(props.fexprs, 0).map((headInfo, i) =>
                                                    <td
                                                      key={i}
                                                      style={{...headInfo.style, height: cellHeight}}
                                                      border={'1'}>
                                                      <div style={{float: 'right'}}>
                                                        <RemButton
                                                          title={'Remove Function (out column)'}
                                                          onClick={() => props.remFexpr(headInfo.fexpr)}/>
                                                        {headInfo.fexpr.outExprs.reduce(isBool, true) ?
                                                         <div style={{float: 'right'}}>
                                                           <PathButton
                                                             path={'./images/pluses/' + headInfo.thenColor + 'plus.png'}
                                                             title={'Add Then Child'}
                                                             onClick={() => props.addThenChild(headInfo.fexpr)}
                                                           />
                                                           <PathButton
                                                             path={'./images/pluses/' + headInfo.elseColor + 'plus.png'}
                                                             title={'Add Else Child'}
                                                             onClick={() => props.addElseChild(headInfo.fexpr)}
                                                           />
                                                         </div>
                                                         : '' }
                                                      </div>
                                                      <DynamicInput
                                                        style={{float: 'left'}}
                                                        type={'text'}
                                                        value={headInfo.fexpr.text}
                                                        onChange={(e) => props.fexprChange(e, headInfo.fexpr)} />
                                                    </td>
                                                   )}
              </tr>
              {cellInfoss.map((cellInfos, i) =>
                              <tr key={i}>
                                {cellInfos.map((cellInfo, j) =>
                                               <TestCell
                                                 key={j}
                                                 style={cellInfo.style}
                                                 outExpr={cellInfo.outExpr}
                                                 wantText={props.wantTexts[i]}
                                               />
                                              )}
                              </tr>
                             )}
            </tbody>
          </table>
        </div>
    );
}

function Wants(props){
    /*
      Props: examples
             wantTextChange(e, example)
    */

    const style={backgroundColor: 'white'};

    return (
        <div
          style={{float: 'left'}}>
          <img
            style={{float: 'left'}}
            src={'./images/wants.png'}/>
          <div style={{height: '20px', clear: 'left', float: 'left'}}>
            {/* offset plus buttons in other sections */}
          </div>
          <table border={tableBorders} style={{minWidth: '200px', clear: 'both'}}>
            <tbody>
              <tr>
                <td style={{height: cellHeight}}>
                    Can't Delete Me
                </td>
              </tr>
              {props.examples.map((example, i) =>
                                  <tr key={i}>
                                    <td
                                      style={{height: cellHeight}}
                                      border={'1'}>
                                      <DynamicInput
                                        style={{float: 'left'}}
                                        type={'text'}
                                        value={example.wantText}
                                        onChange={(e) => props.wantTextChange(e, example)} />
                                    </td>
                                  </tr>
                                 )}
            </tbody>
          </table>
        </div>
    );
}

function Concise(props){
    return (
        <div>
          <DynamicInput
            style={{float: 'left'}}
            type={'text'}
            value={props.name}
            onChange={props.nameChange} />
          <TestButton
            style={{float: 'left'}}
            title={'Run Functions'}
            onClick={props.testAll}/>

          <span style={{clear: 'left', float: 'left'}}>
            <Parameters
              params={props.params}
              examples={props.examples}

              paramChange={props.paramChange}
              addParam={props.addParam}
              remParam={props.remParam}

              inTextChange={props.inTextChange}
              addExample={props.addExample}
              remExample={props.remExample}
            />
            <Functs
              fexprs={props.fexprs}
              numRows={props.examples.length}
              wantTexts={props.examples.map((example) => example.wantText)}

              fexprChange={props.fexprChange}
              addFexpr={props.addFexpr}
              addThenChild={props.addThenChild}
              addElseChild={props.addElseChild}
              remFexpr={props.remFexpr}
            />
            <Wants
              examples={props.examples}
              wantTextChange={props.wantTextChange}
            />
          </span>
        </div>
    );
}

/*
  Notes:
  #inTexts == #params
  #outExprs == #examples (for now at least)
  -----------------------
  |#inTexts != #outExprs|
  -----------------------
  
  Questions:
  should outExprs be in examples (rows) or fexprs (output columns)?
  if it's in fExps then it would be easier to test if they're all bools and do stuff from there
  but rendering is more annoying, so prolly should be in fexprs
*/
class App extends React.Component{
    constructor(props){
        super(props);
        const initParam = 'n';
        this.state = {examples: [{inTexts: ['0'], wantText: ''}],                                        // rows
                      fexprs: [{text: initParam, outExprs: ['?'], thenChildren: [], elseChildren: []}],  // function columns
                      params: [initParam],                                                               // variable (parameter) columns
                      name: 'table'};                                                                    // table name (used for recursion)
        
        this.test = this.test.bind(this);
        this.testAll = this.testAll.bind(this);
        this.addExample = this.addExample.bind(this);
        this.addFexpr = this.addFexpr.bind(this);
        this.addThenChild = this.addThenChild.bind(this);
        this.addElseChild = this.addElseChild.bind(this);
        this.addParam = this.addParam.bind(this);
        this.remExample = this.remExample.bind(this);
        this.remFexpr = this.remFexpr.bind(this);
        this.remParam = this.remParam.bind(this);
        this.inTextChange = this.inTextChange.bind(this);
        this.wantTextChange = this.wantTextChange.bind(this);
        this.fexprChange = this.fexprChange.bind(this);
        this.paramChange = this.paramChange.bind(this);
        this.nameChange = this.nameChange.bind(this);
    }

    // function that actually does stuff
    // this one is pure (no side effects)
    test(fexprs, inTextss){
        function makeLookup(table){
            function lookup() {
                return table.reduce((acc, example) => {
                    if (acc !== errorVal) {
                        return acc;
                    }

                    if (example.inTexts.reduce((acc, inText, index) => (acc && inText === String(arguments[index])), true)){
                        return example.wantText;
                    }

                    return errorVal;
                }, errorVal);
            }

            return lookup;
        }

        function toFalseIndex(n){
            // minus 1 is for zero case
            return (n * -1) - 1;
        }

        return fexprs.map((fexpr) => {
            const lookup = makeLookup(this.state.examples);
            const funct = new Function([this.state.name].concat(this.state.params), `return ${fexpr.text}`);
            const outExprs = inTextss.map((args) => funct.apply(undefined, [lookup].concat(args.map(eval)))); // NB: this '+' means concatenate, not add

            let thenChildren;
            let elseChildren;
            if (outExprs.reduce(isBool, true)){
                // true indices are positive, false indices are negative
                const filterIndices = outExprs.map((outExpr, index) => outExpr ? index : toFalseIndex(index));

                const trueInTextss = inTextss.filter((inText, index) => filterIndices.includes(index));
                const falseInTextss = inTextss.filter((inText, index) => filterIndices.includes(toFalseIndex(index)));

                thenChildren = this.test(fexpr.thenChildren, trueInTextss); // yay recursion
                elseChildren = this.test(fexpr.elseChildren, falseInTextss); // yay recursion
            } else {
                thenChildren = [];
                elseChildren = [];
            }

            return {text: fexpr.text,             // doesn't change
                    outExprs: outExprs,           // changes
                    thenChildren: thenChildren,   // changes
                    elseChildren: elseChildren};  // changes
        });

    }

    // this one has side effects
    testAll(){
        const fexprs = this.test(this.state.fexprs, this.state.examples.map((example) => example.inTexts));
        this.setState({fexprs: fexprs});
    }
    
    //adds a new row
    addExample(){
        const examples = this.state.examples.slice();
        const inTexts = this.state.params.map((param) => '0');
        examples.push({inTexts: inTexts,
                       wantText: ''});

        // need to maintain #outExprs == #examples
        // TODO: do I have to do this in children too?
        let fexprs = this.state.fexprs.slice();
        fexprs.forEach((fexpr) => fexpr.outExprs.push('?'));

        this.setState({examples: examples,
                       fexprs: fexprs});
    }
    
    //adds a new out column
    addFexpr(){
        const firstParam = this.state.params.length ? this.state.params[0] : '';

        let fexprs = this.state.fexprs.slice();
        const outExprs = this.state.examples.map((example) => '?');
        fexprs.push({text: firstParam,
                     outExprs: outExprs,
                     thenChildren: [],
                     elseChildren: []});

        this.setState({fexprs: fexprs});
    }

    //adds a then column to a fexpr
    addThenChild(parentFexpr){
        const firstParam = this.state.params.length ? this.state.params[0] : '';
        //const fexprs = this.state.fexprs.map((expr) => expr === parentFexpr ? parentFexpr : expr);
        //const fexprs = this.state.fexprs.slice();

        // how do I map these to the correct inTexts though?
        const outExprs = parentFexpr.outExprs.filter((outExpr) => outExpr === true).map((outExpr) => '?');

        parentFexpr.thenChildren.push({text: firstParam,
                                       outExprs: outExprs,
                                       thenChildren: [],
                                       elseChildren: []});

        this.setState({fexprs: this.state.fexprs});
    }

    //adds a then column to a fexpr
    addElseChild(parentFexpr){
        const firstParam = this.state.params.length ? this.state.params[0] : '';
        //const fexprs = this.state.fexprs.map((expr) => expr === parentFexpr ? parentFexpr : expr);
        //const fexprs = this.state.fexprs.slice();

        // how do I map these to the correct inTexts though?
        const outExprs = parentFexpr.outExprs.filter((outExpr) => outExpr === true).map((outExpr) => '?');

        parentFexpr.elseChildren.push({text: firstParam,
                                       outExprs: outExprs,
                                       thenChildren: [],
                                       elseChildren: []});

        this.setState({fexprs: this.state.fexprs});
    }

    // adds a new in column
    addParam(){
        const params = this.state.params.slice();
        params.push(randomChar());

        // need to maintain #inTexts == #params
        let examples = this.state.examples.slice();
        examples.forEach((example) => example.inTexts.push('0'));

        this.setState({params: params,
                       examples: examples});
    }
    
    //removes a row
    remExample(deadExample){
        // get index of example we wanna remove so we can remove all the corresponding outExprs
        const deadIndex = this.state.examples.indexOf(deadExample);
        //filter out the example we don't want from the examples
        const examples = this.state.examples.filter((example) => example !== deadExample);

        // gotta maintain #outExprs == #examples
        let fexprs = this.state.fexprs.slice();
        fexprs.forEach((fexpr) => fexpr.outExprs.splice(deadIndex, 1));

        this.setState({examples: examples,
                       fexprs: fexprs});
    }
    
    //removes an output column
    //has to search recursively through tree to find the right one
    remFexpr(deadFexpr){
        // [Fexpr] -> [Fexpr]
        // filters out the deadFexpr recursively through the tree
        function filterFexpr(fexprs){
            return fexprs.map((fexpr) => {
                if (fexpr === deadFexpr){
                    return undefined;
                } else {
                    return {text: fexpr.text,
                            outExprs: fexpr.outExprs.slice(),
                            thenChildren: filterFexpr(fexpr.thenChildren),
                            elseChildren: filterFexpr(fexpr.elseChildren)};
                }
            }).filter((elem) => elem !== undefined);
        }
        
        //filter out the fexpr we don't want from the fexprs
        const fexprs = filterFexpr(this.state.fexprs);
        this.setState({fexprs: fexprs});
    }

    // removes an input column
    remParam(deadIndex){
        let params = this.state.params.slice();
        params.splice(deadIndex, 1);

        //gotta maintain #inTexts == #params
        let examples = this.state.examples.slice();
        examples.forEach((example) => example.inTexts.splice(deadIndex, 1));

        this.setState({params: params,
                       examples: examples});
    }
    
    //handles changes caused by updating a text field
    //modExample refers to the modified row, modIndex referes to the modified inText
    inTextChange(e, modExample, modIndex){
        //const examples = this.state.examples.map((example) => example === modExample ? modExample : example);
        //const examples = this.state.examples.slice();
        modExample.inTexts[modIndex] = e.target.value;
        // this doesn't actually change anything, but it causes the table to rerender
        this.setState({examples: this.state.examples});
    }

    wantTextChange(e, modExample){
        //const examples = this.state.examples.map((example) => example === modExample ? modExample : example);
        //const examples = this.state.examples.slice();
        modExample.wantText = e.target.value;
        // this doesn't actually change anything, but it causes the table to rerender
        this.setState({examples: this.state.examples});
    }
    
    fexprChange(e, modFexpr){
        //const fexprs = this.state.fexprs.map((expr) => expr === modFexpr ? modFexpr : expr);
        //const fexprs = this.state.fexprs.slice();
        modFexpr.text = e.target.value;
        // this doesn't actually change anything, but it causes the table to rerender
        this.setState({fexprs: this.state.fexprs});
    }

    paramChange(e, modIndex){
        const modParam = e.target.value;
        // have to use index because params is an array of strings, not an array of objects
        const params = this.state.params.map((param, index) => index === modIndex ? modParam : param);
        // this one actually does stuff
        this.setState({params: params});
    }

    nameChange(e){
        // so does this one
        this.setState({name: e.target.value});
    }
    
    render(){
        return (
            <Concise
              examples={this.state.examples}
              fexprs={this.state.fexprs}
              params={this.state.params}
              name={this.state.name}

              inTextChange={this.inTextChange}
              wantTextChange={this.wantTextChange}
              addExample={this.addExample}
              remExample={this.remExample}
              
              fexprChange={this.fexprChange}
              addFexpr={this.addFexpr}
              addThenChild={this.addThenChild}
              addElseChild={this.addElseChild}
              remFexpr={this.remFexpr}

              paramChange={this.paramChange}
              addParam={this.addParam}
              remParam={this.remParam}

              nameChange={this.nameChange}

              testAll={this.testAll}
            />
        );
    }
}

//thing that decides what to render and where
const domContainer = document.querySelector('#table_method_container');
ReactDOM.render(<App />,
                domContainer);

//ReactDOM.render(<App />,
//		document.getElementById('root'));
