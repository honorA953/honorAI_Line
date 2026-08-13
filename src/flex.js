/**
 * LINE Flex Message 頂級 UI/UX 設計系統 (Executive Obsidian & High-Contrast Palette)
 * 專為跨平台 (iOS / Android / PC / Mac) 淺色與深色模式深度調校
 * 具備層次分明之 Header 膠囊標籤、微卡片模組化區塊、色系語意化視覺指引與全互動按鈕
 */

/**
 * 產生常駐底部 LINE Quick Reply 快捷按鈕列 (涵蓋記事、統整、問答、新聞、選單)
 */
function getQuickReply() {
  const items = [
    {
      type: 'action',
      action: {
        type: 'message',
        label: '➕ 快速記事',
        text: '新增記事',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📝 記事待辦',
        text: '看記事',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📊 智能統整',
        text: '智能統整',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🔄 換批新聞',
        text: '換新聞',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🌿 綠建ESG',
        text: '綠建ESG',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📜 房市都更',
        text: '房市都更',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🎛️ 智能選單',
        text: '選單',
      },
    },
  ];

  return { items };
}


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
    quickReply: getQuickReply(),
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
    quickReply: getQuickReply(),
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
    quickReply: getQuickReply(),
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
    quickReply: getQuickReply(),
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
 * 建立對話全貌整合 Flex 卡片 (結構化高階模組卡 + 快捷按鈕)
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
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: '#F8FAFC',
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '📰 今日建築新聞',
            text: '今日新聞',
          },
          style: 'primary',
          height: 'sm',
          color: '#0284C7',
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 智能選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: title,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立每日建築與營造產業新聞 Flex 卡片 (全互動式按鈕 + 次次更新支援)
 */
function createConstructionNewsFlex({
  date = '',
  categoryName = '即時前瞻全訊',
  overview = '',
  items = [],
}) {
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
    } else if (item.category?.includes('智') || item.category?.includes('科技')) {
      catBg = '#E0F2FE';
      catColor = '#0369A1';
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

    // 互動按鈕列：閱讀原文 + AI 深度剖析
    const buttonRowContents = [];
    if (item.url) {
      buttonRowContents.push({
        type: 'button',
        action: {
          type: 'uri',
          label: '🔗 原文報導',
          uri: item.url,
        },
        style: 'link',
        height: 'sm',
        color: '#0284C7',
        flex: 1,
      });
    }
    buttonRowContents.push({
      type: 'button',
      action: {
        type: 'message',
        label: '💡 AI 深度剖析',
        text: `剖析新聞: ${item.title}`,
      },
      style: 'link',
      height: 'sm',
      color: '#B45309',
      flex: 1,
    });

    cardContents.push({
      type: 'box',
      layout: 'horizontal',
      margin: 'xs',
      contents: buttonRowContents,
    });

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
              text: `${currentDate}`,
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: `今日建築與營造情報 · ${categoryName}`,
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
      spacing: 'sm',
      backgroundColor: '#F8FAFC',
      paddingAll: '12px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'message',
                label: '🔄 換下一批 (不重複)',
                text: '換新聞',
              },
              style: 'primary',
              height: 'sm',
              color: '#D97706',
              flex: 2,
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: '🎛️ 選單',
                text: '選單',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
          ],
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `🏗️ 今日建築情報 · ${categoryName} (${currentDate})`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 🎛️ 智能控制台 / 快捷功能選單 Flex 卡片 (包含記事、統整、問答、新聞)
 */
