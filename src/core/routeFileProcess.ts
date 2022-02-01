import { FileName } from '../index.d'
import { Context, Next } from 'koa'
export default class RouteFileProcess {
    path: string
    file: FileName
    constructor(path: string, file: FileName, type: string = 'js') {
        this.path = path
        this.file = file
        this.handle(type)
    }
    handle(type: string) {
        const error = () => {}
        switch (type) {
            case 'ts':
                return this.tsProcess
            case 'js':
                return this.jsProcess
            case 'json':
                return this.jsonProcess
            case 'html':
                return this.htmlProcess
            default: 
                return error
        }
    }
    jsonProcess(ctx: Context, next: Next) {
        // json
    }
    jsProcess(ctx: Context, next: Next) {
        // 处理 js 文件
    }
    tsProcess(ctx: Context, next: Next) {
        // ts 
    }
    htmlProcess(ctx: Context, next: Next) {
       // TODO: html 暂不做 
    }
}