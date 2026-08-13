/**
 * 🏛️ LINE Flex Message 頂級建築美學設計系統 (Unified Obsidian & Architectural Slate Palette)
 * 嚴格遵循統一色系：曜石黑 (#0A0F1D) Header + 香檳金 (#D97706 / #F59E0B) 點綴 + 雅緻微卡片 (#F8FAFC)
 * 全面消除雜亂彩虹配色，提供最高標準之商務主管與建築智庫視覺體驗
 */

const THEME = {
  // Header 曜石黑基底
  headerBg: '#0A0F1D',
  headerBorder: '#1E293B',

  // 標籤 Pill Badge (香檳金質感)
  badgeBg: '#2A2012',
  badgeText: '#F59E0B',
  badgeSub: '#94A3B8',
  headerTitle: '#FFFFFF',

  // 內容主背景
  bodyBg: '#FFFFFF',

  // 模組微卡片 (統一低飽和、高級感)
  cardBg: '#F8FAFC',
  cardBorder: '#E2E8F0',
  cardHighlightBg: '#F1F5F9',
  cardHighlightBorder: '#CBD5E1',

  // 文字層級
  titleText: '#0F172A',
  bodyText: '#334155',
  subText: '#64748B',
  mutedText: '#94A3B8',

  // 點綴色彩 (極簡 2 色系：香檳金、石板灰)
  accentGold: '#D97706',
  accentGoldBg: '#FEF3C7',
  accentGoldText: '#92400E',

  accentSlate: '#475569',
  accentSlateBg: '#F1F5F9',

  // 按鈕色彩
  btnPrimaryBg: '#0F172A',
  btnPrimaryText: '#FFFFFF',
  btnGoldBg: '#D97706',
  btnSecondaryBg: '#F1F5F9',
  btnSecondaryText: '#1E293B',
};

