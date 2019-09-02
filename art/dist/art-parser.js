// data ParserState e a s
// data Parser e a s = { p: ParserState e a s }
// data StateData a s = { result: a, data: s }
// data ParsingResult e a = Ok a | Error e

//    createParserState :: x -> s -> ParserState e a s
const createParserState = (target, data = null) => ({
  isError: false,
  error: null,
  target,
  data,
  index: 0,
  result: null
});

//    updateError :: (ParserState e a s, f) -> ParserState f a s
const updateError = (state, error) => ({ ...state, isError: true, error });

//    updateResult :: (ParserState e a s, b) -> ParserState e b s
const updateResult = (state, result) => ({ ...state, result });

//    updateData :: (ParserState e a s, t) -> ParserState e b t
const updateData = (state, data) => ({ ...state, data });

//    updateResult :: (ParserState e a s, b, Integer) -> ParserState e b s
const updateParserState = (state, result, index) => ({ ...state, result, index });

//         data Parser e a s
function Parser(p) {
  this.p = p;
}
//               run :: Parser e a s ~> x -> Either e a
Parser.prototype.run = function Parser$run(targetString) {
  const state = createParserState(targetString, null);

  const resultState = this.p(state);

  if (resultState.isError) {
    return {
      isError: true,
      error: resultState.error,
      index: resultState.index,
      data: resultState.data
    };
  }

  return {
    isError: false,
    result: resultState.result,
    index: resultState.index,
    data: resultState.data
  };
};

//               fork :: Parser e a s ~> x -> (e -> ParserState e a s -> f) -> (a -> ParserState e a s -> b)
Parser.prototype.fork = function Parser$run(targetString, errorFn, successFn) {
  const state = createParserState(targetString);
  const newState = this.p(state);

  if (newState.isError) {
    return errorFn(newState.error, newState);
  }

  return successFn(newState.result, newState);
};

//               map :: Parser e a s ~> (a -> b) -> Parser e b s
Parser.prototype['fantasy-land/map'] = function Parser$map(fn) {
  const p = this.p;
  return new Parser(function Parser$map$state (state) {
    const newState = p(state);
    if (newState.isError) return newState;
    return updateResult(newState, fn(newState.result));
  });
};

//                chain :: Parser e a s ~> (a -> Parser e b s) -> Parser e b s
Parser.prototype['fantasy-land/chain'] = function Parser$chain(fn) {
  const p = this.p;
  return new Parser(function Parser$chain$state(state) {
    const newState = p(state);
    if (newState.isError) return newState;
    return fn(newState.result).p(newState);
  });
};

//               ap :: Parser e a s ~> Parser e (a -> b) s -> Parser e b s
Parser.prototype['fantasy-land/ap'] = function Parser$ap(parserOfFunction) {
  const p = this.p;
  return new Parser(function Parser$ap$state(state) {
    if (state.isError) return state;

    const argumentState = p(state);
    if (argumentState.isError) return argumentState;

    const fnState = parserOfFunction.p(argumentState);
    if (fnState.isError) return fnState;

    return updateResult(fnState, fnState.result(argumentState.result));
  });
};

//               errorMap :: Parser e a s ~> (e -> f) -> Parser f a s
Parser.prototype.errorMap = function Parser$errorMap(fn) {
  const p = this.p;
  return new Parser(function Parser$errorMap$state(state) {
    const nextState = p(state);
    if (!nextState.isError) return nextState;

    return updateError(nextState, fn(nextState.error, nextState.index, nextState.data));
  });
};

//               errorChain :: Parser e a s ~> ((e, Integer, s) -> Parser f a s) -> Parser f a s
Parser.prototype.errorChain = function Parser$errorMap(fn) {
  const p = this.p;
  return new Parser(function Parser$errorMap$state(state) {
    const nextState = p(state);
    if (nextState.isError) {
      const {error, index, data} = nextState;
      const nextParser = fn({error, index, data});
      return nextParser.p({ ...nextState, isError: false });
    }
    return nextState;
  });
};

//               mapFromData :: Parser e a s ~> (StateData a s -> b) -> Parser e b s
Parser.prototype.mapFromData = function Parser$mapFromData(fn) {
  const p = this.p;
  return new Parser(function Parser$mapFromData$state (state) {
    const newState = p(state);
    if (newState.error) return newState;
    return updateResult(newState, fn({result: newState.result, data: newState.data}));
  });
};

