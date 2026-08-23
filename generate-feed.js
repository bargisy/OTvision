const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const username = 'osamaeltawelvision';
  const url = `https://www.behance.net/${username}`;

  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for GitHub Actions
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.evaluate(async () => {
    window.scrollBy(0, 1500);
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  const projects = await page.evaluate(() => {
    const projectNodes = Array.from(document.querySelectorAll('a[href*="/gallery/"]'));
    const uniqueProjects = [];
    const seenUrls = new Set();

    projectNodes.forEach(node => {
      const link = node.href;
      if (seenUrls.has(link)) return; 
      
      const imgNode = node.querySelector('img');
      if (imgNode) {
        const title = imgNode.getAttribute('alt') || 'Untitled';
        const imgSrc = imgNode.getAttribute('src');

        if (imgSrc && !imgSrc.includes('data:image')) {
          seenUrls.add(link);
          uniqueProjects.push({ title, link, image: imgSrc });
        }
      }
    });
    return uniqueProjects;
  });

  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  fs.writeFileSync(path.join(publicDir, 'portfolio.json'), JSON.stringify(projects, null, 2));
  await browser.close();
})();
