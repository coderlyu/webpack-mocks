import { configure, getLogger, Logger } from 'log4js';
import { Options } from '../index.d';
export default abstract class Log {
  logger: Logger;
  saveFile: boolean; // 是否保存为文件
  abstract options: Options;
  constructor(saveFile = true) {
    if (saveFile) {
      // TODO 保存为本地输出文件，待完善
      configure({
        appenders: {
          error: { type: 'file', filename: 'log/error.log' },
          warn: { type: 'console' },
        },
        categories: { error: { appenders: ['error'], level: 'error' } },
      });
    }
    this.logger = getLogger(); // 获取实例
    this.saveFile = saveFile;
  }
  debug(message: string) {
    this.logger.debug(message);
  }
  info(message: string) {
    this.logger.level = 'info';
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
