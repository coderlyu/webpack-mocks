# mock server

## 问题

1. 文件夹变化时，生成路由出错，表现在 新建 js，json，ts 文件时，内容为空，此时加载出错

2. 文件内容变化时后的处理，需要做节流

3. fs.watch 会触发 rename 两次，不利于观察是 delete 还是 rename，所以使用了 chokidar

4. ts，export default xxx 还需要完善