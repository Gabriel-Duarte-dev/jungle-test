import { expect, login, test } from './fixtures'

test.describe('favoritos', () => {
  test('favoritar e recuperar de falha', async ({ page }) => {
    await login(page, 'ana')
    await page.goto('/nfts/sage-nomad-009')
    const button = page.getByTestId('favorite-main')
    await expect(button).toBeVisible()
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('favoritos com falha', () => {
  test.use({ scenario: 'favorites-fail' })

  test('mutation falha e o estado volta', async ({ page }) => {
    await login(page, 'ana')
    await page.goto('/nfts/sage-nomad-009')
    const button = page.getByTestId('favorite-main')
    await button.click()
    await expect(
      page.getByText(/não foi possível|falha|tente novamente|favorit/i).first(),
    ).toBeVisible()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
  })
})
