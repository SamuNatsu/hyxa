#!/usr/bin/env node
import t from"path";import{Command as e}from"commander";import i from"chalk";import o from"fs";import s from"yaml";import n from"util";import r from"moment";import a from"joi";import{Feed as l}from"feed";import c from"events";import h from"lodash";import g from"ejs";import d from"crypto";import{marked as p}from"marked";function m(t,...e){console.error(i.red(t)),e.forEach((t=>{console.error(i.gray(n.inspect(t)))})),process.exit(1)}function f(t){return!!o.existsSync(t)&&!!o.statSync(t).isDirectory()}function u(t){return!!o.existsSync(t)&&!!o.statSync(t).isFile()}function y(e,i){o.readdirSync(e).forEach((s=>{const n=t.join(e,s),r=t.join(i,s);o.symlinkSync(n,r)}))}function b(t,e){try{console.log(i.gray(`  Creating ${t} folder: ${e}`)),o.mkdirSync(e,{recursive:!0})}catch(i){m(`Fail to create ${t} folder: ${e}`,i)}}const w=a.object({title:a.string().required(),subtitle:a.string().default(""),description:a.string().default(""),keywords:a.string().default(""),author:a.string().required(),language:a.string().default("en"),timezone:a.string().default(Intl.DateTimeFormat().resolvedOptions().timeZone),url:a.string().uri().required(),per_page:a.number().integer().default(10).min(1),category_map:a.object().pattern(a.string(),a.string()),tag_map:a.object().pattern(a.string(),a.string()),theme:a.string().required(),theme_config:a.object().unknown()});class x{static path=t.join(process.cwd(),"./config.yaml");title;subtitle;description;keywords;author;language;timezone;url;perPage;categoyMap;tagMap;theme;themeConfig;static instance;constructor(){const t=o.readFileSync(x.path,"utf-8"),e=s.parse(t),{error:i,value:n}=w.validate(e);if(void 0!==i)throw i;this.title=n.title,this.subtitle=n.subtitle,this.description=n.description,this.keywords=n.keywords,this.author=n.author,this.language=n.language,this.timezone=n.timezone,this.url=n.url,this.perPage=n.per_page,this.categoyMap=n.category_map,this.tagMap=n.tag_map,this.theme=n.theme,this.themeConfig=n.theme_config}static getInstance(){return void 0===x.instance&&(x.instance=new x),x.instance}static isExists(){return u(x.path)}}class $ extends c{type;mapName;name;posts;prefix;template;constructor(t,e,i,o){super(),this.type=t,this.name=e,this.mapName=i,this.posts=o,null===this.type?this.prefix="":this.prefix=`/${this.type}/${this.mapName}`}async render(e){null!==this.type?console.log(i.cyan(`Rendering collection: ${this.type} - ${this.name}`)):console.log(i.cyan("Rendering index")),this.template=e.theme.getTemplate("collection");const s=h.chunk(this.posts,e.config.perPage);for(let n=0;n<s.length;n++){console.log(i.gray(`  Rendering page ${n+1}/${s.length}`));const r={context:e,curPage:n+1,totalPage:s.length,collection:this,posts:s[n],routes:0===n?[`${this.prefix}/index.html`,`${this.prefix}/page/1/index.html`]:[`${this.prefix}/page/${n+1}/index.html`]};this.emit("before-render",r),r.html=await g.renderFile(this.template,r),this.emit("after-render",r),r.outputs=r.routes.map((i=>t.join(e.distDir,"."+i))),this.emit("before-write",r);for(const e of r.outputs)o.mkdirSync(t.dirname(e),{recursive:!0}),o.writeFileSync(e,r.html);console.log(i.green("  Done")),this.emit("after-write",r)}}}const j=a.object({title:a.string().required(),slug:a.string(),id:a.number().integer().min(1),draft:a.boolean().required(),published_at:a.string().isoDate().required(),template:a.string(),feed:a.boolean().default(!0),category:a.string(),tags:a.array().default([]).items(a.string()),fields:a.object().default({}).unknown(),excerpt:a.string().default("")}).xor("slug","id");class D extends c{static categories={};static tags={};path;route;title;slug;id;draft;publishedAt;template;feed;category;tags;fields;excerpt;contents;sha256;html;output;constructor(t){super(),this.path=t;const e=o.readFileSync(t,"utf-8"),i=/^---\n(.*?)\n---\n(.*)$/s.exec(e);if(null===i)throw Error("Frontmatter not found");const n=s.parse(i[1]),{error:a,value:l}=j.validate(n);if(void 0!==a)throw a;this.title=l.title,this.slug=l.slug,this.id=l.id,this.draft=l.draft,this.publishedAt=r(l.published_at),this.template=l.template,this.feed=l.feed,this.category=l.category,this.tags=l.tags,this.fields=l.fields,this.excerpt=l.excerpt,this.contents=i[2].trim();const c=d.createHash("sha256");c.update(this.contents),this.sha256=c.digest("hex"),void 0!==this.slug?this.route=`/${this.slug}.html`:this.route=`/archive/${this.id}/index.html`,this.draft||void 0===this.category||(void 0===D.categories[this.category]&&(D.categories[this.category]=[]),D.categories[this.category].push(this)),this.draft||this.tags.forEach((t=>{void 0===D.tags[t]&&(D.tags[t]=[]),D.tags[t].push(this)}))}async render(e){console.log(i.cyan(`Rendering post: ${this.path}`)),this.template=e.theme.getTemplate(this.template??"post"),this.emit("before-render",this),this.html=await p(this.contents),this.html=await g.renderFile(this.template,{context:e,post:this}),this.emit("after-render",this),this.output=t.join(e.distDir,"."+this.route),this.emit("before-write",this),o.mkdirSync(t.dirname(this.output),{recursive:!0}),o.writeFileSync(this.output,this.html),console.log(i.green("  Done")),this.emit("after-write",this)}}const v=a.object({name:a.string().required(),version:a.string().pattern(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-.*)?$/).required(),author:a.string().required(),url:a.string().uri(),default_config:a.object().default({}).unknown()});class S{baseDir;publicDir;manifestPath;indexPath;name;version;author;url;defaultConfig;constructor(e){if(!f(e))throw Error("Theme not exists");if(this.baseDir=e,this.publicDir=t.join(e,"./public/"),this.manifestPath=t.join(e,"./manifest.yaml"),this.indexPath=t.join(e,"./index.ejs"),!u(this.manifestPath))throw Error("Theme manifest not found");const n=o.readFileSync(this.manifestPath,"utf-8"),r=s.parse(n),{error:a,value:l}=v.validate(r);if(void 0!==a)throw a;if(!u(this.indexPath))throw Error("Theme index template not found");this.name=l.name,this.version=l.version,this.author=l.author,this.url=l.url,this.defaultConfig=l.default_config,console.log(i.bold.italic.blueBright(`* Theme activated: ${this.name} (${this.version}) - ${this.author}${void 0===this.url?"":`(${this.url})`}`))}getTemplate(e){const o=t.join(this.baseDir,`./${e}.ejs`);return u(o)?o:(console.warn(i.yellow(`  Render template not found: ${e}`)),this.indexPath)}}class F{baseDir;postDir;publicDir;distDir;configPath;dbPath;config;theme;feed;posts=[];constructor(e=process.cwd()){if(this.baseDir=e,this.postDir=t.join(e,"./posts/"),this.publicDir=t.join(e,"./public/"),this.distDir=t.join(e,"./dist/"),this.configPath=t.join(e,"./config.yaml"),this.dbPath=t.join(e,"./db.yaml"),x.path=this.configPath,!x.isExists())throw Error("Config not exists");this.config=x.getInstance(),this.theme=new S(t.join(e,`./themes/${this.config.theme}/`)),this.config.themeConfig=h.merge(this.theme.defaultConfig,this.config.themeConfig),this.feed=new l({id:this.config.url,title:this.config.title,language:this.config.language,author:{name:this.config.author,link:this.config.url},link:this.config.url,description:this.config.description,copyright:`All rights reserved ${r().year()}, ${this.config.author}`}),o.readdirSync(this.postDir,{encoding:"utf-8",recursive:!0}).forEach((e=>{const i=t.join(this.postDir,e);u(i)&&".md"===t.extname(i)&&this.posts.push(new D(i))}))}async generateAll(){console.log(i.bold.cyan("Generating the whole site")),o.rmSync(this.distDir,{force:!0,recursive:!0});for(const t of this.posts)t.draft||await t.render(this);for(const[t,e]of Object.entries(D.categories))await new $("category",t,this.config.categoyMap[t]??t,e).render(this);for(const[t,e]of Object.entries(D.tags))await new $("tag",t,this.config.tagMap[t]??t,e).render(this);await new $(null,"","",this.posts).render(this),console.log(i.cyan("Rendering feeds")),this.posts.forEach((t=>{this.feed.addItem({title:t.title,id:t.route,link:this.config.url+t.route,date:new Date,description:t.excerpt,published:t.publishedAt.toDate()})}));for(const t of Object.keys(D.categories))this.feed.addCategory(t);o.writeFileSync(t.join(this.distDir,"./feed.xml"),this.feed.rss2()),o.writeFileSync(t.join(this.distDir,"./atom.xml"),this.feed.atom1()),console.log(i.green("  Done")),this.generateSiteDB(),y(this.publicDir,this.distDir),f(this.theme.publicDir)&&y(this.theme.publicDir,this.distDir),console.log(i.bold.green("Site generated"))}generateSiteDB(){console.log(i.cyan("Rendering site database"));const e=this.posts.filter((t=>!t.draft)).map((t=>({title:t.title,url:this.config.url+t.route,category:t.category,tags:t.tags,excerpt:0===t.excerpt.length?void 0:t.excerpt})));o.writeFileSync(t.join(this.distDir,"./sitedb.json"),JSON.stringify(e)),console.log(i.green("  Done"))}}process.addListener("uncaughtException",(t=>{m("Fatal error",t)})),process.addListener("unhandledRejection",(t=>{m("Fatal promise",t)}));const P=new e;P.name("hyxa").description("A simple static blog renderer").version("1.0.2"),P.command("init [dir]").description("initialize a folder for Hyxa").action((e=>{!function(e){console.log(i.cyan("Initializing folder: "+e)),f(e)&&(console.log(i.yellow("Directory already exists, please delete it first")),process.exit(1)),b("post",t.join(e,"./posts")),b("public",t.join(e,"./public")),b("theme",t.join(e,"./themes")),b("distribution",t.join(e,"./dist"));const n=t.join(e,"./config.yaml"),r={title:"Hello Hyx",author:"Hyx",language:"en",timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,url:"http://example.com",per_page:10,category_map:{},tag_map:{},theme:"default",theme_config:{}};try{console.log(i.gray(`  Creating config file: ${n}`)),o.writeFileSync(n,s.stringify(r))}catch(t){m(`Fail to create config file: ${n}`,t)}const a=t.join(e,"./db.yaml"),l={postCounter:0,postHash:{}};try{console.log(i.gray(`  Creating database file: ${a}`)),o.writeFileSync(a,s.stringify(l))}catch(t){m(`Fail to create database file: ${a}`,t)}console.log(i.green("Done"))}(t.resolve(e??"."))})),P.command("+post <name>").description("create new post").action((e=>{!function(e){x.isExists()||m("Config not exists"),e.length<1&&m("Name CANNOT be empty");const s=t.resolve(process.cwd(),"./posts/"),n=new RegExp("^([1-9]d*)_(.*?)\\.md$");let a;try{a=o.readdirSync(s,{withFileTypes:!0}).filter((t=>t.isFile()&&n.test(t.name))).map((t=>parseInt(n.exec(t.name)?.[1]))).sort(((t,e)=>e-t))[0]??0}catch(t){m(`Fail to scan page dir: ${s}`,t)}const l=t.join(s,`./${a+1}_${e}.md`);console.log(i.cyan("Creating new post: "+l));try{o.writeFileSync(l,`---\ntitle: "${e}"\nid: ${a+1}\ndraft: true\npublished_at: ${r().toISOString(!0)}\ncategory: uncategoried\ntags:\n  - untagged\n---\n`)}catch(t){m("Fail to create post file",t)}console.log(i.green("Done"))}(e)})),P.command("~post <ID>").description("delete existed post").action((e=>{!function(e,s){x.isExists()||m("Config not exists");const n=t.join(process.cwd(),"./posts/"),r=new RegExp(`^${e}_(.*?)\\.md$`);let a;try{const t=o.readdirSync(n,{withFileTypes:!0}).filter((t=>t.isFile()&&r.test(t.name)));0===t.length&&m("Post not found"),a=t[0].name}catch(t){m(`Fail to scan page dir: ${n}`,t)}const l=t.join(n,a);console.log(i.cyan(`Deleting post: ${l}`));try{s?(console.log(i.yellow("Post will be HARD deleted")),o.rmSync(l)):o.renameSync(l,t.join(n,`./_${a}`))}catch(t){m(`Fail to delete page: ${l}`,t)}console.log(i.green("Done"))}(e,!0)})),P.command("?post").description("list posts").option("-p, --page <page>","page").action((t=>{!function(t){/^[1-9]\d*$/.test(t??"1")||m("Invalid page, MUST be an integer greater than 0");const e=parseInt(t??"1"),o=new F,s=h.chunk(o.posts,o.config.perPage);e>s.length&&m(`Page exceeded, ${s.length} page(s) in total`);for(const t of s[e-1])console.log(i.bold.cyan(`[[ ${t.title} ]]`),t.draft?i.yellow("*"):""),console.log(i.bold("Route:"),t.route),console.log(i.bold("Path:"),t.path),console.log(i.bold("Published at:"),t.publishedAt.toISOString(!0)),void 0!==t.template&&console.log(i.bold("Template:"),t.template),void 0!==t.category&&console.log(i.bold("Category:"),t.category),console.log(i.bold("Feed:"),t.feed),console.log(i.bold("Excerpt:"),t.excerpt),console.log("")}(t.page)})),P.command("?category").description("list categories").action((()=>{!function(){new F;for(const[t,e]of Object.entries(D.categories)){console.log(i.bold.cyan(`[[ ${t} ]]`),`(${e.length})`);for(let t=0;t<e.length;t++)console.log(i.bold(`(${t+1})`),e[t].title,i.gray("->",e[t].path))}}()})),P.command("?tag").description("list tags").action((()=>{!function(){new F;for(const[t,e]of Object.entries(D.tags)){console.log(i.bold.cyan(`[[ ${t} ]]`),`(${e.length})`);for(let t=0;t<e.length;t++)console.log(i.bold(`(${t+1})`),e[t].title,i.gray("->",e[t].path))}}()})),P.command("generate").description("generate site").action((()=>{(new F).generateAll()})),P.parse();
