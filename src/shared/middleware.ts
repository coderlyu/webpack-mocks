import { Context, Next } from 'koa';
import logger from './log';

export default function genMiddleware(headers: any) {
  return async function middleware(ctx: Context, next: Next) {
    try {
      if (ctx.method && ctx.method.toLocaleUpperCase() === 'POST') {
        ctx.set({
          'Content-Type': 'application/json',
        });
      }
      // headers
      Object.keys(headers).forEach((key) => {
        ctx.set(key, headers[key]);
      });
      await next();
    } catch (error) {
      logger.error(`未匹配到路由, ${JSON.stringify(ctx)}`);
    }
  };
}
