/* single-spa@5.9.3 - ES2015 - dev */
var singleSpa = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get start () { return start; },
	get ensureJQuerySupport () { return ensureJQuerySupport; },
	get setBootstrapMaxTime () { return setBootstrapMaxTime; },
	get setMountMaxTime () { return setMountMaxTime; },
	get setUnmountMaxTime () { return setUnmountMaxTime; },
	get setUnloadMaxTime () { return setUnloadMaxTime; },
	get registerApplication () { return registerApplication; },
	get unregisterApplication () { return unregisterApplication; },
	get getMountedApps () { return getMountedApps; },
	get getAppStatus () { return getAppStatus; },
	get unloadApplication () { return unloadApplication; },
	get checkActivityFunctions () { return checkActivityFunctions; },
	get getAppNames () { return getAppNames; },
	get pathToActiveWhen () { return pathToActiveWhen; },
	get navigateToUrl () { return navigateToUrl; },
	get triggerAppChange () { return triggerAppChange; },
	get addErrorHandler () { return addErrorHandler; },
	get removeErrorHandler () { return removeErrorHandler; },
	get mountRootParcel () { return mountRootParcel; },
	get NOT_LOADED () { return NOT_LOADED; },
	get LOADING_SOURCE_CODE () { return LOADING_SOURCE_CODE; },
	get NOT_BOOTSTRAPPED () { return NOT_BOOTSTRAPPED; },
	get BOOTSTRAPPING () { return BOOTSTRAPPING; },
	get NOT_MOUNTED () { return NOT_MOUNTED; },
	get MOUNTING () { return MOUNTING; },
	get UPDATING () { return UPDATING; },
	get LOAD_ERROR () { return LOAD_ERROR; },
	get MOUNTED () { return MOUNTED; },
	get UNMOUNTING () { return UNMOUNTING; },
	get SKIP_BECAUSE_BROKEN () { return SKIP_BECAUSE_BROKEN; }
});

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var NativeCustomEvent = commonjsGlobal.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

var customEvent = useNative() ? NativeCustomEvent :

// IE >= 9
'undefined' !== typeof document && 'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
};

let errorHandlers = []; // 处理app错误

function handleAppError(err, app, newStatus) {
  const transformedErr = transformErr(err, app, newStatus);

  if (errorHandlers.length) {
    // 如果错误队列中有值，则遍历调用，并传入transformedErr
    errorHandlers.forEach(handler => handler(transformedErr));
  } else {
    setTimeout(() => {
      // 否则则直接调用transformedErr
      throw transformedErr;
    });
  }
}
function addErrorHandler(handler) {
  if (typeof handler !== "function") {
    throw Error(formatErrorMessage(28, // handler 必须是一个函数
    "a single-spa error handler must be a function"));
  }

  errorHandlers.push(handler);
}
function removeErrorHandler(handler) {
  if (typeof handler !== "function") {
    throw Error(formatErrorMessage(29, // handler 必须是一个函数
    "a single-spa error handler must be a function"));
  }

  let removedSomething = false;
  errorHandlers = errorHandlers.filter(h => {
    const isHandler = h === handler;
    removedSomething = removedSomething || isHandler;
    return !isHandler;
  });
  return removedSomething;
} // 报告错误信息

function formatErrorMessage(code, msg, ...args) {
  return `single-spa minified message #${code}: ${msg ? msg + " " : ""}See https://single-spa.js.org/error/?code=${code}${args.length ? `&arg=${args.join("&arg=")}` : ""}`;
}
function transformErr(ogErr, appOrParcel, newStatus) {
  const errPrefix = `${objectType(appOrParcel)} '${toName(appOrParcel)}' died in status ${appOrParcel.status}: `;
  let result;

  if (ogErr instanceof Error) {
    try {
      ogErr.message = errPrefix + ogErr.message;
    } catch (err) {
      /* Some errors have read-only message properties, in which case there is nothing
       * that we can do.
       */
    }

    result = ogErr;
  } else {
    console.warn(formatErrorMessage(30, `While ${appOrParcel.status}, '${toName(appOrParcel)}' rejected its lifecycle function promise with a non-Error. This will cause stack traces to not be accurate.`, appOrParcel.status, toName(appOrParcel)));

    try {
      result = Error(errPrefix + JSON.stringify(ogErr));
    } catch (err) {
      // If it's not an Error and you can't stringify it, then what else can you even do to it?
      result = ogErr;
    }
  }

  result.appOrParcelName = toName(appOrParcel); // We set the status after transforming the error so that the error message
  // references the state the application was in before the status change.

  appOrParcel.status = newStatus;
  return result;
}

// App 状态 === single-spa的所有状态都在这里

const NOT_LOADED = "NOT_LOADED"; // 未加载

const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE"; // 加载中

const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED"; // 未激活启动

const BOOTSTRAPPING = "BOOTSTRAPPING"; // 激活启动中

const NOT_MOUNTED = "NOT_MOUNTED"; // 未挂载

const MOUNTING = "MOUNTING"; // 挂载中

const MOUNTED = "MOUNTED"; // 已挂载

const UPDATING = "UPDATING"; // 更新中

const UNMOUNTING = "UNMOUNTING"; // 卸载中

const UNLOADING = "UNLOADING"; // 完全卸载

const LOAD_ERROR = "LOAD_ERROR"; // 加载错误

const SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN"; // 跳过，因为挂了，用于报错时的状态
// 当前应用处于激活状态

function isActive(app) {
  return app.status === MOUNTED;
} // 当前应用是否应该被激活

function shouldBeActive(app) {
  try {
    return app.activeWhen(window.location); // 执行函数，得到一个字符串，用来标识应用前缀
  } catch (err) {
    handleAppError(err, app, SKIP_BECAUSE_BROKEN);
    return false;
  }
}
function toName(app) {
  return app.name;
}
function isParcel(appOrParcel) {
  return Boolean(appOrParcel.unmountThisParcel);
}
function objectType(appOrParcel) {
  return isParcel(appOrParcel) ? "parcel" : "application";
}

// Object.assign() is not available in IE11. And the babel compiled output for object spread
// syntax checks a bunch of Symbol stuff and is almost a kb. So this function is the smaller replacement.
function assign() {
  for (let i = arguments.length - 1; i > 0; i--) {
    for (let key in arguments[i]) {
      if (key === "__proto__") {
        continue;
      }

      arguments[i - 1][key] = arguments[i][key];
    }
  }

  return arguments[0];
}

/* the array.prototype.find polyfill on npmjs.com is ~20kb (not worth it)
 * and lodash is ~200kb (not worth it)
 */
// npm和lodash的find包都比较大，所以作者自己写了一个
// 遍历数组，将数组中每一项作为参数，调用func执行。如果func执行后返回true，则返回当前数组的值，否则依次执行。
function find(arr, func) {
  for (let i = 0; i < arr.length; i++) {
    if (func(arr[i])) {
      return arr[i];
    }
  }

  return null;
}

function validLifecycleFn(fn) {
  return fn && (typeof fn === "function" || isArrayOfFns(fn));

  function isArrayOfFns(arr) {
    return Array.isArray(arr) && !find(arr, item => typeof item !== "function");
  }
}
function flattenFnArray(appOrParcel, lifecycle) {
  let fns = appOrParcel[lifecycle] || [];
  fns = Array.isArray(fns) ? fns : [fns];

  if (fns.length === 0) {
    fns = [() => Promise.resolve()];
  }

  const type = objectType(appOrParcel);
  const name = toName(appOrParcel);
  return function (props) {
    return fns.reduce((resultPromise, fn, index) => {
      return resultPromise.then(() => {
        const thisPromise = fn(props);
        return smellsLikeAPromise(thisPromise) ? thisPromise : Promise.reject(formatErrorMessage(15, `Within ${type} ${name}, the lifecycle function ${lifecycle} at array index ${index} did not return a promise`, type, name, lifecycle, index));
      });
    }, Promise.resolve());
  };
}
function smellsLikeAPromise(promise) {
  return promise && typeof promise.then === "function" && typeof promise.catch === "function";
}

function toBootstrapPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_BOOTSTRAPPED) {
      return appOrParcel;
    }

    appOrParcel.status = BOOTSTRAPPING;

    if (!appOrParcel.bootstrap) {
      // Default implementation of bootstrap
      return Promise.resolve().then(successfulBootstrap);
    }

    return reasonableTime(appOrParcel, "bootstrap").then(successfulBootstrap).catch(err => {
      if (hardFail) {
        throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
      } else {
        handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
        return appOrParcel;
      }
    });
  });

  function successfulBootstrap() {
    appOrParcel.status = NOT_MOUNTED;
    return appOrParcel;
  }
}

function toUnmountPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== MOUNTED) {
      return appOrParcel;
    }

    appOrParcel.status = UNMOUNTING;
    const unmountChildrenParcels = Object.keys(appOrParcel.parcels).map(parcelId => appOrParcel.parcels[parcelId].unmountThisParcel());
    return Promise.all(unmountChildrenParcels).then(unmountAppOrParcel, parcelError => {
      // There is a parcel unmount error
      return unmountAppOrParcel().then(() => {
        // Unmounting the app/parcel succeeded, but unmounting its children parcels did not
        const parentError = Error(parcelError.message);

        if (hardFail) {
          throw transformErr(parentError, appOrParcel, SKIP_BECAUSE_BROKEN);
        } else {
          handleAppError(parentError, appOrParcel, SKIP_BECAUSE_BROKEN);
        }
      });
    }).then(() => appOrParcel);

    function unmountAppOrParcel() {
      // We always try to unmount the appOrParcel, even if the children parcels failed to unmount.
      return reasonableTime(appOrParcel, "unmount").then(() => {
        // The appOrParcel needs to stay in a broken status if its children parcels fail to unmount
        {
          appOrParcel.status = NOT_MOUNTED;
        }
      }).catch(err => {
        if (hardFail) {
          throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
        } else {
          handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
        }
      });
    }
  });
}

let beforeFirstMountFired = false;
let firstMountFired = false;
function toMountPromise(appOrParcel, hardFail) {
  return Promise.resolve().then(() => {
    if (appOrParcel.status !== NOT_MOUNTED) {
      return appOrParcel;
    }

    if (!beforeFirstMountFired) {
      window.dispatchEvent(new customEvent("single-spa:before-first-mount"));
      beforeFirstMountFired = true;
    }

    return reasonableTime(appOrParcel, "mount").then(() => {
      appOrParcel.status = MOUNTED;

      if (!firstMountFired) {
        window.dispatchEvent(new customEvent("single-spa:first-mount"));
        firstMountFired = true;
      }

      return appOrParcel;
    }).catch(err => {
      // If we fail to mount the appOrParcel, we should attempt to unmount it before putting in SKIP_BECAUSE_BROKEN
      // We temporarily put the appOrParcel into MOUNTED status so that toUnmountPromise actually attempts to unmount it
      // instead of just doing a no-op.
      appOrParcel.status = MOUNTED;
      return toUnmountPromise(appOrParcel, true).then(setSkipBecauseBroken, setSkipBecauseBroken);

      function setSkipBecauseBroken() {
        if (!hardFail) {
          handleAppError(err, appOrParcel, SKIP_BECAUSE_BROKEN);
          return appOrParcel;
        } else {
          throw transformErr(err, appOrParcel, SKIP_BECAUSE_BROKEN);
        }
      }
    });
  });
}

function toUpdatePromise(parcel) {
  return Promise.resolve().then(() => {
    if (parcel.status !== MOUNTED) {
      throw Error(formatErrorMessage(32, `Cannot update parcel '${toName(parcel)}' because it is not mounted`, toName(parcel)));
    }

    parcel.status = UPDATING;
    return reasonableTime(parcel, "update").then(() => {
      parcel.status = MOUNTED;
      return parcel;
    }).catch(err => {
      throw transformErr(err, parcel, SKIP_BECAUSE_BROKEN);
    });
  });
}

let parcelCount = 0;
const rootParcels = {
  parcels: {}
}; // This is a public api, exported to users of single-spa

function mountRootParcel() {
  return mountParcel.apply(rootParcels, arguments);
}
function mountParcel(config, customProps) {
  const owningAppOrParcel = this; // Validate inputs

  if (!config || typeof config !== "object" && typeof config !== "function") {
    throw Error(formatErrorMessage(2, "Cannot mount parcel without a config object or config loading function"));
  }

  if (config.name && typeof config.name !== "string") {
    throw Error(formatErrorMessage(3, `Parcel name must be a string, if provided. Was given ${typeof config.name}`, typeof config.name));
  }

  if (typeof customProps !== "object") {
    throw Error(formatErrorMessage(4, `Parcel ${name} has invalid customProps -- must be an object but was given ${typeof customProps}`, name, typeof customProps));
  }

  if (!customProps.domElement) {
    throw Error(formatErrorMessage(5, `Parcel ${name} cannot be mounted without a domElement provided as a prop`, name));
  }

  const id = parcelCount++;
  const passedConfigLoadingFunction = typeof config === "function";
  const configLoadingFunction = passedConfigLoadingFunction ? config : () => Promise.resolve(config); // Internal representation

  const parcel = {
    id,
    parcels: {},
    status: passedConfigLoadingFunction ? LOADING_SOURCE_CODE : NOT_BOOTSTRAPPED,
    customProps,
    parentName: toName(owningAppOrParcel),

    unmountThisParcel() {
      return mountPromise.then(() => {
        if (parcel.status !== MOUNTED) {
          throw Error(formatErrorMessage(6, `Cannot unmount parcel '${name}' -- it is in a ${parcel.status} status`, name, parcel.status));
        }

        return toUnmountPromise(parcel, true);
      }).then(value => {
        if (parcel.parentName) {
          delete owningAppOrParcel.parcels[parcel.id];
        }

        return value;
      }).then(value => {
        resolveUnmount(value);
        return value;
      }).catch(err => {
        parcel.status = SKIP_BECAUSE_BROKEN;
        rejectUnmount(err);
        throw err;
      });
    }

  }; // We return an external representation

  let externalRepresentation; // Add to owning app or parcel

  owningAppOrParcel.parcels[id] = parcel;
  let loadPromise = configLoadingFunction();

  if (!loadPromise || typeof loadPromise.then !== "function") {
    throw Error(formatErrorMessage(7, `When mounting a parcel, the config loading function must return a promise that resolves with the parcel config`));
  }

  loadPromise = loadPromise.then(config => {
    if (!config) {
      throw Error(formatErrorMessage(8, `When mounting a parcel, the config loading function returned a promise that did not resolve with a parcel config`));
    }

    const name = config.name || `parcel-${id}`;

    if ( // ES Module objects don't have the object prototype
    Object.prototype.hasOwnProperty.call(config, "bootstrap") && !validLifecycleFn(config.bootstrap)) {
      throw Error(formatErrorMessage(9, `Parcel ${name} provided an invalid bootstrap function`, name));
    }

    if (!validLifecycleFn(config.mount)) {
      throw Error(formatErrorMessage(10, `Parcel ${name} must have a valid mount function`, name));
    }

    if (!validLifecycleFn(config.unmount)) {
      throw Error(formatErrorMessage(11, `Parcel ${name} must have a valid unmount function`, name));
    }

    if (config.update && !validLifecycleFn(config.update)) {
      throw Error(formatErrorMessage(12, `Parcel ${name} provided an invalid update function`, name));
    }

    const bootstrap = flattenFnArray(config, "bootstrap");
    const mount = flattenFnArray(config, "mount");
    const unmount = flattenFnArray(config, "unmount");
    parcel.status = NOT_BOOTSTRAPPED;
    parcel.name = name;
    parcel.bootstrap = bootstrap;
    parcel.mount = mount;
    parcel.unmount = unmount;
    parcel.timeouts = ensureValidAppTimeouts(config.timeouts);

    if (config.update) {
      parcel.update = flattenFnArray(config, "update");

      externalRepresentation.update = function (customProps) {
        parcel.customProps = customProps;
        return promiseWithoutReturnValue(toUpdatePromise(parcel));
      };
    }
  }); // Start bootstrapping and mounting
  // The .then() causes the work to be put on the event loop instead of happening immediately

  const bootstrapPromise = loadPromise.then(() => toBootstrapPromise(parcel, true));
  const mountPromise = bootstrapPromise.then(() => toMountPromise(parcel, true));
  let resolveUnmount, rejectUnmount;
  const unmountPromise = new Promise((resolve, reject) => {
    resolveUnmount = resolve;
    rejectUnmount = reject;
  });
  externalRepresentation = {
    mount() {
      return promiseWithoutReturnValue(Promise.resolve().then(() => {
        if (parcel.status !== NOT_MOUNTED) {
          throw Error(formatErrorMessage(13, `Cannot mount parcel '${name}' -- it is in a ${parcel.status} status`, name, parcel.status));
        } // Add to owning app or parcel


        owningAppOrParcel.parcels[id] = parcel;
        return toMountPromise(parcel);
      }));
    },

    unmount() {
      return promiseWithoutReturnValue(parcel.unmountThisParcel());
    },

    getStatus() {
      return parcel.status;
    },

    loadPromise: promiseWithoutReturnValue(loadPromise),
    bootstrapPromise: promiseWithoutReturnValue(bootstrapPromise),
    mountPromise: promiseWithoutReturnValue(mountPromise),
    unmountPromise: promiseWithoutReturnValue(unmountPromise)
  };
  return externalRepresentation;
}

