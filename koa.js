const Koa = require('koa')
const KoaRouter = require('koa-router')
const httpProxy = require('http-proxy')
const http = require('http')
const app = new Koa()
const router = new KoaRouter()
const map = new Map()
const proxy = httpProxy.createProxyServer({
    hostRewrite: 'h5.dev.weidian.com',
})

// const requestProxy = function (url) {
//     return new Promise((resolve, reject) => {
//         let chunks = ''
//         const req = http.request({
//             host: '127.0.0.1',
//             port: 7000,
//             path: '/api/list/1.0',
//             method: 'GET',
//             headers: {
//                 'Access-Control-Allow-Origin': '*',
//                 'accept': '*/*',
//                 'accept-encoding': 'gzip, deflate, br',
//                 'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6',
//                 'Content-Type': 'text/plain; charset=utf-8'
//             }
//         }, (res) => {
//             let chunks = ""
//             res.on('data', (chunk) => {
//                 chunks += chunk
//                 console.log(`BODY: ${chunk}`);
//             });
//             res.on('end', () => {
//                 resolve(chunks)
//                 console.log('No more data in response.');
//             });
//             req.on('error', (e) => {
//                 reject()
//                 console.error(`problem with request: ${e.message}`);
//             });

//             // proxy.web(req, res, {target: 'http://localhost:7000'}, () => {
//             //     resolve()
//             //     console.log('proxy +++++ end')
//             // })
//         })
//         req.write('');
//     })
// }

map.set('apilist1.0', 'http://localhost:3000')
app.use(async (ctx, next) => {
    const { path } = ctx.request
    console.log(path)
    if (!map.has(path.replace('/', ''))) {
        console.log('proxy')
        // ctx.res = new Proxy(ctx.res, {
        //     get(target, key) {
        //         return target[key]
        //     },
        //     set(target, key, value) {
        //         if (key === 'status') {
        //             console.log(value)
        //         }
        //         target[key] = value
        //     }
        // })
        proxy.web(ctx.req, ctx.res, {
            target: 'https://h5.dev.weidian.com:7000',
            secure: false,
            changeOrigin: true,
        }, (err) => {
            console.error(err)
        });
        await watch(ctx)
        next()
        // proxy.web(req, res, {target: 'http://localhost:7000'}, () => {
        //     resolve()
        //     console.log('proxy +++++ end')
        // })
       
        // await requestProxy(path).then((data) => {
        //     console.log('proxy +++ then')
        //     ctx.body = data
        //     next()
            
        // }).catch(() => {
        //     console.log('proxy --- catch')
        // })
        console.log('proxy end')
        // proxy.web(ctx.req, ctx.res)
    } else {
        await next()
    }
})
router.get('/',async (ctx, next) => {
    console.log('get')
    ctx.body = 'hello koa'
    await next()
    console.log('get -end ')
})
router.all('/',async (ctx, next) => {
    console.log('all')
    ctx.body = 'hello koa - all'
    await next()
    console.log('all -end ')
})
app.use(router.routes()).use(router.allowedMethods())
app.listen(3000, () => {
    console.log('server is running at http://localhost:3000')
})

/**
 * 
 * @param {*} ctx 
 * @param {*} delay 超时时间
 * @returns 
 */
function watch (ctx, delay = 5000) {
    let timer = null
    let startTime = +new Date()
    let endTime = startTime
    function createTimer (resolve) {
        return setTimeout(() => {
            endTime = +new Date()
            if (endTime - startTime > delay || ctx.response.status === 200) {
                resolve()
                timer = null
            } else {
                timer = createTimer(resolve)
            }
        }, 16);
    }
    return new Promise((resolve) => {
        timer = createTimer(resolve)
    })
}
