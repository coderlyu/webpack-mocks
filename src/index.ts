import { Options, ServerOptions, HttpsConfigName } from './types';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import KoaCros from 'koa2-cors';
import mockConfig from './config';
import { getFreePort, getJsonFromStr } from './shared/index';
import minimist from 'minimist';
import fse from 'fs';
import path from 'path';
import logger from './shared/log';
import bus from './shared/bus';
import FileToRoute from './core/file/file-to-route';
import config from './config';
import https from 'https'
import enforceHttps from 'koa-sslify'
export default class VMock {
  options: Options;
  app: Koa | undefined;
  serverOptions: ServerOptions;
  ready = false;
  argvs = {};
  vbuilderConfig: any;
  fileToRoute: FileToRoute;
  httpsConfig: HttpsConfigName
  https = false // 是否使用 https，搭配 httpsConfig 使用
  constructor(options: Options, serverOptions?: ServerOptions) {
    this.vbuilderConfig = config.vbuilderConfig
    this.httpsConfig = Object.assign({}, config.httpsConfig, { force: options.force })
    this.getEnvType(); // 获取配置文件，https
    this.options = Object.assign(
      {},
      mockConfig.defaultServerConfig,
      options,
      this.vbuilderConfig.mockConfig.serverConfig,
      { mockDirName: this.vbuilderConfig.mockConfig.mockDirName },
    );
    this.serverOptions = Object.assign(
      {},
      serverOptions,
      mockConfig.defaultServerConfig,
      this.vbuilderConfig.mockConfig.serverConfig
    );
    // 优先规则： options > 配置文件
    if (options.port) {
      this.serverOptions.port = options.port
    }
    if (options.https) {
      this.https = options.https
    }
    if (options.domain) {
      this.httpsConfig.domain = options.domain
    }
    this.fileToRoute = new FileToRoute(this.options);
    this.beforeCreateServer();
  }
  server() {
    this.fileToRoute.generateRoutes(); // 初始化路由
    // hello world
    getFreePort(this.serverOptions.port)
      .then((port: number) => {
        this.serverOptions.port = port;

        // 替换 vbuilderConfig.replace 里面的端口号
        const replace = this.vbuilderConfig.replace;
        Object.keys(replace).forEach((item) => {
          const target = replace[item];
          Object.keys(target).forEach((key) => {
            const address = target[key] as string;
            // 替换原来的 监听端口号 为当前实际的端口号
            if (typeof address === 'string') target[key] = address.replace(/:[0-9]*$/g, ':' + port);
          });
        });
        this.createServer();
      })
      .catch((error) => {
        logger.error(error);
      });
  }
  beforeCreateServer() {
    // 路由注册完毕，可以绑定到 app 上
    bus.on('router-ready', () => {
      this.routerReady();
    });
  }
  async createServer() {
    this.app = new Koa();
    this.app.use(KoaCros(mockConfig.corsHandler)).use(bodyParser());
    if (this.https) {
      // 创建 https 服务器
      this.app.use(enforceHttps())
      const ssl = await require('devcert').certificateFor(this.httpsConfig.domain, { getCaPath: true });
      const { key, cert } = ssl
      https.createServer({ key, cert }, this.app.callback()).listen(this.serverOptions.port, (err: any) => {
        if (err) {
          throw new Error(JSON.stringify(err))
        }
      })
      logger.info(`\x1B[32m可能需要输入本机密码以启动 https mock 功能\x1B[0m`);
    } else {
      this.app.listen(this.serverOptions.port);
    }
    this.routerReady();
    logger.info(`The server is running at \x1B[32m${this.https ? 'https' : 'http'}://${this.https ? this.httpsConfig.domain : '127.0.0.1'}:${this.serverOptions.port}\x1B[0m\n`);
    console.log('\x1B[32m[mock]: mock 服务启动成功\x1B[0m')
    console.log(`    访问 mock 文件的方式不带 .json(.js|.ts) 路径:`);
    console.log(`    案例 1: \x1B[32m${this.https ? 'https' : 'http'}://${this.https ? this.httpsConfig.domain : '127.0.0.1'}:${this.serverOptions.port}/api/list/1.0\x1B[0m`);
  }
  routerReady() {
    // 路由注册完毕，可以绑定到 app 上
    this.app && this.fileToRoute.use(this.app);
  }
  getEnvType() {
    // 获取运行环境
    this.argvs = minimist(process.argv.slice(2));
    // logger.info(`环境参数: ${JSON.stringify(this.argvs)}`);
    this.getDefaultConfig();
  }
  getDefaultConfig() {
    // 判断文件是否存在
    const config: any = {
      originFile: '',
      replace: {},
      mockConfig: {},
    };
    const filePath = path.resolve(process.cwd(), 'vbuilder.config.js');
    if (fse.existsSync(filePath)) {
      config.originFile = fse.readFileSync(filePath).toString();
      // 解析 replace 对象
      config.replace = getJsonFromStr(config.originFile, 'replace:');
      // 解析 mockProxy 对象
      config.mockConfig = getJsonFromStr(config.originFile, 'mockConfig:');
      const https = getJsonFromStr(config.originFile, 'https')
      this.httpsConfig.domain = https.domain || this.httpsConfig.domain
      this.vbuilderConfig.originFile = config.originFile || this.vbuilderConfig.originFile;
      this.vbuilderConfig.replace = config.replace || this.vbuilderConfig.replace;
      this.vbuilderConfig.mockConfig = config.mockConfig || this.vbuilderConfig.mockConfig;
    }
  }
}

process.on('unhandledRejection', (error) => {
  // 未处理 promise catch
  console.log('unhandledRejection--', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  // 未捕获的错误
  console.log('uncaughtException--', error);
  process.exit(1);
});
