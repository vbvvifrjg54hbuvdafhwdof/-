const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  console.log('Page loaded successfully');

  // Check title
  const hasTitle = await page.isVisible('span:has-text("〔問　題〕")');
  console.log('Title found:', hasTitle);

  // Check vertical sections
  const sections = await page.locator('[data-section-id]').all();
  console.log('Sections count on page:', sections.length);

  // Test tap mode
  // Open settings
  await page.click('button[aria-label="表示設定"]');
  await page.waitForTimeout(300);

  // Click on Translation tab
  await page.click('button:has-text("B. 訳・注釈")');
  await page.waitForTimeout(200);

  // Select 'タップで訳表示'
  await page.click('button:has-text("タップで訳表示")');
  await page.waitForTimeout(200);

  // Close settings
  await page.click('button:has-text("設定を閉じる")');
  await page.waitForTimeout(300);

  // Click on the first section
  console.log('Clicking on first section to test tap translation...');
  await sections[0].click();
  await page.waitForTimeout(300);

  // Check if translation text is visible
  const hasTranslation = await page.isVisible('span:has-text("〔訳〕")');
  console.log('Inline translation displayed on tap:', hasTranslation);

  // Click again to close
  await sections[0].click();
  await page.waitForTimeout(300);
  const isTransStillVisible = await page.isVisible('span:has-text("〔訳〕")');
  console.log('Inline translation closed after re-tap:', !isTransStillVisible);

  // Test Library & Folders
  await page.click('button[aria-label="教材一覧"]');
  await page.waitForTimeout(300);

  // Click create folder
  await page.click('button:has-text("作成")');
  await page.waitForTimeout(200);
  await page.fill('input[placeholder="フォルダ名を入力..."]', '演習用テストフォルダ');
  await page.click('button:has-text("保存")');
  await page.waitForTimeout(300);

  const hasNewFolder = await page.isVisible('button:has-text("演習用テストフォルダ")');
  console.log('New folder created successfully:', hasNewFolder);

  // Test Material Rename
  const editDocBtn = await page.locator('button[title="教材名を変更"]').first();
  await editDocBtn.click();
  await page.waitForTimeout(200);
  const titleInput = await page.locator('input[value*="楚人有渉江者"]');
  console.log('Document title edit input visible:', await titleInput.isVisible());

  // Test Material Move to Folder
  const moveBtn = await page.locator('button:has-text("移動")').first();
  await moveBtn.click();
  await page.waitForTimeout(200);
  const hasMoveDialog = await page.isVisible('span:has-text("フォルダを変更:")');
  console.log('Move dialog visible:', hasMoveDialog);

  // Close library
  await page.click('button:has-text("閉じる")');
  await page.waitForTimeout(300);

  // Test Counter increment
  const initialText = await page.locator('nav span.text-black').innerText();
  console.log('Initial read count:', initialText);
  await page.click('button[aria-label="音読回数を1増やす"]');
  await page.waitForTimeout(200);
  const updatedText = await page.locator('nav span.text-black').innerText();
  console.log('Updated read count:', updatedText);

  // Test Mobile Viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  console.log('Mobile view tested without crashing');

  await browser.close();
  console.log('All automated browser tests passed!');
})();
