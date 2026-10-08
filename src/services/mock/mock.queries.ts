import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../http/queryKeys'
import { fetchScenario, resetScenario, selectScenario } from './mock.api'

export function useScenarioQuery() {
  return useQuery({
    queryKey: queryKeys.scenario,
    queryFn: fetchScenario,
    staleTime: 0,
  })
}

export function useSelectScenarioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => selectScenario(id),
    onSuccess: async () => {
      queryClient.clear()
      await queryClient.invalidateQueries()
      window.location.reload()
    },
  })
}

export function useResetScenarioMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => resetScenario(),
    onSuccess: async () => {
      queryClient.clear()
      window.location.reload()
    },
  })
}
