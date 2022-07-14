import { Context, Next } from 'koa';
import Module from '../core/file/file-module';
import logger from './log';
import { watchCtxStatus } from './index'
import httpProxy from 'http-proxy'

export default function genMiddleware(headers: any, modules: Module, domain = 'h5.dev.weidian.com', port = 443, https = false) {
  const proxy = https ? httpProxy.createProxyServer({
    hostRewrite: domain,
  }) : httpProxy.createProxyServer({})
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
      // 查找路由是否已存在
      const { url } = ctx
      const relativeUrl = url.startsWith('/') ? url.slice(1) : url
      if(!modules.has(relativeUrl)) {
        logger.info(`代理到真实地址：${https ? 'https' : 'http'}://${domain}:${port}${url}`)
        if (https) {
          proxy.web(ctx.req, ctx.res, {
            target: `https://${domain}:${port}${url}`,
            secure: false,
            changeOrigin: true,
          }, (err) => {
              console.error(err)
          });
        } else {
          if (!domain) {
            domain = ctx.headers.host?.split(':')[0] || 'h5.dev.weidian.com'
          }
          proxy.web(ctx.req, ctx.res, {
            target: `http://${domain}:${port}${url}`
          }, (err) => {
              console.error(err)
          });
        }
        await watchCtxStatus(ctx)
      }
      await next();
    } catch (error) {
      // logger.error(`未匹配到路由, ${JSON.stringify(ctx)}`);
    }
  };
}
