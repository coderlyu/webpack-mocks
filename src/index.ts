import { Options, ServerOptions } from './index.d';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import KoaCros from 'koa2-cors';
import mockConfig from './config';
import FileSystem from './core/file/file-system';
import Router from './core/route/route';
import Module from './core/file/file-module';
import { getFreePort, getJsonFromStr } from './shared/index';
import minimist from 'minimist';
import fse from 'fs-extra';
import path from 'path';
import Log from './shared/log';
export default class VMock extends Log {
  options: Options;
  app: Koa | undefined;
  fileSystem: any;
  route: Router;
  serverOptions: ServerOptions;
  ready = false;
  modules: Module;
  argvs = {};
  vbuilderConfig: any;
  constructor(options: Options, serverOptions?: ServerOptions) {
    super();
    this.vbuilderConfig = {
      originFile: '',
      replace: {
        $$_THOR_HOST_$$: {
          'dev-daily': '//h5.dev.weidian.com:7001',
          'dev-pre': '//thor.pre.weidian.com',
          'dev-prod': '//thor.weidian.com',
        },
      },
      mockConfig: {
        proxy: {
          source: 'daily',
          target: '',
        },
      },
    };
    this.getEnvType();
    this.modules = new Module(); // 文件模块，route 和 fileSystem 共用的数据
    this.route = new Router(this.modules); // 生成路由
    this.fileSystem = new FileSystem(options, this.route, this.modules); // 操作 mock 文件
    this.options = Object.assign({}, mockConfig.defaultServerConfig, options);
    this.serverOptions = Object.assign({}, serverOptions, mockConfig.defaultServerConfig);
    this.beforeCreateServer();
  }
  server() {
    this.fileSystem.generateRoutes(); // 初始化路由
    // 中
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
        this.error(error);
      });
  }
  beforeCreateServer() {
    // 路由注册完毕，可以绑定到 app 上
    this.fileSystem.on('router-ready', () => {
      this.routerReady();
    });
  }
  createServer() {
    this.app = new Koa();
    this.app.use(KoaCros(mockConfig.corsHandler)).use(bodyParser());

    this.app.listen(this.serverOptions.port);
    this.routerReady();
    this.info(`The server is running at http://localhost:${this.serverOptions.port}`);
  }
  routerReady() {
    // 路由注册完毕，可以绑定到 app 上
    this.info('router ready');
    this.app && this.route.use(this.app);
  }
  getEnvType() {
    // 获取运行环境
    this.argvs = minimist(process.argv.slice(2));
    this.info(`环境参数, ${this.argvs}`);
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
  console.log('unhandledRejection', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  // 未捕获的错误
  console.log('uncaughtException', error);
  process.exit(1);
});
