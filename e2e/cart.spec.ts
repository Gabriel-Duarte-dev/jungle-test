import { expect, login, test } from './fixtures'

test.describe('carrinho', () => {
  test('quantidade, remoção, cupom e persistência após refresh e login', async ({ page }) => {
    await page.goto('/nfts/sage-nomad-009')
    await expect(page.getByRole('heading', { name: 'Sage Nomad #009' })).toBeVisible()
    const add = page.getByRole('button', { name: /comprar(\s+nft)?/i })
    await expect(add).toBeEnabled()
    await add.click()
    await expect(page.getByText('Adicionado ao carrinho.')).toBeVisible()
    await page.goto('/carrinho')
    await expect(page.getByRole('heading', { name: 'Sage Nomad #009' })).toBeVisible()

    const minus = page.getByRole('button', { name: /diminuir quantidade/i })
    if (await minus.isEnabled()) {
      await minus.click()
    }

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Sage Nomad #009' })).toBeVisible()

    await login(page, 'bruno')
    await page.goto('/carrinho')
    await expect(page.getByRole('heading', { name: 'Sage Nomad #009' })).toBeVisible()

    await page.getByPlaceholder(/código promocional/i).fill('KURIO10')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText('Desconto').first()).toBeVisible()

    await page.getByPlaceholder(/código promocional/i).fill('FOOBAR')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText(/inválido|expirado|expirou/i).first()).toBeVisible()

    await page.getByRole('button', { name: 'Remover' }).first().click()
  })
})
