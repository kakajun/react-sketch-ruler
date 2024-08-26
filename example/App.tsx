import React, { useState } from 'react'
import UserRuler from './UserRulerts'
import UserRulertsShadow from './UserRulertsShadow'

function App() {
  // 定义当前激活的 tab 的状态
  const [activeTab, setActiveTab] = useState('tab1')

  // 处理 tab 切换的函数
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Tab 按钮 */}
      <button onClick={() => handleTabChange('tab1')}>demo1</button>
      <button onClick={() => handleTabChange('tab2')}>demo2</button>

      {/* 根据 activeTab 显示不同的内容 */}
      {activeTab === 'tab1' && <UserRuler />}
      {activeTab === 'tab2' && <UserRulertsShadow />}
    </div>
  )
}

export default App
