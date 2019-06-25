//import React from 'react';
//import ReactDOM from 'react-dom';
//import './index.css';

/*****************************
  Universal Constants I Want
*****************************/
// value to put in child columns that don't have an outExpr for that row, not sure what this should be
const grayVal = undefined;
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

// [Anything] -> Boolean
// returns true if exprs has at least one member and all of its members are boooleans
//    otherwise returns false
function allBools(progs){
    if (progs.length == 0) {
        return false;
    }

    return progs.every((prog) => prog.type == RBOOL_T);
}

// Number -> Number
function trueColorIndex(n){
    return n % colors.length;
}

// Number -> Number
function falseColorIndex(n){
    return (n + (colors.length / 2)) % colors.length;
}

/****************
   Interpreter
****************/

const VAR_T =     0;
const APP_T =     1;
const FUNCT_T =   2;
const RNUM_T =    3;
const RBOOL_T =   4;
const RSTRING_T = 5;
const RLIST_T =   6;
const RSYM_T =    7;

const initEnv = [
    // functions
    {name: '+', binding: {type: FUNCT_T,
                          value: plus}},
    {name: '-', binding: {type: FUNCT_T,
                          value: minus}},
    {name: '*', binding: {type: FUNCT_T,
                          value: times}},
    {name: '/', binding: {type: FUNCT_T,
                          value: divide}},
    {name: 'car', binding: {type: FUNCT_T,
                            value: car}},
    {name: 'cdr', binding: {type: FUNCT_T,
                            value: cdr}},
    {name: 'cons', binding: {type: FUNCT_T,
                             value: cons}},
    {name: 'not', binding: {type: FUNCT_T,
                             value: not}},
    {name: 'eqv?', binding: {type: FUNCT_T,
                             value: iseqv}},
    {name: 'null?', binding: {type: FUNCT_T,
                              value: isnull}},
    {name: 'empty?', binding: {type: FUNCT_T,
                               value: isnull}},
    {name: '=', binding: {type: FUNCT_T,
                          value: equalsign}},
    {name: '>', binding: {type: FUNCT_T,
                          value: gtsign}},
    {name: '>=', binding: {type: FUNCT_T,
                           value: gesign}},
    {name: '<', binding: {type: FUNCT_T,
                          value: ltsign}},
    {name: '<=', binding: {type: FUNCT_T,
                           value: lesign}},
    // constants
    {name: 'null', binding: {type: RLIST_T,
                             value: null}},
    {name: 'empty', binding: {type: RLIST_T,
                              value: null}},
];
// String -> {prog: Program, rest: String}
// parses all expressions except quoted expressions
function parse(text) {
    const varRE = /^[a-zA-Z\+\-\*\/\?=><]+/; // change me
    const appRE = /^\(/;
    const numRE = /^\-?\d+/; // this one doesn't permit fractions
    const boolRE = /^#[tf]/;
    const strRE = /^"[^"]*"/;
    const quoteRE = /^'/;

    if (varRE.test(text)) {
        let matches = text.match(varRE);
        let name = matches[0];
        let rest = text.slice(name.length).trim();
        let variable = {value: name, type: VAR_T};

        return {prog: variable, rest: rest};

    } else if (numRE.test(text)) {
        let matches = text.match(numRE);
        let numStr = matches[0];
        let rest = text.slice(numStr.length).trim();
        let num = {value: +numStr, type: RNUM_T};

        return {prog: num, rest: rest};

    } else if (boolRE.test(text)) {
        let matches = text.match(boolRE);
        let boolStr = matches[0];
        let rest = text.slice(2).trim();
        let bool = {value: boolStr == '#t', type: RBOOL_T};

        return {prog: bool, rest: rest};

    } else if (strRE.test(text)) {
        let matches = text.match(strRE);
        let str = {value: matches[0], type: RSTRING_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: str, rest: rest};

    } else if (appRE.test(text)) {
        text = text.slice(1).trim(); // remove open paren
        let parseFunct = parse(text); // parse function
        let funct = parseFunct.prog; // get function
        text = parseFunct.rest; // get past function
        let args = [];

        while (text[0] != ')') {
            let parseArg = parse(text);
            args = [...args, parseArg.prog];
            text = parseArg.rest;
        }

        let app = {value: {funct: funct, args: args}, type: APP_T};
        let rest = text.slice(1).trim(); // remove close paren

        return {prog: app, rest: rest};

    } else if (quoteRE.test(text)) {
        return parseQ(text);
    }

    throw 'Invalid Syntax: \"' + text + '\"';
}