function promiseWithoutReturnValue(promise) {
  return promise.then(() => null);
}

function getProps(appOrParcel) {
  const name = toName(appOrParcel); // 获取自定义属性

  let customProps = typeof appOrParcel.customProps === "function" ? appOrParcel.customProps(name, window.location) : appOrParcel.customProps;

  if (typeof customProps !== "object" || customProps === null || Array.isArray(customProps)) {
    customProps = {};
    console.warn(formatErrorMessage(40, // console.warn('customProps 必须返回一个对象');
    `single-spa: ${name}'s customProps function must return an object. Received ${customProps}`), name, customProps);
  } // 将自定义属性和singleSpa进行合并


  const result = assign({}, customProps, {
    name,
    mountParcel: mountParcel.bind(appOrParcel),
    singleSpa
  });

  if (isParcel(appOrParcel)) {
    result.unmountSelf = appOrParcel.unmountThisParcel;
  }

  return result;
}

const defaultWarningMillis = 1000;
const globalTimeoutConfig = {
  bootstrap: {
    millis: 4000,
    dieOnTimeout: false,
    warningMillis: defaultWarningMillis
  },
  mount: {
    millis: 3000,
    dieOnTimeout: false,
    warningMillis: defaultWarningMillis
  },
  unmount: {
    millis: 3000,
    dieOnTimeout: false,
    warningMillis: defaultWarningMillis
  },
  unload: {
    millis: 3000,
    dieOnTimeout: false,
    warningMillis: defaultWarningMillis
  },
  update: {
    millis: 3000,
    dieOnTimeout: false,
    warningMillis: defaultWarningMillis
  }
};
function setBootstrapMaxTime(time, dieOnTimeout, warningMillis) {
  if (typeof time !== "number" || time <= 0) {
    throw Error(formatErrorMessage(16, // 引导最大时间必须为正整数毫秒数
    `bootstrap max time must be a positive integer number of milliseconds`));
  }

  globalTimeoutConfig.bootstrap = {
    millis: time,
    dieOnTimeout,
    warningMillis: warningMillis || defaultWarningMillis
  };
}
function setMountMaxTime(time, dieOnTimeout, warningMillis) {
  if (typeof time !== "number" || time <= 0) {
    throw Error(formatErrorMessage(17, `mount max time must be a positive integer number of milliseconds`));
  }

  globalTimeoutConfig.mount = {
    millis: time,
    dieOnTimeout,
    warningMillis: warningMillis || defaultWarningMillis
  };
}
function setUnmountMaxTime(time, dieOnTimeout, warningMillis) {
  if (typeof time !== "number" || time <= 0) {
    throw Error(formatErrorMessage(18, `unmount max time must be a positive integer number of milliseconds`));
  }

  globalTimeoutConfig.unmount = {
    millis: time,
    dieOnTimeout,
    warningMillis: warningMillis || defaultWarningMillis
  };
}
function setUnloadMaxTime(time, dieOnTimeout, warningMillis) {
  if (typeof time !== "number" || time <= 0) {
    throw Error(formatErrorMessage(19, `unload max time must be a positive integer number of milliseconds`));
  }

  globalTimeoutConfig.unload = {
    millis: time,
    dieOnTimeout,
    warningMillis: warningMillis || defaultWarningMillis
  };
}
function reasonableTime(appOrParcel, lifecycle) {
  const timeoutConfig = appOrParcel.timeouts[lifecycle];
  const warningPeriod = timeoutConfig.warningMillis;
  const type = objectType(appOrParcel);
  return new Promise((resolve, reject) => {
    let finished = false;
    let errored = false;
    appOrParcel[lifecycle](getProps(appOrParcel)).then(val => {
      finished = true;
      resolve(val);
    }).catch(val => {
      finished = true;
      reject(val);
    });
    setTimeout(() => maybeTimingOut(1), warningPeriod);
    setTimeout(() => maybeTimingOut(true), timeoutConfig.millis);
    const errMsg = formatErrorMessage(31, `Lifecycle function ${lifecycle} for ${type} ${toName(appOrParcel)} lifecycle did not resolve or reject for ${timeoutConfig.millis} ms.`, lifecycle, type, toName(appOrParcel), timeoutConfig.millis);

    function maybeTimingOut(shouldError) {
      if (!finished) {
        if (shouldError === true) {
          errored = true;

          if (timeoutConfig.dieOnTimeout) {
            reject(Error(errMsg));
          } else {
            console.error(errMsg); //don't resolve or reject, we're waiting this one out
          }
        } else if (!errored) {
          const numWarnings = shouldError;
          const numMillis = numWarnings * warningPeriod;
          console.warn(errMsg);

          if (numMillis + warningPeriod < timeoutConfig.millis) {
            setTimeout(() => maybeTimingOut(numWarnings + 1), warningPeriod);
          }
        }
      }
    }
  });
}
function ensureValidAppTimeouts(timeouts) {
  const result = {};

  for (let key in globalTimeoutConfig) {
    result[key] = assign({}, globalTimeoutConfig[key], timeouts && timeouts[key] || {});
  }

  return result;
}

/**
 * 通过微任务加载子应用，其实singleSpa中很多地方都用了微任务
 * 这里最终是return了一个promise出行，在注册了加载子应用的微任务
 * 概括起来就是：
 *  更改app.status为LOAD_SOURCE_CODE => NOT_BOOTSTRAP，当然还有可能是LOAD_ERROR
 *  执行加载函数，并将props传递给加载函数，给用户处理props的一个机会,因为这个props是一个完备的props
 *  验证加载函数的执行结果，必须为promise，且加载函数内部必须return一个对象
 *  这个对象是子应用的，对象中必须包括各个必须的生命周期函数
 *  然后将生命周期方法通过一个函数包裹并挂载到app对象上
 *  app加载完成，删除app.loadPromise
 * @param {*} app 
 */
// 调用loadApp，传递props，
// 分为三个阶段
// 1.修改状态为：LOADING_SOURCE_CODE
// 2.返回一个promise，待 reroute的Promise.all执行，调用用户传入的loadApp，返回一个promise
// 3.待callAllEventListeners执行完后，更新状态为NOT_BOOTSTRAPPED

function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    // 避免重复调用
    if (app.loadPromise) {
      // 说明app已经在被加载
      return app.loadPromise;
    } // 只有状态为NOT_LOADED和LOAD_ERROR的app才可以被加载


    if (app.status !== NOT_LOADED && app.status !== LOAD_ERROR) {
      return app;
    } // 设置App的状态 状态改为正在加载中


    app.status = LOADING_SOURCE_CODE;
    let appOpts, isUserErr; // 标识loadApps 和 用户输入错误

    return app.loadPromise = Promise.resolve().then(() => {
      // 执行app的加载函数，并给子应用传递props => 用户自定义的customProps和内置的比如应用的名称、singleSpa实例
      // 其实这里有个疑问，这个props是怎么传递给子应用的，感觉跟后面的生命周期函数有关
      const loadPromise = app.loadApp(getProps(app)); // 加载函数需要返回一个promise

      if (!smellsLikeAPromise(loadPromise)) {
        // The name of the app will be prepended to this error message inside of the handleAppError function
        isUserErr = true;
        throw Error(formatErrorMessage(33, // 'loadApps 必须是返回promise的函数
        `single-spa loading function did not return a promise. Check the second argument to registerApplication('${toName(app)}', loadingFunction, activityFunction)`, toName(app)));
      } // 这里很重要，这个val就是示例项目中加载函数中return出来的window.singleSpa，这个属性是子应用打包时设置的


      return loadPromise.then(val => {
        app.loadErrorTime = null;
        appOpts = val;
        let validationErrMessage, validationErrCode; // 错误信息和错误码
        // 以下进行一系列的验证，已window.singleSpa为例说明，简称g.s
        // g.s必须为对象

        if (typeof appOpts !== "object") {
          validationErrCode = 34;

          {
            validationErrMessage = `does not export anything`;
          }
        }

        if ( // ES Modules don't have the Object prototype
        Object.prototype.hasOwnProperty.call(appOpts, "bootstrap") && !validLifecycleFn(appOpts.bootstrap)) {
          // hrow Error('bootstrap, mount, unmount 必须是函数')
          validationErrCode = 35;

          {
            validationErrMessage = `does not export a valid bootstrap function or array of functions`;
          }
        }

        if (!validLifecycleFn(appOpts.mount)) {
          validationErrCode = 36;

          {
            validationErrMessage = `does not export a mount function or array of functions`;
          }
        }

        if (!validLifecycleFn(appOpts.unmount)) {
          validationErrCode = 37;

          {
            validationErrMessage = `does not export a unmount function or array of functions`;
          }
        }

        const type = objectType(appOpts); // parcel 或 application 这里是 => application

        if (validationErrCode) {
          let appOptsStr;

          try {
            appOptsStr = JSON.stringify(appOpts);
          } catch (_unused) {}

          console.error(formatErrorMessage(validationErrCode, `The loading function for single-spa ${type} '${toName(app)}' resolved with the following, which does not have bootstrap, mount, and unmount functions`, type, toName(app), appOptsStr), appOpts);
          handleAppError(validationErrMessage, app, SKIP_BECAUSE_BROKEN);
          return app;
        } // overlays合并


        if (appOpts.devtools && appOpts.devtools.overlays) {
          app.devtools.overlays = assign({}, app.devtools.overlays, appOpts.devtools.overlays);
        } // 状态改为待启动


        app.status = NOT_BOOTSTRAPPED; // 兼容数组的写法

        app.bootstrap = flattenFnArray(appOpts, "bootstrap");
        app.mount = flattenFnArray(appOpts, "mount");
        app.unmount = flattenFnArray(appOpts, "unmount");
        app.unload = flattenFnArray(appOpts, "unload");
        app.timeouts = ensureValidAppTimeouts(appOpts.timeouts);
        delete app.loadPromise; // 删除

        return app;
      });
    }).catch(err => {
      delete app.loadPromise;
      let newStatus;

      if (isUserErr) {
        // 出错了，改成出错的状态，记录错误时间并上报
        newStatus = SKIP_BECAUSE_BROKEN;
      } else {
        newStatus = LOAD_ERROR;
        app.loadErrorTime = new Date().getTime();
      }

      handleAppError(err, app, newStatus); // 返回的还是之前的app

      return app;
    });
  });
}

