/**
 * LINE Flex Message 產生器
 * 採用高對比度 (High-Contrast Universal Palette) 設計
 * 確保在 iOS / Android / PC / Mac 的淺色與深色模式下所有文字皆清晰可見，絕不黑底黑字
 */

/**
 * 建立 YouTube / 影片精華 Flex 卡片
 */
function createVideoFlex({ title, points = [], supplement = '', url = '' }) {
  const pointContents = points.map((p, idx) => ({
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    margin: 'md',
    contents: [
      {
        type: 'text',
        text: `${idx + 1}.`,
        size: 'sm',
        color: '#2563EB',
        flex: 1,
        weight: 'bold',
      },
      {
        type: 'text',
        text: p,
        size: 'sm',
        color: '#1E293B',
        flex: 11,
        wrap: true,
      },
    ],
  }));

  const contents = [
    {
      type: 'text',
      text: '📌 核心精華',
      size: 'sm',
      weight: 'bold',
      color: '#2563EB',
    },
    ...pointContents,
  ];

  if (supplement) {
    contents.push(
      {
        type: 'separator',
        margin: 'lg',
        color: '#CBD5E1',
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '12px',
        backgroundColor: '#FFFBEB',
        cornerRadius: '8px',
        borderWidth: '1px',
        borderColor: '#FDE68A',
        contents: [
          {
            type: 'text',
            text: '💡 AI 智庫補充與延伸脈絡',
            size: 'xs',
            weight: 'bold',
            color: '#B45309',
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
      backgroundColor: '#1E293B',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '🎬 影片深度解析',
              size: 'xxs',
              weight: 'bold',
              color: '#F87171',
            },
            {
              type: 'text',
              text: 'YOUTUBE INSIGHT',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
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
          margin: 'sm',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#FFFFFF',
      paddingAll: '16px',
      contents,
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
            label: '▶️ 開啟原影片',
            uri: url,
          },
          style: 'primary',
          height: 'sm',
          color: '#2563EB',
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
      type: 'text',
      text: '📌 內容速讀',
      size: 'sm',
      weight: 'bold',
      color: '#059669',
    },
    {
      type: 'text',
      text: summary,
      size: 'sm',
      color: '#1E293B',
      wrap: true,
      margin: 'sm',
    },
  ];

  if (supplement) {
    bodyContents.push(
      {
        type: 'separator',
        margin: 'lg',
        color: '#CBD5E1',
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '12px',
        backgroundColor: '#ECFDF5',
        cornerRadius: '8px',
        borderWidth: '1px',
        borderColor: '#A7F3D0',
        contents: [
          {
            type: 'text',
            text: '💡 相關背景與延伸知識',
            size: 'xs',
            weight: 'bold',
            color: '#047857',
          },
          {
            type: 'text',
            text: supplement,
            size: 'xs',
            color: '#064E3B',
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
      backgroundColor: '#1E293B',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '🔗 網頁智能導讀',
              size: 'xxs',
              weight: 'bold',
              color: '#34D399',
            },
            {
              type: 'text',
              text: 'WEB INSIGHT',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
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
          margin: 'sm',
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
            label: '🌐 閱讀全文',
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
      type: 'text',
      text: '🖼️ 畫面主體解析',
      size: 'sm',
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
  ];

  if (ocr && ocr !== '無重要文字') {
    bodyContents.push(
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '10px',
        backgroundColor: '#F1F5F9',
        cornerRadius: '6px',
        borderWidth: '1px',
        borderColor: '#CBD5E1',
        contents: [
          {
            type: 'text',
            text: '🔍 提取文字 / 數據資訊',
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
      }
    );
  }

  if (supplement) {
    bodyContents.push(
      {
        type: 'separator',
        margin: 'lg',
        color: '#CBD5E1',
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '12px',
        backgroundColor: '#FAF5FF',
        cornerRadius: '8px',
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
      backgroundColor: '#1E293B',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '👁️ 影像智慧辨識',
              size: 'xxs',
              weight: 'bold',
              color: '#C084FC',
            },
            {
              type: 'text',
              text: 'VISION & OCR',
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
            },
          ],
        },
        {
          type: 'text',
          text: '圖片內容與數據洞察',
          weight: 'bold',
          size: 'md',
          color: '#FFFFFF',
          margin: 'sm',
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
 * 建立對話全貌整合 Flex 卡片
 */
function createExecutiveSummaryFlex({ title = '📋 對話深度總結報告', summaryText = '' }) {
  const bubble = {
    type: 'bubble',
    size: 'giga',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#1E293B',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '🤖 AI EXECUTIVE BRIEF',
              size: 'xxs',
              weight: 'bold',
              color: '#38BDF8',
            },
            {
              type: 'text',
              text: new Date().toLocaleDateString('zh-TW'),
              size: 'xxs',
              color: '#94A3B8',
              align: 'end',
            },
          ],
        },
        {
          type: 'text',
          text: title,
          weight: 'bold',
          size: 'md',
          color: '#FFFFFF',
          margin: 'sm',
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
          type: 'text',
          text: summaryText,
          size: 'sm',
          color: '#1E293B',
          wrap: true,
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: title,
    contents: bubble,
  };
}

module.exports = {
  createVideoFlex,
  createWebFlex,
  createImageFlex,
  createExecutiveSummaryFlex,
};
