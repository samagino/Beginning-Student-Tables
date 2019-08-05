import {yellow, isBooleanFormula} from './header.js';

/*********************
    Pretty Printer
*********************/

/***
  Data Definitions
  
  A Doc is one of
    - Nil
    - Compose
    - Nest
    - Text
    - Line
    - Union
  
  A Nil is
    {type: 'nil'}
    
  A Compose is
    {type: 'compose',
     left: Doc,
     right: Doc}
     
  A Nest is
    {type:   'nest',
     indent: Integer,
     rest:   Doc}

  A Text is
     {type: 'text',
      text: String}
      
  A Line is
    {type: 'line'}
     
  A Union is
    {type:  'union',
     left:  Doc,
     right: Doc}
     
  A Pair is
    {doc:    Doc,
     indent: Integer}
***/

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

// String -> Doc -> Doc
function Text (string, doc) {
    return compose(text(string), doc);
}

// Doc
const line = {type: 'line'};

// Integer -> Doc -> Doc
function Line (i, doc) {
    return compose(nest(i, line), doc);
}

// Doc -> Doc -> Doc
function union (docL, docR) {
    return {type: 'union', left: docL, right: docR};
}

function Union (docL, docR) {
    return union(docL, docR);
}

// Doc -> Doc -> Doc
// in the paper this is written as <> and is sometimes called 'concatenate'
//   I prefer the name 'compose' so as to confuse the term with
//   string concatenation
// however it may be confused with function composition...
function compose (docL, docR) {
    // switch(docR.type) {
    // case 'union':
    //     return union(compose(docL, docR.left), compose(docL, docR.right));
    // default:
    //     break;
    // }
    switch (docL.type) {
    case 'nil':
        return docR;
    case 'compose':
        return {type: 'compose', left: docL.left, right: compose(docL.right, docR)};
    case 'union':
        return union(compose(docL.left, docR), compose(docL.right, docR));
    default:
        return {type: 'compose', left: docL, right: docR};
    }
}

// Integer -> Doc -> Doc
function nest (i, doc) {
    switch (doc.type) {
    case 'nil':
        return nil;
    case 'compose':
        return compose(nest(i, doc.left), nest(i, doc.right));
    case 'nest':
        return {type: 'nest', indent: doc.indent + i, rest: doc.rest};
    case 'text':
        return doc;
    case 'line':
        return {type: 'nest', indent: i, rest: doc};
    case 'union':
        return union(nest(i, doc.left), nest(i, doc.right));
    default:
        throw Error(`unnexpected document type: ${doc.type}`);
    }
}

// Doc -> String
function layout (doc) {
    switch (doc.type) {
    case 'nil':
        return '';
    case 'compose':
        return layout(doc.left) + layout(doc.right);
    case 'nest':
        return layout(doc.rest) +  ' '.repeat(doc.indent); // doc.rest has to be a line
    case 'text':
        return doc.text;
    case 'line':
        return '\n';
    default:
        throw Error(`unnexpected document type: ${doc.type}`);
    }
}

// Doc -> Doc
function group (doc) {
    return union(flatten(doc), doc);
}

// Doc -> Doc
function flatten (doc) {
    switch (doc.type) {
    case 'nil':
        return nil;
    case 'compose':
        return compose(flatten(doc.left), flatten(doc.right));
    case 'nest':
        return flatten(doc.rest);
    case 'text':
        return text(doc.text);
    case 'line':
        return text(' ');
    case 'union':
        return flatten(doc.left);
    default:
        throw Error(`unnexpected document type: ${doc.type}`);
    }
}

