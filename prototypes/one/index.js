//import React from 'react';
//import ReactDOM from 'react-dom';
//import './colors.css';

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
    {name: 'cdr', binding: {type: RFUNCT_T,
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
        let variable = {value: name, type: RVAR_T};

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

        let app = {value: {funct: funct, args: args}, type: RAPP_T};
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

    throw new SyntaxError('Invalid Syntax: \"' + text + '\"');
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
            return '(cons ' + unParse(prog.value.a) + ' ' + unParse(prog.value.d) + ')';
        }
    case RSYM_T:
        return prog.value;
    case RVAR_T:
        return 'variable';
    case RFUNCT_T:
        return 'function';
    case RAPP_T:
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

/*****************************
  Universal Constants I Want
*****************************/
// value to put in child formulas that don't have an output for that row
const gray = {gray: 'gray'};
// value to put in child formulas that have an error output for that row (non-boolean)
const pink = {pink: 'pink'};
// image path
const imgPath = './images/';

const initParam = 'n';
const initOutExpr = {value: '"hi there"', type: RSTRING_T};
const initTableName = 'table';

const initInProg = {value: 0, type: RNUM_T};
const initFProg = {...initInProg};
const initWantProg = {value: 1234, type: RNUM_T};

let keyCount = 0;


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

    return progs.every((prog) => prog.type == RBOOL_T || prog == gray);
}

function isBooleanFormula(formula) {
    return allBools(formula.outputs) || formula.thenChildren != undefined;
}

