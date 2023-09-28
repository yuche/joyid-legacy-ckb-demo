import { RouteObject } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Home } from '../pages/Home'
import { Root } from '../pages/Root'
import { SignMessage } from '../pages/SignMessage'
import { SignTransaction } from '../pages/SignTransaction'
import { RoutePath } from './path'

export const routers: RouteObject[] = [
  {
    path: RoutePath.Root,
    element: <Layout />,
    children: [
      {
        path: RoutePath.Root,
        element: <Root />,
      },
      {
        path: RoutePath.Home,
        element: <Home />,
      },
      {
        path: RoutePath.SignMessage,
        element: <SignMessage />,
      },
      {
        path: RoutePath.CKBTransfer,
        element: <SignTransaction />,
      },
    ],
  },
]
