import { useEffect, useState } from 'react'
import { Button, Textarea, VStack, useToast, Box } from '@chakra-ui/react'
import {
  signMessageWithRedirect,
  signMessageWithPopup,
  signMessageCallback,
  SignMessageResponse,
  SignMessageRequest,
  verifySignature,
} from '@joyid/core'
import { atom, useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAccount } from '../../hooks'
import { RoutePath } from '../../route/path'

interface PopupButtonProps {
  request: SignMessageRequest
}

const messageAtom = atom<string>('Hello World')
const signatureAtom = atom<string>('')
const responseAtom = atom<SignMessageResponse['data'] | null>(null)

const useHandleResult = () => {
  const toast = useToast()
  const setMessage = useUpdateAtom(messageAtom)
  const setSignautre = useUpdateAtom(signatureAtom)
  const setResponse = useUpdateAtom(responseAtom)
  return (res: SignMessageResponse) => {
    const { data, error } = res
    if (error != null) {
      console.log(error)
      toast({
        title: 'Error',
        description: error,
        status: 'error',
      })
      return
    }
    setMessage(data.challenge)
    setSignautre(data.signature)
    setResponse(res.data)
  }
}

const PopupButton: React.FC<PopupButtonProps> = ({ request }) => {
  const [isLoading, setIsLoading] = useState(false)
  const handleResult = useHandleResult()

  const onPopupClick = async () => {
    setIsLoading(true)
    const res = await signMessageWithPopup(request)
    setIsLoading(false)
    handleResult(res)
  }

  return (
    <Button
      onClick={onPopupClick}
      colorScheme="teal"
      w="240px"
      isLoading={isLoading}
      isDisabled={!request.challenge}
    >
      SignMessage
    </Button>
  )
}

const RedirectButton: React.FC<PopupButtonProps> = ({ request }) => {
  const [searchParams] = useSearchParams()
  const isRedirectFromJoyID = searchParams.get('joyid_sign_redirect') === 'true'
  const handleResult = useHandleResult()

  const onRedirectClick = async () => {
    const url = new URL(request.redirectURL)
    url.searchParams.append('joyid_sign_redirect', 'true')
    signMessageWithRedirect({
      ...request,
      redirectURL: url.href,
    })
  }

  useEffect(() => {
    if (isRedirectFromJoyID) {
      const res = signMessageCallback()
      handleResult(res)
    }
  }, [])

  return (
    <Button
      onClick={onRedirectClick}
      colorScheme="teal"
      w="240px"
      isDisabled={!request.challenge}
    >
      Sign Message
    </Button>
  )
}

export const VerifyButton: React.FC = () => {
  const [response] = useAtom(responseAtom)
  const verify = async () => {
    if (response == null) {
      return
    }

    const result = await verifySignature(response)
    alert(result)
  }

  return (
    <Button
      colorScheme="teal"
      w="240px"
      variant="outline"
      isDisabled={!response?.signature}
      onClick={verify}
    >
      Verify Message
    </Button>
  )
}

export function SignMessage() {
  const [message, setMessage] = useAtom(messageAtom)
  const [signature, setSignature] = useAtom(signatureAtom)
  const [response, setResponse] = useAtom(responseAtom)
  const account = useAccount()
  const currentPath = '/sign-message'
  const redirectURL = `${location.origin}${currentPath}`
  const navi = useNavigate()
  if (!account) {
    return <Navigate to={RoutePath.Root} replace />
  }

  const request = {
    redirectURL,
    logo: `${location.origin}/vite.svg`,
    challenge: message,
    address: account.address,
    name: 'CKB Demo',
  }

  return (
    <div className="App">
      <VStack spacing={6}>
        <Textarea
          value={message}
          name="message"
          placeholder="The message to be signed"
          onChange={(e) => setMessage(e.target.value)}
          isDisabled={response != null}
        />
        <Textarea
          value={signature}
          name="signature"
          isDisabled
          placeholder="Signature"
        />
        {response ? (
          <Box maxW="calc(100%)">
            <details>
              <summary>More Details</summary>
              <pre>
                <code
                  style={{
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {JSON.stringify(response, null, 4)}
                </code>
              </pre>
            </details>
          </Box>
        ) : null}
        {account.callbackType === 'popup' ? (
          <PopupButton request={request} />
        ) : (
          <RedirectButton request={request} />
        )}
        <VerifyButton />
        <Button
          colorScheme="red"
          w="240px"
          variant="outline"
          onClick={() => {
            setSignature('')
            setMessage('')
            setResponse(null)
          }}
        >
          Reset
        </Button>
        <Button colorScheme="purple" onClick={() => navi(RoutePath.Home)}>
          {`<< Go Home`}
        </Button>
      </VStack>
    </div>
  )
}
