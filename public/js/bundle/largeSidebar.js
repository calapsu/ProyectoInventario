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

var FunctionPrototype$2 = Function.prototype;
var apply = FunctionPrototype$2.apply;
var call$2 = FunctionPrototype$2.call;

// eslint-disable-next-line es/no-reflect -- safe
var functionApply = typeof Reflect == 'object' && Reflect.apply || (functionBindNative ? call$2.bind(apply) : function () {
  return call$2.apply(apply, arguments);
});

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray = Array.isArray || function isArray(argument) {
  return classofRaw(argument) == 'Array';
};

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

var String$3 = global_1.String;

var toString_1 = function (argument) {
  if (classof(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
  return String$3(argument);
};

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
var f$5 = descriptors && !v8PrototypeDefineBug ? Object.defineProperties : function defineProperties(O, Properties) {
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
	f: f$5
};

var html = getBuiltIn('document', 'documentElement');

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
var f$6 = function getOwnPropertyNames(it) {
  return windowNames && classofRaw(it) == 'Window'
    ? getWindowNames(it)
    : $getOwnPropertyNames(toIndexedObject(it));
};

var objectGetOwnPropertyNamesExternal = {
	f: f$6
};

var arraySlice = functionUncurryThis([].slice);

var f$7 = wellKnownSymbol;

var wellKnownSymbolWrapped = {
	f: f$7
};

var path = global_1;

var defineProperty$1 = objectDefineProperty.f;

var defineWellKnownSymbol = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!hasOwnProperty_1(Symbol, NAME)) defineProperty$1(Symbol, NAME, {
    value: wellKnownSymbolWrapped.f(NAME)
  });
};

var defineProperty$2 = objectDefineProperty.f;



var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

var setToStringTag = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwnProperty_1(target, TO_STRING_TAG$2)) {
    defineProperty$2(target, TO_STRING_TAG$2, { configurable: true, value: TAG });
  }
};

var bind$1 = functionUncurryThis(functionUncurryThis.bind);

// optional / simple context binding
var functionBindContext = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : functionBindNative ? bind$1(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
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

var SPECIES = wellKnownSymbol('species');
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
      C = C[SPECIES];
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

var setInternalState = internalState.set;
var getInternalState = internalState.getterFor(SYMBOL);

var ObjectPrototype = Object[PROTOTYPE$1];
var $Symbol = global_1.Symbol;
var SymbolPrototype = $Symbol && $Symbol[PROTOTYPE$1];
var TypeError$8 = global_1.TypeError;
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
  setInternalState(symbol, {
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
    if (objectIsPrototypeOf(SymbolPrototype, this)) throw TypeError$8('Symbol is not a constructor');
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
    return getInternalState(this).tag;
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
        return getInternalState(this).description;
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
    if (!isSymbol(sym)) throw TypeError$8(sym + ' is not a symbol');
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

var SPECIES$1 = wellKnownSymbol('species');

var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return engineV8Version >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$1] = function () {
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

var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;


var FAILS_ON_PRIMITIVES$1 = fails(function () { nativeGetOwnPropertyDescriptor$1(1); });
var FORCED = !descriptors || FAILS_ON_PRIMITIVES$1;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
_export({ target: 'Object', stat: true, forced: FORCED, sham: !descriptors }, {
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







var getInternalState$1 = internalState.get;



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
    var state = getInternalState$1(re);
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








var SPECIES$2 = wellKnownSymbol('species');
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
      re.constructor[SPECIES$2] = function () { return re; };
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

var TypeError$9 = global_1.TypeError;

// `Assert: IsConstructor(argument) is true`
var aConstructor = function (argument) {
  if (isConstructor(argument)) return argument;
  throw TypeError$9(tryToString(argument) + ' is not a constructor');
};

var SPECIES$3 = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES$3]) == undefined ? defaultConstructor : aConstructor(S);
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

var TypeError$a = global_1.TypeError;

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
  throw TypeError$a('RegExp#exec called on incompatible receiver');
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

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: objectCreate(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
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

var TypeError$b = global_1.TypeError;

var notARegexp = function (it) {
  if (isRegexp(it)) {
    throw TypeError$b("The method doesn't accept regular expressions");
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

(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["largeSidebar"],{

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js&":
/*!*********************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js& ***!
  \*********************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsCommonFooterVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var vuex__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! vuex */"./node_modules/vuex/dist/vuex.esm.js");
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

/* harmony default export */__webpack_exports__["default"]={
data:function data(){
return {};
},
computed:_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_0__["mapGetters"])(["currentUser"])),
methods:{}};


/***/},

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js&":
/*!****************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js& ***!
  \****************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarSidebarVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _TopNav__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./TopNav */"./resources/src/containers/layouts/largeSidebar/TopNav.vue");
/* harmony import */var mobile_device_detect__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! mobile-device-detect */"./node_modules/mobile-device-detect/dist/index.js");
/* harmony import */var vuex__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! vuex */"./node_modules/vuex/dist/vuex.esm.js");
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
Topnav:_TopNav__WEBPACK_IMPORTED_MODULE_0__["default"]},