// Number
// returns a unique key
function getKey() {
    return keyCount++;
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
    if (proga.type == RAPP_T) {
        if (proga.value.args.length != progb.value.args.length) {
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
class ValidatedInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {text: '',
                      className: 'error_input'};

        this.textChange = this.textChange.bind(this);
        this.getSize = this.getSize.bind(this);
        this.checkEmpty = this.checkEmpty.bind(this);
    }

    textChange(e) {
        let text = e.target.value;

        if (this.props.isValid(text)) {
            this.setState((state) => ({...state,
                                       text: text,
                                       className: 'default_input'}));
            this.props.onValid(text);
        } else {
            this.setState((state) => ({...state,
                                       text: text,
                                       className: 'error_input'}));
        }
            
    }

    checkEmpty() {
        if (this.state.text == '') {
            this.props.onEmpty();
        }
    }

    getSize() {
        if (this.state.text.length == 0) {
            return this.props.placeholder.length;
        } 
        const minSize = 4;
        return Math.max(this.state.text.length, minSize);
    }

    render() {
        return (
            <input
              className={this.state.className}
              size={this.getSize()}
              placeholder={this.props.placeholder}
              type={'text'}
              value={this.state.text}
              onChange={this.textChange}
              onBlur={this.checkEmpty}
            />
        );
    }
}

function InputUndX(props) {
    return (
        <span className='full_cell'>
          <span className='input_part'>
            <ValidatedInput
              placeholder={props.placeholder}
              isValid={props.isValid}
              onValid={props.onValid}
              onEmpty={props.onEmpty}
            />
          </span>
          <span className='button_part'>
            <RemButton
              title={props.title}
              onClick={props.onClick}
            />
          </span>
        </span>
    );
}

/*** Table Sections ***/
// let's put everything in one table woo
// state contains table name
function Succinct(props) {
    function tableChange(oldTab, newTab) {
        const alteredTabs = props.tables.map((table) => table == oldTab ? newTab : table);
        props.programChange(alteredTabs);
    }

    function addTable() {
        const tableNum = props.tables.length;

        const newTab = {examples: [{inputs: [{prog: initInProg, key: getKey()}], want: initWantProg, key: getKey()}],
                        formulas: [{prog: initFProg, outputs: [initOutExpr], key: getKey()}],
                        params: [{name: initParam, key: getKey()}],
                        name: 'table' + tableNum,
                        key: getKey()};

        props.programChange([...props.tables, newTab]);
    }

    function remTable(deadTab) {
        const aliveTabs = props.tables.filter((table) => table != deadTab);
        props.programChange(aliveTabs);
    }

    // String -> Boolean
    function validName(text, modTab) {
        function lookup(name, env) {
            return env.reduce((acc, variable) => {
                if (acc) {
                    return true;
                }

                return variable.name == name;

            }, false);
        }

        let tableVars = props.tables.filter((table) => table != modTab).map((propTab) => ({name: propTab.name, binding: null}));
        let paramVars = modTab.params.map((param) => ({name: param, binding: null}));
        let env = [...initEnv, ...tableVars, ...paramVars];

        const varRE = /^[a-zA-Z\+\-\*\/\?=><]+$/; // change me

        return varRE.test(text) && !lookup(text, env);
    }

    function nameChange(text, oldTab) {
        const alteredTab = {...oldTab, name: text};
        const alteredTabs = props.tables.map((table) => table == oldTab ? alteredTab : table);
        props.programChange(alteredTabs);
    }

    function emptyName(oldTab) {
        const alteredTab = {...oldTab, name: initTableName};
        const alteredTabs = props.tables.map((table) => table == oldTab ? alteredTab : table);
        props.programChange(alteredTabs);
        
    }

    return (
        <div>
          <AddButton
            onClick={addTable}
            style={{float: 'right'}}
            title={'Add a table'} />
          {props.tables.map((table, i) => (
              <div key={table.key} className='table_method' >
                  <InputUndX
                    placeholder={'Table Name'}
                    isValid={(text) => validName(text, table)}
                    onValid={(text) => nameChange(text, table)}
                    onEmpty={() => emptyName(table)}
                    onClick={() => remTable(table)}
                    title={'Remove this table'}
                  />
                <SuccinctTab
                  table={table}
                  tableNames={props.tables.map((table) => table.name)}
                  tableChange={(newTab) => tableChange(table, newTab)}
                />
              </div>
          ))}
        </div>
    );
}

function SuccinctTab(props) {
    function paramsChange(params) {
        props.tableChange({...props.table, params: params});
    }

    function paramsExamplesChange(params, examples) {
        props.tableChange({...props.table, params: params, examples: examples});
    }

    function formulasChange(formulas) {
        props.tableChange({...props.table, formulas: formulas});
    }

    function examplesChange(examples) {
        props.tableChange({...props.table, examples: examples});
    }

    return (
        <table className={'html_table'}>
          <SuccinctHead
            params={props.table.params}
            examples={props.table.examples}
            tableNames={props.tableNames}
            paramsChange={paramsChange}
            paramsExamplesChange={paramsExamplesChange}

            formulas={props.table.formulas}
            formulasChange={formulasChange}
          />
          <SuccinctBody
            examples={props.table.examples}
            formulas={props.table.formulas}
            paramNames={props.table.params.map((param) => param.name)}
            examplesChange={examplesChange}
            formulasChange={formulasChange}
          />
        </table>
    );
}

function SuccinctHead(props) {
    function addFormula() {
        const newForm = {prog: initFProg,
                         outputs: [initOutExpr],
                         key: getKey()};
        props.formulasChange([...props.formulas, newForm]);
    }

    function remFormula(deadForm) {
        const aliveForms = props.formulas.filter((formula) => formula != deadForm);
        props.formulasChange(aliveForms);
    }

    function formulaChange(newForm, oldForm) {
        const alteredForms = props.formulas.map((form) => form == oldForm ? newForm : form);
        props.formulasChange(alteredForms);
    }

    function maxDepth(formula, curMax) {
        if (!isBooleanFormula(formula)) {
            return curMax;
        } else {
            return formula.thenChildren.reduce((acc, child) => Math.max(acc, maxDepth(child, curMax + 1)), curMax + 1);
        }
    }


    // Number -> [Number]
    // takes a number, returns an array that counts from 1 to that number, input of 0 gives empty array
    // e.g. countUp(5) -> [1, 2, 3, 4, 5]
    function countUp(num) {
        // special case: want an empty array for 0
        if (num == 0) {
            return [];
        } else if (num == 1)
            return [1];
        else
            return [...countUp(num - 1), num];
    }

    const abyss = props.formulas.reduce((acc, formula) => Math.max(acc, maxDepth(formula, 0)), 0);
    const numParams = props.params.length;

    return (
        <thead>
          <tr>
            <Parameters
              params={props.params}
              examples={props.examples}
              tableNames={props.tableNames}
              paramsChange={props.paramsChange}
              paramsExamplesChange={props.paramsExamplesChange}
            />
            {/* top level formulas */}
        {props.formulas.map((formula) => (
            <DepictFormula
              key={formula.key}
              formula={formula}
              depth={0}
              kill={() => remFormula(formula)}
              formulaChange={(newForm) => formulaChange(newForm, formula)}
            />
        ))}
            <th>
              <AddButton
                title={'Add a formula'}
                onClick={addFormula}
              />
            </th>
          </tr>
          {/* rest of formulas */}
          {countUp(abyss).map((depth) => (
              <tr key={depth}>
                <th>{/* empty cell to align with example RemButtons */}</th>
                <th colSpan={numParams + 1}>{/* empty cell to align with parameters */}</th>
                {props.formulas.map((formula) => (
                    <DepictFormula
                      key={formula.key}
                      formula={formula}
                      depth={depth}
                      kill={() => remFormula(formula)}
                      formulaChange={(newForm) => formulaChange(newForm, formula)}
                    />
                ))}
              </tr>
          ))}
        </thead>
    );
}

function Parameters(props) {
    function validParam(text, modParam) {
        function lookup(name, env) {
            return env.reduce((acc, variable) => {
                if (acc) {
                    return true;
                }

                return variable.name == name;

            }, false);
        }

        // These are not technically Variables, see note above
        let paramVars = props.params.filter((param) => param != modParam).map((param) => ({name: param.name, binding: null}));
        let tableVars = props.tableNames.map((name) => ({name: name, binding: null}));
        let env = [...initEnv, ...tableVars, ...paramVars];

        const varRE = /^[a-zA-Z\+\-\*\/\?=><]+$/; // change me

        return varRE.test(text) && !lookup(text, env);
    }

    function addParam() {
        const newParam = {name: initParam, key: getKey()};

        // need to maintain #inputs = #params
        const modExamples = props.examples.map((example) => ({...example,
                                                              inputs: [...example.inputs, {prog: initInProg, key: getKey()}]}));

        props.paramsExamplesChange([...props.params, newParam], modExamples);

    }

    function remParam(deadParam) {
        const deadIndex = props.params.indexOf(deadParam);
        const aliveParams = props.params.filter((param) => param != deadParam);

        // need to maintain #inputs = #params
        const modExamples = props.examples.map((example => ({...example,
                                                             inputs: example.inputs.filter((_, i) => i != deadIndex)})));

        props.paramsExamplesChange(aliveParams, modExamples);
    }

    function nameChange(text, modParam) {
        const alteredParam = {...modParam, name: text};
        const alteredParams = props.params.map((param) => param == modParam ? alteredParam : param);
        props.paramsChange(alteredParams);
    }

    function emptyName(modParam) {
        const alteredParam = {...modParam, name: initParam};
        const alteredParams = props.params.map((param) => param == modParam ? alteredParam : param);
        props.paramsChange(alteredParams);
    }

    return (
        <React.Fragment>
          <th>{/* empty cell to align with example RemButtons */}</th>
          <React.Fragment>
            {props.params.map((param) => (
                <th key={param.key} >
                  <InputUndX
                    placeholder={'Parameter'}
                    isValid={(text) => validParam(text, param)}
                    onValid={(text) => nameChange(text, param)}
                    onEmpty={() => emptyName(param)}

                    onClick={() => remParam(param)}
                    title={'Remove this parameter'}
                  />
                </th>
            ))}
            <th>
              <AddButton
                onClick={addParam}
                title={'Add a parameter'}
              />
            </th>
          </React.Fragment>
        </React.Fragment>
    );
}

/*
  props: formula, depth, kill, formulaChange
*/
function DepictFormula(props) {
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

    function progChange(text) {
        const alteredForm = {...props.formula, prog: parseCheck(text)};
        props.formulaChange(alteredForm);
    }

    function emptyForm() {
        const alteredForm = {...props.formula, prog: initFProg};
        props.formulaChange(alteredForm);
    }

    // this is pretty macabre...
    function remChild(deadChild) {
        const aliveChildren = props.formula.thenChildren.filter((child) => child != deadChild);
        props.formulaChange({...props.formula, thenChildren: aliveChildren});
    }

    function addChild() {
        // this is happier
        const newChild = {prog: initFProg,
                          outputs: [initOutExpr],
                          thenChildren: [],
                          key: getKey()};
        const children = [...props.formula.thenChildren, newChild];
        props.formulaChange({...props.formula, thenChildren: children});
    }

    function childChange(newChild, modChild) {
        const children = props.formula.thenChildren.map((child) => child == modChild ? newChild : child);
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
                       kill={() => remChild(child)}
                       formulaChange={(formula) => childChange(formula, child)}
                     />))}
                 <th>{/* empty cell to align with child input */}</th>
               </React.Fragment>
               : <script/> }
            </React.Fragment>
        );
    } else if (props.depth == 1) {
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
                       kill={() => remChild(child)}
                       formulaChange={(formula) => childChange(formula, child)}
                     />))}
                 <DepictDummy
                   addThing={addChild}
                 />
               </React.Fragment>
               : <script/> }
            </React.Fragment>
        );
    } else {
        return (
            <React.Fragment>
              <th colSpan={countWidth(props.formula)} >
                <InputUndX
                  placeholder={'Formula'}
                  isValid={validProg}
                  onValid={progChange}
                  onEmpty={emptyForm}

                  title={'Remove formula'}
                  onClick={props.kill}
                />
              </th>
            </React.Fragment>
        );
    }
}

