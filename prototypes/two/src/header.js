import {isRBOOL} from './interpreter.js';

/************
    Colors
************/

// value to put in child formulas that don't have an output for that row
export const gray = {gray: 'gray'};
// value to put in child formulas that have an error output for that row (non-boolean and non-gray)
export const pink = {pink: 'pink'};
// value that indicates an uninitialized input
export const yellow = {yellow: 'yellow'};

/*********************
   Functions I Want
*********************/
// [Program] -> Boolean
// returns true if progs has at least one member and all of its members are boooleans
//    otherwise returns false
export function allBools(progs){
    if (progs.length === 0 || progs.every((prog) => prog === gray)) {
        return false;
    }

    return progs.every((prog) => prog === gray || isRBOOL(prog));
}

export function isBooleanFormula(formula) {
    return allBools(formula.outputs) || formula.thenChildren !== undefined;
}

