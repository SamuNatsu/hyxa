/// Utils module
import chalk from 'chalk';
import util from 'util';
import fs from 'fs';
import path from 'path';

export function die(msg: string, ...data: any[]): never {
  console.error(chalk.red(msg));
  data.forEach((value: any): void => {
    console.error(chalk.gray(util.inspect(value)));
  });
  process.exit(1);
}

export function isFolderExists(path: string): boolean {
  if (!fs.existsSync(path)) {
    return false;
  }
  if (!fs.statSync(path).isDirectory()) {
    return false;
  }
  return true;
}

export function isFileExists(path: string): boolean {
  if (!fs.existsSync(path)) {
    return false;
  }
  if (!fs.statSync(path).isFile()) {
    return false;
  }
  return true;
}

export function createSymLnk(from: string, to: string): void {
  fs.readdirSync(from).forEach((value: string): void => {
    const fromPath: string = path.join(from, value);
    const toPath: string = path.join(to, value);
    fs.symlinkSync(fromPath, toPath);
  });
}
