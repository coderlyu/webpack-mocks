import { Context, Next } from 'koa';
import { FileModule } from '../file/file-module';
export default class RouteFileProcess {
  module: FileModule;
  compile: any;
  constructor(tsCompile: any, module: FileModule) {
    this.compile = tsCompile;
    this.module = module;
  }
  async handle(ctx: Context, next: Next) {
    const error = () => {};
    switch (this.module.type) {
      case 'ts':
        return await this.tsProcess(ctx, next);
      case 'js':
        return await this.jsProcess(ctx, next);
      case 'json':
        return await this.jsonProcess(ctx, next);
      case 'html':
        return await this.htmlProcess(ctx, next);
      default:
        return error;
    }
  }
  jsonProcess(ctx: Context, next: Next) {
    // json
    let data = JSON.stringify(this.module.file);
    ctx.res.end(data, 'utf8');
    next();
  }
  jsProcess(ctx: Context, next: Next) {
    // 处理 js 文件
  }
  async tsProcess(ctx: Context, next: Next) {
    // ts
    const reg = /export(\s)+default(\s)+(.+)(\s)*(\n)?/g;
    let type = '';
    this.module.file.replace(reg, (...args: Array<string>) => {
      type = args[3];
    });
    if (!type) {
      ctx.res.end('出错了哦');
    }
    const _result = await this.compile.compiler(this.module.path, type);
    ctx.res.end(_result.data);
  }
  htmlProcess(ctx: Context, next: Next) {
    // TODO: html 暂不做
  }
}
