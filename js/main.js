document.addEventListener('DOMContentLoaded', function () {
  const fileUpload = document.getElementById('file-upload');
  const chineseTextArea = document.getElementById('chinese-text');
  const processBtn = document.getElementById('process-btn');
  const readingContent = document.getElementById('reading-content');
  const togglePinyin = document.getElementById('toggle-pinyin');
  const toggleTranslation = document.getElementById('toggle-translation');
  const highlightChengyu = document.getElementById('highlight-chengyu');

  // File upload handler
  fileUpload.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      // For this prototype, we'll just handle text files
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = function (e) {
          chineseTextArea.value = e.target.result;
        };
        reader.readAsText(file);
      } else {
        alert('This prototype only supports .txt files. For .doc or .docx, please copy and paste the content.');
      }
    }
  });

  // Process button click handler
  processBtn.addEventListener('click', function () {
    const chineseText = chineseTextArea.value.trim();
    if (chineseText) {
      processChineseText(chineseText);
    } else {
      alert('Please enter or upload Chinese text first.');
    }
  });

  // Toggle event listeners
  togglePinyin.addEventListener('change', updateDisplayPreferences);
  toggleTranslation.addEventListener('change', updateDisplayPreferences);
  highlightChengyu.addEventListener('change', function () {
    const chengyuElements = document.querySelectorAll('.chengyu');
    chengyuElements.forEach(element => {
      if (highlightChengyu.checked) {
        element.classList.add('chengyu');
      } else {
        element.classList.remove('chengyu');
      }
    });
  });

  function updateDisplayPreferences() {
    document.querySelectorAll('.chinese-char').forEach(char => {
      char.onmouseover = function () {
        const pinyinElement = this.querySelector('.pinyin');
        const translationElement = this.querySelector('.translation');

        if (pinyinElement && togglePinyin.checked) {
          pinyinElement.style.display = 'block';
        }

        if (translationElement && toggleTranslation.checked) {
          translationElement.style.display = 'block';
        }
      };

      char.onmouseout = function () {
        const pinyinElement = this.querySelector('.pinyin');
        const translationElement = this.querySelector('.translation');

        if (pinyinElement) {
          pinyinElement.style.display = 'none';
        }

        if (translationElement) {
          translationElement.style.display = 'none';
        }
      };
    });
  }

  async function processChineseText(text) {
    try {
      readingContent.innerHTML = '<p>Processing...</p>';

      // Call the API to process the text
      const processedData = await processText(text);

      // Render the processed text
      renderProcessedText(processedData);

    } catch (error) {
      console.error('Error processing text:', error);
      readingContent.innerHTML = '<p>Error processing text. Please try again.</p>';
    }
  }

  function renderProcessedText(data) {
    readingContent.innerHTML = '';

    // Process paragraphs
    data.paragraphs.forEach(paragraph => {
      const paragraphElement = document.createElement('div');
      paragraphElement.className = 'paragraph';

      // Process each character/word
      paragraph.segments.forEach(segment => {
        const spanElement = document.createElement('span');
        spanElement.className = 'chinese-char';
        spanElement.textContent = segment.text;

        // Add pinyin if available
        if (segment.pinyin) {
          const pinyinElement = document.createElement('span');
          pinyinElement.className = 'pinyin';
          pinyinElement.textContent = segment.pinyin;
          spanElement.appendChild(pinyinElement);
        }

        // Add translation if available
        if (segment.translation) {
          const translationElement = document.createElement('span');
          translationElement.className = 'translation';
          translationElement.textContent = segment.translation;
          spanElement.appendChild(translationElement);
        }

        // Mark as chengyu if identified
        if (segment.isChengyu && highlightChengyu.checked) {
          spanElement.classList.add('chengyu');
        }

        paragraphElement.appendChild(spanElement);
      });

      readingContent.appendChild(paragraphElement);
    });

    // Update display based on current preferences
    updateDisplayPreferences();
  }
});