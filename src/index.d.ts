export interface Options {
    userFolder: string,
    srcFolder?: string,
    buildFolder?: string,
    currentEnv: string,
    [prop: string]: any
}

export interface ServerOptions {
    port: number,
    headers: any
}

export type FileName = string | File

export interface CacheFile {
    [prop: string]: FileName
}

export type FileRoute  = Map<string, string>