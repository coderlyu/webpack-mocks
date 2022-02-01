import { Context, Next } from 'koa'
export default async function(ctx: Context, next: Next) {
    await next()
}