//               chainFromData :: Parser e a s ~> (StateData a s -> Parser f b t) -> Parser f b t
Parser.prototype.chainFromData = function Parser$chainFromData(fn) {
  const p = this.p;
  return new Parser(function Parser$chainFromData$state(state) {
    const newState = p(state);
    if (newState.error) return newState;
    return fn({result: newState.result, data: newState.data}).p(newState);
  });
};

//               mapData :: Parser e a s ~> (s -> t) -> Parser e a t
Parser.prototype.mapData = function mapData(fn) {
  const p = this.p;
  return new Parser(function mapData$state(state) {
    const newState = p(state);
    return updateData(newState, fn(newState.data));
  });
};

//                   of :: a -> Parser e a s
Parser['fantasy-land/of'] = function (x) {
  return new Parser(state => updateResult(state, x));
};

Parser.prototype.map = Parser.prototype['fantasy-land/map'];
Parser.prototype.ap = Parser.prototype['fantasy-land/ap'];
Parser.prototype.chain = Parser.prototype['fantasy-land/chain'];
Parser.of = Parser['fantasy-land/of'];

//           getData :: Parser e a s
const getData = new Parser(function getData$state(state) {
  if (state.isError) return state;
  return updateResult(state, state.data);
});

//           setData :: t -> Parser e a t
const setData = function setData(x) {
  return new Parser(function setData$state(state) {
    if (state.isError) return state;
    return updateData(state, x)
  });
};

//           mapData :: (s -> t) -> Parser e a t
const mapData = function mapData(fn) {
  return new Parser(function mapData$state(state) {
    if (state.isError) return state;
    return updateData(state, fn(state.data));
  });
};

//           withData :: Parser e a x -> s -> Parser e a s
const withData = function withData(parser) {
  return function withData$parser(stateData) {
    return setData(stateData).chain(() => parser);
  };
};

//           pipeParsers :: [Parser * * *] -> Parser * * *
const pipeParsers = function pipeParsers (parsers) {
  return new Parser(function pipeParsers$state (state) {
    let nextState = state;
    for (const parser of parsers) {
      nextState = parser.p(nextState);
    }
    return nextState;
  });
};

//           composeParsers :: [Parser * * *] -> Parser * * *
const composeParsers = function composeParsers(parsers) {
  return new Parser(function composeParsers$state(state) {
    return pipeParsers ([...parsers].reverse()).p(state);
  });
};

//           tapParser :: (a => ()) -> Parser e a s
const tapParser = function tapParser(fn) {
  return new Parser(function tapParser$state(state) {
    fn(state);
    return state;
  });
};

//           parse :: Parser e a s -> String -> Either e a
const parse = function parse(parser) {
  return function parse$targetString(targetString) {
    return parser.run(targetString);
  };
};

//           decide :: (a -> Parser e b s) -> Parser e b s
const decide = function decide(fn) {
  return new Parser(function decide$state(state) {
    if (state.isError) return state;
    const parser = fn(state.result);
    return parser.p(state);
  });
};

//           fail :: e -> Parser e a s
const fail = function fail(errorMessage) {
  return new Parser(function fail$state(state) {
    if (state.isError) return state;
    return updateError(state, errorMessage);
  });
};

//           succeedWith :: a -> Parser e a s
const succeedWith = Parser.of;

//           either :: Parser e a s -> Parser e (Either e a) s
const either = function either(parser) {
  return new Parser(function either$state(state) {
    if (state.isError) return state;

    const nextState = parser.p(state);

    return updateResult({...nextState, isError: false}, {
      isError: nextState.isError,
      value: nextState.isError ? nextState.error : nextState.result
    });
  });
};

//           coroutine :: (() -> Iterator (Parser e a s)) -> Parser e a s
const coroutine = function coroutine(g) {
  return Parser.of().chain(_ => {
    const generator = g();

    const step = nextValue => {
      const result = generator.next(nextValue);
      const value = result.value;
      const done = result.done;

      if (!done && (!value || typeof value.chain !== 'function')) {
        throw new Error(`[coroutine] yielded values must be Parsers, got ${result.value}.`);
      }

      return done ? Parser.of(value) : value.chain(step);
    };

    return step();
  });
};