function createMenuFlex() {
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
              backgroundColor: '#1E293B',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '⚡ COMMAND HUB',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#38BDF8',
                },
              ],
            },
            {
              type: 'text',
              text: '全功能快捷控制台',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '🏛️ AI 建築智庫與智慧特助',
          weight: 'bold',
          size: 'md',
          color: '#FFFFFF',
          margin: 'md',
        },
        {
          type: 'text',
          text: '點擊下方按鈕即可立即取得最新資訊，無需手動輸入。',
          size: 'xs',
          color: '#94A3B8',
          margin: 'xs',
          wrap: true,
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#FFFFFF',
      paddingAll: '16px',
      spacing: 'md',
      contents: [
        // 區塊 1: 記事本與深度統整
        {
          type: 'text',
          text: '📝 智能記事與全方位統整',
          size: 'xs',
          weight: 'bold',
          color: '#64748B',
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'message',
                label: '➕ 快捷記一筆',
                text: '新增記事',
              },
              style: 'primary',
              height: 'sm',
              color: '#E11D48',
              flex: 1,
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: '📝 待辦記事清單',
                text: '看記事',
              },
              style: 'primary',
              height: 'sm',
              color: '#0284C7',
              flex: 1,
            },
          ],
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          margin: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'message',
                label: '📊 全方位智能統整',
                text: '智能統整',
              },
              style: 'primary',
              height: 'sm',
              color: '#059669',
              flex: 1,
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: '🧹 清空歷史對話',
                text: '清空記錄',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
          ],
        },
        {
          type: 'separator',
          margin: 'md',
          color: '#E2E8F0',
        },
        // 區塊 2: 即時新聞與專題
        {
          type: 'text',
          text: '📰 建築與營造產業情報（次次更新）',
          size: 'xs',
          weight: 'bold',
          color: '#64748B',
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'message',
                label: '📰 今日新聞',
                text: '今日新聞',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: '🔄 換批新聞',
                text: '換新聞',
              },
              style: 'primary',
              height: 'sm',
              color: '#D97706',
              flex: 1,
            },
          ],
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'message',
                label: '🌿 綠建 ESG',
                text: '綠建ESG',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: '📜 房市都更',
                text: '房市都更',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
          ],
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'message',
                label: '🏛️ 空間設計',
                text: '建築設計',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: '🏗️ 重大工程',
                text: '重大工程',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
          ],
        },
        {
          type: 'separator',
          margin: 'md',
          color: '#E2E8F0',
        },
        // 區塊 3: 對話紀錄與管理
        {
          type: 'text',
          text: '📋 對話管理與深度智庫',
          size: 'xs',
          weight: 'bold',
          color: '#64748B',
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              action: {
                type: 'message',
                label: '📋 快速摘要對話',
                text: '摘要',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
            {
              type: 'button',
              action: {
                type: 'message',
                label: '💡 記事範本引導',
                text: '新增記事',
              },
              style: 'secondary',
              height: 'sm',
              flex: 1,
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#F8FAFC',
      paddingAll: '10px',
      contents: [
        {
          type: 'text',
          text: '💡 點擊「快捷記一筆」開啟範本，或直接輸入「記下：...」',
          size: 'xxs',
          color: '#94A3B8',
          align: 'center',
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: '🎛️ AI 建築智庫與智慧特助 · 快捷控制台',
    contents: bubble,
    quickReply: getQuickReply(),
  };
}


/**
 * 建立新聞深度智庫剖析 Flex 卡片 (多維度模組化戰略卡)
 */
function createNewsAnalysisFlex({ title = '', data = null, analysisText = '' }) {
  const analysis = data || {
    category: '💡 產業深度剖析',
    context: analysisText,
    techImpact: '',
    policyImpact: '',
    marketOpportunity: '',
    strategyAdvice: '',
  };

  const bodyContents = [];

  // 1. 事件核心脈絡
  if (analysis.context) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#F8FAFC',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#E2E8F0',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '📌 事件核心與背景脈絡',
          size: 'xs',
          weight: 'bold',
          color: '#334155',
        },
        {
          type: 'text',
          text: analysis.context,
          size: 'xs',
          color: '#1E293B',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  // 2. 工程技術與工法衝擊
  if (analysis.techImpact) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: '#FFF7ED',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#FED7AA',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '🏗️ 工程工法與設計面衝擊',
          size: 'xs',
          weight: 'bold',
          color: '#C2410C',
        },
        {
          type: 'text',
          text: analysis.techImpact,
          size: 'xs',
          color: '#7C2D12',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  // 3. 法規政策與市場影響
  if (analysis.policyImpact) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: '#FDF2F8',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#FBCFE8',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '📜 法規政策與制度規範影響',
          size: 'xs',
          weight: 'bold',
          color: '#BE185D',
        },
        {
          type: 'text',
          text: analysis.policyImpact,
          size: 'xs',
          color: '#831843',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  // 4. 產業商機與供應鏈
  if (analysis.marketOpportunity) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: '#F0FDF4',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#BBF7D0',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '📈 產業供應鏈與市場商機',
          size: 'xs',
          weight: 'bold',
          color: '#047857',
        },
        {
          type: 'text',
          text: analysis.marketOpportunity,
          size: 'xs',
          color: '#064E3B',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  // 5. 專家策略因應建議
  if (analysis.strategyAdvice) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: '#EFF6FF',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#BFDBFE',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '💡 專家因應策略建議',
          size: 'xs',
          weight: 'bold',
          color: '#1D4ED8',
        },
        {
          type: 'text',
          text: analysis.strategyAdvice,
          size: 'xs',
          color: '#1E3A8A',
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
              backgroundColor: '#451A03',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: analysis.category || '💡 IN-DEPTH ANALYSIS',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#FDE68A',
                },
              ],
            },
            {
              type: 'text',
              text: '智庫首席剖析',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: title || '新聞深度剖析',
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
      contents:
        bodyContents.length > 0
          ? bodyContents
          : [
              {
                type: 'text',
                text: analysisText || analysis.rawText || '無剖析內容',
                size: 'sm',
                color: '#1E293B',
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: '#F8FAFC',
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🔄 換批新聞',
            text: '換新聞',
          },
          style: 'primary',
          height: 'sm',
          color: '#D97706',
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 智能選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `💡 深度剖析：${title}`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 AI 顧問問答 Flex 卡片 (結構化高階解答卡)
 */
function createAssistantFlex({ question = '', data = null, answer = '' }) {
  const result = data || {
    category: '🤖 AI ARCH-CONSULTANT',
    conclusion: answer,
    details: [],
    risks: '',
    nextStep: '',
  };

  const bodyContents = [];

  // 1. 核心結論直接解答
  if (result.conclusion) {
    bodyContents.push({
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
          text: '💎 核心結論與策略解法',
          size: 'xs',
          weight: 'bold',
          color: '#047857',
        },
        {
          type: 'text',
          text: result.conclusion,
          size: 'sm',
          color: '#064E3B',
          weight: 'bold',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  // 2. 關鍵要點或法規技術條列
  if (result.details && result.details.length > 0) {
    const detailRows = result.details.map((item) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: [
        {
          type: 'text',
          text: '•',
          size: 'sm',
          color: '#0284C7',
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

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '12px',
      backgroundColor: '#F8FAFC',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#E2E8F0',
      contents: [
        {
          type: 'text',
          text: '📐 關鍵法規與技術要點',
          size: 'xs',
          weight: 'bold',
          color: '#0369A1',
        },
        ...detailRows,
      ],
    });
  }

  // 3. 實務風險避坑
  if (result.risks) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: '#FFFBEB',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#FDE68A',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '⚠️ 實務風險與避坑指南',
          size: 'xs',
          weight: 'bold',
          color: '#B45309',
        },
        {
          type: 'text',
          text: result.risks,
          size: 'xs',
          color: '#78350F',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  // 4. 下一步行動方案
  if (result.nextStep) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: '#EEF2FF',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#C7D2FE',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '🚀 建議下一步行動',
          size: 'xs',
          weight: 'bold',
          color: '#4338CA',
        },
        {
          type: 'text',
          text: result.nextStep,
          size: 'xs',
          color: '#1E1B4B',
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
              backgroundColor: '#1E1B4B',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: result.category || '🤖 AI ARCH-CONSULTANT',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#A5B4FC',
                },
              ],
            },
            {
              type: 'text',
              text: '智庫特助解答',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: question.length > 35 ? question.slice(0, 35) + '...' : question,
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
      contents:
        bodyContents.length > 0
          ? bodyContents
          : [
              {
                type: 'text',
                text: answer || result.rawText || '無解答內容',
                size: 'sm',
                color: '#1E293B',
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: '#F8FAFC',
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '📰 今日新聞',
            text: '今日新聞',
          },
          style: 'primary',
          height: 'sm',
          color: '#0284C7',
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 智能選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `🤖 AI 特助解答：${question.slice(0, 20)}`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}


/**
 * 建立 📝 智能記事本與待辦清單 Flex 卡片
 */
function createNotesFlex(notes = []) {
  const noteCards = notes.map((note, idx) => {
    let catBg = '#EFF6FF';
    let catColor = '#1D4ED8';
    if (note.category?.includes('日') || note.category?.includes('會')) {
      catBg = '#FDF2F8';
      catColor = '#BE185D';
    } else if (note.category?.includes('款') || note.category?.includes('價') || note.category?.includes('成本')) {
      catBg = '#FEF3C7';
      catColor = '#B45309';
    } else if (note.category?.includes('工程') || note.category?.includes('技術')) {
      catBg = '#FFEDD5';
      catColor = '#C2410C';
    } else if (note.category?.includes('法') || note.category?.includes('審')) {
      catBg = '#F3E8FF';
      catColor = '#7E22CE';
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
                text: `${idx + 1}. ${note.category || '📋 待辦'}`,
                size: 'xxs',
                weight: 'bold',
                color: catColor,
              },
            ],
          },
          {
            type: 'text',
            text: note.dueDate && note.dueDate !== '未指定' ? `⏳ ${note.dueDate}` : '進行中',
            size: 'xxs',
            color: '#64748B',
            align: 'end',
            gravity: 'center',
          },
        ],
      },
      {
        type: 'text',
        text: note.title,
        weight: 'bold',
        size: 'sm',
        color: '#0F172A',
        wrap: true,
        margin: 'sm',
      },
    ];

    if (note.details) {
      cardContents.push({
        type: 'text',
        text: note.details,
        size: 'xs',
        color: '#475569',
        wrap: true,
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

  const bodyContents =
    notes.length > 0
      ? noteCards
      : [
          {
            type: 'box',
            layout: 'vertical',
            paddingAll: '16px',
            backgroundColor: '#F8FAFC',
            cornerRadius: '10px',
            borderWidth: '1px',
            borderColor: '#E2E8F0',
            contents: [
              {
                type: 'text',
                text: '📭 目前尚無待辦記事',
                size: 'sm',
                weight: 'bold',
                color: '#64748B',
                align: 'center',
              },
              {
                type: 'text',
                text: '您可以直接傳送：「記下：下週三向建管處送審」或「幫我記：明天早上9點結構會勘」即可自動建立記事！',
                size: 'xs',
                color: '#94A3B8',
                wrap: true,
                margin: 'sm',
                align: 'center',
              },
            ],
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
              backgroundColor: '#1E293B',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '📝 SMART MEMO HUB',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#38BDF8',
                },
              ],
            },
            {
              type: 'text',
              text: `${notes.length} 項紀錄`,
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '📌 專屬智能記事本與待辦清單',
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
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: '#F8FAFC',
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '➕ 記一筆',
            text: '新增記事',
          },
          style: 'primary',
          height: 'sm',
          color: '#E11D48',
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '📊 智能統整',
            text: '智能統整',
          },
          style: 'primary',
          height: 'sm',
          color: '#0284C7',
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🧹 清空',
            text: '清空記事',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `📝 智能記事本 (${notes.length} 項待辦)`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 📝 智能記事快捷引導選單 / 範本 Flex 卡片 (一鍵點擊範本填入)
 */
function createNoteHelperFlex() {
  const templates = [
    {
      badge: '📅 日程會議',
      badgeBg: '#FDF2F8',
      badgeColor: '#BE185D',
      title: '工程會勘 / 會議日程',
      example: '記下：明天上午9點結構技師工地會勘',
    },
    {
      badge: '📋 待辦交辦',
      badgeBg: '#EFF6FF',
      badgeColor: '#1D4ED8',
      title: '法規送審 / 待辦交辦',
      example: '記下：下週三向建管處送審執照變更案',
    },
    {
      badge: '💰 報價成本',
      badgeBg: '#FEF3C7',
      badgeColor: '#B45309',
      title: '建材報價 / 發包成本',
      example: '備忘：鋼筋每噸最新報價 21,500 元',
    },
    {
      badge: '📐 工程技術',
      badgeBg: '#FFEDD5',
      badgeColor: '#C2410C',
      title: '工法規格 / 結構變更',
      example: '記下：連續壁厚度由70cm調整至80cm',
    },
    {
      badge: '💡 靈感策略',
      badgeBg: '#F3E8FF',
      badgeColor: '#7E22CE',
      title: '都更危老 / 獎勵策略',
      example: '備忘：爭取危老容積獎勵滿額40%',
    },
  ];

  const templateRows = templates.map((tpl, idx) => ({
    type: 'box',
    layout: 'vertical',
    margin: idx === 0 ? 'none' : 'md',
    paddingAll: '10px',
    backgroundColor: '#F8FAFC',
    cornerRadius: '10px',
    borderWidth: '1px',
    borderColor: '#E2E8F0',
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: tpl.badgeBg,
            cornerRadius: 'md',
            paddingStart: '6px',
            paddingEnd: '6px',
            paddingTop: '2px',
            paddingBottom: '2px',
            contents: [
              {
                type: 'text',
                text: tpl.badge,
                size: 'xxs',
                weight: 'bold',
                color: tpl.badgeColor,
              },
            ],
          },
          {
            type: 'text',
            text: tpl.title,
            size: 'xs',
            weight: 'bold',
            color: '#1E293B',
            margin: 'sm',
            gravity: 'center',
          },
        ],
      },
      {
        type: 'button',
        action: {
          type: 'message',
          label: `👉 點擊發送：${tpl.example.slice(0, 16)}...`,
          text: tpl.example,
        },
        style: 'secondary',
        height: 'sm',
        margin: 'sm',
      },
    ],
  }));

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
              backgroundColor: '#1E293B',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '⚡ QUICK NOTE ASSISTANT',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#38BDF8',
                },
              ],
            },
            {
              type: 'text',
              text: '一鍵快速記事',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: '📝 智能記事快捷選單 & 範本引導',
          weight: 'bold',
          size: 'md',
          color: '#FFFFFF',
          margin: 'md',
        },
        {
          type: 'text',
          text: '無需硬記指令！點擊下方任一範本即可直接填入或修改發送：',
          size: 'xs',
          color: '#94A3B8',
          margin: 'xs',
          wrap: true,
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#FFFFFF',
      paddingAll: '14px',
      contents: templateRows,
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: '#F8FAFC',
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '📝 待辦清單',
            text: '看記事',
          },
          style: 'primary',
          height: 'sm',
          color: '#0284C7',
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 智能選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: '📝 智能記事快捷選單 & 範本引導',
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 📊 全方位智能統整報告 Flex 卡片
 */
