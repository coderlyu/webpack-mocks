import jsf from 'json-schema-faker';
import { Schema } from 'json-schema-faker';
import * as ts from 'typescript';
import typescriptJsonSchema from 'typescript-json-schema';
import logger from '../../shared/log';
export default class TsFileCompile {
  jsonSchema = typescriptJsonSchema;
  // faker = jsf
  compilerOptions: ts.CompilerOptions = {
    noEmit: true, // 不输出文件（write）
    allowJs: true, // 允许js
    emitDecoratorMetadata: true, // 为源文件中的修饰声明发出设计类型元数据
    experimentalDecorators: true, // 启用对 TC39 第 2 阶段草稿装饰器的实验性支持
    target: ts.ScriptTarget.ES5, // 为发出的 JavaScript 设置 JavaScript 语言版本并包含兼容的库声明
    module: ts.ModuleKind.CommonJS, // 指定生成什么模块代码
    allowUnusedLabels: true, // 禁用未使用标签的错误报告
    diagnostics: true, // 构建后输出编译器性能信息
    explainFiles: true, // 打印在编译期间读取的文件，包括包含它的原因
    resolveJsonModule: true, // 启用导入 .json 文件
  };
  settings: typescriptJsonSchema.PartialArgs = {
    required: true,
  };
  constructor() {}
  compiler(filePath: string, type: string) {
    async function compile(_filePath: string, type: string) {
      let _data = '';
      try {
        _data = await compile.compiler.tsMock(type, _filePath, compile.compiler.compilerOptions);
      } catch (error) {
        logger.error(JSON.stringify(error));
      }
      return {
        data: _data,
      };
    }
    compile.compiler = this;
    return compile(filePath, type);
  }
  async tsMock(symbol: any, file: string, compilerOptions: ts.CompilerOptions) {
    const program = ts.createProgram([file], compilerOptions);
    const schema = this.jsonSchema.generateSchema(program, symbol, this.settings);
    const result = await jsf.generate(schema as Schema); // jsonValue to string
    if (schema !== null) return JSON.stringify(result);
    else return '';
  }
}
