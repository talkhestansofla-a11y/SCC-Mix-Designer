
/*
 * SCC Mix Designer — Offline First
 * Reference: Iran Concrete Code, Volume 5, Chapter 6
 * این نرم‌افزار ابزار طراحی اولیه است؛ ساخت مخلوط آزمایشی و کنترل آزمایشگاهی الزامی است.
 */
'use strict';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const STORAGE_KEY = 'scc-mix-designer-v2';

const TABLES = {
  slump: {
    title: 'جدول ۱-۶ ـ راهنمای اولیه انتخاب کارایی و روانی بتن',
    image: 'references/table1-6.png',
    columns: ['رده جریان اسلامپ', 'بازه جریان اسلامپ (mm)', 'موارد کاربرد'],
    rows: [
      ['SF0', '۴۵۰ تا ۵۵۰', 'قطعات نازک یا با حجم میلگرد زیاد و وسایل تراکمی ضعیف؛ بتن آسان‌تراکم (ECC)، بافت دانه‌بندی ریز تا خیلی ریز؛ حداکثر اندازه سنگدانه ۲۰ و گاه تا ۲۵ میلی‌متر.'],
      ['SF1', '۵۵۰ تا ۶۵۰', 'قطعات نازک یا با حجم میلگرد خیلی زیاد، پیچیدگی کم قالب‌بندی و حرکت افقی محدود تا ۵ متر؛ بافت خیلی ریز یا عدم امکان تراکم؛ حداکثر اندازه سنگدانه ۲۰ میلی‌متر یا کمتر.'],
      ['SF2', '۶۵۰ تا ۷۵۰', 'قطعات خیلی نازک یا با حجم میلگرد خیلی زیاد، قالب‌بندی پیچیده و حرکت افقی تا ۱۰ متر؛ بافت فوق‌العاده ریز؛ حداکثر اندازه ۱۲٫۵ میلی‌متر یا کمتر و عدم امکان تراکم.'],
      ['SF3', '۷۵۰ تا ۸۵۰', 'قطعات خیلی نازک یا با حجم میلگرد فوق‌العاده زیاد، قالب‌بندی بسیار پیچیده و حرکت افقی تا ۱۰ متر؛ بافت فوق‌العاده ریز؛ حداکثر اندازه ۱۲٫۵ میلی‌متر یا کمتر و عدم امکان تراکم.']
    ],
    note: 'به‌کارگیری SF3 به تدابیر خاص برای جلوگیری از جداشدگی و آب‌انداختن نیاز دارد. بتن با جریان اسلامپ ۵۰۰ تا ۶۵۰ میلی‌متر ممکن است به تراکم جزئی نیاز داشته باشد.'
  },

  texture: {
    title: 'جدول ۲-۶ ـ راهنمای بافت دانه‌بندی مخلوط سنگدانه بر اساس توان n',
    image: 'references/table2-6.png',
    columns: ['بافت دانه‌بندی', 'بازه توان n'],
    rows: [
      ['خیلی درشت', '۰٫۶ تا ۰٫۷'],
      ['درشت', '۰٫۵ تا ۰٫۶'],
      ['متوسط', '۰٫۴ تا ۰٫۵'],
      ['ریز', '۰٫۳ تا ۰٫۴'],
      ['خیلی ریز', '۰٫۲ تا ۰٫۳'],
      ['فوق‌العاده ریز', '۰٫۱ تا ۰٫۲']
    ],
    note: 'برای انتخاب کاربردی n، جدول ۵-۶ ملاک مستقیم‌تری دارد و محدوده‌های پایین و بالای منحنی را مشخص می‌کند.'
  },

  rebar: {
    title: 'جدول ۳-۶ ـ راهنمای تراکم میلگرد در شالوده‌ها و دال‌ها',
    image: 'references/table3-6.png',
    columns: ['رده تراکم میلگرد', 'وزن میلگرد (kg/m³)'],
    rows: [
      ['خیلی کم', 'کمتر از ۵۰'],
      ['کم', '۵۰ تا ۷۵'],
      ['متوسط', '۷۵ تا ۱۰۰'],
      ['زیاد', '۱۰۰ تا ۱۵۰'],
      ['خیلی زیاد', '۱۵۰ تا ۲۰۰'],
      ['فوق‌العاده زیاد', 'بیش از ۲۰۰']
    ],
    note: 'مقادیر این جدول برای تیر، ستون و دیوار باید در ۰٫۵ ضرب شوند؛ بنابراین برنامه برای این اعضا وزن میلگرد معادل را نصف می‌کند.'
  },

  thickness: {
    title: 'جدول ۴-۶ ـ طبقه‌بندی ضخامت قطعات بتنی',
    image: 'references/table4-6.png',
    columns: ['طبقه‌بندی', 'بازه ضخامت (mm)'],
    rows: [
      ['خیلی نازک', 'کمتر از ۱۵۰'],
      ['نازک', '۱۵۰ تا ۳۰۰'],
      ['نسبتاً نازک', '۳۰۰ تا ۶۰۰'],
      ['نیمه‌ضخیم', '۶۰۰ تا ۹۰۰'],
      ['ضخیم', '۹۰۰ تا ۱۸۰۰'],
      ['بسیار ضخیم', 'بیش از ۱۸۰۰']
    ]
  },

  fuller: {
    title: 'جدول ۵-۶ ـ مقدار توان n منحنی فولر ـ تامسون اصلاح‌شده',
    image: 'references/table5-6.png',
    columns: ['ردیف', 'موارد کاربرد پیشنهادی', 'توان منحنی پایینی', 'توان منحنی بالایی'],
    rows: [
      ['۱', 'اسلامپ ۵۰۰ تا ۵۵۰؛ ستون و شالوده با میلگرد کم یا قطعه غیرنازک، حرکت کم، شمع و بتن‌ریزی زیر آب', '۰٫۴۰', '۰٫۳۰'],
      ['۲', 'اسلامپ ۵۵۰ تا ۶۵۰؛ ستون و شالوده با میلگرد متوسط یا قطعه نازک، حرکت متوسط، شمع و بتن‌ریزی زیر آب', '۰٫۳۵', '۰٫۲۵'],
      ['۳', 'اسلامپ بیش از ۶۵۰؛ تیر و دال با طول حرکت و حجم میلگرد متوسط', '۰٫۳۰', '۰٫۲۰'],
      ['۴', 'اسلامپ بیش از ۶۵۰؛ تیر و دال با حرکت زیاد، میلگرد زیاد و قطعات نازک', '۰٫۲۵', '۰٫۱۵'],
      ['۵', 'بتن خودتراکم برای تعمیر سطوح بتنی؛ بتن با بافت بسیار ریز', '۰٫۲۰', '۰٫۱۰']
    ],
    note: 'اعداد توان پایین و بالا در جدول به ترتیب محدوده مطلوب دانه‌بندی را مشخص می‌کنند. برای رسم دو کران، از مقدار کمتر و بیشتر n استفاده می‌شود.'
  },

  shape: {
    title: 'جدول ۶-۶ ـ تعیین رده و امتیاز شکل سنگدانه‌ها (Rs-A)',
    image: 'references/table6-6.png',
    columns: ['رده', 'شکل', 'گوشه‌داری', 'مثال'],
    rows: [
      ['۱', 'تقریباً ابعاد مساوی', 'گردشده مناسب', 'اکثر سنگدانه‌های رودخانه‌ای'],
      ['۲', 'انحراف از ابعاد مساوی', 'گردشده', 'بخشی شکسته‌شده و بخشی رودخانه‌ای'],
      ['۳', 'اکثر ذرات ابعاد مساوی ندارند', 'بخشی گرد شده، بخشی گوشه‌دار', 'به‌خوبی شکسته‌شده با گوشه‌های مساوی یا بیشتر از ۹۰ درجه'],
      ['۴', 'تخت یا تطویل‌شده', 'گوشه‌دار', 'شکسته‌شده؛ بعضی گوشه‌ها بیش از ۹۰ درجه'],
      ['۵', 'اکثر ذرات تخت و تطویل‌شده', 'خیلی گوشه‌دار', 'شکسته‌شده با گوشه‌های زیادی مساوی یا بیشتر از ۹۰ درجه']
    ],
    note: 'رده ۱ نمایانگر شکل مناسب و خوب گرد‌شده و رده ۵ نمایانگر شکل ضعیف و بسیار گوشه‌دار است. آیین‌نامه استفاده از رده‌های ۲ یا ۳ و حداکثر ۴ را توصیه می‌کند. برای هر ترکیب دانه‌بندی باید ارزیابی جداگانه انجام شود.'
  }
};