//           many :: Parser e s a -> Parser e s [a]
const many = function many(parser) {
  return new Parser(function many$state(state) {
    if (state.isError) return state;

    const results = [];
    let nextState = state;

    while (true) {
      const out = parser.p(nextState);

      if (out.isError) {
        break;
      } else {
        nextState = out;
        results.push(nextState.result);

        if (nextState.index >= nextState.target.length) {
          break;
        }
      }
    }

    return updateResult(nextState, results);
  });
};

//           many1 :: Parser e s a -> Parser e s [a]
const many1 = function many1(parser) {
  return new Parser(function many1$state(state) {
    if (state.isError) return state;

    const resState = many (parser).p(state);
    if (resState.result.length) return resState;

    return updateError(state, `ParseError 'many1' (position ${state.index}): Expecting to match at least one value`);
  });
};

//           mapTo :: (a -> b) -> Parser e b s
const mapTo = function mapTo(fn) {
  return new Parser(function mapTo$state(state) {
    if (state.isError) return state;
    return updateResult(state, fn(state.result));
  });
};

//           errorMapTo :: (ParserState e a s -> f) -> Parser f a s
const errorMapTo = fn => new Parser(state => {
  if (!state.isError) return state;
  return updateError(state, fn(state.error, state.index, state.data));
});

//           char :: Char -> Parser e Char s
const char = function char(c) {
  if (!c || c.length !== 1) {
    throw new TypeError (`char must be called with a single character, but got ${c}`);
  }

  return new Parser(function char$state (state) {
    if (state.isError) return state;

    const {target, index} = state;
    if (index < target.length) {
      return (target[index] === c)
        ? updateParserState(state, c, index + 1)
        : updateError(state, `ParseError (position ${index}): Expecting character '${c}', got '${target[index]}'`);
    }
    return updateError(state, `ParseError (position ${index}): Expecting character '${c}', but got end of input.`);
  });
};

//           str :: String -> Parser e String s
const str = function str(s) {
  if (!s || s.length < 1) {
    throw new TypeError (`str must be called with a string with length > 1, but got ${s}`);
  }

  return new Parser(function str$state (state) {
    const {target, index} = state;
    const rest = target.slice(index);

    if (rest.length >= 1) {
      return (rest.startsWith(s))
        ? updateParserState(state, s, index + s.length)
        : updateError(state, `ParseError (position ${index}): Expecting string '${s}', got '${rest.slice(0, s.length)}...'`);
    }

    return updateError(state, `ParseError (position ${index}): Expecting string '${s}', but got end of input.`);
  });
};

//           regex :: RegExp -> Parser e String s
const regex = function regex(re) {
  const typeofre = Object.prototype.toString.call(re);
  if (typeofre !== '[object RegExp]') {
    throw new TypeError (`regex must be called with a Regular Expression, but got ${typeofre}`);
  }

  if (re.toString()[1] !== '^') {
    throw new Error(`regex parsers must contain '^' start assertion.`)
  }

  return new Parser(function regex$state(state) {
    if (state.isError) return state;
    const {target, index} = state;
    const rest = target.slice(index);

    if (rest.length >= 1) {
      const match = rest.match(re);
      return (match)
        ? updateParserState(state, match[0], index + match[0].length)
        : updateError(state, `ParseError (position ${index}): Expecting string matching '${re}', got '${rest.slice(0, 5)}...'`)
    }
    return updateError(state, `ParseError (position ${index}): Expecting string matching '${re}', but got end of input.`);
  });
};

//           digit :: Parser e String s
const digit = new Parser(function digit$state(state) {
  if (state.isError) return state;

  const {target, index} = state;

  if (target.length > index) {
    return (target.length && target[index] && /[0-9]/.test(target[index]))
      ? updateParserState(state, target[index], index + 1)
      : updateError(state, `ParseError (position ${index}): Expecting digit, got '${target[index]}'`)
  }
  return updateError(state, `ParseError (position ${index}): Expecting digit, but got end of input.`);
});

//           digits :: Parser e String s
const digits = many1(digit)
  .map(x => x.join(''))
  .errorMap((_, index) => `ParseError (position ${index}): Expecting digits`);

//           letter :: Parser e Char s
const letter = new Parser(function letter$state(state) {
  if (state.isError) return state;

  const {index, target} = state;

  if (target.length > index) {
    return (target.length && target[index] && /[a-zA-Z]/.test(target[index]))
      ? updateParserState(state, target[index], index + 1)
      : updateError(state, `ParseError (position ${index}): Expecting letter, got '${target[index]}'`);
  }

  return updateError(state, `ParseError (position ${index}): Expecting letter, but got end of input.`);
});

