(function () {
'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global_1 =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;

var setGlobal = function (key, value) {
  try {
    defineProperty(global_1, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global_1[key] = value;
  } return value;
};

var SHARED = '__core-js_shared__';
var store = global_1[SHARED] || setGlobal(SHARED, {});

var sharedStore = store;

var shared = createCommonjsModule(function (module) {
(module.exports = function (key, value) {
  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.21.1',
  mode:  'global',
  copyright: '© 2014-2022 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.21.1/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});
});

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var functionBindNative = !fails(function () {
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

var FunctionPrototype = Function.prototype;
var bind = FunctionPrototype.bind;
var call = FunctionPrototype.call;
var uncurryThis = functionBindNative && bind.bind(call, call);

var functionUncurryThis = functionBindNative ? function (fn) {
  return fn && uncurryThis(fn);
} : function (fn) {
  return fn && function () {
    return call.apply(fn, arguments);
  };
};

var TypeError$1 = global_1.TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (it == undefined) throw TypeError$1("Can't call method on " + it);
  return it;
};

var Object$1 = global_1.Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject = function (argument) {
  return Object$1(requireObjectCoercible(argument));
};

var hasOwnProperty = functionUncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};

var id = 0;
var postfix = Math.random();
var toString = functionUncurryThis(1.0.toString);

var uid = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
};

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
var isCallable = function (argument) {
  return typeof argument == 'function';
};

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global_1[namespace]) : global_1[namespace] && global_1[namespace][method];
};

var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

var process = global_1.process;
var Deno = global_1.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && engineUserAgent) {
  match = engineUserAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = engineUserAgent.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

var engineV8Version = version;

/* eslint-disable es/no-symbol -- required for testing */



// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol();
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && engineV8Version && engineV8Version < 41;
});

/* eslint-disable es/no-symbol -- required for testing */


var useSymbolAsUid = nativeSymbol
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

var WellKnownSymbolsStore = shared('wks');
var Symbol$1 = global_1.Symbol;
var symbolFor = Symbol$1 && Symbol$1['for'];
var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

var wellKnownSymbol = function (name) {
  if (!hasOwnProperty_1(WellKnownSymbolsStore, name) || !(nativeSymbol || typeof WellKnownSymbolsStore[name] == 'string')) {
    var description = 'Symbol.' + name;
    if (nativeSymbol && hasOwnProperty_1(Symbol$1, name)) {
      WellKnownSymbolsStore[name] = Symbol$1[name];
    } else if (useSymbolAsUid && symbolFor) {
      WellKnownSymbolsStore[name] = symbolFor(description);
    } else {
      WellKnownSymbolsStore[name] = createWellKnownSymbol(description);
    }
  } return WellKnownSymbolsStore[name];
};

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

var toStringTagSupport = String(test) === '[object z]';

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var isObject = function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};

var document$1 = global_1.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document$1) && isObject(document$1.createElement);

var documentCreateElement = function (it) {
  return EXISTS ? document$1.createElement(it) : {};
};

// Thanks to IE8 for its funny defineProperty
var ie8DomDefine = !descriptors && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(documentCreateElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
var v8PrototypeDefineBug = descriptors && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype != 42;
});

var String$1 = global_1.String;
var TypeError$2 = global_1.TypeError;

// `Assert: Type(argument) is Object`
var anObject = function (argument) {
  if (isObject(argument)) return argument;
  throw TypeError$2(String$1(argument) + ' is not an object');
};

var call$1 = Function.prototype.call;

var functionCall = functionBindNative ? call$1.bind(call$1) : function () {
  return call$1.apply(call$1, arguments);
};

var objectIsPrototypeOf = functionUncurryThis({}.isPrototypeOf);

var Object$2 = global_1.Object;

var isSymbol = useSymbolAsUid ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && objectIsPrototypeOf($Symbol.prototype, Object$2(it));
};

var String$2 = global_1.String;

var tryToString = function (argument) {
  try {
    return String$2(argument);
  } catch (error) {
    return 'Object';
  }
};

var TypeError$3 = global_1.TypeError;

// `Assert: IsCallable(argument) is true`
var aCallable = function (argument) {
  if (isCallable(argument)) return argument;
  throw TypeError$3(tryToString(argument) + ' is not a function');
};

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
var getMethod = function (V, P) {
  var func = V[P];
  return func == null ? undefined : aCallable(func);
};

var TypeError$4 = global_1.TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
var ordinaryToPrimitive = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = functionCall(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = functionCall(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = functionCall(fn, input))) return val;
  throw TypeError$4("Can't convert object to primitive value");
};

