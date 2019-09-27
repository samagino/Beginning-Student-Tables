/**
 * TODO: need to interp inputs, wants to check if they're valid
 *       to interp, need environemnt
 *       this has to be the global table environment to account for
 *       structures and stuff
 *       Due to this, global env has to be included in each snapshot
 *
 * can't have functions in JSON though, so can't just include environment
 * instead can put the parsed (but not interpreted) Definitions Area
 * in snapshots, then interpret it here
 */


import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {interp, unparse_cons, unparse_list, initEnv, isRAPP, isRLIST, isRIMAGE, isRBOOL, isRSTRUCT} from './interpreter.js';
import {gray, pink, yellow, isBooleanFormula} from './header.js';
import {paint, width, height, makeRectangle, makeOverlay} from './image.js';
import toBSL from './prettyprint.js';
import Octicon, {Trashcan, Alert, Check} from '@primer/octicons-react';
import './App.css';

/*********************
    Key Management
*********************/
// variable used by takeKey and peekKey to generate keys
let keyCount = 0;

// Number
// returns a unique key
// function takeKey() {
//     return keyCount++;
// }

// [Number] -> Number (the brackets here mean optional, not array)
// returns current key without changing it
// shoud be used to look at current state of key without actually taking it
// optionally takes a number as an argument, in which case it returns the key that number
// of steps ahead of the current key
function peekKey(lookahead = 0) {
    return keyCount + lookahead;
}

/**************
    Globals
**************/
// TODO: maybe get rid of these?
let unparse = unparse_cons;
let listOrCons = 'cons';
let globalEnv = initEnv;

/*****************
    Deep Equals
*****************/
// Program -> Program -> Boolean
// checks if two programs are equivalent, recurs on lists and applications
// may not quite work on functions because I use js functions, not data represented closures or something
//    thus 2 functions are only equal if they're a reference to the same object
// maybe move this to interpreter.js?
function deepEquals(proga, progb) {
    if (proga.type !== progb.type) {
        return false;
    }

    if (isRLIST(proga)) {
        if (proga.value === null || progb.value === null) {
            return proga.value === progb.value;
        }
        return deepEquals(proga.value.a, progb.value.a) && deepEquals(proga.value.d, progb.value.d);
    }

    // this case will prolly never even happen...
    if (isRAPP(proga)) {
        if (proga.value.args.length !== progb.value.args.length) {
            return false;
        }
        let functCheck = deepEquals(proga.value.funct, progb.value.funct);
        let argCheck = proga.value.args.map((arga, i) => deepEquals(arga, progb.value.args[i])).every((elem) => elem);
        return functCheck && argCheck;
    }

    if (isRSTRUCT(proga)) {
        let structa = proga.value;
        let structb = progb.value;

        let idSame = structa.id === structb.id;

        let fieldsSame;
        if (structa.fields.length === structb.fields.length) {
            fieldsSame = structa.fields.every((fielda, i) => deepEquals(fielda.binding, structb.fields[i].binding));
        } else {
            fieldsSame = false;
        }

        return idSame && fieldsSame;
    }

    if (isRIMAGE(proga)) {
        // Image -> Uint8ClampedArray
        // takes an image and returns an array containing RGBA values of all pixels in the image
        // a lot of this was taken from https://stackoverflow.com/questions/3768565/drawing-an-svg-file-on-a-html5-canvas
        // sometimes this doesn't work...
        //   - when it is first used in a certain instance of the table method, it returns an array containing only zeros,
        //     however, after this I'm pretty sure it returns the array it should be returning
        //   - maybe something hasn't been properly initialized by the first time around?
        function toRGBAArray (image) {
            let can = document.createElement('canvas');
            can.width = width(image);
            can.height = height(image);
            let ctx = can.getContext('2d');
            let svg = paint(image);

            // pretty much just turns the jsx into a string
            let xml = ReactDOMServer.renderToString(svg);

            // make the xml base 64 for some reason (I dunno why)


            let svg64 = btoa(xml);
            // header that does stuff I guess
            let b64Start = 'data:image/svg+xml;base64,';

            // prepend a the header to the xml data
            let image64 = b64Start + svg64;

            // make image that contains the xml data so we can draw it
            let img = document.createElement('img');
            //console.log(img);
            img.src = image64;

            // draw the image onto the canvas
            ctx.drawImage(img, 0, 0);

            return ctx.getImageData(0, 0, width(image), height(image)).data;
        }

        let imgA = proga.value;
        let imgB = progb.value

        let dataA_red = toRGBAArray(makeOverlay([imgA, makeRectangle(width(imgA), width(imgA), 'solid', 'red')]));
        let dataA_green = toRGBAArray(makeOverlay([imgA, makeRectangle(width(imgA), width(imgA), 'solid', 'green')]));

        let dataB_red = toRGBAArray(makeOverlay([imgB, makeRectangle(width(imgB), width(imgB), 'solid', 'red')]));
        let dataB_green = toRGBAArray(makeOverlay([imgB, makeRectangle(width(imgB), width(imgB), 'solid', 'green')]));

        if (width(imgA) !== width(imgB) || height(imgA) !== height(imgB)) { // images have different dimensions
            return false;
        }

        let redSame = dataA_red.every((datumA_red, i) => datumA_red === dataB_red[i]);
        let greenSame = dataA_green.every((datumA_green, i) => datumA_green === dataB_green[i]);

        return redSame && greenSame;
    }

    return proga.value === progb.value;
}