function DepictDummy(props) {
    return (
        <td>
          <AddButton
            title={'Add a thing'}
            onClick={props.addThing}
          />
        </td>
    );
}

function SuccinctBody(props) {
    function addExample() {
        const inputs = props.paramNames.map((param) => ({prog: initInProg, key: getKey()}));
        const newExample = {inputs: inputs,
                            want: initWantProg,
                            key: getKey()};
        props.examplesChange([...props.examples, newExample]);
    }

    function remExample(deadExample) {
        const aliveExamples = props.examples.filter((example) => example != deadExample);
        props.examplesChange(aliveExamples);
    }

    function inputsChange(inputs, modExample) {
        const alteredExample = {...modExample, inputs: inputs};
        const alteredExamples = props.examples.map((example) => example == modExample ? alteredExample : example);
        props.examplesChange(alteredExamples);
    }

    function wantChange(want, modExample) {
        const alteredExample = {...modExample, want: want};
        const alteredExamples = props.examples.map((example) => example == modExample ? alteredExample : example);
        props.examplesChange(alteredExamples);
    }

    return (
        <React.Fragment>
          <tbody>
            {props.examples.map((example, i) => (
                <tr key={example.key}>
                  <td>
                    <RemButton
                      onClick={() => remExample(example)}
                      title={'Remove this example'}
                    />
                  </td>
                  <Inputs
                    inputs={example.inputs}
                    inputsChange={(inputs) => inputsChange(inputs, example)}
                  />
                  <td>{/* empty cell to align with param AddButton */}</td>
                  <Outputs
                    formulas={props.formulas}
                    want={example.want}
                    row={i}
                  />
                  <td>{/* empty cell to align with top level formula AddButton */}</td>
                  <Want
                    wantChange={(want) => wantChange(want, example)}
                  />
                </tr>
            ))}
            <tr>
              <td>
                <AddButton
                  onClick={addExample}
                  title={'Add an example'}
                />
              </td>
            </tr>
          </tbody>
        </React.Fragment>
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

    function progChange(text, modInput) {
        const alteredInput = {...modInput, prog: parseCheck(text)};
        const alteredInputs = props.inputs.map((input) => input == modInput ? alteredInput : input);
        props.inputsChange(alteredInputs);
    }

    function emptyInput(modInput) {
        const alteredInput = {...modInput, prog: initInProg};
        const alteredInputs = props.inputs.map((input) => input == modInput ? alteredInput : input);
        props.inputsChange(alteredInputs);
    }

    return (
        <React.Fragment>
          {props.inputs.map((input) => (
              <td key={input.key} >
                <ValidatedInput
                  placeholder={'Input'}
                  isValid={validProg}
                  onValid={(text) => progChange(text, input)}
                  onEmpty={() => emptyInput(input)}
                />
              </td>
          ))}
        </React.Fragment>
    );
}

function Outputs(props) {

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
                  <td>{/* empty cell to align with add child button */}</td>
                 </React.Fragment>
                 : <script/> }
              </React.Fragment>
          ))}
        </React.Fragment>
    );
}

