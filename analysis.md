# 源码相关

## 与 activeWhen 相关

activeWhen API 可以控制页面是否需要加载

```javascript
// \single-spa-source-code\src\applications :447
/**
 * 得到一个函数，函数负责判断浏览器当前地址是否和用户给定的baseURL相匹配，匹配返回true，否则返回false
 */
function sanitizeActiveWhen(activeWhen) {
  // activeWhen 接收一个函数（箭头函数），将location传入 (location) => location.hash.startsWith('#/app1'); 调用后返回一个字符串
  // location.hash：hash属性是一个可读可写的字符串，该字符串是 URL 的锚部分（从 # 号开始的部分）
  // startsWith() 方法用于检测字符串是否以指定的前缀开始
  let activeWhenArray = Array.isArray(activeWhen) ? activeWhen : [activeWhen];
  // 保证数组中每个元素都是一个函数
  activeWhenArray = activeWhenArray.map((activeWhenOrPath) =>
    typeof activeWhenOrPath === "function"
      ? activeWhenOrPath
      : // activeWhen如果是一个路径，则保证成一个函数
        pathToActiveWhen(activeWhenOrPath)
  );
  // 返回一个函数，函数返回一个 boolean 值
  return (location) =>
    activeWhenArray.some((activeWhen) => activeWhen(location)); // 调用用户配置的函数，传入location
}

// activeWhen传入的不是函数，而是字符串或者数组，则特殊处理
// '/app1', '/users/:userId/profile', '/pathname/#/hash' ['/pathname/#/hash', '/app1']
// 具体见官方文档api，有详细说明：https://zh-hans.single-spa.js.org/docs/api
export function pathToActiveWhen(path, exactMatch) {
  // 根据用户提供的baseURL，生成正则表达式
  const regex = toDynamicPathValidatorRegex(path, exactMatch);
  // 函数返回boolean值，判断当前路由是否匹配用户给定的路径
  return (location) => {
    // compatible with IE10
    let origin = location.origin;
    if (!origin) {
      origin = `${location.protocol}//${location.host}`;
    }
    const route = location.href
      .replace(origin, "")
      .replace(location.search, "")
      .split("?")[0];
    return regex.test(route);
  };
}
```

这是两个关键方法，像我目前项目中写的一般都是`(location) => true`，也就是默认加载所有 app.js，single-spa调用`sanitizeActiveWhen`方法时，接收`activeWhen`参数，在\single-spa-source-code\src\applications :434 做了一层校验`validateRegisterWithConfig(appNameOrConfig);`,注意看`validateRegisterWithConfig`函数，其中`allowsStringAndFunction`箭头函数，规范了`activeWhen`必须是**字符串，或者函数或者数组**。

```javascript
export function validateRegisterWithConfig(config) {
  // 1. 异常判断，应用的配置对象不能是数组或者null
  if (Array.isArray(config) || config === null)
    throw Error(
      formatErrorMessage(
        39,
        __DEV__ && "Configuration object can't be an Array or null!"
      )
    );
  // 2. 应用配置必须是指定的几个关键字
  const validKeys = ["name", "app", "activeWhen", "customProps"];
  // 过滤函数，将不是 validKeys 中的key，过滤出来。
  const invalidKeys = Object.keys(config).reduce(
    (invalidKeys, prop) =>
      validKeys.indexOf(prop) >= 0 ? invalidKeys : invalidKeys.concat(prop),
    []
  );
  // 如果存在无效的key，则抛出一个错误,表示书写不合法
  if (invalidKeys.length !== 0)
    throw Error(
      formatErrorMessage(
        38,
        __DEV__ &&
          // 配置对象只接受 validKeys 中的属性，其他的无效
          `The configuration object accepts only: ${validKeys.join(
            ", "
          )}. Invalid keys: ${invalidKeys.join(", ")}.`,
        validKeys.join(", "),
        invalidKeys.join(", ")
      )
    );
  // 3. 应用名称存在校验
  if (typeof config.name !== "string" || config.name.length === 0)
    throw Error(
      formatErrorMessage(
        20,
        __DEV__ &&
          // 应用名称必须存在，且不能是空字符串
          "The config.name on registerApplication must be a non-empty string"
      )
    );
  // app 属性只能是一个对象或者函数
  // 对象是一个已被解析过的对象，是一个包含各个生命周期的对象；
  // 加载函数必须返回一个 promise
  // 以上信息在官方文档中有提到：https://zh-hans.single-spa.js.org/docs/configuration
  if (typeof config.app !== "object" && typeof config.app !== "function")
    throw Error(
      formatErrorMessage(
        20,
        __DEV__ &&
          "The config.app on registerApplication must be an application or a loading function"
      )
    );
  // 第三个参数，可以是一个字符串，也可以是一个函数，也可以是两者组成的一个数组，表示当前应该被激活的应用的baseURL
  const allowsStringAndFunction = (activeWhen) =>
    typeof activeWhen === "string" || typeof activeWhen === "function";
  if (
    !allowsStringAndFunction(config.activeWhen) &&
    !(
      Array.isArray(config.activeWhen) &&
      config.activeWhen.every(allowsStringAndFunction)
    )
  )
    throw Error(
      formatErrorMessage(
        24,
        __DEV__ &&
          // activeWhen 必须是字符串，或者函数或者数组
          "The config.activeWhen on registerApplication must be a string, function or an array with both"
      )
    );
  // 5. 自定义属性校验， 必须是一个对象
  if (!validCustomProps(config.customProps))
    throw Error(
      formatErrorMessage(
        22,
        // customProps 必须是对象，不能是函数或者数组，也不能为空
        __DEV__ && "The optional config.customProps must be an object"
      )
    );
}
```
