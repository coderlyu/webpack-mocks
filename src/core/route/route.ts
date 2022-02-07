import KoaRouter from 'koa-router'
import { Context, Next } from 'koa'
import Middleware from '../../shared/middleware'
import RouteFileProcess from './route-file-process'
import { FileRoute, CacheFile } from '../../index.d'
import { EventEmitter } from 'events'
import path from 'path'
import TsFileCompile from '../compile/ts-file-compile'
export default class Route extends EventEmitter {
    router: any
    methods = ['post', 'get', 'delete']
    ready: boolean // 是否准备完毕
    compile: any
    constructor() {
        super()
        this.ready = false
        this.routes = new Map<string, string>()
        this.cacheFile = {}
        this.compile = new TsFileCompile()
        this.reset() // 初始化 router
    }
    use(app: any) {
        if (!this.ready) return
        app
          .use(this.router.routes())
          .use(this.router.allowedMethods())
    }
    set routes(fileRoute: FileRoute) {
        this.routes = fileRoute
    }
    set cacheFile(cacheFile: CacheFile) {
        this.cacheFile = cacheFile
    }
    set mockDir(mockDir: string) {
        this.mockDir = mockDir
    }
    generateRoutes() {
        this.routes.forEach((type, filePath) => {
            const process = new RouteFileProcess(this.compile, filePath, this.cacheFile[filePath], type)
            this.methods.forEach((method) => {
                this.router[method](this.relativePath(filePath), process.handle) // 注册路由以及处理方法
            })
        })
        this.ready = true
        this.emit('route-ready')
    }
    relativePath(filePath: string) {
        const _path = path.relative(this.mockDir, filePath)
        return _path.startsWith('/') ? _path : '/' + _path
    }
    reset() {
        this.router = new KoaRouter()
        this.router.use(Middleware)
    }
}