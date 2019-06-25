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


const colors = ['white', 'orchid', 'cornflowerblue', 'mediumpurple', 'fuchsia', 'blueviolet', 'salmon', 'gold'];

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

// [Program] -> Boolean
// returns true if progs has at least one member and all of its members are boooleans
//    otherwise returns false
function allBools(progs){
    if (progs.length == 0) {
        return false;
    }

    return progs.every((prog) => prog.type == RBOOL_T);
}

// Program -> Program -> Boolean
// checks if two programs are equivalent, recurs on lists and applications
// may not quite work on functions because I use js functions, not data represented closures or something
//    thus 2 functions are only equal if they're a reference to the same object
function deepEquals(proga, progb) {
    if (proga.type != progb.type) {
        return false;
    }

    if (proga.type == RLIST_T) {
        if (proga.value == null || progb.value == null) {
            return proga.value == progb.value;
        }
        return deepEquals(proga.value.a, progb.value.a) && deepEquals(proga.value.d, progb.value.d);
    }

    // this case will prolly never even happen...
    if (proga.type == APP_T) {
        if (proga.value.args.length != progb.value.args.length) {
            return false;
        }
        let functCheck = deepEquals(proga.value.funct, progb.value.funct);
        let argCheck = proga.value.args.map((arga, i) => deepEquals(arga, progb.value.args[i])).every((elem) => elem);
        return functCheck && argCheck;
    }

    return proga.value === progb.value;
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
    {name: 'list', binding: {type: FUNCT_T,
                             value: list}},
    {name: 'not', binding: {type: FUNCT_T,
                             value: not}},
    {name: 'and', binding: {type: FUNCT_T,
                             value: and}},
    {name: 'or', binding: {type: FUNCT_T,
                             value: or}},
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

    if (numRE.test(text)) {
        let matches = text.match(numRE);
        let numStr = matches[0];
        let rest = text.slice(numStr.length).trim();
        let num = {value: +numStr, type: RNUM_T};

        return {prog: num, rest: rest};
    } else if (varRE.test(text)) {
        let matches = text.match(varRE);
        let name = matches[0];
        let rest = text.slice(name.length).trim();
        let variable = {value: name, type: VAR_T};

        return {prog: variable, rest: rest};


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

    throw new SyntaxError('Invalid Syntax: \"' + text + '\"');
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
        throw new TypeError("Unknown Type " + prog.value);
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

// String -> Program
// parses text and checks for syntax errors based on what's returned
function parseCheck(text) {
    let parsed = parse(text);

    switch (parsed.rest) {
    case '':
        break;
    default:
        throw new SyntaxError('Parsing Error');
    }

    return parsed.prog;
}

// Program -> Number -> Side Effect Maybe
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
    case RSYM_T:
        typeString = 'symbol';
    default:
        typeString = '???';
    }

    if (prog.type != type){
        throw new TypeError(unParse(prog) + ' ain\'t a ' + typeString);
    }
}

