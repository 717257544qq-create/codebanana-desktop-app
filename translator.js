const https = require('https');
const querystring = require('querystring');

class Translator {
  constructor(storage) {
    this.storage = storage;
    this.cache = storage.getTranslationCache();
    this.supportedLanguages = {
      'zh-CN': '简体中文',
      'zh-TW': '繁體中文',
      'en': 'English',
      'ja': '日本語',
      'ko': '한국어',
      'fr': 'Français',
      'de': 'Deutsch',
      'es': 'Español',
      'ru': 'Русский',
      'pt': 'Português',
      'it': 'Italiano',
      'ar': 'العربية'
    };
  }
  
  // 生成缓存键
  getCacheKey(text, targetLang, sourceLang = 'auto') {
    return `${sourceLang}-${targetLang}-${Buffer.from(text).toString('base64').substring(0, 32)}`;
  }
  
  // 检查缓存
  checkCache(text, targetLang, sourceLang = 'auto') {
    const key = this.getCacheKey(text, targetLang, sourceLang);
    const cached = this.cache[key];
    
    if (cached && cached.timestamp) {
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - cached.timestamp < oneWeek) {
        return cached.translation;
      }
    }
    
    return null;
  }
  
  // 保存到缓存
  saveToCache(text, targetLang, translation, sourceLang = 'auto') {
    const key = this.getCacheKey(text, targetLang, sourceLang);
    this.cache[key] = {
      translation: translation,
      timestamp: Date.now(),
      originalText: text.substring(0, 100) // 只保存前100字符用于调试
    };
    
    // 异步保存缓存
    setImmediate(() => {
      this.storage.saveTranslationCache(this.cache);
    });
  }
  
  // 使用谷歌翻译API（免费版本）
  async translateWithGoogle(text, targetLang, sourceLang = 'auto') {
    return new Promise((resolve, reject) => {
      const params = querystring.stringify({
        client: 'gtx',
        sl: sourceLang,
        tl: targetLang,
        dt: 't',
        q: text
      });
      
      const options = {
        hostname: 'translate.googleapis.com',
        path: `/translate_a/single?${params}`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result && result[0] && result[0][0] && result[0][0][0]) {
              const translation = result[0].map(item => item[0]).join('');
              resolve({
                translation: translation,
                detectedLanguage: result[2] || sourceLang,
                confidence: 1.0
              });
            } else {
              reject(new Error('Invalid response format'));
            }
          } catch (error) {
            reject(new Error('Failed to parse translation response: ' + error.message));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error('Translation request failed: ' + error.message));
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Translation request timeout'));
      });
      
      req.end();
    });
  }
  
  // 使用百度翻译API作为备用
  async translateWithBaidu(text, targetLang, sourceLang = 'auto') {
    return new Promise((resolve, reject) => {
      // 语言代码转换
      const langMap = {
        'zh-CN': 'zh',
        'zh-TW': 'cht',
        'en': 'en',
        'ja': 'jp',
        'ko': 'kor',
        'fr': 'fra',
        'de': 'de',
        'es': 'spa',
        'ru': 'ru',
        'pt': 'pt',
        'it': 'it',
        'ar': 'ara'
      };
      
      const from = langMap[sourceLang] || 'auto';
      const to = langMap[targetLang] || 'zh';
      
      const params = querystring.stringify({
        query: text,
        from: from,
        to: to,
        transtype: 'realtime',
        simple_means_flag: '3'
      });
      
      const options = {
        hostname: 'fanyi.baidu.com',
        path: '/v2transapi?${params}',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://fanyi.baidu.com/'
        },
        timeout: 10000
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result && result.trans_result && result.trans_result.data) {
              const translation = result.trans_result.data.map(item => item.dst).join('');
              resolve({
                translation: translation,
                detectedLanguage: result.trans_result.from || sourceLang,
                confidence: 0.9
              });
            } else {
              reject(new Error('Invalid Baidu response format'));
            }
          } catch (error) {
            reject(new Error('Failed to parse Baidu response: ' + error.message));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error('Baidu translation failed: ' + error.message));
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Baidu translation timeout'));
      });
      
      req.write(params);
      req.end();
    });
  }
  
  // 主翻译方法
  async translate(text, targetLang, sourceLang = 'auto') {
    try {
      // 基本验证
      if (!text || !text.trim()) {
        throw new Error('Text is empty');
      }
      
      if (!this.supportedLanguages[targetLang]) {
        throw new Error('Unsupported target language: ' + targetLang);
      }
      
      // 检查缓存
      const cached = this.checkCache(text, targetLang, sourceLang);
      if (cached) {
        return {
          translation: cached,
          fromCache: true,
          detectedLanguage: sourceLang,
          confidence: 1.0
        };
      }
      
      // 如果文本太长，分段翻译
      if (text.length > 1000) {
        return await this.translateLongText(text, targetLang, sourceLang);
      }
      
      // 尝试谷歌翻译
      try {
        const result = await this.translateWithGoogle(text, targetLang, sourceLang);
        this.saveToCache(text, targetLang, result.translation, sourceLang);
        return { ...result, fromCache: false };
      } catch (googleError) {
        console.log('Google translation failed, trying Baidu:', googleError.message);
        
        // 尝试百度翻译作为备用
        try {
          const result = await this.translateWithBaidu(text, targetLang, sourceLang);
          this.saveToCache(text, targetLang, result.translation, sourceLang);
          return { ...result, fromCache: false };
        } catch (baiduError) {
          console.log('Baidu translation also failed:', baiduError.message);
          throw new Error(`All translation services failed. Google: ${googleError.message}, Baidu: ${baiduError.message}`);
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }
  
  // 长文本分段翻译
  async translateLongText(text, targetLang, sourceLang = 'auto') {
    const chunks = [];
    const chunkSize = 800;
    
    // 按句子分割，避免截断
    const sentences = text.split(/[。！？.!?\n]/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence + (sentence.trim() ? '。' : '');
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    // 翻译每个片段
    const translations = [];
    for (const chunk of chunks) {
      if (chunk.trim()) {
        const result = await this.translate(chunk, targetLang, sourceLang);
        translations.push(result.translation);
      }
    }
    
    const finalTranslation = translations.join(' ');
    
    return {
      translation: finalTranslation,
      fromCache: false,
      detectedLanguage: sourceLang,
      confidence: 0.8,
      chunked: true,
      chunkCount: chunks.length
    };
  }
  
  // 获取支持的语言列表
  getSupportedLanguages() {
    return this.supportedLanguages;
  }
  
  // 检测语言
  async detectLanguage(text) {
    try {
      const result = await this.translateWithGoogle(text, 'en', 'auto');
      return result.detectedLanguage;
    } catch (error) {
      console.error('Language detection failed:', error);
      return 'auto';
    }
  }
}

module.exports = Translator;