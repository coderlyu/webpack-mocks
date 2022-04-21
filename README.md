# mock server

## 已有功能

| 文件类型  | 说明 |
|  ---    | --- |
| json    | 文件内容直接返回✅ |
| js      | 1. 若是方法，将参数传入，并返回执行结果 2. 若不是方法，默认返回结果 |
| ts      | 1. 默认读取 `export default` 的结果 2. mock数据缓存为 json 文件，下次请求直接读取 json 文件的内容 |

## 使用

1. 场景

开发环境下mock数据

2. 安装

`npm i @vdian/v-mock`

3. 用例
当前运行项目的地址：`userFolder`，默认是 `process.cwd()`
```js
const VMock = require('@vdian/v-mock');

let vmock = new VMock({
  userFolder: process.cwd(),
});

vmock.server();
```

4. 配置（可不需要）
项目运行根路径下包含 `vbuilder.config.js`。


```js
module.exports = ({
  userFolder,
  srcFolder,
  buildFolder,
  currentEnv,
  webpack,
  webpackDevServer
}) => {
  const VueLoaderPlugin = require('vue-loader/lib/plugin')

  return {
    buildFolder: './build',
    disableMinicode: true,
    replace: {
      $$_THOR_HOST_$$: {
        'dev-daily': '//h5.dev.weidian.com:7000',
        'dev-pre': '//thor.pre.weidian.com'
      },
    },
    // mock server config
    mockConfig: {
      mockDirName: 'mock',  // mock数据的文件夹，默认是 ‘mock’
      // 接口请求失败时，将会代理到真实接口（暂时未用到）
      proxy: {
        source: 'daily',
        target: 'thor.pre.weidian.com' // https://thor.daily.weidian.com
      },
      serverConfig: {
          port: 7000,
          // 请求额外返回的头部 --- 全局
          headers: {}
      }
    }
  }
}
```

## 开发

1. `npm i`
2. `npm run build`
3. `cd test`
4. `node index.js`
5. 