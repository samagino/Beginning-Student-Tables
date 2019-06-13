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

        // this one changes stuff
        this.setState((state) => {
            const lookups = state.tables.map(makeLookup);
            const names = state.tables.map((table) => table.name);

            return {tables: state.tables.map((table) => testTable(table, lookups, names))};
        });
    }

    // adds a new table
    addTable(){
        this.setState((state) => {
            const oldTabs = state.tables.slice();
            const initParam = 'n';
            const tableNum = oldTabs.length + 1;
            const newTab = {examples: [{inTexts: ['0'], wantText: '?'}],
                            fexprs: [{text: initParam, outExprs: [0], thenChildren: [], elseChild: null}],
                            params: [initParam],
                            name: 'table' + tableNum};

            return {tables: [...oldTabs, newTab]};
        });
    }

    remTable(deadTable){
        this.setState((state) => ({tables: state.tables.filter((table) => table !== deadTable)}));
    }
    
    //adds a new row
    addExample(modTable){
        this.setState((state) => {
            let newTab = {...modTable};

            const inTexts = newTab.params.map((param) => '0');
            const examples = [...newTab.examples, {inTexts: inTexts,
                                                   wantText: '?'}];

            // need to maintain #outExprs == #examples
            const fexprs = newTab.fexprs.map((fexpr) => ({...fexpr, outExprs: [...fexpr.outExprs, '?']}));

            newTab.examples = examples;
            newTab.fexprs = fexprs;

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }
    
    //adds a new out column
    addFexpr(modTable){
        this.setState((state) => {
            let newTab = {...modTable};
            const firstParam = modTable.params.length ? modTable.params[0] : '';

            const outExprs = modTable.examples.map((example) => '?');
            const fexprs = [...newTab.fexprs, {text: firstParam,
                                               outExprs: outExprs,
                                               thenChildren: [],
                                               elseChild: null}];
            newTab.fexprs = fexprs;

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    //adds a then column to a fexpr
    addThenChild(parentFexpr, modTable){
        function replaceParent(curParent, newParent){
            // null elseChild case
            if (curParent === null){
                return null;
            }

            if (curParent === parentFexpr){
                return newParent;
            } else {
                return {...curParent,
                        thenChildren: curParent.thenChildren.map((child) => replaceParent(child, newParent)),
                        elseChild: replaceParent(curParent.elseChild, newParent)};
            }
        }

        this.setState((state) => {
            let newTab = {...modTable};
            let newParent = {...parentFexpr};

            const firstParam = newTab.params.length ? modTable.params[0] : '';
            const outExprs = newParent.outExprs.filter((outExpr) => outExpr === true).map((outExpr) => '?');

            // this is pretty much push, but oh well
            newParent.thenChildren = [...newParent.thenChildren, {text: firstParam,
                                                                  outExprs: outExprs,
                                                                  thenChildren: [],
                                                                  elseChild: null}];

            newTab.fexprs = newTab.fexprs.map((fexpr) => replaceParent(fexpr, newParent));

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    //adds a then column to a fexpr
    addElseChild(parentFexpr, modTable){
        function replaceParent(curParent, newParent){
            // null elseChild case
            if (curParent === null){
                return null;
            }

            if (curParent === parentFexpr){
                return newParent;
            } else {
                return {...curParent,
                        thenChildren: curParent.thenChildren.map((child) => replaceParent(child, newParent)),
                        elseChild: replaceParent(curParent.elseChild, newParent)};
            }
        }

        this.setState((state) => {
            let newTab = {...modTable};
            let newParent = {...parentFexpr};

            // only add else child if none currently exists
            if (newParent.elseChild === null) {
                const firstParam = newTab.params.length ? modTable.params[0] : '';
                const outExprs = newParent.outExprs.filter((outExpr) => outExpr === true).map((outExpr) => '?');

                newParent.elseChild = {text: firstParam,
                                       outExprs: outExprs,
                                       thenChildren: [],
                                       elseChild: null};
            }

            newTab.fexprs = newTab.fexprs.map((fexpr) => replaceParent(fexpr, newParent));

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    // adds a new in column
    addParam(modTable){
        this.setState((state) => {
            let newTab = {...modTable};

            //const params = this.state.tables[0].params.slice();
            const params = newTab.params.slice();
            params.push(randomChar());

            // need to maintain #inTexts == #params
            let examples = newTab.examples.slice();
            examples.forEach((example) => example.inTexts.push('0'));

            newTab.params = params;
            newTab.examples = examples;

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }
    
    //removes a row
    remExample(deadExample, modTable){
        this.setState((state) => {
            let newTab = {...modTable};
            
            // get index of example we wanna remove so we can remove all the corresponding outExprs
            const deadIndex = newTab.examples.indexOf(deadExample);
            //filter out the example we don't want from the examples
            const examples = newTab.examples.filter((example) => example !== deadExample);

            // gotta maintain #outExprs == #examples
            let fexprs = this.state.tables[0].fexprs.slice();
            fexprs.forEach((fexpr) => fexpr.outExprs.splice(deadIndex, 1));

            newTab.fexprs = fexprs;
            newTab.examples = examples;

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
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
        
        this.setState((state) => {
            let newTab = {...modTable};
            //filter out the fexpr we don't want from the fexprs
            const fexprs = newTab.fexprs.map(killFexpr).filter((elem) => elem !== null);

            newTab.fexprs = fexprs;

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    // removes an input column
    remParam(deadIndex, modTable){
        this.setState((state) => {
            let newTab = {...modTable};
            
            //let params = this.state.tables[0].params.slice();
            let params = newTab.params.slice();
            params.splice(deadIndex, 1);

            //gotta maintain #inTexts == #params
            let examples = newTab.examples.slice();
            examples.forEach((example) => example.inTexts.splice(deadIndex, 1));

            newTab.params = params;
            newTab.examples = examples;

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }
    
    //handles changes caused by updating a text field
    //modExample refers to the modified row, modIndex referes to the modified inText
    inTextChange(e, modExample, modIndex, modTable){
        let newExample = {...modExample};
        newExample.inTexts[modIndex] = e.target.value;

        this.setState((state) => {
            const newTab = {...modTable, examples: modTable.examples.map((example) => example === modExample ? newExample : example)};
            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    wantTextChange(e, modExample, modTable){
        let newExample = {...modExample};
        newExample.wantText = e.target.value;

        this.setState((state) => {
            const newTab = {...modTable, examples: modTable.examples.map((example) => example === modExample ? newExample : example)};
            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }
    
    fexprChange(e, modFexpr, modTable){
        function replaceFexpr(curFexpr, newFexpr){
            // null elseChild case
            if (curFexpr === null){
                return null;
            }

            if (curFexpr === modFexpr){
                return newFexpr;
            } else {
                return {...curFexpr,
                        thenChildren: curFexpr.thenChildren.map((child) => replaceFexpr(child, newFexpr)),
                        elseChild: replaceFexpr(curFexpr.elseChild, newFexpr)};
            }
        }

        let newFexpr = {...modFexpr};
        newFexpr.text = e.target.value;

        this.setState((state) => {
            const newTab = {...modTable, fexprs: modTable.fexprs.map((fexpr) => replaceFexpr(fexpr, newFexpr))};
            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    paramChange(e, modIndex, modTable){
        const newParam = e.target.value;

        this.setState((state) =>{
            const newTab = {...modTable, params: modTable.params.map((param, index) => index === modIndex ? newParam : param)};
            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    nameChange(e, modTable){
        const newName = e.target.value;
        this.setState((state) => {
            return {tables: state.tables.map((table) => table === modTable ? {...table, name: newName} : table)};
        });
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
                                       wantTextChange={(e, example) =>            {this.wantTextChange(e, example, table);
                                                                                   this.testAll();}}
                                       addExample={() =>                          {this.addExample(table);
                                                                                   this.testAll();}}
                                       remExample={(example) =>                   {this.remExample(example, table);
                                                                                   this.testAll();}}
                                       
                                       fexprChange={(e, modFexpr) =>              {this.fexprChange(e, modFexpr, table);
                                                                                   this.testAll();}}
                                       addFexpr={() =>                            {this.addFexpr(table);
                                                                                   this.testAll();}}
                                       addThenChild={(parent) =>                  {this.addThenChild(parent, table);
                                                                                   this.testAll();}}
                                       addElseChild={(parent) =>                  {this.addElseChild(parent, table);
                                                                                   this.testAll();}}
                                       remFexpr={(fexpr) =>                       {this.remFexpr(fexpr, table);
                                                                                   this.testAll();}}

                                       paramChange={(e, index) =>                 {this.paramChange(e, index, table);
                                                                                   this.testAll();}}
                                       addParam={() =>                            {this.addParam(table);
                                                                                   this.testAll();}}
                                       remParam={(index) =>                       {this.remParam(index, table);
                                                                                   this.testAll();}}

                                       nameChange={(e) =>                         {this.nameChange(e, table);
                                                                                   this.testAll();}}

                                       testAll={this.testAll}
                                       remTable={() => {this.remTable(table);
                                                        this.testAll();}}
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
