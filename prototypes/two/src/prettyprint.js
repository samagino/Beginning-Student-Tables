import {yellow, isBooleanFormula} from './header.js';
import {RVAR_T, RAPP_T, RFUNCT_T, RNUM_T, RBOOL_T, RSTRING_T, RLIST_T, RSYM_T} from './interpreter.js';

/*********************
    Pretty Printer
*********************/

/***
    Data Definitions

    a DOC is one of
    - NIL
    - TEXT
    - LINE

    A NIL is
    () => {type: 'NIL'}

    A TEXT is
    () => {type: 'TEXT',
    text: String,
    rest: DOC}

    A LINE is
    () => {type: 'LINE',
    indent: Integer,
    rest: DOC}

    A Doc is one of
    - Nil
    - Concat
    - Nest
    - Text
    - Line
    - Union

    A Nil is
    {type: 'nil'}
    A Nest is
    {type:   'nest',
    indent: Integer,
    rest:   Doc}

    A Text is
    {type: 'text',
    text: String}

    A Line is
    {type: 'line'}

    A Concat is
    {type: 'concat',
    left: Doc,
    right: () => Doc}

    A Union is
    {type:  'union',
    left:  Doc,
    right: () => Doc}

    A Pair is
    {doc:    Doc,
    indent: Integer}
***/

// DOC
const NIL = () => ({type: 'NIL'});

// Doc
const nil = {type: 'nil'};

// String -> Doc
function text (string) {
    if (string === '') {
        return nil;
    } else {
        return {type: 'text', text: String(string)};
    }
}

// Doc
const line = {type: 'line'};

// Doc, () => Doc -> Doc
function union (docL, docR) {
    if (typeof docR !== 'function') {
        throw new Error("docR isn't a thunk");
    }
    return {type: 'union', left: docL, right: docR};
}

// Doc, () => Doc -> Doc
function concat (docL, docR) {
    if (typeof docR !== 'function') {
        throw new Error("docR isn't a thunk");
    }
    // switch(docR.type) {
    // case 'union':
    //     return union(concat(docL, docR.left), concat(docL, docR.right));
    // default:
    //     break;
    // }
    switch (docL.type) {
        case 'nil':
            return docR();
        case 'concat':
            return {type: 'concat', left: docL.left, right: () => concat(docL.right(), docR)};
        case 'union':
            return union(concat(docL.left, docR), () => concat(docL.right(), docR));
        default:
            return {type: 'concat', left: docL, right: docR};
    }
}

// Integer -> Doc
function nest (i, doc) {
    switch (doc.type) {
        case 'nil':
            return nil;
        case 'concat':
            return concat(nest(i, doc.left), () => nest(i, doc.right()));
        case 'nest':
            return {type: 'nest', indent: doc.indent + i, rest: doc.rest};
        case 'text':
            return doc;
        case 'line':
            return {type: 'nest', indent: i, rest: doc};
        case 'union':
            return union(nest(i, doc.left), () => nest(i, doc.right()));
        default:
            throw Error(`unnexpected document type: ${doc.type}`);
    }
}

// DOC -> String
function layout (thunk) {

    let doc = thunk();

    switch (doc.type) {
        case 'NIL':
            return '';
        case 'TEXT':
            return doc.text + layout(doc.rest);
        case 'LINE':
            return '\n' + ' '.repeat(doc.indent) + layout(doc.rest);
        default:
            throw Error(`unnexpected DOCUMENT type: ${doc.type}`);
    }
}

// Doc -> Doc
function group (doc) {
    return union(flatten(doc), () => doc);
}

// Doc -> Doc
function flatten (doc) {
    switch (doc.type) {
        case 'nil':
            return nil;
        case 'concat':
            return concat(flatten(doc.left), () => flatten(doc.right()));
        case 'nest':
            return flatten(doc.rest);
        case 'text':
            return doc;
        case 'line':
            return text(' ');
        case 'union':
            return flatten(doc.left);
        default:
            throw Error(`unnexpected document type: ${doc.type}`);
    }
}

