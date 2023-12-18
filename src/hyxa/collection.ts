/// Collection model
import EventEmitter from 'events';
import { Post } from './post';
import { Hyx } from '.';
import chalk from 'chalk';
import path from 'path';
import { isFileExists } from '../utils';
import lodash from 'lodash';
import ejs from 'ejs';
import fs from 'fs';

/* Export class */
export class Collection extends EventEmitter {
  // Properties
  public type: string | null;
  public mapName: string;
  public name: string;
  public posts: Post[];

  public prefix: string;
  public template?: string;

  // Constructor
  public constructor(
    type: string | null,
    name: string,
    mapName: string,
    posts: Post[]
  ) {
    super();

    // Assign data
    this.type = type;
    this.name = name;
    this.mapName = mapName;
    this.posts = posts;

    // Generate prefix
    if (this.type === null) {
      this.prefix = '';
    } else {
      this.prefix = `/${this.type}/${this.mapName}`;
    }
  }

  // Render
  public async render(context: Hyx): Promise<void> {
    if (this.type !== null) {
      console.log(
        chalk.cyan(`Rendering collection: ${this.type} - ${this.name}`)
      );
    } else {
      console.log(chalk.cyan('Rendering index'));
    }

    // Get template
    this.template = context.theme.getTemplate('collection');

    // Pagination
    const pages: Post[][] = lodash.chunk(this.posts, context.config.perPage);
    for (let i = 0; i < pages.length; i++) {
      // Create rendering object
      console.log(chalk.gray(`  Rendering page ${i + 1}/${pages.length}`));
      const tmp: any = {
        context,
        curPage: i + 1,
        totalPage: pages.length,
        collection: this,
        posts: pages[i],
        routes:
          i === 0
            ? [`${this.prefix}/index.html`, `${this.prefix}/page/1/index.html`]
            : [`${this.prefix}/page/${i + 1}/index.html`]
      };

      // Render to HTML
      this.emit('before-render', tmp);
      tmp.html = await ejs.renderFile(this.template, tmp);
      this.emit('after-render', tmp);

      // Before write
      tmp.outputs = tmp.routes.map((value: string): string =>
        path.join(context.distDir, '.' + value)
      );
      this.emit('before-write', tmp);

      // Write to file
      for (const j of tmp.outputs) {
        fs.mkdirSync(path.dirname(j), { recursive: true });
        fs.writeFileSync(j, tmp.html);
      }

      // After write
      console.log(chalk.green('  Done'));
      this.emit('after-write', tmp);
    }
  }
}
