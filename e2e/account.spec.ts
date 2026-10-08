import { expect, login, test } from './fixtures'

test.describe('conta', () => {
  test('edita perfil, senha e carteiras com validação', async ({ page }) => {
    await login(page, 'bruno')
    await page.goto('/perfil')
    await page.locator('input[name="name"]').fill('B')
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await expect(page.getByText(/mínimo de 3 caracteres/i)).toBeVisible()

    await page.locator('input[name="name"]').fill('Bruno Mercado')
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await expect(page.getByText('Perfil atualizado.')).toBeVisible()

    await page.locator('input[name="currentPassword"]').fill('errada')
    await page.locator('input[name="newPassword"]').fill('NovaSenha1')
    await page.locator('input[name="confirmPassword"]').fill('NovaSenha1')
    await page.getByRole('button', { name: 'Atualizar senha' }).click()
    await expect(page.getByText(/incorreta|senha atual/i).first()).toBeVisible()

    await page.goto('/carteiras')
    await page.locator('input[name="label"]').fill('Ab')
    await page.getByRole('button', { name: 'Salvar carteira' }).first().click()
    await expect(page.getByText(/ao menos 3 caracteres/i)).toBeVisible()
  })
})
