const { chromium, devices } = require('playwright');
const fs = require('fs');
const readline = require('readline');
const Axios = require('axios')

async function downloadImage(url, filepath) {
    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath)); 
    });
}

const main = async () => {
  // Setup - launch browser with visible window
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const fileStream = fs.createReadStream('allLinks.txt');
    const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    console.log(`Processing: ${line}`);
    await page.goto(line);
    await page.waitForTimeout(2000); 
    const link = await page.$('body > link:nth-child(3)');
  if (link) {
    console.log('Link found:', await link.getAttribute('href'));
    const imageUrl = await link.getAttribute('href');
    const filename = line.split('/').pop() + '.png';
    await downloadImage(imageUrl, `./images/${filename}`);
    console.log(`Image saved as ${filename}`);
  } else {
    console.log('Link not found');
  }
  }


};

main();