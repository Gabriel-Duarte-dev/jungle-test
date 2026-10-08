import { useLiveRegion } from '@/components/a11y/LiveRegion'

export function AuthSocial() {
  const { announce } = useLiveRegion()

  function onSocial(provider: string) {
    announce(`Entrar com ${provider} está fora do escopo desta entrega.`)
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" aria-hidden />
        <p className="text-caption-lg text-foreground">Ou continue com</p>
        <span className="bg-border h-px flex-1" aria-hidden />
      </div>
      <SocialButton
        label="Continuar com Google"
        icon="/assets/icons/google.svg"
        onClick={() => onSocial('Google')}
      />
      <SocialButton
        label="Continuar com Facebook"
        icon="/assets/icons/facebook.svg"
        onClick={() => onSocial('Facebook')}
      />
    </div>
  )
}

function SocialButton({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border text-caption-lg text-text-secondary flex h-10 w-full items-center justify-center gap-3 rounded-[5px] border font-medium"
    >
      <img src={icon} alt="" width={20} height={20} />
      {label}
    </button>
  )
}
