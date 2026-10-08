import { expect, login, test, triggerNftEvent } from './fixtures'

test.describe('tempo real', () => {
  test('preço muda via socket durante o checkout', async ({ page }) => {
    await login(page, 'ana')
    await page.goto('/carrinho')
    await expect(page.getByRole('heading', { name: 'Resumo da carteira' })).toBeVisible()
    await triggerNftEvent(page, { nftId: 'emerald-ape-042', priceEth: '1.47' })
    await expect(page.getByText(/preço atualizado|1\.47/i).first()).toBeVisible()
  })
})

test.describe('eventos duplicados', () => {
  test.use({ scenario: 'duplicate-events' })

  test('ignora duplicatas e versões antigas', async ({ page }) => {
    await login(page, 'ana')
    await page.goto('/nfts/emerald-ape-042')
    await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
    await triggerNftEvent(page, { nftId: 'emerald-ape-042', priceEth: '1.33' })
    await expect(page.getByText(/1\.33/).first()).toBeVisible()
    await triggerNftEvent(page, { nftId: 'emerald-ape-042', replayOnly: true })
    await expect(page.getByText(/1\.33/).first()).toBeVisible()
  })
})
