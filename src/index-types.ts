/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { MouseEventHandler } from 'react'
export  interface PaletteType {
  bgColor?: string;
  longfgColor?: string;
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

export  interface SketchRulerProps {
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
  panzoomOption?: object; // 需要具体类型，这里假设为object
  children: React.ReactNode;
  onUpdateScale?: (props: any) => void;
  onCornerClick: Fn
  handleShowRuler: Fn
  handleShowReferLine: Fn
}
