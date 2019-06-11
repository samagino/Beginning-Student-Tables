//import React from 'react';
//import ReactDOM from 'react-dom';
//import './index.css';

/*****************************
  Universal Constants I Want
*****************************/
// value to put in child columns that don't have an outExpr for that row, not sure what this should be
const grayVal = undefined;
// value to use to signal errors, not sure what this should be either.
const errorVal = 'error';
// value to set a wantExpr to in the case of syntax error
const wantSynError = Infinity;
// image path
const imgPath = './images/';
// global CSS stuff
const cellHeight = '30px';
const tableBorders = '1';

const colors = ['white',   'coral',  'cadetblue', 'pink', 'yellow',     'cornflowerblue', 'mediumpurple',
                'crimson', 'orchid', 'fuchsia',   'cyan', 'blueviolet', 'salmon',         'gold'];

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
          src={imgPath + 'check.png'}
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
          src={imgPath + 'plus.png'}
          title={props.title}
          onClick={props.onClick}/>
    );
}

// Button with a non-green plus on it
function PlusButton(props){
    return (
        <input
          type={'image'}
          style={props.style}
          src={imgPath + 'pluses/' + props.color + 'plus.png'}
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
          src={imgPath + 'cross.png'}
          title={props.title}
          onClick={props.onClick}/>
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
    function makeText(){
        if (props.outExpr === grayVal) {
            return '';
        } else {
            return String(props.outExpr);
        }
    }

    function makeImg(){
        let wantExpr;
        try {
            wantExpr = eval(props.wantText);
        } catch (e) {
            if (e instanceof SyntaxError) {
                wantExpr = wantSynError;
            }
        }

        if (props.outExpr === wantExpr) {
            return <img
                     src={imgPath + 'smileyface.png'}
                     style={{float: 'right'}}
                     title={"Yay! It's right!"}/>;
        } else if (props.outExpr === errorVal) {
            return <img
                     src={imgPath + 'frowneyface.png'}
                     style={{float: 'right'}}
                     title={"Oh no! You got an error!"}/>;
        } else {
            return '';
        }
    }

    let style = {... props.style, height: cellHeight};

    return (
        <td
          border={'1'}
          style={style}>
          {makeText()}
          {makeImg()}
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
            src={imgPath + 'parameters.png'}/>
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
        function rotateFexpr(fexpr, boolArr, acc, rotatedExprs) {
            let passedInvalidRows = 0;
            let thenBoolArr = [];
            let elseBoolArr = [];

            // null elseChild case
            if (fexpr === null) {
                return;
            }

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

            if (fexpr.thenChildren.length || fexpr.elseChild !== null) { // fexpr has children
                rotateFexprs(fexpr.thenChildren, thenBoolArr, trueColorIndex(acc + 1), rotatedExprs);
                rotateFexpr(fexpr.elseChild, elseBoolArr, falseColorIndex(acc + 1), rotatedExprs);
            }
        }

        fexprs.forEach((fexpr) => rotateFexpr(fexpr, boolArr, acc, rotatedExprs));
    }

    // [Fexpr] -> Number -> [{Fexpr, Style}]
    // takes a list of fexprs and an accumulator, returns flattened list of objects containing a fexpr and its associated css style
    function flattenFexprs(fexprs, acc){
        function flattenFexpr(fexpr, acc){
            if (fexpr === null) {
                return null;
            } else {
                return [{fexpr: fexpr, style: {backgroundColor: colors[acc]},
                         thenColor: colors[trueColorIndex(acc + 1)], elseColor: colors[falseColorIndex(acc + 1)]},
                        flattenFexprs(fexpr.thenChildren, trueColorIndex(acc + 1)),
                        flattenFexpr(fexpr.elseChild, falseColorIndex(acc + 1))].filter((elem) => elem !== null).flat();
            }
        }

        return fexprs.map((fexpr) => flattenFexpr(fexpr, acc)).flat();
    }


    let cellInfoss = new Array(props.numRows).fill(0).map((elem) => []);
    const trueArr = new Array(props.numRows).fill(true);
    rotateFexprs(props.fexprs, trueArr, 0, cellInfoss);

    return (
        <div
          style={{float: 'left'}}>
          <img
            style={{float: 'left'}}
            src={imgPath + 'functions.png'}/>
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
                                                           <PlusButton
                                                             color={headInfo.thenColor}
                                                             title={'Add Then Child'}
                                                             onClick={() => props.addThenChild(headInfo.fexpr)}
                                                           />
                                                           {headInfo.fexpr.elseChild === null ?
                                                            <PlusButton
                                                              color={headInfo.elseColor}
                                                              title={'Add Else Child'}
                                                              onClick={() => props.addElseChild(headInfo.fexpr)}
                                                            />
                                                            : ''}
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
            src={imgPath + 'wants.png'}/>
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
  #outExprs == #examples (well not for child fexprs)
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
        this.state = {examples: [{inTexts: ['0'], wantText: '?'}],                                    // rows
                      fexprs: [{text: initParam, outExprs: [0], thenChildren: [], elseChild: null}], // function columns
                      params: [initParam],                                                           // variable (parameter) columns
                      name: 'table'};                                                                // table name (used for recursion)
        
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
    test(fexpr, inTextss){
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

        // case for null elseChild
        if (fexpr === null){
            return null;
        }
        
        const lookup = makeLookup(this.state.examples);

        let synError = false;
        let funct;
        // check for errors in function
        try {
            funct = new Function([this.state.name].concat(this.state.params), `return ${fexpr.text}`);
        } catch (e) {
            if (e instanceof SyntaxError) {
                synError = true;
            }
        }

        let outExprs;
        if (! synError){
            outExprs = inTextss.map((args, i) => {
                let val;
                // check for errors in inputs
                try {
                    val = funct.apply(undefined, [lookup].concat(args.map(eval)));
                } catch (e) {
                    if (e instanceof SyntaxError) {
                        val = fexpr.outExprs[i];
                    } else if (e instanceof ReferenceError) {
                        val = errorVal;
                    }
                }

                return val;
            });
        } else {
            outExprs = fexpr.outExprs;
        }

        let thenChildren;
        let elseChild;
        if (outExprs.reduce(isBool, true)){
            // true indices are positive, false indices are negative
            const filterIndices = outExprs.map((outExpr, index) => outExpr ? index : toFalseIndex(index));

            const trueInTextss = inTextss.filter((inText, index) => filterIndices.includes(index));
            const falseInTextss = inTextss.filter((inText, index) => filterIndices.includes(toFalseIndex(index)));

            thenChildren = fexpr.thenChildren.map((thenChild) => this.test(thenChild, trueInTextss));
            elseChild = this.test(fexpr.elseChild, falseInTextss); // yay recursion

        } else {
            thenChildren = [];
            elseChild = null;
        }

        return {text: fexpr.text,             // doesn't change
                outExprs: outExprs,           // changes
                thenChildren: thenChildren,   // changes
                elseChild: elseChild};  // changes

    }

    // this one has side effects
    testAll(){
        const inTextss = this.state.examples.map((example) => example.inTexts);
        const fexprs = this.state.fexprs.map((fexpr) => this.test(fexpr, inTextss));
        this.setState({fexprs: fexprs});
    }
    
    //adds a new row
    addExample(){
        const examples = this.state.examples.slice();
        const inTexts = this.state.params.map((param) => '0');
        examples.push({inTexts: inTexts,
                       wantText: '?'});

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
                     elseChild: null});

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
                                       elseChild: null});

        this.setState({fexprs: this.state.fexprs});
    }

    //adds a then column to a fexpr
    addElseChild(parentFexpr){
        const firstParam = this.state.params.length ? this.state.params[0] : '';

        // only add else child if none currently exists
        if (parentFexpr.elseChild === null) {
            const outExprs = parentFexpr.outExprs.filter((outExpr) => outExpr === true).map((outExpr) => '?');

            parentFexpr.elseChild = {text: firstParam,
                                     outExprs: outExprs,
                                     thenChildren: [],
                                     elseChild: null};
        }

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
        // Fexpr -> Fexpr
        // filters out the deadFexpr recursively through the tree
        function killFexpr(fexpr){
            if (fexpr === null) {
                return null;
            }
            
            if (fexpr === deadFexpr){
                return fexpr.elseChild;
            } else {
                return {text: fexpr.text,
                        outExprs: fexpr.outExprs.slice(),
                        thenChildren: fexpr.thenChildren.map(killFexpr).filter((elem) => elem !== null),
                        elseChild: killFexpr(fexpr.elseChild)};
            }
        }
        
        //filter out the fexpr we don't want from the fexprs
        const fexprs = this.state.fexprs.map(killFexpr).filter((elem) => elem !== null);
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

              inTextChange={(e, modExample, modIndex) => {this.inTextChange(e, modExample, modIndex);
                                                          this.testAll();}}
              wantTextChange={this.wantTextChange}
              addExample={this.addExample}
              remExample={() => {this.remExample();
                                 this.testAll();}}
              
              fexprChange={(e, modFexpr) => {this.fexprChange(e, modFexpr);
                                             this.testAll();}}
              addFexpr={this.addFexpr}
              addThenChild={(parent) => {this.addThenChild(parent);
                                         this.testAll();}}
              addElseChild={(parent) => {this.addElseChild(parent);
                                         this.testAll();}}
              remFexpr={(dead) => {this.remFexpr(dead);
                                   this.testAll();}}

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