/**
 * 產生常駐底部 LINE Quick Reply 快捷按鈕列
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
        backgroundColor: THEME.accentGoldBg,
        cornerRadius: '6px',
        alignItems: 'center',
        justifyContent: 'center',
        contents: [
          {
            type: 'text',
            text: `${idx + 1}`,
            size: 'xxs',
            weight: 'bold',
            color: THEME.accentGoldText,
            align: 'center',
          },
        ],
      },
      {
        type: 'text',
        text: p,
        size: 'sm',
        color: THEME.bodyText,
        flex: 1,
        wrap: true,
      },
    ],
  }));

  const bodyContents = [
    {
      type: 'text',
      text: '📌 核心重點精華',
      size: 'xs',
      weight: 'bold',
      color: THEME.accentGold,
    },
    ...pointContents,
  ];

  if (supplement) {
    bodyContents.push(
      {
        type: 'separator',
        margin: 'lg',
        color: THEME.cardBorder,
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '12px',
        backgroundColor: THEME.cardBg,
        cornerRadius: '10px',
        borderWidth: '1px',
        borderColor: THEME.cardBorder,
        contents: [
          {
            type: 'text',
            text: '💡 AI 智庫補充與延伸脈絡',
            size: 'xs',
            weight: 'bold',
            color: THEME.titleText,
          },
          {
            type: 'text',
            text: supplement,
            size: 'xs',
            color: THEME.subText,
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
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
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
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '影音智慧解析',
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          wrap: true,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '16px',
      contents: bodyContents,
    },
  };

  if (url) {
    bubble.footer = {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardBg,
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
          color: THEME.btnPrimaryBg,
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
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '📌 網頁核心速讀',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: summary,
          size: 'sm',
          color: THEME.bodyText,
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
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      contents: [
        {
          type: 'text',
          text: '💡 延伸背景與智庫知識',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: supplement,
          size: 'xs',
          color: THEME.subText,
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
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
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
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '網頁智能導讀',
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          wrap: true,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '16px',
      contents: bodyContents,
    },
  };

  if (url) {
    bubble.footer = {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardBg,
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
          color: THEME.btnPrimaryBg,
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
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: description,
          size: 'sm',
          color: THEME.bodyText,
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
      backgroundColor: THEME.cardBg,
      cornerRadius: '8px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: [
        {
          type: 'text',
          text: '🔍 提取文字與數據資訊',
          size: 'xxs',
          weight: 'bold',
          color: THEME.subText,
        },
        {
          type: 'text',
          text: ocr,
          size: 'xs',
          color: THEME.titleText,
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
        color: THEME.cardBorder,
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '12px',
        backgroundColor: THEME.cardHighlightBg,
        cornerRadius: '10px',
        borderWidth: '1px',
        borderColor: THEME.cardHighlightBorder,
        contents: [
          {
            type: 'text',
            text: '💡 專業洞察與補充建議',
            size: 'xs',
            weight: 'bold',
            color: THEME.titleText,
          },
          {
            type: 'text',
            text: supplement,
            size: 'xs',
            color: THEME.subText,
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
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
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
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '影像智慧辨識',
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
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
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
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
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: 'Whisper AI 辨識',
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          backgroundColor: THEME.cardBg,
          cornerRadius: '10px',
          borderWidth: '1px',
          borderColor: THEME.cardBorder,
          paddingAll: '12px',
          contents: [
            {
              type: 'text',
              text: '📝 語音轉譯內容',
              size: 'xs',
              weight: 'bold',
              color: THEME.titleText,
            },
            {
              type: 'text',
              text: transcript || '（無內容）',
              size: 'sm',
              color: THEME.bodyText,
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
      pattern: /📊|對話紀錄|發言摘要|討論主軸|核心議題/,
      title: '對話紀錄與各人發言摘要',
      badge: 'SPEECHES',
    },
    {
      key: 'decisions',
      pattern: /💡|討論焦點|共同事項|重要結論|關鍵決策/,
      title: '討論焦點與共同事項',
      badge: 'TOPICS',
    },
    {
      key: 'todos',
      pattern: /🎯|交辦|待辦|約定事項|行動清單/,
      title: '交辦／待辦／約定事項',
      badge: 'ACTION ITEMS',
    },
    {
      key: 'insights',
      pattern: /📚|備忘|延伸提醒|智庫補充|延伸洞察/,
      title: '備忘與延伸提醒',
      badge: 'NOTES',
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
 * 建立對話全貌整合 Flex 卡片
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
          color: THEME.accentGold,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: item,
          size: 'xs',
          color: THEME.bodyText,
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
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'md',
              paddingStart: '6px',
              paddingEnd: '6px',
              paddingTop: '2px',
              paddingBottom: '2px',
              contents: [
                {
                  type: 'text',
                  text: sec.def.badge || 'REPORT',
                  size: 'xxs',
                  weight: 'bold',
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: sec.title,
              size: 'xs',
              weight: 'bold',
              color: THEME.titleText,
              margin: 'sm',
              gravity: 'center',
            },
          ],
        },
        ...itemsContents,
      ],
    };
  });

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '📋 EXECUTIVE SUMMARY',
                  size: 'xxs',
                  weight: 'bold',
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: new Date().toLocaleDateString('zh-TW'),
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '16px',
      contents:
        sectionCards.length > 0
          ? sectionCards
          : [
              {
                type: 'text',
                text: summaryText,
                size: 'sm',
                color: THEME.bodyText,
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
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
          color: THEME.btnPrimaryBg,
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
    altText: `📋 對話深度總結報告 (${new Date().toLocaleDateString('zh-TW')})`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立今日建築情報 Flex 卡片 (統一黑曜金簡報卡)
 */