data:function data(){
return {
isDisplay:true,
isMenuOver:false,
isStyle:true,
selectedParentMenu:"",
isMobile:mobile_device_detect__WEBPACK_IMPORTED_MODULE_1__["isMobile"]};

},
mounted:function mounted(){
this.toggleSelectedParentMenu();
window.addEventListener("resize",this.handleWindowResize);
document.addEventListener("click",this.returnSelectedParentMenu);
this.handleWindowResize();
},
beforeDestroy:function beforeDestroy(){
document.removeEventListener("click",this.returnSelectedParentMenu);
window.removeEventListener("resize",this.handleWindowResize);
},
computed:_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapGetters"])(["getSideBarToggleProperties","currentUserPermissions"])),
methods:_objectSpread(_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapActions"])(["changeSecondarySidebarProperties","changeSecondarySidebarPropertiesViaMenuItem","changeSecondarySidebarPropertiesViaOverlay","changeSidebarProperties"])),{},{
handleWindowResize:function handleWindowResize(){
if(window.innerWidth<=1200){
if(this.getSideBarToggleProperties.isSideNavOpen){
this.changeSidebarProperties();
}

if(this.getSideBarToggleProperties.isSecondarySideNavOpen){
this.changeSecondarySidebarProperties();
}
}else {
if(!this.getSideBarToggleProperties.isSideNavOpen){
this.changeSidebarProperties();
}
}
},
toggleSelectedParentMenu:function toggleSelectedParentMenu(){
var currentParentUrl=this.$route.path.split("/").filter(function(x){
return x!=="";
})[1];

if(currentParentUrl!==undefined||currentParentUrl!==null){
this.selectedParentMenu=currentParentUrl.toLowerCase();
}else {
this.selectedParentMenu="dashboard";
}
},
toggleSubMenu:function toggleSubMenu(e){
var hasSubmenu=e.target.dataset.submenu;
var parent=e.target.dataset.item;

if(hasSubmenu){
this.selectedParentMenu=parent;
this.changeSecondarySidebarPropertiesViaMenuItem(true);
}else {
this.selectedParentMenu=parent;
this.changeSecondarySidebarPropertiesViaMenuItem(false);
}
},
removeOverlay:function removeOverlay(){
this.changeSecondarySidebarPropertiesViaOverlay();

if(window.innerWidth<=1200){
this.changeSidebarProperties();
}

this.toggleSelectedParentMenu();
},
returnSelectedParentMenu:function returnSelectedParentMenu(){
if(!this.isMenuOver){
this.toggleSelectedParentMenu();
}
},
toggleSidebarDropdwon:function toggleSidebarDropdwon(event){
var dropdownMenus=this.$el.querySelectorAll(".dropdown-sidemenu.open");
event.currentTarget.classList.toggle("open");
dropdownMenus.forEach(function(dropdown){
dropdown.classList.remove("open");
});
}})};



/***/},

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js&":
/*!***************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js& ***!
  \***************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarTopNavVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _utils__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./../../../utils */"./resources/src/utils/index.js");
/* harmony import */var mobile_device_detect__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! mobile-device-detect */"./node_modules/mobile-device-detect/dist/index.js");
/* harmony import */var vuex__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! vuex */"./node_modules/vuex/dist/vuex.esm.js");
/* harmony import */var vue_clickaway__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(/*! vue-clickaway */"./node_modules/vue-clickaway/dist/vue-clickaway.common.js");
/* harmony import */var vue_flag_icon__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__(/*! vue-flag-icon */"./node_modules/vue-flag-icon/index.js");
var _objectSpread2;

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
// import Sidebar from "./Sidebar";



// import { setTimeout } from 'timers';


/* harmony default export */__webpack_exports__["default"]={
mixins:[vue_clickaway__WEBPACK_IMPORTED_MODULE_3__["mixin"]],
components:{
FlagIcon:vue_flag_icon__WEBPACK_IMPORTED_MODULE_4__["default"]},

data:function data(){
return {
langs:["en","fr","ar","de","es","it","Ind","thai","tr_ch","sm_ch","tur","ru","hn","vn"],
isDisplay:true,
isStyle:true,
isSearchOpen:false,
isMouseOnMegaMenu:true,
isMegaMenuOpen:false,
is_Load:false// alerts:0,
};

},
computed:_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapGetters"])(["currentUser","getSideBarToggleProperties","currentUserPermissions","notifs_alert"])),
methods:_objectSpread(_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_2__["mapActions"])(["changeSecondarySidebarProperties","changeSidebarProperties","changeThemeMode","logout"])),{},(_objectSpread2={
logoutUser:function logoutUser(){
this.$store.dispatch("logout");
},
SetLocal:function SetLocal(locale){
this.$i18n.locale=locale;
this.$store.dispatch("language/setLanguage",locale);
Fire.$emit("ChangeLanguage");
},
handleFullScreen:function handleFullScreen(){
_utils__WEBPACK_IMPORTED_MODULE_0__["default"].toggleFullScreen();
}},
_defineProperty(_objectSpread2,"logoutUser",function logoutUser(){
this.logout();
}),_defineProperty(_objectSpread2,"closeMegaMenu",function closeMegaMenu(){
this.isMegaMenuOpen=false;
}),_defineProperty(_objectSpread2,"toggleMegaMenu",function toggleMegaMenu(){
this.isMegaMenuOpen=!this.isMegaMenuOpen;
}),_defineProperty(_objectSpread2,"toggleSearch",function toggleSearch(){
this.isSearchOpen=!this.isSearchOpen;
}),_defineProperty(_objectSpread2,"sideBarToggle",function sideBarToggle(el){
if(this.getSideBarToggleProperties.isSideNavOpen&&this.getSideBarToggleProperties.isSecondarySideNavOpen&&mobile_device_detect__WEBPACK_IMPORTED_MODULE_1__["isMobile"]){
this.changeSidebarProperties();
this.changeSecondarySidebarProperties();
}else if(this.getSideBarToggleProperties.isSideNavOpen&&this.getSideBarToggleProperties.isSecondarySideNavOpen){
this.changeSecondarySidebarProperties();
}else if(this.getSideBarToggleProperties.isSideNavOpen){
this.changeSidebarProperties();
}else if(!this.getSideBarToggleProperties.isSideNavOpen&&!this.getSideBarToggleProperties.isSecondarySideNavOpen&&!this.getSideBarToggleProperties.isActiveSecondarySideNav){
this.changeSidebarProperties();
}else if(!this.getSideBarToggleProperties.isSideNavOpen&&!this.getSideBarToggleProperties.isSecondarySideNavOpen){
this.changeSidebarProperties();
this.changeSecondarySidebarProperties();
}
}),_objectSpread2))};


