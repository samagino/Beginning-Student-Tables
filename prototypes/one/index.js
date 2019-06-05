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

const colors = ['white', 'aquamarine', 'pink', 'cadetblue', 'orchid', 'coral', 'cornflowerblue',
                'crimson', 'cyan', 'darkorange', 'fuchsia', 'lavender', 'salmon', 'yellow'];

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

// [Fexpr] -> Number -> [{Fexpr, Style}]
// takes a list of fexprs and an accumulator, returns flattened list of objects containing a fexpr and its associated css style
function flattenFexprs(fexprs, acc){
    return fexprs.map((fexpr) =>
                      [{fexpr: fexpr, style: {backgroundColor: colors[acc]}},
                       flattenFexprs(fexpr.thenChildren, trueColorIndex(acc + 1)),
                       flattenFexprs(fexpr.elseChildren, falseColorIndex(acc + 1))].flat()
                     ).flat();
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
//button that says "Delete"
function DelButton(props){
    return (
        <button onClick={props.onClick}>
          Delete
        </button>
    );
}

//button that says "Test"
function TestButton(props){
    return (
        <button
          onClick={props.onClick}>
          Test
        </button>
    );
}

//button that says "Add Row"
function AddRowButton(props){
    return (
        <button onClick={props.onClick}>
          Add Row
        </button>
    );
}

//button that says "Add Column"
function AddInColumnButton(props){
    return (
        <button onClick={props.onClick}>
          Add In Column
        </button>
    );
}

//button that says "Add Out Column"
function AddOutColumnButton(props){
    return (
        <button onClick={props.onClick}>
          Add Out Column
        </button>
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

/*** Cells ***/
//cell in a table that has a button that says "delete"
function DelCell(props){
    return(
        <td style={props.style}>
          <DelButton onClick={props.onClick}/>
        </td>
    );
}

//cell in a table that one can write an expression in
function ExprCell(props){
    return (
        <td style={props.style}>
          <input 
            type="text"
            value={props.text}
            onChange={props.onChange} />
        </td>
    );
}

//cell that contains the output of a relevent fexpr applied to relevent inputs
function TestCell(props){
    const outText = String(props.outExpr);

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
          style={props.style}>
          {makeText()}
        </td>
    );
}

/*** Rows ***/
//value mapping row
function IORow(props){
    return (
        <tr>
          {props.inTexts.map((inText, index) =>
                             <ExprCell
                               key={index}
                               style={{backgroundColor: 'white'}}
                               text={inText}
                               onChange={(e) => props.inChange(e, index)}
                             />)} 
          {props.cellInfos.map((cellInfo, index) => 
                            <TestCell
                              key={index}
                              outExpr={cellInfo.outExpr}
                              style={cellInfo.style}
                              wantText={props.wantText}
                            />)}
          <ExprCell
            style={{backgroundColor: 'white'}}
            text={props.wantText}
            onChange={props.wantChange} />
          <DelCell
            style={{backgroundColor: 'white'}}
            onClick={props.onClick}
          />
        </tr>
    );
}


//header, where parameters and f expressions go
function Header(props){
    return (
        <tr>
          {props.params.map((param, index) =>
                            <ExprCell
                              key={index}
                              style={{backgroundColor: 'white'}}
                              text={param}
                              onChange={(e) => props.paramChange(e, index)}
                            />)}
          {flattenFexprs(props.fexprs, 0).map((cellInfo, index) =>
                            <ExprCell 
                              key={index}
                              style={cellInfo.style}
                              text={cellInfo.fexpr.text}
                              onChange={(e) => props.fexprChange(e, cellInfo.fexpr)}
                            />)}
          <td>
            Want
          </td>
        </tr>
    );
}

//footer, where delete buttons for params and fexprs go
function Footer(props){
    return (
        <tr>
          {props.params.map((param, index) =>
                            <DelCell
                              key={index}
                              style={{backgroundColor: 'white'}}
                              onClick={() => props.remParam(index)}
                            />)}
          {flattenFexprs(props.fexprs, 0).map((cellInfo, index) =>
                                                    <td
                                                      key={index}
                                                      style={cellInfo.style}>
                                                      <DelButton onClick={() => props.remFexpr(cellInfo.fexpr)}/>
                                                      {cellInfo.fexpr.outExprs.reduce(isBool, true) ?
                                                       <div>
                                                         <AddThenColumnButton onClick={() => props.addThenChild(cellInfo.fexpr)}/>
                                                         <AddElseColumnButton onClick={() => props.addElseChild(cellInfo.fexpr)}/>
                                                       </div>
                                                       : ''}
                                                    </td>)}
          <td>
            Can't Delete Me
          </td>
        </tr>
    );
}

function Labels(props){
    return (
        <tr>
          {props.params.map((param, index) =>
                            <td key={index}>In</td>)}
          {flattenFexprs(props.fexprs, 0).map((cellInfo, index) =>
                                           <td
                                             key={index}
                                             style={cellInfo.style}>
                                             Out
                                           </td>)}
        </tr>
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
        
        this.lookup = this.lookup.bind(this);
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

    lookup(arr){
        return this.state.examples.reduce((acc, example) => {
            if (acc !== errorVal) {
                return acc;
            }

            if (example.inTexts.reduce((acc, inText, index) => (acc && inText === arr[index]), true)){
                return example.wantText;
            }

            return errorVal;
        }, errorVal);
    }

    // function that actually does stuff
    // this one is pure (no side effects)
    test(fexprs, inTextss){
        function toFalseIndex(n){
            // minus 1 is for zero case
            return (n * -1) - 1;
        }

        const formalParams = this.state.params.join();
        const recur = new RegExp(`${this.state.name}\\(([^\\)]+)\\)`, 'g');
        // theres 2 Ss in argss because its kinda like a 2d array of arguments
        const argss = inTextss.map((inTexts) => `(${inTexts.join()})`);

        return fexprs.map((fexpr) => {
            const funct = `Function("${formalParams}", "return ${fexpr.text}")`;
            const outExprs = argss.map((args) => eval(funct + args)); // NB: this '+' means concatenate, not add

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
                    /*
                      dunno how to decide which color to pass
                      can't be random, has to be same every time render is called unless a column is changed or something
                      this method kinda sucks though
                    */
                    rotateFexprs(fexpr.thenChildren, thenBoolArr, trueColorIndex(acc + 1), rotatedExprs);
                    rotateFexprs(fexpr.elseChildren, elseBoolArr, falseColorIndex(acc + 1), rotatedExprs);
                }
            });
        }

        let cellInfoss = new Array(this.state.examples.length).fill(0).map((elem) => []);
        const trueArr = new Array(this.state.examples.length).fill(true);
        rotateFexprs(this.state.fexprs, trueArr, 0, cellInfoss);
        return (
            <div>
              <input 
                type="text"
                value={this.state.name}
                onChange={this.nameChange} />
              <table border="1">
                <tbody>
                  <Labels
                    params={this.state.params}
                    fexprs={this.state.fexprs}
                  />
                  <Header 
                    fexprs={this.state.fexprs} 
                    params={this.state.params}
                    fexprChange={this.fexprChange} 
                    paramChange={this.paramChange}
                  />
                  {this.state.examples.map((example, index) => 
                                           <IORow
                                             key={index}
                                             inTexts={example.inTexts}
                                             wantText={example.wantText}
                                             cellInfos={cellInfoss[index]}
                                             inChange={(e, index) => this.inTextChange(e, example, index)} 
                                             wantChange={(e) => this.wantTextChange(e, example)}
                                             onClick={() => this.remExample(example)}
                                           />)}
                  <Footer
                    fexprs={this.state.fexprs}
                    params={this.state.params}
                    remFexpr={this.remFexpr} 
                    remParam={this.remParam}
                    addThenChild={this.addThenChild}
                    addElseChild={this.addElseChild}
                  />
                </tbody>
              </table>
              <TestButton onClick={this.testAll} />
              <AddRowButton onClick={this.addExample} />
              <AddInColumnButton onClick={this.addParam}/>
              <AddOutColumnButton onClick={this.addFexpr} />
            </div>
	);
    }
}

//thing that decides what to render and where
const domContainer = document.querySelector('#table_method_container');
ReactDOM.render(<App />,
		domContainer);

//ReactDOM.render(<App />,
//		document.getElementById('root'));
