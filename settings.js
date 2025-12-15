// 设置界面的 JavaScript 逻辑
class SettingsManager {
    constructor() {
        this.currentSettings = {};
        this.currentAccount = {};
        this.init();
    }
    
    async init() {
        try {
            // 加载当前设置
            this.currentSettings = await window.electronAPI.getSettings();
            this.currentAccount = await window.electronAPI.getAccount();
            
            // 应用设置到界面
            this.applySettingsToUI();
            
            // 绑定事件
            this.bindEvents();
            
            console.log('Settings manager initialized');
        } catch (error) {
            console.error('Failed to initialize settings:', error);
            this.showToast('设置初始化失败', 'error');
        }
    }
    
    // 应用设置到UI
    applySettingsToUI() {
        // 常规设置
        if (this.currentSettings.serviceUrl) {
            document.getElementById('serviceUrl').value = this.currentSettings.serviceUrl;
        }
        
        if (this.currentSettings.theme) {
            document.getElementById('theme').value = this.currentSettings.theme;
        }
        
        document.getElementById('autoLogin').checked = this.currentSettings.autoLogin || false;
        
        // 账号设置
        if (this.currentAccount) {
            document.getElementById('username').value = this.currentAccount.username || '';
            document.getElementById('password').value = this.currentAccount.password || '';
            document.getElementById('rememberAccount').checked = this.currentSettings.rememberAccount || false;
        }
        
        // 翻译设置
        document.getElementById('translationEnabled').checked = this.currentSettings.translationEnabled !== false;
        
        if (this.currentSettings.language) {
            document.getElementById('defaultLanguage').value = this.currentSettings.language;
        }
        
        // 高级设置
        if (this.currentSettings.windowSize) {
            const size = `${this.currentSettings.windowSize.width},${this.currentSettings.windowSize.height}`;
            document.getElementById('windowSize').value = size;
        }
        
        document.getElementById('enableDevTools').checked = this.currentSettings.enableDevTools || false;
        
        // 应用信息
        this.updateAppInfo();
    }
    
    // 绑定事件
    bindEvents() {
        // 服务地址测试
        document.getElementById('serviceUrl').addEventListener('blur', () => {
            this.testServiceConnection();
        });
        
        // 实时翻译测试
        document.getElementById('testText').addEventListener('input', 
            this.debounce(() => this.testTranslation(), 1000)
        );
    }
    
    // 更新应用信息
    async updateAppInfo() {
        try {
            const version = await window.electronAPI.getAppVersion();
            document.getElementById('appVersion').textContent = version;
            
            // 检查服务状态
            const serviceUrl = document.getElementById('serviceUrl').value;
            if (serviceUrl) {
                this.checkServiceStatus(serviceUrl);
            }
        } catch (error) {
            console.error('Failed to update app info:', error);
        }
    }
    
    // 检查服务状态
    async checkServiceStatus(url) {
        try {
            const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
            document.getElementById('appStatus').innerHTML = 
                '<span class="status-indicator status-online"></span>服务在线';
        } catch (error) {
            document.getElementById('appStatus').innerHTML = 
                '<span class="status-indicator status-offline"></span>服务离线';
        }
    }
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 显示提示消息
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // 测试服务连接
    async testServiceConnection() {
        const url = document.getElementById('serviceUrl').value;
        if (!url) return;
        
        try {
            this.showToast('正在测试连接...', 'info');
            await this.checkServiceStatus(url);
            this.showToast('服务连接正常');
        } catch (error) {
            this.showToast('服务连接失败：' + error.message, 'error');
        }
    }
    
    // 测试翻译功能
    async testTranslation() {
        const text = document.getElementById('testText').value;
        const targetLang = document.getElementById('defaultLanguage').value;
        const resultDiv = document.getElementById('translationResult');
        
        if (!text.trim()) {
            resultDiv.textContent = '翻译结果将显示在这里...';
            return;
        }
        
        try {
            resultDiv.innerHTML = '<em>翻译中...</em>';
            const result = await window.electronAPI.translateText(text, targetLang);
            
            if (result && result.translation) {
                resultDiv.innerHTML = `
                    <strong>翻译结果:</strong> ${result.translation}<br>
                    <small>来源: ${result.fromCache ? '缓存' : '在线'} | 置信度: ${(result.confidence * 100).toFixed(0)}%</small>
                `;
            } else {
                resultDiv.innerHTML = '<em style="color: #dc3545;">翻译失败</em>';
            }
        } catch (error) {
            console.error('Translation test failed:', error);
            resultDiv.innerHTML = `<em style="color: #dc3545;">翻译错误: ${error.message}</em>`;
        }
    }
    
