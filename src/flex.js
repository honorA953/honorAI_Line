/**
 * LINE Flex Message 頂級 UI/UX 設計系統 (Executive Obsidian & High-Contrast Palette)
 * 專為跨平台 (iOS / Android / PC / Mac) 淺色與深色模式深度調校
 * 具備層次分明之 Header 膠囊標籤、微卡片模組化區塊、色系語意化視覺指引
 */

/**
 * 建立 YouTube / 影片精華 Flex 卡片
 */
function createVideoFlex({ title, points = [], supplement = '', url = '' }) {
  const pointContents = points.map((p, idx) => ({
    type: 'box',
    layout: 'horizontal',
    spacing: 'md',
    margin: 'md',
    contents: [
      {
        type: 'box',
        layout: 'vertical',
        width: '20px',
        height: '20px',
        backgroundColor: '#FEE2E2',
        cornerRadius: '6px',
        alignItems: 'center',
        justifyContent: 'center',
        contents: [
          {
            type: 'text',
            text: `${idx + 1}`,
            size: 'xxs',
            weight: 'bold',
            color: '#E11D48',
            align: 'center',
          },
        ],
      },
      {
        type: 'text',
        text: p,
        size: 'sm',
        color: '#1E293B',
        flex: 1,
        wrap: true,
      },
    ],
  }));

  const bodyContents = [
    {
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'text',
          text: '📌 核心精華重點',
          size: 'sm',
          weight: 'bold',
          color: '#E11D48',
        },
      ],
    },
    ...pointContents,
  ];

  if (supplement) {
    bodyContents.push(
      {
        type: 'separator',
        margin: 'lg',
        color: '#E2E8F0',
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '12px',
        backgroundColor: '#FFFBEB',
        cornerRadius: '10px',
        borderWidth: '1px',
        borderColor: '#FDE68A',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '💡 AI 智庫補充與延伸脈絡',
                size: 'xs',
                weight: 'bold',
                color: '#B45309',
              },
            ],
          },
          {
            type: 'text',
            text: supplement,
            size: 'xs',
            color: '#78350F',
            wrap: true,
            margin: 'sm',
          },
        ],
      }
    );
  }

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: '#3F151B',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🎬 YOUTUBE INSIGHT',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#FDA4AF',
                },
              ],
            },
            {
              type: 'text',
              text: '影音智慧解析',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: title || 'YouTube 影片',
          weight: 'bold',
          size: 'md',
          color: '#FFFFFF',
          wrap: true,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#FFFFFF',
      paddingAll: '16px',
      contents: bodyContents,
    },
  };

  if (url) {
    bubble.footer = {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#F8FAFC',
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: '▶️ 觀看原影片',
            uri: url,
          },
          style: 'primary',
          height: 'sm',
          color: '#E11D48',
        },
      ],
    };
  }

  return {
    type: 'flex',
    altText: `🎬 影片摘要：${title}`,
    contents: bubble,
  };
}

/**
 * 建立網頁連結 Flex 卡片
 */
function createWebFlex({ title, summary = '', supplement = '', url = '' }) {
  const bodyContents = [
    {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#F0FDF4',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#BBF7D0',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '📌 網頁核心速讀',
          size: 'xs',
          weight: 'bold',
          color: '#047857',
        },
        {
          type: 'text',
          text: summary,
          size: 'sm',
          color: '#064E3B',
          wrap: true,
          margin: 'sm',
        },
      ],
    },
  ];

  if (supplement) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '12px',
      backgroundColor: '#ECFEFF',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#A5F3FC',
      contents: [
        {
          type: 'text',
          text: '💡 延伸背景與智庫知識',
          size: 'xs',
          weight: 'bold',
          color: '#0E7490',
        },
        {
          type: 'text',
          text: supplement,
          size: 'xs',
          color: '#155E75',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: '#064E3B',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🌐 WEB ARTICLE',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#6EE7B7',
                },
              ],
            },
            {
              type: 'text',
              text: '網頁智能導讀',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: title || '網頁連結',
          weight: 'bold',
          size: 'md',
          color: '#FFFFFF',
          wrap: true,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#FFFFFF',
      paddingAll: '16px',
      contents: bodyContents,
    },
  };

  if (url) {
    bubble.footer = {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#F8FAFC',
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: '🌐 閱讀完整原文',
            uri: url,
          },
          style: 'primary',
          height: 'sm',
          color: '#059669',
        },
      ],
    };
  }

  return {
    type: 'flex',
    altText: `🔗 網頁速讀：${title}`,
    contents: bubble,
  };
}