//           letters :: Parser e String s
const letters = many1(letter)
  .map(x => x.join(''))
  .errorMap((_, index) => `ParseError (position ${index}): Expecting letters`);

//           anyOfString :: String -> Parser e Char s
const anyOfString = function anyOfString(s) {
  return new Parser(function anyOfString$state(state) {
    if (state.isError) return state;

    const {target, index} = state;

    if (target.length > index) {
      return (s.includes(target[index]))
        ? updateParserState(state, target[index], index + 1)
        : updateError(state, `ParseError (position ${index}): Expecting any of the string "${s}", got ${target[index]}`);
    }
    return updateError(state, `ParseError (position ${index}): Expecting any of the string "${s}", but got end of input.`);
  });
};

//           namedSequenceOf :: [(String, Parser * * *)] -> Parser e (StrMap *) s
const namedSequenceOf = function namedSequenceOf(pairedParsers) {
  return new Parser(function namedSequenceOf$state(state) {
    if (state.isError) return state;

    const results = {};
    let nextState = state;

    for (const [key, parser] of pairedParsers) {
      const out = parser.p(nextState);
      if (out.isError) {
        return out;
      } else {
        nextState = out;
        results[key] = out.result;
      }
    }

    return updateResult(nextState, results);
  });
};

//           sequenceOf :: [Parser * * *] -> Parser * [*] *
const sequenceOf = function sequenceOf(parsers) {
  return new Parser(function sequenceOf$state(state) {
    if (state.isError) return state;

    const results = new Array(parsers.length);
    let nextState = state;

    for (let i = 0; i < parsers.length; i++) {
      const out = parsers[i].p(nextState);

      if (out.isError) {
        return out;
      } else {
        nextState = out;
        results[i] = out.result;
      }
    }

    return updateResult(nextState, results);
  });
};

//           sepBy :: Parser e a s -> Parser e b s -> Parser e [b] s
const sepBy = function sepBy(sepParser) {
  return function sepBy$valParser(valParser) {
    return new Parser(function sepBy$valParser$state(state) {
      if (state.isError) return state;

      let nextState = state;
      let error = null;
      const results = [];

      while (true) {
        const valState = valParser.p(nextState);
        const sepState = sepParser.p(valState);

        if (valState.isError) {
          error = valState;
          break;
        } else {
          results.push(valState.result);
        }

        if (sepState.isError) {
          nextState = valState;
          break;
        }

        nextState = sepState;
      }

      if (error) {
        if (results.length === 0) {
          return updateResult(state, results)
        }
        return error;
      }

      return updateResult(nextState, results);
    });
  }
};

//           sepBy1 :: Parser e a s -> Parser e b s -> Parser e [b] s
const sepBy1 = function sepBy1(sepParser) {
  return function sepBy1$valParser(valParser) {
    return new Parser(function sepBy1$valParser$state(state) {
      if (state.isError) return state;

      const out = sepBy(sepParser)(valParser).p(state);
      if (out.isError) return out;
      if (out.result.length === 0) {
        return updateError(state, `ParseError 'sepBy1' (position ${state.index}): Expecting to match at least one separated value`);
      }
      return out;
    });
  }
};

//           choice :: [Parser * * *] -> Parser * * *
const choice = function choice(parsers) {
  return new Parser(function choice$state(state) {
    if (state.isError) return state;

    let error = null;
    for (const parser of parsers) {
      const out = parser.p(state);

      if (!out.isError) return out;

      if (!error || (error && out.index > error.index)) {
        error = out;
      }
    }

    return error;
  });
};

//           between :: Parser e a s -> Parser e b s -> Parser e c s -> Parser e b s
const between = function between(leftParser) {
  return function between$rightParser(rightParser) {
    return function between$rightParser(parser) {
      return sequenceOf ([
        leftParser,
        parser,
        rightParser
      ]) .map (([_, x]) => x);
    }
  }
};

//           everythingUntil :: Parser e a s -> Parser e String s
const everythingUntil = function everythingUntil(parser) {
  return new Parser(state => {
    if (state.isError) return state;

    const results = [];
    let nextState = state;

    while (true) {
      const out = parser.p(nextState);

      if (out.isError) {
        const {index, target} = nextState;
        const val = target[index];

        if (val) {
          results.push(val);
          nextState = updateParserState(nextState, val, index + 1);
        } else {
          return updateError(nextState, `ParseError 'everythingUntil' (position ${nextState.index}): Unexpected end of input.`);
        }
      } else {
        break;
      }
    }

    return updateResult(nextState, results.join(''));
  });
};