// String -> {prog: Program, rest: String}
// parses quoted expressions
function parseQ(text) {
    const symRE = /^'?[a-zA-Z\+\-\*\/\?=><#"]+/; // change me
    const listRE = /^'?\s*\(/;
    const numRE = /^'?\-?\d+/; // this one doesn't permit fractions
    const boolRE = /^#[tf]/;
    const strRE = /^"[^"]*"/;


    if (listRE.test(text)) {
        text = text.slice(text.match(listRE)[0].length).trim(); // remove quote, open paren
        let listArr = [];

        while (text[0] != ')') {
            let cur = parseQ(text);
            listArr = [cur.prog, ...listArr]; // listArr is constructed backwards
            text = cur.rest;
        }

        let rest = text.slice(1).trim();
        let prog = listArr.reduce((acc, cur) => ({value: {a: cur, d: acc}, type: RLIST_T}), {value: null, type: RLIST_T}); // turn listArr into an Rlist

        return {prog: prog, rest: rest};

    } else if (numRE.test(text)) {
        let matches = text.match(numRE);
        let numStr = matches[0];
        let rest = text.slice(numStr.length).trim();
        let num = {value: +numStr, type: RNUM_T};

        return {prog: num, rest: rest};

    } else if (boolRE.test(text)) {
        let matches = text.match(boolRE);
        let boolStr = matches[0];
        let rest = text.slice(2).trim();
        let bool = {value: boolStr == '#t', type: RBOOL_T};

        return {prog: bool, rest: rest};

    } else if (strRE.test(text)) {
        let matches = text.match(strRE);
        let str = {value: matches[0], type: RSTRING_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: str, rest: rest};

    } else if (symRE.test(text)) {
        let matches = text.match(symRE);
        let value = matches[0];
        value = value[0] == '\'' ? value : '\'' + value;
        let sym = {value: value, type: RSYM_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: sym, rest: rest};
    }

    throw 'Invalid Syntax: \"' + text + '\"';
}

/***
    Environment: [Variable]
    Variable:    {name:    String,
                  binding: Program} 
***/

// Program -> Environment -> Program
function interp(prog, env) {
    function lookup(name) {
        let val = env.reduce((acc, variable) => {
            if (acc != undefined) {
                return acc;
            }

            return variable.name == name ? variable.binding : undefined;
        }, undefined);

        if (val == undefined){
            throw new ReferenceError(name + ' isn\'t defined');
        }

        return val;
    }

    switch(prog.type) {
    case RNUM_T:
        return prog;
    case RBOOL_T:
        return prog;
    case RSTRING_T:
        return prog;
    case RLIST_T:
        return prog;
    case RSYM_T:
        return prog;
    case VAR_T:
        return lookup(prog.value);
    case FUNCT_T:
        return prog;
    case APP_T:
        let args = prog.value.args;
        let funct = interp(prog.value.funct, env);

        typeCheck(funct, FUNCT_T);

        return funct.value(args, env);

    default:
        throw "Interpreter Error " + unParse(prog);
    }
}

// Program -> String
function unParse(prog) {
    switch (prog.type) {
    case RNUM_T:
        return prog.value;
    case RBOOL_T:
        return '#' + (prog.value ? 't' : 'f');
    case RSTRING_T:
        return prog.value;
    case RLIST_T:
        if (prog.value === null) {
            return '\'()';
        } else {
            return '(cons ' + unParse(prog.value.a) + ' ' + unParse(prog.value.d) + ')';
        }
    case RSYM_T:
        return prog.value;
    case VAR_T:
        return 'variable';
    case FUNCT_T:
        return 'function';
    case APP_T:
        return 'application';
    default:
        return 'error or something';
    }
    
}

