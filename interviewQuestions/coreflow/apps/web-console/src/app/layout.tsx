import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header style={{ padding: 12, borderBottom: '1px solid #eee' }}>
          <nav style={{ display: 'flex', gap: 12 }}>
            <a href="/">首页</a>
            <a href="/image">图像生成</a>
            <a href="/model">模型管理</a>
            <a href="/video">视频通话</a>
          </nav>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
