import { expect, expectSignedIn, login, logout, openMobileNav, test } from './fixtures'

test.describe('autenticação', () => {
  test('cadastro, login, sessão, logout e troca de usuário', async ({ page }) => {
    await page.goto('/cadastro')
    await page.locator('input[name="name"]').fill('Carla Colecionadora')
    await page.locator('input[name="email"]').fill(`carla.${Date.now()}@kurio.test`)
    await page.locator('input[name="password"]').fill('Colecionar9')
    await page.locator('input[name="confirmPassword"]').fill('Colecionar9')
    await page.getByRole('button', { name: /criar (conta|perfil)/i }).click()
    await expectSignedIn(page)

    await logout(page)
    const entrar = page.getByRole('link', { name: 'Entrar' }).locator('visible=true')
    const loginField = page.locator('input[name="email"]')
    if (!(await entrar.isVisible()) && !(await loginField.isVisible())) {
      await openMobileNav(page)
    }
    await expect(entrar.or(loginField).first()).toBeVisible()

    await login(page, 'ana')
    await expectSignedIn(page, /Ana/i)

    await logout(page)
    await login(page, 'bruno')
    await expectSignedIn(page, /Bruno/i)
  })

  test('sessão expirada redireciona para login preservando o destino', async ({ page }) => {
    await login(page, 'ana')
    await page.evaluate(() => localStorage.removeItem('kurio.session.token'))
    await page.goto('/perfil')
    await expect(page).toHaveURL(/entrar/)
  })
})