//           anythingExcept :: Parser e a s -> Parser e Char s
const anythingExcept = function anythingExcept(parser) {
  return new Parser(function anythingExcept$state(state) {
    if (state.isError) return state;
    const {target, index} = state;

    const out = parser.p(state);
    if (out.isError) {
      return updateParserState(state, target[index], index + 1);
    }
    return updateError(state, `ParseError 'anythingExcept' (position ${index}): Matched '${out.result}' from the exception parser`);
  });
};

//           lookAhead :: Parser e a s -> Parser e a s
const lookAhead = function lookAhead(parser) {
  return new Parser(function lookAhead$state(state) {
    if (state.isError) return state;
    const nextState = parser.p(state);
    return (nextState.isError)
      ? nextState
      : updateResult(state, nextState.result);
  });
};

//           possibly :: Parser e a s -> Parser e (a | Null) s
const possibly = function possibly(parser) {
  return new Parser(function possibly$state(state) {
    if (state.isError) return state;

    const nextState = parser.p(state);
    return (nextState.isError)
      ? updateResult(state, null)
      : nextState;
  });
};

//           skip :: Parser e a s -> Parser e a s
const skip = function skip(parser) {
  return new Parser(function skip$state(state) {
    if (state.isError) return state;
    const nextState = parser.p(state);
    if (nextState.isError) return nextState;

    return updateResult(nextState, state.result);
  });
};

//           endOfInput :: Parser e Null s
const endOfInput = new Parser(function endOfInput$state(state) {
  if (state.isError) return state;
  const {target, index} = state;
  if (index !== target.length) {
    return updateError(state, `ParseError 'endOfInput' (position ${index}): Expected end of input but got '${target.slice(index, index+1)}'`);
  }

  return updateResult(state, null);
});

//           whitespace :: Parser e String s
const whitespace =  many1 (anyOfString (' \n\t\r')) .map (x => x.join(''));

//           optionalWhitespace :: Parser e String s
const optionalWhitespace = many (anyOfString (' \n\t\r')) .map (x => x.join(''));

//           recursiveParser :: (() => Parser e a s) -> Parser e a s
const recursiveParser = function recursiveParser(parserThunk) {
  return new Parser(function recursiveParser$state(state) {
    return parserThunk().p(state);
  });
};

//           takeRight :: Parser e a s -> Parser f b t -> Parser f b t
const takeRight = lParser => rParser => lParser.chain(() => rParser);

//           takeLeft :: Parser e a s -> Parser f b t -> Parser e a s
const takeLeft = lParser => rParser => lParser.chain(x => rParser.map(() => x));

//           toPromise :: ParserResult e a s -> Promise (e, Integer, s) a
const toPromise = result => {
  return result.isError
    ? Promise.reject({
      error: result.error,
      index: result.index,
      data: result.data
    })
    : Promise.resolve(result.result);
};

//           toValue :: ParserResult e a s -> a
const toValue = result => {
  if (result.isError) {
    const e = new Error(result.error);
    e.parseIndex = result.index;
    e.data = result.data;
    throw e;
  }
  return result.result;
};

var arcsecond = /*#__PURE__*/Object.freeze({
  Parser: Parser,
  getData: getData,
  setData: setData,
  mapData: mapData,
  withData: withData,
  pipeParsers: pipeParsers,
  composeParsers: composeParsers,
  tapParser: tapParser,
  parse: parse,
  decide: decide,
  fail: fail,
  succeedWith: succeedWith,
  either: either,
  coroutine: coroutine,
  many: many,
  many1: many1,
  mapTo: mapTo,
  errorMapTo: errorMapTo,
  char: char,
  str: str,
  regex: regex,
  digit: digit,
  digits: digits,
  letter: letter,
  letters: letters,
  anyOfString: anyOfString,
  namedSequenceOf: namedSequenceOf,
  sequenceOf: sequenceOf,
  sepBy: sepBy,
  sepBy1: sepBy1,
  choice: choice,
  between: between,
  everythingUntil: everythingUntil,
  anythingExcept: anythingExcept,
  lookAhead: lookAhead,
  possibly: possibly,
  skip: skip,
  endOfInput: endOfInput,
  whitespace: whitespace,
  optionalWhitespace: optionalWhitespace,
  recursiveParser: recursiveParser,
  takeRight: takeRight,
  takeLeft: takeLeft,
  toPromise: toPromise,
  toValue: toValue
});

