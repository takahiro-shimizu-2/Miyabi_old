import { chromium } from 'playwright';

const GIST_URL = 'https://gist.github.com/ShunsukeHayashi/c07ef6a7fd4fc6f5c89dea15bfaacd80';

(async () => {
  // ログイン済みのChromeプロファイルを使用
  const userDataDir = process.env.HOME + '/Library/Application Support/Google/Chrome';
  
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    channel: 'chrome',
    args: ['--profile-directory=Default'],
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  // Mediumのimportページにアクセス
  await page.goto('https://medium.com/p/import', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page title:', await page.title());
  
  // URLが書ける場所がない場合はログイン状態を確認
  const url = page.url();
  console.log('Current URL:', url);
  
  // ログインページにリダイレクトされた場合
  if (url.includes('signin') || url.includes('login')) {
    console.log('NOT_LOGGED_IN: Please log in to Medium first');
    await browser.close();
    process.exit(1);
  }
  
  // input フィールドを探す
  const input = await page.$('input[type="text"], input[type="url"], input[placeholder]');
  if (input) {
    await input.fill(GIST_URL);
    console.log('Filled URL input');
    
    // Import ボタンを押す
    const importBtn = await page.$('button:has-text("Import")');
    if (importBtn) {
      await importBtn.click();
      console.log('Clicked Import button');
      await page.waitForTimeout(5000);
      console.log('After import - URL:', page.url());
      console.log('After import - Title:', await page.title());
    } else {
      console.log('Import button not found, trying Enter key');
      await input.press('Enter');
      await page.waitForTimeout(5000);
      console.log('After Enter - URL:', page.url());
    }
  } else {
    console.log('No input field found. Taking screenshot...');
    await page.screenshot({ path: '/tmp/medium-import-screenshot.png' });
    console.log('Screenshot saved to /tmp/medium-import-screenshot.png');
  }
  
  // 最終状態のスクリーンショット
  await page.screenshot({ path: '/tmp/medium-result.png' });
  console.log('Result screenshot saved');
  
  // ブラウザは開いたまま（ユーザーが操作できるように）
  // await browser.close();
})();
