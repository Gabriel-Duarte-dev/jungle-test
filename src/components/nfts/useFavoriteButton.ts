import { useNavigate, useRouterState } from '@tanstack/react-router'
import { toast } from 'sonner'

import { useSessionQuery } from '@/services/auth/auth.queries'
import { useToggleFavoriteMutation } from '@/services/favorites/favorites.queries'
import { errorMessage, isApiError } from '@/services/http/errors'

export function useFavoriteButton(nftId: string, favorited: boolean) {
  const { user } = useSessionQuery()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const mutation = useToggleFavoriteMutation()

  function onToggle() {
    if (!user) {
      void navigate({ to: '/entrar', search: { from: pathname } })
      return
    }

    mutation.mutate(
      { nftId, favorited: !favorited },
      {
        onError: (error) => {
          toast.error(isApiError(error) ? error.message : errorMessage(error))
        },
      },
    )
  }

  return { onToggle, pending: mutation.isPending }
}
