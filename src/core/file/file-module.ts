

class FileModule {
    readonly path: string // 绝对路径
    readonly relativePath: string // 相对路径，相对 mock 文件夹的路径
    file: any // 字符串 或者 require 
    readonly type: string // 文件类型，例如：js, ts, json 等等...
    constructor(path: string, file: any, type: string, relativePath: string) {
        this.path = path
        this.file = file
        this.type = type
        this.relativePath = relativePath
    }
    static isFileModule(module: any) {
        return module instanceof FileModule
    }
    set(file: any) {
        this.file = file
    }
}

export default class Module {
    fileModules: any // 绝对地址 -> 文件
    relativeMap: any // 相对地址与绝对地址之间的映射关系
    constructor() {
        this.fileModules = new Map()
        this.relativeMap = {}
    }
    add(path: string, file: any, relativePath: string, type: string = 'js') {
        const _file = new FileModule(path, file, relativePath, type)
        this.fileModules.set(path, _file)
        this.relativeMap[path] = relativePath
        this.relativeMap[relativePath] = path
    }
    get(path: string) {
        if (this.isRelativePath(path)) {
            // 通过相对路径查找
            return this.fileModules.get(this.relativeMap[this.relativePathFix(path)])
        }
        return this.fileModules.get(path)
    }
    set(path: string, file: any) {
        let _file: FileModule | undefined
        if (this.isRelativePath(path)) {
            // 通过相对路径查找
            _file = this.fileModules.get(this.relativeMap[this.relativePathFix(path)])
        } else _file = this.fileModules.get(path)

        if (_file) {
            _file.set(file)
        }
    }
    del(path: string) {
        if (this.isRelativePath(path)) {
            // 是相对地址
            let absPath = this.relativeMap[this.relativePathFix(path)]
            this.fileModules.delete(absPath)
            // 删除映射关系
            delete this.relativeMap[path]
            delete this.relativeMap[absPath]
        } else {
            // 绝对地址
            let relPath = this.relativeMap[path]
            this.fileModules.delete(path)
            // 删除映射关系
            delete this.relativeMap[path]
            delete this.relativeMap[relPath]
        }
    }
    /**
     * 返回 相对路径组成的 数组，用户生成 route
     */
    keys() {
        return Object.keys(this.relativeMap).filter(_ => this.isRelativePath(_))
    }
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
}