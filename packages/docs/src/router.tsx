// eslint-disable-next-line no-restricted-imports
import { createBrowserRouter, ScrollRestoration } from 'react-router-dom'

import HomeLayout from './views/Home'
import React from 'react'

export const menuRoutes = [
  {
    path: '/',
    lazy: () => import('./examples/basic'),
    meta: {
      title: 'basic'
    }
  }
]

export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollRestoration getKey={(location) => location.pathname} />
        <HomeLayout />
      </>
    ),
    children: menuRoutes
  }
])
