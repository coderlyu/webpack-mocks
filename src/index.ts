import { Options,ServerOptions } from './index.d'
import koa, { Context } from 'koa'
import KoaCros from 'koa2-cors'
import mockConfig from '../mock.config'
import portfinder from 'portfinder'
import Log from './shared/log'
import FileSystem from './core/fileSystem'
import Route from './core/route'
export default class VMock extends Log {
    options: Options
    app: any
    fileSystem: any
    route: any
    serverOptions: ServerOptions
    ready = false
    constructor(options: Options, serverOptions: ServerOptions) {
        super()
        this.route = new Route()
        this.fileSystem = new FileSystem(options, this.route)
        this.options = Object.assign({}, mockConfig.defaultServerConfig, options)
        this.serverOptions = Object.assign({}, serverOptions, mockConfig.defaultServerConfig)
    }
    init() {
        // 前
        this.beforeCreateServer()
        // 中
        this.getValidPort().then(this.createServer)
        // 后
        this.afterCreateServer()
    }
    beforeCreateServer() {
        // 路由注册完毕，可以绑定到 app 上
        this.fileSystem.on('router-ready', this.routerReady)

        // 文件变化
        this.fileSystem.on('change-after', this.afterFileChange)
        this.fileSystem.on('rename-after', this.afterFileRename)
    }
    createServer() {
        this.app = new koa()
        this.app.use(KoaCros(mockConfig.corsHandler))
        this.app.listen(this.options.port || 7000)
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
        this.route.use(this.app)
    }
}