/*
 * SCC Mix Designer — offline first implementation
 * Reference basis: Iran Concrete Code, Volume 5, Chapter 6 (SCC mix design).
 * The project is a preliminary mix-design aid; trial batches and testing remain mandatory.
 */
'use strict';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORAGE_KEY = 'scc-mix-designer-v2';

const TABLES = {
  slump: {
    title: 'جدول ۱-۶ ـ راهنمای اولیه انتخاب کارایی و روانی بتن (جریان اسلامپ)', image:'references/table1-6.png',
    columns: ['رده جریان اسلامپ','بازه جریان اسلامپ (mm)','موارد کاربرد'],
    rows: [
      ['SF0','450 تا 550','قطعات نازک یا با حجم میلگرد زیاد و وسایل تراکمی ضعیف؛ بتن آسان‌تراکم (ECC)، بافت دانه‌بندی ریز تا خیلی ریز؛ حداکثر اندازه سنگدانه ۲۰ و گاه تا ۲۵ میلی‌متر.'],
      ['SF1','550 تا 650','قطعات نازک یا با حجم میلگرد خیلی زیاد، پیچیدگی کم قالب‌بندی و حرکت افقی محدود تا ۵ متر؛ بافت خیلی ریز یا عدم امکان تراکم؛ حداکثر اندازه سنگدانه ۲۰ میلی‌متر یا کمتر.'],
      ['SF2','650 تا 750','قطعات خیلی نازک یا با حجم میلگرد خیلی زیاد، قالب‌بندی پیچیده و حرکت افقی تا ۱۰ متر؛ بافت فوق‌العاده ریز؛ حداکثر اندازه ۱۲٫۵ میلی‌متر یا کمتر و عدم امکان تراکم.'],
      ['SF3','750 تا 850','قطعات خیلی نازک یا با حجم میلگرد فوق‌العاده زیاد، قالب‌بندی بسیار پیچیده و حرکت افقی تا ۱۰ متر؛ بافت فوق‌العاده ریز؛ حداکثر اندازه ۱۲٫۵ میلی‌متر یا کمتر و عدم امکان تراکم.']
    ],
    note: 'به‌کارگیری SF3 به تدابیر خاص برای جلوگیری از جداشدگی و آب‌انداختن نیاز دارد. بتن با جریان اسلامپ ۵۰۰ تا ۶۵۰ میلی‌متر ممکن است به تراکم جزئی نیاز داشته باشد.'
  },
  texture: {
    title: 'جدول ۲-۶ ـ راهنمای بافت دانه‌بندی مخلوط سنگدانه بر اساس توان n', image:'references/table2-6.png',
    columns: ['بافت دانه‌بندی','بازه توان n'],
    rows: [
      ['خیلی درشت','۰٫۶ تا ۰٫۷'],['درشت','۰٫۵ تا ۰٫۶'],['متوسط','۰٫۴ تا ۰٫۵'],
      ['ریز','۰٫۳ تا ۰٫۴'],['خیلی ریز','۰٫۲ تا ۰٫۳'],['فوق‌العاده ریز','۰٫۱ تا ۰٫۲']
    ],
    note: 'برای انتخاب کاربردی n، جدول ۵-۶ ملاک مستقیم‌تری دارد و محدوده‌های پایین و بالای منحنی را مشخص می‌کند.'
  },
  rebar: {
    title: 'جدول ۳-۶ ـ راهنمای تراکم میلگرد در شالوده‌ها و دال‌ها', image:'references/table3-6.png',
    columns: ['رده تراکم میلگرد','وزن میلگرد (kg/m³)'],
    rows: [
      ['خیلی کم','کمتر از ۵۰'],['کم','۵۰ تا ۷۵'],['متوسط','۷۵ تا ۱۰۰'],
      ['زیاد','۱۰۰ تا ۱۵۰'],['خیلی زیاد','۱۵۰ تا ۲۰۰'],['فوق‌العاده زیاد','بیش از ۲۰۰']
    ],
    note: 'مقادیر این جدول برای تیر، ستون و دیوار باید در ۰٫۵ ضرب شوند؛ بنابراین برنامه برای این اعضا وزن میلگرد معادل را نصف می‌کند.'
  },
  thickness: {
    title: 'جدول ۴-۶ ـ طبقه‌بندی ضخامت قطعات بتنی', image:'references/table4-6.png',
    columns: ['طبقه‌بندی','بازه ضخامت (mm)'],
    rows: [
      ['خیلی نازک','کمتر از ۱۵۰'],['نازک','۱۵۰ تا ۳۰۰'],['نسبتاً نازک','۳۰۰ تا ۶۰۰'],
      ['نیمه‌ضخیم','۶۰۰ تا ۹۰۰'],['ضخیم','۹۰۰ تا ۱۸۰۰'],['بسیار ضخیم','بیش از ۱۸۰۰']
    ]
  },
  fuller: {
    title: 'جدول ۵-۶ ـ مقدار توان n منحنی فولر ـ تامسون اصلاح‌شده', image:'references/table5-6.png',
    columns: ['ردیف','موارد کاربرد پیشنهادی','توان منحنی پایینی','توان منحنی بالایی'],
    rows: [
      ['۱','اسلامپ ۵۰۰ تا ۵۵۰؛ ستون و شالوده با میلگرد کم یا قطعه غیـرنازک، حرکت کم، شمع و بتن‌ریزی زیر آب','۰٫۴۰','۰٫۳۰'],
      ['۲','اسلامپ ۵۵۰ تا ۶۵۰؛ ستون و شالوده با میلگرد متوسط یا قطعه نازک، حرکت متوسط، شمع و بتن‌ریزی زیر آب','۰٫۳۵','۰٫۲۵'],
      ['۳','اسلامپ بیش از ۶۵۰؛ تیر و دال با طول حرکت و حجم میلگرد متوسط','۰٫۳۰','۰٫۲۰'],
      ['۴','اسلامپ بیش از ۶۵۰؛ تیر و دال با حرکت زیاد، میلگرد زیاد و قطعات نازک','۰٫۲۵','۰٫۱۵'],
      ['۵','بتن خودتراکم برای تعمیر سطوح بتنی؛ بتن با بافت بسیار ریز','۰٫۲۰','۰٫۱۰']
    ],
    note: 'اعداد توان پایین و بالا در جدول به ترتیب محدوده مطلوب دانه‌بندی را مشخص می‌کنند. برای رسم دو کران، از مقدار کمتر و بیشتر n استفاده می‌شود.'
  },
  shape: {
    title: 'جدول ۶-۶ ـ تعیین رده و امتیاز شکل سنگدانه‌ها (Rs-A)', image:'references/table6-6.png',
    columns: ['رده','شکل','گوشه‌داری','مثال'],
    rows: [
      ['۱','تقریباً ابعاد مساوی','گردشده مناسب','اکثر سنگدانه‌های رودخانه‌ای'],
      ['۲','انحراف از ابعاد مساوی','گردشده','بخشی شکسته‌شده و بخشی رودخانه‌ای'],
      ['۳','اکثر ذرات ابعاد مساوی ندارند','بخشی گرد شده، بخشی گوشه‌دار','به‌خوبی شکسته‌شده با گوشه‌های مساوی یا بیشتر از ۹۰ درجه'],
      ['۴','تخت یا تطویل‌شده','گوشه‌دار','شکسته‌شده؛ بعضی گوشه‌ها بیش از ۹۰ درجه'],
      ['۵','اکثر ذرات تخت و تطویل‌شده','خیلی گوشه‌دار','شکسته‌شده با گوشه‌های زیادی مساوی یا بیشتر از ۹۰ درجه']
    ],
    note: 'رده ۱ نمایانگر شکل مناسب و خوب گرد‌شده و رده ۵ نمایانگر شکل ضعیف و بسیار گوشه‌دار است. آیین‌نامه استفاده از رده‌های ۲ یا ۳ و حداکثر ۴ را توصیه می‌کند. برای هر ترکیب دانه‌بندی باید ارزیابی جداگانه انجام شود.'
  }
};

