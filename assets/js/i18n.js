/* UI strings for 中文 / English / 日本語. Content metadata lives in data/costumes.json.
 * Tips and notices are adapted from the original site's 使い方のヒント / 注意点. */

export const LANGS = ['zh', 'en', 'ja'];

export const LANG_ATTR = {
  zh: 'zh-CN',
  en: 'en',
  ja: 'ja',
};

export const UI = {
  zh: {
    docTitle: 'DressingAtlas · 衣装图鉴数据库 | Costume Atlas',
    metaDescription:
      'AI 生成服装参考图库：1407 套原创服装、2814 张图像，按春季、夏季、秋季、冬季、内衣、派对、泳装、性感八个分类整理，支持编号与关键词检索，适用于 AI 绘画与角色设计参考。',
    brandName: '衣装图鉴',
    eyebrow: 'DressingAtlas ・ COSTUME DB ・ AI 绘画 / 角色设计服装参考',
    skip: '跳到图库',
    h1a: '衣装图鉴',
    h1b: '数据库',
    heroSub:
      '不含人物的服装参考图（2:3）。春季、夏季、秋季、冬季、内衣、派对、泳装、性感八个分类，方便按主题浏览与关键词检索。',
    languageLabel: '切换语言',
    tabTips: '使用提示',
    tabNotice: '注意事项',
    tipsTitle: '使用提示',
    tips: [
      '把图像载入各种 AI 工具的服装参考、图像参考功能中作为参照图使用。',
      '通过分类按钮筛选，或在搜索框中输入编号或服装关键词（如 denim、lace、white）查找。',
      '需要观察细节时，请下载原图；网格中的缩略图仅用于快速浏览。',
      '图片是不含人物的服装参考，脸、体型与背景请通过其他参考图或指示补充。',
    ],
    noticesTitle: '注意事项',
    notices: [
      '原作可免费用于作品制作，包括商用、编辑与参考。',
      '图片数据本身（原图及加工后）禁止再分发、转载与转售。',
      '署名非必需，图片元数据已清除，请自行承担使用风险。',
      '所有服装均为 AI 生成的虚构设计，并非真实商品的照片。',
      '发布前已做与现有品牌的相似度检查，但不保证不侵犯第三方权利。',
      '请勿用于指涉真实人物或未成年人，或违反公序良俗的用途。',
      '本站为非官方学习性质的静态镜像，图片版权归原作者 ギア 所有；若有异议请通过原始仓库联系下架。',
    ],
    ariaInfo: '使用提示与注意事项',
    closeInfo: '关闭',
    ariaLanguage: '切换语言',
    categoryAll: '全部',
    ariaCategory: '按分类筛选',
    ariaSearch: '搜索编号、分类或服装关键词',
    searchPlaceholder: '搜索编号、分类或关键词（如 denim、lace）',
    filter: '筛选',
    countOne: '{n} 套服装',
    countMany: '{n} 套服装',
    emptyTitle: '没有匹配的服装',
    emptyText: '换一个关键词，或清除当前的筛选条件。',
    clearFilters: '清除筛选',
    cardAria: '查看{name}',
    modalAria: '大图预览',
    modalClose: '关闭大图',
    prevItem: '上一套',
    nextItem: '下一套',
    imageAlt: '{name}',
    imageError: '原图加载失败',
    loadErrorTitle: '图库数据加载失败',
    loadErrorText: '请通过本地 HTTP 服务打开本项目（例如 python3 -m http.server），或部署到静态托管后访问。',
    metaCategory: '分类',
    metaId: '编号',
    metaPrompt: '关键词',
    metaSpec: '规格',
    specValue: '最大 1366 × 2048 · WebP',
    download: '下载原图（WebP）',
    downloadPng: '下载原图（PNG）',
    downloadNotePng: '无损 PNG 原图（1366 × 2048），来自本地 png/ 目录，可直接使用。',
    downloadNote: '高分辨率 WebP（最大 1366 × 2048）；无损 PNG 原图请前往原站获取。',
    originalLink: '原站 PNG',
    copyPrompt: '复制关键词',
    copied: '已复制',
    keysHint: '<kbd>←</kbd><kbd>→</kbd> 切换服装　<kbd>Esc</kbd> 关闭',
    footerLead: 'DressingAtlas · 衣装图鉴 COSTUME ATLAS',
    footerCredits:
      '图片来源：<a href="https://ai-costume-gallery.pages.dev/" target="_blank" rel="noopener noreferrer">COSTUME-DB-01</a>（作者 <a href="https://x.com/giaaibusi" target="_blank" rel="noopener noreferrer">ギア</a>）。结构与三语界面参考 <a href="https://github.com/HRuiCcc/RuiC-PoseAtlas" target="_blank" rel="noopener noreferrer">RuiC-PoseAtlas</a>。',
    footerLicense:
      '本页为个人学习性质的静态镜像实现，图片版权归原作者所有；请勿转售或再分发图片数据本身。',
    footerMeta: '{items} 套服装 · {images} 张图像',
  },

  en: {
    docTitle: 'DressingAtlas · Costume Atlas Database',
    metaDescription:
      'An AI-generated costume reference library: 1,407 original outfits and 2,814 images organized into Spring, Summer, Autumn, Winter, Lingerie, Party, Swimsuit and Sexy categories, searchable by ID and keywords for AI art and character design.',
    brandName: 'Costume Atlas',
    eyebrow: 'DRESSINGATLAS · COSTUME DB · AI ART / CHARACTER DESIGN REFERENCE',
    skip: 'Skip to gallery',
    h1a: 'Costume Atlas',
    h1b: 'Database',
    heroSub:
      'Costume-only reference images with no figure (2:3). Browse eight categories — Spring, Summer, Autumn, Winter, Lingerie, Party, Swimsuit and Sexy — or search by ID and keywords.',
    languageLabel: 'Switch language',
    tabTips: 'Tips',
    tabNotice: 'Notes',
    tipsTitle: 'How to use',
    tips: [
      'Load the images as outfit or image references in your AI tool of choice.',
      'Filter with the category buttons, or search by ID and outfit keywords such as denim, lace or white.',
      'Download the full-size image when detail matters; the grid thumbnails are for quick browsing.',
      'These are costume-only images without a figure. Add face, body and background through other references or prompts.',
    ],
    noticesTitle: 'Please note',
    notices: [
      'The original artwork is free to use for creative work, including commercial use, editing and reference.',
      'Redistribution, reposting or resale of the image data itself (original or edited) is prohibited.',
      'Credit is optional; metadata has been stripped. Use at your own risk.',
      'All outfits are fictional AI-generated designs, not photos of real products.',
      'Similarity against existing brands was checked before publication, but non-infringement of third-party rights is not guaranteed.',
      'Do not use them to depict real individuals or minors, or in ways that violate public order and morals.',
      'This is an unofficial, learning-oriented static mirror. Image rights belong to the original author, ギア. Takedown requests can be made through the original repository.',
    ],
    ariaInfo: 'Usage tips and notes',
    closeInfo: 'Close',
    ariaLanguage: 'Switch language',
    categoryAll: 'All',
    ariaCategory: 'Filter by category',
    ariaSearch: 'Search ID, category or outfit keywords',
    searchPlaceholder: 'Search ID, category or keywords (e.g. denim, lace)',
    filter: 'Filter',
    countOne: '{n} outfit',
    countMany: '{n} outfits',
    emptyTitle: 'No matching outfits',
    emptyText: 'Try another keyword, or clear the current filters.',
    clearFilters: 'Clear filters',
    cardAria: 'View {name}',
    modalAria: 'Full-size preview',
    modalClose: 'Close preview',
    prevItem: 'Previous outfit',
    nextItem: 'Next outfit',
    imageAlt: '{name}',
    imageError: 'Failed to load image',
    loadErrorTitle: 'Failed to load gallery data',
    loadErrorText: 'Open this project through a local HTTP server (e.g. python3 -m http.server) or deploy it to static hosting.',
    metaCategory: 'Category',
    metaId: 'ID',
    metaPrompt: 'Keywords',
    metaSpec: 'Spec',
    specValue: 'Up to 1366 × 2048 · WebP',
    download: 'Download image (WebP)',
    downloadPng: 'Download original (PNG)',
    downloadNotePng: 'Lossless PNG original (1366 × 2048), served from the local png/ folder of this checkout.',
    downloadNote: 'High-resolution WebP (up to 1366 × 2048); lossless PNG originals are available on the original site.',
    originalLink: 'PNG on original site',
    copyPrompt: 'Copy keywords',
    copied: 'Copied',
    keysHint: '<kbd>←</kbd><kbd>→</kbd> switch outfits　<kbd>Esc</kbd> close',
    footerLead: 'DressingAtlas · Costume Atlas',
    footerCredits:
      'Images from <a href="https://ai-costume-gallery.pages.dev/" target="_blank" rel="noopener noreferrer">COSTUME-DB-01</a> by <a href="https://x.com/giaaibusi" target="_blank" rel="noopener noreferrer">ギア</a>. Structure and trilingual UI inspired by <a href="https://github.com/HRuiCcc/RuiC-PoseAtlas" target="_blank" rel="noopener noreferrer">RuiC-PoseAtlas</a>.',
    footerLicense:
      'An unofficial, learning-oriented static mirror. Image rights belong to the original author; do not resell or redistribute the image data itself.',
    footerMeta: '{items} outfits · {images} images',
  },

  ja: {
    docTitle: 'DressingAtlas · 衣装集データベース | Costume Atlas',
    metaDescription:
      'AI 生成の衣装参照ライブラリ：オリジナル衣装 1,407 点・画像 2,814 枚を「春・夏・秋・冬・ランジェリー・パーティ・水着・セクシー」の 8 カテゴリで整理。ID とキーワード検索に対応し、AI イラストやキャラクターデザインの参考に。',
    brandName: '衣装集',
    eyebrow: 'DRESSINGATLAS ・ COSTUME DB ・ AI イラスト / キャラデザ衣装リファレンス',
    skip: 'ギャラリーへ',
    h1a: '衣装集',
    h1b: 'データベース',
    heroSub:
      '人物の入っていない、衣装だけの画像（2:3）。春・夏・秋・冬・ランジェリー・パーティ・水着・セクシーのカテゴリで閲覧でき、ID やキーワードで検索できます。',
    languageLabel: '言語切替',
    tabTips: '使い方のヒント',
    tabNotice: '注意点',
    tipsTitle: '使い方のヒント',
    tips: [
      '参照画像として、各種 AI ツールの服装参照・画像参照機能に読み込みます。',
      'カテゴリボタンで絞り込み、検索欄で ID や衣装の単語（例：denim、lace、white）を探せます。',
      '細部まで参照したい場合は元サイズの画像をダウンロードしてください。グリッドのサムネイルは簡易閲覧用です。',
      '人物の入っていない、衣装だけの画像です。顔・体型・背景は、別の参照画像や指示で足してください。',
    ],
    noticesTitle: '注意点',
    notices: [
      '無償で利用できます（作品制作での商用利用・編集・参考利用 OK）。',
      '画像データそのもの（元サイズ・加工後を含む）の再配布・転載・再販は禁止です。',
      'クレジット表記は不要です（任意）。画像のメタデータは削除済みです。無保証でご利用ください。',
      '掲載している衣装はすべて、AI で作った架空のデザインであり、実在の商品の写真ではありません。',
      '掲載前に既存ブランドとの類似チェックを行っていますが、他社の権利を侵害しないことを保証するものではありません。',
      '実在人物や未成年を表す用途、公序良俗に反する用途には使わないでください。',
      '本サイトは学習目的の非公式ミラーです。画像の権利は原作者 ギア に帰属します。問題がある場合は元リポジトリまでご連絡ください。',
    ],
    ariaInfo: '使い方のヒントと注意点',
    closeInfo: '閉じる',
    ariaLanguage: '言語切替',
    categoryAll: 'すべて',
    ariaCategory: 'カテゴリで絞り込み',
    ariaSearch: 'ID・カテゴリ・衣装のキーワードで検索',
    searchPlaceholder: 'ID・カテゴリ・キーワードで検索（例：denim、lace）',
    filter: '絞り込み',
    countOne: '{n} 着',
    countMany: '{n} 着',
    emptyTitle: '該当する衣装がありません',
    emptyText: 'キーワードを変えるか、絞り込みを解除してください。',
    clearFilters: '絞り込みを解除',
    cardAria: '{name} を見る',
    modalAria: '拡大プレビュー',
    modalClose: 'プレビューを閉じる',
    prevItem: '前の衣装',
    nextItem: '次の衣装',
    imageAlt: '{name}',
    imageError: '画像の読み込みに失敗しました',
    loadErrorTitle: 'ギャラリーデータの読み込みに失敗しました',
    loadErrorText: 'ローカル HTTP サーバー経由で開くか（例：python3 -m http.server）、静的ホスティングにデプロイしてアクセスしてください。',
    metaCategory: 'カテゴリ',
    metaId: 'ID',
    metaPrompt: 'キーワード',
    metaSpec: '仕様',
    specValue: '最大 1366 × 2048 · WebP',
    download: '元サイズをダウンロード（WebP）',
    downloadPng: '元サイズをダウンロード（PNG）',
    downloadNotePng: 'ロスレスの PNG 原寸（1366 × 2048）。このチェックアウトの png/ フォルダから提供されます。',
    downloadNote: '高解像度 WebP（最大 1366 × 2048）。ロスレスの PNG 原寸は原サイトで入手できます。',
    originalLink: '原サイトの PNG',
    copyPrompt: 'キーワードをコピー',
    copied: 'コピーしました',
    keysHint: '<kbd>←</kbd><kbd>→</kbd> 衣装を切り替え　<kbd>Esc</kbd> 閉じる',
    footerLead: 'DressingAtlas · 衣装集 COSTUME ATLAS',
    footerCredits:
      '画像出典：<a href="https://ai-costume-gallery.pages.dev/" target="_blank" rel="noopener noreferrer">COSTUME-DB-01</a>（作者 <a href="https://x.com/giaaibusi" target="_blank" rel="noopener noreferrer">ギア</a>）。構成と多言語 UI は <a href="https://github.com/HRuiCcc/RuiC-PoseAtlas" target="_blank" rel="noopener noreferrer">RuiC-PoseAtlas</a> を参考にしました。',
    footerLicense:
      '本ページは学習目的の非公式ミラー実装です。画像の著作権は原作者に帰属します。画像データの転売・再配布はご遠慮ください。',
    footerMeta: '{items} 着の衣装 · {images} 枚の画像',
  },
};

