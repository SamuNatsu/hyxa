/// Hyx model
import path from 'path';
import fs from 'fs';
import { createSymLnk, isFileExists, isFolderExists } from '../utils';
import { Feed } from 'feed';
import moment from 'moment';
import { Collection } from './collection';
import { Config } from './config';
import chalk from 'chalk';
import { Post } from './post';
import pako from 'pako';

/* Export class */
export class Hyx {
  // Properties
  public baseDir: string;
  public postDir: string;
  public themeDir: string;
  public publicDir: string;
  public distDir: string;

  public configPath: string;
  public dbPath: string;

  public config: Config;
  public feed: Feed;

  public posts: Post[] = [];

  // Constructor
  public constructor(baseDir: string = process.cwd()) {
    // Get dirs
    this.baseDir = baseDir;
    this.postDir = path.join(baseDir, './posts/');
    this.themeDir = path.join(baseDir, './themes/');
    this.publicDir = path.join(baseDir, './public/');
    this.distDir = path.join(baseDir, './dist/');

    // Get paths
    this.configPath = path.join(baseDir, './config.yaml');
    this.dbPath = path.join(baseDir, './db.yaml');

    // Get config
    Config.path = this.configPath;
    if (!Config.isExists()) {
      throw Error('Config not exists');
    }
    this.config = Config.getInstance();

    // Update theme dir
    this.themeDir = path.join(this.themeDir, `./${this.config.theme}/`);
    if (!isFileExists(path.join(this.themeDir, './index.ejs'))) {
      throw Error('Theme not exists');
    }

    // Setup feed
    this.feed = new Feed({
      id: this.config.url,
      title: this.config.title,
      language: this.config.language,
      author: {
        name: this.config.author,
        link: this.config.url
      },
      link: this.config.url,
      description: this.config.description,
      copyright: `All rights reserved ${moment().year()}, ${this.config.author}`
    });

    // Read post dir
    fs.readdirSync(this.postDir, {
      encoding: 'utf-8',
      recursive: true
    }).forEach((value: string): void => {
      // Get real path
      const realPath: string = path.join(this.postDir, value);

      // Check file
      if (!isFileExists(realPath) || path.extname(realPath) !== '.md') {
        return;
      }

      // Read post
      this.posts.push(new Post(realPath));
    });
  }

  // Generate all
  public async generateAll(): Promise<void> {
    console.log(chalk.bold.cyan('Generating the whole site'));

    // Delete old distribution
    fs.rmSync(this.distDir, { force: true, recursive: true });

    // Generate posts
    for (const i of this.posts) {
      if (i.draft) {
        continue;
      }
      await i.render(this);
    }

    // Generate collections
    for (const [name, posts] of Object.entries(Post.categories)) {
      await new Collection(
        'category',
        name,
        this.config.categoyMap[name] ?? name,
        posts
      ).render(this);
    }

    // Generate tags
    for (const [name, posts] of Object.entries(Post.tags)) {
      await new Collection(
        'tag',
        name,
        this.config.tagMap[name] ?? name,
        posts
      ).render(this);
    }

    // Generate index
    await new Collection(null, '', '', this.posts).render(this);

    // Generate feed
    console.log(chalk.cyan('Rendering feeds'));
    this.posts.forEach((value: Post): void => {
      this.feed.addItem({
        title: value.title,
        id: value.route,
        link: this.config.url + value.route,
        date: new Date(),
        description: value.excerpt,
        published: value.publishedAt.toDate()
      });
    });
    for (const i of Object.keys(Post.categories)) {
      this.feed.addCategory(i);
    }
    fs.writeFileSync(path.join(this.distDir, './feed.xml'), this.feed.rss2());
    fs.writeFileSync(path.join(this.distDir, './atom.xml'), this.feed.atom1());
    console.log(chalk.green('Done'));

    // Generate sitemap
    this.generateSitemap();

    // Link public dirs
    createSymLnk(this.publicDir, this.distDir);

    // Link theme public dirs
    const themePublicDir: string = path.join(this.themeDir, './public/');
    if (isFolderExists(themePublicDir)) {
      createSymLnk(themePublicDir, this.distDir);
    }

    // Print text
    console.log(chalk.bold.green('Site generated'));
  }

  // Generate sitemap
  public generateSitemap(): void {
    console.log(chalk.cyan('Rendering sitemap'));

    // Create sitemap
    const sitemap: any = this.posts
      .filter((value: Post): boolean => !value.draft)
      .map((value: Post): any => ({
        title: value.title,
        url: this.config.url + value.route,
        category: value.category,
        tags: value.tags,
        excerpt: value.excerpt.length === 0 ? undefined : value.excerpt
      }));
    const rawStr: string = JSON.stringify(sitemap);

    // Compress data
    const compData: Uint8Array = pako.deflateRaw(rawStr, { level: 9 });

    // Write to file
    fs.writeFileSync(path.join(this.distDir, './sitemap.bin'), compData);

    // Print text
    console.log(chalk.gray(`  Raw size: ${rawStr.length}`));
    console.log(chalk.gray(`  Compressed size: ${compData.length}`));
    console.log(chalk.green('Done'));
  }
}
