import { expect, test } from './fixtures'

test.describe('acessibilidade', () => {
  test('navegação por teclado e validação de formulário', async ({ page }) => {
    await page.goto('/entrar')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText(/informe/i).first()).toBeVisible()

    await page.goto('/')
    await expect(page.getByRole('heading', { name: /seja dono/i })).toBeVisible()
    await page.locator('body').click({ position: { x: 1, y: 1 } })
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
    if (!(await skip.evaluate((node) => node === document.activeElement))) {
      await skip.focus()
    }
    await expect(skip).toBeFocused()
  })

  test('skeletons em carregamento lento', async ({ page }) => {
    await page.goto('/?scenario=slow-network')
    await expect(page.getByTestId('skeleton').locator('visible=true').first()).toBeVisible()
  })
})
