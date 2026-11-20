import { test, expect } from '@playwright/test';

const DUMMY_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF\n'
);

const DUMMY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

test.describe('PDF Tools Web Application', () => {
  test('Home page renders hero, branding, and all 7 tool cards in English', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle(/PDF Tools/);
    await expect(page.locator('h1').first()).toContainText('Fix Every PDF Problem in Seconds');

    const toolLinks = [
      '/en/compress',
      '/en/merge',
      '/en/split',
      '/en/jpg-to-pdf',
      '/en/pdf-to-jpg',
      '/en/protect',
      '/en/unlock',
    ];

    for (const link of toolLinks) {
      await expect(page.locator(`a[href="${link}"]`).first()).toBeVisible();
    }
  });

  test('Bilingual toggle switches between English and Bangla', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('h1').first()).toContainText('Fix Every PDF Problem in Seconds');

    // Switch to Bangla
    await page.click('button[aria-label="Switch to Bangla"]');
    await expect(page).toHaveURL(/\/bn/);
    await expect(page.locator('h1').first()).toContainText('মুহূর্তেই সমাধান করুন যেকোনো পিডিএফ সমস্যা');

    // Switch back to English
    await page.click('button[aria-label="Switch to English"]');
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator('h1').first()).toContainText('Fix Every PDF Problem in Seconds');
  });

  test('Dark mode toggle toggles dark class on html element', async ({ page }) => {
    await page.goto('/en');
    const themeBtn = page.locator('button[aria-label="Toggle dark/light theme"]');
    await expect(themeBtn).toBeVisible();

    const isInitiallyDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await themeBtn.click();
    const isNowDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isNowDark).toBe(!isInitiallyDark);
  });

  test('Compress PDF tool page renders UI, upload, levels, guide, and FAQs', async ({ page }) => {
    await page.goto('/en/compress');
    await expect(page.locator('h1').first()).toContainText('Compress PDF');
    await expect(page.getByText('How to Use in 3 Easy Steps')).toBeVisible();
    await expect(page.getByText('Frequently Asked Questions')).toBeVisible();

    // Upload a test PDF to reveal options
    await page.locator('input[type="file"]').setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: DUMMY_PDF,
    });

    await expect(page.getByRole('button', { name: /Extreme/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Recommended/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Low/ })).toBeVisible();
  });

  test('Merge PDF tool page renders UI, upload, and guide', async ({ page }) => {
    await page.goto('/en/merge');
    await expect(page.locator('h1').first()).toContainText('Merge PDF');
    await expect(page.locator('input[type="file"]')).toBeAttached();
    await expect(page.getByText('How to Use in 3 Easy Steps')).toBeVisible();
  });

  test('Split PDF tool page renders UI, upload, and guide', async ({ page }) => {
    await page.goto('/en/split');
    await expect(page.locator('h1').first()).toContainText('Split PDF');
    await expect(page.locator('input[type="file"]')).toBeAttached();
    await expect(page.getByText('How to Use in 3 Easy Steps')).toBeVisible();
  });

  test('JPG to PDF tool page renders page size and orientation options on upload', async ({ page }) => {
    await page.goto('/en/jpg-to-pdf');
    await expect(page.locator('h1').first()).toContainText('JPG to PDF');
    await expect(page.getByText('How to Use in 3 Easy Steps')).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({
      name: 'image.png',
      mimeType: 'image/png',
      buffer: DUMMY_PNG,
    });

    await expect(page.getByRole('button', { name: /A4/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Fit to Image/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Portrait/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Landscape/ })).toBeVisible();
  });

  test('PDF to JPG tool page renders DPI and quality selectors on upload', async ({ page }) => {
    await page.goto('/en/pdf-to-jpg');
    await expect(page.locator('h1').first()).toContainText('PDF to JPG');
    await expect(page.getByText('How to Use in 3 Easy Steps')).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: DUMMY_PDF,
    });

    await expect(page.getByRole('button', { name: /150 DPI/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /300 DPI/ })).toBeVisible();
  });

  test('Protect PDF tool page renders password inputs and AES-256 notice on upload', async ({ page }) => {
    await page.goto('/en/protect');
    await expect(page.locator('h1').first()).toContainText('Protect PDF');
    await expect(page.getByText('How to Use in 3 Easy Steps')).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: DUMMY_PDF,
    });

    await expect(page.locator('input[placeholder="Enter a strong password"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Re-enter password"]')).toBeVisible();
  });

  test('Unlock PDF tool page renders password input and authorization disclaimer on upload', async ({ page }) => {
    await page.goto('/en/unlock');
    await expect(page.locator('h1').first()).toContainText('Unlock PDF');
    await expect(page.getByText('Authorized Use Only')).toBeVisible();
    await expect(page.getByText('How to Use in 3 Easy Steps')).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: DUMMY_PDF,
    });

    await expect(page.locator('input[placeholder="Enter the document password"]')).toBeVisible();
  });

  test('Static info pages and Pricing page render properly', async ({ page }) => {
    // Privacy
    await page.goto('/en/privacy');
    await expect(page.locator('h1').first()).toContainText('Privacy');
    await expect(page.getByText('Automatic 15-Minute File Deletion')).toBeVisible();

    // Terms
    await page.goto('/en/terms');
    await expect(page.locator('h1').first()).toContainText('Terms of Service');

    // Pricing
    await page.goto('/en/pricing');
    await expect(page.locator('h1').first()).toContainText('Supercharge Your PDF Workflow');
    await expect(page.getByText('200MB')).toBeVisible();
    await expect(page.getByText('Zero advertisements')).toBeVisible();
  });

  test('Cookie consent banner is interactive', async ({ page }) => {
    await page.goto('/en');
    const acceptBtn = page.getByRole('button', { name: 'Accept All' });
    await expect(acceptBtn).toBeVisible({ timeout: 5000 });
    await acceptBtn.click();
    await expect(acceptBtn).not.toBeVisible();

    const consentVal = await page.evaluate(() => localStorage.getItem('pdf_tool_cookie_consent'));
    expect(consentVal).toBe('accepted');
  });
});
