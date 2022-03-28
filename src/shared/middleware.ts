import Koa, { Context, Next } from 'koa';
import http from 'http';
import https from 'https';
import { getFreePort } from '../shared/index';

export default function genMiddleWare(
  app: Koa,
  source?: string,
  isHttps: boolean = false,
  domain: string = 'h5.dev.weidian.com',
) {
  //   if (isHttps) {
  //     require('devcert')
  //       .certificateFor(domain, { getCaPath: true })
  //       .then((ssl: any) => {
  //         const { key, cert } = ssl;
  //         https.createServer({ key, cert }, app.callback()).listen(443);
  //       });
  //   } else {
  //     getFreePort().then((port) => http.createServer(app.callback()).listen(port));
  //   }
  return async function middleware(ctx: Context, next: Next) {
    try {
      if (ctx.method && ctx.method.toLocaleUpperCase() === 'POST') {
        ctx.set({
          'Content-Type': 'application/json',
        });
      }
      await next();
      console.log('ctx', ctx);
    } catch (error) {
      console.log('未匹配到路由', ctx);
    }
  };
}