/*********************
   React Components
*********************/

// it's a picture of a colon
function Colon (props) {
    return (
        <div className='colon'>:</div>
    );
}

// It's an error message (oh no!)
function ErrorMessage (props) {
    return (
        <div>
          {props.error.message}
          <div title={"Oh no! You got an error!"} className="alert">
            <Octicon
              icon={Alert} size="small" verticalAlign="middle"
              ariaLabel='Error!'/>
          </div>
        </div>
    );
}

/*** Buttons ***/
// Button that probably removes something
function RemButton(props){
    return (
        <div className='remove'
             title={props.title}>
          <Octicon
            icon={Trashcan} size="small" verticalAlign="middle"
            ariaLabel='Remove'/>
        </div>
    );
}

/*** Inputs ***/
function ValidatedInput (props) {
    let className;
    if (props.dummy && props.text === '') { // empty dummy
        className = 'dummy_input';
    } else if (props.isValid(props.text)) { // valid
        className = 'valid_input';
    } else if (props.text === '') { // empty non-dummy
        className = 'empty_input';
    } else { // invalid
        className = 'invalid_input';
    }

    let size;
    if (props.text.length === 0)
        size = props.placeholder.length;
    else
        size = Math.max(props.text.length + 2, 4);

    return (
        <input
          className={className}
          size={size}
          placeholder={props.placeholder}
          type={'text'}
          value={props.text}
          readOnly={true}
        />
    );
}

function ValidatedArea (props) {
    let className;
    if (props.dummy && props.text === '') { // empty dummy
        className = 'dummy_input';
    } else if (props.isValid(props.text)) { // valid
        className = 'valid_input';
    } else if (props.text === '') { // empty non-dummy
        className = 'empty_input';
    } else { // invalid
        className = 'invalid_input';
    }

    let rows,
        newlines = props.text.match(/\n/g);
    if (newlines === null) {
        rows = 1;
    } else {
        rows = newlines.length + 1;
    }

    let cols;
    if (props.text.length === 0)
        cols = props.placeholder.length;
    else
        cols = Math.max(...props.text.split('\n').map((line) => line.length + 1), 4);

    return (
        <textarea
          className={className + ' validated_area'}
          rows={rows}
          cols={cols}
          placeholder={props.placeholder}
          spellCheck={false}
          value={props.text}
          readOnly={true}
        />
    );
}

