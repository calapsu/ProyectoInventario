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

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var functionBindNative = !fails(function () {
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

var call = Function.prototype.call;

var functionCall = functionBindNative ? call.bind(call) : function () {
  return call.apply(call, arguments);
};

var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;

var objectPropertyIsEnumerable = {
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

var FunctionPrototype = Function.prototype;
var bind = FunctionPrototype.bind;
var call$1 = FunctionPrototype.call;
var uncurryThis = functionBindNative && bind.bind(call$1, call$1);

var functionUncurryThis = functionBindNative ? function (fn) {
  return fn && uncurryThis(fn);
} : function (fn) {
  return fn && function () {
    return call$1.apply(fn, arguments);
  };
};

var toString = functionUncurryThis({}.toString);
var stringSlice = functionUncurryThis(''.slice);

var classofRaw = function (it) {
  return stringSlice(toString(it), 8, -1);
};

var Object$1 = global_1.Object;
var split = functionUncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !Object$1('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classofRaw(it) == 'String' ? split(it, '') : Object$1(it);
} : Object$1;

var TypeError$1 = global_1.TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (it == undefined) throw TypeError$1("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings



var toIndexedObject = function (it) {
  return indexedObject(requireObjectCoercible(it));
};

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
var isCallable = function (argument) {
  return typeof argument == 'function';
};

var isObject = function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global_1[namespace]) : global_1[namespace] && global_1[namespace][method];
};

var objectIsPrototypeOf = functionUncurryThis({}.isPrototypeOf);

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

var Object$2 = global_1.Object;

var isSymbol = useSymbolAsUid ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && objectIsPrototypeOf($Symbol.prototype, Object$2(it));
};

var String$1 = global_1.String;

var tryToString = function (argument) {
  try {
    return String$1(argument);
  } catch (error) {
    return 'Object';
  }
};

var TypeError$2 = global_1.TypeError;

// `Assert: IsCallable(argument) is true`
var aCallable = function (argument) {
  if (isCallable(argument)) return argument;
  throw TypeError$2(tryToString(argument) + ' is not a function');
};

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
var getMethod = function (V, P) {
  var func = V[P];
  return func == null ? undefined : aCallable(func);
};

var TypeError$3 = global_1.TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
var ordinaryToPrimitive = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = functionCall(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = functionCall(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = functionCall(fn, input))) return val;
  throw TypeError$3("Can't convert object to primitive value");
};

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

var Object$3 = global_1.Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject = function (argument) {
  return Object$3(requireObjectCoercible(argument));
};

var hasOwnProperty = functionUncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};

var id = 0;
var postfix = Math.random();
var toString$1 = functionUncurryThis(1.0.toString);

var uid = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$1(++id + postfix, 36);
};

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

var TypeError$4 = global_1.TypeError;
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
    throw TypeError$4("Can't convert object to primitive value");
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

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
var f$1 = descriptors ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (ie8DomDefine) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwnProperty_1(O, P)) return createPropertyDescriptor(!functionCall(objectPropertyIsEnumerable.f, O, P), O[P]);
};

var objectGetOwnPropertyDescriptor = {
	f: f$1
};

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
var v8PrototypeDefineBug = descriptors && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype != 42;
});

var String$2 = global_1.String;
var TypeError$5 = global_1.TypeError;

// `Assert: Type(argument) is Object`
var anObject = function (argument) {
  if (isObject(argument)) return argument;
  throw TypeError$5(String$2(argument) + ' is not an object');
};

var TypeError$6 = global_1.TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
var f$2 = descriptors ? v8PrototypeDefineBug ? function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor$1(O, P);
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
	f: f$2
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

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
_export({ target: 'Object', stat: true }, {
  setPrototypeOf: objectSetPrototypeOf
});

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
var objectKeys = Object.keys || function keys(O) {
  return objectKeysInternal(O, enumBugKeys);
};

// eslint-disable-next-line es/no-object-assign -- safe
var $assign = Object.assign;
// eslint-disable-next-line es/no-object-defineproperty -- required for testing
var defineProperty$1 = Object.defineProperty;
var concat$1 = functionUncurryThis([].concat);

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
var objectAssign = !$assign || fails(function () {
  // should have correct order of operations (Edge bug)
  if (descriptors && $assign({ b: 1 }, $assign(defineProperty$1({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty$1(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line es/no-symbol -- safe
  var symbol = Symbol();
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return $assign({}, A)[symbol] != 7 || objectKeys($assign({}, B)).join('') != alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
  while (argumentsLength > index) {
    var S = indexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? concat$1(objectKeys(S), getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!descriptors || functionCall(propertyIsEnumerable, S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
// eslint-disable-next-line es/no-object-assign -- required for testing
_export({ target: 'Object', stat: true, forced: Object.assign !== objectAssign }, {
  assign: objectAssign
});

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

var toStringTagSupport = String(test) === '[object z]';

var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
var Object$4 = global_1.Object;

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
    : typeof (tag = tryGet(O = Object$4(it), TO_STRING_TAG$1)) == 'string' ? tag
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

var nativePromiseConstructor = global_1.Promise;

var redefineAll = function (target, src, options) {
  for (var key in src) redefine(target, key, src[key], options);
  return target;
};

var defineProperty$2 = objectDefineProperty.f;



var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

var setToStringTag = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwnProperty_1(target, TO_STRING_TAG$2)) {
    defineProperty$2(target, TO_STRING_TAG$2, { configurable: true, value: TAG });
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

var defineProperty$3 = objectDefineProperty.f;

var defineWellKnownSymbol = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!hasOwnProperty_1(Symbol, NAME)) defineProperty$3(Symbol, NAME, {
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

var defineProperty$4 = objectDefineProperty.f;


var NativeSymbol = global_1.Symbol;
var SymbolPrototype$1 = NativeSymbol && NativeSymbol.prototype;

if (descriptors && isCallable(NativeSymbol) && (!('description' in SymbolPrototype$1) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString_1(arguments[0]);
    var result = objectIsPrototypeOf(SymbolPrototype$1, this)
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };

  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  SymbolWrapper.prototype = SymbolPrototype$1;
  SymbolPrototype$1.constructor = SymbolWrapper;

  var NATIVE_SYMBOL = String(NativeSymbol('test')) == 'Symbol(test)';
  var symbolToString = functionUncurryThis(SymbolPrototype$1.toString);
  var symbolValueOf = functionUncurryThis(SymbolPrototype$1.valueOf);
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  var replace = functionUncurryThis(''.replace);
  var stringSlice$1 = functionUncurryThis(''.slice);

  defineProperty$4(SymbolPrototype$1, 'description', {
    configurable: true,
    get: function description() {
      var symbol = symbolValueOf(this);
      var string = symbolToString(symbol);
      if (hasOwnProperty_1(EmptyStringDescriptionStore, symbol)) return '';
      var desc = NATIVE_SYMBOL ? stringSlice$1(string, 7, -1) : replace(string, regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  _export({ global: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
defineWellKnownSymbol('iterator');

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

var correctPrototypeGetter = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var IE_PROTO$1 = sharedKey('IE_PROTO');
var Object$5 = global_1.Object;
var ObjectPrototype$1 = Object$5.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
var objectGetPrototypeOf = correctPrototypeGetter ? Object$5.getPrototypeOf : function (O) {
  var object = toObject(O);
  if (hasOwnProperty_1(object, IE_PROTO$1)) return object[IE_PROTO$1];
  var constructor = object.constructor;
  if (isCallable(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof Object$5 ? ObjectPrototype$1 : null;
};

var ITERATOR$3 = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = IteratorPrototype == undefined || fails(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype[ITERATOR$3].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable(IteratorPrototype[ITERATOR$3])) {
  redefine(IteratorPrototype, ITERATOR$3, function () {
    return this;
  });
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





var returnThis = function () { return this; };

var createIteratorConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
  iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};

var PROPER_FUNCTION_NAME = functionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;
var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$4 = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis$1 = function () { return this; };

var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$4]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
        if (objectSetPrototypeOf) {
          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
        } else if (!isCallable(CurrentIteratorPrototype[ITERATOR$4])) {
          redefine(CurrentIteratorPrototype, ITERATOR$4, returnThis$1);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME && DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if ( CONFIGURABLE_FUNCTION_NAME) {
      createNonEnumerableProperty(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return functionCall(nativeIterator, this); };
    }
  }

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if ( IterablePrototype[ITERATOR$4] !== defaultIterator) {
    redefine(IterablePrototype, ITERATOR$4, defaultIterator, { name: DEFAULT });
  }
  iterators[NAME] = defaultIterator;

  return methods;
};

var defineProperty$5 = objectDefineProperty.f;




var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$2 = internalState.set;
var getInternalState$2 = internalState.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.es/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.es/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.es/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.es/ecma262/#sec-createarrayiterator
var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState$2(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$2(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
var values = iterators.Arguments = iterators.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

// V8 ~ Chrome 45- bug
if ( descriptors && values.name !== 'values') try {
  defineProperty$5(values, 'name', { value: 'values' });
} catch (error) { /* empty */ }

var charAt = functionUncurryThis(''.charAt);
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
          ? charAt(S, position)
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

var charAt$1 = stringMultibyte.charAt;




var STRING_ITERATOR = 'String Iterator';
var setInternalState$3 = internalState.set;
var getInternalState$3 = internalState.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState$3(this, {
    type: STRING_ITERATOR,
    string: toString_1(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$3(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt$1(string, index);
  state.index += point.length;
  return { value: point, done: false };
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

var ITERATOR$5 = wellKnownSymbol('iterator');
var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
var ArrayValues = es_array_iterator.values;

var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR$5] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR$5, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR$5] = ArrayValues;
    }
    if (!CollectionPrototype[TO_STRING_TAG$3]) {
      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$3, COLLECTION_NAME);
    }
    if (domIterables[COLLECTION_NAME]) for (var METHOD_NAME in es_array_iterator) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
      }
    }
  }
};

for (var COLLECTION_NAME in domIterables) {
  handlePrototype(global_1[COLLECTION_NAME] && global_1[COLLECTION_NAME].prototype, COLLECTION_NAME);
}

handlePrototype(domTokenListPrototype, 'DOMTokenList');

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

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');

var SPECIES$5 = wellKnownSymbol('species');
var Array$3 = global_1.Array;
var max$2 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
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

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';
var TypeError$g = global_1.TypeError;

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

var FORCED$1 = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
_export({ target: 'Array', proto: true, forced: FORCED$1 }, {
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
        if (n + len > MAX_SAFE_INTEGER) throw TypeError$g(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER) throw TypeError$g(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var $find = arrayIteration.find;


var FIND = 'find';
var SKIPS_HOLES = true;

// Shouldn't skip holes
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

// `Array.prototype.find` method
// https://tc39.es/ecma262/#sec-array.prototype.find
_export({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables(FIND);

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose(iterator, 'throw', error);
  }
};

var Array$4 = global_1.Array;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var IS_CONSTRUCTOR = isConstructor(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod && !(this == Array$4 && isArrayIteratorMethod(iteratorMethod))) {
    iterator = getIterator(O, iteratorMethod);
    next = iterator.next;
    result = IS_CONSTRUCTOR ? new this() : [];
    for (;!(step = functionCall(next, iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty(result, index, value);
    }
  } else {
    length = lengthOfArrayLike(O);
    result = IS_CONSTRUCTOR ? new this(length) : Array$4(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty(result, index, value);
    }
  }
  result.length = index;
  return result;
};

var INCORRECT_ITERATION$1 = !checkCorrectnessOfIteration(function (iterable) {
  // eslint-disable-next-line es/no-array-from -- required for testing
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
_export({ target: 'Array', stat: true, forced: INCORRECT_ITERATION$1 }, {
  from: arrayFrom
});

var RangeError = global_1.RangeError;
var fromCharCode = String.fromCharCode;
// eslint-disable-next-line es/no-string-fromcodepoint -- required for testing
var $fromCodePoint = String.fromCodePoint;
var join = functionUncurryThis([].join);

// length should be 1, old FF problem
var INCORRECT_LENGTH = !!$fromCodePoint && $fromCodePoint.length != 1;

// `String.fromCodePoint` method
// https://tc39.es/ecma262/#sec-string.fromcodepoint
_export({ target: 'String', stat: true, forced: INCORRECT_LENGTH }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  fromCodePoint: function fromCodePoint(x) {
    var elements = [];
    var length = arguments.length;
    var i = 0;
    var code;
    while (length > i) {
      code = +arguments[i++];
      if (toAbsoluteIndex(code, 0x10FFFF) !== code) throw RangeError(code + ' is not a valid code point');
      elements[i] = code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00);
    } return join(elements, '');
  }
});

// eslint-disable-next-line es/no-typed-arrays -- safe
var arrayBufferNative = typeof ArrayBuffer != 'undefined' && typeof DataView != 'undefined';

var RangeError$1 = global_1.RangeError;

// `ToIndex` abstract operation
// https://tc39.es/ecma262/#sec-toindex
var toIndex = function (it) {
  if (it === undefined) return 0;
  var number = toIntegerOrInfinity(it);
  var length = toLength(number);
  if (number !== length) throw RangeError$1('Wrong length or index');
  return length;
};

// IEEE754 conversions based on https://github.com/feross/ieee754


var Array$5 = global_1.Array;
var abs = Math.abs;
var pow = Math.pow;
var floor$1 = Math.floor;
var log = Math.log;
var LN2 = Math.LN2;

var pack = function (number, mantissaLength, bytes) {
  var buffer = Array$5(bytes);
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
  var index = 0;
  var exponent, mantissa, c;
  number = abs(number);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (number != number || number === Infinity) {
    // eslint-disable-next-line no-self-compare -- NaN check
    mantissa = number != number ? 1 : 0;
    exponent = eMax;
  } else {
    exponent = floor$1(log(number) / LN2);
    c = pow(2, -exponent);
    if (number * c < 1) {
      exponent--;
      c *= 2;
    }
    if (exponent + eBias >= 1) {
      number += rt / c;
    } else {
      number += rt * pow(2, 1 - eBias);
    }
    if (number * c >= 2) {
      exponent++;
      c /= 2;
    }
    if (exponent + eBias >= eMax) {
      mantissa = 0;
      exponent = eMax;
    } else if (exponent + eBias >= 1) {
      mantissa = (number * c - 1) * pow(2, mantissaLength);
      exponent = exponent + eBias;
    } else {
      mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
      exponent = 0;
    }
  }
  while (mantissaLength >= 8) {
    buffer[index++] = mantissa & 255;
    mantissa /= 256;
    mantissaLength -= 8;
  }
  exponent = exponent << mantissaLength | mantissa;
  exponentLength += mantissaLength;
  while (exponentLength > 0) {
    buffer[index++] = exponent & 255;
    exponent /= 256;
    exponentLength -= 8;
  }
  buffer[--index] |= sign * 128;
  return buffer;
};

var unpack = function (buffer, mantissaLength) {
  var bytes = buffer.length;
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var nBits = exponentLength - 7;
  var index = bytes - 1;
  var sign = buffer[index--];
  var exponent = sign & 127;
  var mantissa;
  sign >>= 7;
  while (nBits > 0) {
    exponent = exponent * 256 + buffer[index--];
    nBits -= 8;
  }
  mantissa = exponent & (1 << -nBits) - 1;
  exponent >>= -nBits;
  nBits += mantissaLength;
  while (nBits > 0) {
    mantissa = mantissa * 256 + buffer[index--];
    nBits -= 8;
  }
  if (exponent === 0) {
    exponent = 1 - eBias;
  } else if (exponent === eMax) {
    return mantissa ? NaN : sign ? -Infinity : Infinity;
  } else {
    mantissa = mantissa + pow(2, mantissaLength);
    exponent = exponent - eBias;
  } return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
};

var ieee754 = {
  pack: pack,
  unpack: unpack
};

// `Array.prototype.fill` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.fill
var arrayFill = function fill(value /* , start = 0, end = @length */) {
  var O = toObject(this);
  var length = lengthOfArrayLike(O);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var defineProperty$6 = objectDefineProperty.f;





var PROPER_FUNCTION_NAME$1 = functionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME$1 = functionName.CONFIGURABLE;
var getInternalState$4 = internalState.get;
var setInternalState$4 = internalState.set;
var ARRAY_BUFFER = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE$2 = 'prototype';
var WRONG_LENGTH = 'Wrong length';
var WRONG_INDEX = 'Wrong index';
var NativeArrayBuffer = global_1[ARRAY_BUFFER];
var $ArrayBuffer = NativeArrayBuffer;
var ArrayBufferPrototype = $ArrayBuffer && $ArrayBuffer[PROTOTYPE$2];
var $DataView = global_1[DATA_VIEW];
var DataViewPrototype = $DataView && $DataView[PROTOTYPE$2];
var ObjectPrototype$2 = Object.prototype;
var Array$6 = global_1.Array;
var RangeError$2 = global_1.RangeError;
var fill = functionUncurryThis(arrayFill);
var reverse = functionUncurryThis([].reverse);

var packIEEE754 = ieee754.pack;
var unpackIEEE754 = ieee754.unpack;

var packInt8 = function (number) {
  return [number & 0xFF];
};

var packInt16 = function (number) {
  return [number & 0xFF, number >> 8 & 0xFF];
};

var packInt32 = function (number) {
  return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
};

var unpackInt32 = function (buffer) {
  return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
};

var packFloat32 = function (number) {
  return packIEEE754(number, 23, 4);
};

var packFloat64 = function (number) {
  return packIEEE754(number, 52, 8);
};

var addGetter = function (Constructor, key) {
  defineProperty$6(Constructor[PROTOTYPE$2], key, { get: function () { return getInternalState$4(this)[key]; } });
};

var get$1 = function (view, count, index, isLittleEndian) {
  var intIndex = toIndex(index);
  var store = getInternalState$4(view);
  if (intIndex + count > store.byteLength) throw RangeError$2(WRONG_INDEX);
  var bytes = getInternalState$4(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = arraySliceSimple(bytes, start, start + count);
  return isLittleEndian ? pack : reverse(pack);
};

var set$2 = function (view, count, index, conversion, value, isLittleEndian) {
  var intIndex = toIndex(index);
  var store = getInternalState$4(view);
  if (intIndex + count > store.byteLength) throw RangeError$2(WRONG_INDEX);
  var bytes = getInternalState$4(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = conversion(+value);
  for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
};

if (!arrayBufferNative) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance(this, ArrayBufferPrototype);
    var byteLength = toIndex(length);
    setInternalState$4(this, {
      bytes: fill(Array$6(byteLength), 0),
      byteLength: byteLength
    });
    if (!descriptors) this.byteLength = byteLength;
  };

  ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE$2];

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance(this, DataViewPrototype);
    anInstance(buffer, ArrayBufferPrototype);
    var bufferLength = getInternalState$4(buffer).byteLength;
    var offset = toIntegerOrInfinity(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError$2('Wrong offset');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError$2(WRONG_LENGTH);
    setInternalState$4(this, {
      buffer: buffer,
      byteLength: byteLength,
      byteOffset: offset
    });
    if (!descriptors) {
      this.buffer = buffer;
      this.byteLength = byteLength;
      this.byteOffset = offset;
    }
  };

  DataViewPrototype = $DataView[PROTOTYPE$2];

  if (descriptors) {
    addGetter($ArrayBuffer, 'byteLength');
    addGetter($DataView, 'buffer');
    addGetter($DataView, 'byteLength');
    addGetter($DataView, 'byteOffset');
  }

  redefineAll(DataViewPrototype, {
    getInt8: function getInt8(byteOffset) {
      return get$1(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get$1(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /* , littleEndian */) {
      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /* , littleEndian */) {
      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined));
    },
    getUint32: function getUint32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined)) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 23);
    },
    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get$1(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 52);
    },
    setInt8: function setInt8(byteOffset, value) {
      set$2(this, 1, byteOffset, packInt8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set$2(this, 1, byteOffset, packInt8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set$2(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set$2(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set$2(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set$2(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set$2(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set$2(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : undefined);
    }
  });
} else {
  var INCORRECT_ARRAY_BUFFER_NAME = PROPER_FUNCTION_NAME$1 && NativeArrayBuffer.name !== ARRAY_BUFFER;
  /* eslint-disable no-new -- required for testing */
  if (!fails(function () {
    NativeArrayBuffer(1);
  }) || !fails(function () {
    new NativeArrayBuffer(-1);
  }) || fails(function () {
    new NativeArrayBuffer();
    new NativeArrayBuffer(1.5);
    new NativeArrayBuffer(NaN);
    return INCORRECT_ARRAY_BUFFER_NAME && !CONFIGURABLE_FUNCTION_NAME$1;
  })) {
  /* eslint-enable no-new -- required for testing */
    $ArrayBuffer = function ArrayBuffer(length) {
      anInstance(this, ArrayBufferPrototype);
      return new NativeArrayBuffer(toIndex(length));
    };

    $ArrayBuffer[PROTOTYPE$2] = ArrayBufferPrototype;

    for (var keys$1 = getOwnPropertyNames(NativeArrayBuffer), j = 0, key; keys$1.length > j;) {
      if (!((key = keys$1[j++]) in $ArrayBuffer)) {
        createNonEnumerableProperty($ArrayBuffer, key, NativeArrayBuffer[key]);
      }
    }

    ArrayBufferPrototype.constructor = $ArrayBuffer;
  } else if (INCORRECT_ARRAY_BUFFER_NAME && CONFIGURABLE_FUNCTION_NAME$1) {
    createNonEnumerableProperty(NativeArrayBuffer, 'name', ARRAY_BUFFER);
  }

  // WebKit bug - the same parent prototype for typed arrays and data view
  if (objectSetPrototypeOf && objectGetPrototypeOf(DataViewPrototype) !== ObjectPrototype$2) {
    objectSetPrototypeOf(DataViewPrototype, ObjectPrototype$2);
  }

  // iOS Safari 7.x bug
  var testView = new $DataView(new $ArrayBuffer(2));
  var $setInt8 = functionUncurryThis(DataViewPrototype.setInt8);
  testView.setInt8(0, 2147483648);
  testView.setInt8(1, 2147483649);
  if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll(DataViewPrototype, {
    setInt8: function setInt8(byteOffset, value) {
      $setInt8(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      $setInt8(this, byteOffset, value << 24 >> 24);
    }
  }, { unsafe: true });
}

setToStringTag($ArrayBuffer, ARRAY_BUFFER);
setToStringTag($DataView, DATA_VIEW);

var arrayBuffer = {
  ArrayBuffer: $ArrayBuffer,
  DataView: $DataView
};

var ArrayBuffer$1 = arrayBuffer.ArrayBuffer;
var DataView$1 = arrayBuffer.DataView;
var DataViewPrototype$1 = DataView$1.prototype;
var un$ArrayBufferSlice = functionUncurryThis(ArrayBuffer$1.prototype.slice);
var getUint8 = functionUncurryThis(DataViewPrototype$1.getUint8);
var setUint8 = functionUncurryThis(DataViewPrototype$1.setUint8);

var INCORRECT_SLICE = fails(function () {
  return !new ArrayBuffer$1(2).slice(1, undefined).byteLength;
});

// `ArrayBuffer.prototype.slice` method
// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
_export({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  slice: function slice(start, end) {
    if (un$ArrayBufferSlice && end === undefined) {
      return un$ArrayBufferSlice(anObject(this), start); // FF fix
    }
    var length = anObject(this).byteLength;
    var first = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    var result = new (speciesConstructor(this, ArrayBuffer$1))(toLength(fin - first));
    var viewSource = new DataView$1(this);
    var viewTarget = new DataView$1(result);
    var index = 0;
    while (first < fin) {
      setUint8(viewTarget, index++, getUint8(viewSource, first++));
    } return result;
  }
});

var defineProperty$7 = objectDefineProperty.f;






var Int8Array$1 = global_1.Int8Array;
var Int8ArrayPrototype = Int8Array$1 && Int8Array$1.prototype;
var Uint8ClampedArray$1 = global_1.Uint8ClampedArray;
var Uint8ClampedArrayPrototype = Uint8ClampedArray$1 && Uint8ClampedArray$1.prototype;
var TypedArray = Int8Array$1 && objectGetPrototypeOf(Int8Array$1);
var TypedArrayPrototype = Int8ArrayPrototype && objectGetPrototypeOf(Int8ArrayPrototype);
var ObjectPrototype$3 = Object.prototype;
var TypeError$h = global_1.TypeError;

var TO_STRING_TAG$4 = wellKnownSymbol('toStringTag');
var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
var TYPED_ARRAY_CONSTRUCTOR = uid('TYPED_ARRAY_CONSTRUCTOR');
// Fixing native typed arrays in Opera Presto crashes the browser, see #595
var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferNative && !!objectSetPrototypeOf && classof(global_1.opera) !== 'Opera';
var TYPED_ARRAY_TAG_REQUIRED = false;
var NAME, Constructor, Prototype;

var TypedArrayConstructorsList = {
  Int8Array: 1,
  Uint8Array: 1,
  Uint8ClampedArray: 1,
  Int16Array: 2,
  Uint16Array: 2,
  Int32Array: 4,
  Uint32Array: 4,
  Float32Array: 4,
  Float64Array: 8
};

var BigIntArrayConstructorsList = {
  BigInt64Array: 8,
  BigUint64Array: 8
};

var isView = function isView(it) {
  if (!isObject(it)) return false;
  var klass = classof(it);
  return klass === 'DataView'
    || hasOwnProperty_1(TypedArrayConstructorsList, klass)
    || hasOwnProperty_1(BigIntArrayConstructorsList, klass);
};

var isTypedArray = function (it) {
  if (!isObject(it)) return false;
  var klass = classof(it);
  return hasOwnProperty_1(TypedArrayConstructorsList, klass)
    || hasOwnProperty_1(BigIntArrayConstructorsList, klass);
};

var aTypedArray = function (it) {
  if (isTypedArray(it)) return it;
  throw TypeError$h('Target is not a typed array');
};

var aTypedArrayConstructor = function (C) {
  if (isCallable(C) && (!objectSetPrototypeOf || objectIsPrototypeOf(TypedArray, C))) return C;
  throw TypeError$h(tryToString(C) + ' is not a typed array constructor');
};

var exportTypedArrayMethod = function (KEY, property, forced, options) {
  if (!descriptors) return;
  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
    var TypedArrayConstructor = global_1[ARRAY];
    if (TypedArrayConstructor && hasOwnProperty_1(TypedArrayConstructor.prototype, KEY)) try {
      delete TypedArrayConstructor.prototype[KEY];
    } catch (error) {
      // old WebKit bug - some methods are non-configurable
      try {
        TypedArrayConstructor.prototype[KEY] = property;
      } catch (error2) { /* empty */ }
    }
  }
  if (!TypedArrayPrototype[KEY] || forced) {
    redefine(TypedArrayPrototype, KEY, forced ? property
      : NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property, options);
  }
};

var exportTypedArrayStaticMethod = function (KEY, property, forced) {
  var ARRAY, TypedArrayConstructor;
  if (!descriptors) return;
  if (objectSetPrototypeOf) {
    if (forced) for (ARRAY in TypedArrayConstructorsList) {
      TypedArrayConstructor = global_1[ARRAY];
      if (TypedArrayConstructor && hasOwnProperty_1(TypedArrayConstructor, KEY)) try {
        delete TypedArrayConstructor[KEY];
      } catch (error) { /* empty */ }
    }
    if (!TypedArray[KEY] || forced) {
      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
      try {
        return redefine(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && TypedArray[KEY] || property);
      } catch (error) { /* empty */ }
    } else return;
  }
  for (ARRAY in TypedArrayConstructorsList) {
    TypedArrayConstructor = global_1[ARRAY];
    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
      redefine(TypedArrayConstructor, KEY, property);
    }
  }
};

for (NAME in TypedArrayConstructorsList) {
  Constructor = global_1[NAME];
  Prototype = Constructor && Constructor.prototype;
  if (Prototype) createNonEnumerableProperty(Prototype, TYPED_ARRAY_CONSTRUCTOR, Constructor);
  else NATIVE_ARRAY_BUFFER_VIEWS = false;
}

for (NAME in BigIntArrayConstructorsList) {
  Constructor = global_1[NAME];
  Prototype = Constructor && Constructor.prototype;
  if (Prototype) createNonEnumerableProperty(Prototype, TYPED_ARRAY_CONSTRUCTOR, Constructor);
}

// WebKit bug - typed arrays constructors prototype is Object.prototype
if (!NATIVE_ARRAY_BUFFER_VIEWS || !isCallable(TypedArray) || TypedArray === Function.prototype) {
  // eslint-disable-next-line no-shadow -- safe
  TypedArray = function TypedArray() {
    throw TypeError$h('Incorrect invocation');
  };
  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
    if (global_1[NAME]) objectSetPrototypeOf(global_1[NAME], TypedArray);
  }
}

if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype$3) {
  TypedArrayPrototype = TypedArray.prototype;
  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
    if (global_1[NAME]) objectSetPrototypeOf(global_1[NAME].prototype, TypedArrayPrototype);
  }
}

// WebKit bug - one more object in Uint8ClampedArray prototype chain
if (NATIVE_ARRAY_BUFFER_VIEWS && objectGetPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
  objectSetPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
}

if (descriptors && !hasOwnProperty_1(TypedArrayPrototype, TO_STRING_TAG$4)) {
  TYPED_ARRAY_TAG_REQUIRED = true;
  defineProperty$7(TypedArrayPrototype, TO_STRING_TAG$4, { get: function () {
    return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined;
  } });
  for (NAME in TypedArrayConstructorsList) if (global_1[NAME]) {
    createNonEnumerableProperty(global_1[NAME], TYPED_ARRAY_TAG, NAME);
  }
}

var arrayBufferViewCore = {
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
  TYPED_ARRAY_CONSTRUCTOR: TYPED_ARRAY_CONSTRUCTOR,
  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQUIRED && TYPED_ARRAY_TAG,
  aTypedArray: aTypedArray,
  aTypedArrayConstructor: aTypedArrayConstructor,
  exportTypedArrayMethod: exportTypedArrayMethod,
  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
  isView: isView,
  isTypedArray: isTypedArray,
  TypedArray: TypedArray,
  TypedArrayPrototype: TypedArrayPrototype
};

/* eslint-disable no-new -- required for testing */



var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

var ArrayBuffer$2 = global_1.ArrayBuffer;
var Int8Array$2 = global_1.Int8Array;

var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails(function () {
  Int8Array$2(1);
}) || !fails(function () {
  new Int8Array$2(-1);
}) || !checkCorrectnessOfIteration(function (iterable) {
  new Int8Array$2();
  new Int8Array$2(null);
  new Int8Array$2(1.5);
  new Int8Array$2(iterable);
}, true) || fails(function () {
  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
  return new Int8Array$2(new ArrayBuffer$2(2), 1, undefined).length !== 1;
});

var floor$2 = Math.floor;

// `IsIntegralNumber` abstract operation
// https://tc39.es/ecma262/#sec-isintegralnumber
// eslint-disable-next-line es/no-number-isinteger -- safe
var isIntegralNumber = Number.isInteger || function isInteger(it) {
  return !isObject(it) && isFinite(it) && floor$2(it) === it;
};

var RangeError$3 = global_1.RangeError;

var toPositiveInteger = function (it) {
  var result = toIntegerOrInfinity(it);
  if (result < 0) throw RangeError$3("The argument can't be less than 0");
  return result;
};

var RangeError$4 = global_1.RangeError;

var toOffset = function (it, BYTES) {
  var offset = toPositiveInteger(it);
  if (offset % BYTES) throw RangeError$4('Wrong offset');
  return offset;
};

var aTypedArrayConstructor$1 = arrayBufferViewCore.aTypedArrayConstructor;

var typedArrayFrom = function from(source /* , mapfn, thisArg */) {
  var C = aConstructor(this);
  var O = toObject(source);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod(O);
  var i, length, result, step, iterator, next;
  if (iteratorMethod && !isArrayIteratorMethod(iteratorMethod)) {
    iterator = getIterator(O, iteratorMethod);
    next = iterator.next;
    O = [];
    while (!(step = functionCall(next, iterator)).done) {
      O.push(step.value);
    }
  }
  if (mapping && argumentsLength > 2) {
    mapfn = functionBindContext(mapfn, arguments[2]);
  }
  length = lengthOfArrayLike(O);
  result = new (aTypedArrayConstructor$1(C))(length);
  for (i = 0; length > i; i++) {
    result[i] = mapping ? mapfn(O[i], i) : O[i];
  }
  return result;
};

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    objectSetPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) objectSetPrototypeOf($this, NewTargetPrototype);
  return $this;
};

var typedArrayConstructor = createCommonjsModule(function (module) {






















var getOwnPropertyNames = objectGetOwnPropertyNames.f;

var forEach = arrayIteration.forEach;






var getInternalState = internalState.get;
var setInternalState = internalState.set;
var nativeDefineProperty = objectDefineProperty.f;
var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var round = Math.round;
var RangeError = global_1.RangeError;
var ArrayBuffer = arrayBuffer.ArrayBuffer;
var ArrayBufferPrototype = ArrayBuffer.prototype;
var DataView = arrayBuffer.DataView;
var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
var TYPED_ARRAY_CONSTRUCTOR = arrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;
var TYPED_ARRAY_TAG = arrayBufferViewCore.TYPED_ARRAY_TAG;
var TypedArray = arrayBufferViewCore.TypedArray;
var TypedArrayPrototype = arrayBufferViewCore.TypedArrayPrototype;
var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
var isTypedArray = arrayBufferViewCore.isTypedArray;
var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
var WRONG_LENGTH = 'Wrong length';

var fromList = function (C, list) {
  aTypedArrayConstructor(C);
  var index = 0;
  var length = list.length;
  var result = new C(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var addGetter = function (it, key) {
  nativeDefineProperty(it, key, { get: function () {
    return getInternalState(this)[key];
  } });
};

var isArrayBuffer = function (it) {
  var klass;
  return objectIsPrototypeOf(ArrayBufferPrototype, it) || (klass = classof(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
};

var isTypedArrayIndex = function (target, key) {
  return isTypedArray(target)
    && !isSymbol(key)
    && key in target
    && isIntegralNumber(+key)
    && key >= 0;
};

var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
  key = toPropertyKey(key);
  return isTypedArrayIndex(target, key)
    ? createPropertyDescriptor(2, target[key])
    : nativeGetOwnPropertyDescriptor(target, key);
};

var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
  key = toPropertyKey(key);
  if (isTypedArrayIndex(target, key)
    && isObject(descriptor)
    && hasOwnProperty_1(descriptor, 'value')
    && !hasOwnProperty_1(descriptor, 'get')
    && !hasOwnProperty_1(descriptor, 'set')
    // TODO: add validation descriptor w/o calling accessors
    && !descriptor.configurable
    && (!hasOwnProperty_1(descriptor, 'writable') || descriptor.writable)
    && (!hasOwnProperty_1(descriptor, 'enumerable') || descriptor.enumerable)
  ) {
    target[key] = descriptor.value;
    return target;
  } return nativeDefineProperty(target, key, descriptor);
};

if (descriptors) {
  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
    objectGetOwnPropertyDescriptor.f = wrappedGetOwnPropertyDescriptor;
    objectDefineProperty.f = wrappedDefineProperty;
    addGetter(TypedArrayPrototype, 'buffer');
    addGetter(TypedArrayPrototype, 'byteOffset');
    addGetter(TypedArrayPrototype, 'byteLength');
    addGetter(TypedArrayPrototype, 'length');
  }

  _export({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
    defineProperty: wrappedDefineProperty
  });

  module.exports = function (TYPE, wrapper, CLAMPED) {
    var BYTES = TYPE.match(/\d+$/)[0] / 8;
    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + TYPE;
    var SETTER = 'set' + TYPE;
    var NativeTypedArrayConstructor = global_1[CONSTRUCTOR_NAME];
    var TypedArrayConstructor = NativeTypedArrayConstructor;
    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
    var exported = {};

    var getter = function (that, index) {
      var data = getInternalState(that);
      return data.view[GETTER](index * BYTES + data.byteOffset, true);
    };

    var setter = function (that, index, value) {
      var data = getInternalState(that);
      if (CLAMPED) value = (value = round(value)) < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
      data.view[SETTER](index * BYTES + data.byteOffset, value, true);
    };

    var addElement = function (that, index) {
      nativeDefineProperty(that, index, {
        get: function () {
          return getter(this, index);
        },
        set: function (value) {
          return setter(this, index, value);
        },
        enumerable: true
      });
    };

    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
      TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
        anInstance(that, TypedArrayConstructorPrototype);
        var index = 0;
        var byteOffset = 0;
        var buffer, byteLength, length;
        if (!isObject(data)) {
          length = toIndex(data);
          byteLength = length * BYTES;
          buffer = new ArrayBuffer(byteLength);
        } else if (isArrayBuffer(data)) {
          buffer = data;
          byteOffset = toOffset(offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
            byteLength = $len - byteOffset;
            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if (byteLength + byteOffset > $len) throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (isTypedArray(data)) {
          return fromList(TypedArrayConstructor, data);
        } else {
          return functionCall(typedArrayFrom, TypedArrayConstructor, data);
        }
        setInternalState(that, {
          buffer: buffer,
          byteOffset: byteOffset,
          byteLength: byteLength,
          length: length,
          view: new DataView(buffer)
        });
        while (index < length) addElement(that, index++);
      });

      if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = objectCreate(TypedArrayPrototype);
    } else if (typedArrayConstructorsRequireWrappers) {
      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
        anInstance(dummy, TypedArrayConstructorPrototype);
        return inheritIfRequired(function () {
          if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
          if (isArrayBuffer(data)) return $length !== undefined
            ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length)
            : typedArrayOffset !== undefined
              ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES))
              : new NativeTypedArrayConstructor(data);
          if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
          return functionCall(typedArrayFrom, TypedArrayConstructor, data);
        }(), dummy, TypedArrayConstructor);
      });

      if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
      forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
        if (!(key in TypedArrayConstructor)) {
          createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
        }
      });
      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
    }

    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
      createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
    }

    createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_CONSTRUCTOR, TypedArrayConstructor);

    if (TYPED_ARRAY_TAG) {
      createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
    }

    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

    _export({
      global: true, forced: TypedArrayConstructor != NativeTypedArrayConstructor, sham: !NATIVE_ARRAY_BUFFER_VIEWS
    }, exported);

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
      createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
    }

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
      createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
    }

    setSpecies(CONSTRUCTOR_NAME);
  };
} else module.exports = function () { /* empty */ };
});

// `Uint8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
typedArrayConstructor('Uint8', function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var min$2 = Math.min;

// `Array.prototype.copyWithin` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
// eslint-disable-next-line es/no-array-prototype-copywithin -- safe
var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject(this);
  var len = lengthOfArrayLike(O);
  var to = toAbsoluteIndex(target, len);
  var from = toAbsoluteIndex(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = min$2((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else delete O[to];
    to += inc;
    from += inc;
  } return O;
};

var u$ArrayCopyWithin = functionUncurryThis(arrayCopyWithin);
var aTypedArray$1 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$1 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
exportTypedArrayMethod$1('copyWithin', function copyWithin(target, start /* , end */) {
  return u$ArrayCopyWithin(aTypedArray$1(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
});

var $every = arrayIteration.every;

var aTypedArray$2 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$2 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.every` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
exportTypedArrayMethod$2('every', function every(callbackfn /* , thisArg */) {
  return $every(aTypedArray$2(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var aTypedArray$3 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$3 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.fill` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
exportTypedArrayMethod$3('fill', function fill(value /* , start, end */) {
  var length = arguments.length;
  return functionCall(
    arrayFill,
    aTypedArray$3(this),
    value,
    length > 1 ? arguments[1] : undefined,
    length > 2 ? arguments[2] : undefined
  );
});

var arrayFromConstructorAndList = function (Constructor, list) {
  var index = 0;
  var length = lengthOfArrayLike(list);
  var result = new Constructor(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var TYPED_ARRAY_CONSTRUCTOR$1 = arrayBufferViewCore.TYPED_ARRAY_CONSTRUCTOR;
var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;

// a part of `TypedArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#typedarray-species-create
var typedArraySpeciesConstructor = function (originalArray) {
  return aTypedArrayConstructor$2(speciesConstructor(originalArray, originalArray[TYPED_ARRAY_CONSTRUCTOR$1]));
};

var typedArrayFromSpeciesAndList = function (instance, list) {
  return arrayFromConstructorAndList(typedArraySpeciesConstructor(instance), list);
};

var $filter = arrayIteration.filter;


var aTypedArray$4 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$4 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.filter` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
exportTypedArrayMethod$4('filter', function filter(callbackfn /* , thisArg */) {
  var list = $filter(aTypedArray$4(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  return typedArrayFromSpeciesAndList(this, list);
});

var $find$1 = arrayIteration.find;

var aTypedArray$5 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$5 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.find` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
exportTypedArrayMethod$5('find', function find(predicate /* , thisArg */) {
  return $find$1(aTypedArray$5(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var $findIndex = arrayIteration.findIndex;

var aTypedArray$6 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$6 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
exportTypedArrayMethod$6('findIndex', function findIndex(predicate /* , thisArg */) {
  return $findIndex(aTypedArray$6(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var $forEach$1 = arrayIteration.forEach;

var aTypedArray$7 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$7 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.forEach` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
exportTypedArrayMethod$7('forEach', function forEach(callbackfn /* , thisArg */) {
  $forEach$1(aTypedArray$7(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var $includes = arrayIncludes.includes;

var aTypedArray$8 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$8 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.includes` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
exportTypedArrayMethod$8('includes', function includes(searchElement /* , fromIndex */) {
  return $includes(aTypedArray$8(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var $indexOf = arrayIncludes.indexOf;

var aTypedArray$9 = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$9 = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
exportTypedArrayMethod$9('indexOf', function indexOf(searchElement /* , fromIndex */) {
  return $indexOf(aTypedArray$9(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var ITERATOR$6 = wellKnownSymbol('iterator');
var Uint8Array$1 = global_1.Uint8Array;
var arrayValues = functionUncurryThis(es_array_iterator.values);
var arrayKeys = functionUncurryThis(es_array_iterator.keys);
var arrayEntries = functionUncurryThis(es_array_iterator.entries);
var aTypedArray$a = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$a = arrayBufferViewCore.exportTypedArrayMethod;
var TypedArrayPrototype$1 = Uint8Array$1 && Uint8Array$1.prototype;

var GENERIC = !fails(function () {
  TypedArrayPrototype$1[ITERATOR$6].call([1]);
});

var ITERATOR_IS_VALUES = !!TypedArrayPrototype$1
  && TypedArrayPrototype$1.values
  && TypedArrayPrototype$1[ITERATOR$6] === TypedArrayPrototype$1.values
  && TypedArrayPrototype$1.values.name === 'values';

var typedArrayValues = function values() {
  return arrayValues(aTypedArray$a(this));
};

// `%TypedArray%.prototype.entries` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
exportTypedArrayMethod$a('entries', function entries() {
  return arrayEntries(aTypedArray$a(this));
}, GENERIC);
// `%TypedArray%.prototype.keys` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
exportTypedArrayMethod$a('keys', function keys() {
  return arrayKeys(aTypedArray$a(this));
}, GENERIC);
// `%TypedArray%.prototype.values` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
exportTypedArrayMethod$a('values', typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });
// `%TypedArray%.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
exportTypedArrayMethod$a(ITERATOR$6, typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });

var aTypedArray$b = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$b = arrayBufferViewCore.exportTypedArrayMethod;
var $join = functionUncurryThis([].join);

// `%TypedArray%.prototype.join` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
exportTypedArrayMethod$b('join', function join(separator) {
  return $join(aTypedArray$b(this), separator);
});

var arrayMethodIsStrict = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};

/* eslint-disable es/no-array-prototype-lastindexof -- safe */






var min$3 = Math.min;
var $lastIndexOf = [].lastIndexOf;
var NEGATIVE_ZERO = !!$lastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
var STRICT_METHOD = arrayMethodIsStrict('lastIndexOf');
var FORCED$2 = NEGATIVE_ZERO || !STRICT_METHOD;

// `Array.prototype.lastIndexOf` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
var arrayLastIndexOf = FORCED$2 ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
  // convert -0 to +0
  if (NEGATIVE_ZERO) return functionApply($lastIndexOf, this, arguments) || 0;
  var O = toIndexedObject(this);
  var length = lengthOfArrayLike(O);
  var index = length - 1;
  if (arguments.length > 1) index = min$3(index, toIntegerOrInfinity(arguments[1]));
  if (index < 0) index = length + index;
  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
  return -1;
} : $lastIndexOf;

var aTypedArray$c = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$c = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
exportTypedArrayMethod$c('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
  var length = arguments.length;
  return functionApply(arrayLastIndexOf, aTypedArray$c(this), length > 1 ? [searchElement, arguments[1]] : [searchElement]);
});

var $map = arrayIteration.map;


var aTypedArray$d = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$d = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.map` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
exportTypedArrayMethod$d('map', function map(mapfn /* , thisArg */) {
  return $map(aTypedArray$d(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
    return new (typedArraySpeciesConstructor(O))(length);
  });
});

var TypeError$i = global_1.TypeError;

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod$3 = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    aCallable(callbackfn);
    var O = toObject(that);
    var self = indexedObject(O);
    var length = lengthOfArrayLike(O);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw TypeError$i('Reduce of empty array with no initial value');
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

var arrayReduce = {
  // `Array.prototype.reduce` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduce
  left: createMethod$3(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod$3(true)
};

var $reduce = arrayReduce.left;

var aTypedArray$e = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$e = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduce` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
exportTypedArrayMethod$e('reduce', function reduce(callbackfn /* , initialValue */) {
  var length = arguments.length;
  return $reduce(aTypedArray$e(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
});

var $reduceRight = arrayReduce.right;

var aTypedArray$f = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$f = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduceRicht` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
exportTypedArrayMethod$f('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
  var length = arguments.length;
  return $reduceRight(aTypedArray$f(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
});

var aTypedArray$g = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$g = arrayBufferViewCore.exportTypedArrayMethod;
var floor$3 = Math.floor;

// `%TypedArray%.prototype.reverse` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
exportTypedArrayMethod$g('reverse', function reverse() {
  var that = this;
  var length = aTypedArray$g(that).length;
  var middle = floor$3(length / 2);
  var index = 0;
  var value;
  while (index < middle) {
    value = that[index];
    that[index++] = that[--length];
    that[length] = value;
  } return that;
});

var RangeError$5 = global_1.RangeError;
var Int8Array$3 = global_1.Int8Array;
var Int8ArrayPrototype$1 = Int8Array$3 && Int8Array$3.prototype;
var $set = Int8ArrayPrototype$1 && Int8ArrayPrototype$1.set;
var aTypedArray$h = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$h = arrayBufferViewCore.exportTypedArrayMethod;

var WORKS_WITH_OBJECTS_AND_GEERIC_ON_TYPED_ARRAYS = !fails(function () {
  // eslint-disable-next-line es/no-typed-arrays -- required for testing
  var array = new Uint8ClampedArray(2);
  functionCall($set, array, { length: 1, 0: 3 }, 1);
  return array[1] !== 3;
});

// https://bugs.chromium.org/p/v8/issues/detail?id=11294 and other
var TO_OBJECT_BUG = WORKS_WITH_OBJECTS_AND_GEERIC_ON_TYPED_ARRAYS && arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS && fails(function () {
  var array = new Int8Array$3(2);
  array.set(1);
  array.set('2', 1);
  return array[0] !== 0 || array[1] !== 2;
});

// `%TypedArray%.prototype.set` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
exportTypedArrayMethod$h('set', function set(arrayLike /* , offset */) {
  aTypedArray$h(this);
  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
  var src = toObject(arrayLike);
  if (WORKS_WITH_OBJECTS_AND_GEERIC_ON_TYPED_ARRAYS) return functionCall($set, this, src, offset);
  var length = this.length;
  var len = lengthOfArrayLike(src);
  var index = 0;
  if (len + offset > length) throw RangeError$5('Wrong length');
  while (index < len) this[offset + index] = src[index++];
}, !WORKS_WITH_OBJECTS_AND_GEERIC_ON_TYPED_ARRAYS || TO_OBJECT_BUG);

var aTypedArray$i = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$i = arrayBufferViewCore.exportTypedArrayMethod;

var FORCED$3 = fails(function () {
  // eslint-disable-next-line es/no-typed-arrays -- required for testing
  new Int8Array(1).slice();
});

// `%TypedArray%.prototype.slice` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
exportTypedArrayMethod$i('slice', function slice(start, end) {
  var list = arraySlice(aTypedArray$i(this), start, end);
  var C = typedArraySpeciesConstructor(this);
  var index = 0;
  var length = list.length;
  var result = new C(length);
  while (length > index) result[index] = list[index++];
  return result;
}, FORCED$3);

var $some = arrayIteration.some;

var aTypedArray$j = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$j = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.some` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
exportTypedArrayMethod$j('some', function some(callbackfn /* , thisArg */) {
  return $some(aTypedArray$j(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var floor$4 = Math.floor;

var mergeSort = function (array, comparefn) {
  var length = array.length;
  var middle = floor$4(length / 2);
  return length < 8 ? insertionSort(array, comparefn) : merge(
    array,
    mergeSort(arraySliceSimple(array, 0, middle), comparefn),
    mergeSort(arraySliceSimple(array, middle), comparefn),
    comparefn
  );
};

var insertionSort = function (array, comparefn) {
  var length = array.length;
  var i = 1;
  var element, j;

  while (i < length) {
    j = i;
    element = array[i];
    while (j && comparefn(array[j - 1], element) > 0) {
      array[j] = array[--j];
    }
    if (j !== i++) array[j] = element;
  } return array;
};

var merge = function (array, left, right, comparefn) {
  var llength = left.length;
  var rlength = right.length;
  var lindex = 0;
  var rindex = 0;

  while (lindex < llength || rindex < rlength) {
    array[lindex + rindex] = (lindex < llength && rindex < rlength)
      ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
      : lindex < llength ? left[lindex++] : right[rindex++];
  } return array;
};

var arraySort = mergeSort;

var firefox = engineUserAgent.match(/firefox\/(\d+)/i);

var engineFfVersion = !!firefox && +firefox[1];

var engineIsIeOrEdge = /MSIE|Trident/.test(engineUserAgent);

var webkit = engineUserAgent.match(/AppleWebKit\/(\d+)\./);

var engineWebkitVersion = !!webkit && +webkit[1];

var Array$7 = global_1.Array;
var aTypedArray$k = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$k = arrayBufferViewCore.exportTypedArrayMethod;
var Uint16Array$1 = global_1.Uint16Array;
var un$Sort = Uint16Array$1 && functionUncurryThis(Uint16Array$1.prototype.sort);

// WebKit
var ACCEPT_INCORRECT_ARGUMENTS = !!un$Sort && !(fails(function () {
  un$Sort(new Uint16Array$1(2), null);
}) && fails(function () {
  un$Sort(new Uint16Array$1(2), {});
}));

var STABLE_SORT = !!un$Sort && !fails(function () {
  // feature detection can be too slow, so check engines versions
  if (engineV8Version) return engineV8Version < 74;
  if (engineFfVersion) return engineFfVersion < 67;
  if (engineIsIeOrEdge) return true;
  if (engineWebkitVersion) return engineWebkitVersion < 602;

  var array = new Uint16Array$1(516);
  var expected = Array$7(516);
  var index, mod;

  for (index = 0; index < 516; index++) {
    mod = index % 4;
    array[index] = 515 - index;
    expected[index] = index - 2 * mod + 3;
  }

  un$Sort(array, function (a, b) {
    return (a / 4 | 0) - (b / 4 | 0);
  });

  for (index = 0; index < 516; index++) {
    if (array[index] !== expected[index]) return true;
  }
});

var getSortCompare = function (comparefn) {
  return function (x, y) {
    if (comparefn !== undefined) return +comparefn(x, y) || 0;
    // eslint-disable-next-line no-self-compare -- NaN check
    if (y !== y) return -1;
    // eslint-disable-next-line no-self-compare -- NaN check
    if (x !== x) return 1;
    if (x === 0 && y === 0) return 1 / x > 0 && 1 / y < 0 ? 1 : -1;
    return x > y;
  };
};

// `%TypedArray%.prototype.sort` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.sort
exportTypedArrayMethod$k('sort', function sort(comparefn) {
  if (comparefn !== undefined) aCallable(comparefn);
  if (STABLE_SORT) return un$Sort(this, comparefn);

  return arraySort(aTypedArray$k(this), getSortCompare(comparefn));
}, !STABLE_SORT || ACCEPT_INCORRECT_ARGUMENTS);

var aTypedArray$l = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$l = arrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.subarray` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
exportTypedArrayMethod$l('subarray', function subarray(begin, end) {
  var O = aTypedArray$l(this);
  var length = O.length;
  var beginIndex = toAbsoluteIndex(begin, length);
  var C = typedArraySpeciesConstructor(O);
  return new C(
    O.buffer,
    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
    toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
  );
});

var Int8Array$4 = global_1.Int8Array;
var aTypedArray$m = arrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod$m = arrayBufferViewCore.exportTypedArrayMethod;
var $toLocaleString = [].toLocaleString;

// iOS Safari 6.x fails here
var TO_LOCALE_STRING_BUG = !!Int8Array$4 && fails(function () {
  $toLocaleString.call(new Int8Array$4(1));
});

var FORCED$4 = fails(function () {
  return [1, 2].toLocaleString() != new Int8Array$4([1, 2]).toLocaleString();
}) || !fails(function () {
  Int8Array$4.prototype.toLocaleString.call([1, 2]);
});

// `%TypedArray%.prototype.toLocaleString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
exportTypedArrayMethod$m('toLocaleString', function toLocaleString() {
  return functionApply(
    $toLocaleString,
    TO_LOCALE_STRING_BUG ? arraySlice(aTypedArray$m(this)) : aTypedArray$m(this),
    arraySlice(arguments)
  );
}, FORCED$4);

var exportTypedArrayMethod$n = arrayBufferViewCore.exportTypedArrayMethod;




var Uint8Array$2 = global_1.Uint8Array;
var Uint8ArrayPrototype = Uint8Array$2 && Uint8Array$2.prototype || {};
var arrayToString = [].toString;
var join$1 = functionUncurryThis([].join);

if (fails(function () { arrayToString.call({}); })) {
  arrayToString = function toString() {
    return join$1(this);
  };
}

var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString;

// `%TypedArray%.prototype.toString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
exportTypedArrayMethod$n('toString', arrayToString, IS_NOT_ARRAY_METHOD);

var ARRAY_BUFFER$1 = 'ArrayBuffer';
var ArrayBuffer$3 = arrayBuffer[ARRAY_BUFFER$1];
var NativeArrayBuffer$1 = global_1[ARRAY_BUFFER$1];

// `ArrayBuffer` constructor
// https://tc39.es/ecma262/#sec-arraybuffer-constructor
_export({ global: true, forced: NativeArrayBuffer$1 !== ArrayBuffer$3 }, {
  ArrayBuffer: ArrayBuffer$3
});

setSpecies(ARRAY_BUFFER$1);

// `Uint16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
typedArrayConstructor('Uint16', function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// `Uint32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
typedArrayConstructor('Uint32', function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var $forEach$2 = arrayIteration.forEach;


var STRICT_METHOD$1 = arrayMethodIsStrict('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = !STRICT_METHOD$1 ? function forEach(callbackfn /* , thisArg */) {
  return $forEach$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
} : [].forEach;

var handlePrototype$1 = function (CollectionPrototype) {
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
  } catch (error) {
    CollectionPrototype.forEach = arrayForEach;
  }
};

for (var COLLECTION_NAME$1 in domIterables) {
  if (domIterables[COLLECTION_NAME$1]) {
    handlePrototype$1(global_1[COLLECTION_NAME$1] && global_1[COLLECTION_NAME$1].prototype);
  }
}

handlePrototype$1(domTokenListPrototype);

/* eslint-disable es/no-array-prototype-indexof -- required for testing */


var $IndexOf = arrayIncludes.indexOf;


var un$IndexOf = functionUncurryThis([].indexOf);

var NEGATIVE_ZERO$1 = !!un$IndexOf && 1 / un$IndexOf([1], 1, -0) < 0;
var STRICT_METHOD$2 = arrayMethodIsStrict('indexOf');

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
_export({ target: 'Array', proto: true, forced: NEGATIVE_ZERO$1 || !STRICT_METHOD$2 }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
    return NEGATIVE_ZERO$1
      // convert -0 to +0
      ? un$IndexOf(this, searchElement, fromIndex) || 0
      : $IndexOf(this, searchElement, fromIndex);
  }
});

var $map$1 = arrayIteration.map;


var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('splice');

var TypeError$j = global_1.TypeError;
var max$3 = Math.max;
var min$4 = Math.min;
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
      actualDeleteCount = min$4(max$3(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
    }
    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER$1) {
      throw TypeError$j(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
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

var un$Join = functionUncurryThis([].join);

var ES3_STRINGS = indexedObject != Object;
var STRICT_METHOD$3 = arrayMethodIsStrict('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
_export({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$3 }, {
  join: function join(separator) {
    return un$Join(toIndexedObject(this), separator === undefined ? ',' : separator);
  }
});

var $filter$1 = arrayIteration.filter;


var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var FUNCTION_NAME_EXISTS = functionName.EXISTS;

var defineProperty$8 = objectDefineProperty.f;

var FunctionPrototype$3 = Function.prototype;
var functionToString$1 = functionUncurryThis(FunctionPrototype$3.toString);
var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
var regExpExec = functionUncurryThis(nameRE.exec);
var NAME$1 = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (descriptors && !FUNCTION_NAME_EXISTS) {
  defineProperty$8(FunctionPrototype$3, NAME$1, {
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

var $reduce$1 = arrayReduce.left;




var STRICT_METHOD$4 = arrayMethodIsStrict('reduce');
// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !engineIsNode && engineV8Version > 79 && engineV8Version < 83;

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$4 || CHROME_BUG }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var length = arguments.length;
    return $reduce$1(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
  }
});

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

var RegExpPrototype = RegExp.prototype;

var FORCED$5 = descriptors && fails(function () {
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  return Object.getOwnPropertyDescriptor(RegExpPrototype, 'flags').get.call({ dotAll: true, sticky: true }) !== 'sy';
});

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
if (FORCED$5) objectDefineProperty.f(RegExpPrototype, 'flags', {
  configurable: true,
  get: regexpFlags
});

var PROPER_FUNCTION_NAME$2 = functionName.PROPER;







var TO_STRING = 'toString';
var RegExpPrototype$1 = RegExp.prototype;
var n$ToString = RegExpPrototype$1[TO_STRING];
var getFlags = functionUncurryThis(regexpFlags);

var NOT_GENERIC = fails(function () { return n$ToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = PROPER_FUNCTION_NAME$2 && n$ToString.name != TO_STRING;

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

var RangeError$6 = global_1.RangeError;

// `String.prototype.repeat` method implementation
// https://tc39.es/ecma262/#sec-string.prototype.repeat
var stringRepeat = function repeat(count) {
  var str = toString_1(requireObjectCoercible(this));
  var result = '';
  var n = toIntegerOrInfinity(count);
  if (n < 0 || n == Infinity) throw RangeError$6('Wrong number of repetitions');
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
  return result;
};

// `String.prototype.repeat` method
// https://tc39.es/ecma262/#sec-string.prototype.repeat
_export({ target: 'String', proto: true }, {
  repeat: stringRepeat
});

// a string of all valid unicode whitespaces
var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var replace$1 = functionUncurryThis(''.replace);
var whitespace = '[' + whitespaces + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$4 = function (TYPE) {
  return function ($this) {
    var string = toString_1(requireObjectCoercible($this));
    if (TYPE & 1) string = replace$1(string, ltrim, '');
    if (TYPE & 2) string = replace$1(string, rtrim, '');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod$4(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod$4(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod$4(3)
};

var PROPER_FUNCTION_NAME$3 = functionName.PROPER;



var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
var stringTrimForced = function (METHOD_NAME) {
  return fails(function () {
    return !!whitespaces[METHOD_NAME]()
      || non[METHOD_NAME]() !== non
      || (PROPER_FUNCTION_NAME$3 && whitespaces[METHOD_NAME].name !== METHOD_NAME);
  });
};

var $trim = stringTrim.trim;


// `String.prototype.trim` method
// https://tc39.es/ecma262/#sec-string.prototype.trim
_export({ target: 'String', proto: true, forced: stringTrimForced('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});

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







var getInternalState$5 = internalState.get;



var nativeReplace = shared('native-string-replace', String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt$2 = functionUncurryThis(''.charAt);
var indexOf$1 = functionUncurryThis(''.indexOf);
var replace$2 = functionUncurryThis(''.replace);
var stringSlice$3 = functionUncurryThis(''.slice);

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
    var state = getInternalState$5(re);
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
      flags = replace$2(flags, 'y', '');
      if (indexOf$1(flags, 'g') === -1) {
        flags += 'g';
      }

      strCopy = stringSlice$3(str, re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$2(str, re.lastIndex - 1) !== '\n')) {
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
        match.input = stringSlice$3(match.input, charsAdded);
        match[0] = stringSlice$3(match[0], charsAdded);
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
var RegExpPrototype$2 = RegExp.prototype;

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
      if ($exec === regexpExec || $exec === RegExpPrototype$2.exec) {
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
    redefine(RegExpPrototype$2, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty(RegExpPrototype$2[SYMBOL], 'sham', true);
};

var charAt$3 = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
var advanceStringIndex = function (S, index, unicode) {
  return index + (unicode ? charAt$3(S, index).length : 1);
};

var floor$5 = Math.floor;
var charAt$4 = functionUncurryThis(''.charAt);
var replace$3 = functionUncurryThis(''.replace);
var stringSlice$4 = functionUncurryThis(''.slice);
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

// `GetSubstitution` abstract operation
// https://tc39.es/ecma262/#sec-getsubstitution
var getSubstitution = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace$3(replacement, symbols, function (match, ch) {
    var capture;
    switch (charAt$4(ch, 0)) {
      case '$': return '$';
      case '&': return matched;
      case '`': return stringSlice$4(str, 0, position);
      case "'": return stringSlice$4(str, tailPos);
      case '<':
        capture = namedCaptures[stringSlice$4(ch, 1, -1)];
        break;
      default: // \d\d?
        var n = +ch;
        if (n === 0) return match;
        if (n > m) {
          var f = floor$5(n / 10);
          if (f === 0) return match;
          if (f <= m) return captures[f - 1] === undefined ? charAt$4(ch, 1) : captures[f - 1] + charAt$4(ch, 1);
          return match;
        }
        capture = captures[n - 1];
    }
    return capture === undefined ? '' : capture;
  });
};

var TypeError$k = global_1.TypeError;

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
  throw TypeError$k('RegExp#exec called on incompatible receiver');
};

var REPLACE = wellKnownSymbol('replace');
var max$4 = Math.max;
var min$5 = Math.min;
var concat$2 = functionUncurryThis([].concat);
var push$3 = functionUncurryThis([].push);
var stringIndexOf = functionUncurryThis(''.indexOf);
var stringSlice$5 = functionUncurryThis(''.slice);

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
  return 'a'.replace(/./, '$0') === '$0';
})();

// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
  return ''.replace(re, '$<a>') !== '7';
});

// @@replace logic
fixRegexpWellKnownSymbolLogic('replace', function (_, nativeReplace, maybeCallNative) {
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = searchValue == undefined ? undefined : getMethod(searchValue, REPLACE);
      return replacer
        ? functionCall(replacer, searchValue, O, replaceValue)
        : functionCall(nativeReplace, toString_1(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (string, replaceValue) {
      var rx = anObject(this);
      var S = toString_1(string);

      if (
        typeof replaceValue == 'string' &&
        stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
        stringIndexOf(replaceValue, '$<') === -1
      ) {
        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
        if (res.done) return res.value;
      }

      var functionalReplace = isCallable(replaceValue);
      if (!functionalReplace) replaceValue = toString_1(replaceValue);

      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regexpExecAbstract(rx, S);
        if (result === null) break;

        push$3(results, result);
        if (!global) break;

        var matchStr = toString_1(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = toString_1(result[0]);
        var position = max$4(min$5(toIntegerOrInfinity(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) push$3(captures, maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = concat$2([matched], captures, position, S);
          if (namedCaptures !== undefined) push$3(replacerArgs, namedCaptures);
          var replacement = toString_1(functionApply(replaceValue, undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += stringSlice$5(S, nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + stringSlice$5(S, nextSourcePosition);
    }
  ];
}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);

// @@match logic
fixRegexpWellKnownSymbolLogic('match', function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.es/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible(this);
      var matcher = regexp == undefined ? undefined : getMethod(regexp, MATCH);
      return matcher ? functionCall(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString_1(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
    function (string) {
      var rx = anObject(this);
      var S = toString_1(string);
      var res = maybeCallNative(nativeMatch, rx, S);

      if (res.done) return res.value;

      if (!rx.global) return regexpExecAbstract(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regexpExecAbstract(rx, S)) !== null) {
        var matchStr = toString_1(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

var FAILS_ON_PRIMITIVES = fails(function () { objectKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return objectKeys(toObject(it));
  }
});

// `Array.prototype.fill` method
// https://tc39.es/ecma262/#sec-array.prototype.fill
_export({ target: 'Array', proto: true }, {
  fill: arrayFill
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('fill');

(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[6],{

/***/"./node_modules/html2canvas/dist/html2canvas.js":
/*!******************************************************!*\
  !*** ./node_modules/html2canvas/dist/html2canvas.js ***!
  \******************************************************/
/*! no static exports found */
/***/function node_modulesHtml2canvasDistHtml2canvasJs(module,exports,__webpack_require__){

/*!
 * html2canvas 1.4.1 <https://html2canvas.hertzen.com>
 * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */
(function(global,factory){
module.exports=factory();
})(this,function(){
/*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
/* global Reflect, Promise */

var _extendStatics=function extendStatics(d,b){
_extendStatics=Object.setPrototypeOf||
{__proto__:[]}instanceof Array&&function(d,b){d.__proto__=b;}||
function(d,b){for(var p in b){if(Object.prototype.hasOwnProperty.call(b,p))d[p]=b[p];}};
return _extendStatics(d,b);
};

function __extends(d,b){
if(typeof b!=="function"&&b!==null)
throw new TypeError("Class extends value "+String(b)+" is not a constructor or null");
_extendStatics(d,b);
function __(){this.constructor=d;}
d.prototype=b===null?Object.create(b):(__.prototype=b.prototype,new __());
}

var _assign=function __assign(){
_assign=Object.assign||function __assign(t){
for(var s,i=1,n=arguments.length;i<n;i++){
s=arguments[i];
for(var p in s){if(Object.prototype.hasOwnProperty.call(s,p))t[p]=s[p];}
}
return t;
};
return _assign.apply(this,arguments);
};

function __awaiter(thisArg,_arguments,P,generator){
function adopt(value){return value instanceof P?value:new P(function(resolve){resolve(value);});}
return new(P||(P=Promise))(function(resolve,reject){
function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}
function rejected(value){try{step(generator["throw"](value));}catch(e){reject(e);}}
function step(result){result.done?resolve(result.value):adopt(result.value).then(fulfilled,rejected);}
step((generator=generator.apply(thisArg,_arguments||[])).next());
});
}

function __generator(thisArg,body){
var _={label:0,sent:function sent(){if(t[0]&1)throw t[1];return t[1];},trys:[],ops:[]},f,y,t,g;
return g={next:verb(0),"throw":verb(1),"return":verb(2)},typeof Symbol==="function"&&(g[Symbol.iterator]=function(){return this;}),g;
function verb(n){return function(v){return step([n,v]);};}
function step(op){
if(f)throw new TypeError("Generator is already executing.");
while(_){try{
if(f=1,y&&(t=op[0]&2?y["return"]:op[0]?y["throw"]||((t=y["return"])&&t.call(y),0):y.next)&&!(t=t.call(y,op[1])).done)return t;
if(y=0,t)op=[op[0]&2,t.value];
switch(op[0]){
case 0:case 1:t=op;break;
case 4:_.label++;return {value:op[1],done:false};
case 5:_.label++;y=op[1];op=[0];continue;
case 7:op=_.ops.pop();_.trys.pop();continue;
default:
if(!(t=_.trys,t=t.length>0&&t[t.length-1])&&(op[0]===6||op[0]===2)){_=0;continue;}
if(op[0]===3&&(!t||op[1]>t[0]&&op[1]<t[3])){_.label=op[1];break;}
if(op[0]===6&&_.label<t[1]){_.label=t[1];t=op;break;}
if(t&&_.label<t[2]){_.label=t[2];_.ops.push(op);break;}
if(t[2])_.ops.pop();
_.trys.pop();continue;}

op=body.call(thisArg,_);
}catch(e){op=[6,e];y=0;}finally{f=t=0;}}
if(op[0]&5)throw op[1];return {value:op[0]?op[1]:void 0,done:true};
}
}

function __spreadArray(to,from,pack){
if(pack||arguments.length===2)for(var i=0,l=from.length,ar;i<l;i++){
if(ar||!(i in from)){
if(!ar)ar=Array.prototype.slice.call(from,0,i);
ar[i]=from[i];
}
}
return to.concat(ar||from);
}

var Bounds=/** @class */function(){
function Bounds(left,top,width,height){
this.left=left;
this.top=top;
this.width=width;
this.height=height;
}
Bounds.prototype.add=function(x,y,w,h){
return new Bounds(this.left+x,this.top+y,this.width+w,this.height+h);
};
Bounds.fromClientRect=function(context,clientRect){
return new Bounds(clientRect.left+context.windowBounds.left,clientRect.top+context.windowBounds.top,clientRect.width,clientRect.height);
};
Bounds.fromDOMRectList=function(context,domRectList){
var domRect=Array.from(domRectList).find(function(rect){return rect.width!==0;});
return domRect?
new Bounds(domRect.left+context.windowBounds.left,domRect.top+context.windowBounds.top,domRect.width,domRect.height):
Bounds.EMPTY;
};
Bounds.EMPTY=new Bounds(0,0,0,0);
return Bounds;
}();
var parseBounds=function parseBounds(context,node){
return Bounds.fromClientRect(context,node.getBoundingClientRect());
};
var parseDocumentSize=function parseDocumentSize(document){
var body=document.body;
var documentElement=document.documentElement;
if(!body||!documentElement){
throw new Error("Unable to get document size");
}
var width=Math.max(Math.max(body.scrollWidth,documentElement.scrollWidth),Math.max(body.offsetWidth,documentElement.offsetWidth),Math.max(body.clientWidth,documentElement.clientWidth));
var height=Math.max(Math.max(body.scrollHeight,documentElement.scrollHeight),Math.max(body.offsetHeight,documentElement.offsetHeight),Math.max(body.clientHeight,documentElement.clientHeight));
return new Bounds(0,0,width,height);
};

/*
     * css-line-break 2.1.0 <https://github.com/niklasvh/css-line-break#readme>
     * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
var toCodePoints$1=function toCodePoints$1(str){
var codePoints=[];
var i=0;
var length=str.length;
while(i<length){
var value=str.charCodeAt(i++);
if(value>=0xd800&&value<=0xdbff&&i<length){
var extra=str.charCodeAt(i++);
if((extra&0xfc00)===0xdc00){
codePoints.push(((value&0x3ff)<<10)+(extra&0x3ff)+0x10000);
}else
{
codePoints.push(value);
i--;
}
}else
{
codePoints.push(value);
}
}
return codePoints;
};
var fromCodePoint$1=function fromCodePoint$1(){
var codePoints=[];
for(var _i=0;_i<arguments.length;_i++){
codePoints[_i]=arguments[_i];
}
if(String.fromCodePoint){
return String.fromCodePoint.apply(String,codePoints);
}
var length=codePoints.length;
if(!length){
return '';
}
var codeUnits=[];
var index=-1;
var result='';
while(++index<length){
var codePoint=codePoints[index];
if(codePoint<=0xffff){
codeUnits.push(codePoint);
}else
{
codePoint-=0x10000;
codeUnits.push((codePoint>>10)+0xd800,codePoint%0x400+0xdc00);
}
if(index+1===length||codeUnits.length>0x4000){
result+=String.fromCharCode.apply(String,codeUnits);
codeUnits.length=0;
}
}
return result;
};
var chars$2='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup$2=typeof Uint8Array==='undefined'?[]:new Uint8Array(256);
for(var i$2=0;i$2<chars$2.length;i$2++){
lookup$2[chars$2.charCodeAt(i$2)]=i$2;
}

/*
     * utrie 1.0.2 <https://github.com/niklasvh/utrie>
     * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
var chars$1$1='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup$1$1=typeof Uint8Array==='undefined'?[]:new Uint8Array(256);
for(var i$1$1=0;i$1$1<chars$1$1.length;i$1$1++){
lookup$1$1[chars$1$1.charCodeAt(i$1$1)]=i$1$1;
}
var decode$1=function decode$1(base64){
var bufferLength=base64.length*0.75,len=base64.length,i,p=0,encoded1,encoded2,encoded3,encoded4;
if(base64[base64.length-1]==='='){
bufferLength--;
if(base64[base64.length-2]==='='){
bufferLength--;
}
}
var buffer=typeof ArrayBuffer!=='undefined'&&
typeof Uint8Array!=='undefined'&&
typeof Uint8Array.prototype.slice!=='undefined'?
new ArrayBuffer(bufferLength):
new Array(bufferLength);
var bytes=Array.isArray(buffer)?buffer:new Uint8Array(buffer);
for(i=0;i<len;i+=4){
encoded1=lookup$1$1[base64.charCodeAt(i)];
encoded2=lookup$1$1[base64.charCodeAt(i+1)];
encoded3=lookup$1$1[base64.charCodeAt(i+2)];
encoded4=lookup$1$1[base64.charCodeAt(i+3)];
bytes[p++]=encoded1<<2|encoded2>>4;
bytes[p++]=(encoded2&15)<<4|encoded3>>2;
bytes[p++]=(encoded3&3)<<6|encoded4&63;
}
return buffer;
};
var polyUint16Array$1=function polyUint16Array$1(buffer){
var length=buffer.length;
var bytes=[];
for(var i=0;i<length;i+=2){
bytes.push(buffer[i+1]<<8|buffer[i]);
}
return bytes;
};
var polyUint32Array$1=function polyUint32Array$1(buffer){
var length=buffer.length;
var bytes=[];
for(var i=0;i<length;i+=4){
bytes.push(buffer[i+3]<<24|buffer[i+2]<<16|buffer[i+1]<<8|buffer[i]);
}
return bytes;
};

/** Shift size for getting the index-2 table offset. */
var UTRIE2_SHIFT_2$1=5;
/** Shift size for getting the index-1 table offset. */
var UTRIE2_SHIFT_1$1=6+5;
/**
     * Shift size for shifting left the index array values.
     * Increases possible data size with 16-bit index values at the cost
     * of compactability.
     * This requires data blocks to be aligned by UTRIE2_DATA_GRANULARITY.
     */
var UTRIE2_INDEX_SHIFT$1=2;
/**
     * Difference between the two shift sizes,
     * for getting an index-1 offset from an index-2 offset. 6=11-5
     */
var UTRIE2_SHIFT_1_2$1=UTRIE2_SHIFT_1$1-UTRIE2_SHIFT_2$1;
/**
     * The part of the index-2 table for U+D800..U+DBFF stores values for
     * lead surrogate code _units_ not code _points_.
     * Values for lead surrogate code _points_ are indexed with this portion of the table.
     * Length=32=0x20=0x400>>UTRIE2_SHIFT_2. (There are 1024=0x400 lead surrogates.)
     */
var UTRIE2_LSCP_INDEX_2_OFFSET$1=0x10000>>UTRIE2_SHIFT_2$1;
/** Number of entries in a data block. 32=0x20 */
var UTRIE2_DATA_BLOCK_LENGTH$1=1<<UTRIE2_SHIFT_2$1;
/** Mask for getting the lower bits for the in-data-block offset. */
var UTRIE2_DATA_MASK$1=UTRIE2_DATA_BLOCK_LENGTH$1-1;
var UTRIE2_LSCP_INDEX_2_LENGTH$1=0x400>>UTRIE2_SHIFT_2$1;
/** Count the lengths of both BMP pieces. 2080=0x820 */
var UTRIE2_INDEX_2_BMP_LENGTH$1=UTRIE2_LSCP_INDEX_2_OFFSET$1+UTRIE2_LSCP_INDEX_2_LENGTH$1;
/**
     * The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.
     * Length 32=0x20 for lead bytes C0..DF, regardless of UTRIE2_SHIFT_2.
     */
var UTRIE2_UTF8_2B_INDEX_2_OFFSET$1=UTRIE2_INDEX_2_BMP_LENGTH$1;
var UTRIE2_UTF8_2B_INDEX_2_LENGTH$1=0x800>>6;/* U+0800 is the first code point after 2-byte UTF-8 */
/**
     * The index-1 table, only used for supplementary code points, at offset 2112=0x840.
     * Variable length, for code points up to highStart, where the last single-value range starts.
     * Maximum length 512=0x200=0x100000>>UTRIE2_SHIFT_1.
     * (For 0x100000 supplementary code points U+10000..U+10ffff.)
     *
     * The part of the index-2 table for supplementary code points starts
     * after this index-1 table.
     *
     * Both the index-1 table and the following part of the index-2 table
     * are omitted completely if there is only BMP data.
     */
var UTRIE2_INDEX_1_OFFSET$1=UTRIE2_UTF8_2B_INDEX_2_OFFSET$1+UTRIE2_UTF8_2B_INDEX_2_LENGTH$1;
/**
     * Number of index-1 entries for the BMP. 32=0x20
     * This part of the index-1 table is omitted from the serialized form.
     */
var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH$1=0x10000>>UTRIE2_SHIFT_1$1;
/** Number of entries in an index-2 block. 64=0x40 */
var UTRIE2_INDEX_2_BLOCK_LENGTH$1=1<<UTRIE2_SHIFT_1_2$1;
/** Mask for getting the lower bits for the in-index-2-block offset. */
var UTRIE2_INDEX_2_MASK$1=UTRIE2_INDEX_2_BLOCK_LENGTH$1-1;
var slice16$1=function slice16$1(view,start,end){
if(view.slice){
return view.slice(start,end);
}
return new Uint16Array(Array.prototype.slice.call(view,start,end));
};
var slice32$1=function slice32$1(view,start,end){
if(view.slice){
return view.slice(start,end);
}
return new Uint32Array(Array.prototype.slice.call(view,start,end));
};
var createTrieFromBase64$1=function createTrieFromBase64$1(base64,_byteLength){
var buffer=decode$1(base64);
var view32=Array.isArray(buffer)?polyUint32Array$1(buffer):new Uint32Array(buffer);
var view16=Array.isArray(buffer)?polyUint16Array$1(buffer):new Uint16Array(buffer);
var headerLength=24;
var index=slice16$1(view16,headerLength/2,view32[4]/2);
var data=view32[5]===2?
slice16$1(view16,(headerLength+view32[4])/2):
slice32$1(view32,Math.ceil((headerLength+view32[4])/4));
return new Trie$1(view32[0],view32[1],view32[2],view32[3],index,data);
};
var Trie$1=/** @class */function(){
function Trie(initialValue,errorValue,highStart,highValueIndex,index,data){
this.initialValue=initialValue;
this.errorValue=errorValue;
this.highStart=highStart;
this.highValueIndex=highValueIndex;
this.index=index;
this.data=data;
}
/**
         * Get the value for a code point as stored in the Trie.
         *
         * @param codePoint the code point
         * @return the value
         */
Trie.prototype.get=function(codePoint){
var ix;
if(codePoint>=0){
if(codePoint<0x0d800||codePoint>0x0dbff&&codePoint<=0x0ffff){
// Ordinary BMP code point, excluding leading surrogates.
// BMP uses a single level lookup.  BMP index starts at offset 0 in the Trie2 index.
// 16 bit data is stored in the index array itself.
ix=this.index[codePoint>>UTRIE2_SHIFT_2$1];
ix=(ix<<UTRIE2_INDEX_SHIFT$1)+(codePoint&UTRIE2_DATA_MASK$1);
return this.data[ix];
}
if(codePoint<=0xffff){
// Lead Surrogate Code Point.  A Separate index section is stored for
// lead surrogate code units and code points.
//   The main index has the code unit data.
//   For this function, we need the code point data.
// Note: this expression could be refactored for slightly improved efficiency, but
//       surrogate code points will be so rare in practice that it's not worth it.
ix=this.index[UTRIE2_LSCP_INDEX_2_OFFSET$1+(codePoint-0xd800>>UTRIE2_SHIFT_2$1)];
ix=(ix<<UTRIE2_INDEX_SHIFT$1)+(codePoint&UTRIE2_DATA_MASK$1);
return this.data[ix];
}
if(codePoint<this.highStart){
// Supplemental code point, use two-level lookup.
ix=UTRIE2_INDEX_1_OFFSET$1-UTRIE2_OMITTED_BMP_INDEX_1_LENGTH$1+(codePoint>>UTRIE2_SHIFT_1$1);
ix=this.index[ix];
ix+=codePoint>>UTRIE2_SHIFT_2$1&UTRIE2_INDEX_2_MASK$1;
ix=this.index[ix];
ix=(ix<<UTRIE2_INDEX_SHIFT$1)+(codePoint&UTRIE2_DATA_MASK$1);
return this.data[ix];
}
if(codePoint<=0x10ffff){
return this.data[this.highValueIndex];
}
}
// Fall through.  The code point is outside of the legal range of 0..0x10ffff.
return this.errorValue;
};
return Trie;
}();

/*
     * base64-arraybuffer 1.0.2 <https://github.com/niklasvh/base64-arraybuffer>
     * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
var chars$3='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup$3=typeof Uint8Array==='undefined'?[]:new Uint8Array(256);
for(var i$3=0;i$3<chars$3.length;i$3++){
lookup$3[chars$3.charCodeAt(i$3)]=i$3;
}

var base64$1='KwAAAAAAAAAACA4AUD0AADAgAAACAAAAAAAIABAAGABAAEgAUABYAGAAaABgAGgAYgBqAF8AZwBgAGgAcQB5AHUAfQCFAI0AlQCdAKIAqgCyALoAYABoAGAAaABgAGgAwgDKAGAAaADGAM4A0wDbAOEA6QDxAPkAAQEJAQ8BFwF1AH0AHAEkASwBNAE6AUIBQQFJAVEBWQFhAWgBcAF4ATAAgAGGAY4BlQGXAZ8BpwGvAbUBvQHFAc0B0wHbAeMB6wHxAfkBAQIJAvEBEQIZAiECKQIxAjgCQAJGAk4CVgJeAmQCbAJ0AnwCgQKJApECmQKgAqgCsAK4ArwCxAIwAMwC0wLbAjAA4wLrAvMC+AIAAwcDDwMwABcDHQMlAy0DNQN1AD0DQQNJA0kDSQNRA1EDVwNZA1kDdQB1AGEDdQBpA20DdQN1AHsDdQCBA4kDkQN1AHUAmQOhA3UAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AKYDrgN1AHUAtgO+A8YDzgPWAxcD3gPjA+sD8wN1AHUA+wMDBAkEdQANBBUEHQQlBCoEFwMyBDgEYABABBcDSARQBFgEYARoBDAAcAQzAXgEgASIBJAEdQCXBHUAnwSnBK4EtgS6BMIEyAR1AHUAdQB1AHUAdQCVANAEYABgAGAAYABgAGAAYABgANgEYADcBOQEYADsBPQE/AQEBQwFFAUcBSQFLAU0BWQEPAVEBUsFUwVbBWAAYgVgAGoFcgV6BYIFigWRBWAAmQWfBaYFYABgAGAAYABgAKoFYACxBbAFuQW6BcEFwQXHBcEFwQXPBdMF2wXjBeoF8gX6BQIGCgYSBhoGIgYqBjIGOgZgAD4GRgZMBmAAUwZaBmAAYABgAGAAYABgAGAAYABgAGAAYABgAGIGYABpBnAGYABgAGAAYABgAGAAYABgAGAAYAB4Bn8GhQZgAGAAYAB1AHcDFQSLBmAAYABgAJMGdQA9A3UAmwajBqsGqwaVALMGuwbDBjAAywbSBtIG1QbSBtIG0gbSBtIG0gbdBuMG6wbzBvsGAwcLBxMHAwcbByMHJwcsBywHMQcsB9IGOAdAB0gHTgfSBkgHVgfSBtIG0gbSBtIG0gbSBtIG0gbSBiwHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAdgAGAALAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAdbB2MHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsB2kH0gZwB64EdQB1AHUAdQB1AHUAdQB1AHUHfQdgAIUHjQd1AHUAlQedB2AAYAClB6sHYACzB7YHvgfGB3UAzgfWBzMB3gfmB1EB7gf1B/0HlQENAQUIDQh1ABUIHQglCBcDLQg1CD0IRQhNCEEDUwh1AHUAdQBbCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIcAh3CHoIMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIgggwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAALAcsBywHLAcsBywHLAcsBywHLAcsB4oILAcsB44I0gaWCJ4Ipgh1AHUAqgiyCHUAdQB1AHUAdQB1AHUAdQB1AHUAtwh8AXUAvwh1AMUIyQjRCNkI4AjoCHUAdQB1AO4I9gj+CAYJDgkTCS0HGwkjCYIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiAAIAAAAFAAYABgAGIAXwBgAHEAdQBFAJUAogCyAKAAYABgAEIA4ABGANMA4QDxAMEBDwE1AFwBLAE6AQEBUQF4QkhCmEKoQrhCgAHIQsAB0MLAAcABwAHAAeDC6ABoAHDCwMMAAcABwAHAAdDDGMMAAcAB6MM4wwjDWMNow3jDaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAEjDqABWw6bDqABpg6gAaABoAHcDvwOPA+gAaABfA/8DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DpcPAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcAB9cPKwkyCToJMAB1AHUAdQBCCUoJTQl1AFUJXAljCWcJawkwADAAMAAwAHMJdQB2CX4JdQCECYoJjgmWCXUAngkwAGAAYABxAHUApgn3A64JtAl1ALkJdQDACTAAMAAwADAAdQB1AHUAdQB1AHUAdQB1AHUAowYNBMUIMAAwADAAMADICcsJ0wnZCRUE4QkwAOkJ8An4CTAAMAB1AAAKvwh1AAgKDwoXCh8KdQAwACcKLgp1ADYKqAmICT4KRgowADAAdQB1AE4KMAB1AFYKdQBeCnUAZQowADAAMAAwADAAMAAwADAAMAAVBHUAbQowADAAdQC5CXUKMAAwAHwBxAijBogEMgF9CoQKiASMCpQKmgqIBKIKqgquCogEDQG2Cr4KxgrLCjAAMADTCtsKCgHjCusK8Qr5CgELMAAwADAAMAB1AIsECQsRC3UANAEZCzAAMAAwADAAMAB1ACELKQswAHUANAExCzkLdQBBC0kLMABRC1kLMAAwADAAMAAwADAAdQBhCzAAMAAwAGAAYABpC3ELdwt/CzAAMACHC4sLkwubC58Lpwt1AK4Ltgt1APsDMAAwADAAMAAwADAAMAAwAL4LwwvLC9IL1wvdCzAAMADlC+kL8Qv5C/8LSQswADAAMAAwADAAMAAwADAAMAAHDDAAMAAwADAAMAAODBYMHgx1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1ACYMMAAwADAAdQB1AHUALgx1AHUAdQB1AHUAdQA2DDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AD4MdQBGDHUAdQB1AHUAdQB1AEkMdQB1AHUAdQB1AFAMMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQBYDHUAdQB1AF8MMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUA+wMVBGcMMAAwAHwBbwx1AHcMfwyHDI8MMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAYABgAJcMMAAwADAAdQB1AJ8MlQClDDAAMACtDCwHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsB7UMLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AA0EMAC9DDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAsBywHLAcsBywHLAcsBywHLQcwAMEMyAwsBywHLAcsBywHLAcsBywHLAcsBywHzAwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1ANQM2QzhDDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMABgAGAAYABgAGAAYABgAOkMYADxDGAA+AwADQYNYABhCWAAYAAODTAAMAAwADAAFg1gAGAAHg37AzAAMAAwADAAYABgACYNYAAsDTQNPA1gAEMNPg1LDWAAYABgAGAAYABgAGAAYABgAGAAUg1aDYsGVglhDV0NcQBnDW0NdQ15DWAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAlQCBDZUAiA2PDZcNMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAnw2nDTAAMAAwADAAMAAwAHUArw23DTAAMAAwADAAMAAwADAAMAAwADAAMAB1AL8NMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAB1AHUAdQB1AHUAdQDHDTAAYABgAM8NMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAA1w11ANwNMAAwAD0B5A0wADAAMAAwADAAMADsDfQN/A0EDgwOFA4wABsOMAAwADAAMAAwADAAMAAwANIG0gbSBtIG0gbSBtIG0gYjDigOwQUuDsEFMw7SBjoO0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGQg5KDlIOVg7SBtIGXg5lDm0OdQ7SBtIGfQ6EDooOjQ6UDtIGmg6hDtIG0gaoDqwO0ga0DrwO0gZgAGAAYADEDmAAYAAkBtIGzA5gANIOYADaDokO0gbSBt8O5w7SBu8O0gb1DvwO0gZgAGAAxA7SBtIG0gbSBtIGYABgAGAAYAAED2AAsAUMD9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGFA8sBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAccD9IGLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHJA8sBywHLAcsBywHLAccDywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywPLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAc0D9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAccD9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGFA8sBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHPA/SBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gYUD0QPlQCVAJUAMAAwADAAMACVAJUAlQCVAJUAlQCVAEwPMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAA//8EAAQABAAEAAQABAAEAAQABAANAAMAAQABAAIABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQACgATABcAHgAbABoAHgAXABYAEgAeABsAGAAPABgAHABLAEsASwBLAEsASwBLAEsASwBLABgAGAAeAB4AHgATAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYAGwASAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAWAA0AEQAeAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAFAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJABYAGgAbABsAGwAeAB0AHQAeAE8AFwAeAA0AHgAeABoAGwBPAE8ADgBQAB0AHQAdAE8ATwAXAE8ATwBPABYAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAFAATwBAAE8ATwBPAEAATwBQAFAATwBQAB4AHgAeAB4AHgAeAB0AHQAdAB0AHgAdAB4ADgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgBQAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkACQAJAAkACQAJAAkABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAFAAHgAeAB4AKwArAFAAUABQAFAAGABQACsAKwArACsAHgAeAFAAHgBQAFAAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUAAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAYAA0AKwArAB4AHgAbACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAB4ABAAEAB4ABAAEABMABAArACsAKwArACsAKwArACsAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAKwArACsAKwBWAFYAVgBWAB4AHgArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AGgAaABoAGAAYAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQAEwAEACsAEwATAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABLAEsASwBLAEsASwBLAEsASwBLABoAGQAZAB4AUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABMAUAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABABQAFAABAAEAB4ABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUAAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAFAABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQAUABQAB4AHgAYABMAUAArACsABAAbABsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAFAABAAEAAQABAAEAFAABAAEAAQAUAAEAAQABAAEAAQAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArACsAHgArAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAUAAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEAA0ADQBLAEsASwBLAEsASwBLAEsASwBLAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUAArACsAKwBQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABABQACsAKwArACsAKwArACsAKwAEACsAKwArACsAUABQACsAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUAAaABoAUABQAFAAUABQAEwAHgAbAFAAHgAEACsAKwAEAAQABAArAFAAUABQAFAAUABQACsAKwArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQACsAUABQACsAKwAEACsABAAEAAQABAAEACsAKwArACsABAAEACsAKwAEAAQABAArACsAKwAEACsAKwArACsAKwArACsAUABQAFAAUAArAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLAAQABABQAFAAUAAEAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAArACsAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAB4AGwArACsAKwArACsAKwArAFAABAAEAAQABAAEAAQAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAKwArACsAKwArAAQABAAEACsAKwArACsAUABQACsAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAB4AUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAAQAUAArAFAAUABQAFAAUABQACsAKwArAFAAUABQACsAUABQAFAAUAArACsAKwBQAFAAKwBQACsAUABQACsAKwArAFAAUAArACsAKwBQAFAAUAArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAAQABAAEAAQABAArACsAKwAEAAQABAArAAQABAAEAAQAKwArAFAAKwArACsAKwArACsABAArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAHgAeAB4AHgAeAB4AGwAeACsAKwArACsAKwAEAAQABAAEAAQAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAUAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAAEACsAKwArACsAKwArACsABAAEACsAUABQAFAAKwArACsAKwArAFAAUAAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwAOAFAAUABQAFAAUABQAFAAHgBQAAQABAAEAA4AUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAKwArAAQAUAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAAEACsAKwArACsAKwArACsABAAEACsAKwArACsAKwArACsAUAArAFAAUAAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwBQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABABQAB4AKwArACsAKwBQAFAAUAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQABoAUABQAFAAUABQAFAAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQACsAUAArACsAUABQAFAAUABQAFAAUAArACsAKwAEACsAKwArACsABAAEAAQABAAEAAQAKwAEACsABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgAqACsAKwArACsAGwBcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAeAEsASwBLAEsASwBLAEsASwBLAEsADQANACsAKwArACsAKwBcAFwAKwBcACsAXABcAFwAXABcACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAXAArAFwAXABcAFwAXABcAFwAXABcAFwAKgBcAFwAKgAqACoAKgAqACoAKgAqACoAXAArACsAXABcAFwAXABcACsAXAArACoAKgAqACoAKgAqACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwBcAFwAXABcAFAADgAOAA4ADgAeAA4ADgAJAA4ADgANAAkAEwATABMAEwATAAkAHgATAB4AHgAeAAQABAAeAB4AHgAeAB4AHgBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQAFAADQAEAB4ABAAeAAQAFgARABYAEQAEAAQAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAAQABAAEAAQADQAEAAQAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAA0ADQAeAB4AHgAeAB4AHgAEAB4AHgAeAB4AHgAeACsAHgAeAA4ADgANAA4AHgAeAB4AHgAeAAkACQArACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgBcAEsASwBLAEsASwBLAEsASwBLAEsADQANAB4AHgAeAB4AXABcAFwAXABcAFwAKgAqACoAKgBcAFwAXABcACoAKgAqAFwAKgAqACoAXABcACoAKgAqACoAKgAqACoAXABcAFwAKgAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKgAqAFwAKgBLAEsASwBLAEsASwBLAEsASwBLACoAKgAqACoAKgAqAFAAUABQAFAAUABQACsAUAArACsAKwArACsAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgBQAFAAUABQAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAKwBQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsABAAEAAQAHgANAB4AHgAeAB4AHgAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUAArACsADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAWABEAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAA0ADQANAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAANAA0AKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUAArAAQABAArACsAKwArACsAKwArACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqAA0ADQAVAFwADQAeAA0AGwBcACoAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwAeAB4AEwATAA0ADQAOAB4AEwATAB4ABAAEAAQACQArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUAAEAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAHgArACsAKwATABMASwBLAEsASwBLAEsASwBLAEsASwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAXABcAFwAXABcACsAKwArACsAKwArACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAXAArACsAKwAqACoAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsAHgAeAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKwAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKwArAAQASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACoAKgAqACoAKgAqACoAXAAqACoAKgAqACoAKgArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABABQAFAAUABQAFAAUABQACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwANAA0AHgANAA0ADQANAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AKwArACsABAAEAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwAeAB4AHgAeAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArAA0ADQANAA0ADQBLAEsASwBLAEsASwBLAEsASwBLACsAKwArAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAA0ADQBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUAAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArAAQABAAEAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAAQAUABQAFAAUABQAFAABABQAFAABAAEAAQAUAArACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAKwBQACsAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQACsAKwAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQACsAHgAeAB4AHgAeAB4AHgAOAB4AKwANAA0ADQANAA0ADQANAAkADQANAA0ACAAEAAsABAAEAA0ACQANAA0ADAAdAB0AHgAXABcAFgAXABcAFwAWABcAHQAdAB4AHgAUABQAFAANAAEAAQAEAAQABAAEAAQACQAaABoAGgAaABoAGgAaABoAHgAXABcAHQAVABUAHgAeAB4AHgAeAB4AGAAWABEAFQAVABUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ADQAeAA0ADQANAA0AHgANAA0ADQAHAB4AHgAeAB4AKwAEAAQABAAEAAQABAAEAAQABAAEAFAAUAArACsATwBQAFAAUABQAFAAHgAeAB4AFgARAE8AUABPAE8ATwBPAFAAUABQAFAAUAAeAB4AHgAWABEAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArABsAGwAbABsAGwAbABsAGgAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGgAbABsAGwAbABoAGwAbABoAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAHgAeAFAAGgAeAB0AHgBQAB4AGgAeAB4AHgAeAB4AHgAeAB4AHgBPAB4AUAAbAB4AHgBQAFAAUABQAFAAHgAeAB4AHQAdAB4AUAAeAFAAHgBQAB4AUABPAFAAUAAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAHgBQAFAAUABQAE8ATwBQAFAAUABQAFAATwBQAFAATwBQAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAFAAUABQAFAATwBPAE8ATwBPAE8ATwBPAE8ATwBQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABPAB4AHgArACsAKwArAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHQAdAB4AHgAeAB0AHQAeAB4AHQAeAB4AHgAdAB4AHQAbABsAHgAdAB4AHgAeAB4AHQAeAB4AHQAdAB0AHQAeAB4AHQAeAB0AHgAdAB0AHQAdAB0AHQAeAB0AHgAeAB4AHgAeAB0AHQAdAB0AHgAeAB4AHgAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB0AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAdAB0AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAWABEAHgAeAB4AHgAeAB4AHQAeAB4AHgAeAB4AHgAeACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAFAAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeAB4AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AHQAdAB0AHgAeAB0AHgAeAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlAB4AHQAdAB4AHgAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AJQAlAB0AHQAlAB4AJQAlACUAIAAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAeAB4AHgAeAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAdAB0AHQAeAB0AJQAdAB0AHgAdAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAdAB0AHQAdACUAHgAlACUAJQAdACUAJQAdAB0AHQAlACUAHQAdACUAHQAdACUAJQAlAB4AHQAeAB4AHgAeAB0AHQAlAB0AHQAdAB0AHQAdACUAJQAlACUAJQAdACUAJQAgACUAHQAdACUAJQAlACUAJQAlACUAJQAeAB4AHgAlACUAIAAgACAAIAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AFwAXABcAFwAXABcAHgATABMAJQAeAB4AHgAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARABYAEQAWABEAFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAeAB4AKwArACsAKwArABMADQANAA0AUAATAA0AUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUAANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAA0ADQANAA0ADQANAA0ADQAeAA0AFgANAB4AHgAXABcAHgAeABcAFwAWABEAFgARABYAEQAWABEADQANAA0ADQATAFAADQANAB4ADQANAB4AHgAeAB4AHgAMAAwADQANAA0AHgANAA0AFgANAA0ADQANAA0ADQANAA0AHgANAB4ADQANAB4AHgAeACsAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArAA0AEQARACUAJQBHAFcAVwAWABEAFgARABYAEQAWABEAFgARACUAJQAWABEAFgARABYAEQAWABEAFQAWABEAEQAlAFcAVwBXAFcAVwBXAFcAVwBXAAQABAAEAAQABAAEACUAVwBXAFcAVwA2ACUAJQBXAFcAVwBHAEcAJQAlACUAKwBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBRAFcAUQBXAFEAVwBXAFcAVwBXAFcAUQBXAFcAVwBXAFcAVwBRAFEAKwArAAQABAAVABUARwBHAFcAFQBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBRAFcAVwBXAFcAVwBXAFEAUQBXAFcAVwBXABUAUQBHAEcAVwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwAlACUAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACsAKwArACsAKwArACsAKwArACsAKwArAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBPAE8ATwBPAE8ATwBPAE8AJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADQATAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQAHgBQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAeAA0ADQANAA0ADQArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAAQAUABQAFAABABQAFAAUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAeAB4AHgAeAAQAKwArACsAUABQAFAAUABQAFAAHgAeABoAHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADgAOABMAEwArACsAKwArACsAKwArACsABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUAAeAB4AHgBQAA4AUABQAAQAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAB4AWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYACsAKwArAAQAHgAeAB4AHgAeAB4ADQANAA0AHgAeAB4AHgArAFAASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArAB4AHgBcAFwAXABcAFwAKgBcAFwAXABcAFwAXABcAFwAXABcAEsASwBLAEsASwBLAEsASwBLAEsAXABcAFwAXABcACsAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAFAAUABQAAQAUABQAFAAUABQAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAHgANAA0ADQBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAKgAqACoAXABcACoAKgBcAFwAXABcAFwAKgAqAFwAKgBcACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAA0ADQBQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQADQAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAVABVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBUAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVACsAKwArACsAKwArACsAKwArACsAKwArAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAKwArACsAKwBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAKwArACsAKwAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArACsAKwArAFYABABWAFYAVgBWAFYAVgBWAFYAVgBWAB4AVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgArAFYAVgBWAFYAVgArAFYAKwBWAFYAKwBWAFYAKwBWAFYAVgBWAFYAVgBWAFYAVgBWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAEQAWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAaAB4AKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAGAARABEAGAAYABMAEwAWABEAFAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACUAJQAlACUAJQAWABEAFgARABYAEQAWABEAFgARABYAEQAlACUAFgARACUAJQAlACUAJQAlACUAEQAlABEAKwAVABUAEwATACUAFgARABYAEQAWABEAJQAlACUAJQAlACUAJQAlACsAJQAbABoAJQArACsAKwArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAcAKwATACUAJQAbABoAJQAlABYAEQAlACUAEQAlABEAJQBXAFcAVwBXAFcAVwBXAFcAVwBXABUAFQAlACUAJQATACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXABYAJQARACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAWACUAEQAlABYAEQARABYAEQARABUAVwBRAFEAUQBRAFEAUQBRAFEAUQBRAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcARwArACsAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXACsAKwBXAFcAVwBXAFcAVwArACsAVwBXAFcAKwArACsAGgAbACUAJQAlABsAGwArAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAAQAB0AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsADQANAA0AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAAQAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAA0AUABQAFAAUAArACsAKwArAFAAUABQAFAAUABQAFAAUAANAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAKwArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArACsAKwBQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAUABQAFAAUABQAAQABAAEACsABAAEACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAKwBQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAA0ADQANAA0ADQANAA0ADQAeACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAArACsAKwArAFAAUABQAFAAUAANAA0ADQANAA0ADQAUACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsADQANAA0ADQANAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAAQABAAEAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArAAQABAANACsAKwBQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAB4AHgAeAB4AHgArACsAKwArACsAKwAEAAQABAAEAAQABAAEAA0ADQAeAB4AHgAeAB4AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwAeACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsASwBLAEsASwBLAEsASwBLAEsASwANAA0ADQANAFAABAAEAFAAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAeAA4AUAArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAADQANAB4ADQAEAAQABAAEAB4ABAAEAEsASwBLAEsASwBLAEsASwBLAEsAUAAOAFAADQANAA0AKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAA0AHgANAA0AHgAEACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAA0AKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQACsABAAEAFAABAAEAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAUAArACsAKwArACsAKwAEACsAKwArACsAKwBQAFAAUABQAFAABAAEACsAKwAEAAQABAAEAAQABAAEACsAKwArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABABQAFAAUABQAA0ADQANAA0AHgBLAEsASwBLAEsASwBLAEsASwBLAA0ADQArAB4ABABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAFAAUAAeAFAAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABAAEAAQADgANAA0AEwATAB4AHgAeAA0ADQANAA0ADQANAA0ADQANAA0ADQANAA0ADQANAFAAUABQAFAABAAEACsAKwAEAA0ADQAeAFAAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKwArACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBcAFwADQANAA0AKgBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQAKwAEAAQAKwArAAQABAAEAAQAUAAEAFAABAAEAA0ADQANACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABABQAA4AUAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAOAB4ADQANAA0ADQAOAB4ABAArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA0ADQANAFAADgAOAA4ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAFAADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAOABMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAArACsAKwAEACsABAAEACsABAAEAAQABAAEAAQABABQAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwAEAAQAKwAEAAQABAAEAAQAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAaABoAGgAaAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABIAEgAQwBDAEMAUABQAFAAUABDAFAAUABQAEgAQwBIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABDAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAJAAkACQAJAAkACQAJABYAEQArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwANAA0AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAANACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQANAB4AHgAeAB4AHgAeAFAAUABQAFAADQAeACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAA0AHgAeACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAARwBHABUARwAJACsAKwArACsAKwArACsAKwArACsAKwAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUQBRAFEAKwArACsAKwArACsAKwArACsAKwArACsAKwBRAFEAUQBRACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArACsAHgAEAAQADQAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAAQABAAEAAQABAAeAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQAHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQAFAAKwArAFAAKwArAFAAUAArACsAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUAArAFAAUABQAFAAUABQAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAHgAeAFAAUABQAFAAUAArAFAAKwArACsAUABQAFAAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeACsAKwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4ABAAeAB4AHgAeAB4AHgAeAB4AHgAeAAQAHgAeAA0ADQANAA0AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAAQAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArAAQABAAEAAQABAAEAAQAKwAEAAQAKwAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwBQAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArABsAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAB4AHgAeAB4ABAAEAAQABAAEAAQABABQACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArABYAFgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAGgBQAFAAUAAaAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQACsAKwBQACsAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwBQACsAUAArACsAKwArACsAKwBQACsAKwArACsAUAArAFAAKwBQACsAUABQAFAAKwBQAFAAKwBQACsAKwBQACsAUAArAFAAKwBQACsAUAArAFAAUAArAFAAKwArAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUAArAFAAUABQAFAAKwBQACsAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAKwBQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AJQAlACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeACUAJQAlAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAlACUAJQAlACUAHgAlACUAJQAlACUAIAAgACAAJQAlACAAJQAlACAAIAAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACEAIQAhACEAIQAlACUAIAAgACUAJQAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAIAAlACUAJQAlACAAIAAgACUAIAAgACAAJQAlACUAJQAlACUAJQAgACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAlAB4AJQAeACUAJQAlACUAJQAgACUAJQAlACUAHgAlAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACAAIAAgACUAJQAlACAAIAAgACAAIAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABcAFwAXABUAFQAVAB4AHgAeAB4AJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAgACUAJQAgACUAJQAlACUAJQAlACUAJQAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAgACAAIAAgACAAIAAgACAAIAAgACUAJQAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAlACAAIAAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAgACAAIAAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAA==';

var LETTER_NUMBER_MODIFIER=50;
// Non-tailorable Line Breaking Classes
var BK=1;//  Cause a line break (after)
var CR$1=2;//  Cause a line break (after), except between CR and LF
var LF$1=3;//  Cause a line break (after)
var CM=4;//  Prohibit a line break between the character and the preceding character
var NL=5;//  Cause a line break (after)
var WJ=7;//  Prohibit line breaks before and after
var ZW=8;//  Provide a break opportunity
var GL=9;//  Prohibit line breaks before and after
var SP=10;// Enable indirect line breaks
var ZWJ$1=11;// Prohibit line breaks within joiner sequences
// Break Opportunities
var B2=12;//  Provide a line break opportunity before and after the character
var BA=13;//  Generally provide a line break opportunity after the character
var BB=14;//  Generally provide a line break opportunity before the character
var HY=15;//  Provide a line break opportunity after the character, except in numeric context
var CB=16;//   Provide a line break opportunity contingent on additional information
// Characters Prohibiting Certain Breaks
var CL=17;//  Prohibit line breaks before
var CP=18;//  Prohibit line breaks before
var EX=19;//  Prohibit line breaks before
var IN=20;//  Allow only indirect line breaks between pairs
var NS=21;//  Allow only indirect line breaks before
var OP=22;//  Prohibit line breaks after
var QU=23;//  Act like they are both opening and closing
// Numeric Context
var IS=24;//  Prevent breaks after any and before numeric
var NU=25;//  Form numeric expressions for line breaking purposes
var PO=26;//  Do not break following a numeric expression
var PR=27;//  Do not break in front of a numeric expression
var SY=28;//  Prevent a break before; and allow a break after
// Other Characters
var AI=29;//  Act like AL when the resolvedEAW is N; otherwise; act as ID
var AL=30;//  Are alphabetic characters or symbols that are used with alphabetic characters
var CJ=31;//  Treat as NS or ID for strict or normal breaking.
var EB=32;//  Do not break from following Emoji Modifier
var EM=33;//  Do not break from preceding Emoji Base
var H2=34;//  Form Korean syllable blocks
var H3=35;//  Form Korean syllable blocks
var HL=36;//  Do not break around a following hyphen; otherwise act as Alphabetic
var ID=37;//  Break before or after; except in some numeric context
var JL=38;//  Form Korean syllable blocks
var JV=39;//  Form Korean syllable blocks
var JT=40;//  Form Korean syllable blocks
var RI$1=41;//  Keep pairs together. For pairs; break before and after other classes
var SA=42;//  Provide a line break opportunity contingent on additional, language-specific context analysis
var XX=43;//  Have as yet unknown line breaking behavior or unassigned code positions
var ea_OP=[0x2329,0xff08];
var BREAK_MANDATORY='!';
var BREAK_NOT_ALLOWED$1='×';
var BREAK_ALLOWED$1='÷';
var UnicodeTrie$1=createTrieFromBase64$1(base64$1);
var ALPHABETICS=[AL,HL];
var HARD_LINE_BREAKS=[BK,CR$1,LF$1,NL];
var SPACE$1=[SP,ZW];
var PREFIX_POSTFIX=[PR,PO];
var LINE_BREAKS=HARD_LINE_BREAKS.concat(SPACE$1);
var KOREAN_SYLLABLE_BLOCK=[JL,JV,JT,H2,H3];
var HYPHEN=[HY,BA];
var codePointsToCharacterClasses=function codePointsToCharacterClasses(codePoints,lineBreak){
if(lineBreak===void 0){lineBreak='strict';}
var types=[];
var indices=[];
var categories=[];
codePoints.forEach(function(codePoint,index){
var classType=UnicodeTrie$1.get(codePoint);
if(classType>LETTER_NUMBER_MODIFIER){
categories.push(true);
classType-=LETTER_NUMBER_MODIFIER;
}else
{
categories.push(false);
}
if(['normal','auto','loose'].indexOf(lineBreak)!==-1){
// U+2010, – U+2013, 〜 U+301C, ゠ U+30A0
if([0x2010,0x2013,0x301c,0x30a0].indexOf(codePoint)!==-1){
indices.push(index);
return types.push(CB);
}
}
if(classType===CM||classType===ZWJ$1){
// LB10 Treat any remaining combining mark or ZWJ as AL.
if(index===0){
indices.push(index);
return types.push(AL);
}
// LB9 Do not break a combining character sequence; treat it as if it has the line breaking class of
// the base character in all of the following rules. Treat ZWJ as if it were CM.
var prev=types[index-1];
if(LINE_BREAKS.indexOf(prev)===-1){
indices.push(indices[index-1]);
return types.push(prev);
}
indices.push(index);
return types.push(AL);
}
indices.push(index);
if(classType===CJ){
return types.push(lineBreak==='strict'?NS:ID);
}
if(classType===SA){
return types.push(AL);
}
if(classType===AI){
return types.push(AL);
}
// For supplementary characters, a useful default is to treat characters in the range 10000..1FFFD as AL
// and characters in the ranges 20000..2FFFD and 30000..3FFFD as ID, until the implementation can be revised
// to take into account the actual line breaking properties for these characters.
if(classType===XX){
if(codePoint>=0x20000&&codePoint<=0x2fffd||codePoint>=0x30000&&codePoint<=0x3fffd){
return types.push(ID);
}else
{
return types.push(AL);
}
}
types.push(classType);
});
return [indices,types,categories];
};
var isAdjacentWithSpaceIgnored=function isAdjacentWithSpaceIgnored(a,b,currentIndex,classTypes){
var current=classTypes[currentIndex];
if(Array.isArray(a)?a.indexOf(current)!==-1:a===current){
var i=currentIndex;
while(i<=classTypes.length){
i++;
var next=classTypes[i];
if(next===b){
return true;
}
if(next!==SP){
break;
}
}
}
if(current===SP){
var i=currentIndex;
while(i>0){
i--;
var prev=classTypes[i];
if(Array.isArray(a)?a.indexOf(prev)!==-1:a===prev){
var n=currentIndex;
while(n<=classTypes.length){
n++;
var next=classTypes[n];
if(next===b){
return true;
}
if(next!==SP){
break;
}
}
}
if(prev!==SP){
break;
}
}
}
return false;
};
var previousNonSpaceClassType=function previousNonSpaceClassType(currentIndex,classTypes){
var i=currentIndex;
while(i>=0){
var type=classTypes[i];
if(type===SP){
i--;
}else
{
return type;
}
}
return 0;
};
var _lineBreakAtIndex=function _lineBreakAtIndex(codePoints,classTypes,indicies,index,forbiddenBreaks){
if(indicies[index]===0){
return BREAK_NOT_ALLOWED$1;
}
var currentIndex=index-1;
if(Array.isArray(forbiddenBreaks)&&forbiddenBreaks[currentIndex]===true){
return BREAK_NOT_ALLOWED$1;
}
var beforeIndex=currentIndex-1;
var afterIndex=currentIndex+1;
var current=classTypes[currentIndex];
// LB4 Always break after hard line breaks.
// LB5 Treat CR followed by LF, as well as CR, LF, and NL as hard line breaks.
var before=beforeIndex>=0?classTypes[beforeIndex]:0;
var next=classTypes[afterIndex];
if(current===CR$1&&next===LF$1){
return BREAK_NOT_ALLOWED$1;
}
if(HARD_LINE_BREAKS.indexOf(current)!==-1){
return BREAK_MANDATORY;
}
// LB6 Do not break before hard line breaks.
if(HARD_LINE_BREAKS.indexOf(next)!==-1){
return BREAK_NOT_ALLOWED$1;
}
// LB7 Do not break before spaces or zero width space.
if(SPACE$1.indexOf(next)!==-1){
return BREAK_NOT_ALLOWED$1;
}
// LB8 Break before any character following a zero-width space, even if one or more spaces intervene.
if(previousNonSpaceClassType(currentIndex,classTypes)===ZW){
return BREAK_ALLOWED$1;
}
// LB8a Do not break after a zero width joiner.
if(UnicodeTrie$1.get(codePoints[currentIndex])===ZWJ$1){
return BREAK_NOT_ALLOWED$1;
}
// zwj emojis
if((current===EB||current===EM)&&UnicodeTrie$1.get(codePoints[afterIndex])===ZWJ$1){
return BREAK_NOT_ALLOWED$1;
}
// LB11 Do not break before or after Word joiner and related characters.
if(current===WJ||next===WJ){
return BREAK_NOT_ALLOWED$1;
}
// LB12 Do not break after NBSP and related characters.
if(current===GL){
return BREAK_NOT_ALLOWED$1;
}
// LB12a Do not break before NBSP and related characters, except after spaces and hyphens.
if([SP,BA,HY].indexOf(current)===-1&&next===GL){
return BREAK_NOT_ALLOWED$1;
}
// LB13 Do not break before ‘]’ or ‘!’ or ‘;’ or ‘/’, even after spaces.
if([CL,CP,EX,IS,SY].indexOf(next)!==-1){
return BREAK_NOT_ALLOWED$1;
}
// LB14 Do not break after ‘[’, even after spaces.
if(previousNonSpaceClassType(currentIndex,classTypes)===OP){
return BREAK_NOT_ALLOWED$1;
}
// LB15 Do not break within ‘”[’, even with intervening spaces.
if(isAdjacentWithSpaceIgnored(QU,OP,currentIndex,classTypes)){
return BREAK_NOT_ALLOWED$1;
}
// LB16 Do not break between closing punctuation and a nonstarter (lb=NS), even with intervening spaces.
if(isAdjacentWithSpaceIgnored([CL,CP],NS,currentIndex,classTypes)){
return BREAK_NOT_ALLOWED$1;
}
// LB17 Do not break within ‘——’, even with intervening spaces.
if(isAdjacentWithSpaceIgnored(B2,B2,currentIndex,classTypes)){
return BREAK_NOT_ALLOWED$1;
}
// LB18 Break after spaces.
if(current===SP){
return BREAK_ALLOWED$1;
}
// LB19 Do not break before or after quotation marks, such as ‘ ” ’.
if(current===QU||next===QU){
return BREAK_NOT_ALLOWED$1;
}
// LB20 Break before and after unresolved CB.
if(next===CB||current===CB){
return BREAK_ALLOWED$1;
}
// LB21 Do not break before hyphen-minus, other hyphens, fixed-width spaces, small kana, and other non-starters, or after acute accents.
if([BA,HY,NS].indexOf(next)!==-1||current===BB){
return BREAK_NOT_ALLOWED$1;
}
// LB21a Don't break after Hebrew + Hyphen.
if(before===HL&&HYPHEN.indexOf(current)!==-1){
return BREAK_NOT_ALLOWED$1;
}
// LB21b Don’t break between Solidus and Hebrew letters.
if(current===SY&&next===HL){
return BREAK_NOT_ALLOWED$1;
}
// LB22 Do not break before ellipsis.
if(next===IN){
return BREAK_NOT_ALLOWED$1;
}
// LB23 Do not break between digits and letters.
if(ALPHABETICS.indexOf(next)!==-1&&current===NU||ALPHABETICS.indexOf(current)!==-1&&next===NU){
return BREAK_NOT_ALLOWED$1;
}
// LB23a Do not break between numeric prefixes and ideographs, or between ideographs and numeric postfixes.
if(current===PR&&[ID,EB,EM].indexOf(next)!==-1||
[ID,EB,EM].indexOf(current)!==-1&&next===PO){
return BREAK_NOT_ALLOWED$1;
}
// LB24 Do not break between numeric prefix/postfix and letters, or between letters and prefix/postfix.
if(ALPHABETICS.indexOf(current)!==-1&&PREFIX_POSTFIX.indexOf(next)!==-1||
PREFIX_POSTFIX.indexOf(current)!==-1&&ALPHABETICS.indexOf(next)!==-1){
return BREAK_NOT_ALLOWED$1;
}
// LB25 Do not break between the following pairs of classes relevant to numbers:
if(
// (PR | PO) × ( OP | HY )? NU
[PR,PO].indexOf(current)!==-1&&(
next===NU||[OP,HY].indexOf(next)!==-1&&classTypes[afterIndex+1]===NU)||
// ( OP | HY ) × NU
[OP,HY].indexOf(current)!==-1&&next===NU||
// NU ×	(NU | SY | IS)
current===NU&&[NU,SY,IS].indexOf(next)!==-1){
return BREAK_NOT_ALLOWED$1;
}
// NU (NU | SY | IS)* × (NU | SY | IS | CL | CP)
if([NU,SY,IS,CL,CP].indexOf(next)!==-1){
var prevIndex=currentIndex;
while(prevIndex>=0){
var type=classTypes[prevIndex];
if(type===NU){
return BREAK_NOT_ALLOWED$1;
}else
if([SY,IS].indexOf(type)!==-1){
prevIndex--;
}else
{
break;
}
}
}
// NU (NU | SY | IS)* (CL | CP)? × (PO | PR))
if([PR,PO].indexOf(next)!==-1){
var prevIndex=[CL,CP].indexOf(current)!==-1?beforeIndex:currentIndex;
while(prevIndex>=0){
var type=classTypes[prevIndex];
if(type===NU){
return BREAK_NOT_ALLOWED$1;
}else
if([SY,IS].indexOf(type)!==-1){
prevIndex--;
}else
{
break;
}
}
}
// LB26 Do not break a Korean syllable.
if(JL===current&&[JL,JV,H2,H3].indexOf(next)!==-1||
[JV,H2].indexOf(current)!==-1&&[JV,JT].indexOf(next)!==-1||
[JT,H3].indexOf(current)!==-1&&next===JT){
return BREAK_NOT_ALLOWED$1;
}
// LB27 Treat a Korean Syllable Block the same as ID.
if(KOREAN_SYLLABLE_BLOCK.indexOf(current)!==-1&&[IN,PO].indexOf(next)!==-1||
KOREAN_SYLLABLE_BLOCK.indexOf(next)!==-1&&current===PR){
return BREAK_NOT_ALLOWED$1;
}
// LB28 Do not break between alphabetics (“at”).
if(ALPHABETICS.indexOf(current)!==-1&&ALPHABETICS.indexOf(next)!==-1){
return BREAK_NOT_ALLOWED$1;
}
// LB29 Do not break between numeric punctuation and alphabetics (“e.g.”).
if(current===IS&&ALPHABETICS.indexOf(next)!==-1){
return BREAK_NOT_ALLOWED$1;
}
// LB30 Do not break between letters, numbers, or ordinary symbols and opening or closing parentheses.
if(ALPHABETICS.concat(NU).indexOf(current)!==-1&&
next===OP&&
ea_OP.indexOf(codePoints[afterIndex])===-1||
ALPHABETICS.concat(NU).indexOf(next)!==-1&&current===CP){
return BREAK_NOT_ALLOWED$1;
}
// LB30a Break between two regional indicator symbols if and only if there are an even number of regional
// indicators preceding the position of the break.
if(current===RI$1&&next===RI$1){
var i=indicies[currentIndex];
var count=1;
while(i>0){
i--;
if(classTypes[i]===RI$1){
count++;
}else
{
break;
}
}
if(count%2!==0){
return BREAK_NOT_ALLOWED$1;
}
}
// LB30b Do not break between an emoji base and an emoji modifier.
if(current===EB&&next===EM){
return BREAK_NOT_ALLOWED$1;
}
return BREAK_ALLOWED$1;
};
var cssFormattedClasses=function cssFormattedClasses(codePoints,options){
if(!options){
options={lineBreak:'normal',wordBreak:'normal'};
}
var _a=codePointsToCharacterClasses(codePoints,options.lineBreak),indicies=_a[0],classTypes=_a[1],isLetterNumber=_a[2];
if(options.wordBreak==='break-all'||options.wordBreak==='break-word'){
classTypes=classTypes.map(function(type){return [NU,AL,SA].indexOf(type)!==-1?ID:type;});
}
var forbiddenBreakpoints=options.wordBreak==='keep-all'?
isLetterNumber.map(function(letterNumber,i){
return letterNumber&&codePoints[i]>=0x4e00&&codePoints[i]<=0x9fff;
}):
undefined;
return [indicies,classTypes,forbiddenBreakpoints];
};
var Break=/** @class */function(){
function Break(codePoints,lineBreak,start,end){
this.codePoints=codePoints;
this.required=lineBreak===BREAK_MANDATORY;
this.start=start;
this.end=end;
}
Break.prototype.slice=function(){
return fromCodePoint$1.apply(void 0,this.codePoints.slice(this.start,this.end));
};
return Break;
}();
var LineBreaker=function LineBreaker(str,options){
var codePoints=toCodePoints$1(str);
var _a=cssFormattedClasses(codePoints,options),indicies=_a[0],classTypes=_a[1],forbiddenBreakpoints=_a[2];
var length=codePoints.length;
var lastEnd=0;
var nextIndex=0;
return {
next:function next(){
if(nextIndex>=length){
return {done:true,value:null};
}
var lineBreak=BREAK_NOT_ALLOWED$1;
while(nextIndex<length&&
(lineBreak=_lineBreakAtIndex(codePoints,classTypes,indicies,++nextIndex,forbiddenBreakpoints))===
BREAK_NOT_ALLOWED$1){}
if(lineBreak!==BREAK_NOT_ALLOWED$1||nextIndex===length){
var value=new Break(codePoints,lineBreak,lastEnd,nextIndex);
lastEnd=nextIndex;
return {value:value,done:false};
}
return {done:true,value:null};
}};

};

// https://www.w3.org/TR/css-syntax-3
var FLAG_UNRESTRICTED=1<<0;
var FLAG_ID=1<<1;
var FLAG_INTEGER=1<<2;
var FLAG_NUMBER=1<<3;
var LINE_FEED=0x000a;
var SOLIDUS=0x002f;
var REVERSE_SOLIDUS=0x005c;
var CHARACTER_TABULATION=0x0009;
var SPACE=0x0020;
var QUOTATION_MARK=0x0022;
var EQUALS_SIGN=0x003d;
var NUMBER_SIGN=0x0023;
var DOLLAR_SIGN=0x0024;
var PERCENTAGE_SIGN=0x0025;
var APOSTROPHE=0x0027;
var LEFT_PARENTHESIS=0x0028;
var RIGHT_PARENTHESIS=0x0029;
var LOW_LINE=0x005f;
var HYPHEN_MINUS=0x002d;
var EXCLAMATION_MARK=0x0021;
var LESS_THAN_SIGN=0x003c;
var GREATER_THAN_SIGN=0x003e;
var COMMERCIAL_AT=0x0040;
var LEFT_SQUARE_BRACKET=0x005b;
var RIGHT_SQUARE_BRACKET=0x005d;
var CIRCUMFLEX_ACCENT=0x003d;
var LEFT_CURLY_BRACKET=0x007b;
var QUESTION_MARK=0x003f;
var RIGHT_CURLY_BRACKET=0x007d;
var VERTICAL_LINE=0x007c;
var TILDE=0x007e;
var CONTROL=0x0080;
var REPLACEMENT_CHARACTER=0xfffd;
var ASTERISK=0x002a;
var PLUS_SIGN=0x002b;
var COMMA=0x002c;
var COLON=0x003a;
var SEMICOLON=0x003b;
var FULL_STOP=0x002e;
var NULL=0x0000;
var BACKSPACE=0x0008;
var LINE_TABULATION=0x000b;
var SHIFT_OUT=0x000e;
var INFORMATION_SEPARATOR_ONE=0x001f;
var DELETE=0x007f;
var EOF=-1;
var ZERO=0x0030;
var a=0x0061;
var e=0x0065;
var f=0x0066;
var u=0x0075;
var z=0x007a;
var A=0x0041;
var E=0x0045;
var F=0x0046;
var U=0x0055;
var Z=0x005a;
var isDigit=function isDigit(codePoint){return codePoint>=ZERO&&codePoint<=0x0039;};
var isSurrogateCodePoint=function isSurrogateCodePoint(codePoint){return codePoint>=0xd800&&codePoint<=0xdfff;};
var isHex=function isHex(codePoint){
return isDigit(codePoint)||codePoint>=A&&codePoint<=F||codePoint>=a&&codePoint<=f;
};
var isLowerCaseLetter=function isLowerCaseLetter(codePoint){return codePoint>=a&&codePoint<=z;};
var isUpperCaseLetter=function isUpperCaseLetter(codePoint){return codePoint>=A&&codePoint<=Z;};
var isLetter=function isLetter(codePoint){return isLowerCaseLetter(codePoint)||isUpperCaseLetter(codePoint);};
var isNonASCIICodePoint=function isNonASCIICodePoint(codePoint){return codePoint>=CONTROL;};
var isWhiteSpace=function isWhiteSpace(codePoint){
return codePoint===LINE_FEED||codePoint===CHARACTER_TABULATION||codePoint===SPACE;
};
var isNameStartCodePoint=function isNameStartCodePoint(codePoint){
return isLetter(codePoint)||isNonASCIICodePoint(codePoint)||codePoint===LOW_LINE;
};
var isNameCodePoint=function isNameCodePoint(codePoint){
return isNameStartCodePoint(codePoint)||isDigit(codePoint)||codePoint===HYPHEN_MINUS;
};
var isNonPrintableCodePoint=function isNonPrintableCodePoint(codePoint){
return codePoint>=NULL&&codePoint<=BACKSPACE||
codePoint===LINE_TABULATION||
codePoint>=SHIFT_OUT&&codePoint<=INFORMATION_SEPARATOR_ONE||
codePoint===DELETE;
};
var isValidEscape=function isValidEscape(c1,c2){
if(c1!==REVERSE_SOLIDUS){
return false;
}
return c2!==LINE_FEED;
};
var isIdentifierStart=function isIdentifierStart(c1,c2,c3){
if(c1===HYPHEN_MINUS){
return isNameStartCodePoint(c2)||isValidEscape(c2,c3);
}else
if(isNameStartCodePoint(c1)){
return true;
}else
if(c1===REVERSE_SOLIDUS&&isValidEscape(c1,c2)){
return true;
}
return false;
};
var isNumberStart=function isNumberStart(c1,c2,c3){
if(c1===PLUS_SIGN||c1===HYPHEN_MINUS){
if(isDigit(c2)){
return true;
}
return c2===FULL_STOP&&isDigit(c3);
}
if(c1===FULL_STOP){
return isDigit(c2);
}
return isDigit(c1);
};
var stringToNumber=function stringToNumber(codePoints){
var c=0;
var sign=1;
if(codePoints[c]===PLUS_SIGN||codePoints[c]===HYPHEN_MINUS){
if(codePoints[c]===HYPHEN_MINUS){
sign=-1;
}
c++;
}
var integers=[];
while(isDigit(codePoints[c])){
integers.push(codePoints[c++]);
}
var int=integers.length?parseInt(fromCodePoint$1.apply(void 0,integers),10):0;
if(codePoints[c]===FULL_STOP){
c++;
}
var fraction=[];
while(isDigit(codePoints[c])){
fraction.push(codePoints[c++]);
}
var fracd=fraction.length;
var frac=fracd?parseInt(fromCodePoint$1.apply(void 0,fraction),10):0;
if(codePoints[c]===E||codePoints[c]===e){
c++;
}
var expsign=1;
if(codePoints[c]===PLUS_SIGN||codePoints[c]===HYPHEN_MINUS){
if(codePoints[c]===HYPHEN_MINUS){
expsign=-1;
}
c++;
}
var exponent=[];
while(isDigit(codePoints[c])){
exponent.push(codePoints[c++]);
}
var exp=exponent.length?parseInt(fromCodePoint$1.apply(void 0,exponent),10):0;
return sign*(int+frac*Math.pow(10,-fracd))*Math.pow(10,expsign*exp);
};
var LEFT_PARENTHESIS_TOKEN={
type:2/* LEFT_PARENTHESIS_TOKEN */};

var RIGHT_PARENTHESIS_TOKEN={
type:3/* RIGHT_PARENTHESIS_TOKEN */};

var COMMA_TOKEN={type:4/* COMMA_TOKEN */};
var SUFFIX_MATCH_TOKEN={type:13/* SUFFIX_MATCH_TOKEN */};
var PREFIX_MATCH_TOKEN={type:8/* PREFIX_MATCH_TOKEN */};
var COLUMN_TOKEN={type:21/* COLUMN_TOKEN */};
var DASH_MATCH_TOKEN={type:9/* DASH_MATCH_TOKEN */};
var INCLUDE_MATCH_TOKEN={type:10/* INCLUDE_MATCH_TOKEN */};
var LEFT_CURLY_BRACKET_TOKEN={
type:11/* LEFT_CURLY_BRACKET_TOKEN */};

var RIGHT_CURLY_BRACKET_TOKEN={
type:12/* RIGHT_CURLY_BRACKET_TOKEN */};

var SUBSTRING_MATCH_TOKEN={type:14/* SUBSTRING_MATCH_TOKEN */};
var BAD_URL_TOKEN={type:23/* BAD_URL_TOKEN */};
var BAD_STRING_TOKEN={type:1/* BAD_STRING_TOKEN */};
var CDO_TOKEN={type:25/* CDO_TOKEN */};
var CDC_TOKEN={type:24/* CDC_TOKEN */};
var COLON_TOKEN={type:26/* COLON_TOKEN */};
var SEMICOLON_TOKEN={type:27/* SEMICOLON_TOKEN */};
var LEFT_SQUARE_BRACKET_TOKEN={
type:28/* LEFT_SQUARE_BRACKET_TOKEN */};

var RIGHT_SQUARE_BRACKET_TOKEN={
type:29/* RIGHT_SQUARE_BRACKET_TOKEN */};

var WHITESPACE_TOKEN={type:31/* WHITESPACE_TOKEN */};
var EOF_TOKEN={type:32/* EOF_TOKEN */};
var Tokenizer=/** @class */function(){
function Tokenizer(){
this._value=[];
}
Tokenizer.prototype.write=function(chunk){
this._value=this._value.concat(toCodePoints$1(chunk));
};
Tokenizer.prototype.read=function(){
var tokens=[];
var token=this.consumeToken();
while(token!==EOF_TOKEN){
tokens.push(token);
token=this.consumeToken();
}
return tokens;
};
Tokenizer.prototype.consumeToken=function(){
var codePoint=this.consumeCodePoint();
switch(codePoint){
case QUOTATION_MARK:
return this.consumeStringToken(QUOTATION_MARK);
case NUMBER_SIGN:
var c1=this.peekCodePoint(0);
var c2=this.peekCodePoint(1);
var c3=this.peekCodePoint(2);
if(isNameCodePoint(c1)||isValidEscape(c2,c3)){
var flags=isIdentifierStart(c1,c2,c3)?FLAG_ID:FLAG_UNRESTRICTED;
var value=this.consumeName();
return {type:5/* HASH_TOKEN */,value:value,flags:flags};
}
break;
case DOLLAR_SIGN:
if(this.peekCodePoint(0)===EQUALS_SIGN){
this.consumeCodePoint();
return SUFFIX_MATCH_TOKEN;
}
break;
case APOSTROPHE:
return this.consumeStringToken(APOSTROPHE);
case LEFT_PARENTHESIS:
return LEFT_PARENTHESIS_TOKEN;
case RIGHT_PARENTHESIS:
return RIGHT_PARENTHESIS_TOKEN;
case ASTERISK:
if(this.peekCodePoint(0)===EQUALS_SIGN){
this.consumeCodePoint();
return SUBSTRING_MATCH_TOKEN;
}
break;
case PLUS_SIGN:
if(isNumberStart(codePoint,this.peekCodePoint(0),this.peekCodePoint(1))){
this.reconsumeCodePoint(codePoint);
return this.consumeNumericToken();
}
break;
case COMMA:
return COMMA_TOKEN;
case HYPHEN_MINUS:
var e1=codePoint;
var e2=this.peekCodePoint(0);
var e3=this.peekCodePoint(1);
if(isNumberStart(e1,e2,e3)){
this.reconsumeCodePoint(codePoint);
return this.consumeNumericToken();
}
if(isIdentifierStart(e1,e2,e3)){
this.reconsumeCodePoint(codePoint);
return this.consumeIdentLikeToken();
}
if(e2===HYPHEN_MINUS&&e3===GREATER_THAN_SIGN){
this.consumeCodePoint();
this.consumeCodePoint();
return CDC_TOKEN;
}
break;
case FULL_STOP:
if(isNumberStart(codePoint,this.peekCodePoint(0),this.peekCodePoint(1))){
this.reconsumeCodePoint(codePoint);
return this.consumeNumericToken();
}
break;
case SOLIDUS:
if(this.peekCodePoint(0)===ASTERISK){
this.consumeCodePoint();
while(true){
var c=this.consumeCodePoint();
if(c===ASTERISK){
c=this.consumeCodePoint();
if(c===SOLIDUS){
return this.consumeToken();
}
}
if(c===EOF){
return this.consumeToken();
}
}
}
break;
case COLON:
return COLON_TOKEN;
case SEMICOLON:
return SEMICOLON_TOKEN;
case LESS_THAN_SIGN:
if(this.peekCodePoint(0)===EXCLAMATION_MARK&&
this.peekCodePoint(1)===HYPHEN_MINUS&&
this.peekCodePoint(2)===HYPHEN_MINUS){
this.consumeCodePoint();
this.consumeCodePoint();
return CDO_TOKEN;
}
break;
case COMMERCIAL_AT:
var a1=this.peekCodePoint(0);
var a2=this.peekCodePoint(1);
var a3=this.peekCodePoint(2);
if(isIdentifierStart(a1,a2,a3)){
var value=this.consumeName();
return {type:7/* AT_KEYWORD_TOKEN */,value:value};
}
break;
case LEFT_SQUARE_BRACKET:
return LEFT_SQUARE_BRACKET_TOKEN;
case REVERSE_SOLIDUS:
if(isValidEscape(codePoint,this.peekCodePoint(0))){
this.reconsumeCodePoint(codePoint);
return this.consumeIdentLikeToken();
}
break;
case RIGHT_SQUARE_BRACKET:
return RIGHT_SQUARE_BRACKET_TOKEN;
case CIRCUMFLEX_ACCENT:
if(this.peekCodePoint(0)===EQUALS_SIGN){
this.consumeCodePoint();
return PREFIX_MATCH_TOKEN;
}
break;
case LEFT_CURLY_BRACKET:
return LEFT_CURLY_BRACKET_TOKEN;
case RIGHT_CURLY_BRACKET:
return RIGHT_CURLY_BRACKET_TOKEN;
case u:
case U:
var u1=this.peekCodePoint(0);
var u2=this.peekCodePoint(1);
if(u1===PLUS_SIGN&&(isHex(u2)||u2===QUESTION_MARK)){
this.consumeCodePoint();
this.consumeUnicodeRangeToken();
}
this.reconsumeCodePoint(codePoint);
return this.consumeIdentLikeToken();
case VERTICAL_LINE:
if(this.peekCodePoint(0)===EQUALS_SIGN){
this.consumeCodePoint();
return DASH_MATCH_TOKEN;
}
if(this.peekCodePoint(0)===VERTICAL_LINE){
this.consumeCodePoint();
return COLUMN_TOKEN;
}
break;
case TILDE:
if(this.peekCodePoint(0)===EQUALS_SIGN){
this.consumeCodePoint();
return INCLUDE_MATCH_TOKEN;
}
break;
case EOF:
return EOF_TOKEN;}

if(isWhiteSpace(codePoint)){
this.consumeWhiteSpace();
return WHITESPACE_TOKEN;
}
if(isDigit(codePoint)){
this.reconsumeCodePoint(codePoint);
return this.consumeNumericToken();
}
if(isNameStartCodePoint(codePoint)){
this.reconsumeCodePoint(codePoint);
return this.consumeIdentLikeToken();
}
return {type:6/* DELIM_TOKEN */,value:fromCodePoint$1(codePoint)};
};
Tokenizer.prototype.consumeCodePoint=function(){
var value=this._value.shift();
return typeof value==='undefined'?-1:value;
};
Tokenizer.prototype.reconsumeCodePoint=function(codePoint){
this._value.unshift(codePoint);
};
Tokenizer.prototype.peekCodePoint=function(delta){
if(delta>=this._value.length){
return -1;
}
return this._value[delta];
};
Tokenizer.prototype.consumeUnicodeRangeToken=function(){
var digits=[];
var codePoint=this.consumeCodePoint();
while(isHex(codePoint)&&digits.length<6){
digits.push(codePoint);
codePoint=this.consumeCodePoint();
}
var questionMarks=false;
while(codePoint===QUESTION_MARK&&digits.length<6){
digits.push(codePoint);
codePoint=this.consumeCodePoint();
questionMarks=true;
}
if(questionMarks){
var start_1=parseInt(fromCodePoint$1.apply(void 0,digits.map(function(digit){return digit===QUESTION_MARK?ZERO:digit;})),16);
var end=parseInt(fromCodePoint$1.apply(void 0,digits.map(function(digit){return digit===QUESTION_MARK?F:digit;})),16);
return {type:30/* UNICODE_RANGE_TOKEN */,start:start_1,end:end};
}
var start=parseInt(fromCodePoint$1.apply(void 0,digits),16);
if(this.peekCodePoint(0)===HYPHEN_MINUS&&isHex(this.peekCodePoint(1))){
this.consumeCodePoint();
codePoint=this.consumeCodePoint();
var endDigits=[];
while(isHex(codePoint)&&endDigits.length<6){
endDigits.push(codePoint);
codePoint=this.consumeCodePoint();
}
var end=parseInt(fromCodePoint$1.apply(void 0,endDigits),16);
return {type:30/* UNICODE_RANGE_TOKEN */,start:start,end:end};
}else
{
return {type:30/* UNICODE_RANGE_TOKEN */,start:start,end:start};
}
};
Tokenizer.prototype.consumeIdentLikeToken=function(){
var value=this.consumeName();
if(value.toLowerCase()==='url'&&this.peekCodePoint(0)===LEFT_PARENTHESIS){
this.consumeCodePoint();
return this.consumeUrlToken();
}else
if(this.peekCodePoint(0)===LEFT_PARENTHESIS){
this.consumeCodePoint();
return {type:19/* FUNCTION_TOKEN */,value:value};
}
return {type:20/* IDENT_TOKEN */,value:value};
};
Tokenizer.prototype.consumeUrlToken=function(){
var value=[];
this.consumeWhiteSpace();
if(this.peekCodePoint(0)===EOF){
return {type:22/* URL_TOKEN */,value:''};
}
var next=this.peekCodePoint(0);
if(next===APOSTROPHE||next===QUOTATION_MARK){
var stringToken=this.consumeStringToken(this.consumeCodePoint());
if(stringToken.type===0/* STRING_TOKEN */){
this.consumeWhiteSpace();
if(this.peekCodePoint(0)===EOF||this.peekCodePoint(0)===RIGHT_PARENTHESIS){
this.consumeCodePoint();
return {type:22/* URL_TOKEN */,value:stringToken.value};
}
}
this.consumeBadUrlRemnants();
return BAD_URL_TOKEN;
}
while(true){
var codePoint=this.consumeCodePoint();
if(codePoint===EOF||codePoint===RIGHT_PARENTHESIS){
return {type:22/* URL_TOKEN */,value:fromCodePoint$1.apply(void 0,value)};
}else
if(isWhiteSpace(codePoint)){
this.consumeWhiteSpace();
if(this.peekCodePoint(0)===EOF||this.peekCodePoint(0)===RIGHT_PARENTHESIS){
this.consumeCodePoint();
return {type:22/* URL_TOKEN */,value:fromCodePoint$1.apply(void 0,value)};
}
this.consumeBadUrlRemnants();
return BAD_URL_TOKEN;
}else
if(codePoint===QUOTATION_MARK||
codePoint===APOSTROPHE||
codePoint===LEFT_PARENTHESIS||
isNonPrintableCodePoint(codePoint)){
this.consumeBadUrlRemnants();
return BAD_URL_TOKEN;
}else
if(codePoint===REVERSE_SOLIDUS){
if(isValidEscape(codePoint,this.peekCodePoint(0))){
value.push(this.consumeEscapedCodePoint());
}else
{
this.consumeBadUrlRemnants();
return BAD_URL_TOKEN;
}
}else
{
value.push(codePoint);
}
}
};
Tokenizer.prototype.consumeWhiteSpace=function(){
while(isWhiteSpace(this.peekCodePoint(0))){
this.consumeCodePoint();
}
};
Tokenizer.prototype.consumeBadUrlRemnants=function(){
while(true){
var codePoint=this.consumeCodePoint();
if(codePoint===RIGHT_PARENTHESIS||codePoint===EOF){
return;
}
if(isValidEscape(codePoint,this.peekCodePoint(0))){
this.consumeEscapedCodePoint();
}
}
};
Tokenizer.prototype.consumeStringSlice=function(count){
var SLICE_STACK_SIZE=50000;
var value='';
while(count>0){
var amount=Math.min(SLICE_STACK_SIZE,count);
value+=fromCodePoint$1.apply(void 0,this._value.splice(0,amount));
count-=amount;
}
this._value.shift();
return value;
};
Tokenizer.prototype.consumeStringToken=function(endingCodePoint){
var value='';
var i=0;
do{
var codePoint=this._value[i];
if(codePoint===EOF||codePoint===undefined||codePoint===endingCodePoint){
value+=this.consumeStringSlice(i);
return {type:0/* STRING_TOKEN */,value:value};
}
if(codePoint===LINE_FEED){
this._value.splice(0,i);
return BAD_STRING_TOKEN;
}
if(codePoint===REVERSE_SOLIDUS){
var next=this._value[i+1];
if(next!==EOF&&next!==undefined){
if(next===LINE_FEED){
value+=this.consumeStringSlice(i);
i=-1;
this._value.shift();
}else
if(isValidEscape(codePoint,next)){
value+=this.consumeStringSlice(i);
value+=fromCodePoint$1(this.consumeEscapedCodePoint());
i=-1;
}
}
}
i++;
}while(true);
};
Tokenizer.prototype.consumeNumber=function(){
var repr=[];
var type=FLAG_INTEGER;
var c1=this.peekCodePoint(0);
if(c1===PLUS_SIGN||c1===HYPHEN_MINUS){
repr.push(this.consumeCodePoint());
}
while(isDigit(this.peekCodePoint(0))){
repr.push(this.consumeCodePoint());
}
c1=this.peekCodePoint(0);
var c2=this.peekCodePoint(1);
if(c1===FULL_STOP&&isDigit(c2)){
repr.push(this.consumeCodePoint(),this.consumeCodePoint());
type=FLAG_NUMBER;
while(isDigit(this.peekCodePoint(0))){
repr.push(this.consumeCodePoint());
}
}
c1=this.peekCodePoint(0);
c2=this.peekCodePoint(1);
var c3=this.peekCodePoint(2);
if((c1===E||c1===e)&&((c2===PLUS_SIGN||c2===HYPHEN_MINUS)&&isDigit(c3)||isDigit(c2))){
repr.push(this.consumeCodePoint(),this.consumeCodePoint());
type=FLAG_NUMBER;
while(isDigit(this.peekCodePoint(0))){
repr.push(this.consumeCodePoint());
}
}
return [stringToNumber(repr),type];
};
Tokenizer.prototype.consumeNumericToken=function(){
var _a=this.consumeNumber(),number=_a[0],flags=_a[1];
var c1=this.peekCodePoint(0);
var c2=this.peekCodePoint(1);
var c3=this.peekCodePoint(2);
if(isIdentifierStart(c1,c2,c3)){
var unit=this.consumeName();
return {type:15/* DIMENSION_TOKEN */,number:number,flags:flags,unit:unit};
}
if(c1===PERCENTAGE_SIGN){
this.consumeCodePoint();
return {type:16/* PERCENTAGE_TOKEN */,number:number,flags:flags};
}
return {type:17/* NUMBER_TOKEN */,number:number,flags:flags};
};
Tokenizer.prototype.consumeEscapedCodePoint=function(){
var codePoint=this.consumeCodePoint();
if(isHex(codePoint)){
var hex=fromCodePoint$1(codePoint);
while(isHex(this.peekCodePoint(0))&&hex.length<6){
hex+=fromCodePoint$1(this.consumeCodePoint());
}
if(isWhiteSpace(this.peekCodePoint(0))){
this.consumeCodePoint();
}
var hexCodePoint=parseInt(hex,16);
if(hexCodePoint===0||isSurrogateCodePoint(hexCodePoint)||hexCodePoint>0x10ffff){
return REPLACEMENT_CHARACTER;
}
return hexCodePoint;
}
if(codePoint===EOF){
return REPLACEMENT_CHARACTER;
}
return codePoint;
};
Tokenizer.prototype.consumeName=function(){
var result='';
while(true){
var codePoint=this.consumeCodePoint();
if(isNameCodePoint(codePoint)){
result+=fromCodePoint$1(codePoint);
}else
if(isValidEscape(codePoint,this.peekCodePoint(0))){
result+=fromCodePoint$1(this.consumeEscapedCodePoint());
}else
{
this.reconsumeCodePoint(codePoint);
return result;
}
}
};
return Tokenizer;
}();

var Parser=/** @class */function(){
function Parser(tokens){
this._tokens=tokens;
}
Parser.create=function(value){
var tokenizer=new Tokenizer();
tokenizer.write(value);
return new Parser(tokenizer.read());
};
Parser.parseValue=function(value){
return Parser.create(value).parseComponentValue();
};
Parser.parseValues=function(value){
return Parser.create(value).parseComponentValues();
};
Parser.prototype.parseComponentValue=function(){
var token=this.consumeToken();
while(token.type===31/* WHITESPACE_TOKEN */){
token=this.consumeToken();
}
if(token.type===32/* EOF_TOKEN */){
throw new SyntaxError("Error parsing CSS component value, unexpected EOF");
}
this.reconsumeToken(token);
var value=this.consumeComponentValue();
do{
token=this.consumeToken();
}while(token.type===31/* WHITESPACE_TOKEN */);
if(token.type===32/* EOF_TOKEN */){
return value;
}
throw new SyntaxError("Error parsing CSS component value, multiple values found when expecting only one");
};
Parser.prototype.parseComponentValues=function(){
var values=[];
while(true){
var value=this.consumeComponentValue();
if(value.type===32/* EOF_TOKEN */){
return values;
}
values.push(value);
values.push();
}
};
Parser.prototype.consumeComponentValue=function(){
var token=this.consumeToken();
switch(token.type){
case 11/* LEFT_CURLY_BRACKET_TOKEN */:
case 28/* LEFT_SQUARE_BRACKET_TOKEN */:
case 2/* LEFT_PARENTHESIS_TOKEN */:
return this.consumeSimpleBlock(token.type);
case 19/* FUNCTION_TOKEN */:
return this.consumeFunction(token);}

return token;
};
Parser.prototype.consumeSimpleBlock=function(type){
var block={type:type,values:[]};
var token=this.consumeToken();
while(true){
if(token.type===32/* EOF_TOKEN */||isEndingTokenFor(token,type)){
return block;
}
this.reconsumeToken(token);
block.values.push(this.consumeComponentValue());
token=this.consumeToken();
}
};
Parser.prototype.consumeFunction=function(functionToken){
var cssFunction={
name:functionToken.value,
values:[],
type:18/* FUNCTION */};

while(true){
var token=this.consumeToken();
if(token.type===32/* EOF_TOKEN */||token.type===3/* RIGHT_PARENTHESIS_TOKEN */){
return cssFunction;
}
this.reconsumeToken(token);
cssFunction.values.push(this.consumeComponentValue());
}
};
Parser.prototype.consumeToken=function(){
var token=this._tokens.shift();
return typeof token==='undefined'?EOF_TOKEN:token;
};
Parser.prototype.reconsumeToken=function(token){
this._tokens.unshift(token);
};
return Parser;
}();
var isDimensionToken=function isDimensionToken(token){return token.type===15/* DIMENSION_TOKEN */;};
var isNumberToken=function isNumberToken(token){return token.type===17/* NUMBER_TOKEN */;};
var isIdentToken=function isIdentToken(token){return token.type===20/* IDENT_TOKEN */;};
var isStringToken=function isStringToken(token){return token.type===0/* STRING_TOKEN */;};
var isIdentWithValue=function isIdentWithValue(token,value){
return isIdentToken(token)&&token.value===value;
};
var nonWhiteSpace=function nonWhiteSpace(token){return token.type!==31/* WHITESPACE_TOKEN */;};
var nonFunctionArgSeparator=function nonFunctionArgSeparator(token){
return token.type!==31/* WHITESPACE_TOKEN */&&token.type!==4/* COMMA_TOKEN */;
};
var parseFunctionArgs=function parseFunctionArgs(tokens){
var args=[];
var arg=[];
tokens.forEach(function(token){
if(token.type===4/* COMMA_TOKEN */){
if(arg.length===0){
throw new Error("Error parsing function args, zero tokens for arg");
}
args.push(arg);
arg=[];
return;
}
if(token.type!==31/* WHITESPACE_TOKEN */){
arg.push(token);
}
});
if(arg.length){
args.push(arg);
}
return args;
};
var isEndingTokenFor=function isEndingTokenFor(token,type){
if(type===11/* LEFT_CURLY_BRACKET_TOKEN */&&token.type===12/* RIGHT_CURLY_BRACKET_TOKEN */){
return true;
}
if(type===28/* LEFT_SQUARE_BRACKET_TOKEN */&&token.type===29/* RIGHT_SQUARE_BRACKET_TOKEN */){
return true;
}
return type===2/* LEFT_PARENTHESIS_TOKEN */&&token.type===3/* RIGHT_PARENTHESIS_TOKEN */;
};

var isLength=function isLength(token){
return token.type===17/* NUMBER_TOKEN */||token.type===15/* DIMENSION_TOKEN */;
};

var isLengthPercentage=function isLengthPercentage(token){
return token.type===16/* PERCENTAGE_TOKEN */||isLength(token);
};
var parseLengthPercentageTuple=function parseLengthPercentageTuple(tokens){
return tokens.length>1?[tokens[0],tokens[1]]:[tokens[0]];
};
var ZERO_LENGTH={
type:17/* NUMBER_TOKEN */,
number:0,
flags:FLAG_INTEGER};

var FIFTY_PERCENT={
type:16/* PERCENTAGE_TOKEN */,
number:50,
flags:FLAG_INTEGER};

var HUNDRED_PERCENT={
type:16/* PERCENTAGE_TOKEN */,
number:100,
flags:FLAG_INTEGER};

var getAbsoluteValueForTuple=function getAbsoluteValueForTuple(tuple,width,height){
var x=tuple[0],y=tuple[1];
return [getAbsoluteValue(x,width),getAbsoluteValue(typeof y!=='undefined'?y:x,height)];
};
var getAbsoluteValue=function getAbsoluteValue(token,parent){
if(token.type===16/* PERCENTAGE_TOKEN */){
return token.number/100*parent;
}
if(isDimensionToken(token)){
switch(token.unit){
case'rem':
case'em':
return 16*token.number;// TODO use correct font-size
case'px':
default:
return token.number;}

}
return token.number;
};

var DEG='deg';
var GRAD='grad';
var RAD='rad';
var TURN='turn';
var angle={
name:'angle',
parse:function parse(_context,value){
if(value.type===15/* DIMENSION_TOKEN */){
switch(value.unit){
case DEG:
return Math.PI*value.number/180;
case GRAD:
return Math.PI/200*value.number;
case RAD:
return value.number;
case TURN:
return Math.PI*2*value.number;}

}
throw new Error("Unsupported angle type");
}};

var isAngle=function isAngle(value){
if(value.type===15/* DIMENSION_TOKEN */){
if(value.unit===DEG||value.unit===GRAD||value.unit===RAD||value.unit===TURN){
return true;
}
}
return false;
};
var parseNamedSide=function parseNamedSide(tokens){
var sideOrCorner=tokens.
filter(isIdentToken).
map(function(ident){return ident.value;}).
join(' ');
switch(sideOrCorner){
case'to bottom right':
case'to right bottom':
case'left top':
case'top left':
return [ZERO_LENGTH,ZERO_LENGTH];
case'to top':
case'bottom':
return deg(0);
case'to bottom left':
case'to left bottom':
case'right top':
case'top right':
return [ZERO_LENGTH,HUNDRED_PERCENT];
case'to right':
case'left':
return deg(90);
case'to top left':
case'to left top':
case'right bottom':
case'bottom right':
return [HUNDRED_PERCENT,HUNDRED_PERCENT];
case'to bottom':
case'top':
return deg(180);
case'to top right':
case'to right top':
case'left bottom':
case'bottom left':
return [HUNDRED_PERCENT,ZERO_LENGTH];
case'to left':
case'right':
return deg(270);}

return 0;
};
var deg=function deg(_deg){return Math.PI*_deg/180;};

var color$1={
name:'color',
parse:function parse(context,value){
if(value.type===18/* FUNCTION */){
var colorFunction=SUPPORTED_COLOR_FUNCTIONS[value.name];
if(typeof colorFunction==='undefined'){
throw new Error("Attempting to parse an unsupported color function \""+value.name+"\"");
}
return colorFunction(context,value.values);
}
if(value.type===5/* HASH_TOKEN */){
if(value.value.length===3){
var r=value.value.substring(0,1);
var g=value.value.substring(1,2);
var b=value.value.substring(2,3);
return pack(parseInt(r+r,16),parseInt(g+g,16),parseInt(b+b,16),1);
}
if(value.value.length===4){
var r=value.value.substring(0,1);
var g=value.value.substring(1,2);
var b=value.value.substring(2,3);
var a=value.value.substring(3,4);
return pack(parseInt(r+r,16),parseInt(g+g,16),parseInt(b+b,16),parseInt(a+a,16)/255);
}
if(value.value.length===6){
var r=value.value.substring(0,2);
var g=value.value.substring(2,4);
var b=value.value.substring(4,6);
return pack(parseInt(r,16),parseInt(g,16),parseInt(b,16),1);
}
if(value.value.length===8){
var r=value.value.substring(0,2);
var g=value.value.substring(2,4);
var b=value.value.substring(4,6);
var a=value.value.substring(6,8);
return pack(parseInt(r,16),parseInt(g,16),parseInt(b,16),parseInt(a,16)/255);
}
}
if(value.type===20/* IDENT_TOKEN */){
var namedColor=COLORS[value.value.toUpperCase()];
if(typeof namedColor!=='undefined'){
return namedColor;
}
}
return COLORS.TRANSPARENT;
}};

var isTransparent=function isTransparent(color){return (0xff&color)===0;};
var asString=function asString(color){
var alpha=0xff&color;
var blue=0xff&color>>8;
var green=0xff&color>>16;
var red=0xff&color>>24;
return alpha<255?"rgba("+red+","+green+","+blue+","+alpha/255+")":"rgb("+red+","+green+","+blue+")";
};
var pack=function pack(r,g,b,a){
return (r<<24|g<<16|b<<8|Math.round(a*255)<<0)>>>0;
};
var getTokenColorValue=function getTokenColorValue(token,i){
if(token.type===17/* NUMBER_TOKEN */){
return token.number;
}
if(token.type===16/* PERCENTAGE_TOKEN */){
var max=i===3?1:255;
return i===3?token.number/100*max:Math.round(token.number/100*max);
}
return 0;
};
var rgb=function rgb(_context,args){
var tokens=args.filter(nonFunctionArgSeparator);
if(tokens.length===3){
var _a=tokens.map(getTokenColorValue),r=_a[0],g=_a[1],b=_a[2];
return pack(r,g,b,1);
}
if(tokens.length===4){
var _b=tokens.map(getTokenColorValue),r=_b[0],g=_b[1],b=_b[2],a=_b[3];
return pack(r,g,b,a);
}
return 0;
};
function hue2rgb(t1,t2,hue){
if(hue<0){
hue+=1;
}
if(hue>=1){
hue-=1;
}
if(hue<1/6){
return (t2-t1)*hue*6+t1;
}else
if(hue<1/2){
return t2;
}else
if(hue<2/3){
return (t2-t1)*6*(2/3-hue)+t1;
}else
{
return t1;
}
}
var hsl=function hsl(context,args){
var tokens=args.filter(nonFunctionArgSeparator);
var hue=tokens[0],saturation=tokens[1],lightness=tokens[2],alpha=tokens[3];
var h=(hue.type===17/* NUMBER_TOKEN */?deg(hue.number):angle.parse(context,hue))/(Math.PI*2);
var s=isLengthPercentage(saturation)?saturation.number/100:0;
var l=isLengthPercentage(lightness)?lightness.number/100:0;
var a=typeof alpha!=='undefined'&&isLengthPercentage(alpha)?getAbsoluteValue(alpha,1):1;
if(s===0){
return pack(l*255,l*255,l*255,1);
}
var t2=l<=0.5?l*(s+1):l+s-l*s;
var t1=l*2-t2;
var r=hue2rgb(t1,t2,h+1/3);
var g=hue2rgb(t1,t2,h);
var b=hue2rgb(t1,t2,h-1/3);
return pack(r*255,g*255,b*255,a);
};
var SUPPORTED_COLOR_FUNCTIONS={
hsl:hsl,
hsla:hsl,
rgb:rgb,
rgba:rgb};

var parseColor=function parseColor(context,value){
return color$1.parse(context,Parser.create(value).parseComponentValue());
};
var COLORS={
ALICEBLUE:0xf0f8ffff,
ANTIQUEWHITE:0xfaebd7ff,
AQUA:0x00ffffff,
AQUAMARINE:0x7fffd4ff,
AZURE:0xf0ffffff,
BEIGE:0xf5f5dcff,
BISQUE:0xffe4c4ff,
BLACK:0x000000ff,
BLANCHEDALMOND:0xffebcdff,
BLUE:0x0000ffff,
BLUEVIOLET:0x8a2be2ff,
BROWN:0xa52a2aff,
BURLYWOOD:0xdeb887ff,
CADETBLUE:0x5f9ea0ff,
CHARTREUSE:0x7fff00ff,
CHOCOLATE:0xd2691eff,
CORAL:0xff7f50ff,
CORNFLOWERBLUE:0x6495edff,
CORNSILK:0xfff8dcff,
CRIMSON:0xdc143cff,
CYAN:0x00ffffff,
DARKBLUE:0x00008bff,
DARKCYAN:0x008b8bff,
DARKGOLDENROD:0xb886bbff,
DARKGRAY:0xa9a9a9ff,
DARKGREEN:0x006400ff,
DARKGREY:0xa9a9a9ff,
DARKKHAKI:0xbdb76bff,
DARKMAGENTA:0x8b008bff,
DARKOLIVEGREEN:0x556b2fff,
DARKORANGE:0xff8c00ff,
DARKORCHID:0x9932ccff,
DARKRED:0x8b0000ff,
DARKSALMON:0xe9967aff,
DARKSEAGREEN:0x8fbc8fff,
DARKSLATEBLUE:0x483d8bff,
DARKSLATEGRAY:0x2f4f4fff,
DARKSLATEGREY:0x2f4f4fff,
DARKTURQUOISE:0x00ced1ff,
DARKVIOLET:0x9400d3ff,
DEEPPINK:0xff1493ff,
DEEPSKYBLUE:0x00bfffff,
DIMGRAY:0x696969ff,
DIMGREY:0x696969ff,
DODGERBLUE:0x1e90ffff,
FIREBRICK:0xb22222ff,
FLORALWHITE:0xfffaf0ff,
FORESTGREEN:0x228b22ff,
FUCHSIA:0xff00ffff,
GAINSBORO:0xdcdcdcff,
GHOSTWHITE:0xf8f8ffff,
GOLD:0xffd700ff,
GOLDENROD:0xdaa520ff,
GRAY:0x808080ff,
GREEN:0x008000ff,
GREENYELLOW:0xadff2fff,
GREY:0x808080ff,
HONEYDEW:0xf0fff0ff,
HOTPINK:0xff69b4ff,
INDIANRED:0xcd5c5cff,
INDIGO:0x4b0082ff,
IVORY:0xfffff0ff,
KHAKI:0xf0e68cff,
LAVENDER:0xe6e6faff,
LAVENDERBLUSH:0xfff0f5ff,
LAWNGREEN:0x7cfc00ff,
LEMONCHIFFON:0xfffacdff,
LIGHTBLUE:0xadd8e6ff,
LIGHTCORAL:0xf08080ff,
LIGHTCYAN:0xe0ffffff,
LIGHTGOLDENRODYELLOW:0xfafad2ff,
LIGHTGRAY:0xd3d3d3ff,
LIGHTGREEN:0x90ee90ff,
LIGHTGREY:0xd3d3d3ff,
LIGHTPINK:0xffb6c1ff,
LIGHTSALMON:0xffa07aff,
LIGHTSEAGREEN:0x20b2aaff,
LIGHTSKYBLUE:0x87cefaff,
LIGHTSLATEGRAY:0x778899ff,
LIGHTSLATEGREY:0x778899ff,
LIGHTSTEELBLUE:0xb0c4deff,
LIGHTYELLOW:0xffffe0ff,
LIME:0x00ff00ff,
LIMEGREEN:0x32cd32ff,
LINEN:0xfaf0e6ff,
MAGENTA:0xff00ffff,
MAROON:0x800000ff,
MEDIUMAQUAMARINE:0x66cdaaff,
MEDIUMBLUE:0x0000cdff,
MEDIUMORCHID:0xba55d3ff,
MEDIUMPURPLE:0x9370dbff,
MEDIUMSEAGREEN:0x3cb371ff,
MEDIUMSLATEBLUE:0x7b68eeff,
MEDIUMSPRINGGREEN:0x00fa9aff,
MEDIUMTURQUOISE:0x48d1ccff,
MEDIUMVIOLETRED:0xc71585ff,
MIDNIGHTBLUE:0x191970ff,
MINTCREAM:0xf5fffaff,
MISTYROSE:0xffe4e1ff,
MOCCASIN:0xffe4b5ff,
NAVAJOWHITE:0xffdeadff,
NAVY:0x000080ff,
OLDLACE:0xfdf5e6ff,
OLIVE:0x808000ff,
OLIVEDRAB:0x6b8e23ff,
ORANGE:0xffa500ff,
ORANGERED:0xff4500ff,
ORCHID:0xda70d6ff,
PALEGOLDENROD:0xeee8aaff,
PALEGREEN:0x98fb98ff,
PALETURQUOISE:0xafeeeeff,
PALEVIOLETRED:0xdb7093ff,
PAPAYAWHIP:0xffefd5ff,
PEACHPUFF:0xffdab9ff,
PERU:0xcd853fff,
PINK:0xffc0cbff,
PLUM:0xdda0ddff,
POWDERBLUE:0xb0e0e6ff,
PURPLE:0x800080ff,
REBECCAPURPLE:0x663399ff,
RED:0xff0000ff,
ROSYBROWN:0xbc8f8fff,
ROYALBLUE:0x4169e1ff,
SADDLEBROWN:0x8b4513ff,
SALMON:0xfa8072ff,
SANDYBROWN:0xf4a460ff,
SEAGREEN:0x2e8b57ff,
SEASHELL:0xfff5eeff,
SIENNA:0xa0522dff,
SILVER:0xc0c0c0ff,
SKYBLUE:0x87ceebff,
SLATEBLUE:0x6a5acdff,
SLATEGRAY:0x708090ff,
SLATEGREY:0x708090ff,
SNOW:0xfffafaff,
SPRINGGREEN:0x00ff7fff,
STEELBLUE:0x4682b4ff,
TAN:0xd2b48cff,
TEAL:0x008080ff,
THISTLE:0xd8bfd8ff,
TOMATO:0xff6347ff,
TRANSPARENT:0x00000000,
TURQUOISE:0x40e0d0ff,
VIOLET:0xee82eeff,
WHEAT:0xf5deb3ff,
WHITE:0xffffffff,
WHITESMOKE:0xf5f5f5ff,
YELLOW:0xffff00ff,
YELLOWGREEN:0x9acd32ff};


var backgroundClip={
name:'background-clip',
initialValue:'border-box',
prefix:false,
type:1/* LIST */,
parse:function parse(_context,tokens){
return tokens.map(function(token){
if(isIdentToken(token)){
switch(token.value){
case'padding-box':
return 1/* PADDING_BOX */;
case'content-box':
return 2/* CONTENT_BOX */;}

}
return 0/* BORDER_BOX */;
});
}};


var backgroundColor={
name:"background-color",
initialValue:'transparent',
prefix:false,
type:3/* TYPE_VALUE */,
format:'color'};


var parseColorStop=function parseColorStop(context,args){
var color=color$1.parse(context,args[0]);
var stop=args[1];
return stop&&isLengthPercentage(stop)?{color:color,stop:stop}:{color:color,stop:null};
};
var processColorStops=function processColorStops(stops,lineLength){
var first=stops[0];
var last=stops[stops.length-1];
if(first.stop===null){
first.stop=ZERO_LENGTH;
}
if(last.stop===null){
last.stop=HUNDRED_PERCENT;
}
var processStops=[];
var previous=0;
for(var i=0;i<stops.length;i++){
var stop_1=stops[i].stop;
if(stop_1!==null){
var absoluteValue=getAbsoluteValue(stop_1,lineLength);
if(absoluteValue>previous){
processStops.push(absoluteValue);
}else
{
processStops.push(previous);
}
previous=absoluteValue;
}else
{
processStops.push(null);
}
}
var gapBegin=null;
for(var i=0;i<processStops.length;i++){
var stop_2=processStops[i];
if(stop_2===null){
if(gapBegin===null){
gapBegin=i;
}
}else
if(gapBegin!==null){
var gapLength=i-gapBegin;
var beforeGap=processStops[gapBegin-1];
var gapValue=(stop_2-beforeGap)/(gapLength+1);
for(var g=1;g<=gapLength;g++){
processStops[gapBegin+g-1]=gapValue*g;
}
gapBegin=null;
}
}
return stops.map(function(_a,i){
var color=_a.color;
return {color:color,stop:Math.max(Math.min(1,processStops[i]/lineLength),0)};
});
};
var getAngleFromCorner=function getAngleFromCorner(corner,width,height){
var centerX=width/2;
var centerY=height/2;
var x=getAbsoluteValue(corner[0],width)-centerX;
var y=centerY-getAbsoluteValue(corner[1],height);
return (Math.atan2(y,x)+Math.PI*2)%(Math.PI*2);
};
var calculateGradientDirection=function calculateGradientDirection(angle,width,height){
var radian=typeof angle==='number'?angle:getAngleFromCorner(angle,width,height);
var lineLength=Math.abs(width*Math.sin(radian))+Math.abs(height*Math.cos(radian));
var halfWidth=width/2;
var halfHeight=height/2;
var halfLineLength=lineLength/2;
var yDiff=Math.sin(radian-Math.PI/2)*halfLineLength;
var xDiff=Math.cos(radian-Math.PI/2)*halfLineLength;
return [lineLength,halfWidth-xDiff,halfWidth+xDiff,halfHeight-yDiff,halfHeight+yDiff];
};
var distance=function distance(a,b){return Math.sqrt(a*a+b*b);};
var findCorner=function findCorner(width,height,x,y,closest){
var corners=[
[0,0],
[0,height],
[width,0],
[width,height]];

return corners.reduce(function(stat,corner){
var cx=corner[0],cy=corner[1];
var d=distance(x-cx,y-cy);
if(closest?d<stat.optimumDistance:d>stat.optimumDistance){
return {
optimumCorner:corner,
optimumDistance:d};

}
return stat;
},{
optimumDistance:closest?Infinity:-Infinity,
optimumCorner:null}).
optimumCorner;
};
var calculateRadius=function calculateRadius(gradient,x,y,width,height){
var rx=0;
var ry=0;
switch(gradient.size){
case 0/* CLOSEST_SIDE */:
// The ending shape is sized so that that it exactly meets the side of the gradient box closest to the gradient’s center.
// If the shape is an ellipse, it exactly meets the closest side in each dimension.
if(gradient.shape===0/* CIRCLE */){
rx=ry=Math.min(Math.abs(x),Math.abs(x-width),Math.abs(y),Math.abs(y-height));
}else
if(gradient.shape===1/* ELLIPSE */){
rx=Math.min(Math.abs(x),Math.abs(x-width));
ry=Math.min(Math.abs(y),Math.abs(y-height));
}
break;
case 2/* CLOSEST_CORNER */:
// The ending shape is sized so that that it passes through the corner of the gradient box closest to the gradient’s center.
// If the shape is an ellipse, the ending shape is given the same aspect-ratio it would have if closest-side were specified.
if(gradient.shape===0/* CIRCLE */){
rx=ry=Math.min(distance(x,y),distance(x,y-height),distance(x-width,y),distance(x-width,y-height));
}else
if(gradient.shape===1/* ELLIPSE */){
// Compute the ratio ry/rx (which is to be the same as for "closest-side")
var c=Math.min(Math.abs(y),Math.abs(y-height))/Math.min(Math.abs(x),Math.abs(x-width));
var _a=findCorner(width,height,x,y,true),cx=_a[0],cy=_a[1];
rx=distance(cx-x,(cy-y)/c);
ry=c*rx;
}
break;
case 1/* FARTHEST_SIDE */:
// Same as closest-side, except the ending shape is sized based on the farthest side(s)
if(gradient.shape===0/* CIRCLE */){
rx=ry=Math.max(Math.abs(x),Math.abs(x-width),Math.abs(y),Math.abs(y-height));
}else
if(gradient.shape===1/* ELLIPSE */){
rx=Math.max(Math.abs(x),Math.abs(x-width));
ry=Math.max(Math.abs(y),Math.abs(y-height));
}
break;
case 3/* FARTHEST_CORNER */:
// Same as closest-corner, except the ending shape is sized based on the farthest corner.
// If the shape is an ellipse, the ending shape is given the same aspect ratio it would have if farthest-side were specified.
if(gradient.shape===0/* CIRCLE */){
rx=ry=Math.max(distance(x,y),distance(x,y-height),distance(x-width,y),distance(x-width,y-height));
}else
if(gradient.shape===1/* ELLIPSE */){
// Compute the ratio ry/rx (which is to be the same as for "farthest-side")
var c=Math.max(Math.abs(y),Math.abs(y-height))/Math.max(Math.abs(x),Math.abs(x-width));
var _b=findCorner(width,height,x,y,false),cx=_b[0],cy=_b[1];
rx=distance(cx-x,(cy-y)/c);
ry=c*rx;
}
break;}

if(Array.isArray(gradient.size)){
rx=getAbsoluteValue(gradient.size[0],width);
ry=gradient.size.length===2?getAbsoluteValue(gradient.size[1],height):rx;
}
return [rx,ry];
};

var linearGradient=function linearGradient(context,tokens){
var angle$1=deg(180);
var stops=[];
parseFunctionArgs(tokens).forEach(function(arg,i){
if(i===0){
var firstToken=arg[0];
if(firstToken.type===20/* IDENT_TOKEN */&&firstToken.value==='to'){
angle$1=parseNamedSide(arg);
return;
}else
if(isAngle(firstToken)){
angle$1=angle.parse(context,firstToken);
return;
}
}
var colorStop=parseColorStop(context,arg);
stops.push(colorStop);
});
return {angle:angle$1,stops:stops,type:1/* LINEAR_GRADIENT */};
};

var prefixLinearGradient=function prefixLinearGradient(context,tokens){
var angle$1=deg(180);
var stops=[];
parseFunctionArgs(tokens).forEach(function(arg,i){
if(i===0){
var firstToken=arg[0];
if(firstToken.type===20/* IDENT_TOKEN */&&
['top','left','right','bottom'].indexOf(firstToken.value)!==-1){
angle$1=parseNamedSide(arg);
return;
}else
if(isAngle(firstToken)){
angle$1=(angle.parse(context,firstToken)+deg(270))%deg(360);
return;
}
}
var colorStop=parseColorStop(context,arg);
stops.push(colorStop);
});
return {
angle:angle$1,
stops:stops,
type:1/* LINEAR_GRADIENT */};

};

var webkitGradient=function webkitGradient(context,tokens){
var angle=deg(180);
var stops=[];
var type=1/* LINEAR_GRADIENT */;
var shape=0/* CIRCLE */;
var size=3/* FARTHEST_CORNER */;
var position=[];
parseFunctionArgs(tokens).forEach(function(arg,i){
var firstToken=arg[0];
if(i===0){
if(isIdentToken(firstToken)&&firstToken.value==='linear'){
type=1/* LINEAR_GRADIENT */;
return;
}else
if(isIdentToken(firstToken)&&firstToken.value==='radial'){
type=2/* RADIAL_GRADIENT */;
return;
}
}
if(firstToken.type===18/* FUNCTION */){
if(firstToken.name==='from'){
var color=color$1.parse(context,firstToken.values[0]);
stops.push({stop:ZERO_LENGTH,color:color});
}else
if(firstToken.name==='to'){
var color=color$1.parse(context,firstToken.values[0]);
stops.push({stop:HUNDRED_PERCENT,color:color});
}else
if(firstToken.name==='color-stop'){
var values=firstToken.values.filter(nonFunctionArgSeparator);
if(values.length===2){
var color=color$1.parse(context,values[1]);
var stop_1=values[0];
if(isNumberToken(stop_1)){
stops.push({
stop:{type:16/* PERCENTAGE_TOKEN */,number:stop_1.number*100,flags:stop_1.flags},
color:color});

}
}
}
}
});
return type===1/* LINEAR_GRADIENT */?
{
angle:(angle+deg(180))%deg(360),
stops:stops,
type:type}:

{size:size,shape:shape,stops:stops,position:position,type:type};
};

var CLOSEST_SIDE='closest-side';
var FARTHEST_SIDE='farthest-side';
var CLOSEST_CORNER='closest-corner';
var FARTHEST_CORNER='farthest-corner';
var CIRCLE='circle';
var ELLIPSE='ellipse';
var COVER='cover';
var CONTAIN='contain';
var radialGradient=function radialGradient(context,tokens){
var shape=0/* CIRCLE */;
var size=3/* FARTHEST_CORNER */;
var stops=[];
var position=[];
parseFunctionArgs(tokens).forEach(function(arg,i){
var isColorStop=true;
if(i===0){
var isAtPosition_1=false;
isColorStop=arg.reduce(function(acc,token){
if(isAtPosition_1){
if(isIdentToken(token)){
switch(token.value){
case'center':
position.push(FIFTY_PERCENT);
return acc;
case'top':
case'left':
position.push(ZERO_LENGTH);
return acc;
case'right':
case'bottom':
position.push(HUNDRED_PERCENT);
return acc;}

}else
if(isLengthPercentage(token)||isLength(token)){
position.push(token);
}
}else
if(isIdentToken(token)){
switch(token.value){
case CIRCLE:
shape=0/* CIRCLE */;
return false;
case ELLIPSE:
shape=1/* ELLIPSE */;
return false;
case'at':
isAtPosition_1=true;
return false;
case CLOSEST_SIDE:
size=0/* CLOSEST_SIDE */;
return false;
case COVER:
case FARTHEST_SIDE:
size=1/* FARTHEST_SIDE */;
return false;
case CONTAIN:
case CLOSEST_CORNER:
size=2/* CLOSEST_CORNER */;
return false;
case FARTHEST_CORNER:
size=3/* FARTHEST_CORNER */;
return false;}

}else
if(isLength(token)||isLengthPercentage(token)){
if(!Array.isArray(size)){
size=[];
}
size.push(token);
return false;
}
return acc;
},isColorStop);
}
if(isColorStop){
var colorStop=parseColorStop(context,arg);
stops.push(colorStop);
}
});
return {size:size,shape:shape,stops:stops,position:position,type:2/* RADIAL_GRADIENT */};
};

var prefixRadialGradient=function prefixRadialGradient(context,tokens){
var shape=0/* CIRCLE */;
var size=3/* FARTHEST_CORNER */;
var stops=[];
var position=[];
parseFunctionArgs(tokens).forEach(function(arg,i){
var isColorStop=true;
if(i===0){
isColorStop=arg.reduce(function(acc,token){
if(isIdentToken(token)){
switch(token.value){
case'center':
position.push(FIFTY_PERCENT);
return false;
case'top':
case'left':
position.push(ZERO_LENGTH);
return false;
case'right':
case'bottom':
position.push(HUNDRED_PERCENT);
return false;}

}else
if(isLengthPercentage(token)||isLength(token)){
position.push(token);
return false;
}
return acc;
},isColorStop);
}else
if(i===1){
isColorStop=arg.reduce(function(acc,token){
if(isIdentToken(token)){
switch(token.value){
case CIRCLE:
shape=0/* CIRCLE */;
return false;
case ELLIPSE:
shape=1/* ELLIPSE */;
return false;
case CONTAIN:
case CLOSEST_SIDE:
size=0/* CLOSEST_SIDE */;
return false;
case FARTHEST_SIDE:
size=1/* FARTHEST_SIDE */;
return false;
case CLOSEST_CORNER:
size=2/* CLOSEST_CORNER */;
return false;
case COVER:
case FARTHEST_CORNER:
size=3/* FARTHEST_CORNER */;
return false;}

}else
if(isLength(token)||isLengthPercentage(token)){
if(!Array.isArray(size)){
size=[];
}
size.push(token);
return false;
}
return acc;
},isColorStop);
}
if(isColorStop){
var colorStop=parseColorStop(context,arg);
stops.push(colorStop);
}
});
return {size:size,shape:shape,stops:stops,position:position,type:2/* RADIAL_GRADIENT */};
};

var isLinearGradient=function isLinearGradient(background){
return background.type===1/* LINEAR_GRADIENT */;
};
var isRadialGradient=function isRadialGradient(background){
return background.type===2/* RADIAL_GRADIENT */;
};
var image={
name:'image',
parse:function parse(context,value){
if(value.type===22/* URL_TOKEN */){
var image_1={url:value.value,type:0/* URL */};
context.cache.addImage(value.value);
return image_1;
}
if(value.type===18/* FUNCTION */){
var imageFunction=SUPPORTED_IMAGE_FUNCTIONS[value.name];
if(typeof imageFunction==='undefined'){
throw new Error("Attempting to parse an unsupported image function \""+value.name+"\"");
}
return imageFunction(context,value.values);
}
throw new Error("Unsupported image type "+value.type);
}};

function isSupportedImage(value){
return !(value.type===20/* IDENT_TOKEN */&&value.value==='none')&&(
value.type!==18/* FUNCTION */||!!SUPPORTED_IMAGE_FUNCTIONS[value.name]);
}
var SUPPORTED_IMAGE_FUNCTIONS={
'linear-gradient':linearGradient,
'-moz-linear-gradient':prefixLinearGradient,
'-ms-linear-gradient':prefixLinearGradient,
'-o-linear-gradient':prefixLinearGradient,
'-webkit-linear-gradient':prefixLinearGradient,
'radial-gradient':radialGradient,
'-moz-radial-gradient':prefixRadialGradient,
'-ms-radial-gradient':prefixRadialGradient,
'-o-radial-gradient':prefixRadialGradient,
'-webkit-radial-gradient':prefixRadialGradient,
'-webkit-gradient':webkitGradient};


var backgroundImage={
name:'background-image',
initialValue:'none',
type:1/* LIST */,
prefix:false,
parse:function parse(context,tokens){
if(tokens.length===0){
return [];
}
var first=tokens[0];
if(first.type===20/* IDENT_TOKEN */&&first.value==='none'){
return [];
}
return tokens.
filter(function(value){return nonFunctionArgSeparator(value)&&isSupportedImage(value);}).
map(function(value){return image.parse(context,value);});
}};


var backgroundOrigin={
name:'background-origin',
initialValue:'border-box',
prefix:false,
type:1/* LIST */,
parse:function parse(_context,tokens){
return tokens.map(function(token){
if(isIdentToken(token)){
switch(token.value){
case'padding-box':
return 1/* PADDING_BOX */;
case'content-box':
return 2/* CONTENT_BOX */;}

}
return 0/* BORDER_BOX */;
});
}};


var backgroundPosition={
name:'background-position',
initialValue:'0% 0%',
type:1/* LIST */,
prefix:false,
parse:function parse(_context,tokens){
return parseFunctionArgs(tokens).
map(function(values){return values.filter(isLengthPercentage);}).
map(parseLengthPercentageTuple);
}};


var backgroundRepeat={
name:'background-repeat',
initialValue:'repeat',
prefix:false,
type:1/* LIST */,
parse:function parse(_context,tokens){
return parseFunctionArgs(tokens).
map(function(values){
return values.
filter(isIdentToken).
map(function(token){return token.value;}).
join(' ');
}).
map(parseBackgroundRepeat);
}};

var parseBackgroundRepeat=function parseBackgroundRepeat(value){
switch(value){
case'no-repeat':
return 1/* NO_REPEAT */;
case'repeat-x':
case'repeat no-repeat':
return 2/* REPEAT_X */;
case'repeat-y':
case'no-repeat repeat':
return 3/* REPEAT_Y */;
case'repeat':
default:
return 0/* REPEAT */;}

};

var BACKGROUND_SIZE;
(function(BACKGROUND_SIZE){
BACKGROUND_SIZE["AUTO"]="auto";
BACKGROUND_SIZE["CONTAIN"]="contain";
BACKGROUND_SIZE["COVER"]="cover";
})(BACKGROUND_SIZE||(BACKGROUND_SIZE={}));
var backgroundSize={
name:'background-size',
initialValue:'0',
prefix:false,
type:1/* LIST */,
parse:function parse(_context,tokens){
return parseFunctionArgs(tokens).map(function(values){return values.filter(isBackgroundSizeInfoToken);});
}};

var isBackgroundSizeInfoToken=function isBackgroundSizeInfoToken(value){
return isIdentToken(value)||isLengthPercentage(value);
};

var borderColorForSide=function borderColorForSide(side){return {
name:"border-"+side+"-color",
initialValue:'transparent',
prefix:false,
type:3/* TYPE_VALUE */,
format:'color'};
};
var borderTopColor=borderColorForSide('top');
var borderRightColor=borderColorForSide('right');
var borderBottomColor=borderColorForSide('bottom');
var borderLeftColor=borderColorForSide('left');

var borderRadiusForSide=function borderRadiusForSide(side){return {
name:"border-radius-"+side,
initialValue:'0 0',
prefix:false,
type:1/* LIST */,
parse:function parse(_context,tokens){
return parseLengthPercentageTuple(tokens.filter(isLengthPercentage));
}};
};
var borderTopLeftRadius=borderRadiusForSide('top-left');
var borderTopRightRadius=borderRadiusForSide('top-right');
var borderBottomRightRadius=borderRadiusForSide('bottom-right');
var borderBottomLeftRadius=borderRadiusForSide('bottom-left');

var borderStyleForSide=function borderStyleForSide(side){return {
name:"border-"+side+"-style",
initialValue:'solid',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,style){
switch(style){
case'none':
return 0/* NONE */;
case'dashed':
return 2/* DASHED */;
case'dotted':
return 3/* DOTTED */;
case'double':
return 4/* DOUBLE */;}

return 1/* SOLID */;
}};
};
var borderTopStyle=borderStyleForSide('top');
var borderRightStyle=borderStyleForSide('right');
var borderBottomStyle=borderStyleForSide('bottom');
var borderLeftStyle=borderStyleForSide('left');

var borderWidthForSide=function borderWidthForSide(side){return {
name:"border-"+side+"-width",
initialValue:'0',
type:0/* VALUE */,
prefix:false,
parse:function parse(_context,token){
if(isDimensionToken(token)){
return token.number;
}
return 0;
}};
};
var borderTopWidth=borderWidthForSide('top');
var borderRightWidth=borderWidthForSide('right');
var borderBottomWidth=borderWidthForSide('bottom');
var borderLeftWidth=borderWidthForSide('left');

var color={
name:"color",
initialValue:'transparent',
prefix:false,
type:3/* TYPE_VALUE */,
format:'color'};


var direction={
name:'direction',
initialValue:'ltr',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,direction){
switch(direction){
case'rtl':
return 1/* RTL */;
case'ltr':
default:
return 0/* LTR */;}

}};


var display={
name:'display',
initialValue:'inline-block',
prefix:false,
type:1/* LIST */,
parse:function parse(_context,tokens){
return tokens.filter(isIdentToken).reduce(function(bit,token){
return bit|parseDisplayValue(token.value);
},0/* NONE */);
}};

var parseDisplayValue=function parseDisplayValue(display){
switch(display){
case'block':
case'-webkit-box':
return 2/* BLOCK */;
case'inline':
return 4/* INLINE */;
case'run-in':
return 8/* RUN_IN */;
case'flow':
return 16/* FLOW */;
case'flow-root':
return 32/* FLOW_ROOT */;
case'table':
return 64/* TABLE */;
case'flex':
case'-webkit-flex':
return 128/* FLEX */;
case'grid':
case'-ms-grid':
return 256/* GRID */;
case'ruby':
return 512/* RUBY */;
case'subgrid':
return 1024/* SUBGRID */;
case'list-item':
return 2048/* LIST_ITEM */;
case'table-row-group':
return 4096/* TABLE_ROW_GROUP */;
case'table-header-group':
return 8192/* TABLE_HEADER_GROUP */;
case'table-footer-group':
return 16384/* TABLE_FOOTER_GROUP */;
case'table-row':
return 32768/* TABLE_ROW */;
case'table-cell':
return 65536/* TABLE_CELL */;
case'table-column-group':
return 131072/* TABLE_COLUMN_GROUP */;
case'table-column':
return 262144/* TABLE_COLUMN */;
case'table-caption':
return 524288/* TABLE_CAPTION */;
case'ruby-base':
return 1048576/* RUBY_BASE */;
case'ruby-text':
return 2097152/* RUBY_TEXT */;
case'ruby-base-container':
return 4194304/* RUBY_BASE_CONTAINER */;
case'ruby-text-container':
return 8388608/* RUBY_TEXT_CONTAINER */;
case'contents':
return 16777216/* CONTENTS */;
case'inline-block':
return 33554432/* INLINE_BLOCK */;
case'inline-list-item':
return 67108864/* INLINE_LIST_ITEM */;
case'inline-table':
return 134217728/* INLINE_TABLE */;
case'inline-flex':
return 268435456/* INLINE_FLEX */;
case'inline-grid':
return 536870912/* INLINE_GRID */;}

return 0/* NONE */;
};

var float={
name:'float',
initialValue:'none',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,float){
switch(float){
case'left':
return 1/* LEFT */;
case'right':
return 2/* RIGHT */;
case'inline-start':
return 3/* INLINE_START */;
case'inline-end':
return 4/* INLINE_END */;}

return 0/* NONE */;
}};


var letterSpacing={
name:'letter-spacing',
initialValue:'0',
prefix:false,
type:0/* VALUE */,
parse:function parse(_context,token){
if(token.type===20/* IDENT_TOKEN */&&token.value==='normal'){
return 0;
}
if(token.type===17/* NUMBER_TOKEN */){
return token.number;
}
if(token.type===15/* DIMENSION_TOKEN */){
return token.number;
}
return 0;
}};


var LINE_BREAK;
(function(LINE_BREAK){
LINE_BREAK["NORMAL"]="normal";
LINE_BREAK["STRICT"]="strict";
})(LINE_BREAK||(LINE_BREAK={}));
var lineBreak={
name:'line-break',
initialValue:'normal',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,lineBreak){
switch(lineBreak){
case'strict':
return LINE_BREAK.STRICT;
case'normal':
default:
return LINE_BREAK.NORMAL;}

}};


var lineHeight={
name:'line-height',
initialValue:'normal',
prefix:false,
type:4/* TOKEN_VALUE */};

var computeLineHeight=function computeLineHeight(token,fontSize){
if(isIdentToken(token)&&token.value==='normal'){
return 1.2*fontSize;
}else
if(token.type===17/* NUMBER_TOKEN */){
return fontSize*token.number;
}else
if(isLengthPercentage(token)){
return getAbsoluteValue(token,fontSize);
}
return fontSize;
};

var listStyleImage={
name:'list-style-image',
initialValue:'none',
type:0/* VALUE */,
prefix:false,
parse:function parse(context,token){
if(token.type===20/* IDENT_TOKEN */&&token.value==='none'){
return null;
}
return image.parse(context,token);
}};


var listStylePosition={
name:'list-style-position',
initialValue:'outside',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,position){
switch(position){
case'inside':
return 0/* INSIDE */;
case'outside':
default:
return 1/* OUTSIDE */;}

}};


var listStyleType={
name:'list-style-type',
initialValue:'none',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,type){
switch(type){
case'disc':
return 0/* DISC */;
case'circle':
return 1/* CIRCLE */;
case'square':
return 2/* SQUARE */;
case'decimal':
return 3/* DECIMAL */;
case'cjk-decimal':
return 4/* CJK_DECIMAL */;
case'decimal-leading-zero':
return 5/* DECIMAL_LEADING_ZERO */;
case'lower-roman':
return 6/* LOWER_ROMAN */;
case'upper-roman':
return 7/* UPPER_ROMAN */;
case'lower-greek':
return 8/* LOWER_GREEK */;
case'lower-alpha':
return 9/* LOWER_ALPHA */;
case'upper-alpha':
return 10/* UPPER_ALPHA */;
case'arabic-indic':
return 11/* ARABIC_INDIC */;
case'armenian':
return 12/* ARMENIAN */;
case'bengali':
return 13/* BENGALI */;
case'cambodian':
return 14/* CAMBODIAN */;
case'cjk-earthly-branch':
return 15/* CJK_EARTHLY_BRANCH */;
case'cjk-heavenly-stem':
return 16/* CJK_HEAVENLY_STEM */;
case'cjk-ideographic':
return 17/* CJK_IDEOGRAPHIC */;
case'devanagari':
return 18/* DEVANAGARI */;
case'ethiopic-numeric':
return 19/* ETHIOPIC_NUMERIC */;
case'georgian':
return 20/* GEORGIAN */;
case'gujarati':
return 21/* GUJARATI */;
case'gurmukhi':
return 22/* GURMUKHI */;
case'hebrew':
return 22/* HEBREW */;
case'hiragana':
return 23/* HIRAGANA */;
case'hiragana-iroha':
return 24/* HIRAGANA_IROHA */;
case'japanese-formal':
return 25/* JAPANESE_FORMAL */;
case'japanese-informal':
return 26/* JAPANESE_INFORMAL */;
case'kannada':
return 27/* KANNADA */;
case'katakana':
return 28/* KATAKANA */;
case'katakana-iroha':
return 29/* KATAKANA_IROHA */;
case'khmer':
return 30/* KHMER */;
case'korean-hangul-formal':
return 31/* KOREAN_HANGUL_FORMAL */;
case'korean-hanja-formal':
return 32/* KOREAN_HANJA_FORMAL */;
case'korean-hanja-informal':
return 33/* KOREAN_HANJA_INFORMAL */;
case'lao':
return 34/* LAO */;
case'lower-armenian':
return 35/* LOWER_ARMENIAN */;
case'malayalam':
return 36/* MALAYALAM */;
case'mongolian':
return 37/* MONGOLIAN */;
case'myanmar':
return 38/* MYANMAR */;
case'oriya':
return 39/* ORIYA */;
case'persian':
return 40/* PERSIAN */;
case'simp-chinese-formal':
return 41/* SIMP_CHINESE_FORMAL */;
case'simp-chinese-informal':
return 42/* SIMP_CHINESE_INFORMAL */;
case'tamil':
return 43/* TAMIL */;
case'telugu':
return 44/* TELUGU */;
case'thai':
return 45/* THAI */;
case'tibetan':
return 46/* TIBETAN */;
case'trad-chinese-formal':
return 47/* TRAD_CHINESE_FORMAL */;
case'trad-chinese-informal':
return 48/* TRAD_CHINESE_INFORMAL */;
case'upper-armenian':
return 49/* UPPER_ARMENIAN */;
case'disclosure-open':
return 50/* DISCLOSURE_OPEN */;
case'disclosure-closed':
return 51/* DISCLOSURE_CLOSED */;
case'none':
default:
return -1/* NONE */;}

}};


var marginForSide=function marginForSide(side){return {
name:"margin-"+side,
initialValue:'0',
prefix:false,
type:4/* TOKEN_VALUE */};
};
var marginTop=marginForSide('top');
var marginRight=marginForSide('right');
var marginBottom=marginForSide('bottom');
var marginLeft=marginForSide('left');

var overflow={
name:'overflow',
initialValue:'visible',
prefix:false,
type:1/* LIST */,
parse:function parse(_context,tokens){
return tokens.filter(isIdentToken).map(function(overflow){
switch(overflow.value){
case'hidden':
return 1/* HIDDEN */;
case'scroll':
return 2/* SCROLL */;
case'clip':
return 3/* CLIP */;
case'auto':
return 4/* AUTO */;
case'visible':
default:
return 0/* VISIBLE */;}

});
}};


var overflowWrap={
name:'overflow-wrap',
initialValue:'normal',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,overflow){
switch(overflow){
case'break-word':
return "break-word"/* BREAK_WORD */;
case'normal':
default:
return "normal"/* NORMAL */;}

}};


var paddingForSide=function paddingForSide(side){return {
name:"padding-"+side,
initialValue:'0',
prefix:false,
type:3/* TYPE_VALUE */,
format:'length-percentage'};
};
var paddingTop=paddingForSide('top');
var paddingRight=paddingForSide('right');
var paddingBottom=paddingForSide('bottom');
var paddingLeft=paddingForSide('left');

var textAlign={
name:'text-align',
initialValue:'left',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,textAlign){
switch(textAlign){
case'right':
return 2/* RIGHT */;
case'center':
case'justify':
return 1/* CENTER */;
case'left':
default:
return 0/* LEFT */;}

}};


var position={
name:'position',
initialValue:'static',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,position){
switch(position){
case'relative':
return 1/* RELATIVE */;
case'absolute':
return 2/* ABSOLUTE */;
case'fixed':
return 3/* FIXED */;
case'sticky':
return 4/* STICKY */;}

return 0/* STATIC */;
}};


var textShadow={
name:'text-shadow',
initialValue:'none',
type:1/* LIST */,
prefix:false,
parse:function parse(context,tokens){
if(tokens.length===1&&isIdentWithValue(tokens[0],'none')){
return [];
}
return parseFunctionArgs(tokens).map(function(values){
var shadow={
color:COLORS.TRANSPARENT,
offsetX:ZERO_LENGTH,
offsetY:ZERO_LENGTH,
blur:ZERO_LENGTH};

var c=0;
for(var i=0;i<values.length;i++){
var token=values[i];
if(isLength(token)){
if(c===0){
shadow.offsetX=token;
}else
if(c===1){
shadow.offsetY=token;
}else
{
shadow.blur=token;
}
c++;
}else
{
shadow.color=color$1.parse(context,token);
}
}
return shadow;
});
}};


var textTransform={
name:'text-transform',
initialValue:'none',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,textTransform){
switch(textTransform){
case'uppercase':
return 2/* UPPERCASE */;
case'lowercase':
return 1/* LOWERCASE */;
case'capitalize':
return 3/* CAPITALIZE */;}

return 0/* NONE */;
}};


var transform$1={
name:'transform',
initialValue:'none',
prefix:true,
type:0/* VALUE */,
parse:function parse(_context,token){
if(token.type===20/* IDENT_TOKEN */&&token.value==='none'){
return null;
}
if(token.type===18/* FUNCTION */){
var transformFunction=SUPPORTED_TRANSFORM_FUNCTIONS[token.name];
if(typeof transformFunction==='undefined'){
throw new Error("Attempting to parse an unsupported transform function \""+token.name+"\"");
}
return transformFunction(token.values);
}
return null;
}};

var matrix=function matrix(args){
var values=args.filter(function(arg){return arg.type===17/* NUMBER_TOKEN */;}).map(function(arg){return arg.number;});
return values.length===6?values:null;
};
// doesn't support 3D transforms at the moment
var matrix3d=function matrix3d(args){
var values=args.filter(function(arg){return arg.type===17/* NUMBER_TOKEN */;}).map(function(arg){return arg.number;});
var a1=values[0],b1=values[1];values[2];values[3];var a2=values[4],b2=values[5];values[6];values[7];values[8];values[9];values[10];values[11];var a4=values[12],b4=values[13];values[14];values[15];
return values.length===16?[a1,b1,a2,b2,a4,b4]:null;
};
var SUPPORTED_TRANSFORM_FUNCTIONS={
matrix:matrix,
matrix3d:matrix3d};


var DEFAULT_VALUE={
type:16/* PERCENTAGE_TOKEN */,
number:50,
flags:FLAG_INTEGER};

var DEFAULT=[DEFAULT_VALUE,DEFAULT_VALUE];
var transformOrigin={
name:'transform-origin',
initialValue:'50% 50%',
prefix:true,
type:1/* LIST */,
parse:function parse(_context,tokens){
var origins=tokens.filter(isLengthPercentage);
if(origins.length!==2){
return DEFAULT;
}
return [origins[0],origins[1]];
}};


var visibility={
name:'visible',
initialValue:'none',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,visibility){
switch(visibility){
case'hidden':
return 1/* HIDDEN */;
case'collapse':
return 2/* COLLAPSE */;
case'visible':
default:
return 0/* VISIBLE */;}

}};


var WORD_BREAK;
(function(WORD_BREAK){
WORD_BREAK["NORMAL"]="normal";
WORD_BREAK["BREAK_ALL"]="break-all";
WORD_BREAK["KEEP_ALL"]="keep-all";
})(WORD_BREAK||(WORD_BREAK={}));
var wordBreak={
name:'word-break',
initialValue:'normal',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,wordBreak){
switch(wordBreak){
case'break-all':
return WORD_BREAK.BREAK_ALL;
case'keep-all':
return WORD_BREAK.KEEP_ALL;
case'normal':
default:
return WORD_BREAK.NORMAL;}

}};


var zIndex={
name:'z-index',
initialValue:'auto',
prefix:false,
type:0/* VALUE */,
parse:function parse(_context,token){
if(token.type===20/* IDENT_TOKEN */){
return {auto:true,order:0};
}
if(isNumberToken(token)){
return {auto:false,order:token.number};
}
throw new Error("Invalid z-index number parsed");
}};


var time={
name:'time',
parse:function parse(_context,value){
if(value.type===15/* DIMENSION_TOKEN */){
switch(value.unit.toLowerCase()){
case's':
return 1000*value.number;
case'ms':
return value.number;}

}
throw new Error("Unsupported time type");
}};


var opacity={
name:'opacity',
initialValue:'1',
type:0/* VALUE */,
prefix:false,
parse:function parse(_context,token){
if(isNumberToken(token)){
return token.number;
}
return 1;
}};


var textDecorationColor={
name:"text-decoration-color",
initialValue:'transparent',
prefix:false,
type:3/* TYPE_VALUE */,
format:'color'};


var textDecorationLine={
name:'text-decoration-line',
initialValue:'none',
prefix:false,
type:1/* LIST */,
parse:function parse(_context,tokens){
return tokens.
filter(isIdentToken).
map(function(token){
switch(token.value){
case'underline':
return 1/* UNDERLINE */;
case'overline':
return 2/* OVERLINE */;
case'line-through':
return 3/* LINE_THROUGH */;
case'none':
return 4/* BLINK */;}

return 0/* NONE */;
}).
filter(function(line){return line!==0/* NONE */;});
}};


var fontFamily={
name:"font-family",
initialValue:'',
prefix:false,
type:1/* LIST */,
parse:function parse(_context,tokens){
var accumulator=[];
var results=[];
tokens.forEach(function(token){
switch(token.type){
case 20/* IDENT_TOKEN */:
case 0/* STRING_TOKEN */:
accumulator.push(token.value);
break;
case 17/* NUMBER_TOKEN */:
accumulator.push(token.number.toString());
break;
case 4/* COMMA_TOKEN */:
results.push(accumulator.join(' '));
accumulator.length=0;
break;}

});
if(accumulator.length){
results.push(accumulator.join(' '));
}
return results.map(function(result){return result.indexOf(' ')===-1?result:"'"+result+"'";});
}};


var fontSize={
name:"font-size",
initialValue:'0',
prefix:false,
type:3/* TYPE_VALUE */,
format:'length'};


var fontWeight={
name:'font-weight',
initialValue:'normal',
type:0/* VALUE */,
prefix:false,
parse:function parse(_context,token){
if(isNumberToken(token)){
return token.number;
}
if(isIdentToken(token)){
switch(token.value){
case'bold':
return 700;
case'normal':
default:
return 400;}

}
return 400;
}};


var fontVariant={
name:'font-variant',
initialValue:'none',
type:1/* LIST */,
prefix:false,
parse:function parse(_context,tokens){
return tokens.filter(isIdentToken).map(function(token){return token.value;});
}};


var fontStyle={
name:'font-style',
initialValue:'normal',
prefix:false,
type:2/* IDENT_VALUE */,
parse:function parse(_context,overflow){
switch(overflow){
case'oblique':
return "oblique"/* OBLIQUE */;
case'italic':
return "italic"/* ITALIC */;
case'normal':
default:
return "normal"/* NORMAL */;}

}};


var contains=function contains(bit,value){return (bit&value)!==0;};

var content={
name:'content',
initialValue:'none',
type:1/* LIST */,
prefix:false,
parse:function parse(_context,tokens){
if(tokens.length===0){
return [];
}
var first=tokens[0];
if(first.type===20/* IDENT_TOKEN */&&first.value==='none'){
return [];
}
return tokens;
}};


var counterIncrement={
name:'counter-increment',
initialValue:'none',
prefix:true,
type:1/* LIST */,
parse:function parse(_context,tokens){
if(tokens.length===0){
return null;
}
var first=tokens[0];
if(first.type===20/* IDENT_TOKEN */&&first.value==='none'){
return null;
}
var increments=[];
var filtered=tokens.filter(nonWhiteSpace);
for(var i=0;i<filtered.length;i++){
var counter=filtered[i];
var next=filtered[i+1];
if(counter.type===20/* IDENT_TOKEN */){
var increment=next&&isNumberToken(next)?next.number:1;
increments.push({counter:counter.value,increment:increment});
}
}
return increments;
}};


var counterReset={
name:'counter-reset',
initialValue:'none',
prefix:true,
type:1/* LIST */,
parse:function parse(_context,tokens){
if(tokens.length===0){
return [];
}
var resets=[];
var filtered=tokens.filter(nonWhiteSpace);
for(var i=0;i<filtered.length;i++){
var counter=filtered[i];
var next=filtered[i+1];
if(isIdentToken(counter)&&counter.value!=='none'){
var reset=next&&isNumberToken(next)?next.number:0;
resets.push({counter:counter.value,reset:reset});
}
}
return resets;
}};


var duration={
name:'duration',
initialValue:'0s',
prefix:false,
type:1/* LIST */,
parse:function parse(context,tokens){
return tokens.filter(isDimensionToken).map(function(token){return time.parse(context,token);});
}};


var quotes={
name:'quotes',
initialValue:'none',
prefix:true,
type:1/* LIST */,
parse:function parse(_context,tokens){
if(tokens.length===0){
return null;
}
var first=tokens[0];
if(first.type===20/* IDENT_TOKEN */&&first.value==='none'){
return null;
}
var quotes=[];
var filtered=tokens.filter(isStringToken);
if(filtered.length%2!==0){
return null;
}
for(var i=0;i<filtered.length;i+=2){
var open_1=filtered[i].value;
var close_1=filtered[i+1].value;
quotes.push({open:open_1,close:close_1});
}
return quotes;
}};

var getQuote=function getQuote(quotes,depth,open){
if(!quotes){
return '';
}
var quote=quotes[Math.min(depth,quotes.length-1)];
if(!quote){
return '';
}
return open?quote.open:quote.close;
};

var boxShadow={
name:'box-shadow',
initialValue:'none',
type:1/* LIST */,
prefix:false,
parse:function parse(context,tokens){
if(tokens.length===1&&isIdentWithValue(tokens[0],'none')){
return [];
}
return parseFunctionArgs(tokens).map(function(values){
var shadow={
color:0x000000ff,
offsetX:ZERO_LENGTH,
offsetY:ZERO_LENGTH,
blur:ZERO_LENGTH,
spread:ZERO_LENGTH,
inset:false};

var c=0;
for(var i=0;i<values.length;i++){
var token=values[i];
if(isIdentWithValue(token,'inset')){
shadow.inset=true;
}else
if(isLength(token)){
if(c===0){
shadow.offsetX=token;
}else
if(c===1){
shadow.offsetY=token;
}else
if(c===2){
shadow.blur=token;
}else
{
shadow.spread=token;
}
c++;
}else
{
shadow.color=color$1.parse(context,token);
}
}
return shadow;
});
}};


var paintOrder={
name:'paint-order',
initialValue:'normal',
prefix:false,
type:1/* LIST */,
parse:function parse(_context,tokens){
var DEFAULT_VALUE=[0/* FILL */,1/* STROKE */,2/* MARKERS */];
var layers=[];
tokens.filter(isIdentToken).forEach(function(token){
switch(token.value){
case'stroke':
layers.push(1/* STROKE */);
break;
case'fill':
layers.push(0/* FILL */);
break;
case'markers':
layers.push(2/* MARKERS */);
break;}

});
DEFAULT_VALUE.forEach(function(value){
if(layers.indexOf(value)===-1){
layers.push(value);
}
});
return layers;
}};


var webkitTextStrokeColor={
name:"-webkit-text-stroke-color",
initialValue:'currentcolor',
prefix:false,
type:3/* TYPE_VALUE */,
format:'color'};


var webkitTextStrokeWidth={
name:"-webkit-text-stroke-width",
initialValue:'0',
type:0/* VALUE */,
prefix:false,
parse:function parse(_context,token){
if(isDimensionToken(token)){
return token.number;
}
return 0;
}};


var CSSParsedDeclaration=/** @class */function(){
function CSSParsedDeclaration(context,declaration){
var _a,_b;
this.animationDuration=parse(context,duration,declaration.animationDuration);
this.backgroundClip=parse(context,backgroundClip,declaration.backgroundClip);
this.backgroundColor=parse(context,backgroundColor,declaration.backgroundColor);
this.backgroundImage=parse(context,backgroundImage,declaration.backgroundImage);
this.backgroundOrigin=parse(context,backgroundOrigin,declaration.backgroundOrigin);
this.backgroundPosition=parse(context,backgroundPosition,declaration.backgroundPosition);
this.backgroundRepeat=parse(context,backgroundRepeat,declaration.backgroundRepeat);
this.backgroundSize=parse(context,backgroundSize,declaration.backgroundSize);
this.borderTopColor=parse(context,borderTopColor,declaration.borderTopColor);
this.borderRightColor=parse(context,borderRightColor,declaration.borderRightColor);
this.borderBottomColor=parse(context,borderBottomColor,declaration.borderBottomColor);
this.borderLeftColor=parse(context,borderLeftColor,declaration.borderLeftColor);
this.borderTopLeftRadius=parse(context,borderTopLeftRadius,declaration.borderTopLeftRadius);
this.borderTopRightRadius=parse(context,borderTopRightRadius,declaration.borderTopRightRadius);
this.borderBottomRightRadius=parse(context,borderBottomRightRadius,declaration.borderBottomRightRadius);
this.borderBottomLeftRadius=parse(context,borderBottomLeftRadius,declaration.borderBottomLeftRadius);
this.borderTopStyle=parse(context,borderTopStyle,declaration.borderTopStyle);
this.borderRightStyle=parse(context,borderRightStyle,declaration.borderRightStyle);
this.borderBottomStyle=parse(context,borderBottomStyle,declaration.borderBottomStyle);
this.borderLeftStyle=parse(context,borderLeftStyle,declaration.borderLeftStyle);
this.borderTopWidth=parse(context,borderTopWidth,declaration.borderTopWidth);
this.borderRightWidth=parse(context,borderRightWidth,declaration.borderRightWidth);
this.borderBottomWidth=parse(context,borderBottomWidth,declaration.borderBottomWidth);
this.borderLeftWidth=parse(context,borderLeftWidth,declaration.borderLeftWidth);
this.boxShadow=parse(context,boxShadow,declaration.boxShadow);
this.color=parse(context,color,declaration.color);
this.direction=parse(context,direction,declaration.direction);
this.display=parse(context,display,declaration.display);
this.float=parse(context,float,declaration.cssFloat);
this.fontFamily=parse(context,fontFamily,declaration.fontFamily);
this.fontSize=parse(context,fontSize,declaration.fontSize);
this.fontStyle=parse(context,fontStyle,declaration.fontStyle);
this.fontVariant=parse(context,fontVariant,declaration.fontVariant);
this.fontWeight=parse(context,fontWeight,declaration.fontWeight);
this.letterSpacing=parse(context,letterSpacing,declaration.letterSpacing);
this.lineBreak=parse(context,lineBreak,declaration.lineBreak);
this.lineHeight=parse(context,lineHeight,declaration.lineHeight);
this.listStyleImage=parse(context,listStyleImage,declaration.listStyleImage);
this.listStylePosition=parse(context,listStylePosition,declaration.listStylePosition);
this.listStyleType=parse(context,listStyleType,declaration.listStyleType);
this.marginTop=parse(context,marginTop,declaration.marginTop);
this.marginRight=parse(context,marginRight,declaration.marginRight);
this.marginBottom=parse(context,marginBottom,declaration.marginBottom);
this.marginLeft=parse(context,marginLeft,declaration.marginLeft);
this.opacity=parse(context,opacity,declaration.opacity);
var overflowTuple=parse(context,overflow,declaration.overflow);
this.overflowX=overflowTuple[0];
this.overflowY=overflowTuple[overflowTuple.length>1?1:0];
this.overflowWrap=parse(context,overflowWrap,declaration.overflowWrap);
this.paddingTop=parse(context,paddingTop,declaration.paddingTop);
this.paddingRight=parse(context,paddingRight,declaration.paddingRight);
this.paddingBottom=parse(context,paddingBottom,declaration.paddingBottom);
this.paddingLeft=parse(context,paddingLeft,declaration.paddingLeft);
this.paintOrder=parse(context,paintOrder,declaration.paintOrder);
this.position=parse(context,position,declaration.position);
this.textAlign=parse(context,textAlign,declaration.textAlign);
this.textDecorationColor=parse(context,textDecorationColor,(_a=declaration.textDecorationColor)!==null&&_a!==void 0?_a:declaration.color);
this.textDecorationLine=parse(context,textDecorationLine,(_b=declaration.textDecorationLine)!==null&&_b!==void 0?_b:declaration.textDecoration);
this.textShadow=parse(context,textShadow,declaration.textShadow);
this.textTransform=parse(context,textTransform,declaration.textTransform);
this.transform=parse(context,transform$1,declaration.transform);
this.transformOrigin=parse(context,transformOrigin,declaration.transformOrigin);
this.visibility=parse(context,visibility,declaration.visibility);
this.webkitTextStrokeColor=parse(context,webkitTextStrokeColor,declaration.webkitTextStrokeColor);
this.webkitTextStrokeWidth=parse(context,webkitTextStrokeWidth,declaration.webkitTextStrokeWidth);
this.wordBreak=parse(context,wordBreak,declaration.wordBreak);
this.zIndex=parse(context,zIndex,declaration.zIndex);
}
CSSParsedDeclaration.prototype.isVisible=function(){
return this.display>0&&this.opacity>0&&this.visibility===0/* VISIBLE */;
};
CSSParsedDeclaration.prototype.isTransparent=function(){
return isTransparent(this.backgroundColor);
};
CSSParsedDeclaration.prototype.isTransformed=function(){
return this.transform!==null;
};
CSSParsedDeclaration.prototype.isPositioned=function(){
return this.position!==0/* STATIC */;
};
CSSParsedDeclaration.prototype.isPositionedWithZIndex=function(){
return this.isPositioned()&&!this.zIndex.auto;
};
CSSParsedDeclaration.prototype.isFloating=function(){
return this.float!==0/* NONE */;
};
CSSParsedDeclaration.prototype.isInlineLevel=function(){
return contains(this.display,4/* INLINE */)||
contains(this.display,33554432/* INLINE_BLOCK */)||
contains(this.display,268435456/* INLINE_FLEX */)||
contains(this.display,536870912/* INLINE_GRID */)||
contains(this.display,67108864/* INLINE_LIST_ITEM */)||
contains(this.display,134217728/* INLINE_TABLE */);
};
return CSSParsedDeclaration;
}();
var CSSParsedPseudoDeclaration=/** @class */function(){
function CSSParsedPseudoDeclaration(context,declaration){
this.content=parse(context,content,declaration.content);
this.quotes=parse(context,quotes,declaration.quotes);
}
return CSSParsedPseudoDeclaration;
}();
var CSSParsedCounterDeclaration=/** @class */function(){
function CSSParsedCounterDeclaration(context,declaration){
this.counterIncrement=parse(context,counterIncrement,declaration.counterIncrement);
this.counterReset=parse(context,counterReset,declaration.counterReset);
}
return CSSParsedCounterDeclaration;
}();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var parse=function parse(context,descriptor,style){
var tokenizer=new Tokenizer();
var value=style!==null&&typeof style!=='undefined'?style.toString():descriptor.initialValue;
tokenizer.write(value);
var parser=new Parser(tokenizer.read());
switch(descriptor.type){
case 2/* IDENT_VALUE */:
var token=parser.parseComponentValue();
return descriptor.parse(context,isIdentToken(token)?token.value:descriptor.initialValue);
case 0/* VALUE */:
return descriptor.parse(context,parser.parseComponentValue());
case 1/* LIST */:
return descriptor.parse(context,parser.parseComponentValues());
case 4/* TOKEN_VALUE */:
return parser.parseComponentValue();
case 3/* TYPE_VALUE */:
switch(descriptor.format){
case'angle':
return angle.parse(context,parser.parseComponentValue());
case'color':
return color$1.parse(context,parser.parseComponentValue());
case'image':
return image.parse(context,parser.parseComponentValue());
case'length':
var length_1=parser.parseComponentValue();
return isLength(length_1)?length_1:ZERO_LENGTH;
case'length-percentage':
var value_1=parser.parseComponentValue();
return isLengthPercentage(value_1)?value_1:ZERO_LENGTH;
case'time':
return time.parse(context,parser.parseComponentValue());}

break;}

};

var elementDebuggerAttribute='data-html2canvas-debug';
var getElementDebugType=function getElementDebugType(element){
var attribute=element.getAttribute(elementDebuggerAttribute);
switch(attribute){
case'all':
return 1/* ALL */;
case'clone':
return 2/* CLONE */;
case'parse':
return 3/* PARSE */;
case'render':
return 4/* RENDER */;
default:
return 0/* NONE */;}

};
var isDebugging=function isDebugging(element,type){
var elementType=getElementDebugType(element);
return elementType===1/* ALL */||type===elementType;
};

var ElementContainer=/** @class */function(){
function ElementContainer(context,element){
this.context=context;
this.textNodes=[];
this.elements=[];
this.flags=0;
if(isDebugging(element,3/* PARSE */)){
debugger;
}
this.styles=new CSSParsedDeclaration(context,window.getComputedStyle(element,null));
if(isHTMLElementNode(element)){
if(this.styles.animationDuration.some(function(duration){return duration>0;})){
element.style.animationDuration='0s';
}
if(this.styles.transform!==null){
// getBoundingClientRect takes transforms into account
element.style.transform='none';
}
}
this.bounds=parseBounds(this.context,element);
if(isDebugging(element,4/* RENDER */)){
this.flags|=16/* DEBUG_RENDER */;
}
}
return ElementContainer;
}();

/*
     * text-segmentation 1.0.3 <https://github.com/niklasvh/text-segmentation>
     * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
var base64='AAAAAAAAAAAAEA4AGBkAAFAaAAACAAAAAAAIABAAGAAwADgACAAQAAgAEAAIABAACAAQAAgAEAAIABAACAAQAAgAEAAIABAAQABIAEQATAAIABAACAAQAAgAEAAIABAAVABcAAgAEAAIABAACAAQAGAAaABwAHgAgACIAI4AlgAIABAAmwCjAKgAsAC2AL4AvQDFAMoA0gBPAVYBWgEIAAgACACMANoAYgFkAWwBdAF8AX0BhQGNAZUBlgGeAaMBlQGWAasBswF8AbsBwwF0AcsBYwHTAQgA2wG/AOMBdAF8AekB8QF0AfkB+wHiAHQBfAEIAAMC5gQIAAsCEgIIAAgAFgIeAggAIgIpAggAMQI5AkACygEIAAgASAJQAlgCYAIIAAgACAAKBQoFCgUTBRMFGQUrBSsFCAAIAAgACAAIAAgACAAIAAgACABdAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABoAmgCrwGvAQgAbgJ2AggAHgEIAAgACADnAXsCCAAIAAgAgwIIAAgACAAIAAgACACKAggAkQKZAggAPADJAAgAoQKkAqwCsgK6AsICCADJAggA0AIIAAgACAAIANYC3gIIAAgACAAIAAgACABAAOYCCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAkASoB+QIEAAgACAA8AEMCCABCBQgACABJBVAFCAAIAAgACAAIAAgACAAIAAgACABTBVoFCAAIAFoFCABfBWUFCAAIAAgACAAIAAgAbQUIAAgACAAIAAgACABzBXsFfQWFBYoFigWKBZEFigWKBYoFmAWfBaYFrgWxBbkFCAAIAAgACAAIAAgACAAIAAgACAAIAMEFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAMgFCADQBQgACAAIAAgACAAIAAgACAAIAAgACAAIAO4CCAAIAAgAiQAIAAgACABAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAD0AggACAD8AggACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIANYFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAMDvwAIAAgAJAIIAAgACAAIAAgACAAIAAgACwMTAwgACAB9BOsEGwMjAwgAKwMyAwsFYgE3A/MEPwMIAEUDTQNRAwgAWQOsAGEDCAAIAAgACAAIAAgACABpAzQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFIQUoBSwFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABtAwgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABMAEwACAAIAAgACAAIABgACAAIAAgACAC/AAgACAAyAQgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACACAAIAAwAAgACAAIAAgACAAIAAgACAAIAAAARABIAAgACAAIABQASAAIAAgAIABwAEAAjgCIABsAqAC2AL0AigDQAtwC+IJIQqVAZUBWQqVAZUBlQGVAZUBlQGrC5UBlQGVAZUBlQGVAZUBlQGVAXsKlQGVAbAK6wsrDGUMpQzlDJUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAfAKAAuZA64AtwCJALoC6ADwAAgAuACgA/oEpgO6AqsD+AAIAAgAswMIAAgACAAIAIkAuwP5AfsBwwPLAwgACAAIAAgACADRA9kDCAAIAOED6QMIAAgACAAIAAgACADuA/YDCAAIAP4DyQAIAAgABgQIAAgAXQAOBAgACAAIAAgACAAIABMECAAIAAgACAAIAAgACAD8AAQBCAAIAAgAGgQiBCoECAExBAgAEAEIAAgACAAIAAgACAAIAAgACAAIAAgACAA4BAgACABABEYECAAIAAgATAQYAQgAVAQIAAgACAAIAAgACAAIAAgACAAIAFoECAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAOQEIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAB+BAcACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAEABhgSMBAgACAAIAAgAlAQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAwAEAAQABAADAAMAAwADAAQABAAEAAQABAAEAAQABHATAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAdQMIAAgACAAIAAgACAAIAMkACAAIAAgAfQMIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACACFA4kDCAAIAAgACAAIAOcBCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAIcDCAAIAAgACAAIAAgACAAIAAgACAAIAJEDCAAIAAgACADFAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABgBAgAZgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAbAQCBXIECAAIAHkECAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABAAJwEQACjBKoEsgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAC6BMIECAAIAAgACAAIAAgACABmBAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAxwQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAGYECAAIAAgAzgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAigWKBYoFigWKBYoFigWKBd0FXwUIAOIF6gXxBYoF3gT5BQAGCAaKBYoFigWKBYoFigWKBYoFigWKBYoFigXWBIoFigWKBYoFigWKBYoFigWKBYsFEAaKBYoFigWKBYoFigWKBRQGCACKBYoFigWKBQgACAAIANEECAAIABgGigUgBggAJgYIAC4GMwaKBYoF0wQ3Bj4GigWKBYoFigWKBYoFigWKBYoFigWKBYoFigUIAAgACAAIAAgACAAIAAgAigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWLBf///////wQABAAEAAQABAAEAAQABAAEAAQAAwAEAAQAAgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAQADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAUAAAAFAAUAAAAFAAUAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUAAQAAAAUABQAFAAUABQAFAAAAAAAFAAUAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAFAAUAAQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUABQAFAAAABwAHAAcAAAAHAAcABwAFAAEAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAcABwAFAAUAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAQABAAAAAAAAAAAAAAAFAAUABQAFAAAABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABwAHAAcAAAAHAAcAAAAAAAUABQAHAAUAAQAHAAEABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABwABAAUABQAFAAUAAAAAAAAAAAAAAAEAAQABAAEAAQABAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABQANAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAQABAAEAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAABQAHAAUABQAFAAAAAAAAAAcABQAFAAUABQAFAAQABAAEAAQABAAEAAQABAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAFAAUABQAFAAUAAAAFAAUABQAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAAAAAAAAAAAAUABQAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAUAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABwAHAAcABwAFAAcABwAAAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAUABwAHAAUABQAFAAUAAAAAAAcABwAAAAAABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAABQAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAABwAHAAcABQAFAAAAAAAAAAAABQAFAAAAAAAFAAUABQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAFAAUABQAFAAUAAAAFAAUABwAAAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAFAAUABwAFAAUABQAFAAAAAAAHAAcAAAAAAAcABwAFAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABwAAAAAAAAAHAAcABwAAAAcABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAABQAHAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAcABwAAAAUABQAFAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABQAHAAcABQAHAAcAAAAFAAcABwAAAAcABwAFAAUAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAFAAcABwAFAAUABQAAAAUAAAAHAAcABwAHAAcABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAHAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAABwAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAUAAAAFAAAAAAAAAAAABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUABQAFAAUAAAAFAAUAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABwAFAAUABQAFAAUABQAAAAUABQAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABQAFAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABQAFAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAHAAUABQAFAAUABQAFAAUABwAHAAcABwAHAAcABwAHAAUABwAHAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABwAHAAcABwAFAAUABwAHAAcAAAAAAAAAAAAHAAcABQAHAAcABwAHAAcABwAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAHAAUABQAFAAUABQAFAAUAAAAFAAAABQAAAAAABQAFAAUABQAFAAUABQAFAAcABwAHAAcABwAHAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAUABQAFAAUABQAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABwAFAAcABwAHAAcABwAFAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAUABQAFAAUABwAHAAUABQAHAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABQAFAAcABwAHAAUABwAFAAUABQAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAUABQAFAAUABQAFAAUABQAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAcABQAFAAUABQAFAAUABQAAAAAAAAAAAAUAAAAAAAAAAAAAAAAABQAAAAAABwAFAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAABQAAAAAAAAAFAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAUABQAHAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABwAFAAUABQAFAAcABwAFAAUABwAHAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAcABwAFAAUABwAHAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAFAAUABQAAAAAABQAFAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAFAAcABwAAAAAAAAAAAAAABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAFAAcABwAFAAcABwAAAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAFAAUABQAAAAUABQAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABwAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABQAFAAUABQAFAAUABQAFAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAHAAcABQAHAAUABQAAAAAAAAAAAAAAAAAFAAAABwAHAAcABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAcABwAAAAAABwAHAAAAAAAHAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABwAHAAUABQAFAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABQAFAAUABQAFAAUABwAFAAcABwAFAAcABQAFAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABQAFAAUABQAAAAAABwAHAAcABwAFAAUABwAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAHAAUABQAFAAUABQAFAAUABQAHAAcABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAFAAcABwAFAAUABQAFAAUABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAcABwAFAAUABQAFAAcABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABQAHAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAAAAAAFAAUABwAHAAcABwAFAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABwAHAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAHAAUABQAFAAUABQAFAAUABwAFAAUABwAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAAAAAAAABQAAAAUABQAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAHAAcAAAAFAAUAAAAHAAcABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAAAAAAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAUABQAFAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAABQAFAAUABQAFAAUABQAAAAUABQAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAFAAUABQAFAAUADgAOAA4ADgAOAA4ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAAAAAAAAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAMAAwADAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAAAAAAAAAAAAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAAAAAAAAAAAAsADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwACwAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAADgAOAA4AAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAAAA4ADgAOAA4ADgAOAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAA4AAAAOAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAADgAAAAAAAAAAAA4AAAAOAAAAAAAAAAAADgAOAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAA4ADgAOAA4ADgAOAA4ADgAOAAAADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4AAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAOAA4ADgAOAA4ADgAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAAAAAAA=';

/*
     * utrie 1.0.2 <https://github.com/niklasvh/utrie>
     * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
var chars$1='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup$1=typeof Uint8Array==='undefined'?[]:new Uint8Array(256);
for(var i$1=0;i$1<chars$1.length;i$1++){
lookup$1[chars$1.charCodeAt(i$1)]=i$1;
}
var decode=function decode(base64){
var bufferLength=base64.length*0.75,len=base64.length,i,p=0,encoded1,encoded2,encoded3,encoded4;
if(base64[base64.length-1]==='='){
bufferLength--;
if(base64[base64.length-2]==='='){
bufferLength--;
}
}
var buffer=typeof ArrayBuffer!=='undefined'&&
typeof Uint8Array!=='undefined'&&
typeof Uint8Array.prototype.slice!=='undefined'?
new ArrayBuffer(bufferLength):
new Array(bufferLength);
var bytes=Array.isArray(buffer)?buffer:new Uint8Array(buffer);
for(i=0;i<len;i+=4){
encoded1=lookup$1[base64.charCodeAt(i)];
encoded2=lookup$1[base64.charCodeAt(i+1)];
encoded3=lookup$1[base64.charCodeAt(i+2)];
encoded4=lookup$1[base64.charCodeAt(i+3)];
bytes[p++]=encoded1<<2|encoded2>>4;
bytes[p++]=(encoded2&15)<<4|encoded3>>2;
bytes[p++]=(encoded3&3)<<6|encoded4&63;
}
return buffer;
};
var polyUint16Array=function polyUint16Array(buffer){
var length=buffer.length;
var bytes=[];
for(var i=0;i<length;i+=2){
bytes.push(buffer[i+1]<<8|buffer[i]);
}
return bytes;
};
var polyUint32Array=function polyUint32Array(buffer){
var length=buffer.length;
var bytes=[];
for(var i=0;i<length;i+=4){
bytes.push(buffer[i+3]<<24|buffer[i+2]<<16|buffer[i+1]<<8|buffer[i]);
}
return bytes;
};

/** Shift size for getting the index-2 table offset. */
var UTRIE2_SHIFT_2=5;
/** Shift size for getting the index-1 table offset. */
var UTRIE2_SHIFT_1=6+5;
/**
     * Shift size for shifting left the index array values.
     * Increases possible data size with 16-bit index values at the cost
     * of compactability.
     * This requires data blocks to be aligned by UTRIE2_DATA_GRANULARITY.
     */
var UTRIE2_INDEX_SHIFT=2;
/**
     * Difference between the two shift sizes,
     * for getting an index-1 offset from an index-2 offset. 6=11-5
     */
var UTRIE2_SHIFT_1_2=UTRIE2_SHIFT_1-UTRIE2_SHIFT_2;
/**
     * The part of the index-2 table for U+D800..U+DBFF stores values for
     * lead surrogate code _units_ not code _points_.
     * Values for lead surrogate code _points_ are indexed with this portion of the table.
     * Length=32=0x20=0x400>>UTRIE2_SHIFT_2. (There are 1024=0x400 lead surrogates.)
     */
var UTRIE2_LSCP_INDEX_2_OFFSET=0x10000>>UTRIE2_SHIFT_2;
/** Number of entries in a data block. 32=0x20 */
var UTRIE2_DATA_BLOCK_LENGTH=1<<UTRIE2_SHIFT_2;
/** Mask for getting the lower bits for the in-data-block offset. */
var UTRIE2_DATA_MASK=UTRIE2_DATA_BLOCK_LENGTH-1;
var UTRIE2_LSCP_INDEX_2_LENGTH=0x400>>UTRIE2_SHIFT_2;
/** Count the lengths of both BMP pieces. 2080=0x820 */
var UTRIE2_INDEX_2_BMP_LENGTH=UTRIE2_LSCP_INDEX_2_OFFSET+UTRIE2_LSCP_INDEX_2_LENGTH;
/**
     * The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.
     * Length 32=0x20 for lead bytes C0..DF, regardless of UTRIE2_SHIFT_2.
     */
var UTRIE2_UTF8_2B_INDEX_2_OFFSET=UTRIE2_INDEX_2_BMP_LENGTH;
var UTRIE2_UTF8_2B_INDEX_2_LENGTH=0x800>>6;/* U+0800 is the first code point after 2-byte UTF-8 */
/**
     * The index-1 table, only used for supplementary code points, at offset 2112=0x840.
     * Variable length, for code points up to highStart, where the last single-value range starts.
     * Maximum length 512=0x200=0x100000>>UTRIE2_SHIFT_1.
     * (For 0x100000 supplementary code points U+10000..U+10ffff.)
     *
     * The part of the index-2 table for supplementary code points starts
     * after this index-1 table.
     *
     * Both the index-1 table and the following part of the index-2 table
     * are omitted completely if there is only BMP data.
     */
var UTRIE2_INDEX_1_OFFSET=UTRIE2_UTF8_2B_INDEX_2_OFFSET+UTRIE2_UTF8_2B_INDEX_2_LENGTH;
/**
     * Number of index-1 entries for the BMP. 32=0x20
     * This part of the index-1 table is omitted from the serialized form.
     */
var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH=0x10000>>UTRIE2_SHIFT_1;
/** Number of entries in an index-2 block. 64=0x40 */
var UTRIE2_INDEX_2_BLOCK_LENGTH=1<<UTRIE2_SHIFT_1_2;
/** Mask for getting the lower bits for the in-index-2-block offset. */
var UTRIE2_INDEX_2_MASK=UTRIE2_INDEX_2_BLOCK_LENGTH-1;
var slice16=function slice16(view,start,end){
if(view.slice){
return view.slice(start,end);
}
return new Uint16Array(Array.prototype.slice.call(view,start,end));
};
var slice32=function slice32(view,start,end){
if(view.slice){
return view.slice(start,end);
}
return new Uint32Array(Array.prototype.slice.call(view,start,end));
};
var createTrieFromBase64=function createTrieFromBase64(base64,_byteLength){
var buffer=decode(base64);
var view32=Array.isArray(buffer)?polyUint32Array(buffer):new Uint32Array(buffer);
var view16=Array.isArray(buffer)?polyUint16Array(buffer):new Uint16Array(buffer);
var headerLength=24;
var index=slice16(view16,headerLength/2,view32[4]/2);
var data=view32[5]===2?
slice16(view16,(headerLength+view32[4])/2):
slice32(view32,Math.ceil((headerLength+view32[4])/4));
return new Trie(view32[0],view32[1],view32[2],view32[3],index,data);
};
var Trie=/** @class */function(){
function Trie(initialValue,errorValue,highStart,highValueIndex,index,data){
this.initialValue=initialValue;
this.errorValue=errorValue;
this.highStart=highStart;
this.highValueIndex=highValueIndex;
this.index=index;
this.data=data;
}
/**
         * Get the value for a code point as stored in the Trie.
         *
         * @param codePoint the code point
         * @return the value
         */
Trie.prototype.get=function(codePoint){
var ix;
if(codePoint>=0){
if(codePoint<0x0d800||codePoint>0x0dbff&&codePoint<=0x0ffff){
// Ordinary BMP code point, excluding leading surrogates.
// BMP uses a single level lookup.  BMP index starts at offset 0 in the Trie2 index.
// 16 bit data is stored in the index array itself.
ix=this.index[codePoint>>UTRIE2_SHIFT_2];
ix=(ix<<UTRIE2_INDEX_SHIFT)+(codePoint&UTRIE2_DATA_MASK);
return this.data[ix];
}
if(codePoint<=0xffff){
// Lead Surrogate Code Point.  A Separate index section is stored for
// lead surrogate code units and code points.
//   The main index has the code unit data.
//   For this function, we need the code point data.
// Note: this expression could be refactored for slightly improved efficiency, but
//       surrogate code points will be so rare in practice that it's not worth it.
ix=this.index[UTRIE2_LSCP_INDEX_2_OFFSET+(codePoint-0xd800>>UTRIE2_SHIFT_2)];
ix=(ix<<UTRIE2_INDEX_SHIFT)+(codePoint&UTRIE2_DATA_MASK);
return this.data[ix];
}
if(codePoint<this.highStart){
// Supplemental code point, use two-level lookup.
ix=UTRIE2_INDEX_1_OFFSET-UTRIE2_OMITTED_BMP_INDEX_1_LENGTH+(codePoint>>UTRIE2_SHIFT_1);
ix=this.index[ix];
ix+=codePoint>>UTRIE2_SHIFT_2&UTRIE2_INDEX_2_MASK;
ix=this.index[ix];
ix=(ix<<UTRIE2_INDEX_SHIFT)+(codePoint&UTRIE2_DATA_MASK);
return this.data[ix];
}
if(codePoint<=0x10ffff){
return this.data[this.highValueIndex];
}
}
// Fall through.  The code point is outside of the legal range of 0..0x10ffff.
return this.errorValue;
};
return Trie;
}();

/*
     * base64-arraybuffer 1.0.2 <https://github.com/niklasvh/base64-arraybuffer>
     * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup=typeof Uint8Array==='undefined'?[]:new Uint8Array(256);
for(var i=0;i<chars.length;i++){
lookup[chars.charCodeAt(i)]=i;
}

var Prepend=1;
var CR=2;
var LF=3;
var Control=4;
var Extend=5;
var SpacingMark=7;
var L=8;
var V=9;
var T=10;
var LV=11;
var LVT=12;
var ZWJ=13;
var Extended_Pictographic=14;
var RI=15;
var toCodePoints=function toCodePoints(str){
var codePoints=[];
var i=0;
var length=str.length;
while(i<length){
var value=str.charCodeAt(i++);
if(value>=0xd800&&value<=0xdbff&&i<length){
var extra=str.charCodeAt(i++);
if((extra&0xfc00)===0xdc00){
codePoints.push(((value&0x3ff)<<10)+(extra&0x3ff)+0x10000);
}else
{
codePoints.push(value);
i--;
}
}else
{
codePoints.push(value);
}
}
return codePoints;
};
var fromCodePoint=function fromCodePoint(){
var codePoints=[];
for(var _i=0;_i<arguments.length;_i++){
codePoints[_i]=arguments[_i];
}
if(String.fromCodePoint){
return String.fromCodePoint.apply(String,codePoints);
}
var length=codePoints.length;
if(!length){
return '';
}
var codeUnits=[];
var index=-1;
var result='';
while(++index<length){
var codePoint=codePoints[index];
if(codePoint<=0xffff){
codeUnits.push(codePoint);
}else
{
codePoint-=0x10000;
codeUnits.push((codePoint>>10)+0xd800,codePoint%0x400+0xdc00);
}
if(index+1===length||codeUnits.length>0x4000){
result+=String.fromCharCode.apply(String,codeUnits);
codeUnits.length=0;
}
}
return result;
};
var UnicodeTrie=createTrieFromBase64(base64);
var BREAK_NOT_ALLOWED='×';
var BREAK_ALLOWED='÷';
var codePointToClass=function codePointToClass(codePoint){return UnicodeTrie.get(codePoint);};
var _graphemeBreakAtIndex=function _graphemeBreakAtIndex(_codePoints,classTypes,index){
var prevIndex=index-2;
var prev=classTypes[prevIndex];
var current=classTypes[index-1];
var next=classTypes[index];
// GB3 Do not break between a CR and LF
if(current===CR&&next===LF){
return BREAK_NOT_ALLOWED;
}
// GB4 Otherwise, break before and after controls.
if(current===CR||current===LF||current===Control){
return BREAK_ALLOWED;
}
// GB5
if(next===CR||next===LF||next===Control){
return BREAK_ALLOWED;
}
// Do not break Hangul syllable sequences.
// GB6
if(current===L&&[L,V,LV,LVT].indexOf(next)!==-1){
return BREAK_NOT_ALLOWED;
}
// GB7
if((current===LV||current===V)&&(next===V||next===T)){
return BREAK_NOT_ALLOWED;
}
// GB8
if((current===LVT||current===T)&&next===T){
return BREAK_NOT_ALLOWED;
}
// GB9 Do not break before extending characters or ZWJ.
if(next===ZWJ||next===Extend){
return BREAK_NOT_ALLOWED;
}
// Do not break before SpacingMarks, or after Prepend characters.
// GB9a
if(next===SpacingMark){
return BREAK_NOT_ALLOWED;
}
// GB9a
if(current===Prepend){
return BREAK_NOT_ALLOWED;
}
// GB11 Do not break within emoji modifier sequences or emoji zwj sequences.
if(current===ZWJ&&next===Extended_Pictographic){
while(prev===Extend){
prev=classTypes[--prevIndex];
}
if(prev===Extended_Pictographic){
return BREAK_NOT_ALLOWED;
}
}
// GB12 Do not break within emoji flag sequences.
// That is, do not break between regional indicator (RI) symbols
// if there is an odd number of RI characters before the break point.
if(current===RI&&next===RI){
var countRI=0;
while(prev===RI){
countRI++;
prev=classTypes[--prevIndex];
}
if(countRI%2===0){
return BREAK_NOT_ALLOWED;
}
}
return BREAK_ALLOWED;
};
var GraphemeBreaker=function GraphemeBreaker(str){
var codePoints=toCodePoints(str);
var length=codePoints.length;
var index=0;
var lastEnd=0;
var classTypes=codePoints.map(codePointToClass);
return {
next:function next(){
if(index>=length){
return {done:true,value:null};
}
var graphemeBreak=BREAK_NOT_ALLOWED;
while(index<length&&
(graphemeBreak=_graphemeBreakAtIndex(codePoints,classTypes,++index))===BREAK_NOT_ALLOWED){}
if(graphemeBreak!==BREAK_NOT_ALLOWED||index===length){
var value=fromCodePoint.apply(null,codePoints.slice(lastEnd,index));
lastEnd=index;
return {value:value,done:false};
}
return {done:true,value:null};
}};

};
var splitGraphemes=function splitGraphemes(str){
var breaker=GraphemeBreaker(str);
var graphemes=[];
var bk;
while(!(bk=breaker.next()).done){
if(bk.value){
graphemes.push(bk.value.slice());
}
}
return graphemes;
};

var testRangeBounds=function testRangeBounds(document){
var TEST_HEIGHT=123;
if(document.createRange){
var range=document.createRange();
if(range.getBoundingClientRect){
var testElement=document.createElement('boundtest');
testElement.style.height=TEST_HEIGHT+"px";
testElement.style.display='block';
document.body.appendChild(testElement);
range.selectNode(testElement);
var rangeBounds=range.getBoundingClientRect();
var rangeHeight=Math.round(rangeBounds.height);
document.body.removeChild(testElement);
if(rangeHeight===TEST_HEIGHT){
return true;
}
}
}
return false;
};
var testIOSLineBreak=function testIOSLineBreak(document){
var testElement=document.createElement('boundtest');
testElement.style.width='50px';
testElement.style.display='block';
testElement.style.fontSize='12px';
testElement.style.letterSpacing='0px';
testElement.style.wordSpacing='0px';
document.body.appendChild(testElement);
var range=document.createRange();
testElement.innerHTML=typeof''.repeat==='function'?'&#128104;'.repeat(10):'';
var node=testElement.firstChild;
var textList=toCodePoints$1(node.data).map(function(i){return fromCodePoint$1(i);});
var offset=0;
var prev={};
// ios 13 does not handle range getBoundingClientRect line changes correctly #2177
var supports=textList.every(function(text,i){
range.setStart(node,offset);
range.setEnd(node,offset+text.length);
var rect=range.getBoundingClientRect();
offset+=text.length;
var boundAhead=rect.x>prev.x||rect.y>prev.y;
prev=rect;
if(i===0){
return true;
}
return boundAhead;
});
document.body.removeChild(testElement);
return supports;
};
var testCORS=function testCORS(){return typeof new Image().crossOrigin!=='undefined';};
var testResponseType=function testResponseType(){return typeof new XMLHttpRequest().responseType==='string';};
var testSVG=function testSVG(document){
var img=new Image();
var canvas=document.createElement('canvas');
var ctx=canvas.getContext('2d');
if(!ctx){
return false;
}
img.src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";
try{
ctx.drawImage(img,0,0);
canvas.toDataURL();
}
catch(e){
return false;
}
return true;
};
var isGreenPixel=function isGreenPixel(data){
return data[0]===0&&data[1]===255&&data[2]===0&&data[3]===255;
};
var testForeignObject=function testForeignObject(document){
var canvas=document.createElement('canvas');
var size=100;
canvas.width=size;
canvas.height=size;
var ctx=canvas.getContext('2d');
if(!ctx){
return Promise.reject(false);
}
ctx.fillStyle='rgb(0, 255, 0)';
ctx.fillRect(0,0,size,size);
var img=new Image();
var greenImageSrc=canvas.toDataURL();
img.src=greenImageSrc;
var svg=createForeignObjectSVG(size,size,0,0,img);
ctx.fillStyle='red';
ctx.fillRect(0,0,size,size);
return loadSerializedSVG$1(svg).
then(function(img){
ctx.drawImage(img,0,0);
var data=ctx.getImageData(0,0,size,size).data;
ctx.fillStyle='red';
ctx.fillRect(0,0,size,size);
var node=document.createElement('div');
node.style.backgroundImage="url("+greenImageSrc+")";
node.style.height=size+"px";
// Firefox 55 does not render inline <img /> tags
return isGreenPixel(data)?
loadSerializedSVG$1(createForeignObjectSVG(size,size,0,0,node)):
Promise.reject(false);
}).
then(function(img){
ctx.drawImage(img,0,0);
// Edge does not render background-images
return isGreenPixel(ctx.getImageData(0,0,size,size).data);
}).
catch(function(){return false;});
};
var createForeignObjectSVG=function createForeignObjectSVG(width,height,x,y,node){
var xmlns='http://www.w3.org/2000/svg';
var svg=document.createElementNS(xmlns,'svg');
var foreignObject=document.createElementNS(xmlns,'foreignObject');
svg.setAttributeNS(null,'width',width.toString());
svg.setAttributeNS(null,'height',height.toString());
foreignObject.setAttributeNS(null,'width','100%');
foreignObject.setAttributeNS(null,'height','100%');
foreignObject.setAttributeNS(null,'x',x.toString());
foreignObject.setAttributeNS(null,'y',y.toString());
foreignObject.setAttributeNS(null,'externalResourcesRequired','true');
svg.appendChild(foreignObject);
foreignObject.appendChild(node);
return svg;
};
var loadSerializedSVG$1=function loadSerializedSVG$1(svg){
return new Promise(function(resolve,reject){
var img=new Image();
img.onload=function(){return resolve(img);};
img.onerror=reject;
img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(svg));
});
};
var FEATURES={
get SUPPORT_RANGE_BOUNDS(){
var value=testRangeBounds(document);
Object.defineProperty(FEATURES,'SUPPORT_RANGE_BOUNDS',{value:value});
return value;
},
get SUPPORT_WORD_BREAKING(){
var value=FEATURES.SUPPORT_RANGE_BOUNDS&&testIOSLineBreak(document);
Object.defineProperty(FEATURES,'SUPPORT_WORD_BREAKING',{value:value});
return value;
},
get SUPPORT_SVG_DRAWING(){
var value=testSVG(document);
Object.defineProperty(FEATURES,'SUPPORT_SVG_DRAWING',{value:value});
return value;
},
get SUPPORT_FOREIGNOBJECT_DRAWING(){
var value=typeof Array.from==='function'&&typeof window.fetch==='function'?
testForeignObject(document):
Promise.resolve(false);
Object.defineProperty(FEATURES,'SUPPORT_FOREIGNOBJECT_DRAWING',{value:value});
return value;
},
get SUPPORT_CORS_IMAGES(){
var value=testCORS();
Object.defineProperty(FEATURES,'SUPPORT_CORS_IMAGES',{value:value});
return value;
},
get SUPPORT_RESPONSE_TYPE(){
var value=testResponseType();
Object.defineProperty(FEATURES,'SUPPORT_RESPONSE_TYPE',{value:value});
return value;
},
get SUPPORT_CORS_XHR(){
var value=('withCredentials'in new XMLHttpRequest());
Object.defineProperty(FEATURES,'SUPPORT_CORS_XHR',{value:value});
return value;
},
get SUPPORT_NATIVE_TEXT_SEGMENTATION(){
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var value=!!(typeof Intl!=='undefined'&&Intl.Segmenter);
Object.defineProperty(FEATURES,'SUPPORT_NATIVE_TEXT_SEGMENTATION',{value:value});
return value;
}};


var TextBounds=/** @class */function(){
function TextBounds(text,bounds){
this.text=text;
this.bounds=bounds;
}
return TextBounds;
}();
var parseTextBounds=function parseTextBounds(context,value,styles,node){
var textList=breakText(value,styles);
var textBounds=[];
var offset=0;
textList.forEach(function(text){
if(styles.textDecorationLine.length||text.trim().length>0){
if(FEATURES.SUPPORT_RANGE_BOUNDS){
var clientRects=createRange(node,offset,text.length).getClientRects();
if(clientRects.length>1){
var subSegments=segmentGraphemes(text);
var subOffset_1=0;
subSegments.forEach(function(subSegment){
textBounds.push(new TextBounds(subSegment,Bounds.fromDOMRectList(context,createRange(node,subOffset_1+offset,subSegment.length).getClientRects())));
subOffset_1+=subSegment.length;
});
}else
{
textBounds.push(new TextBounds(text,Bounds.fromDOMRectList(context,clientRects)));
}
}else
{
var replacementNode=node.splitText(text.length);
textBounds.push(new TextBounds(text,getWrapperBounds(context,node)));
node=replacementNode;
}
}else
if(!FEATURES.SUPPORT_RANGE_BOUNDS){
node=node.splitText(text.length);
}
offset+=text.length;
});
return textBounds;
};
var getWrapperBounds=function getWrapperBounds(context,node){
var ownerDocument=node.ownerDocument;
if(ownerDocument){
var wrapper=ownerDocument.createElement('html2canvaswrapper');
wrapper.appendChild(node.cloneNode(true));
var parentNode=node.parentNode;
if(parentNode){
parentNode.replaceChild(wrapper,node);
var bounds=parseBounds(context,wrapper);
if(wrapper.firstChild){
parentNode.replaceChild(wrapper.firstChild,wrapper);
}
return bounds;
}
}
return Bounds.EMPTY;
};
var createRange=function createRange(node,offset,length){
var ownerDocument=node.ownerDocument;
if(!ownerDocument){
throw new Error('Node has no owner document');
}
var range=ownerDocument.createRange();
range.setStart(node,offset);
range.setEnd(node,offset+length);
return range;
};
var segmentGraphemes=function segmentGraphemes(value){
if(FEATURES.SUPPORT_NATIVE_TEXT_SEGMENTATION){
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var segmenter=new Intl.Segmenter(void 0,{granularity:'grapheme'});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
return Array.from(segmenter.segment(value)).map(function(segment){return segment.segment;});
}
return splitGraphemes(value);
};
var segmentWords=function segmentWords(value,styles){
if(FEATURES.SUPPORT_NATIVE_TEXT_SEGMENTATION){
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var segmenter=new Intl.Segmenter(void 0,{
granularity:'word'});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
return Array.from(segmenter.segment(value)).map(function(segment){return segment.segment;});
}
return breakWords(value,styles);
};
var breakText=function breakText(value,styles){
return styles.letterSpacing!==0?segmentGraphemes(value):segmentWords(value,styles);
};
// https://drafts.csswg.org/css-text/#word-separator
var wordSeparators=[0x0020,0x00a0,0x1361,0x10100,0x10101,0x1039,0x1091];
var breakWords=function breakWords(str,styles){
var breaker=LineBreaker(str,{
lineBreak:styles.lineBreak,
wordBreak:styles.overflowWrap==="break-word"/* BREAK_WORD */?'break-word':styles.wordBreak});

var words=[];
var bk;
var _loop_1=function _loop_1(){
if(bk.value){
var value=bk.value.slice();
var codePoints=toCodePoints$1(value);
var word_1='';
codePoints.forEach(function(codePoint){
if(wordSeparators.indexOf(codePoint)===-1){
word_1+=fromCodePoint$1(codePoint);
}else
{
if(word_1.length){
words.push(word_1);
}
words.push(fromCodePoint$1(codePoint));
word_1='';
}
});
if(word_1.length){
words.push(word_1);
}
}
};
while(!(bk=breaker.next()).done){
_loop_1();
}
return words;
};

var TextContainer=/** @class */function(){
function TextContainer(context,node,styles){
this.text=transform(node.data,styles.textTransform);
this.textBounds=parseTextBounds(context,this.text,styles,node);
}
return TextContainer;
}();
var transform=function transform(text,_transform){
switch(_transform){
case 1/* LOWERCASE */:
return text.toLowerCase();
case 3/* CAPITALIZE */:
return text.replace(CAPITALIZE,capitalize);
case 2/* UPPERCASE */:
return text.toUpperCase();
default:
return text;}

};
var CAPITALIZE=/(^|\s|:|-|\(|\))([a-z])/g;
var capitalize=function capitalize(m,p1,p2){
if(m.length>0){
return p1+p2.toUpperCase();
}
return m;
};

var ImageElementContainer=/** @class */function(_super){
__extends(ImageElementContainer,_super);
function ImageElementContainer(context,img){
var _this=_super.call(this,context,img)||this;
_this.src=img.currentSrc||img.src;
_this.intrinsicWidth=img.naturalWidth;
_this.intrinsicHeight=img.naturalHeight;
_this.context.cache.addImage(_this.src);
return _this;
}
return ImageElementContainer;
}(ElementContainer);

var CanvasElementContainer=/** @class */function(_super){
__extends(CanvasElementContainer,_super);
function CanvasElementContainer(context,canvas){
var _this=_super.call(this,context,canvas)||this;
_this.canvas=canvas;
_this.intrinsicWidth=canvas.width;
_this.intrinsicHeight=canvas.height;
return _this;
}
return CanvasElementContainer;
}(ElementContainer);

var SVGElementContainer=/** @class */function(_super){
__extends(SVGElementContainer,_super);
function SVGElementContainer(context,img){
var _this=_super.call(this,context,img)||this;
var s=new XMLSerializer();
var bounds=parseBounds(context,img);
img.setAttribute('width',bounds.width+"px");
img.setAttribute('height',bounds.height+"px");
_this.svg="data:image/svg+xml,"+encodeURIComponent(s.serializeToString(img));
_this.intrinsicWidth=img.width.baseVal.value;
_this.intrinsicHeight=img.height.baseVal.value;
_this.context.cache.addImage(_this.svg);
return _this;
}
return SVGElementContainer;
}(ElementContainer);

var LIElementContainer=/** @class */function(_super){
__extends(LIElementContainer,_super);
function LIElementContainer(context,element){
var _this=_super.call(this,context,element)||this;
_this.value=element.value;
return _this;
}
return LIElementContainer;
}(ElementContainer);

var OLElementContainer=/** @class */function(_super){
__extends(OLElementContainer,_super);
function OLElementContainer(context,element){
var _this=_super.call(this,context,element)||this;
_this.start=element.start;
_this.reversed=typeof element.reversed==='boolean'&&element.reversed===true;
return _this;
}
return OLElementContainer;
}(ElementContainer);

var CHECKBOX_BORDER_RADIUS=[
{
type:15/* DIMENSION_TOKEN */,
flags:0,
unit:'px',
number:3}];


var RADIO_BORDER_RADIUS=[
{
type:16/* PERCENTAGE_TOKEN */,
flags:0,
number:50}];


var reformatInputBounds=function reformatInputBounds(bounds){
if(bounds.width>bounds.height){
return new Bounds(bounds.left+(bounds.width-bounds.height)/2,bounds.top,bounds.height,bounds.height);
}else
if(bounds.width<bounds.height){
return new Bounds(bounds.left,bounds.top+(bounds.height-bounds.width)/2,bounds.width,bounds.width);
}
return bounds;
};
var getInputValue=function getInputValue(node){
var value=node.type===PASSWORD?new Array(node.value.length+1).join("\u2022"):node.value;
return value.length===0?node.placeholder||'':value;
};
var CHECKBOX='checkbox';
var RADIO='radio';
var PASSWORD='password';
var INPUT_COLOR=0x2a2a2aff;
var InputElementContainer=/** @class */function(_super){
__extends(InputElementContainer,_super);
function InputElementContainer(context,input){
var _this=_super.call(this,context,input)||this;
_this.type=input.type.toLowerCase();
_this.checked=input.checked;
_this.value=getInputValue(input);
if(_this.type===CHECKBOX||_this.type===RADIO){
_this.styles.backgroundColor=0xdededeff;
_this.styles.borderTopColor=
_this.styles.borderRightColor=
_this.styles.borderBottomColor=
_this.styles.borderLeftColor=
0xa5a5a5ff;
_this.styles.borderTopWidth=
_this.styles.borderRightWidth=
_this.styles.borderBottomWidth=
_this.styles.borderLeftWidth=
1;
_this.styles.borderTopStyle=
_this.styles.borderRightStyle=
_this.styles.borderBottomStyle=
_this.styles.borderLeftStyle=
1/* SOLID */;
_this.styles.backgroundClip=[0/* BORDER_BOX */];
_this.styles.backgroundOrigin=[0/* BORDER_BOX */];
_this.bounds=reformatInputBounds(_this.bounds);
}
switch(_this.type){
case CHECKBOX:
_this.styles.borderTopRightRadius=
_this.styles.borderTopLeftRadius=
_this.styles.borderBottomRightRadius=
_this.styles.borderBottomLeftRadius=
CHECKBOX_BORDER_RADIUS;
break;
case RADIO:
_this.styles.borderTopRightRadius=
_this.styles.borderTopLeftRadius=
_this.styles.borderBottomRightRadius=
_this.styles.borderBottomLeftRadius=
RADIO_BORDER_RADIUS;
break;}

return _this;
}
return InputElementContainer;
}(ElementContainer);

var SelectElementContainer=/** @class */function(_super){
__extends(SelectElementContainer,_super);
function SelectElementContainer(context,element){
var _this=_super.call(this,context,element)||this;
var option=element.options[element.selectedIndex||0];
_this.value=option?option.text||'':'';
return _this;
}
return SelectElementContainer;
}(ElementContainer);

var TextareaElementContainer=/** @class */function(_super){
__extends(TextareaElementContainer,_super);
function TextareaElementContainer(context,element){
var _this=_super.call(this,context,element)||this;
_this.value=element.value;
return _this;
}
return TextareaElementContainer;
}(ElementContainer);

var IFrameElementContainer=/** @class */function(_super){
__extends(IFrameElementContainer,_super);
function IFrameElementContainer(context,iframe){
var _this=_super.call(this,context,iframe)||this;
_this.src=iframe.src;
_this.width=parseInt(iframe.width,10)||0;
_this.height=parseInt(iframe.height,10)||0;
_this.backgroundColor=_this.styles.backgroundColor;
try{
if(iframe.contentWindow&&
iframe.contentWindow.document&&
iframe.contentWindow.document.documentElement){
_this.tree=parseTree(context,iframe.contentWindow.document.documentElement);
// http://www.w3.org/TR/css3-background/#special-backgrounds
var documentBackgroundColor=iframe.contentWindow.document.documentElement?
parseColor(context,getComputedStyle(iframe.contentWindow.document.documentElement).backgroundColor):
COLORS.TRANSPARENT;
var bodyBackgroundColor=iframe.contentWindow.document.body?
parseColor(context,getComputedStyle(iframe.contentWindow.document.body).backgroundColor):
COLORS.TRANSPARENT;
_this.backgroundColor=isTransparent(documentBackgroundColor)?
isTransparent(bodyBackgroundColor)?
_this.styles.backgroundColor:
bodyBackgroundColor:
documentBackgroundColor;
}
}
catch(e){}
return _this;
}
return IFrameElementContainer;
}(ElementContainer);

var LIST_OWNERS=['OL','UL','MENU'];
var parseNodeTree=function parseNodeTree(context,node,parent,root){
for(var childNode=node.firstChild,nextNode=void 0;childNode;childNode=nextNode){
nextNode=childNode.nextSibling;
if(isTextNode(childNode)&&childNode.data.trim().length>0){
parent.textNodes.push(new TextContainer(context,childNode,parent.styles));
}else
if(isElementNode(childNode)){
if(isSlotElement(childNode)&&childNode.assignedNodes){
childNode.assignedNodes().forEach(function(childNode){return parseNodeTree(context,childNode,parent,root);});
}else
{
var container=createContainer(context,childNode);
if(container.styles.isVisible()){
if(createsRealStackingContext(childNode,container,root)){
container.flags|=4/* CREATES_REAL_STACKING_CONTEXT */;
}else
if(createsStackingContext(container.styles)){
container.flags|=2/* CREATES_STACKING_CONTEXT */;
}
if(LIST_OWNERS.indexOf(childNode.tagName)!==-1){
container.flags|=8/* IS_LIST_OWNER */;
}
parent.elements.push(container);
childNode.slot;
if(childNode.shadowRoot){
parseNodeTree(context,childNode.shadowRoot,container,root);
}else
if(!isTextareaElement(childNode)&&
!isSVGElement(childNode)&&
!isSelectElement(childNode)){
parseNodeTree(context,childNode,container,root);
}
}
}
}
}
};
var createContainer=function createContainer(context,element){
if(isImageElement(element)){
return new ImageElementContainer(context,element);
}
if(isCanvasElement(element)){
return new CanvasElementContainer(context,element);
}
if(isSVGElement(element)){
return new SVGElementContainer(context,element);
}
if(isLIElement(element)){
return new LIElementContainer(context,element);
}
if(isOLElement(element)){
return new OLElementContainer(context,element);
}
if(isInputElement(element)){
return new InputElementContainer(context,element);
}
if(isSelectElement(element)){
return new SelectElementContainer(context,element);
}
if(isTextareaElement(element)){
return new TextareaElementContainer(context,element);
}
if(isIFrameElement(element)){
return new IFrameElementContainer(context,element);
}
return new ElementContainer(context,element);
};
var parseTree=function parseTree(context,element){
var container=createContainer(context,element);
container.flags|=4/* CREATES_REAL_STACKING_CONTEXT */;
parseNodeTree(context,element,container,container);
return container;
};
var createsRealStackingContext=function createsRealStackingContext(node,container,root){
return container.styles.isPositionedWithZIndex()||
container.styles.opacity<1||
container.styles.isTransformed()||
isBodyElement(node)&&root.styles.isTransparent();
};
var createsStackingContext=function createsStackingContext(styles){return styles.isPositioned()||styles.isFloating();};
var isTextNode=function isTextNode(node){return node.nodeType===Node.TEXT_NODE;};
var isElementNode=function isElementNode(node){return node.nodeType===Node.ELEMENT_NODE;};
var isHTMLElementNode=function isHTMLElementNode(node){
return isElementNode(node)&&typeof node.style!=='undefined'&&!isSVGElementNode(node);
};
var isSVGElementNode=function isSVGElementNode(element){
return typeof element.className==='object';
};
var isLIElement=function isLIElement(node){return node.tagName==='LI';};
var isOLElement=function isOLElement(node){return node.tagName==='OL';};
var isInputElement=function isInputElement(node){return node.tagName==='INPUT';};
var isHTMLElement=function isHTMLElement(node){return node.tagName==='HTML';};
var isSVGElement=function isSVGElement(node){return node.tagName==='svg';};
var isBodyElement=function isBodyElement(node){return node.tagName==='BODY';};
var isCanvasElement=function isCanvasElement(node){return node.tagName==='CANVAS';};
var isVideoElement=function isVideoElement(node){return node.tagName==='VIDEO';};
var isImageElement=function isImageElement(node){return node.tagName==='IMG';};
var isIFrameElement=function isIFrameElement(node){return node.tagName==='IFRAME';};
var isStyleElement=function isStyleElement(node){return node.tagName==='STYLE';};
var isScriptElement=function isScriptElement(node){return node.tagName==='SCRIPT';};
var isTextareaElement=function isTextareaElement(node){return node.tagName==='TEXTAREA';};
var isSelectElement=function isSelectElement(node){return node.tagName==='SELECT';};
var isSlotElement=function isSlotElement(node){return node.tagName==='SLOT';};
// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
var isCustomElement=function isCustomElement(node){return node.tagName.indexOf('-')>0;};

var CounterState=/** @class */function(){
function CounterState(){
this.counters={};
}
CounterState.prototype.getCounterValue=function(name){
var counter=this.counters[name];
if(counter&&counter.length){
return counter[counter.length-1];
}
return 1;
};
CounterState.prototype.getCounterValues=function(name){
var counter=this.counters[name];
return counter?counter:[];
};
CounterState.prototype.pop=function(counters){
var _this=this;
counters.forEach(function(counter){return _this.counters[counter].pop();});
};
CounterState.prototype.parse=function(style){
var _this=this;
var counterIncrement=style.counterIncrement;
var counterReset=style.counterReset;
var canReset=true;
if(counterIncrement!==null){
counterIncrement.forEach(function(entry){
var counter=_this.counters[entry.counter];
if(counter&&entry.increment!==0){
canReset=false;
if(!counter.length){
counter.push(1);
}
counter[Math.max(0,counter.length-1)]+=entry.increment;
}
});
}
var counterNames=[];
if(canReset){
counterReset.forEach(function(entry){
var counter=_this.counters[entry.counter];
counterNames.push(entry.counter);
if(!counter){
counter=_this.counters[entry.counter]=[];
}
counter.push(entry.reset);
});
}
return counterNames;
};
return CounterState;
}();
var ROMAN_UPPER={
integers:[1000,900,500,400,100,90,50,40,10,9,5,4,1],
values:['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']};

var ARMENIAN={
integers:[
9000,8000,7000,6000,5000,4000,3000,2000,1000,900,800,700,600,500,400,300,200,100,90,80,70,
60,50,40,30,20,10,9,8,7,6,5,4,3,2,1],

values:[
'Ք',
'Փ',
'Ւ',
'Ց',
'Ր',
'Տ',
'Վ',
'Ս',
'Ռ',
'Ջ',
'Պ',
'Չ',
'Ո',
'Շ',
'Ն',
'Յ',
'Մ',
'Ճ',
'Ղ',
'Ձ',
'Հ',
'Կ',
'Ծ',
'Խ',
'Լ',
'Ի',
'Ժ',
'Թ',
'Ը',
'Է',
'Զ',
'Ե',
'Դ',
'Գ',
'Բ',
'Ա']};


var HEBREW={
integers:[
10000,9000,8000,7000,6000,5000,4000,3000,2000,1000,400,300,200,100,90,80,70,60,50,40,30,20,
19,18,17,16,15,10,9,8,7,6,5,4,3,2,1],

values:[
'י׳',
'ט׳',
'ח׳',
'ז׳',
'ו׳',
'ה׳',
'ד׳',
'ג׳',
'ב׳',
'א׳',
'ת',
'ש',
'ר',
'ק',
'צ',
'פ',
'ע',
'ס',
'נ',
'מ',
'ל',
'כ',
'יט',
'יח',
'יז',
'טז',
'טו',
'י',
'ט',
'ח',
'ז',
'ו',
'ה',
'ד',
'ג',
'ב',
'א']};


var GEORGIAN={
integers:[
10000,9000,8000,7000,6000,5000,4000,3000,2000,1000,900,800,700,600,500,400,300,200,100,90,
80,70,60,50,40,30,20,10,9,8,7,6,5,4,3,2,1],

values:[
'ჵ',
'ჰ',
'ჯ',
'ჴ',
'ხ',
'ჭ',
'წ',
'ძ',
'ც',
'ჩ',
'შ',
'ყ',
'ღ',
'ქ',
'ფ',
'ჳ',
'ტ',
'ს',
'რ',
'ჟ',
'პ',
'ო',
'ჲ',
'ნ',
'მ',
'ლ',
'კ',
'ი',
'თ',
'ჱ',
'ზ',
'ვ',
'ე',
'დ',
'გ',
'ბ',
'ა']};


var createAdditiveCounter=function createAdditiveCounter(value,min,max,symbols,fallback,suffix){
if(value<min||value>max){
return createCounterText(value,fallback,suffix.length>0);
}
return symbols.integers.reduce(function(string,integer,index){
while(value>=integer){
value-=integer;
string+=symbols.values[index];
}
return string;
},'')+suffix;
};
var createCounterStyleWithSymbolResolver=function createCounterStyleWithSymbolResolver(value,codePointRangeLength,isNumeric,resolver){
var string='';
do{
if(!isNumeric){
value--;
}
string=resolver(value)+string;
value/=codePointRangeLength;
}while(value*codePointRangeLength>=codePointRangeLength);
return string;
};
var createCounterStyleFromRange=function createCounterStyleFromRange(value,codePointRangeStart,codePointRangeEnd,isNumeric,suffix){
var codePointRangeLength=codePointRangeEnd-codePointRangeStart+1;
return (value<0?'-':'')+(
createCounterStyleWithSymbolResolver(Math.abs(value),codePointRangeLength,isNumeric,function(codePoint){
return fromCodePoint$1(Math.floor(codePoint%codePointRangeLength)+codePointRangeStart);
})+
suffix);
};
var createCounterStyleFromSymbols=function createCounterStyleFromSymbols(value,symbols,suffix){
if(suffix===void 0){suffix='. ';}
var codePointRangeLength=symbols.length;
return createCounterStyleWithSymbolResolver(Math.abs(value),codePointRangeLength,false,function(codePoint){return symbols[Math.floor(codePoint%codePointRangeLength)];})+suffix;
};
var CJK_ZEROS=1<<0;
var CJK_TEN_COEFFICIENTS=1<<1;
var CJK_TEN_HIGH_COEFFICIENTS=1<<2;
var CJK_HUNDRED_COEFFICIENTS=1<<3;
var createCJKCounter=function createCJKCounter(value,numbers,multipliers,negativeSign,suffix,flags){
if(value<-9999||value>9999){
return createCounterText(value,4/* CJK_DECIMAL */,suffix.length>0);
}
var tmp=Math.abs(value);
var string=suffix;
if(tmp===0){
return numbers[0]+string;
}
for(var digit=0;tmp>0&&digit<=4;digit++){
var coefficient=tmp%10;
if(coefficient===0&&contains(flags,CJK_ZEROS)&&string!==''){
string=numbers[coefficient]+string;
}else
if(coefficient>1||
coefficient===1&&digit===0||
coefficient===1&&digit===1&&contains(flags,CJK_TEN_COEFFICIENTS)||
coefficient===1&&digit===1&&contains(flags,CJK_TEN_HIGH_COEFFICIENTS)&&value>100||
coefficient===1&&digit>1&&contains(flags,CJK_HUNDRED_COEFFICIENTS)){
string=numbers[coefficient]+(digit>0?multipliers[digit-1]:'')+string;
}else
if(coefficient===1&&digit>0){
string=multipliers[digit-1]+string;
}
tmp=Math.floor(tmp/10);
}
return (value<0?negativeSign:'')+string;
};
var CHINESE_INFORMAL_MULTIPLIERS='十百千萬';
var CHINESE_FORMAL_MULTIPLIERS='拾佰仟萬';
var JAPANESE_NEGATIVE='マイナス';
var KOREAN_NEGATIVE='마이너스';
var createCounterText=function createCounterText(value,type,appendSuffix){
var defaultSuffix=appendSuffix?'. ':'';
var cjkSuffix=appendSuffix?'、':'';
var koreanSuffix=appendSuffix?', ':'';
var spaceSuffix=appendSuffix?' ':'';
switch(type){
case 0/* DISC */:
return '•'+spaceSuffix;
case 1/* CIRCLE */:
return '◦'+spaceSuffix;
case 2/* SQUARE */:
return '◾'+spaceSuffix;
case 5/* DECIMAL_LEADING_ZERO */:
var string=createCounterStyleFromRange(value,48,57,true,defaultSuffix);
return string.length<4?"0"+string:string;
case 4/* CJK_DECIMAL */:
return createCounterStyleFromSymbols(value,'〇一二三四五六七八九',cjkSuffix);
case 6/* LOWER_ROMAN */:
return createAdditiveCounter(value,1,3999,ROMAN_UPPER,3/* DECIMAL */,defaultSuffix).toLowerCase();
case 7/* UPPER_ROMAN */:
return createAdditiveCounter(value,1,3999,ROMAN_UPPER,3/* DECIMAL */,defaultSuffix);
case 8/* LOWER_GREEK */:
return createCounterStyleFromRange(value,945,969,false,defaultSuffix);
case 9/* LOWER_ALPHA */:
return createCounterStyleFromRange(value,97,122,false,defaultSuffix);
case 10/* UPPER_ALPHA */:
return createCounterStyleFromRange(value,65,90,false,defaultSuffix);
case 11/* ARABIC_INDIC */:
return createCounterStyleFromRange(value,1632,1641,true,defaultSuffix);
case 12/* ARMENIAN */:
case 49/* UPPER_ARMENIAN */:
return createAdditiveCounter(value,1,9999,ARMENIAN,3/* DECIMAL */,defaultSuffix);
case 35/* LOWER_ARMENIAN */:
return createAdditiveCounter(value,1,9999,ARMENIAN,3/* DECIMAL */,defaultSuffix).toLowerCase();
case 13/* BENGALI */:
return createCounterStyleFromRange(value,2534,2543,true,defaultSuffix);
case 14/* CAMBODIAN */:
case 30/* KHMER */:
return createCounterStyleFromRange(value,6112,6121,true,defaultSuffix);
case 15/* CJK_EARTHLY_BRANCH */:
return createCounterStyleFromSymbols(value,'子丑寅卯辰巳午未申酉戌亥',cjkSuffix);
case 16/* CJK_HEAVENLY_STEM */:
return createCounterStyleFromSymbols(value,'甲乙丙丁戊己庚辛壬癸',cjkSuffix);
case 17/* CJK_IDEOGRAPHIC */:
case 48/* TRAD_CHINESE_INFORMAL */:
return createCJKCounter(value,'零一二三四五六七八九',CHINESE_INFORMAL_MULTIPLIERS,'負',cjkSuffix,CJK_TEN_COEFFICIENTS|CJK_TEN_HIGH_COEFFICIENTS|CJK_HUNDRED_COEFFICIENTS);
case 47/* TRAD_CHINESE_FORMAL */:
return createCJKCounter(value,'零壹貳參肆伍陸柒捌玖',CHINESE_FORMAL_MULTIPLIERS,'負',cjkSuffix,CJK_ZEROS|CJK_TEN_COEFFICIENTS|CJK_TEN_HIGH_COEFFICIENTS|CJK_HUNDRED_COEFFICIENTS);
case 42/* SIMP_CHINESE_INFORMAL */:
return createCJKCounter(value,'零一二三四五六七八九',CHINESE_INFORMAL_MULTIPLIERS,'负',cjkSuffix,CJK_TEN_COEFFICIENTS|CJK_TEN_HIGH_COEFFICIENTS|CJK_HUNDRED_COEFFICIENTS);
case 41/* SIMP_CHINESE_FORMAL */:
return createCJKCounter(value,'零壹贰叁肆伍陆柒捌玖',CHINESE_FORMAL_MULTIPLIERS,'负',cjkSuffix,CJK_ZEROS|CJK_TEN_COEFFICIENTS|CJK_TEN_HIGH_COEFFICIENTS|CJK_HUNDRED_COEFFICIENTS);
case 26/* JAPANESE_INFORMAL */:
return createCJKCounter(value,'〇一二三四五六七八九','十百千万',JAPANESE_NEGATIVE,cjkSuffix,0);
case 25/* JAPANESE_FORMAL */:
return createCJKCounter(value,'零壱弐参四伍六七八九','拾百千万',JAPANESE_NEGATIVE,cjkSuffix,CJK_ZEROS|CJK_TEN_COEFFICIENTS|CJK_TEN_HIGH_COEFFICIENTS);
case 31/* KOREAN_HANGUL_FORMAL */:
return createCJKCounter(value,'영일이삼사오육칠팔구','십백천만',KOREAN_NEGATIVE,koreanSuffix,CJK_ZEROS|CJK_TEN_COEFFICIENTS|CJK_TEN_HIGH_COEFFICIENTS);
case 33/* KOREAN_HANJA_INFORMAL */:
return createCJKCounter(value,'零一二三四五六七八九','十百千萬',KOREAN_NEGATIVE,koreanSuffix,0);
case 32/* KOREAN_HANJA_FORMAL */:
return createCJKCounter(value,'零壹貳參四五六七八九','拾百千',KOREAN_NEGATIVE,koreanSuffix,CJK_ZEROS|CJK_TEN_COEFFICIENTS|CJK_TEN_HIGH_COEFFICIENTS);
case 18/* DEVANAGARI */:
return createCounterStyleFromRange(value,0x966,0x96f,true,defaultSuffix);
case 20/* GEORGIAN */:
return createAdditiveCounter(value,1,19999,GEORGIAN,3/* DECIMAL */,defaultSuffix);
case 21/* GUJARATI */:
return createCounterStyleFromRange(value,0xae6,0xaef,true,defaultSuffix);
case 22/* GURMUKHI */:
return createCounterStyleFromRange(value,0xa66,0xa6f,true,defaultSuffix);
case 22/* HEBREW */:
return createAdditiveCounter(value,1,10999,HEBREW,3/* DECIMAL */,defaultSuffix);
case 23/* HIRAGANA */:
return createCounterStyleFromSymbols(value,'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん');
case 24/* HIRAGANA_IROHA */:
return createCounterStyleFromSymbols(value,'いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす');
case 27/* KANNADA */:
return createCounterStyleFromRange(value,0xce6,0xcef,true,defaultSuffix);
case 28/* KATAKANA */:
return createCounterStyleFromSymbols(value,'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン',cjkSuffix);
case 29/* KATAKANA_IROHA */:
return createCounterStyleFromSymbols(value,'イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス',cjkSuffix);
case 34/* LAO */:
return createCounterStyleFromRange(value,0xed0,0xed9,true,defaultSuffix);
case 37/* MONGOLIAN */:
return createCounterStyleFromRange(value,0x1810,0x1819,true,defaultSuffix);
case 38/* MYANMAR */:
return createCounterStyleFromRange(value,0x1040,0x1049,true,defaultSuffix);
case 39/* ORIYA */:
return createCounterStyleFromRange(value,0xb66,0xb6f,true,defaultSuffix);
case 40/* PERSIAN */:
return createCounterStyleFromRange(value,0x6f0,0x6f9,true,defaultSuffix);
case 43/* TAMIL */:
return createCounterStyleFromRange(value,0xbe6,0xbef,true,defaultSuffix);
case 44/* TELUGU */:
return createCounterStyleFromRange(value,0xc66,0xc6f,true,defaultSuffix);
case 45/* THAI */:
return createCounterStyleFromRange(value,0xe50,0xe59,true,defaultSuffix);
case 46/* TIBETAN */:
return createCounterStyleFromRange(value,0xf20,0xf29,true,defaultSuffix);
case 3/* DECIMAL */:
default:
return createCounterStyleFromRange(value,48,57,true,defaultSuffix);}

};

var IGNORE_ATTRIBUTE='data-html2canvas-ignore';
var DocumentCloner=/** @class */function(){
function DocumentCloner(context,element,options){
this.context=context;
this.options=options;
this.scrolledElements=[];
this.referenceElement=element;
this.counters=new CounterState();
this.quoteDepth=0;
if(!element.ownerDocument){
throw new Error('Cloned element does not have an owner document');
}
this.documentElement=this.cloneNode(element.ownerDocument.documentElement,false);
}
DocumentCloner.prototype.toIFrame=function(ownerDocument,windowSize){
var _this=this;
var iframe=createIFrameContainer(ownerDocument,windowSize);
if(!iframe.contentWindow){
return Promise.reject("Unable to find iframe window");
}
var scrollX=ownerDocument.defaultView.pageXOffset;
var scrollY=ownerDocument.defaultView.pageYOffset;
var cloneWindow=iframe.contentWindow;
var documentClone=cloneWindow.document;
/* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle
             if window url is about:blank, we can assign the url to current by writing onto the document
             */
var iframeLoad=iframeLoader(iframe).then(function(){return __awaiter(_this,void 0,void 0,function(){
var onclone,referenceElement;
return __generator(this,function(_a){
switch(_a.label){
case 0:
this.scrolledElements.forEach(restoreNodeScroll);
if(cloneWindow){
cloneWindow.scrollTo(windowSize.left,windowSize.top);
if(/(iPad|iPhone|iPod)/g.test(navigator.userAgent)&&(
cloneWindow.scrollY!==windowSize.top||cloneWindow.scrollX!==windowSize.left)){
this.context.logger.warn('Unable to restore scroll position for cloned document');
this.context.windowBounds=this.context.windowBounds.add(cloneWindow.scrollX-windowSize.left,cloneWindow.scrollY-windowSize.top,0,0);
}
}
onclone=this.options.onclone;
referenceElement=this.clonedReferenceElement;
if(typeof referenceElement==='undefined'){
return [2/*return*/,Promise.reject("Error finding the "+this.referenceElement.nodeName+" in the cloned document")];
}
if(!(documentClone.fonts&&documentClone.fonts.ready))return [3/*break*/,2];
return [4/*yield*/,documentClone.fonts.ready];
case 1:
_a.sent();
_a.label=2;
case 2:
if(!/(AppleWebKit)/g.test(navigator.userAgent))return [3/*break*/,4];
return [4/*yield*/,imagesReady(documentClone)];
case 3:
_a.sent();
_a.label=4;
case 4:
if(typeof onclone==='function'){
return [2/*return*/,Promise.resolve().
then(function(){return onclone(documentClone,referenceElement);}).
then(function(){return iframe;})];
}
return [2/*return*/,iframe];}

});
});});
documentClone.open();
documentClone.write(serializeDoctype(document.doctype)+"<html></html>");
// Chrome scrolls the parent document for some reason after the write to the cloned window???
restoreOwnerScroll(this.referenceElement.ownerDocument,scrollX,scrollY);
documentClone.replaceChild(documentClone.adoptNode(this.documentElement),documentClone.documentElement);
documentClone.close();
return iframeLoad;
};
DocumentCloner.prototype.createElementClone=function(node){
if(isDebugging(node,2/* CLONE */)){
debugger;
}
if(isCanvasElement(node)){
return this.createCanvasClone(node);
}
if(isVideoElement(node)){
return this.createVideoClone(node);
}
if(isStyleElement(node)){
return this.createStyleClone(node);
}
var clone=node.cloneNode(false);
if(isImageElement(clone)){
if(isImageElement(node)&&node.currentSrc&&node.currentSrc!==node.src){
clone.src=node.currentSrc;
clone.srcset='';
}
if(clone.loading==='lazy'){
clone.loading='eager';
}
}
if(isCustomElement(clone)){
return this.createCustomElementClone(clone);
}
return clone;
};
DocumentCloner.prototype.createCustomElementClone=function(node){
var clone=document.createElement('html2canvascustomelement');
copyCSSStyles(node.style,clone);
return clone;
};
DocumentCloner.prototype.createStyleClone=function(node){
try{
var sheet=node.sheet;
if(sheet&&sheet.cssRules){
var css=[].slice.call(sheet.cssRules,0).reduce(function(css,rule){
if(rule&&typeof rule.cssText==='string'){
return css+rule.cssText;
}
return css;
},'');
var style=node.cloneNode(false);
style.textContent=css;
return style;
}
}
catch(e){
// accessing node.sheet.cssRules throws a DOMException
this.context.logger.error('Unable to access cssRules property',e);
if(e.name!=='SecurityError'){
throw e;
}
}
return node.cloneNode(false);
};
DocumentCloner.prototype.createCanvasClone=function(canvas){
var _a;
if(this.options.inlineImages&&canvas.ownerDocument){
var img=canvas.ownerDocument.createElement('img');
try{
img.src=canvas.toDataURL();
return img;
}
catch(e){
this.context.logger.info("Unable to inline canvas contents, canvas is tainted",canvas);
}
}
var clonedCanvas=canvas.cloneNode(false);
try{
clonedCanvas.width=canvas.width;
clonedCanvas.height=canvas.height;
var ctx=canvas.getContext('2d');
var clonedCtx=clonedCanvas.getContext('2d');
if(clonedCtx){
if(!this.options.allowTaint&&ctx){
clonedCtx.putImageData(ctx.getImageData(0,0,canvas.width,canvas.height),0,0);
}else
{
var gl=(_a=canvas.getContext('webgl2'))!==null&&_a!==void 0?_a:canvas.getContext('webgl');
if(gl){
var attribs=gl.getContextAttributes();
if((attribs===null||attribs===void 0?void 0:attribs.preserveDrawingBuffer)===false){
this.context.logger.warn('Unable to clone WebGL context as it has preserveDrawingBuffer=false',canvas);
}
}
clonedCtx.drawImage(canvas,0,0);
}
}
return clonedCanvas;
}
catch(e){
this.context.logger.info("Unable to clone canvas as it is tainted",canvas);
}
return clonedCanvas;
};
DocumentCloner.prototype.createVideoClone=function(video){
var canvas=video.ownerDocument.createElement('canvas');
canvas.width=video.offsetWidth;
canvas.height=video.offsetHeight;
var ctx=canvas.getContext('2d');
try{
if(ctx){
ctx.drawImage(video,0,0,canvas.width,canvas.height);
if(!this.options.allowTaint){
ctx.getImageData(0,0,canvas.width,canvas.height);
}
}
return canvas;
}
catch(e){
this.context.logger.info("Unable to clone video as it is tainted",video);
}
var blankCanvas=video.ownerDocument.createElement('canvas');
blankCanvas.width=video.offsetWidth;
blankCanvas.height=video.offsetHeight;
return blankCanvas;
};
DocumentCloner.prototype.appendChildNode=function(clone,child,copyStyles){
if(!isElementNode(child)||
!isScriptElement(child)&&
!child.hasAttribute(IGNORE_ATTRIBUTE)&&(
typeof this.options.ignoreElements!=='function'||!this.options.ignoreElements(child))){
if(!this.options.copyStyles||!isElementNode(child)||!isStyleElement(child)){
clone.appendChild(this.cloneNode(child,copyStyles));
}
}
};
DocumentCloner.prototype.cloneChildNodes=function(node,clone,copyStyles){
var _this=this;
for(var child=node.shadowRoot?node.shadowRoot.firstChild:node.firstChild;child;child=child.nextSibling){
if(isElementNode(child)&&isSlotElement(child)&&typeof child.assignedNodes==='function'){
var assignedNodes=child.assignedNodes();
if(assignedNodes.length){
assignedNodes.forEach(function(assignedNode){return _this.appendChildNode(clone,assignedNode,copyStyles);});
}
}else
{
this.appendChildNode(clone,child,copyStyles);
}
}
};
DocumentCloner.prototype.cloneNode=function(node,copyStyles){
if(isTextNode(node)){
return document.createTextNode(node.data);
}
if(!node.ownerDocument){
return node.cloneNode(false);
}
var window=node.ownerDocument.defaultView;
if(window&&isElementNode(node)&&(isHTMLElementNode(node)||isSVGElementNode(node))){
var clone=this.createElementClone(node);
clone.style.transitionProperty='none';
var style=window.getComputedStyle(node);
var styleBefore=window.getComputedStyle(node,':before');
var styleAfter=window.getComputedStyle(node,':after');
if(this.referenceElement===node&&isHTMLElementNode(clone)){
this.clonedReferenceElement=clone;
}
if(isBodyElement(clone)){
createPseudoHideStyles(clone);
}
var counters=this.counters.parse(new CSSParsedCounterDeclaration(this.context,style));
var before=this.resolvePseudoContent(node,clone,styleBefore,PseudoElementType.BEFORE);
if(isCustomElement(node)){
copyStyles=true;
}
if(!isVideoElement(node)){
this.cloneChildNodes(node,clone,copyStyles);
}
if(before){
clone.insertBefore(before,clone.firstChild);
}
var after=this.resolvePseudoContent(node,clone,styleAfter,PseudoElementType.AFTER);
if(after){
clone.appendChild(after);
}
this.counters.pop(counters);
if(style&&(this.options.copyStyles||isSVGElementNode(node))&&!isIFrameElement(node)||
copyStyles){
copyCSSStyles(style,clone);
}
if(node.scrollTop!==0||node.scrollLeft!==0){
this.scrolledElements.push([clone,node.scrollLeft,node.scrollTop]);
}
if((isTextareaElement(node)||isSelectElement(node))&&(
isTextareaElement(clone)||isSelectElement(clone))){
clone.value=node.value;
}
return clone;
}
return node.cloneNode(false);
};
DocumentCloner.prototype.resolvePseudoContent=function(node,clone,style,pseudoElt){
var _this=this;
if(!style){
return;
}
var value=style.content;
var document=clone.ownerDocument;
if(!document||!value||value==='none'||value==='-moz-alt-content'||style.display==='none'){
return;
}
this.counters.parse(new CSSParsedCounterDeclaration(this.context,style));
var declaration=new CSSParsedPseudoDeclaration(this.context,style);
var anonymousReplacedElement=document.createElement('html2canvaspseudoelement');
copyCSSStyles(style,anonymousReplacedElement);
declaration.content.forEach(function(token){
if(token.type===0/* STRING_TOKEN */){
anonymousReplacedElement.appendChild(document.createTextNode(token.value));
}else
if(token.type===22/* URL_TOKEN */){
var img=document.createElement('img');
img.src=token.value;
img.style.opacity='1';
anonymousReplacedElement.appendChild(img);
}else
if(token.type===18/* FUNCTION */){
if(token.name==='attr'){
var attr=token.values.filter(isIdentToken);
if(attr.length){
anonymousReplacedElement.appendChild(document.createTextNode(node.getAttribute(attr[0].value)||''));
}
}else
if(token.name==='counter'){
var _a=token.values.filter(nonFunctionArgSeparator),counter=_a[0],counterStyle=_a[1];
if(counter&&isIdentToken(counter)){
var counterState=_this.counters.getCounterValue(counter.value);
var counterType=counterStyle&&isIdentToken(counterStyle)?
listStyleType.parse(_this.context,counterStyle.value):
3/* DECIMAL */;
anonymousReplacedElement.appendChild(document.createTextNode(createCounterText(counterState,counterType,false)));
}
}else
if(token.name==='counters'){
var _b=token.values.filter(nonFunctionArgSeparator),counter=_b[0],delim=_b[1],counterStyle=_b[2];
if(counter&&isIdentToken(counter)){
var counterStates=_this.counters.getCounterValues(counter.value);
var counterType_1=counterStyle&&isIdentToken(counterStyle)?
listStyleType.parse(_this.context,counterStyle.value):
3/* DECIMAL */;
var separator=delim&&delim.type===0/* STRING_TOKEN */?delim.value:'';
var text=counterStates.
map(function(value){return createCounterText(value,counterType_1,false);}).
join(separator);
anonymousReplacedElement.appendChild(document.createTextNode(text));
}
}
}else
if(token.type===20/* IDENT_TOKEN */){
switch(token.value){
case'open-quote':
anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes,_this.quoteDepth++,true)));
break;
case'close-quote':
anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes,--_this.quoteDepth,false)));
break;
default:
// safari doesn't parse string tokens correctly because of lack of quotes
anonymousReplacedElement.appendChild(document.createTextNode(token.value));}

}
});
anonymousReplacedElement.className=PSEUDO_HIDE_ELEMENT_CLASS_BEFORE+" "+PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
var newClassName=pseudoElt===PseudoElementType.BEFORE?
" "+PSEUDO_HIDE_ELEMENT_CLASS_BEFORE:
" "+PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
if(isSVGElementNode(clone)){
clone.className.baseValue+=newClassName;
}else
{
clone.className+=newClassName;
}
return anonymousReplacedElement;
};
DocumentCloner.destroy=function(container){
if(container.parentNode){
container.parentNode.removeChild(container);
return true;
}
return false;
};
return DocumentCloner;
}();
var PseudoElementType;
(function(PseudoElementType){
PseudoElementType[PseudoElementType["BEFORE"]=0]="BEFORE";
PseudoElementType[PseudoElementType["AFTER"]=1]="AFTER";
})(PseudoElementType||(PseudoElementType={}));
var createIFrameContainer=function createIFrameContainer(ownerDocument,bounds){
var cloneIframeContainer=ownerDocument.createElement('iframe');
cloneIframeContainer.className='html2canvas-container';
cloneIframeContainer.style.visibility='hidden';
cloneIframeContainer.style.position='fixed';
cloneIframeContainer.style.left='-10000px';
cloneIframeContainer.style.top='0px';
cloneIframeContainer.style.border='0';
cloneIframeContainer.width=bounds.width.toString();
cloneIframeContainer.height=bounds.height.toString();
cloneIframeContainer.scrolling='no';// ios won't scroll without it
cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE,'true');
ownerDocument.body.appendChild(cloneIframeContainer);
return cloneIframeContainer;
};
var imageReady=function imageReady(img){
return new Promise(function(resolve){
if(img.complete){
resolve();
return;
}
if(!img.src){
resolve();
return;
}
img.onload=resolve;
img.onerror=resolve;
});
};
var imagesReady=function imagesReady(document){
return Promise.all([].slice.call(document.images,0).map(imageReady));
};
var iframeLoader=function iframeLoader(iframe){
return new Promise(function(resolve,reject){
var cloneWindow=iframe.contentWindow;
if(!cloneWindow){
return reject("No window assigned for iframe");
}
var documentClone=cloneWindow.document;
cloneWindow.onload=iframe.onload=function(){
cloneWindow.onload=iframe.onload=null;
var interval=setInterval(function(){
if(documentClone.body.childNodes.length>0&&documentClone.readyState==='complete'){
clearInterval(interval);
resolve(iframe);
}
},50);
};
});
};
var ignoredStyleProperties=[
'all',
'd',
'content'// Safari shows pseudoelements if content is set
];
var copyCSSStyles=function copyCSSStyles(style,target){
// Edge does not provide value for cssText
for(var i=style.length-1;i>=0;i--){
var property=style.item(i);
if(ignoredStyleProperties.indexOf(property)===-1){
target.style.setProperty(property,style.getPropertyValue(property));
}
}
return target;
};
var serializeDoctype=function serializeDoctype(doctype){
var str='';
if(doctype){
str+='<!DOCTYPE ';
if(doctype.name){
str+=doctype.name;
}
if(doctype.internalSubset){
str+=doctype.internalSubset;
}
if(doctype.publicId){
str+="\""+doctype.publicId+"\"";
}
if(doctype.systemId){
str+="\""+doctype.systemId+"\"";
}
str+='>';
}
return str;
};
var restoreOwnerScroll=function restoreOwnerScroll(ownerDocument,x,y){
if(ownerDocument&&
ownerDocument.defaultView&&(
x!==ownerDocument.defaultView.pageXOffset||y!==ownerDocument.defaultView.pageYOffset)){
ownerDocument.defaultView.scrollTo(x,y);
}
};
var restoreNodeScroll=function restoreNodeScroll(_a){
var element=_a[0],x=_a[1],y=_a[2];
element.scrollLeft=x;
element.scrollTop=y;
};
var PSEUDO_BEFORE=':before';
var PSEUDO_AFTER=':after';
var PSEUDO_HIDE_ELEMENT_CLASS_BEFORE='___html2canvas___pseudoelement_before';
var PSEUDO_HIDE_ELEMENT_CLASS_AFTER='___html2canvas___pseudoelement_after';
var PSEUDO_HIDE_ELEMENT_STYLE="{\n    content: \"\" !important;\n    display: none !important;\n}";
var createPseudoHideStyles=function createPseudoHideStyles(body){
createStyles(body,"."+PSEUDO_HIDE_ELEMENT_CLASS_BEFORE+PSEUDO_BEFORE+PSEUDO_HIDE_ELEMENT_STYLE+"\n         ."+PSEUDO_HIDE_ELEMENT_CLASS_AFTER+PSEUDO_AFTER+PSEUDO_HIDE_ELEMENT_STYLE);
};
var createStyles=function createStyles(body,styles){
var document=body.ownerDocument;
if(document){
var style=document.createElement('style');
style.textContent=styles;
body.appendChild(style);
}
};

var CacheStorage=/** @class */function(){
function CacheStorage(){
}
CacheStorage.getOrigin=function(url){
var link=CacheStorage._link;
if(!link){
return 'about:blank';
}
link.href=url;
link.href=link.href;// IE9, LOL! - http://jsfiddle.net/niklasvh/2e48b/
return link.protocol+link.hostname+link.port;
};
CacheStorage.isSameOrigin=function(src){
return CacheStorage.getOrigin(src)===CacheStorage._origin;
};
CacheStorage.setContext=function(window){
CacheStorage._link=window.document.createElement('a');
CacheStorage._origin=CacheStorage.getOrigin(window.location.href);
};
CacheStorage._origin='about:blank';
return CacheStorage;
}();
var Cache=/** @class */function(){
function Cache(context,_options){
this.context=context;
this._options=_options;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
this._cache={};
}
Cache.prototype.addImage=function(src){
var result=Promise.resolve();
if(this.has(src)){
return result;
}
if(isBlobImage(src)||isRenderable(src)){
(this._cache[src]=this.loadImage(src)).catch(function(){
// prevent unhandled rejection
});
return result;
}
return result;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Cache.prototype.match=function(src){
return this._cache[src];
};
Cache.prototype.loadImage=function(key){
return __awaiter(this,void 0,void 0,function(){
var isSameOrigin,useCORS,useProxy,src;
var _this=this;
return __generator(this,function(_a){
switch(_a.label){
case 0:
isSameOrigin=CacheStorage.isSameOrigin(key);
useCORS=!isInlineImage(key)&&this._options.useCORS===true&&FEATURES.SUPPORT_CORS_IMAGES&&!isSameOrigin;
useProxy=!isInlineImage(key)&&
!isSameOrigin&&
!isBlobImage(key)&&
typeof this._options.proxy==='string'&&
FEATURES.SUPPORT_CORS_XHR&&
!useCORS;
if(!isSameOrigin&&
this._options.allowTaint===false&&
!isInlineImage(key)&&
!isBlobImage(key)&&
!useProxy&&
!useCORS){
return [2/*return*/];
}
src=key;
if(!useProxy)return [3/*break*/,2];
return [4/*yield*/,this.proxy(src)];
case 1:
src=_a.sent();
_a.label=2;
case 2:
this.context.logger.debug("Added image "+key.substring(0,256));
return [4/*yield*/,new Promise(function(resolve,reject){
var img=new Image();
img.onload=function(){return resolve(img);};
img.onerror=reject;
//ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous
if(isInlineBase64Image(src)||useCORS){
img.crossOrigin='anonymous';
}
img.src=src;
if(img.complete===true){
// Inline XML images may fail to parse, throwing an Error later on
setTimeout(function(){return resolve(img);},500);
}
if(_this._options.imageTimeout>0){
setTimeout(function(){return reject("Timed out ("+_this._options.imageTimeout+"ms) loading image");},_this._options.imageTimeout);
}
})];
case 3:return [2/*return*/,_a.sent()];}

});
});
};
Cache.prototype.has=function(key){
return typeof this._cache[key]!=='undefined';
};
Cache.prototype.keys=function(){
return Promise.resolve(Object.keys(this._cache));
};
Cache.prototype.proxy=function(src){
var _this=this;
var proxy=this._options.proxy;
if(!proxy){
throw new Error('No proxy defined');
}
var key=src.substring(0,256);
return new Promise(function(resolve,reject){
var responseType=FEATURES.SUPPORT_RESPONSE_TYPE?'blob':'text';
var xhr=new XMLHttpRequest();
xhr.onload=function(){
if(xhr.status===200){
if(responseType==='text'){
resolve(xhr.response);
}else
{
var reader_1=new FileReader();
reader_1.addEventListener('load',function(){return resolve(reader_1.result);},false);
reader_1.addEventListener('error',function(e){return reject(e);},false);
reader_1.readAsDataURL(xhr.response);
}
}else
{
reject("Failed to proxy resource "+key+" with status code "+xhr.status);
}
};
xhr.onerror=reject;
var queryString=proxy.indexOf('?')>-1?'&':'?';
xhr.open('GET',""+proxy+queryString+"url="+encodeURIComponent(src)+"&responseType="+responseType);
if(responseType!=='text'&&xhr instanceof XMLHttpRequest){
xhr.responseType=responseType;
}
if(_this._options.imageTimeout){
var timeout_1=_this._options.imageTimeout;
xhr.timeout=timeout_1;
xhr.ontimeout=function(){return reject("Timed out ("+timeout_1+"ms) proxying "+key);};
}
xhr.send();
});
};
return Cache;
}();
var INLINE_SVG=/^data:image\/svg\+xml/i;
var INLINE_BASE64=/^data:image\/.*;base64,/i;
var INLINE_IMG=/^data:image\/.*/i;
var isRenderable=function isRenderable(src){return FEATURES.SUPPORT_SVG_DRAWING||!isSVG(src);};
var isInlineImage=function isInlineImage(src){return INLINE_IMG.test(src);};
var isInlineBase64Image=function isInlineBase64Image(src){return INLINE_BASE64.test(src);};
var isBlobImage=function isBlobImage(src){return src.substr(0,4)==='blob';};
var isSVG=function isSVG(src){return src.substr(-3).toLowerCase()==='svg'||INLINE_SVG.test(src);};

var Vector=/** @class */function(){
function Vector(x,y){
this.type=0/* VECTOR */;
this.x=x;
this.y=y;
}
Vector.prototype.add=function(deltaX,deltaY){
return new Vector(this.x+deltaX,this.y+deltaY);
};
return Vector;
}();

var lerp=function lerp(a,b,t){
return new Vector(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);
};
var BezierCurve=/** @class */function(){
function BezierCurve(start,startControl,endControl,end){
this.type=1/* BEZIER_CURVE */;
this.start=start;
this.startControl=startControl;
this.endControl=endControl;
this.end=end;
}
BezierCurve.prototype.subdivide=function(t,firstHalf){
var ab=lerp(this.start,this.startControl,t);
var bc=lerp(this.startControl,this.endControl,t);
var cd=lerp(this.endControl,this.end,t);
var abbc=lerp(ab,bc,t);
var bccd=lerp(bc,cd,t);
var dest=lerp(abbc,bccd,t);
return firstHalf?new BezierCurve(this.start,ab,abbc,dest):new BezierCurve(dest,bccd,cd,this.end);
};
BezierCurve.prototype.add=function(deltaX,deltaY){
return new BezierCurve(this.start.add(deltaX,deltaY),this.startControl.add(deltaX,deltaY),this.endControl.add(deltaX,deltaY),this.end.add(deltaX,deltaY));
};
BezierCurve.prototype.reverse=function(){
return new BezierCurve(this.end,this.endControl,this.startControl,this.start);
};
return BezierCurve;
}();
var isBezierCurve=function isBezierCurve(path){return path.type===1/* BEZIER_CURVE */;};

var BoundCurves=/** @class */function(){
function BoundCurves(element){
var styles=element.styles;
var bounds=element.bounds;
var _a=getAbsoluteValueForTuple(styles.borderTopLeftRadius,bounds.width,bounds.height),tlh=_a[0],tlv=_a[1];
var _b=getAbsoluteValueForTuple(styles.borderTopRightRadius,bounds.width,bounds.height),trh=_b[0],trv=_b[1];
var _c=getAbsoluteValueForTuple(styles.borderBottomRightRadius,bounds.width,bounds.height),brh=_c[0],brv=_c[1];
var _d=getAbsoluteValueForTuple(styles.borderBottomLeftRadius,bounds.width,bounds.height),blh=_d[0],blv=_d[1];
var factors=[];
factors.push((tlh+trh)/bounds.width);
factors.push((blh+brh)/bounds.width);
factors.push((tlv+blv)/bounds.height);
factors.push((trv+brv)/bounds.height);
var maxFactor=Math.max.apply(Math,factors);
if(maxFactor>1){
tlh/=maxFactor;
tlv/=maxFactor;
trh/=maxFactor;
trv/=maxFactor;
brh/=maxFactor;
brv/=maxFactor;
blh/=maxFactor;
blv/=maxFactor;
}
var topWidth=bounds.width-trh;
var rightHeight=bounds.height-brv;
var bottomWidth=bounds.width-brh;
var leftHeight=bounds.height-blv;
var borderTopWidth=styles.borderTopWidth;
var borderRightWidth=styles.borderRightWidth;
var borderBottomWidth=styles.borderBottomWidth;
var borderLeftWidth=styles.borderLeftWidth;
var paddingTop=getAbsoluteValue(styles.paddingTop,element.bounds.width);
var paddingRight=getAbsoluteValue(styles.paddingRight,element.bounds.width);
var paddingBottom=getAbsoluteValue(styles.paddingBottom,element.bounds.width);
var paddingLeft=getAbsoluteValue(styles.paddingLeft,element.bounds.width);
this.topLeftBorderDoubleOuterBox=
tlh>0||tlv>0?
getCurvePoints(bounds.left+borderLeftWidth/3,bounds.top+borderTopWidth/3,tlh-borderLeftWidth/3,tlv-borderTopWidth/3,CORNER.TOP_LEFT):
new Vector(bounds.left+borderLeftWidth/3,bounds.top+borderTopWidth/3);
this.topRightBorderDoubleOuterBox=
tlh>0||tlv>0?
getCurvePoints(bounds.left+topWidth,bounds.top+borderTopWidth/3,trh-borderRightWidth/3,trv-borderTopWidth/3,CORNER.TOP_RIGHT):
new Vector(bounds.left+bounds.width-borderRightWidth/3,bounds.top+borderTopWidth/3);
this.bottomRightBorderDoubleOuterBox=
brh>0||brv>0?
getCurvePoints(bounds.left+bottomWidth,bounds.top+rightHeight,brh-borderRightWidth/3,brv-borderBottomWidth/3,CORNER.BOTTOM_RIGHT):
new Vector(bounds.left+bounds.width-borderRightWidth/3,bounds.top+bounds.height-borderBottomWidth/3);
this.bottomLeftBorderDoubleOuterBox=
blh>0||blv>0?
getCurvePoints(bounds.left+borderLeftWidth/3,bounds.top+leftHeight,blh-borderLeftWidth/3,blv-borderBottomWidth/3,CORNER.BOTTOM_LEFT):
new Vector(bounds.left+borderLeftWidth/3,bounds.top+bounds.height-borderBottomWidth/3);
this.topLeftBorderDoubleInnerBox=
tlh>0||tlv>0?
getCurvePoints(bounds.left+borderLeftWidth*2/3,bounds.top+borderTopWidth*2/3,tlh-borderLeftWidth*2/3,tlv-borderTopWidth*2/3,CORNER.TOP_LEFT):
new Vector(bounds.left+borderLeftWidth*2/3,bounds.top+borderTopWidth*2/3);
this.topRightBorderDoubleInnerBox=
tlh>0||tlv>0?
getCurvePoints(bounds.left+topWidth,bounds.top+borderTopWidth*2/3,trh-borderRightWidth*2/3,trv-borderTopWidth*2/3,CORNER.TOP_RIGHT):
new Vector(bounds.left+bounds.width-borderRightWidth*2/3,bounds.top+borderTopWidth*2/3);
this.bottomRightBorderDoubleInnerBox=
brh>0||brv>0?
getCurvePoints(bounds.left+bottomWidth,bounds.top+rightHeight,brh-borderRightWidth*2/3,brv-borderBottomWidth*2/3,CORNER.BOTTOM_RIGHT):
new Vector(bounds.left+bounds.width-borderRightWidth*2/3,bounds.top+bounds.height-borderBottomWidth*2/3);
this.bottomLeftBorderDoubleInnerBox=
blh>0||blv>0?
getCurvePoints(bounds.left+borderLeftWidth*2/3,bounds.top+leftHeight,blh-borderLeftWidth*2/3,blv-borderBottomWidth*2/3,CORNER.BOTTOM_LEFT):
new Vector(bounds.left+borderLeftWidth*2/3,bounds.top+bounds.height-borderBottomWidth*2/3);
this.topLeftBorderStroke=
tlh>0||tlv>0?
getCurvePoints(bounds.left+borderLeftWidth/2,bounds.top+borderTopWidth/2,tlh-borderLeftWidth/2,tlv-borderTopWidth/2,CORNER.TOP_LEFT):
new Vector(bounds.left+borderLeftWidth/2,bounds.top+borderTopWidth/2);
this.topRightBorderStroke=
tlh>0||tlv>0?
getCurvePoints(bounds.left+topWidth,bounds.top+borderTopWidth/2,trh-borderRightWidth/2,trv-borderTopWidth/2,CORNER.TOP_RIGHT):
new Vector(bounds.left+bounds.width-borderRightWidth/2,bounds.top+borderTopWidth/2);
this.bottomRightBorderStroke=
brh>0||brv>0?
getCurvePoints(bounds.left+bottomWidth,bounds.top+rightHeight,brh-borderRightWidth/2,brv-borderBottomWidth/2,CORNER.BOTTOM_RIGHT):
new Vector(bounds.left+bounds.width-borderRightWidth/2,bounds.top+bounds.height-borderBottomWidth/2);
this.bottomLeftBorderStroke=
blh>0||blv>0?
getCurvePoints(bounds.left+borderLeftWidth/2,bounds.top+leftHeight,blh-borderLeftWidth/2,blv-borderBottomWidth/2,CORNER.BOTTOM_LEFT):
new Vector(bounds.left+borderLeftWidth/2,bounds.top+bounds.height-borderBottomWidth/2);
this.topLeftBorderBox=
tlh>0||tlv>0?
getCurvePoints(bounds.left,bounds.top,tlh,tlv,CORNER.TOP_LEFT):
new Vector(bounds.left,bounds.top);
this.topRightBorderBox=
trh>0||trv>0?
getCurvePoints(bounds.left+topWidth,bounds.top,trh,trv,CORNER.TOP_RIGHT):
new Vector(bounds.left+bounds.width,bounds.top);
this.bottomRightBorderBox=
brh>0||brv>0?
getCurvePoints(bounds.left+bottomWidth,bounds.top+rightHeight,brh,brv,CORNER.BOTTOM_RIGHT):
new Vector(bounds.left+bounds.width,bounds.top+bounds.height);
this.bottomLeftBorderBox=
blh>0||blv>0?
getCurvePoints(bounds.left,bounds.top+leftHeight,blh,blv,CORNER.BOTTOM_LEFT):
new Vector(bounds.left,bounds.top+bounds.height);
this.topLeftPaddingBox=
tlh>0||tlv>0?
getCurvePoints(bounds.left+borderLeftWidth,bounds.top+borderTopWidth,Math.max(0,tlh-borderLeftWidth),Math.max(0,tlv-borderTopWidth),CORNER.TOP_LEFT):
new Vector(bounds.left+borderLeftWidth,bounds.top+borderTopWidth);
this.topRightPaddingBox=
trh>0||trv>0?
getCurvePoints(bounds.left+Math.min(topWidth,bounds.width-borderRightWidth),bounds.top+borderTopWidth,topWidth>bounds.width+borderRightWidth?0:Math.max(0,trh-borderRightWidth),Math.max(0,trv-borderTopWidth),CORNER.TOP_RIGHT):
new Vector(bounds.left+bounds.width-borderRightWidth,bounds.top+borderTopWidth);
this.bottomRightPaddingBox=
brh>0||brv>0?
getCurvePoints(bounds.left+Math.min(bottomWidth,bounds.width-borderLeftWidth),bounds.top+Math.min(rightHeight,bounds.height-borderBottomWidth),Math.max(0,brh-borderRightWidth),Math.max(0,brv-borderBottomWidth),CORNER.BOTTOM_RIGHT):
new Vector(bounds.left+bounds.width-borderRightWidth,bounds.top+bounds.height-borderBottomWidth);
this.bottomLeftPaddingBox=
blh>0||blv>0?
getCurvePoints(bounds.left+borderLeftWidth,bounds.top+Math.min(leftHeight,bounds.height-borderBottomWidth),Math.max(0,blh-borderLeftWidth),Math.max(0,blv-borderBottomWidth),CORNER.BOTTOM_LEFT):
new Vector(bounds.left+borderLeftWidth,bounds.top+bounds.height-borderBottomWidth);
this.topLeftContentBox=
tlh>0||tlv>0?
getCurvePoints(bounds.left+borderLeftWidth+paddingLeft,bounds.top+borderTopWidth+paddingTop,Math.max(0,tlh-(borderLeftWidth+paddingLeft)),Math.max(0,tlv-(borderTopWidth+paddingTop)),CORNER.TOP_LEFT):
new Vector(bounds.left+borderLeftWidth+paddingLeft,bounds.top+borderTopWidth+paddingTop);
this.topRightContentBox=
trh>0||trv>0?
getCurvePoints(bounds.left+Math.min(topWidth,bounds.width+borderLeftWidth+paddingLeft),bounds.top+borderTopWidth+paddingTop,topWidth>bounds.width+borderLeftWidth+paddingLeft?0:trh-borderLeftWidth+paddingLeft,trv-(borderTopWidth+paddingTop),CORNER.TOP_RIGHT):
new Vector(bounds.left+bounds.width-(borderRightWidth+paddingRight),bounds.top+borderTopWidth+paddingTop);
this.bottomRightContentBox=
brh>0||brv>0?
getCurvePoints(bounds.left+Math.min(bottomWidth,bounds.width-(borderLeftWidth+paddingLeft)),bounds.top+Math.min(rightHeight,bounds.height+borderTopWidth+paddingTop),Math.max(0,brh-(borderRightWidth+paddingRight)),brv-(borderBottomWidth+paddingBottom),CORNER.BOTTOM_RIGHT):
new Vector(bounds.left+bounds.width-(borderRightWidth+paddingRight),bounds.top+bounds.height-(borderBottomWidth+paddingBottom));
this.bottomLeftContentBox=
blh>0||blv>0?
getCurvePoints(bounds.left+borderLeftWidth+paddingLeft,bounds.top+leftHeight,Math.max(0,blh-(borderLeftWidth+paddingLeft)),blv-(borderBottomWidth+paddingBottom),CORNER.BOTTOM_LEFT):
new Vector(bounds.left+borderLeftWidth+paddingLeft,bounds.top+bounds.height-(borderBottomWidth+paddingBottom));
}
return BoundCurves;
}();
var CORNER;
(function(CORNER){
CORNER[CORNER["TOP_LEFT"]=0]="TOP_LEFT";
CORNER[CORNER["TOP_RIGHT"]=1]="TOP_RIGHT";
CORNER[CORNER["BOTTOM_RIGHT"]=2]="BOTTOM_RIGHT";
CORNER[CORNER["BOTTOM_LEFT"]=3]="BOTTOM_LEFT";
})(CORNER||(CORNER={}));
var getCurvePoints=function getCurvePoints(x,y,r1,r2,position){
var kappa=4*((Math.sqrt(2)-1)/3);
var ox=r1*kappa;// control point offset horizontal
var oy=r2*kappa;// control point offset vertical
var xm=x+r1;// x-middle
var ym=y+r2;// y-middle
switch(position){
case CORNER.TOP_LEFT:
return new BezierCurve(new Vector(x,ym),new Vector(x,ym-oy),new Vector(xm-ox,y),new Vector(xm,y));
case CORNER.TOP_RIGHT:
return new BezierCurve(new Vector(x,y),new Vector(x+ox,y),new Vector(xm,ym-oy),new Vector(xm,ym));
case CORNER.BOTTOM_RIGHT:
return new BezierCurve(new Vector(xm,y),new Vector(xm,y+oy),new Vector(x+ox,ym),new Vector(x,ym));
case CORNER.BOTTOM_LEFT:
default:
return new BezierCurve(new Vector(xm,ym),new Vector(xm-ox,ym),new Vector(x,y+oy),new Vector(x,y));}

};
var calculateBorderBoxPath=function calculateBorderBoxPath(curves){
return [curves.topLeftBorderBox,curves.topRightBorderBox,curves.bottomRightBorderBox,curves.bottomLeftBorderBox];
};
var calculateContentBoxPath=function calculateContentBoxPath(curves){
return [
curves.topLeftContentBox,
curves.topRightContentBox,
curves.bottomRightContentBox,
curves.bottomLeftContentBox];

};
var calculatePaddingBoxPath=function calculatePaddingBoxPath(curves){
return [
curves.topLeftPaddingBox,
curves.topRightPaddingBox,
curves.bottomRightPaddingBox,
curves.bottomLeftPaddingBox];

};

var TransformEffect=/** @class */function(){
function TransformEffect(offsetX,offsetY,matrix){
this.offsetX=offsetX;
this.offsetY=offsetY;
this.matrix=matrix;
this.type=0/* TRANSFORM */;
this.target=2/* BACKGROUND_BORDERS */|4/* CONTENT */;
}
return TransformEffect;
}();
var ClipEffect=/** @class */function(){
function ClipEffect(path,target){
this.path=path;
this.target=target;
this.type=1/* CLIP */;
}
return ClipEffect;
}();
var OpacityEffect=/** @class */function(){
function OpacityEffect(opacity){
this.opacity=opacity;
this.type=2/* OPACITY */;
this.target=2/* BACKGROUND_BORDERS */|4/* CONTENT */;
}
return OpacityEffect;
}();
var isTransformEffect=function isTransformEffect(effect){
return effect.type===0/* TRANSFORM */;
};
var isClipEffect=function isClipEffect(effect){return effect.type===1/* CLIP */;};
var isOpacityEffect=function isOpacityEffect(effect){return effect.type===2/* OPACITY */;};

var equalPath=function equalPath(a,b){
if(a.length===b.length){
return a.some(function(v,i){return v===b[i];});
}
return false;
};
var transformPath=function transformPath(path,deltaX,deltaY,deltaW,deltaH){
return path.map(function(point,index){
switch(index){
case 0:
return point.add(deltaX,deltaY);
case 1:
return point.add(deltaX+deltaW,deltaY);
case 2:
return point.add(deltaX+deltaW,deltaY+deltaH);
case 3:
return point.add(deltaX,deltaY+deltaH);}

return point;
});
};

var StackingContext=/** @class */function(){
function StackingContext(container){
this.element=container;
this.inlineLevel=[];
this.nonInlineLevel=[];
this.negativeZIndex=[];
this.zeroOrAutoZIndexOrTransformedOrOpacity=[];
this.positiveZIndex=[];
this.nonPositionedFloats=[];
this.nonPositionedInlineLevel=[];
}
return StackingContext;
}();
var ElementPaint=/** @class */function(){
function ElementPaint(container,parent){
this.container=container;
this.parent=parent;
this.effects=[];
this.curves=new BoundCurves(this.container);
if(this.container.styles.opacity<1){
this.effects.push(new OpacityEffect(this.container.styles.opacity));
}
if(this.container.styles.transform!==null){
var offsetX=this.container.bounds.left+this.container.styles.transformOrigin[0].number;
var offsetY=this.container.bounds.top+this.container.styles.transformOrigin[1].number;
var matrix=this.container.styles.transform;
this.effects.push(new TransformEffect(offsetX,offsetY,matrix));
}
if(this.container.styles.overflowX!==0/* VISIBLE */){
var borderBox=calculateBorderBoxPath(this.curves);
var paddingBox=calculatePaddingBoxPath(this.curves);
if(equalPath(borderBox,paddingBox)){
this.effects.push(new ClipEffect(borderBox,2/* BACKGROUND_BORDERS */|4/* CONTENT */));
}else
{
this.effects.push(new ClipEffect(borderBox,2/* BACKGROUND_BORDERS */));
this.effects.push(new ClipEffect(paddingBox,4/* CONTENT */));
}
}
}
ElementPaint.prototype.getEffects=function(target){
var inFlow=[2/* ABSOLUTE */,3/* FIXED */].indexOf(this.container.styles.position)===-1;
var parent=this.parent;
var effects=this.effects.slice(0);
while(parent){
var croplessEffects=parent.effects.filter(function(effect){return !isClipEffect(effect);});
if(inFlow||parent.container.styles.position!==0/* STATIC */||!parent.parent){
effects.unshift.apply(effects,croplessEffects);
inFlow=[2/* ABSOLUTE */,3/* FIXED */].indexOf(parent.container.styles.position)===-1;
if(parent.container.styles.overflowX!==0/* VISIBLE */){
var borderBox=calculateBorderBoxPath(parent.curves);
var paddingBox=calculatePaddingBoxPath(parent.curves);
if(!equalPath(borderBox,paddingBox)){
effects.unshift(new ClipEffect(paddingBox,2/* BACKGROUND_BORDERS */|4/* CONTENT */));
}
}
}else
{
effects.unshift.apply(effects,croplessEffects);
}
parent=parent.parent;
}
return effects.filter(function(effect){return contains(effect.target,target);});
};
return ElementPaint;
}();
var parseStackTree=function parseStackTree(parent,stackingContext,realStackingContext,listItems){
parent.container.elements.forEach(function(child){
var treatAsRealStackingContext=contains(child.flags,4/* CREATES_REAL_STACKING_CONTEXT */);
var createsStackingContext=contains(child.flags,2/* CREATES_STACKING_CONTEXT */);
var paintContainer=new ElementPaint(child,parent);
if(contains(child.styles.display,2048/* LIST_ITEM */)){
listItems.push(paintContainer);
}
var listOwnerItems=contains(child.flags,8/* IS_LIST_OWNER */)?[]:listItems;
if(treatAsRealStackingContext||createsStackingContext){
var parentStack=treatAsRealStackingContext||child.styles.isPositioned()?realStackingContext:stackingContext;
var stack=new StackingContext(paintContainer);
if(child.styles.isPositioned()||child.styles.opacity<1||child.styles.isTransformed()){
var order_1=child.styles.zIndex.order;
if(order_1<0){
var index_1=0;
parentStack.negativeZIndex.some(function(current,i){
if(order_1>current.element.container.styles.zIndex.order){
index_1=i;
return false;
}else
if(index_1>0){
return true;
}
return false;
});
parentStack.negativeZIndex.splice(index_1,0,stack);
}else
if(order_1>0){
var index_2=0;
parentStack.positiveZIndex.some(function(current,i){
if(order_1>=current.element.container.styles.zIndex.order){
index_2=i+1;
return false;
}else
if(index_2>0){
return true;
}
return false;
});
parentStack.positiveZIndex.splice(index_2,0,stack);
}else
{
parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
}
}else
{
if(child.styles.isFloating()){
parentStack.nonPositionedFloats.push(stack);
}else
{
parentStack.nonPositionedInlineLevel.push(stack);
}
}
parseStackTree(paintContainer,stack,treatAsRealStackingContext?stack:realStackingContext,listOwnerItems);
}else
{
if(child.styles.isInlineLevel()){
stackingContext.inlineLevel.push(paintContainer);
}else
{
stackingContext.nonInlineLevel.push(paintContainer);
}
parseStackTree(paintContainer,stackingContext,realStackingContext,listOwnerItems);
}
if(contains(child.flags,8/* IS_LIST_OWNER */)){
processListItems(child,listOwnerItems);
}
});
};
var processListItems=function processListItems(owner,elements){
var numbering=owner instanceof OLElementContainer?owner.start:1;
var reversed=owner instanceof OLElementContainer?owner.reversed:false;
for(var i=0;i<elements.length;i++){
var item=elements[i];
if(item.container instanceof LIElementContainer&&
typeof item.container.value==='number'&&
item.container.value!==0){
numbering=item.container.value;
}
item.listValue=createCounterText(numbering,item.container.styles.listStyleType,true);
numbering+=reversed?-1:1;
}
};
var parseStackingContexts=function parseStackingContexts(container){
var paintContainer=new ElementPaint(container,null);
var root=new StackingContext(paintContainer);
var listItems=[];
parseStackTree(paintContainer,root,root,listItems);
processListItems(paintContainer.container,listItems);
return root;
};

var parsePathForBorder=function parsePathForBorder(curves,borderSide){
switch(borderSide){
case 0:
return createPathFromCurves(curves.topLeftBorderBox,curves.topLeftPaddingBox,curves.topRightBorderBox,curves.topRightPaddingBox);
case 1:
return createPathFromCurves(curves.topRightBorderBox,curves.topRightPaddingBox,curves.bottomRightBorderBox,curves.bottomRightPaddingBox);
case 2:
return createPathFromCurves(curves.bottomRightBorderBox,curves.bottomRightPaddingBox,curves.bottomLeftBorderBox,curves.bottomLeftPaddingBox);
case 3:
default:
return createPathFromCurves(curves.bottomLeftBorderBox,curves.bottomLeftPaddingBox,curves.topLeftBorderBox,curves.topLeftPaddingBox);}

};
var parsePathForBorderDoubleOuter=function parsePathForBorderDoubleOuter(curves,borderSide){
switch(borderSide){
case 0:
return createPathFromCurves(curves.topLeftBorderBox,curves.topLeftBorderDoubleOuterBox,curves.topRightBorderBox,curves.topRightBorderDoubleOuterBox);
case 1:
return createPathFromCurves(curves.topRightBorderBox,curves.topRightBorderDoubleOuterBox,curves.bottomRightBorderBox,curves.bottomRightBorderDoubleOuterBox);
case 2:
return createPathFromCurves(curves.bottomRightBorderBox,curves.bottomRightBorderDoubleOuterBox,curves.bottomLeftBorderBox,curves.bottomLeftBorderDoubleOuterBox);
case 3:
default:
return createPathFromCurves(curves.bottomLeftBorderBox,curves.bottomLeftBorderDoubleOuterBox,curves.topLeftBorderBox,curves.topLeftBorderDoubleOuterBox);}

};
var parsePathForBorderDoubleInner=function parsePathForBorderDoubleInner(curves,borderSide){
switch(borderSide){
case 0:
return createPathFromCurves(curves.topLeftBorderDoubleInnerBox,curves.topLeftPaddingBox,curves.topRightBorderDoubleInnerBox,curves.topRightPaddingBox);
case 1:
return createPathFromCurves(curves.topRightBorderDoubleInnerBox,curves.topRightPaddingBox,curves.bottomRightBorderDoubleInnerBox,curves.bottomRightPaddingBox);
case 2:
return createPathFromCurves(curves.bottomRightBorderDoubleInnerBox,curves.bottomRightPaddingBox,curves.bottomLeftBorderDoubleInnerBox,curves.bottomLeftPaddingBox);
case 3:
default:
return createPathFromCurves(curves.bottomLeftBorderDoubleInnerBox,curves.bottomLeftPaddingBox,curves.topLeftBorderDoubleInnerBox,curves.topLeftPaddingBox);}

};
var parsePathForBorderStroke=function parsePathForBorderStroke(curves,borderSide){
switch(borderSide){
case 0:
return createStrokePathFromCurves(curves.topLeftBorderStroke,curves.topRightBorderStroke);
case 1:
return createStrokePathFromCurves(curves.topRightBorderStroke,curves.bottomRightBorderStroke);
case 2:
return createStrokePathFromCurves(curves.bottomRightBorderStroke,curves.bottomLeftBorderStroke);
case 3:
default:
return createStrokePathFromCurves(curves.bottomLeftBorderStroke,curves.topLeftBorderStroke);}

};
var createStrokePathFromCurves=function createStrokePathFromCurves(outer1,outer2){
var path=[];
if(isBezierCurve(outer1)){
path.push(outer1.subdivide(0.5,false));
}else
{
path.push(outer1);
}
if(isBezierCurve(outer2)){
path.push(outer2.subdivide(0.5,true));
}else
{
path.push(outer2);
}
return path;
};
var createPathFromCurves=function createPathFromCurves(outer1,inner1,outer2,inner2){
var path=[];
if(isBezierCurve(outer1)){
path.push(outer1.subdivide(0.5,false));
}else
{
path.push(outer1);
}
if(isBezierCurve(outer2)){
path.push(outer2.subdivide(0.5,true));
}else
{
path.push(outer2);
}
if(isBezierCurve(inner2)){
path.push(inner2.subdivide(0.5,true).reverse());
}else
{
path.push(inner2);
}
if(isBezierCurve(inner1)){
path.push(inner1.subdivide(0.5,false).reverse());
}else
{
path.push(inner1);
}
return path;
};

var paddingBox=function paddingBox(element){
var bounds=element.bounds;
var styles=element.styles;
return bounds.add(styles.borderLeftWidth,styles.borderTopWidth,-(styles.borderRightWidth+styles.borderLeftWidth),-(styles.borderTopWidth+styles.borderBottomWidth));
};
var contentBox=function contentBox(element){
var styles=element.styles;
var bounds=element.bounds;
var paddingLeft=getAbsoluteValue(styles.paddingLeft,bounds.width);
var paddingRight=getAbsoluteValue(styles.paddingRight,bounds.width);
var paddingTop=getAbsoluteValue(styles.paddingTop,bounds.width);
var paddingBottom=getAbsoluteValue(styles.paddingBottom,bounds.width);
return bounds.add(paddingLeft+styles.borderLeftWidth,paddingTop+styles.borderTopWidth,-(styles.borderRightWidth+styles.borderLeftWidth+paddingLeft+paddingRight),-(styles.borderTopWidth+styles.borderBottomWidth+paddingTop+paddingBottom));
};

var calculateBackgroundPositioningArea=function calculateBackgroundPositioningArea(backgroundOrigin,element){
if(backgroundOrigin===0/* BORDER_BOX */){
return element.bounds;
}
if(backgroundOrigin===2/* CONTENT_BOX */){
return contentBox(element);
}
return paddingBox(element);
};
var calculateBackgroundPaintingArea=function calculateBackgroundPaintingArea(backgroundClip,element){
if(backgroundClip===0/* BORDER_BOX */){
return element.bounds;
}
if(backgroundClip===2/* CONTENT_BOX */){
return contentBox(element);
}
return paddingBox(element);
};
var calculateBackgroundRendering=function calculateBackgroundRendering(container,index,intrinsicSize){
var backgroundPositioningArea=calculateBackgroundPositioningArea(getBackgroundValueForIndex(container.styles.backgroundOrigin,index),container);
var backgroundPaintingArea=calculateBackgroundPaintingArea(getBackgroundValueForIndex(container.styles.backgroundClip,index),container);
var backgroundImageSize=calculateBackgroundSize(getBackgroundValueForIndex(container.styles.backgroundSize,index),intrinsicSize,backgroundPositioningArea);
var sizeWidth=backgroundImageSize[0],sizeHeight=backgroundImageSize[1];
var position=getAbsoluteValueForTuple(getBackgroundValueForIndex(container.styles.backgroundPosition,index),backgroundPositioningArea.width-sizeWidth,backgroundPositioningArea.height-sizeHeight);
var path=calculateBackgroundRepeatPath(getBackgroundValueForIndex(container.styles.backgroundRepeat,index),position,backgroundImageSize,backgroundPositioningArea,backgroundPaintingArea);
var offsetX=Math.round(backgroundPositioningArea.left+position[0]);
var offsetY=Math.round(backgroundPositioningArea.top+position[1]);
return [path,offsetX,offsetY,sizeWidth,sizeHeight];
};
var isAuto=function isAuto(token){return isIdentToken(token)&&token.value===BACKGROUND_SIZE.AUTO;};
var hasIntrinsicValue=function hasIntrinsicValue(value){return typeof value==='number';};
var calculateBackgroundSize=function calculateBackgroundSize(size,_a,bounds){
var intrinsicWidth=_a[0],intrinsicHeight=_a[1],intrinsicProportion=_a[2];
var first=size[0],second=size[1];
if(!first){
return [0,0];
}
if(isLengthPercentage(first)&&second&&isLengthPercentage(second)){
return [getAbsoluteValue(first,bounds.width),getAbsoluteValue(second,bounds.height)];
}
var hasIntrinsicProportion=hasIntrinsicValue(intrinsicProportion);
if(isIdentToken(first)&&(first.value===BACKGROUND_SIZE.CONTAIN||first.value===BACKGROUND_SIZE.COVER)){
if(hasIntrinsicValue(intrinsicProportion)){
var targetRatio=bounds.width/bounds.height;
return targetRatio<intrinsicProportion!==(first.value===BACKGROUND_SIZE.COVER)?
[bounds.width,bounds.width/intrinsicProportion]:
[bounds.height*intrinsicProportion,bounds.height];
}
return [bounds.width,bounds.height];
}
var hasIntrinsicWidth=hasIntrinsicValue(intrinsicWidth);
var hasIntrinsicHeight=hasIntrinsicValue(intrinsicHeight);
var hasIntrinsicDimensions=hasIntrinsicWidth||hasIntrinsicHeight;
// If the background-size is auto or auto auto:
if(isAuto(first)&&(!second||isAuto(second))){
// If the image has both horizontal and vertical intrinsic dimensions, it's rendered at that size.
if(hasIntrinsicWidth&&hasIntrinsicHeight){
return [intrinsicWidth,intrinsicHeight];
}
// If the image has no intrinsic dimensions and has no intrinsic proportions,
// it's rendered at the size of the background positioning area.
if(!hasIntrinsicProportion&&!hasIntrinsicDimensions){
return [bounds.width,bounds.height];
}
// TODO If the image has no intrinsic dimensions but has intrinsic proportions, it's rendered as if contain had been specified instead.
// If the image has only one intrinsic dimension and has intrinsic proportions, it's rendered at the size corresponding to that one dimension.
// The other dimension is computed using the specified dimension and the intrinsic proportions.
if(hasIntrinsicDimensions&&hasIntrinsicProportion){
var width_1=hasIntrinsicWidth?
intrinsicWidth:
intrinsicHeight*intrinsicProportion;
var height_1=hasIntrinsicHeight?
intrinsicHeight:
intrinsicWidth/intrinsicProportion;
return [width_1,height_1];
}
// If the image has only one intrinsic dimension but has no intrinsic proportions,
// it's rendered using the specified dimension and the other dimension of the background positioning area.
var width_2=hasIntrinsicWidth?intrinsicWidth:bounds.width;
var height_2=hasIntrinsicHeight?intrinsicHeight:bounds.height;
return [width_2,height_2];
}
// If the image has intrinsic proportions, it's stretched to the specified dimension.
// The unspecified dimension is computed using the specified dimension and the intrinsic proportions.
if(hasIntrinsicProportion){
var width_3=0;
var height_3=0;
if(isLengthPercentage(first)){
width_3=getAbsoluteValue(first,bounds.width);
}else
if(isLengthPercentage(second)){
height_3=getAbsoluteValue(second,bounds.height);
}
if(isAuto(first)){
width_3=height_3*intrinsicProportion;
}else
if(!second||isAuto(second)){
height_3=width_3/intrinsicProportion;
}
return [width_3,height_3];
}
// If the image has no intrinsic proportions, it's stretched to the specified dimension.
// The unspecified dimension is computed using the image's corresponding intrinsic dimension,
// if there is one. If there is no such intrinsic dimension,
// it becomes the corresponding dimension of the background positioning area.
var width=null;
var height=null;
if(isLengthPercentage(first)){
width=getAbsoluteValue(first,bounds.width);
}else
if(second&&isLengthPercentage(second)){
height=getAbsoluteValue(second,bounds.height);
}
if(width!==null&&(!second||isAuto(second))){
height=
hasIntrinsicWidth&&hasIntrinsicHeight?
width/intrinsicWidth*intrinsicHeight:
bounds.height;
}
if(height!==null&&isAuto(first)){
width=
hasIntrinsicWidth&&hasIntrinsicHeight?
height/intrinsicHeight*intrinsicWidth:
bounds.width;
}
if(width!==null&&height!==null){
return [width,height];
}
throw new Error("Unable to calculate background-size for element");
};
var getBackgroundValueForIndex=function getBackgroundValueForIndex(values,index){
var value=values[index];
if(typeof value==='undefined'){
return values[0];
}
return value;
};
var calculateBackgroundRepeatPath=function calculateBackgroundRepeatPath(repeat,_a,_b,backgroundPositioningArea,backgroundPaintingArea){
var x=_a[0],y=_a[1];
var width=_b[0],height=_b[1];
switch(repeat){
case 2/* REPEAT_X */:
return [
new Vector(Math.round(backgroundPositioningArea.left),Math.round(backgroundPositioningArea.top+y)),
new Vector(Math.round(backgroundPositioningArea.left+backgroundPositioningArea.width),Math.round(backgroundPositioningArea.top+y)),
new Vector(Math.round(backgroundPositioningArea.left+backgroundPositioningArea.width),Math.round(height+backgroundPositioningArea.top+y)),
new Vector(Math.round(backgroundPositioningArea.left),Math.round(height+backgroundPositioningArea.top+y))];

case 3/* REPEAT_Y */:
return [
new Vector(Math.round(backgroundPositioningArea.left+x),Math.round(backgroundPositioningArea.top)),
new Vector(Math.round(backgroundPositioningArea.left+x+width),Math.round(backgroundPositioningArea.top)),
new Vector(Math.round(backgroundPositioningArea.left+x+width),Math.round(backgroundPositioningArea.height+backgroundPositioningArea.top)),
new Vector(Math.round(backgroundPositioningArea.left+x),Math.round(backgroundPositioningArea.height+backgroundPositioningArea.top))];

case 1/* NO_REPEAT */:
return [
new Vector(Math.round(backgroundPositioningArea.left+x),Math.round(backgroundPositioningArea.top+y)),
new Vector(Math.round(backgroundPositioningArea.left+x+width),Math.round(backgroundPositioningArea.top+y)),
new Vector(Math.round(backgroundPositioningArea.left+x+width),Math.round(backgroundPositioningArea.top+y+height)),
new Vector(Math.round(backgroundPositioningArea.left+x),Math.round(backgroundPositioningArea.top+y+height))];

default:
return [
new Vector(Math.round(backgroundPaintingArea.left),Math.round(backgroundPaintingArea.top)),
new Vector(Math.round(backgroundPaintingArea.left+backgroundPaintingArea.width),Math.round(backgroundPaintingArea.top)),
new Vector(Math.round(backgroundPaintingArea.left+backgroundPaintingArea.width),Math.round(backgroundPaintingArea.height+backgroundPaintingArea.top)),
new Vector(Math.round(backgroundPaintingArea.left),Math.round(backgroundPaintingArea.height+backgroundPaintingArea.top))];}


};

var SMALL_IMAGE='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

var SAMPLE_TEXT='Hidden Text';
var FontMetrics=/** @class */function(){
function FontMetrics(document){
this._data={};
this._document=document;
}
FontMetrics.prototype.parseMetrics=function(fontFamily,fontSize){
var container=this._document.createElement('div');
var img=this._document.createElement('img');
var span=this._document.createElement('span');
var body=this._document.body;
container.style.visibility='hidden';
container.style.fontFamily=fontFamily;
container.style.fontSize=fontSize;
container.style.margin='0';
container.style.padding='0';
container.style.whiteSpace='nowrap';
body.appendChild(container);
img.src=SMALL_IMAGE;
img.width=1;
img.height=1;
img.style.margin='0';
img.style.padding='0';
img.style.verticalAlign='baseline';
span.style.fontFamily=fontFamily;
span.style.fontSize=fontSize;
span.style.margin='0';
span.style.padding='0';
span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
container.appendChild(span);
container.appendChild(img);
var baseline=img.offsetTop-span.offsetTop+2;
container.removeChild(span);
container.appendChild(this._document.createTextNode(SAMPLE_TEXT));
container.style.lineHeight='normal';
img.style.verticalAlign='super';
var middle=img.offsetTop-container.offsetTop+2;
body.removeChild(container);
return {baseline:baseline,middle:middle};
};
FontMetrics.prototype.getMetrics=function(fontFamily,fontSize){
var key=fontFamily+" "+fontSize;
if(typeof this._data[key]==='undefined'){
this._data[key]=this.parseMetrics(fontFamily,fontSize);
}
return this._data[key];
};
return FontMetrics;
}();

var Renderer=/** @class */function(){
function Renderer(context,options){
this.context=context;
this.options=options;
}
return Renderer;
}();

var MASK_OFFSET=10000;
var CanvasRenderer=/** @class */function(_super){
__extends(CanvasRenderer,_super);
function CanvasRenderer(context,options){
var _this=_super.call(this,context,options)||this;
_this._activeEffects=[];
_this.canvas=options.canvas?options.canvas:document.createElement('canvas');
_this.ctx=_this.canvas.getContext('2d');
if(!options.canvas){
_this.canvas.width=Math.floor(options.width*options.scale);
_this.canvas.height=Math.floor(options.height*options.scale);
_this.canvas.style.width=options.width+"px";
_this.canvas.style.height=options.height+"px";
}
_this.fontMetrics=new FontMetrics(document);
_this.ctx.scale(_this.options.scale,_this.options.scale);
_this.ctx.translate(-options.x,-options.y);
_this.ctx.textBaseline='bottom';
_this._activeEffects=[];
_this.context.logger.debug("Canvas renderer initialized ("+options.width+"x"+options.height+") with scale "+options.scale);
return _this;
}
CanvasRenderer.prototype.applyEffects=function(effects){
var _this=this;
while(this._activeEffects.length){
this.popEffect();
}
effects.forEach(function(effect){return _this.applyEffect(effect);});
};
CanvasRenderer.prototype.applyEffect=function(effect){
this.ctx.save();
if(isOpacityEffect(effect)){
this.ctx.globalAlpha=effect.opacity;
}
if(isTransformEffect(effect)){
this.ctx.translate(effect.offsetX,effect.offsetY);
this.ctx.transform(effect.matrix[0],effect.matrix[1],effect.matrix[2],effect.matrix[3],effect.matrix[4],effect.matrix[5]);
this.ctx.translate(-effect.offsetX,-effect.offsetY);
}
if(isClipEffect(effect)){
this.path(effect.path);
this.ctx.clip();
}
this._activeEffects.push(effect);
};
CanvasRenderer.prototype.popEffect=function(){
this._activeEffects.pop();
this.ctx.restore();
};
CanvasRenderer.prototype.renderStack=function(stack){
return __awaiter(this,void 0,void 0,function(){
var styles;
return __generator(this,function(_a){
switch(_a.label){
case 0:
styles=stack.element.container.styles;
if(!styles.isVisible())return [3/*break*/,2];
return [4/*yield*/,this.renderStackContent(stack)];
case 1:
_a.sent();
_a.label=2;
case 2:return [2/*return*/];}

});
});
};
CanvasRenderer.prototype.renderNode=function(paint){
return __awaiter(this,void 0,void 0,function(){
return __generator(this,function(_a){
switch(_a.label){
case 0:
if(contains(paint.container.flags,16/* DEBUG_RENDER */)){
debugger;
}
if(!paint.container.styles.isVisible())return [3/*break*/,3];
return [4/*yield*/,this.renderNodeBackgroundAndBorders(paint)];
case 1:
_a.sent();
return [4/*yield*/,this.renderNodeContent(paint)];
case 2:
_a.sent();
_a.label=3;
case 3:return [2/*return*/];}

});
});
};
CanvasRenderer.prototype.renderTextWithLetterSpacing=function(text,letterSpacing,baseline){
var _this=this;
if(letterSpacing===0){
this.ctx.fillText(text.text,text.bounds.left,text.bounds.top+baseline);
}else
{
var letters=segmentGraphemes(text.text);
letters.reduce(function(left,letter){
_this.ctx.fillText(letter,left,text.bounds.top+baseline);
return left+_this.ctx.measureText(letter).width;
},text.bounds.left);
}
};
CanvasRenderer.prototype.createFontStyle=function(styles){
var fontVariant=styles.fontVariant.
filter(function(variant){return variant==='normal'||variant==='small-caps';}).
join('');
var fontFamily=fixIOSSystemFonts(styles.fontFamily).join(', ');
var fontSize=isDimensionToken(styles.fontSize)?
""+styles.fontSize.number+styles.fontSize.unit:
styles.fontSize.number+"px";
return [
[styles.fontStyle,fontVariant,styles.fontWeight,fontSize,fontFamily].join(' '),
fontFamily,
fontSize];

};
CanvasRenderer.prototype.renderTextNode=function(text,styles){
return __awaiter(this,void 0,void 0,function(){
var _a,font,fontFamily,fontSize,_b,baseline,middle,paintOrder;
var _this=this;
return __generator(this,function(_c){
_a=this.createFontStyle(styles),font=_a[0],fontFamily=_a[1],fontSize=_a[2];
this.ctx.font=font;
this.ctx.direction=styles.direction===1/* RTL */?'rtl':'ltr';
this.ctx.textAlign='left';
this.ctx.textBaseline='alphabetic';
_b=this.fontMetrics.getMetrics(fontFamily,fontSize),baseline=_b.baseline,middle=_b.middle;
paintOrder=styles.paintOrder;
text.textBounds.forEach(function(text){
paintOrder.forEach(function(paintOrderLayer){
switch(paintOrderLayer){
case 0/* FILL */:
_this.ctx.fillStyle=asString(styles.color);
_this.renderTextWithLetterSpacing(text,styles.letterSpacing,baseline);
var textShadows=styles.textShadow;
if(textShadows.length&&text.text.trim().length){
textShadows.
slice(0).
reverse().
forEach(function(textShadow){
_this.ctx.shadowColor=asString(textShadow.color);
_this.ctx.shadowOffsetX=textShadow.offsetX.number*_this.options.scale;
_this.ctx.shadowOffsetY=textShadow.offsetY.number*_this.options.scale;
_this.ctx.shadowBlur=textShadow.blur.number;
_this.renderTextWithLetterSpacing(text,styles.letterSpacing,baseline);
});
_this.ctx.shadowColor='';
_this.ctx.shadowOffsetX=0;
_this.ctx.shadowOffsetY=0;
_this.ctx.shadowBlur=0;
}
if(styles.textDecorationLine.length){
_this.ctx.fillStyle=asString(styles.textDecorationColor||styles.color);
styles.textDecorationLine.forEach(function(textDecorationLine){
switch(textDecorationLine){
case 1/* UNDERLINE */:
// Draws a line at the baseline of the font
// TODO As some browsers display the line as more than 1px if the font-size is big,
// need to take that into account both in position and size
_this.ctx.fillRect(text.bounds.left,Math.round(text.bounds.top+baseline),text.bounds.width,1);
break;
case 2/* OVERLINE */:
_this.ctx.fillRect(text.bounds.left,Math.round(text.bounds.top),text.bounds.width,1);
break;
case 3/* LINE_THROUGH */:
// TODO try and find exact position for line-through
_this.ctx.fillRect(text.bounds.left,Math.ceil(text.bounds.top+middle),text.bounds.width,1);
break;}

});
}
break;
case 1/* STROKE */:
if(styles.webkitTextStrokeWidth&&text.text.trim().length){
_this.ctx.strokeStyle=asString(styles.webkitTextStrokeColor);
_this.ctx.lineWidth=styles.webkitTextStrokeWidth;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
_this.ctx.lineJoin=!!window.chrome?'miter':'round';
_this.ctx.strokeText(text.text,text.bounds.left,text.bounds.top+baseline);
}
_this.ctx.strokeStyle='';
_this.ctx.lineWidth=0;
_this.ctx.lineJoin='miter';
break;}

});
});
return [2/*return*/];
});
});
};
CanvasRenderer.prototype.renderReplacedElement=function(container,curves,image){
if(image&&container.intrinsicWidth>0&&container.intrinsicHeight>0){
var box=contentBox(container);
var path=calculatePaddingBoxPath(curves);
this.path(path);
this.ctx.save();
this.ctx.clip();
this.ctx.drawImage(image,0,0,container.intrinsicWidth,container.intrinsicHeight,box.left,box.top,box.width,box.height);
this.ctx.restore();
}
};
CanvasRenderer.prototype.renderNodeContent=function(paint){
return __awaiter(this,void 0,void 0,function(){
var container,curves,styles,_i,_a,child,image,image,iframeRenderer,canvas,size,_b,fontFamily,fontSize,baseline,bounds,x,textBounds,img,image,url,fontFamily,bounds;
return __generator(this,function(_c){
switch(_c.label){
case 0:
this.applyEffects(paint.getEffects(4/* CONTENT */));
container=paint.container;
curves=paint.curves;
styles=container.styles;
_i=0,_a=container.textNodes;
_c.label=1;
case 1:
if(!(_i<_a.length))return [3/*break*/,4];
child=_a[_i];
return [4/*yield*/,this.renderTextNode(child,styles)];
case 2:
_c.sent();
_c.label=3;
case 3:
_i++;
return [3/*break*/,1];
case 4:
if(!(container instanceof ImageElementContainer))return [3/*break*/,8];
_c.label=5;
case 5:
_c.trys.push([5,7,,8]);
return [4/*yield*/,this.context.cache.match(container.src)];
case 6:
image=_c.sent();
this.renderReplacedElement(container,curves,image);
return [3/*break*/,8];
case 7:
_c.sent();
this.context.logger.error("Error loading image "+container.src);
return [3/*break*/,8];
case 8:
if(container instanceof CanvasElementContainer){
this.renderReplacedElement(container,curves,container.canvas);
}
if(!(container instanceof SVGElementContainer))return [3/*break*/,12];
_c.label=9;
case 9:
_c.trys.push([9,11,,12]);
return [4/*yield*/,this.context.cache.match(container.svg)];
case 10:
image=_c.sent();
this.renderReplacedElement(container,curves,image);
return [3/*break*/,12];
case 11:
_c.sent();
this.context.logger.error("Error loading svg "+container.svg.substring(0,255));
return [3/*break*/,12];
case 12:
if(!(container instanceof IFrameElementContainer&&container.tree))return [3/*break*/,14];
iframeRenderer=new CanvasRenderer(this.context,{
scale:this.options.scale,
backgroundColor:container.backgroundColor,
x:0,
y:0,
width:container.width,
height:container.height});

return [4/*yield*/,iframeRenderer.render(container.tree)];
case 13:
canvas=_c.sent();
if(container.width&&container.height){
this.ctx.drawImage(canvas,0,0,container.width,container.height,container.bounds.left,container.bounds.top,container.bounds.width,container.bounds.height);
}
_c.label=14;
case 14:
if(container instanceof InputElementContainer){
size=Math.min(container.bounds.width,container.bounds.height);
if(container.type===CHECKBOX){
if(container.checked){
this.ctx.save();
this.path([
new Vector(container.bounds.left+size*0.39363,container.bounds.top+size*0.79),
new Vector(container.bounds.left+size*0.16,container.bounds.top+size*0.5549),
new Vector(container.bounds.left+size*0.27347,container.bounds.top+size*0.44071),
new Vector(container.bounds.left+size*0.39694,container.bounds.top+size*0.5649),
new Vector(container.bounds.left+size*0.72983,container.bounds.top+size*0.23),
new Vector(container.bounds.left+size*0.84,container.bounds.top+size*0.34085),
new Vector(container.bounds.left+size*0.39363,container.bounds.top+size*0.79)]);

this.ctx.fillStyle=asString(INPUT_COLOR);
this.ctx.fill();
this.ctx.restore();
}
}else
if(container.type===RADIO){
if(container.checked){
this.ctx.save();
this.ctx.beginPath();
this.ctx.arc(container.bounds.left+size/2,container.bounds.top+size/2,size/4,0,Math.PI*2,true);
this.ctx.fillStyle=asString(INPUT_COLOR);
this.ctx.fill();
this.ctx.restore();
}
}
}
if(isTextInputElement(container)&&container.value.length){
_b=this.createFontStyle(styles),fontFamily=_b[0],fontSize=_b[1];
baseline=this.fontMetrics.getMetrics(fontFamily,fontSize).baseline;
this.ctx.font=fontFamily;
this.ctx.fillStyle=asString(styles.color);
this.ctx.textBaseline='alphabetic';
this.ctx.textAlign=canvasTextAlign(container.styles.textAlign);
bounds=contentBox(container);
x=0;
switch(container.styles.textAlign){
case 1/* CENTER */:
x+=bounds.width/2;
break;
case 2/* RIGHT */:
x+=bounds.width;
break;}

textBounds=bounds.add(x,0,0,-bounds.height/2+1);
this.ctx.save();
this.path([
new Vector(bounds.left,bounds.top),
new Vector(bounds.left+bounds.width,bounds.top),
new Vector(bounds.left+bounds.width,bounds.top+bounds.height),
new Vector(bounds.left,bounds.top+bounds.height)]);

this.ctx.clip();
this.renderTextWithLetterSpacing(new TextBounds(container.value,textBounds),styles.letterSpacing,baseline);
this.ctx.restore();
this.ctx.textBaseline='alphabetic';
this.ctx.textAlign='left';
}
if(!contains(container.styles.display,2048/* LIST_ITEM */))return [3/*break*/,20];
if(!(container.styles.listStyleImage!==null))return [3/*break*/,19];
img=container.styles.listStyleImage;
if(!(img.type===0/* URL */))return [3/*break*/,18];
image=void 0;
url=img.url;
_c.label=15;
case 15:
_c.trys.push([15,17,,18]);
return [4/*yield*/,this.context.cache.match(url)];
case 16:
image=_c.sent();
this.ctx.drawImage(image,container.bounds.left-(image.width+10),container.bounds.top);
return [3/*break*/,18];
case 17:
_c.sent();
this.context.logger.error("Error loading list-style-image "+url);
return [3/*break*/,18];
case 18:return [3/*break*/,20];
case 19:
if(paint.listValue&&container.styles.listStyleType!==-1/* NONE */){
fontFamily=this.createFontStyle(styles)[0];
this.ctx.font=fontFamily;
this.ctx.fillStyle=asString(styles.color);
this.ctx.textBaseline='middle';
this.ctx.textAlign='right';
bounds=new Bounds(container.bounds.left,container.bounds.top+getAbsoluteValue(container.styles.paddingTop,container.bounds.width),container.bounds.width,computeLineHeight(styles.lineHeight,styles.fontSize.number)/2+1);
this.renderTextWithLetterSpacing(new TextBounds(paint.listValue,bounds),styles.letterSpacing,computeLineHeight(styles.lineHeight,styles.fontSize.number)/2+2);
this.ctx.textBaseline='bottom';
this.ctx.textAlign='left';
}
_c.label=20;
case 20:return [2/*return*/];}

});
});
};
CanvasRenderer.prototype.renderStackContent=function(stack){
return __awaiter(this,void 0,void 0,function(){
var _i,_a,child,_b,_c,child,_d,_e,child,_f,_g,child,_h,_j,child,_k,_l,child,_m,_o,child;
return __generator(this,function(_p){
switch(_p.label){
case 0:
if(contains(stack.element.container.flags,16/* DEBUG_RENDER */)){
debugger;
}
// https://www.w3.org/TR/css-position-3/#painting-order
// 1. the background and borders of the element forming the stacking context.
return [4/*yield*/,this.renderNodeBackgroundAndBorders(stack.element)];
case 1:
// https://www.w3.org/TR/css-position-3/#painting-order
// 1. the background and borders of the element forming the stacking context.
_p.sent();
_i=0,_a=stack.negativeZIndex;
_p.label=2;
case 2:
if(!(_i<_a.length))return [3/*break*/,5];
child=_a[_i];
return [4/*yield*/,this.renderStack(child)];
case 3:
_p.sent();
_p.label=4;
case 4:
_i++;
return [3/*break*/,2];
case 5:
// 3. For all its in-flow, non-positioned, block-level descendants in tree order:
return [4/*yield*/,this.renderNodeContent(stack.element)];
case 6:
// 3. For all its in-flow, non-positioned, block-level descendants in tree order:
_p.sent();
_b=0,_c=stack.nonInlineLevel;
_p.label=7;
case 7:
if(!(_b<_c.length))return [3/*break*/,10];
child=_c[_b];
return [4/*yield*/,this.renderNode(child)];
case 8:
_p.sent();
_p.label=9;
case 9:
_b++;
return [3/*break*/,7];
case 10:
_d=0,_e=stack.nonPositionedFloats;
_p.label=11;
case 11:
if(!(_d<_e.length))return [3/*break*/,14];
child=_e[_d];
return [4/*yield*/,this.renderStack(child)];
case 12:
_p.sent();
_p.label=13;
case 13:
_d++;
return [3/*break*/,11];
case 14:
_f=0,_g=stack.nonPositionedInlineLevel;
_p.label=15;
case 15:
if(!(_f<_g.length))return [3/*break*/,18];
child=_g[_f];
return [4/*yield*/,this.renderStack(child)];
case 16:
_p.sent();
_p.label=17;
case 17:
_f++;
return [3/*break*/,15];
case 18:
_h=0,_j=stack.inlineLevel;
_p.label=19;
case 19:
if(!(_h<_j.length))return [3/*break*/,22];
child=_j[_h];
return [4/*yield*/,this.renderNode(child)];
case 20:
_p.sent();
_p.label=21;
case 21:
_h++;
return [3/*break*/,19];
case 22:
_k=0,_l=stack.zeroOrAutoZIndexOrTransformedOrOpacity;
_p.label=23;
case 23:
if(!(_k<_l.length))return [3/*break*/,26];
child=_l[_k];
return [4/*yield*/,this.renderStack(child)];
case 24:
_p.sent();
_p.label=25;
case 25:
_k++;
return [3/*break*/,23];
case 26:
_m=0,_o=stack.positiveZIndex;
_p.label=27;
case 27:
if(!(_m<_o.length))return [3/*break*/,30];
child=_o[_m];
return [4/*yield*/,this.renderStack(child)];
case 28:
_p.sent();
_p.label=29;
case 29:
_m++;
return [3/*break*/,27];
case 30:return [2/*return*/];}

});
});
};
CanvasRenderer.prototype.mask=function(paths){
this.ctx.beginPath();
this.ctx.moveTo(0,0);
this.ctx.lineTo(this.canvas.width,0);
this.ctx.lineTo(this.canvas.width,this.canvas.height);
this.ctx.lineTo(0,this.canvas.height);
this.ctx.lineTo(0,0);
this.formatPath(paths.slice(0).reverse());
this.ctx.closePath();
};
CanvasRenderer.prototype.path=function(paths){
this.ctx.beginPath();
this.formatPath(paths);
this.ctx.closePath();
};
CanvasRenderer.prototype.formatPath=function(paths){
var _this=this;
paths.forEach(function(point,index){
var start=isBezierCurve(point)?point.start:point;
if(index===0){
_this.ctx.moveTo(start.x,start.y);
}else
{
_this.ctx.lineTo(start.x,start.y);
}
if(isBezierCurve(point)){
_this.ctx.bezierCurveTo(point.startControl.x,point.startControl.y,point.endControl.x,point.endControl.y,point.end.x,point.end.y);
}
});
};
CanvasRenderer.prototype.renderRepeat=function(path,pattern,offsetX,offsetY){
this.path(path);
this.ctx.fillStyle=pattern;
this.ctx.translate(offsetX,offsetY);
this.ctx.fill();
this.ctx.translate(-offsetX,-offsetY);
};
CanvasRenderer.prototype.resizeImage=function(image,width,height){
var _a;
if(image.width===width&&image.height===height){
return image;
}
var ownerDocument=(_a=this.canvas.ownerDocument)!==null&&_a!==void 0?_a:document;
var canvas=ownerDocument.createElement('canvas');
canvas.width=Math.max(1,width);
canvas.height=Math.max(1,height);
var ctx=canvas.getContext('2d');
ctx.drawImage(image,0,0,image.width,image.height,0,0,width,height);
return canvas;
};
CanvasRenderer.prototype.renderBackgroundImage=function(container){
return __awaiter(this,void 0,void 0,function(){
var index,_loop_1,this_1,_i,_a,backgroundImage;
return __generator(this,function(_b){
switch(_b.label){
case 0:
index=container.styles.backgroundImage.length-1;
_loop_1=function _loop_1(backgroundImage){
var image,url,_c,path,x,y,width,height,pattern,_d,path,x,y,width,height,_e,lineLength,x0,x1,y0,y1,canvas,ctx,gradient_1,pattern,_f,path,left,top_1,width,height,position,x,y,_g,rx,ry,radialGradient_1,midX,midY,f,invF;
return __generator(this,function(_h){
switch(_h.label){
case 0:
if(!(backgroundImage.type===0/* URL */))return [3/*break*/,5];
image=void 0;
url=backgroundImage.url;
_h.label=1;
case 1:
_h.trys.push([1,3,,4]);
return [4/*yield*/,this_1.context.cache.match(url)];
case 2:
image=_h.sent();
return [3/*break*/,4];
case 3:
_h.sent();
this_1.context.logger.error("Error loading background-image "+url);
return [3/*break*/,4];
case 4:
if(image){
_c=calculateBackgroundRendering(container,index,[
image.width,
image.height,
image.width/image.height]),
path=_c[0],x=_c[1],y=_c[2],width=_c[3],height=_c[4];
pattern=this_1.ctx.createPattern(this_1.resizeImage(image,width,height),'repeat');
this_1.renderRepeat(path,pattern,x,y);
}
return [3/*break*/,6];
case 5:
if(isLinearGradient(backgroundImage)){
_d=calculateBackgroundRendering(container,index,[null,null,null]),path=_d[0],x=_d[1],y=_d[2],width=_d[3],height=_d[4];
_e=calculateGradientDirection(backgroundImage.angle,width,height),lineLength=_e[0],x0=_e[1],x1=_e[2],y0=_e[3],y1=_e[4];
canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
ctx=canvas.getContext('2d');
gradient_1=ctx.createLinearGradient(x0,y0,x1,y1);
processColorStops(backgroundImage.stops,lineLength).forEach(function(colorStop){
return gradient_1.addColorStop(colorStop.stop,asString(colorStop.color));
});
ctx.fillStyle=gradient_1;
ctx.fillRect(0,0,width,height);
if(width>0&&height>0){
pattern=this_1.ctx.createPattern(canvas,'repeat');
this_1.renderRepeat(path,pattern,x,y);
}
}else
if(isRadialGradient(backgroundImage)){
_f=calculateBackgroundRendering(container,index,[
null,
null,
null]),
path=_f[0],left=_f[1],top_1=_f[2],width=_f[3],height=_f[4];
position=backgroundImage.position.length===0?[FIFTY_PERCENT]:backgroundImage.position;
x=getAbsoluteValue(position[0],width);
y=getAbsoluteValue(position[position.length-1],height);
_g=calculateRadius(backgroundImage,x,y,width,height),rx=_g[0],ry=_g[1];
if(rx>0&&ry>0){
radialGradient_1=this_1.ctx.createRadialGradient(left+x,top_1+y,0,left+x,top_1+y,rx);
processColorStops(backgroundImage.stops,rx*2).forEach(function(colorStop){
return radialGradient_1.addColorStop(colorStop.stop,asString(colorStop.color));
});
this_1.path(path);
this_1.ctx.fillStyle=radialGradient_1;
if(rx!==ry){
midX=container.bounds.left+0.5*container.bounds.width;
midY=container.bounds.top+0.5*container.bounds.height;
f=ry/rx;
invF=1/f;
this_1.ctx.save();
this_1.ctx.translate(midX,midY);
this_1.ctx.transform(1,0,0,f,0,0);
this_1.ctx.translate(-midX,-midY);
this_1.ctx.fillRect(left,invF*(top_1-midY)+midY,width,height*invF);
this_1.ctx.restore();
}else
{
this_1.ctx.fill();
}
}
}
_h.label=6;
case 6:
index--;
return [2/*return*/];}

});
};
this_1=this;
_i=0,_a=container.styles.backgroundImage.slice(0).reverse();
_b.label=1;
case 1:
if(!(_i<_a.length))return [3/*break*/,4];
backgroundImage=_a[_i];
return [5/*yield**/,_loop_1(backgroundImage)];
case 2:
_b.sent();
_b.label=3;
case 3:
_i++;
return [3/*break*/,1];
case 4:return [2/*return*/];}

});
});
};
CanvasRenderer.prototype.renderSolidBorder=function(color,side,curvePoints){
return __awaiter(this,void 0,void 0,function(){
return __generator(this,function(_a){
this.path(parsePathForBorder(curvePoints,side));
this.ctx.fillStyle=asString(color);
this.ctx.fill();
return [2/*return*/];
});
});
};
CanvasRenderer.prototype.renderDoubleBorder=function(color,width,side,curvePoints){
return __awaiter(this,void 0,void 0,function(){
var outerPaths,innerPaths;
return __generator(this,function(_a){
switch(_a.label){
case 0:
if(!(width<3))return [3/*break*/,2];
return [4/*yield*/,this.renderSolidBorder(color,side,curvePoints)];
case 1:
_a.sent();
return [2/*return*/];
case 2:
outerPaths=parsePathForBorderDoubleOuter(curvePoints,side);
this.path(outerPaths);
this.ctx.fillStyle=asString(color);
this.ctx.fill();
innerPaths=parsePathForBorderDoubleInner(curvePoints,side);
this.path(innerPaths);
this.ctx.fill();
return [2/*return*/];}

});
});
};
CanvasRenderer.prototype.renderNodeBackgroundAndBorders=function(paint){
return __awaiter(this,void 0,void 0,function(){
var styles,hasBackground,borders,backgroundPaintingArea,side,_i,borders_1,border;
var _this=this;
return __generator(this,function(_a){
switch(_a.label){
case 0:
this.applyEffects(paint.getEffects(2/* BACKGROUND_BORDERS */));
styles=paint.container.styles;
hasBackground=!isTransparent(styles.backgroundColor)||styles.backgroundImage.length;
borders=[
{style:styles.borderTopStyle,color:styles.borderTopColor,width:styles.borderTopWidth},
{style:styles.borderRightStyle,color:styles.borderRightColor,width:styles.borderRightWidth},
{style:styles.borderBottomStyle,color:styles.borderBottomColor,width:styles.borderBottomWidth},
{style:styles.borderLeftStyle,color:styles.borderLeftColor,width:styles.borderLeftWidth}];

backgroundPaintingArea=calculateBackgroundCurvedPaintingArea(getBackgroundValueForIndex(styles.backgroundClip,0),paint.curves);
if(!(hasBackground||styles.boxShadow.length))return [3/*break*/,2];
this.ctx.save();
this.path(backgroundPaintingArea);
this.ctx.clip();
if(!isTransparent(styles.backgroundColor)){
this.ctx.fillStyle=asString(styles.backgroundColor);
this.ctx.fill();
}
return [4/*yield*/,this.renderBackgroundImage(paint.container)];
case 1:
_a.sent();
this.ctx.restore();
styles.boxShadow.
slice(0).
reverse().
forEach(function(shadow){
_this.ctx.save();
var borderBoxArea=calculateBorderBoxPath(paint.curves);
var maskOffset=shadow.inset?0:MASK_OFFSET;
var shadowPaintingArea=transformPath(borderBoxArea,-maskOffset+(shadow.inset?1:-1)*shadow.spread.number,(shadow.inset?1:-1)*shadow.spread.number,shadow.spread.number*(shadow.inset?-2:2),shadow.spread.number*(shadow.inset?-2:2));
if(shadow.inset){
_this.path(borderBoxArea);
_this.ctx.clip();
_this.mask(shadowPaintingArea);
}else
{
_this.mask(borderBoxArea);
_this.ctx.clip();
_this.path(shadowPaintingArea);
}
_this.ctx.shadowOffsetX=shadow.offsetX.number+maskOffset;
_this.ctx.shadowOffsetY=shadow.offsetY.number;
_this.ctx.shadowColor=asString(shadow.color);
_this.ctx.shadowBlur=shadow.blur.number;
_this.ctx.fillStyle=shadow.inset?asString(shadow.color):'rgba(0,0,0,1)';
_this.ctx.fill();
_this.ctx.restore();
});
_a.label=2;
case 2:
side=0;
_i=0,borders_1=borders;
_a.label=3;
case 3:
if(!(_i<borders_1.length))return [3/*break*/,13];
border=borders_1[_i];
if(!(border.style!==0/* NONE */&&!isTransparent(border.color)&&border.width>0))return [3/*break*/,11];
if(!(border.style===2/* DASHED */))return [3/*break*/,5];
return [4/*yield*/,this.renderDashedDottedBorder(border.color,border.width,side,paint.curves,2/* DASHED */)];
case 4:
_a.sent();
return [3/*break*/,11];
case 5:
if(!(border.style===3/* DOTTED */))return [3/*break*/,7];
return [4/*yield*/,this.renderDashedDottedBorder(border.color,border.width,side,paint.curves,3/* DOTTED */)];
case 6:
_a.sent();
return [3/*break*/,11];
case 7:
if(!(border.style===4/* DOUBLE */))return [3/*break*/,9];
return [4/*yield*/,this.renderDoubleBorder(border.color,border.width,side,paint.curves)];
case 8:
_a.sent();
return [3/*break*/,11];
case 9:return [4/*yield*/,this.renderSolidBorder(border.color,side,paint.curves)];
case 10:
_a.sent();
_a.label=11;
case 11:
side++;
_a.label=12;
case 12:
_i++;
return [3/*break*/,3];
case 13:return [2/*return*/];}

});
});
};
CanvasRenderer.prototype.renderDashedDottedBorder=function(color,width,side,curvePoints,style){
return __awaiter(this,void 0,void 0,function(){
var strokePaths,boxPaths,startX,startY,endX,endY,length,dashLength,spaceLength,useLineDash,multiplier,numberOfDashes,minSpace,maxSpace,path1,path2,path1,path2;
return __generator(this,function(_a){
this.ctx.save();
strokePaths=parsePathForBorderStroke(curvePoints,side);
boxPaths=parsePathForBorder(curvePoints,side);
if(style===2/* DASHED */){
this.path(boxPaths);
this.ctx.clip();
}
if(isBezierCurve(boxPaths[0])){
startX=boxPaths[0].start.x;
startY=boxPaths[0].start.y;
}else
{
startX=boxPaths[0].x;
startY=boxPaths[0].y;
}
if(isBezierCurve(boxPaths[1])){
endX=boxPaths[1].end.x;
endY=boxPaths[1].end.y;
}else
{
endX=boxPaths[1].x;
endY=boxPaths[1].y;
}
if(side===0||side===2){
length=Math.abs(startX-endX);
}else
{
length=Math.abs(startY-endY);
}
this.ctx.beginPath();
if(style===3/* DOTTED */){
this.formatPath(strokePaths);
}else
{
this.formatPath(boxPaths.slice(0,2));
}
dashLength=width<3?width*3:width*2;
spaceLength=width<3?width*2:width;
if(style===3/* DOTTED */){
dashLength=width;
spaceLength=width;
}
useLineDash=true;
if(length<=dashLength*2){
useLineDash=false;
}else
if(length<=dashLength*2+spaceLength){
multiplier=length/(2*dashLength+spaceLength);
dashLength*=multiplier;
spaceLength*=multiplier;
}else
{
numberOfDashes=Math.floor((length+spaceLength)/(dashLength+spaceLength));
minSpace=(length-numberOfDashes*dashLength)/(numberOfDashes-1);
maxSpace=(length-(numberOfDashes+1)*dashLength)/numberOfDashes;
spaceLength=
maxSpace<=0||Math.abs(spaceLength-minSpace)<Math.abs(spaceLength-maxSpace)?
minSpace:
maxSpace;
}
if(useLineDash){
if(style===3/* DOTTED */){
this.ctx.setLineDash([0,dashLength+spaceLength]);
}else
{
this.ctx.setLineDash([dashLength,spaceLength]);
}
}
if(style===3/* DOTTED */){
this.ctx.lineCap='round';
this.ctx.lineWidth=width;
}else
{
this.ctx.lineWidth=width*2+1.1;
}
this.ctx.strokeStyle=asString(color);
this.ctx.stroke();
this.ctx.setLineDash([]);
// dashed round edge gap
if(style===2/* DASHED */){
if(isBezierCurve(boxPaths[0])){
path1=boxPaths[3];
path2=boxPaths[0];
this.ctx.beginPath();
this.formatPath([new Vector(path1.end.x,path1.end.y),new Vector(path2.start.x,path2.start.y)]);
this.ctx.stroke();
}
if(isBezierCurve(boxPaths[1])){
path1=boxPaths[1];
path2=boxPaths[2];
this.ctx.beginPath();
this.formatPath([new Vector(path1.end.x,path1.end.y),new Vector(path2.start.x,path2.start.y)]);
this.ctx.stroke();
}
}
this.ctx.restore();
return [2/*return*/];
});
});
};
CanvasRenderer.prototype.render=function(element){
return __awaiter(this,void 0,void 0,function(){
var stack;
return __generator(this,function(_a){
switch(_a.label){
case 0:
if(this.options.backgroundColor){
this.ctx.fillStyle=asString(this.options.backgroundColor);
this.ctx.fillRect(this.options.x,this.options.y,this.options.width,this.options.height);
}
stack=parseStackingContexts(element);
return [4/*yield*/,this.renderStack(stack)];
case 1:
_a.sent();
this.applyEffects([]);
return [2/*return*/,this.canvas];}

});
});
};
return CanvasRenderer;
}(Renderer);
var isTextInputElement=function isTextInputElement(container){
if(container instanceof TextareaElementContainer){
return true;
}else
if(container instanceof SelectElementContainer){
return true;
}else
if(container instanceof InputElementContainer&&container.type!==RADIO&&container.type!==CHECKBOX){
return true;
}
return false;
};
var calculateBackgroundCurvedPaintingArea=function calculateBackgroundCurvedPaintingArea(clip,curves){
switch(clip){
case 0/* BORDER_BOX */:
return calculateBorderBoxPath(curves);
case 2/* CONTENT_BOX */:
return calculateContentBoxPath(curves);
case 1/* PADDING_BOX */:
default:
return calculatePaddingBoxPath(curves);}

};
var canvasTextAlign=function canvasTextAlign(textAlign){
switch(textAlign){
case 1/* CENTER */:
return 'center';
case 2/* RIGHT */:
return 'right';
case 0/* LEFT */:
default:
return 'left';}

};
// see https://github.com/niklasvh/html2canvas/pull/2645
var iOSBrokenFonts=['-apple-system','system-ui'];
var fixIOSSystemFonts=function fixIOSSystemFonts(fontFamilies){
return /iPhone OS 15_(0|1)/.test(window.navigator.userAgent)?
fontFamilies.filter(function(fontFamily){return iOSBrokenFonts.indexOf(fontFamily)===-1;}):
fontFamilies;
};

var ForeignObjectRenderer=/** @class */function(_super){
__extends(ForeignObjectRenderer,_super);
function ForeignObjectRenderer(context,options){
var _this=_super.call(this,context,options)||this;
_this.canvas=options.canvas?options.canvas:document.createElement('canvas');
_this.ctx=_this.canvas.getContext('2d');
_this.options=options;
_this.canvas.width=Math.floor(options.width*options.scale);
_this.canvas.height=Math.floor(options.height*options.scale);
_this.canvas.style.width=options.width+"px";
_this.canvas.style.height=options.height+"px";
_this.ctx.scale(_this.options.scale,_this.options.scale);
_this.ctx.translate(-options.x,-options.y);
_this.context.logger.debug("EXPERIMENTAL ForeignObject renderer initialized ("+options.width+"x"+options.height+" at "+options.x+","+options.y+") with scale "+options.scale);
return _this;
}
ForeignObjectRenderer.prototype.render=function(element){
return __awaiter(this,void 0,void 0,function(){
var svg,img;
return __generator(this,function(_a){
switch(_a.label){
case 0:
svg=createForeignObjectSVG(this.options.width*this.options.scale,this.options.height*this.options.scale,this.options.scale,this.options.scale,element);
return [4/*yield*/,loadSerializedSVG(svg)];
case 1:
img=_a.sent();
if(this.options.backgroundColor){
this.ctx.fillStyle=asString(this.options.backgroundColor);
this.ctx.fillRect(0,0,this.options.width*this.options.scale,this.options.height*this.options.scale);
}
this.ctx.drawImage(img,-this.options.x*this.options.scale,-this.options.y*this.options.scale);
return [2/*return*/,this.canvas];}

});
});
};
return ForeignObjectRenderer;
}(Renderer);
var loadSerializedSVG=function loadSerializedSVG(svg){
return new Promise(function(resolve,reject){
var img=new Image();
img.onload=function(){
resolve(img);
};
img.onerror=reject;
img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(svg));
});
};

var Logger=/** @class */function(){
function Logger(_a){
var id=_a.id,enabled=_a.enabled;
this.id=id;
this.enabled=enabled;
this.start=Date.now();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Logger.prototype.debug=function(){
var args=[];
for(var _i=0;_i<arguments.length;_i++){
args[_i]=arguments[_i];
}
if(this.enabled){
// eslint-disable-next-line no-console
if(typeof window!=='undefined'&&window.console&&typeof console.debug==='function'){
// eslint-disable-next-line no-console
console.debug.apply(console,__spreadArray([this.id,this.getTime()+"ms"],args));
}else
{
this.info.apply(this,args);
}
}
};
Logger.prototype.getTime=function(){
return Date.now()-this.start;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Logger.prototype.info=function(){
var args=[];
for(var _i=0;_i<arguments.length;_i++){
args[_i]=arguments[_i];
}
if(this.enabled){
// eslint-disable-next-line no-console
if(typeof window!=='undefined'&&window.console&&typeof console.info==='function'){
// eslint-disable-next-line no-console
console.info.apply(console,__spreadArray([this.id,this.getTime()+"ms"],args));
}
}
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Logger.prototype.warn=function(){
var args=[];
for(var _i=0;_i<arguments.length;_i++){
args[_i]=arguments[_i];
}
if(this.enabled){
// eslint-disable-next-line no-console
if(typeof window!=='undefined'&&window.console&&typeof console.warn==='function'){
// eslint-disable-next-line no-console
console.warn.apply(console,__spreadArray([this.id,this.getTime()+"ms"],args));
}else
{
this.info.apply(this,args);
}
}
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Logger.prototype.error=function(){
var args=[];
for(var _i=0;_i<arguments.length;_i++){
args[_i]=arguments[_i];
}
if(this.enabled){
// eslint-disable-next-line no-console
if(typeof window!=='undefined'&&window.console&&typeof console.error==='function'){
// eslint-disable-next-line no-console
console.error.apply(console,__spreadArray([this.id,this.getTime()+"ms"],args));
}else
{
this.info.apply(this,args);
}
}
};
Logger.instances={};
return Logger;
}();

var Context=/** @class */function(){
function Context(options,windowBounds){
var _a;
this.windowBounds=windowBounds;
this.instanceName="#"+Context.instanceCount++;
this.logger=new Logger({id:this.instanceName,enabled:options.logging});
this.cache=(_a=options.cache)!==null&&_a!==void 0?_a:new Cache(this,options);
}
Context.instanceCount=1;
return Context;
}();

var html2canvas=function html2canvas(element,options){
if(options===void 0){options={};}
return renderElement(element,options);
};
if(typeof window!=='undefined'){
CacheStorage.setContext(window);
}
var renderElement=function renderElement(element,opts){return __awaiter(void 0,void 0,void 0,function(){
var ownerDocument,defaultView,resourceOptions,contextOptions,windowOptions,windowBounds,context,foreignObjectRendering,cloneOptions,documentCloner,clonedElement,container,_a,width,height,left,top,backgroundColor,renderOptions,canvas,renderer,root,renderer;
var _b,_c,_d,_e,_f,_g,_h,_j,_k,_l,_m,_o,_p,_q,_r,_s,_t;
return __generator(this,function(_u){
switch(_u.label){
case 0:
if(!element||typeof element!=='object'){
return [2/*return*/,Promise.reject('Invalid element provided as first argument')];
}
ownerDocument=element.ownerDocument;
if(!ownerDocument){
throw new Error("Element is not attached to a Document");
}
defaultView=ownerDocument.defaultView;
if(!defaultView){
throw new Error("Document is not attached to a Window");
}
resourceOptions={
allowTaint:(_b=opts.allowTaint)!==null&&_b!==void 0?_b:false,
imageTimeout:(_c=opts.imageTimeout)!==null&&_c!==void 0?_c:15000,
proxy:opts.proxy,
useCORS:(_d=opts.useCORS)!==null&&_d!==void 0?_d:false};

contextOptions=_assign({logging:(_e=opts.logging)!==null&&_e!==void 0?_e:true,cache:opts.cache},resourceOptions);
windowOptions={
windowWidth:(_f=opts.windowWidth)!==null&&_f!==void 0?_f:defaultView.innerWidth,
windowHeight:(_g=opts.windowHeight)!==null&&_g!==void 0?_g:defaultView.innerHeight,
scrollX:(_h=opts.scrollX)!==null&&_h!==void 0?_h:defaultView.pageXOffset,
scrollY:(_j=opts.scrollY)!==null&&_j!==void 0?_j:defaultView.pageYOffset};

windowBounds=new Bounds(windowOptions.scrollX,windowOptions.scrollY,windowOptions.windowWidth,windowOptions.windowHeight);
context=new Context(contextOptions,windowBounds);
foreignObjectRendering=(_k=opts.foreignObjectRendering)!==null&&_k!==void 0?_k:false;
cloneOptions={
allowTaint:(_l=opts.allowTaint)!==null&&_l!==void 0?_l:false,
onclone:opts.onclone,
ignoreElements:opts.ignoreElements,
inlineImages:foreignObjectRendering,
copyStyles:foreignObjectRendering};

context.logger.debug("Starting document clone with size "+windowBounds.width+"x"+windowBounds.height+" scrolled to "+-windowBounds.left+","+-windowBounds.top);
documentCloner=new DocumentCloner(context,element,cloneOptions);
clonedElement=documentCloner.clonedReferenceElement;
if(!clonedElement){
return [2/*return*/,Promise.reject("Unable to find element in cloned iframe")];
}
return [4/*yield*/,documentCloner.toIFrame(ownerDocument,windowBounds)];
case 1:
container=_u.sent();
_a=isBodyElement(clonedElement)||isHTMLElement(clonedElement)?
parseDocumentSize(clonedElement.ownerDocument):
parseBounds(context,clonedElement),width=_a.width,height=_a.height,left=_a.left,top=_a.top;
backgroundColor=parseBackgroundColor(context,clonedElement,opts.backgroundColor);
renderOptions={
canvas:opts.canvas,
backgroundColor:backgroundColor,
scale:(_o=(_m=opts.scale)!==null&&_m!==void 0?_m:defaultView.devicePixelRatio)!==null&&_o!==void 0?_o:1,
x:((_p=opts.x)!==null&&_p!==void 0?_p:0)+left,
y:((_q=opts.y)!==null&&_q!==void 0?_q:0)+top,
width:(_r=opts.width)!==null&&_r!==void 0?_r:Math.ceil(width),
height:(_s=opts.height)!==null&&_s!==void 0?_s:Math.ceil(height)};

if(!foreignObjectRendering)return [3/*break*/,3];
context.logger.debug("Document cloned, using foreign object rendering");
renderer=new ForeignObjectRenderer(context,renderOptions);
return [4/*yield*/,renderer.render(clonedElement)];
case 2:
canvas=_u.sent();
return [3/*break*/,5];
case 3:
context.logger.debug("Document cloned, element located at "+left+","+top+" with size "+width+"x"+height+" using computed rendering");
context.logger.debug("Starting DOM parsing");
root=parseTree(context,clonedElement);
if(backgroundColor===root.styles.backgroundColor){
root.styles.backgroundColor=COLORS.TRANSPARENT;
}
context.logger.debug("Starting renderer for element at "+renderOptions.x+","+renderOptions.y+" with size "+renderOptions.width+"x"+renderOptions.height);
renderer=new CanvasRenderer(context,renderOptions);
return [4/*yield*/,renderer.render(root)];
case 4:
canvas=_u.sent();
_u.label=5;
case 5:
if((_t=opts.removeContainer)!==null&&_t!==void 0?_t:true){
if(!DocumentCloner.destroy(container)){
context.logger.error("Cannot detach cloned iframe as it is not in the DOM anymore");
}
}
context.logger.debug("Finished rendering");
return [2/*return*/,canvas];}

});
});};
var parseBackgroundColor=function parseBackgroundColor(context,element,backgroundColorOverride){
var ownerDocument=element.ownerDocument;
// http://www.w3.org/TR/css3-background/#special-backgrounds
var documentBackgroundColor=ownerDocument.documentElement?
parseColor(context,getComputedStyle(ownerDocument.documentElement).backgroundColor):
COLORS.TRANSPARENT;
var bodyBackgroundColor=ownerDocument.body?
parseColor(context,getComputedStyle(ownerDocument.body).backgroundColor):
COLORS.TRANSPARENT;
var defaultBackgroundColor=typeof backgroundColorOverride==='string'?
parseColor(context,backgroundColorOverride):
backgroundColorOverride===null?
COLORS.TRANSPARENT:
0xffffffff;
return element===ownerDocument.documentElement?
isTransparent(documentBackgroundColor)?
isTransparent(bodyBackgroundColor)?
defaultBackgroundColor:
bodyBackgroundColor:
documentBackgroundColor:
defaultBackgroundColor;
};

return html2canvas;

});



/***/}}]);

}());
