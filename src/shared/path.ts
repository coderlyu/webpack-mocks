import path from 'path';
/**
 * 判断是否是相对路径
 * @param path
 * @returns
 */
export function isRelativePath(path: string) {
  return path.startsWith('.') || !path.startsWith('/');
}
/**
 * 修复相对路径
 * @param path
 * @returns
 */
export function relativePathFix(path: string) {
  return path.replace(/^(\.+\/)+/g, '');
}
/**
 * 获取绝对路径
 * @param _path
 * @param prefix
 * @returns
 */
export function absolutePath(_path: string, prefix: string) {
  if (!isRelativePath(_path)) return _path;
  return path.resolve(prefix, _path);
}