// Integer, Integer -> (Doc -> String)
function makePretty (width, ribbon) {

    // Integer, Integer, Doc -> DOC
    function best (thisRibbon, current, doc) {
        return be(thisRibbon, current, [{indent: 0, doc: doc}]);
    }

    // DOC -> DOC
    function memoize(thunk) {
        let seen = false;
        let value;

        return () => {
            if (seen) {
                return value;
            } else {
                seen = true;
                value = thunk();
                return value;
            }
        };
    }

    // Integer, Integer, [Pair] -> DOC
    function be (r, k, pairs) {
        if (pairs.length === 0) {
            return NIL;
        }

        let doc = pairs[0].doc;
        let indent = pairs[0].indent;
        let rest = pairs.slice(1);

        switch (doc.type) {
            case 'nil':
                return be(r, k, rest);
            case 'concat':
                return be(r, k, [{indent, doc: doc.left}, {indent, doc: doc.right()}, ...rest]);
            case 'nest':
                return be(r, k, [{indent: indent + doc.indent, doc: doc.rest}, ...rest]);
            case 'text':
                if (doc.text === '') {
                    return NIL;
                } else {
                    return memoize(() => ({type: 'TEXT', text: doc.text, rest: memoize(() => (be(r, k + doc.text.length, rest)()))}));
                }
            case 'line':
                return memoize(() => ({type: 'LINE', indent: indent, rest: memoize(() => (be(r + indent, indent, rest)()))}));
            case 'union':
                return better(r, k, be(r, k, [{indent, doc: doc.left}, ...rest]),
                                    memoize(() => (be(r, k, [{indent, doc: doc.right()}, ...rest])())));
            default:
                console.log(doc());
                throw Error(`unnexpected document type: ${doc.type}`);
        }
    }

    // Integer, Integer, Integer, DOC, DOC -> DOC
    function better (thisRibbon, current, docL, docR) {
        if (fits(width - current, thisRibbon - current, docL)) {
            return docL;
        } else {
            return docR;
        }
    }

    // Integer, Integer, DOC -> Boolean
    function fits(diffWidth, diffRibbon, thunk) {
        if (diffWidth < 0 || diffRibbon < 0) {
            return false;
        }

        let doc = thunk();

        switch (doc.type) {
            case 'NIL':
                return true;
            case 'TEXT':
                return fits(diffWidth - doc.text.length, diffRibbon - doc.text.length, doc.rest);
            case 'LINE':
                return true;
            default:
                throw Error(`unnexpected DOCUMENT type: ${doc.type}`);
        }
    }

    function pretty (doc) {
        return layout(best(ribbon, 0, doc));
    }

    return pretty;
}

/***
    Utility Functions
***/

// Doc, Doc -> Doc
function putSpace (docL, docR) {
    return concat(docL, () => concat(text(' '), () => docR));
}

// Doc, Doc -> Doc
function putLine (docL, docR) {
    return concat(docL, () => concat(line, () => docR));
}

// Doc, Doc -> Doc
function compose (docL, docR) {
    return concat(docL, () => docR);
}

// (Doc -> Doc -> Doc), [Doc] -> Doc
function folddoc (f, docs) {
    if (docs.length === 0) {
        return nil;
    } else if (docs.length === 1) {
        return docs[0];
    } else {
        return f(docs[0], folddoc(f, docs.slice(1)));
    }
}

// [Doc] -> Doc
// puts a space between docs
function spread (docs) {
    return folddoc(putSpace, docs);
}

// [Doc] -> Doc
// puts a line between docs
function stack (docs) {
    return folddoc(putLine, docs);
}

// [Doc] -> Doc
// puts docs right next to eachother
function level (docs) {
    return folddoc(compose, docs);
}

// String -> Doc -> String -> Doc
// puts the given document between left and right
function bracket (left, doc, right) {
    return level([text(left), doc, text(right)]);
}

/**************************************
    Thing that Turns Tables Into BSL
**************************************/

// Program -> Doc
function progToDoc_cons (program) {
    switch (program.type) {
        case RVAR_T:
            return text(program.value);
        case RAPP_T:
            return nest(1, bracket('(', group(stack([progToDoc_cons(program.value.funct), ...program.value.args.map(progToDoc_cons)])), ')'));
        case RFUNCT_T:
            return text('function');
        case RNUM_T:
            return text(program.value);
        case RBOOL_T:
            return text('#' + program.value);
        case RSTRING_T:
            return text('"' + program.value + '"');
        case RLIST_T: // this just does cons, not list
            if (program.value === null) {
                return text("'()");
            } else {
                return nest(1, bracket('(', group(stack([text('cons'), progToDoc_cons(program.value.a), progToDoc_cons(program.value.d)])), ')'));
            }
        case RSYM_T:
            return text("'" + program.value);
        default:
            throw new Error('unknown program type');
    }
}

