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
        <div style={{float: 'left', clear: 'left'}}>
          <DynamicInput
            style={{float: 'left'}}
            type={'text'}
            value={props.name}
            onChange={props.nameChange} />
          <TestButton
            style={{float: 'left'}}
            title={'Run Functions'}
            onClick={props.testAll} />
          <RemButton
            style={{float: 'left'}}
            title={'Remove table'}
            onClick={props.remTable} />

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
        this.state = {tables: [{examples: [{inTexts: ['0'], wantText: '?'}],                                   // rows
                                fexprs: [{text: initParam, outExprs: [0], thenChildren: [], elseChild: null}], // function columns
                                params: [initParam],                                                           // variable (parameter) columns
                                name: 'table'}]};                                                              // table name (used for recursion)
        
        this.testAll = this.testAll.bind(this);
        this.addTable = this.addTable.bind(this);
        this.remTable = this.remTable.bind(this);
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

    // this one has side effects
    testAll(){
        function makeLookup(table) {
            function lookup() {
                return table.examples.reduce((acc, example) => {
                    if (acc !== errorVal) {
                        return acc;
                    }

                    if (example.inTexts.reduce((acc, inText, index) => (acc && inText === String(arguments[index])), true)){
                        return eval(example.wantText);
                    }

                    return errorVal;
                }, errorVal);
            }

            return lookup;
        }

        // Fexpr -> [String] -> [[String]] -> [Function] -> [String] -> Fexpr
        // function that actually does stuff
        // this one is pure (no side effects)
        function testFexpr(fexpr, inTextss, params, lookups, names){
            function toFalseIndex(n){
                // minus 1 is for zero case
                return (n * -1) - 1;
            }

            // case for null elseChild
            if (fexpr === null){
                return null;
            }
            
            let synError = false;
            let funct;
            // check for errors in function
            try {
                funct = new Function(names.concat(params), `return ${fexpr.text}`);
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
                        val = funct.apply(undefined, lookups.concat(args.map(eval)));
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

                const trueInTextss = inTextss.filter((inTexts, index) => filterIndices.includes(index));
                const falseInTextss = inTextss.filter((inTexts, index) => filterIndices.includes(toFalseIndex(index)));

                thenChildren = fexpr.thenChildren.map((thenChild) => testFexpr(thenChild, trueInTextss, params, lookups, names));
                elseChild = testFexpr(fexpr.elseChild, falseInTextss, params, lookups, names); // yay recursion

            } else {
                thenChildren = [];
                elseChild = null;
            }

            return {text: fexpr.text,           // doesn't change
                    outExprs: outExprs,         // changes
                    thenChildren: thenChildren, // changes
                    elseChild: elseChild};      // changes

        }

        // Table -> [Function] -> [String] -> Table
        // this one is also pure
        function testTable(table, lookups, names){
            const inTextss = table.examples.map((example) => example.inTexts);
            const fexprs = table.fexprs.map((fexpr) => testFexpr(fexpr, inTextss, table.params, lookups, names));

            return {examples: table.examples, // doesn't change
                    fexprs: fexprs,           // changes
                    params: table.params,     // doesn't change
                    name: table.name};        // doesn't change
        }

        const lookups = this.state.tables.map(makeLookup);
        const names = this.state.tables.map((table) => table.name);

        const tables = this.state.tables.map((table) => testTable(table, lookups, names));
        // this one actually changes stuff
        this.setState({tables: tables});
    }

    // adds a new table
    addTable(){
        const tables = this.state.tables.slice();
        const initParam = 'n';
        const tableNum = tables.length + 1;
        tables.push({examples: [{inTexts: ['0'], wantText: '?'}],
                      fexprs: [{text: initParam, outExprs: [0], thenChildren: [], elseChild: null}],
                      params: [initParam],
                      name: 'table' + tableNum});

        this.setState({tables: tables});
    }

    remTable(deadTable){
        const tables = this.state.tables.filter((table) => table !== deadTable);
        this.setState({tables: tables});
    }
    
    //adds a new row
    addExample(modTable){
        const examples = modTable.examples.slice();
        const inTexts = modTable.params.map((param) => '0');
        examples.push({inTexts: inTexts,
                       wantText: '?'});

        // need to maintain #outExprs == #examples
        let fexprs = this.state.tables[0].fexprs.slice();
        fexprs.forEach((fexpr) => fexpr.outExprs.push('?'));

        modTable.examples = examples;
        modTable.fexprs = fexprs;

        this.setState({tables: this.state.tables});
    }
    
    //adds a new out column
    addFexpr(modTable){
        const firstParam = modTable.params.length ? modTable.params[0] : '';

        let fexprs = modTable.fexprs.slice();
        const outExprs = modTable.examples.map((example) => '?');
        fexprs.push({text: firstParam,
                     outExprs: outExprs,
                     thenChildren: [],
                     elseChild: null});

        //let tables = this.state.tables.slice();
        //tables[0].fexprs = fexprs;
        modTable.fexprs = fexprs;
        

        this.setState({tables: this.state.tables});
    }

    //adds a then column to a fexpr
    addThenChild(parentFexpr, modTable){
        const firstParam = modTable.params.length ? modTable.params[0] : '';
        const outExprs = parentFexpr.outExprs.filter((outExpr) => outExpr === true).map((outExpr) => '?');

        parentFexpr.thenChildren.push({text: firstParam,
                                       outExprs: outExprs,
                                       thenChildren: [],
                                       elseChild: null});

        // this doesn't change anything, just rerenders
        this.setState({tables: this.state.tables});
    }

    //adds a then column to a fexpr
    addElseChild(parentFexpr, modTable){
        //const firstParam = this.state.tables[0].params.length ? this.state.tables[0].params[0] : '';
        const firstParam = modTable.params.length ? modTable.params[0] : '';

        // only add else child if none currently exists
        if (parentFexpr.elseChild === null) {
            const outExprs = parentFexpr.outExprs.filter((outExpr) => outExpr === true).map((outExpr) => '?');

            parentFexpr.elseChild = {text: firstParam,
                                     outExprs: outExprs,
                                     thenChildren: [],
                                     elseChild: null};
        }

        // this doesn't change anything, just rerenders
        this.setState({tables: this.state.tables});
    }

    // adds a new in column
    addParam(modTable){
        //const params = this.state.tables[0].params.slice();
        const params = modTable.params.slice();
        params.push(randomChar());

        // need to maintain #inTexts == #params
        let examples = modTable.examples.slice();
        examples.forEach((example) => example.inTexts.push('0'));

        modTable.params = params;
        modTable.examples = examples;

        this.setState({tables: this.state.tables});
    }
    
    //removes a row
    remExample(deadExample, modTable){
        // get index of example we wanna remove so we can remove all the corresponding outExprs
        const deadIndex = modTable.examples.indexOf(deadExample);
        //filter out the example we don't want from the examples
        const examples = modTable.examples.filter((example) => example !== deadExample);

        // gotta maintain #outExprs == #examples
        let fexprs = this.state.tables[0].fexprs.slice();
        fexprs.forEach((fexpr) => fexpr.outExprs.splice(deadIndex, 1));

        modTable.fexprs = fexprs;
        modTable.examples = examples;

        this.setState({tables: this.state.tables});
    }
    
    //removes an output column
    //has to search recursively through tree to find the right one
    remFexpr(deadFexpr, modTable){
        // Fexpr -> Fexpr
        // filters out the deadFexpr recursively through the tree
        function killFexpr(fexpr){
            // null elseChild case
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
        const fexprs = modTable.fexprs.map(killFexpr).filter((elem) => elem !== null);

        modTable.fexprs = fexprs;
        this.setState({tables: this.state.tables});
    }

    // removes an input column
    remParam(deadIndex, modTable){
        //let params = this.state.tables[0].params.slice();
        let params = modTable.params.slice();
        params.splice(deadIndex, 1);

        //gotta maintain #inTexts == #params
        let examples = modTable.examples.slice();
        examples.forEach((example) => example.inTexts.splice(deadIndex, 1));

        modTable.params = params;
        modTable.examples = examples;

        this.setState({tables: this.state.tables});
    }
    
    //handles changes caused by updating a text field
    //modExample refers to the modified row, modIndex referes to the modified inText
    inTextChange(e, modExample, modIndex, modTable){
        modExample.inTexts[modIndex] = e.target.value;
        this.setState({tables: this.state.tables});
    }

    wantTextChange(e, modExample, modTable){
        modExample.wantText = e.target.value;
        this.setState({tables: this.state.tables});
    }
    
    fexprChange(e, modFexpr, modTable){
        modFexpr.text = e.target.value;
        this.setState({tables: this.state.tables});
    }

    paramChange(e, modIndex, modTable){
        const modParam = e.target.value;
        const params = modTable.params.map((param, index) => index === modIndex ? modParam : param);

        modTable.params = params;

        this.setState({tables: this.state.tables});
    }

    nameChange(e, modTable){
        modTable.name = e.target.value;
        this.setState({tables: this.state.tables});
    }
    
    render(){
        return (
            <div>
              <AddButton
                onClick={this.addTable}
                style={{float: 'right'}}
                title={'Add a table'} />
              {this.state.tables.map((table, i) =>
                                     <Concise
                                       key={i}
                                       
                                       examples={table.examples}
                                       fexprs={table.fexprs}
                                       params={table.params}
                                       name={table.name}

                                       inTextChange={(e, modExample, modIndex) => {this.inTextChange(e, modExample, modIndex, table);
                                                                                   this.testAll();}}
                                       wantTextChange={(e, example) => this.wantTextChange(e, example, table)}
                                       addExample={() => this.addExample(table)}
                                       remExample={(example) => this.remExample(example, table)}
                                       
                                       fexprChange={(e, modFexpr) => {this.fexprChange(e, modFexpr, table);
                                                                      this.testAll();}}
                                       addFexpr={() => this.addFexpr(table)}
                                       addThenChild={(parent) => {this.addThenChild(parent, table);
                                                                  this.testAll();}}
                                       addElseChild={(parent) => {this.addElseChild(parent, table);
                                                                  this.testAll();}}
                                       remFexpr={(fexpr) => this.remFexpr(fexpr, table)}

                                       paramChange={(e, index) => this.paramChange(e, index, table)}
                                       addParam={() => this.addParam(table)}
                                       remParam={(index) => this.remParam(index, table)}

                                       nameChange={(e) => this.nameChange(e, table)}

                                       testAll={this.testAll}
                                       remTable={() => this.remTable(table)}
                                     />)}
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
