import { Options,ServerOptions } from './index.d'
import koa from 'koa'
import KoaCros from 'koa2-cors'
import mockConfig from './config'
import portfinder from 'portfinder'
import Log from './shared/log'
import FileSystem from './core/file/file-system'
import Route from './core/route/route'
import Module from './core/file/file-module'
export default class VMock extends Log {
    options: Options
    app: any
    fileSystem: any
    route: any
    serverOptions: ServerOptions
    ready = false
    modules: Module
    constructor(options: Options, serverOptions?: ServerOptions) {
        super()
        this.modules = new Module() // 文件模块，route 和 fileSystem 共用的数据
        this.route = new Route(this.modules) // 生成路由
        this.fileSystem = new FileSystem(options, this.route, this.modules) // 操作 mock 文件
        this.options = Object.assign({}, mockConfig.defaultServerConfig, options)
        this.serverOptions = Object.assign({}, serverOptions, mockConfig.defaultServerConfig)
        this.beforeCreateServer()
    }
    server() {
        this.fileSystem.generateRoutes() // 初始化路由
        // 中
        this.getValidPort().then(() => this.createServer())
        // 后
        this.afterCreateServer()
    }
    beforeCreateServer() {
        // 路由注册完毕，可以绑定到 app 上
        this.fileSystem.on('router-ready', () => {
            this.routerReady()
        })

        // 文件变化
        this.fileSystem.on('change-after', this.afterFileChange)
        this.fileSystem.on('rename-after', this.afterFileRename)
    }
    createServer() {
        this.app = new koa()
        this.app.use(KoaCros(mockConfig.corsHandler))
        this.app.listen(this.serverOptions.port)
        this.routerReady()
        this.info(`The server is running at http://localhost:${this.serverOptions.port}`)
    }
    afterCreateServer() {

    }
    getValidPort() {
        portfinder.basePort = this.serverOptions.port
        return new Promise((resolve, reject) => {
            portfinder.getPortPromise().then((port) => { 
                this.serverOptions.port = port
                resolve(port)
            }).catch(reject)
        })
    }
    afterFileChange() {
        // 文件内容变化完毕之后的操作
    }
    afterFileRename() {
        // 文件命名变化/删除/新增之后的操作
        // 修改路由
        // 删除路由
        // 新增路由
    }
    routerReady() {
        // 路由注册完毕，可以绑定到 app 上
        console.log('ready router')
        this.route.use(this.app)
    }
}