function TestCell(props) {

    if (props.output == gray) {
        return (
           <td className={'gray'}>
           </td>
        );
    }

    if (props.output == pink) {
        return (
            <td className={'pink'}>
            </td>
        );
    }


    let outProg = props.output;

    try {
        var wantProg = interp(props.want, initEnv);
    } catch (e) {
        outProg = e;
    }

    if (outProg instanceof Error) {
        var text = outProg.message;
        var error = true;
    } else {
        text = unParse(outProg);
        error = false;
    }

    if (error) {
        var img = <img
                    src={imgPath + 'frowneyface.png'}
                    style={{float: 'right'}}
                    title={"Oh no! You got an error!"}/>;
    } else if (deepEquals(outProg, wantProg)) {
        img =  <img
                 src={imgPath + 'smileyface.png'}
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

    function wantChange(text) {
        props.wantChange(parseCheck(text));
    }

    function emptyWant() {
        props.wantChange(initWantProg);
    }

    return (
        <td>
          <ValidatedInput
            placeholder={'Want'}
            isValid={validProg}
            onValid={wantChange}
            onEmpty={emptyWant}
          />
        </td>
    );
}

/*
  notes:
  #inProgs == #params
  #outExprs == #examples (well not for child fexprs)
  -----------------------
  |#inProgs != #outExprs|
  -----------------------
*/

class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {program: [{examples: [{inputs: [{prog: initInProg, key: getKey()}], want: initWantProg, key: getKey()}], // rows
                                 formulas: [{prog: initFProg, outputs: [initOutExpr], key: getKey()}],       // formula columns
                                 params: [{name: initParam, key: getKey()}],                                                   // parameter columns
                                 name: 'table',                                                                                // table name (used for recursion)
                                 key: getKey()}]};
        
        this.programChange = this.programChange.bind(this);
    }

    calculate(program) {
        function makeLookup(table) {
            function lookup(args, env) {
                if (args.length != table.params.length) {
                    throw new Error('Arity Mismatch, expected ' + table.params.length + ' argument' + (table.params.length == 1 ? '' : 's'));
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
                        return interp(example.want, env);
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
                    if (example == gray) {
                        return gray;
                    } else if (example == pink) {
                        return pink;
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

                if (allBools(outputs) || (formula.thenChildren != undefined && formula.thenChildren.length != 0)) {
                    function grayOrPink(example, output) {
                        if (example == gray || output.value === false)
                            return gray;
                        else if (typeof output.value != 'boolean')
                            return pink;
                        else
                            return example;
                    }

                    if (formula.thenChildren == undefined) {
                        var thenChildren = [];
                    } else {
                        let subExamples = examples.map((example, i) => grayOrPink(example, outputs[i]));
                        thenChildren = formula.thenChildren.map((formula) => calcFormula(formula, subExamples));
                    }

                    return {...formula,
                            outputs: outputs,
                            thenChildren: thenChildren};
                } else {
                    let newFormula = {...formula,
                                      outputs: outputs};
                    delete newFormula.thenChildren;
                    return newFormula;
                }

            }

            let formulas = table.formulas.map((formula) => calcFormula(formula, table.examples));
            return {...table,
                    formulas: formulas};

        }

        let tables = program.map(calcTable);
        return tables;
    }

    programChange(newProg) {
        let calkedProg = this.calculate(newProg);
        //console.log(calkedProg);
        this.setState((state) => ({program: calkedProg}));
    }
    
    render(){
        return (
            <div>
              <Succinct
                tables={this.state.program}
                programChange={this.programChange}
              />
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
