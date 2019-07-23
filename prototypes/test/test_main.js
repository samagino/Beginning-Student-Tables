/***
    This here is a test to figure out how to manage dummy input fields and such
***/


let keyCount = 1;

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

    componentWillUnmount() {
        console.log('I unmounted, my key is: ', this.props.clef);
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
        this.state = {stuff: [], nextKey: 0};

        this.changeThing = this.changeThing.bind(this);
        this.addThing = this.addThing.bind(this);
    }

    changeThing(text, thing) {
        this.setState((state) => {
            let edit = {...thing, name: text};
            return {stuff: state.stuff.map((item) => thing == item ? edit : item)};
        });
    }

    addThing() {
        this.setState((state) => ({stuff: [...state.stuff, {name: '', key: state.nextKey}], nextKey: getKey()}));
    }

    remThing(deadThing) {
        this.setState((state) => ({stuff: state.stuff.filter((thing) => thing != deadThing)}));
    }

    render() {
        console.log(this.state);
        const stuffs = [...this.state.stuff, {key: this.state.nextKey}];
        
        return (
            <div>
            {stuffs.map((thing) => (
              <ValidatedInput
                key={thing.key}
                clef={thing.key}
                isValid={(str) => /^[a-z]+$/.test(str)}
                onValid={(text) => this.changeThing(text, thing)}
                onReal={this.addThing}
                dummy={thing.name === undefined}
                placeholder={thing.name === undefined ? 'add' : 'name'}
                onEmpty={() => this.remThing(thing)}
              />
            ))}
            </div>
        );
    }
}

const domContainer = document.querySelector('#test_container');
ReactDOM.render(<App />,
                domContainer);