function typeCheck(prog, type){
    let typeString = '';
    switch (type) {
    case VAR_T:
        typeString = 'variable';
        break;
    case APP_T:
        typeString = 'application';
        break;
    case FUNCT_T:
        typeString = 'function';
        break;
    case RNUM_T:
        typeString = 'number';
        break;
    case RBOOL_T:
        typeString = 'boolean';
        break;
    case RSTRING_T:
        typeString = 'string';
        break;
    case RLIST_T:
        typeString = 'list';
        break;
    default:
        typeString = '???';
    }

    if (prog.type != type){
        throw new TypeError(prog.value + ' ain\'t a ' + typeString);
    }
}

function plus(args, env) {
    return args.reduce((acc, cur) => {
        let accVal = interp(acc, env);
        let curVal = interp(cur, env);

        typeCheck(accVal, RNUM_T);
        typeCheck(curVal, RNUM_T);

        return {value: accVal.value + curVal.value,
                type: RNUM_T};
    });
}
function minus(args, env) {
    return args.reduce((acc, cur) => {
        let accVal = interp(acc, env);
        let curVal = interp(cur, env);

        typeCheck(accVal, RNUM_T);
        typeCheck(curVal, RNUM_T);

        return {value: accVal.value - curVal.value,
                type: RNUM_T};
    });
}
function times(args, env) {
    return args.reduce((acc, cur) => {
        let accVal = interp(acc, env);
        let curVal = interp(cur, env);

        typeCheck(accVal, RNUM_T);
        typeCheck(curVal, RNUM_T);

        return {value: accVal.value * curVal.value,
                type: RNUM_T};
    });
}
function divide(args, env) {
    if (args.length == 1) {
        let firstVal = interp(args[0], env);

        typeCheck(firstVal, RNUM_T);

        return {value: 1 / firstVal.value,
                type: RNUM_T};
    } else if (args.length == 2) {
        let firstVal = interp(args[0], env);
        let secondVal = interp(args[1], env);

        typeCheck(firstVal, RNUM_T);
        typeCheck(secondVal, RNUM_T);

        return {value: firstVal.value / secondVal.value,
                type: RNUM_T};
    }

    args.forEach((cur) => typeCheck(cur, RNUM_T));
    return {value: false, type: RBOOL_T};
}
function car(args, env) {
    if (args.length != 1) {
        throw "aritry mismatch";
    }

    let firstVal = interp(args[0], env);

    typeCheck(firstVal, RLIST_T);

    return firstVal.value.a;
}
function cdr(args, env) {
    if (args.length != 1) {
        throw "arity mismatch";
    }

    let firstVal = interp(args[0], env);

    typeCheck(firstVal, RLIST_T);

    return firstVal.value.d;
}
function cons(args, env) {
    if (args.length != 2) {
        throw "arity mismatch";
    }

    let firstVal = interp(args[0], env);
    let secondVal = interp(args[1], env);

    return {value: {a: firstVal, d: secondVal},
            type: RLIST_T};
}
function not(args, env) {
    if (args.length != 1) {
        throw "arity mismatch";
    }

    let firstVal = interp(args[0], env);

    return {value: firstVal.value === false,
            type: RBOOL_T};
}
function iseqv(args, env) {
    if (args.length != 2) {
        throw "arity mismatch";
    }

    let firstVal = interp(args[0], env);
    let secondVal = interp(args[1], env);

    return {value: firstVal.value === secondVal.value,
            type: RBOOL_T};
}
function and(args, env) {
    interpArgs = args.map((prog) => interp(prog, env));

    return interpArgs.reduce((acc, cur) => {
        return acc.value !== false ? cur : {value: false, type: RBOOL_T};
    }, {value: true, type: RBOOL_T});

}
function or(args, env) {
    interpArgs = args.map((prog) => interp(prog, env));

    return interpArgs.reduce((acc, cur) => {
        return acc.value !== false ? acc : cur;
    }, {value: true, type: RBOOL_T});

}
function rif(args, env) {
    if (args.length != 3) {
        throw "arity mismatch";
    }

    let firstVal = interp(args[0], env);
    let secondVal = interp(args[1], env);
    let thirdVal = interp(args[2], env);

    typeCheck(firstVal, RBOOL_T);

    return firstVal.value ? secondVal : thirdVal;
}
function isnull(args, env) {
    if (args.length != 1) {
        throw "arity mismatch";
    }

    let firstVal = interp(args[0], env);

    return {value: firstVal.value === null && firstVal.type == RLIST_T,
            type: RBOOL_T};
}
function equalsign(args, env) {
    let interpArgs = args.map((elem) => interp(elem, env));
    interpArgs.forEach((cur) => typeCheck(cur, RNUM_T)); 

    let val = interpArgs.reduce((acc, cur) => {
        
        if (acc.value === false) {
            return {value: false, type: RBOOL_T};
        }

        return acc.value == cur.value ? acc : {value: false, type: RBOOL_T};
    });

    if (val.value === false){
        return val;
    } else {
        return {value: true, type: RBOOL_T};
    }
}
function gtsign(args, env) {
    let interpArgs = args.map((elem) => interp(elem, env));
    interpArgs.forEach((cur) => typeCheck(cur, RNUM_T)); 

    let val = interpArgs.reduce((acc, cur) => {
        
        if (acc.value === false) {
            return {value: false, type: RBOOL_T};
        }

        return acc.value > cur.value ? acc : {value: false, type: RBOOL_T};
    });

    if (val.value === false){
        return val;
    } else {
        return {value: true, type: RBOOL_T};
    }
}
function gesign(args, env) {
    let interpArgs = args.map((elem) => interp(elem, env));
    interpArgs.forEach((cur) => typeCheck(cur, RNUM_T)); 

    let val = interpArgs.reduce((acc, cur) => {
        
        if (acc.value === false) {
            return {value: false, type: RBOOL_T};
        }

        return acc.value >= cur.value ? acc : {value: false, type: RBOOL_T};
    });

    if (val.value === false){
        return val;
    } else {
        return {value: true, type: RBOOL_T};
    }
}
function ltsign(args, env) {
    let interpArgs = args.map((elem) => interp(elem, env));
    interpArgs.forEach((cur) => typeCheck(cur, RNUM_T)); 

    let val = interpArgs.reduce((acc, cur) => {
        
        if (acc.value === false) {
            return {value: false, type: RBOOL_T};
        }

        return acc.value < cur.value ? acc : {value: false, type: RBOOL_T};
    });

    if (val.value === false){
        return val;
    } else {
        return {value: true, type: RBOOL_T};
    }
}
function lesign(args, env) {
    let interpArgs = args.map((elem) => interp(elem, env));
    interpArgs.forEach((cur) => typeCheck(cur, RNUM_T)); 

    let val = interpArgs.reduce((acc, cur) => {
        
        if (acc.value === false) {
            return {value: false, type: RBOOL_T};
        }

        return acc.value <= cur.value ? acc : {value: false, type: RBOOL_T};
    });

    if (val.value === false){
        return val;
    } else {
        return {value: true, type: RBOOL_T};
    }
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
        } else if (props.outExpr instanceof Error) {
            return props.outExpr.message;
        } else {
            return unParse(props.outExpr);
        }
    }

    function makeImg(){
        // value to set a wantExpr to in the case of error
        const wantError = Infinity;
        let wantExpr;
        try {
            if (props.wantText === ''){
                wantExpr = {value: '""', type: RSTRING_T};
            } else {
                let parsedWant = parse(props.wantText);
                if (parsedWant.rest != '') {
                    throw new SyntaxError('Parsing Error');
                }

                wantExpr = parsedWant.prog;
            }
        } catch (e) {
            wantExpr = wantError;
        }

        if (props.outExpr === grayVal) {
            return '';
        } else if (wantExpr === wantError) {
            return '';
        } else if (props.outExpr instanceof Error) {
            return <img
                     src={imgPath + 'frowneyface.png'}
                     style={{float: 'right'}}
                     title={"Oh no! You got an error!"}/>;
        } else if (props.outExpr.value === wantExpr.value) {
            return <img
                     src={imgPath + 'smileyface.png'}
                     style={{float: 'right'}}
                     title={"Yay! It's right!"}/>;
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
             fexprChange(e, fexpr), addFexpr(), addThenChild(fexpr), remFexpr(fexpr)
     */

    // [Fexpr] -> [Boolean] -> String -> [N] -> [{N, String}]
    // uses side effects to build a shallow 2d array from a tree type thing
    function rotateFexprs(fexprs, boolArr, acc, rotatedExprs){
        function rotateFexpr(fexpr, boolArr, acc, rotatedExprs) {
            let passedInvalidRows = 0;
            let thenBoolArr = [];

            boolArr.forEach((bool, j) => {
                if (bool) {
                    const outExpr = fexpr.outExprs[j - passedInvalidRows];
                    let style = {backgroundColor: colors[acc]};

                    if (outExpr.value === true) {
                        style.color = colors[trueColorIndex(acc + 1)];
                    } else if (outExpr.value === false) {
                        style.color = colors[falseColorIndex(acc + 1)];
                    }

                    rotatedExprs[j].push({outExpr: outExpr, style: style});
                    thenBoolArr.push(outExpr.value);
                } else {
                    passedInvalidRows ++;
                    rotatedExprs[j].push({outExpr: grayVal, style: {backgroundColor: 'gray'}});
                    thenBoolArr.push(false);
                }
            });

            if (fexpr.thenChildren.length) { // fexpr has children
                rotateFexprs(fexpr.thenChildren, thenBoolArr, trueColorIndex(acc + 1), rotatedExprs);
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
                         thenColor: colors[trueColorIndex(acc + 1)]},
                        flattenFexprs(fexpr.thenChildren, trueColorIndex(acc + 1))].filter((elem) => elem !== null).flat();
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
                                                        {allBools(headInfo.fexpr.outExprs) ?
                                                         <div style={{float: 'right'}}>
                                                           <PlusButton
                                                             color={headInfo.thenColor}
                                                             title={'Add Then Child'}
                                                             onClick={() => props.addThenChild(headInfo.fexpr)}
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
        this.state = {tables: [{examples: [{inTexts: ['0'], wantText: ''}],                                   // rows
                                fexprs: [{text: '0', outExprs: [{value: 0, type: RNUM_T}], thenChildren: []}], // function columns
                                params: [initParam],                                                           // variable (parameter) columns
                                name: 'table'}]};                                                              // table name (used for recursion)
        
        this.testAll = this.testAll.bind(this);
        this.addTable = this.addTable.bind(this);
        this.remTable = this.remTable.bind(this);
        this.addExample = this.addExample.bind(this);
        this.addFexpr = this.addFexpr.bind(this);
        this.addThenChild = this.addThenChild.bind(this);
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
            function lookup(args, env) {
                const errorVal = undefined;
                let interpArgs = args.map((arg) => interp(arg, env));

                let expr = table.examples.reduce((acc, example) => {
                    if (acc !== errorVal) {
                        return acc;
                    }

                    if (example.inTexts.reduce((acc, inText, i) => {
                        let inProg = parse(inText);

                        if (inProg.rest != '') {
                            throw 'Parse Error';
                        }

                        let inExpr = interp(inProg.prog, env);

                        return acc && inExpr.value === interpArgs[i].value;

                    }, true)) {
                        let wantProg = parse(example.wantText);

                        if (wantProg.rest != '') {
                            throw 'Parse Error';
                        }

                        return interp(wantProg.prog, env);
                    }

                    return errorVal;
                }, errorVal);

                if (expr === errorVal) {
                    throw new Error(interpArgs.map(unParse).join + ' is not an example in ' + table.name);
                }

                return expr;
            }

            return lookup;
        }


        // Table -> [Function] -> [String] -> Table
        // this one is also pure
        function testTable(table, env){
            // Fexpr -> [[String]] -> [String] -> [Function] -> [String] -> Fexpr
            // function that actually does stuff
            // this one is pure (no side effects)
            function testFexpr(fexpr, inTextss, params){
                let outExprs = inTextss.map((inTexts, i) => {
                    let localBindings = inTexts.map((inText, j) => {
                        let parsedText = parse(inText);
                        if (parsedText.rest != '') {
                            throw new SyntaxError('Parsing error');
                        }

                        return {name: params[j], binding: parsedText.prog};
                    });

                    const localEnv = [...env, ...localBindings];

                    let parsedFexpr = parse(fexpr.text);

                    if (parsedFexpr.rest != '') {
                        throw new SyntaxError('Parsing error');
                    }

                    return interp(parsedFexpr.prog, localEnv);
                });

                let thenChildren;
                if (allBools(outExprs)) {
                    const filterIndices = outExprs.map((outExpr, index) => outExpr.value ? index : -1);
                    const trueInTextss = inTextss.filter((inTexts, index) => filterIndices.includes(index));
                    thenChildren = fexpr.thenChildren.map((thenChild) => testFexpr(thenChild, trueInTextss, params));

                } else {
                    thenChildren = [];
                }

                return {text: fexpr.text,           // doesn't change
                        outExprs: outExprs,         // changes
                        thenChildren: thenChildren}; // changes

            }

            const inTextss = table.examples.map((example) => example.inTexts);
            const fexprs = table.fexprs.map((fexpr) => testFexpr(fexpr, inTextss, table.params));

            return {examples: table.examples, // doesn't change
                    fexprs: fexprs,           // changes
                    params: table.params,     // doesn't change
                    name: table.name};        // doesn't change
        }


        // this changes stuff
        this.setState((state) => {
            const lookups = state.tables.map((table) => ({name: table.name, binding: {type: FUNCT_T,
                                                                                      value: makeLookup(table)}}));
            const globalEnv = [...initEnv, ...lookups];

            return {tables: state.tables.map((table) => testTable(table, globalEnv))};
        });
    }

    // adds a new table
    addTable(){
        this.setState((state) => {
            const oldTabs = state.tables.slice();
            const initParam = 'n';
            const tableNum = oldTabs.length + 1;
            const newTab = {examples: [{inTexts: ['0'], wantText: ''}],
                            fexprs: [{text: '0', outExprs: [{value: 0, type: RNUM_T}], thenChildren: []}],
                            params: [initParam],
                            name: 'table' + tableNum};

            return {tables: [...oldTabs, newTab]};
        });
    }

    // removes a table
    remTable(deadTable){
        this.setState((state) => ({tables: state.tables.filter((table) => table !== deadTable)}));
    }
    
    //adds a new row
    addExample(modTable){
        this.setState((state) => {
            let newTab = {...modTable};

            const inTexts = newTab.params.map((param) => '0');
            const examples = [...newTab.examples, {inTexts: inTexts,
                                                   wantText: ''}];

            // need to maintain #outExprs == #examples
            const fexprs = newTab.fexprs.map((fexpr) => ({...fexpr, outExprs: [...fexpr.outExprs, {value: 0, type: RNUM_T}]}));

            newTab.examples = examples;
            newTab.fexprs = fexprs;

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }
    
    //adds a new out column
    addFexpr(modTable){
        this.setState((state) => {
            let newTab = {...modTable};

            const outExprs = modTable.examples.map((example) => ({value: 0, type: RNUM_T}));
            const fexprs = [...newTab.fexprs, {text: '0',
                                               outExprs: outExprs,
                                               thenChildren: []}];
            newTab.fexprs = fexprs;

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    //adds a then column to a fexpr
    addThenChild(parentFexpr, modTable){
        function replaceParent(curParent, newParent){
            if (curParent === parentFexpr){
                return newParent;
            } else {
                return {...curParent,
                        thenChildren: curParent.thenChildren.map((child) => replaceParent(child, newParent))};
            }
        }

        this.setState((state) => {
            let newTab = {...modTable};
            let newParent = {...parentFexpr};

            const outExprs = newParent.outExprs.filter((outExpr) => outExpr.value === true).map((outExpr) => ({value: 0, type: RNUM_T}));

            // this is pretty much push, but oh well
            newParent.thenChildren = [...newParent.thenChildren, {text: '0',
                                                                  outExprs: outExprs,
                                                                  thenChildren: []}];

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
            let fexprs = newTab.fexprs.slice();
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
        // this is pretty violent
        function killFexpr(fexpr){
            if (fexpr === deadFexpr){
                return null;
            } else {
                return {text: fexpr.text,
                        outExprs: fexpr.outExprs.slice(),
                        thenChildren: fexpr.thenChildren.map(killFexpr).filter((elem) => elem !== null)};
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
            if (curFexpr === modFexpr){
                return newFexpr;
            } else {
                return {...curFexpr,
                        thenChildren: curFexpr.thenChildren.map((child) => replaceFexpr(child, newFexpr))};
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

                                       /* inTextChange={(e, modExample, modIndex) => {this.inTextChange(e, modExample, modIndex, table); */
                                       /*                                             this.testAll();}} */
                                       /* wantTextChange={(e, example) =>            {this.wantTextChange(e, example, table); */
                                       /*                                             this.testAll();}} */
                                       /* addExample={() =>                          {this.addExample(table); */
                                       /*                                             this.testAll();}} */
                                       /* remExample={(example) =>                   {this.remExample(example, table); */
                                       /*                                             this.testAll();}} */
                                       
                                       /* fexprChange={(e, modFexpr) =>              {this.fexprChange(e, modFexpr, table); */
                                       /*                                             this.testAll();}} */
                                       /* addFexpr={() =>                            {this.addFexpr(table); */
                                       /*                                             this.testAll();}} */
                                       /* addThenChild={(parent) =>                  {this.addThenChild(parent, table); */
                                       /*                                             this.testAll();}} */
                                       /* remFexpr={(fexpr) =>                       {this.remFexpr(fexpr, table); */
                                       /*                                             this.testAll();}} */

                                       /* paramChange={(e, index) =>                 {this.paramChange(e, index, table); */
                                       /*                                             this.testAll();}} */
                                       /* addParam={() =>                            {this.addParam(table); */
                                       /*                                             this.testAll();}} */
                                       /* remParam={(index) =>                       {this.remParam(index, table); */
                                       /*                                             this.testAll();}} */

                                       /* nameChange={(e) =>                         {this.nameChange(e, table); */
                                       /*                                             this.testAll();}} */

                                       /* testAll={this.testAll} */
                                       /* remTable={() => {this.remTable(table); */
                                       /*                  this.testAll();}} */

                                       inTextChange={(e, modExample, modIndex) => this.inTextChange(e, modExample, modIndex, table)}
                                       wantTextChange={(e, example) =>            {this.wantTextChange(e, example, table);}}
                                       addExample={() =>                          {this.addExample(table);}}
                                       remExample={(example) =>                   {this.remExample(example, table);}}
                                       
                                       fexprChange={(e, modFexpr) =>              {this.fexprChange(e, modFexpr, table);}}
                                       addFexpr={() =>                            {this.addFexpr(table);}}
                                       addThenChild={(parent) =>                  {this.addThenChild(parent, table);}}
                                       remFexpr={(fexpr) =>                       {this.remFexpr(fexpr, table);}}

                                       paramChange={(e, index) =>                 {this.paramChange(e, index, table);}}
                                       addParam={() =>                            {this.addParam(table);}}
                                       remParam={(index) =>                       {this.remParam(index, table);}}

                                       nameChange={(e) =>                         {this.nameChange(e, table);}}

                                       testAll={this.testAll}
                                       remTable={() => {this.remTable(table);}}
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
