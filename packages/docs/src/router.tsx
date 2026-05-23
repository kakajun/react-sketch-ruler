import { createHashRouter, Navigate } from 'react-router-dom'
import HomeLayout from './views/Home'
import React from 'react'
import Basic from './examples/Basic'
import Basic2 from './examples/Basic2'
import Comprehensive from './examples/Comprehensive'
import CustomizeButtons from './examples/CustomizeButtons'
import Moveble from './examples/Moveble'
import InputTest from './examples/InputTest'
import Bigscreen from './examples/bigscreen/Bigscreen'
import EightK from './examples/EightK'
import EightKSketchRuler from './examples/EightKSketchRuler'
import MultiInstance from './examples/MultiInstance'
import EsDragle from './examples/EsDragle'
import SelectoDemo from './examples/SelectoDemo'

export const menuRoutes = [
  {
    path: '/basic',
    element: <Basic />,
    meta: { title: 'basic' }
  },
  {
    path: '/basic2',
    element: <Basic2 />,
    meta: { title: 'basic2' }
  },
  {
    path: '/comprehensive',
    element: <Comprehensive />,
    meta: { title: 'comprehensive' }
  },
  {
    path: '/customizeButtons',
    element: <CustomizeButtons />,
    meta: { title: 'customizeButtons' }
  },
  {
    path: '/moveble',
    element: <Moveble />,
    meta: { title: 'moveble' }
  },
  {
    path: '/selecto',
    element: <SelectoDemo />,
    meta: { title: 'selecto' }
  },
  {
    path: '/inputTest',
    element: <InputTest />,
    meta: { title: 'inputTest' }
  },
  {
    path: '/esDragle',
    element: <EsDragle />,
    meta: { title: 'esDragle' }
  },
  {
    path: '/bigscreen',
    element: <Bigscreen />,
    meta: { title: 'bigscreen' }
  },
  {
    path: '/8k',
    element: <EightK />,
    meta: { title: '8k' }
  },
  {
    path: '/sketch-ruler',
    element: <EightKSketchRuler />,
    meta: { title: 'sketch-ruler' }
  },

  {
    path: '/multi-instance',
    element: <MultiInstance />,
    meta: { title: 'multi-instance' }
  }
]

export const router: ReturnType<typeof createHashRouter> = createHashRouter([
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