const isInBrowser = typeof window !== "undefined";

// 导航事件
/* We capture navigation event listeners so that we can make sure
 * that application navigation listeners are not called until
 * single-spa has ensured that the correct applications are
 * unmounted and mounted.
 */
// 捕获事件监听器，但是现在不会去调用，只是收集。直到single-spa已经将该卸载的应用卸载并该挂载的应用成功挂载完成后，再在代码里调用

const capturedEventListeners = {
  hashchange: [],
  popstate: []
};
const routingEventsListeningTo = ["hashchange", "popstate"]; // 导航到某个url

function navigateToUrl(obj) {
  let url;

  if (typeof obj === "string") {
    url = obj;
  } else if (this && this.href) {
    url = this.href;
  } else if (obj && obj.currentTarget && obj.currentTarget.href && obj.preventDefault) {
    url = obj.currentTarget.href;
    obj.preventDefault();
  } else {
    throw Error(formatErrorMessage(14, // navigateToUrl最好是要给字符串
    `singleSpaNavigate/navigateToUrl must be either called with a string url, with an <a> tag as its context, or with an event whose currentTarget is an <a> tag`));
  }

  const current = parseUri(window.location.href); // a标签，有href地址为location.href

  const destination = parseUri(url); // a标签，有href地址为用户输入的地址
  // 1.hash路由

  if (url.indexOf("#") === 0) {
    window.location.hash = destination.hash; // 2.域名不一致，以用户输入地址为准
  } else if (current.host !== destination.host && destination.host) {
    // test
    {
      window.location.href = url;
    }
  } // 3.域名一致，并且pathname和search一致 
  else if (destination.pathname === current.pathname && destination.search === current.search) {
    window.location.hash = destination.hash;
  } else {
    // 4.不同的域名、pathname、参数
    // different path, host, or query params
    window.history.pushState(null, null, url);
  }
} // 依次调用保存好的事件函数

function callCapturedEventListeners(eventArguments) {
  if (eventArguments) {
    const eventType = eventArguments[0].type; // 仅针对 popstate，hashchange事件类型

    if (routingEventsListeningTo.indexOf(eventType) >= 0) {
      // 调用之前保存好的事件函数，依次执行
      capturedEventListeners[eventType].forEach(listener => {
        try {
          // The error thrown by application event listener should not break single-spa down.
          // Just like https://github.com/single-spa/single-spa/blob/85f5042dff960e40936f3a5069d56fc9477fac04/src/navigation/reroute.js#L140-L146 did
          listener.apply(this, eventArguments);
        } catch (e) {
          // 应用程序事件函数执行引发的错误，不应该破坏单个spa
          setTimeout(() => {
            throw e;
          });
        }
      });
    }
  }
} // 是否在客户端更改路由后触发single-spa重新路由。默认为false，设置为true时不会重新路由

let urlRerouteOnly;
function setUrlRerouteOnly(val) {
  urlRerouteOnly = val;
} // url路由变化，触发single-spa重新路由

function urlReroute() {
  reroute([], arguments);
}

function patchedUpdateState(updateState, methodName) {
  return function () {
    const urlBefore = window.location.href;
    const result = updateState.apply(this, arguments);
    const urlAfter = window.location.href;

    if (!urlRerouteOnly || urlBefore !== urlAfter) {
      if (isStarted()) {
        // fire an artificial popstate event once single-spa is started,
        // so that single-spa applications know about routing that
        // occurs in a different application
        window.dispatchEvent(createPopStateEvent(window.history.state, methodName));
      } else {
        // do not fire an artificial popstate event before single-spa is started,
        // since no single-spa applications need to know about routing events
        // outside of their own router.
        reroute([]);
      }
    }

    return result;
  };
}

function createPopStateEvent(state, originalMethodName) {
  // https://github.com/single-spa/single-spa/issues/224 and https://github.com/single-spa/single-spa-angular/issues/49
  // We need a popstate event even though the browser doesn't do one by default when you call replaceState, so that
  // all the applications can reroute. We explicitly identify this extraneous event by setting singleSpa=true and
  // singleSpaTrigger=<pushState|replaceState> on the event instance.
  let evt;

  try {
    evt = new PopStateEvent("popstate", {
      state
    });
  } catch (err) {
    // IE 11 compatibility https://github.com/single-spa/single-spa/issues/299
    // https://docs.microsoft.com/en-us/openspecs/ie_standards/ms-html5e/bd560f47-b349-4d2c-baa8-f1560fb489dd
    evt = document.createEvent("PopStateEvent");
    evt.initPopStateEvent("popstate", false, false, state);
  }

  evt.singleSpa = true;
  evt.singleSpaTrigger = originalMethodName;
  return evt;
}

if (isInBrowser) {
  // We will trigger an app change for any routing events.
  window.addEventListener("hashchange", urlReroute);
  window.addEventListener("popstate", urlReroute); // Monkeypatch addEventListener so that we can ensure correct timing

  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  window.addEventListener = function (eventName, fn) {
    if (typeof fn === "function") {
      if (routingEventsListeningTo.indexOf(eventName) >= 0 && !find(capturedEventListeners[eventName], listener => listener === fn)) {
        capturedEventListeners[eventName].push(fn);
        return;
      }
    }

    return originalAddEventListener.apply(this, arguments);
  };

  window.removeEventListener = function (eventName, listenerFn) {
    if (typeof listenerFn === "function") {
      if (routingEventsListeningTo.indexOf(eventName) >= 0) {
        capturedEventListeners[eventName] = capturedEventListeners[eventName].filter(fn => fn !== listenerFn);
        return;
      }
    }

    return originalRemoveEventListener.apply(this, arguments);
  };

  window.history.pushState = patchedUpdateState(window.history.pushState, "pushState");
  window.history.replaceState = patchedUpdateState(window.history.replaceState, "replaceState");

  if (window.singleSpaNavigate) {
    console.warn(formatErrorMessage(41, "single-spa has been loaded twice on the page. This can result in unexpected behavior."));
  } else {
    /* For convenience in `onclick` attributes, we expose a global function for navigating to
     * whatever an <a> tag's href is.
     */
    window.singleSpaNavigate = navigateToUrl;
  }
}

function parseUri(str) {
  const anchor = document.createElement("a");
  anchor.href = str;
  return anchor;
}

let hasInitialized = false;
function ensureJQuerySupport(jQuery = window.jQuery) {
  if (!jQuery) {
    if (window.$ && window.$.fn && window.$.fn.jquery) {
      jQuery = window.$;
    }
  }

  if (jQuery && !hasInitialized) {
    const originalJQueryOn = jQuery.fn.on;
    const originalJQueryOff = jQuery.fn.off;

    jQuery.fn.on = function (eventString, fn) {
      return captureRoutingEvents.call(this, originalJQueryOn, window.addEventListener, eventString, fn, arguments);
    };

    jQuery.fn.off = function (eventString, fn) {
      return captureRoutingEvents.call(this, originalJQueryOff, window.removeEventListener, eventString, fn, arguments);
    };

    hasInitialized = true;
  }
}

