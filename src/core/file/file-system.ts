import { Options } from '../../index.d';
import FileWatch from './file-watch';
import path from 'path';
import fs from 'fs';
import mockConfig from '../../config';
import Module, { FileModule } from './file-module';
import Path from './path';

export default class FileSystem extends FileWatch implements Path {
  options: Options;
  resolveOrder = ['json', 'js', 'ts'];
  mockDir: string;
  route: any;
  modules: Module;
  vbuildConfig: any;
  constructor(options: Options, route: any, modules: Module) {
    super();
    this.options = options;
    this.route = route;
    this.modules = modules; // 缓存的模块
    this.mockDir = this.resolve(mockConfig.mockDirName); // mock 目录
    this.registerMonitor(); // 注册监听回掉事件
    this.watch(); // 监听文件
  }
  getRunningConfig() {
    // 获取配置文件
  }
  generateRoutes(): void {
    if (this.options.userFolder && this.isDir(this.mockDir)) {
      if (!this.isExistsFile(this.mockDir)) return;
      let dirs = fs.readdirSync(this.mockDir).map((p) => this.resolve(p, this.mockDir));
      while (dirs.length > 0) {
        let _path = dirs.shift();
        if (!_path) continue;
        if (this.isDir(_path)) {
          // 是文件夹
          dirs = dirs.concat(fs.readdirSync(_path).map((p) => this.resolve(p, _path)));
        } else {
          // 是文件
          this.readFileByOrder(_path); // 读取文件并缓存
        }
      }
      this.route.generateRoutes(); // 生成路由
    }
  }
  resolve(filePath: string, userFolder: string = this.options.userFolder): string {
    return path.resolve(userFolder, filePath);
  }
  require(filePath: string, type: string): FileModule | undefined {
    if (this.modules.has(filePath)) return this.modules.get(filePath);
    // json, js, ts 文件
    const file = require(filePath + '.' + type);
    this.modules.add(filePath, file, this.relativePath(filePath), type);
    return this.modules.get(filePath);
  }
  isDir(filePath: string): boolean {
    if (!this.isExistsFile(filePath)) return false;
    return fs.lstatSync(filePath).isDirectory(); // 判断是否是目录
  }
  isExistsFile(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
  readFile(filePath: string, type: string): FileModule | undefined {
    // 其他文件类型
    if (this.modules.has(filePath)) return this.modules.get(filePath);
    const file = fs.readFileSync(filePath + '.' + type).toString();
    this.modules.add(filePath, file, this.relativePath(filePath), type);
    return this.modules.get(filePath);
  }
  readFileByOrder(filePath: string): { type: string; path: string; module: FileModule | undefined } {
    const idx = filePath.lastIndexOf('.');
    let fileType = '';
    let isInResolveOrder = false;
    if (idx > -1) {
      fileType = filePath.slice(idx);
      filePath = filePath.slice(0, idx);
    }
    for (let i = 0; i < this.resolveOrder.length; i++) {
      let _filePath = `${filePath}.${this.resolveOrder[i]}`;
      if (this.isExistsFile(_filePath)) {
        // filePath = _filePath
        fileType = this.resolveOrder[i];
        isInResolveOrder = true;
        break;
      }
    }
    let module: FileModule | undefined;
    if (isInResolveOrder && fileType !== 'ts') {
      // ts, js, json
      module = this.require(filePath, fileType);
    } else {
      module = this.readFile(filePath, fileType);
    }
    return {
      type: fileType,
      path: filePath,
      module,
    };
  }
  registerMonitor(): void {
    // 注册监听文件变化的回掉事件
    this.on('change', this.fileChange);
    this.on('rename', this.fileRename);

    // 注册路由的监听事件
    this.route.on('route-ready', this.routeReady);
    // this.route.on('')
  }
  fileChange(filename: string): void {
    const filePath = this.resolve(mockConfig.mockDirName + path.sep + filename);
    const { path: _filePath, module } = this.readFileByOrder(filePath);
    this.modules.set(_filePath, module);
    console.log('file change');
    this.emit('change-after', filename);
  }
  fileRename(filename: string): void {
    this.modules.clear();
    this.generateRoutes(); //! 暂时这么处理，后续完善路径对比
    this.emit('rename-after', filename); // TODO: 后续完善路径对比
  }
  routeReady() {
    console.log('system router');
    // route 路由准备完毕
    this.emit('router-ready');
  }
  /**
   * 判断是否是相对路径
   * @param path
   * @returns
   */
  isRelativePath(path: string) {
    return path.startsWith('.') || !path.startsWith('/');
  }
  /**
   * 修复相对路径
   * @param path
   * @returns
   */
  relativePathFix(path: string) {
    return path.replace(/^(\.+\/)+/g, '');
  }
  /**
   * 获取绝对路径
   * @param _path
   * @param prefix 前缀
   * @returns
   */
  absolutePath(_path: string, prefix: string = this.mockDir) {
    if (!this.isRelativePath(_path)) return _path;
    return path.resolve(prefix, _path);
  }
  relativePath(_path: string) {
    return this.relativePathFix(path.relative(this.mockDir, _path));
  }
}
