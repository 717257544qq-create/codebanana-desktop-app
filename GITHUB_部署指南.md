# 🚀 CodeBanana 桌面应用 - GitHub 自动构建指南

## 📋 概述

本指南将帮助您在 **3 分钟内**完成 GitHub 仓库创建和代码推送，然后自动构建 Windows NSIS 安装程序。

**总耗时：** 约 3 分钟手动操作 + 8 分钟自动构建 = 11 分钟

---

## ✅ 准备工作检查

- [x] 代码已全部提交到本地 Git 仓库
- [x] GitHub Actions 工作流已配置
- [x] 构建脚本已就绪
- [ ] 您有 GitHub 账号（如果没有，请先注册：https://github.com/signup）

---

## 📝 操作步骤（仅 3 步）

### 第 1 步：创建 GitHub 仓库（1 分钟）

**1.1 访问创建页面**
```
https://github.com/new
```

**1.2 填写仓库信息**
- **Repository name（仓库名）:** `codebanana-desktop-app`
- **Description（描述）:** `CodeBanana AI-powered desktop application`
- **可见性:** 选择 `Public`（公开）或 `Private`（私有）都可以
- **⚠️ 重要:** 
  - ❌ **不要勾选** "Add a README file"
  - ❌ **不要勾选** "Add .gitignore"
  - ❌ **不要勾选** "Choose a license"
  - （因为我们本地已经有这些文件了）

**1.3 点击 "Create repository" 按钮**

**1.4 复制仓库地址**
创建成功后，页面会显示仓库 URL，类似：
```
https://github.com/你的用户名/codebanana-desktop-app.git
```
**⚠️ 请复制这个地址，下一步需要用到！**

---

### 第 2 步：推送代码到 GitHub（1 分钟）

**2.1 打开终端**
进入项目目录：
```bash
cd /data/virtualorg_shared/ws_pre/dd10be3f-ac46-49e5-836c-40b9a190e7b1/codebanana-desktop-app
```

**2.2 添加远程仓库**
将下面命令中的 `你的用户名` 替换为您的 GitHub 用户名，然后执行：
```bash
git remote add origin https://github.com/你的用户名/codebanana-desktop-app.git
```

**示例：**
```bash
# 如果您的用户名是 john-doe
git remote add origin https://github.com/john-doe/codebanana-desktop-app.git
```

**2.3 推送代码**
```bash
git push -u origin master
```

**如果要求输入账号密码：**
- **Username:** 您的 GitHub 用户名
- **Password:** 您的 GitHub Personal Access Token（不是密码！）
  - 如何获取 Token：https://github.com/settings/tokens
  - 点击 "Generate new token (classic)"
  - 勾选 `repo` 权限
  - 复制生成的 token（以 `ghp_` 开头）

**推送成功标志：**
```
Counting objects: 183, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (183/183), done.
Writing objects: 100% (183/183), done.
Total 183 (delta 0), reused 0 (delta 0)
To https://github.com/你的用户名/codebanana-desktop-app.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

---

### 第 3 步：监控自动构建（5-10 分钟，无需操作）

**3.1 查看构建进度**
访问您的仓库 Actions 页面：
```
https://github.com/你的用户名/codebanana-desktop-app/actions
```

您会看到一个正在运行的工作流：
- 名称：`Build Windows Installer`
- 状态：🟡 黄色圆圈（正在运行）

**3.2 构建阶段说明**
工作流包含以下步骤：
1. ✅ Checkout code（获取代码）- 10 秒
2. ✅ Setup Node.js（安装 Node.js）- 30 秒
3. ✅ Install dependencies（安装依赖）- 2-3 分钟
4. ✅ Build Windows NSIS Installer（构建安装程序）- 3-5 分钟
5. ✅ Upload artifacts（上传文件）- 30 秒

**3.3 构建成功标志**
- 状态变为：✅ 绿色对勾（成功）
- 时间：通常 8-10 分钟

---

## 📦 下载安装程序

### 方式 1：从 Actions 下载（立即可用）

**步骤：**
1. 访问 Actions 页面：`https://github.com/你的用户名/codebanana-desktop-app/actions`
2. 点击最近完成的工作流运行（绿色对勾）
3. 滚动到页面底部 "Artifacts" 区域
4. 点击 `windows-installer` 下载（ZIP 文件）
5. 解压 ZIP，获得 `CodeBanana-Setup-1.0.4.exe`

