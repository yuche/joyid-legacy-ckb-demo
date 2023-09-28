import React, { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as JotaiProvider } from 'jotai'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ChakraProvider } from '@chakra-ui/react'
import { config } from '@joyid/core'
import { I18nextProvider } from 'react-i18next'
import { Router } from './route'
import i18n from './i18n'
import { theme } from './theme'
import './index.css'
import { JOY_ID_SERVER_URL, JOY_ID_URL } from './env'
import { init } from './lumos'

config.setJoyIDAppURL(JOY_ID_URL)
config.setJoyIDServerURL(JOY_ID_SERVER_URL)
init()

const App: React.FC = () => {
  const queryClient = useMemo(() => new QueryClient(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <JotaiProvider>
          <ChakraProvider theme={theme}>
            <Router />
          </ChakraProvider>
        </JotaiProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