// Hack
// ES6 and NodeJS imports P in different ways
// ES6 cannot find a default import, NodeJS finds it
// so P is the import *, unless there is a default export
let P = arcsecond;
if (undefined) {
  P = undefined;
}

const node = (type, payload) => ({ type, payload });
const strLimit = P.char("'");
const betweenParenthesis = P.between(P.char('('))(P.char(')'));
const betweenCurlyBrackets = P.between(P.char('{'))(P.char('}'));
const betweenAngledBrackets = P.between(P.char('<'))(P.char('>'));

var P$1 = P;

const varNameParser = P$1.choice([
  betweenAngledBrackets(
    P$1.many(P$1.choice([P$1.letters, P$1.digits, P$1.anyOfString('$#- ')])).map(rs =>
      rs.join('')
    )
  ),
  P$1.sequenceOf([
    P$1.choice([P$1.letter]),
    P$1.many(P$1.choice([P$1.letter, P$1.digits])).map(rs => rs.join('')),
  ]).map(rs => rs.join('')),
]).map(r =>
  node('var-name', {
    value: r,
  })
);

const numberParser = P$1.sequenceOf([
  P$1.digits,
  P$1.possibly(P$1.sequenceOf([P$1.char('.'), P$1.digits]).map(rs => rs.join(''))),
])
  .map(rs => rs.join(''))
  .map(r => node('number', { value: Number(r) }));

const stringParser = P$1.between(strLimit)(strLimit)(
  P$1.everythingUntil(strLimit)
).map(r => node('string', { value: r }));

const operatorParser = P$1.choice([
  P$1.str('+'),
  P$1.str('-'),
  P$1.str('*'),
  P$1.str('/'),
]).map(r => node('operator', { value: r }));

const valueParser = P$1.choice([
  P$1.recursiveParser(() => mapperParser),
  numberParser,
  stringParser,
  varNameParser,
]).map(r => node('value', { value: r }));

const operationParser = P$1.sequenceOf([
  valueParser,
  P$1.optionalWhitespace,
  operatorParser,
  P$1.optionalWhitespace,
  valueParser,
]).map(rs =>
  node('operation', {
    leftArg: rs[0],
    operation: rs[2],
    rightArg: rs[4],
  })
);

const mapperParser = P$1.sequenceOf([
  P$1.choice([
    varNameParser.map(r => [r]),
    betweenParenthesis(
      P$1.sepBy(
        P$1.sequenceOf([P$1.optionalWhitespace, P$1.char(','), P$1.optionalWhitespace])
      )(varNameParser)
    ),
  ]),
  P$1.optionalWhitespace,
  P$1.str('=>'),
  P$1.optionalWhitespace,
  operationParser,
]).map(rs =>
  node('mapper', {
    args: rs[0],
    operation: rs[4],
  })
);

const attributeParser = P$1.sequenceOf([
  P$1.letters,
  P$1.optionalWhitespace,
  P$1.str(':'),
  P$1.optionalWhitespace,
  valueParser,
]).map(rs =>
  node('attribute', {
    name: rs[0],
    value: rs[4],
  })
);

const attributesParser = betweenParenthesis(
  P$1.sepBy(
    P$1.sequenceOf([P$1.optionalWhitespace, P$1.char(','), P$1.optionalWhitespace])
  )(attributeParser)
).map(rs => node('attribute-list', { value: rs }));

const blockParser = betweenCurlyBrackets(
  P$1.recursiveParser(() => commandListParser)
).map(rs => node('block', { value: rs }));

const objectParser = P$1.sequenceOf([
  varNameParser,
  P$1.optionalWhitespace,
  P$1.possibly(attributesParser),
  P$1.optionalWhitespace,
  P$1.possibly(blockParser),
]).map(rs =>
  node('object', {
    name: rs[0],
    attributes: rs[2] || node('attribute-list', { values: [] }),
    block: rs[4] || node('block', { value: [] }),
  })
);

const defArgsParser = P$1.sequenceOf([
  varNameParser,
  P$1.whitespace,
  objectParser,
]).map(r => node('args', [r[0], r[2]]));

