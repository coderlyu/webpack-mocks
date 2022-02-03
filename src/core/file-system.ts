import { Options, CacheFile, FileRoute, FileName } from '../index.d'
import fileWatch from './file-watch'
import path from 'path'
import fs from 'fs'
import mockConfig from '../../mock.config'
export default class FileSystem extends fileWatch {
    options: Options
    cacheFile: CacheFile
    resolveOrder =  ['json', 'js', 'ts']
    mockDir: string
    fileRoute: FileRoute
    route: any
    ready: boolean // 是否准备完毕
    constructor(options: Options, route: any) {
        super()
        this.ready = false
        this.options = options
        this.route = route
        this.cacheFile = {}
        this.fileRoute = new Map<string, string>() // 存储已确定的文件路径
        this.mockDir = this.resolve(mockConfig.mockDirName) // mock 目录
        this.route.mockDir = this.mockDir // 给 route 赋值 mock 文件夹的路径，用来计算请求地址的相对路径
        this.generateRoutes() // 初始化路由
        this.registerMonitor() // 注册监听回掉事件
    }
    generateRoutes(isCover = false): void {
        if (this.options.userFolder && this.isDir(this.mockDir)) {
            if (!this.isExistsFile(this.mockDir)) return
            let dirs = fs.readdirSync(this.mockDir).map((p) => this.resolve(p))
            while(dirs.length > 0) {
                let file = dirs.shift()
                if (!file) continue
                if (this.isDir(file)) {
                    // 是文件夹
                    dirs = dirs.concat(fs.readdirSync(file).map((p) => this.resolve(p, file)))
                } else {
                    // 是文件
                    const { path, type } = this.readFileByOrder(file)
                    if (isCover) {
                        // 覆盖原有文件
                        this.fileRoute.set(path, type)
                    } else {
                        // if (this.fileRoute.get(file)) continue // 文件路径已存在
                        this.fileRoute.get(path) || this.fileRoute.set(path, type)
                    }
                }
            }
            this.route.routes = this.fileRoute
            this.route.cacheFile = this.cacheFile
            this.route.generateRoutes() // 生成路由
            this.ready = true
        }
    }
    resolve(filePath: string, userFolder: string = this.options.userFolder): string {
        return path.resolve(userFolder, filePath)
    }
    require(filePath: string): FileName {
        if (this.cacheFile[filePath]) return this.cacheFile[filePath]
        // json, js, ts 文件
        const file = require(filePath)
        this.cacheFile[filePath] = file
        return file
    }
    isDir(filePath: string): boolean {
        if (!this.isExistsFile(filePath)) return false
        return fs.lstatSync(filePath).isDirectory() // 判断是否是目录
    }
    isExistsFile(filePath: string): boolean {
        return fs.existsSync(filePath)
    }
    readFile(filePath: string): FileName {
        // 其他文件类型
        if (this.cacheFile[filePath]) return this.cacheFile[filePath]
        const file = fs.readFileSync(filePath).toString()
        this.cacheFile[filePath] = file
        return file
    }
    readFileByOrder(filePath: string): any {
        const idx = filePath.lastIndexOf('.')
        let fileType = ''
        let isInResolveOrder = false
        if (idx > -1) {
            fileType = filePath.slice(idx)
            filePath = filePath.slice(0, idx)
        }
        for(let i = 0; i < this.resolveOrder.length; i++) {
            let _filePath = `${filePath}.${this.resolveOrder[i]}`
            if (this.isExistsFile(_filePath)) {
                filePath = _filePath
                fileType = this.resolveOrder[i]
                isInResolveOrder = true
                break
            }
        }
        let file: FileName = ''
        if (isInResolveOrder) {
            // ts, js, json
            file = this.require(filePath)
        } else {
            file = this.readFile(filePath)
        }
        return {
            type: fileType,
            path: filePath,
            file: file
        }
    }
    registerMonitor(): void {
        // 注册监听文件变化的回掉事件
        this.on('change',  this.fileChange)
        this.on('rename', this.fileRename)

        // 注册路由的监听事件
        this.route.on('route-ready', this.routeReady)
        this.route.on('')
    }
    fileChange(filename: string):  void {
        const filePath = this.resolve(mockConfig.mockDirName + path.sep + filename)
        const { path: _filePath, type } = this.readFileByOrder(filePath)
        this.fileRoute.set(_filePath, type)
        this.emit('change-after', filename)
    }
    fileRename(filename: string): void {
        this.fileRoute = new Map()
        this.generateRoutes() //! 暂时这么处理，后续完善路径对比
        this.emit('rename-after', filename) // TODO: 后续完善路径对比
    }
    routeReady() {
        // route 路由准备完毕
        this.emit('router-ready')
    }
}