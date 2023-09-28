import { useEffect, useState } from 'react'
import { Button, Textarea, VStack, useToast } from '@chakra-ui/react'
import {
  authWithRedirect,
  authWithPopup,
  authCallback,
  AuthResponse,
  AuthRequest,
} from '@joyid/core'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAccount, useSetAccountInfo } from '../../hooks'
import { RoutePath } from '../../route/path'

interface PopupButtonProps {
  request: AuthRequest
}

const useHandleResult = () => {
  const toast = useToast()
  const setAccount = useSetAccountInfo()

  return (res: AuthResponse, type: 'popup' | 'redirect') => {
    const { data, error } = res
    if (error != null) {
      toast({
        title: 'Error',
        description: error,
        status: 'error',
      })
      return
    }
    setAccount({
      ...data,
      callbackType: type,
    })
  }
}

const PopupButton: React.FC<PopupButtonProps> = ({ request }) => {
  const [isLoading, setIsLoading] = useState(false)
  const handleResult = useHandleResult()

  const onPopupClick = async () => {
    setIsLoading(true)
    const res = await authWithPopup(request)
    setIsLoading(false)
    handleResult(res, 'popup')
  }

  return (
    <Button
      onClick={onPopupClick}
      colorScheme="teal"
      w="240px"
      isLoading={isLoading}
    >
      Authorize With Popup
    </Button>
  )
}

const RedirectButton: React.FC<PopupButtonProps> = ({ request }) => {
  const [searchParams] = useSearchParams()
  const isRedirectFromJoyID = searchParams.get('joyid_auth_redirect') === 'true'
  const handleResult = useHandleResult()

  const onRedirectClick = async () => {
    const url = new URL(request.redirectURL)
    url.searchParams.append('joyid_auth_redirect', 'true')
    authWithRedirect({
      ...request,
      redirectURL: url.href,
    })
  }

  useEffect(() => {
    if (isRedirectFromJoyID) {
      const res = authCallback()
      handleResult(res, 'redirect')
    }
  }, [])

  return (
    <Button
      onClick={onRedirectClick}
      colorScheme="teal"
      variant="outline"
      w="240px"
    >
      Authorize With Redirect
    </Button>
  )
}

export function Root() {
  const [message, setMessage] = useState('Hello World')
  const account = useAccount()
  const currentPath = '/'
  const redirectURL = `${location.origin}${currentPath}`
  const request = {
    redirectURL,
    logo: `${location.origin}/vite.svg`,
    challenge: message || undefined,
    name: 'CKB Demo',
  }

  if (account) {
    return <Navigate to={RoutePath.Home} replace />
  }

  return (
    <div className="App">
      <VStack spacing={6}>
        <Textarea
          value={message}
          placeholder="The message to be signed during authentication"
          onChange={(e) => setMessage(e.target.value)}
        />
        <RedirectButton request={request} />
        <PopupButton request={request} />
      </VStack>
    </div>
  )
}
