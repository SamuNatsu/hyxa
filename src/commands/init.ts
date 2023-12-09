/// Initialize command
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { die, isFolderExists } from '../utils';

function createFolder(name: string, path: string): void {
  try {
    console.log(chalk.gray(`  Creating ${name} folder: ${path}`));
    fs.mkdirSync(path, { recursive: true });
  } catch (err: unknown) {
    die(`Fail to create ${name} folder: ${path}`, err);
  }
}

export function init(dir: string): void {
  // Print text
  console.log(chalk.cyan('Initializing folder: ' + dir));

  // Check dir exists
  if (isFolderExists(dir)) {
    console.log(
      chalk.yellow('Directory already exists, please delete it first')
    );
    process.exit(1);
  }

  // Create post folder
  const postDir: string = path.join(dir, './posts');
  createFolder('post', postDir);

  // Create public folder
  const publicDir: string = path.join(dir, './public');
  createFolder('public', publicDir);

  // Create theme folder
  const themeDir: string = path.join(dir, './themes');
  createFolder('theme', themeDir);

  // Create dist folder
  const distDir: string = path.join(dir, './dist');
  createFolder('distribution', distDir);

  // Create config file
  const configPath: string = path.join(dir, './config.yaml');
  const defaultConfig: any = {
    title: 'Hello Hyx',
    author: 'Hyx',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    url: 'http://example.com',
    per_page: 10,
    category_map: {},
    tag_map: {},
    theme: 'default',
    theme_config: {}
  };
  try {
    console.log(chalk.gray(`  Creating config file: ${configPath}`));
    fs.writeFileSync(configPath, YAML.stringify(defaultConfig));
  } catch (err: unknown) {
    die(`Fail to create config file: ${configPath}`, err);
  }

  // Create database
  const dbPath: string = path.join(dir, './db.yaml');
  const defaultDb: any = {
    postCounter: 0,
    postHash: {}
  };
  try {
    console.log(chalk.gray(`  Creating database file: ${dbPath}`));
    fs.writeFileSync(dbPath, YAML.stringify(defaultDb));
  } catch (err: unknown) {
    die(`Fail to create database file: ${dbPath}`, err);
  }

  // Print text
  console.log(chalk.green('Done'));
}