export function format(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match
  );
}

export function detectLang() {
  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (fromQuery && LANGS.includes(fromQuery)) return fromQuery;
  const stored = window.localStorage.getItem('dressingatlas.lang');
  if (stored && LANGS.includes(stored)) return stored;
  const nav = (navigator.languages ?? [navigator.language]).join(',');
  for (const lang of LANGS) {
    if (nav.toLowerCase().startsWith(lang)) return lang;
  }
  if (/^zh/i.test(nav)) return 'zh';
  if (/^ja/i.test(nav)) return 'ja';
  return 'en';
}

export function applyI18n(lang) {
  const dict = UI[lang];
  if (!dict) throw new Error(`Unknown language: ${lang}`);

  document.documentElement.lang = LANG_ATTR[lang];
  document.title = dict.docTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content', dict.metaDescription);

  for (const node of document.querySelectorAll('[data-i18n]')) {
    const value = dict[node.dataset.i18n];
    if (typeof value === 'string') node.textContent = value;
  }
  for (const node of document.querySelectorAll('[data-i18n-html]')) {
    const value = dict[node.dataset.i18nHtml];
    if (typeof value === 'string') node.innerHTML = value;
  }
  for (const node of document.querySelectorAll('[data-i18n-list]')) {
    const value = dict[node.dataset.i18nList];
    if (Array.isArray(value)) {
      node.replaceChildren(...value.map((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        return li;
      }));
    }
  }
  for (const node of document.querySelectorAll('[data-i18n-placeholder]')) {
    const value = dict[node.dataset.i18nPlaceholder];
    if (typeof value === 'string') node.setAttribute('placeholder', value);
  }
  for (const node of document.querySelectorAll('[data-i18n-aria]')) {
    const value = dict[node.dataset.i18nAria];
    if (typeof value === 'string') node.setAttribute('aria-label', value);
  }
  for (const node of document.querySelectorAll('[data-i18n-alt]')) {
    const value = dict[node.dataset.i18nAlt];
    if (typeof value === 'string') node.setAttribute('alt', value);
  }

  window.localStorage.setItem('dressingatlas.lang', lang);
}
