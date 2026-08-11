/**
 * LINE Flex Message 產生器
 * 打造高質感、現代深色系 (Dark Mode Glassmorphism) 智能卡片排版
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
        size: 'xs',
        color: '#38BDF8',
        flex: 1,
        weight: 'bold',
      },
      {
        type: 'text',
        text: p,
        size: 'xs',
        color: '#CBD5E1',
        flex: 11,
        wrap: true,
      },
    ],
  }));

  const contents = [
    {
      type: 'text',
      text: '📌 核心精華',
      size: 'xs',
      weight: 'bold',
      color: '#38BDF8',
    },
    ...pointContents,
  ];

  if (supplement) {
    contents.push(
      {
        type: 'separator',
        margin: 'lg',
        color: '#334155',
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '10px',
        backgroundColor: '#1E293B',
        cornerRadius: '8px',
        contents: [
          {
            type: 'text',
            text: '💡 AI 智庫補充與延伸脈絡',
            size: 'xs',
            weight: 'bold',
            color: '#F59E0B',
          },
          {
            type: 'text',
            text: supplement,
            size: 'xs',
            color: '#E2E8F0',
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
              type: 'text',
              text: '🎬 影片深度解析',
              size: 'xxs',
              weight: 'bold',
              color: '#EF4444',
            },
            {
              type: 'text',
              text: 'YOUTUBE INSIGHT',
              size: 'xxs',
              color: '#64748B',
              align: 'end',
            },
          ],
        },
        {
          type: 'text',
          text: title || 'YouTube 影片',
          weight: 'bold',
          size: 'md',
          color: '#F8FAFC',
          wrap: true,
          margin: 'sm',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      paddingTop: '0px',
      contents,
    },
  };

  if (url) {
    bubble.footer = {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '12px',
      paddingTop: '0px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: '▶️ 開啟原影片',
            uri: url,
          },
          style: 'secondary',
          height: 'sm',
          color: '#1E293B',
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
      size: 'xs',
      weight: 'bold',
      color: '#38BDF8',
    },
    {
      type: 'text',
      text: summary,
      size: 'xs',
      color: '#CBD5E1',
      wrap: true,
      margin: 'sm',
    },
  ];

  if (supplement) {
    bodyContents.push(
      {
        type: 'separator',
        margin: 'lg',
        color: '#334155',
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '10px',
        backgroundColor: '#1E293B',
        cornerRadius: '8px',
        contents: [
          {
            type: 'text',
            text: '💡 相關背景與延伸知識',
            size: 'xs',
            weight: 'bold',
            color: '#10B981',
          },
          {
            type: 'text',
            text: supplement,
            size: 'xs',
            color: '#E2E8F0',
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
              type: 'text',
              text: '🔗 網頁智能導讀',
              size: 'xxs',
              weight: 'bold',
              color: '#10B981',
            },
            {
              type: 'text',
              text: 'WEB INSIGHT',
              size: 'xxs',
              color: '#64748B',
              align: 'end',
            },
          ],
        },
        {
          type: 'text',
          text: title || '網頁連結',
          weight: 'bold',
          size: 'md',
          color: '#F8FAFC',
          wrap: true,
          margin: 'sm',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      paddingTop: '0px',
      contents: bodyContents,
    },
  };

  if (url) {
    bubble.footer = {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '12px',
      paddingTop: '0px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label: '🌐 閱讀全文',
            uri: url,
          },
          style: 'secondary',
          height: 'sm',
          color: '#1E293B',
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
      size: 'xs',
      weight: 'bold',
      color: '#A855F7',
    },
    {
      type: 'text',
      text: description,
      size: 'xs',
      color: '#CBD5E1',
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
        paddingAll: '8px',
        backgroundColor: '#1E293B',
        cornerRadius: '6px',
        contents: [
          {
            type: 'text',
            text: '🔍 提取文字 / 數據資訊',
            size: 'xxs',
            weight: 'bold',
            color: '#38BDF8',
          },
          {
            type: 'text',
            text: ocr,
            size: 'xs',
            color: '#E2E8F0',
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
        color: '#334155',
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'md',
        paddingAll: '10px',
        backgroundColor: '#1E293B',
        cornerRadius: '8px',
        contents: [
          {
            type: 'text',
            text: '💡 專業洞察與補充建議',
            size: 'xs',
            weight: 'bold',
            color: '#F59E0B',
          },
          {
            type: 'text',
            text: supplement,
            size: 'xs',
            color: '#E2E8F0',
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
              type: 'text',
              text: '👁️ 影像智慧辨識',
              size: 'xxs',
              weight: 'bold',
              color: '#A855F7',
            },
            {
              type: 'text',
              text: 'VISION & OCR',
              size: 'xxs',
              color: '#64748B',
              align: 'end',
            },
          ],
        },
        {
          type: 'text',
          text: '圖片內容與數據洞察',
          weight: 'bold',
          size: 'md',
          color: '#F8FAFC',
          margin: 'sm',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      paddingTop: '0px',
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
      backgroundColor: '#0F172A',
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
              color: '#64748B',
              align: 'end',
            },
          ],
        },
        {
          type: 'text',
          text: title,
          weight: 'bold',
          size: 'md',
          color: '#F8FAFC',
          margin: 'sm',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      paddingTop: '0px',
      contents: [
        {
          type: 'text',
          text: summaryText,
          size: 'xs',
          color: '#CBD5E1',
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
