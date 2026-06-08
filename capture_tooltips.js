import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });
  
  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/#/login');
  await page.waitForTimeout(2000); // wait for page load

  // Fill in static credentials
  console.log('Logging in...');
  await page.fill('input#email', 'yugshah82@gmail.com');
  await page.fill('input#password', 'Variance@2025');
  await page.click('button[type="submit"]');
  
  // Wait for login redirection
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('Login successful! Redirected to dashboard.');

  // Navigate to Account Details page
  console.log('Navigating to http://localhost:5173/#/accounts/acc1 ...');
  await page.goto('http://localhost:5173/#/accounts/acc1');
  await page.waitForTimeout(2000); // wait for page load

  // Check and force light mode initially
  const isDarkInitially = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
  });
  
  if (isDarkInitially) {
    console.log('Dark mode detected. Switching to light mode for the first screenshot...');
    const themeBtn = page.locator('button[aria-label^="Switch to"]').first();
    await themeBtn.click();
    await page.waitForTimeout(1000);
  }

  // Hover over the first circular green button
  console.log('Hovering over Add Note button in light mode...');
  const addNoteBtn = page.locator('button[title="Add Note"]').first();
  await addNoteBtn.hover();
  await page.waitForTimeout(1000);

  // Capture light theme tooltip
  const lightPath = 'C:\\Users\\QA\\.gemini\\antigravity-ide\\brain\\1475471d-0bd7-4d4a-9200-700e73bba240\\tooltip_light_theme_verified.png';
  await page.screenshot({ path: lightPath });
  console.log('Saved light mode screenshot.');

  // Toggle theme to dark mode
  console.log('Switching to dark mode...');
  const themeBtn = page.locator('button[aria-label^="Switch to"]').first();
  await themeBtn.click();
  await page.waitForTimeout(1000);

  // Hover again to show dark theme tooltip
  console.log('Hovering over Add Note button in dark mode...');
  // Move mouse away first to trigger mouseout, then hover again
  await page.mouse.move(0, 0);
  await page.waitForTimeout(500);
  await addNoteBtn.hover();
  await page.waitForTimeout(1000);

  // Capture dark theme tooltip
  const darkPath = 'C:\\Users\\QA\\.gemini\\antigravity-ide\\brain\\1475471d-0bd7-4d4a-9200-700e73bba240\\tooltip_dark_theme_verified.png';
  await page.screenshot({ path: darkPath });
  console.log('Saved dark mode screenshot.');

  await browser.close();
})();
