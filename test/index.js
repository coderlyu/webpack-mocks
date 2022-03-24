const VMock = require('../dist/index.umd.js');
const { faker } = require('@faker-js/faker');
const jsf = require('json-schema-faker');

let vmock = new VMock({
  userFolder: process.cwd(),
});

vmock.server();