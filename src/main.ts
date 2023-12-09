#!/usr/bin/env node

/// Main entry
import path from 'path';
import { Command } from 'commander';
import { init } from './commands/init';
import { newPost } from './commands/newPost';
import { delPost } from './commands/delPost';
import { Hyx } from './hyxa';
import { die } from './utils';
import { listPosts } from './commands/listPosts';
import { listCategories } from './commands/listCategories';
import { listTags } from './commands/listTags';
import { version } from '../package.json';

/* Setup error handlers */
process.addListener('uncaughtException', (error: Error): void => {
  die('Fatal error', error);
});
process.addListener('unhandledRejection', (reason: unknown): void => {
  die('Fatal promise', reason);
});

/* Setup program */
const program: Command = new Command();

program
  .name('hyxa')
  .description('A simple static blog renderer')
  .version(version);

program
  .command('init [dir]')
  .description('initialize a folder for Hyx')
  .action((dir?: string): void => {
    init(path.resolve(dir ?? '.'));
  });

program
  .command('+post <name>')
  .description('create new post')
  .action((name: string): void => {
    newPost(name);
  });

program
  .command('~post <ID>')
  .description('delete existed post')
  .option('-h, --hard', 'hard delete')
  .action((id: string, opts: any): void => {
    delPost(id, opts.hard ?? false);
  });

program
  .command('?post')
  .description('list posts')
  .option('-p, --page <page>', 'page')
  .action((opts: any): void => {
    listPosts(opts.page);
  });

program
  .command('?category')
  .description('list categories')
  .action((): void => {
    listCategories();
  });

program
  .command('?tag')
  .description('list tags')
  .action((): void => {
    listTags();
  });

program
  .command('generate')
  .description('generate site')
  .action((): void => {
    const context: Hyx = new Hyx();
    context.generateAll();
  });

/* Parse command */
program.parse();
