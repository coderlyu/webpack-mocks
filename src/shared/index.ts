import portfinder from 'portfinder';
export * from './file';
export * from './path';
/**
 * 判断是否是 Object 类型
 * @param val 需要获取类型的值
 * @returns
 */
export function isObject(val: any) {
  return getType(val) === 'object';
}

/**
 * 判断是否是 Array 类型
 * @param val 需要获取类型的值
 * @returns
 */
export function isArray(val: any) {
  return getType(val) === 'array';
}

/**
 * 判断是否是 空值
 * @param val 需要获取类型的值
 * @returns
 */
export function isEmpty(val: any) {
  return (
    val === null ||
    val === undefined ||
    val === '' ||
    (isObject(val) && val.length === 0) ||
    (isArray(val) && val.length === 0)
  );
}

/**
 * 获取类型
 * @param val 需要获取类型的值
 * @returns
 */
export function getType(val: any): string {
  return Object.prototype.toString.call(val).slice(8, -1).toLocaleLowerCase();
}

/**
 * 获取可用端口号
 * @param port 查找可用端口号起始 端口，默认 3000
 * @returns
 */
export function getFreePort(port: number = 3000) {
  portfinder.basePort = port;
  return new Promise<number>((resolve, reject) => {
    portfinder
      .getPortPromise()
      .then((port: number) => {
        resolve(port);
      })
      .catch(reject);
  });
}

/**
 * 在一个json字符串中，解析出需要的那个字段
 * @param str 需要解析的源字符串
 * @param target 需要解析的属性
 * @returns 解析后获取到的 target JSON 对象
 */
export function getJsonFromStr(str: string, target: string) {
  let file = str;
  let idx = file.indexOf(target);
  if (idx > -1) {
    file = file.slice(idx + target.length + 1);
    idx = file.indexOf('{');
    const stack = [];
    const fileStack = [];
    if (idx > -1) {
      stack.push('{');
      fileStack.push('{');
      file = file.slice(idx + 1);
      while (stack.length > 0) {
        if (file.indexOf('{') > -1 || file.indexOf('}') > -1) {
          if (file.indexOf('{') > -1 && file.indexOf('{') < file.indexOf('}')) {
            // 先匹配到的是 {
            // 存入 stack
            idx = file.indexOf('{');
            fileStack.push(file.slice(0, idx));
            file = file.slice(idx + 1);
            fileStack.push('{');
            stack.push('{');
          } else if (file.indexOf('}') === -1) {
            // 未匹配到 } 直接 break
            break;
          } else {
            // 此时匹配到的是 } 用 { 去抵消
            // 取出 stack
            let char = stack.pop();
            if (char !== '{') {
              // 无法匹配，此时说明解析错误，直接推出
              throw new Error('replace解析错误');
            } else {
              idx = file.indexOf('}');
              fileStack.push(file.slice(0, idx));
              file = file.slice(idx + 1);
              fileStack.push('}');
            }
          }
        } else break;
      }
      // 解析完成，尝试拼接
      const finallyStr = fileStack.join('');
      try {
        const finallyJson = new Function('return' + finallyStr)(); // 转换成 json
        if (typeof finallyJson === 'object') {
          return finallyJson;
        }
        return '';
      } catch (error) {
        throw new Error('循环解析文本出错');
      }
    }
  }
  return '';
}
