
/**
 * 判断是否是 Object 类型
 * @param val 需要获取类型的值
 * @returns 
 */
export function isObject (val: any) {
    return  getType(val) === 'object'
}

/**
 * 判断是否是 Array 类型
 * @param val 需要获取类型的值
 * @returns 
 */
export function isArray(val: any) {
    return getType(val) === 'array'
}

/**
 * 判断是否是 空值
 * @param val 需要获取类型的值
 * @returns 
 */
export function isEmpty(val: any) {
    return val === null
    || val === undefined
    || val === ''
    || (isObject(val) && val.length === 0)
    || (isArray(val) && val.length === 0)
}

/**
 * 获取类型
 * @param val 需要获取类型的值
 * @returns 
 */
export function getType(val: any): string {
    return Object.prototype.toString.call(val).slice(8, -1).toLocaleLowerCase()
}

