import { createBrowserRouter, Navigate } from 'react-router-dom'
import HomeLayout from './views/Home'
import React, { Suspense } from 'react'

const LazyComponent = ({ loader }: { loader: () => Promise<{ default: React.ComponentType }> }) => {
  const Component = React.lazy(loader)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  )
}

export default LazyComponent

export const menuRoutes = [
  {
    path: '/basic',
    element: <LazyComponent loader={() => import('./examples/Basic')} />,
    meta: {
      title: 'basic'
    }
  },
  {
    path: '/comprehensive',
    element: <LazyComponent loader={() => import('./examples/Comprehensive')} />,
    meta: {
      title: 'comprehensive'
    }
  },
  {
    path: '/moveble',
    element: <LazyComponent loader={() => import('./examples/Moveble')} />,
    meta: {
      title: 'moveble'
    }
  }
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/comprehensive" replace />
      },
      ...menuRoutes
    ]
  }
])
