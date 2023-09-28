import { atomWithStorage, useAtomValue, useUpdateAtom } from 'jotai/utils'
import { AuthResponse } from '@joyid/core'

export const accountAtom = atomWithStorage<NonNullable<
  AuthResponse['data'] & { callbackType: 'redirect' | 'popup' }
> | null>('_demo_account_v1_', null)

export const useAccount = () => useAtomValue(accountAtom)

export const useSetAccountInfo = () => useUpdateAtom(accountAtom)
