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
  // NOTE - update to split text into sentences
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
 * Process Chinese text to add pinyin, translation, and identify chengyu
 * @param {string} text - Chinese text to process
 * @returns {Object} - Processed data
 */
async function processChineseText(text) {
  // Split text into paragraphs
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);

  // Process each paragraph
  const processedParagraphs = await Promise.all(paragraphs.map(async (paragraph) => {
    // Process the entire paragraph with pinyin
    const segments = await processTextWithPinyin(paragraph);

    // Enhance segments with translations and chengyu identification
    for (let i = 0; i < segments.length; i++) {
      // Get translation using an API or dictionary
      segments[i].translation = await getTranslation(segments[i].text);

      // Check if this is part of a chengyu
      segments[i].isChengyu = await checkIfChengyu(paragraph, i);
    }

    return {
      text: paragraph,
      segments
    };
  }));

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
 * Get pinyin from API library
 * @param {string} char - Chinese character
 * @returns {string} - Pinyin representation
 */
async function getPinyin(text) {
  try {
    const pinyinResult = pinyin(text, {
      style: pinyin.STYLE_TONE,
      heteronym: true,
      segment: true
    });
    return pinyinResult.map(pronunciation => pronunciation[0].join(' '));
  }
  catch (error) {
    console.error("Error getting pinyin:", error)
    return 'error'
  }
};

/**
 * Get pinyin for multiple characters or words in bulk
 * @param {string} text - Chinese text containing multiple characters
 * @returns {Promise<Array<string>>} - Array of pinyin for each character
 */
async function getPinyinArray(text) {
  try {
    const pinyinResult = pinyin(text, {
      style: pinyin.STYLE_TONE,
      heteronym: false,
      segment: true
    });

    // Return the array of pinyin results
    return pinyinResult.map(pronunciation => pronunciation[0]);
  } catch (error) {
    console.error('Error getting pinyin array:', error);
    return text.split('').map(() => 'error');
  }
}

/**
 * Process Chinese text with proper word segmentation and pinyin
 * @param {string} paragraph - Paragraph of Chinese text
 * @returns {Promise<Array>} - Array of processed segments with pinyin
 */
async function processTextWithPinyin(paragraph) {
  try {
    // For a more advanced implementation, you could use a Chinese word segmentation
    // library like nodejieba here to split the paragraph into words first

    // For now, we'll process character by character
    const characters = paragraph.split('');

    // Get pinyin for all characters at once (more efficient)
    const pinyinArray = await getPinyinArray(paragraph);

    // Create segments with their corresponding pinyin
    const segments = characters.map((char, index) => {
      return {
        text: char,
        pinyin: pinyinArray[index],
        // Other properties would be added here
      };
    });

    return segments;
  } catch (error) {
    console.error('Error processing text with pinyin:', error);
    return paragraph.split('').map(char => ({
      text: char,
      pinyin: 'error'
    }));
  }
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