/*** Table Sections ***/
// let's put everything in one table woo
function Succinct(props) {

    const reals = props.tables.map((table) => (
        <div key={table.key} className='flex_horiz table'>
          <div className='flex_vert no_grow'>
            <div className='flex_horiz no_grow signature'>
              <ValidatedInput
                dummy={false}
                placeholder='Table Name'
                text={table.name}
              />
              <Colon/>
              <ValidatedInput
                dummy={false}
                placeholder='Signature'
                text={table.signature}
              />
              <RemButton
                title='Remove this table'
              />
            </div>
            <div className='flex_horiz no_grow'>
              <ValidatedInput
                dummy={false}
                placeholder='Purpose'
                text={table.purpose}
              />
            </div>
            <SuccinctTab
              table={table}
            />
          </div>
          <div className='grow'>{/* div to prevent text fields from stretching across the screen */}</div>
        </div>
    ));

    const dummy = (
        <div key={peekKey()} className='flex_horiz table'>
          <div className='flex_vert no_grow'>
            <div className='flex_horiz no_grow signature'>
              <ValidatedInput
                dummy={true}
                placeholder='Table Name'
                text=''
              />
              <Colon/>
              <ValidatedInput
                dummy={true}
                placeholder='Signature'
                text=''
              />
            </div>
            <div className='flex_horiz no_grow'>
              <ValidatedInput
                dummy={true}
                placeholder='Purpose'
                text=''
              />
            </div>
            <SuccinctTab
              table={{name: yellow,
                      signature: yellow,
                      purpose: yellow,
                      examples: [],
                      formulas: [],
                      params: [],
                      key: peekKey()}}
            />
          </div>
          <div className='grow'>{/* div to prevent text fields from stretching across the screen */}</div>
        </div>
    );

    return (
        <div>
          {[...reals, dummy]}
        </div>
    );
}

function SuccinctTab(props) {
    return (
        <table className={'grow'}>
          <SuccinctHead
            params={props.table.params}
            examples={props.table.examples}

            formulas={props.table.formulas}
          />
          <SuccinctBody
            examples={props.table.examples}
            formulas={props.table.formulas}
          />
        </table>
    );
}

function SuccinctHead(props) {
    // Formula -> Number -> Number
    // gives the maximum depth of a Formula, second parameter is an accumulator
    function maxDepth(formula, curMax) {
        if (!isBooleanFormula(formula)) {
            return curMax;
        } else {
            return formula.thenChildren.reduce((acc, child) => Math.max(acc, maxDepth(child, curMax + 1)), curMax + 1);
        }
    }

    function countWidth(formula) {
        if (!isBooleanFormula(formula)) {
            return 1;
        } else {
            return formula.thenChildren.reduce((acc, child) => acc + countWidth(child), 2);
        }
    }

    // Number -> [Number]
    // takes a number, returns an array that counts from 1 to that number, input of 0 gives empty array
    // e.g. countUp(5) -> [1, 2, 3, 4, 5]
    function countUp(num) {
        // special case: want an empty array for 0
        if (num === 0) {
            return [];
        } else if (num === 1)
            return [1];
        else
            return [...countUp(num - 1), num];
    }

    const abyss = props.formulas.reduce((acc, formula) => Math.max(acc, maxDepth(formula, 0)), 0);
    const numParams = props.params.length;

    const reals = props.formulas.map((formula) => (
        <th key={formula.key} colSpan={countWidth(formula)} >
          <div className='flex_horiz'>
            <ValidatedArea
              placeholder={'Formula'}
              dummy={false}
              text={unparse(formula.prog)}
            />
            <RemButton
              title={'Remove this formula'}
            />
          </div>
        </th>
    ));

    const dummy = (
        <th key={peekKey()} colSpan={1}>
          <div className='flex_horiz'>
            <ValidatedArea
              dummy={true}
              placeholder='Formula'
              text=''
            />
          </div>
        </th>
    );

    const children = countUp(abyss).map((depth) => (
        <tr key={depth}>
          <th colSpan={numParams + 2}>{/* empty cell to align with example RemButton and Parameters */}</th>
          {props.formulas.map((formula) => (
              <DepictFormula
                key={formula.key}
                formula={formula}
                depth={depth}
                numExamples={props.examples.length}
              />
          ))}
          {Array(depth).map((_, i) => (<th key={i}>{/* empty cell under some parent dummy formula */}</th>))}
          <th>{/* empty cell above wants */}</th>
        </tr>
    ));

    return (
        <thead>
          <tr>
            <Parameters
              params={props.params}
              examples={props.examples}
            />
            {/* top level formulas */}
            {[...reals, dummy, <th key={peekKey(1)}>{/* empty cell above wants */}</th>]}
          </tr>
          {/* rest of formulas */}
          {children}
        </thead>
    );
}

