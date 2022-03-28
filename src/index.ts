import { Options, ServerOptions } from './index.d';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import KoaCros from 'koa2-cors';
import mockConfig from './config';
// import Log from './shared/log';
import FileSystem from './core/file/file-system';
import Route from './core/route/route';
import Module from './core/file/file-module';
import { getFreePort, getJsonFromStr } from './shared/index';
import minimist from 'minimist';
import fse from 'fs-extra';
import path from 'path';
// extends Log
export default class VMock {
  options: Options;
  app: Koa | undefined;
  fileSystem: any;
  route: any;
  serverOptions: ServerOptions;
  ready = false;
  modules: Module;
  argvs = {};
  vbuilderConfig: any;
  constructor(options: Options, serverOptions?: ServerOptions) {
    // super();
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
    this.route = new Route(this.modules); // 生成路由
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
        // console.log('vbuilderConfig', this.vbuilderConfig);
        //
        this.createServer();
      })
      .catch((error) => {
        console.log(error);
      });
  }
  beforeCreateServer() {
    // this.info(`beforeCreateServer`);
    // 路由注册完毕，可以绑定到 app 上
    this.fileSystem.on('router-ready', () => {
      this.routerReady();
    });

    // 文件变化
    this.fileSystem.on('change-after', this.afterFileChange);
    this.fileSystem.on('rename-after', this.afterFileRename);
  }
  createServer() {
    // this.info(`createServer`);
    this.app = new Koa();
    this.app.use(KoaCros(mockConfig.corsHandler)).use(bodyParser());

    this.app.listen(this.serverOptions.port);
    this.routerReady();
    console.log(`The server is running at http://localhost:${this.serverOptions.port}`);
    // this.info(`The server is running at http://localhost:${this.serverOptions.port}`);
    this.afterCreateServer();
  }
  afterCreateServer() {
    // this.info(`afterCreateServer`);
  }
  afterFileChange() {
    // 文件内容变化完毕之后的操作
  }
  afterFileRename() {
    // 文件命名变化/删除/新增之后的操作
    // 修改路由
    // 删除路由
    // 新增路由
  }
  routerReady() {
    // 路由注册完毕，可以绑定到 app 上
    console.log('ready router');
    const proxy = this.vbuilderConfig.mockConfig.proxy;
    const isHttps = proxy.target && proxy.target.startsWith('https://');
    let source = '';
    let domain = 'h5.dev.weidian.com';
    if (proxy.source) {
      const evns = ['daily', 'pre', 'prod'];
      if (evns.includes(proxy.source)) {
        const replace = this.vbuilderConfig.replace;
        loop1: for (let i = 0, key; i < Object.keys(replace).length; i++) {
          key = Object.keys(replace)[i];
          const target = replace[key];
          for (let j = 0, key2; j < Object.keys(target).length; j++) {
            key2 = Object.keys(target)[j];
            const address = target[key2] as string;
            // 只找第一个，暂时
            if (typeof address === 'string' && key.includes(proxy.source)) {
              source = address;
              break loop1;
            }
          }
        }
      } else {
        //
        source = proxy.source;
      }
    }
    if (isHttps) {
      domain = proxy.target.slice('https://'.length);
    }
    console.log('domain', domain);
    this.route.use(this.app, source, isHttps, domain);
  }
  getEnvType() {
    // 获取运行环境
    this.argvs = minimist(process.argv.slice(2));
    console.log('环境参数', this.argvs);
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