/**
 * 建立圖片 Vision 分析與延伸卡片
 */
function createImageFlex({ description = '', ocr = '', supplement = '' }) {
  const bodyContents = [
    {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '🖼️ 畫面主體解析',
          size: 'xs',
          weight: 'bold',
          color: '#7C3AED',
        },
        {
          type: 'text',
          text: description,
          size: 'sm',
          color: '#1E293B',
          wrap: true,
          margin: 'sm',
        },
      ],
    },
  ];

  if (ocr && ocr !== '無重要文字') {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '10px',
      backgroundColor: '#F8FAFC',
      cornerRadius: '8px',
      borderWidth: '1px',
      borderColor: '#CBD5E1',
      contents: [
        {
          type: 'text',
          text: '🔍 提取文字與數據資訊',
          size: 'xxs',
          weight: 'bold',
          color: '#475569',
        },
        {
          type: 'text',
          text: ocr,
          size: 'xs',
          color: '#0F172A',
          wrap: true,
          margin: 'xs',
        },
      ],
    });
  }

  if (supplement) {
    bodyContents.push(
      {
        type: 'separator',
        margin: 'lg',
        color: '#E2E8F0',
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '12px',
        backgroundColor: '#FAF5FF',
        cornerRadius: '10px',
        borderWidth: '1px',
        borderColor: '#E9D5FF',
        contents: [
          {
            type: 'text',
            text: '💡 專業洞察與補充建議',
            size: 'xs',
            weight: 'bold',
            color: '#7E22CE',
          },
          {
            type: 'text',
            text: supplement,
            size: 'xs',
            color: '#581C87',
            wrap: true,
            margin: 'sm',
          },
        ],
      }
    );
  }

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: '#3B0764',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '👁️ VISION & OCR',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#D8B4FE',
                },
              ],
            },
            {
              type: 'text',
              text: '影像智慧辨識',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '圖片內容與數據洞察',
          weight: 'bold',
          size: 'md',
          color: '#FFFFFF',
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#FFFFFF',
      paddingAll: '16px',
      contents: bodyContents,
    },
  };

  return {
    type: 'flex',
    altText: `🖼️ 圖片解析洞察`,
    contents: bubble,
  };
}

/**
 * 建立語音辨識 Flex 卡片
 */
function createAudioFlex({ transcript = '' }) {
  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: '#1E1B4B',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🎙️ AUDIO TRANSCRIPT',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#A5B4FC',
                },
              ],
            },
            {
              type: 'text',
              text: 'Whisper AI 辨識',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '語音訊息逐字稿',
          weight: 'bold',
          size: 'md',
          color: '#FFFFFF',
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#FFFFFF',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#EEF2FF',
          cornerRadius: '10px',
          borderWidth: '1px',
          borderColor: '#C7D2FE',
          paddingAll: '12px',
          contents: [
            {
              type: 'text',
              text: '📝 語音轉譯內容',
              size: 'xs',
              weight: 'bold',
              color: '#4338CA',
            },
            {
              type: 'text',
              text: transcript || '（無內容）',
              size: 'sm',
              color: '#1E1B4B',
              wrap: true,
              margin: 'sm',
            },
          ],
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `🎙️ 語音辨識：${transcript.slice(0, 30)}`,
    contents: bubble,
  };
}

/**
 * 解析對話總結報告區塊
 */
