export default {
  mockDirName: 'mock', // mock 文件夹
  corsHandler: {
    origin: function (ctx: any) {
      if (ctx.request.header && ctx.request.header.origin) return ctx.request.header.origin;
      return '*';
    },
    // exposeHeaders: ['Authorization'],
    maxAge: 5 * 24 * 60 * 60 * 60,
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  },
  defaultServerConfig: {
    port: 7000, // 端口号
    headers: {}, // 默认头部
  },
  envType: ['daily', 'pre'],
  httpsConfig: {
    https: false,
    force: false,
    domain: '',
    port: 443
  },
  vbuilderConfig: {
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
  },
  envs: {
    'dev-daily': 'dev-daily',
    'dev-pre': 'dev-pre',
    'dev-prod': 'dev-prod',
    'build-daily': 'build-daily',
    'build-pre': 'build-pre',
    'build-prod': 'build-prod'
  }
};
