import React, { useState, useEffect, useRef } from 'react';
import { Router, Route, Switch, Link, useHistory, useLocation } from 'react-router-dom';
import { menuRoutes } from '../router';
import 'highlight.js/styles/panda-syntax-light.css';
import hljs from 'highlight.js';
import { CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import Header from '../components/layout/Header';
import Aside from '../components/layout/Aside';
import { langs, t, useLocaleStore } from 'root-common/i18n';
import examplesSource from '../examples/*.vue?raw';

const EsApp: React.FC = () => {
  const [current, setCurrent] = useState(menuRoutes[0]);
  const [showCode, setShowCode] = useState(false);
  const [codeHtml, setCodeHtml] = useState('');
  const history = useHistory();
  const location = useLocation();
  const useLocale = useLocaleStore();

  useEffect(() => {
    const routePath = location.pathname;
    const foundItem = menuRoutes.find((item) => routePath === `/${item.path}`) || menuRoutes[0];
    setCurrent(foundItem);
  }, [location.pathname]);

  const handleCommand = (command: any) => {
    console.log(command);
    setCurrentLang(command.title);
    useLocale.setLocale(command.key);
  };

  const setCurrentLang = (langTitle: string) => {
    const currentLang = langs.find((lang) => lang.title === langTitle);
    if (currentLang) {
      useLocale.setLocale(currentLang.key);
    }
  };

  const copyCode = async () => {
    try {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = codeHtml;
      const plainText = tempElement.innerText;

      await navigator.clipboard.writeText(plainText);
      ElMessage.success('复制成功');
    } catch (err) {
      ElMessage.error(err as string);
    }
  };

  useEffect(() => {
    const highlightedCode = hljs.highlight(examplesSource[`../examples/${current.path}.vue`], {
      language: 'html'
    }).value;
    setCodeHtml(highlightedCode);
  }, [current]);

  const handleClick = (item: any) => {
    history.push(item.path);
  };

  return (
    <div className="es-app">
      <Header>
        <div slot="navbar-end">
          <el-dropdown
            className="es-header-lang"
            trigger="click"
            onCommand={handleCommand}
          >
            <span className="el-dropdown-link">
              {langs.find((lang) => lang.key === useLocale.locale)?.title}
              <el-icon className="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template slot="dropdown">
              <el-dropdown-menu>
                {langs.map((lang) => (
                  <el-dropdown-item command={lang}>
                    {lang.title}
                  </el-dropdown-item>
                ))}
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <a className="es-header-cube" onClick={(e) => e.preventDefault()}>
            {t('common.code')}
          </a>
        </div>
      </Header>
      <div className="es-main">
        <Aside className="es-sidebar">
          {menuRoutes.map((item) => (
            <div
              key={item.path}
              className={['es-sidebar-item', { active: current.path === item.path }].join(' ')}
              onClick={() => handleClick(item)}
            >
              {t(`route.${item.meta?.title}`)}
            </div>
          ))}
        </Aside>
        <div className="es-content">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
          </Switch>
        </div>

        <el-drawer v-model={showCode} title={t('common.code')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div />
            <el-tooltip content={t('common.copy')} placement="top">
              <el-button
                type="text"
                icon={CopyDocument}
                style={{ color: '#aabbcc', fontSize: '20px' }}
                onClick={copyCode}
              />
            </el-tooltip>
          </div>
          <pre><code dangerouslySetInnerHTML={{ __html: codeHtml }} /></pre>
        </el-drawer>
      </div>
    </div>
  );
};

export default EsApp;
