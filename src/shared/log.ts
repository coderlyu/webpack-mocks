import { configure, getLogger, Logger } from 'log4js';
configure({
  appenders: {
    general: {
      // 打印一般信息
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '[%[%p%]]-%d{hh:mm:ss}： %m',
      },
    },
    error: {
      // 打印堆栈信息
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '[%[%p%]]-%d{hh:mm:ss}： %m\n%s',
      },
    }
  },
  categories: { default: { appenders: ['general'], level: 'info' }, error: { appenders: ['error'], level: 'info', enableCallStack: true } },
});
class Log {
  private logger: Logger;
  private loggerE: Logger
  constructor() {
    this.logger = getLogger('default'); // 获取实例
    this.loggerE = getLogger('error')
  }
  debug(message: string) {
    this.logger.debug(message);
  }
  info(message: string) {
    this.logger.info(message);
  }
  warn(message: string) {
    this.logger.warn(message);
  }
  error(message: string) {
    this.loggerE.error(message);
  }
}

const logger = new Log();

export default logger;