function parseSummarySections(summaryText) {
  const sectionDefs = [
    {
      key: 'topics',
      pattern: /📊|討論主軸|核心議題/,
      title: '討論主軸與核心議題',
      badge: 'TOPICS',
      color: '#0284C7',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      bulletBg: '#E0F2FE',
      bulletColor: '#0284C7',
      titleColor: '#0369A1',
    },
    {
      key: 'decisions',
      pattern: /💡|重要結論|關鍵決策/,
      title: '重要結論與關鍵決策',
      badge: 'DECISIONS',
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      bulletBg: '#D1FAE5',
      bulletColor: '#059669',
      titleColor: '#047857',
    },
    {
      key: 'insights',
      pattern: /📚|智庫補充|延伸洞察/,
      title: 'AI 智庫補充與延伸洞察',
      badge: 'INSIGHTS',
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      bulletBg: '#FEF3C7',
      bulletColor: '#D97706',
      titleColor: '#B45309',
    },
    {
      key: 'todos',
      pattern: /🎯|待辦事項|行動清單/,
      title: '待辦事項與行動清單',
      badge: 'ACTION ITEMS',
      color: '#E11D48',
      bg: '#FFF1F2',
      border: '#FECDD3',
      bulletBg: '#FFE4E6',
      bulletColor: '#E11D48',
      titleColor: '#BE123C',
    },
  ];

  const sections = [];
  const lines = summaryText.split('\n');
  let currentSection = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const matchedDef = sectionDefs.find(
      (def) =>
        def.pattern.test(line) &&
        (line.includes('【') || line.includes('#') || line.includes('：') || line.includes(':') || line.length < 35)
    );

    if (matchedDef) {
      currentSection = {
        def: matchedDef,
        title: line.replace(/[【】#\*\:]/g, '').trim(),
        items: [],
      };
      sections.push(currentSection);
    } else {
      if (!currentSection) {
        currentSection = {
          def: {
            key: 'general',
            title: '會議與對話摘要',
            badge: 'SUMMARY',
            color: '#475569',
            bg: '#F8FAFC',
            border: '#E2E8F0',
            bulletBg: '#F1F5F9',
            bulletColor: '#475569',
            titleColor: '#334155',
          },
          title: '會議與對話摘要',
          items: [],
        };
        sections.push(currentSection);
      }
      const cleanItem = line.replace(/^[•\-\*\d\.]+\s*/, '').trim();
      if (cleanItem) {
        currentSection.items.push(cleanItem);
      }
    }
  }

  return sections;
}

/**
 * 建立對話全貌整合 Flex 卡片 (結構化高階模組卡)
 */
function createExecutiveSummaryFlex({ title = '📋 對話深度總結報告', summaryText = '' }) {
  const sections = parseSummarySections(summaryText);

  const sectionCards = sections.map((sec, secIdx) => {
    const itemsContents = sec.items.map((item) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: [
        {
          type: 'text',
          text: '•',
          size: 'sm',
          color: sec.def.bulletColor,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: item,
          size: 'xs',
          color: '#1E293B',
          flex: 1,
          wrap: true,
        },
      ],
    }));

    return {
      type: 'box',
      layout: 'vertical',
      margin: secIdx === 0 ? 'none' : 'md',
      paddingAll: '12px',
      backgroundColor: sec.def.bg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: sec.def.border,
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: sec.title,
              size: 'xs',
              weight: 'bold',
              color: sec.def.titleColor,
              flex: 1,
            },
            {
              type: 'text',
              text: sec.def.badge,
              size: 'xxs',
              color: sec.def.color,
              align: 'end',
              weight: 'bold',
            },
          ],
        },
        ...itemsContents,
      ],
    };
  });

  const bodyContents =
    sectionCards.length > 0
      ? sectionCards
      : [
          {
            type: 'text',
            text: summaryText,
            size: 'sm',
            color: '#1E293B',
            wrap: true,
          },
        ];

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: '#0C4A6E',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '📋 AI EXECUTIVE BRIEF',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#7DD3FC',
                },
              ],
            },
            {
              type: 'text',
              text: new Date().toLocaleDateString('zh-TW'),
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: title,
          weight: 'bold',
          size: 'md',
          color: '#FFFFFF',
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#FFFFFF',
      paddingAll: '16px',
      contents: bodyContents,
    },
  };

  return {
    type: 'flex',
    altText: title,
    contents: bubble,
  };
}

/**
 * 建立每日建築與營造產業新聞 Flex 卡片 (Executive Amber/Slate 典雅工程美學)
 */
