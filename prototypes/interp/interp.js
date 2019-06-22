/*************************
    Interpreter thing
**************************/

class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {text: '',
                      expr: '',
                      error: ''};

        this.readText = this.readText.bind(this);
        this.interpText = this.interpText.bind(this);
    }

    interpText() {
        const VAR_T =     0;
        const APP_T =     1;
        const FUNCT_T =   2;
        const RNUM_T =    3;
        const RBOOL_T =   4;
        const RSTRING_T = 5;
        const RLIST_T =   6;
        
        // String -> {prog: Program, rest: String}
        function parse(text) {
            const varRE = /^[a-zA-Z\+\-\*\/\?=></>]+/; // change me
            const appRE = /^\(/;
            const endAppRE = /^\)/;
            const numRE = /^\-?\d+/; // this one doesn't permit fractions
            const boolRE = /^#[tf]/;
            const strRE = /^"[^"]*"/;
            const listRE = /^'\s*\(/;

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

            } else if (listRE.test(text)) {
                text = text.slice(1).trim(); // remove quote
                text = text.slice(1).trim(); // remove open paren

                let parseTerm = parse(text);

                let a, d;
                let rest, rec = parseTerm;
                a = parseTerm.prog;

                if (parseTerm.rest[0] == ')') {
                    d = {value: null, type: RLIST_T};
                    rest = parseTerm.rest.slice(1).trim();
                } else {
                    rec = parse('\'(' + parseTerm.rest);
                    d = rec.prog;
                    rest = rec.rest;
                }

                let list = {value: {a: a, d: d}, type: RLIST_T};
                return {prog: list, rest: rest};
            }

            throw 'Invalid Syntax: \"' + text + '\"';
        }

        /***
            Environment: [Variable]
            Variable:    {symbol:  String,
                          binding: Program} 
         ***/

        // Program -> Environment -> Program
        function interp(prog, env) {
            function lookup(sym) {
                let val = env.reduce((acc, variable) => {
                    if (acc != undefined) {
                        return acc;
                    }

                    return variable.symbol == sym ? variable.binding : undefined;
                }, undefined);

                if (val == undefined){
                    throw new ReferenceError(sym + ' isn\'t defined');
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
            case VAR_T:
                return lookup(prog.value);
            case FUNCT_T:
                return prog;
            case APP_T:
                let args = prog.value.args;
                let funct = interp(prog.value.funct, env);

                typeCheck(funct, FUNCT_T);

                return funct.value.call(undefined, args, env);

            default:
                throw "Interpreter Error " + String(prog);
            }
        }

        // Program -> String
        function toString(prog) {
            switch (prog.type) {
            case RNUM_T:
                return prog.value;
            case RBOOL_T:
                return '#' + (prog.value ? 't' : 'f');
            case RSTRING_T:
                return prog.value;
            case RLIST_T:
                if (prog.value === null) {
                    return '()';
                } else {
                    return '(' + toString(prog.value.a) + ' . ' + toString(prog.value.d) + ')';
                }
            case VAR_T:
                return 'variable';
            case APP_T:
                return 'application';
            default:
                return 'error or something';
            }
            
        }

        function typeCheck(thing, type){
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

            if (thing.type != type){
                throw new TypeError(thing.value + ' ain\'t a ' + typeString);
            }
        }

        function plus(arr, env) {
            return arr.reduce((acc, cur) => {
                let accVal = interp(acc, env);
                let curVal = interp(cur, env);

                typeCheck(accVal, RNUM_T);
                typeCheck(curVal, RNUM_T);

                return {value: accVal.value + curVal.value,
                        type: RNUM_T};
            });
        }
        function minus(arr, env) {
            return arr.reduce((acc, cur) => {
                let accVal = interp(acc, env);
                let curVal = interp(cur, env);

                typeCheck(accVal, RNUM_T);
                typeCheck(curVal, RNUM_T);

                return {value: accVal.value - curVal.value,
                        type: RNUM_T};
            });
        }
        function times(arr, env) {
            return arr.reduce((acc, cur) => {
                let accVal = interp(acc, env);
                let curVal = interp(cur, env);

                typeCheck(accVal, RNUM_T);
                typeCheck(curVal, RNUM_T);

                return {value: accVal.value * curVal.value,
                        type: RNUM_T};
            });
        }
        function divide(arr, env) {
            if (arr.length == 1) {
                let firstVal = interp(arr[0], env);

                typeCheck(firstVal, RNUM_T);

                return {value: 1 / firstVal.value,
                        type: RNUM_T};
            } else if (arr.length == 2) {
                let firstVal = interp(arr[0], env);
                let secondVal = interp(arr[1], env);

                typeCheck(firstVal, RNUM_T);
                typeCheck(secondVal, RNUM_T);

                return {value: firstVal.value / secondVal.value,
                        type: RNUM_T};
            }

            arr.forEach((cur) => typeCheck(cur, RNUM_T));
            return {value: false, type: RBOOL_T};
        }
        function car(arr, env) {
            if (arr.length != 1) {
                throw "aritry mismatch";
            }

            let firstVal = interp(arr[0], env);

            typeCheck(firstVal, RLIST_T);

            return firstVal.value.a;
        }
        function cdr(arr, env) {
            if (arr.length != 1) {
                throw "arity mismatch";
            }

            let firstVal = interp(arr[0], env);

            typeCheck(firstVal, RLIST_T);

            return firstVal.value.d;
        }
        function cons(arr, env) {
            if (arr.length != 2) {
                throw "arity mismatch";
            }

            let firstVal = interp(arr[0], env);
            let secondVal = interp(arr[1], env);

            return {value: {a: firstVal, d: secondVal},
                    type: RLIST_T};
        }
        function iseqv(arr, env) {
            if (arr.length != 2) {
                throw "arity mismatch";
            }

            let firstVal = interp(arr[0], env);
            let secondVal = interp(arr[1], env);

            return {value: firstVal.value === secondVal.value,
                    type: RBOOL_T};
        }
        function isnull(arr, env) {
            if (arr.length != 1) {
                throw "arity mismatch";
            }

            let firstVal = interp(arr[0], env);

            return {value: firstVal.value === null && firstVal.type == RLIST_T,
                    type: RBOOL_T};
        }
        function equalsign(arr, env) {
            arr.forEach((cur) => typeCheck(cur, RNUM_T)); 

            let val = arr.reduce((acc, cur) => {
                let accVal = interp(acc, env);
                let curVal = interp(cur, env);
                
                if (accVal.value === false) {
                    return {value: false, type: RBOOL_T};
                }

                return accVal.value == curVal.value ? accVal : {value: false, type: RBOOL_T};
            });

            if (val.value === false){
                return val;
            } else {
                return {value: true, type: RBOOL_T};
            }
        }
        function gtsign(arr, env) {
            arr.forEach((cur) => typeCheck(cur, RNUM_T)); 

            let val = arr.reduce((acc, cur) => {
                let accVal = interp(acc, env);
                let curVal = interp(cur, env);
                
                if (accVal.value === false) {
                    return accVal;
                }

                return accVal.value > curVal.value ? curVal : {value: false, type: RBOOL_T};
            });

            if (val.type === RBOOL_T){
                return val;
            } else {
                return {value: true, type: RBOOL_T};
            }
        }
        function gesign(arr, env) {
            arr.forEach((cur) => typeCheck(cur, RNUM_T)); 

            let val = arr.reduce((acc, cur) => {
                let accVal = interp(acc, env);
                let curVal = interp(cur, env);
                
                if (accVal.value === false) {
                    return accVal;
                }

                return accVal.value >= curVal.value ? curVal : {value: false, type: RBOOL_T};
            });

            if (val.value === false){
                return val;
            } else {
                return {value: true, type: RBOOL_T};
            }
        }
        function ltsign(arr, env) {
            arr.forEach((cur) => typeCheck(cur, RNUM_T)); 

            let val = arr.reduce((acc, cur) => {
                let accVal = interp(acc, env);
                let curVal = interp(cur, env);
                
                if (accVal.value === false) {
                    return accVal;
                }

                return accVal.value < curVal.value ? curVal : {value: false, type: RBOOL_T};
            });

            if (val.value === false){
                return val;
            } else {
                return {value: true, type: RBOOL_T};
            }
        }
        function lesign(arr, env) {
            arr.forEach((cur) => typeCheck(cur, RNUM_T)); 

            let val = arr.reduce((acc, cur) => {
                let accVal = interp(acc, env);
                let curVal = interp(cur, env);
                
                if (accVal.value === false) {
                    return accVal;
                }

                return accVal.value <= curVal.value ? curVal : {value: false, type: RBOOL_T};
            });

            if (val.value === false){
                return val;
            } else {
                return {value: true, type: RBOOL_T};
            }
        }

        let error = '';
        let program;

        program = parse(this.state.text);

        if (program.rest !== '') {
            error = new Error('Parse Error');
        }

        //console.log(program);
        let expr = '';
        let initEnv = [
            // functions
            {symbol: '+', binding: {type: FUNCT_T,
                                    value: plus}},
            {symbol: '-', binding: {type: FUNCT_T,
                                    value: minus}},
            {symbol: '*', binding: {type: FUNCT_T,
                                    value: times}},
            {symbol: '/', binding: {type: FUNCT_T,
                                    value: divide}},
            {symbol: 'car', binding: {type: FUNCT_T,
                                      value: car}},
            {symbol: 'cdr', binding: {type: FUNCT_T,
                                      value: cdr}},
            {symbol: 'cons', binding: {type: FUNCT_T,
                                       value: cons}},
            {symbol: 'eqv?', binding: {type: FUNCT_T,
                                       value: iseqv}},
            {symbol: 'null?', binding: {type: FUNCT_T,
                                        value: isnull}},
            {symbol: 'empty?', binding: {type: FUNCT_T,
                                         value: isnull}},
            {symbol: '=', binding: {type: FUNCT_T,
                                    value: equalsign}},
            {symbol: '>', binding: {type: FUNCT_T,
                                    value: gtsign}},
            {symbol: '>=', binding: {type: FUNCT_T,
                                     value: gesign}},
            {symbol: '<', binding: {type: FUNCT_T,
                                    value: ltsign}},
            {symbol: '<=', binding: {type: FUNCT_T,
                                     value: lesign}},
            // constants
            {symbol: 'null', binding: {type: RLIST_T,
                                       value: null}},
            {symbol: 'empty', binding: {type: RLIST_T,
                                        value: null}},
            {symbol: 'n', binding: {type: RNUM_T,
                                    value: 2}}
        ];

        try {
            expr = interp(program.prog, initEnv);
        } catch (e) {
            error = e;
        }

        this.setState((state) => ({expr: toString(expr), error: error}));
    }


    readText(e) {
        let val = e.target.value;
        
        this.setState((state) => {
            return {text: val};
        });
    }

    render() {
        return (
            <div>
              <button
                onClick={this.interpText}>
                Parse
              </button>
              <input
                type={'text'}
                size={100}
                value={this.state.text}
                onChange={this.readText} />
                <p>{'Expr: ' + String(this.state.expr)}</p>
              <p >{'Error: ' + this.state.error}</p>
            </div>
        );
    }
}

const domContainer = document.querySelector('#interp_container');
ReactDOM.render(<App />,
                domContainer);
