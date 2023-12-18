/// List posts command
import { Hyx } from '../hyxa';
import lodash from 'lodash';
import { Post } from '../hyxa/post';
import { die } from '../utils';
import chalk from 'chalk';

export function listPosts(page?: string): void {
  // Check page
  if (!/^[1-9]\d*$/.test(page ?? '1')) {
    die('Invalid page, MUST be an integer greater than 0');
  }
  const pg: number = parseInt(page ?? '1');

  // Pagination
  const context: Hyx = new Hyx();
  const pages: Post[][] = lodash.chunk(context.posts, context.config.perPage);
  if (pg > pages.length) {
    die(`Page exceeded, ${pages.length} page(s) in total`);
  }

  // Print data
  for (const i of pages[pg - 1]) {
    console.log(
      chalk.bold.cyan(`[[ ${i.title} ]]`),
      i.draft ? chalk.yellow('*') : ''
    );
    console.log(chalk.bold('Route:'), i.route);
    console.log(chalk.bold('Path:'), i.path);
    console.log(chalk.bold('Published at:'), i.publishedAt.toISOString(true));
    if (i.template !== undefined) {
      console.log(chalk.bold('Template:'), i.template);
    }
    if (i.category !== undefined) {
      console.log(chalk.bold('Category:'), i.category);
    }
    console.log(chalk.bold('Feed:'), i.feed);
    console.log(chalk.bold('Excerpt:'), i.excerpt);
    console.log('');
  }
}