function createSynthesisFlex({ data = null, rawText = '' }) {
  const report = data || {
    overview: rawText,
    coreDecisions: [],
    actionItems: [],
    keyData: [],
    risksAndWatch: '',
    strategicAdvice: '',
  };

  const bodyContents = [];

  // 1. 今日工作推進總結
  if (report.overview) {
    bodyContents.push({
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
          text: '🎯 今日工作與對話推進總結',
          size: 'xs',
          weight: 'bold',
          color: '#047857',
        },
        {
          type: 'text',
          text: report.overview,
          size: 'xs',
          color: '#064E3B',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  // 2. 重要決策與共識
  if (report.coreDecisions && report.coreDecisions.length > 0) {
    const decisionRows = report.coreDecisions.map((d) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: [
        {
          type: 'text',
          text: '•',
          size: 'sm',
          color: '#0284C7',
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: d,
          size: 'xs',
          color: '#1E293B',
          flex: 1,
          wrap: true,
        },
      ],
    }));

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '12px',
      backgroundColor: '#F0F9FF',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#BAE6FD',
      contents: [
        {
          type: 'text',
          text: '💡 重要決策與共識定案',
          size: 'xs',
          weight: 'bold',
          color: '#0369A1',
        },
        ...decisionRows,
      ],
    });
  }

  // 3. 待辦與工程交辦事項
  if (report.actionItems && report.actionItems.length > 0) {
    const actionRows = report.actionItems.map((a) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: [
        {
          type: 'text',
          text: '✓',
          size: 'sm',
          color: '#E11D48',
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: a,
          size: 'xs',
          color: '#1E293B',
          flex: 1,
          wrap: true,
        },
      ],
    }));

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      paddingAll: '12px',
      backgroundColor: '#FFF1F2',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#FECDD3',
      contents: [
        {
          type: 'text',
          text: '📌 待辦與工程交辦清單',
          size: 'xs',
          weight: 'bold',
          color: '#BE123C',
        },
        ...actionRows,
      ],
    });
  }

  // 4. 關鍵數據與備忘
  if (report.keyData && report.keyData.length > 0) {
    const dataRows = report.keyData.map((k) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: [
        {
          type: 'text',
          text: '▸',
          size: 'sm',
          color: '#D97706',
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: k,
          size: 'xs',
          color: '#1E293B',
          flex: 1,
          wrap: true,
        },
      ],
    }));

    bodyContents.push({
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
          type: 'text',
          text: '💰 關鍵數據與報價備忘',
          size: 'xs',
          weight: 'bold',
          color: '#B45309',
        },
        ...dataRows,
      ],
    });
  }

  // 5. 實務風險與預警
  if (report.risksAndWatch) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: '#FEF2F2',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#FCA5A5',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '⚠️ 工程介面與時程風險預警',
          size: 'xs',
          weight: 'bold',
          color: '#B91C1C',
        },
        {
          type: 'text',
          text: report.risksAndWatch,
          size: 'xs',
          color: '#7F1D1D',
          wrap: true,
          margin: 'sm',
        },
      ],
    });
  }

  // 6. 總監級戰略建議
  if (report.strategicAdvice) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      backgroundColor: '#EEF2FF',
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: '#C7D2FE',
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '🚀 總監級下一步推進戰略',
          size: 'xs',
          weight: 'bold',
          color: '#4338CA',
        },
        {
          type: 'text',
          text: report.strategicAdvice,
          size: 'xs',
          color: '#1E1B4B',
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
              backgroundColor: '#047857',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '📊 EXECUTIVE ALL-IN-ONE',
                  size: 'xxs',
                  weight: 'bold',
                  color: '#A7F3D0',
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
          text: '全方位對話、記事與工程智能統整',
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
      contents:
        bodyContents.length > 0
          ? bodyContents
          : [
              {
                type: 'text',
                text: rawText || '目前無可統整之內容',
                size: 'sm',
                color: '#1E293B',
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: '#F8FAFC',
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '📝 記事清單',
            text: '看記事',
          },
          style: 'primary',
          height: 'sm',
          color: '#0284C7',
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '📰 今日新聞',
            text: '今日新聞',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '🎛️ 選單',
            text: '選單',
          },
          style: 'secondary',
          height: 'sm',
          flex: 1,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: '📊 全方位對話與工程智能統整報告',
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

module.exports = {
  getQuickReply,
  createVideoFlex,
  createWebFlex,
  createImageFlex,
  createAudioFlex,
  createExecutiveSummaryFlex,
  createConstructionNewsFlex,
  createMenuFlex,
  createNewsAnalysisFlex,
  createAssistantFlex,
  createNotesFlex,
  createNoteHelperFlex,
  createSynthesisFlex,
};