    // 测试登录
    async testLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            this.showToast('请输入用户名和密码', 'error');
            return;
        }
        
        try {
            this.showToast('正在测试登录...', 'info');
            const result = await window.electronAPI.autoLogin({ username, password });
            
            if (result && result.success) {
                this.showToast('登录测试成功');
            } else {
                this.showToast('登录测试失败：' + (result.error || '未知错误'), 'error');
            }
        } catch (error) {
            console.error('Login test failed:', error);
            this.showToast('登录测试失败：' + error.message, 'error');
        }
    }
    
    // 清除账号
    async clearAccount() {
        if (confirm('确定要清除保存的账号信息吗？此操作不可撤销。')) {
            try {
                await window.electronAPI.clearAccount();
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
                document.getElementById('rememberAccount').checked = false;
                this.showToast('账号信息已清除');
            } catch (error) {
                console.error('Failed to clear account:', error);
                this.showToast('清除账号失败', 'error');
            }
        }
    }
    
    // 保存设置
    async saveSettings() {
        try {
            // 收集设置数据
            const settings = {
                serviceUrl: document.getElementById('serviceUrl').value,
                theme: document.getElementById('theme').value,
                autoLogin: document.getElementById('autoLogin').checked,
                translationEnabled: document.getElementById('translationEnabled').checked,
                language: document.getElementById('defaultLanguage').value,
                rememberAccount: document.getElementById('rememberAccount').checked,
                enableDevTools: document.getElementById('enableDevTools').checked
            };
            
            // 窗口大小
            const windowSize = document.getElementById('windowSize').value.split(',');
            if (windowSize.length === 2) {
                settings.windowSize = {
                    width: parseInt(windowSize[0]),
                    height: parseInt(windowSize[1])
                };
            }
            
            // 保存设置
            await window.electronAPI.saveSettings(settings);
            
            // 保存账号信息（如果选择记住）
            if (settings.rememberAccount) {
                const account = {
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                };
                
                if (account.username && account.password) {
                    await window.electronAPI.saveAccount(account);
                }
            }
            
            // 应用服务地址更改
            if (settings.serviceUrl !== this.currentSettings.serviceUrl) {
                await window.electronAPI.setServiceUrl(settings.serviceUrl);
            }
            
            this.showToast('设置已保存');
            
            // 延迟关闭窗口
            setTimeout(() => {
                window.electronAPI.closeWindow();
            }, 1500);
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showToast('保存设置失败：' + error.message, 'error');
        }
    }
    
    // 取消设置
    cancelSettings() {
        if (confirm('确定要放弃更改吗？')) {
            window.electronAPI.closeWindow();
        }
    }
    
    // 导出设置
    async exportSettings() {
        try {
            const settings = await window.electronAPI.getSettings();
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = 'codebanana-settings.json';
            link.click();
            
            this.showToast('设置已导出');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('导出失败', 'error');
        }
    }
    
    // 导入设置
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (event) => {
            try {
                const file = event.target.files[0];
                if (!file) return;
                
                const text = await file.text();
                const settings = JSON.parse(text);
                
                await window.electronAPI.saveSettings(settings);
                this.applySettingsToUI();
                this.showToast('设置已导入');
            } catch (error) {
                console.error('Import failed:', error);
                this.showToast('导入失败：' + error.message, 'error');
            }
        };
        
        input.click();
    }
    
    // 重置设置
    async resetSettings() {
        if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
            try {
                const defaultSettings = {
                    serviceUrl: 'https://pre.codebanana.com',
                    autoLogin: false,
                    language: 'zh-CN',
                    theme: 'auto',
                    windowSize: { width: 1600, height: 1000 },
                    rememberAccount: false,
                    translationEnabled: true,
                    enableDevTools: false
                };
                
                await window.electronAPI.saveSettings(defaultSettings);
                await window.electronAPI.clearAccount();
                
                this.applySettingsToUI();
                this.showToast('设置已重置');
            } catch (error) {
                console.error('Reset failed:', error);
                this.showToast('重置失败', 'error');
            }
        }
    }
}

// 标签页切换
function switchTab(tabName) {
    // 移除所有活动状态
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 激活选中的标签
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// 全局函数（从 HTML 调用）
let settingsManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
});

// 导出函数供 HTML 使用
function saveSettings() {
    settingsManager.saveSettings();
}

function cancelSettings() {
    settingsManager.cancelSettings();
}

function testLogin() {
    settingsManager.testLogin();
}

function clearAccount() {
    settingsManager.clearAccount();
}

function testTranslation() {
    settingsManager.testTranslation();
}

function exportSettings() {
    settingsManager.exportSettings();
}

function importSettings() {
    settingsManager.importSettings();
}

function resetSettings() {
    settingsManager.resetSettings();
}

// 监听来自主进程的消息
window.addEventListener('message', (event) => {
    if (event.data.type === 'TRANSLATION_RESULT') {
        console.log('Translation result received:', event.data.data);
    } else if (event.data.type === 'AUTO_LOGIN_RESULT') {
        console.log('Auto login result received:', event.data.data);
    } else if (event.data.type === 'SETTINGS_UPDATED') {
        console.log('Settings updated:', event.data.data);
        settingsManager.applySettingsToUI();
    }
});