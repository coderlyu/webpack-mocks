const Koa = require('koa')
const Router = require('koa-router')
const path = require('path')

const router = new Router()
const app = new Koa
router.get('/user', async (ctx) => {
    let obj = {
        "message": "请求成功",
        "result": {
            "code": 200,
            "data": "hello world"
        }
    }
    ctx.res.end(JSON.stringify(obj), 'utf8')
})
app.use(router.routes()).use(router.allowedMethods())
app.listen(3000)