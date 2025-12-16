const { app, BrowserWindow, Menu, dialog, ipcMain, shell, session, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const Storage = require('./storage');
const Translator = require('./translator');

let mainWindow;
let settingsWindow;
let storage;
let translator;

// 初始化存储和翻译
function initializeServices() {
  storage = new Storage();
  translator = new Translator(storage);
  
  // 清理过期缓存
  translator.storage.cleanupCache();
  
  console.log('Services initialized');
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '设置',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            openSettingsWindow();
          }
        },
        { type: 'separator' },
        {
          label: '更换应用图标',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: '选择新的应用图标',
              buttonLabel: '应用图标',
              filters: [
                { name: '图片文件', extensions: ['png', 'jpg', 'jpeg', 'ico'] }
              ],
              properties: ['openFile']
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              try {
                const sourcePath = result.filePaths[0];
                const targetPath = path.join(__dirname, 'icon.png');
                
                fs.copyFileSync(sourcePath, targetPath);
                mainWindow.setIcon(targetPath);
                
                showNotification('图标更新成功', '重启应用后图标将完全生效');
              } catch (error) {
                dialog.showErrorBox('错误', '更新图标失败：' + error.message);
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: '重做',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        { type: 'separator' },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        }
      ]
    },
    {
      label: '工具',
      submenu: [
        {
          label: '翻译选中文本',
          accelerator: 'CmdOrCtrl+T',
          click: async () => {
            try {
              const selectedText = await mainWindow.webContents.executeJavaScript(
                'window.getSelection().toString()'
              );
              
              if (selectedText && selectedText.trim()) {
                const settings = storage.getSettings();
                const targetLang = settings.language || 'zh-CN';
                
                const result = await translator.translate(selectedText, targetLang);
                
                if (result && result.translation) {
                  showNotification('翻译结果', result.translation);
                } else {
                  showNotification('翻译失败', '无法翻译选中的文本');
                }
              } else {
                showNotification('提示', '请先选中要翻译的文本');
              }
            } catch (error) {
              console.error('Translation error:', error);
              showNotification('翻译失败', error.message);
            }
          }
        },
        { type: 'separator' },
        {
          label: '清除缓存',
          click: async () => {
            const response = await dialog.showMessageBox(mainWindow, {
              type: 'question',
              buttons: ['取消', '确定'],
              defaultId: 1,
              title: '清除缓存',
              message: '确定要清除所有缓存数据吗？',
              detail: '这将清除翻译缓存和浏览器缓存，但不会影响账号设置。'
            });
            
            if (response.response === 1) {
              try {
                // 清除翻译缓存
                translator.storage.saveTranslationCache({});
                
                // 清除浏览器缓存
                await session.defaultSession.clearStorageData();
                
                showNotification('缓存已清除', '所有缓存数据已清除');
              } catch (error) {
                dialog.showErrorBox('错误', '清除缓存失败：' + error.message);
              }
            }
          }
        }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.minimize();
          }
        },
        {
          label: '全屏',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '使用说明',
          click: () => {
            const helpPath = path.join(__dirname, 'icons', '图标使用说明.txt');
            if (fs.existsSync(helpPath)) {
              shell.openPath(helpPath);
            } else {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: '使用说明',
                message: 'CodeBanana 桌面应用 v1.0.3',
                detail: '• 使用 Ctrl+T 翻译选中文本\n• 使用 Ctrl+, 打开设置\n• 支持自定义服务地址\n• 支持账号自动登录\n• 内置多语言翻译功能'
              });
            }
          }
        },
        {
          label: '关于 CodeBanana',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 CodeBanana',
              message: 'CodeBanana 桌面应用 v1.0.3',
              detail: 'AI驱动的智能编程助手 - 高级版\n\n✨ 新功能：\n• 🌍 内置翻译功能\n• 💾 账号自动保存\n• 🔧 自定义服务地址\n• 🚀 跳过网页登录\n• 🎨 自定义应用图标\n\n访问官网了解更多功能'
            });
          }
        },
        {
          label: '访问官网',
          click: () => {
            const settings = storage.getSettings();
            const url = settings.serviceUrl || 'https://pre.codebanana.com';
            shell.openExternal(url);
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 显示通知
function showNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
}

// 打开设置窗口
function openSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }
  
  settingsWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'CodeBanana 设置',
    resizable: true,
    maximizable: false,
    fullscreenable: false
  });
  
  settingsWindow.loadFile('settings.html');
  
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });
  
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// 自动登录功能
async function performAutoLogin() {
  try {
    const settings = storage.getSettings();
    const account = storage.getAccount();
    
    if (settings.autoLogin && account && account.username && account.password) {
      console.log('Attempting auto login for:', account.username);
      
      // 注入自动登录脚本
      const loginScript = `
        (function() {
          function attemptLogin() {
            // 查找用户名输入框
            const usernameInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[name*="user"], input[name*="email"], input[placeholder*="用户"], input[placeholder*="邮箱"]');
            // 查找密码输入框
            const passwordInputs = document.querySelectorAll('input[type="password"]');
            // 查找登录按钮
            const loginButtons = document.querySelectorAll('button[type="submit"], input[type="submit"], button:contains("登录"), button:contains("Login"), .login-btn, .btn-login');
            
            if (usernameInputs.length > 0 && passwordInputs.length > 0) {
              const usernameInput = usernameInputs[0];
              const passwordInput = passwordInputs[0];
              
              // 填入账号信息
              usernameInput.value = '${account.username}';
              passwordInput.value = '${account.password}';
              
              // 触发输入事件
              usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
              passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
              
              // 尝试点击登录按钮
              if (loginButtons.length > 0) {
                setTimeout(() => {
                  loginButtons[0].click();
                }, 500);
              }
              
              return true;
            }
            return false;
          }
          
          // 页面加载完成后尝试登录
          if (document.readyState === 'complete') {
            attemptLogin();
          } else {
            window.addEventListener('load', attemptLogin);
          }
          
          // 如果页面有动态内容，延迟重试
          setTimeout(attemptLogin, 2000);
          setTimeout(attemptLogin, 5000);
        })();
      `;
      
      // 等待页面加载后执行
      mainWindow.webContents.once('did-finish-load', () => {
        setTimeout(() => {
          mainWindow.webContents.executeJavaScript(loginScript).catch(console.error);
        }, 1000);
      });
    }
  } catch (error) {
    console.error('Auto login failed:', error);
  }
}

