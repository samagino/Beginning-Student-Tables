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
//cell in a table that has a button that says "delete"
function DelCell(props) {
  return (
    React.createElement("td", null,
    React.createElement("button", { onClick: props.onClick }, "Delete")));




}

//cell in a table that one can write an expression in
function ExprCell(props) {
  return (
    React.createElement("td", null,
    React.createElement("input", {
      type: "text",
      value: props.text,
      onChange: props.onChange })));


}

//cell that contains the output of the application of 
//   a relevent function to a relevent expression
// the function is called "expression" and the 
//    expression is called "inValue"
// I should probably change that at some point  
function TestCell(props) {
  return (
    React.createElement("td", null,
    props.expression(props.inValue)));


}

//value mapping row
function IORow(props) {
  return (
    React.createElement("tr", null,
    React.createElement(ExprCell, {
      text: props.inText,
      onChange: props.onChange }),
    props.expressions.map((expr, index) =>
    React.createElement(TestCell, {
      key: index,
      inValue: props.inValue,
      expression: expr })),

    React.createElement(DelCell, {
      onClick: props.onClick })));



}

//button that says "Test"
function TestButton(props) {
  return (
    React.createElement("button", { onClick: props.onClick }, "Test"));



}

//button that says "Add Row"
function AddRowButton(props) {
  return (
    React.createElement("button", { onClick: props.onClick }, "Add Row"));



}

//button that says "Add Column"
function AddColumnButton(props) {
  return (
    React.createElement("button", { onClick: props.onClick }, "Add Column"));



}

function Header(props) {
  return (
    React.createElement("tr", null,
    React.createElement("td", null, "In"),


    props.cols.map((col, index) =>
    React.createElement(ExprCell, {
      key: index,
      text: col.text,
      onChange: e => props.onChange(e, col) }))));



}

function Footer(props) {
  function renderDelCell(col) {
    return (
      React.createElement("td", null,
      React.createElement("button", { onClick: () => props.onClick(col) }, "Delete")));




  }

  return (
    React.createElement("tr", null,
    React.createElement("td", null, "You Can't Delete Me"),


    props.cols.map((col) =>
    React.createElement(DelCell, {
      key: Math.round(Math.random() * 100000),
      onClick: () => props.onClick(col) }))));



}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { rows: [{ inValue: 0, inText: '0' }],
      cols: [{ expression: n => n, text: '(n) => n' }] };

    this.test = this.test.bind(this);
    this.addRow = this.addRow.bind(this);
    this.addColumn = this.addColumn.bind(this);
    this.remRow = this.remRow.bind(this);
    this.remColumn = this.remColumn.bind(this);
    this.inTextChange = this.inTextChange.bind(this);
    this.exprChange = this.exprChange.bind(this);
  }

  //evaluates the text fields of each element of the rows, columns
  //puts the result in the relevent fields (inValue, expression respectively)
  test() {
    const cols = this.state.cols.slice();
    //this mapping function changes the array cols
    cols.map(col => {col.expression = eval(col.text);});
    this.setState({ cols: cols });

    const rows = this.state.rows.slice();
    //this mapping function changes the array rows
    rows.map(row => {row.inValue = eval(row.inText);});
    this.setState({ rows: rows });
  }

  //adds a new row
  addRow() {
    const rows = this.state.rows.slice();
    rows.push({ inValue: 0, inText: '0' });
    this.setState({ rows: rows });
  }

  //adds a new column
  addColumn() {
    const cols = this.state.cols.slice();
    cols.push({ expression: n => n, text: '(n) => n' });
    this.setState({ cols: cols });
  }

  //removes a row
  remRow(deadRow) {
    //filter out the row we don't want from the rows
    const rows = filter(this.state.rows, row => row !== deadRow);
    this.setState({ rows: rows });
  }

  remColumn(deadCol) {
    const cols = filter(this.state.cols, col => col !== deadCol);
    this.setState({ cols: cols });
  }

  //handles changes caused by updating a text field
  inTextChange(e, modRow) {
    //this mapping function does not change the array this.state.rows
    //not sure if this actually does anything... still need setState to rerender though
    const rows = this.state.rows.map(row => row === modRow ? modRow : row);
    modRow.inText = e.target.value;
    this.setState({ rows: rows });
  }

  exprChange(e, modCol) {
    const cols = this.state.cols.map(col => col === modCol ? modCol : col);
    modCol.text = e.target.value;
    this.setState({ cols: cols });
  }

  render() {
    return (
      React.createElement("div", null,
      React.createElement("table", { border: "1" },
      React.createElement("tbody", null,
      React.createElement(Header, {
        cols: this.state.cols,
        onChange: this.exprChange }),

      this.state.rows.map((row, index) =>
      React.createElement(IORow, {
        key: index,
        inValue: row.inValue,
        inText: row.inText,
        expressions: this.state.cols.map(col => col.expression),
        onChange: e => this.inTextChange(e, row),
        onClick: () => this.remRow(row) })),

      React.createElement(Footer, {
        cols: this.state.cols,
        onClick: this.remColumn }))),



      React.createElement(TestButton, { onClick: () => this.test() }),
      React.createElement(AddRowButton, { onClick: () => this.addRow() }),
      React.createElement(AddColumnButton, { onClick: () => this.addColumn() })));


  }}


//thing that decides what to render and where
ReactDOM.render(React.createElement(App, null),
document.getElementById('root'));