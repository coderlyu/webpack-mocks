const data = {"message":"请求成功","result":{"code":200,"data":{"age":-54026870.66462049,"info":{"school":"ad"},"name":"consectetur in dolore","sex":"reprehenderit"}}}
module.exports = function(_obj) {
    
    const obj = JSON.parse(JSON.stringify(_obj))
    console.log(obj)
    console.log(typeof obj)
    console.log(typeof obj.username)
    console.log(obj.username)
    return data
}