// 自动生成的字体预加载配置
export const fontPreloadConfig = [
  {
    "name": "Inter-Black",
    "file": "Inter-Black.woff2",
    "weight": "normal",
    "style": "normal"
  },
  {
    "name": "Inter-Bold",
    "file": "Inter-Bold.woff2",
    "weight": "bold",
    "style": "normal"
  },
  {
    "name": "Inter-BoldItalic",
    "file": "Inter-BoldItalic.woff2",
    "weight": "bold",
    "style": "italic"
  },
  {
    "name": "Inter-ExtraBold",
    "file": "Inter-ExtraBold.woff2",
    "weight": "bold",
    "style": "normal"
  },
  {
    "name": "Inter-Italic",
    "file": "Inter-Italic.woff2",
    "weight": "normal",
    "style": "italic"
  },
  {
    "name": "Inter-Medium",
    "file": "Inter-Medium.woff2",
    "weight": "normal",
    "style": "normal"
  },
  {
    "name": "Inter-MediumItalic",
    "file": "Inter-MediumItalic.woff2",
    "weight": "normal",
    "style": "italic"
  },
  {
    "name": "Inter-Regular",
    "file": "Inter-Regular.woff2",
    "weight": "normal",
    "style": "normal"
  }
];

export const getFontPreloadLinks = () => {
    return fontPreloadConfig.map(font => ({
        rel: 'preload',
        href: `/fonts/${font.file}`,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous'
    }));
};