/***/},

/***/"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js&":
/*!**************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js& ***!
  \**************************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/function node_modulesBabelLoaderLibIndexJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarIndexVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _Sidebar__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./Sidebar */"./resources/src/containers/layouts/largeSidebar/Sidebar.vue");
/* harmony import */var _TopNav__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./TopNav */"./resources/src/containers/layouts/largeSidebar/TopNav.vue");
/* harmony import */var _common_footer__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../common/footer */"./resources/src/containers/layouts/common/footer.vue");
/* harmony import */var vuex__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(/*! vuex */"./node_modules/vuex/dist/vuex.esm.js");
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




/* harmony default export */__webpack_exports__["default"]={
components:{
Sidebar:_Sidebar__WEBPACK_IMPORTED_MODULE_0__["default"],
TopNav:_TopNav__WEBPACK_IMPORTED_MODULE_1__["default"],
appFooter:_common_footer__WEBPACK_IMPORTED_MODULE_2__["default"]},

data:function data(){
return {};
},
computed:_objectSpread({},Object(vuex__WEBPACK_IMPORTED_MODULE_3__["mapGetters"])(["getSideBarToggleProperties"])),
methods:{}};


/***/},

/***/"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true&":
/*!*************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true& ***!
  \*************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsCommonFooterVueVueTypeTemplateId1dfb17ffScopedTrue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){
var _vm=this;
var _h=_vm.$createElement;
var _c=_vm._self._c||_h;
return _c("div",{staticClass:"footer_wrap"},[
_c("div",{staticClass:"flex-grow-1"}),
_vm._v(" "),
_c("div",{staticClass:"app-footer"},[
_c("div",{staticClass:"row"},[
_c("div",{staticClass:"col-md-9"},[
_c("p",[_c("strong",[_vm._v(_vm._s(_vm.currentUser.footer))])])])]),


_vm._v(" "),
_c(
"div",
{
staticClass:
"footer-bottom border-top pt-3 d-flex flex-column flex-sm-row align-items-center"},

[
_c("div",{staticClass:"d-flex align-items-center"},[
_c("img",{
staticClass:"logo",
attrs:{
src:"/images/"+_vm.currentUser.logo,
alt:"",
width:"60",
height:"60"}}),


_vm._v(" "),
_c("div",[
_c("div",[
_c("p",{staticClass:"m-0"},[
_vm._v(
"\n                            © 2022 "+
_vm._s(_vm.$t("developed_by"))+
"\n                            "+
_vm._s(_vm.currentUser.developed_by)+
"\n                        ")]),


_vm._v(" "),
_c("p",{staticClass:"m-0"},[
_vm._v("All rights reserved - v1")])])]),



_vm._v(" "),
_c("span",{staticClass:"flex-grow-1"})])])])]);





};
var staticRenderFns=[];
render._withStripped=true;



/***/},

