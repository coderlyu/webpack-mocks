const VMock = require('../dist/index.umd.js')

let vmock = new VMock({
    userFolder: process.cwd(),
    srcFolder: 'string',
    buildFolder: 'string',
    currentEnv: 'string',
})

vmock.server()