const STEPS = [
  'اطلاعات اولیه',
  'مشخصات سنگدانه',
  'سهم‌بندی و منحنی',
  'فضای خالی',
  'شکل دانه',
  'حجم خمیر',
  'آب به سیمان',
  'ترکیب خمیر',
  'مقدار مصالح',
  'گزارش نهایی'
];

const SIEVES = [
  37.5, 25, 19, 12.5, 9.5, 4.75,
  2.36, 1.18, 0.6, 0.3, 0.15, 0.075
];

const SIEVE_NAMES = [
  '۳۷٫۵', '۲۵', '۱۹', '۱۲٫۵', '۹٫۵', '۴٫۷۵',
  '۲٫۳۶', '۱٫۱۸', '۰٫۶۰', '۰٫۳۰', '۰٫۱۵', '۰٫۰۷۵'
];

const defaultState = () => ({
  step: 0,

  projectName: '',
  elementType: 'ستون',
  thicknessMm: 300,
  rebarKg: 80,
  horizontalDistance: 5,
  maxAggSize: 19,

  fc: 30,
  stdDevMode: 'manual',
  workshopGrade: 'ب',
  stdDev: 0,
  fcm: 0,

  slumpClass: 'SF2',

  aggCount: 2,

  aggregates: Array.from({ length: 4 }, (_, i) => ({
    name: i === 0 ? 'ماسه' : `سنگدانه ${i + 1}`,
    dryDensity: 2650,
    ssd: 2670,
    absorption: 1.5,
    passes: {}
  })),

  ratios: [50, 50, 0, 0],
  fullerRow: 2,
  shapeRank: 3,

  testG: 0,
  testT: 0,
  testV: 0,

  voids: 0,
  bulkDensity: 0,
  blendedDryDensity: 2650,

  sccType: 'powder',
  pasteExtra: 15,
  pasteSpacing: 12,
  pasteFilling: 0,
  pasteBase: 0,
  pasteFinal: 0,

  wc: 0.45,
  cementStrength: 42.5,
  cementStrengthLab: 42.5,
  coarseFracture: 'C',

  airPercent: 1.5,
  water: 0,
  cement: 0,
  powder: 0,
  filler: 0,
  vma: 0,
  coarseAgg: 0,
  fineAgg: 0
});

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const base = defaultState();
    const loaded = { ...base, ...saved };

    if (!Array.isArray(loaded.aggregates)) {
      loaded.aggregates = base.aggregates;
    }

    if (!Array.isArray(loaded.ratios)) {
      loaded.ratios = base.ratios;
    }

    loaded.step = Math.max(0, Math.min(STEPS.length - 1, num(loaded.step)));
    loaded.aggCount = Math.max(1, Math.min(4, num(loaded.aggCount, 2)));

    return loaded;
  } catch {
    return defaultState();
  }
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('ذخیره اطلاعات در حافظه محلی انجام نشد.', err);
  }
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function fmt(value, decimals = 1) {
  return Number.isFinite(Number(value))
    ? Number(value).toFixed(decimals)
    : '—';
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function field(label, id, value, type = 'number', opts = {}) {
  const ref = opts.ref
    ? `<button type="button"
        class="reference-icon-btn"
        data-table="${opts.ref}"
        title="مشاهده جدول مرجع"
        aria-label="مشاهده جدول مرجع">▤</button>`
    : '';

  const control = type === 'select'
    ? `<select id="${id}" ${opts.disabled ? 'disabled' : ''}>
        ${(opts.options || []).map(option => `
          <option value="${esc(option.value)}"
            ${String(value) === String(option.value) ? 'selected' : ''}>
            ${esc(option.label)}
          </option>
        `).join('')}
      </select>`
    : `<input id="${id}" type="${type}"
        value="${esc(value)}"
        ${opts.min !== undefined ? `min="${opts.min}"` : ''}
        ${opts.max !== undefined ? `max="${opts.max}"` : ''}
        ${opts.step ? `step="${opts.step}"` : ''}
        ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
        ${opts.disabled ? 'disabled' : ''}>`;

  return `
    <div class="field ${opts.full ? 'full' : ''} ${ref ? 'has-reference' : ''} ${opts.className || ''}">
      <label for="${id}">${label}</label>
      <div class="field-control">
        ${control}
        ${ref}
      </div>
      ${opts.help ? `<small>${opts.help}</small>` : ''}
    </div>
  `;
}

function referenceButton(key) {
  return `
    <button type="button"
      class="reference-icon-btn"
      data-table="${key}"
      title="مشاهده جدول مرجع"
      aria-label="مشاهده جدول مرجع">▤</button>
  `;
}

function result(label, value, unit = '') {
  return `
    <div class="result-card">
      <small>${label}</small>
      <strong>${value}${unit ? ` <small>${unit}</small>` : ''}</strong>
    </div>
  `;
}

function tableHtml(table) {
  return `
    <h3>${table.title}</h3>
    ${table.image
      ? `<img class="reference-image" src="${table.image}" alt="${esc(table.title)}" loading="lazy">`
      : ''}
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>${table.columns.map(col => `<th>${col}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${table.rows.map(row => `
            <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ${table.note ? `<div class="section-note">${table.note}</div>` : ''}
  `;
}

function openTable(key) {
  const table = TABLES[key];
  if (!table) return;

  $('#modal-title').textContent = table.title;
  $('#modal-content').innerHTML = tableHtml(table);
  $('#reference-modal').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#reference-modal').hidden = true;
  document.body.style.overflow = '';
}

function effectiveRebar() {
  return ['تیر', 'ستون', 'دیوار'].includes(state.elementType)
    ? num(state.rebarKg) * 0.5
    : num(state.rebarKg);
}

function rebarClass() {
  const value = effectiveRebar();

  if (value < 50) return 'خیلی کم';
  if (value < 75) return 'کم';
  if (value < 100) return 'متوسط';
  if (value < 150) return 'زیاد';
  if (value <= 200) return 'خیلی زیاد';

  return 'فوق‌العاده زیاد';
}

function thicknessClass() {
  const value = num(state.thicknessMm);

  if (value < 150) return 'خیلی نازک';
  if (value < 300) return 'نازک';
  if (value < 600) return 'نسبتاً نازک';
  if (value < 900) return 'نیمه‌ضخیم';
  if (value <= 1800) return 'ضخیم';

  return 'بسیار ضخیم';
}

function suggestSlump() {
  const rebar = effectiveRebar();
  const thickness = num(state.thicknessMm);
  const distance = num(state.horizontalDistance);

  if (rebar > 200 || (thickness < 150 && rebar > 150)) return 'SF3';
  if (rebar > 100 || thickness < 300 || distance > 10) return 'SF2';
  if (rebar >= 50 || thickness < 600 || distance > 5) return 'SF1';

  return 'SF0';
}

/* -------------------------------------------------------
   صفحه ۱ ـ اطلاعات اولیه
------------------------------------------------------- */

function renderStep1() {
  const autoMode = state.stdDevMode === 'auto';

  return `
    <h2>اطلاعات پروژه و انتخاب جریان اسلامپ</h2>

    <div class="input-grid">
      ${field('نام پروژه', 'projectName', state.projectName, 'text', {
        full: true,
        placeholder: 'نام پروژه یا عضو بتنی'
      })}

      ${field('نوع عضو بتنی', 'elementType', state.elementType, 'select', {
        options: [
          'ستون', 'دیوار', 'تیر', 'دال',
          'شالوده', 'شمع', 'تعمیر سطح بتنی'
        ].map(value => ({ value, label: value }))
      })}

      ${field('ضخامت عضو (mm)', 'thicknessMm', state.thicknessMm, 'number', {
        min: 1,
        step: 1,
        ref: 'thickness'
      })}

      ${field('وزن میلگرد در هر مترمکعب (kg/m³)', 'rebarKg', state.rebarKg, 'number', {
        min: 0,
        step: 1,
        ref: 'rebar',
        help: 'برای تیر، ستون و دیوار، مقدار معادل نصف وزن واردشده در نظر گرفته می‌شود.'
      })}

      ${field('طول حرکت افقی بتن (m)', 'horizontalDistance', state.horizontalDistance, 'number', {
        min: 0,
        step: 0.5
      })}

      ${field('حداکثر اندازه اسمی سنگدانه (mm)', 'maxAggSize', state.maxAggSize, 'select', {
        options: [9.5, 12.5, 19, 25, 37.5].map(value => ({
          value,
          label: String(value)
        }))
      })}

      ${field('مقاومت مشخصه فشاری بتن f’c (MPa)', 'fc', state.fc, 'number', {
        min: 15,
        max: 50,
        step: 0.1
      })}

      ${field('روش تعیین انحراف معیار', 'stdDevMode', state.stdDevMode, 'select', {
        options: [
          { value: 'manual', label: 'دستی' },
          { value: 'auto', label: 'محاسبه خودکار' }
        ]
      })}

      ${field('رتبه کارگاه', 'workshopGrade', state.workshopGrade, 'select', {
        options: [
          { value: 'الف', label: 'الف' },
          { value: 'ب', label: 'ب' },
          { value: 'ج', label: 'ج' }
        ]
      })}

      ${field('انحراف معیار S (MPa)', 'stdDev', state.stdDev, 'number', {
        min: 0,
        step: 0.1,
        disabled: autoMode
      })}

      ${field('مقاومت فشاری متوسط هدف f’cm (MPa)', 'fcm', state.fcm, 'number', {
        min: 0,
        step: 0.1,
        className: 'target-strength',
        disabled: autoMode
      })}

      ${field('رده جریان اسلامپ انتخابی', 'slumpClass', state.slumpClass, 'select', {
        ref: 'slump',
        options: ['SF0', 'SF1', 'SF2', 'SF3'].map(value => ({
          value,
          label: value
        }))
      })}
    </div>

    ${autoMode ? `
      <div class="formula-panel">
        <strong>تعیین خودکار مقاومت هدف</strong>
        <div>مقاومت مشخصه: <b>f’c = ${fmt(num(state.fc), 1)} MPa</b></div>
        <div>رتبه کارگاه: <b>${esc(state.workshopGrade)}</b></div>
        <div class="formula-status">
          روابط تعیین انحراف معیار و مقاومت متوسط هدف باید از فصل پنجم جلد دوم آبا استخراج شوند.
          مرجع لازم در فایل فعلی موجود نیست؛ بنابراین محاسبه خودکار تا زمان ورود مرجع معتبر انجام نمی‌شود.
        </div>
      </div>
    ` : `
      <div class="formula-panel">
        <strong>روش دستی</strong>
        مقادیر S و f’cm را با استفاده از سوابق کارگاه و مرجع آیین‌نامه وارد کنید.
      </div>
    `}
  `;
}

/* -------------------------------------------------------
   صفحه ۲ ـ مشخصات سنگدانه
------------------------------------------------------- */

function ensureAggs() {
  if (!Array.isArray(state.aggregates)) {
    state.aggregates = defaultState().aggregates;
  }

  while (state.aggregates.length < 4) {
    state.aggregates.push({
      name: `سنگدانه ${state.aggregates.length + 1}`,
      dryDensity: 2650,
      ssd: 2670,
      absorption: 1.5,
      passes: {}
    });
  }

  state.aggregates.forEach(aggregate => {
    if (!aggregate.passes || typeof aggregate.passes !== 'object') {
      aggregate.passes = {};
    }
  });
}

function renderStep2() {
  ensureAggs();

  let rows = `
    <tr>
      <th>نام سنگدانه</th>
      ${Array.from({ length: state.aggCount }, (_, i) => `
        <td>
          <input class="aggregate-name-input"
            type="text"
            data-aggfield="name"
            data-agg="${i}"
            value="${esc(state.aggregates[i].name)}">
        </td>
      `).join('')}
    </tr>
  `;

  const properties = [
    ['چگالی خشک', 'dryDensity', '1'],
    ['چگالی SSD', 'ssd', '1'],
    ['جذب آب (%)', 'absorption', '0.1']
  ];

  properties.forEach(([label, key, step]) => {
    rows += `
      <tr>
        <th>${label}</th>
        ${Array.from({ length: state.aggCount }, (_, i) => `
          <td>
            <input type="number"
              data-aggfield="${key}"
              data-agg="${i}"
              value="${esc(state.aggregates[i][key])}"
              step="${step}">
          </td>
        `).join('')}
      </tr>
    `;
  });

  for (let j = 0; j < SIEVES.length; j++) {
    rows += `
      <tr>
        <td class="sieve-cell">${SIEVE_NAMES[j]}</td>
        ${Array.from({ length: state.aggCount }, (_, i) => `
          <td>
            <input type="number"
              min="0"
              max="100"
              step="0.1"
              data-pass="${i}"
              data-sieve="${SIEVES[j]}"
              value="${state.aggregates[i].passes[SIEVES[j]] ?? 0}">
          </td>
        `).join('')}
      </tr>
    `;
  }

  return `
    <h2>مشخصات و دانه‌بندی سنگدانه‌ها</h2>

    <div class="input-grid">
      ${field('تعداد سنگدانه', 'aggCount', state.aggCount, 'select', {
        options: [1, 2, 3, 4].map(value => ({
          value,
          label: String(value)
        }))
      })}
    </div>

    <div class="table-wrap aggregate-table-wrap">
      <table class="data-table aggregate-table">
        <colgroup>
          <col class="spec-col">
          ${Array.from({ length: state.aggCount }, () => '<col>').join('')}
        </colgroup>
        <thead>
          <tr>
            <th>مشخصه</th>
            ${Array.from({ length: state.aggCount }, (_, i) => `
              <th>منبع ${i + 1}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/* -------------------------------------------------------
   صفحه ۳ ـ سهم‌بندی و منحنی دانه‌بندی
------------------------------------------------------- */

function fuller(d, D, n) {
  if (d <= 0.075) return 0;
  if (d >= D) return 100;

  const dn = Math.pow(d, n);
  const d0 = Math.pow(0.075, n);
  const Dn = Math.pow(D, n);

  return 100 * (dn - d0) / (Dn - d0);
}

function mixedPassing(sieve) {
  let value = 0;

  for (let i = 0; i < state.aggCount; i++) {
    value += (num(state.ratios[i]) / 100) *
      num(state.aggregates[i].passes[sieve]);
  }

  return value;
}

function renderStep3() {
  const ratioRows = Array.from(
    { length: state.aggCount },
    (_, i) => `
      <div class="ratio-field">
        <label>${esc(state.aggregates[i].name)} (%)</label>
        <input type="number"
          min="0"
          max="100"
          step="1"
          data-ratio="${i}"
          value="${state.ratios[i] ?? 0}">
      </div>
    `
  ).join('');

  return `
    <h2>سهم‌بندی و منحنی دانه‌بندی مطلوب</h2>

    <div class="input-grid">
      ${field('انتخاب منحنی', 'fullerRow', state.fullerRow, 'select', {
        options: TABLES.fuller.rows.map((row, i) => ({
          value: i + 1,
          label: `منحنی ${i + 1}`
        })),
        ref: 'fuller'
      })}

      ${field('حداکثر اندازه سنگدانه D (mm)', 'maxAggSize', state.maxAggSize, 'number', {
        min: 1,
        step: 0.1
      })}
    </div>

    <h3>نسبت‌های سنگدانه</h3>

    <div class="input-grid">
      ${ratioRows}
    </div>

    <div id="ratio-status" class="status"></div>

    <div class="chart-box" id="grading-chart">
      ${drawGradingChart()}
    </div>

    <div class="chart-legend">
      <span><i class="legend-dot" style="background:#0d7188"></i> منحنی ترکیبی واقعی</span>
      <span><i class="legend-dot" style="background:#d17a28"></i> کران اول</span>
      <span><i class="legend-dot" style="background:#9b4a76"></i> کران دوم</span>
    </div>

    <div id="grading-status" class="status"></div>
  `;
}

function drawGradingChart() {
  const W = 720;
  const H = 280;
  const L = 54;
  const R = 15;
  const T = 15;
  const B = 42;

  const xMin = Math.log10(0.075);
  const xMax = Math.log10(37.5);

  const X = d => L +
    (Math.log10(d) - xMin) / (xMax - xMin) * (W - L - R);

  const Y = p => T + (100 - p) / 100 * (H - T - B);

  const D = num(state.maxAggSize, 19);
  const row = TABLES.fuller.rows[
    Math.max(0, Math.min(4, num(state.fullerRow, 2) - 1))
  ];

  const ns = [num(row[2]), num(row[3])];

  const points = SIEVES.map(sieve => ({
    s: sieve,
    p: mixedPassing(sieve)
  }));

  const path = pointsArray => pointsArray.map((point, i) =>
    `${i ? 'L' : 'M'}${X(point.s).toFixed(1)},${Y(point.p).toFixed(1)}`
  ).join(' ');

  const ideal = n => SIEVES
    .map(sieve => ({ s: sieve, p: fuller(sieve, D, n) }))
    .reverse();

  let grid = '';

  for (let p = 0; p <= 100; p += 20) {
    grid += `
      <line x1="${L}" y1="${Y(p)}" x2="${W - R}" y2="${Y(p)}"
        stroke="#e7edf1"/>
      <text x="${L - 8}" y="${Y(p) + 4}" text-anchor="end"
        font-size="10" fill="#657b8a">${p}</text>
    `;
  }

  const ticks = [
    0.075, 0.15, 0.3, 0.6, 1.18, 2.36,
    4.75, 9.5, 12.5, 19, 25, 37.5
  ];

  for (const d of ticks) {
    grid += `
      <line x1="${X(d)}" y1="${T}" x2="${X(d)}" y2="${H - B}"
        stroke="#f0f3f5"/>
      <text x="${X(d)}" y="${H - 18}" text-anchor="middle"
        font-size="9" fill="#657b8a">${d}</text>
    `;
  }

  return `
    <svg viewBox="0 0 ${W} ${H}" role="img"
      aria-label="نمودار لگاریتمی دانه‌بندی">
      <rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"
        fill="#fff" stroke="#cbd8e1"/>
      ${grid}
      <path d="${path(ideal(ns[0]))}" fill="none"
        stroke="#d17a28" stroke-width="2" stroke-dasharray="6 4"/>
      <path d="${path(ideal(ns[1]))}" fill="none"
        stroke="#9b4a76" stroke-width="2" stroke-dasharray="6 4"/>
      <path d="${path(points)}" fill="none"
        stroke="#0d7188" stroke-width="3"/>
      ${points.map(point => `
        <circle cx="${X(point.s)}" cy="${Y(point.p)}"
          r="3" fill="#0d7188"/>
      `).join('')}
      <text x="${W / 2}" y="${H - 2}" text-anchor="middle"
        font-size="10" fill="#526b7a">
        اندازه الک (mm) ـ محور لگاریتمی
      </text>
      <text x="14" y="${H / 2}" transform="rotate(-90 14 ${H / 2})"
        text-anchor="middle" font-size="10" fill="#526b7a">
        درصد عبوری
      </text>
    </svg>
  `;
}

/* -------------------------------------------------------
   صفحه ۴ ـ فضای خالی
------------------------------------------------------- */

function renderStep4() {
  return `
    <h2>تعیین درصد فضای خالی مخلوط سنگدانه</h2>

    <div class="formula-panel">
      <strong>اطلاعات آزمایش چگالی انبوهی</strong>
      چگالی انبوهی خشک مخلوط سنگدانه باید در حالت متراکم‌شده با میله و بر اساس روش استاندارد ملی ایران ۴۰۸۳ تعیین شود.
      میانگین‌گیری از چگالی انبوهی منابع جداگانه جایگزین این آزمایش نیست.
    </div>

    <div class="input-grid">
      ${field('جرم سنگدانه خشک به‌همراه ظرف G (kg)', 'testG', state.testG, 'number', {
        min: 0,
        step: 0.001
      })}

      ${field('جرم ظرف T (kg)', 'testT', state.testT, 'number', {
        min: 0,
        step: 0.001
      })}

      ${field('حجم ظرف V (m³)', 'testV', state.testV, 'number', {
        min: 0,
        step: 0.0001,
        help: 'حجم کالیبره‌شده ظرف آزمایش را وارد کنید.'
      })}

      ${field('چگالی خشک مخلوط سنگدانه S (kg/m³)', 'blendedDryDensity',
        state.blendedDryDensity, 'number', {
          min: 1,
          step: 1,
          help: 'بر اساس آزمایش مخلوط واقعی و با مبنای خشک وارد شود.'
        })}
    </div>

    <div class="formula-panel">
      <strong>روابط محاسباتی</strong>
      <div>M = (G − T) / V</div>
      <div>درصد فضای خالی = 100 × [(S × W − M) / (S × W)]</div>
      <div>در این محاسبه، W = 998 kg/m³ در نظر گرفته شده است.</div>
    </div>

    <div class="result-grid">
      ${result('چگالی انبوهی خشک M', fmt(state.bulkDensity, 1), 'kg/m³')}
      ${result('درصد فضای خالی', fmt(state.voids, 2), '%')}
    </div>

    <div id="void-status" class="status"></div>

    <div class="warning-note">
      برای نتیجه معتبر، G و T باید بر حسب kg و V بر حسب m³ باشند.
      آزمایش باید روی ترکیب واقعی سنگدانه‌ها انجام شود و چگالی خشک S نباید با چگالی SSD جایگزین شود.
    </div>
  `;
}

/* -------------------------------------------------------
   صفحه ۵ ـ شکل سنگدانه
------------------------------------------------------- */

function renderStep5() {
  const descriptions = [
    'خوب و گرد شده',
    'گرد شده',
    'میانه',
    'گوشه‌دار',
    'بسیار گوشه‌دار'
  ];

  return `
    <h2>انتخاب رده شکل و گوشه‌داری سنگدانه‌ها (Rs-A)</h2>

    <div class="input-grid">
      ${field('رده انتخاب‌شده Rs-A', 'shapeRank', state.shapeRank, 'select', {
        options: [1, 2, 3, 4, 5].map(value => ({
          value,
          label: `رده ${value} ـ ${descriptions[value - 1]}`
        }))
      })}
    </div>

    <div class="formula-panel">
      <strong>راهنمای ارزیابی شکل سنگدانه</strong>
      <div>رده انتخابی: <b>${state.shapeRank}</b> ـ ${descriptions[num(state.shapeRank, 3) - 1]}</div>
      <div>برای مشاهده مشخصات هر رده و مثال‌های تصویری، جدول مرجع را باز کنید.</div>
      ${referenceButton('shape')}
    </div>

    <div class="warning-note">
      رده ۱ نشان‌دهنده شکل مناسب‌تر و گردشدگی بیشتر و رده ۵ نشان‌دهنده شکل ضعیف‌تر و گوشه‌داری بیشتر است.
      ارزیابی باید بر اساس ترکیب واقعی سنگدانه‌ها انجام شود. در جدول ۶-۶ استفاده از رده‌های ۲ یا ۳ و حداکثر رده ۴ توصیه شده است.
    </div>
  `;
}

/* -------------------------------------------------------
   صفحه ۶ ـ حجم خمیر
------------------------------------------------------- */

function calcPaste() {
  const spacing = 8 + 2 * (num(state.shapeRank, 3) - 1);
  const voids = num(state.voids);

  const filling = 100 -
    ((100 - spacing) * (100 - voids) / 100);

  let min;
  let max;

  if (state.sccType === 'vma') {
    min = 5;
    max = 7;
  } else if (state.sccType === 'combined') {
    min = 6;
    max = 15;
  } else {
    min = 10;
    max = 20;
  }

  const extra = Math.min(
    max,
    Math.max(min, num(state.pasteExtra, min))
  );

  state.pasteSpacing = spacing;
  state.pasteFilling = filling;
  state.pasteExtra = extra;
  state.pasteBase = filling;
  state.pasteFinal = filling * (1 + extra / 100);

  return {
    spacing,
    filling,
    extra,
    min,
    max,
    final: state.pasteFinal
  };
}

function renderStep6() {
  const calc = calcPaste();

  return `
    <h2>محاسبه حجم خمیر</h2>

    <div class="formula-panel">
      <strong>روابط محاسبه حجم خمیر</strong>
      <div>Vpaste spacing = 8 + 2 × (Rs-A − 1)</div>
      <div>
        Vpaste filling = 100 − [(100 − Vpaste spacing) × (100 − %Voids) / 100]
      </div>
    </div>

    <div class="result-grid">
      ${result('فضای خالی سنگدانه', fmt(state.voids, 2), '%')}
      ${result('حجم خمیر فاصله‌گذار', fmt(calc.spacing, 1), '%')}
      ${result('حجم خمیر پرکننده', fmt(calc.filling, 2), '%')}
    </div>

    <div class="input-grid">
      ${field('نوع بتن خودتراکم', 'sccType', state.sccType, 'select', {
        options: [
          { value: 'powder', label: 'پودری' },
          { value: 'vma', label: 'دارای VMA' },
          { value: 'combined', label: 'ترکیبی' }
        ]
      })}

      ${field(`افزایش حجم خمیر (%) ـ بازه ${calc.min} تا ${calc.max}`,
        'pasteExtra', state.pasteExtra, 'number', {
          min: calc.min,
          max: calc.max,
          step: 0.5
        })}
    </div>

    <div class="result-grid">
      ${result('حجم خمیر نهایی', fmt(calc.final, 2), '% حجمی بتن')}
    </div>

    <div class="warning-note">
      اگر آزمایش فضای خالی در صفحه مربوط انجام نشده باشد، نتیجه این صفحه صرفاً محاسباتی و غیرقابل اتکا برای طرح نهایی است.
      مقدار افزایش حجم خمیر نیز باید با توجه به قابلیت عبور و تراکم میلگرد و نتایج مخلوط آزمایشی کنترل شود.
    </div>
  `;
}

/* -------------------------------------------------------
   صفحه ۷ ـ نسبت آب به سیمان
------------------------------------------------------- */

function renderStep7() {
  return `
    <h2>تعیین نسبت آب آزاد به سیمان</h2>

    <div class="input-grid">
      ${field('رده سیمان', 'cementStrength', state.cementStrength, 'select', {
        options: [
          { value: 32.5, label: '۳۲۵' },
          { value: 42.5, label: '۴۲۵' },
          { value: 52.5, label: '۵۲۵' }
        ]
      })}

      ${field('نوع سنگدانه درشت', 'coarseFracture', state.coarseFracture, 'select', {
        options: [
          { value: 'C', label: 'C ـ شکسته / تیزگوشه' },
          { value: 'R', label: 'R ـ گردگوشه' }
        ]
      })}

      ${field('مقاومت ملات سیمان (MPa)', 'cementStrengthLab',
        state.cementStrengthLab, 'number', {
          min: 1,
          step: 0.1
        })}

      ${field('نسبت آب آزاد به سیمان w/c', 'wc', state.wc, 'number', {
        min: 0.2,
        max: 0.8,
        step: 0.01
      })}
    </div>

    <div class="formula-panel">
      <strong>وضعیت تعیین نسبت آب به سیمان</strong>
      مقدار w/c در حال حاضر به‌صورت دستی دریافت می‌شود.
      تعیین مقدار آیین‌نامه‌ای باید بر اساس شکل ۷-۶ و اطلاعات مصالح انجام شود.
    </div>

    <div class="warning-note">
      نمودار شکل ۷-۶ هنوز به داده عددی کالیبره‌شده تبدیل نشده است؛ بنابراین مقدار واردشده در این صفحه
      نباید مقدار آیین‌نامه‌ای قطعی تلقی شود. پس از استخراج نقاط منحنی از شکل اصلی، درونیابی و کنترل آن قابل پیاده‌سازی است.
    </div>
  `;
}

/* -------------------------------------------------------
   صفحه ۸ ـ ترکیب خمیر
------------------------------------------------------- */

function renderStep8() {
  return `
    <h2>تعیین مقدار و ترکیب خمیر</h2>

    <div class="formula-panel">
      <strong>پارامترهای موردنیاز این مرحله</strong>
      <div>مقدار آب آزاد</div>
      <div>مقدار سیمان</div>
      <div>مقدار کل پودر و مواد جایگزین سیمان</div>
      <div>مقدار پودر خنثی و مواد اصلاح‌کننده</div>
      <div>درصد هوای موجود در بتن</div>
    </div>

    <div class="empty-state">
      محاسبات این صفحه تا زمان استخراج و کنترل روابط و جداول مربوط از فصل ششم فعال نمی‌شود.
      پس از ورود داده‌های مرجع، محاسبه اجزای خمیر و نسبت‌های آن به این صفحه اضافه خواهد شد.
    </div>

    <div class="warning-note">
      مقادیر آب، سیمان، پودر، مواد جایگزین و هوا نباید بدون روابط و محدودیت‌های آیین‌نامه‌ای به‌صورت حدسی محاسبه شوند.
    </div>
  `;
}

/* -------------------------------------------------------
   صفحه ۹ ـ مقدار مصالح
------------------------------------------------------- */

function renderStep9() {
  return `
    <h2>تعیین مقدار سنگدانه‌ها و مصالح بتن</h2>

    <div class="formula-panel">
      <strong>اطلاعات موردنیاز برای محاسبه نهایی</strong>
      <div>حجم مطلق اجزای خمیر</div>
      <div>حجم هوای بتن</div>
      <div>چگالی و جذب آب سنگدانه‌ها</div>
      <div>نسبت‌های ترکیب سنگدانه‌های ریز و درشت</div>
      <div>مقادیر رطوبت واقعی مصالح در زمان ساخت بتن</div>
    </div>

    <div class="empty-state">
      محاسبه مقدار نهایی سنگدانه ریز و درشت پس از تکمیل روابط صفحات قبل فعال می‌شود.
      در نسخه فعلی، اطلاعات SSD، چگالی خشک و جذب آب برای استفاده در محاسبات بعدی ذخیره می‌شوند.
    </div>

    <div class="warning-note">
      مقادیر بچینگ باید بر اساس وضعیت رطوبت واقعی سنگدانه‌ها اصلاح شوند.
      مقادیر آزمایشگاهی و مقادیر مصرفی در حالت خشک یا SSD نباید با یکدیگر جابه‌جا شوند.
    </div>
  `;
}

/* -------------------------------------------------------
   صفحه ۱۰ ـ گزارش نهایی
------------------------------------------------------- */

function renderStep10() {
  const completionRows = STEPS.map((step, index) => {
    let status;

    if (index <= 5) {
      status = 'دارای ورودی و محاسبات اولیه؛ نیازمند کنترل آزمایشگاهی';
    } else if (index === 6) {
      status = 'ورودی دستی؛ نیازمند استخراج و تأیید نمودار';
    } else {
      status = 'محاسبات در انتظار تکمیل روابط مرجع';
    }

    return [step, status];
  });

  return `
    <h2>گزارش نهایی طرح اختلاط</h2>

    <div class="result-grid">
      ${result('نام پروژه', esc(state.projectName || 'بدون نام'))}
      ${result('رده جریان اسلامپ', esc(state.slumpClass))}
      ${result('حداکثر اندازه سنگدانه', fmt(num(state.maxAggSize), 1), 'mm')}
      ${result('مقاومت مشخصه بتن', fmt(num(state.fc), 1), 'MPa')}
      ${result('انحراف معیار', fmt(num(state.stdDev), 1), 'MPa')}
      ${result('مقاومت متوسط هدف', fmt(num(state.fcm), 1), 'MPa')}
      ${result('درصد فضای خالی', fmt(num(state.voids), 2), '%')}
      ${result('حجم خمیر پایه', fmt(num(state.pasteBase), 2), '%')}
      ${result('حجم خمیر نهایی', fmt(num(state.pasteFinal), 2), '%')}
      ${result('نسبت آب به سیمان', fmt(num(state.wc), 2))}
    </div>

    ${tableHtml({
      title: 'وضعیت تکمیل محاسبات',
      columns: ['بخش', 'وضعیت'],
      rows: completionRows
    })}

    <div class="warning-note">
      این نرم‌افزار ابزار محاسبات اولیه است و گزارش حاضر به‌تنهایی طرح اجرایی نهایی محسوب نمی‌شود.
      ساخت مخلوط‌های آزمایشی در آزمایشگاه و شرایط کارگاه، کنترل مقاومت فشاری و سایر الزامات،
      و اصلاح طرح پیش از نهایی‌سازی ضروری است.
    </div>

    <button class="btn btn-primary" type="button" id="print-report">
      چاپ / ذخیره گزارش PDF
    </button>
  `;
}

/* -------------------------------------------------------
   مدیریت رندر صفحات
------------------------------------------------------- */

const RENDERERS = [
  renderStep1,
  renderStep2,
  renderStep3,
  renderStep4,
  renderStep5,
  renderStep6,
  renderStep7,
  renderStep8,
  renderStep9,
  renderStep10
];

function render() {
  state.step = Math.max(0, Math.min(STEPS.length - 1, num(state.step)));

  saveState();

  $('#project-name-display').textContent =
    state.projectName || 'طرح جدید';

  $('#tabs').innerHTML = STEPS.map((title, index) => `
    <button type="button"
      class="step-tab ${index === state.step ? 'active' : ''}"
      data-step="${index}">
      ${title}
    </button>
  `).join('');

  $('#screen').innerHTML = RENDERERS[state.step]();

  $('#prev').disabled = state.step === 0;
  $('#next').disabled = state.step === STEPS.length - 1;
  $('#next').textContent = state.step === STEPS.length - 1
    ? 'پایان'
    : 'بعدی';

  attachEvents();
}

/* -------------------------------------------------------
   اتصال رویداد ورودی‌ها
------------------------------------------------------- */

function bind(id, key, cast = value => value, rerender = false) {
  const element = document.getElementById(id);
  if (!element) return;

  element.addEventListener('input', event => {
    state[key] = cast(event.target.value);

    if (key === 'projectName') {
      $('#project-name-display').textContent =
        state.projectName || 'طرح جدید';
    }

    saveState();
  });

  element.addEventListener('change', event => {
    state[key] = cast(event.target.value);
    saveState();

    if (rerender) {
      render();
    }
  });
}

function updateVoidCalculation() {
  const volume = num(state.testV);
  const grossMass = num(state.testG);
  const containerMass = num(state.testT);
  const dryDensity = num(state.blendedDryDensity);

  state.bulkDensity = volume > 0
    ? (grossMass - containerMass) / volume
    : 0;

  state.voids = (
    dryDensity > 0 &&
    state.bulkDensity > 0
  )
    ? 100 * ((dryDensity * 998 - state.bulkDensity) / (dryDensity * 998))
    : 0;

  const valid =
    volume > 0 &&
    grossMass > containerMass &&
    dryDensity > 0 &&
    state.voids >= 0 &&
    state.voids < 100;

  const status = $('#void-status');

  if (status) {
    status.textContent = valid
      ? 'محاسبه انجام شد؛ صحت آزمایش و واحدها را کنترل کنید.'
      : 'برای محاسبه معتبر، G بزرگ‌تر از T و V و S مثبت وارد کنید.';

    status.className = `status ${valid ? 'good' : 'bad'}`;
  }

  const resultValues = $$('.result-card strong');

  if (resultValues[0]) {
    resultValues[0].textContent = fmt(state.bulkDensity, 1);
  }

  if (resultValues[1]) {
    resultValues[1].textContent = fmt(state.voids, 2);
  }

  saveState();
}

function updateRatioStatus() {
  const total = state.ratios
    .slice(0, state.aggCount)
    .reduce((sum, value) => sum + num(value), 0);

  const ratioStatus = $('#ratio-status');
  const gradingStatus = $('#grading-status');

  if (ratioStatus) {
    ratioStatus.textContent = `جمع نسبت‌ها: ${fmt(total, 1)}٪`;
    ratioStatus.className =
      `status ${Math.abs(total - 100) < 0.1 ? 'good' : 'bad'}`;
  }

  if (gradingStatus) {
    gradingStatus.textContent =
      Math.abs(total - 100) < 0.1
        ? 'منحنی ترکیبی بر اساس نسبت‌های واردشده ترسیم شده است.'
        : 'برای تحلیل معتبر، جمع نسبت‌ها باید دقیقاً ۱۰۰٪ باشد.';
  }
}

function attachEvents() {
  $$('[data-step]').forEach(button => {
    button.addEventListener('click', () => {
      state.step = Number(button.dataset.step);
      render();
    });
  });

  $$('[data-table]').forEach(button => {
    button.addEventListener('click', () => {
      openTable(button.dataset.table);
    });
  });

  $$('[data-close-modal]').forEach(button => {
    button.addEventListener('click', closeModal);
  });

  /* صفحه ۱ */
  if (state.step === 0) {
    bind('projectName', 'projectName');
    bind('elementType', 'elementType');
    bind('thicknessMm', 'thicknessMm', Number);
    bind('rebarKg', 'rebarKg', Number);
    bind('horizontalDistance', 'horizontalDistance', Number);
    bind('maxAggSize', 'maxAggSize', Number);
    bind('fc', 'fc', Number);

    bind('stdDev', 'stdDev', Number);
    bind('fcm', 'fcm', Number);
    bind('workshopGrade', 'workshopGrade');
    bind('slumpClass', 'slumpClass');

    const mode = $('#stdDevMode');

    mode?.addEventListener('change', () => {
      state.stdDevMode = mode.value;
      saveState();
      render();
    });
  }

  /* صفحه ۲ */
  if (state.step === 1) {
    bind('aggCount', 'aggCount', Number, true);

    $$('[data-aggfield]').forEach(element => {
      element.addEventListener('input', () => {
        const index = Number(element.dataset.agg);
        const key = element.dataset.aggfield;

        if (!state.aggregates[index]) return;

        state.aggregates[index][key] =
          key === 'name'
            ? element.value
            : num(element.value);

        saveState();

        if (key === 'name' && state.step === 1) {
          const ratioLabel = $(`[data-ratio="${index}"]`);

          if (ratioLabel) {
            const label = ratioLabel
              .closest('.ratio-field')
              ?.querySelector('label');

            if (label) {
              label.textContent = `${element.value} (%)`;
            }
          }
        }
      });
    });

    $$('[data-pass]').forEach(element => {
      element.addEventListener('input', () => {
        const index = Number(element.dataset.pass);
        const sieve = Number(element.dataset.sieve);

        if (!state.aggregates[index]) return;

        state.aggregates[index].passes[sieve] =
          num(element.value);

        saveState();
      });
    });
  }

  /* صفحه ۳ */
  if (state.step === 2) {
    bind('fullerRow', 'fullerRow', Number, true);
    bind('maxAggSize', 'maxAggSize', Number);

    $$('[data-ratio]').forEach(element => {
      element.addEventListener('input', () => {
        const index = Number(element.dataset.ratio);

        state.ratios[index] = num(element.value);

        saveState();

        const chart = $('#grading-chart');

        if (chart) {
          chart.innerHTML = drawGradingChart();
        }

        updateRatioStatus();
      });
    });

    updateRatioStatus();
  }

  /* صفحه ۴ */
  if (state.step === 3) {
    ['testG', 'testT', 'testV', 'blendedDryDensity'].forEach(key => {
      bind(key, key, Number);

      $(`#${key}`)?.addEventListener('input', updateVoidCalculation);
    });

    updateVoidCalculation();
  }

  /* صفحه ۵ */
  if (state.step === 4) {
    bind('shapeRank', 'shapeRank', Number, true);
  }

  /* صفحه ۶ */
  if (state.step === 5) {
    bind('sccType', 'sccType', value => value, true);
    bind('pasteExtra', 'pasteExtra', Number, true);
  }

  /* صفحه ۷ */
  if (state.step === 6) {
    bind('cementStrength', 'cementStrength', Number);
    bind('cementStrengthLab', 'cementStrengthLab', Number);
    bind('coarseFracture', 'coarseFracture');
    bind('wc', 'wc', Number);
  }

  /* صفحه ۱۰ */
  if (state.step === 9) {
    $('#print-report')?.addEventListener('click', () => {
      window.print();
    });
  }
}

/* -------------------------------------------------------
   دکمه‌های اصلی و راه‌اندازی
------------------------------------------------------- */

$('#prev')?.addEventListener('click', () => {
  if (state.step > 0) {
    state.step--;
    render();
  }
});

$('#next')?.addEventListener('click', () => {
  if (state.step < STEPS.length - 1) {
    state.step++;
    render();
  }
});

$('#reset-project')?.addEventListener('click', () => {
  if (confirm('تمام اطلاعات طرح فعلی پاک و طرح جدید ایجاد شود؟')) {
    state = defaultState();
    saveState();
    render();
  }
});

document.addEventListener('keydown', event => {
  if (
    event.key === 'Escape' &&
    $('#reference-modal') &&
    !$('#reference-modal').hidden
  ) {
    closeModal();
  }
});

render();