/***/"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true&":
/*!********************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true& ***!
  \********************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarSidebarVueVueTypeTemplateId696fbebeScopedTrue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){
var _vm=this;
var _h=_vm.$createElement;
var _c=_vm._self._c||_h;
return _c(
"div",
{
staticClass:"side-content-wrap",
on:{
mouseenter:function mouseenter($event){
_vm.isMenuOver=true;
},
mouseleave:function mouseleave($event){
_vm.isMenuOver=false;
},
touchstart:function touchstart($event){
_vm.isMenuOver=true;
}}},


[
_c(
"vue-perfect-scrollbar",
{
ref:"myData",
staticClass:"sidebar-left rtl-ps-none ps scroll",
class:{open:_vm.getSideBarToggleProperties.isSideNavOpen},
attrs:{
settings:{suppressScrollX:true,wheelPropagation:false}}},


[
_c("div",[
_c("ul",{staticClass:"navigation-left"},[
_c(
"li",
{
staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="dashboard"},
attrs:{"data-item":"dashboard"},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"router-link",
{
staticClass:"nav-item-hold",
attrs:{tag:"a",to:"/app/dashboard"}},

[
_c("i",{staticClass:"nav-icon i-Bar-Chart"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("dashboard")))])])],




1),

_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes("products_add")||
_vm.currentUserPermissions.includes(
"products_view")||

_vm.currentUserPermissions.includes("barcode_view")),
expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes('products_add') ||\n                            currentUserPermissions.includes(\n                                'products_view'\n                            ) ||\n                            currentUserPermissions.includes('barcode_view'))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="products"},
attrs:{"data-item":"products","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Library"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("Products")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes(
"adjustment_view")||

_vm.currentUserPermissions.includes(
"adjustment_add")),

expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes(\n                            'adjustment_view'\n                        ) ||\n                            currentUserPermissions.includes(\n                                'adjustment_add'\n                            ))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="adjustments"},
attrs:{"data-item":"adjustments","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Edit-Map"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("StockAdjustement")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes("transfer_view")||
_vm.currentUserPermissions.includes("transfer_add")),
expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes('transfer_view') ||\n                            currentUserPermissions.includes('transfer_add'))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="transfers"},
attrs:{"data-item":"transfers","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Back1"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("StockTransfers")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes("expense_view")||
_vm.currentUserPermissions.includes("expense_add")),
expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes('expense_view') ||\n                            currentUserPermissions.includes('expense_add'))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="expenses"},
attrs:{"data-item":"expenses","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Wallet"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("Expenses")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes(
"Quotations_view")||

_vm.currentUserPermissions.includes(
"Quotations_add")),

expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes(\n                            'Quotations_view'\n                        ) ||\n                            currentUserPermissions.includes(\n                                'Quotations_add'\n                            ))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="quotations"},
attrs:{"data-item":"quotations","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Checkout-Basket"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("Quotations")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes(
"Purchases_view")||

_vm.currentUserPermissions.includes("Purchases_add")),
expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes(\n                            'Purchases_view'\n                        ) ||\n                            currentUserPermissions.includes(\n                                'Purchases_add'\n                            ))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="purchases"},
attrs:{"data-item":"purchases","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Receipt"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("Purchases")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes("Sales_view")||
_vm.currentUserPermissions.includes("Sales_add")),
expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes('Sales_view') ||\n                            currentUserPermissions.includes('Sales_add'))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="sales"},
attrs:{"data-item":"sales","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Full-Cart"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("Sales")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes(
"Sale_Returns_view")||

_vm.currentUserPermissions.includes(
"Sale_Returns_add")),

expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes(\n                            'Sale_Returns_view'\n                        ) ||\n                            currentUserPermissions.includes(\n                                'Sale_Returns_add'\n                            ))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="sale_return"},
attrs:{"data-item":"sale_return","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Right"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("SalesReturn")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes(
"Purchase_Returns_view")||

_vm.currentUserPermissions.includes(
"Purchase_Returns_add")),

expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes(\n                            'Purchase_Returns_view'\n                        ) ||\n                            currentUserPermissions.includes(\n                                'Purchase_Returns_add'\n                            ))\n                    "}],


staticClass:"nav-item",
class:{
active:_vm.selectedParentMenu=="purchase_return"},

attrs:{
"data-item":"purchase_return",
"data-submenu":true},

on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Left"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("PurchasesReturn")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes(
"Customers_view")||

_vm.currentUserPermissions.includes(
"Suppliers_view")||

_vm.currentUserPermissions.includes("users_view")),
expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes(\n                            'Customers_view'\n                        ) ||\n                            currentUserPermissions.includes(\n                                'Suppliers_view'\n                            ) ||\n                            currentUserPermissions.includes('users_view'))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="People"},
attrs:{"data-item":"People","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Business-Mens"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("People")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes(
"setting_system")||

_vm.currentUserPermissions.includes("warehouse")||
_vm.currentUserPermissions.includes("brand")||
_vm.currentUserPermissions.includes("backup")||
_vm.currentUserPermissions.includes("unit")||
_vm.currentUserPermissions.includes("currency")||
_vm.currentUserPermissions.includes("category")||
_vm.currentUserPermissions.includes(
"permissions_view")),

expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes(\n                            'setting_system'\n                        ) ||\n                            currentUserPermissions.includes('warehouse') ||\n                            currentUserPermissions.includes('brand') ||\n                            currentUserPermissions.includes('backup') ||\n                            currentUserPermissions.includes('unit') ||\n                            currentUserPermissions.includes('currency') ||\n                            currentUserPermissions.includes('category') ||\n                            currentUserPermissions.includes(\n                                'permissions_view'\n                            ))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="settings"},
attrs:{"data-item":"settings","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Data-Settings"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("Settings")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})]),


_vm._v(" "),
_c(
"li",
{
directives:[
{
name:"show",
rawName:"v-show",
value:
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes(
"Reports_payments_Sales")||

_vm.currentUserPermissions.includes(
"Reports_payments_Purchases")||

_vm.currentUserPermissions.includes(
"Reports_payments_Sale_Returns")||

_vm.currentUserPermissions.includes(
"Reports_payments_purchase_Return")||

_vm.currentUserPermissions.includes(
"Warehouse_report")||

_vm.currentUserPermissions.includes(
"Reports_profit")||

_vm.currentUserPermissions.includes(
"Reports_purchase")||

_vm.currentUserPermissions.includes(
"Reports_quantity_alerts")||

_vm.currentUserPermissions.includes(
"Reports_sales")||

_vm.currentUserPermissions.includes(
"Reports_suppliers")||

_vm.currentUserPermissions.includes(
"Reports_customers")),

expression:
"\n                        currentUserPermissions &&\n                        (currentUserPermissions.includes(\n                            'Reports_payments_Sales'\n                        ) ||\n                            currentUserPermissions.includes(\n                                'Reports_payments_Purchases'\n                            ) ||\n                            currentUserPermissions.includes(\n                                'Reports_payments_Sale_Returns'\n                            ) ||\n                            currentUserPermissions.includes(\n                                'Reports_payments_purchase_Return'\n                            ) ||\n                            currentUserPermissions.includes(\n                                'Warehouse_report'\n                            ) ||\n                            currentUserPermissions.includes(\n                                'Reports_profit'\n                            ) ||\n                            currentUserPermissions.includes(\n                                'Reports_purchase'\n                            ) ||\n                            currentUserPermissions.includes(\n                                'Reports_quantity_alerts'\n                            ) ||\n                            currentUserPermissions.includes(\n                                'Reports_sales'\n                            ) ||\n                            currentUserPermissions.includes(\n                                'Reports_suppliers'\n                            ) ||\n                            currentUserPermissions.includes(\n                                'Reports_customers'\n                            ))\n                    "}],


staticClass:"nav-item",
class:{active:_vm.selectedParentMenu=="reports"},
attrs:{"data-item":"reports","data-submenu":true},
on:{mouseenter:_vm.toggleSubMenu}},

[
_c(
"a",
{staticClass:"nav-item-hold",attrs:{href:"#"}},
[
_c("i",{staticClass:"nav-icon i-Line-Chart"}),
_vm._v(" "),
_c("span",{staticClass:"nav-text"},[
_vm._v(_vm._s(_vm.$t("Reports")))])]),



_vm._v(" "),
_c("div",{staticClass:"triangle"})])])])]),






_vm._v(" "),
_c(
"vue-perfect-scrollbar",
{
staticClass:"sidebar-left-secondary ps rtl-ps-none",
class:{
open:_vm.getSideBarToggleProperties.isSecondarySideNavOpen},

attrs:{
settings:{suppressScrollX:true,wheelPropagation:false}}},


[
_c("div",{ref:"sidebarChild"},[
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="products"},
attrs:{"data-parent":"products"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("products_add")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/products/store"}},
[
_c("i",{staticClass:"nav-icon i-Add-File"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("AddProduct")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("products_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/products/list"}},
[
_c("i",{staticClass:"nav-icon i-Files"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("productsList")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("barcode_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/products/barcode"}},
[
_c("i",{staticClass:"nav-icon i-Bar-Code"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Printbarcode")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="adjustments"},
attrs:{"data-parent":"adjustments"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("adjustment_add")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/adjustments/store"}},
[
_c("i",{staticClass:"nav-icon i-Add-File"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("CreateAdjustment")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("adjustment_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/adjustments/list"}},
[
_c("i",{staticClass:"nav-icon i-Files"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("ListAdjustments")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="transfers"},
attrs:{"data-parent":"transfers"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("transfer_add")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/transfers/store"}},
[
_c("i",{staticClass:"nav-icon i-Add-File"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("CreateTransfer")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("transfer_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/transfers/list"}},
[
_c("i",{staticClass:"nav-icon i-Files"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("ListTransfers")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="expenses"},
attrs:{"data-parent":"expenses"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("expense_add")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/expenses/store"}},
[
_c("i",{staticClass:"nav-icon i-Add-File"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Create_Expense")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("expense_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/expenses/list"}},
[
_c("i",{staticClass:"nav-icon i-Files"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("ListExpenses")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("expense_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/expenses/category"}},
[
_c("i",{staticClass:"nav-icon i-Files"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Expense_Category")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="quotations"},
attrs:{"data-parent":"quotations"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Quotations_add")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/quotations/store"}},
[
_c("i",{staticClass:"nav-icon i-Add-File"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("AddQuote")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Quotations_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/quotations/list"}},
[
_c("i",{staticClass:"nav-icon i-Files"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("ListQuotations")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="purchases"},
attrs:{"data-parent":"purchases"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Purchases_add")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/purchases/store"}},
[
_c("i",{staticClass:"nav-icon i-Add-File"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("AddPurchase")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Purchases_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/purchases/list"}},
[
_c("i",{staticClass:"nav-icon i-Files"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("ListPurchases")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="sales"},
attrs:{"data-parent":"sales"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Sales_add")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/sales/store"}},
[
_c("i",{staticClass:"nav-icon i-Add-File"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("AddSale")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Sales_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/sales/list"}},
[
_c("i",{staticClass:"nav-icon i-Files"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("ListSales")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="sale_return"},
attrs:{"data-parent":"sale_return"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Sale_Returns_add")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/sale_return/store"}},
[
_c("i",{staticClass:"nav-icon i-Add-File"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("AddReturn")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Sale_Returns_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/sale_return/list"}},
[
_c("i",{staticClass:"nav-icon i-Files"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("ListReturns")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{
"d-block":_vm.selectedParentMenu=="purchase_return"},

attrs:{"data-parent":"purchase_return"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Purchase_Returns_add")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/purchase_return/store"}},


[
_c("i",{staticClass:"nav-icon i-Add-File"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("AddReturn")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Purchase_Returns_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/purchase_return/list"}},


[
_c("i",{staticClass:"nav-icon i-Files"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("ListReturns")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="People"},
attrs:{"data-parent":"People"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Customers_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/People/Customers"}},
[
_c("i",{
staticClass:"nav-icon i-Administrator"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Customers")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Suppliers_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/People/Suppliers"}},
[
_c("i",{
staticClass:"nav-icon i-Administrator"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Suppliers")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("users_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/People/Users"}},
[
_c("i",{
staticClass:"nav-icon i-Administrator"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Users")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="settings"},
attrs:{"data-parent":"settings"}},

[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("setting_system")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/settings/System_settings"}},


[
_c("i",{
staticClass:"nav-icon i-Data-Settings"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("SystemSettings")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("permissions_view")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/settings/permissions"}},


[
_c("i",{staticClass:"nav-icon i-Key"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("GroupPermissions")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("warehouse")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{tag:"a",to:"/app/settings/Warehouses"}},

[
_c("i",{
staticClass:"nav-icon i-Clothing-Store"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Warehouses")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("category")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{tag:"a",to:"/app/settings/Categories"}},

[
_c("i",{
staticClass:"nav-icon i-Duplicate-Layer"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Categories")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("brand")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/settings/Brands"}},
[
_c("i",{staticClass:"nav-icon i-Bookmark"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Brand")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("currency")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{tag:"a",to:"/app/settings/Currencies"}},

[
_c("i",{
staticClass:"nav-icon i-Dollar-Sign-2"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Currencies")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("unit")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/settings/Units"}},
[
_c("i",{staticClass:"nav-icon i-Quotes"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Units")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("backup")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{attrs:{tag:"a",to:"/app/settings/Backup"}},
[
_c("i",{staticClass:"nav-icon i-Data-Backup"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Backup")))])])],




1):

_vm._e()]),


_vm._v(" "),
_c(
"ul",
{
staticClass:"childNav d-none",
class:{"d-block":_vm.selectedParentMenu=="reports"},
attrs:{"data-parent":"reports"}},

[
_vm.currentUserPermissions&&(
_vm.currentUserPermissions.includes(
"Reports_payments_Purchases")||

_vm.currentUserPermissions.includes(
"Reports_payments_Sales")||

_vm.currentUserPermissions.includes(
"Reports_payments_Sale_Returns")||

_vm.currentUserPermissions.includes(
"Reports_payments_purchase_Return"))?

_c(
"li",
{
staticClass:"nav-item dropdown-sidemenu",
on:{
click:function click($event){
$event.preventDefault();
return _vm.toggleSidebarDropdwon($event);
}}},


[
_c("a",{attrs:{href:"#"}},[
_c("i",{staticClass:"nav-icon i-Credit-Card"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Payments")))]),

_vm._v(" "),
_c("i",{staticClass:"dd-arrow i-Arrow-Down"})]),

_vm._v(" "),
_c("ul",{staticClass:"submenu"},[
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes(
"Reports_payments_Purchases")?

_c(
"li",
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/payments_purchase"}},


[
_c("i",{
staticClass:"nav-icon i-ID-Card"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Purchases")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes(
"Reports_payments_Sales")?

_c(
"li",
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/payments_sale"}},


[
_c("i",{
staticClass:"nav-icon i-ID-Card"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Sales")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes(
"Reports_payments_Sale_Returns")?

_c(
"li",
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/payments_sales_returns"}},


[
_c("i",{
staticClass:"nav-icon i-ID-Card"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("SalesReturn")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes(
"Reports_payments_purchase_Return")?

_c(
"li",
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/payments_purchases_returns"}},


[
_c("i",{
staticClass:"nav-icon i-ID-Card"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(
_vm._s(_vm.$t("PurchasesReturn")))])])],





1):

_vm._e()])]):



_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Reports_profit")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/profit_and_loss"}},


[
_c("i",{
staticClass:
"nav-icon i-Split-Four-Square-Window"}),

_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("ProfitandLoss")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Reports_quantity_alerts")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/quantity_alerts"}},


[
_c("i",{staticClass:"nav-icon i-Dollar"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("ProductQuantityAlerts")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Warehouse_report")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/warehouse_report"}},


[
_c("i",{staticClass:"nav-icon i-Pie-Chart-2"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("Warehouse_report")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Reports_sales")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/sales_report"}},


[
_c("i",{staticClass:"nav-icon i-Line-Chart"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("SalesReport")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Reports_purchase")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/purchase_report"}},


[
_c("i",{staticClass:"nav-icon i-Bar-Chart-2"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("PurchasesReport")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Reports_customers")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/customers_report"}},


[
_c("i",{staticClass:"nav-icon i-Bar-Chart"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("CustomersReport")))])])],




1):

_vm._e(),
_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("Reports_suppliers")?
_c(
"li",
{staticClass:"nav-item"},
[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/providers_report"}},


[
_c("i",{staticClass:"nav-icon i-Pie-Chart"}),
_vm._v(" "),
_c("span",{staticClass:"item-name"},[
_vm._v(_vm._s(_vm.$t("SuppliersReport")))])])],




1):

_vm._e()])])]),





_vm._v(" "),
_c("div",{
staticClass:"sidebar-overlay",
class:{open:_vm.getSideBarToggleProperties.isSecondarySideNavOpen},
on:{
click:function click($event){
return _vm.removeOverlay();
}}})],



1);

};
var staticRenderFns=[];
render._withStripped=true;



/***/},

