const http = require("http");
const postData = JSON.stringify({
    'msg': 'Hello World!'
  });
const options = {
    port: 7000,
    path: '/api/list/1.0',
    method: 'GET',
    timeout: 5000,
    headers: {
        'accept': 'application/json, */*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6',
        'Content-Type': 'text/plain; charset=utf-8'
    }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding("utf8");
  res.on("data", (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on("end", () => {
    console.log("No more data in response.");
  });
});
req.on("error", (e) => {
  console.error(`problem with request: ${e.message}`);
});
req.write('');
