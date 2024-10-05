import React, { useState, useEffect } from 'react'
import { router } from './router'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from 'antd-style'

const App: React.FC = () => {
  const [isLight, setIsLight] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    // 创建一个 MutationObserver 来监听 class 属性的变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newTheme = document.documentElement.className
          setIsLight(newTheme)
        }
      })
    })

    // 配置 observer：观察 class 属性的变化
    const config = { attributes: true }
    observer.observe(document.documentElement, config)
    // 清理函数
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <ThemeProvider appearance={isLight}>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
