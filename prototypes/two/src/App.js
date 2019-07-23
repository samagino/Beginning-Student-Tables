import React from 'react';
import './App.css';


/****************
   Interpreter
****************/

const RVAR_T =    0;
const RAPP_T =    1;
const RFUNCT_T =   2;
const RNUM_T =    3;
const RBOOL_T =   4;
const RSTRING_T = 5;
const RLIST_T =   6;
const RSYM_T =    7;

const initEnv = [
    // functions
    {name: '+', binding: {type: RFUNCT_T,
                          value: plus}},
    {name: '-', binding: {type: RFUNCT_T,
                          value: minus}},
    {name: '*', binding: {type: RFUNCT_T,
                          value: times}},
    {name: '/', binding: {type: RFUNCT_T,
                          value: divide}},
    {name: 'car', binding: {type: RFUNCT_T,
                            value: car}},
    {name: 'first', binding: {type: RFUNCT_T,
                              value: car}},
    {name: 'cdr', binding: {type: RFUNCT_T,
                            value: cdr}},
    {name: 'rest', binding: {type: RFUNCT_T,
                             value: cdr}},
    {name: 'cons', binding: {type: RFUNCT_T,
                             value: cons}},
    {name: 'list', binding: {type: RFUNCT_T,
                             value: list}},
    {name: 'not', binding: {type: RFUNCT_T,
                            value: not}},
    {name: 'and', binding: {type: RFUNCT_T,
                            value: and}},
    {name: 'or', binding: {type: RFUNCT_T,
                           value: or}},
    {name: 'if', binding: {type: RFUNCT_T,
                           value: rif}},
    {name: 'eqv?', binding: {type: RFUNCT_T,
                             value: iseqv}},
    {name: 'null?', binding: {type: RFUNCT_T,
                              value: isnull}},
    {name: 'empty?', binding: {type: RFUNCT_T,
                               value: isnull}},
    {name: '=', binding: {type: RFUNCT_T,
                          value: equalsign}},
    {name: '>', binding: {type: RFUNCT_T,
                          value: gtsign}},
    {name: '>=', binding: {type: RFUNCT_T,
                           value: gesign}},
    {name: '<', binding: {type: RFUNCT_T,
                          value: ltsign}},
    {name: '<=', binding: {type: RFUNCT_T,
                           value: lesign}},
    // constants
    {name: 'true', binding: {type: RBOOL_T,
                             value: true}},
    {name: 'false', binding: {type: RBOOL_T,
                              value: false}},
    {name: 'null', binding: {type: RLIST_T,
                             value: null}},
    {name: 'empty', binding: {type: RLIST_T,
                              value: null}},
];

// String -> {prog: Program, rest: String}
// parses all expressions except quoted expressions
function parse(text) {
    const varRE = /^[a-zA-Z+\-*/?=><]+/; // change me
    const appRE = /^\(/;
    const numRE = /^-?\d+/; // this one doesn't permit fractions
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
        let variable = {value: name, type: RVAR_T};

        return {prog: variable, rest: rest};


    } else if (boolRE.test(text)) {
        let matches = text.match(boolRE);
        let boolStr = matches[0];
        let rest = text.slice(2).trim();
        let bool = {value: boolStr === '#t', type: RBOOL_T};

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

        while (text[0] !== ')') {
            let parseArg = parse(text);
            args = [...args, parseArg.prog];
            text = parseArg.rest;
        }

        let app = {value: {funct: funct, args: args}, type: RAPP_T};
        let rest = text.slice(1).trim(); // remove close paren

        return {prog: app, rest: rest};

    } else if (quoteRE.test(text)) {
        return parseQ(text);
    }

    throw new SyntaxError('Invalid Syntax: "' + text + '"');
}

