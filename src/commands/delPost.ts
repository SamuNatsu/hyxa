/// Delete post command
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { die } from '../utils';
import { Config } from '../hyxa/config';

export function delPost(id: string, hard: boolean): void {
  // Check config
  if (!Config.isExists()) {
    die('Config not exists');
  }

  // Scan page dir
  const postDir: string = path.join(process.cwd(), './posts/');
  const nameReg: RegExp = new RegExp(`^${id}_(.*?)\\.md$`);
  let name: string;
  try {
    const ls: fs.Dirent[] = fs
      .readdirSync(postDir, { withFileTypes: true })
      .filter(
        (value: fs.Dirent): boolean =>
          value.isFile() && nameReg.test(value.name)
      );

    if (ls.length === 0) {
      die('Post not found');
    }
    name = ls[0].name;
  } catch (err: unknown) {
    die(`Fail to scan page dir: ${postDir}`, err);
  }

  // Remove page
  const postPath: string = path.join(postDir, name);
  console.log(chalk.cyan(`Deleting post: ${postPath}`));
  try {
    if (hard) {
      console.log(chalk.yellow('Post will be HARD deleted'));
      fs.rmSync(postPath);
    } else {
      fs.renameSync(postPath, path.join(postDir, `./_${name}`));
    }
  } catch (err: unknown) {
    die(`Fail to delete page: ${postPath}`, err);
  }

  // Print text
  console.log(chalk.green('Done'));
}