// Program -> Doc
function progToDoc_list (program) {
    switch (program.type) {
        case RVAR_T:
            return text(program.value);
        case RAPP_T:
            return nest(1, bracket('(', group(stack([progToDoc_list(program.value.funct), ...program.value.args.map(progToDoc_list)])), ')'));
        case RFUNCT_T:
            return text('function');
        case RNUM_T:
            return text(program.value);
        case RBOOL_T:
            return text('#' + program.value);
        case RSTRING_T:
            return text('"' + program.value + '"');
        case RLIST_T:
            if (program.value === null) {
                return text("'()");
            }

            let list = program.value.d,
                elems = progToDoc_list(program.value.a);
            while (list.value !== null) {
                elems = stack([elems, progToDoc_list(list.value.a)]);
                list = list.value.d;
            }

            return bracket('(', spread([text('list'), group(elems)]), ')');
        case RSYM_T:
            return text("'" + program.value);
        default:
            throw new Error('unknown program type');
    }
}

// [Table] -> String
function toBSL(tables, listOrCons, width, ribbon) {
    // TODO make me work better somehow
    let progToDoc;
    if (listOrCons === 'cons') {
        progToDoc = progToDoc_cons;
    } else {
        progToDoc = progToDoc_list;
    }

    let pretty = makePretty(width, ribbon);
    let tableBSLs = tables.map((table) => pretty(tableToDoc(table))).join('');
    return tableBSLs;

    // Table -> Doc
    function tableToDoc(table) {
        let name = fieldToDoc(table.name);
        let sig = fieldToDoc(table.signature);
        let purp = fieldToDoc(table.purpose);
        let params = spread(table.params.map((param) => fieldToDoc(param.name)));

        let checkExpects = stack(table.examples.map((example) => {
            let inputs = stack(example.inputs.map((input) => fieldToDoc(input.prog)));
            let want = fieldToDoc(example.want);

            return nest(1, bracket('(', group(stack([text('check-expect'), bracket('(', nest(1, stack([name, inputs])), ')'), want])), ')'));
        }));

        let body = formulasToDoc(table.formulas);
        let signature = spread([text(';;'), name, text(':'), sig]);
        let purpose = spread([text(';;'), purp]);
        let funct = nest(2, bracket('(', spread([text('define'), stack([bracket('(', spread([name, params]), ')'), body])]), ')'));
        return stack([signature, purpose, funct, nil, checkExpects, line]);
    }

    // [Formula] -> Doc
    function formulasToDoc(formulas) {
        // [Formula] -> {bools: [Formula], nonbools: [Formula]}
        function splitFormulas(formulas) {
            let bools = formulas.filter(isBooleanFormula);
            let nonbools = formulas.filter((formula) => !isBooleanFormula(formula));
            return {bools, nonbools};
        }

        let splitForms = splitFormulas(formulas);

        // this one's a doc
        let nonbools = stack(splitForms.nonbools.map((form) => fieldToDoc(form.prog))),
            bools;

        if (splitForms.bools.length !== 0) {
            // this is an array of documents
            let condRows = splitForms.bools.map((form) => (
                nest(1, bracket('[', stack([fieldToDoc(form.prog), formulasToDoc(form.thenChildren)]),']'))
            ));
            // this one is just a doc
            bools = nest(2, bracket('(', stack([text('cond'), ...condRows]),')'));
        }

        if (splitForms.bools.length !== 0 && splitForms.nonbools.length !== 0) {
            return stack([bools, nonbools]);
        } else if (splitForms.bools.length !== 0) {
            return bools;
        } else if (splitForms.nonbools.length !== 0) {
            return nonbools;
        } else {
            return nil;
        }
    }

    // Field (yellow or string or program) -> Doc
    function fieldToDoc(input) {
        if (input === yellow) {                 // empty
            return text('...');
        } else if (typeof input === 'string') { // name
            return text(input);
        } else {                                // program
            return progToDoc(input);
        }
    }
}

/****************
    Unparsers
****************/
const widePretty = makePretty(Infinity, Infinity);

export let unparse_cons = (prog) => widePretty(progToDoc_cons(prog));
export let unparse_list = (prog) => widePretty(progToDoc_list(prog));

export default toBSL;
