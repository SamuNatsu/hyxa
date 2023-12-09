/// Post model
import joi from 'joi';
import EventEmitter from 'events';
import moment from 'moment';
import fs from 'fs';
import YAML from 'yaml';
import crypto from 'crypto';
import { Hyx } from '.';
import chalk from 'chalk';
import { marked } from 'marked';
import ejs from 'ejs';
import path from 'path';
import { isFileExists } from '../utils';

/* Schemas */
const fmSchema: joi.ObjectSchema = joi
  .object({
    title: joi.string().required(),
    slug: joi.string(),
    id: joi.number().integer().min(1),
    draft: joi.boolean().required(),
    published_at: joi.string().isoDate().required(),
    template: joi.string(),
    feed: joi.boolean().default(true),
    category: joi.string(),
    tags: joi.array().default([]).items(joi.string()),
    fields: joi.object().default({}).unknown(),
    excerpt: joi.string().default('')
  })
  .xor('slug', 'id');

/* Export class */
export class Post extends EventEmitter {
  // Static properties
  public static categories: Record<string, Post[]> = {};
  public static tags: Record<string, Post[]> = {};

  // Properties
  public path: string;
  public route: string;

  public title: string;
  public slug?: string;
  public id?: number;
  public draft: boolean;
  public publishedAt: moment.Moment;
  public template?: string;
  public feed: boolean;
  public category?: string;
  public tags: string[];
  public fields: Record<string, any>;
  public excerpt: string;
  public contents: string;
  public sha256: string;

  public html?: string;
  public output?: string;

  // Constructor
  public constructor(filePath: string) {
    super();

    // Store path
    this.path = filePath;

    // Read file
    const rawStr: string = fs.readFileSync(filePath, 'utf-8');

    // Get frontmatter
    const fmRegExp: RegExp = /^---\n(.*?)\n---\n(.*)$/s;
    const result: RegExpExecArray | null = fmRegExp.exec(rawStr);
    if (result === null) {
      throw Error('Frontmatter not found');
    }

    // Parse frontmatter
    const fm: any = YAML.parse(result[1]);

    // Validate frontmatter
    const { error, value } = fmSchema.validate(fm);
    if (error !== undefined) {
      throw error;
    }

    // Assign data
    this.title = value.title;
    this.slug = value.slug;
    this.id = value.id;
    this.draft = value.draft;
    this.publishedAt = moment(value.published_at);
    this.template = value.template;
    this.feed = value.feed;
    this.category = value.category;
    this.tags = value.tags;
    this.fields = value.fields;
    this.excerpt = value.excerpt;
    this.contents = result[2].trim();

    // Generate SHA256
    const SHA256: crypto.Hash = crypto.createHash('sha256');
    SHA256.update(this.contents);
    this.sha256 = SHA256.digest('hex');

    // Generate route
    if (this.slug !== undefined) {
      this.route = `/${this.slug}.html`;
    } else {
      this.route = `/archive/${this.id}/index.html`;
    }

    // Update category
    if (!this.draft && this.category !== undefined) {
      if (Post.categories[this.category] === undefined) {
        Post.categories[this.category] = [];
      }
      Post.categories[this.category].push(this);
    }

    // Update tags
    if (this.draft) {
      return;
    }
    this.tags.forEach((value: string): void => {
      if (Post.tags[value] === undefined) {
        Post.tags[value] = [];
      }
      Post.tags[value].push(this);
    });
  }

  // Render
  public async render(context: Hyx): Promise<void> {
    console.log(chalk.cyan(`Rendering post: ${this.path}`));

    // Get template
    this.template = path.join(
      context.themeDir,
      `./${this.template ?? 'post'}.ejs`
    );
    if (!isFileExists(this.template)) {
      console.warn(
        chalk.yellow(`  Render template not found: ${this.template}`)
      );
      this.template = path.join(context.themeDir, './index.ejs');
    }

    // Render to HTML
    this.emit('before-render', this);
    this.html = await marked(this.contents);
    this.html = await ejs.renderFile(this.template, { context, post: this });
    this.emit('after-render', this);

    // Before write
    this.output = path.join(context.distDir, '.' + this.route);
    this.emit('before-write', this);

    // Write to file
    fs.mkdirSync(path.dirname(this.output), { recursive: true });
    fs.writeFileSync(this.output, this.html);

    // After write
    console.log(chalk.green('Done'));
    this.emit('after-write', this);
  }
}
