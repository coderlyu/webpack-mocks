import { isRelativePath, relativePathFix } from '../../shared/index';
export class FileModule {
  private readonly _path: string; // 绝对路径
  private readonly _relativePath: string; // 相对路径，相对 mock 文件夹的路径
  private _file: any; // 字符串 或者 require
  private _type: string; // 文件类型，例如：js, ts, json 等等...
  constructor(path: string, file: any, relativePath: string, type: string) {
    this._path = path;
    this._file = file;
    this._type = type;
    this._relativePath = relativePath;
  }
  static isFileModule(module: any) {
    return module instanceof FileModule;
  }
  set(file: any) {
    this._file = file;
  }
  setType(type: string) {
    this._type = type;
  }
  get type() {
    return this._type;
  }
  get file() {
    return this._file;
  }
  get path() {
    return this._path;
  }
  get relativePath() {
    return this._relativePath;
  }
}

export default class Module {
  fileModules: Map<string, FileModule>; // 绝对地址 -> 文件
  relativeMap: any; // 相对地址与绝对地址之间的映射关系
  constructor() {
    this.fileModules = new Map<string, FileModule>();
    this.relativeMap = {}; // /use/index.json -> user/index.json
  }
  add(path: string, file: any, relativePath: string, type: string = 'js') {
    const module = new FileModule(path, file, relativePath, type);
    this.fileModules.set(path, module);
    this.relativeMap[path] = relativePath;
    this.relativeMap[relativePath] = path;
  }
  get(path: string): FileModule | undefined {
    if (isRelativePath(path)) {
      // 通过相对路径查找
      return this.fileModules.get(this.relativeMap[relativePathFix(path)]);
    }
    return this.fileModules.get(path);
  }
  has(path: string): boolean {
    return this.get(path) ? true : false;
  }
  set(path: string, file: any) {
    // file 是 FileModule 实例
    if (FileModule.isFileModule(file)) {
      // 仅覆盖 Map
      let absPath = path;
      if (isRelativePath(path)) absPath = this.relativeMap[relativePathFix(path)];
      this.fileModules.set(absPath, file);
    } else {
      // 修改文件
      let module: FileModule | undefined;
      if (isRelativePath(path)) {
        // 通过相对路径查找
        module = this.fileModules.get(this.relativeMap[relativePathFix(path)]);
      } else module = this.fileModules.get(path);
      if (module && FileModule.isFileModule(module)) {
        module.set(file);
      }
    }
  }
  setType(path: string, type: string) {
    let module;
    if (isRelativePath(path)) {
      //  相对路径
      module = this.fileModules.get(this.relativeMap[relativePathFix(path)]);
    } else {
      module = this.fileModules.get(path);
    }
    if (FileModule.isFileModule(module)) {
      module?.setType(type);
    }
  }
  del(path: string) {
    if (isRelativePath(path)) {
      // 是相对地址
      let absPath = this.relativeMap[relativePathFix(path)];
      this.fileModules.delete(absPath);
      // 删除映射关系
      delete this.relativeMap[path];
      delete this.relativeMap[absPath];
    } else {
      // 绝对地址
      let relPath = this.relativeMap[path];
      this.fileModules.delete(path);
      // 删除映射关系
      delete this.relativeMap[path];
      delete this.relativeMap[relPath];
    }
  }
  /**
   * 清空数据
   */
  clear() {
    this.fileModules = new Map();
    this.relativeMap = {};
  }
  /**
   * 返回 相对路径组成的 数组，用于生成 routes
   */
  keys() {
    const _arr = Array.from(this.fileModules.keys());
    return Object.keys(this.relativeMap).filter((_) => !_arr.includes(_));
  }
}

export type FileModuleName = FileModule | undefined;
