// const fs = require('fs')
// const path = require('path')
// fs.watch('./t', { recursive: true }, (eventType, filename) => {
//     console.log(eventType, filename)
// })
const t = new Map()

t.set('s', 'hoishdf')
t.set('天', '259834yth')
t.set('b', '和骚ID发')

t.forEach((...args) => {
    console.log(args)
})