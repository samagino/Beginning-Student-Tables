//import React from 'react';
//import ReactDOM from 'react-dom';
//import './index.css';


/*********************
   functions I want 
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
    arr2d.forEach((arr, i) => arr.forEach((elem, j) => val[j].push(elem)));
    return val;
}

// String
// returns a string containing one random latin character
function randomChar(){
    const a = 0x61;
    let char = Math.random() * 26;
    char += a;
    return String.fromCharCode(char);
}

/*********************
   React Components
*********************/
//cell in a table that has a button that says "delete"
function DelCell(props){
    return(
        <td>
          <button onClick={props.onClick}>
            Delete
          </button>
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

//cell that contains the output of the application of 
//   a relevent function to a relevent expression
// the function is called "fexpr" and the 
//    expression is called "inExpr"
function TestCell(props){
    const outText = String(props.outExpr);
    return (
        <td>
          {outText}
          {outText === props.wantText ? " yay" : ""}
        </td>
    );
}

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

function AddOutColumnButton(props){
    return (
        <button onClick={props.onClick}>
          Add Out Column
        </button>
    );
}

function Header(props){
    return (
        <tr>
          {props.params.map((param, index) =>
                            <ExprCell
                              key={index}
                              text={param}
                              onChange={(e) => props.paramChange(e, index)}
                            />)}
          {props.fexprs.map((fexpr, index) => 
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

function Footer(props){
    return (
        <tr>
          {props.params.map((param, index) =>
                            <DelCell
                              key={index}
                              onClick={() => props.remParam(index)}
                            />)}
          {props.fexprs.map((fexpr, index) => 
                             <DelCell
                               key={index}
                               onClick={() => props.remFexpr(fexpr)}
                             />)}
          <td>
            Can't Delete Me
          </td>
        </tr>
    );
}

class App extends React.Component{
    constructor(props){
        super(props);
        const initParam = 'n';
        this.state = {examples: [{inTexts: ['0'], wantText: '?'}], // rows
                      fexprs: [{text: initParam, outExprs: [0]}],  // function columns, this will be expanded later I think
                      params: [initParam]};                        // variable (parameter) columns
        
        this.test = this.test.bind(this);
        this.addExample = this.addExample.bind(this);
        this.addFexpr = this.addFexpr.bind(this);
        this.addParam = this.addParam.bind(this);
        this.remExample = this.remExample.bind(this);
        this.remFexpr = this.remFexpr.bind(this);
        this.remParam = this.remParam.bind(this);
        this.inTextChange = this.inTextChange.bind(this);
        this.wantTextChange = this.wantTextChange.bind(this);
        this.fexprChange = this.fexprChange.bind(this);
        this.paramChange = this.paramChange.bind(this);
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
    // function that actually does stuff
    test(){
        const formalParams = this.state.params.join(',');
        // theres 2 Ss in argss because its kinda like a 2d array of arguments
        const argss = this.state.examples.map((example) => `(${example.inTexts.join()})`);
        
        const fexprs = this.state.fexprs.map((fexpr) => {
            // NB: I like arrow notation (e.g. '(n) => n') because it looks kinda like lambda, could use other function constructors though
            const funct = `((${formalParams}) => ${fexpr.text})`;
            const outExprs = argss.map((args) => eval(funct + args)); // NB: this '+' means concatenate, not add

            return {text: fexpr.text,    // doesn't change
                    outExprs: outExprs}; // changes
        });

        this.setState({fexprs: fexprs});
    }
    
    //adds a new row
    addExample(){
        const examples = this.state.examples.slice();
        const inTexts = this.state.params.map((param) => '0');
        examples.push({inTexts: inTexts,
                       wantText: '?'});

        // need to maintain #outExprs == #examples
        let fexprs = this.state.fexprs.slice();
        fexprs.map((fexpr) => fexpr.outExprs.push('?'));

        this.setState({examples: examples,
                       fexprs: fexprs});
    }
    
    //adds a new out column
    addFexpr(){
        const firstParam = this.state.params.length ? this.state.params[0] : ''; // hopefully this exists...

        let fexprs = this.state.fexprs.slice();
        const outExprs = this.state.examples.map((example) => '?');
        fexprs.push({text: firstParam,
                     outExprs: outExprs});

        this.setState({fexprs: fexprs});
    }

    // adds a new in column
    addParam(){
        const params = this.state.params.slice();
        params.push(randomChar());

        // need to maintain #inTexts == #params
        let examples = this.state.examples.slice();
        examples.map((example) => example.inTexts.push('0'));

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
        //filter out the fexpr we don't want from the fexprs
        const fexprs = this.state.fexprs.filter((fexpr) => fexpr !== deadFexpr);
        this.setState({fexprs: fexprs});
    }

    // removes an input column
    remParam(deadIndex){
        let params = this.state.params.slice();
        params.splice(deadIndex, 1);
        //gotta maintain #inTexts == #params (how?)
        let examples = this.state.examples.slice();
        examples.forEach((example) => example.inTexts.splice(deadIndex, 1));

        this.setState({params: params,
                       examples: examples});
    }
    
    //handles changes caused by updating a text field
    //modExample refers to the modified row, modIndex referes to the modified inText
    inTextChange(e, modExample, modIndex){
        //this mapping function does not change the array this.state.examples
        //not sure if this actually does anything... still need setState to rerender though
        const examples = this.state.examples.map((example) => example === modExample ? modExample : example);
        modExample.inTexts[modIndex] = e.target.value;
        this.setState({examples: examples});
    }

    wantTextChange(e, modExample){
        const examples = this.state.examples.map((example) => example === modExample ? modExample : example);
        modExample.wantText = e.target.value;
        this.setState({examples: examples});
    }
    
    fexprChange(e, modFexpr){
        const fexprs = this.state.fexprs.map((expr) => expr === modFexpr ? modFexpr : expr);
        modFexpr.text = e.target.value;
        this.setState({fexprs: fexprs});
    }

    paramChange(e, modIndex){
        const modParam = e.target.value;
        // have to use index because params is an array of strings, not an array of objects
        const params = this.state.params.map((param, index) => index === modIndex ? modParam : param);
        this.setState({params: params});
    }
    
    render(){
        const rowOutExprss = rotateMatrix(this.state.fexprs.map((fexpr) => fexpr.outExprs), this.state.examples.length);
        return (
            <div>
              <table border="1">
                <tbody>
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
                  />
                </tbody>
              </table>
              <TestButton onClick={this.test} />
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
