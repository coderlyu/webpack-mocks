const chokidar = require('chokidar');
import { EventEmitter } from 'events';
export default abstract class FileWatch extends EventEmitter {
  abstract mockDir: string;
  constructor() {
    super();
  }
  watch() {
    chokidar.watch(this.mockDir, { ignoreInitial: true }).on('all', (event: any, path: any) => {
      console.log('watch', event, path);
      switch (event) {
        case 'change':
          this.emit('change', path);
          break;
        case 'add':
          this.emit('add', path);
          break;
        case 'unlink':
          this.emit('delete', path);
          break;
        default:
          break;
      }
    });
  }
}
