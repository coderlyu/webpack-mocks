import { Options, ServerOptions } from './index.d';
import koa from 'koa';
import KoaCros from 'koa2-cors';
import mockConfig from './config';
// import Log from './shared/log';
import FileSystem from './core/file/file-system';
import Route from './core/route/route';
import Module from './core/file/file-module';
import { getFreePort } from './shared/index';
import minimist from 'minimist';
import fse from 'fs-extra';
import path from 'path';
// extends Log
export default class VMock {
  options: Options;
  app: koa | undefined;
  fileSystem: any;
  route: any;
  serverOptions: ServerOptions;
  ready = false;
  modules: Module;
  argvs = {};
  vbuilderConfig = {
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
        source: '',
        target: '',
      },
    },
  };
  constructor(options: Options, serverOptions?: ServerOptions) {
    // super();
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
    getFreePort(this.serverOptions.port).then((port: number) => {
      this.serverOptions.port = port;

      // 替换 vbuilderConfig.replace 里面的端口号
      const replace = this.vbuilderConfig.replace;
      Object.keys(replace).forEach((item) => {
        const target = replace[item];
        Object.keys(target).forEach((key) => {
          const address = target[key] as string;
          // 替换原来的 监听端口号 为当前实际的端口号
          target[key] = address.replace(/:[0-9]*$/g, ':' + port);
        });
      });

      this.createServer();
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
    this.app = new koa();
    this.app.use(KoaCros(mockConfig.corsHandler));
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
    this.route.use(this.app);
  }
  getEnvType() {
    // 获取运行环境
    this.argvs = minimist(process.argv.slice(2));
    console.log('环境参数', this.argvs);
    this.getDefaultConfig();
  }
  getDefaultConfig() {
    // 判断文件是否存在
    const config = {
      originFile: '',
      replace: {},
      mockConfig: {},
    };
    const filePath = path.resolve(process.cwd(), 'vbuilder.config.js');
    if (fse.existsSync(filePath)) {
      config.originFile = fse.readFileSync(filePath).toString();
      // 解析 replace 对象
      getParseFile('replace:');
      // 解析 mockProxy 对象
      getParseFile('mockConfig:');
      this.vbuilderConfig = config;
    }
    function getParseFile(target: string) {
      let file = config.originFile;
      let idx = file.indexOf(target);
      if (idx > -1) {
        file = file.slice(idx + 1);
        idx = file.indexOf('{');
        const stack = [];
        const fileStack = [];
        if (idx > -1) {
          stack.push('{');
          fileStack.push('{');
          file = file.slice(idx + 1);
          while (stack.length > 0) {
            if (file.indexOf('{') > -1 || file.indexOf('}') > -1) {
              if (file.indexOf('{') > -1) {
                // 存入 stack
                idx = file.indexOf('{');
                fileStack.push(file.slice(0, idx));
                file = file.slice(idx + 1);
              } else {
                // 取出 stack
                if (stack.pop() !== '}') {
                  // 无法匹配，此时说明解析错误，直接推出
                  throw new Error('replace解析错误');
                }
              }
            } else {
              break;
            }
          }
          // 解析完成，尝试拼接
          const finallyStr = fileStack.join();
          try {
            const finallyJson = JSON.parse(finallyStr);
            if (typeof finallyJson === 'object') config[target.slice(target.length - 1)] = finallyJson;
          } catch (error) {
            throw new Error('JSON.parse 转换文件出错');
          }
        }
      }
      return;
    }
  }
}

process.on('unhandledRejection', () => {
  // 未处理 promise catch
  process.exit(1);
});

process.on('uncaughtException', () => {
  // 未捕获的错误
  process.exit(1);
});
