import { Options, FileModuleName } from '../../index.d';
import path from 'path';
import fs from 'fs';
import mockConfig from '../../config';
import Module from './file-module';
import { relativePathFix } from '../../shared/index';
import bus from '../../shared/bus';
import logger from '../../shared/log';
const chokidar = require('chokidar');

export default class FileSystem {
  options: Options;
  resolveOrder = ['json', 'js', 'ts'];
  mockDir: string;
  modules: Module;
  vbuildConfig: any;
  constructor(options: Options, modules: Module) {
    this.options = options;
    this.modules = modules; // 缓存的模块
    this.mockDir = this.resolve(options.mockDirName || mockConfig.mockDirName); // mock 目录
    this.watch(); // 监听文件
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
      bus.emit('generateRoutes'); // 生成路由
    } else {
      logger.warn(`${this.mockDir} is not a valid directory`);
      throw new Error(`${this.mockDir} is not a valid directory`);
    }
  }
  resolve(filePath: string, userFolder: string = this.options.userFolder): string {
    return path.resolve(userFolder, filePath);
  }
  require(filePath: string, type: string, refresh?: boolean): FileModuleName {
    if (this.modules.has(filePath) && !refresh) return this.modules.get(filePath);
    // json, js, ts 文件
    try {
      delete require.cache[filePath + '.' + type]; // 清除 require 缓存
      const file = require(filePath + '.' + type);
      if (refresh) this.modules.set(filePath, file);
      else this.modules.add(filePath, file, this.relativePath(filePath), type);
    } catch (error) {
      logger.warn(`${filePath} is not a valid file`);
      logger.error(JSON.stringify(error));
      return undefined;
    }
    return this.modules.get(filePath);
  }
  isDir(filePath: string): boolean {
    if (!this.isExistsFile(filePath)) return false;
    return fs.lstatSync(filePath).isDirectory(); // 判断是否是目录
  }
  isExistsFile(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
  readFile(filePath: string, type: string, refresh?: boolean): FileModuleName {
    // 其他文件类型
    if (this.modules.has(filePath) && !refresh) return this.modules.get(filePath);
    try {
      const file = fs.readFileSync(filePath + '.' + type).toString();
      if (refresh) this.modules.set(filePath, file);
      else this.modules.add(filePath, file, this.relativePath(filePath), type);
    } catch (error) {
      logger.warn(`${filePath} is not a valid file`);
      return undefined;
    }
    return this.modules.get(filePath);
  }
  /**
   *
   * @param filePath 绝对路径
   * @returns
   */
  readFileByOrder(filePath: string, refresh = false): { type: string; path: string; module: FileModuleName } {
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
        fileType = this.resolveOrder[i];
        isInResolveOrder = true;
        break;
      }
    }
    let module: FileModuleName;
    if (isInResolveOrder && fileType !== 'ts') {
      // ts, js, json
      module = this.require(filePath, fileType, refresh);
    } else {
      module = this.readFile(filePath, fileType, refresh);
    }
    return {
      type: fileType,
      path: filePath,
      module,
    };
  }
  fileChange(filename: string): void {
    // 注册监听文件变化的回掉事件
    const { path: _filePath, module } = this.readFileByOrder(filename, true);
    this.modules.set(_filePath, module);
  }
  fileAdd(filename: string) {
    // rename 分两步
    // 1. delete 原有文件
    // 2. add 改名后的文件
    this.modules.clear();
    this.generateRoutes();
  }
  relativePath(_path: string) {
    return relativePathFix(path.relative(this.mockDir, _path));
  }
  watch() {
    chokidar.watch(this.mockDir, { ignoreInitial: true }).on('all', (event: any, path: any) => {
      logger.info(`${event} -- ${path}`);
      switch (event) {
        case 'change':
          this.fileChange(path);
          break;
        case 'add':
          this.fileAdd(path);
          break;
        case 'unlink':
          // not support
          break;
        default:
          break;
      }
    });
  }
}
