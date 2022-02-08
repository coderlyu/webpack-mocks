import { Context, Next } from 'koa'
export default async function(ctx: Context, next: Next) {
    console.log('我是中间件。。。。。')
    await next()
}