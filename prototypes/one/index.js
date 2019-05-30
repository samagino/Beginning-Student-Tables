//import React from 'react';
//import ReactDOM from 'react-dom';
//import './index.css';

/*****************************
  Universal Constants I Want
*****************************/
// value to put in child columns that don't have an outExpr for that row, not sure what this should be
const grayVal = undefined;

/*********************
   Functions I Want 
*********************/
// 2D Array -> 2D Array
// takes a 2d array and returns rotated 2d array, so the columns become rows
function rotateMatrix(arr2d, numRows){
    // This mapping doesn't make much sense but it's necessary.
    //  First an array containing n zeroes is created, then each of
    //  zeroes is converted to a new empty array and the resulting array
    //  is assigned to val.
    //  The original array can't just be filled with a new empty array,
    //  because then each element of the resulting array would be a reference
    //  to the same array, so the resulting array would contain a bunch of
    //  identical arrays that contain every value in arr2d.
    // This function took more time than I'm proud of.
    let val = new Array(numRows).fill(0).map((elem) => []);
    arr2d.forEach((arr) => arr.forEach((elem, j) => val[j].push(elem)));
    return val;
}

// String
// returns a string containing one random lowercase latin character
function randomChar(){
    const a = 0x61;
    let char = Math.random() * 26;
    char += a;
    return String.fromCharCode(char);
}

// Boolean -> N -> Boolean
// returns true if elem is a Boolean and acc is true, else returns false
function isBool(acc, elem){
    const val = typeof elem == 'boolean' && acc;
    return val;
}


/*************
  CSS Styles
*************/

const thouIstCorrect = {
    backgroundColor: 'lightGreen'
};

const boringThing = {
    backgroundColor: 'white',
    borderColor: 'blue'
};

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

//button that says "Add Child Column"
function AddChildColumnButton(props){
    return (
        <button onClick={props.onClick}>
          Add Child Column
        </button>
    );
}

/*** Cells ***/
//cell in a table that has a button that says "delete"
function DelCell(props){
    return(
        <td>
          <DelButton onClick={props.onClick}/>
        </td>
    );
}

//cell in a table that one can write an expression in
function ExprCell(props){
    return (
        <td>
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

    function makeStyle(){
        if (props.outExpr === grayVal) {
            return {backgroundColor: 'gray'};
        } else if (outText === props.wantText) {
            return {backgroundColor: 'lightgreen'};
        } else {
            return {backgroundColor: 'white'};
        }
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
          style={makeStyle()}>
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
                               text={inText}
                               onChange={(e) => props.inChange(e, index)}
                             />)} 
          {props.outExprs.map((outExpr, index) => 
                            <TestCell
                              key={index}
                              outExpr={outExpr}
                              wantText={props.wantText}
                            />)}
          <ExprCell
            text={props.wantText}
            onChange={props.wantChange} />
          <DelCell
            onClick={props.onClick}
          />
        </tr>
    );
}


//header, where parameters and f expressions go
function Header(props){
    function flattenFexprs(fexprs){
        return fexprs.map((fexpr) => [fexpr, flattenFexprs(fexpr.children)].flat()).flat();
    }
    
    return (
        <tr>
          {props.params.map((param, index) =>
                            <ExprCell
                              key={index}
                              text={param}
                              onChange={(e) => props.paramChange(e, index)}
                            />)}
          {flattenFexprs(props.fexprs).map((fexpr, index) =>
                            <ExprCell 
                              key={index}
                              text={fexpr.text}
                              onChange={(e) => props.fexprChange(e, fexpr)}
                            />)}
          <td>
            Want
          </td>
        </tr>
    );
}