function captureRoutingEvents(originalJQueryFunction, nativeFunctionToCall, eventString, fn, originalArgs) {
  if (typeof eventString !== "string") {
    return originalJQueryFunction.apply(this, originalArgs);
  }

  const eventNames = eventString.split(/\s+/);
  eventNames.forEach(eventName => {
    if (routingEventsListeningTo.indexOf(eventName) >= 0) {
      nativeFunctionToCall(eventName, fn);
      eventString = eventString.replace(eventName, "");
    }
  });

  if (eventString.trim() === "") {
    return this;
  } else {
    return originalJQueryFunction.apply(this, originalArgs);
  }
}

const appsToUnload = {};
function toUnloadPromise(app) {
  return Promise.resolve().then(() => {
    // 在销毁映射表中没找到应用名字，说明没有要销毁的
    const unloadInfo = appsToUnload[toName(app)]; // 没有加载的应用，无需销毁

    if (!unloadInfo) {
      /* No one has called unloadApplication for this app,
       */
      return app;
    }

    if (app.status === NOT_LOADED) {
      /* This app is already unloaded. We just need to clean up
       * anything that still thinks we need to unload the app.
       */
      finishUnloadingApp(app, unloadInfo);
      return app;
    }

    if (app.status === UNLOADING) {
      /* Both unloadApplication and reroute want to unload this app.
       * It only needs to be done once, though.
       */
      return unloadInfo.promise.then(() => app);
    }

    if (app.status !== NOT_MOUNTED && app.status !== LOAD_ERROR) {
      /* The app cannot be unloaded until it is unmounted.
       */
      return app;
    }

    const unloadPromise = app.status === LOAD_ERROR ? Promise.resolve() : reasonableTime(app, "unload");
    app.status = UNLOADING;
    return unloadPromise.then(() => {
      finishUnloadingApp(app, unloadInfo);
      return app;
    }).catch(err => {
      errorUnloadingApp(app, unloadInfo, err);
      return app;
    });
  });
} // 销毁应用

function finishUnloadingApp(app, unloadInfo) {
  delete appsToUnload[toName(app)]; // 销毁生命周期
  // Unloaded apps don't have lifecycles

  delete app.bootstrap;
  delete app.mount;
  delete app.unmount;
  delete app.unload; // 更新状态

  app.status = NOT_LOADED;
  /* resolve the promise of whoever called unloadApplication.
   * This should be done after all other cleanup/bookkeeping
   */
  // 销毁完了，让程序继续往下执行

  unloadInfo.resolve();
} // 销毁应用出错


function errorUnloadingApp(app, unloadInfo, err) {
  delete appsToUnload[toName(app)]; // Unloaded apps don't have lifecycles
  // 销毁生命周期

  delete app.bootstrap;
  delete app.mount;
  delete app.unmount;
  delete app.unload; // 更新状态

  handleAppError(err, app, SKIP_BECAUSE_BROKEN); // 销毁出错，让程序继续往下走

  unloadInfo.reject(err);
} // 把待销毁app保存到 appsToUnload 映射表中


function addAppToUnload(app, promiseGetter, resolve, reject) {
  appsToUnload[toName(app)] = {
    app,
    resolve,
    reject
  }; // 调用 app1.promise => promiseGetter

  Object.defineProperty(appsToUnload[toName(app)], "promise", {
    get: promiseGetter
  });
} // 待销毁app的销毁信息

function getAppUnloadInfo(appName) {
  return appsToUnload[appName];
}

const apps = []; // 将应用分为四大类

function getAppChanges() {
  // 需要被移除的应用
  const appsToUnload = [],
        // 需要被卸载的应用
  appsToUnmount = [],
        // 需要被加载的应用
  appsToLoad = [],
        // 需要被挂载的应用
  appsToMount = []; // 超时200ms后，会再次尝试在 LOAD_ERROR 中下载应用程序

  const currentTime = new Date().getTime();
  apps.forEach(app => {
    // boolean，应用是否应该被激活
    const appShouldBeActive = app.status !== SKIP_BECAUSE_BROKEN && shouldBeActive(app);

    switch (app.status) {
      // 需要被加载的应用
      case LOAD_ERROR:
        if (appShouldBeActive && currentTime - app.loadErrorTime >= 200) {
          appsToLoad.push(app);
        }

        break;
      // 需要被加载的应用

      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if (appShouldBeActive) {
          appsToLoad.push(app);
        }

        break;
      // 状态为xx的应用

      case NOT_BOOTSTRAPPED:
      case NOT_MOUNTED:
        if (!appShouldBeActive && getAppUnloadInfo(toName(app))) {
          // 需要被移除的应用
          appsToUnload.push(app);
        } else if (appShouldBeActive) {
          // 需要被挂载的应用
          appsToMount.push(app);
        }

        break;
      // 需要被卸载的应用，已经处于挂载状态，但现在路由已经变了的应用需要被卸载

      case MOUNTED:
        if (!appShouldBeActive) {
          appsToUnmount.push(app);
        }

        break;
      // all other statuses are ignored
    }
  });
  return {
    appsToUnload,
    appsToUnmount,
    appsToLoad,
    appsToMount
  };
} // 获取已经挂载的应用，即状态为 MOUNTED 的应用

function getMountedApps() {
  return apps.filter(isActive).map(toName);
} // 获取app名称集合

function getAppNames() {
  return apps.map(toName);
} // 原有应用配置数据 devtools中使用

function getRawAppData() {
  return [...apps];
} // 获取应用状态，指：NOT_LOADED, NOT_MOUNTED, MOUNTED, ...

function getAppStatus(appName) {
  const app = find(apps, app => toName(app) === appName);
  return app ? app.status : null;
}
/**
 * 注册应用，两种方式
 * registerApplication('app1', loadApp(url), activeWhen('/app1'), customProps)
 * registerApplication({
 *    name: 'app1',
 *    app: loadApp(url),
 *    activeWhen: activeWhen('/app1'),
 *    customProps: {}
 * })
 * @param {*} appNameOrConfig 应用名称或者应用配置对象
 * @param {*} appOrLoadApp 应用的加载方法，是一个 promise
 * @param {*} activeWhen 判断应用是否激活的一个方法，方法返回 true or false
 * @param {*} customProps 传递给子应用的 props 对象
 */

function registerApplication(appNameOrConfig, appOrLoadApp, activeWhen, customProps) {
  const registration = sanitizeArguments(appNameOrConfig, appOrLoadApp, activeWhen, customProps); // 判断应用是否重名

  if (getAppNames().indexOf(registration.name) !== -1) // 如果重名
    throw Error(formatErrorMessage(21, // "应用已经注册过了！"
    `There is already an app registered with name ${registration.name}`, registration.name)); // 将各个应用的配置信息都存放到 apps 数组中

  apps.push( // 给每个应用增加一个内置属性
  assign({
    loadErrorTime: null,
    // 加载错误时间
    // 最重要的，应用的状态
    status: NOT_LOADED,
    parcels: {},
    devtools: {
      overlays: {
        options: {},
        selectors: []
      }
    }
  }, registration)); // 浏览器环境运行

  if (isInBrowser) {
    ensureJQuerySupport();
    reroute();
  }
} // 获取当前激活函数：遍历所有应用，通过匹配应用标识符，得到应用的name

function checkActivityFunctions(location = window.location) {
  return apps.filter(app => app.activeWhen(location)).map(toName);
} // 取消注册应用

function unregisterApplication(appName) {
  // 应用本来就没有被注册过，无法取消注册
  if (apps.filter(app => toName(app) === appName).length === 0) {
    throw Error(formatErrorMessage(25, // 此应该本来就未被注册过，因此无法取消注册
    `Cannot unregister application '${appName}' because no such application has been registered`, appName));
  } // 取消注册应用，卸载完成后，从应用列表中移除


  return unloadApplication(appName).then(() => {
    const appIndex = apps.map(toName).indexOf(appName);
    apps.splice(appIndex, 1);
  });
} // 卸载应用

