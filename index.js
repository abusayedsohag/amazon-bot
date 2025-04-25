const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/get-images', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.includes('amazon')) {
        return res.status(400).json({ error: 'Invalid or missing Amazon URL' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Vercel-specific configuration
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Try to scrape image URLs
        const imageUrls = await page.$$eval('.imgTagWrapper img', imgs =>
            imgs.map(img => img.src)
        );

        await browser.close();
        res.json({ images: imageUrls });
    } catch (err) {
        console.error('Error scraping:', err);
        res.status(500).json({ error: 'Scraping failed' });
    }
});

module.exports = app;