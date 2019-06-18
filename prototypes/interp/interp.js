/*************************
    Interpreter thing
**************************/

/************************************************
Stuff To Decide:
  - how should the environment be represented?
  - how should closures be represented?
      - prolly not as js functions because js doesn't like deep recursion
************************************************/

class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {text: '',
                      expr: ''};

        this.readText = this.readText.bind(this);
        this.interpText = this.interpText.bind(this);
    }

    interpText() {
        function isPexp(text) {
            return text.startsWith('(') && text.endsWith(')');
        }
        
        // String -> [String]
        // organizes raw text into s-expressions in current layer
        function parse(text) {
            //get rid of parens
            text = text.slice(1, -1);

            let val = [];
            let pCount = 0;
            let pIndex = 0;

            // this makes me feel bad
            for (let i = 0; i < text.length; i ++) {
                if(text[i] == '(') {
                    if (pCount) {
                        pCount ++;
                    } else {
                        pIndex = i;
                        pCount = 1;
                    }
                } else if (text[i] == ')') {
                    if (pCount == 1) {
                        val = [...val, text.slice(pIndex, i + 1)];
                        pCount = 0;
                    } else {
                        pCount --;
                    }
                } else if (! pCount) {
                    let nextParen;
                    if (text.slice(i).indexOf('(') != -1){
                        nextParen = text.slice(i).indexOf('(') + i;
                    } else {
                        nextParen = Infinity;
                    }

                    const termRE = /[^\(\)\[\]\s]+/g;
                    let terms = text.slice(i, nextParen).match(termRE);

                    if (terms !== null) {
                        val = [...val, ...terms];
                    }

                    i = nextParen - 1;
                }
            }
            
            //const sre = /\([a-zA-Z0-9\+\*\-\/\s\(\)]*\)|[a-zA-Z0-9\+\*\-\/]+/g;
            //return text.match(sre);
            return val;
        }
        
        /***
            Environment: [Variable]
            Variable:    {symbol: String,
                          value: Anything}

            Closure: ???
         ***/
        // String -> ??? -> Anything
        // it's an interpreter
        function interp(exp, env) {
            function isNumber(text) {
                return !isNaN(text);
            }

            function extEnv(sym, val, env){
                return [{symbol: sym, value: val}, ...env];
            }

            function applyEnv(env, sym) {
                let val = env.reduce((acc, variable) => variable.symbol == sym ? variable.value : acc, undefined);

                if (val === undefined) {
                    throw 'ReferenceError, ' + sym + ' is undefined';
                }

                return val;
            }

            function makeClos(syms, bod, env){
                return {symbols: syms, body: bod, env: env, clos: true};
            }

            function applyClos(clos, vals){
                let extedEnv = vals.reduce((acc, val, i) => extEnv(clos.symbols[i], val, acc), clos.env);
                return interp(clos.body, extedEnv);
            }

            if (isPexp(exp)) { // Parentheses Expression
                let exps = parse(exp);

                /* Arithmetic */
                if (exps[0] == '+') {
                    let firstNum = interp(exps[1], env);
                    exps.splice(0, 2);
                    return exps.reduce((acc, exp) => acc + interp(exp, env), firstNum);
                } else if (exps[0] == '-') {
                    let firstNum = interp(exps[1], env);
                    exps.splice(0, 2);
                    return exps.reduce((acc, exp) => acc - interp(exp, env), firstNum);
                } else if (exps[0] == '*') {
                    let firstNum = interp(exps[1], env);
                    exps.splice(0, 2);
                    return exps.reduce((acc, exp) => acc * interp(exp, env), firstNum);

                /* Conditions */
                } else if (exps[0] == 'if' && exps.length == 4) {
                    return interp(exps[1], env) ? interp (exps[2], env) : interp(exps[3], env);
                } else if (exps[0] == 'eqv?' && exps.length == 3) {
                    return interp(exps[1], env) === interp(exps[2], env);
                } else if (exps[0] == '>' && exps.length == 3) {
                    return interp(exps[1], env) > interp(exps[2], env);
                } else if (exps[0] == '>=' && exps.length == 3) {
                    return interp(exps[1], env) >= interp(exps[2], env);
                } else if (exps[0] == '<' && exps.length == 3) {
                    return interp(exps[1], env) < interp(exps[2], env);
                } else if (exps[0] == '<=' && exps.length == 3) {
                    return interp(exps[1], env) <= interp(exps[2], env);

                /* Scheme Things */
                } else if (exps[0] == 'let' && exps.length == 3) {
                    let bindings = exps[1].slice(1, -1).replace(/\)\s*\(/g, ');(').split(';').map(parse);
                    let extedEnv = bindings.reduce((acc, binding) => extEnv(binding[0], interp(binding[1], env), acc), env);
                    return interp(exps[2], extedEnv);
                } else if (exps[0] == 'let*' && exps.length == 3) {
                    let bindings = exps[1].slice(1, -1).replace(/\]\s*\[/g, '];[').split(';').map(parse);
                    let extedEnv = bindings.reduce((acc, binding) => extEnv(binding[0], interp(binding[1], acc), acc), env);
                    return interp(exps[2], extedEnv);
                    
                /* Lambda Calculus */
                } else if (exps[0] == 'lambda' || exps[0] == 'λ') {
                    let vars = exps[1].slice(1, -1).split(' ');
                    return makeClos(vars, exps[2], env);
                } else {
                    let clos = interp(exps[0], env);
                    if (clos.clos) {
                        exps.splice(0, 1);
                        return applyClos(clos, exps.map((exp) => interp(exp, env)));
                    }

                    throw "unexpected expression: " + exp;
                }


            } else { // Atom
                if (isNumber(exp)) {
                    return +exp;
                } else if (exp == '#t') {
                    return true;
                } else if (exp == '#f') {
                    return false;
                } else {
                    return applyEnv(env, exp);
                }
            }
        }

        function preProcess(text) {
            const commentRE = /;.*$/g;
            text = text.replace(commentRE, '');
            text = text.replace(/\]/g, ')');
            text = text.replace(/\[/g, '(');

            text = text.trim();
            return text;
        }

        const initEnv = [{symbol: 'add1', value: {symbols: ['n'], body: '(+ n 1)', env: [], clos: true}},
                         {symbol: 'sub1', value: {symbols: ['n'], body: '(- n 1)', env: [], clos: true}},
                         {symbol: 'zero?', value: {symbols: ['n'], body: '(eqv? n 0)', env: [], clos: true}}];

        this.setState((state) => {
            let procedText = preProcess(state.text);
            return {expr: interp(procedText, initEnv)};
        });
    }

    readText(e) {
        let val = e.target.value.replace('lambda', 'λ');
        
        this.setState((state) => {
            return {text: val};
        });
    }

    render() {
        return (
            <div>
              <button
                onClick={this.interpText}>
                Interpret
              </button>
              <input
                type={'text'}
                size={100}
                value={this.state.text}
                onChange={this.readText} />
              <p >{String(this.state.expr)}</p>
            </div>
        );
    }
}

const domContainer = document.querySelector('#interp_container');
ReactDOM.render(<App />,
                domContainer);
