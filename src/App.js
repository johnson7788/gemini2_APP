import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import GeminiCall from './GeminiCall/Home'

const SetPageTitle = ({ title, children }) => {
  useEffect(() => {
    document.title = title; // 动态修改标题
  }, [title]);

  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <div className='h-full w-full relative'>
        <Routes>
          <Route path="/geminicall" element={
              <SetPageTitle title="GeminiCall">
                <GeminiCall />
              </SetPageTitle>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

