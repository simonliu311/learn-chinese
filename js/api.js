// This file handles API communications

/**
 * Process the Chinese text through our server
 * @param {string} text - The Chinese text to process
 * @returns {Promise<Object>} - Processed data with pinyin, translations, and chengyu identification
 */
async function processText(text) {
  try {
    // For prototype, we'll use a server endpoint
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();

  } catch (error) {
    console.error('Error calling API:', error);

    // For development/demo purposes only: 
    // If server isn't set up yet, return mocked data
    return mockProcessTextResponse(text);
  }
}

/**
* Mock API response for development/prototype
* @param {string} text - The Chinese text to process
* @returns {Object} - Mocked processed data
*/
function mockProcessTextResponse(text) {
  // Split text into paragraphs
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);

  // Sample chengyu list for demo purposes
  const sampleChengyu = [
    '一心一意', '不可思议', '入乡随俗', '自言自语',
    '四面八方', '千变万化', '无忧无虑', '不知不觉'
  ];

  // Process each paragraph
  const processedParagraphs = paragraphs.map(paragraph => {
    // For simplicity in the prototype, we'll process character by character
    // In a real implementation, we'd use proper word segmentation
    const segments = [];

    // Check for chengyu in the paragraph
    sampleChengyu.forEach(cy => {
      if (paragraph.includes(cy)) {
        const indices = [];
        let index = paragraph.indexOf(cy);
        while (index !== -1) {
          indices.push(index);
          index = paragraph.indexOf(cy, index + 1);
        }

        // Mark the characters that are part of chengyu
        indices.forEach(startIdx => {
          for (let i = 0; i < cy.length; i++) {
            // This is just for the mock, in real implementation we'd handle this differently
            const charInfo = {
              text: paragraph[startIdx + i],
              pinyin: getMockPinyin(paragraph[startIdx + i]),
              translation: getMockTranslation(paragraph[startIdx + i]),
              isChengyu: true,
              chengyuComplete: i === cy.length - 1 ? cy : null
            };
            segments.push(charInfo);
          }
        });
      }
    });

    // Process remaining characters
    for (let i = 0; i < paragraph.length; i++) {
      // Skip if already processed as part of chengyu
      if (segments.some(s => s.text === paragraph[i] && s.isChengyu)) {
        continue;
      }

      const charInfo = {
        text: paragraph[i],
        pinyin: getMockPinyin(paragraph[i]),
        translation: getMockTranslation(paragraph[i]),
        isChengyu: false
      };
      segments.push(charInfo);
    }

    return {
      text: paragraph,
      segments: segments.sort((a, b) => paragraph.indexOf(a.text) - paragraph.indexOf(b.text))
    };
  });

  return {
    original: text,
    paragraphs: processedParagraphs
  };
}

/**
* Get mock pinyin for demonstration purposes
* @param {string} char - Chinese character
* @returns {string} - Pinyin representation
*/
function getMockPinyin(char) {
  // This is just a placeholder. In a real implementation,
  // we would use a proper Chinese-to-pinyin library or API
  const mockPinyinMap = {
    '我': 'wǒ',
    '你': 'nǐ',
    '他': 'tā',
    '她': 'tā',
    '们': 'men',
    '好': 'hǎo',
    '一': 'yī',
    '二': 'èr',
    '三': 'sān',
    '中': 'zhōng',
    '国': 'guó',
    '人': 'rén',
    '大': 'dà',
    '小': 'xiǎo',
    '上': 'shàng',
    '下': 'xià',
    '不': 'bù',
    '是': 'shì',
    '了': 'le',
  };

  return mockPinyinMap[char] || 'pinyin';
}

/**
* Get mock translation for demonstration purposes
* @param {string} char - Chinese character
* @returns {string} - English translation
*/
function getMockTranslation(char) {
  // This is just a placeholder
  const mockTranslationMap = {
    '我': 'I/me',
    '你': 'you',
    '他': 'he',
    '她': 'she',
    '们': 'plural marker',
    '好': 'good',
    '一': 'one',
    '二': 'two',
    '三': 'three',
    '中': 'middle',
    '国': 'country',
    '人': 'person',
    '大': 'big',
    '小': 'small',
    '上': 'up/above',
    '下': 'down/below',
    '不': 'no/not',
    '是': 'is/am/are',
    '了': 'past tense marker',
  };

  return mockTranslationMap[char] || 'translation';
}