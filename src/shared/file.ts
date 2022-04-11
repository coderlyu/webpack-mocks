import fs from 'fs';
export function saveFile(filePath: string, content: string) {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFileSync(filePath, content);
      resolve('success');
    } catch (error) {
      reject(error);
    }
  });
}
