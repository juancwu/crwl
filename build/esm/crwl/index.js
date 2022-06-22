import { EventEmitter } from "events";
import { access, writeFile } from "fs/promises";
import { join } from "path";
import { load as cheerioLoad } from "cheerio";
import { URL } from "url";
import mkdirp from "mkdirp";
import { nanoid } from "nanoid";
class Page extends EventEmitter {
    constructor(browser, options) {
        var _a;
        super();
        this._browser = browser;
        this._page = null;
        this._options = options;
        this._root = null;
        this._name = (_a = options.name) !== null && _a !== void 0 ? _a : "Page-" + nanoid(6);
    }
    get name() {
        return this._name;
    }
    get root() {
        return this._root;
    }
    get html() {
        if (!this._root)
            return null;
        return this._root.html();
    }
    async open(path, options) {
        if (!this._page) {
            this._page = await this._browser.newPage();
        }
        const url = new URL(path, this._options.baseUrl);
        const res = await this._page.goto(url.href, options);
        return res;
    }
    async trimPage(schema = this._options.schema || {}) {
        var _a;
        if (!this._page)
            throw new Error("No page to trim.");
        // follow schema to trim the page down to the desired elements only
        const pageSource = await this._page.content();
        const $ = cheerioLoad(pageSource);
        // get the root element that we are going to include/exclude tags from
        const root = $((_a = schema.rootElement) !== null && _a !== void 0 ? _a : "html");
        if (root.length < 0) {
            throw new Error("Could not find root element as specified in schema in page: " +
                this._options.name);
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
            throw new Error("No root element acquired yet. Trim page to get root element, then save page.");
        }
        const html = this._root.html();
        if (html === null) {
            throw new Error("Could not get HTML string to save page.");
        }
        try {
            await access(path);
        }
        catch (error) {
            await mkdirp(path);
        }
        await writeFile(join(path, filename), html);
    }
}
export default Page;
//# sourceMappingURL=index.js.map