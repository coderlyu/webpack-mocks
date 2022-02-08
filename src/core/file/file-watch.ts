import fs from 'fs'
import { EventEmitter } from 'events'
export default abstract class FileWatch extends EventEmitter {
    abstract mockDir: string
    constructor() {
        super()
    }
    watch() {
        fs.watch(this.mockDir, { recursive: true }, (type, filename) => {
            //* filename：相对 mock文件夹 下的路径
            switch (type) {
                case 'change':
                    this.emit('change', filename) // /user/1.o
                    break;
                default:
                     // rename，一般是新增了文件或者修改了文件
                     // 此时直接全部重新生成
                    this.emit('rename', filename)
                    break;
            }
        })
    }
}