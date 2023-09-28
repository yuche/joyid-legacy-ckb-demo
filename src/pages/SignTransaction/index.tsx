import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Textarea,
  VStack,
  useToast,
  Input,
  Alert,
  AlertIcon,
  Link,
  AlertDescription,
  AlertTitle,
  Text,
  FormLabel,
  FormControl,
} from '@chakra-ui/react'
import { TransactionSkeletonType } from '@ckb-lumos/helpers'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { atom, useAtom } from 'jotai'
import { Navigate, useNavigate } from 'react-router-dom'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { map, debounceTime } from 'rxjs/operators'
import { useAccount, useSetAccountInfo } from '../../hooks'
import { RoutePath } from '../../route/path'
import { prepareTransferTransaction, transfer } from '../../lumos/transfer'

const defaultAddress =
  'ckt1qrfrwcdnvssswdwpn3s9v8fp87emat306ctjwsm3nmlkjg8qyza2cqgqqxv6drphrp47xalweq9pvr6ll3mvkj225quegpcw'

const toAddressAtom = atom<string>(defaultAddress)
const amountAtom = atom<string>('100')

const useToastError = () => {
  const toast = useToast()
  return (error: unknown) => {
    if (error instanceof Error) {
      toast({
        title: error.name,
        description: error.message,
        status: 'error',
      })
    } else {
      toast({
        title: 'Unknown Error',
        description: 'See devtool console for more details',
      })
    }
    console.error(error)
  }
}

export function SignTransaction() {
  const [toAddress, setToAddress] = useAtom(toAddressAtom)
  const [amount, setAmount] = useAtom(amountAtom)
  const [tx, setTx] = useState<TransactionSkeletonType | null>(null)
  const [txHash, setTxHash] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const toastError = useToastError()
  const [isTransfering, setIsTransfering] = useState(false)
  const account = useAccount()
  const addressRef = useRef<HTMLTextAreaElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  const currentPath = '/sign-transaction'
  const redirectURL = `${location.origin}${currentPath}`
  const setAccountInfo = useSetAccountInfo()
  const navi = useNavigate()
  const [addressChange, addressChange$] = useObservableCallback<
    string,
    React.ChangeEvent<HTMLTextAreaElement>
  >((event$) =>
    event$.pipe(
      map((e) => e.target.value),
      debounceTime(500)
    )
  )

  useSubscription(addressChange$, async (toAddr: string) => {
    setIsChecking(true)
    try {
      const txSkeleton = await prepareTransferTransaction(
        account?.address!,
        toAddr,
        BigInt(Number(amount) * 10 ** 8),
        account?.keyType,
        account?.pubkey,
        account?.attestation,
        account?.alg
      )
      setTx(txSkeleton)
      setToAddress(toAddr)
    } catch (error) {
      toastError(error)
    } finally {
      setIsChecking(false)
    }
  })

  const [amountChange, amountChange$] = useObservableCallback<
    string,
    React.ChangeEvent<HTMLInputElement>
  >((event$) =>
    event$.pipe(
      map((e) => e.target.value),
      debounceTime(500)
    )
  )

  useSubscription(amountChange$, async (val: string) => {
    setIsChecking(true)
    try {
      const txSkeleton = await prepareTransferTransaction(
        account?.address!,
        toAddress,
        BigInt(Number(val) * 10 ** 8),
        account?.keyType,
        account?.pubkey,
        account?.attestation,
        account?.alg
      )
      setAmount(val)
      setTx(txSkeleton)
    } catch (error) {
      toastError(error)
    } finally {
      setIsChecking(false)
    }
  })

  useEffect(() => {
    setIsChecking(true)
    // if (
    //   account &&
    //   (account.keyType === 'main_session_key' ||
    //     account.keyType === 'sub_session_key')
    // ) {
    //   verifyCredential(
    //     account.pubkey,
    //     account.address,
    //     account.keyType,
    //     account.alg!
    //   ).then((isValid) => {
    //     if (!isValid) {
    //       toastError(new Error('Your JoyID is expired, please login again.'))
    //       setAccountInfo(null)
    //     }
    //   })
    // }
    prepareTransferTransaction(
      account?.address!,
      toAddress,
      BigInt(100 * 10 ** 8),
      account?.keyType,
      account?.pubkey,
      account?.attestation,
      account?.alg
    )
      .then((txSkeleton) => {
        setTx(txSkeleton)
      })
      .catch((err) => {
        toastError(err)
      })
      .finally(() => {
        setIsChecking(false)
      })
  }, [])

  if (!account) {
    return <Navigate to={RoutePath.Root} replace />
  }

  const request = {
    redirectURL,
    logo: `${location.origin}/vite.svg`,
    challenge: toAddress,
    address: account?.address,
    name: 'CKB Demo',
  }

  return (
    <div className="App">
      <VStack spacing={6}>
        <FormControl>
          <FormLabel>To Address:</FormLabel>
          <Textarea
            name="message"
            defaultValue={defaultAddress}
            placeholder="To address"
            onChange={addressChange}
            ref={addressRef}
          />
        </FormControl>
        <FormControl>
          <FormLabel>CKB Amount:</FormLabel>
          <Input
            defaultValue="100"
            type="number"
            onChange={amountChange}
            placeholder="amount"
          />
        </FormControl>
        {txHash ? (
          <Alert
            status="success"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            variant="subtle"
          >
            <AlertIcon />
            <AlertTitle>Transfer Successful</AlertTitle>
            <AlertDescription>
              <Text>{`The transaction hash is: `}</Text>
              <Link
                href={`https://pudge.explorer.nervos.org/transaction/${txHash}`}
                isExternal
                wordBreak="break-all"
                textDecoration="underline"
              >
                {txHash}
                <ExternalLinkIcon mx="2px" />
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}
        <Button
          colorScheme="teal"
          w="240px"
          isLoading={isTransfering || isChecking}
          isDisabled={tx === null}
          loadingText={isChecking ? 'Checking...' : 'Transfering...'}
          onClick={async () => {
            setIsTransfering(true)
            try {
              const hash = await transfer(
                request,
                tx!,
                account.keyType,
                account.alg
              )
              setTxHash(hash)
            } catch (error) {
              toastError(error)
            } finally {
              setIsTransfering(false)
            }
          }}
        >
          Transfer
        </Button>
        <Button
          colorScheme="red"
          w="240px"
          variant="outline"
          onClick={() => {
            setToAddress('')
            if (addressRef.current) {
              addressRef.current.value = ''
            }
            setAmount('100')
            if (amountRef.current) {
              amountRef.current.value = '100'
            }
            setTx(null)
            setTxHash('')
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
