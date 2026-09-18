import puppeteer from 'puppeteer';

async function checkTabs() {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });

    const pages = await browser.pages();
    console.log(`Found ${pages.length} open pages:`);
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const title = await p.title();
      const url = p.url();
      console.log(`[${i}] "${title}" -> ${url}`);
    }

    await browser.disconnect();
  } catch (err) {
    console.error('Error connecting to Chrome:', err);
  }
}

checkTabs();
