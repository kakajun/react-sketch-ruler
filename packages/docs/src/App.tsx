import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// 示例组件，用于演示路由配置
const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;

const App: React.FC = () => {
  return (
    <Router>
      <div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
