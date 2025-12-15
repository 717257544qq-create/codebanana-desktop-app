const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const crypto = require('crypto');

class Storage {
  constructor() {
    this.userDataPath = app.getPath('userData');
    this.configPath = path.join(this.userDataPath, 'config.json');
    this.accountPath = path.join(this.userDataPath, 'account.json');
    this.encryptionKey = 'codebanana-desktop-2025';
    
    this.ensureDirectoryExists();
  }
  
  ensureDirectoryExists() {
    if (!fs.existsSync(this.userDataPath)) {
      fs.mkdirSync(this.userDataPath, { recursive: true });
    }
  }
  
  // 加密函数
  encrypt(text) {
    try {
      const cipher = crypto.createCipher('aes192', this.encryptionKey);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // 如果加密失败，返回原文
    }
  }
  
  // 解密函数
  decrypt(encryptedText) {
    try {
      const decipher = crypto.createDecipher('aes192', this.encryptionKey);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // 如果解密失败，返回原文
    }
  }
  
  // 获取设置
  getSettings() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(data);
      }
      
      // 默认设置
      return {
        serviceUrl: 'https://pre.codebanana.com',
        autoLogin: false,
        language: 'zh-CN',
        theme: 'auto',
        windowSize: { width: 1600, height: 1000 },
        rememberAccount: false,
        translationEnabled: true,
        version: '1.0.3'
      };
    } catch (error) {
      console.error('Error reading settings:', error);
      return {};
    }
  }
  
  // 保存设置
  saveSettings(settings) {
    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      fs.writeFileSync(this.configPath, JSON.stringify(newSettings, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }
  
  // 获取账号信息
  getAccount() {
    try {
      if (fs.existsSync(this.accountPath)) {
        const data = fs.readFileSync(this.accountPath, 'utf8');
        const parsed = JSON.parse(data);
        
        // 解密敏感信息
        if (parsed.password) {
          parsed.password = this.decrypt(parsed.password);
        }
        if (parsed.token) {
          parsed.token = this.decrypt(parsed.token);
        }
        
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error reading account:', error);
      return null;
    }
  }
  
  // 保存账号信息
  saveAccount(account) {
    try {
      const accountData = { ...account };
      
      // 加密敏感信息
      if (accountData.password) {
        accountData.password = this.encrypt(accountData.password);
      }
      if (accountData.token) {
        accountData.token = this.encrypt(accountData.token);
      }
      
      accountData.savedAt = new Date().toISOString();
      
      fs.writeFileSync(this.accountPath, JSON.stringify(accountData, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving account:', error);
      return false;
    }
  }
  
  // 清除账号信息
  clearAccount() {
    try {
      if (fs.existsSync(this.accountPath)) {
        fs.unlinkSync(this.accountPath);
      }
      return true;
    } catch (error) {
      console.error('Error clearing account:', error);
      return false;
    }
  }
  
  // 获取翻译缓存
  getTranslationCache() {
    try {
      const cachePath = path.join(this.userDataPath, 'translation-cache.json');
      if (fs.existsSync(cachePath)) {
        const data = fs.readFileSync(cachePath, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('Error reading translation cache:', error);
      return {};
    }
  }
  
  // 保存翻译缓存
  saveTranslationCache(cache) {
    try {
      const cachePath = path.join(this.userDataPath, 'translation-cache.json');
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving translation cache:', error);
      return false;
    }
  }
  
  // 清理过期缓存
  cleanupCache() {
    try {
      const cache = this.getTranslationCache();
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // 一周
      
      let cleaned = false;
      Object.keys(cache).forEach(key => {
        if (cache[key].timestamp && (now - cache[key].timestamp) > oneWeek) {
          delete cache[key];
          cleaned = true;
        }
      });
      
      if (cleaned) {
        this.saveTranslationCache(cache);
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning cache:', error);
      return false;
    }
  }
}

module.exports = Storage;