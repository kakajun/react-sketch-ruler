import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { menuRoutes } from '../router'
import 'highlight.js/styles/panda-syntax-light.css'
import hljs from 'highlight.js'
import { CopyOutlined, DownOutlined } from '@ant-design/icons'
import { message, Button, Tooltip, Drawer, Dropdown } from 'antd'
import Header from '../components/layout/Header'
import Aside from '../components/layout/Aside'
// import examplesSource from '../examples/*.tsx?raw';
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import './home.less'

type MenuItemType = {
  key: string
  label: string
}
const items: MenuItemType[] = [
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' }
]

const HomeLayout: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  console.log(location, 'location')

  const [currentPath, setCurrent] = useState(location.pathname)
  const [showCode, setShowCode] = useState(false)
  const [codeHtml, setCodeHtml] = useState('')

  const [currentLan, setCurrentLan] = useState('中文')

  const handleClick = (item: any) => {
    console.log(item, 'iiiiiii')
    setCurrent(item.path)
    navigate(item.path)
  }

  const copyCode = async () => {
    try {
      const tempElement = document.createElement('div')
      tempElement.innerHTML = codeHtml
      const plainText = tempElement.innerText

      await navigator.clipboard.writeText(plainText)
      message.success('复制成功')
    } catch (err) {
      message.error(err as string)
    }
  }
  useEffect(() => {
    console.log(i18n, 'i18n')

    setLang(i18n.language)
  }, [i18n])
  const setLang = (key: string) => {
    const obj = items.find((item: MenuItemType) => item.key === key)
    if (obj) {
      setCurrentLan(obj.label)
    }
  }
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    // console.log('click', e)
    setLang(e.key)
    i18n.changeLanguage(e.key)
  }
  return (
    <div className="es-app">
      <Header>
        <Dropdown
          className="es-header-lang"
          trigger={['click']}
          menu={{ items, onClick: (e) => handleMenuClick(e) }}
        >
          <a className="el-dropdown-link">
            {currentLan}
            <DownOutlined style={{ marginLeft: '8px' }} />
          </a>
        </Dropdown>

        <a className="es-header-cube" onClick={() => setShowCode(true)}>
          {t('common.code')}
        </a>
      </Header>
      <div className="es-main">
        <Aside>
          <div className="es-sidebar">
            {menuRoutes.map(
              (item: { path: React.Key | null | undefined; meta: { title: string } }) => (
                <div
                  key={item.path}
                  className={`es-sidebar-item ${currentPath === item.path || currentPath === '/' ? 'active' : ''}`}
                  onClick={() => handleClick(item)}
                >
                  {t(`route.${item.meta?.title}`)}
                </div>
              )
            )}
          </div>
        </Aside>
        <div className="es-content">
          <Outlet />
        </div>

        <Drawer open={showCode} onClose={() => setShowCode(false)} title={t('common.code')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div />
            <Tooltip title={t('common.copy')} placement="top">
              <Button
                type="text"
                icon={<CopyOutlined />}
                style={{ color: '#aabbcc', fontSize: '20px' }}
                onClick={copyCode}
              />
            </Tooltip>
          </div>
          <pre>
            <code dangerouslySetInnerHTML={{ __html: codeHtml }} />
          </pre>
        </Drawer>
      </div>
    </div>
  )
}

export default HomeLayout
