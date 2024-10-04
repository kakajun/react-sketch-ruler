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
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';
const langs = { en: { nativeName: "English" }, zh: { nativeName: "中文" } };
const langsList: MenuProps['items'] = [
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' },
]
const HomeLayout: React.FC = () => {
  const { t,i18n} = useTranslation();
  // const [current, setCurrent] = useState(menuRoutes[0]);
  const [showCode, setShowCode] = useState(false);
  const [codeHtml, setCodeHtml] = useState('');
  // const history = useHistory();
  const location = useLocation();

  return (
    <div className="es-app">
      <Header>
           <div slot="navbar-end">
          <Dropdown
            className="es-header-lang"
            trigger={['click']}
            menu={{ langsList }}

          >
            <span className="el-dropdown-link">

              <DownOutlined />
            </span>
          </Dropdown>

          <a className="es-header-cube" onClick={(e) => e.preventDefault()}>
            {t('common.code')}
          </a>
        </div>
          </Header>

    </div>
  );
};

export default HomeLayout;