function createConstructionNewsFlex(digest) {
  const dateStr = digest.date || new Date().toLocaleDateString('zh-TW');
  const categoryTitle = digest.categoryName || '綜合全訊';

  const bodyContents = [];

  // 今日核心概述
  if (digest.overview) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '📌 產業焦點總覽',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: digest.overview,
          size: 'xs',
          color: THEME.bodyText,
          wrap: true,
          margin: 'xs',
        },
      ],
    });
  }

  // 新聞條目微卡片
  (digest.items || []).forEach((item, idx) => {
    const newsCardContents = [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: THEME.badgeBg,
            cornerRadius: 'md',
            paddingStart: '6px',
            paddingEnd: '6px',
            paddingTop: '2px',
            paddingBottom: '2px',
            contents: [
              {
                type: 'text',
                text: item.category || '🏗️ 產業即時',
                size: 'xxs',
                weight: 'bold',
                color: THEME.badgeText,
              },
            ],
          },
          {
            type: 'text',
            text: item.source || '媒體報導',
            size: 'xxs',
            color: THEME.subText,
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
        color: THEME.titleText,
        wrap: true,
        margin: 'sm',
      },
      {
        type: 'text',
        text: item.summary,
        size: 'xs',
        color: THEME.bodyText,
        wrap: true,
        margin: 'xs',
      },
    ];

    // 智庫觀點
    if (item.insight) {
      newsCardContents.push({
        type: 'box',
        layout: 'vertical',
        margin: 'sm',
        paddingAll: '8px',
        backgroundColor: '#FFFFFF',
        cornerRadius: '6px',
        borderWidth: '1px',
        borderColor: THEME.cardBorder,
        contents: [
          {
            type: 'text',
            text: `💡 智庫解讀：${item.insight}`,
            size: 'xxs',
            color: THEME.subText,
            wrap: true,
          },
        ],
      });
    }

    // 操作按鈕列
    const actionButtons = [];
    if (item.url) {
      actionButtons.push({
        type: 'button',
        action: {
          type: 'uri',
          label: '🔗 原文',
          uri: item.url,
        },
        style: 'secondary',
        height: 'sm',
        flex: 1,
      });
    }

    actionButtons.push({
      type: 'button',
      action: {
        type: 'message',
        label: '💡 深度剖析',
        text: `剖析新聞: ${item.title}`,
      },
      style: 'primary',
      height: 'sm',
      color: THEME.btnPrimaryBg,
      flex: 1,
    });

    newsCardContents.push({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      margin: 'sm',
      contents: actionButtons,
    });

    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      margin: idx === 0 && !digest.overview ? 'none' : 'md',
      paddingAll: '12px',
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: newsCardContents,
    });
  });

  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🏗️ ARCHITECTURE BRIEF',
                  size: 'xxs',
                  weight: 'bold',
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: dateStr,
              size: 'xxs',
              color: THEME.badgeSub,
              align: 'end',
              gravity: 'center',
            },
          ],
        },
        {
          type: 'text',
          text: `今日建築情報 · ${categoryTitle}`,
          weight: 'bold',
          size: 'md',
          color: THEME.headerTitle,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '16px',
      contents: bodyContents,
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
      paddingAll: '12px',
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
          color: THEME.btnGoldBg,
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
    altText: `🏗️ 今日建築情報 · ${categoryTitle} (${dateStr})`,
    contents: bubble,
    quickReply: getQuickReply(),
  };
}

/**
 * 建立 🎛️ 智能控制台 / 快捷功能選單 Flex 卡片 (統一黑曜金)
 */