const STEPS = [
  '۱. اطلاعات اولیه','۲. مشخصات سنگدانه','۳. سهم‌بندی و منحنی','۴. فضای خالی',
  '۵. شکل دانه','۶. حجم خمیر','۷. آب به سیمان','۸. ترکیب خمیر','۹. مقدار مصالح','۱۰. گزارش نهایی'
];
const SIEVES = [37.5,25,19,12.5,9.5,4.75,2.36,1.18,0.6,0.3,0.15,0.075];
const SIEVE_NAMES = ['37.5','25','19','12.5','9.5','4.75','2.36','1.18','0.60','0.30','0.15','0.075'];

const defaultState = () => ({
  step:0,
  projectName:'', elementType:'ستون', thicknessMm:300, rebarKg:80, horizontalDistance:5,
  maxAggSize:19, fc:30, stdDev:0, fcm:0, slumpClass:'SF2',
  aggCount:2, aggregates:Array.from({length:4},(_,i)=>({name:i===0?'ماسه':`سنگدانه ${i+1}`,dryDensity:2650,ssd:2670,absorption:1.5,passes:{}})),
  ratios:[50,50,0,0], fullerRow:2, shapeRank:3,
  testG:0,testT:0,testV:0, voids:0, bulkDensity:0, blendedDryDensity:2650,
  sccType:'powder', pasteExtra:15, pasteSpacing:12, pasteFilling:0, pasteBase:0, pasteFinal:0,
  wc:0.45, cementStrength:42.5, coarseFracture:'C', airPercent:1.5,
  water:0, cement:0, powder:0, filler:0, vma:0, coarseAgg:0, fineAgg:0
});
let state = loadState();
function loadState(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return defaultState()}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function num(v, fallback=0){const x=Number(v);return Number.isFinite(x)?x:fallback}
function fmt(v,d=1){return Number.isFinite(v)?v.toFixed(d):'—'}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function field(label,id,value,type='number',opts={}){return `<div class="field ${opts.full?'full':''}"><label for="${id}">${label}</label>${type==='select'?`<select id="${id}">${opts.options.map(o=>`<option value="${esc(o.value)}" ${String(value)===String(o.value)?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`:`<input id="${id}" type="${type}" value="${esc(value)}" ${opts.min!==undefined?`min="${opts.min}"`:''} ${opts.max!==undefined?`max="${opts.max}"`:''} ${opts.step?`step="${opts.step}"`:''} ${opts.placeholder?`placeholder="${opts.placeholder}"`:''}>`}${opts.help?`<small>${opts.help}</small>`:''}</div>`}
function referenceButton(key,label='مشاهده جدول اصلی آبا'){return `<button type="button" class="reference-btn" data-table="${key}">${label}</button>`}
function result(label,value,unit=''){return `<div class="result-card"><small>${label}</small><strong>${value}${unit?` <small>${unit}</small>`:''}</strong></div>`}
function tableHtml(t){return `<h3>${t.title}</h3>${t.image?`<img class="reference-image" src="${t.image}" alt="${esc(t.title)}" loading="lazy">`:''}<div class="table-wrap"><table class="data-table"><thead><tr>${t.columns.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${t.note?`<div class="section-note">${t.note}</div>`:''}`}
function openTable(key){const t=TABLES[key];if(!t)return;$('#modal-title').textContent=t.title;$('#modal-content').innerHTML=tableHtml(t);$('#reference-modal').hidden=false;document.body.style.overflow='hidden'}
function closeModal(){$('#reference-modal').hidden=true;document.body.style.overflow=''}

function effectiveRebar(){return ['تیر','ستون','دیوار'].includes(state.elementType)?state.rebarKg*0.5:state.rebarKg}
function rebarClass(){const v=effectiveRebar();return v<50?'خیلی کم':v<75?'کم':v<100?'متوسط':v<150?'زیاد':v<=200?'خیلی زیاد':'فوق‌العاده زیاد'}
function thicknessClass(){const v=state.thicknessMm;return v<150?'خیلی نازک':v<300?'نازک':v<600?'نسبتاً نازک':v<900?'نیمه‌ضخیم':v<=1800?'ضخیم':'بسیار ضخیم'}
function suggestSlump(){const r=effectiveRebar(),t=state.thicknessMm,d=state.horizontalDistance; if(r>200 || (t<150&&r>150))return 'SF3'; if(r>100 || t<300 || d>10)return 'SF2'; if(r>=50 || t<600 || d>5)return 'SF1'; return 'SF0'}
function renderStep1(){return `<h2>گام اول و دوم ـ اطلاعات پروژه و انتخاب جریان اسلامپ</h2><p class="intro">مشخصات عضو بتنی را وارد کنید. رده اسلامپ پیشنهادی با استفاده از اطلاعات جدول‌های ۱-۶، ۳-۶ و ۴-۶ نمایش داده می‌شود؛ انتخاب نهایی باید با قضاوت مهندسی انجام شود.</p>
<div class="input-grid">
${field('نام پروژه','projectName',state.projectName,'text',{full:true,placeholder:'نام پروژه یا عضو بتنی'})}
${field('نوع عضو بتنی','elementType',state.elementType,'select',{options:['ستون','دیوار','تیر','دال','شالوده','شمع','تعمیر سطح بتنی'].map(x=>({value:x,label:x}))})}
${field('ضخامت عضو (mm)','thicknessMm',state.thicknessMm,'number',{min:1,step:1})}
${field('وزن میلگرد در هر مترمکعب عضو (kg/m³)','rebarKg',state.rebarKg,'number',{min:0,step:1,help:'برای تیر، ستون و دیوار، برنامه نصف مقدار واردشده را با جدول ۳-۶ مقایسه می‌کند.'})}
${field('طول حرکت افقی موردنیاز بتن (m)','horizontalDistance',state.horizontalDistance,'number',{min:0,step:0.5})}
${field('حداکثر اندازه اسمی سنگدانه (mm)','maxAggSize',state.maxAggSize,'select',{options:[9.5,12.5,19,25,37.5].map(x=>({value:x,label:String(x)}))})}
${field('مقاومت مشخصه فشاری بتن f’c (MPa)','fc',state.fc,'number',{min:15,max:50,step:0.1})}
${field('انحراف معیار برآوردشده S (MPa)','stdDev',state.stdDev,'number',{min:0,step:0.1,help:'روش تعیین S و مقاومت هدف به فصل پنجم جلد دوم آبا ارجاع دارد؛ مقدار باید از آن مرجع یا سوابق کارگاه وارد شود.'})}
${field('مقاومت فشاری متوسط هدف f’cm (MPa)','fcm',state.fcm,'number',{min:0,step:0.1,help:'این مقدار را پس از کنترل روابط فصل پنجم جلد دوم تأیید کنید.'})}
${field('رده جریان اسلامپ انتخابی','slumpClass',state.slumpClass,'select',{options:['SF0','SF1','SF2','SF3'].map(x=>({value:x,label:x}))})}
</div>
${referenceButton('slump','مشاهده جدول ۱-۶ ـ رده‌های جریان اسلامپ')}${referenceButton('rebar','مشاهده جدول ۳-۶ ـ تراکم میلگرد')}${referenceButton('thickness','مشاهده جدول ۴-۶ ـ ضخامت عضو')}
<div class="result-grid">${result('رده تراکم میلگرد',rebarClass())}${result('رده ضخامت عضو',thicknessClass())}${result('رده اسلامپ پیشنهادی',suggestSlump())}</div>
<div class="warning-note">محدودیت حداکثر اندازه سنگدانه نیز باید کنترل شود: حداکثر اندازه اسمی نباید از یک‌پنجم فاصله جداره قالب، یک‌سوم ضخامت دال/عضو یک‌طرف قالب، سه‌چهارم فاصله آزاد میلگردها یا سه‌چهارم پوشش بتن بیشتر باشد. داده‌های هندسی لازم برای این کنترل هنوز باید در فرم پروژه تکمیل شوند.</div>`}

function ensureAggs(){if(!Array.isArray(state.aggregates))state.aggregates=defaultState().aggregates;while(state.aggregates.length<4)state.aggregates.push({name:`سنگدانه ${state.aggregates.length+1}`,dryDensity:2650,ssd:2670,absorption:1.5,passes:{}});}
function renderStep2(){ensureAggs();let rows='';for(let j=0;j<SIEVES.length;j++){rows+=`<tr><td>${SIEVE_NAMES[j]}</td>${Array.from({length:state.aggCount},(_,i)=>`<td><input type="number" min="0" max="100" step="0.1" data-pass="${i}" data-sieve="${SIEVES[j]}" value="${state.aggregates[i].passes[SIEVES[j]]??0}"></td>`).join('')}</tr>`}
return `<h2>گام سوم ـ مشخصات و دانه‌بندی سنگدانه‌ها</h2><p class="intro">درصد عبوری تجمعی هر سنگدانه را وارد کنید. اطلاعات هر منبع جداگانه نگهداری می‌شود و در گام بعد با نسبت‌های اختلاط ترکیب خواهد شد.</p>
<div class="input-grid">${field('تعداد منابع سنگدانه','aggCount',state.aggCount,'select',{options:[1,2,3,4].map(x=>({value:x,label:String(x)}))})}</div>
<div class="table-wrap"><table class="data-table"><thead><tr><th>مشخصه</th>${Array.from({length:state.aggCount},(_,i)=>`<th>${fieldAggName(i)}</th>`).join('')}</tr></thead><tbody>
${rows}
<tr><th>چگالی خشک (kg/m³)</th>${Array.from({length:state.aggCount},(_,i)=>`<td><input type="number" data-aggfield="dryDensity" data-agg="${i}" value="${state.aggregates[i].dryDensity}" step="1"></td>`).join('')}</tr>
<tr><th>چگالی SSD (kg/m³)</th>${Array.from({length:state.aggCount},(_,i)=>`<td><input type="number" data-aggfield="ssd" data-agg="${i}" value="${state.aggregates[i].ssd}" step="1"></td>`).join('')}</tr>
<tr><th>جذب آب (%)</th>${Array.from({length:state.aggCount},(_,i)=>`<td><input type="number" data-aggfield="absorption" data-agg="${i}" value="${state.aggregates[i].absorption}" step="0.1"></td>`).join('')}</tr>
</tbody></table></div>
${referenceButton('texture','مشاهده جدول ۲-۶ ـ بافت دانه‌بندی')}
<div class="section-note">دانه‌بندی باید به‌صورت درصد عبوری تجمعی وارد شود. برای هر الک، مقدار عبوری نباید از الک درشت‌تر بیشتر باشد؛ برنامه پس از ورود داده‌ها این سازگاری را کنترل می‌کند.</div>`}
function fieldAggName(i){return `<input type="text" aria-label="نام سنگدانه ${i+1}" data-aggfield="name" data-agg="${i}" value="${esc(state.aggregates[i].name)}" style="width:90px">`}

function fuller(d,D,n){if(d<=0.075)return 0;if(d>=D)return 100;const dn=Math.pow(d,n),d0=Math.pow(0.075,n),Dn=Math.pow(D,n);return 100*(dn-d0)/(Dn-d0)}
function mixedPassing(s){let v=0;for(let i=0;i<state.aggCount;i++)v+=(num(state.ratios[i])/100)*num(state.aggregates[i].passes[s]);return v}
function renderStep3(){const r=TABLES.fuller.rows[state.fullerRow-1];const low=num(r[2]),high=num(r[3]);const ratioRows=Array.from({length:state.aggCount},(_,i)=>`<div class="field"><label>${esc(state.aggregates[i].name)} (%)</label><input type="number" min="0" max="100" step="1" data-ratio="${i}" value="${state.ratios[i]??0}"></div>`).join('');
return `<h2>گام سوم ـ سهم‌بندی و منحنی دانه‌بندی مطلوب</h2><p class="intro">نسبت سنگدانه‌ها را طوری تعیین کنید که منحنی ترکیبی تا حد امکان در محدوده منحنی مطلوب جدول ۵-۶ قرار گیرد. درصدها باید جمعاً ۱۰۰ باشند.</p>
<div class="input-grid">${field('ردیف کاربرد جدول ۵-۶','fullerRow',state.fullerRow,'select',{options:TABLES.fuller.rows.map((x,i)=>({value:i+1,label:`ردیف ${i+1}`}))})}${field('حداکثر اندازه سنگدانه D (mm)','maxAggSize',state.maxAggSize,'number',{min:1,step:0.1})}</div>
${referenceButton('texture','مشاهده جدول ۲-۶ ـ طبقه‌بندی بافت')}${referenceButton('fuller','مشاهده جدول ۵-۶ ـ انتخاب n و کاربردها')}
<h3>درصد اختلاط منابع سنگدانه</h3><div class="input-grid">${ratioRows}</div><div id="ratio-status" class="status"></div>
<div class="result-grid">${result('توان پایین n',fmt(low,2))}${result('توان بالا n',fmt(high,2))}${result('توان میانی n',fmt((low+high)/2,3))}</div>
<div class="chart-box" id="grading-chart">${drawGradingChart()}</div><div class="chart-legend"><span><i class="legend-dot" style="background:#0d7188"></i>منحنی ترکیبی واقعی</span><span><i class="legend-dot" style="background:#d17a28"></i>کران پایین</span><span><i class="legend-dot" style="background:#9b4a76"></i>کران بالا</span></div>
<div id="grading-status" class="status"></div>
<div class="section-note">رابطه فولر ـ تامسون اصلاح‌شده در این فصل، مرز ریزدانه را ۰٫۰۷۵ میلی‌متر در نظر می‌گیرد: P = (dⁿ − 0.075ⁿ) / (Dⁿ − 0.075ⁿ) × 100. در نتیجه در کد جدید نیز مرز ۰٫۰۷۵ میلی‌متر حفظ شده است.</div>`}
function drawGradingChart(){const W=720,H=280,L=54,R=15,T=15,B=42;const xMin=Math.log10(.075),xMax=Math.log10(37.5);const X=d=>L+(Math.log10(d)-xMin)/(xMax-xMin)*(W-L-R);const Y=p=>T+(100-p)/100*(H-T-B);const D=num(state.maxAggSize,19);const row=TABLES.fuller.rows[state.fullerRow-1];const ns=[num(row[2]),num(row[3])];const pts=SIEVES.map(s=>({s,p:mixedPassing(s)}));const path=arr=>arr.map((p,i)=>`${i?'L':'M'}${X(p.s).toFixed(1)},${Y(p.p).toFixed(1)}`).join(' ');const ideal=n=>SIEVES.map(s=>({s,p:fuller(s,D,n)})).reverse();let grid='';for(let p=0;p<=100;p+=20)grid+=`<line x1="${L}" y1="${Y(p)}" x2="${W-R}" y2="${Y(p)}" stroke="#e7edf1"/><text x="${L-8}" y="${Y(p)+4}" text-anchor="end" font-size="10" fill="#657b8a">${p}</text>`;const ticks=[.075,.15,.3,.6,1.18,2.36,4.75,9.5,12.5,19,25,37.5];for(const d of ticks)grid+=`<line x1="${X(d)}" y1="${T}" x2="${X(d)}" y2="${H-B}" stroke="#f0f3f5"/><text x="${X(d)}" y="${H-18}" text-anchor="middle" font-size="9" fill="#657b8a">${d}</text>`;return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="نمودار لگاریتمی دانه‌بندی"><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}" fill="#fff" stroke="#cbd8e1"/>${grid}<path d="${path(ideal(ns[0]))}" fill="none" stroke="#d17a28" stroke-width="2" stroke-dasharray="6 4"/><path d="${path(ideal(ns[1]))}" fill="none" stroke="#9b4a76" stroke-width="2" stroke-dasharray="6 4"/><path d="${path(pts)}" fill="none" stroke="#0d7188" stroke-width="3"/>${pts.map(p=>`<circle cx="${X(p.s)}" cy="${Y(p.p)}" r="3" fill="#0d7188"/>`).join('')}<text x="${W/2}" y="${H-2}" text-anchor="middle" font-size="10" fill="#526b7a">اندازه الک (mm) ـ محور لگاریتمی</text><text x="14" y="${H/2}" transform="rotate(-90 14 ${H/2})" text-anchor="middle" font-size="10" fill="#526b7a">درصد عبوری</text></svg>`}

function renderStep4(){return `<h2>گام پنجم ـ تعیین درصد فضای خالی مخلوط سنگدانه</h2><p class="intro">مطابق فصل ششم، چگالی انبوهی خشک مخلوط سنگدانه باید در حالت متراکم‌شده با میله و بر اساس روش استاندارد ملی ایران ۴۰۸۳ تعیین شود. میانگین‌گیری از چگالی انبوهی منابع جداگانه جایگزین این آزمایش نیست.</p>
<div class="input-grid">${field('جرم سنگدانه خشک به‌همراه ظرف G (kg)','testG',state.testG,'number',{min:0,step:0.001})}${field('جرم ظرف T (kg)','testT',state.testT,'number',{min:0,step:0.001})}${field('حجم ظرف V (m³)','testV',state.testV,'number',{min:0,step:0.0001,help:'حجم کالیبره‌شده ظرف آزمایش را وارد کنید.'})}${field('چگالی خشک مخلوط سنگدانه S (kg/m³)','blendedDryDensity',state.blendedDryDensity,'number',{min:1,step:1,help:'مقدار چگالی خشک مخلوط واقعی را بر اساس روش آزمایشگاهی و استاندارد مربوط وارد کنید؛ این مقدار نباید با چگالی SSD جایگزین شود.'})}</div>
<div class="section-note">M = (G − T) / V ؛ درصد فضای خالی = 100 × [(S × W − M) / (S × W)] ؛ در دمای متعارف W = 998 kg/m³.</div>
<div class="result-grid">${result('چگالی انبوهی خشک M',fmt(state.bulkDensity,1),'kg/m³')}${result('درصد فضای خالی',fmt(state.voids,2),'%')}</div><div id="void-status" class="status"></div>
<div class="warning-note">برای نتیجه معتبر، G و T باید بر حسب kg و V بر حسب m³ باشند و آزمایش باید روی ترکیب واقعی سنگدانه‌ها انجام شود. چگالی خشک S نیز باید با مبنای خشک و استاندارد آزمایش تعیین شده باشد.</div>`}

function renderStep5(){return `<h2>گام ششم ـ انتخاب رده شکل و گوشه‌داری سنگدانه‌ها (Rs-A)</h2><p class="intro">رده باید برای ترکیب واقعی سنگدانه‌های ریز و درشت ارزیابی شود؛ صرفاً انتخاب یک عدد بدون بررسی شکل و گوشه‌داری کافی نیست.</p>${referenceButton('shape','مشاهده جدول ۶-۶ ـ شکل‌ها و نمونه‌های سنگدانه')}
<div class="shape-grid">${[1,2,3,4,5].map(n=>`<div class="shape-card ${state.shapeRank===n?'selected':''}"><b>${n}</b>${['خوب و گرد شده','گرد شده','میانه','گوشه‌دار','بسیار گوشه‌دار'][n-1]}</div>`).join('')}</div>
<div class="input-grid">${field('رده انتخاب‌شده Rs-A','shapeRank',state.shapeRank,'select',{options:[1,2,3,4,5].map(n=>({value:n,label:`رده ${n}`}))})}</div>
<div class="result-grid">${result('رده انتخابی',state.shapeRank)}${result('توصیه آیین‌نامه','۲ یا ۳')}${result('حداکثر رده توصیه‌شده','۴')}</div>
<div class="warning-note">در جدول ۶-۶ رده ۱ مناسب‌ترین شکل و گردشدگی و رده ۵ ضعیف‌ترین شکل و بیشترین گوشه‌داری را نشان می‌دهد. ارزیابی برای هر ترکیب سنگدانه باید جداگانه انجام شود.</div>`}

function calcPaste(){const spacing=8+2*(num(state.shapeRank,3)-1);const voids=num(state.voids);const filling=100-((100-spacing)*(100-voids)/100);let min,max;if(state.sccType==='vma'){min=5;max=7}else if(state.sccType==='combined'){min=6;max=15}else{min=10;max=20}const extra=Math.min(max,Math.max(min,num(state.pasteExtra,min)));state.pasteSpacing=spacing;state.pasteFilling=filling;state.pasteExtra=extra;state.pasteBase=filling;state.pasteFinal=filling*(1+extra/100);return {spacing,filling,extra,min,max,final:state.pasteFinal}}
function renderStep6(){const c=calcPaste();return `<h2>گام هفتم ـ محاسبه حجم خمیر</h2><p class="intro">حجم خمیر باید فضای خالی بین سنگدانه‌های متراکم‌شده را پر کند و علاوه بر آن، فاصله لازم برای روانکاری و حرکت سنگدانه‌ها را تأمین کند.</p>
<div class="section-note">Vpaste filling = 100 − [(100 − Vpaste spacing) × (100 − %Voids) / 100]</div><div class="section-note">Vpaste spacing = 8 + 2 × (Rs-A − 1)</div>
<div class="result-grid">${result('فضای خالی سنگدانه',fmt(state.voids,2),'%')}${result('حجم خمیر فاصله‌گذار',fmt(c.spacing,1),'%')}${result('حداقل حجم خمیر پرکننده',fmt(c.filling,2),'%')}</div>
<div class="input-grid">${field('نوع بتن خودتراکم','sccType',state.sccType,'select',{options:[{value:'powder',label:'پودری'},{value:'vma',label:'دارای VMA'},{value:'combined',label:'ترکیبی'}]})}${field(`افزایش حجم خمیر (%) ـ بازه ${c.min} تا ${c.max}`,'pasteExtra',state.pasteExtra,'number',{min:c.min,max:c.max,step:0.5,help:'پودری: ۱۰ تا ۲۰٪؛ دارای VMA: ۵ تا ۷٪؛ ترکیبی: ۶ تا ۱۵٪. مقدار نهایی با توجه به قابلیت عبور و تراکم میلگرد انتخاب شود.'})}</div>
<div class="result-grid">${result('حجم خمیر نهایی',fmt(c.final,2),'% حجمی بتن')}</div>
<div class="warning-note">اگر آزمایش فضای خالی در گام پنجم انجام نشده باشد، نتیجه این گام صرفاً نمایشی است و برای ادامه محاسبات معتبر نیست.</div>`}

function renderStep7(){return `<h2>گام هشتم ـ تعیین نسبت آب آزاد به سیمان</h2><p class="intro">مطابق متن فصل ششم، نسبت آب آزاد به سیمان با توجه به نوع و رده مقاومتی سیمان و درصد شکستگی سنگدانه درشت از شکل ۷-۶ تعیین می‌شود.</p>
<div class="input-grid">${field('رده سیمان','cementStrength',state.cementStrength,'select',{options:[{value:32.5,label:'۳۲۵'},{value:42.5,label:'۴۲۵'},{value:52.5,label:'۵۲۵'}]})}${field('نوع سنگدانه درشت','coarseFracture',state.coarseFracture,'select',{options:[{value:'C',label:'C ـ شکسته/تیزگوشه'},{value:'R',label:'R ـ گردگوشه'}]})}${field('مقاومت ملات سیمان (MPa)','cementStrengthLab',42.5,'number',{min:1,step:0.1})}${field('نسبت آب آزاد به سیمان w/c','wc',state.wc,'number',{min:0.2,max:0.8,step:0.01,help:'ورودی موقت؛ مقدار نهایی باید از شکل ۷-۶ با درونیابی/برونیابی استخراج و تأیید شود.'})}</div>
<div class="warning-note">نمودار شکل ۷-۶ هنوز به داده عددی کالیبره‌شده تبدیل نشده است؛ بنابراین این فیلد فعلاً ورودی دستی است و برنامه نباید آن را مقدار آیین‌نامه‌ای قطعی معرفی کند. در نسخه بعدی، نقاط منحنی از روی شکل اصلی استخراج و کنترل خواهند شد.</div>${referenceButton('fuller','بازبینی جدول ۵-۶')}`}
function renderStep8(){return `<h2>گام نهم ـ تعیین مقدار و ترکیب خمیر</h2><p class="intro">این گام شامل تعیین آب، پودر، سیمان، مواد جایگزین سیمان، پودر خنثی و هواست. روابط و جداول این گام باید قبل از فعال شدن محاسبه نهایی به‌طور کامل استخراج شوند.</p><div class="empty-state">زیرساخت صفحه آماده است؛ محاسبات عددی این گام تا استخراج دقیق جدول‌های ۷-۶ تا ۱۱-۶ فعال نمی‌شود تا عدد حدسی وارد طرح نشود.</div>`}
function renderStep9(){return `<h2>گام دهم ـ تعیین مقدار سنگدانه‌ها</h2><p class="intro">در این گام حجم مطلق اجزای خمیر و هوا از حجم یک مترمکعب بتن کسر و مقدار سنگدانه ریز و درشت تعیین می‌شود.</p><div class="empty-state">محاسبات این صفحه پس از تکمیل گام‌های هشتم و نهم فعال می‌شود. اطلاعات SSD، جذب آب و رطوبت نیز در اصلاح مقادیر بچینگ استفاده خواهد شد.</div>`}
function renderStep10(){return `<h2>گزارش نهایی طرح اختلاط</h2><p class="intro">گزارش فعلی، داده‌های تکمیل‌شده و وضعیت محاسبات را نشان می‌دهد. تا زمان تکمیل و تأیید تمام گام‌ها، این گزارش طرح اجرایی نهایی محسوب نمی‌شود.</p>
<div class="result-grid">${result('پروژه',esc(state.projectName||'بدون نام'))}${result('رده اسلامپ',state.slumpClass)}${result('حداکثر اندازه سنگدانه',state.maxAggSize,'mm')}${result('فضای خالی',fmt(state.voids,2),'%')}${result('حجم خمیر پایه',fmt(state.pasteBase,2),'%')}${result('حجم خمیر نهایی',fmt(state.pasteFinal,2),'%')}</div>
${tableHtml({title:'وضعیت تکمیل مراحل',columns:['مرحله','وضعیت'],rows:STEPS.map((s,i)=>[s,i<=5?'زیرساخت اولیه؛ نیازمند کنترل ورودی/آزمایش':i===6?'ورودی دستی؛ نیازمند استخراج نمودار': 'در دست تکمیل'])})}
<div class="warning-note">این نرم‌افزار ابزار محاسبات اولیه است. مطابق فصل ششم آبا، ساخت مخلوط‌های آزمایشی در آزمایشگاه و شرایط کارگاه، کنترل مقاومت فشاری و سایر الزامات، و اصلاح طرح پیش از نهایی‌سازی ضروری است.</div><button class="btn btn-primary" type="button" id="print-report">چاپ / ذخیره گزارش PDF</button>`}
const RENDERERS=[renderStep1,renderStep2,renderStep3,renderStep4,renderStep5,renderStep6,renderStep7,renderStep8,renderStep9,renderStep10];

function render(){saveState();$('#project-name-display').textContent=state.projectName||'طرح جدید';$('#tabs').innerHTML=STEPS.map((s,i)=>`<button type="button" class="step-tab ${i===state.step?'active':''}" data-step="${i}">${s}</button>`).join('');$('#screen').innerHTML=RENDERERS[state.step]();$('#prev').disabled=state.step===0;$('#next').disabled=state.step===STEPS.length-1;$('#next').textContent=state.step===STEPS.length-1?'پایان':'گام بعد';attachEvents();}
function bind(id,key,cast=v=>v){const el=document.getElementById(id);if(!el)return;el.addEventListener('input',e=>{state[key]=cast(e.target.value);if(key==='projectName')$('#project-name-display').textContent=state.projectName||'طرح جدید';saveState()});el.addEventListener('change',e=>{state[key]=cast(e.target.value);saveState();if(['aggCount','fullerRow','maxAggSize','shapeRank','sccType','voids','testG','testT','testV','blendedDryDensity'].includes(key))render()})}
function attachEvents(){
  $$('[data-step]').forEach(b=>b.addEventListener('click',()=>{state.step=Number(b.dataset.step);render()}));
  $$('[data-table]').forEach(b=>b.addEventListener('click',()=>openTable(b.dataset.table)));
  $$('[data-close-modal]').forEach(b=>b.addEventListener('click',closeModal));
  if(state.step===0){bind('projectName','projectName');bind('elementType','elementType');bind('thicknessMm','thicknessMm',Number);bind('rebarKg','rebarKg',Number);bind('horizontalDistance','horizontalDistance',Number);bind('maxAggSize','maxAggSize',Number);bind('fc','fc',Number);bind('stdDev','stdDev',Number);bind('fcm','fcm',Number);bind('slumpClass','slumpClass');}
  if(state.step===1){bind('aggCount','aggCount',Number);$$('[data-aggfield]').forEach(el=>el.addEventListener('input',()=>{const i=Number(el.dataset.agg);state.aggregates[i][el.dataset.aggfield]=el.dataset.aggfield==='name'?el.value:num(el.value);saveState()}));$$('[data-pass]').forEach(el=>el.addEventListener('input',()=>{const i=Number(el.dataset.pass),s=Number(el.dataset.sieve);state.aggregates[i].passes[s]=num(el.value);saveState()}));}
  if(state.step===2){bind('fullerRow','fullerRow',Number);bind('maxAggSize','maxAggSize',Number);$$('[data-ratio]').forEach(el=>el.addEventListener('input',()=>{state.ratios[Number(el.dataset.ratio)]=num(el.value);saveState();$('#grading-chart').innerHTML=drawGradingChart();const total=state.ratios.slice(0,state.aggCount).reduce((a,b)=>a+num(b),0);$('#ratio-status').textContent=`جمع درصدها: ${fmt(total,1)}٪`;$('#ratio-status').className='status '+(Math.abs(total-100)<0.1?'good':'bad');$('#grading-status').textContent=Math.abs(total-100)<0.1?'منحنی ترکیبی بر اساس نسبت‌های واردشده ترسیم شده است.':'برای تحلیل معتبر، جمع نسبت‌ها باید دقیقاً ۱۰۰٪ باشد.'}));const total=state.ratios.slice(0,state.aggCount).reduce((a,b)=>a+num(b),0);$('#ratio-status').textContent=`جمع درصدها: ${fmt(total,1)}٪`;$('#ratio-status').className='status '+(Math.abs(total-100)<0.1?'good':'bad');$('#grading-status').textContent=Math.abs(total-100)<0.1?'منحنی ترکیبی بر اساس نسبت‌های واردشده ترسیم شده است.':'برای تحلیل معتبر، جمع نسبت‌ها باید دقیقاً ۱۰۰٪ باشد.';}
  if(state.step===3){['testG','testT','testV','blendedDryDensity'].forEach(k=>bind(k,k,Number));const update=()=>{const V=num(state.testV),G=num(state.testG),T=num(state.testT),S=num(state.blendedDryDensity);state.bulkDensity=V>0?(G-T)/V:0;state.voids=(S>0&&state.bulkDensity>0)?100*((S*998-state.bulkDensity)/(S*998)):0;const valid=V>0&&G>T&&S>0&&state.voids>=0&&state.voids<100;$('#void-status').textContent=valid?'محاسبه انجام شد؛ صحت آزمایش و واحدها را کنترل کنید.':'برای محاسبه معتبر، G بزرگ‌تر از T و V و S مثبت وارد کنید.';$('#void-status').className='status '+(valid?'good':'bad');$$('.result-card strong').forEach((el,i)=>{if(i===0)el.textContent=fmt(state.bulkDensity,1);if(i===1)el.textContent=fmt(state.voids,2)});saveState()};['testG','testT','testV','blendedDryDensity'].forEach(k=>$('#'+k)?.addEventListener('input',update));update();}
  if(state.step===4)bind('shapeRank','shapeRank',Number);
  if(state.step===5){bind('sccType','sccType');bind('pasteExtra','pasteExtra',Number);}
  if(state.step===6){bind('cementStrength','cementStrength',Number);bind('coarseFracture','coarseFracture');bind('wc','wc',Number);}
  if(state.step===9)$('#print-report')?.addEventListener('click',()=>window.print());
}
$('#prev').addEventListener('click',()=>{if(state.step>0){state.step--;render()}});
$('#next').addEventListener('click',()=>{if(state.step<STEPS.length-1){state.step++;render()}});
$('#reset-project').addEventListener('click',()=>{if(confirm('تمام اطلاعات طرح فعلی پاک و طرح جدید ایجاد شود؟')){state=defaultState();saveState();render()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#reference-modal').hidden)closeModal()});
render();
