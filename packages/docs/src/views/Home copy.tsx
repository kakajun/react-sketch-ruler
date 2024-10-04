import React, { useState, useEffect, useRef } from 'react';
import { Router, Route, Link, useLocation } from 'react-router-dom';
// import { menuRoutes } from '../router';
import 'highlight.js/styles/panda-syntax-light.css';
import hljs from 'highlight.js';
import {
CopyOutlined,DownOutlined
} from '@ant-design/icons';
import { message ,Button,Tooltip , Drawer ,Dropdown} from "antd";
import Header from '../components/layout/Header';
import Aside from '../components/layout/Aside';
// import examplesSource from '../examples/*.tsx?raw';
import { useTranslation } from 'react-i18next';
  const langs = { en: { nativeName: "English" }, zh: { nativeName: "中文" } };
const HomeLayout: React.FC = () => {
  const { t,i18n} = useTranslation();
  // const [current, setCurrent] = useState(menuRoutes[0]);
  const [showCode, setShowCode] = useState(false);
  const [codeHtml, setCodeHtml] = useState('');
  // const history = useHistory();
  const location = useLocation();


  useEffect(() => {
    // const routePath = location.pathname;
    // const foundItem = menuRoutes.find((item: { path: any; }) => routePath === `/${item.path}`) || menuRoutes[0];
    // setCurrent(foundItem);
  }, [location.pathname]);

  const handleCommand = (command: any) => {


  };

  const setCurrentLang = (langTitle: string) => {
    // const currentLang = langs.find((lang: { title: string; }) => lang.title === langTitle);
    //  i18n.changeLanguage(currentLang);
  };

  const copyCode = async () => {
    try {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = codeHtml;
      const plainText = tempElement.innerText;

      await navigator.clipboard.writeText(plainText);
      message.success('复制成功');
    } catch (err) {
      message.error(err as string);
    }
  };

  // useEffect(() => {
  //   const highlightedCode = hljs.highlight(examplesSource[`../examples/${current.path}.tsx`], {
  //     language: 'html'
  //   }).value;
  //   setCodeHtml(highlightedCode);
  // }, [current]);

  const handleClick = (item: any) => {
    // history.push(item.path);
  };

  return (
    <div className="es-app">
      <Header>
        <div slot="navbar-end">
          {/* <Dropdown
            className="es-header-lang"
            trigger={['click']}
            menu={{ langs }}

          >
            <span className="el-dropdown-link">

              <DownOutlined />
            </span>
          </Dropdown> */}

          <a className="es-header-cube" onClick={(e) => e.preventDefault()}>
            {t('common.code')}
          </a>
        </div>
      </Header>
      <div className="es-main">
        <Aside className="es-sidebar">
          {/* {menuRoutes.map((item: { path: React.Key | null | undefined; meta: { title: any; }; }) => (
            <div
              key={item.path}
              className={['es-sidebar-item', { active: current.path === item.path }].join(' ')}
              onClick={() => handleClick(item)}
            >
              {t(`route.${item.meta?.title}`)}
            </div>
          ))} */}
        </Aside>
        <div className="es-content">
          {/* <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
          </Switch> */}
        </div>

        <Drawer open={showCode} onClose={setShowCode(false)}   title={t('common.code')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div />
            <Tooltip  content={t('common.copy')} placement="top">
              <Button
                type="text"
                icon={<CopyOutlined />}
                style={{ color: '#aabbcc', fontSize: '20px' }}
                onClick={copyCode}
              />
            </Tooltip>
          </div>
          <pre><code dangerouslySetInnerHTML={{ __html: codeHtml }} /></pre>
        </Drawer>
      </div>
    </div>
  );
};

export default HomeLayout;
