import { Options, ServerOptions } from './index.d';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import KoaCros from 'koa2-cors';
import mockConfig from './config';
import { getFreePort, getJsonFromStr } from './shared/index';
import minimist from 'minimist';
import fse from 'fs-extra';
import path from 'path';
import logger from './shared/log';
import bus from './shared/bus';
import FileToRoute from './core/file/file-to-route';
export default class VMock {
  options: Options;
  app: Koa | undefined;
  serverOptions: ServerOptions;
  ready = false;
  argvs = {};
  vbuilderConfig: any;
  fileToRoute: FileToRoute;
  constructor(options: Options, serverOptions?: ServerOptions) {
    this.vbuilderConfig = {
      originFile: '',
      replace: {
        $$_THOR_HOST_$$: {
          'dev-daily': '//h5.dev.weidian.com:7000',
          'dev-pre': '//thor.pre.weidian.com',
          'dev-prod': '//thor.weidian.com',
        },
      },
      mockConfig: {
        proxy: {
          source: 'daily',
          target: '',
        },
        serverConfig: {},
      },
    };
    this.getEnvType();
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
      this.vbuilderConfig.mockConfig.serverConfig,
    );
    this.fileToRoute = new FileToRoute(this.options);
    this.beforeCreateServer();
  }
  server() {
    this.fileToRoute.generateRoutes(); // 初始化路由
    //
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
  createServer() {
    this.app = new Koa();
    this.app.use(KoaCros(mockConfig.corsHandler)).use(bodyParser());

    this.app.listen(this.serverOptions.port);
    this.routerReady();
    logger.info(`The server is running at http://localhost:${this.serverOptions.port}`);
  }
  routerReady() {
    // 路由注册完毕，可以绑定到 app 上
    this.app && this.fileToRoute.use(this.app);
  }
  getEnvType() {
    // 获取运行环境
    this.argvs = minimist(process.argv.slice(2));
    logger.info(`环境参数: ${JSON.stringify(this.argvs)}`);
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