function createMenuFlex() {
  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
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
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '全功能快捷控制台',
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          margin: 'md',
        },
        {
          type: 'text',
          text: '點擊下方按鈕即可立即取得最新資訊，無需手動輸入。',
          size: 'xs',
          color: THEME.badgeSub,
          margin: 'xs',
          wrap: true,
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '16px',
      spacing: 'md',
      contents: [
        // 區塊 1: 記事本與深度統整
        {
          type: 'text',
          text: '📝 智能記事與全方位統整',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
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
              color: THEME.btnGoldBg,
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
              color: THEME.btnPrimaryBg,
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
                label: '📊 全方位智能統整',
                text: '智能統整',
              },
              style: 'secondary',
              height: 'sm',
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
          color: THEME.cardBorder,
        },
        // 區塊 2: 即時新聞與專題
        {
          type: 'text',
          text: '📰 建築與營造產業情報（次次更新）',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
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
              color: THEME.btnGoldBg,
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
          color: THEME.cardBorder,
        },
        // 區塊 3: 對話紀錄與管理
        {
          type: 'text',
          text: '📋 對話管理與工具',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
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
      backgroundColor: THEME.cardBg,
      paddingAll: '10px',
      contents: [
        {
          type: 'text',
          text: '💡 點擊「快捷記一筆」開啟範本，或直接輸入「記下：...」',
          size: 'xxs',
          color: THEME.mutedText,
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
 * 建立新聞深度智庫剖析 Flex 卡片 (統一黑曜金)
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

  const sections = [
    { title: '📌 事件核心與背景脈絡', text: analysis.context },
    { title: '🏗️ 工程工法與設計面衝擊', text: analysis.techImpact },
    { title: '📜 法規政策與制度規範影響', text: analysis.policyImpact },
    { title: '📈 產業供應鏈與市場商機', text: analysis.marketOpportunity },
    { title: '💡 專家因應策略建議', text: analysis.strategyAdvice, highlight: true },
  ].filter((s) => Boolean(s.text));

  const bodyContents = sections.map((sec, idx) => ({
    type: 'box',
    layout: 'vertical',
    margin: idx === 0 ? 'none' : 'md',
    backgroundColor: sec.highlight ? THEME.cardHighlightBg : THEME.cardBg,
    cornerRadius: '10px',
    borderWidth: '1px',
    borderColor: sec.highlight ? THEME.cardHighlightBorder : THEME.cardBorder,
    paddingAll: '12px',
    contents: [
      {
        type: 'text',
        text: sec.title,
        size: 'xs',
        weight: 'bold',
        color: THEME.titleText,
      },
      {
        type: 'text',
        text: sec.text,
        size: 'xs',
        color: THEME.bodyText,
        wrap: true,
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
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
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
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '智庫首席剖析',
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          wrap: true,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '16px',
      contents:
        bodyContents.length > 0
          ? bodyContents
          : [
              {
                type: 'text',
                text: analysisText || analysis.rawText || '無剖析內容',
                size: 'sm',
                color: THEME.bodyText,
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
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
          color: THEME.btnGoldBg,
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
 * 建立 AI 顧問問答 Flex 卡片 (統一黑曜金)
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

  // 1. 核心結論
  if (result.conclusion) {
    bodyContents.push({
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '💎 核心結論與策略解法',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: result.conclusion,
          size: 'sm',
          color: THEME.titleText,
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
          color: THEME.accentGold,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: item,
          size: 'xs',
          color: THEME.bodyText,
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
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: [
        {
          type: 'text',
          text: '📐 關鍵法規與技術要點',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
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
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '⚠️ 實務風險與避坑指南',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: result.risks,
          size: 'xs',
          color: THEME.bodyText,
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
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '🚀 建議下一步行動',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: result.nextStep,
          size: 'xs',
          color: THEME.bodyText,
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
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
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
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '智庫特助解答',
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          wrap: true,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '16px',
      contents:
        bodyContents.length > 0
          ? bodyContents
          : [
              {
                type: 'text',
                text: answer || result.rawText || '無解答內容',
                size: 'sm',
                color: THEME.bodyText,
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
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
          color: THEME.btnPrimaryBg,
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
 * 建立 📝 智能記事本與待辦清單 Flex 卡片 (統一黑曜金)
 */
function createNotesFlex(notes = []) {
  const noteCards = notes.map((note, idx) => {
    const cardContents = [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: THEME.badgeBg,
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
                color: THEME.badgeText,
              },
            ],
          },
          {
            type: 'text',
            text: note.dueDate && note.dueDate !== '未指定' ? `⏳ ${note.dueDate}` : '進行中',
            size: 'xxs',
            color: THEME.subText,
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
        color: THEME.titleText,
        wrap: true,
        margin: 'sm',
      },
    ];

    if (note.details) {
      cardContents.push({
        type: 'text',
        text: note.details,
        size: 'xs',
        color: THEME.subText,
        wrap: true,
        margin: 'xs',
      });
    }

    return {
      type: 'box',
      layout: 'vertical',
      margin: idx === 0 ? 'none' : 'md',
      paddingAll: '12px',
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
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
            backgroundColor: THEME.cardBg,
            cornerRadius: '10px',
            borderWidth: '1px',
            borderColor: THEME.cardBorder,
            contents: [
              {
                type: 'text',
                text: '📭 目前尚無待辦記事',
                size: 'sm',
                weight: 'bold',
                color: THEME.titleText,
                align: 'center',
              },
              {
                type: 'text',
                text: '點選「➕ 記一筆」查看範本，或傳送「記下：下週三送審」即可建立！',
                size: 'xs',
                color: THEME.subText,
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
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
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
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: `${notes.length} 項紀錄`,
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '16px',
      contents: bodyContents,
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
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
          color: THEME.btnGoldBg,
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
          color: THEME.btnPrimaryBg,
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
 * 建立 📝 智能記事快捷引導選單 / 範本 Flex 卡片 (統一黑曜金)
 */
function createNoteHelperFlex() {
  const templates = [
    {
      badge: '📅 日程會議',
      title: '工程會勘 / 會議日程',
      example: '記下：明天上午9點結構技師工地會勘',
    },
    {
      badge: '📋 待辦交辦',
      title: '法規送審 / 待辦交辦',
      example: '記下：下週三向建管處送審執照變更案',
    },
    {
      badge: '💰 報價成本',
      title: '建材報價 / 發包成本',
      example: '備忘：鋼筋每噸最新報價 21,500 元',
    },
    {
      badge: '📐 工程技術',
      title: '工法規格 / 結構變更',
      example: '記下：連續壁厚度由70cm調整至80cm',
    },
    {
      badge: '💡 靈感策略',
      title: '都更危老 / 獎勵策略',
      example: '備忘：爭取危老容積獎勵滿額40%',
    },
  ];

  const templateRows = templates.map((tpl, idx) => ({
    type: 'box',
    layout: 'vertical',
    margin: idx === 0 ? 'none' : 'md',
    paddingAll: '10px',
    backgroundColor: THEME.cardBg,
    cornerRadius: '10px',
    borderWidth: '1px',
    borderColor: THEME.cardBorder,
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: THEME.badgeBg,
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
                color: THEME.badgeText,
              },
            ],
          },
          {
            type: 'text',
            text: tpl.title,
            size: 'xs',
            weight: 'bold',
            color: THEME.titleText,
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
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
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
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: '一鍵快速記事',
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          margin: 'md',
        },
        {
          type: 'text',
          text: '無需硬記指令！點擊下方任一範本即可直接填入或修改發送：',
          size: 'xs',
          color: THEME.badgeSub,
          margin: 'xs',
          wrap: true,
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '14px',
      contents: templateRows,
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
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
          color: THEME.btnPrimaryBg,
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
 * 建立 📊 全方位智能統整報告 Flex 卡片 (統一黑曜金)
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
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '🎯 今日工作與對話推進總結',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: report.overview,
          size: 'xs',
          color: THEME.bodyText,
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
          color: THEME.accentGold,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: d,
          size: 'xs',
          color: THEME.bodyText,
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
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: [
        {
          type: 'text',
          text: '💡 重要決策與共識定案',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
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
          color: THEME.accentGold,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: a,
          size: 'xs',
          color: THEME.bodyText,
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
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: [
        {
          type: 'text',
          text: '📌 待辦與工程交辦清單',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
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
          color: THEME.accentGold,
          flex: 0,
          weight: 'bold',
        },
        {
          type: 'text',
          text: k,
          size: 'xs',
          color: THEME.bodyText,
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
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      contents: [
        {
          type: 'text',
          text: '💰 關鍵數據與報價備忘',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
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
      backgroundColor: THEME.cardBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardBorder,
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '⚠️ 工程介面與時程風險預警',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: report.risksAndWatch,
          size: 'xs',
          color: THEME.bodyText,
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
      backgroundColor: THEME.cardHighlightBg,
      cornerRadius: '10px',
      borderWidth: '1px',
      borderColor: THEME.cardHighlightBorder,
      paddingAll: '12px',
      contents: [
        {
          type: 'text',
          text: '🚀 總監級下一步推進戰略',
          size: 'xs',
          weight: 'bold',
          color: THEME.titleText,
        },
        {
          type: 'text',
          text: report.strategicAdvice,
          size: 'xs',
          color: THEME.bodyText,
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
      backgroundColor: THEME.headerBg,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: THEME.badgeBg,
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
                  color: THEME.badgeText,
                },
              ],
            },
            {
              type: 'text',
              text: new Date().toLocaleDateString('zh-TW'),
              size: 'xxs',
              color: THEME.badgeSub,
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
          color: THEME.headerTitle,
          margin: 'md',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: THEME.bodyBg,
      paddingAll: '16px',
      contents:
        bodyContents.length > 0
          ? bodyContents
          : [
              {
                type: 'text',
                text: rawText || '目前無可統整之內容',
                size: 'sm',
                color: THEME.bodyText,
                wrap: true,
              },
            ],
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      backgroundColor: THEME.cardBg,
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
          color: THEME.btnPrimaryBg,
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
  THEME,
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
