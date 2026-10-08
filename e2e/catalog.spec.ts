import { closeCatalogFilters, expect, openCatalogFilters, searchCatalog, test } from './fixtures'

test.describe('catálogo', () => {
  test('busca, filtros combinados, ordenação, paginação e histórico', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /seja dono/i })).toBeVisible()

    await searchCatalog(page, 'Emerald')

    await expect(page).toHaveURL(/q=Emerald/)
    await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()

    await openCatalogFilters(page)
    await page.getByRole('checkbox', { name: 'Arte digital' }).click()
    await expect(page).toHaveURL(/collections=arte-digital/)
    await expect(page).not.toHaveURL(/page=/)
    await closeCatalogFilters(page)

    await page.getByRole('tab', { name: 'Em alta' }).click()
    await expect(page).toHaveURL(/tab=trending/)

    await page.getByLabel('Ordenar por:').click()
    await page.getByRole('option', { name: 'Menor preço' }).click()
    await expect(page).toHaveURL(/sort=price_asc/)

    await page.reload()
    await expect(page).toHaveURL(/q=Emerald/)
    await expect(page).toHaveURL(/collections=arte-digital/)
    await expect(page).toHaveURL(/tab=trending/)
    await expect(page).toHaveURL(/sort=price_asc/)

    const next = page.getByRole('button', { name: 'Próxima página' })
    if (await next.isVisible()) {
      await next.click()
      await expect(page).toHaveURL(/page=2/)
      await page.goBack()
      await expect(page).toHaveURL(/sort=price_asc/)
    }
  })

  test('acesso direto ao detalhe e recurso inexistente', async ({ page }) => {
    await page.goto('/nfts/emerald-ape-042')
    await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()

    await page.goto('/nfts/nao-existe')
    await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
  })
})