function Parameters(props) {
    const reals = props.params.map((param) => (
        <th key={param.key} >
          <div className='flex_horiz'>
            <ValidatedInput
              dummy={false}
              placeholder='Parameter'
              text={param.name}
            />
            <RemButton
              title='Remove this parameter'
            />
          </div>
        </th>
    ));

    const dummy = (
        <th key={peekKey()}>
          <div className='flex_horiz'>
            <ValidatedInput
              dummy={true}
              placeholder='Parameter'
              text=''
            />
          </div>
        </th>
    );

    return (
        <React.Fragment>
          <th>{/* empty cell to align with example RemButtons */}</th>
          <React.Fragment>
            {[...reals, dummy]}
          </React.Fragment>
        </React.Fragment>
    );
}

/*
  props: formula, depth, kill, formulaChange
*/
function DepictFormula(props) {
    function countWidth(formula) {
        if (!isBooleanFormula(formula)) {
            return 1;
        } else {
            return formula.thenChildren.reduce((acc, child) => acc + countWidth(child), 2);
        }
    }

    if (props.depth > 1) {
        return (
            <React.Fragment>
              <th>{/* empty cell to align with parent input */}</th>
              {isBooleanFormula(props.formula) ?
               <React.Fragment>
                 {props.formula.thenChildren.map((child) => (
                     <DepictFormula
                       key={child.key}
                       formula={child}
                       depth={props.depth - 1}
                       numExamples={props.numExamples}
                     />))}
                 <th>{/* empty cell to align with child input */}</th>
               </React.Fragment>
               : <script/> }
            </React.Fragment>
        );
    } else {
        if (isBooleanFormula(props.formula)) {
            const reals = props.formula.thenChildren.map((child) => (
                <th key={child.key} colSpan={countWidth(child)} >
                  <div className='flex_horiz'>
                    <ValidatedArea
                      dummy={false}
                      placeholder={'Formula'}
                      text={unparse(child.prog)}
                    />
                    <RemButton
                      title={'Remove this formula'}
                    />
                  </div>
                </th>
            ));

            const dummy = (
                <th key={peekKey()} colSpan={1}>
                  <div className='flex_horiz'>
                    <ValidatedArea
                      dummy={true}
                      placeholder='Formula'
                      text=''
                    />
                  </div>
                </th>
            );

            return (
                <React.Fragment>
                  <th>{/* empty cell to align with parent input */}</th>
                   <React.Fragment>
                     {[...reals, dummy]}
                   </React.Fragment>
                </React.Fragment>
            );
        } else {

            return (
                <React.Fragment>
                  <th>{/* empty cell to align with parent input */}</th>
                </React.Fragment>
            );
        }
    }
}

function SuccinctBody(props) {
    const reals = props.examples.map((example, i) => (
          <tr key={example.key}>
            <td>
              <RemButton
                title={'Remove this example'}
              />
            </td>
            <Inputs
              dummy={false}
              inputs={example.inputs}
            />
            <td>{/* empty cell to align with param dummy input */}</td>
            <Outputs
              dummy={false}
              formulas={props.formulas}
              want={example.want}
              row={i}
            />
            <td>{/* empty cell to align with top level formula dummy input */}</td>
            <Want
              dummy={false}
              want={example.want}
            />
          </tr>
    ));

    const dummy = (
          <tr key={peekKey(props.paramNames.length)}>
            <td>{/* empty cell to offset rembutton */}</td>
            <Inputs
              dummy={true}
              inputs={props.paramNames.map((_, i) => ({key: peekKey(i)}))}
            />
            <td>{/* empty cell to align with param dummy input */}</td>
            <Outputs
              dummy={true}
              formulas={props.formulas}
            />
            <td>{/* empty cell to align with top level formula dummy input */}</td>
            <Want
              dummy={true}
            />
          </tr>
    );

    return (
        <tbody>
          {[...reals, dummy]}
        </tbody>
    );
}

