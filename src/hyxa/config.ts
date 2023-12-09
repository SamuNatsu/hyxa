/// Config model
import joi from 'joi';
import fs from 'fs';
import YAML from 'yaml';
import path from 'path';
import { isFileExists } from '../utils';

/* Schemes */
const configSchema: joi.ObjectSchema = joi.object({
  title: joi.string().required(),
  subtitle: joi.string().default(''),
  description: joi.string().default(''),
  keywords: joi.string().default(''),
  author: joi.string().required(),
  language: joi.string().default('en'),
  timezone: joi.string().default(Intl.DateTimeFormat().resolvedOptions().timeZone),
  url: joi.string().uri().required(),
  per_page: joi.number().integer().default(10).min(1),
  category_map: joi.object().pattern(joi.string(), joi.string()),
  tag_map: joi.object().pattern(joi.string(), joi.string()),
  theme: joi.string().required(),
  theme_config: joi.object().unknown()
});

/* Export class */
export class Config {
  // Properties
  public static path: string = path.join(process.cwd(), './config.yaml');

  public title: string;
  public subtitle: string;
  public description: string;
  public keywords: string;
  public author: string;
  public language: string;
  public timezone: string;
  public url: string;
  public perPage: number;
  public categoyMap: Record<string, string>;
  public tagMap: Record<string, string>;
  public theme: string;
  public themeConfig: Record<string, any>;

  // Singleton
  private static instance: Config;
  private constructor() {
    // Read config file
    const rawStr: string = fs.readFileSync(Config.path, 'utf-8');

    // Parse config
    const config: any = YAML.parse(rawStr);

    // Validate config
    const { error, value } = configSchema.validate(config);
    if (error !== undefined) {
      throw error;
    }

    // Assign data
    this.title = value.title;
    this.subtitle = value.subtitle;
    this.description = value.description;
    this.keywords = value.keywords;
    this.author = value.author;
    this.language = value.language;
    this.timezone = value.timezone;
    this.url = value.url;
    this.perPage = value.per_page;
    this.categoyMap = value.category_map;
    this.tagMap = value.tag_map;
    this.theme = value.theme;
    this.themeConfig = value.theme_config;
  }
  public static getInstance(): Config {
    if (Config.instance === undefined) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  // Is exists
  public static isExists(): boolean {
    return isFileExists(Config.path);
  }
}
