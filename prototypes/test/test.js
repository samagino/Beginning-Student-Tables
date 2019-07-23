/***
    This here is a test to figure out how to manage dummy input fields and such
***/


let keyCount = 0;

function getKey() {
    return keyCount++;
}

class ValidatedInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {text: '',
                      className: 'invalid_input'};

        this.textChange = this.textChange.bind(this);
        this.checkEmpty = this.checkEmpty.bind(this);
    }

    componentDidMount() {
        this.setState((state) => {
            if (this.props.dummy) {
                return {...state, dummy: true, className: 'dummy_input'};
            } else {
                return {...state, dummy: false};
            }
        });
    }

    textChange(e) {
        let text = e.target.value;

        if (this.state.dummy) {
            this.props.onReal();
        }

        if (this.props.isValid(text)) {
            this.setState((state) => ({...state,
                                       text: text,
                                       dummy: false,
                                       className: 'valid_input'}));
            this.props.onValid(text);
        } else {
            this.setState((state) => ({...state,
                                       text: text,
                                       dummy: false,
                                       className: 'invalid_input'}));
        }
    }

    checkEmpty() {
        if (this.state.text == '' && !this.state.dummy) {
            this.props.onEmpty();
        }
    }

    render() {
        let size;
        if (this.state.text.length == 0)
            size = this.props.placeholder.length;
        else
            size = Math.max(this.state.text.length, 4);
        
        return (
            <div>
              <input
                className={this.state.className}
                size={size}
                placeholder={this.props.placeholder}
                type={'text'}
                value={this.state.text}
                onChange={this.textChange}
                onBlur={this.checkEmpty}
              />
              key: {this.props.clef}
            </div>

        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        let stuff = [];
        stuff.nextKey = getKey();
        this.state = {stuff};

        this.changeThing = this.changeThing.bind(this);
        this.addThing = this.addThing.bind(this);
        this.remThing = this.remThing.bind(this);
    }

    changeThing(text, key) {
        this.setState((state) => {
            let oldThing = state.stuff.find((item) => item.key == key);
            let edit = {...oldThing, name: text};
            let stuff = state.stuff.map((item) => item == oldThing ? edit : item);
            stuff.nextKey = state.stuff.nextKey;
            return {stuff};
        });
    }

    remThing(deadKey) {
        this.setState((state) => {
            let deadThing = state.stuff.find((item) => item.key == key);
            let stuff = state.stuff.map((item) => item == deadThing ? edit : item);
            stuff.nextKey = state.stuff.nextKey;
            return {stuff};
        });
    }

    addThing() {
        this.setState((state) => {
            let stuff = [...state.stuff, {name: '', key: state.stuff.nextKey}];
            stuff.nextKey = getKey();
            //console.log('new stuff: ', stuff);
            return {stuff};
        });
    }

    render() {
        console.log(this.state.stuff);
        
        return (
            <div>
              {[...this.state.stuff.map((thing) => (
                  <ValidatedInput
                    key={thing.key}
                    clef={thing.key}
                    isValid={(str) => /^[a-z]+$/.test(str)}
                    onValid={(text) => this.changeThing(text, thing.key)}
                    onReal={this.addThing}
                    dummy={false}
                    placeholder='name'
                    onEmpty={() => this.remThing(thing.key)}
                  />
              )),
                <ValidatedInput
                  key={this.state.stuff.nextKey}
                  clef={this.state.stuff.nextKey}
                  dummy={true}
                  placeholder='add'
                  isValid={(str) => /^[a-z]+$/.test(str)}
                  onValid={(text) => this.changeThing(text, this.state.stuff.nextKey)}
                  onReal={this.addThing}
                />]}
            </div>
        );
    }
}

const domContainer = document.querySelector('#test_container');
ReactDOM.render(<App />,
                domContainer);
