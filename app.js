const $=s=>document.querySelector(s),V=$('#view');
let DB={categories:[],hymns:[]},tab='home',cat=null,cur=null,lang=localStorage.lang||'ar',fs=+localStorage.fs||22;
const L=k=>{try{return JSON.parse(localStorage[k]||'[]')}catch(e){return[]}};
const fav=()=>L('fav'),mine=()=>L('mine');
const SEASONS=[{id:'all',n:'الكل'},{id:'kiahk',n:'الكيهكي'},{id:'lent',n:'الصوم الكبير'},{id:'holyweek',n:'أسبوع الآلام'},{id:'resurrection',n:'القيامة والخماسين'},{id:'virginfast',n:'صوم العذراء'}];
let season=localStorage.season||'all';
function easter(y){const a=y%4,b=y%7,c=y%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7,m=Math.floor((d+e+114)/31),dd=(d+e+114)%31+1;return new Date(Date.UTC(y,m-1,dd+13))}
function curSeason(){const t=new Date(),u=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate()),E=easter(t.getFullYear()).getTime(),D=864e5,k=Math.round((u-E)/D);
 if(k>=-7&&k<=-1)return'holyweek';if(k>=-48&&k<-7)return'lent';if(k>=0&&k<=49)return'resurrection';
 const md=(t.getMonth()+1)*100+t.getDate();if(md>=1210||md<=108)return'kiahk';if(md>=807&&md<=822)return'virginfast';return'all'}