function unloadApplication(appName, opts = {
  waitForUnmount: false
}) {
  if (typeof appName !== "string") {
    throw Error(formatErrorMessage(26, // 应用名称必须为字符串！
    `unloadApplication requires a string 'appName'`));
  }

  const app = find(apps, App => toName(App) === appName);

  if (!app) {
    throw Error(formatErrorMessage(27, // "app没注册，无需卸载
    `Could not unload application '${appName}' because no such application has been registered`, appName));
  }

  const appUnloadInfo = getAppUnloadInfo(toName(app));

  if (opts && opts.waitForUnmount) {
    // We need to wait for unmount before unloading the app
    // 在unloading前，需要等待unmount完app
    if (appUnloadInfo) {
      // Someone else is already waiting for this, too
      // 别人也在等待
      return appUnloadInfo.promise;
    } else {
      // We're the first ones wanting the app to be resolved.
      // 没有人在等，直接卸载
      const promise = new Promise((resolve, reject) => {
        addAppToUnload(app, () => promise, resolve, reject);
      });
      return promise;
    }
  } else {
    /* We should unmount the app, unload it, and remount it immediately.
     */
    // 我们应该卸载应用程序，卸载完成后，立即重装它
    let resultPromise;

    if (appUnloadInfo) {
      // Someone else is already waiting for this app to unload
      resultPromise = appUnloadInfo.promise;
      immediatelyUnloadApp(app, appUnloadInfo.resolve, appUnloadInfo.reject);
    } else {
      // We're the first ones wanting the app to be resolved.
      resultPromise = new Promise((resolve, reject) => {
        addAppToUnload(app, () => resultPromise, resolve, reject);
        immediatelyUnloadApp(app, resolve, reject);
      });
    }

    return resultPromise;
  }
} // 立即卸载应用程序

function immediatelyUnloadApp(app, resolve, reject) {
  toUnmountPromise(app) // 先unmount
  .then(toUnloadPromise) // 再unload
  .then(() => {
    resolve();
    setTimeout(() => {
      // reroute, but the unload promise is done
      // 卸载应用已经完成，然后 reroute
      reroute();
    });
  }).catch(reject);
}
/**
 * 同样是验证四个参数是否合法
 */


function validateRegisterWithArguments(name, appOrLoadApp, activeWhen, customProps) {
  // 应用名称校验
  if (typeof name !== "string" || name.length === 0) throw Error(formatErrorMessage(20, // throw Error("应用名称必须是字符串");
  `The 1st argument to registerApplication must be a non-empty string 'appName'`)); // 装载函数校验

  if (!appOrLoadApp) throw Error(formatErrorMessage(23, // registerApplication的第二个参数必须是应用程序或加载应用程序函数;
  "The 2nd argument to registerApplication must be an application or loading application function"));
  if (typeof activeWhen !== "function") throw Error(formatErrorMessage(24, // "必须是函数， 如：location => location.has.startsWith('#/app')"
  "The 3rd argument to registerApplication must be an activeWhen function"));
  if (!validCustomProps(customProps)) throw Error(formatErrorMessage(22, // throw Error("customProps必须是对象");
  "The optional 4th argument is a customProps and must be an object"));
}
/**
 * 验证应用配置对象的各个属性是否存在不合法的情况，存在则抛出错误
 * @param {*} config = { name: 'app1', app: function, activeWhen: function, customProps: {} }
 */


function validateRegisterWithConfig(config) {
  // 1. 异常判断，应用的配置对象不能是数组或者null
  if (Array.isArray(config) || config === null) throw Error(formatErrorMessage(39, "Configuration object can't be an Array or null!")); // 2. 应用配置必须是指定的几个关键字

  const validKeys = ["name", "app", "activeWhen", "customProps"]; // 过滤函数，将不是 validKeys 中的key，过滤出来。

  const invalidKeys = Object.keys(config).reduce((invalidKeys, prop) => validKeys.indexOf(prop) >= 0 ? invalidKeys : invalidKeys.concat(prop), []); // 如果存在无效的key，则抛出一个错误,表示书写不合法

  if (invalidKeys.length !== 0) throw Error(formatErrorMessage(38, // 配置对象只接受 validKeys 中的属性，其他的无效
  `The configuration object accepts only: ${validKeys.join(", ")}. Invalid keys: ${invalidKeys.join(", ")}.`, validKeys.join(", "), invalidKeys.join(", "))); // 3. 应用名称存在校验

  if (typeof config.name !== "string" || config.name.length === 0) throw Error(formatErrorMessage(20, // 应用名称必须存在，且不能是空字符串
  "The config.name on registerApplication must be a non-empty string")); // app 属性只能是一个对象或者函数
  // 对象是一个已被解析过的对象，是一个包含各个生命周期的对象；
  // 加载函数必须返回一个 promise
  // 以上信息在官方文档中有提到：https://zh-hans.single-spa.js.org/docs/configuration

  if (typeof config.app !== "object" && typeof config.app !== "function") throw Error(formatErrorMessage(20, "The config.app on registerApplication must be an application or a loading function")); // 第三个参数，可以是一个字符串，也可以是一个函数，也可以是两者组成的一个数组，表示当前应该被激活的应用的baseURL

  const allowsStringAndFunction = activeWhen => typeof activeWhen === "string" || typeof activeWhen === "function";

  if (!allowsStringAndFunction(config.activeWhen) && !(Array.isArray(config.activeWhen) && config.activeWhen.every(allowsStringAndFunction))) throw Error(formatErrorMessage(24, // activeWhen 必须是字符串，或者函数或者数组
  "The config.activeWhen on registerApplication must be a string, function or an array with both")); // 5. 自定义属性校验， 必须是一个对象

  if (!validCustomProps(config.customProps)) throw Error(formatErrorMessage(22, // customProps 必须是对象，不能是函数或者数组，也不能为空
  "The optional config.customProps must be an object"));
}

function validCustomProps(customProps) {
  return !customProps || typeof customProps === "function" || typeof customProps === "object" && customProps !== null && !Array.isArray(customProps);
}
/**
 * 格式化用户传递的子应用配置参数
 */


function sanitizeArguments(appNameOrConfig, appOrLoadApp, activeWhen, customProps) {
  //  判断第一个参数是否为对象
  const usingObjectAPI = typeof appNameOrConfig === "object"; // 初始化应用配置对象

  const registration = {
    name: null,
    // 应用名称
    loadApp: null,
    // promise函数加载app的函数
    activeWhen: null,
    // 当前激活的标识
    customProps: null // 自定义属性，用于向子应用传递

  }; // 注册应用的时候传递的参数是对象,校验合法后，进行赋值

  if (usingObjectAPI) {
    // 先做一层校验
    validateRegisterWithConfig(appNameOrConfig);
    registration.name = appNameOrConfig.name;
    registration.loadApp = appNameOrConfig.app;
    registration.activeWhen = appNameOrConfig.activeWhen;
    registration.customProps = appNameOrConfig.customProps;
  } else {
    // 参数列表
    validateRegisterWithArguments(appNameOrConfig, appOrLoadApp, activeWhen, customProps);
    registration.name = appNameOrConfig;
    registration.loadApp = appOrLoadApp;
    registration.activeWhen = activeWhen;
    registration.customProps = customProps;
  } // 如果第二个参数不是一个函数，比如是一个包含已经生命周期的对象，则包装成一个返回 promise 的函数


  registration.loadApp = sanitizeLoadApp(registration.loadApp); // 如果用户没有提供 props 对象，则给一个默认的空对象

  registration.customProps = sanitizeCustomProps(registration.customProps); // 保证activeWhen是一个返回boolean值的函数

  registration.activeWhen = sanitizeActiveWhen(registration.activeWhen);

  return registration;
} // 保证第二个参数一定是一个返回 promise 的函数


function sanitizeLoadApp(loadApp) {
  if (typeof loadApp !== "function") {
    return () => Promise.resolve(loadApp);
  }

  return loadApp;
} // 保证 props 不为 undefined


function sanitizeCustomProps(customProps) {
  return customProps ? customProps : {};
}
/**
 * 得到一个函数，函数负责判断浏览器当前地址是否和用户给定的baseURL相匹配，匹配返回true，否则返回false
 */


function sanitizeActiveWhen(activeWhen) {
  console.log("传入activeWhen", activeWhen); // activeWhen 返回一个函数，将location传入 (location) => location.hash.startsWith('#/app1'); 调用后返回一个字符串

  let activeWhenArray = Array.isArray(activeWhen) ? activeWhen : [activeWhen]; // 保证数组中每个元素都是一个函数
  console.log('判断是否为数组，activeWhenArray',activeWhenArray)
  activeWhenArray = activeWhenArray.map(activeWhenOrPath => typeof activeWhenOrPath === "function" ? activeWhenOrPath // activeWhen如果是一个路径，则保证成一个函数
  : pathToActiveWhen(activeWhenOrPath)); // 返回一个函数，函数返回一个 boolean 值
  console.log('是否匹配上路径',activeWhenArray.some(activeWhen => activeWhen(location)))
  console.log('location',location)
  return location => activeWhenArray.some(activeWhen => activeWhen(location)); // 调用用户配置的函数，传入location
} // activeWhen传入的不是函数，而是字符串或者数组，则特殊处理
// '/app1', '/users/:userId/profile', '/pathname/#/hash' ['/pathname/#/hash', '/app1']
// 具体见官方文档api，有详细说明：https://zh-hans.single-spa.js.org/docs/api


