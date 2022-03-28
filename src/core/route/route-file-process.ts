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
    ctx.body = data;
    next();
  }
  async jsProcess(ctx: Context, next: Next) {
    // 处理 js 文件
    const fn = this.module.file;
    console.log('ctx.query', ctx.query);
    console.log('ctx.body', ctx.body);
    let data = '';
    const params = (ctx.body as object) || ctx.query || {};
    switch (typeof fn) {
      case 'object':
        data = fn;
        break;
      case 'function':
        try {
          data = await fn({ ...params });
        } catch (error) {
          ctx.status = 400;
          data = error as string;
        }
        break;
      default:
        break;
    }
    ctx.body = JSON.stringify(data);
    next();
  }
  async tsProcess(ctx: Context, next: Next) {
    // ts
    const reg = /export(\s)+default(\s)+(.+)(\s)*(\n)?/g;
    let type = '';
    this.module.file.replace(reg, (...args: Array<string>) => {
      type = args[3];
    });

    // 别的处理
    const faceReg = /\s?interface\s?/g;
    if (faceReg.test(type)) type = type.replace(faceReg, '');
    if (/\{/g.test(type)) type = type.replace(/\{/g, '');
    type = type.trim();
    if (type.endsWith(';')) type = type.replace(';', '');
    if (!type) {
      ctx.res.end('出错了哦');
    }
    console.log('类型', type);
    const _result = await this.compile.compiler(this.module.path, type);
    ctx.res.end(_result.data);
  }
  htmlProcess(ctx: Context, next: Next) {
    // TODO: html 暂不做
  }
}