### 方式 2：从 Release 下载（如果创建了标签）

如果您推送了版本标签（如 `v1.0.4`），安装程序会自动发布到 Release：

**创建标签和发布：**
```bash
cd /data/virtualorg_shared/ws_pre/dd10be3f-ac46-49e5-836c-40b9a190e7b1/codebanana-desktop-app
git tag v1.0.4
git push origin v1.0.4
```

**下载地址：**
```
https://github.com/你的用户名/codebanana-desktop-app/releases
```

---

## 🎯 获得的文件

下载并解压 `windows-installer.zip` 后，您将获得：

```
windows-installer/
├── CodeBanana-Setup-1.0.4.exe    ← 主安装程序（NSIS）
├── CodeBanana-1.0.4.exe.blockmap  ← 更新用的 blockmap 文件
└── 使用说明.txt                   ← 用户使用指南
```

**主要文件：**
- **CodeBanana-Setup-1.0.4.exe** - 这就是您需要的 Windows 安装程序！
- 大小：约 110-120 MB
- 双击即可安装到 Windows 系统

---

## 🔄 后续更新流程

当您修改代码后，只需：

```bash
cd /data/virtualorg_shared/ws_pre/dd10be3f-ac46-49e5-836c-40b9a190e7b1/codebanana-desktop-app

# 提交更改
git add .
git commit -m "描述您的更改"

# 推送到 GitHub（自动触发构建）
git push origin master
```

每次推送都会自动构建新的安装程序！

---

## 📊 构建统计

**资源消耗：**
- GitHub Actions 免费额度：2000 分钟/月（公开仓库无限制）
- 每次构建耗时：约 8-10 分钟
- 每月可构建次数：约 200 次（私有仓库）或无限次（公开仓库）

**成本：**
- 公开仓库：✅ 完全免费
- 私有仓库：✅ 免费额度内免费

---

## ⚠️ 常见问题

### Q1: 推送代码时要求输入密码？

**A:** GitHub 已经不支持密码登录，需要使用 Personal Access Token：

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token（以 `ghp_` 开头）
5. 在密码处粘贴 token

### Q2: 构建失败怎么办？

**A:** 点击失败的工作流，查看详细日志：

常见原因：
- 依赖安装失败 → 检查 `package.json`
- 构建超时 → GitHub 限制单个 job 不能超过 6 小时
- 权限问题 → 检查 `GITHUB_TOKEN` 权限

### Q3: 如何修改应用版本号？

**A:** 编辑 `package.json`：
```json
{
  "version": "1.0.5"  // 修改这里
}
```

然后提交并推送：
```bash
git add package.json
git commit -m "Bump version to 1.0.5"
git push origin master
```

### Q4: 构建出来的 exe 在哪里下载？

**A:** 有两个位置：

**位置 1（立即可用）：** Actions → 点击工作流运行 → Artifacts 区域 → `windows-installer`

**位置 2（如果推送了标签）：** Releases 页面 → 选择版本 → Assets 区域

### Q5: 可以同时构建 Mac 和 Linux 版本吗？

**A:** 可以！修改 `.github/workflows/build-installer.yml`，添加其他平台的 job。

---

## 🎉 完成！

按照以上步骤，您应该已经成功：

- ✅ 创建了 GitHub 仓库
- ✅ 推送了代码到 GitHub
- ✅ 触发了自动构建
- ✅ 获得了 Windows NSIS 安装程序

**🎯 最终文件：** `CodeBanana-Setup-1.0.4.exe`

---

## 📞 技术支持

如果遇到问题，请检查：

1. **GitHub Actions 日志** - 详细的构建输出
2. **本地构建** - 确保 `npm run build` 能成功
3. **工作流语法** - 检查 YAML 文件格式

---

**祝您构建顺利！** 🚀

---

## 附录：完整命令速查表

```bash
# 1. 添加远程仓库（替换用户名）
git remote add origin https://github.com/你的用户名/codebanana-desktop-app.git

# 2. 推送代码
git push -u origin master

# 3. 创建版本标签（可选）
git tag v1.0.4
git push origin v1.0.4

# 4. 查看构建（浏览器）
# https://github.com/你的用户名/codebanana-desktop-app/actions

# 5. 后续更新
git add .
git commit -m "更新说明"
git push origin master
```

---

**文档版本：** 1.0.0  
**最后更新：** 2025-12-15  
**适用版本：** CodeBanana Desktop App v1.0.4
