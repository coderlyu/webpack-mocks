import log4js, { Logger} from "log4js";
import { Options } from '../index.d'
export default abstract class Log {
  static log4js = log4js;
  logger: Logger
  saveFile: boolean // 是否保存为文件
  abstract options: Options
  constructor(saveFile = false) {
      if (saveFile) {
        // TODO 保存为本地输出文件，待完善
        log4js.configure({
            appenders: { cheese: { type: "file", filename: "cheese.log" } },
            categories: { default: { appenders: ["cheese"], level: "error" } },
          });
      }
      this.logger = log4js.getLogger() // 获取实例
      this.saveFile = saveFile
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
    this.logger.error(message);
  }
}
