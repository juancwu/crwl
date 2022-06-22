import { Browser, launch } from "puppeteer";
import { crwl } from "../../build";

class GooglePage extends crwl.Page {
  constructor(browser: Browser, options: crwl.PageOptions) {
    super(browser, options);

    this._name = "Google Page";
  }

  async search(query: string) {
    if (!this._page) {
      throw new Error("Goolge page not opened, cannot search.");
    }

    const element = await this._page?.$$("input[aria-label='Search']");
    if (element.length) {
      await element[0].type(query, {
        delay: 100,
      });
      await element[0].press("Enter");

      await this._page.waitForNavigation({
        waitUntil: "networkidle0",
      });

      await this._page.screenshot({
        path: "result.png",
      });
    } else {
      console.log("could not find element");
    }

    return query;
  }
}

// start scraping
(async () => {
  // create new browser first
  const browser = await launch({
    args: ["--no-sandbox"], // this is needed when running as root user
  });

  const googlePage = new GooglePage(browser, {
    baseUrl: "https://www.google.com",
    name: "Override name in constructor",
    schema: {
      rootElement: "body",
      include: [], // empty list means include everything
      exclude: [], // when include is defined, exclude has no use
    },
  });

  await googlePage.open("/", {
    waitUntil: "networkidle0",
  });

  await googlePage.trimPage();

  await googlePage.saveAs("google.html", "./examples/cjs");

  await browser.close();
})();