/***/"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c&":
/*!*******************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c& ***!
  \*******************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarTopNavVueVueTypeTemplateId7dfa9f1c(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){
var _vm=this;
var _h=_vm.$createElement;
var _c=_vm._self._c||_h;
return _c("div",{staticClass:"main-header"},[
_c(
"div",
{staticClass:"logo"},
[
_c("router-link",{attrs:{to:"/app/dashboard"}},[
_c("img",{
attrs:{
src:"/images/"+_vm.currentUser.logo,
alt:"",
width:"60",
height:"60"}})])],




1),

_vm._v(" "),
_c(
"div",
{staticClass:"menu-toggle",on:{click:_vm.sideBarToggle}},
[_c("div"),_vm._v(" "),_c("div"),_vm._v(" "),_c("div")]),

_vm._v(" "),
_c("div",{staticStyle:{margin:"auto"}}),
_vm._v(" "),
_c("div",{staticClass:"header-part-right"},[
_c("i",{
staticClass:"i-Full-Screen header-icon d-none d-sm-inline-block",
on:{click:_vm.handleFullScreen}}),

_vm._v(" "),
_c(
"div",
{staticClass:"dropdown"},
[
_c(
"b-dropdown",
{
staticClass:"m-md-2 d-none d-md-block",
attrs:{
id:"dropdown",
text:"Dropdown Button",
"toggle-class":"text-decoration-none",
"no-caret":"",
variant:"link"}},


[
_c("template",{slot:"button-content"},[
_c("i",{
staticClass:"i-Globe text-muted header-icon",
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
"dropdown-menu-right rtl-ps-none notification-dropdown ps scroll",
attrs:{
settings:{
suppressScrollX:true,
wheelPropagation:false}}},



[
_c("div",{staticClass:"menu-icon-grid"},[
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
"\n                            English\n                        ")]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("French")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Arabic")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Turkish")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Simplified Chinese")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Thaï")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Hindi")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("German")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Spanish")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Italien")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Indonesian")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Traditional Chinese")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Russian")])]),



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
_c("span",{staticClass:"title-lang"},[
_vm._v("Vietnamese")])])])])],







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
"m-md-2 badge-top-container d-none d-sm-inline-block",
attrs:{
id:"dropdown-1",
text:"Dropdown Button",
"toggle-class":"text-decoration-none",
"no-caret":"",
variant:"link"}},


[
_c("template",{slot:"button-content"},[
_vm.notifs_alert>0?
_c("span",{staticClass:"badge badge-primary"},[
_vm._v("1")]):

_vm._e(),
_vm._v(" "),
_c("i",{staticClass:"i-Bell text-muted header-icon"})]),

_vm._v(" "),
_c(
"vue-perfect-scrollbar",
{
ref:"myData",
staticClass:
"dropdown-menu-right rtl-ps-none notification-dropdown ps scroll",
class:{
open:_vm.getSideBarToggleProperties.isSideNavOpen},

attrs:{
settings:{
suppressScrollX:true,
wheelPropagation:false}}},



[
_vm.notifs_alert>0?
_c("div",{staticClass:"dropdown-item d-flex"},[
_c("div",{staticClass:"notification-icon"},[
_c("i",{staticClass:"i-Bell text-primary mr-1"})]),

_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes(
"Reports_quantity_alerts")?

_c(
"div",
{
staticClass:"notification-details flex-grow-1"},

[
_c(
"router-link",
{
attrs:{
tag:"a",
to:"/app/reports/quantity_alerts"}},


[
_c(
"p",
{
staticClass:
"text-small text-muted m-0"},

[
_vm._v(
"\n                                    "+
_vm._s(_vm.notifs_alert)+
"\n                                    "+
_vm._s(
_vm.$t("ProductQuantityAlerts"))+

"\n                                ")])])],






1):

_vm._e()]):

_vm._e()])],



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
staticClass:"m-md-2 user col align-self-end d-none d-md-block",
attrs:{
id:"dropdown-1",
text:"Dropdown Button",
"toggle-class":"text-decoration-none",
"no-caret":"",
variant:"link"}},


[
_c("template",{slot:"button-content"},[
_c("img",{
attrs:{
src:"/images/avatar/"+_vm.currentUser.avatar,
id:"userDropdown",
alt:"",
"data-toggle":"dropdown",
"aria-haspopup":"true",
"aria-expanded":"false"}})]),



_vm._v(" "),
_c(
"div",
{
staticClass:"dropdown-menu-right",
attrs:{"aria-labelledby":"userDropdown"}},

[
_c("div",{staticClass:"dropdown-header"},[
_c("i",{staticClass:"i-Lock-User mr-1"}),
_vm._v(" "),
_c("span",[_vm._v(_vm._s(_vm.currentUser.username))])]),

_vm._v(" "),
_c(
"router-link",
{
staticClass:"dropdown-item",
attrs:{to:"/app/profile"}},

[_vm._v(_vm._s(_vm.$t("profil")))]),

_vm._v(" "),
_vm.currentUserPermissions&&
_vm.currentUserPermissions.includes("setting_system")?
_c(
"router-link",
{
staticClass:"dropdown-item",
attrs:{to:"/app/settings/System_settings"}},

[_vm._v(_vm._s(_vm.$t("Settings")))]):

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
return _vm.logoutUser.apply(null,arguments);
}}},


[_vm._v(_vm._s(_vm.$t("logout")))])],


1)],


2)],


1)])]);



};
var staticRenderFns=[];
render._withStripped=true;



/***/},

