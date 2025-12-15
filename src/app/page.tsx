"use client";

import { useState } from "react";

export default function HomePage() {
  const [message, setMessage] = useState('欢迎使用CodeBanana桌面应用！');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
            CodeBanana 桌面应用
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9 }}>
            无需浏览器，直接在Windows桌面运行
          </p>
        </header>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '40px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ fontSize: '32px', marginBottom: '24px' }}>
            AI驱动的开发平台
          </h2>
          <div style={{
            background: 'rgba(76, 175, 80, 0.2)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              ✅ 所有功能已集成到桌面版本中
            </p>
            <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '20px' }}>
              点击下方按钮开始体验
            </p>
            <button 
              onClick={() => setMessage('AI助手已启动！')}
              style={{
                padding: '15px 30px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              启动AI助手
            </button>
            <p style={{ marginTop: '20px', fontSize: '18px' }}>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}