const inSeason=h=>season=='all'||h.season==season||h.cat==season||(Array.isArray(h.seasons)&&h.seasons.includes(season));
const lbl={ar:'عربي',cop:'قبطي',cta:'قبطي بحروف عربي'};
const all=()=>DB.hymns.concat(mine());
const cs=curSeason();
const norm=s=>(s||'').replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
async function load(){try{const r=await fetch('hymns.json?'+Date.now());DB=await r.json();localStorage.db=JSON.stringify(DB)}catch(e){try{DB=JSON.parse(localStorage.db)}catch(_){}}render()}
function esc(s){return String(s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function hrow(h){return `<div class="row" data-id="${h.id}"><b>${esc(h.title)}<small>${esc((DB.categories.find(c=>c.id==h.cat)||{}).name||'')}${h.audio?' • صوت':''}</small></b><button class="s" data-fav="${h.id}">${fav().includes(h.id)?'★':'☆'}</button></div>`}
function list(a,msg){return a.length?a.map(hrow).join(''):`<div class="empty">${msg}</div>`}
function render(){
 const q=norm($('#q').value.trim());$('#back').hidden=!(cat||cur);$('#search').hidden=!!cur;
 if(cur){const h=all().find(x=>x.id==cur);$('#title').textContent=h.title;return reader(h)}
 if(q){$('#title').textContent='نتائج البحث';V.innerHTML=list(all().filter(h=>norm(h.title+' '+(h.ar||'')+' '+(h.cta||'')+' '+(h.cop||'')).includes(q)),'مفيش نتائج.');return}
 if(tab=='fav'){$('#title').textContent='المفضلة';V.innerHTML=list(all().filter(h=>fav().includes(h.id)),'لسه مفيش ألحان في المفضلة. دوس على النجمة جنب أي لحن.');return}
 if(tab=='all'){$('#title').textContent='كل الألحان';V.innerHTML=chips()+list(all().filter(inSeason),empty());return}
 if(cat){const c=DB.categories.find(x=>x.id==cat);$('#title').textContent=c.name;V.innerHTML=chips()+list(all().filter(h=>h.cat==cat&&inSeason(h)),'القسم ده لسه فاضي. الألحان بتتضاف قريب.');return}
 $('#title').textContent='ألحان كنسية';
 V.innerHTML=chips()+'<div class="grid">'+DB.categories.map(c=>{const n=all().filter(h=>h.cat==c.id&&inSeason(h)).length;return `<div class="tile" data-cat="${c.id}"><i>${c.icon}</i>${c.name}<small>${n?n+' لحن':'قريباً'}</small></div>`}).join('')+'</div>'}
function chips(){return '<div class="chips">'+SEASONS.map(x=>`<button data-s="${x.id}" class="${x.id==season?'on':''}">${x.n}${x.id==cs&&x.id!='all'?' ●':''}</button>`).join('')+'</div>'+(season=='all'&&cs!='all'?`<p class="note">الموسم الحالي (تقريبي): ${SEASONS.find(x=>x.id==cs).n}</p>`:'')}
function empty(){return 'لسه مفيش ألحان. ادخل من ⋮ > إضافة لحن، أو استورد ملف الألحان.'}
function reader(h){
 const avail=['ar','cop','cta'].filter(k=>h[k]);if(!avail.includes(lang))lang=avail[0]||'ar';
 V.innerHTML=`<div class="reader"><div class="lang">${avail.map(k=>`<button data-l="${k}" class="${k==lang?'on':''}">${lbl[k]}</button>`).join('')}<button id="sm">ا−</button><button id="bg">ا+</button></div>
 <div style="font-size:${fs}px">${(h[lang]||'(النص لسه ما اتضافش)').split(/\n\s*\n/).map(p=>`<p class="verse ${lang=='cop'?'cop':''}">${esc(p)}</p>`).join('')}</div>${h.source?`<p class="note">المصدر: ${esc(h.source)}</p>`:''}</div>`+(h.audio?`<div class="player"><audio id="au" src="${h.audio}" controls preload="none"></audio><button id="sp">1×</button><button id="dl">تحميل</button></div>`:'');if(h.audio)audioInit(h)}
async function audioInit(h){const a=$('#au'),b=$('#dl');if(!window.caches)return b.hidden=true;const c=await caches.open('alhan-audio');const m=await c.match(h.audio);if(m){a.src=URL.createObjectURL(await m.blob());b.textContent='✓ محمّل';b.dataset.done=1}}
async function download(h){const b=$('#dl');if(b.dataset.done)return;b.textContent='جاري التحميل...';try{const r=await fetch(h.audio);if(!r.ok)throw 0;const c=await caches.open('alhan-audio');await c.put(h.audio,r.clone());const a=$('#au'),t=a.currentTime;a.src=URL.createObjectURL(await r.blob());a.currentTime=t;b.textContent='✓ محمّل';b.dataset.done=1}catch(e){b.textContent='تعذر التحميل'}}
document.addEventListener('click',e=>{const t=e.target;
 if(t.closest('[data-fav]')){e.stopPropagation();const id=t.closest('[data-fav]').dataset.fav,f=fav(),i=f.indexOf(id);i<0?f.push(id):f.splice(i,1);localStorage.fav=JSON.stringify(f);return render()}
 if(t.closest('[data-cat]')){cat=t.closest('[data-cat]').dataset.cat;return render()}
 if(t.closest('.row')){cur=t.closest('.row').dataset.id;return render()}
 if(t.dataset.s){season=t.dataset.s;localStorage.season=season;return render()}
 if(t.dataset.l){lang=t.dataset.l;localStorage.lang=lang;return render()}
 if(t.id=='sm'||t.id=='bg'){fs=Math.min(48,Math.max(16,fs+(t.id=='bg'?3:-3)));localStorage.fs=fs;return render()}
 if(t.id=='dl'){download(all().find(x=>x.id==cur));return}
 if(t.id=='sp'){const a=$('#au'),r=[1,1.25,1.5,.75];a.playbackRate=r[(r.indexOf(a.playbackRate)+1)%4];t.textContent=a.playbackRate+'×'}
 if(t.closest('nav button')){tab=t.dataset.t;cat=cur=null;$('#q').value='';document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b==t));render()}
});
$('#back').onclick=()=>{cur?cur=null:cat=null;render()};$('#q').oninput=()=>{cur=null;render()};
$('#menu').onclick=()=>{const s=$('#sheet');s.hidden=false;s.innerHTML=`<div><button class="btn" id="add">+ إضافة لحن</button><button class="btn alt" id="exp">تصدير الألحان</button><label class="btn alt">استيراد ملف<input type="file" id="imp" accept=".json" hidden></label><button class="btn alt" id="x">إغلاق</button><p class="note">الألحان المضافة من هنا بتتحفظ على التليفون ده بس.</p></div>`;
 $('#x').onclick=()=>s.hidden=true;
 $('#exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({hymns:mine()})],{type:'application/json'}));a.download='alhan-backup.json';a.click()};
 $('#imp').onchange=async e=>{const j=JSON.parse(await e.target.files[0].text());const m=mine();(j.hymns||[]).forEach(h=>{h.id=h.id||'u'+Date.now()+Math.random().toString(36).slice(2,6);m.push(h)});localStorage.mine=JSON.stringify(m);s.hidden=true;render()};
 $('#add').onclick=()=>{s.innerHTML=`<div><input id="a_t" placeholder="اسم اللحن"><select id="a_c">${DB.categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select><textarea id="a_ar" placeholder="النص العربي"></textarea><textarea id="a_cop" placeholder="النص القبطي"></textarea><textarea id="a_cat" placeholder="القبطي بحروف عربي"></textarea><input id="a_au" placeholder="رابط الصوت (اختياري)"><button class="btn" id="a_s">حفظ</button><button class="btn alt" id="x2">إلغاء</button></div>`;
  $('#x2').onclick=()=>s.hidden=true;$('#a_s').onclick=()=>{const t=$('#a_t').value.trim();if(!t)return;const m=mine();m.push({id:'u'+Date.now(),title:t,cat:$('#a_c').value,ar:$('#a_ar').value,cop:$('#a_cop').value,cta:$('#a_cat').value,audio:$('#a_au').value});localStorage.mine=JSON.stringify(m);s.hidden=true;render()}}};
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
load();