/***/"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858&":
/*!******************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858& ***!
  \******************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function node_modulesVueLoaderLibLoadersTemplateLoaderJsNode_modulesVueLoaderLibIndexJsResourcesSrcContainersLayoutsLargeSidebarIndexVueVueTypeTemplateId427f8858(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"render",function(){return render;});
/* harmony export (binding) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return staticRenderFns;});
var render=function render(){
var _vm=this;
var _h=_vm.$createElement;
var _c=_vm._self._c||_h;
return _c(
"div",
{staticClass:"app-admin-wrap layout-sidebar-large clearfix"},
[
_c("top-nav"),
_vm._v(" "),
_c("sidebar"),
_vm._v(" "),
_c("main",[
_c(
"div",
{
staticClass:"main-content-wrap d-flex flex-column flex-grow-1",
class:{
"sidenav-open":_vm.getSideBarToggleProperties.isSideNavOpen}},


[
_c(
"transition",
{attrs:{name:"page",mode:"out-in"}},
[_c("router-view")],
1),

_vm._v(" "),
_c("div",{staticClass:"flex-grow-1"}),
_vm._v(" "),
_c("appFooter")],

1)])],



1);

};
var staticRenderFns=[];
render._withStripped=true;



/***/},

/***/"./resources/src/containers/layouts/common/footer.vue":
/*!************************************************************!*\
  !*** ./resources/src/containers/layouts/common/footer.vue ***!
  \************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsCommonFooterVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _footer_vue_vue_type_template_id_1dfb17ff_scoped_true___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./footer.vue?vue&type=template&id=1dfb17ff&scoped=true& */"./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true&");
