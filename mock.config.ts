export default {
    mockDirName: 'mock', // mock 文件夹
    corsHandler: {
        origin: function () {
            return '*'
        },
        exposeHeaders: ['Authorization'],
        maxAge: 5 * 24 * 60 * 60,
        // credentials: true,
        allowMethods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
        allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    },
    defaultServerConfig: {
        port: 7000, // 端口号
        headers: {}, // 默认头部
    }
}