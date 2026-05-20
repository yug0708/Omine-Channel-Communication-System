import { test, expect } from '@playwright/test';

test.describe('Functional Flow', () => {

    // Reset state before each test
    test.beforeEach(async ({ page }) => {
        // Increase timeout for the whole flow
        test.setTimeout(60000);

        // Navigate to login to Ensure we are in the app context
        await page.goto('/login');
        // Clear localStorage to reset auth state
        await page.evaluate(() => localStorage.clear());
    });

    test('Public route redirection', async ({ page }) => {
        await page.goto('/');
        // Should redirect to login
        await expect(page).toHaveURL(/.*\/login/);
    });

    test('Complete Registration and Login Flow', async ({ page }) => {
        // 1. Go to Register
        await page.goto('/register');
        await expect(page).toHaveURL(/.*\/register/);

        // 2. Fill Step 1
        await page.fill('input[name="firstName"]', 'John');
        await page.fill('input[name="lastName"]', 'Doe');
        await page.fill('input[name="email"]', 'john.doe@functional.test');
        await page.fill('input[name="phone"]', '1234567890');
        await page.fill('input[name="password"]', 'password123');

        // Click Next
        // Using getByRole for better accessibility matching
        await page.getByRole('button', { name: 'Next' }).click();

        // 3. Fill Step 2
        // Wait for organizationName input to be visible (Step 2 transition)
        const orgInput = page.locator('input[name="organizationName"]');
        await expect(orgInput).toBeVisible({ timeout: 10000 });

        await orgInput.fill('Test Corp');
        await page.fill('input[name="crNumber"]', 'CR99999');
        await page.fill('input[name="website"]', 'https://testcorp.com');
        // Select dropdowns
        await page.selectOption('select[name="industry"]', 'Technology');
        await page.selectOption('select[name="companySize"]', '11-50');

        // Click Save
        await page.getByRole('button', { name: 'Save' }).click();

        // 4. Expect Redirection to Login
        await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });

        // 5. Login with new account
        await page.fill('input[name="email"]', 'john.doe@functional.test');
        await page.fill('input[name="password"]', 'password123');
        await page.getByRole('button', { name: 'Sign in' }).click();

        // 6. Verify Dashboard Access
        await expect(page).toHaveURL(/.*\/dashboard/);
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });

    test('Protected Route Access Denied', async ({ page }) => {
        // Try to access dashboard directly without login
        await page.goto('/dashboard');
        // Should be redirected to login
        await expect(page).toHaveURL(/.*\/login/);
    });

});
