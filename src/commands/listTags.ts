/// List tags command
import chalk from 'chalk';
import { Hyx } from '../hyxa';
import { Post } from '../hyxa/post';

export function listTags(): void {
  // Print data
  new Hyx();
  for (const [name, posts] of Object.entries(Post.tags)) {
    console.log(chalk.bold.cyan(`[[ ${name} ]]`), `(${posts.length})`);
    for (let i = 0; i < posts.length; i++) {
      console.log(chalk.bold(`(${i + 1})`), posts[i].title, chalk.gray('->', posts[i].path));
    }
  }
}
