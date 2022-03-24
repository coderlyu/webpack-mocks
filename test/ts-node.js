"use strict";
exports.__esModule = true;
var ts = require("typescript");
var compilerOptions = {
    noEmit: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    allowUnusedLabels: true
};
var program = ts.createProgram(['./ininterfaces/index.ts'], compilerOptions);
console.log(program.getTypeCount());
