import { test as base, expect, type Page } from '@playwright/test'

export const CREDENTIALS = {
  ana: { email: 'ana@kurio.test', password: 'Colecionador1!' },
  bruno: { email: 'bruno@kurio.test', password: 'Mercado2024!' },
} as const

async function resetMock(page: Page, scenario: string) {
  await page.evaluate(async (id) => {
    await fetch('https://api.kurio.test/__mock/reset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scenarioId: id }),
    })
  }, scenario)
}

async function waitForMocks(page: Page) {
  await page.waitForFunction(
    () => (window as Window & { __MSW_READY__?: boolean }).__MSW_READY__ === true,
    null,
    {
      timeout: 20_000,
    },
  )
}

export const test = base.extend<{ scenario: string }>({
  scenario: ['default', { option: true }],

  page: async ({ page, scenario }, use) => {
    await page.addInitScript((id) => {
      if (sessionStorage.getItem('kurio.e2e.booted')) return
      sessionStorage.setItem('kurio.e2e.booted', '1')
      localStorage.setItem('kurio.mock.scenario', id)
      localStorage.removeItem('kurio.session.token')
      localStorage.removeItem('kurio.checkout.attempt')
      localStorage.removeItem('kurio.mock.scenario.overrides')
    }, scenario)

    await page.goto(`/?scenario=${scenario}`)
    await waitForMocks(page)
    await resetMock(page, scenario)
    await page.reload()
    await waitForMocks(page)
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright `use`
    await use(page)
  },
})

export { expect }

export async function openMobileNav(page: Page) {
  const open = page.getByRole('button', { name: 'Abrir menu' })
  if (await open.isVisible()) {
    await open.click()
  }
}

export function visibleLogout(page: Page) {
  return page.getByRole('button', { name: 'Sair' }).locator('visible=true')
}

export async function logoutButton(page: Page) {
  const visible = visibleLogout(page)
  if (await visible.isVisible()) return visible

  const profileTab = page.getByRole('link', { name: 'Perfil' })
  if (await profileTab.isVisible()) {
    await profileTab.click()
    return visibleLogout(page)
  }

  await openMobileNav(page)
  return visibleLogout(page)
}

export async function expectSignedIn(page: Page, name?: RegExp) {
  await expect(page).not.toHaveURL(/\/entrar/)
  const signedIn = visibleLogout(page).or(page.getByRole('link', { name: 'Perfil' }))
  await expect(signedIn.first()).toBeVisible()

  if (!name) return

  const named = page.getByRole('link', { name }).locator('visible=true')
  const fallback = page
    .getByRole('link', { name: 'Meu perfil' })
    .or(page.getByRole('link', { name: 'Perfil' }))
  if (await named.isVisible()) {
    await expect(named).toBeVisible()
    return
  }
  await expect(fallback.first()).toBeVisible()
}

export async function login(page: Page, who: keyof typeof CREDENTIALS = 'ana') {
  const { email, password } = CREDENTIALS[who]
  await page.goto('/entrar')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expectSignedIn(page)
}

export async function logout(page: Page) {
  await (await logoutButton(page)).click()
}

export async function searchCatalog(page: Page, query: string) {
  const openSearch = page.getByRole('button', { name: 'Abrir busca' })
  if (await openSearch.isVisible()) {
    await openSearch.click()
    const desktop = page.getByPlaceholder('Buscar NFTs')
    await desktop.fill(query)
    await page.getByRole('button', { name: 'Enviar busca' }).click()
    return
  }

  const mobileSearch = page.getByLabel('Explorar coleções')
  await mobileSearch.fill(query)
  await mobileSearch.press('Enter')
}

export async function openCatalogFilters(page: Page) {
  const checkbox = page.getByRole('checkbox', { name: 'Arte digital' })
  if (await checkbox.isVisible()) return

  await page.getByRole('button', { name: 'Filtros' }).click()
  await expect(checkbox).toBeVisible()
}

export async function closeCatalogFilters(page: Page) {
  const close = page.getByRole('button', { name: 'Fechar' })
  if (await close.isVisible()) {
    await close.click()
  }
}

export async function triggerNftEvent(
  page: Page,
  payload: { nftId: string; priceEth?: string; soldOut?: boolean; replayOnly?: boolean },
) {
  await waitForMocks(page)
  await page.waitForFunction(
    () =>
      (window as Window & { __KURIO_SOCKET_CONNECTED__?: boolean }).__KURIO_SOCKET_CONNECTED__ ===
      true,
    null,
    { timeout: 10_000 },
  )
  await page.evaluate(async (body) => {
    const response = await fetch('https://api.kurio.test/__mock/events/nft', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`nft event failed: ${response.status}`)
  }, payload)
}
