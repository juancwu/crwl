/// <reference types="node" />

import { AnyNode } from 'cheerio';
import { Browser } from 'puppeteer';
import { Cheerio } from 'cheerio';
import { EventEmitter } from 'events';
import { HTTPResponse } from 'puppeteer';
import { Page as Page_2 } from 'puppeteer';
import { WaitForOptions } from 'puppeteer';

declare class Page extends EventEmitter {
    protected _browser: Browser;
    protected _page: Page_2 | null;
    protected _options: PageOptions;
    protected _root: Cheerio<AnyNode> | null;
    protected _name: string;
    constructor(browser: Browser, options: PageOptions);
    get name(): string;
    get root(): Cheerio<AnyNode> | null;
    get html(): string | null;
    open(path: string, options?: WaitForOptions): Promise<HTTPResponse | null>;
    trimPage(schema?: Schema): Promise<string | null>;
    saveAs(filename: string, path?: string): Promise<void>;
}
export default Page;

export declare interface PageOptions {
    baseUrl: string;
    name?: string;
    schema?: Schema;
}

/**
 * Adding an exlucde array when there is an include array, does not do anything.
 */
export declare interface Schema {
    rootElement?: string;
    include?: string[];
    exclude?: string[];
}

export { }