var TypeError$5 = global_1.TypeError;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
var toPrimitive = function (input, pref) {
  if (!isObject(input) || isSymbol(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = functionCall(exoticToPrim, input, pref);
    if (!isObject(result) || isSymbol(result)) return result;
    throw TypeError$5("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
var toPropertyKey = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};

var TypeError$6 = global_1.TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
var f = descriptors ? v8PrototypeDefineBug ? function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (ie8DomDefine) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError$6('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var objectDefineProperty = {
	f: f
};

var createPropertyDescriptor = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var createNonEnumerableProperty = descriptors ? function (object, key, value) {
  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var functionToString = functionUncurryThis(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(sharedStore.inspectSource)) {
  sharedStore.inspectSource = function (it) {
    return functionToString(it);
  };
}

var inspectSource = sharedStore.inspectSource;

var WeakMap = global_1.WeakMap;

var nativeWeakMap = isCallable(WeakMap) && /native code/.test(inspectSource(WeakMap));

var keys = shared('keys');

var sharedKey = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

var hiddenKeys = {};

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError$7 = global_1.TypeError;
var WeakMap$1 = global_1.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError$7('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (nativeWeakMap || sharedStore.state) {
  var store$1 = sharedStore.state || (sharedStore.state = new WeakMap$1());
  var wmget = functionUncurryThis(store$1.get);
  var wmhas = functionUncurryThis(store$1.has);
  var wmset = functionUncurryThis(store$1.set);
  set = function (it, metadata) {
    if (wmhas(store$1, it)) throw new TypeError$7(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    wmset(store$1, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget(store$1, it) || {};
  };
  has = function (it) {
    return wmhas(store$1, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    if (hasOwnProperty_1(it, STATE)) throw new TypeError$7(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwnProperty_1(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwnProperty_1(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

var FunctionPrototype$1 = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = descriptors && Object.getOwnPropertyDescriptor;

var EXISTS$1 = hasOwnProperty_1(FunctionPrototype$1, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS$1 && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE$1 = EXISTS$1 && (!descriptors || (descriptors && getDescriptor(FunctionPrototype$1, 'name').configurable));

var functionName = {
  EXISTS: EXISTS$1,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE$1
};

var redefine = createCommonjsModule(function (module) {
var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;

var getInternalState = internalState.get;
var enforceInternalState = internalState.enforce;
var TEMPLATE = String(String).split('String');

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  var name = options && options.name !== undefined ? options.name : key;
  var state;
  if (isCallable(value)) {
    if (String(name).slice(0, 7) === 'Symbol(') {
      name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
    }
    if (!hasOwnProperty_1(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
      createNonEnumerableProperty(value, 'name', name);
    }
    state = enforceInternalState(value);
    if (!state.source) {
      state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
    }
  }
  if (O === global_1) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return isCallable(this) && getInternalState(this).source || inspectSource(this);
});
});

var toString$1 = functionUncurryThis({}.toString);
var stringSlice = functionUncurryThis(''.slice);

var classofRaw = function (it) {
  return stringSlice(toString$1(it), 8, -1);
};

var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
var Object$3 = global_1.Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof = toStringTagSupport ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object$3(it), TO_STRING_TAG$1)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && isCallable(O.callee) ? 'Arguments' : result;
};

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString = toStringTagSupport ? {}.toString : function toString() {
  return '[object ' + classof(this) + ']';
};

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!toStringTagSupport) {
  redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
}

var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
var f$1 = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;

var objectPropertyIsEnumerable = {
	f: f$1
};

var Object$4 = global_1.Object;
var split = functionUncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !Object$4('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classofRaw(it) == 'String' ? split(it, '') : Object$4(it);
} : Object$4;

// toObject with fallback for non-array-like ES3 strings



var toIndexedObject = function (it) {
  return indexedObject(requireObjectCoercible(it));
};

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
var f$2 = descriptors ? $getOwnPropertyDescriptor$1 : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (ie8DomDefine) try {
    return $getOwnPropertyDescriptor$1(O, P);
  } catch (error) { /* empty */ }
  if (hasOwnProperty_1(O, P)) return createPropertyDescriptor(!functionCall(objectPropertyIsEnumerable.f, O, P), O[P]);
};

var objectGetOwnPropertyDescriptor = {
	f: f$2
};

var ceil = Math.ceil;
var floor = Math.floor;

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
var toIntegerOrInfinity = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- safe
  return number !== number || number === 0 ? 0 : (number > 0 ? floor : ceil)(number);
};

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex = function (index, length) {
  var integer = toIntegerOrInfinity(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};

var min$1 = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength = function (argument) {
  return argument > 0 ? min$1(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
var lengthOfArrayLike = function (obj) {
  return toLength(obj.length);
};

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

var indexOf = arrayIncludes.indexOf;


var push = functionUncurryThis([].push);

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwnProperty_1(hiddenKeys, key) && hasOwnProperty_1(O, key) && push(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwnProperty_1(O, key = names[i++])) {
    ~indexOf(result, key) || push(result, key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return objectKeysInternal(O, hiddenKeys$1);
};

var objectGetOwnPropertyNames = {
	f: f$3
};

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
var f$4 = Object.getOwnPropertySymbols;

var objectGetOwnPropertySymbols = {
	f: f$4
};

var concat = functionUncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = objectGetOwnPropertyNames.f(anObject(it));
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};

var copyConstructorProperties = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = objectDefineProperty.f;
  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwnProperty_1(target, key) && !(exceptions && hasOwnProperty_1(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

var isForced_1 = isForced;

var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
  options.name        - the .name of the function if it does not match the key
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global_1;
  } else if (STATIC) {
    target = global_1[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global_1[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$1(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};

var nativePromiseConstructor = global_1.Promise;

var redefineAll = function (target, src, options) {
  for (var key in src) redefine(target, key, src[key], options);
  return target;
};

var String$3 = global_1.String;
var TypeError$8 = global_1.TypeError;

var aPossiblePrototype = function (argument) {
  if (typeof argument == 'object' || isCallable(argument)) return argument;
  throw TypeError$8("Can't set " + String$3(argument) + ' as a prototype');
};

/* eslint-disable no-proto -- safe */




// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    setter = functionUncurryThis(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set);
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var defineProperty$1 = objectDefineProperty.f;



var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

var setToStringTag = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwnProperty_1(target, TO_STRING_TAG$2)) {
    defineProperty$1(target, TO_STRING_TAG$2, { configurable: true, value: TAG });
  }
};

var SPECIES = wellKnownSymbol('species');

var setSpecies = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
  var defineProperty = objectDefineProperty.f;

  if (descriptors && Constructor && !Constructor[SPECIES]) {
    defineProperty(Constructor, SPECIES, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var TypeError$9 = global_1.TypeError;

var anInstance = function (it, Prototype) {
  if (objectIsPrototypeOf(Prototype, it)) return it;
  throw TypeError$9('Incorrect invocation');
};

var bind$1 = functionUncurryThis(functionUncurryThis.bind);

// optional / simple context binding
var functionBindContext = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : functionBindNative ? bind$1(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var iterators = {};

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod = function (it) {
  return it !== undefined && (iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};

var ITERATOR$1 = wellKnownSymbol('iterator');

var getIteratorMethod = function (it) {
  if (it != undefined) return getMethod(it, ITERATOR$1)
    || getMethod(it, '@@iterator')
    || iterators[classof(it)];
};

var TypeError$a = global_1.TypeError;

var getIterator = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
  if (aCallable(iteratorMethod)) return anObject(functionCall(iteratorMethod, argument));
  throw TypeError$a(tryToString(argument) + ' is not iterable');
};

var iteratorClose = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject(iterator);
  try {
    innerResult = getMethod(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = functionCall(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject(innerResult);
  return value;
};

var TypeError$b = global_1.TypeError;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var ResultPrototype = Result.prototype;

var iterate = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = functionBindContext(unboundFunction, that);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose(iterator, 'normal', condition);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (!iterFn) throw TypeError$b(tryToString(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && objectIsPrototypeOf(ResultPrototype, result)) return result;
      } return new Result(false);
    }
    iterator = getIterator(iterable, iterFn);
  }

  next = iterator.next;
  while (!(step = functionCall(next, iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose(iterator, 'throw', error);
    }
    if (typeof result == 'object' && result && objectIsPrototypeOf(ResultPrototype, result)) return result;
  } return new Result(false);
};

var ITERATOR$2 = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR$2] = function () {
    return this;
  };
  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$2] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

var noop = function () { /* empty */ };
var empty = [];
var construct = getBuiltIn('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec = functionUncurryThis(constructorRegExp.exec);
var INCORRECT_TO_STRING = !constructorRegExp.exec(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  try {
    construct(noop, empty, argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  switch (classof(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
var isConstructor = !construct || fails(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;

var TypeError$c = global_1.TypeError;

// `Assert: IsConstructor(argument) is true`
var aConstructor = function (argument) {
  if (isConstructor(argument)) return argument;
  throw TypeError$c(tryToString(argument) + ' is not a constructor');
};

var SPECIES$1 = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES$1]) == undefined ? defaultConstructor : aConstructor(S);
};

var FunctionPrototype$2 = Function.prototype;
var apply = FunctionPrototype$2.apply;
var call$2 = FunctionPrototype$2.call;

// eslint-disable-next-line es/no-reflect -- safe
var functionApply = typeof Reflect == 'object' && Reflect.apply || (functionBindNative ? call$2.bind(apply) : function () {
  return call$2.apply(apply, arguments);
});

var html = getBuiltIn('document', 'documentElement');

var arraySlice = functionUncurryThis([].slice);

var TypeError$d = global_1.TypeError;

var validateArgumentsLength = function (passed, required) {
  if (passed < required) throw TypeError$d('Not enough arguments');
  return passed;
};

var engineIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(engineUserAgent);

var engineIsNode = classofRaw(global_1.process) == 'process';

var set$1 = global_1.setImmediate;
var clear = global_1.clearImmediate;
var process$1 = global_1.process;
var Dispatch = global_1.Dispatch;
var Function$1 = global_1.Function;
var MessageChannel = global_1.MessageChannel;
var String$4 = global_1.String;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var location, defer, channel, port;

try {
  // Deno throws a ReferenceError on `location` access without `--location` flag
  location = global_1.location;
} catch (error) { /* empty */ }

var run = function (id) {
  if (hasOwnProperty_1(queue, id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var listener = function (event) {
  run(event.data);
};

var post = function (id) {
  // old engines have not location.origin
  global_1.postMessage(String$4(id), location.protocol + '//' + location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set$1 || !clear) {
  set$1 = function setImmediate(handler) {
    validateArgumentsLength(arguments.length, 1);
    var fn = isCallable(handler) ? handler : Function$1(handler);
    var args = arraySlice(arguments, 1);
    queue[++counter] = function () {
      functionApply(fn, undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (engineIsNode) {
    defer = function (id) {
      process$1.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !engineIsIos) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = functionBindContext(port.postMessage, port);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    global_1.addEventListener &&
    isCallable(global_1.postMessage) &&
    !global_1.importScripts &&
    location && location.protocol !== 'file:' &&
    !fails(post)
  ) {
    defer = post;
    global_1.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
    defer = function (id) {
      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

var task = {
  set: set$1,
  clear: clear
};

var engineIsIosPebble = /ipad|iphone|ipod/i.test(engineUserAgent) && global_1.Pebble !== undefined;

var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(engineUserAgent);

var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
var macrotask = task.set;





var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
var document$2 = global_1.document;
var process$2 = global_1.process;
var Promise$1 = global_1.Promise;
// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
var queueMicrotaskDescriptor = getOwnPropertyDescriptor$2(global_1, 'queueMicrotask');
var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

var flush, head, last, notify, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!queueMicrotask) {
  flush = function () {
    var parent, fn;
    if (engineIsNode && (parent = process$2.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (error) {
        if (head) notify();
        else last = undefined;
        throw error;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
  if (!engineIsIos && !engineIsNode && !engineIsWebosWebkit && MutationObserver && document$2) {
    toggle = true;
    node = document$2.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (!engineIsIosPebble && Promise$1 && Promise$1.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise$1.resolve(undefined);
    // workaround of WebKit ~ iOS Safari 10.1 bug
    promise.constructor = Promise$1;
    then = functionBindContext(promise.then, promise);
    notify = function () {
      then(flush);
    };
  // Node.js without promises
  } else if (engineIsNode) {
    notify = function () {
      process$2.nextTick(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    // strange IE + webpack dev server bug - use .bind(global)
    macrotask = functionBindContext(macrotask, global_1);
    notify = function () {
      macrotask(flush);
    };
  }
}

var microtask = queueMicrotask || function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify();
  } last = task;
};

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aCallable(resolve);
  this.reject = aCallable(reject);
};

// `NewPromiseCapability` abstract operation
// https://tc39.es/ecma262/#sec-newpromisecapability
var f$5 = function (C) {
  return new PromiseCapability(C);
};

var newPromiseCapability = {
	f: f$5
};

var promiseResolve = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var hostReportErrors = function (a, b) {
  var console = global_1.console;
  if (console && console.error) {
    arguments.length == 1 ? console.error(a) : console.error(a, b);
  }
};

var perform = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

var Queue = function () {
  this.head = null;
  this.tail = null;
};

Queue.prototype = {
  add: function (item) {
    var entry = { item: item, next: null };
    if (this.head) this.tail.next = entry;
    else this.head = entry;
    this.tail = entry;
  },
  get: function () {
    var entry = this.head;
    if (entry) {
      this.head = entry.next;
      if (this.tail === entry) this.tail = null;
      return entry.item;
    }
  }
};

var queue$1 = Queue;

var engineIsBrowser = typeof window == 'object';

var task$1 = task.set;













var SPECIES$2 = wellKnownSymbol('species');
var PROMISE = 'Promise';

var getInternalState = internalState.getterFor(PROMISE);
var setInternalState = internalState.set;
var getInternalPromiseState = internalState.getterFor(PROMISE);
var NativePromisePrototype = nativePromiseConstructor && nativePromiseConstructor.prototype;
var PromiseConstructor = nativePromiseConstructor;
var PromisePrototype = NativePromisePrototype;
var TypeError$e = global_1.TypeError;
var document$3 = global_1.document;
var process$3 = global_1.process;
var newPromiseCapability$1 = newPromiseCapability.f;
var newGenericPromiseCapability = newPromiseCapability$1;

var DISPATCH_EVENT = !!(document$3 && document$3.createEvent && global_1.dispatchEvent);
var NATIVE_REJECTION_EVENT = isCallable(global_1.PromiseRejectionEvent);
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var SUBCLASSING = false;

var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

var FORCED = isForced_1(PROMISE, function () {
  var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(PromiseConstructor);
  var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(PromiseConstructor);
  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
  // We can't detect it synchronously, so just check versions
  if (!GLOBAL_CORE_JS_PROMISE && engineV8Version === 66) return true;
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (engineV8Version >= 51 && /native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) return false;
  // Detect correctness of subclassing with @@species support
  var promise = new PromiseConstructor(function (resolve) { resolve(1); });
  var FakePromise = function (exec) {
    exec(function () { /* empty */ }, function () { /* empty */ });
  };
  var constructor = promise.constructor = {};
  constructor[SPECIES$2] = FakePromise;
  SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
  if (!SUBCLASSING) return true;
  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
  return !GLOBAL_CORE_JS_PROMISE && engineIsBrowser && !NATIVE_REJECTION_EVENT;
});

var INCORRECT_ITERATION = FORCED || !checkCorrectnessOfIteration(function (iterable) {
  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
});

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && isCallable(then = it.then) ? then : false;
};

var callReaction = function (reaction, state) {
  var value = state.value;
  var ok = state.state == FULFILLED;
  var handler = ok ? reaction.ok : reaction.fail;
  var resolve = reaction.resolve;
  var reject = reaction.reject;
  var domain = reaction.domain;
  var result, then, exited;
  try {
    if (handler) {
      if (!ok) {
        if (state.rejection === UNHANDLED) onHandleUnhandled(state);
        state.rejection = HANDLED;
      }
      if (handler === true) result = value;
      else {
        if (domain) domain.enter();
        result = handler(value); // can throw
        if (domain) {
          domain.exit();
          exited = true;
        }
      }
      if (result === reaction.promise) {
        reject(TypeError$e('Promise-chain cycle'));
      } else if (then = isThenable(result)) {
        functionCall(then, result, resolve, reject);
      } else resolve(result);
    } else reject(value);
  } catch (error) {
    if (domain && !exited) domain.exit();
    reject(error);
  }
};

var notify$1 = function (state, isReject) {
  if (state.notified) return;
  state.notified = true;
  microtask(function () {
    var reactions = state.reactions;
    var reaction;
    while (reaction = reactions.get()) {
      callReaction(reaction, state);
    }
    state.notified = false;
    if (isReject && !state.rejection) onUnhandled(state);
  });
};

var dispatchEvent = function (name, promise, reason) {
  var event, handler;
  if (DISPATCH_EVENT) {
    event = document$3.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    global_1.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (!NATIVE_REJECTION_EVENT && (handler = global_1['on' + name])) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
};

var onUnhandled = function (state) {
  functionCall(task$1, global_1, function () {
    var promise = state.facade;
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform(function () {
        if (engineIsNode) {
          process$3.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = engineIsNode || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (state) {
  functionCall(task$1, global_1, function () {
    var promise = state.facade;
    if (engineIsNode) {
      process$3.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind$2 = function (fn, state, unwrap) {
  return function (value) {
    fn(state, value, unwrap);
  };
};

var internalReject = function (state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  state.value = value;
  state.state = REJECTED;
  notify$1(state, true);
};

var internalResolve = function (state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  try {
    if (state.facade === value) throw TypeError$e("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask(function () {
        var wrapper = { done: false };
        try {
          functionCall(then, value,
            bind$2(internalResolve, wrapper, state),
            bind$2(internalReject, wrapper, state)
          );
        } catch (error) {
          internalReject(wrapper, error, state);
        }
      });
    } else {
      state.value = value;
      state.state = FULFILLED;
      notify$1(state, false);
    }
  } catch (error) {
    internalReject({ done: false }, error, state);
  }
};

// constructor polyfill
if (FORCED) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance(this, PromisePrototype);
    aCallable(executor);
    functionCall(Internal, this);
    var state = getInternalState(this);
    try {
      executor(bind$2(internalResolve, state), bind$2(internalReject, state));
    } catch (error) {
      internalReject(state, error);
    }
  };
  PromisePrototype = PromiseConstructor.prototype;
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  Internal = function Promise(executor) {
    setInternalState(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: new queue$1(),
      rejection: false,
      state: PENDING,
      value: undefined
    });
  };
  Internal.prototype = redefineAll(PromisePrototype, {
    // `Promise.prototype.then` method
    // https://tc39.es/ecma262/#sec-promise.prototype.then
    // eslint-disable-next-line unicorn/no-thenable -- safe
    then: function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
      state.parent = true;
      reaction.ok = isCallable(onFulfilled) ? onFulfilled : true;
      reaction.fail = isCallable(onRejected) && onRejected;
      reaction.domain = engineIsNode ? process$3.domain : undefined;
      if (state.state == PENDING) state.reactions.add(reaction);
      else microtask(function () {
        callReaction(reaction, state);
      });
      return reaction.promise;
    },
    // `Promise.prototype.catch` method
    // https://tc39.es/ecma262/#sec-promise.prototype.catch
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalState(promise);
    this.promise = promise;
    this.resolve = bind$2(internalResolve, state);
    this.reject = bind$2(internalReject, state);
  };
  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  if ( isCallable(nativePromiseConstructor) && NativePromisePrototype !== Object.prototype) {
    nativeThen = NativePromisePrototype.then;

    if (!SUBCLASSING) {
      // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
      redefine(NativePromisePrototype, 'then', function then(onFulfilled, onRejected) {
        var that = this;
        return new PromiseConstructor(function (resolve, reject) {
          functionCall(nativeThen, that, resolve, reject);
        }).then(onFulfilled, onRejected);
      // https://github.com/zloirock/core-js/issues/640
      }, { unsafe: true });

      // makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
      redefine(NativePromisePrototype, 'catch', PromisePrototype['catch'], { unsafe: true });
    }

    // make `.constructor === Promise` work for native promise-based APIs
    try {
      delete NativePromisePrototype.constructor;
    } catch (error) { /* empty */ }

    // make `instanceof Promise` work for native promise-based APIs
    if (objectSetPrototypeOf) {
      objectSetPrototypeOf(NativePromisePrototype, PromisePrototype);
    }
  }
}

_export({ global: true, wrap: true, forced: FORCED }, {
  Promise: PromiseConstructor
});

setToStringTag(PromiseConstructor, PROMISE, false);
setSpecies(PROMISE);

PromiseWrapper = getBuiltIn(PROMISE);

// statics
_export({ target: PROMISE, stat: true, forced: FORCED }, {
  // `Promise.reject` method
  // https://tc39.es/ecma262/#sec-promise.reject
  reject: function reject(r) {
    var capability = newPromiseCapability$1(this);
    functionCall(capability.reject, undefined, r);
    return capability.promise;
  }
});

_export({ target: PROMISE, stat: true, forced:  FORCED }, {
  // `Promise.resolve` method
  // https://tc39.es/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve( this, x);
  }
});

_export({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
  // `Promise.all` method
  // https://tc39.es/ecma262/#sec-promise.all
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability$1(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aCallable(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        remaining++;
        functionCall($promiseResolve, C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  },
  // `Promise.race` method
  // https://tc39.es/ecma262/#sec-promise.race
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability$1(C);
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aCallable(C.resolve);
      iterate(iterable, function (promise) {
        functionCall($promiseResolve, C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
var objectKeys = Object.keys || function keys(O) {
  return objectKeysInternal(O, enumBugKeys);
};

var FAILS_ON_PRIMITIVES = fails(function () { objectKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return objectKeys(toObject(it));
  }
});

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray = Array.isArray || function isArray(argument) {
  return classofRaw(argument) == 'Array';
};

var String$5 = global_1.String;

var toString_1 = function (argument) {
  if (classof(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
  return String$5(argument);
};

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
var f$6 = descriptors && !v8PrototypeDefineBug ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var props = toIndexedObject(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) objectDefineProperty.f(O, key = keys[index++], props[key]);
  return O;
};

var objectDefineProperties = {
	f: f$6
};

/* global ActiveXObject -- old IE, WSH */








var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
var objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : objectDefineProperties.f(result, Properties);
};

var createProperty = function (object, key, value) {
  var propertyKey = toPropertyKey(key);
  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};

var Array$1 = global_1.Array;
var max$1 = Math.max;

var arraySliceSimple = function (O, start, end) {
  var length = lengthOfArrayLike(O);
  var k = toAbsoluteIndex(start, length);
  var fin = toAbsoluteIndex(end === undefined ? length : end, length);
  var result = Array$1(max$1(fin - k, 0));
  for (var n = 0; k < fin; k++, n++) createProperty(result, n, O[k]);
  result.length = n;
  return result;
};

/* eslint-disable es/no-object-getownpropertynames -- safe */


var $getOwnPropertyNames = objectGetOwnPropertyNames.f;


var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return $getOwnPropertyNames(it);
  } catch (error) {
    return arraySliceSimple(windowNames);
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var f$7 = function getOwnPropertyNames(it) {
  return windowNames && classofRaw(it) == 'Window'
    ? getWindowNames(it)
    : $getOwnPropertyNames(toIndexedObject(it));
};

var objectGetOwnPropertyNamesExternal = {
	f: f$7
};

var f$8 = wellKnownSymbol;

var wellKnownSymbolWrapped = {
	f: f$8
};

var path = global_1;

var defineProperty$2 = objectDefineProperty.f;

var defineWellKnownSymbol = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!hasOwnProperty_1(Symbol, NAME)) defineProperty$2(Symbol, NAME, {
    value: wellKnownSymbolWrapped.f(NAME)
  });
};

var SPECIES$3 = wellKnownSymbol('species');
var Array$2 = global_1.Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesConstructor = function (originalArray) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor(C) && (C === Array$2 || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES$3];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array$2 : C;
};

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};

var push$1 = functionUncurryThis([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod$1 = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var IS_FILTER_REJECT = TYPE == 7;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = indexedObject(O);
    var boundFunction = functionBindContext(callbackfn, that);
    var length = lengthOfArrayLike(self);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push$1(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push$1(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$1(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod$1(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod$1(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod$1(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod$1(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod$1(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$1(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod$1(7)
};

var $forEach = arrayIteration.forEach;

var HIDDEN = sharedKey('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE$1 = 'prototype';
var TO_PRIMITIVE$1 = wellKnownSymbol('toPrimitive');

var setInternalState$1 = internalState.set;
var getInternalState$1 = internalState.getterFor(SYMBOL);

var ObjectPrototype = Object[PROTOTYPE$1];
var $Symbol = global_1.Symbol;
var SymbolPrototype = $Symbol && $Symbol[PROTOTYPE$1];
var TypeError$f = global_1.TypeError;
var QObject = global_1.QObject;
var $stringify = getBuiltIn('JSON', 'stringify');
var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var nativeDefineProperty = objectDefineProperty.f;
var nativeGetOwnPropertyNames = objectGetOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = objectPropertyIsEnumerable.f;
var push$2 = functionUncurryThis([].push);

var AllSymbols = shared('symbols');
var ObjectPrototypeSymbols = shared('op-symbols');
var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');
var WellKnownSymbolsStore$1 = shared('wks');

// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDescriptor = descriptors && fails(function () {
  return objectCreate(nativeDefineProperty({}, 'a', {
    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
  nativeDefineProperty(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
    nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
  }
} : nativeDefineProperty;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = objectCreate(SymbolPrototype);
  setInternalState$1(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!descriptors) symbol.description = description;
  return symbol;
};

var $defineProperty$1 = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype) $defineProperty$1(ObjectPrototypeSymbols, P, Attributes);
  anObject(O);
  var key = toPropertyKey(P);
  anObject(Attributes);
  if (hasOwnProperty_1(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!hasOwnProperty_1(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (hasOwnProperty_1(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = objectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject(O);
  var properties = toIndexedObject(Properties);
  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
  $forEach(keys, function (key) {
    if (!descriptors || functionCall($propertyIsEnumerable$1, properties, key)) $defineProperty$1(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
};

var $propertyIsEnumerable$1 = function propertyIsEnumerable(V) {
  var P = toPropertyKey(V);
  var enumerable = functionCall(nativePropertyIsEnumerable, this, P);
  if (this === ObjectPrototype && hasOwnProperty_1(AllSymbols, P) && !hasOwnProperty_1(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !hasOwnProperty_1(this, P) || !hasOwnProperty_1(AllSymbols, P) || hasOwnProperty_1(this, HIDDEN) && this[HIDDEN][P]
    ? enumerable : true;
};

var $getOwnPropertyDescriptor$2 = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject(O);
  var key = toPropertyKey(P);
  if (it === ObjectPrototype && hasOwnProperty_1(AllSymbols, key) && !hasOwnProperty_1(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor(it, key);
  if (descriptor && hasOwnProperty_1(AllSymbols, key) && !(hasOwnProperty_1(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames$1 = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (!hasOwnProperty_1(AllSymbols, key) && !hasOwnProperty_1(hiddenKeys, key)) push$2(result, key);
  });
  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (hasOwnProperty_1(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwnProperty_1(ObjectPrototype, key))) {
      push$2(result, AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.es/ecma262/#sec-symbol-constructor
if (!nativeSymbol) {
  $Symbol = function Symbol() {
    if (objectIsPrototypeOf(SymbolPrototype, this)) throw TypeError$f('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : toString_1(arguments[0]);
    var tag = uid(description);
    var setter = function (value) {
      if (this === ObjectPrototype) functionCall(setter, ObjectPrototypeSymbols, value);
      if (hasOwnProperty_1(this, HIDDEN) && hasOwnProperty_1(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
    };
    if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  SymbolPrototype = $Symbol[PROTOTYPE$1];

  redefine(SymbolPrototype, 'toString', function toString() {
    return getInternalState$1(this).tag;
  });

  redefine($Symbol, 'withoutSetter', function (description) {
    return wrap(uid(description), description);
  });

  objectPropertyIsEnumerable.f = $propertyIsEnumerable$1;
  objectDefineProperty.f = $defineProperty$1;
  objectDefineProperties.f = $defineProperties;
  objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor$2;
  objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames$1;
  objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

  wellKnownSymbolWrapped.f = function (name) {
    return wrap(wellKnownSymbol(name), name);
  };

  if (descriptors) {
    // https://github.com/tc39/proposal-Symbol-description
    nativeDefineProperty(SymbolPrototype, 'description', {
      configurable: true,
      get: function description() {
        return getInternalState$1(this).description;
      }
    });
    {
      redefine(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable$1, { unsafe: true });
    }
  }
}

_export({ global: true, wrap: true, forced: !nativeSymbol, sham: !nativeSymbol }, {
  Symbol: $Symbol
});

$forEach(objectKeys(WellKnownSymbolsStore$1), function (name) {
  defineWellKnownSymbol(name);
});

_export({ target: SYMBOL, stat: true, forced: !nativeSymbol }, {
  // `Symbol.for` method
  // https://tc39.es/ecma262/#sec-symbol.for
  'for': function (key) {
    var string = toString_1(key);
    if (hasOwnProperty_1(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = $Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
  // `Symbol.keyFor` method
  // https://tc39.es/ecma262/#sec-symbol.keyfor
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError$f(sym + ' is not a symbol');
    if (hasOwnProperty_1(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

_export({ target: 'Object', stat: true, forced: !nativeSymbol, sham: !descriptors }, {
  // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty$1,
  // `Object.defineProperties` method
  // https://tc39.es/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor$2
});

_export({ target: 'Object', stat: true, forced: !nativeSymbol }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames$1,
  // `Object.getOwnPropertySymbols` method
  // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
_export({ target: 'Object', stat: true, forced: fails(function () { objectGetOwnPropertySymbols.f(1); }) }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return objectGetOwnPropertySymbols.f(toObject(it));
  }
});

// `JSON.stringify` method behavior with symbols
// https://tc39.es/ecma262/#sec-json.stringify
if ($stringify) {
  var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return $stringify([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
  });

  _export({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      var args = arraySlice(arguments);
      var $replacer = replacer;
      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray(replacer)) replacer = function (key, value) {
        if (isCallable($replacer)) value = functionCall($replacer, this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return functionApply($stringify, null, args);
    }
  });
}

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
if (!SymbolPrototype[TO_PRIMITIVE$1]) {
  var valueOf = SymbolPrototype.valueOf;
  // eslint-disable-next-line no-unused-vars -- required for .length
  redefine(SymbolPrototype, TO_PRIMITIVE$1, function (hint) {
    // TODO: improve hint logic
    return functionCall(valueOf, this);
  });
}
// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag($Symbol, SYMBOL);

hiddenKeys[HIDDEN] = true;

var SPECIES$4 = wellKnownSymbol('species');

var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return engineV8Version >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$4] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var $filter = arrayIteration.filter;


var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;


var FAILS_ON_PRIMITIVES$1 = fails(function () { nativeGetOwnPropertyDescriptor$1(1); });
var FORCED$1 = !descriptors || FAILS_ON_PRIMITIVES$1;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
_export({ target: 'Object', stat: true, forced: FORCED$1, sham: !descriptors }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor$1(toIndexedObject(it), key);
  }
});

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
var domIterables = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`


var classList = documentCreateElement('span').classList;
var DOMTokenListPrototype = classList && classList.constructor && classList.constructor.prototype;

var domTokenListPrototype = DOMTokenListPrototype === Object.prototype ? undefined : DOMTokenListPrototype;

var arrayMethodIsStrict = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};

var $forEach$1 = arrayIteration.forEach;


var STRICT_METHOD = arrayMethodIsStrict('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = !STRICT_METHOD ? function forEach(callbackfn /* , thisArg */) {
  return $forEach$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
} : [].forEach;

var handlePrototype = function (CollectionPrototype) {
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
  } catch (error) {
    CollectionPrototype.forEach = arrayForEach;
  }
};

for (var COLLECTION_NAME in domIterables) {
  if (domIterables[COLLECTION_NAME]) {
    handlePrototype(global_1[COLLECTION_NAME] && global_1[COLLECTION_NAME].prototype);
  }
}

handlePrototype(domTokenListPrototype);

// `Object.getOwnPropertyDescriptors` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
_export({ target: 'Object', stat: true, sham: !descriptors }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject(object);
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
    var keys = ownKeys(O);
    var result = {};
    var index = 0;
    var key, descriptor;
    while (keys.length > index) {
      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
      if (descriptor !== undefined) createProperty(result, key, descriptor);
    }
    return result;
  }
});

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('slice');

var SPECIES$5 = wellKnownSymbol('species');
var Array$3 = global_1.Array;
var max$2 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = lengthOfArrayLike(O);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (isConstructor(Constructor) && (Constructor === Array$3 || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES$5];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array$3 || Constructor === undefined) {
        return arraySlice(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array$3 : Constructor)(max$2(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  }
});

var FUNCTION_NAME_EXISTS = functionName.EXISTS;

var defineProperty$3 = objectDefineProperty.f;

var FunctionPrototype$3 = Function.prototype;
var functionToString$1 = functionUncurryThis(FunctionPrototype$3.toString);
var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
var regExpExec = functionUncurryThis(nameRE.exec);
var NAME = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (descriptors && !FUNCTION_NAME_EXISTS) {
  defineProperty$3(FunctionPrototype$3, NAME, {
    configurable: true,
    get: function () {
      try {
        return regExpExec(nameRE, functionToString$1(this))[1];
      } catch (error) {
        return '';
      }
    }
  });
}

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
var $RegExp = global_1.RegExp;

var UNSUPPORTED_Y = fails(function () {
  var re = $RegExp('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

// UC Browser bug
// https://github.com/zloirock/core-js/issues/1008
var MISSED_STICKY = UNSUPPORTED_Y || fails(function () {
  return !$RegExp('a', 'y').sticky;
});

var BROKEN_CARET = UNSUPPORTED_Y || fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = $RegExp('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});

var regexpStickyHelpers = {
  BROKEN_CARET: BROKEN_CARET,
  MISSED_STICKY: MISSED_STICKY,
  UNSUPPORTED_Y: UNSUPPORTED_Y
};

// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
var $RegExp$1 = global_1.RegExp;

var regexpUnsupportedDotAll = fails(function () {
  var re = $RegExp$1('.', 's');
  return !(re.dotAll && re.exec('\n') && re.flags === 's');
});

// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
var $RegExp$2 = global_1.RegExp;

var regexpUnsupportedNcg = fails(function () {
  var re = $RegExp$2('(?<a>b)', 'g');
  return re.exec('b').groups.a !== 'b' ||
    'b'.replace(re, '$<a>c') !== 'bc';
});

/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */







var getInternalState$2 = internalState.get;



var nativeReplace = shared('native-string-replace', String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt = functionUncurryThis(''.charAt);
var indexOf$1 = functionUncurryThis(''.indexOf);
var replace = functionUncurryThis(''.replace);
var stringSlice$1 = functionUncurryThis(''.slice);

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  functionCall(nativeExec, re1, 'a');
  functionCall(nativeExec, re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y$1 = regexpStickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1 || regexpUnsupportedDotAll || regexpUnsupportedNcg;

if (PATCH) {
  patchedExec = function exec(string) {
    var re = this;
    var state = getInternalState$2(re);
    var str = toString_1(string);
    var raw = state.raw;
    var result, reCopy, lastIndex, match, i, object, group;

    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = functionCall(patchedExec, raw, str);
      re.lastIndex = raw.lastIndex;
      return result;
    }

    var groups = state.groups;
    var sticky = UNSUPPORTED_Y$1 && re.sticky;
    var flags = functionCall(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = replace(flags, 'y', '');
      if (indexOf$1(flags, 'g') === -1) {
        flags += 'g';
      }

      strCopy = stringSlice$1(str, re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt(str, re.lastIndex - 1) !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = functionCall(nativeExec, sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = stringSlice$1(match.input, charsAdded);
        match[0] = stringSlice$1(match[0], charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      functionCall(nativeReplace, match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    if (match && groups) {
      match.groups = object = objectCreate(null);
      for (i = 0; i < groups.length; i++) {
        group = groups[i];
        object[group[0]] = match[group[1]];
      }
    }

    return match;
  };
}

var regexpExec = patchedExec;

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
_export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
  exec: regexpExec
});

// TODO: Remove from `core-js@4` since it's moved to entry points








var SPECIES$6 = wellKnownSymbol('species');
var RegExpPrototype = RegExp.prototype;

var fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES$6] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () { execCalled = true; return null; };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    FORCED
  ) {
    var uncurriedNativeRegExpMethod = functionUncurryThis(/./[SYMBOL]);
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      var uncurriedNativeMethod = functionUncurryThis(nativeMethod);
      var $exec = regexp.exec;
      if ($exec === regexpExec || $exec === RegExpPrototype.exec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: uncurriedNativeRegExpMethod(regexp, str, arg2) };
        }
        return { done: true, value: uncurriedNativeMethod(str, regexp, arg2) };
      }
      return { done: false };
    });

    redefine(String.prototype, KEY, methods[0]);
    redefine(RegExpPrototype, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty(RegExpPrototype[SYMBOL], 'sham', true);
};

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
};

var charAt$1 = functionUncurryThis(''.charAt);
var charCodeAt = functionUncurryThis(''.charCodeAt);
var stringSlice$2 = functionUncurryThis(''.slice);

var createMethod$2 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString_1(requireObjectCoercible($this));
    var position = toIntegerOrInfinity(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt$1(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice$2(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$2(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$2(true)
};

var charAt$2 = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
var advanceStringIndex = function (S, index, unicode) {
  return index + (unicode ? charAt$2(S, index).length : 1);
};

var TypeError$g = global_1.TypeError;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
var regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (isCallable(exec)) {
    var result = functionCall(exec, R, S);
    if (result !== null) anObject(result);
    return result;
  }
  if (classofRaw(R) === 'RegExp') return functionCall(regexpExec, R, S);
  throw TypeError$g('RegExp#exec called on incompatible receiver');
};

var UNSUPPORTED_Y$2 = regexpStickyHelpers.UNSUPPORTED_Y;
var MAX_UINT32 = 0xFFFFFFFF;
var min$2 = Math.min;
var $push = [].push;
var exec$1 = functionUncurryThis(/./.exec);
var push$3 = functionUncurryThis($push);
var stringSlice$3 = functionUncurryThis(''.slice);

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  // eslint-disable-next-line regexp/no-empty-group -- required for testing
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

// @@split logic
fixRegexpWellKnownSymbolLogic('split', function (SPLIT, nativeSplit, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'.split(/(b)*/)[1] == 'c' ||
    // eslint-disable-next-line regexp/no-empty-group -- required for testing
    'test'.split(/(?:)/, -1).length != 4 ||
    'ab'.split(/(?:ab)*/).length != 2 ||
    '.'.split(/(.?)(.?)/).length != 4 ||
    // eslint-disable-next-line regexp/no-empty-capturing-group, regexp/no-empty-group -- required for testing
    '.'.split(/()()/).length > 1 ||
    ''.split(/.?/).length
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = toString_1(requireObjectCoercible(this));
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (separator === undefined) return [string];
      // If `separator` is not a regex, use native split
      if (!isRegexp(separator)) {
        return functionCall(nativeSplit, string, separator, lim);
      }
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = functionCall(regexpExec, separatorCopy, string)) {
        lastIndex = separatorCopy.lastIndex;
        if (lastIndex > lastLastIndex) {
          push$3(output, stringSlice$3(string, lastLastIndex, match.index));
          if (match.length > 1 && match.index < string.length) functionApply($push, output, arraySliceSimple(match, 1));
          lastLength = match[0].length;
          lastLastIndex = lastIndex;
          if (output.length >= lim) break;
        }
        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
      }
      if (lastLastIndex === string.length) {
        if (lastLength || !exec$1(separatorCopy, '')) push$3(output, '');
      } else push$3(output, stringSlice$3(string, lastLastIndex));
      return output.length > lim ? arraySliceSimple(output, 0, lim) : output;
    };
  // Chakra, V8
  } else if ('0'.split(undefined, 0).length) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : functionCall(nativeSplit, this, separator, limit);
    };
  } else internalSplit = nativeSplit;

  return [
    // `String.prototype.split` method
    // https://tc39.es/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible(this);
      var splitter = separator == undefined ? undefined : getMethod(separator, SPLIT);
      return splitter
        ? functionCall(splitter, separator, O, limit)
        : functionCall(internalSplit, toString_1(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (string, limit) {
      var rx = anObject(this);
      var S = toString_1(string);
      var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);

      if (res.done) return res.value;

      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (UNSUPPORTED_Y$2 ? 'g' : 'y');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(UNSUPPORTED_Y$2 ? '^(?:' + rx.source + ')' : rx, flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = UNSUPPORTED_Y$2 ? 0 : q;
        var z = regexpExecAbstract(splitter, UNSUPPORTED_Y$2 ? stringSlice$3(S, q) : S);
        var e;
        if (
          z === null ||
          (e = min$2(toLength(splitter.lastIndex + (UNSUPPORTED_Y$2 ? q : 0)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          push$3(A, stringSlice$3(S, p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            push$3(A, z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      push$3(A, stringSlice$3(S, p));
      return A;
    }
  ];
}, !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y$2);

var PROPER_FUNCTION_NAME = functionName.PROPER;







var TO_STRING = 'toString';
var RegExpPrototype$1 = RegExp.prototype;
var n$ToString = RegExpPrototype$1[TO_STRING];
var getFlags = functionUncurryThis(regexpFlags);

var NOT_GENERIC = fails(function () { return n$ToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = PROPER_FUNCTION_NAME && n$ToString.name != TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine(RegExp.prototype, TO_STRING, function toString() {
    var R = anObject(this);
    var p = toString_1(R.source);
    var rf = R.flags;
    var f = toString_1(rf === undefined && objectIsPrototypeOf(RegExpPrototype$1, R) && !('flags' in RegExpPrototype$1) ? getFlags(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';
var TypeError$h = global_1.TypeError;

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED$2 = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
_export({ target: 'Array', proto: true, forced: FORCED$2 }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = lengthOfArrayLike(E);
        if (n + len > MAX_SAFE_INTEGER) throw TypeError$h(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER) throw TypeError$h(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('splice');

var TypeError$i = global_1.TypeError;
var max$3 = Math.max;
var min$3 = Math.min;
var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject(this);
    var len = lengthOfArrayLike(O);
    var actualStart = toAbsoluteIndex(start, len);
    var argumentsLength = arguments.length;
    var insertCount, actualDeleteCount, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min$3(max$3(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
    }
    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER$1) {
      throw TypeError$i(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
    }
    A = arraySpeciesCreate(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty(A, k, O[from]);
    }
    A.length = actualDeleteCount;
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (from in O) O[to] = O[from];
        else delete O[to];
      }
      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (from in O) O[to] = O[from];
        else delete O[to];
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    O.length = len - actualDeleteCount + insertCount;
    return A;
  }
});

// `SameValue` abstract operation
// https://tc39.es/ecma262/#sec-samevalue
// eslint-disable-next-line es/no-object-is -- safe
var sameValue = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

// @@search logic
fixRegexpWellKnownSymbolLogic('search', function (SEARCH, nativeSearch, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.es/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = requireObjectCoercible(this);
      var searcher = regexp == undefined ? undefined : getMethod(regexp, SEARCH);
      return searcher ? functionCall(searcher, regexp, O) : new RegExp(regexp)[SEARCH](toString_1(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@search
    function (string) {
      var rx = anObject(this);
      var S = toString_1(string);
      var res = maybeCallNative(nativeSearch, rx, S);

      if (res.done) return res.value;

      var previousLastIndex = rx.lastIndex;
      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = regexpExecAbstract(rx, S);
      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype$1 = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
  objectDefineProperty.f(ArrayPrototype$1, UNSCOPABLES, {
    configurable: true,
    value: objectCreate(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables = function (key) {
  ArrayPrototype$1[UNSCOPABLES][key] = true;
};

var $includes = arrayIncludes.includes;


// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
_export({ target: 'Array', proto: true }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');

var TypeError$j = global_1.TypeError;

var notARegexp = function (it) {
  if (isRegexp(it)) {
    throw TypeError$j("The method doesn't accept regular expressions");
  } return it;
};

var MATCH$1 = wellKnownSymbol('match');

var correctIsRegexpLogic = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (error1) {
    try {
      regexp[MATCH$1] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (error2) { /* empty */ }
  } return false;
};

var stringIndexOf = functionUncurryThis(''.indexOf);

// `String.prototype.includes` method
// https://tc39.es/ecma262/#sec-string.prototype.includes
_export({ target: 'String', proto: true, forced: !correctIsRegexpLogic('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~stringIndexOf(
      toString_1(requireObjectCoercible(this)),
      toString_1(notARegexp(searchString)),
      arguments.length > 1 ? arguments[1] : undefined
    );
  }
});

var $map = arrayIteration.map;


var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pos"],{

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js&":
/*!********************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js& ***!
  \********************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcViewsAppPagesPosVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! @babel/runtime/regenerator */"./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default=/*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */var nprogress__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! nprogress */"./node_modules/nprogress/nprogress.js");
/* harmony import */var nprogress__WEBPACK_IMPORTED_MODULE_1___default=/*#__PURE__*/__webpack_require__.n(nprogress__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */var vuex__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! vuex */"./node_modules/vuex/dist/vuex.esm.js");
/* harmony import */var vue_easy_print__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(/*! vue-easy-print */"./node_modules/vue-easy-print/src/index.js");
/* harmony import */var vue_barcode__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__(/*! vue-barcode */"./node_modules/vue-barcode/index.js");
/* harmony import */var vue_barcode__WEBPACK_IMPORTED_MODULE_4___default=/*#__PURE__*/__webpack_require__.n(vue_barcode__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */var vue_flag_icon__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__(/*! vue-flag-icon */"./node_modules/vue-flag-icon/index.js");
/* harmony import */var _utils__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__(/*! ./../../../utils */"./resources/src/utils/index.js");
/* harmony import */var _stripe_stripe_js__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__(/*! @stripe/stripe-js */"./node_modules/@stripe/stripe-js/dist/stripe.esm.js");
var _objectSpread2;



function asyncGeneratorStep(gen,resolve,reject,_next,_throw,key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else {Promise.resolve(value).then(_next,_throw);}}

function _asyncToGenerator(fn){return function(){var self=this,args=arguments;return new Promise(function(resolve,reject){var gen=fn.apply(self,args);function _next(value){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"next",value);}function _throw(err){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"throw",err);}_next(undefined);});};}

function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);enumerableOnly&&(symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable;})),keys.push.apply(keys,symbols);}return keys;}

function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?ownKeys(Object(source),!0).forEach(function(key){_defineProperty(target,key,source[key]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(target,Object.getOwnPropertyDescriptors(source)):ownKeys(Object(source)).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key));});}return target;}

function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else {obj[key]=value;}return obj;}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//







/* harmony default export */__webpack_exports__["default"]={
components:{
vueEasyPrint:vue_easy_print__WEBPACK_IMPORTED_MODULE_3__["default"],
barcode:vue_barcode__WEBPACK_IMPORTED_MODULE_4___default.a,
FlagIcon:vue_flag_icon__WEBPACK_IMPORTED_MODULE_5__["default"]},

metaInfo:{
title:"POS"},

data:function data(){
return {
langs:["en","fr","ar","de","es","it","Ind","thai","tr_ch","sm_ch","tur","ru","hn","vn"],
stripe:{},
stripe_key:'',
cardElement:{},
paymentProcessing:false,
payment:{
amount:"",
Reglement:"",
notes:""},

isLoading:true,
GrandTotal:0,
total:0,
Ref:"",
search:"",
SearchProduct:"",
clients:[],
warehouses:[],
products:[],
details:[],
detail:{},
categories:[],
brands:[],
product_currentPage:1,
paginated_Products:"",
product_perPage:8,
product_totalRows:"",
paginated_Brands:"",
brand_currentPage:1,
brand_perPage:3,
paginated_Category:"",
category_currentPage:1,
category_perPage:3,
barcodeFormat:"CODE128",
invoice_pos:{
sale:{
Ref:"",
client_name:"",
discount:"",
taxe:"",
date:"",
tax_rate:"",
shipping:"",
GrandTotal:""},

details:[],
setting:{
logo:"",
CompanyName:"",
CompanyAdress:"",
email:"",
CompanyPhone:""}},


sale:{
warehouse_id:"",
client_id:"",
tax_rate:0,
shipping:0,
discount:0,
TaxNet:0},

client:{
id:"",
name:"",
code:"",
email:"",
phone:"",
country:"",
city:"",
adresse:""},

category_id:"",
brand_id:"",
product:{
id:"",
code:"",
current:"",
quantity:"",
check_qty:"",
discount:"",
DiscountNet:"",
discount_Method:"",
name:"",
unitSale:"",
Net_price:"",
Unit_price:"",
Total_price:"",
subtotal:"",
product_id:"",
detail_id:"",
taxe:"",
tax_percent:"",
tax_method:"",
product_variant_id:""},

sound:"/audio/Beep.wav",
audio:new Audio("/audio/Beep.wav")};

},
computed:_objectSpread(_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapGetters"])(["currentUser"])),{},{
brand_totalRows:function brand_totalRows(){
return this.brands.length;
},
category_totalRows:function category_totalRows(){
return this.categories.length;
}}),

mounted:function mounted(){
this.changeSidebarProperties();
this.paginate_products(this.product_perPage,0);
},
methods:_objectSpread(_objectSpread(_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapActions"])(["changeSidebarProperties","changeThemeMode","logout"])),Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapGetters"])(["currentUser"])),{},(_objectSpread2={
logoutUser:function logoutUser(){
this.$store.dispatch("logout");
},
loadStripe_payment:function loadStripe_payment(){
var _this=this;

return _asyncToGenerator(/*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(){
var elements;
return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context){
while(1){
switch(_context.prev=_context.next){
case 0:
_context.next=2;
return Object(_stripe_stripe_js__WEBPACK_IMPORTED_MODULE_7__["loadStripe"])("".concat(_this.stripe_key));

case 2:
_this.stripe=_context.sent;
elements=_this.stripe.elements();
_this.cardElement=elements.create("card",{
classes:{
base:"bg-gray-100 rounded border border-gray-300 focus:border-indigo-500 text-base outline-none text-gray-700 p-3 leading-8 transition-colors duration-200 ease-in-out"}});



_this.cardElement.mount("#card-element");

case 6:
case"end":
return _context.stop();}

}
},_callee);
}))();
},
//---------------------- Event Select Payment Method ------------------------------\\
Selected_PaymentMethod:function Selected_PaymentMethod(value){
var _this2=this;

if(value=="credit card"){
setTimeout(function(){
_this2.loadStripe_payment();
},500);
}
},
SetLocal:function SetLocal(locale){
this.$i18n.locale=locale;
this.$store.dispatch("language/setLanguage",locale);
Fire.$emit("ChangeLanguage");
},
handleFullScreen:function handleFullScreen(){
_utils__WEBPACK_IMPORTED_MODULE_6__["default"].toggleFullScreen();
}},
_defineProperty(_objectSpread2,"logoutUser",function logoutUser(){
this.logout();
}),_defineProperty(_objectSpread2,"Product_paginatePerPage",function Product_paginatePerPage(){
this.paginate_products(this.product_perPage,0);
}),_defineProperty(_objectSpread2,"paginate_products",function paginate_products(pageSize,pageNumber){
var itemsToParse=this.products;
this.paginated_Products=itemsToParse.slice(pageNumber*pageSize,(pageNumber+1)*pageSize);
}),_defineProperty(_objectSpread2,"Product_onPageChanged",function Product_onPageChanged(page){
this.paginate_products(this.product_perPage,page-1);
this.getProducts(page);
}),_defineProperty(_objectSpread2,"BrandpaginatePerPage",function BrandpaginatePerPage(){
this.paginate_Brands(this.brand_perPage,0);
}),_defineProperty(_objectSpread2,"paginate_Brands",function paginate_Brands(pageSize,pageNumber){
var itemsToParse=this.brands;
this.paginated_Brands=itemsToParse.slice(pageNumber*pageSize,(pageNumber+1)*pageSize);
}),_defineProperty(_objectSpread2,"BrandonPageChanged",function BrandonPageChanged(page){
this.paginate_Brands(this.brand_perPage,page-1);
}),_defineProperty(_objectSpread2,"Category_paginatePerPage",function Category_paginatePerPage(){
this.paginate_Category(this.category_perPage,0);
}),_defineProperty(_objectSpread2,"paginate_Category",function paginate_Category(pageSize,pageNumber){
var itemsToParse=this.categories;
this.paginated_Category=itemsToParse.slice(pageNumber*pageSize,(pageNumber+1)*pageSize);
}),_defineProperty(_objectSpread2,"Category_onPageChanged",function Category_onPageChanged(page){
this.paginate_Category(this.category_perPage,page-1);
}),_defineProperty(_objectSpread2,"Submit_Pos",function Submit_Pos(){
var _this3=this;

// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.set(0.1);
this.$refs.create_pos.validate().then(function(success){
if(!success){
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

if(_this3.sale.client_id==""||_this3.sale.client_id===null){
_this3.makeToast("danger",_this3.$t("Choose_Customer"),_this3.$t("Failed"));
}else if(_this3.sale.warehouse_id==""||_this3.sale.warehouse_id===null){
_this3.makeToast("danger",_this3.$t("Choose_Warehouse"),_this3.$t("Failed"));
}else {
_this3.makeToast("danger",_this3.$t("Please_fill_the_form_correctly"),_this3.$t("Failed"));
}
}else {
if(_this3.verifiedForm()){
Fire.$emit("pay_now");
}else {
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();
}
}
});
}),_defineProperty(_objectSpread2,"submit_Update_Detail",function submit_Update_Detail(){
var _this4=this;

this.$refs.Update_Detail.validate().then(function(success){
if(!success){
return;
}else {
_this4.Update_Detail();
}
});
}),_defineProperty(_objectSpread2,"Submit_Payment",function Submit_Payment(){
var _this5=this;

// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.set(0.1);
this.$refs.Add_payment.validate().then(function(success){
if(!success){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

_this5.makeToast("danger",_this5.$t("Please_fill_the_form_correctly"),_this5.$t("Failed"));
}else {
_this5.CreatePOS();
}
});
}),_defineProperty(_objectSpread2,"Submit_Customer",function Submit_Customer(){
var _this6=this;

// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.set(0.1);
this.$refs.Create_Customer.validate().then(function(success){
if(!success){
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

_this6.makeToast("danger",_this6.$t("Please_fill_the_form_correctly"),_this6.$t("Failed"));
}else {
_this6.Create_Client();
}
});
}),_defineProperty(_objectSpread2,"Create_Client",function Create_Client(){
var _this7=this;

axios.post("clients",{
name:this.client.name,
email:this.client.email,
phone:this.client.phone,
country:this.client.country,
city:this.client.city,
adresse:this.client.adresse}).
then(function(response){
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

_this7.makeToast("success",_this7.$t("Create.TitleCustomer"),_this7.$t("Success"));

_this7.Get_Client_Without_Paginate();

_this7.$bvModal.hide("New_Customer");
})["catch"](function(error){
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

_this7.makeToast("danger",_this7.$t("InvalidData"),_this7.$t("Failed"));
});
}),_defineProperty(_objectSpread2,"New_Client",function New_Client(){
this.reset_Form_client();
this.$bvModal.show("New_Customer");
}),_defineProperty(_objectSpread2,"reset_Form_client",function reset_Form_client(){
this.client={
id:"",
name:"",
email:"",
phone:"",
country:"",
city:"",
adresse:""};

}),_defineProperty(_objectSpread2,"Get_Client_Without_Paginate",function Get_Client_Without_Paginate(){
var _this8=this;

axios.get("Get_Clients_Without_Paginate").then(function(_ref){
var data=_ref.data;
return _this8.clients=data;
});
}),_defineProperty(_objectSpread2,"getValidationState",function getValidationState(_ref2){
var dirty=_ref2.dirty,
validated=_ref2.validated,
_ref2$valid=_ref2.valid,
valid=_ref2$valid===void 0?null:_ref2$valid;
return dirty||validated?valid:null;
}),_defineProperty(_objectSpread2,"makeToast",function makeToast(variant,msg,title){
this.$root.$bvToast.toast(msg,{
title:title,
variant:variant,
solid:true});

}),_defineProperty(_objectSpread2,"Selected_Warehouse",function Selected_Warehouse(value){
this.Get_Products_By_Warehouse(value);
}),_defineProperty(_objectSpread2,"Get_Products_By_Warehouse",function Get_Products_By_Warehouse(id){
var _this9=this;

axios.get("Products/Warehouse/"+id+"?stock="+1).then(function(_ref3){
var data=_ref3.data;
return _this9.products=data;
});
}),_defineProperty(_objectSpread2,"add_product",function add_product(code){
if(this.details.some(function(detail){
return detail.code===code;
})){
this.makeToast("warning",this.$t("AlreadyAdd"),this.$t("Warning"));// Complete the animation of theprogress bar.

nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();
}else {
if(this.details.length>0){
this.order_detail_id();
}else if(this.details.length===0){
this.product.detail_id=1;
}

this.details.push(this.product);
}
}),_defineProperty(_objectSpread2,"order_detail_id",function order_detail_id(){
this.product.detail_id=0;
var len=this.details.length;
this.product.detail_id=this.details[len-1].detail_id+1;
}),_defineProperty(_objectSpread2,"Modal_Update_Detail",function Modal_Update_Detail(detail){
this.detail={};
this.detail.name=detail.name;
this.detail.detail_id=detail.detail_id;
this.detail.Unit_price=detail.Unit_price;
this.detail.tax_method=detail.tax_method;
this.detail.discount_Method=detail.discount_Method;
this.detail.discount=detail.discount;
this.detail.quantity=detail.quantity;
this.detail.tax_percent=detail.tax_percent;
this.detail.taxe=detail.taxe;
this.$bvModal.show("form_Update_Detail");
}),_defineProperty(_objectSpread2,"Update_Detail",function Update_Detail(){
for(var i=0;i<this.details.length;i++){
if(this.details[i].detail_id===this.detail.detail_id){
this.details[i].tax_percent=this.detail.tax_percent;
this.details[i].Unit_price=this.detail.Unit_price;
this.details[i].quantity=this.detail.quantity;
this.details[i].tax_method=this.detail.tax_method;
this.details[i].discount_Method=this.detail.discount_Method;
this.details[i].discount=this.detail.discount;

if(this.details[i].discount_Method=="2"){
//Fixed
this.details[i].DiscountNet=this.detail.discount;
}else {
//Percentage %
this.details[i].DiscountNet=parseFloat(this.detail.Unit_price*this.details[i].discount/100);
}

if(this.details[i].tax_method=="1"){
//Exclusive
this.details[i].Net_price=parseFloat(this.detail.Unit_price-this.details[i].DiscountNet);
this.details[i].taxe=parseFloat(this.detail.tax_percent*(this.detail.Unit_price-this.details[i].DiscountNet)/100);
this.details[i].Total_price=parseFloat(this.details[i].Net_price+this.details[i].taxe);
}else {
//Inclusive
this.details[i].Net_price=parseFloat((this.detail.Unit_price-this.details[i].DiscountNet)/(this.detail.tax_percent/100+1));
this.details[i].taxe=parseFloat(this.detail.Unit_price-this.details[i].Net_price-this.details[i].DiscountNet);
this.details[i].Total_price=parseFloat(this.details[i].Net_price+this.details[i].taxe);
}

this.$forceUpdate();
}
}

this.CaclulTotal();
this.$bvModal.hide("form_Update_Detail");
}),_defineProperty(_objectSpread2,"verifiedForm",function verifiedForm(){
if(this.details.length<=0){
this.makeToast("warning",this.$t("AddProductToList"),this.$t("Warning"));
return false;
}else {
var count=0;

for(var i=0;i<this.details.length;i++){
if(this.details[i].quantity==""||this.details[i].quantity===0){
count+=1;
}
}

if(count>0){
this.makeToast("warning",this.$t("AddQuantity"),this.$t("Warning"));
return false;
}else {
return true;
}
}
}),_defineProperty(_objectSpread2,"print_pos",function print_pos(){
this.$refs.Show_invoice.print();
}),_defineProperty(_objectSpread2,"Invoice_POS",function Invoice_POS(id){
var _this10=this;

// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.set(0.1);
axios.get("Sales/Print_Invoice/"+id).then(function(response){
_this10.invoice_pos=response.data;
setTimeout(function(){
// Complete the animation of the  progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

_this10.$bvModal.show("Show_invoice");
},500);
setTimeout(function(){
return _this10.print_pos();
},1000);
})["catch"](function(){
// Complete the animation of the  progress bar.
setTimeout(function(){
return nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();
},500);
});
}),_defineProperty(_objectSpread2,"processPayment",function processPayment(){
var _this11=this;

return _asyncToGenerator(/*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee2(){
var _yield$_this11$stripe,token,error;

return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee2$(_context2){
while(1){
switch(_context2.prev=_context2.next){
case 0:
_this11.paymentProcessing=true;
_context2.next=3;
return _this11.stripe.createToken(_this11.cardElement);

case 3:
_yield$_this11$stripe=_context2.sent;
token=_yield$_this11$stripe.token;
error=_yield$_this11$stripe.error;

if(error){
_this11.paymentProcessing=false;
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

_this11.makeToast("danger",_this11.$t("InvalidData"),_this11.$t("Failed"));
}else {
axios.post("pos/CreatePOS",{
client_id:_this11.sale.client_id,
warehouse_id:_this11.sale.warehouse_id,
tax_rate:_this11.sale.tax_rate,
TaxNet:_this11.sale.TaxNet,
discount:_this11.sale.discount,
shipping:_this11.sale.shipping,
details:_this11.details,
GrandTotal:_this11.GrandTotal,
payment:_this11.payment,
token:token.id}).
then(function(response){
_this11.paymentProcessing=false;

if(response.data.success===true){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

_this11.Invoice_POS(response.data.id);

_this11.$bvModal.hide("Add_Payment");

_this11.Reset_Pos();
}
})["catch"](function(error){
_this11.paymentProcessing=false;// Complete the animation of theprogress bar.

nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

_this11.makeToast("danger",_this11.$t("InvalidData"),_this11.$t("Failed"));
});
}

case 7:
case"end":
return _context2.stop();}

}
},_callee2);
}))();
}),_defineProperty(_objectSpread2,"CreatePOS",function CreatePOS(){
var _this12=this;

nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.set(0.1);

if(this.payment.Reglement=='credit card'){
if(this.stripe_key!=''){
this.processPayment();
}else {
this.makeToast("danger",this.$t("credit_card_account_not_available"),this.$t("Failed"));
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();
}
}else {
axios.post("pos/CreatePOS",{
client_id:this.sale.client_id,
warehouse_id:this.sale.warehouse_id,
tax_rate:this.sale.tax_rate,
TaxNet:this.sale.TaxNet,
discount:this.sale.discount,
shipping:this.sale.shipping,
details:this.details,
GrandTotal:this.GrandTotal,
payment:this.payment}).
then(function(response){
if(response.data.success===true){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

_this12.Invoice_POS(response.data.id);

_this12.$bvModal.hide("Add_Payment");

_this12.Reset_Pos();
}
})["catch"](function(error){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();

_this12.makeToast("danger",_this12.$t("InvalidData"),_this12.$t("Failed"));
});
}
}),_defineProperty(_objectSpread2,"formatNumber",function formatNumber(number,dec){
var value=(typeof number==="string"?number:number.toString()).split(".");
if(dec<=0)return value[0];
var formated=value[1]||"";
if(formated.length>dec)return "".concat(value[0],".").concat(formated.substr(0,dec));

while(formated.length<dec){
formated+="0";
}

return "".concat(value[0],".").concat(formated);
}),_defineProperty(_objectSpread2,"Get_Product_Details",function Get_Product_Details(product,product_id){
var _this13=this;

axios.get("Products/"+product_id).then(function(response){
_this13.product.discount=0;
_this13.product.DiscountNet=0;
_this13.product.discount_Method="2";
_this13.product.product_id=response.data.id;
_this13.product.name=response.data.name;
_this13.product.Net_price=response.data.Net_price;
_this13.product.Total_price=response.data.Total_price;
_this13.product.Unit_price=response.data.Unit_price;
_this13.product.taxe=response.data.tax_price;
_this13.product.tax_method=response.data.tax_method;
_this13.product.tax_percent=response.data.tax_percent;
_this13.product.unitSale=response.data.unitSale;
_this13.product.product_variant_id=product.product_variant_id;
_this13.product.code=product.code;

_this13.add_product(product.code);

_this13.CaclulTotal();// Complete the animation of theprogress bar.


nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();
});
}),_defineProperty(_objectSpread2,"CaclulTotal",function CaclulTotal(){
this.total=0;

for(var i=0;i<this.details.length;i++){
var tax=this.details[i].taxe*this.details[i].quantity;
this.details[i].subtotal=parseFloat(this.details[i].quantity*this.details[i].Net_price+tax);
this.total=parseFloat(this.total+this.details[i].subtotal);
}

var total_without_discount=parseFloat(this.total-this.sale.discount);
this.sale.TaxNet=parseFloat(total_without_discount*this.sale.tax_rate/100);
this.GrandTotal=parseFloat(total_without_discount+this.sale.TaxNet+this.sale.shipping);
}),_defineProperty(_objectSpread2,"Verified_Qty",function Verified_Qty(detail,id){
for(var i=0;i<this.details.length;i++){
if(this.details[i].detail_id===id){
if(isNaN(detail.quantity)){
this.details[i].quantity=detail.current;
}

if(detail.quantity>detail.current){
this.makeToast("warning",this.$t("LowStock"),this.$t("Warning"));
this.details[i].quantity=detail.current;
}else {
this.details[i].quantity=detail.quantity;
}
}
}

this.$forceUpdate();
this.CaclulTotal();
}),_defineProperty(_objectSpread2,"increment",function increment(detail,id){
for(var i=0;i<this.details.length;i++){
if(this.details[i].detail_id==id){
if(this.details[i].quantity+1>this.details[i].current){
this.makeToast("warning",this.$t("LowStock"),this.$t("Warning"));
}else {
this.details[i].quantity++;
}
}
}

this.CaclulTotal();
this.$forceUpdate();
}),_defineProperty(_objectSpread2,"decrement",function decrement(detail,id){
for(var i=0;i<this.details.length;i++){
if(this.details[i].detail_id==id){
if(detail.quantity-1>detail.current||detail.quantity-1<1){
this.makeToast("warning",this.$t("LowStock"),this.$t("Warning"));
}else {
this.details[i].quantity--;
}
}
}

this.CaclulTotal();
this.$forceUpdate();
}),_defineProperty(_objectSpread2,"keyup_OrderTax",function keyup_OrderTax(){
if(isNaN(this.sale.tax_rate)){
this.sale.tax_rate=0;
}else {
this.CaclulTotal();
}
}),_defineProperty(_objectSpread2,"keyup_Discount",function keyup_Discount(){
if(isNaN(this.sale.discount)){
this.sale.discount=0;
}else {
this.CaclulTotal();
}
}),_defineProperty(_objectSpread2,"keyup_Shipping",function keyup_Shipping(){
if(isNaN(this.sale.shipping)){
this.sale.shipping=0;
}else {
this.CaclulTotal();
}
}),_defineProperty(_objectSpread2,"delete_Product_Detail",function delete_Product_Detail(id){
for(var i=0;i<this.details.length;i++){
if(id===this.details[i].detail_id){
this.details.splice(i,1);
this.CaclulTotal();
}
}
}),_defineProperty(_objectSpread2,"Reset_Pos",function Reset_Pos(){
this.details=[];
this.product={};
this.sale.client_id="";
this.sale.tax_rate=0;
this.sale.TaxNet=0;
this.sale.shipping=0;
this.sale.discount=0;
this.GrandTotal=0;
this.total=0;
this.category_id="";
this.brand_id="";
this.search="";
this.getProducts(1);
}),_defineProperty(_objectSpread2,"Check_Product_Exist",function Check_Product_Exist(product,id){
this.audio.play();// Start the progress bar.

nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.set(0.1);
this.product={};
this.product.current=product.qte_sale;

if(product.qte_sale<1){
this.product.quantity=product.qte_sale;
}else {
this.product.quantity=1;
}

this.Get_Product_Details(product,id);
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();
}),_defineProperty(_objectSpread2,"Products_by_Category",function Products_by_Category(id){
this.category_id=id;
this.getProducts(1);
}),_defineProperty(_objectSpread2,"Products_by_Brands",function Products_by_Brands(id){
this.brand_id=id;
this.getProducts(1);
}),_defineProperty(_objectSpread2,"getAllCategory",function getAllCategory(){
this.category_id="";
this.getProducts(1);
}),_defineProperty(_objectSpread2,"GetAllBrands",function GetAllBrands(){
this.brand_id="";
this.getProducts(1);
}),_defineProperty(_objectSpread2,"getProducts",function getProducts(){
var _this14=this;

var page=arguments.length>0&&arguments[0]!==undefined?arguments[0]:1;
// Start the progress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.start();
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.set(0.1);
axios.get("GetProductsByParametre?page="+page+"&category_id="+this.category_id+"&brand_id="+this.brand_id+"&warehouse_id="+this.sale.warehouse_id+"&search="+this.SearchProduct+"&stock="+1).then(function(response){
// this.products = [];
_this14.products=response.data.products;
_this14.product_totalRows=response.data.totalRows;

_this14.Product_paginatePerPage();// Complete the animation of theprogress bar.


nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();
})["catch"](function(response){
// Complete the animation of theprogress bar.
nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();
});
}),_defineProperty(_objectSpread2,"GetElementsPos",function GetElementsPos(){
var _this15=this;

axios.get("pos/GetELementPos").then(function(response){
_this15.clients=response.data.clients;
_this15.warehouses=response.data.warehouses;
_this15.categories=response.data.categories;
_this15.brands=response.data.brands;
_this15.sale.warehouse_id=response.data.defaultWarehouse;
_this15.sale.client_id=response.data.defaultClient;

_this15.getProducts();

_this15.paginate_Brands(_this15.brand_perPage,0);

_this15.paginate_Category(_this15.category_perPage,0);

_this15.stripe_key=response.data.stripe_key;
_this15.isLoading=false;
})["catch"](function(response){
_this15.isLoading=false;
});
}),_objectSpread2)),
//-------------------- Created Function -----\\
created:function created(){
var _this16=this;

this.GetElementsPos();
Fire.$on("pay_now",function(){
setTimeout(function(){
_this16.payment.amount=_this16.formatNumber(_this16.GrandTotal,2);
_this16.payment.Reglement="Cash";

_this16.$bvModal.show("Add_Payment");// Complete the animation of theprogress bar.


nprogress__WEBPACK_IMPORTED_MODULE_1___default.a.done();
},500);
});
}};


/***/},

/***/"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487&":
/*!************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487& ***!
  \************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcViewsAppPagesPosVueVueTypeTemplateId4cc49487(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){
var _vm=this;
var _h=_vm.$createElement;
var _c=_vm._self._c||_h;
return _c("div",{staticClass:"pos_page"},[
_c(
"div",
{
staticClass:
"container-fluid p-0 app-admin-wrap layout-sidebar-large clearfix",
attrs:{id:"pos"}},

[
_vm.isLoading?
_c("div",{
staticClass:"loading_page spinner spinner-primary mr-3"}):

_vm._e(),
_vm._v(" "),
!_vm.isLoading?
_c(
"b-row",
[
_c(
"b-col",
{attrs:{md:"5"}},
[
_c(
"b-card",
{staticClass:"card-order",attrs:{"no-body":""}},
[
_c("div",{staticClass:"main-header"},[
_c(
"div",
{staticClass:"logo"},
[
_c(
"router-link",
{attrs:{to:"/app/dashboard"}},
[
_c("img",{
attrs:{
src:"/images/"+_vm.currentUser.logo,
alt:"",
width:"60",
height:"60"}})])],





1),

_vm._v(" "),
_c("div",{staticClass:"mx-auto"}),
_vm._v(" "),
_c("div",{staticClass:"header-part-right"},[
_c("i",{
staticClass:
"i-Full-Screen header-icon d-none d-sm-inline-block",
on:{click:_vm.handleFullScreen}}),

_vm._v(" "),
_c(
"div",
{staticClass:"dropdown"},
[
_c(
"b-dropdown",
{
staticClass:"m-md-2",
attrs:{
id:"dropdown",
text:"Dropdown Button",
"toggle-class":"text-decoration-none",
"no-caret":"",
right:"",
variant:"link"}},


[
_c("template",{slot:"button-content"},[
_c("i",{
staticClass:
"i-Globe text-muted header-icon",
attrs:{
role:"button",
id:"dropdownMenuButton",
"data-toggle":"dropdown",
"aria-haspopup":"true",
"aria-expanded":"false"}})]),



_vm._v(" "),
_c(
"vue-perfect-scrollbar",
{
ref:"myData",
staticClass:
"dropdown-menu-left rtl-ps-none notification-dropdown ps scroll",
attrs:{
settings:{
suppressScrollX:true,
wheelPropagation:false}}},



[
_c(
"div",
{staticClass:"menu-icon-grid"},
[
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("en");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-gb",
attrs:{title:"en"}}),

_vm._v(
" English\n                      ")]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("fr");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-fr",
attrs:{title:"fr"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("French")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("ar");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-sa",
attrs:{title:"sa"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("Arabic")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("tur");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-tr",
attrs:{title:"sa"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("Turkish")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("sm_ch");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-cn",
attrs:{title:"sa"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("Simplified Chinese")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("thai");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-tw",
attrs:{title:"sa"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("Thaï")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("hn");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-in",
attrs:{title:"sa"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("Hindi")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("de");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-de",
attrs:{title:"de"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("German")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("es");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-es",
attrs:{title:"es"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("Spanish")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("it");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-it",
attrs:{title:"it"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("Italien")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("Ind");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-id",
attrs:{title:"sa"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("Indonesian")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("tr_ch");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-cn",
attrs:{title:"sa"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[
_vm._v(
"Traditional Chinese")])]),





_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("ru");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-ru",
attrs:{title:"sa"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("Russian")])]),



_vm._v(" "),
_c(
"a",
{
on:{
click:function click($event){
return _vm.SetLocal("vn");
}}},


[
_c("i",{
staticClass:
"flag-icon flag-icon-squared flag-icon-vn",
attrs:{title:"sa"}}),

_vm._v(" "),
_c(
"span",
{staticClass:"title-lang"},
[_vm._v("Vietnamese")])])])])],








2)],


1),

_vm._v(" "),
_c(
"div",
{staticClass:"dropdown"},
[
_c(
"b-dropdown",
{
staticClass:
"m-md-2 user col align-self-end",
attrs:{
id:"dropdown-1",
text:"Dropdown Button",
"toggle-class":"text-decoration-none",
"no-caret":"",
variant:"link",
right:""}},


[
_c("template",{slot:"button-content"},[
_c("img",{
attrs:{
src:
"/images/avatar/"+
_vm.currentUser.avatar,
id:"userDropdown",
alt:"",
"data-toggle":"dropdown",
"aria-haspopup":"true",
"aria-expanded":"false"}})]),



_vm._v(" "),
_c(
"div",
{
staticClass:"dropdown-menu-left",
attrs:{
"aria-labelledby":"userDropdown"}},


[
_c(
"div",
{staticClass:"dropdown-header"},
[
_c("i",{
staticClass:"i-Lock-User mr-1"}),

_vm._v(" "),
_c("span",[
_vm._v(
_vm._s(_vm.currentUser.username))])]),




_vm._v(" "),
_c(
"router-link",
{
staticClass:"dropdown-item",
attrs:{to:"/app/profile"}},

[_vm._v(_vm._s(_vm.$t("profil")))]),

_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes(
"setting_system")?

_c(
"router-link",
{
staticClass:"dropdown-item",
attrs:{
to:"/app/settings/System_settings"}},


[
_vm._v(
_vm._s(_vm.$t("Settings")))]):



_vm._e(),
_vm._v(" "),
_c(
"a",
{
staticClass:"dropdown-item",
attrs:{href:"#"},
on:{
click:function click($event){
$event.preventDefault();
return _vm.logoutUser.apply(
null,
arguments);

}}},


[_vm._v(_vm._s(_vm.$t("logout")))])],


1)],


2)],


1)])]),



_vm._v(" "),
_c(
"validation-observer",
{ref:"create_pos"},
[
_c(
"b-form",
{
on:{
submit:function submit($event){
$event.preventDefault();
return _vm.Submit_Pos.apply(null,arguments);
}}},


[
_c(
"b-card-body",
[
_c(
"b-row",
[
_c(
"b-col",
{
attrs:{
lg:"12",
md:"12",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Customer",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(ref){
var valid=ref.valid;
var errors=ref.errors;
return _c(
"b-input-group",
{
staticClass:
"input-customer"},

[
_c("v-select",{
staticClass:
"w-100",
class:{
"is-invalid":
!!errors.length},

attrs:{
state:errors[0]?
false:
valid?
true:
null,
reduce:function reduce(
label)
{
return label.value;
},
placeholder:
_vm.$t(
"Choose_Customer"),

options:
_vm.clients.map(
function(
clients)
{
return {
label:
clients.name,
value:
clients.id};

})},


model:{
value:
_vm.sale.
client_id,
callback:
function callback($$v){
_vm.$set(
_vm.sale,
"client_id",
$$v);

},
expression:
"sale.client_id"}}),


_vm._v(" "),
_c(
"b-input-group-append",
[
_c(
"b-button",
{
attrs:{
variant:
"primary"},

on:{
click:
function click(
$event)
{
return _vm.New_Client();
}}},


[
_c("span",[
_c("i",{
staticClass:
"i-Add-User"})])])],





1)],


1);

}}],


null,
false,
1846940208)})],



1),

_vm._v(" "),
_c(
"b-col",
{
attrs:{
lg:"12",
md:"12",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"warehouse",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(ref){
var valid=ref.valid;
var errors=ref.errors;
return _c(
"b-form-group",
{staticClass:"mt-2"},
[
_c("v-select",{
class:{
"is-invalid":
!!errors.length},

attrs:{
state:errors[0]?
false:
valid?
true:
null,
disabled:
_vm.details.
length>0,
reduce:function reduce(
label)
{
return label.value;
},
placeholder:
_vm.$t(
"Choose_Warehouse"),

options:
_vm.warehouses.map(
function(
warehouses)
{
return {
label:
warehouses.name,
value:
warehouses.id};

})},


on:{
input:
_vm.Selected_Warehouse},

model:{
value:
_vm.sale.
warehouse_id,
callback:
function callback($$v){
_vm.$set(
_vm.sale,
"warehouse_id",
$$v);

},
expression:
"sale.warehouse_id"}})],



1);

}}],


null,
false,
1940612659)})],



1),

_vm._v(" "),
_c(
"b-col",
{
staticClass:"mt-2",
attrs:{md:"12"}},

[
_c(
"div",
{staticClass:"pos-detail"},
[
_c(
"div",
{
staticClass:
"table-responsive"},

[
_c(
"table",
{
staticClass:
"table table-striped"},

[
_c("thead",[
_c("tr",[
_c(
"th",
{
attrs:{
scope:"col"}},


[
_vm._v(
_vm._s(
_vm.$t(
"ProductName")))]),





_vm._v(" "),
_c(
"th",
{
attrs:{
scope:"col"}},


[
_vm._v(
_vm._s(
_vm.$t(
"Price")))]),





_vm._v(" "),
_c(
"th",
{
staticClass:
"text-center",
attrs:{
scope:"col"}},


[
_vm._v(
_vm._s(
_vm.$t(
"Qty")))]),





_vm._v(" "),
_c(
"th",
{
staticClass:
"text-center",
attrs:{
scope:"col"}},


[
_vm._v(
_vm._s(
_vm.$t(
"SubTotal")))]),





_vm._v(" "),
_c(
"th",
{
staticClass:
"text-center",
attrs:{
scope:"col"}},


[
_c("i",{
staticClass:
"fa fa-trash"})])])]),





_vm._v(" "),
_c(
"tbody",
[
_vm.details.
length<=0?
_c("tr",[
_c(
"td",
{
attrs:{
colspan:
"5"}},


[
_vm._v(
_vm._s(
_vm.$t(
"NodataAvailable")))])]):






_vm._e(),
_vm._v(" "),
_vm._l(
_vm.details,
function(
detail,
index)
{
return _c(
"tr",
{
key:index},

[
_c("td",[
_c(
"span",
[
_vm._v(
_vm._s(
detail.code))]),




_vm._v(
" "),

_c("br"),
_vm._v(
" "),

_c(
"span",
{
staticClass:
"badge badge-success"},

[
_vm._v(
_vm._s(
detail.name))]),




_vm._v(
" "),

_c("i",{
staticClass:
"i-Edit",
on:{
click:
function click(
$event)
{
return _vm.Modal_Update_Detail(
detail);

}}})]),



_vm._v(" "),
_c("td",[
_vm._v(
_vm._s(
_vm.formatNumber(
detail.Total_price,
2))+


" "+
_vm._s(
_vm.
currentUser.
currency))]),



_vm._v(" "),
_c("td",[
_c(
"div",
{
staticClass:
"quantity"},

[
_c(
"b-input-group",
[
_c(
"b-input-group-prepend",
[
_c(
"span",
{
staticClass:
"btn btn-primary btn-sm",
on:{
click:
function click(
$event)
{
return _vm.decrement(
detail,
detail.detail_id);

}}},


[
_vm._v(
"-")])]),





_vm._v(
" "),

_c(
"input",
{
directives:
[
{
name:"model",
rawName:
"v-model.number",
value:
detail.quantity,
expression:
"detail.quantity",
modifiers:
{
number:true}}],



staticClass:
"form-control",
domProps:
{
value:
detail.quantity},

on:{
keyup:
function keyup(
$event)
{
return _vm.Verified_Qty(
detail,
detail.detail_id);

},
input:
function input(
$event)
{
if(
$event.
target.
composing)
{
return;
}
_vm.$set(
detail,
"quantity",
_vm._n(
$event.
target.
value));


},
blur:function blur(
$event)
{
return _vm.$forceUpdate();
}}}),



_vm._v(
" "),

_c(
"b-input-group-append",
[
_c(
"span",
{
staticClass:
"btn btn-primary btn-sm",
on:{
click:
function click(
$event)
{
return _vm.increment(
detail,
detail.detail_id);

}}},


[
_vm._v(
"+")])])],






1)],


1)]),


_vm._v(" "),
_c(
"td",
{
staticClass:
"text-center"},

[
_vm._v(
_vm._s(
_vm.formatNumber(
detail.subtotal,
2))+


" "+
_vm._s(
_vm.
currentUser.
currency))]),




_vm._v(" "),
_c("td",[
_c(
"a",
{
attrs:
{
title:
"Delete"},

on:{
click:
function click(
$event)
{
return _vm.delete_Product_Detail(
detail.detail_id);

}}},


[
_c(
"i",
{
staticClass:
"i-Close-Window text-25 text-danger"})])])]);







})],


2)])])])])],










1),

_vm._v(" "),
_c(
"div",
{staticClass:"footer_panel"},
[
_c(
"b-row",
[
_c(
"b-col",
{attrs:{md:"12"}},
[
_c(
"div",
{staticClass:"grandtotal"},
[
_c("span",[
_vm._v(
_vm._s(
_vm.$t("Total"))+

" : "+
_vm._s(
_vm.formatNumber(
_vm.GrandTotal,
2))+


" "+
_vm._s(
_vm.currentUser.
currency))])])]),







_vm._v(" "),
_c(
"b-col",
{
attrs:{
lg:"4",
md:"4",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Order Tax",
rules:{
regex:/^\d*\.?\d*$/}},


scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(
validationContext)
{
return [
_c(
"b-form-group",
{
attrs:{
label:
_vm.$t(
"Tax"),

append:"%"}},


[
_c(
"b-input-group",
{
attrs:{
append:
"%"}},


[
_c(
"b-form-input",
{
attrs:{
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"OrderTax-feedback",
label:
"Order Tax"},

on:{
keyup:
function keyup(
$event)
{
return _vm.keyup_OrderTax();
}},

model:{
value:
_vm.
sale.
tax_rate,
callback:
function callback(
$$v)
{
_vm.$set(
_vm.sale,
"tax_rate",
_vm._n(
$$v));


},
expression:
"sale.tax_rate"}})],




1),

_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"OrderTax-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
1527368817)})],



1),

_vm._v(" "),
_c(
"b-col",
{
attrs:{
lg:"4",
md:"4",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Discount",
rules:{
regex:/^\d*\.?\d*$/}},


scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(
validationContext)
{
return [
_c(
"b-form-group",
{
attrs:{
label:
_vm.$t(
"Discount"),

append:"%"}},


[
_c(
"b-input-group",
{
attrs:{
append:
"$"}},


[
_c(
"b-form-input",
{
attrs:{
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"Discount-feedback",
label:
"Discount"},

on:{
keyup:
function keyup(
$event)
{
return _vm.keyup_Discount();
}},

model:{
value:
_vm.
sale.
discount,
callback:
function callback(
$$v)
{
_vm.$set(
_vm.sale,
"discount",
_vm._n(
$$v));


},
expression:
"sale.discount"}})],




1),

_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"Discount-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
3937756813)})],



1),

_vm._v(" "),
_c(
"b-col",
{
attrs:{
lg:"4",
md:"4",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Shipping",
rules:{
regex:/^\d*\.?\d*$/}},


scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(
validationContext)
{
return [
_c(
"b-form-group",
{
attrs:{
label:
_vm.$t(
"Shipping")}},



[
_c(
"b-input-group",
{
attrs:{
append:
"$"}},


[
_c(
"b-form-input",
{
attrs:{
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"Shipping-feedback",
label:
"Shipping"},

on:{
keyup:
function keyup(
$event)
{
return _vm.keyup_Shipping();
}},

model:{
value:
_vm.
sale.
shipping,
callback:
function callback(
$$v)
{
_vm.$set(
_vm.sale,
"shipping",
_vm._n(
$$v));


},
expression:
"sale.shipping"}})],




1),

_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"Shipping-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
2969562416)})],



1),

_vm._v(" "),
_c(
"b-col",
{attrs:{md:"6",sm:"12"}},
[
_c(
"b-button",
{
attrs:{
variant:
"danger ripple btn-rounded btn-block mt-1"},

on:{
click:function click($event){
return _vm.Reset_Pos();
}}},


[
_c("i",{
staticClass:"i-Power-2"}),

_vm._v(
"\n                        "+
_vm._s(
_vm.$t("Reset"))+

"\n                      ")])],




1),

_vm._v(" "),
_c(
"b-col",
{attrs:{md:"6",sm:"12"}},
[
_c(
"b-button",
{
attrs:{
type:"submit",
variant:
"primary ripple mt-1 btn-rounded btn-block"}},


[
_c("i",{
staticClass:"i-Checkout"}),

_vm._v(
"\n                        "+
_vm._s(
_vm.$t("payNow"))+

"\n                      ")])],




1)],


1)],


1)],


1)],


1)],


1),

_vm._v(" "),
_c(
"validation-observer",
{ref:"Update_Detail"},
[
_c(
"b-modal",
{
attrs:{
"hide-footer":"",
size:"md",
id:"form_Update_Detail",
title:_vm.detail.name}},


[
_c(
"b-form",
{
on:{
submit:function submit($event){
$event.preventDefault();
return _vm.submit_Update_Detail.apply(
null,
arguments);

}}},


[
_c(
"b-row",
[
_c(
"b-col",
{
attrs:{
lg:"12",
md:"12",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Product Price",
rules:{
required:true,
regex:/^\d*\.?\d*$/}},


scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(
validationContext)
{
return [
_c(
"b-form-group",
{
attrs:{
label:
_vm.$t(
"ProductPrice"),

id:"Price-input"}},


[
_c("b-form-input",{
attrs:{
label:
"Product Price",
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"Price-feedback"},

model:{
value:
_vm.detail.
Unit_price,
callback:
function callback(
$$v)
{
_vm.$set(
_vm.detail,
"Unit_price",
$$v);

},
expression:
"detail.Unit_price"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"Price-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
2344671014)})],



1),

_vm._v(" "),
_c(
"b-col",
{
attrs:{
lg:"12",
md:"12",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Tax Method",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(ref){
var valid=ref.valid;
var errors=ref.errors;
return _c(
"b-form-group",
{
attrs:{
label:
_vm.$t(
"TaxMethod")}},



[
_c("v-select",{
class:{
"is-invalid":
!!errors.length},

attrs:{
state:errors[0]?
false:
valid?
true:
null,
reduce:function reduce(
label)
{
return label.value;
},
placeholder:
_vm.$t(
"Choose_Method"),

options:[
{
label:
"Exclusive",
value:"1"},

{
label:
"Inclusive",
value:"2"}]},



model:{
value:
_vm.detail.
tax_method,
callback:
function callback($$v){
_vm.$set(
_vm.detail,
"tax_method",
$$v);

},
expression:
"detail.tax_method"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
[
_vm._v(
_vm._s(
errors[0]))])],





1);

}}],


null,
false,
3596778309)})],



1),

_vm._v(" "),
_c(
"b-col",
{
attrs:{
lg:"12",
md:"12",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Tax",
rules:{
required:true,
regex:/^\d*\.?\d*$/}},


scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(
validationContext)
{
return [
_c(
"b-form-group",
{
attrs:{
label:
_vm.$t("Tax")}},


[
_c(
"b-input-group",
{
attrs:{
append:"%"}},


[
_c(
"b-form-input",
{
attrs:{
label:
"Tax",
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"Tax-feedback"},

model:{
value:
_vm.
detail.
tax_percent,
callback:
function callback(
$$v)
{
_vm.$set(
_vm.detail,
"tax_percent",
$$v);

},
expression:
"detail.tax_percent"}})],




1),

_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"Tax-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
3195841040)})],



1),

_vm._v(" "),
_c(
"b-col",
{
attrs:{
lg:"12",
md:"12",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Discount Method",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(ref){
var valid=ref.valid;
var errors=ref.errors;
return _c(
"b-form-group",
{
attrs:{
label:
_vm.$t(
"Discount_Method")}},



[
_c("v-select",{
class:{
"is-invalid":
!!errors.length},

attrs:{
reduce:function reduce(
label)
{
return label.value;
},
placeholder:
_vm.$t(
"Choose_Method"),

state:errors[0]?
false:
valid?
true:
null,
options:[
{
label:
"Percent %",
value:"1"},

{
label:
"Fixed",
value:"2"}]},



model:{
value:
_vm.detail.
discount_Method,
callback:
function callback($$v){
_vm.$set(
_vm.detail,
"discount_Method",
$$v);

},
expression:
"detail.discount_Method"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
[
_vm._v(
_vm._s(
errors[0]))])],





1);

}}],


null,
false,
1993049096)})],



1),

_vm._v(" "),
_c(
"b-col",
{
attrs:{
lg:"12",
md:"12",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Discount Rate",
rules:{
required:true,
regex:/^\d*\.?\d*$/}},


scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(
validationContext)
{
return [
_c(
"b-form-group",
{
attrs:{
label:
_vm.$t(
"Discount")}},



[
_c("b-form-input",{
attrs:{
label:
"Discount",
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"Discount-feedback"},

model:{
value:
_vm.detail.
discount,
callback:
function callback(
$$v)
{
_vm.$set(
_vm.detail,
"discount",
$$v);

},
expression:
"detail.discount"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"Discount-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
1756200962)})],



1),

_vm._v(" "),
_c(
"b-col",
{attrs:{md:"12"}},
[
_c(
"b-form-group",
[
_c(
"b-button",
{
attrs:{
variant:"primary",
type:"submit"}},


[
_vm._v(
_vm._s(_vm.$t("submit")))])],




1)],


1)],


1)],


1)],


1)],


1)],


1)],


1),

_vm._v(" "),
_c(
"b-col",
{attrs:{md:"7"}},
[
_c(
"b-card",
{staticClass:"list-grid"},
[
_c(
"b-row",
[
_c("b-col",{attrs:{md:"6"}},[
_c(
"button",
{
directives:[
{
name:"b-toggle",
rawName:"v-b-toggle.sidebar-category",
modifiers:{"sidebar-category":true}}],


staticClass:
"btn btn-outline-info mt-1 btn-block"},

[
_c("i",{staticClass:"i-Two-Windows"}),
_vm._v(
"\n                "+
_vm._s(_vm.$t("ListofCategory"))+
"\n              ")])]),




_vm._v(" "),
_c("b-col",{attrs:{md:"6"}},[
_c(
"button",
{
directives:[
{
name:"b-toggle",
rawName:"v-b-toggle.sidebar-brand",
modifiers:{"sidebar-brand":true}}],


staticClass:
"btn btn-outline-info mt-1 btn-block"},

[
_c("i",{staticClass:"i-Library"}),
_vm._v(
"\n                "+
_vm._s(_vm.$t("ListofBrand"))+
"\n              ")])]),




_vm._v(" "),
_c("b-col",{attrs:{md:"12 mt-2"}},[
_c("div",{staticClass:"input-group"},[
_c("input",{
directives:[
{
name:"model",
rawName:"v-model",
value:_vm.SearchProduct,
expression:"SearchProduct"}],


staticClass:"form-control",
attrs:{
type:"text",
placeholder:_vm.$t(
"Search_Product_by_Code_Name")},


domProps:{value:_vm.SearchProduct},
on:{
keyup:function keyup($event){
return _vm.getProducts();
},
input:function input($event){
if($event.target.composing){
return;
}
_vm.SearchProduct=$event.target.value;
}}}),


_vm._v(" "),
_c(
"div",
{staticClass:"input-group-append"},
[
_c(
"span",
{staticClass:"input-group-text"},
[_c("i",{staticClass:"i-Bar-Code"})])])])]),





_vm._v(" "),
_c(
"div",
{
staticClass:
"col-md-12 d-flex flex-row flex-wrap bd-highlight list-item mt-2"},

_vm._l(_vm.products,function(product){
return _c(
"div",
{
staticClass:
"card o-hidden bd-highlight m-1",
on:{
click:function click($event){
return _vm.Check_Product_Exist(
product,
product.id);

}}},


[
_c(
"div",
{staticClass:"list-thumb d-flex"},
[
_c("img",{
attrs:{
alt:"",
src:
"/images/products/"+
product.image}})]),




_vm._v(" "),
_c(
"div",
{staticClass:"flex-grow-1 d-bock"},
[
_c(
"div",
{
staticClass:
"card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center"},

[
_c(
"div",
{
staticClass:
"w-40 w-sm-100 item-title"},

[_vm._v(_vm._s(product.name))]),

_vm._v(" "),
_c(
"p",
{
staticClass:
"text-muted text-small w-15 w-sm-100 mb-2"},

[_vm._v(_vm._s(product.code))]),

_vm._v(" "),
_c(
"span",
{
staticClass:
"badge badge-primary w-15 w-sm-100 mb-2"},

[
_vm._v(
_vm._s(
_vm.formatNumber(
product.Net_price,
2))+


" "+
_vm._s(
_vm.currentUser.currency))]),




_vm._v(" "),
_c(
"p",
{
staticClass:
"m-0 text-muted text-small w-15 w-sm-100 d-none d-lg-block item-badges"},

[
_c(
"span",
{
staticClass:
"badge badge-info"},

[
_vm._v(
_vm._s(
_vm.formatNumber(
product.qte_sale,
2))+


" "+
_vm._s(product.unitSale))])])])])]);











}),
0)],


1),

_vm._v(" "),
_c(
"b-row",
[
_c(
"b-col",
{staticClass:"mt-4",attrs:{md:"12"}},
[
_c(
"b-pagination",
{
staticClass:
"my-0 gull-pagination align-items-center",
attrs:{
"total-rows":_vm.product_totalRows,
"per-page":_vm.product_perPage,
align:"center",
"first-text":"",
"last-text":""},

on:{change:_vm.Product_onPageChanged},
model:{
value:_vm.product_currentPage,
callback:function callback($$v){
_vm.product_currentPage=$$v;
},
expression:"product_currentPage"}},


[
_c(
"p",
{
staticClass:"list-arrow m-0",
attrs:{slot:"prev-text"},
slot:"prev-text"},

[
_c("i",{
staticClass:"i-Arrow-Left text-40"})]),



_vm._v(" "),
_c(
"p",
{
staticClass:"list-arrow m-0",
attrs:{slot:"next-text"},
slot:"next-text"},

[
_c("i",{
staticClass:"i-Arrow-Right text-40"})])])],






1)],


1)],


1)],


1),

_vm._v(" "),
_c(
"b-sidebar",
{
attrs:{
id:"sidebar-brand",
title:_vm.$t("ListofBrand"),
"bg-variant":"white",
right:"",
shadow:""}},


[
_c(
"div",
{staticClass:"px-3 py-2"},
[
_c("b-row",[
_c(
"div",
{
staticClass:
"col-md-12 d-flex flex-row flex-wrap bd-highlight list-item mt-2"},

[
_c(
"div",
{
staticClass:"card o-hidden bd-highlight m-1",
class:{"brand-Active":_vm.brand_id==""},
on:{
click:function click($event){
return _vm.GetAllBrands();
}}},


[
_c(
"div",
{staticClass:"list-thumb d-flex"},
[
_c("img",{
attrs:{
alt:"",
src:"/images/no-image.png"}})]),




_vm._v(" "),
_c(
"div",
{staticClass:"flex-grow-1 d-bock"},
[
_c(
"div",
{
staticClass:
"card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center"},

[
_c(
"div",
{staticClass:"item-title"},
[
_vm._v(
_vm._s(_vm.$t("All_Brand")))])])])]),









_vm._v(" "),
_vm._l(_vm.paginated_Brands,function(brand){
return _c(
"div",
{
key:brand.id,
staticClass:
"card o-hidden bd-highlight m-1",
class:{
"brand-Active":brand.id===_vm.brand_id},

on:{
click:function click($event){
return _vm.Products_by_Brands(brand.id);
}}},


[
_c("img",{
attrs:{
alt:"",
src:"/images/brands/"+brand.image}}),


_vm._v(" "),
_c(
"div",
{staticClass:"flex-grow-1 d-bock"},
[
_c(
"div",
{
staticClass:
"card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center"},

[
_c(
"div",
{staticClass:"item-title"},
[_vm._v(_vm._s(brand.name))])])])]);







})],

2)]),


_vm._v(" "),
_c(
"b-row",
[
_c(
"b-col",
{staticClass:"mt-4",attrs:{md:"12"}},
[
_c(
"b-pagination",
{
staticClass:
"my-0 gull-pagination align-items-center",
attrs:{
"total-rows":_vm.brand_totalRows,
"per-page":_vm.brand_perPage,
align:"center",
"first-text":"",
"last-text":""},

on:{change:_vm.BrandonPageChanged},
model:{
value:_vm.brand_currentPage,
callback:function callback($$v){
_vm.brand_currentPage=$$v;
},
expression:"brand_currentPage"}},


[
_c(
"p",
{
staticClass:"list-arrow m-0",
attrs:{slot:"prev-text"},
slot:"prev-text"},

[
_c("i",{
staticClass:"i-Arrow-Left text-40"})]),



_vm._v(" "),
_c(
"p",
{
staticClass:"list-arrow m-0",
attrs:{slot:"next-text"},
slot:"next-text"},

[
_c("i",{
staticClass:"i-Arrow-Right text-40"})])])],






1)],


1)],


1)]),



_vm._v(" "),
_c(
"b-sidebar",
{
attrs:{
id:"sidebar-category",
title:_vm.$t("ListofCategory"),
"bg-variant":"white",
right:"",
shadow:""}},


[
_c(
"div",
{staticClass:"px-3 py-2"},
[
_c("b-row",[
_c(
"div",
{
staticClass:
"col-md-12 d-flex flex-row flex-wrap bd-highlight list-item mt-2"},

[
_c(
"div",
{
staticClass:"card o-hidden bd-highlight m-1",
class:{
"brand-Active":_vm.category_id==""},

on:{
click:function click($event){
return _vm.getAllCategory();
}}},


[
_c(
"div",
{staticClass:"list-thumb d-flex"},
[
_c("img",{
attrs:{
alt:"",
src:"/images/no-image.png"}})]),




_vm._v(" "),
_c(
"div",
{staticClass:"flex-grow-1 d-bock"},
[
_c(
"div",
{
staticClass:
"card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center"},

[
_c(
"div",
{staticClass:"item-title"},
[
_vm._v(
_vm._s(_vm.$t("All_Category")))])])])]),









_vm._v(" "),
_vm._l(
_vm.paginated_Category,
function(category){
return _c(
"div",
{
key:category.id,
staticClass:
"card o-hidden bd-highlight m-1",
class:{
"brand-Active":
category.id===_vm.category_id},

on:{
click:function click($event){
return _vm.Products_by_Category(
category.id);

}}},


[
_c("img",{
attrs:{
alt:"",
src:"/images/no-image.png"}}),


_vm._v(" "),
_c(
"div",
{staticClass:"flex-grow-1 d-bock"},
[
_c(
"div",
{
staticClass:
"card-body align-self-center d-flex flex-column justify-content-between align-items-lg-center"},

[
_c(
"div",
{staticClass:"item-title"},
[_vm._v(_vm._s(category.name))])])])]);







})],


2)]),


_vm._v(" "),
_c(
"b-row",
[
_c(
"b-col",
{staticClass:"mt-4",attrs:{md:"12"}},
[
_c(
"b-pagination",
{
staticClass:
"my-0 gull-pagination align-items-center",
attrs:{
"total-rows":_vm.category_totalRows,
"per-page":_vm.category_perPage,
align:"center",
"first-text":"",
"last-text":""},

on:{change:_vm.Category_onPageChanged},
model:{
value:_vm.category_currentPage,
callback:function callback($$v){
_vm.category_currentPage=$$v;
},
expression:"category_currentPage"}},


[
_c(
"p",
{
staticClass:"list-arrow m-0",
attrs:{slot:"prev-text"},
slot:"prev-text"},

[
_c("i",{
staticClass:"i-Arrow-Left text-40"})]),



_vm._v(" "),
_c(
"p",
{
staticClass:"list-arrow m-0",
attrs:{slot:"next-text"},
slot:"next-text"},

[
_c("i",{
staticClass:"i-Arrow-Right text-40"})])])],






1)],


1)],


1)]),



_vm._v(" "),
_c(
"b-modal",
{
attrs:{
"hide-footer":"",
size:"md",
scrollable:"",
id:"Show_invoice",
title:_vm.$t("Invoice_POS")}},


[
_c(
"vue-easy-print",
{ref:"Show_invoice",attrs:{"table-show":""}},
[
_c(
"div",
{attrs:{id:"invoice-POS"}},
[
_c("h6",{staticClass:"text-right"},[
_vm._v(
_vm._s(_vm.$t("date"))+
" : "+
_vm._s(_vm.invoice_pos.sale.date))]),


_vm._v(" "),
_c("center",{attrs:{id:"top"}},[
_c("div",{staticClass:"logo"},[
_c("img",{
attrs:{
src:
"/images/"+_vm.invoice_pos.setting.logo}})]),



_vm._v(" "),
_c("div",{staticClass:"info"},[
_c("h3",[
_vm._v(
_vm._s(_vm.invoice_pos.setting.CompanyName))])])]),




_vm._v(" "),
_c("div",{staticClass:"info"},[
_c("h6",[
_vm._v(
_vm._s(_vm.$t("Adress"))+
" : "+
_vm._s(
_vm.invoice_pos.setting.CompanyAdress))]),



_vm._v(" "),
_c("h6",[
_vm._v(
_vm._s(_vm.$t("Email"))+
" : "+
_vm._s(_vm.invoice_pos.setting.email))]),


_vm._v(" "),
_c("h6",[
_vm._v(
_vm._s(_vm.$t("Phone"))+
" : "+
_vm._s(_vm.invoice_pos.setting.CompanyPhone))]),


_vm._v(" "),
_c("h6",[
_vm._v(
_vm._s(_vm.$t("Customer"))+
" : "+
_vm._s(_vm.invoice_pos.sale.client_name))])]),



_vm._v(" "),
_c("table",{staticClass:"mt-3 table-md"},[
_c("thead",[
_c("tr",[
_c("th",{attrs:{scope:"col"}},[
_vm._v(_vm._s(_vm.$t("ProductName")))]),

_vm._v(" "),
_c("th",{attrs:{scope:"col"}},[
_vm._v(_vm._s(_vm.$t("Qty")))]),

_vm._v(" "),
_c("th",{attrs:{scope:"col"}},[
_vm._v(_vm._s(_vm.$t("SubTotal")))])])]),



_vm._v(" "),
_c(
"tbody",
[
_vm._l(
_vm.invoice_pos.details,
function(detail_invoice){
return _c("tr",[
_c("td",[
_vm._v(_vm._s(detail_invoice.name))]),

_vm._v(" "),
_c("td",[
_vm._v(
_vm._s(
_vm.formatNumber(
detail_invoice.quantity,
2))+


" "+
_vm._s(detail_invoice.unit_sale))]),


_vm._v(" "),
_c("td",[
_vm._v(
_vm._s(
_vm.formatNumber(
detail_invoice.total,
2))+


" "+
_vm._s(_vm.invoice_pos.symbol))])]);



}),

_vm._v(" "),
_c("tr",[
_c("th"),
_vm._v(" "),
_c("th",[_vm._v(_vm._s(_vm.$t("Tax")))]),
_vm._v(" "),
_c("td",[
_vm._v(
_vm._s(
_vm.formatNumber(
_vm.invoice_pos.sale.taxe,
2))+


" "+
_vm._s(_vm.invoice_pos.symbol)+
" ("+
_vm._s(
_vm.invoice_pos.sale.tax_rate)+

" %)")])]),



_vm._v(" "),
_c("tr",[
_c("th"),
_vm._v(" "),
_c("th",[
_vm._v(_vm._s(_vm.$t("Discount")))]),

_vm._v(" "),
_c("td",[
_vm._v(
_vm._s(
_vm.formatNumber(
_vm.invoice_pos.sale.discount,
2))+


" "+
_vm._s(_vm.invoice_pos.symbol))])]),



_vm._v(" "),
_c("tr",[
_c("th"),
_vm._v(" "),
_c("th",[
_vm._v(_vm._s(_vm.$t("Shipping")))]),

_vm._v(" "),
_c("td",[
_vm._v(
_vm._s(
_vm.formatNumber(
_vm.invoice_pos.sale.shipping,
2))+


" "+
_vm._s(_vm.invoice_pos.symbol))])])],




2)]),


_vm._v(" "),
_c(
"table",
{staticClass:"mt-2",attrs:{id:"total"}},
[
_c("tbody",[
_c("tr",[
_c("th",{staticClass:"p-1 w-75"},[
_vm._v(_vm._s(_vm.$t("Total")))]),

_vm._v(" "),
_c("th",{staticClass:"p-1 w-25"},[
_vm._v(
_vm._s(
_vm.formatNumber(
_vm.invoice_pos.sale.GrandTotal,
2))+


" "+
_vm._s(_vm.invoice_pos.symbol))])])])]),






_vm._v(" "),
_c("div",{attrs:{id:"legalcopy"}},[
_c("p",{staticClass:"legal"},[
_c("strong",[
_vm._v(
_vm._s(
_vm.$t("Thank_you_for_your_business")))])]),




_vm._v(" "),
_c(
"div",
{attrs:{id:"bar"}},
[
_c("barcode",{
staticClass:"barcode",
attrs:{
format:_vm.barcodeFormat,
value:_vm.invoice_pos.sale.Ref,
textmargin:"0",
fontoptions:"bold",
height:"25"}})],



1)])],



1)]),



_vm._v(" "),
_c(
"button",
{
staticClass:"btn btn-outline-primary",
on:{
click:function click($event){
return _vm.print_pos();
}}},


[
_c("i",{staticClass:"i-Billing"}),
_vm._v(
"\n          "+
_vm._s(_vm.$t("print"))+
"\n        ")])],




1),

_vm._v(" "),
_c(
"validation-observer",
{ref:"Add_payment"},
[
_c(
"b-modal",
{
attrs:{
"hide-footer":"",
size:"lg",
id:"Add_Payment",
title:_vm.$t("AddPayment")}},


[
_c(
"b-form",
{
on:{
submit:function submit($event){
$event.preventDefault();
return _vm.Submit_Payment.apply(null,arguments);
}}},


[
_c(
"b-row",
[
_c(
"b-col",
{attrs:{md:"6"}},
[
_c(
"b-row",
[
_c(
"b-col",
{
attrs:{
lg:"12",
md:"12",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Amount",
rules:{
required:true,
regex:/^\d*\.?\d*$/}},


scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(
validationContext)
{
return [
_c(
"b-form-group",
{
attrs:{
label:
_vm.$t(
"Amount")}},



[
_c("b-form-input",{
attrs:{
label:"Amount",
placeholder:
_vm.$t(
"Amount"),

state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"Amount-feedback"},

model:{
value:
_vm.payment.
amount,
callback:
function callback(
$$v)
{
_vm.$set(
_vm.payment,
"amount",
$$v);

},
expression:
"payment.amount"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"Amount-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
1055504432)})],



1),

_vm._v(" "),
_c(
"b-col",
{
attrs:{
lg:"12",
md:"12",
sm:"12"}},


[
_c("validation-provider",{
attrs:{
name:"Payment choice",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(ref){
var valid=ref.valid;
var errors=ref.errors;
return _c(
"b-form-group",
{
attrs:{
label:
_vm.$t(
"Paymentchoice")}},



[
_c("v-select",{
class:{
"is-invalid":
!!errors.length},

attrs:{
state:errors[0]?
false:
valid?
true:
null,
reduce:function reduce(
label)
{
return label.value;
},
placeholder:
_vm.$t(
"PleaseSelect"),

options:[
{
label:"Cash",
value:"Cash"},

{
label:
"credit card",
value:
"credit card"},

{
label:
"cheque",
value:
"cheque"},

{
label:
"Western Union",
value:
"Western Union"},

{
label:
"bank transfer",
value:
"bank transfer"}]},



on:{
input:
_vm.Selected_PaymentMethod},

model:{
value:
_vm.payment.
Reglement,
callback:
function callback($$v){
_vm.$set(
_vm.payment,
"Reglement",
$$v);

},
expression:
"payment.Reglement"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
[
_vm._v(
_vm._s(
errors[0]))])],





1);

}}],


null,
false,
4105155434)})],



1),

_vm._v(" "),
_vm.payment.Reglement=="credit card"?
_c(
"b-col",
{attrs:{md:"12"}},
[
_c(
"form",
{
attrs:{
id:"payment-form"}},


[
_c(
"label",
{
staticClass:
"leading-7 text-sm text-gray-600",
attrs:{
for:"card-element"}},


[
_vm._v(
_vm._s(
_vm.$t(
"Credit_Card_Info")))]),





_vm._v(" "),
_c("div",{
attrs:{
id:"card-element"}}),


_vm._v(" "),
_c("div",{
staticClass:"is-invalid",
attrs:{
id:"card-errors",
role:"alert"}})])]):






_vm._e(),
_vm._v(" "),
_c(
"b-col",
{
staticClass:"mt-2",
attrs:{
lg:"12",
md:"12",
sm:"12"}},


[
_c(
"b-form-group",
{
attrs:{
label:_vm.$t("Note")}},


[
_c("b-form-textarea",{
attrs:{
id:"textarea",
rows:"3",
"max-rows":"6"},

model:{
value:_vm.payment.notes,
callback:function callback($$v){
_vm.$set(
_vm.payment,
"notes",
$$v);

},
expression:"payment.notes"}})],



1)],


1)],


1)],


1),

_vm._v(" "),
_c(
"b-col",
{attrs:{md:"6"}},
[
_c(
"b-card",
[
_c(
"b-list-group",
[
_c(
"b-list-group-item",
{
staticClass:
"d-flex justify-content-between align-items-center"},

[
_vm._v(
"\n                      "+
_vm._s(
_vm.$t("TotalProducts"))+

"\n                      "),

_c(
"b-badge",
{
attrs:{
variant:"primary",
pill:""}},


[
_vm._v(
_vm._s(_vm.details.length))])],




1),

_vm._v(" "),
_c(
"b-list-group-item",
{
staticClass:
"d-flex justify-content-between align-items-center"},

[
_vm._v(
"\n                      "+
_vm._s(_vm.$t("OrderTax"))+
"\n                      "),

_c(
"span",
{
staticClass:
"font-weight-bold"},

[
_vm._v(
_vm._s(
_vm.formatNumber(
_vm.sale.TaxNet,
2))+


" "+
_vm._s(
_vm.currentUser.
currency)+

" ("+
_vm._s(
_vm.sale.tax_rate)+

" %)")])]),





_vm._v(" "),
_c(
"b-list-group-item",
{
staticClass:
"d-flex justify-content-between align-items-center"},

[
_vm._v(
"\n                      "+
_vm._s(_vm.$t("Discount"))+
"\n                      "),

_c(
"span",
{
staticClass:
"font-weight-bold"},

[
_vm._v(
_vm._s(
_vm.formatNumber(
_vm.sale.discount,
2))+


" "+
_vm._s(
_vm.currentUser.
currency))])]),






_vm._v(" "),
_c(
"b-list-group-item",
{
staticClass:
"d-flex justify-content-between align-items-center"},

[
_vm._v(
"\n                      "+
_vm._s(_vm.$t("Shipping"))+
"\n                      "),

_c(
"span",
{
staticClass:
"font-weight-bold"},

[
_vm._v(
_vm._s(
_vm.formatNumber(
_vm.sale.shipping,
2))+


" "+
_vm._s(
_vm.currentUser.
currency))])]),






_vm._v(" "),
_c(
"b-list-group-item",
{
staticClass:
"d-flex justify-content-between align-items-center"},

[
_vm._v(
"\n                      "+
_vm._s(_vm.$t("Total"))+
"\n                      "),

_c(
"span",
{
staticClass:
"font-weight-bold"},

[
_vm._v(
_vm._s(
_vm.formatNumber(
_vm.GrandTotal,
2))+


" "+
_vm._s(
_vm.currentUser.
currency))])])],







1)],


1)],


1),

_vm._v(" "),
_c(
"b-col",
{staticClass:"mt-3",attrs:{md:"12"}},
[
_c(
"b-button",
{
attrs:{
variant:"primary",
type:"submit",
disabled:_vm.paymentProcessing}},


[_vm._v(_vm._s(_vm.$t("submit")))]),

_vm._v(" "),
_vm.paymentProcessing?
_vm._m(0):
_vm._e()],

1)],


1)],


1)],


1)],


1),

_vm._v(" "),
_c(
"validation-observer",
{ref:"Create_Customer"},
[
_c(
"b-modal",
{
attrs:{
"hide-footer":"",
size:"lg",
id:"New_Customer",
title:_vm.$t("Add")}},


[
_c(
"b-form",
{
on:{
submit:function submit($event){
$event.preventDefault();
return _vm.Submit_Customer.apply(
null,
arguments);

}}},


[
_c(
"b-row",
[
_c(
"b-col",
{attrs:{md:"6",sm:"12"}},
[
_c("validation-provider",{
attrs:{
name:"Name Customer",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(validationContext){
return [
_c(
"b-form-group",
{
attrs:{
label:
_vm.$t("CustomerName")}},


[
_c("b-form-input",{
attrs:{
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"name-feedback",
label:"name"},

model:{
value:_vm.client.name,
callback:function callback(
$$v)
{
_vm.$set(
_vm.client,
"name",
$$v);

},
expression:
"client.name"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"name-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
2169107604)})],



1),

_vm._v(" "),
_c(
"b-col",
{attrs:{md:"6",sm:"12"}},
[
_c("validation-provider",{
attrs:{
name:"Email customer",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(validationContext){
return [
_c(
"b-form-group",
{
attrs:{
label:_vm.$t("Email")}},


[
_c("b-form-input",{
attrs:{
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"Email-feedback",
label:"Email"},

model:{
value:_vm.client.email,
callback:function callback(
$$v)
{
_vm.$set(
_vm.client,
"email",
$$v);

},
expression:
"client.email"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"Email-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
4213647611)})],



1),

_vm._v(" "),
_c(
"b-col",
{attrs:{md:"6",sm:"12"}},
[
_c("validation-provider",{
attrs:{
name:"Phone Customer",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(validationContext){
return [
_c(
"b-form-group",
{
attrs:{
label:_vm.$t("Phone")}},


[
_c("b-form-input",{
attrs:{
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"Phone-feedback",
label:"Phone"},

model:{
value:_vm.client.phone,
callback:function callback(
$$v)
{
_vm.$set(
_vm.client,
"phone",
$$v);

},
expression:
"client.phone"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"Phone-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
314120427)})],



1),

_vm._v(" "),
_c(
"b-col",
{attrs:{md:"6",sm:"12"}},
[
_c("validation-provider",{
attrs:{
name:"Country customer",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(validationContext){
return [
_c(
"b-form-group",
{
attrs:{
label:_vm.$t("Country")}},


[
_c("b-form-input",{
attrs:{
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"Country-feedback",
label:"Country"},

model:{
value:
_vm.client.country,
callback:function callback(
$$v)
{
_vm.$set(
_vm.client,
"country",
$$v);

},
expression:
"client.country"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"Country-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
2049988063)})],



1),

_vm._v(" "),
_c(
"b-col",
{attrs:{md:"6",sm:"12"}},
[
_c("validation-provider",{
attrs:{
name:"City Customer",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(validationContext){
return [
_c(
"b-form-group",
{
attrs:{
label:_vm.$t("City")}},


[
_c("b-form-input",{
attrs:{
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"City-feedback",
label:"City"},

model:{
value:_vm.client.city,
callback:function callback(
$$v)
{
_vm.$set(
_vm.client,
"city",
$$v);

},
expression:
"client.city"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"City-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
1625404240)})],



1),

_vm._v(" "),
_c(
"b-col",
{attrs:{md:"6",sm:"12"}},
[
_c("validation-provider",{
attrs:{
name:"Adress customer",
rules:{required:true}},

scopedSlots:_vm._u(
[
{
key:"default",
fn:function fn(validationContext){
return [
_c(
"b-form-group",
{
attrs:{
label:_vm.$t("Adress")}},


[
_c("b-form-input",{
attrs:{
state:
_vm.getValidationState(
validationContext),

"aria-describedby":
"Adress-feedback",
label:"Adress"},

model:{
value:
_vm.client.adresse,
callback:function callback(
$$v)
{
_vm.$set(
_vm.client,
"adresse",
$$v);

},
expression:
"client.adresse"}}),


_vm._v(" "),
_c(
"b-form-invalid-feedback",
{
attrs:{
id:"Adress-feedback"}},


[
_vm._v(
_vm._s(
validationContext.
errors[0]))])],





1)];


}}],


null,
false,
3943535328)})],



1),

_vm._v(" "),
_c(
"b-col",
{staticClass:"mt-3",attrs:{md:"12"}},
[
_c(
"b-button",
{
attrs:{
variant:"primary",
type:"submit"}},


[_vm._v(_vm._s(_vm.$t("submit")))])],


1)],


1)],


1)],


1)],


1)],


1):

_vm._e()],

1)]);


};
var staticRenderFns=[
function(){
var _vm=this;
var _h=_vm.$createElement;
var _c=_vm._self._c||_h;
return _c("div",{staticClass:"typo__p"},[
_c("div",{staticClass:"spinner sm spinner-primary mt-3"})]);

}];

render._withStripped=true;



/***/},

/***/"./resources/src/utils/index.js":
/*!**************************************!*\
  !*** ./resources/src/utils/index.js ***!
  \**************************************/
/*! exports provided: default */
/***/function resourcesSrcUtilsIndexJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
var toggleFullScreen=function toggleFullScreen(){
var doc=window.document;
var docEl=doc.documentElement;
var requestFullScreen=docEl.requestFullscreen||docEl.mozRequestFullScreen||docEl.webkitRequestFullScreen||docEl.msRequestFullscreen;
var cancelFullScreen=doc.exitFullscreen||doc.mozCancelFullScreen||doc.webkitExitFullscreen||doc.msExitFullscreen;

if(!doc.fullscreenElement&&!doc.mozFullScreenElement&&!doc.webkitFullscreenElement&&!doc.msFullscreenElement){
requestFullScreen.call(docEl);
}else {
cancelFullScreen.call(doc);
}
};

/* harmony default export */__webpack_exports__["default"]={
toggleFullScreen:toggleFullScreen};


/***/},

/***/"./resources/src/views/app/pages/pos.vue":
/*!***********************************************!*\
  !*** ./resources/src/views/app/pages/pos.vue ***!
  \***********************************************/
/*! exports provided: default */
/***/function resourcesSrcViewsAppPagesPosVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _pos_vue_vue_type_template_id_4cc49487___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./pos.vue?vue&type=template&id=4cc49487& */"./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487&");
/* harmony import */var _pos_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./pos.vue?vue&type=script&lang=js& */"./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_pos_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
_pos_vue_vue_type_template_id_4cc49487___WEBPACK_IMPORTED_MODULE_0__["render"],
_pos_vue_vue_type_template_id_4cc49487___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
null,
null);
component.options.__file="resources/src/views/app/pages/pos.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/},

/***/"./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js&":
/*!************************************************************************!*\
  !*** ./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js& ***!
  \************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcViewsAppPagesPosVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_pos_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib??vue-loader-options!./pos.vue?vue&type=script&lang=js& */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/pos.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_pos_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"];

/***/},

/***/"./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487&":
/*!******************************************************************************!*\
  !*** ./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487& ***!
  \******************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcViewsAppPagesPosVueVueTypeTemplateId4cc49487(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_pos_vue_vue_type_template_id_4cc49487___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../node_modules/vue-loader/lib??vue-loader-options!./pos.vue?vue&type=template&id=4cc49487& */"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/views/app/pages/pos.vue?vue&type=template&id=4cc49487&");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_pos_vue_vue_type_template_id_4cc49487___WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_pos_vue_vue_type_template_id_4cc49487___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



/***/}}]);

}());