function plus(args, env) {
    let argVals = args.map((elem) => interp(elem, env));
    argVals.forEach((cur) => typeCheck(cur, RNUM_T)); 

    return argVals.reduce((acc, cur) => {
        return {value: acc.value + cur.value,
                type: RNUM_T};
    });
}
function minus(args, env) {
    let argVals = args.map((elem) => interp(elem, env));
    argVals.forEach((cur) => typeCheck(cur, RNUM_T)); 

    return argVals.reduce((acc, cur) => {
        return {value: acc.value - cur.value,
                type: RNUM_T};
    });
}
function times(args, env) {
    let argVals = args.map((elem) => interp(elem, env));
    argVals.forEach((cur) => typeCheck(cur, RNUM_T)); 

    return argVals.reduce((acc, cur) => {
        return {value: acc.value * cur.value,
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
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);

    typeCheck(firstVal, RLIST_T);

    return firstVal.value.a;
}
function cdr(args, env) {
    if (args.length != 1) {
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);

    typeCheck(firstVal, RLIST_T);

    return firstVal.value.d;
}
function cons(args, env) {
    if (args.length != 2) {
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);
    let secondVal = interp(args[1], env);

    // because BSL
    typeCheck(secondVal, RLIST_T);

    return {value: {a: firstVal, d: secondVal},
            type: RLIST_T};
}
function list(args, env) {
    if (args.length == 0) {
        throw new Error('arity mismatch');
    }

    let interpArgs = args.map((arg) => interp(arg, env));

    return interpArgs.reverse().reduce((acc, arg) => ({value: {a: arg, d: acc},
                                                       type: RLIST_T}),
                                       {value: null,
                                        type: RLIST_T});
}
function not(args, env) {
    if (args.length != 1) {
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);

    return {value: firstVal.value === false,
            type: RBOOL_T};
}
function iseqv(args, env) {
    if (args.length != 2) {
        throw new Error('arity mismatch');
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
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);
    let secondVal = interp(args[1], env);
    let thirdVal = interp(args[2], env);

    typeCheck(firstVal, RBOOL_T);

    return firstVal.value ? secondVal : thirdVal;
}
function isnull(args, env) {
    if (args.length != 1) {
        throw new Error('arity mismatch');
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
            wantExpr = interp(props.wantProg, initEnv);
        } catch (e) {
            wantExpr = wantError;
        }

        if (props.outExpr === grayVal) {
            return '';
        } else if (props.outExpr instanceof Error) {
            return <img
                     src={imgPath + 'frowneyface.png'}
                     style={{float: 'right'}}
                     title={"Oh no! You got an error!"}/>;
        } else if (wantExpr === wantError) {
            return '';
        } else if (deepEquals(props.outExpr, wantExpr)) {
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
             paramChange(e, index), inProgChange(e, example, index), addParam(), addExample() remParam(index), remExample(example)
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
                                    <NameField
                                      nameChange={(text) => props.paramChange(text, i)} />
                                  </td>
                                 )}
              </tr>
              {props.examples.map((example, i) =>
                                  <tr key={i}>
                                    {example.inProgs.map((inProg, j) =>
                                                         <td
                                                           key={j}
                                                           style={{height: cellHeight}}
                                                           border={'1'}>
                                                           <ProgField
                                                             progChange={(prog) => props.inProgChange(prog, example, j)}
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
      Props: numRows, fexprs, wantProgs
             fexprChange(e, fexpr), addFexpr(), addThenChild(fexpr), remFexpr(fexpr)
     */

    // [Fexpr] -> [Boolean] -> String -> [outExpr] -> [{renderExpr, String}]
    // uses side effects to build a shallow 2d array from a tree type thing
    // a renderExpr is like an outExpr except it can also be a grayVal (grayed out)
    function rotateFexprs(fexprs, boolArr, acc, rotatedExprs){
        function rotateFexpr(fexpr, boolArr, acc, rotatedExprs) {
            let passedInvalidRows = 0;
            let thenBoolArr = [];

            boolArr.forEach((bool, j) => {
                if (bool) {
                    const outExpr = fexpr.outExprs[j - passedInvalidRows];
                    let style = {backgroundColor: colors[acc]};

                    if (outExpr.value === true) {
                        style.color = colors[(acc + 1) % colors.length];
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
                rotateFexprs(fexpr.thenChildren, thenBoolArr, (acc + 1) % colors.length, rotatedExprs);
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
                         thenColor: colors[(acc + 1) % colors.length]},
                        flattenFexprs(fexpr.thenChildren, (acc + 1) % colors.length)].filter((elem) => elem !== null).flat();
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
                                                      <ProgField
                                                        progChange={(prog) => props.fexprChange(prog, headInfo.fexpr)} />
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
                                                 wantProg={props.wantProgs[i]}
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
             wantProgChange(prog, example)
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
                                      <ProgField
                                        progChange={(prog) => props.wantProgChange(prog, example)} />
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
          <NameField
            nameChange={props.nameChange} />
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

              inProgChange={props.inProgChange}
              addExample={props.addExample}
              remExample={props.remExample}
            />
            <Functs
              fexprs={props.fexprs}
              numRows={props.examples.length}
              wantProgs={props.examples.map((example) => example.wantProg)}

              fexprChange={props.fexprChange}
              addFexpr={props.addFexpr}
              addThenChild={props.addThenChild}
              remFexpr={props.remFexpr}
            />
            <Wants
              examples={props.examples}
              wantProgChange={props.wantProgChange}
            />
          </span>
        </div>
    );
}

const initProg = {value: '"hi there"', type: RSTRING_T};
const initWantProg = {value: 1234, type: RNUM_T};

// text box that contains text that becomes a program
class ProgField extends React.Component {
    constructor(props) {
        super (props);
        this.state = {text: '',
                      style: {backgroundColor: 'pink'}}; // change me to actually use CSS

        this.textChange = this.textChange.bind(this);
    }

    textChange(e) {
        let error = false;
        const text = e.target.value;

        try {
            var prog = parseCheck(text);
        } catch(e) {
            error = true;
        }

        if (error) {
            this.setState((state) => ({text: text,
                                       style: {backgroundColor: 'pink'}})); // also change me
        } else {
            this.setState((state) => ({text: text,
                                       style: {backgroundColor: 'white'}})); // me too
            this.props.progChange(prog);
        }

    }

    render() {
        return (
            <input
              style={this.state.style}
              size={this.state.text.length + 1}
              type={'text'}
              value={this.state.text}
              onChange={(e) => this.textChange(e)} />
        );
    }
}

// text field that contains text that will become the name of a variable at some point
class NameField extends React.Component {
    constructor(props) {
        super (props);
        this.state = {text: '',
                      style: {backgroundColor: 'pink'}}; // change me to actually use CSS

        this.textChange = this.textChange.bind(this);
    }

    textChange(e) {
        function lookup(name, env) {
            let val = env.reduce((acc, variable) => {
                if (acc != undefined) {
                    return acc;
                }

                return variable.name == name ? variable.binding : undefined;
            }, undefined);

            if (val == undefined){
                return false;
            }

            return true;
        }

        const varRE = /^[a-zA-Z\+\-\*\/\?=><]+/; // change me
        let text = e.target.value;
        let badName = !varRE.test(text) || lookup(text, initEnv);
        

        if (badName) {
            this.setState((state) => ({text: text,
                                       style: {backgroundColor: 'pink'}})); // also change me
        } else {
            this.setState((state) => ({text: text,
                                       style: {backgroundColor: 'white'}})); // and me
            this.props.nameChange(text);
        }

    }

    render() {
        return (
            <input
              style={this.state.style}
              size={this.state.text.length + 1}
              type={'text'}
              value={this.state.text}
              onChange={this.textChange} />
        );
    }
}

/*
  Notes:
  #inProgs == #params
  #outExprs == #examples (well not for child fexprs)
  -----------------------
  |#inProgs != #outExprs|
  -----------------------
*/
class App extends React.Component{
    constructor(props){
        super(props);
        const initParam = 'n';
        this.state = {tables: [{examples: [{inProgs: [initProg], wantProg: initWantProg}],           // rows
                                fexprs: [{prog: initProg, outExprs: [initProg], thenChildren: []}], // function columns
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
        this.inProgChange = this.inProgChange.bind(this);
        this.wantProgChange = this.wantProgChange.bind(this);
        this.fexprChange = this.fexprChange.bind(this);
        this.paramChange = this.paramChange.bind(this);
        this.nameChange = this.nameChange.bind(this);
    }

    // this one has side effects
    testAll(){
        function makeLookup(table) {
            function lookup(args, env) {
                if (args.length != table.params.length) {
                    throw new Error('Arity Mismatch, expected ' + table.params.length + ' argument' + (table.params.length == 1 ? 's' : ''));
                }
                
                const errorVal = undefined;
                let interpArgs = args.map((arg) => interp(arg, env));

                let expr = table.examples.reduce((acc, example) => {
                    if (acc !== errorVal) {
                        return acc;
                    }

                    if (example.inProgs.reduce((acc, inProg, i) => {
                        let inExpr = interp(inProg, env);
                        return acc && deepEquals(inExpr, interpArgs[i]);

                    }, true)) {
                        return interp(example.wantProg, env);
                    }

                    return errorVal;
                }, errorVal);

                if (expr === errorVal) {
                    throw new ReferenceError(interpArgs.map(unParse).join() + ' is not an example in ' + table.name);
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
            function testFexpr(fexpr, inProgss, params){
                let outExprs = inProgss.map((inProgs, i) => {

                    try {
                        let localBindings = inProgs.map((inProg, j) => {
                            let inExpr = interp(inProg, initEnv);
                            return {name: params[j], binding: inExpr};
                        });

                        const localEnv = [...env, ...localBindings];

                        var outExpr = interp(fexpr.prog, localEnv);
                    } catch (e) {
                        if (e instanceof SyntaxError) {
                            outExpr = fexpr.outExprs[i];
                        } else {
                            outExpr = e;
                        }
                    }

                    return outExpr;
                });

                let thenChildren;
                if (allBools(outExprs)) {
                    const filterIndices = outExprs.map((outExpr, index) => outExpr.value ? index : -1);
                    const trueInTextss = inProgss.filter((inProgs, index) => filterIndices.includes(index));
                    thenChildren = fexpr.thenChildren.map((thenChild) => testFexpr(thenChild, trueInTextss, params));

                } else {
                    thenChildren = [];
                }

                return {prog: fexpr.prog,           // doesn't change
                        outExprs: outExprs,         // changes
                        thenChildren: thenChildren}; // changes

            }

            const inProgss = table.examples.map((example) => example.inProgs);
            const fexprs = table.fexprs.map((fexpr) => testFexpr(fexpr, inProgss, table.params));

            return {examples: table.examples, // doesn't change
                    fexprs: fexprs,           // changes
                    params: table.params,     // doesn't change
                    name: table.name};        // doesn't change
        }


        // this changes stuff
        this.setState((state) => {
            const lookups = state.tables.map((table) => ({name: table.name, binding: {type: FUNCT_T,
                                                                                      value: makeLookup(table, unParse)}}));
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
            const newTab = {examples: [{inProgs: [initProg], wantProg: initWantProg}],
                            fexprs: [{prog: initProg, outExprs: [initProg], thenChildren: []}],
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

            const inProgs = newTab.params.map((param) => (initProg));
            const examples = [...newTab.examples, {inProgs: inProgs,
                                                   wantProg: initWantProg}];

            // need to maintain #outExprs == #examples
            const fexprs = newTab.fexprs.map((fexpr) => ({...fexpr, outExprs: [...fexpr.outExprs, initProg]}));

            newTab.examples = examples;
            newTab.fexprs = fexprs;

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }
    
    //adds a new out column
    addFexpr(modTable){
        this.setState((state) => {
            let newTab = {...modTable};

            const outExprs = modTable.examples.map((example) => (initProg));
            const fexprs = [...newTab.fexprs, {prog: initProg,
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

            const outExprs = newParent.outExprs.filter((outExpr) => outExpr.value === true).map((outExpr) => initProg);

            // this is pretty much push, but oh well
            newParent.thenChildren = [...newParent.thenChildren, {prog: initProg,
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

            // need to maintain #inProgs == #params
            let examples = newTab.examples.slice();
            examples.forEach((example) => example.inProgs.push(initProg));

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
                return {prog: fexpr.prog,
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

            //gotta maintain #inProgs == #params
            let examples = newTab.examples.slice();
            examples.forEach((example) => example.inProgs.splice(deadIndex, 1));

            newTab.params = params;
            newTab.examples = examples;

            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }
    
    //handles changes caused by updating a text field
    //modExample refers to the modified row, modIndex referes to the modified inProg
    inProgChange(prog, modExample, modIndex, modTable){
        let newExample = {...modExample};
        newExample.inProgs[modIndex] = prog;

        this.setState((state) => {
            const newTab = {...modTable, examples: modTable.examples.map((example) => example === modExample ? newExample : example)};
            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    wantProgChange(prog, modExample, modTable){
        let newExample = {...modExample};
        newExample.wantProg = prog;

        this.setState((state) => {
            const newTab = {...modTable, examples: modTable.examples.map((example) => example === modExample ? newExample : example)};
            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }
    
    fexprChange(prog, modFexpr, modTable){
        function replaceFexpr(curFexpr, newFexpr){
            if (curFexpr === modFexpr){
                return newFexpr;
            } else {
                return {...curFexpr,
                        thenChildren: curFexpr.thenChildren.map((child) => replaceFexpr(child, newFexpr))};
            }
        }

        let newFexpr = {...modFexpr};
        newFexpr.prog = prog;

        this.setState((state) => {
            const newTab = {...modTable, fexprs: modTable.fexprs.map((fexpr) => replaceFexpr(fexpr, newFexpr))};
            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    paramChange(text, modIndex, modTable){
        const newParam = text;

        this.setState((state) =>{
            const newTab = {...modTable, params: modTable.params.map((param, index) => index === modIndex ? newParam : param)};
            return {tables: state.tables.map((table) => table === modTable ? newTab : table)};
        });
    }

    nameChange(text, modTable){
        const newName = text;
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

                                       inProgChange={(prog, modExample, modIndex) => {this.inProgChange(prog, modExample, modIndex, table);
                                                                                   this.testAll();}}
                                       wantProgChange={(prog, example) =>            {this.wantProgChange(prog, example, table);
                                                                                      this.testAll();}}
                                       addExample={() =>                          {this.addExample(table);
                                                                                   this.testAll();}}
                                       remExample={(example) =>                   {this.remExample(example, table);
                                                                                   this.testAll();}}
                                       
                                       fexprChange={(prog, modFexpr) =>              {this.fexprChange(prog, modFexpr, table);
                                                                                      this.testAll();}}
                                       addFexpr={() =>                            {this.addFexpr(table);
                                                                                   this.testAll();}}
                                       addThenChild={(parent) =>                  {this.addThenChild(parent, table);
                                                                                   this.testAll();}}
                                       remFexpr={(fexpr) =>                       {this.remFexpr(fexpr, table);
                                                                                   this.testAll();}}

                                       paramChange={(text, index) =>                 {this.paramChange(text, index, table);
                                                                                   this.testAll();}}
                                       addParam={() =>                            {this.addParam(table);
                                                                                   this.testAll();}}
                                       remParam={(index) =>                       {this.remParam(index, table);
                                                                                   this.testAll();}}

                                       nameChange={(text) =>                         {this.nameChange(text, table);
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
