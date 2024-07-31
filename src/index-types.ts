import * as React from 'react';

interface PaletteType {
  bgColor?: string;
  longfgColor?: string; // Assuming this is a typo and should be longFgColor or similar
  fontColor?: string;
  shadowColor?: string;
  lineColor?: string;
  lineType?: string;
  lockLineColor?: string;
  borderColor?: string;
  cornerActiveColor?: string;
}

interface ShadowType {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LineType {
  h: number[];
  v: number[];
}

// Define the props for the component
interface SketchRulerProps {
  showRuler?: boolean;
  eyeIcon?: string;
  closeEyeIcon?: string;
  scale?: number;
  rate?: number;
  thick?: number;
  palette?: PaletteType;
  width?: number;
  height?: number;
  paddingRatio?: number;
  autoCenter?: boolean;
  shadow?: ShadowType;
  lines?: LineType;
  isShowReferLine?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  snapsObj?: LineType;
  snapThreshold?: number;
  gridRatio?: number;
  lockLine?: boolean;
  selfHandle?: boolean;
  panzoomOption?: any; // You might want to define a more specific type for this if possible
}

// Example of how you might use the type in a React component
const SketchRuler: React.FC<SketchRulerProps> = (props: SketchRulerProps) => {
  // Your component logic goes here
};

// Default Props can be defined like this
SketchRuler.defaultProps = {
  showRuler: true,
  scale: 1,
  rate: 1,
  thick: 16,
  width: 1400,
  height: 800,
  paddingRatio: 0.2,
  autoCenter: true,
  shadow: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  lines: {
    h: [],
    v: []
  },
  isShowReferLine: true,
  canvasWidth: 1000,
  canvasHeight: 700,
  snapsObj: {
    h: [],
    v: []
  },
  snapThreshold: 5,
  gridRatio: 1,
  lockLine: false,
  selfHandle: false,
};
export { SketchRuler, SketchRulerProps,PaletteType };
