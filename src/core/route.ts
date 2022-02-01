import KoaRouter from 'koa-router'
import { Context, Next } from 'koa'
import Middleware from '../shared/middleware'
import RouteFileProcess from './routeFileProcess'
import { FileRoute, CacheFile } from '../index.d'
export default class Route {
    router: any
    methods = ['post', 'get', 'delete']
    constructor() {
        this.routes = new Map<string, string>()
        this.cacheFile = {}
        this.router = new KoaRouter()
        this.router.use(Middleware)
    }
    use(app: any) {
        app
          .use(this.router.routes())
          .use(this.router.allowedMethods())
    }
    set routes(fileRoute: FileRoute) {
        this.routes = fileRoute
        this.generateRoutes()
    }
    set cacheFile(cacheFile: CacheFile) {
        this.cacheFile = cacheFile
    }
    generateRoutes() {
        this.routes.forEach((type, filePath) => {
            const process = new RouteFileProcess(filePath, this.cacheFile[filePath], type)
            this.methods.forEach((method) => {
                this.router[method](filePath, process.handle) // 注册路由以及处理方法
            })
        })
    }
}