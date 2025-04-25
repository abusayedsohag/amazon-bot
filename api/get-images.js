import puppeteer from 'puppeteer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;
    if (!url || !url.includes('amazon')) {
        return res.status(400).json({ error: 'Invalid or missing Amazon URL' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const images = await page.$$eval('.imgTagWrapper img', imgs =>
            imgs.map(img => img.src)
        );

        await browser.close();
        res.status(200).json({ images });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Scraping failed' });
    }
}
