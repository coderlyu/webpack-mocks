module.exports = function ({page, limit}) {
    console.log(page, limit)
    return {
        "message": "请求成功",
        "result": {
            "code": 200,
            "data": "hello world"+ page + '----' + limit
        }
    }
}