const drawArgsParser = objectParser.map(r => node('args', [r]));

const argsParserMap = new Map([
  ['def', defArgsParser],
  ['draw', drawArgsParser],
]);

const commandParser = P$1.choice([
  // explicit command
  P$1.sequenceOf([P$1.letters, P$1.whitespace]).map(rs => rs[0]),

  // implicit "draw" command
  drawArgsParser,
]).chain(result => {
  // implicit "draw" commmand
  if (result.type === 'args') {
    return P$1.succeedWith(
      node('command', {
        command: 'draw',
        args: result,
      })
    )
  }
  let argParser = argsParserMap.get(result);
  if (!argParser) {
    return P$1.fail(`Unrecognized command '${result}'`)
  }

  return argParser.map(args =>
    node('command', {
      command: result,
      args,
    })
  )
});

const commandListParser = P$1.recursiveParser(() => P$1.many(commandParser));

function artInterpreter(tree, renderer) {
  return resolveBlock(
    {
      value: tree,
    },
    createContext({ renderer })
  )
}

const NODE_TYPES = {
  str: 'string',
  num: 'number',
  varName: 'var-name',
  operator: 'operator',
  val: 'value',
  operation: 'operation',
  mapper: 'mapper',
  attr: 'attribute',
  attrs: 'attribute-list',
  block: 'block',
  obj: 'object',
  cmd: 'command',
  args: 'args',
};

const RESOLVER_MAP = new Map([
  [NODE_TYPES.str, resolveString], // ✔️
  [NODE_TYPES.num, resolveNumber], // ✔️
  [NODE_TYPES.varName, resolveName], // ✔️
  [NODE_TYPES.operator, resolveOperator], // ✔️
  [NODE_TYPES.val, resolveValue], // ✔️
  [NODE_TYPES.operation, resolveOperation], // ✔️
  [NODE_TYPES.mapper, resolveMapper], // ✔️
  [NODE_TYPES.attr, resolveAttribute], // ✔️
  [NODE_TYPES.attrs, resolveAttributeList], // ✔️
  [NODE_TYPES.obj, resolveObject], // ✔️
  [NODE_TYPES.cmd, resolveCommand], // ✔️
  [NODE_TYPES.block, resolveBlock], // ✔️
  [NODE_TYPES.args, resolveArgs], // ✔️
]);

function resolveNode(node, context) {
  const resolver = RESOLVER_MAP.get(node.type);

  if (!resolver) {
    throw new Error(`Cannot resolve node type '${node.type}'`)
  }

  return resolver(node.payload, context)
}

function resolveString({ value }) {
  return String(value)
}

function resolveNumber({ value }) {
  return Number(value)
}

function resolveName({ value }, context) {
  if (!context.defs.has(value)) {
    return undefined
  }

  return context.defs.get(value)
}

function resolveUndefinedName({ value }, context) {
  if (context.defs.has(value)) {
    throw new Error(`Expected ${value} to be undefined`)
  }
  return value
}

function resolveOperator({ value }) {
  return value
}

function resolveValue({ value }, context) {
  return resolveNode(value, context)
}

function resolveOperation({ leftArg, operation, rightArg }, context) {
  const [l, op, r] = [
    resolveNode(leftArg, context),
    resolveNode(operation, context),
    resolveNode(rightArg, context),
  ];

  switch (op) {
    case '+': {
      return l + r
    }
    case '-': {
      return l - r
    }
    case '*': {
      return l * r
    }
    case '/': {
      return l / r
    }
    default: {
      throw new Error(`Cannot resolve operator '${op}'`)
    }
  }
}

function resolveMapper({ args, operation }, context) {
  const defNames = args.map(arg => {
    if (arg.type !== NODE_TYPES.varName) {
      const erroredValue = resolveNode(arg, context);
      throw new Error(
        `Unexpected value '${erroredValue}'. It should be a defined name`
      )
    }
    // TODO resolver of undefined name
    return resolveUndefinedName(arg.payload, context)
  });
  const defs = new Map(defNames.map((name, i) => [name, context.args[i]]));
  const mapperContext = mergeContext(context, { defs });
  return resolveNode(operation, mapperContext)
}