function createConstructionNewsFlex({ date = '', overview = '', items = [] }) {
  const currentDate =
    date ||
    new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  const newsCards = items.map((item, idx) => {
    let catBg = '#FEF3C7';
    let catColor = '#B45309';
    if (item.category?.includes('綠') || item.category?.includes('ESG')) {
      catBg = '#D1FAE5';
      catColor = '#047857';
    } else if (item.category?.includes('設計') || item.category?.includes('前瞻')) {
      catBg = '#E0E7FF';
      catColor = '#4338CA';
    } else if (item.category?.includes('工程') || item.category?.includes('重大')) {
      catBg = '#FFEDD5';
      catColor = '#C2410C';
    } else if (
      item.category?.includes('法規') ||
      item.category?.includes('都更') ||
      item.category?.includes('房市')
    ) {
      catBg = '#FCE7F3';
      catColor = '#BE185D';
    }

    const cardContents = [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: catBg,
            cornerRadius: 'md',
            paddingStart: '6px',
            paddingEnd: '6px',
            paddingTop: '2px',
            paddingBottom: '2px',
            contents: [
              {
                type: 'text',
                text: item.category || '🏗️ 產業快訊',
                size: 'xxs',
                weight: 'bold',
                color: catColor,
              },
            ],
          },
          {
            type: 'text',
            text: item.source || '即時情報',
            size: 'xxs',
            color: '#94A3B8',
            align: 'end',
            gravity: 'center',
          },
        ],
      },
      {
        type: 'text',
        text: item.title,
        weight: 'bold',
        size: 'sm',
        color: '#0F172A',
        wrap: true,
        margin: 'sm',
      },
      {
        type: 'text',
        text: item.summary,
        size: 'xs',
        color: '#334155',
        wrap: true,
        margin: 'xs',
      },
    ];

    if (item.insight) {
      cardContents.push({
        type: 'box',
        layout: 'horizontal',
        spacing: 'xs',
        margin: 'sm',
        contents: [
          {
            type: 'text',
            text: '💡 觀點：',
            size: 'xxs',
            weight: 'bold',
            color: '#D97706',
            flex: 0,
          },
          {
            type: 'text',
            text: item.insight,
            size: 'xxs',
            color: '#78350F',
            wrap: true,
            flex: 1,
          },
        ],
      });
    }

    if (item.url) {
      cardContents.push({
        type: 'button',
        action: {
          type: 'uri',
          label: '🔗 閱讀完整報導',
          uri: item.url,
        },
        style: 'link',
        height: 'sm',
        color: '#0284C7',
        margin: 'xs',
      });
    }

    return {
      type: 'box',
      layout: 'vertical',
      margin: idx === 0 ? 'none' : 'md',
      paddingAll: '12px',
      backgroundColor: '#F8FAFC',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#E2E8F0',
      contents: cardContents,
    };
  });

  const bodyContents = [];

  if (overview) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#FFFBEB',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#FDE68A',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '📈 今日產業核心脈動',
          size: 'xs',
          weight: 'bold',
          color: '#B45309',
        },
        {
          type: 'text',
          text: overview,
          size: 'xs',
          color: '#78350F',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  if (newsCards.length > 0) {
    if (overview) {
      bodyContents.push({
        type: 'separator',
        margin: 'md',
        color: '#E2E8F0',
      });
    }
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      contents: newsCards,
    });
  }

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: '#451A03',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🏗️ ARCHITECTURE & CONSTRUCTION',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#FDE68A',
                },
              ],
            },
            {
              type: 'text',
              text: `晨報 · ${currentDate}`,
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '今日建築與營造前瞻情報',
          weight: 'bold',
          size: 'md',
          color: '#FFFFFF',
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#FFFFFF',
      paddingAll: '16px',
      contents: bodyContents,
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#F8FAFC',
      paddingAll: '10px',
      contents: [
        {
          type: 'text',
          text: '🤖 AI 智庫即時彙整 · 自動追蹤晨間產經情報',
          size: 'xxs',
          color: '#94A3B8',
          align: 'center',
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `🏗️ 今日建築與營造產業情報 (${currentDate})`,
    contents: bubble,
  };
}

module.exports = {
  createVideoFlex,
  createWebFlex,
  createImageFlex,
  createAudioFlex,
  createExecutiveSummaryFlex,
  createConstructionNewsFlex,
};
