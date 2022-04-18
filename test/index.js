// const VMock = require('../dist/index.umd.js');
const VMock = require('../dist/index.umd.js');

let vmock = new VMock({
  userFolder: process.cwd(),
  port: 8000
});

vmock.server();