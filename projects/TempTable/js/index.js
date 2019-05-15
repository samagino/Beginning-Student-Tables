function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}class TempTable extends React.Component {
  constructor(props) {
    super(props);_defineProperty(this, "handleChange",





    e => this.setState({ text: e.target.value }));_defineProperty(this, "handleClick",
    () => this.setState({ temp: Number(this.state.text) }));this.state = { temp: 0, text: '' };this.handleChange = this.handleChange.bind(this);this.handleClick = this.handleClick.bind(this);}

  render() {
    return (
      React.createElement("table", { border: "1" },
      React.createElement("tbody", null,
      React.createElement("tr", null,
      React.createElement("td", null,
      React.createElement("input", { type: "text",
        value: this.state.text,
        onChange: this.handleChange }), " C"),

      React.createElement("td", null,
      this.state.temp * (9 / 5) + 32, " F"),

      React.createElement("td", null,
      this.state.temp + 273, " K"),

      React.createElement("td", null,
      React.createElement("button", { onClick: this.handleClick }, "Calculate"))))));







  }}


ReactDOM.render(React.createElement(TempTable, null),
document.getElementById('root'));