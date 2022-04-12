/*
 * @vbuilder.config.js
 */

// vbuilder 文档：http://vbuilder-doc.daily.vdian.net/vbuilder/doc/default-vue-scaffold-config.html
const path = require('path')

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
    // analyzeBundle: true,
    // debugPort: 9003, // 调试端口号，默认 9000

    replace: {
      $$_THOR_HOST_$$: {
        'dev-daily': '//h5.dev.weidian.com:7000',
        // 'dev-daily': '//thor.daily.weidian.com',
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
      $$_ENV_$$: {
        'dev-daily': 'daily',
        'dev-pre': 'pre',
        'dev-prod': 'prod',
        // 发布相关
        'build-daily': 'daily',
        'build-pre': 'pre',
        'build-prod': 'prod'
      },
      $$_H5_HOST_$$: {
        'dev-daily': 'https://h5.daily.weidian.com',
        'dev-pre': 'https://h5.pre.weidian.com',
        'dev-prod': 'https://h5.weidian.com',

        // 发布相关
        'build-daily': 'https://h5.daily.weidian.com',
        'build-pre': 'https://h5.pre.weidian.com',
        'build-prod': 'https://h5.weidian.com'
      },
      $$_PAY_H5_HOST_$$: {
        'dev-daily': 'https://pay-h5.daily.weidian.com',
        'dev-pre': 'https://pay-h5.pre.weidian.com',
        'dev-prod': 'https://weidian.com',

        // 发布相关
        'build-daily': 'https://pay-h5.daily.weidian.com',
        'build-pre': 'https://pay-h5.pre.weidian.com',
        'build-prod': 'https://weidian.com'
      }
    },

    px2rem: {
      open: false, // 如果要开启，需要设置为 true
      loader: 'px2rem-loader', // 开发者在当前目录需要自行安装 px2rem-loader: npm i px2rem-loader
      options: {
        remUnit: 30
      }
    },

    // lessLoaderConfig: {
    //   modifyVars: {
    //     // 通过 less 文件覆盖（文件路径为绝对路径）
    //     hack: `true; @import "${path.resolve(srcFolder, './vuiVar.less')}";`
    //   }
    // },

    // 可以合并到 webpack 的配置，按照 webpack 的配置风格
    webpackConfig: {
      devtool: currentEnv.startsWith('build') ? 'none' : 'inline-module-source-map',
      resolve: {
        alias: {
          vue: 'vue/dist/vue.esm.js',
          '@c': path.join(srcFolder, '/src/components'),
          '@m': path.join(srcFolder, '/src/modules'),
          '@co': path.join(srcFolder, '/src/common')
        }
      },
      plugins: [
        // 请确保引入这个插件！
        new VueLoaderPlugin()
      ]
    },

    forceCompile(filePath) {
      return /(node_modules\/color-convert)/i.test(filePath)
    },

    // html 创建或修改后的回调函数，参数为数组，数组项为 html 文件地址
    onHtmlBuild(htmlFileArray) {
      // console.log(htmlFileArray);
    },
    rpx: true,
    mockConfig: {
      mockDirName: 'mock',  // mock数据的文件夹，默认是 ‘mock’
      // 接口请求失败时，将会代理到真实接口
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
    // 启用 rpx 单位的适配方案
    // 启动 rem 转为 rpx
    // remToRpx: true,
    // https: {
    //     domain: "h5.dev.weidian.com" // 本地开发域名
    // },
  }
}

module.exports.vbuilderScaffold = '@vdian/mechanic@5.0.0-beta'
