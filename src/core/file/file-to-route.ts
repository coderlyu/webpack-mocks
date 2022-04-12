import FileSystem from './file-system';
import Router from '../route/route';
import { EventEmitter } from 'events';
import Koa from 'koa';
import bus from '../../shared/bus';
import Module from './file-module';
import { Options } from '../../index.d';
export default class FileToRoute extends EventEmitter {
  fileSystem: FileSystem;
  router: Router;
  modules: Module;
  constructor(options: Options) {
    super();
    this.modules = new Module(); // 文件模块，route 和 fileSystem 共用的数据
    this.router = new Router(this.modules); // 生成路由
    this.fileSystem = new FileSystem(options, this.modules); // 操作 mock 文件
    bus.on('generateRoutes', () => {
      this.router.generateRoutes();
    });
  }
  generateRoutes() {
    this.fileSystem.generateRoutes();
  }
  use(app: Koa) {
    this.router.use(app);
  }
}