/* harmony import */var _footer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./footer.vue?vue&type=script&lang=js& */"./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_footer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
_footer_vue_vue_type_template_id_1dfb17ff_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
_footer_vue_vue_type_template_id_1dfb17ff_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
"1dfb17ff",
null);
component.options.__file="resources/src/containers/layouts/common/footer.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/},

/***/"./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js&":
/*!*************************************************************************************!*\
  !*** ./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js& ***!
  \*************************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsCommonFooterVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib??vue-loader-options!./footer.vue?vue&type=script&lang=js& */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/common/footer.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"];

/***/},

/***/"./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true&":
/*!*******************************************************************************************************!*\
  !*** ./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true& ***!
  \*******************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcContainersLayoutsCommonFooterVueVueTypeTemplateId1dfb17ffScopedTrue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_template_id_1dfb17ff_scoped_true___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../node_modules/vue-loader/lib??vue-loader-options!./footer.vue?vue&type=template&id=1dfb17ff&scoped=true& */"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/common/footer.vue?vue&type=template&id=1dfb17ff&scoped=true&");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_template_id_1dfb17ff_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_footer_vue_vue_type_template_id_1dfb17ff_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



/***/},

/***/"./resources/src/containers/layouts/largeSidebar/Sidebar.vue":
/*!*******************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/Sidebar.vue ***!
  \*******************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarSidebarVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _Sidebar_vue_vue_type_template_id_696fbebe_scoped_true___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./Sidebar.vue?vue&type=template&id=696fbebe&scoped=true& */"./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true&");
