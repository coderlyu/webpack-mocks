// const fs = require('fs')
// const path = require('path')
// fs.watch('./t', { recursive: true }, (eventType, filename) => {
//     console.log(eventType, filename)
// })
// const t = new Map()

// t.set('s', 'hoishdf')
// t.set('天', '259834yth')
// t.set('b', '和骚ID发')

// t.forEach((...args) => {
//     console.log(args)
// })

const cwd = process.cwd()
const path = require('path')
const t = path.resolve(cwd, './file/day.js')
console.log(cwd)
console.log(t)
console.log(path.relative(__dirname, t))