function createWindow() {
  const settings = storage.getSettings();
  const iconPath = path.join(__dirname, 'icon.png');
  
  // 获取窗口大小设置
  const windowSize = settings.windowSize || { width: 1600, height: 1000 };
  
  mainWindow = new BrowserWindow({
    width: windowSize.width,
    height: windowSize.height,
    minWidth: 1000,
    minHeight: 700,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      // 阻止第三方内容和弹窗
      partition: 'persist:main',
      contextIsolation: true
    },
    title: 'CodeBanana - AI编程助手 v1.0.4',
    titleBarStyle: 'default',
    frame: true,
    transparent: false,
    backgroundColor: '#1e1e1e',
    show: false,
    center: true,
    resizable: true,
    maximizable: true,
    fullscreenable: true
  });

  // 窗口准备完成后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 添加淡入效果
    mainWindow.setOpacity(0);
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity += 0.1;
      mainWindow.setOpacity(opacity);
      if (opacity >= 1) {
        clearInterval(fadeIn);
      }
    }, 30);
  });

  // 加载本地 Next.js 登录页面
  const isDev = process.env.NODE_ENV === 'development';
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '.next', 'server', 'app', 'index.html')}`;
  
  console.log('Loading login page:', startUrl);
  
  // 生产环境：加载打包后的静态文件
  if (!isDev) {
    mainWindow.loadFile(path.join(__dirname, 'out', 'index.html'));
  } else {
    mainWindow.loadURL(startUrl);
  }

  // 优化加载体验
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('开始加载 CodeBanana...');
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('CodeBanana 加载完成');
  });
  
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('加载失败:', errorDescription);
    dialog.showErrorBox('连接失败', 
      `无法连接到 CodeBanana 服务\n\n服务地址: ${serviceUrl}\n请检查网络连接或在设置中修改服务地址\n\n错误信息: ${errorDescription}`);
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// IPC 处理程序
function setupIPC() {
  // 获取设置
  ipcMain.handle('get-settings', () => {
    return storage.getSettings();
  });
  
  // 保存设置
  ipcMain.handle('save-settings', (event, settings) => {
    return storage.saveSettings(settings);
  });
  
  // 获取账号
  ipcMain.handle('get-account', () => {
    return storage.getAccount();
  });
  
  // 保存账号
  ipcMain.handle('save-account', (event, account) => {
    return storage.saveAccount(account);
  });
  
  // 清除账号
  ipcMain.handle('clear-account', () => {
    return storage.clearAccount();
  });
  
  // 翻译文本
  ipcMain.handle('translate-text', async (event, text, targetLang) => {
    try {
      return await translator.translate(text, targetLang);
    } catch (error) {
      throw error;
    }
  });
  
  // 设置服务地址
  ipcMain.handle('set-service-url', (event, url) => {
    const settings = storage.getSettings();
    settings.serviceUrl = url;
    storage.saveSettings(settings);
    return true;
  });
  
  // 获取服务地址
  ipcMain.handle('get-service-url', () => {
    const settings = storage.getSettings();
    return settings.serviceUrl || 'https://pre.codebanana.com';
  });
  
  // 自动登录
  ipcMain.handle('auto-login', async (event, credentials) => {
    try {
      // 这里可以添加实际的登录逻辑
      // 现在只是返回成功状态
      return { success: true, message: 'Login test completed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // 显示通知
  ipcMain.handle('show-notification', (event, title, body) => {
    showNotification(title, body);
    return true;
  });
  
  // 窗口控制
  ipcMain.handle('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
    return true;
  });
  
  ipcMain.handle('close-window', () => {
    if (settingsWindow) {
      settingsWindow.close();
    }
    return true;
  });
  
  // 获取应用版本
  ipcMain.handle('get-app-version', () => {
    return app.getVersion() || '1.0.3';
  });
}

app.whenReady().then(() => {
  // 初始化服务
  initializeServices();
  
  // 设置 IPC
  setupIPC();
  
  // 阻止第三方登录弹窗（Google, Facebook 等）
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ['*://accounts.google.com/*', '*://www.facebook.com/*', '*://github.com/login/*'] },
    (details, callback) => {
      console.log('Blocked third-party login:', details.url);
      callback({ cancel: true });
    }
  );
  
  // 创建窗口和菜单
  createWindow();
  createMenu();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 设置应用名称
app.setName('CodeBanana');

// 防止多实例运行
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}