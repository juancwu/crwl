"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const cheerio_1 = require("cheerio");
const url_1 = require("url");
const mkdirp_1 = __importDefault(require("mkdirp"));
const nanoid_1 = require("nanoid");
class Page extends events_1.EventEmitter {
  constructor(browser, options) {
    var _a;
    super();
    this._browser = browser;
    this._page = null;
    this._options = options;
    this._root = null;
    this._name =
      (_a = options.name) !== null && _a !== void 0
        ? _a
        : "Page-" + (0, nanoid_1.nanoid)(6);
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
  async open(path, options) {
    if (!this._page) {
      this._page = await this._browser.newPage();
    }
    const url = new url_1.URL(path, this._options.baseUrl);
    const res = await this._page.goto(url.href, options);
    return res;
  }
  async trimPage(schema = this._options.schema || {}) {
    var _a;
    if (!this._page) throw new Error("No page to trim.");
    // follow schema to trim the page down to the desired elements only
    const pageSource = await this._page.content();
    const $ = (0, cheerio_1.load)(pageSource);
    // get the root element that we are going to include/exclude tags from
    const root = $(
      (_a = schema.rootElement) !== null && _a !== void 0 ? _a : "html"
    );
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
  async saveAs(filename, path = process.cwd()) {
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
      await (0, promises_1.access)(path);
    } catch (error) {
      await (0, mkdirp_1.default)(path);
    }
    await (0, promises_1.writeFile)((0, path_1.join)(path, filename), html);
  }
}
exports.default = Page;
module.exports = Page;
//# sourceMappingURL=index.js.map