function Inputs(props) {
    // this looks awful...
    let inputFields = props.inputs.map((input, i) => {
        let error = <div/>;
        if (props.dummy) {
            return (
                <td key={input.key} >
                  <div className='flex_vert'>
                    <div className='flex_horiz'>
                      <ValidatedArea
                        dummy={props.dummy}
                        placeholder={'Input'}
                        text=''
                      />
                    </div>
                    {error}
                  </div>
                </td>
            );

        } else {
            if (input.prog !== yellow) {
                try {
                    interp(input.prog, globalEnv);
                } catch (e) {
                    error = <ErrorMessage error={e}/>
                }
            }

            return (
                <td key={input.key} >
                  <div className='flex_vert'>
                    <div className='flex_horiz'>
                      <ValidatedArea
                        dummy={props.dummy}
                        placeholder={'Input'}
                        text={unparse(input.prog)}
                      />
                    </div>
                    {error}
                  </div>
                </td>
            );

        }
    });

    return (
        <React.Fragment>
          {inputFields}
        </React.Fragment>
    );
}

function Outputs(props) {
    function countWidth(formula) {
        if (!isBooleanFormula(formula)) {
            return 1;
        } else {
            return formula.thenChildren.reduce((acc, child) => acc + countWidth(child), 2);
        }
    }

    if (props.dummy) {
        return (
            <React.Fragment>
            {props.formulas.map((formula) => (
                <td key={formula.key} colSpan={countWidth(formula)}>{/* empty cell */}</td>
            ))}
            </React.Fragment>
        );
    } else {
        return (
            <React.Fragment>
              {props.formulas.map((formula) => (
                  <React.Fragment key={formula.key}>
                    <TestCell
                      output={formula.outputs[props.row]}
                      want={props.want}
                    />
                    {isBooleanFormula(formula) ?
                     <React.Fragment>
                       <Outputs
                         formulas={formula.thenChildren}
                         want={props.want}
                         row={props.row}
                       />
                       <DummyCell
                         parentOutput={formula.outputs[props.row]}
                       />
                     </React.Fragment>
                     : <script/> }
                  </React.Fragment>
              ))}
            </React.Fragment>
        );
    }
}

function TestCell(props) {
    let output = props.output;

    if (output === gray) {
        return (
            <td className={'gray'}>
            </td>
        );
    }

    if (output === pink) {
        return (
            <td className={'pink'}>
            </td>
        );
    }

    if (output === yellow) {
        return (
            <td className={'yellow'}>
            </td>
        );
    }

    if (output instanceof Error) {
        return <td><ErrorMessage error={output}/></td>
    }

    let want;
    try {
        want = interp(props.want, globalEnv);
    } catch (e) {
        want = yellow;
    }

    if (want !== yellow && deepEquals(output, want)) {
        return (
            <td className='output'>
              {unparse(output)}
              <div title={"Yay! It's right!"} className="check">
                <Octicon
                  icon={Check} size="small" verticalAlign="middle"
                  ariaLabel='Yay!'/>
              </div>
            </td>
        )
    } else {
        return (
            <td className='output'>
              {unparse(output)}
            </td>
        );
    }
}

function DummyCell (props) {
    if (props.parentOutput === gray || props.parentOutput.value === false) {
        return (
            <td className={'gray'}>
            </td>
        );
    } else if (props.parentOutput === pink || !isRBOOL(props.parentOutput)) {
        return (
            <td className={'pink'}>
            </td>
        );
    } else {
        return <td></td>;
    }
}

function Want(props) {
    let valueCell;
    if (props.dummy || props.want === yellow) {
        valueCell = <script/>;
    } else {
        try {
            let evalWant = interp(props.want, globalEnv);
            if (deepEquals(evalWant, props.want)) {
                valueCell = <script/>;
            } else {
                valueCell = <td className='output'>{unparse(evalWant)}</td>;
            }
        } catch (e) {
            valueCell = <td><ErrorMessage error={e}/></td>
        }
    }

    if (props.dummy) {
        return (
            <React.Fragment>
              <td>
                <div className='flex_horiz'>
                  <ValidatedArea
                    dummy={props.dummy}
                    placeholder={'Want'}
                    text=''
                  />
                </div>
              </td>
              {valueCell}
            </React.Fragment>
        );
    } else {
        return (
            <React.Fragment>
              <td>
                <div className='flex_horiz'>
                  <ValidatedArea
                    dummy={props.dummy}
                    placeholder={'Want'}
                    text={unparse(props.want)}
                  />
                </div>
              </td>
              {valueCell}
            </React.Fragment>
        );
    }
}

