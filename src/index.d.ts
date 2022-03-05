export interface Options {
  userFolder: string; // 项目运行目录，一般为 process.cwd()
  [prop: string]: any;
}

export interface ServerOptions {
  port: number;
  headers: any;
}

export type FileName = string | File;

export interface CacheFile {
  [prop: string]: FileName;
}

export type FileRoute = Map<string, string>;
