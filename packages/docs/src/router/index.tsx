import React from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

export default function Router() {
  const baseRouter: any[] = [
    {
      path: '/',
      children: [
        {
          index: true,
          lazy: () => import('@/views/Home')
        }
      ]
    }
  ]

  const routers = baseRouter

  const router = createBrowserRouter(routers)

  return (
    <>
      <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
    </>
  )
}
