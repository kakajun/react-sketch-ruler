import styled from 'styled-components'

const Demo = styled.div`
  width: 100%;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .whitewrapper {
    background-color: #fafafc;
    background-image: linear-gradient(#fafafc 20px, transparent 0),
      linear-gradient(90deg, transparent 20px, #373739 0);
  }
  .balckwrapper {
    background-color: #18181c;
    background-image: linear-gradient(#18181c 20px, transparent 0),
      linear-gradient(90deg, transparent 20px, #86909c 0);
  }

  .target {
  position: absolute;
  text-align: center;
  color: #333;
  font-size: 30px;
  font-weight: bold;
  border: 1px solid #333;
  box-sizing: border-box;
  }
`

const Top = styled.div`
  display: flex;
  margin-bottom: 10px;
  justify-content: center;
  width: 100%;
  font-size: 20px;
`

const Button = styled.button`
  font-size: 18px;
  margin-right: 10px;
`

const Wrapper = styled.div`
  margin: 0 auto;
  background-size:
    21px 21px,
    21px 21px;
  border: 1px solid #dadadc;
`

const ImgStyle = styled.img`
  width: 100%;
  height: 100%;
`

const Btns = styled.div`
  position: absolute;
  display: flex;
  bottom: 20px;
  right: 40px;
  z-index: 999;
`

const Switch = styled.input.attrs({ type: 'checkbox' })`
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  position: relative;
  width: 40px;
  height: 20px;
  background: #ccc;
  border-radius: 10px;
  transition:
    border-color 0.3s,
    background-color 0.3s;

  &::after {
    content: '';
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0, 0, 2px, #999;
    transition: 0.4s;
    top: 2px;
    position: absolute;
    left: 2px;
  }

  &:checked {
    background: rgb(19, 206, 102);
  }

  &:checked::after {
    content: '';
    position: absolute;
    left: 55%;
    top: 2px;
  }
`

export { Demo, Top, Button, Wrapper, ImgStyle, Btns, Switch }