function resolveAttribute({ name, value }, context) {
  const parentAttributes = (context.parent && context.parent.attributes) || [];
  // import same parent attribute to use in operations
  const parentAttribute = parentAttributes.find(
    ([attrName]) => attrName === name
  );
  const attributeContext = parentAttribute
    ? mergeContext(context, {
        args: [parentAttribute[1]],
      })
    : context;

  const resolvedValue = resolveNode(value, attributeContext);
  return [name, resolvedValue]
}

function resolveAttributeList({ value }, context) {
  const parentAttributes = (context.parent && context.parent.attributes) || [];
  const ownAttributes = value.map(attributeNode => {
    if (attributeNode.type !== NODE_TYPES.attr) {
      throw new Error(
        `Cannot resolve attribute of type '${attributeNode.type}'`
      )
    }
    return resolveNode(attributeNode, context)
  });
  return parentAttributes
    .concat(ownAttributes)
    .reduce((acc, [attrKey, attrValue]) => {
      // removing repeating attributes
      const filtered = acc.filter(([k]) => k !== attrKey);
      return [...filtered, [attrKey, attrValue]]
    }, [])
}

function resolveObject({ name, attributes, block }, context) {
  if (block.type !== NODE_TYPES.block) {
    throw new Error(`Cannot resolve block of type '${block.type}'`)
  }
  if (attributes.type !== NODE_TYPES.attrs) {
    throw new Error(`Cannot resolve attributes of type '${attributes.type}'`)
  }
  if (name.type !== NODE_TYPES.varName) {
    throw new Error(`Cannot resolve name of type '${name.type}'`)
  }

  const parent = resolveNode(name, context);
  if (!parent) {
    // native object of the renderer
    return {
      name: resolveUndefinedName(name.payload, context),
      attributes: resolveNode(attributes, context),
      block: resolveNode(block, context),
    }
  }
  const childrenContext = mergeContext(context, { parent });
  return {
    name: parent.name,
    attributes: resolveNode(attributes, childrenContext),
    block: resolveNode(block, childrenContext),
  }
}

function resolveCommand({ command, args }, context) {
  if (args.type !== 'args') {
    throw new Error(
      `Invalid args of type '${args.type}' to command '${command}'`
    )
  }
  const resolvedArgs = resolveNode(args, context);
  if (command === 'def') {
    return resolveCommandDef(resolvedArgs, context)
  } else if (command === 'draw') {
    return resolveCommandDraw(resolvedArgs, context)
  } else {
    throw new Error(`Cannot understand command '${command}'`)
  }
}

function resolveArgs(args) {
  return args
}

function resolveCommandDef([name, value], context) {
  // TODO resolver of undefined name
  const definitionName = resolveUndefinedName(name.payload, context);
  const definitionValue = resolveNode(value, context);
  context.defs.set(definitionName, definitionValue);
}
function resolveCommandDraw([value], context) {
  if (!context.renderer || !context.renderer.render) {
    throw new Error(`Cannot render without renderer`)
  }
  if (value.type !== NODE_TYPES.obj) {
    throw new Error(`Cannot render '${value.type}'. It must be an object`)
  }
  const resolvedObject = resolveNode(value, context);
  return context.renderer.render(resolvedObject)
}

function resolveBlock({ value }, context) {
  const blockContext = mergeContext(context, { defs: new Map() });
  const parentBlock = context.parent.block || [];
  const ownBlock = value
    .map(node => resolveNode(node, blockContext))
    .filter(Boolean);
  return [...parentBlock, ...ownBlock]
}

function mergeContext(ourContext = {}, theirContext = {}) {
  const defs = new Map([...ourContext.defs, ...(theirContext.defs || [])]);
  const parent = theirContext.parent
    ? theirContext.parent
    : ourContext.parent || {};

  const args = theirContext.args ? theirContext.args : ourContext.args || [];

  const renderer = ourContext.renderer;

  return {
    defs,
    parent,
    args,
    renderer,
  }
}

function createContext(initialContext) {
  return {
    defs: new Map(),
    parent: {},
    args: [],
    renderer: undefined,
    ...initialContext,
  }
}

const renderer = {
  render({ name, attributes, block }) {
    const domElem = document.createElementNS('http://www.w3.org/2000/svg', name);
    attributes.forEach(([attrName, attrValue]) => {
      domElem.setAttribute(attrName, attrValue);
    });
    block.forEach(c => {
      domElem.appendChild(c);
    });
    return domElem
  },
};

export { artInterpreter, commandListParser as artParser, renderer as artSvgRenderer };
