import path from 'path'
export default class Path {
    /**
     * 判断是否是相对路径
     * @param path 
     * @returns 
     */
    isRelativePath(path: string) {
        return path.startsWith('.') || path.startsWith('/')
    }
    /**
     * 修复相对路径
     * @param path 
     * @returns 
     */
    relativePathFix(path: string) {
        return path.replace(/^(\.+\/)+/g, '/')
    }
    /**
     * 获取绝对路径
     * @param _path 
     * @param prefix 
     * @returns 
     */
    absolutePath(_path: string, prefix: string) {
        if (!this.isRelativePath(_path)) return _path
        return path.resolve(prefix, _path)
    }
}