import jsf, { Schema } from 'json-schema-faker';
import * as ts from 'typescript';
import typescriptJsonSchema from 'typescript-json-schema';

export default class TsFileCompile {
    jsonSchema =  typescriptJsonSchema
    faker = jsf
    compilerOptions = {
        noEmit: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
        allowUnusedLabels: true,
    }
    constructor() {
    }
    compiler(filePath: string) {
        function compile(_filePath: string) {
            let _data = ''
            _data = compile.compiler.tsMock('', '', compile.compiler.compilerOptions)
            return {
                data: _data
            }
        }
        compile.compiler = this
        return compile(filePath)
    }
    tsMock(symbol: any, file: string, compilerOptions: ts.CompilerOptions) {
        const program = ts.createProgram([file], compilerOptions);
        const schema = this.jsonSchema.generateSchema(program, symbol);
        if (schema !== null)
            return JSON.stringify(this.faker.generate(schema as Schema, [])) // jsonValue to string
        else return ''
    }
}