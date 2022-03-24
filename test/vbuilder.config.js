/*
 * @vbuilder.config.js
 */

// vbuilder 文档：http://vbuilder-doc.daily.vdian.net/vbuilder/doc/default-vue-scaffold-config.html

module.exports = ({
    userFolder,
    srcFolder,
    buildFolder,
    currentEnv,
    webpack,
    webpackDevServer
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { VueLoaderPlugin } = require('vue-loader')
  
    return {
      buildFolder: './build',
  
      // debugPort: 9003, // 调试端口号，默认 9000
      replace: {
        $$_THOR_HOST_$$: {
          // 'dev-daily': '//h5.dev.weidian.com:7001',
          'dev-daily': '//thor.daily.weidian.com',
          'dev-pre': '//thor.pre.weidian.com',
          'dev-prod': '//thor.weidian.com',
  
          // 发布相关
          'build-daily': '//thor.daily.weidian.com',
          'build-pre': '//thor.pre.weidian.com',
          'build-prod': '//thor.weidian.com'
        },
        $$_ENVIRONMENT_$$: {
          'dev-daily': 1,
          'dev-pre': 2,
          'dev-prod': 3,
  
          // 发布相关
          'build-daily': 1,
          'build-pre': 2,
          'build-prod': 3
        },
        $$_SOCKETURL_$$: {
          'dev-daily': 'wss://lava.daily.weidian.com',
          'dev-pre': 'wss://lava.pre.weidian.com',
          'dev-prod': 'wss://lava.weidian.com',
  
          // 发布相关
          'build-daily': 'wss://lava.daily.weidian.com',
          'build-pre': 'wss://lava.pre.weidian.com',
          'build-prod': 'wss://lava.weidian.com'
        }
      },
  
      // 可以合并到 webpack 的配置，按照 webpack 的配置风格
      webpackConfig: {
        resolve: {
          alias: {
            vue: 'vue/dist/vue.esm-bundler.js'
          }
        },
        plugins: [
          // 请确保引入这个插件！
          new VueLoaderPlugin(),
          new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: false,
            __VUE_PROD_DEVTOOLS__: false
          })
        ]
      },
      // html 创建或修改后的回调函数，参数为数组，数组项为 html 文件地址
      onHtmlBuild(htmlFileArray) {
        // console.log(htmlFileArray);
      },
  
      forceCompile(filePath) {
        if (/\/vue\//.test(filePath)) {
          // console.log(filePath);
        }
      },
  
      // 启用 rpx 单位的适配方案
      rpx: true
    }
  }
  
  module.exports.vbuilderScaffold = '@vdian/vbuilder-webpack5@1.0.0'
  