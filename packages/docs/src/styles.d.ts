
declare module 'styled-components' {
  export interface IGlobalStyle {
    Demo: typeof Demo
    Top: typeof Top
    Button: typeof Button
    Wrapper: typeof Wrapper
    ImgStyle: typeof ImgStyle
    Btns: typeof Btns
    Switch: typeof Switch
  }
}

// 定义具体的样式类型
declare const Demo: import('styled-components').StyledComponent<'div', any>
declare const Top: import('styled-components').StyledComponent<'div', any>
declare const Button: import('styled-components').StyledComponent<'button', any>
declare const Wrapper: import('styled-components').StyledComponent<'div', any>
declare const ImgStyle: import('styled-components').StyledComponent<'img', any>
declare const Btns: import('styled-components').StyledComponent<'div', any>
declare const Switch: import('styled-components').StyledComponent<'input', any>

export { Demo, Top, Button, Wrapper, ImgStyle, Btns, Switch }
