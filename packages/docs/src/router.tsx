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
import SelectoDemo from './examples/SelectoDemo'
import FlowEditor from './examples/FlowEditor'
import Whiteboard from './examples/Whiteboard'
import Topology from './examples/Topology'
import OrgChart from './examples/OrgChart'

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
  },
  {
    path: '/flow-editor',
    element: <FlowEditor />,
    meta: { title: 'flow-editor' }
  },
  {
    path: '/whiteboard',
    element: <Whiteboard />,
    meta: { title: 'whiteboard' }
  },
  {
    path: '/topology',
    element: <Topology />,
    meta: { title: 'topology' }
  },
  {
    path: '/org-chart',
    element: <OrgChart />,
    meta: { title: 'org-chart' }
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
