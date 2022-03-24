import * as ts from 'typescript';
const compilerOptions = {
  noEmit: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  allowUnusedLabels: true,
};
const program = ts.createProgram(['./ininterfaces/index.ts'], compilerOptions);
console.log(program.getTypeCount());
