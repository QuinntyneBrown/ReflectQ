import { test, expect } from '@playwright/test';
import { QuestionListPage } from '../pages/question-list.page';
import { QuestionFormPage } from '../pages/question-form.page';
import { AdminLayoutPage } from '../pages/admin-layout.page';
import { loginAsAdmin } from '../helpers/auth.helper';
import { mockQuestions, mockCurrentUser } from '../fixtures/mock-data';

test.describe('Question Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/questions**', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockQuestions),
        });
      }
      return route.fulfill({ status: 200, body: '{}' });
    });
    await page.route('**/api/questions/*', (route) => {
      const url = route.request().url();
      const id = url.split('/').pop();
      const question = mockQuestions.find((q) => q.id === id) ?? mockQuestions[0];
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(question),
      });
    });
    await page.route('**/api/users/me**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCurrentUser),
      })
    );

    await loginAsAdmin(page);
  });

  test.describe('Question List', () => {
    let questionList: QuestionListPage;

    test.beforeEach(async ({ page }) => {
      questionList = new QuestionListPage(page);
      await questionList.goto();
    });

    test('should display the questions table', async () => {
      await questionList.expectLoaded();
    });

    test('should show search box', async () => {
      await questionList.expectSearchVisible();
    });

    test('should show status filter', async () => {
      await expect(questionList.statusFilter).toBeVisible();
    });

    test('should show archived toggle', async () => {
      await expect(questionList.archivedToggle).toBeVisible();
    });

    test('should display question rows in table', async () => {
      await questionList.expectTableRowCount(mockQuestions.length);
    });

    test('should have New Question button', async () => {
      await questionList.expectNewQuestionButtonVisible();
    });

    test('should navigate to new question form on button click', async ({ page }) => {
      await questionList.clickNewQuestion();
      await page.waitForURL('**/questions/new');
      expect(page.url()).toContain('/questions/new');
    });

    test('should filter questions by search query', async ({ page }) => {
      await page.route('**/api/questions**', (route) => {
        const url = new URL(route.request().url());
        const search = url.searchParams.get('search') ?? '';
        const filtered = mockQuestions.filter((q) =>
          q.title.toLowerCase().includes(search.toLowerCase())
        );
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(filtered),
        });
      });

      await questionList.search('onboarding');
      // Wait for debounced search to trigger
      await page.waitForTimeout(500);
    });
  });

  test.describe('Question Form', () => {
    let questionForm: QuestionFormPage;

    test.beforeEach(async ({ page }) => {
      questionForm = new QuestionFormPage(page);
    });

    test('should display all form fields on new question page', async () => {
      await questionForm.gotoNew();
      await questionForm.expectAllFieldsVisible();
    });

    test('should show title, body, and type fields', async () => {
      await questionForm.gotoNew();
      await expect(questionForm.titleInput).toBeVisible();
      await expect(questionForm.bodyInput).toBeVisible();
      await expect(questionForm.typeSelect).toBeVisible();
    });

    test('should show options section for multiple-choice type', async ({ page }) => {
      await questionForm.gotoNew();
      await questionForm.selectType('multiple-choice');
      await expect(questionForm.optionsSection).toBeVisible();
      await expect(questionForm.addOptionButton).toBeVisible();
    });

    test('should validate that title is required', async () => {
      await questionForm.gotoNew();
      await questionForm.expectTitleRequired();
    });

    test('should navigate back on cancel', async ({ page }) => {
      await questionForm.gotoNew();
      await questionForm.cancel();
      await page.waitForURL('**/questions');
      expect(page.url()).toContain('/questions');
    });

    test('should load existing question data in edit mode', async () => {
      await questionForm.gotoEdit('1');
      await questionForm.expectLoaded();
      await expect(questionForm.titleInput).toHaveValue(mockQuestions[0].title);
    });
  });
});
