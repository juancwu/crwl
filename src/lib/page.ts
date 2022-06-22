import {
  Browser,
  HTTPResponse,
  Page as PuppeteerPage,
  WaitForOptions,
} from "puppeteer";
import { EventEmitter } from "events";
import { access, writeFile } from "fs/promises";
import { join } from "path";
import { AnyNode, Cheerio, load as cheerioLoad } from "cheerio";
import { URL } from "url";
import mkdirp from "mkdirp";
import { nanoid } from "nanoid";

/**
 * Adding an exlucde array when there is an include array, does not do anything.
 */
export interface Schema {
  rootElement?: string;
  include?: string[];
  exclude?: string[];
}

export interface PageOptions {
  baseUrl: string;
  name?: string;
  schema?: Schema;
}

export class Page extends EventEmitter {
  protected _browser: Browser;
  protected _page: PuppeteerPage | null;
  protected _options: PageOptions;
  protected _root: Cheerio<AnyNode> | null;
  protected _name: string;

  constructor(browser: Browser, options: PageOptions) {
    super();

    this._browser = browser;
    this._page = null;
    this._options = options;
    this._root = null;

    this._name = options.name ?? "Page-" + nanoid(6);
  }

  get name() {
    return this._name;
  }

  get root() {
    return this._root;
  }

  get html() {
    if (!this._root) return null;

    return this._root.html();
  }

  public async open(
    path: string,
    options?: WaitForOptions
  ): Promise<HTTPResponse | null> {
    if (!this._page) {
      this._page = await this._browser.newPage();
    }

    const url = new URL(path, this._options.baseUrl);

    const res = await this._page.goto(url.href, options);

    return res;
  }

  public async trimPage(
    schema: Schema = this._options.schema || {}
  ): Promise<string | null> {
    if (!this._page) throw new Error("No page to trim.");

    // follow schema to trim the page down to the desired elements only

    const pageSource = await this._page.content();
    const $ = cheerioLoad(pageSource);

    // get the root element that we are going to include/exclude tags from
    const root = $(schema.rootElement ?? "html");

    if (root.length < 0) {
      throw new Error(
        "Could not find root element as specified in schema in page: " +
          this._options.name
      );
    }

    if (schema.exclude && schema.exclude.length > 0) {
      for (let elSelector of schema.exclude) {
        root.remove(elSelector);
      }
    }

    this._root = root;

    if (schema.include && schema.include.length > 0) {
      // empty root to start including just the elements we want
      const newRoot = root.clone().empty();

      for (let elSelector of schema.include) {
        const currentElement = root.find(elSelector);

        newRoot.append(currentElement);
      }

      this._root = newRoot;
    }

    return this._root.html();
  }

  public async saveAs(filename: string, path: string = process.cwd()) {
    if (!this._root) {
      throw new Error(
        "No root element acquired yet. Trim page to get root element, then save page."
      );
    }
    const html = this._root.html();
    if (html === null) {
      throw new Error("Could not get HTML string to save page.");
    }

    try {
      await access(path);
    } catch (error) {
      await mkdirp(path);
    }

    await writeFile(join(path, filename), html);
  }
}
