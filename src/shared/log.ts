import { configure, getLogger, Logger } from 'log4js';
configure({
  appenders: {
    vMock: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '[%[%p%]]-%d{yyyy/MM/dd-hh:mm:ss}： %m',
      },
    },
  },
  categories: { default: { appenders: ['vMock'], level: 'info' } },
});
class Log {
  logger: Logger;
  constructor() {
    this.logger = getLogger(); // 获取实例
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
    console.error(message);
    this.logger.error(message);
  }
}

const logger = new Log();

export default logger;
