import Koa, { Context, Next } from 'koa';
import http from 'http';
import https from 'https';
import { getFreePort } from '../shared/index';
export default async function genMiddleWare(app: Koa, isHttps: boolean = false, domain: string = 'h5.dev.weidian.com') {
  if (isHttps) {
    const ssl = await require('devcert').certificateFor(domain, { getCaPath: true });
    const { key, cert } = ssl;
    https.createServer({ key, cert }, app.callback()).listen(443);
  } else {
    let port = await getFreePort();
    http.createServer(app.callback()).listen(port);
  }
  return async function (ctx: Context, next: Next) {
    try {
      await next();
    } catch (error) {}
  };
}