function pathToActiveWhen(path, exactMatch) {
  console.log('path', path);
  console.log('exactMatch', exactMatch); // 根据用户提供的baseURL，生成正则表达式

  const regex = toDynamicPathValidatorRegex(path, exactMatch); // 函数返回boolean值，判断当前路由是否匹配用户给定的路径

  return location => {
    // compatible with IE10
    let origin = location.origin;

    if (!origin) {
      origin = `${location.protocol}//${location.host}`;
    }

    const route = location.href.replace(origin, "").replace(location.search, "").split("?")[0];
    return regex.test(route);
  };
}

function toDynamicPathValidatorRegex(path, exactMatch) {
  let lastIndex = 0,
      inDynamic = false,
      regexStr = "^"; // 添加 / 前缀

  if (path[0] !== "/") {
    path = "/" + path;
  } // /app1


  for (let charIndex = 0; charIndex < path.length; charIndex++) {
    const char = path[charIndex];
    const startOfDynamic = !inDynamic && char === ":"; // 当前字符是：

    const endOfDynamic = inDynamic && char === "/"; // 当前字符是 /

    if (startOfDynamic || endOfDynamic) {
      appendToRegex(charIndex);
    }
  }

  appendToRegex(path.length);
  return new RegExp(regexStr, "i");

  function appendToRegex(index) {
    const anyCharMaybeTrailingSlashRegex = "[^/]+/?";
    const commonStringSubPath = escapeStrRegex(path.slice(lastIndex, index));
    regexStr += inDynamic ? anyCharMaybeTrailingSlashRegex : commonStringSubPath;

    if (index === path.length) {
      if (inDynamic) {
        if (exactMatch) {
          // Ensure exact match paths that end in a dynamic portion don't match
          // urls with characters after a slash after the dynamic portion.
          regexStr += "$";
        }
      } else {
        // For exact matches, expect no more characters. Otherwise, allow
        // any characters.
        const suffix = exactMatch ? "" : ".*";
        regexStr = // use charAt instead as we could not use es6 method endsWith
        regexStr.charAt(regexStr.length - 1) === "/" ? `${regexStr}${suffix}$` : `${regexStr}(/${suffix})?(#.*)?$`;
      }
    }

    inDynamic = !inDynamic;
    lastIndex = index;
  }

  function escapeStrRegex(str) {
    // borrowed from https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
    return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
  }
}

let appChangeUnderway = false,
    // app切换完成（旧app卸载完成，新app挂载完成）
peopleWaitingOnAppChange = [],
    currentUrl = isInBrowser && window.location.href; // 不带任何参数，进行重新路由

function triggerAppChange() {
  // Call reroute with no arguments, intentionally
  return reroute();
} // reroute 更改app.status和执行生命周期函数

/**
 * 每次切换路由前，将应用分为4大类，
 * 首次加载时执行loadApp
 * 后续的路由切换执行performAppChange
 * 为四大类的应用分别执行相应的操作，比如更改app.status，执行生命周期函数
 * 所以，从这里也可以看出来，single-spa就是一个维护应用的状态机
 * @param {*} pendingPromises 
 * @param {*} eventArguments 
 */
// 主函数-核心

