import { createHashRouter, Navigate } from 'react-router-dom'
import HomeLayout from './views/Home'
import React from 'react'
import Basic from './examples/Basic'
import Comprehensive from './examples/Comprehensive'
import Moveble from './examples/Moveble'
import InputTest from './examples/InputTest'
import Snap from './examples/Snap'

export const menuRoutes = [
  {
    path: '/basic',
    element: <Basic></Basic>,
    meta: {
      title: 'basic'
    }
  },
  {
    path: '/comprehensive',
    element: <Comprehensive />,
    meta: {
      title: 'comprehensive'
    }
  },
  {
    path: '/moveble',
    element: <Moveble />,
    meta: {
      title: 'moveble'
    }
  },
  {
    path: '/inputTest',
    element: <InputTest />,
    meta: {
      title: 'inputTest'
    }
  },
  {
    path: '/snap',
    element: <Snap></Snap>,
    meta: {
      title: 'snap'
    }
  }
]

export const router = createHashRouter([
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
