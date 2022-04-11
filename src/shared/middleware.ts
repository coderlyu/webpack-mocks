import { Context, Next } from 'koa';

export default async function middleware(ctx: Context, next: Next) {
  try {
    if (ctx.method && ctx.method.toLocaleUpperCase() === 'POST') {
      ctx.set({
        'Content-Type': 'application/json',
      });
    }
    await next();
    // console.log('ctx', ctx);
  } catch (error) {
    console.log('未匹配到路由', ctx);
  }
}
