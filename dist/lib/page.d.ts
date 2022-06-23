/// <reference types="node" />
import { Browser, HTTPResponse, Page as PuppeteerPage, WaitForOptions } from "puppeteer";
import { EventEmitter } from "events";
import { AnyNode, Cheerio } from "cheerio";
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
export interface PuppeteerBrowser extends Browser {
}
export declare class Page extends EventEmitter {
    protected _browser: PuppeteerBrowser;
    protected _page: PuppeteerPage | null;
    protected _options: PageOptions;
    protected _root: Cheerio<AnyNode> | null;
    protected _name: string;
    constructor(browser: Browser, options: PageOptions);
    get name(): string;
    get root(): Cheerio<import("domhandler").ChildNode> | null;
    get html(): string | null;
    open(path: string, options?: WaitForOptions): Promise<HTTPResponse | null>;
    trimPage(schema?: Schema): Promise<string | null>;
    saveAs(filename: string, path?: string): Promise<void>;
}
