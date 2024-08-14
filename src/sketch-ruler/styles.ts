import styled from 'styled-components'
import { DetailedHTMLProps, HTMLAttributes } from 'react'
interface RulerProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  $thickness: number
}

// 创建一个函数，这个函数将返回一个styled-component，模拟mixin的行为
const extendableBorder = ({
  topBottomWidth = '4px',
  leftRightWidth = '100vw',
  offset = '-4px'
}) => `
  position: absolute;
  left: 0;
  width: ${leftRightWidth};
  &:before,
  &:after {
    content: '';
    display: inline-block;
    height: ${topBottomWidth};
    width: ${leftRightWidth};
    position: absolute;
  }
  &::before {
    top: ${offset};
    left: 0;
  }
  &::after {
    bottom: ${offset};
    left: 0;
  }
`

const verticalBorder = ({ height = '100vh', width = '4px', offset = '-4px' }) => `
  position: absolute;
  top: 0;
  height: ${height};
  &:before,
  &:after {
    content: '';
    display: inline-block;
    width: ${width};
    height: ${height};
    position: absolute;
  }
  &::before {
    left: ${offset};
    top: 0;
  }
  &::after {
    right: ${offset};
    top: 0;
  }
`

export const StyledRuler = styled.div<RulerProps>`
  position: relative;
  z-index: 3;
  /* 需要比resizer高 */
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 12px;
  span {
    line-height: 1;
  }
  .canvasedit-parent {
    position: absolute;
    left: ${(props) => props.$thickness}px;
    top: ${(props) => props.$thickness}px;
  }
  .corner {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: auto;
    cursor: pointer;
    box-sizing: content-box;
    transition: all 0.2s ease-in-out;
  }
  .h-container,
  .v-container {
    position: absolute;
    .indicator {
      z-index: 4; // 比尺子高
      position: absolute;
    }

    .line {
      position: absolute;
    }

    .action {
      position: absolute;
    }

    .value {
      transform: scale(0.83);
      padding: 5px;
      border-radius: 5px;
      font-size: 12px;
      white-space: nowrap;
    }
  }
  .h-container {
    top: 0;
    .line {
      ${verticalBorder({ height: '100vh', width: '4px', offset: '-4px' })}
    }
    .indicator {
      ${extendableBorder({ topBottomWidth: '4px', leftRightWidth: '100vw', offset: '-5px' })}
    }
  }

  .v-container {
    left: 0;
    .line {
      ${extendableBorder({ topBottomWidth: '4px', leftRightWidth: '100vw', offset: '-5px' })}
    }
    .indicator {
      ${verticalBorder({ height: '100vh', width: '4px', offset: '-4px' })}
    }
  }
`
