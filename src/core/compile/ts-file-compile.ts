import jsf from 'json-schema-faker';
import { Schema } from 'json-schema-faker';
import * as ts from 'typescript';
import typescriptJsonSchema from 'typescript-json-schema';
export default class TsFileCompile {
  jsonSchema = typescriptJsonSchema;
  // faker = jsf
  compilerOptions = {
    noEmit: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    allowUnusedLabels: true,
  };
  constructor() {}
  compiler(filePath: string, type: string) {
    async function compile(_filePath: string, type: string) {
      let _data = '';
      _data = await compile.compiler.tsMock(type, _filePath, compile.compiler.compilerOptions);
      return {
        data: _data,
      };
    }
    compile.compiler = this;
    return compile(filePath, type);
  }
  async tsMock(symbol: any, file: string, compilerOptions: ts.CompilerOptions) {
    const program = ts.createProgram([file], compilerOptions);
    // fs.writeFileSync('./file.txt', JSON.stringify(program.getSourceFiles()))
    const schema = this.jsonSchema.generateSchema(program, symbol);
    // console.log(JSON.stringify(schema))
    // let sch = {
    //     type: 'object',
    //     properties: {
    //         name: {
    //             type: 'string'
    //         }
    //     }
    // }
    // console.log(jsf(sch as Schema))
    const result = await jsf.generate(schema as Schema); // jsonValue to string
    console.log(result);
    if (schema !== null) return JSON.stringify(result);
    else return '';
  }
}