// Integer -> Integer -> (Doc -> String)
function makePretty (width, ribbon) {

    // Integer -> Integer -> Doc -> Doc
    function best (thisRibbon, current, doc) {
        switch (doc.type) {
        case 'nil':
            return nil;
        case 'compose':
            switch (doc.left.type) {
            case 'text':
                return compose(doc.left, best(thisRibbon, current + doc.left.text.length, doc.right));
            case 'line':
                return compose(line, best(ribbon, 0, doc.right));
            case 'nest':
                return compose(nest(doc.left.indent, line), best(ribbon + doc.left.indent, doc.left.indent, doc.right));
            default:
                throw Error(`unnexpected document type: ${doc.left.type}`);
            }
        case 'union':
            return better(thisRibbon, current,
                          best(thisRibbon, current, doc.left),
                          best(thisRibbon, current, doc.right));
        default:
            throw Error(`unnexpected document type: ${doc.type}`);
        }
    }

    // Integer -> Integer -> Integer -> Doc -> Doc -> Doc
    function better (thisRibbon, current, docL, docR) {
        if (fits(width - current, thisRibbon - current, docL)) {
            return docL;
        } else {
            return docR;
        }
    }

    // Integer -> Integer -> Doc -> Boolean
    function fits(deltaWidth, deltaRibbon, doc) {
        if (deltaWidth < 0 || deltaRibbon < 0) {
            return false;
        }

        switch (doc.type) {
        case 'nil':
            return true;
        case 'compose':
            switch (doc.left.type) {
            case 'text':
                return fits(deltaWidth - doc.left.text.length, deltaRibbon - doc.left.text.length, doc.right);
            case 'line':
                return true;
            default:
                throw Error(`unnexpected document type: ${doc.left.type}`);
            }
        default:
            throw Error(`unnexpected document type: ${doc.type}`);
        }
    }

    // Doc -> String
    function pretty (doc) {
        return layout(best(ribbon, 0, doc));
    }

    return pretty;
}

/***
   Utility Functions
                   ***/

// Doc -> Doc -> Doc
function putSpace (docL, docR) {
    return compose(docL, compose(text(' '), docR));
}

// Doc -> Doc -> Doc
function putLine (docL, docR) {
    return compose(docL, compose(line, docR));
}

// Doc -> Doc -> Doc
function spaceOrLine(docL, docR) {
    return union(putSpace(docL, docR), putLine(docL, docR));
}

// (Doc -> Doc -> Doc) -> [Doc] -> Doc
function folddoc (f, docs) {
    if (docs.length === 0) {
        return nil;
    } else if (docs.length === 1) {
        return docs[0];
    } else {
        return f(docs[0], folddoc(f, docs.splice(1)));
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
// puts more lines between docs
function superstack (docs) {
    return folddoc((docL, docR) => compose(docL, compose(line, compose(line, compose(line, docR)))), docs);
}

// [Doc] -> Doc
// fills available horizontal space
// doesn't work in group()s because group() destroys unions
function fill(docs){
    return folddoc(spaceOrLine, docs);
}

// [Doc] -> Doc
// puts docs right next to eachother
function level (docs) {
    return folddoc(compose, docs);
}

/**************************************
    Thing that Turns Tables Into BSL
**************************************/

// [Table] -> String
function toBSL(program, unparse, width, ribbon) {
    let pretty = makePretty(width, ribbon);
    let essaie = superstack([...program.map(tableToDoc), nil]);
    return pretty(essaie);

    // Table -> Doc
    function tableToDoc(table) {
        let name = inputToDoc(table.name);
        let params = spread(table.params.map((param) => inputToDoc(param.name)));

        let checkExpects = stack(table.examples.map((example) => {
            let inputs = stack(example.inputs.map((input) => inputToDoc(input.prog)));
            let want = inputToDoc(example.want);

            return group(nest(1, stack([text('(check-expect'), nest(1, stack([level([text('('), name]), level([inputs, text(')')])])), level([want, text(')')])])));
        }));

        let body = stack(table.formulas.map(formulaToDoc));
        let funct = nest(2, group(stack([spread([text('(define'), level([text('('), name]), level([params, text(')')])]), level([body, text(')')])])));
        return stack([funct, line, checkExpects]);
    }

    // Formula -> Doc
    function formulaToDoc(formula) {
        if (isBooleanFormula(formula)) {
            let children = spread(formula.thenChildren.map(formulaToDoc));
            return nest(2, stack([text('(cond'), nest(1, stack([level([text('['), inputToDoc(formula.prog)]), level([children, text('])')])]))]));
        } else {
            return inputToDoc(formula.prog);
        }
    }

    // Input (yellow or string or program) -> Doc
    function inputToDoc(input) {
        if (input === yellow) { // empty
            return text('...');
        } else if (typeof input === 'string') { // string
            return text(input);
        } else { // program
            return text(unparse(input));
        }
    }
}


export default toBSL;
