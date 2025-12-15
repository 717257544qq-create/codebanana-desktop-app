#!/bin/bash

# CodeBanana Desktop App - 快速部署到 GitHub
# 使用说明：
# 1. 将下面的 YOUR_USERNAME 替换为您的 GitHub 用户名
# 2. 复制整段命令到终端执行

echo "========================================"
echo "CodeBanana Desktop App - 快速部署"
echo "========================================"
echo ""

# ⚠️ 请在下面替换您的 GitHub 用户名
GITHUB_USERNAME="717257544qq@gmail.com"  # 例如: "john-doe"

# 检查是否已替换用户名
if [ "$GITHUB_USERNAME" = "717257544qq@gmail.com" ]; then
    echo "❌ 错误：请先编辑此脚本，将 717257544qq@gmail.com 替换为您的 GitHub 用户名！"
    echo ""
    echo "编辑方式："
    echo "1. 打开 快速部署命令.sh 文件"
    echo "2. 将第 13 行的 717257544qq@gmail.com 改为您的用户名"
    echo "3. 保存后重新运行"
    exit 1
fi

echo "📝 使用的 GitHub 用户名: $GITHUB_USERNAME"
echo ""

# 进入项目目录
cd /data/virtualorg_shared/ws_pre/dd10be3f-ac46-49e5-836c-40b9a190e7b1/codebanana-desktop-app

echo "📂 当前目录: $(pwd)"
echo ""

# 添加远程仓库
echo "🔗 步骤 1/2: 添加远程仓库..."
git remote add origin https://github.com/$GITHUB_USERNAME/codebanana-desktop-app.git 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 远程仓库添加成功"
else
    echo "⚠️  远程仓库已存在，尝试更新..."
    git remote set-url origin https://github.com/$GITHUB_USERNAME/codebanana-desktop-app.git
    echo "✅ 远程仓库 URL 已更新"
fi
echo ""

# 推送代码
echo "🚀 步骤 2/2: 推送代码到 GitHub..."
echo "提示：如果要求输入密码，请使用 GitHub Personal Access Token"
echo ""

git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✅ 代码推送成功！"
    echo "========================================"
    echo ""
    echo "📋 下一步："
    echo "1. 访问 Actions 页面查看构建进度："
    echo "   https://github.com/$GITHUB_USERNAME/codebanana-desktop-app/actions"
    echo ""
    echo "2. 构建完成后（约 8-10 分钟）："
    echo "   - 点击最新的工作流运行"
    echo "   - 在底部 Artifacts 区域下载 'windows-installer'"
    echo "   - 解压获得 CodeBanana-Setup-1.0.4.exe"
    echo ""
    echo "🎉 完成！"
else
    echo ""
    echo "========================================"
    echo "❌ 推送失败"
    echo "========================================"
    echo ""
    echo "常见原因："
    echo "1. 仓库不存在 - 请先访问 https://github.com/new 创建仓库"
    echo "2. 认证失败 - 需要使用 Personal Access Token 而非密码"
    echo "   获取 Token: https://github.com/settings/tokens"
    echo "3. 网络问题 - 检查网络连接"
    echo ""
    echo "详细说明请查看: GITHUB_部署指南.md"
fi
