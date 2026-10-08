import { expect, login, test } from './fixtures'

test.describe('compra', () => {
  test('fluxo completo até o recibo confirmado', async ({ page }) => {
    await login(page, 'ana')
    await page.goto('/carrinho')
    await page.getByRole('link', { name: 'Conectar e finalizar' }).click()
    await expect(page).toHaveURL(/pagamento/)

    await page.getByRole('radio', { name: /carteira principal/i }).click()
    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    await expect(page.getByText(/Pedido confirmado|Pagamento em andamento/)).toBeVisible({
      timeout: 25_000,
    })
    await expect(page.getByText('Pedido confirmado')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/KUR-/)).toBeVisible()
    await page.reload()
    await expect(page.getByText('Pedido confirmado')).toBeVisible()
  })
})

test.describe('pagamento recusado', () => {
  test.use({ scenario: 'payment-refused' })

  test('mostra recusa e mantém o carrinho', async ({ page }) => {
    await login(page, 'ana')
    await page.goto('/pagamento')
    await page.getByRole('radio', { name: /carteira principal/i }).click()
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.getByRole('heading', { name: 'Pagamento recusado' })).toBeVisible({
      timeout: 20_000,
    })
  })
})

test.describe('timeout de pedido', () => {
  test.use({ scenario: 'order-timeout' })

  test('recupera o mesmo pedido após timeout', async ({ page }) => {
    test.setTimeout(90_000)
    await login(page, 'ana')
    await page.goto('/pagamento')
    await page.getByRole('radio', { name: /carteira principal/i }).click()
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.getByText(/Pedido confirmado|Pagamento em andamento/)).toBeVisible({
      timeout: 60_000,
    })
  })
})
