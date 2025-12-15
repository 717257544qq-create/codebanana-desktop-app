const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 设置相关
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // 账号相关
  getAccount: () => ipcRenderer.invoke('get-account'),
  saveAccount: (account) => ipcRenderer.invoke('save-account', account),
  clearAccount: () => ipcRenderer.invoke('clear-account'),
  
  // 翻译相关
  translateText: (text, targetLang) => ipcRenderer.invoke('translate-text', text, targetLang),
  
  // 服务地址
  setServiceUrl: (url) => ipcRenderer.invoke('set-service-url', url),
  getServiceUrl: () => ipcRenderer.invoke('get-service-url'),
  
  // 自动登录
  autoLogin: (credentials) => ipcRenderer.invoke('auto-login', credentials),
  
  // 通知相关
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // 窗口控制
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // 版本信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});

// 监听主进程消息
ipcRenderer.on('translation-result', (event, result) => {
  window.postMessage({ type: 'TRANSLATION_RESULT', data: result }, '*');
});

ipcRenderer.on('auto-login-result', (event, result) => {
  window.postMessage({ type: 'AUTO_LOGIN_RESULT', data: result }, '*');
});

ipcRenderer.on('settings-updated', (event, settings) => {
  window.postMessage({ type: 'SETTINGS_UPDATED', data: settings }, '*');
});