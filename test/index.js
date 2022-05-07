// const VMock = require('../dist/index.umd.js');
const VMock = require('../dist/index.umd.js');

let vmock = new VMock({
  userFolder: process.cwd(),
  port: 8000,
  force: false,
  domain: 'h5.dev.weidian.com',
  https: true
});

vmock.server();