function reroute(pendingPromises = [], eventArguments) {
  // 应用正在切换，这个状态会在执行performAppChanges之前置为true，执行结束之后再置为false
  // 如果在中间用户重新切换路由了，即走这个if分支，暂时看起来就在数组中存储了一些信息，没看到有什么用
  // 字面意思理解就是用户等待app切换
  // 1. start方法调用过了，app切换完成，则直接返回
  if (appChangeUnderway) {
    return new Promise((resolve, reject) => {
      peopleWaitingOnAppChange.push({
        resolve,
        reject,
        eventArguments
      });
    });
  } // 将应用分为4大类


  const {
    // 需要被移除的
    appsToUnload,
    // 需要被卸载的
    appsToUnmount,
    // 需要被加载的
    appsToLoad,
    // 需要被挂载的
    appsToMount
  } = getAppChanges();
  let appsThatChanged,
      navigationIsCanceled = false,
      // 是否取消导航
  oldUrl = currentUrl,
      newUrl = currentUrl = window.location.href; // 是否已经执行 start 方法

  if (isStarted()) {
    // 已执行
    appChangeUnderway = true; // 所有需要被改变的的应用

    appsThatChanged = appsToUnload.concat(appsToLoad, appsToUnmount, appsToMount); // 执行改变

    return performAppChanges();
  } else {
    // 未执行
    appsThatChanged = appsToLoad; // 加载Apps

    return loadApps();
  }

  function cancelNavigation() {
    navigationIsCanceled = true;
  } // 整体返回一个立即resolved的promise，通过微任务来加载apps(加载应用)


  function loadApps() {
    return Promise.resolve().then(() => {
      // 加载每个子应用，并做一系列的状态变更和验证（比如结果为promise、子应用要导出生命周期函数）
      const loadPromises = appsToLoad.map(toLoadPromise); // 1. Promise => Promise.resolve().then()  promise还没有执行

      return (// 保证所有加载子应用的微任务执行完成
        Promise.all(loadPromises) // 并发调用返回的 Promise.resolve().then(), 调用loadApp, 返回 Promise.then(val) val => { bootstrap: async () => {}, mount: async () => {}, ... } 
        .then(callAllEventListeners) // 调用函数
        // there are no mounted apps, before start() is called, so we always return []
        .then(() => []) // 在调用start()之前，没有mounted 应用，因此我们始终返回[]
        .catch(err => {
          callAllEventListeners();
          throw err;
        })
      );
    });
  } // 执行app切换，挂载


  function performAppChanges() {
    return Promise.resolve().then(() => {
      // https://github.com/single-spa/single-spa/issues/545
      // 自定义事件，在应用状态发生改变之前可触发，给用户提供搞事情的机会
      window.dispatchEvent(new customEvent(appsThatChanged.length === 0 ? "single-spa:before-no-app-change" : "single-spa:before-app-change", getCustomEventDetail(true) // 取消导航函数合并到属性上
      ));
      window.dispatchEvent(new customEvent("single-spa:before-routing-event", getCustomEventDetail(true, {
        cancelNavigation
      }))); // 导航取消，触发自定义事件，恢复之前的状态，跳转到oldUrl

      if (navigationIsCanceled) {
        window.dispatchEvent(new customEvent("single-spa:before-mount-routing-event", getCustomEventDetail(true)));
        finishUpAndReturn();
        navigateToUrl(oldUrl);
        return;
      } // 移除应用 => 更改应用状态，执行unload生命周期函数，执行一些清理动作
      // 其实一般情况下这里没有真的移除应用
      // 先卸载


      const unloadPromises = appsToUnload.map(toUnloadPromise); // promise，调用执行销毁函数
      // 卸载应用，更改状态，执行unmount生命周期函数
      // unMount后，再unLoad一下

      const unmountUnloadPromises = appsToUnmount.map(toUnmountPromise) // 卸载完然后移除，通过注册微任务的方式实现
      .map(unmountPromise => unmountPromise.then(toUnloadPromise)); // 所有需要卸载的应用

      const allUnmountPromises = unmountUnloadPromises.concat(unloadPromises); // 并发卸载

      const unmountAllPromise = Promise.all(allUnmountPromises); // 卸载全部完成后触发一个事件
      // 卸载完成后，触发自定义事件，用户想在mounted前干点啥，可以干

      unmountAllPromise.then(() => {
        window.dispatchEvent(new customEvent("single-spa:before-mount-routing-event", getCustomEventDetail(true)));
      });
      /* We load and bootstrap apps while other apps are unmounting, but we
       * wait to mount the app until all apps are finishing unmounting
       * 这个原因其实是因为这些操作都是通过注册不同的微任务实现的，而JS是单线程执行，
       * 所以自然后续的只能等待前面的执行完了才能执行
       * 这里一般情况下其实不会执行，只有手动执行了unloadApplication方法才会二次加载
       * 在卸载完成后，加载和启动 appsToLoad 中的应用
       */

      const loadThenMountPromises = appsToLoad.map(app => {
        return toLoadPromise(app).then(app => tryToBootstrapAndMount(app, unmountAllPromise));
      });
      /* These are the apps that are already bootstrapped and just need
       * to be mounted. They each wait for all unmounting apps to finish up
       * before they mount.
       * 初始化和挂载app，其实做的事情很简单，就是改变app.status，执行生命周期函数
       * 当然这里的初始化和挂载其实是前后脚一起完成的(只要中间用户没有切换路由)
       * 从appsToMount中过滤出appsToLoad中不包含的应用，启动并挂载它们
       */

      const mountPromises = appsToMount.filter(appToMount => appsToLoad.indexOf(appToMount) < 0).map(appToMount => {
        return tryToBootstrapAndMount(appToMount, unmountAllPromise);
      }); // 捕获卸载应用过程出错

      return unmountAllPromise.catch(err => {
        callAllEventListeners();
        throw err;
      }).then(() => {
        /* Now that the apps that needed to be unmounted are unmounted, their DOM navigation
         * events (like hashchange or popstate) should have been cleaned up. So it's safe
         * to let the remaining captured event listeners to handle about the DOM event.
         */
        // 现在已经卸载了需要卸载的应用程序以及它们的导航事件（如hashchange、popstate)应该已经清除了。因此让其余捕获的时间监听器处理有关DOM事件是安全的。
        callAllEventListeners();
        return Promise.all(loadThenMountPromises.concat(mountPromises)).catch(err => {
          pendingPromises.forEach(promise => promise.reject(err));
          throw err;
        }).then(finishUpAndReturn);
      });
    });
  } // 完成了卸载和挂载


  function finishUpAndReturn() {
    const returnValue = getMountedApps(); // 获取状态为 MOUNTED 的app

    pendingPromises.forEach(promise => promise.resolve(returnValue));

    try {
      const appChangeEventName = appsThatChanged.length === 0 ? "single-spa:no-app-change" : "single-spa:app-change";
      window.dispatchEvent(new customEvent(appChangeEventName, getCustomEventDetail()));
      window.dispatchEvent(new customEvent("single-spa:routing-event", getCustomEventDetail()));
    } catch (err) {
      /* We use a setTimeout because if someone else's event handler throws an error, single-spa
       * needs to carry on. If a listener to the event throws an error, it's their own fault, not
       * single-spa's.
       */
      // 为啥要用setTimeout呢？因为如果其他人的事件处理抛出错误，则single-spa需要处理。单如果是时间监听器抛出的错误，是他们自己的错，single-spa不需要处理。
      setTimeout(() => {
        throw err;
      });
    }
    /* Setting this allows for subsequent calls to reroute() to actually perform
     * a reroute instead of just getting queued behind the current reroute call.
     * We want to do this after the mounting/unmounting is done but before we
     * resolve the promise for the `reroute` function.
     */
    // 设置该项，允许后续调用 reroute 进行重新路由，而不是再路由调用后排队。
    // 我们希望在加载mounting、卸载unmounting后，但是在resolve reroute 这个promise函数之前执行这个操作


    appChangeUnderway = false;

    if (peopleWaitingOnAppChange.length > 0) {
      /* While we were rerouting, someone else triggered another reroute that got queued.
       * So we need reroute again.
       */
      // 当我们 reroute 时，其他人触发了另一个排队的 reroute，因此我们需要再次 reroute.
      const nextPendingPromises = peopleWaitingOnAppChange;
      peopleWaitingOnAppChange = [];
      reroute(nextPendingPromises);
    }

    return returnValue;
  }
  /* We need to call all event listeners that have been delayed because they were
   * waiting on single-spa. This includes haschange and popstate events for both
   * the current run of performAppChanges(), but also all of the queued event listeners.
   * We want to call the listeners in the same order as if they had not been delayed by
   * single-spa, which means queued ones first and then the most recent one.
   */
  // 调用所有事件监听方法，这些方法因为等待single-spa，被延迟调用。
  // 这些监听方法，包括hashchange，popstate事件，当前运行的performAppChanges()，还有排队的事件监听器。
  // 我们会依次按照顺序去调用，先排队，先调用。


  function callAllEventListeners() {
    pendingPromises.forEach(pendingPromise => {
      callCapturedEventListeners(pendingPromise.eventArguments);
    });
    callCapturedEventListeners(eventArguments);
  } // 获取自定义事件的detail


  function getCustomEventDetail(isBeforeChanges = false, extraProperties) {
    const newAppStatuses = {}; // 各个app的新状态 { 'app1': MOUNTED, ... }

    const appsByNewStatus = {
      // for apps that were mounted
      [MOUNTED]: [],
      // mounted的app列表
      // for apps that were unmounted
      [NOT_MOUNTED]: [],
      // apps that were forcibly unloaded
      [NOT_LOADED]: [],
      // apps that attempted to do something but are broken now
      [SKIP_BECAUSE_BROKEN]: [] // 尝试执行某些操作，但是已经损坏的应用程序

    };

    if (isBeforeChanges) {
      appsToLoad.concat(appsToMount).forEach((app, index) => {
        // 待加载、待挂载 => 挂载完成 
        addApp(app, MOUNTED);
      });
      appsToUnload.forEach(app => {
        // 待销毁 =>待加载
        addApp(app, NOT_LOADED);
      });
      appsToUnmount.forEach(app => {
        // 待卸载 => 待挂载
        addApp(app, NOT_MOUNTED);
      });
    } else {
      appsThatChanged.forEach(app => {
        addApp(app);
      });
    }

    const result = {
      detail: {
        newAppStatuses,
        appsByNewStatus,
        totalAppChanges: appsThatChanged.length,
        originalEvent: eventArguments === null || eventArguments === void 0 ? void 0 : eventArguments[0],
        oldUrl,
        newUrl,
        navigationIsCanceled
      }
    }; // 对象合并

    if (extraProperties) {
      assign(result.detail, extraProperties);
    }

    return result; // 给app赋值当前状态

    function addApp(app, status) {
      const appName = toName(app);
      status = status || getAppStatus(appName);
      newAppStatuses[appName] = status;
      const statusArr = appsByNewStatus[status] = appsByNewStatus[status] || [];
      statusArr.push(appName);
    }
  }
}
/**
 * Let's imagine that some kind of delay occurred during application loading.
 * The user without waiting for the application to load switched to another route,
 * this means that we shouldn't bootstrap and mount that application, thus we check
 * twice if that application should be active before bootstrapping and mounting.
 * https://github.com/single-spa/single-spa/issues/524
 */
// 假设在应用程序加载期间发生了某种类型的延迟，用户无需等待应用加载完成，就直接切换到另一条线路。
// 这意味着我们不应该启动并挂载该应用程序。
// 因此，我们进行第二次检查，看看该应用是否在启动和挂载之前是被加载了的

function tryToBootstrapAndMount(app, unmountAllPromise) {
  if (shouldBeActive(app)) {
    return toBootstrapPromise(app).then(app => unmountAllPromise.then(() => shouldBeActive(app) ? toMountPromise(app) : app));
  } else {
    return unmountAllPromise.then(() => app);
  }
}

let started = false; // 在调用start之前，应用被加载了，但是不会初始化，不会挂载或者卸载。
// 调用这个函数，就意味着要开始挂载，就会开始激活应用里的代码

function start(opts) {
  started = true; // 是否不希望浏览器路由变化后，single-spa重新路由

  if (opts && opts.urlRerouteOnly) {
    setUrlRerouteOnly(opts.urlRerouteOnly);
  } // 仅支持在浏览器环境跑


  if (isInBrowser) {
    reroute();
  }
} // 是否已经启动

function isStarted() {
  return started;
} // 浏览器环境下，5s没有调用start()则报错

if (isInBrowser) {
  setTimeout(() => {
    if (!started) {
      console.warn(formatErrorMessage(1, // 'single-spa加载完成5s后，singleSpa.start()没有被调用。在调用start()函数前，可以声明和加载应用，但是不能bootstrap和mount'
      `singleSpa.start() has not been called, 5000ms after single-spa was loaded. Before start() is called, apps can be declared and loaded, but not bootstrapped or mounted.`));
    }
  }, 5000);
}

var devtools = {
  getRawAppData,
  // 注册的app列表
  reroute,
  NOT_LOADED,
  toLoadPromise,
  // 加载
  toBootstrapPromise,
  // 启动
  unregisterApplication // 取消注册

};

if (isInBrowser && window.__SINGLE_SPA_DEVTOOLS__) {
  window.__SINGLE_SPA_DEVTOOLS__.exposedMethods = devtools;
}

export { BOOTSTRAPPING, LOADING_SOURCE_CODE, LOAD_ERROR, MOUNTED, MOUNTING, NOT_BOOTSTRAPPED, NOT_LOADED, NOT_MOUNTED, SKIP_BECAUSE_BROKEN, UNMOUNTING, UPDATING, addErrorHandler, checkActivityFunctions, ensureJQuerySupport, getAppNames, getAppStatus, getMountedApps, mountRootParcel, navigateToUrl, pathToActiveWhen, registerApplication, removeErrorHandler, setBootstrapMaxTime, setMountMaxTime, setUnloadMaxTime, setUnmountMaxTime, start, triggerAppChange, unloadApplication, unregisterApplication };
//# sourceMappingURL=single-spa.dev.js.map
