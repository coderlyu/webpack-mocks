import { Context, Next } from 'koa';
import { FileModule } from '../file/file-module';
import logger from '../../shared/log';
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
    try {
      let data = JSON.stringify(this.module.file);
      ctx.body = data;
    } catch (error) {
      logger.error(JSON.stringify(error));
      ctx.status = 400;
      ctx.body = JSON.stringify(error);
    }
    next();
  }
  async jsProcess(ctx: Context, next: Next) {
    // 处理 js 文件
    try {
      const fn = this.module.file;
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
            logger.error(JSON.stringify(error));
            ctx.status = 400;
            data = error as string;
          }
          break;
        default:
          ctx.status = 400;
          data = 'error';
          break;
      }
      ctx.body = JSON.stringify(data);
    } catch (error) {
      logger.error(JSON.stringify(error));
      ctx.status = 400;
      ctx.body = JSON.stringify(error);
    }
    next();
  }
  async tsProcess(ctx: Context, next: Next) {
    // ts
    try {
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
      logger.info(`type: ${type}`);
      const _result = await this.compile.compiler(this.module.path, type);
      const result = {
        message: '请求成功',
        result: {
          code: 200,
          data: _result.data,
        },
      };
      ctx.body = JSON.stringify(result);
    } catch (error) {
      logger.error(JSON.stringify(error));
      ctx.status = 400;
      ctx.body = JSON.stringify(error);
    }
    next();
  }
  htmlProcess(ctx: Context, next: Next) {
    // TODO: html 暂不做
    try {
      let data = JSON.stringify(this.module.file);
      ctx.body = data;
    } catch (error) {
      logger.error(JSON.stringify(error));
      ctx.status = 400;
      ctx.body = JSON.stringify(error);
    }
    next();
  }
}