// function DefinitionsArea (props) {
//     let error = <div/>;
//     try {
//         interpPrefix(props.definitions, initEnv);
//     } catch (e) {
//         error = <ErrorMessage error={e}/>
//     }

//     return (
//         <div className='flex_horiz'>
//           <div className='flex_vert no_grow'>
//             <ValidatedArea
//               dummy={false}
//               placeholder='Definitions Area'
//               text={unparsePrefix(props.definitions)}
//             />
//             {error}
//           </div>
//           <div className='grow'>{/* div to prevent this stuff from growing across the screen */}</div>
//         </div>
//     );
// }

class BSLArea extends React.Component {
    constructor (props) {
        super(props);

        let showBSL = false;
        this.state = {showBSL};

        this.toggleDisplay = this.toggleDisplay.bind(this);
    }

    toggleDisplay (e) {
        this.setState((state) => ({showBSL: !state.showBSL}));
    }

    render () {

        let bslArea;
        if (this.state.showBSL) {
            bslArea = (
                <textarea
                  className='bsl_field'
                  rows={20}
                  cols={70}
                  readOnly={true}
                  value={toBSL(this.props.tables, listOrCons, 70, 70)}
                />
            );
        } else {
            bslArea = <div/>;
        }

        return (
            <div className='bsl_io'>
              <div className='bsl_checkbox'>
                <input
                  type='checkbox'
                  id='bsl_toggle'
                  name='bsl_output'
                  onChange={this.toggleDisplay}
                />
                <label htmlFor='bsl_toggle'>Show BSL Output</label>
              </div>
              {bslArea}
            </div>
        );

    }
}

/*
  notes:
  #inputs === #params
  #outputs === #examples
  ---------------------
  |#inputs !== #outputs| (well it can but not always)
  ---------------------
*/
    // constructor(props){
    //     super(props);
    //     let tables = [{examples: [{inputs: [{prog: yellow, key: takeKey()}], want: yellow, key: takeKey()}],
    //                    formulas: [{prog: yellow, outputs: [yellow], key: takeKey()}],
    //                    params: [{name: yellow, key: takeKey()}],
    //                    name: yellow,
    //                    signature: yellow,
    //                    purpose: yellow,
    //                    key: takeKey()}];
    //     let snapshots = [tables];
    //     this.state = {tables, snapshots};

    //     this.programChange = this.programChange.bind(this);
    //     this.render = this.render.bind(this);
    // }
function ShowSnapshot (props) {

    return (
        <div>
          {/* <DefinitionsArea */}
          {/*   definitions={props.definitions} */}
          {/* /> */}
          <Succinct
            tables={props.tables}
          />
          <div className='language_select'>
            <select
              defaultValue='cons'
              onChange={(e) => {
                  if (e.target.value === 'cons'){
                      listOrCons = 'cons';
                      unparse = unparse_cons;
                  } else {
                      listOrCons = 'list';
                      unparse = unparse_list;
                  }
              }}
            >
              <option value='cons'>Beginning Student</option>
              <option value='list'>Beginning Student with List Abbreviations</option>
            </select>
          </div>
          <BSLArea
            tables={props.tables}
          />
        </div>
    );
}

class App extends React.Component {
    constructor (props) {
        super(props);

        // position in the list of snapshots
        let posn = 0;
        this.state = {posn};
    }

    render () {
        let curSnapshot = this.props.snapshots[this.state.posn];
        return (
            <div>
              <ShowSnapshot
                tables={curSnapshot.tables}
                definitions={curSnapshot.definitions}
              />
              <button
                onClick={() => {
                    this.setState((state) => ({posn: (state.posn + 1) % this.props.snapshots.length}));
                }}
              >
                Next
              </button>
              <button
                onClick={() => {
                    this.setState((state) => ({posn: Math.abs(state.posn - 1)}));
                }}
              >
                Previous
              </button>
            </div>
        );
    }
}

export default App;
