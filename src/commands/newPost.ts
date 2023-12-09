/// Create new post command
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import moment from 'moment';
import { die } from '../utils';
import { Config } from '../hyxa/config';

export function newPost(name: string): void {
  // Check config
  if (!Config.isExists()) {
    die('Config not exists');
  }

  // Check name
  if (name.length < 1) {
    die('Name CANNOT be empty');
  }

  // Get post dir
  const postDir: string = path.resolve(process.cwd(), './posts/');

  // Scan post dir
  const nameReg: RegExp = new RegExp(`^([1-9]\d*)_(.*?)\\.md$`);
  let maxId: number;
  try {
    const ls: number[] = fs
      .readdirSync(postDir, { withFileTypes: true })
      .filter(
        (value: fs.Dirent): boolean =>
          value.isFile() && nameReg.test(value.name)
      )
      .map((value: fs.Dirent): number =>
        parseInt(nameReg.exec(value.name)?.[1] as string)
      )
      .sort((a: number, b: number): number => b - a);
    maxId = ls[0] ?? 0;
  } catch (err: unknown) {
    die(`Fail to scan page dir: ${postDir}`, err);
  }

  // Create post with frontmatter
  const postPath: string = path.join(postDir, `./${maxId + 1}_${name}.md`);
  console.log(chalk.cyan('Creating new post: ' + postPath));
  try {
    fs.writeFileSync(
      postPath,
      `---
title: "${name}"
id: ${maxId + 1}
draft: true
published_at: ${moment().toISOString(true)}
category: uncategoried
tags:
  - untagged
---
`
    );
  } catch (err: unknown) {
    die('Fail to create post file', err);
  }

  // Print text
  console.log(chalk.green('Done'));
}
