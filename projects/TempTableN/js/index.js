/*********************
   functions I want
*********************/
// Array -> Function -> Array
// takes array and predicate, returns array with elements that satisfy predicate
function filter(arr, pred) {
  let goodGuys = [];
  for (let elem of arr) {
    if (pred(elem)) {
      goodGuys.push(elem);
    }
  }
  return goodGuys;
}

/*********************
     React Components
  *********************/
function TempTable(props) {
  return (
    React.createElement("table", { border: "1" },
    React.createElement("tbody", null,
    React.createElement("tr", null,
    React.createElement("td", null,
    React.createElement("input", { type: "text",
      value: props.text,
      onChange: e => props.onChange(e) }), " C"),

    React.createElement("td", null,
    props.temp * (9 / 5) + 32, " F"),

    React.createElement("td", null,
    props.temp + 273, " K"),

    React.createElement("td", null,
    React.createElement("button", { onClick: () => props.onClick() }, "Delete"))))));







}

function CalcButton(props) {
  return (
    React.createElement("button", { onClick: () => props.onClick() }, "Calculate"));



}

function AddRowButton(props) {
  return (
    React.createElement("button", { onClick: () => props.onClick() }, "Add Row"));



}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { rows: [{ temp: 0, text: '0', key: Math.round(Math.random() * 10000) }] };

    this.calculate = this.calculate.bind(this);
    this.addRow = this.addRow.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderTempTable = this.renderTempTable.bind(this);
  }

  calculate() {
    const rows = this.state.rows.slice();
    //this mapping function changes the array rows
    rows.map(row => {row.temp = Number(row.text);});
    this.setState({ rows: rows });
  }

  addRow() {
    const rows = this.state.rows.slice();
    //key is random number from 0 to 10000 (using index as key could cause problems)
    //  due to removing rows then adding new ones
    rows.push({ temp: 0, text: '0', key: Math.round(Math.random() * 10000) });
    this.setState({ rows: rows });
  }

  remRow(deadRow) {
    const rows = filter(this.state.rows, row => row !== deadRow);
    this.setState({ rows: rows });
  }

  handleChange(e, modRow) {
    modRow.text = e.target.value;
    //this mapping function does not change the array this.state.rows
    const rows = this.state.rows.map(row => row.key === modRow.key ? modRow : row);
    this.setState({ rows: rows });
  }

  renderTempTable(row) {
    return (
      React.createElement(TempTable, {
        temp: row.temp,
        text: row.text,
        onChange: e => this.handleChange(e, row),
        onClick: () => this.remRow(row) }));

  }

  render() {
    return (
      React.createElement("div", null,
      this.state.rows.map(row => this.renderTempTable(row)),
      React.createElement(CalcButton, { onClick: () => this.calculate() }),
      React.createElement(AddRowButton, { onClick: () => this.addRow() })));


  }}


//thing that decides what to render and where
ReactDOM.render(React.createElement(App, null),
document.getElementById('root'));