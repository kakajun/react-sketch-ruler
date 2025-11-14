import React, { useState, useEffect } from 'react'
import lightGithubIcon from '@/assets/images/light-github.svg'
import darkGithubIcon from '@/assets/images/dark-github.svg'
import lightThemeIcon from '@/assets/images/light-theme.svg'
import darkThemeIcon from '@/assets/images/dark-theme.svg'
import logo from '/logo.png'
import { Link } from 'react-router-dom'
import './Header.less'

interface Props {
  title?: string
  children: React.ReactNode
}

const EsHeader: React.FC<Props> = ({ title = 'react-sketch-ruler', children }) => {
  const [isLight, setIsLight] = useState(localStorage.getItem('theme') === 'light')

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme) {
      setIsLight(theme === 'light')
      document.documentElement.className = theme
    }
  }, [])

  useEffect(() => {
    document.documentElement.className = isLight ? 'light' : 'dark'
    localStorage.setItem('theme', isLight ? 'light' : 'dark')
  }, [isLight])

  const handleThemeChange = () => {
    setIsLight(!isLight)
  }

  return (
    <div className="es-header">
      <h1 className="es-logo">
        <img className="es-logo-img" src={logo} alt="react-sketch-ruler" />
        <Link to="/">
          <span>{title}</span>
        </Link>
      </h1>
      <div className="es-navbar">
        <a
          className={['es-header-link', isLight ? 'light' : 'dark'].join(' ')}
          onClick={(e) => { e.preventDefault(); handleThemeChange(); }}
          href="#"
        >
          <img src={isLight ? lightThemeIcon : darkThemeIcon} />
        </a>
        <a
          className="es-header-link"
          href="https://github.com/kakajun/vue3-sketch-ruler"
          target="_blank"
        >
          <img src={isLight ? lightGithubIcon : darkGithubIcon} />
        </a>
        {children}
      </div>
    </div>
  )
}

export default EsHeader
