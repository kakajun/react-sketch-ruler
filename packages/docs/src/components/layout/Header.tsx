import React, { useState, useEffect } from 'react';
import lightGithubIcon from '@/assets/images/light-github.svg';
import darkGithubIcon from '@/assets/images/dark-github.svg';
import lightThemeIcon from '@/assets/images/light-theme.svg';
import darkThemeIcon from '@/assets/images/dark-theme.svg';
import { Link } from 'react-router-dom';


interface Props {
  title?: string;
}

const EsHeader: React.FC<Props> = ({ title = 'vue3-sketch-ruler' }) => {
  const [isLight, setIsLight] = useState(true);



  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme) {
      setIsLight(theme === 'light');
      document.documentElement.className = theme;
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  // const handleThemeChange = () => {
  //   setIsLight(!isLight);
  // };

  return (
    <div className="es-header">
      <h1 className="es-logo">
        <img className="es-logo-img" src="/logo.png" alt="vue3-sketch-ruler" />
       <Link to="/">
          <span>{title}</span>
        </Link>
      </h1>
      <slot /> {/* 无法直接使用slot，需要手动渲染children */}
      <div className="es-navbar">
        <slot name="navbar-start" /> {/* 无法直接使用slot，需要手动渲染children */}
        <a
          className={['es-header-link', isLight ? 'light' : 'dark'].join(' ')}
          onClick={(e) => e.preventDefault()}
          href="#"
        >
          <img src={isLight ? lightThemeIcon : darkThemeIcon} />
        </a>
        <a className="es-header-link" href="https://github.com/kakajun/vue3-sketch-ruler" target="_blank">
          <img src={isLight ? lightGithubIcon : darkGithubIcon} />
        </a>
        <slot name="navbar-end" /> {/* 无法直接使用slot，需要手动渲染children */}
      </div>
    </div>
  );
};

export default EsHeader;
