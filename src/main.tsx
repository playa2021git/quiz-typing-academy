import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Reactアプリの入口です。画面ごとの状態管理はApp.tsxに集約しています。
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
