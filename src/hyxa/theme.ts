/// Theme model
import chalk from 'chalk';
import { isFileExists, isFolderExists } from '../utils';
import path from 'path';
import joi from 'joi';
import fs from 'fs';
import YAML from 'yaml';

/* Schemas */
const manifestSchema: joi.ObjectSchema = joi.object({
  name: joi.string().required(),
  version: joi
    .string()
    .pattern(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-.*)?$/)
    .required(),
  author: joi.string().required(),
  url: joi.string().uri(),
  default_config: joi.object().default({}).unknown()
});

/* Export class */
export class Theme {
  // Properties
  public baseDir: string;
  public publicDir: string;
  public manifestPath: string;
  public indexPath: string;

  public name: string;
  public version: string;
  public author: string;
  public url?: string;
  public defaultConfig: Record<string, any>;

  // Constructor
  public constructor(baseDir: string) {
    // Check base dir
    if (!isFolderExists(baseDir)) {
      throw Error('Theme not exists');
    }

    // Set paths
    this.baseDir = baseDir;
    this.publicDir = path.join(baseDir, './public/');
    this.manifestPath = path.join(baseDir, './manifest.yaml');
    this.indexPath = path.join(baseDir, './index.ejs');

    // Check manifest
    if (!isFileExists(this.manifestPath)) {
      throw Error('Theme manifest not found');
    }

    // Read manifest
    const rawManifest: string = fs.readFileSync(this.manifestPath, 'utf-8');

    // Parse manifest
    const manifest: any = YAML.parse(rawManifest);

    // Validate manifest
    const { error, value } = manifestSchema.validate(manifest);
    if (error !== undefined) {
      throw error;
    }

    // Check index
    if (!isFileExists(this.indexPath)) {
      throw Error('Theme index template not found');
    }

    // Assign data
    this.name = value.name;
    this.version = value.version;
    this.author = value.author;
    this.url = value.url;
    this.defaultConfig = value.default_config;

    // Print text
    console.log(
      chalk.bold.italic.blueBright(
        `* Theme activated: ${this.name} (${this.version}) - ${this.author}${
          this.url === undefined ? '' : `(${this.url})`
        }`
      )
    );
  }

  // Get template
  public getTemplate(template: string): string {
    const ret: string = path.join(this.baseDir, `./${template}.ejs`);
    if (!isFileExists(ret)) {
      console.warn(chalk.yellow(`  Render template not found: ${template}`));
      return this.indexPath;
    }
    return ret;
  }
}
