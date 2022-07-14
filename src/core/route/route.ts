import KoaRouter from 'koa-router';
import RouteFileProcess from './route-process';
import TsFileCompile from '../compile/ts-file-compile';
import Module, { FileModule } from '../file/file-module';
import Koa, { Context, Next } from 'koa';
import bus from '../../shared/bus';
import { Options } from '../../types';
import genMiddleware from '../../shared/middleware'
export default class Router {
  router: any;
  methods = ['post', 'get', 'delete'];
  ready: boolean; // 是否准备完毕
  compile: any;
  modules: Module;
  options: Options;
  routerMiddle: any
  constructor(options: Options, modules: Module) {
    this.routerMiddle = null
    this.ready = false;
    this.modules = modules;
    this.options = options;
    this.compile = new TsFileCompile();
    this.router = new KoaRouter(); // 初始化 router
  }
  use(app: Koa, host?: string, port?: number, https?: boolean) {
    if (!this.ready) return;
    // 解决多次加入 middleware 问题
    const middle = genMiddleware(this.options.headers || {}, this.modules, host, port, https);
    const middleRoutes = this.router.routes();
    (middleRoutes as any)._name = 'routes'
    const middleMethods = this.router.allowedMethods();
    (middleMethods as any)._name = 'methods'
    if(!this.routerMiddle) {
      this.router.use(middle)
      this.routerMiddle = middle
    }
    // if (Array.isArray(app.middleware)) {
    //   app.middleware = app.middleware.filter((fn) => !['routes', 'methods'].includes((fn as any)._name))
    // }
    // console.log(app.middleware)
    app.use(middleRoutes).use(middleMethods);
    // console.log(app.middleware)
  }
  generateRoutes() {
    this.ready = false;
    this.modules.keys().forEach((path) => {
      const module = this.modules.get(path);
      if (module) {
        const process = new RouteFileProcess(this.compile, module);
        this.methods.forEach((method) => {
          const matched = this.router.match(this.routerPath(module), method.toUpperCase()).route || false
          if (!matched) // 防止多次注册同一个路由
            this.router[method](
              this.routerPath(module),
              async (ctx: Context, next: Next) => await process.handle(ctx, next),
            ); // 注册路由以及处理方法
        });
      }
    });
    this.ready = true;
    bus.emit('router-ready');
  }
  // reset() {
  //   this.router = new KoaRouter();
  //   this.router.use(Middleware(this.options.headers || {}));
  // }
  routerPath(module: FileModule) {
    return '/' + module.relativePath;
  }
}
