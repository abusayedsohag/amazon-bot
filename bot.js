const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

async function downloadImage(url, filepath) {
    const file = fs.createWriteStream(filepath);
    https.get(url, response => response.pipe(file));
}

(async () => {
    const productUrl = 'https://www.amazon.com/dp/B0DYNRR8V9';
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(productUrl, { waitUntil: 'networkidle2' });

    const imageUrls = await page.$$eval('.imgTagWrapper img', imgs =>
        imgs.map(img => img.src)
    );

    console.log('Found Images:', imageUrls);

    imageUrls.forEach((url, index) => {
        downloadImage(url, `image_${index + 1}.jpg`);
    });

    await browser.close();
})();