/* harmony import */var _Sidebar_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./Sidebar.vue?vue&type=script&lang=js& */"./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_Sidebar_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
_Sidebar_vue_vue_type_template_id_696fbebe_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
_Sidebar_vue_vue_type_template_id_696fbebe_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
"696fbebe",
null);
component.options.__file="resources/src/containers/layouts/largeSidebar/Sidebar.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/},

/***/"./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js&":
/*!********************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js& ***!
  \********************************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarSidebarVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Sidebar_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib??vue-loader-options!./Sidebar.vue?vue&type=script&lang=js& */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Sidebar_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"];

/***/},

/***/"./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true&":
/*!**************************************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true& ***!
  \**************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcContainersLayoutsLargeSidebarSidebarVueVueTypeTemplateId696fbebeScopedTrue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Sidebar_vue_vue_type_template_id_696fbebe_scoped_true___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../node_modules/vue-loader/lib??vue-loader-options!./Sidebar.vue?vue&type=template&id=696fbebe&scoped=true& */"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/Sidebar.vue?vue&type=template&id=696fbebe&scoped=true&");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Sidebar_vue_vue_type_template_id_696fbebe_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_Sidebar_vue_vue_type_template_id_696fbebe_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



/***/},

/***/"./resources/src/containers/layouts/largeSidebar/TopNav.vue":
/*!******************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/TopNav.vue ***!
  \******************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarTopNavVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _TopNav_vue_vue_type_template_id_7dfa9f1c___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./TopNav.vue?vue&type=template&id=7dfa9f1c& */"./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c&");
/* harmony import */var _TopNav_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./TopNav.vue?vue&type=script&lang=js& */"./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_TopNav_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
_TopNav_vue_vue_type_template_id_7dfa9f1c___WEBPACK_IMPORTED_MODULE_0__["render"],
_TopNav_vue_vue_type_template_id_7dfa9f1c___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
null,
null);
component.options.__file="resources/src/containers/layouts/largeSidebar/TopNav.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/},

/***/"./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js&":
/*!*******************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js& ***!
  \*******************************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarTopNavVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_TopNav_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib??vue-loader-options!./TopNav.vue?vue&type=script&lang=js& */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_TopNav_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"];

/***/},

/***/"./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c&":
/*!*************************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c& ***!
  \*************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcContainersLayoutsLargeSidebarTopNavVueVueTypeTemplateId7dfa9f1c(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_TopNav_vue_vue_type_template_id_7dfa9f1c___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../node_modules/vue-loader/lib??vue-loader-options!./TopNav.vue?vue&type=template&id=7dfa9f1c& */"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/TopNav.vue?vue&type=template&id=7dfa9f1c&");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_TopNav_vue_vue_type_template_id_7dfa9f1c___WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_TopNav_vue_vue_type_template_id_7dfa9f1c___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



/***/},

/***/"./resources/src/containers/layouts/largeSidebar/index.vue":
/*!*****************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/index.vue ***!
  \*****************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarIndexVue(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _index_vue_vue_type_template_id_427f8858___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! ./index.vue?vue&type=template&id=427f8858& */"./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858&");
/* harmony import */var _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(/*! ./index.vue?vue&type=script&lang=js& */"./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony import */var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(/*! ../../../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */"./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component=Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
_index_vue_vue_type_template_id_427f8858___WEBPACK_IMPORTED_MODULE_0__["render"],
_index_vue_vue_type_template_id_427f8858___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
false,
null,
null,
null);
component.options.__file="resources/src/containers/layouts/largeSidebar/index.vue";
/* harmony default export */__webpack_exports__["default"]=component.exports;

/***/},

/***/"./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js&":
/*!******************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js& ***!
  \******************************************************************************************/
/*! exports provided: default */
/***/function resourcesSrcContainersLayoutsLargeSidebarIndexVueVueTypeScriptLangJs(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/babel-loader/lib??ref--4-0!../../../../../node_modules/vue-loader/lib??vue-loader-options!./index.vue?vue&type=script&lang=js& */"./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */__webpack_exports__["default"]=_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"];

/***/},

/***/"./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858&":
/*!************************************************************************************************!*\
  !*** ./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858& ***!
  \************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/function resourcesSrcContainersLayoutsLargeSidebarIndexVueVueTypeTemplateId427f8858(module,__webpack_exports__,__webpack_require__){
__webpack_require__.r(__webpack_exports__);
/* harmony import */var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_template_id_427f8858___WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(/*! -!../../../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../node_modules/vue-loader/lib??vue-loader-options!./index.vue?vue&type=template&id=427f8858& */"./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./resources/src/containers/layouts/largeSidebar/index.vue?vue&type=template&id=427f8858&");
/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"render",function(){return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_template_id_427f8858___WEBPACK_IMPORTED_MODULE_0__["render"];});

/* harmony reexport (safe) */__webpack_require__.d(__webpack_exports__,"staticRenderFns",function(){return _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_template_id_427f8858___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"];});



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


/***/}}]);

}());
