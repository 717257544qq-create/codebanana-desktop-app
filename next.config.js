/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // 禁用严格模式避免开发时的双重渲染
  reactStrictMode: false,
  // 配置基础路径
  basePath: '',
  assetPrefix: '',
  trailingSlash: true,
}

module.exports = nextConfig