//footer, where delete buttons for params and fexprs go
function Footer(props){
    function flattenFexprs(fexprs){
        return fexprs.map((fexpr) => [fexpr, flattenFexprs(fexpr.children)].flat()).flat();
    }

    return (
        <tr>
          {props.params.map((param, index) =>
                            <DelCell
                              key={index}
                              onClick={() => props.remParam(index)}
                            />)}
          {flattenFexprs(props.fexprs).map((fexpr, index) =>
                                           <td key={index}>
                                             <DelButton onClick={() => props.remFexpr(fexpr)}/>
                                             {fexpr.outExprs.reduce(isBool, true) ?
                                              <AddChildColumnButton onClick={() => props.addChildColumn(fexpr)}/> : ''}
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
          {props.fexprs.map((fexpr, index) =>
                            <td key={index}>Out</td>)}
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
        this.state = {examples: [{inTexts: ['0'], wantText: ''}],                // rows
                      fexprs: [{text: initParam, outExprs: ['?'], children: []}],  // function columns
                      params: [initParam]};                                      // variable (parameter) columns
        
        this.test = this.test.bind(this);
        this.testAll = this.testAll.bind(this);
        this.addExample = this.addExample.bind(this);
        this.addFexpr = this.addFexpr.bind(this);
        this.addChildColumn = this.addChildColumn.bind(this);
        this.addParam = this.addParam.bind(this);
        this.remExample = this.remExample.bind(this);
        this.remFexpr = this.remFexpr.bind(this);
        this.remParam = this.remParam.bind(this);
        this.inTextChange = this.inTextChange.bind(this);
        this.wantTextChange = this.wantTextChange.bind(this);
        this.fexprChange = this.fexprChange.bind(this);
        this.paramChange = this.paramChange.bind(this);
    }

    // function that actually does stuff
    // this one is pure (no side effects)
    test(fexprs, inTextss){
        const formalParams = this.state.params.join();
        // theres 2 Ss in argss because its kinda like a 2d array of arguments
        //const argss = this.state.examples.map((example) => `(${example.inTexts.join()})`);
        const argss = inTextss.map((inTexts) => `(${inTexts.join()})`);
        
        return fexprs.map((fexpr) => {
            // NB: I like arrow notation (e.g. '(n) => n') because it looks kinda like lambda, could use other function constructors though
            const funct = `((${formalParams}) => ${fexpr.text})`;
            const outExprs = argss.map((args) => eval(funct + args)); // NB: this '+' means concatenate, not add
            let children;
            if (outExprs.reduce(isBool, true)){
                // these are the indices we want
                const filterIndices = outExprs.map((outExpr, index) => outExpr ? index : -1).filter((elem) => elem != -1);
                const childrenInTextss = inTextss.filter((inText, index) => filterIndices.includes(index));
                children = this.test(fexpr.children, childrenInTextss); // yay recursion
            } else {
                children = [];
            }

            return {text: fexpr.text,          // doesn't change
                    outExprs: outExprs,        // changes
                    children: children};       // changes
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
                     children: []});

        this.setState({fexprs: fexprs});
    }

    //adds a child column to a fexpr
    addChildColumn(parentFexpr){
        const firstParam = this.state.params.length ? this.state.params[0] : '';
        //const fexprs = this.state.fexprs.map((expr) => expr === parentFexpr ? parentFexpr : expr);
        //const fexprs = this.state.fexprs.slice();

        // how do I map these to the correct inTexts though?
        const outExprs = parentFexpr.outExprs.filter((outExpr) => outExpr === true).map((outExpr) => '?');

        parentFexpr.children.push({text: firstParam,
                                   outExprs: outExprs,
                                   children: []});

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
                            children: filterFexpr(fexpr.children)};
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
        //this doesn't actually change anything, but it causes the table to rerender
        this.setState({examples: this.state.examples});
    }

    wantTextChange(e, modExample){
        //const examples = this.state.examples.map((example) => example === modExample ? modExample : example);
        //const examples = this.state.examples.slice();
        modExample.wantText = e.target.value;
        this.setState({examples: this.state.examples});
    }
    
    fexprChange(e, modFexpr){
        //const fexprs = this.state.fexprs.map((expr) => expr === modFexpr ? modFexpr : expr);
        //const fexprs = this.state.fexprs.slice();
        modFexpr.text = e.target.value;
        this.setState({fexprs: this.state.fexprs});
    }

    paramChange(e, modIndex){
        const modParam = e.target.value;
        // this one actually does stuff
        // have to use index because params is an array of strings, not an array of objects
        const params = this.state.params.map((param, index) => index === modIndex ? modParam : param);
        this.setState({params: params});
    }
    
    render(){
        // [Fexpr] -> [Boolean] -> [N] -> [N]
        // uses side effects to build a shallow 2d array from a tree type thing
        function rotateFexprs(fexprs, boolArr, val){
            fexprs.forEach((fexpr) => {
                let passedInvalidRows = 0;
                let unifiedBoolArr = [];
                boolArr.forEach((bool, j) => {
                    if (bool){
                        val[j].push(fexpr.outExprs[j - passedInvalidRows]);
                        unifiedBoolArr.push(fexpr.outExprs[j - passedInvalidRows]);
                    } else {
                        passedInvalidRows ++;
                        val[j].push(grayVal);
                        unifiedBoolArr.push(false);
                    }
                });

                if (fexpr.children.length) { // fexpr has children
                    rotateFexprs(fexpr.children, unifiedBoolArr, val);
                }
            });

            /*
              let val = new Array(numRows).fill(0).map((elem) => []);
              arr2d.forEach((arr) => arr.forEach((elem, j) => val[j].push(elem)));
              return val;
            */
            
        }

        let rowOutExprss = new Array(this.state.examples.length).fill(0).map((elem) => []);
        const trueArr = new Array(this.state.examples.length).fill(true);
        rotateFexprs(this.state.fexprs, trueArr, rowOutExprss);
        //const rowOutExprss = rotateMatrix(this.state.fexprs.map((fexpr) => fexpr.outExprs), this.state.examples.length);
        return (
            <div>
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
                                             outExprs={rowOutExprss[index]}
                                             inChange={(e, index) => this.inTextChange(e, example, index)} 
                                             wantChange={(e) => this.wantTextChange(e, example)}
                                             onClick={() => this.remExample(example)}
                                           />)}
                  <Footer
                    fexprs={this.state.fexprs}
                    params={this.state.params}
                    remFexpr={this.remFexpr} 
                    remParam={this.remParam}
                    addChildColumn={this.addChildColumn}
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
