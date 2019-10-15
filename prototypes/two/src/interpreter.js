// for typeCheck Error messages
import React from 'react';
import {makeCircle, makeRectangle, makeEquiTriangle,
        makeBeside, makeAbove, makeOverlay,
        makePlace, emptyScene, makeColor,
        paint} from './image.js';

/****************
   Interpreter
****************/

const RVAR_T =    0;
const RAPP_T =    1;
const RFUNCT_T =  2;
const RNUM_T =    3;
const RBOOL_T =   4;
const RSTRING_T = 5;
const RLIST_T =   6;
const RSYM_T =    7;
const RIMAGE_T =  8;
const RCOLOR_T =  9;
const RIF_T =     10;
const RSTRUCT_T = 11;
const RCLOS_T =   12;

const varRE = /^[^\s",'`()[\]{}|;#]+/; // except numbers
const appRE = /^\(/;
const numRE = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?=$|[\s",'`()[\]{}|;#])/; // this one doesn't permit fractions
const boolRE = /^#(?:[tfTF]|true|false)(?=$|[\s",'`()[\]{}|;#])/;
const strRE = /^"[^\\"]*"/; // TODO: handle backslash escape
const quoteRE = /^'/;
const symRE = /^[^\s",'`()[\]{}|;#]+/; // except numbers
const listRE = /^\(/;

const protoEnv = [
    // functions
    {name: '+', binding: {type: RFUNCT_T,
                          value: plus}},
    {name: 'add1', binding: {type: RFUNCT_T,
                          value: add1}},
    {name: '-', binding: {type: RFUNCT_T,
                          value: minus}},
    {name: 'sub1', binding: {type: RFUNCT_T,
                          value: sub1}},
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
    {name: 'eqv?', binding: {type: RFUNCT_T,
                             value: iseqv}},
    {name: 'null?', binding: {type: RFUNCT_T,
                              value: isnull}},
    {name: 'empty?', binding: {type: RFUNCT_T,
                               value: isnull}},
    {name: 'cons?', binding: {type: RFUNCT_T,
                               value: iscons}},
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
    {name: 'string-length', binding: {type: RFUNCT_T,
                           value: stringLength}},
    {name: 'string-append', binding: {type: RFUNCT_T,
                           value: stringAppend}},
    {name: 'string=?', binding: {type: RFUNCT_T,
                                 value: isstrequal}},
    {name: 'circle', binding: {type: RFUNCT_T,
                               value: circle}},
    {name: 'rectangle', binding: {type: RFUNCT_T,
                               value: rectangle}},
    {name: 'square', binding: {type: RFUNCT_T,
                               value: square}},
    {name: 'triangle', binding: {type: RFUNCT_T,
                               value: triangle}},
    {name: 'beside', binding: {type: RFUNCT_T,
                               value: beside}},
    {name: 'beside/align', binding: {type: RFUNCT_T,
                               value: besideAlign}},
    {name: 'above', binding: {type: RFUNCT_T,
                               value: above}},
    {name: 'above/align', binding: {type: RFUNCT_T,
                               value: aboveAlign}},
    {name: 'overlay', binding: {type: RFUNCT_T,
                               value: overlay}},
    {name: 'overlay/align', binding: {type: RFUNCT_T,
                               value: overlayAlign}},
    {name: 'place-image', binding: {type: RFUNCT_T,
                                    value: placeImage}},
    {name: 'empty-scene', binding: {type: RFUNCT_T,
                                    value: empty_Scene}},
    {name: 'color', binding: {type: RFUNCT_T,
                              value: color}},
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

// put posn in initEnv becaouse why not
const initEnv = makeStruct('posn', ['x', 'y'], protoEnv);

// String -> {prog: Program, rest: String}
// parses all expressions except quoted expressions
function parse(text) {
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
        let value = matches[0].substring(1, matches[0].length - 1); // trim off quotes
        let str = {value: value, type: RSTRING_T};
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

        let app;
        if (funct.value === 'or') {
            if (args.length === 2) {
                app = {value: {tst: args[0], els: args[1], thn: {value : true, type : RBOOL_T} }, type: RIF_T};
            }
            else if (args.length < 2) {
                throw new SyntaxError('Invalid Syntax: "' + text + '"');
            }
            else {
                // should have a loop here
                throw new SyntaxError('Invalid Syntax: "' + text + '"');
            }
        }
        else if (funct.value === 'and') {


         if (args.length === 2) {
                app = {value: {tst: args[0], thn: args[1], els: {value : false, type : RBOOL_T} }, type: RIF_T};
            }
            else if (args.length < 2) {
                throw new SyntaxError('Invalid Syntax: "' + text + '"');
            }
            else {
                // should have a loop here
                throw new SyntaxError('Invalid Syntax: "' + text + '"');
            }
        }
        else if (funct.value === 'if') {
            if (args.length === 3) {
                app = {value: {tst: args[0], thn: args[1], els: args[2]}, type: RIF_T};
            }
            else {
                throw new SyntaxError('Invalid Syntax: "' + text + '"');
            }
        } else {
            app = {value: {funct: funct, args: args}, type: RAPP_T};
        }
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
        let value = matches[0].substring(1, matches[0].length - 1); // trim off quotes
        let str = {value: value, type: RSTRING_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: str, rest: rest};

    } else if (symRE.test(text)) {
        let matches = text.match(symRE);
        let value = matches[0];
        let sym = {value: value, type: RSYM_T};
        let rest = text.slice(matches[0].length).trim();

        return {prog: sym, rest: rest};
    }

    throw new SyntaxError('Invalid Syntax: "' + text + '"');
}

// String -> [PrefixProg]
function parsePrefix (text) {
    const commentRE = /;.*/g;
    const defStructRE = /^\(\s*define-struct(?=$|[\s",'`()[\]{}|;#])/;
    const defineRE = /^\(\s*define(?=$|[\s",'`()[\]{}|;#])/;
    const nameRE = /^(?!-?(?:\d+(?:\.\d*)?|\.\d+)(?=$|[\s",'`()[\]{}|;#]))[^\s",'`()[\]{}|;#]+/;

    text = text.replace(commentRE, '');
    text = text.trim();

    let progs = [];

    while(text !== '') {
        let parsed = parsePrefixExpr(text);

        text = parsed.rest;
        progs = [...progs, parsed.prog];
    }

    return progs;

    // Text -> {prog: PrefixProg, rest: String}
    function parsePrefixExpr (text) {
        if (defStructRE.test(text)) {
            const openRE = /[([]/;

            text = text.slice(text.match(defStructRE)[0].length).trim();

            if (!nameRE.test(text)) {
                throw new Error('Invalid Struct Name');
            }

            let superID = text.match(nameRE)[0];
            text = text.slice(superID.length).trim();

            if (!openRE.test(text)) {
                throw new Error('Invalid Struct Definition');
            }

            let fieldOpen = text.match(openRE)[0];
            text = text.slice(fieldOpen.length).trim();

            let fieldClose;
            if (fieldOpen === '(') {
                fieldClose = ')';
            } else if (fieldOpen === '[') {
                fieldClose = ']';
            }

            let fieldIDs = [];
            while (text[0] !== fieldClose) {
                if (!nameRE.test(text)) {
                    throw new Error('Invalid Field Name');
                }

                let fieldID = text.match(nameRE)[0];

                text = text.slice(fieldID.length);
                text = text.trim();

                fieldIDs = [...fieldIDs, fieldID];
            }

            text = text.slice(1).trim();

            if (text[0] !== ')') {
                throw new Error('Invalid Struct Definition');
            }
            text = text.slice(1).trim();

            return {prog: {superID, fieldIDs, type: 'struct'}, rest: text}
        } else if (defineRE.test(text)) {
            const closRE = /^\(/;

            text = text.slice(text.match(defineRE)[0].length).trim();

            let name,
                binding;
            if (nameRE.test(text)) {    // not function definition
                name = text.match(nameRE)[0];
                text = text.slice(name.length).trim();

                let parsed = parse(text);

                binding = parsed.prog;
                text = parsed.rest.trim();

            } else if (closRE.test(text)) {
                text = text.slice(text.match(closRE)[0].length).trim();

                if (!nameRE.test(text)) {
                    throw new Error(`Invalid Prefix Form: ${text}`);
                }

                name = text.match(nameRE)[0];
                text = text.slice(name.length).trim();

                let parameters = [];
                while (text[0] !== ')') {
                    if (!nameRE.test(text)) {
                        throw new Error(`Invalid Prefix Form: ${text}`);
                    }
                    let param = text.match(nameRE)[0];
                    text = text.slice(param.length).trim();
                    parameters = [...parameters, param];
                }

                text = text.slice(1).trim();

                let parsed = parse(text);

                let body = parsed.prog;

                text = parsed.rest;
                text = text.trim();

                binding = {value: {parameters, body}, type: RCLOS_T}
            } else {
                throw new Error(`Invalid Prefix Form: ${text}`);
            }

            if (text[0] !== ')') {
                throw new Error(`Invalid Prefix Form: ${text}`);
            }

            text = text.slice(1).trim();

            return {prog: {name, binding, type: 'define'}, rest: text};

        } else {
            throw new Error(`Invalid Prefix Form: ${text}`);
        }
    }
}

/***
    Environment: [Variable]
    Variable:    {name:    String,
                  binding: Program}
***/

// Program, Environment -> Program
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
        case RCLOS_T:
            // put environment in there and stuff
            return {value: {parameters: prog.value.parameters, body: prog.value.body, env: env}, type: RCLOS_T};
        case RIF_T:
            let tst = interp(prog.value.tst, env);
            typeCheck(tst, [RBOOL_T]);

            if (tst.value) {
                return interp(prog.value.thn, env);
            }
            else {
                return interp(prog.value.els, env);
            }

        case RAPP_T:
            let name = 'anonymous';
            if (isRVAR(prog.value.funct)) {
                name = prog.value.funct.value; // that's a lot of .s
            }

            // interp operator (valof rator env)
            let rator = interp(prog.value.funct, env);

            // interpret arguments (valof rand env)
            let rands = prog.value.args.map((arg) => interp(arg, env));
            switch(rator.type) {
                case RFUNCT_T:
                    return rator.value(rands);
                case RCLOS_T:
                    if (rands.length !== rator.value.parameters.length) {
                        throw new Error (`Arity Mismatch: ${name} expects ${rator.value.parameters.length} arguments but got ${rands.length}`);
                    }

                    let extedEnv = [...rator.value.env, ...rator.value.parameters.map((name, i) => ({name, binding: rands[i]}))];
                    return interp(rator.value.body, extedEnv);
                default:
                    typeCheck(rator, [RFUNCT_T]);
            }

            // this break only exists to make the js syntax checker stop complaining
            break;
        case RIMAGE_T:
            return prog;
        case RCOLOR_T:
            return prog;

        default:
            //console.log(prog);
            throw new TypeError("Unknown Type " + prog.value);
    }
}

// [PrefixProgram], Environment -> Environment
function interpPrefix (progs, env) {
    let ext = progs.reduce((curEnv, prog) => {
        switch (prog.type) {
            case 'struct':
                return makeStruct(prog.superID, prog.fieldIDs, curEnv);
            case 'define':
                return makeDefine(prog.name, prog.binding, curEnv);
            default:
                throw new Error('Invalid Prefix Prog');

        }
    }, env);

    return ext;
}

// String, Program, Environment -> Environment
function makeDefine (name, binding, env) {
    switch (binding.type) {
        case RCLOS_T: // TODO: make recursion work
            let closVar = {name, binding: interp(binding, env)};
            return [...env, closVar];
        default:
            let def = {name, binding: interp(binding, env)};
            return [...env, def];
    }
}

// Program -> [(String or SVG)]
function unparse_cons(prog) {
    switch (prog.type) {
        case RNUM_T:
            return [prog.value];
        case RBOOL_T:
            return ['#' + prog.value];
        case RSTRING_T:
            return [`"${prog.value}"`];
        case RLIST_T:
            if (prog.value === null) {
                return ['\'()'];
            } else {
                return ['(cons ', ...unparse_cons(prog.value.a), ' ', ...unparse_cons(prog.value.d), ')'];
            }
        case RSYM_T:
            return ["'" + prog.value];
        case RVAR_T:
            return [prog.value];
        case RFUNCT_T:
            return ['#<procedure>'];
        case RCLOS_T:
            return ['#<user_defined_procedure>'];
        case RAPP_T:
            return ['(', ...unparse_cons(prog.value.funct), ...prog.value.args.map(unparse_cons).reduce((acc, arr) => [...acc, ' ', ...arr], ''), ')'];
        case RIMAGE_T:
            return [paint(prog.value)];
        case RCOLOR_T:
            return ['#<color>'];
        case RSTRUCT_T:
            return [`(make-${prog.value.id}`, ...prog.value.fields.map((field) => unparse_cons(field.binding)).reduce((acc, arr) => [...acc, ' ', ...arr], ''), ')'];
        default:
            //console.log(prog);
            return 'error or something';
    }
}

// Program -> [(String or SVG)]
function unparse_list (prog) {
    switch (prog.type) {
        case RNUM_T:
            return [prog.value];
        case RBOOL_T:
            return ['#' + prog.value];
        case RSTRING_T:
            return [`"${prog.value}"`];
        case RLIST_T:
            // special case for empty list
            if (prog.value === null) {
                return ['\'()'];
            }

            let elems = [];
            while (prog.value !== null) {
                elems = [...elems, ' ', ...unparse_list(prog.value.a)];
                prog = prog.value.d;
            }

            return ['(list', ...elems, ')'];
        case RSYM_T:
            return ["'" + prog.value];
        case RVAR_T:
            return [prog.value];
        case RFUNCT_T:
            return ['#<procedure>'];
        case RCLOS_T:
            return ['#<user_defined_procedure>'];
        case RAPP_T:
            return ['(', ...unparse_list(prog.value.funct), ...prog.value.args.map(unparse_list).reduce((acc, arr) => [...acc, ' ', ...arr], ''), ')'];
        case RIMAGE_T:
            return [paint(prog.value)];
        case RCOLOR_T:
            return ['#<color>'];
        case RSTRUCT_T:
            return [`(make-${prog.value.id}`, ...prog.value.fields.map((field) => unparse_list(field.binding)).reduce((acc, arr) => [...acc, ' ', ...arr], ''), ')'];
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

// Program -> [Number] -> Error Maybe
// checks if prog is of one of the types in types
function typeCheck(prog, types) {
    // Number -> String
    function getType(type) {
        switch (type) {
        case RVAR_T:
            return 'variable';
        case RAPP_T:
            return 'application';
        case RFUNCT_T:
            return 'function';
        case RCLOS_T:
            return 'closure';
        case RNUM_T:
            return 'number';
        case RBOOL_T:
            return 'boolean';
        case RSTRING_T:
            return 'string';
        case RLIST_T:
            return 'list';
        case RSYM_T:
            return 'symbol';
        case RIMAGE_T:
            return 'image';
        case RCOLOR_T:
            return 'color';
        default:
            return '???';
        }
    }

    if (!types.includes(prog.type)) {
        let typesString = types.map(getType).reduce((acc, type) => acc + ` or a ${type}`);
        let e = new TypeError();
        // shoehorn a non-string into the message field
        // TODO: somehow make this use the approproate unparser maybe
        e.message = <React.Fragment>{[unparse_cons(prog), " ain't a " + typesString]}</React.Fragment>;
        throw e;
    }
}

// Super-Id, [Field-Id], Environment -> Environment
// makes a racket structure according to id and field and appends
// a function to make an id, a function to check if something is an id
// and n functions that each access one of the fields of an id
// to the given environment (and returns it)
function makeStruct(superID, fieldIDs, env) {
    const numFields = fieldIDs.length;

    // [Program] -> Struct
    function construct (args) {
        if (args.length !== numFields) {
            throw new Error(`make-${superID}: arity mismatch, expected ${numFields} arguments but given ${args.length}`);
        }

        let fields = args.map((prog, i) => ({id: fieldIDs[i], binding: prog}));
        return {value: {id: superID, fields}, type: RSTRUCT_T};
    }

    // [Program] -> RBOOL
    function isID (args) {
        if (args.length !== 1) {
            throw new Error(`${superID}?: arity mismatch, expected 1 argument but given ${args.length}`);
        }

        let struct = args[0];

        return {value: struct.type === RSTRUCT_T && struct.value.id === superID,
                type: RBOOL_T};
    }

    let fieldExtractors = fieldIDs.map((fid) => (
        // Struct -> Program
        function (args) {
            if (args.length !== 1) {
                throw new Error(`${superID}-${fid}: arity mismatch, expected 1 argument but given ${args.length}`);
            }

            if (args[0].type !== RSTRUCT_T || args[0].value.id !== superID) {
                throw new Error(`${superID}-${fid}: expects a ${superID}`);
            }

            let struct = args[0].value;

            // hey, it's lookup again!
            return struct.fields.reduce((acc, field) =>  {
                if (acc !== undefined) {
                    return acc;
                } else if (field.id === fid) {
                    //console.log(field);
                    return field.binding;
                } else {
                    return undefined;
                }
            }, undefined);
        }
    ));

    let extedEnv = [{name: `make-${superID}`, binding: {type:  RFUNCT_T,
                                                        value: construct}},
                    {name: `${superID}?`, binding: {type: RFUNCT_T,
                                                    value: isID}},
                    ...fieldExtractors.map((extract, i) => (
                        {name: `${superID}-${fieldIDs[i]}`, binding: {type: RFUNCT_T,
                                                                      value: extract}}
                    ))];

    return [...env, ...extedEnv];
}

/**
 * Type Checking Functions
 * so I don't have to do prog.type === RTYPE_T all the time
 */

function isRVAR (prog) {
    return prog.type === RVAR_T;
}
function isRAPP (prog) {
    return prog.type === RAPP_T;
}
function isRFUNCT (prog) {
    return prog.type === RFUNCT_T;
}
function isRNUM (prog) {
    return prog.type === RNUM_T;
}
function isRBOOL (prog) {
    return prog.type === RBOOL_T;
}
function isRSTRING (prog) {
    return prog.type === RSTRING_T;
}
function isRLIST (prog) {
    return prog.type === RLIST_T;
}
function isRSYM (prog) {
    return prog.type === RSYM_T;
}
function isRIMAGE (prog) {
    return prog.type === RIMAGE_T;
}
function isRCOLOR (prog) {
    return prog.type === RCOLOR_T;
}
function isRIF (prog) {
    return prog.type === RIF_T;
}
function isRSTRUCT (prog) {
    return prog.type === RSTRUCT_T;
}

/************************************
 * Functions in initial Environment *
 ************************************/

function plus(args) {
    if (args.length < 2) {
        throw new Error('arity mismatch');
    }

    args.forEach((arg) => typeCheck(arg, [RNUM_T]));

    return args.reduce((acc, arg) => (
        {value: acc.value + arg.value,
         type: RNUM_T}
    ));
}
function add1(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    typeCheck(args[0], [RNUM_T]);

    return {value: args[0].value + 1,
            type: RNUM_T};
}
function minus(args) {
    if (args.length < 1) {
        throw new Error('arity mismatch');
    }

    args.forEach((arg) => typeCheck(arg, [RNUM_T]));

    if (args.length === 1) {
        return {value: 0 - args[0].value,
                type: RNUM_T};
    }

    return args.reduce((acc, arg) => (
        {value: acc.value - arg.value,
         type: RNUM_T}
    ));
}
function sub1(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    typeCheck(args[0], [RNUM_T]);

    return {value: args[0].value - 1,
            type: RNUM_T};
}
function times(args) {
    if (args.length < 2) {
        throw new Error('arity mismatch');
    }

    args.forEach((arg) => typeCheck(arg, [RNUM_T]));

    return args.reduce((acc, arg) => (
        {value: acc.value * arg.value,
         type: RNUM_T}
    ));
}
function divide(args) {
    args.forEach((arg) => typeCheck(arg, [RNUM_T]));

    if (args.length === 1) {
        let firstArg = args[0];

        typeCheck(firstArg, [RNUM_T]);

        return {value: 1 / firstArg.value,
                type: RNUM_T};
    } else if (args.length === 2) {
        let firstArg = args[0];
        let secondArg = args[1];

        typeCheck(firstArg, [RNUM_T]);
        typeCheck(secondArg, [RNUM_T]);

        return {value: firstArg.value / secondArg.value,
                type: RNUM_T};
    }

    return {value: false, type: RBOOL_T};
}
function car(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];

    typeCheck(firstArg, [RLIST_T]);

    if (firstArg.value === null) {
        throw new Error('expected a cons, but given empty list');
    }

    return firstArg.value.a;
}
function cdr(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];

    if (firstArg.value === null) {
        throw new Error('expected a cons, but given empty list');
    }

    typeCheck(firstArg, [RLIST_T]);

    return firstArg.value.d;
}
function cons(args) {
    if (args.length !== 2) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];

    // because BSL
    typeCheck(secondArg, [RLIST_T]);

    return {value: {a: firstArg, d: secondArg},
            type: RLIST_T};
}
function list(args) {
    // this indentation is pretty jank
    return args.reverse().reduce((acc, arg) => (
        {value: {a: arg, d: acc},
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

} function or(args) {return args.reduce((acc, cur) => {
        return acc.value !== false ? acc : cur;
    }, {value: true, type: RBOOL_T});

}
function isnull(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];

    return {value: firstArg.value === null && firstArg.type === RLIST_T,
            type: RBOOL_T};
}
function iscons(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];

    return {value: firstArg.value !== null && firstArg.type === RLIST_T,
            type: RBOOL_T};
}
function equalsign(args) {
    args.forEach((cur) => typeCheck(cur, [RNUM_T]));

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
    args.forEach((cur) => typeCheck(cur, [RNUM_T]));

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
    args.forEach((cur) => typeCheck(cur, [RNUM_T]));

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
    args.forEach((cur) => typeCheck(cur, [RNUM_T]));

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
    args.forEach((cur) => typeCheck(cur, [RNUM_T]));

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
function isstrequal(args) {
    args.forEach((arg) => typeCheck(arg, [RSTRING_T]));

    let value = args.map((arg) => arg.value).reduce((acc, val) => {

        if (acc === false) {
            return false;
        }

        return acc === val ? acc : false;
    });

    if (value !== false) {
        return {value: true, type: RBOOL_T};
    } else {
        return {value, type: RBOOL_T};
    }
}
function stringLength(args) {
    if (args.length !== 1) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];

    typeCheck(firstArg, [RSTRING_T]);

    return {value: firstArg.value.length,
            type: RNUM_T};
}
function stringAppend(args) {
    if (args.length < 2) {
        throw new Error('arity mismatch');
    }

    args.forEach((arg) => typeCheck(arg, [RSTRING_T]));

    return args.reduce((acc, arg) => (
        {value: acc.value + arg.value,
         type: RSTRING_T}
    ));
}
function circle(args) {
    if (args.length < 3) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];
    let thirdArg = args[2];
    
    typeCheck(firstArg, [RNUM_T]);
    typeCheck(secondArg, [RNUM_T, RSTRING_T, RSYM_T]);
    typeCheck(thirdArg, [RSTRING_T, RSYM_T, RCOLOR_T]);

    let value = makeCircle(firstArg.value, secondArg.value, thirdArg.value);

    return {value, type: RIMAGE_T};
}
function rectangle(args) {
    if (args.length < 4) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];
    let thirdArg = args[2];
    let fourthArg = args[3];

    typeCheck(firstArg, [RNUM_T]);
    typeCheck(secondArg, [RNUM_T]);
    typeCheck(thirdArg, [RNUM_T, RSTRING_T, RSYM_T]);
    typeCheck(fourthArg, [RSTRING_T, RSYM_T, RCOLOR_T]);

    let value = makeRectangle(firstArg.value, secondArg.value, thirdArg.value, fourthArg.value);

    return {value, type: RIMAGE_T};
}
function square(args) {
    if (args.length < 3) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];
    let thirdArg = args[2];

    typeCheck(firstArg, [RNUM_T]);
    typeCheck(secondArg, [RNUM_T, RSTRING_T, RSYM_T]);
    typeCheck(thirdArg, [RSTRING_T, RSYM_T, RCOLOR_T]);

    let value = makeRectangle(firstArg.value, firstArg.value, secondArg.value, thirdArg.value);

    return {value, type: RIMAGE_T};
}
function triangle(args) {
    if (args.length < 3) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];
    let thirdArg = args[2];
    
    typeCheck(firstArg, [RNUM_T]);
    typeCheck(secondArg, [RNUM_T, RSTRING_T, RSYM_T]);
    typeCheck(thirdArg, [RSTRING_T, RSYM_T, RCOLOR_T]);

    let value = makeEquiTriangle(firstArg.value, secondArg.value, thirdArg.value);

    return {value, type: RIMAGE_T};
}
function beside(args) {
    if (args.length < 2) {
        throw new Error('arity mismatch');
    }

    args.forEach((arg) => typeCheck(arg, [RIMAGE_T]));

    let value = makeBeside(args.map((arg) => arg.value));

    return {value, type: RIMAGE_T};
}
function besideAlign(args) {
    if (args.length < 3) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let restArgs = args.slice(1);

    typeCheck(firstArg, [RSTRING_T, RSYM_T]);
    restArgs.forEach((arg) => typeCheck(arg, [RIMAGE_T]));

    let value = makeBeside(restArgs.map((arg) => arg.value), firstArg.value);

    return {value, type: RIMAGE_T};
}
function above(args) {
    if (args.length < 2) {
        throw new Error('arity mismatch');
    }

    args.forEach((arg) => typeCheck(arg, [RIMAGE_T]));

    let value = makeAbove(args.map((arg) => arg.value));

    return {value, type: RIMAGE_T};
}
function aboveAlign(args) {
    if (args.length < 3) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let restArgs = args.slice(1);

    typeCheck(firstArg, [RSTRING_T, RSYM_T]);
    restArgs.forEach((arg) => typeCheck(arg, [RIMAGE_T]));

    let value = makeAbove(restArgs.map((arg) => arg.value), firstArg.value);

    return {value, type: RIMAGE_T};
}
function overlay(args) {
    if (args.length < 2) {
        throw new Error('arity mismatch');
    }

    args.forEach((arg) => typeCheck(arg, [RIMAGE_T]));

    let value = makeOverlay(args.map((arg) => arg.value));

    return {value, type: RIMAGE_T};
}
function overlayAlign(args) {
    if (args.length < 4) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];
    let restArgs = args.slice(2);

    typeCheck(firstArg, [RSTRING_T, RSYM_T]);
    typeCheck(secondArg, [RSTRING_T, RSYM_T]);
    restArgs.forEach((arg) => typeCheck(arg, [RIMAGE_T]));

    let value = makeOverlay(restArgs.map((arg) => arg.value), firstArg.value, secondArg.value);

    return {value, type: RIMAGE_T};
}
function placeImage(args) {
    if (args.length < 4) {
        throw new Error('arity mismatch');
    }

    let img = args[0];
    let x = args[1];
    let y = args[2];
    let scene = args[3];

    typeCheck(img, [RIMAGE_T]);
    typeCheck(x, [RNUM_T]);
    typeCheck(y, [RNUM_T]);
    typeCheck(scene, [RIMAGE_T]);

    let value = makePlace(img.value, x.value, y.value, scene.value);

    return {value, type: RIMAGE_T};
}
function empty_Scene(args) {
    if (args.length < 2) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];
    let thirdArg = args[2];

    typeCheck(firstArg, [RNUM_T]);
    typeCheck(secondArg, [RNUM_T]);

    let value;
    if (thirdArg !== undefined) {
        typeCheck(thirdArg, [RCOLOR_T, RSTRING_T, RSYM_T]);
        value = emptyScene(firstArg.value, secondArg.value, thirdArg.value);
    } else {
        value = emptyScene(firstArg.value, secondArg.value);
    }

    return {value, type: RIMAGE_T};
}
function color(args) {
    if (args.length < 3) {
        throw new Error('arity mismatch');
    }

    let firstArg = args[0];
    let secondArg = args[1];
    let thirdArg = args[2];
    let fourthArg = args[3];
    
    typeCheck(firstArg, [RNUM_T]);
    typeCheck(secondArg, [RNUM_T]);
    typeCheck(thirdArg, [RNUM_T]);

    let value;
    if (fourthArg !== undefined) {
        typeCheck(fourthArg, [RNUM_T]);
        value = makeColor(firstArg.value, secondArg.value, thirdArg.value, fourthArg.value);
    } else {
        value = makeColor(firstArg.value, secondArg.value, thirdArg.value);
    }

    return {value, type: RCOLOR_T};
}

export {interp, parseCheck, initEnv, parsePrefix, interpPrefix,
        isRVAR, isRAPP, isRFUNCT, isRNUM, isRBOOL, isRSTRING, isRLIST, isRSYM, isRIMAGE, isRCOLOR, isRIF, isRSTRUCT,
        RVAR_T, RAPP_T, RFUNCT_T, RNUM_T, RBOOL_T, RSTRING_T, RLIST_T, RSYM_T, RIMAGE_T, RCOLOR_T, RIF_T,
        unparse_cons, unparse_list};
