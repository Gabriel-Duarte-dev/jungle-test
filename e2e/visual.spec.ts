import { expect, login, test } from './fixtures'

test.describe('regressão visual', () => {
  test('início, detalhe, carrinho e pagamento', async ({ page }) => {
    await page.addStyleTag({
      content: '.fixed.right-4.z-40 { visibility: hidden !important; }',
    })

    await page.goto('/')
    await expect(page.getByRole('heading', { name: /seja dono/i })).toBeVisible()
    await expect(page).toHaveScreenshot('inicio.png', { fullPage: true })

    await page.goto('/nfts/emerald-ape-042')
    await expect(page.getByRole('heading', { name: /Emerald Ape/ })).toBeVisible()
    await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true })

    await login(page, 'ana')
    await page.goto('/carrinho')
    await expect(page.getByRole('link', { name: 'Conectar e finalizar' })).toBeVisible()
    await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true })

    await page.goto('/pagamento')
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeVisible()
    await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true })
  })
})
