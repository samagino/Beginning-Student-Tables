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
                      expr: []};

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
        
        // String -> ??? -> Anything
        // it's an interpreter
        function interp(exp, env) {
        }

        this.setState((state) => {
            return {expr: parse(state.text)};
        });
    }

    readText(e) {
        let val = e.target.value;
        //val = val.replace('lambda', 'λ');
        
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
              {this.state.expr.map((expr, i) => <p key={i}>{expr}</p> )}
            </div>
        );
    }
}

const domContainer = document.querySelector('#interp_container');
ReactDOM.render(<App />,
                domContainer);
