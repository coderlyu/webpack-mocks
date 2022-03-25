import KoaRouter from 'koa-router';
import Middleware from '../../shared/middleware';
import RouteFileProcess from './route-file-process';
import { EventEmitter } from 'events';
import TsFileCompile from '../compile/ts-file-compile';
import Module, { FileModule } from '../file/file-module';
import Koa, { Context, Next } from 'koa';
export default class Route extends EventEmitter {
  router: any;
  methods = ['post', 'get', 'delete'];
  ready: boolean; // 是否准备完毕
  compile: any;
  modules: Module;
  constructor(modules: Module) {
    super();
    this.ready = false;
    this.modules = modules;
    this.compile = new TsFileCompile();
    this.router = new KoaRouter(); // 初始化 router
  }
  use(app: any) {
    if (!this.ready) return;
    this.router.use(Middleware(app));
    app.use(this.router.routes()).use(this.router.allowedMethods());
  }
  generateRoutes() {
    this.ready = false;
    this.modules.keys().forEach((path) => {
      const module = this.modules.get(path);
      if (module) {
        const process = new RouteFileProcess(this.compile, module);
        this.methods.forEach((method) => {
          this.router[method](
            this.routerPath(module),
            async (ctx: Context, next: Next) => await process.handle(ctx, next),
          ); // 注册路由以及处理方法
        });
      }
    });
    this.ready = true;
    this.emit('route-ready');
  }
  reset(app: Koa) {
    this.router = new KoaRouter();
    this.router.use(Middleware(app));
  }
  routerPath(module: FileModule) {
    return '/' + module.relativePath;
  }
}
