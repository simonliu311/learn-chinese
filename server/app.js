const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from parent directory

// API endpoint for processing Chinese text
app.post('/api/process', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        // Process the Chinese text
        const processedData = await processChineseText(text);

        res.json(processedData);
    } catch (error) {
        console.error('Error processing text:', error);
        res.status(500).json({ error: 'Error processing text' });
    }
});

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
        // In a real implementation, you would:
        // 1. Use a tokenization library like jieba to split text into words
        // 2. Use a dictionary/API to get pinyin for each character/word
        // 3. Identify chengyu using a dictionary or API

        // For this prototype, we'll use a simple approach:
        const segments = [];

        // Process each character (in a real app, you'd process words)
        for (let i = 0; i < paragraph.length; i++) {
            const char = paragraph[i];

            // Get pinyin using an API
            const pinyin = await getPinyin(char);

            // Get translation using an API
            const translation = await getTranslation(char);

            // Check if this is part of a chengyu
            const isChengyu = await checkIfChengyu(paragraph, i);

            segments.push({
                text: char,
                pinyin,
                translation,
                isChengyu
            });
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
 * Get pinyin for a Chinese character or word
 * @param {string} text - Chinese text
 * @returns {Promise<string>} - Pinyin representation
 */
async function getPinyin(text) {
    // In a real implementation, you would use a proper API or library
    // For this prototype, we'll use a simplified approach

    try {
        // You can use an API like Google Translate, Baidu Translate, or a specialized pinyin API
        // For example with Pinyin API (you would need an API key):
        // const response = await axios.get(`https://api.example.com/pinyin?text=${encodeURIComponent(text)}`);
        // return response.data.pinyin;

        // For this prototype, we'll return a placeholder
        return 'pīnyīn';
    } catch (error) {
        console.error('Error getting pinyin:', error);
        return 'pīnyīn';
    }
}

/**
 * Get English translation for a Chinese character or word
 * @param {string} text - Chinese text
 * @returns {Promise<string>} - English translation
 */
async function getTranslation(text) {
    // In a real implementation, you would use a translation API
    try {
        // Example with Google Translate API (requires API key):
        // const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {
        //     q: text,
        //     source: 'zh',
        //     target: 'en',
        //     key: 'YOUR_API_KEY'
        // });
        // return response.data.data.translations[0].translatedText;

        // For this prototype, we'll return a placeholder
        return 'translation';
    } catch (error) {
        console.error('Error getting translation:', error);
        return 'translation';
    }
}

/**
 * Check if a character at a specific position is part of a chengyu
 * @param {string} text - Full text
 * @param {number} position - Character position
 * @returns {Promise<boolean>} - Whether it's part of a chengyu
 */
async function checkIfChengyu(text, position) {
    // In a real implementation, you would:
    // 1. Have a database or API of chengyu
    // 2. Check if the character at this position starts a chengyu

    // For this prototype, we'll use a simplified approach
    // with a few sample chengyu
    const sampleChengyu = [
        '一心一意', '不可思议', '入乡随俗', '自言自语',
        '四面八方', '千变万化', '无忧无虑', '不知不觉'
    ];

    // Check if any chengyu starts at this position
    for (const chengyu of sampleChengyu) {
        if (position + chengyu.length <= text.length) {
            const substring = text.substring(position, position + chengyu.length);
            if (substring === chengyu) {
                return true;
            }
        }
    }

    return false;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});