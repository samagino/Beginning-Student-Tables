
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
    const varRE = /^[^\s",'`()[\]{}|;#]+/; // except numbers
    const appRE = /^\(/;
    const numRE = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?=$|[\s",'`()[\]{}|;#])/; // this one doesn't permit fractions
    const boolRE = /^#(?:[tfTF]|true|false)(?=$|[\s",'`()[\]{}|;#])/;
    const strRE = /^"[^\\"]*"/; // TODO: handle backslash escape
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
        let rest = text.slice(boolStr.length).trim();
        let bool = {value: boolStr[1].toLowerCase() === 't', type: RBOOL_T};

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
        return parseQ(text.slice(1).trim());
    }

    throw new SyntaxError('Invalid Syntax: "' + text + '"');
}

// String -> {prog: Program, rest: String}
// parses quoted expressions
function parseQ(text) {
    const symRE = /^[^\s",'`()[\]{}|;#]+/; // except numbers
    const listRE = /^\(/;
    const numRE = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?=$|[\s",'`()[\]{}|;#])/; // this one doesn't permit fractions
    const boolRE = /^#(?:[tfTF]|true|false)(?=$|[\s",'`()[\]{}|;#])/;
    const strRE = /^"[^\\"]*"/;


    if (listRE.test(text)) {
        text = text.slice(1).trim(); // remove quote, open paren
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
        let rest = text.slice(boolStr.length).trim();
        let bool = {value: boolStr.charAt(1).toLowerCase() === 't', type: RBOOL_T};

        return {prog: bool, rest: rest};

    } else if (strRE.test(text)) {
        let matches = text.match(strRE);
        let str = {value: matches[0], type: RSTRING_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: str, rest: rest};

    } else if (symRE.test(text)) {
        let matches = text.match(symRE);
        let value = matches[0];
        let sym = {value: '\'' + value, type: RSYM_T}; // TODO value should not be stored with apostrophe
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
        return lookup(prog.value);
    case RFUNCT_T:
        return prog;
    case RAPP_T:
        // interpret function (valof rator env)
        let funct = interp(prog.value.funct, env);
        // interpret arguments (valof rand env)
        let args = prog.value.args.map((arg) => interp(arg, env));

        typeCheck(funct, RFUNCT_T);

        return funct.value(args);

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

function plus(args) {
    args.forEach((cur) => typeCheck(cur, RNUM_T));

    return args.reduce((acc, cur) => {
        return {value: acc.value + cur.value,
                type: RNUM_T};
    });
}
function minus(args) {
    args.forEach((cur) => typeCheck(cur, RNUM_T));

    return args.reduce((acc, cur) => {
        return {value: acc.value - cur.value,
                type: RNUM_T};
    });
}
function times(args) {
    args.forEach((cur) => typeCheck(cur, RNUM_T));

    return args.reduce((acc, cur) => {
        return {value: acc.value * cur.value,
                type: RNUM_T};
    });
}
function divide(args) {
    if (args.length === 1) {
        let firstArg = args[0];

        typeCheck(firstArg, RNUM_T);

        return {value: 1 / firstArg.value,
                type: RNUM_T};
    } else if (args.length === 2) {
        let firstArg = args[0];
        let secondArg = args[1];

        typeCheck(firstArg, RNUM_T);
        typeCheck(secondArg, RNUM_T);

        return {value: firstArg.value / secondArg.value,
                type: RNUM_T};
    }

    args.forEach((cur) => typeCheck(cur, RNUM_T));
    return {value: false, type: RBOOL_T};
}
function car(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];

    typeCheck(firstArg, RLIST_T);

    return firstArg.value.a;
}
function cdr(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];

    typeCheck(firstArg, RLIST_T);

    return firstArg.value.d;
}
function cons(args) {
    if (args.length !== 2) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];

    // because BSL
    typeCheck(secondArg, RLIST_T);

    return {value: {a: firstArg, d: secondArg},
            type: RLIST_T};
}
function list(args) {
    return args.reverse().reduce((acc, arg) => ({value: {a: arg, d: acc},
                                                       type: RLIST_T}),
                                       {value: null,
                                        type: RLIST_T});
}
function not(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];

    return {value: firstArg.value === false,
            type: RBOOL_T};
}
function iseqv(args) {
    if (args.length !== 2) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];

    return {value: firstArg.value === secondArg.value,
            type: RBOOL_T};
}
function and(args) {
    return args.reduce((acc, cur) => {
        return acc.value !== false ? cur : {value: false, type: RBOOL_T};
    }, {value: true, type: RBOOL_T});

}
function or(args) {
    return args.reduce((acc, cur) => {
        return acc.value !== false ? acc : cur;
    }, {value: true, type: RBOOL_T});

}
function rif(args) {
    if (args.length !== 3) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];
    let thirdArg = args[2];

    typeCheck(firstArg, RBOOL_T);

    return firstArg.value ? secondArg : thirdArg;
}
function isnull(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];

    return {value: firstArg.value === null && firstArg.type === RLIST_T,
            type: RBOOL_T};
}
function equalsign(args) {
    args.forEach((cur) => typeCheck(cur, RNUM_T));

    let val = args.reduce((acc, cur) => {

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
function gtsign(args) {
    args.forEach((cur) => typeCheck(cur, RNUM_T));

    let val = args.reduce((acc, cur) => {

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
function gesign(args) {
    args.forEach((cur) => typeCheck(cur, RNUM_T));

    let val = args.reduce((acc, cur) => {

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
function ltsign(args) {
    args.forEach((cur) => typeCheck(cur, RNUM_T));

    let val = args.reduce((acc, cur) => {

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
function lesign(args) {
    args.forEach((cur) => typeCheck(cur, RNUM_T));

    let val = args.reduce((acc, cur) => {

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

export {interp, parseCheck, unParse, initEnv, RVAR_T, RAPP_T, RFUNCT_T, RNUM_T, RBOOL_T, RSTRING_T, RLIST_T, RSYM_T};
