export const extendableBorder = (
  topBottomWidth = '4px',
  leftRightWidth = '100vw',
  offset = '-4px'
) => `
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

export const verticalBorder = (height = '100vh', width = '4px', offset = '-4px') => `
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