// String -> {prog: Program, rest: String}
// parses quoted expressions
function parseQ(text) {
    const symRE = /^'?[a-zA-Z+\-*/?=><#"]+/; // change me
    const listRE = /^'?\s*\(/;
    const numRE = /^'?-?\d+/; // this one doesn't permit fractions
    const boolRE = /^#[tf]/;
    const strRE = /^"[^"]*"/;


    if (listRE.test(text)) {
        text = text.slice(text.match(listRE)[0].length).trim(); // remove quote, open paren
        let listArr = [];

        while (text[0] !== ')') {
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
        let bool = {value: boolStr === '#t', type: RBOOL_T};

        return {prog: bool, rest: rest};

    } else if (strRE.test(text)) {
        let matches = text.match(strRE);
        let str = {value: matches[0], type: RSTRING_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: str, rest: rest};

    } else if (symRE.test(text)) {
        let matches = text.match(symRE);
        let value = matches[0];
        value = value[0] === '\'' ? value : '\'' + value;
        let sym = {value: value, type: RSYM_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: sym, rest: rest};
    }

    throw new SyntaxError('Invalid Syntax: "' + text + '"');
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
            if (acc !== undefined) {
                return acc;
            }

            return variable.name === name ? variable.binding : undefined;
        }, undefined);

        if (val === undefined){
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
    case RVAR_T:
        return interp(lookup(prog.value), env);
    case RFUNCT_T:
        return prog;
    case RAPP_T:
        let args = prog.value.args;
        let funct = interp(prog.value.funct, env);

        typeCheck(funct, RFUNCT_T);

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
        return '#' + (prog.value ? 'true' : 'false');
    case RSTRING_T:
        return prog.value;
    case RLIST_T:
        if (prog.value === null) {
            return '\'()';
        } else {
            return `(cons ${unParse(prog.value.a)} ${unParse(prog.value.d)})`;
        }
    case RSYM_T:
        return prog.value;
    case RVAR_T:
        return prog.value;
    case RFUNCT_T:
        return 'function';
    case RAPP_T:
        return `(${unParse(prog.value.funct)} ${prog.value.args.map(unParse).join(' ')})`;
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
    case RVAR_T:
        typeString = 'variable';
        break;
    case RAPP_T:
        typeString = 'application';
        break;
    case RFUNCT_T:
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
        break;
    default:
        typeString = '???';
    }

    if (prog.type !== type){
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
    if (args.length === 1) {
        let firstVal = interp(args[0], env);

        typeCheck(firstVal, RNUM_T);

        return {value: 1 / firstVal.value,
                type: RNUM_T};
    } else if (args.length === 2) {
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
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);

    typeCheck(firstVal, RLIST_T);

    return firstVal.value.a;
}
function cdr(args, env) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);

    typeCheck(firstVal, RLIST_T);

    return firstVal.value.d;
}
function cons(args, env) {
    if (args.length !== 2) {
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
    if (args.length === 0) {
        throw new Error('arity mismatch');
    }

    let interpArgs = args.map((arg) => interp(arg, env));

    return interpArgs.reverse().reduce((acc, arg) => ({value: {a: arg, d: acc},
                                                       type: RLIST_T}),
                                       {value: null,
                                        type: RLIST_T});
}
function not(args, env) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);

    return {value: firstVal.value === false,
            type: RBOOL_T};
}
function iseqv(args, env) {
    if (args.length !== 2) {
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);
    let secondVal = interp(args[1], env);

    return {value: firstVal.value === secondVal.value,
            type: RBOOL_T};
}
function and(args, env) {
    let interpArgs = args.map((prog) => interp(prog, env));

    return interpArgs.reduce((acc, cur) => {
        return acc.value !== false ? cur : {value: false, type: RBOOL_T};
    }, {value: true, type: RBOOL_T});

}
function or(args, env) {
    let interpArgs = args.map((prog) => interp(prog, env));

    return interpArgs.reduce((acc, cur) => {
        return acc.value !== false ? acc : cur;
    }, {value: true, type: RBOOL_T});

}
function rif(args, env) {
    if (args.length !== 3) {
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);
    let secondVal = interp(args[1], env);
    let thirdVal = interp(args[2], env);

    typeCheck(firstVal, RBOOL_T);

    return firstVal.value ? secondVal : thirdVal;
}
function isnull(args, env) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstVal = interp(args[0], env);

    return {value: firstVal.value === null && firstVal.type === RLIST_T,
            type: RBOOL_T};
}
function equalsign(args, env) {
    let interpArgs = args.map((elem) => interp(elem, env));
    interpArgs.forEach((cur) => typeCheck(cur, RNUM_T));

    let val = interpArgs.reduce((acc, cur) => {

        if (acc.value === false) {
            return {value: false, type: RBOOL_T};
        }

        return acc.value===cur.value ? acc : {value: false, type: RBOOL_T};
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

/**************************************
    Thing that Turns Tables Into BSL
**************************************/

// [Table] -> String
function toBSL(program) {
    return program.map(tableToBSL).join('\n\n\n');
}

// Table -> String
function tableToBSL(table) {
    let name = inputToBSL(table.name);
    let params = table.params.map((param) => inputToBSL(param.name)).join(' ');
    let body = table.formulas.map(formulaToBSL).join('\n');
    let check_expects = table.examples.map((example) => (
        `(check-expect (${name} ${example.inputs.map((input) => inputToBSL(input.prog)).join(' ')}) ${inputToBSL(example.want)})`
    )).join('\n');

    return `(define (${name} ${params})\n${body})\n\n${check_expects}`;
}

// Formula -> String
function formulaToBSL(formula) {
    if (isBooleanFormula(formula)) {
        return `(cond [${inputToBSL(formula.prog)} ${formula.thenChildren.map(formulaToBSL).join(' ')}])`;
    } else {
        return inputToBSL(formula.prog);
    }
}

// Input (yellow or string or program) -> String
function inputToBSL(input) {
    if (input === yellow) { // init
        return '...';
    } else if (typeof input === 'string') { // name
        return input;
    } else { // program
        return unParse(input);
    }
}

/*****************************
  Universal Constants I Want
*****************************/
// value to put in child formulas that don't have an output for that row
const gray = {gray: 'gray'};
// value to put in child formulas that have an error output for that row (non-boolean and non-gray)
const pink = {pink: 'pink'};
// value that indicates an uninitialized input
const yellow = {yellow: 'yellow'};
// value to indicate a dry run, i.e. don't actually change the underlying structure, just say
// if the given value exists or not
const dryRun = {yo: 'don\'t actually change anything'};
// image path
const imgPath = './images/';

let keyCount = 0;


/*********************
   Functions I Want
*********************/
// [Program] -> Boolean
// returns true if progs has at least one member and all of its members are boooleans
//    otherwise returns false
function allBools(progs){
    if (progs.length === 0) {
        return false;
    }

    return progs.every((prog) => prog.type === RBOOL_T || prog === gray);
}

function isBooleanFormula(formula) {
    return allBools(formula.outputs) || formula.thenChildren !== undefined;
}

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
        if (this.props.dummy) {
            className = 'dummy_input';
        } else if (this.props.isValid(this.state.text)) {
            className = 'valid_input';
        } else if (this.state.text === '') {
            className = 'empty_input';
        } else {
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
            table={{name: '',
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
              placeholder='Add'
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
              placeholder='Add'
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
                      placeholder='Add'
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
        let goodText = true;

        try {
            parseCheck(text);
        } catch(e) {
            if (e instanceof SyntaxError) {
                goodText = false;
            } else {
                throw e;
            }
        }

        return goodText;
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
                           (text) => inputChange({prog: parseCheck(text)},
                                                  input)
                           :
                           (text) => inputChange({...input,
                                                  prog: parseCheck(text)},
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
        text = unParse(output);
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
        let goodText = true;

        try {
            parseCheck(text);
        } catch(e) {
            if (e instanceof SyntaxError) {
                goodText = false;
            } else {
                throw e;
            }
        }

        return goodText;
    }

    return (
        <td>
          <ValidatedInput
            dummy={props.dummy}
            placeholder={'Want'}
            isValid={validProg}
            onValid={(text) => props.wantChange(parseCheck(text))}
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
            function lookup(args, env) {
                if (args.length !== table.params.length) {
                    throw new Error('Arity Mismatch, expected ' + table.params.length + ' argument' + (table.params.length === 1 ? '' : 's'));
                }

                let interpArgs = args.map((arg) => interp(arg, env));

                let expr = table.examples.reduce((acc, example) => {
                    if (acc !== undefined) {
                        return acc;
                    }

                    // I have no idea what should happen if this is called on a table with no params
                    if (example.inputs.reduce((acc, input, i) => {
                        // like my pun?
                        let INterped = interp(input.prog, env);
                        return acc && deepEquals(INterped, interpArgs[i]);

                    }, true)) {
                        if (example.want === yellow) {
                            throw new ReferenceError(`(${table.name} ${interpArgs.map(unParse).join(' ')}) doesn't have a want`);
                        } else {
                            return interp(example.want, env);
                        }
                    }

                    return undefined;
                }, undefined);

                if (expr === undefined) {
                    // it's like a reference error in the super meta table language
                    throw new ReferenceError(interpArgs.map(unParse).join() + ' is not an example in ' + table.name);
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
                    } else if (!example.inputs.every((input) => input.prog !== yellow) || formula.prog === yellow) { // if any inputs or the formula aren't initialized
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

            if (table.name === yellow || !table.params.every((param) => param.name !== yellow)) { // if the table or any of the table's parameters don't have a name yet, don't calculate
                // I should probably change this at some point, as it is it pretty much overwrites all outputs if a new parameter is added, although I guess it would do that anyway because of how init inputs are treated
                let formulas = table.formulas.map((formula) => ({...formula, outputs: Array(table.examples.length).fill(yellow)}));
                return {...table,
                        formulas};
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
        console.log(calkedProg);
        //console.log('next key: ', peekKey());
        //console.log(toBSL(calkedProg));
        this.setState((state) => {
            return {tables: calkedProg};
        });
    }

    render(){
        return (
            <div>
              <Succinct
                tables={this.state.tables}
                programChange={this.programChange}
              />
              <textarea
                rows={10}
                cols={50}
                className='bsl_io'
                readOnly={true}
                value={toBSL(this.state.tables)}
              />
            </div>
        );
    }
}

export default App;
