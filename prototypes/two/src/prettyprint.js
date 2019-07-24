import {unParse} from './interpreter.js';
import {isBooleanFormula, yellow} from './header.js';

/**************************************
    Thing that Turns Tables Into BSL
**************************************/

// [Table] -> String
function toBSL(program) {
    return program.map(tableToBSL).join('\n\n\n');
}

// Table -> String
function tableToBSL(table) {
    let name = inputToBSL(table.name);
    let params = table.params.map((param) => inputToBSL(param.name)).join(' ');
    let body = table.formulas.map(formulaToBSL).join('\n');
    let check_expects = table.examples.map((example) => (
        `(check-expect (${name} ${example.inputs.map((input) => inputToBSL(input.prog)).join(' ')}) ${inputToBSL(example.want)})`
    )).join('\n');

    return `(define (${name} ${params})\n${body})\n\n${check_expects}`;
}

// Formula -> String
function formulaToBSL(formula) {
    if (isBooleanFormula(formula)) {
        return `(cond [${inputToBSL(formula.prog)} ${formula.thenChildren.map(formulaToBSL).join(' ')}])`;
    } else {
        return inputToBSL(formula.prog);
    }
}

// Input (yellow or string or program) -> String
function inputToBSL(input) {
    if (input === yellow) { // init
        return '...';
    } else if (typeof input === 'string') { // name
        return input;
    } else { // program
        return unParse(input);
    }
}

export default toBSL;
