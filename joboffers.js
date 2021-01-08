const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto("https://www.naukri.com/software-engineer-jobs", { waitUntil: 'networkidle0' });
    await autoScroll(page);
    await page.waitForTimeout(7000)

    const content = await page.content();

    const $ = cheerio.load(content);
    const jobs = $('article.jobTuple');

    jobs.each((i, element) => {
        const job = $(element);
        
        console.log('Job Offer:', job.find('.jobTupleHeader > div > a.title').text());
    })
    await browser.close();
})();