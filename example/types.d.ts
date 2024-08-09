import { styled } from 'styled-components'

declare module 'styled-components' {
  export interface IGlobalStyle {
    Demo: typeof styled.div
    Top: typeof styled.div
    Button: typeof styled.button
    Wrapper: typeof styled.div
    ImgStyle: typeof styled.img
    Btns: typeof styled.div
    Switch: typeof styled.input
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      demo: any // 这里可以更具体地定义属性
      top: any
      button: any
      wrapper: any
      img: any
      div: any
      input: any
    }
  }
}
