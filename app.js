
'use strict';
const $=id=>document.getElementById(id), KEY='beton09', HKEY='beton09history';
// DOMINO: nowy lektor. Bez nagrań poprzedniego lektora.
const BOT={"start": "No i chuj zaś na tego pomarańczowego chuja", "depart": "Poszli w pizdu, waszmość!", "ask": "czy powrócił ten stożkowaty fiut?", "arrived": "I zaś trza lać kurwa mać", "late": "Pośpisz sie kurwysynie !", "remind": "Mości panie, czy nie przybywszy ta kurwa?", "added": "jee zaliczona szmata , waszmość!", "undo": "Cofnięto, jako waść rozkazał!", "low": "Hhaha Chuju już prawie koniec!", "finish": "Yupji auuuuuuuuuuuutomatycznie spierdalamy od tego chujostwa", "error": "Nie dosłyszałem, mości panie!", "left3": "Jeszcze 3 Kubiki tego gówna ", "left15": "połóweczka połóweczk haha", "left05": "jeszcze bombka i wyjazd"};
const BOT_LABELS={"start": "Rozpoczęcie betonowania", "depart": "Wyjazd kosza", "ask": "Pytanie o powrót", "arrived": "Odpowiedź — tak jest", "late": "Odpowiedź — nie ma", "remind": "Ponowne przypomnienie", "added": "Naliczenie betonu", "undo": "Cofnięcie porcji", "low": "Mało betonu", "finish": "Zakończenie betonowania", "error": "Błąd rozpoznania", "left3": "Pozostały 3 m³", "left15": "Pozostało 1,5 m³", "left05": "Pozostało 0,5 m³"};
let ttsVoiceName='';
function polishVoices(){return 'speechSynthesis' in window?window.speechSynthesis.getVoices().filter(v=>/^pl(?:-|$)/i.test(v.lang)):[]}
function updateVoices(){const el=$('ttsVoice');if(!el)return;const keep=el.value||ttsVoiceName;el.replaceChildren();const op=document.createElement('option');op.value='';op.textContent='Automatyczny polski głos';el.append(op);for(const v of polishVoices()){const o=document.createElement('option');o.value=v.voiceURI;o.textContent=v.name+' ('+v.lang+')';el.append(o)}if(Array.from(el.options).some(x=>x.value===keep))el.value=keep}
function playDomino(key){speakBot(BOT[key]||EXTRAS[key]||'Sprawdzenie lektora DOMINO',key)}
function speakBot(t,key){if(!$('ttsOn').checked||!('speechSynthesis' in window))return;
 try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='pl-PL';const name=$('ttsProfile')?.value||'domino';const cfg={normal:[.96,1],baca:[.84,.86],majster:[.9,.8],radio:[1.08,1.05],domino:[.94,.88]}[name]||[.94,.88];u.rate=cfg[0];u.pitch=cfg[1];u.voice=polishVoices().find(v=>v.voiceURI===$('ttsVoice').value)||polishVoices()[0]||null;window.speechSynthesis.speak(u);if($('dominoStatus'))$('dominoStatus').textContent='DOMINO: głos systemowy (własne nagrania nie zostały dodane).'}catch(e){console.warn('DOMINO TTS',e)} }
function showProfileInfo(){const domino=$('ttsProfile').value==='domino';$('voiceInfo').textContent=domino?'DOMINO: obecnie polski głos systemowy, nie klon ani nagranie DOMINO.':'Wybór głosu zależy od urządzenia.';showTtsState()}
function showTtsState(){$('ttsState').textContent=$('ttsOn').checked?'włączony — '+($('ttsProfile')?.selectedOptions?.[0]?.textContent||'DOMINO'):'wyłączony'}
$('ttsProfile').addEventListener('change',()=>{showProfileInfo();try{localStorage.setItem('beton_tts_profile',$('ttsProfile').value)}catch(e){}});
$('ttsOn').addEventListener('change',()=>{showTtsState();try{localStorage.setItem('beton_tts_enabled',$('ttsOn').checked?'1':'0')}catch(e){}});
$('ttsVoice').addEventListener('change',()=>{ttsVoiceName=$('ttsVoice').value;try{localStorage.setItem('beton_tts_voice',ttsVoiceName)}catch(e){}});
$('ttsTest').addEventListener('click',()=>{if(!$('ttsOn').checked){$('ttsOn').checked=true;showTtsState()}speakBot(BOT.ask,'ask')});
$('dominoTestDirect').addEventListener('click',()=>{if(!$('ttsOn').checked){$('ttsOn').checked=true;showTtsState()}speakBot(BOT.ask,'ask')});
try{$('ttsOn').checked=localStorage.getItem('beton_tts_enabled')!=='0';ttsVoiceName=localStorage.getItem('beton_tts_voice')||'';const saved=localStorage.getItem('beton_tts_profile');$('ttsProfile').value=saved==='stachu'||saved==='domino'||!saved?'domino':saved;$('notifyMode').value=localStorage.getItem('beton_notify_mode')||'full'}catch(e){}
$('notifyMode').addEventListener('change',()=>{try{localStorage.setItem('beton_notify_mode',$('notifyMode').value)}catch(e){}});
showProfileInfo();updateVoices();if('speechSynthesis' in window)window.speechSynthesis.onvoiceschanged=updateVoices;
function shortTextFor(key){const S={start:'Start betonowania',depart:'Kosz wyjechał',ask:'Czy kosz wrócił?',arrived:'Kosz jest',late:'Kosza jeszcze nie ma',remind:'Sprawdź powrót kosza',added:'Naliczono porcję',undo:'Cofnięto porcję',low:'Kończy się beton',finish:'Koniec betonowania',error:'Nie rozpoznano komendy',left3:'Zostały 3 m³',left15:'Zostało 1,5 m³',left05:'Zostało 0,5 m³'};return S[key]||BOT[key]||''}
function sayBot(key){const t=BOT[key]||'';const mode=$('notifyMode')?.value||'full';if($('botText'))$('botText').textContent=mode==='full'?t:shortTextFor(key);announce(mode==='full'?t:shortTextFor(key));if(mode==='sound'||mode==='short'){beep();return;}speakBot(t,key)}
Object.keys(BOT).forEach(key=>{let row=document.createElement('div');row.className='bot-line';let name=document.createElement('b'),msg=document.createElement('span'),btn=document.createElement('button');name.textContent=BOT_LABELS[key];msg.textContent=BOT[key];btn.textContent='▶ Odsłuch DOMINO';btn.type='button';btn.style.cssText='margin-top:6px;padding:8px 11px;font-size:12px';btn.addEventListener('click',()=>{if(!$('ttsOn').checked){$('ttsOn').checked=true;showTtsState()}playDomino(key)});row.append(name,msg,btn);$('botDictionary').append(row)});
const EXTRAS={reportLeft:'Zostało jeszcze tyle betonu, mości panie!',reportPoured:'Tyle już żeśmy wylali, kurwa jego mać!',capacityChanged:'Kosz ustawiony, waszmość!',portionChanged:'Dolewka zmieniona!',fullBucket:'Pełen kibel, jazda, ogień!',halfBucket:'Pół kibelka, panie!',micOn:'Mikrofon włączony!',historySaved:'Betonowanie zapisane do historii!',emptyBucket:'Kibel pusty, robota skończona!'};
Object.keys(EXTRAS).forEach(key=>{const row=document.createElement('div'),label=document.createElement('span'),btn=document.createElement('button');row.className='bot-line';label.textContent=EXTRAS[key];btn.textContent='▶ Odsłuch DOMINO';btn.type='button';btn.style.cssText='display:block;margin-top:6px;padding:8px 11px;font-size:12px';btn.addEventListener('click',()=>{if(!$('ttsOn').checked){$('ttsOn').checked=true;showTtsState()}playDomino(key)});row.append(label,btn);$('extraDictionary').append(row)});
let sound=null,session=null,archive=[],method='kibel',phase='ready',departed=0,deadline=0,alarmVisible=false,nextReminder=0,micWanted=false,micLive=false,recognition=null,voiceRetry=null,lastAddAt=0,lastDominoAt=0;
const CAPACITY_STEPS={0.5:0.1,0.75:0.05,1:0.1,1.5:0.1,0.05:0.01,0.06:0.01,0.08:0.01,0.1:0.01};
const fmt=n=>(Math.round(Number(n)*100)/100).toLocaleString('pl-PL',{maximumFractionDigits:2});
const number=x=>Number(String(x??'').replace(',','.').trim());
const dur=n=>{n=Math.max(0,Math.floor(Number(n)||0));return String(Math.floor(n/3600)).padStart(2,'0')+':'+String(Math.floor(n%3600/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
const shortDur=n=>{n=Math.max(0,Math.floor(Number(n)||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')};
const escapeHTML=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const entriesSum=()=>session?session.entries.reduce((s,x)=>s+Number(x.amount||0),0):0;
const left=()=>session?Math.max(0,Math.round((session.load-entriesSum())*100)/100):0;
const opts={kibel:[0.5,0.75,1,1.5],taczka:[0.05,0.06,0.08,0.1],inne:[0.25,0.5,0.75,1]};
const PROFILE_KEY='beton_bucket_profiles_18';
let profiles=[],bucketChoice='manual',chosenProfileId='';
try{const stored=JSON.parse(localStorage.getItem(PROFILE_KEY)||'[]');if(Array.isArray(stored))profiles=stored}catch(e){}
const getProfile=id=>profiles.find(p=>p.id===id)||null;
const SITE_BUCKET_KEY='beton_site_bucket_assignments_24';
let siteAssignments={};try{siteAssignments=JSON.parse(localStorage.getItem(SITE_BUCKET_KEY)||'{}')||{}}catch(e){}
const siteKey=t=>String(t||'').trim().toLocaleLowerCase('pl-PL').replace(/\s+/g,' ');
function storeSiteAssignments(){try{localStorage.setItem(SITE_BUCKET_KEY,JSON.stringify(siteAssignments))}catch(e){console.warn('site map',e)}}
function rememberSiteBucket(name,id){const k=siteKey(name);if(!k)return;siteAssignments[k]=id||'manual';storeSiteAssignments()}
function refreshKnownSites(){const list=$('knownSites');list.replaceChildren();const sites=new Set([...Object.keys(siteAssignments),...archive.map(s=>s.site||'').filter(Boolean)]);for(const site of sites){const el=document.createElement('option');el.value=site;list.append(el)}}
function restoreSiteBucket(){if(method==='taczka')return;const s=siteKey($('site').value);const id=siteAssignments[s];if(!id){$('autoBucketHint').textContent='Nowa budowa — wybierz profil ręcznie lub dodaj jego zdjęcia.';return}if(id==='manual'){$('autoBucketHint').textContent='Na tej budowie ostatnio używano ustawień ręcznych.';toggleBucketChoice('manual');return}const p=getProfile(id);if(!p)return;$('autoBucketHint').textContent='✅ Wczytano profil: '+p.name+' ('+fmt(p.capacity)+' m³).';toggleBucketChoice('photo');selectStoredBucket(p.id)}

function saveProfiles(){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profiles));return true}catch(e){$('photoError').textContent='Brak miejsca w pamięci przeglądarki. Spróbuj usunąć starszy profil.';return false}}
function toggleBucketChoice(choice){bucketChoice=choice;const photo=choice==='photo';$('chooseManual').classList.toggle('on',!photo);$('choosePhoto').classList.toggle('on',photo);$('photoControls').classList.toggle('hide',!photo);$('manualHelp').classList.toggle('hide',photo);$('presets').style.opacity=photo?'.45':'1';$('portion').readOnly=photo;if(photo&&getProfile(chosenProfileId))selectStoredBucket(chosenProfileId)}
function profileQuality(p){return p.verified?'Pojemność potwierdzona': 'Pojemność szacunkowa'}
function renderProfiles(){const el=$('savedBuckets');el.replaceChildren();const blank=document.createElement('option');blank.value='';blank.textContent='Wybierz profil…';el.append(blank);for(const p of profiles){const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.name+' · '+fmt(p.capacity)+' m³';el.append(opt)}if(getProfile(chosenProfileId))el.value=chosenProfileId;else el.value='';const p=getProfile(chosenProfileId);const photosEl=$('selectedBucketPhotos');photosEl.replaceChildren();if(p){for(const photo of (p.photos||[])){const img=document.createElement('img');img.src=photo.data;img.alt=photo.side;img.style.cssText='width:100%;max-height:115px;object-fit:cover;border-radius:10px;border:1px solid #607399';photosEl.append(img)}}$('selectedBucketInfo').textContent=p?`${profileQuality(p)} · ${p.photos?.length||0} zdjęć · ${p.dimensions?'wymiary wprowadzone':'podziałka orientacyjna'}`:'Wybierz profil albo utwórz nowy.'}
function selectStoredBucket(id){const p=getProfile(id);chosenProfileId=p?p.id:'';if(p){$('portion').value=fmt(p.capacity);renderPresets();}renderProfiles()}
function profileHeightFraction(f,p){f=Math.min(1,Math.max(0,Number(f)||0));if(p?.shape==='cylinder')return f;const bottom=Math.max(0.01,Number(p?.dimensions?.bottom)||40),top=Math.max(0.01,Number(p?.dimensions?.top)||75),delta=top-bottom;
 const integral=t=>bottom*bottom*t+bottom*delta*t*t+delta*delta*t*t*t/3;const target=f*integral(1);let lo=0,hi=1;for(let i=0;i<26;i++){let mid=(lo+hi)/2;if(integral(mid)<target)lo=mid;else hi=mid}return (lo+hi)/2}
function applyPhotoGeometry(p){return p&&p.shape?p:null}
function currentProfile(){return session&&session.bucketProfile?session.bucketProfile:null}
function viewProfile(p){if(!p)return;const cap=Number(p.capacity);const d=p.dimensions;const details=d?'Wymiary: '+d.top+' / '+d.bottom+' / '+d.height+' cm.':'Wymiary niepodane.';
 $('selectedBucketInfo').textContent=p.name+' · '+fmt(cap)+' m³ · '+profileQuality(p)+'. '+details;}
async function thumbFromFile(file){return new Promise((res,rej)=>{const reader=new FileReader();reader.onerror=()=>rej(new Error('Nie można wczytać zdjęcia'));reader.onload=()=>{const img=new Image();img.onerror=()=>rej(new Error('Nie można otworzyć zdjęcia'));img.onload=()=>{const c=document.createElement('canvas');const k=Math.min(1,440/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*k));c.height=Math.max(1,Math.round(img.height*k));c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.57))};img.src=reader.result};reader.readAsDataURL(file)})}
function dimensionsFromForm(){const a=number($('photoTopDiameter').value),b=number($('photoBottomDiameter').value),h=number($('photoHeight').value);const cylinder=$('photoShape').value==='cylinder';if(a>0&&h>0&&(cylinder||b>0))return {top:a,bottom:cylinder?a:b,height:h};return null}
function geometricCapacity(d){if(!d)return null;const a=d.top/100,b=d.bottom/100,h=d.height/100;return Math.PI*h*(a*a+a*b+b*b)/12}
function showGeometricCapacity(){const d=dimensionsFromForm(),v=geometricCapacity(d);const el=$('capacityPreview');if(v&&v>0){el.textContent='📐 Z wymiarów: około '+fmt(v)+' m³ (model geometryczny). '+(number($('photoCapacity').value)>0?'Wartość z tabliczki ma pierwszeństwo.':'Pojemność zostanie uzupełniona automatycznie przy zapisie.')}else{el.textContent='Podaj wymiary, aby obliczyć pojemność. Same zdjęcia nie wystarczą do wiarygodnego wyliczenia.'}}
for(const id of ['photoTopDiameter','photoBottomDiameter','photoHeight','photoShape','photoCapacity'])$(id).addEventListener(id==='photoShape'?'change':'input',showGeometricCapacity);
function applyProfileToSession(p){if(!session||session.method!=='kibel')return false;session.bucketProfile=p?{id:p.id,name:p.name,capacity:p.capacity,shape:p.shape,dimensions:p.dimensions,verified:p.verified}:null;if(p){session.capacity=p.capacity;session.dose=p.capacity;}remember();render();tick();announce(p?'Założono kosz '+p.name+' · '+fmt(p.capacity)+' m³':'Przełączono na ręczny kosz');return true}
function refreshLiveBuckets(){const el=$('liveBucketProfile');el.replaceChildren();const manual=document.createElement('option');manual.value='manual';manual.textContent='✋ Ręczny kosz';el.append(manual);for(const p of profiles){const opt=document.createElement('option');opt.value=p.id;opt.textContent='📸 '+p.name+' — '+fmt(p.capacity)+' m³';el.append(opt)}if(session){el.value=session.bucketProfile?.id||'manual'}}
$('liveBucketProfile').addEventListener('change',e=>{const p=getProfile(e.target.value);if(p){applyProfileToSession(p);chosenProfileId=p.id;bucketChoice='photo';rememberSiteBucket(session.site,p.id)}else{if(session?.bucketProfile){session.bucketProfile=null;remember();render();}rememberSiteBucket(session?.site,'manual')}refreshLiveBuckets()});
$('site').addEventListener('change',restoreSiteBucket);
$('site').addEventListener('blur',restoreSiteBucket);

async function createProfile(){
 const err=$('photoError');err.textContent='';
 const dimensions=dimensionsFromForm(),geo=geometricCapacity(dimensions),manual=number($('photoCapacity').value);
 const capacity=Number.isFinite(manual)&&manual>0?manual:geo;
 if(!Number.isFinite(capacity)||capacity<=0||capacity>5){err.textContent='Brak wiarygodnej pojemności. Wpisz wartość z tabliczki albo wymiary kosza (nie zgadujemy na podstawie samego zdjęcia).';return}
 const fields=[['front','photoFront'],['side','photoSide'],['top','photoTop'],['plate','photoPlate']],photos=[];
 for(const [side,id] of fields){const file=$(id).files?.[0];if(file){try{photos.push({side,data:await thumbFromFile(file)})}catch(e){err.textContent='Nie odczytano zdjęcia '+side;return}}}
 if(!photos.length){err.textContent='Dodaj przynajmniej jedno zdjęcie.';return}
 const p={id:'bucket-'+Date.now(),name:$('photoName').value.trim()||'Mój kosz',capacity:Math.round(capacity*100)/100,shape:$('photoShape').value,dimensions,verified:$('photoVerified').checked&&manual>0,photos,source:manual>0?'tabliczka/ręcznie':'geometria',createdAt:Date.now()};
 profiles.push(p);if(!saveProfiles()){profiles.pop();return}
 chosenProfileId=p.id;bucketChoice='photo';toggleBucketChoice('photo');selectStoredBucket(p.id);viewProfile(p);
 $('photoForm').classList.add('hide');$('portion').value=fmt(p.capacity);renderPresets();
 rememberSiteBucket($('site').value,p.id);refreshKnownSites();refreshLiveBuckets();
 if(session&&session.method==='kibel'){applyProfileToSession(p);rememberSiteBucket(session.site,p.id)}
 $('autoBucketHint').textContent='✅ Aktywny: '+p.name+' · '+fmt(p.capacity)+' m³ ('+(p.verified?'potwierdzono':'szacunkowo')+').';
 announce('Zapisano i ustawiono kosz: '+p.name);
}
$('chooseManual').addEventListener('click',()=>toggleBucketChoice('manual'));
$('choosePhoto').addEventListener('click',()=>toggleBucketChoice('photo'));
$('openPhotoForm').addEventListener('click',()=>{$('photoForm').classList.toggle('hide')});
$('savePhotoProfile').addEventListener('click',createProfile);
$('savedBuckets').addEventListener('change',e=>{selectStoredBucket(e.target.value);const p=getProfile(chosenProfileId);viewProfile(p);if(p){rememberSiteBucket($('site').value,p.id);$('autoBucketHint').textContent='✅ Zapisano profil '+p.name+' dla tej budowy.';if(session&&session.method==='kibel'){applyProfileToSession(p);rememberSiteBucket(session.site,p.id)}}});
$('bucketJsonImport').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;const status=$('bucketImportStatus');
 try{
  if(file.size>300000)throw Error('Profil jest zbyt duży');
  const raw=JSON.parse(await file.text()),a=raw.bucket||raw;
  const cap=Number(a.capacity),shape=a.shape==='cylinder'?'cylinder':'taper';
  if(!Number.isFinite(cap)||cap<=0||cap>5)throw Error('Brak poprawnej pojemności 0–5 m³');
  const d=a.dimensions;let dims=null;
  if(d&&[d.top,d.bottom,d.height].every(v=>Number.isFinite(Number(v))&&Number(v)>0&&Number(v)<1000))dims={top:Number(d.top),bottom:Number(d.bottom),height:Number(d.height)};
  const p={id:'bucket-'+Date.now(),name:String(a.name||'Kosz z analizy').slice(0,80),capacity:Math.round(cap*100)/100,shape,dimensions:dims,verified:a.verified===true,photos:[],source:'import ChatGPT'};
  profiles.push(p);if(!saveProfiles()){profiles.pop();throw Error('Brak miejsca na zapis profilu')}
  chosenProfileId=p.id;toggleBucketChoice('photo');selectStoredBucket(p.id);rememberSiteBucket($('site').value,p.id);refreshLiveBuckets();
  if(session&&session.method==='kibel'){applyProfileToSession(p);rememberSiteBucket(session.site,p.id)}
  status.textContent='✅ Zaimportowano i ustawiono '+p.name+' ('+fmt(p.capacity)+' m³).';
 }catch(err){status.textContent='❌ '+(err.message||err)}finally{e.target.value=''}
});
$('removePhotoProfile').addEventListener('click',()=>{if(!getProfile(chosenProfileId))return;if(!confirm('Usunąć zapisany profil kosza?'))return;profiles=profiles.filter(p=>p.id!==chosenProfileId);for(const [k,v] of Object.entries(siteAssignments)){if(v===chosenProfileId)delete siteAssignments[k]}storeSiteAssignments();chosenProfileId='';saveProfiles();renderProfiles();refreshLiveBuckets()});
renderProfiles();refreshKnownSites();showGeometricCapacity();

function announce(txt){const t=$('toast');t.textContent=txt;t.style.display='block';clearTimeout(announce.timeout);announce.timeout=setTimeout(()=>t.style.display='none',2300)}
function audio(name){if(name)playDomino(name)}
function beep(){try{let AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;let ctx=new AC();let o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=700;g.gain.setValueAtTime(.06,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.22);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.22);setTimeout(()=>ctx.close(),700)}catch(err){}}
function remember(){if(!session)return;Object.assign(session,{tripPhase:phase,departed,deadline,alarmVisible,nextReminder});try{localStorage.setItem(KEY,JSON.stringify(session))}catch(err){announce('Nie udało się zapisać — sprawdź wolne miejsce')}}
function storeHistory(){try{localStorage.setItem(HKEY,JSON.stringify(archive))}catch(err){announce('Nie udało się zapisać historii')}}
function tab(name){document.querySelectorAll('main section').forEach(el=>el.classList.toggle('hide',el.id!==name));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===name));if(name==='work'){render();tick()}if(name==='history')historyRender()}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));
function renderPresets(){const r=$('presets');r.replaceChildren();(opts[method]||[]).forEach(v=>{let b=document.createElement('button');b.type='button';b.textContent=fmt(v);b.className='pill '+(Math.abs(number($('portion').value)-v)<.0001?'on':'');b.addEventListener('click',()=>{$('portion').value=fmt(v);renderPresets()});r.append(b)})}
function bucketStep(cap){cap=Number(cap)||0.5;if(cap<=.1)return .01;if(cap<=.75)return .05;if(cap<=1.5)return .1;return .1}
function bucketMarks(cap){cap=Number(cap)||.5;const out=[];for(let i=1;i<=5;i++)out.push(Math.round(cap*i/5*100)/100);return out}
function bucketMarksLabel(cap){return 'Orientacyjnie: '+bucketMarks(cap).map(v=>fmt(v)+' m³').join(' · ')}
// Volume-to-height approximation for a truncated cone. Real bucket geometry must be calibrated for precision.
function volumeHeightRatio(frac){if(session?.bucketProfile)return profileHeightFraction(frac,session.bucketProfile);frac=Math.min(1,Math.max(0,Number(frac)||0));const r0=39,r1=73,dr=r1-r0;const integral=x=>r0*r0*x+r0*dr*x*x+dr*dr*x*x*x/3;const target=integral(1)*frac;let lo=0,hi=1;for(let i=0;i<24;i++){const m=(lo+hi)/2;if(integral(m)<target)lo=m;else hi=m}return (lo+hi)/2}
function makeBucketSvg(cap,current,kind='kibel'){cap=Math.max(0.01,Number(cap)||0.5);current=Math.min(cap,Math.max(0,Number(current)||0));const ratio=current/cap;const top=86,bottom=229,leftTop=92,leftBottom=126,rightTop=238,rightBottom=204;const fillY=bottom-(bottom-top)*volumeHeightRatio(ratio);function xAt(y,left){const t=(y-top)/(bottom-top);const a=left?leftTop:rightTop,b=left?leftBottom:rightBottom;return a+(b-a)*t}const xL=xAt(fillY,true),xR=xAt(fillY,false);const steps=bucketMarks(cap);let active=steps[0],best=Infinity;for(const v of steps){const d=Math.abs(v-current);if(d<best){best=d;active=v}}let marks='';for(const v of steps){const y=bottom-(bottom-top)*volumeHeightRatio(v/cap);const len=Math.abs(v-cap)<0.0001?30:22;const on=Math.abs(v-active)<0.0001;const stroke=on?'#8ce8ff':'#221c17';const fill=on?'#eefcff':'#1a1715';const sw=on?5:(Math.abs(v-cap)<0.0001?3.4:2.6);const tx=(252), ty=(y+4); if(on){marks += `<rect x="246" y="${(y-10).toFixed(1)}" rx="6" ry="6" width="68" height="18" fill="#14344a" opacity=".95" stroke="#8ce8ff" stroke-width="1.5"/>`;} marks += `<line x1="219" y1="${y.toFixed(1)}" x2="${219+len}" y2="${y.toFixed(1)}" stroke="${stroke}" stroke-width="${sw}" />`;marks += `<text x="${tx}" y="${ty.toFixed(1)}" font-size="12" font-weight="900" fill="${fill}">${fmt(v)}${Math.abs(v-cap)<0.0001?' (MAX)':''}</text>`;}return `<svg viewBox="0 0 330 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="orangeSteel2" x1="0" x2="1"><stop stop-color="#bc620f"/><stop offset=".28" stop-color="#f39a1d"/><stop offset=".62" stop-color="#ffb24c"/><stop offset="1" stop-color="#bc620f"/></linearGradient><linearGradient id="rim2" x1="0" x2="1"><stop stop-color="#1c2128"/><stop offset=".48" stop-color="#6f7683"/><stop offset="1" stop-color="#1f252d"/></linearGradient><clipPath id="bucketClip2"><path d="M92 86L238 86L204 229L126 229Z"/></clipPath></defs><path d="M95 82L124 21M235 82L206 21" stroke="#5d6570" stroke-width="12" stroke-linecap="round"/><path d="M119 22Q165 -4 211 22" fill="none" stroke="#9098a3" stroke-width="12"/><path d="M47 79Q165 60 283 79L259 218Q255 236 227 244L196 274H134L103 244Q75 236 71 218Z" fill="url(#orangeSteel2)" stroke="#22262b" stroke-width="7"/><path d="M42 81Q165 55 288 81" stroke="url(#rim2)" stroke-width="19" fill="none"/><path d="M76 95L104 234M254 95L226 234" stroke="#4c4340" stroke-width="8" opacity=".75"/><path d="M121 242L134 275H196L209 242" fill="#5d6570" stroke="#282a31" stroke-width="5"/><g clip-path="url(#bucketClip2)"><path d="M${xL.toFixed(1)} ${fillY.toFixed(1)}L${xR.toFixed(1)} ${fillY.toFixed(1)}L204 229L126 229Z" fill="#67d4ff" opacity=".88"/><path d="M${xL.toFixed(1)} ${(fillY-1).toFixed(1)}L${xR.toFixed(1)} ${(fillY-1).toFixed(1)}" stroke="#ffffff" stroke-width="5" opacity=".98"/></g><line x1="${(xL-5).toFixed(1)}" y1="${fillY.toFixed(1)}" x2="250" y2="${fillY.toFixed(1)}" stroke="#8ce8ff" stroke-width="2.2" stroke-dasharray="4 3" opacity=".95"/><g>${marks}</g><text x="165" y="172" text-anchor="middle" font-size="42" font-weight="950" fill="#171413">${fmt(current)}</text><text x="165" y="199" text-anchor="middle" font-size="20" font-weight="900" fill="#171413">z ${fmt(cap)} m³</text><path d="M101 105L111 197" stroke="#fff" stroke-width="9" opacity=".12"/></svg>`}
function selectMethod(m){method=m;document.querySelectorAll('[data-method]').forEach(b=>b.classList.toggle('on',b.dataset.method===m));$('batchFields').classList.toggle('hide',false);$('photoChoice').classList.toggle('hide',m==='taczka');$('otherFields').classList.toggle('hide',m!=='inne');$('cycleFields').classList.toggle('hide',false);if(m==='kibel')$('portion').value=fmt(.5);else if(m==='taczka')$('portion').value=fmt(.06);else $('portion').value=fmt(.5);renderPresets();restoreSiteBucket()}
document.querySelectorAll('[data-method]').forEach(b=>b.addEventListener('click',()=>selectMethod(b.dataset.method)));$('portion').addEventListener('input',renderPresets);
function meanTrip(){let arr=(session?.trips||[]).filter(x=>Number.isFinite(Number(x.seconds))&&x.seconds>0);if(!arr.length)return session?.cycle||120;return arr.slice(-5).reduce((s,v)=>s+Number(v.seconds),0)/Math.min(arr.length,5)}
function resetTrip(){phase='ready';departed=0;deadline=0;alarmVisible=false;nextReminder=0}
function start(){const p=((method==='kibel'||method==='inne')&&bucketChoice==='photo')?getProfile(chosenProfileId):null;const load=number($('load').value),dose=p?p.capacity:number($('portion').value),cycleMin=number($('cycleMin').value);$('error').textContent='';if((method==='kibel'||method==='inne')&&bucketChoice==='photo'&&!p){$('error').textContent='Wybierz zapisany profil albo przełącz na tryb ręczny.';return}if(!Number.isFinite(load)||load<=0||load>30)return $('error').textContent='Podaj załadunek, np. 7,5 m³.';
if(!Number.isFinite(dose)||dose<=0||dose>5)return $('error').textContent='Ustaw prawidłową porcję betonu.';
if(!Number.isFinite(cycleMin)||cycleMin<0.05||cycleMin>120)return $('error').textContent='Ustaw czas kursu w minutach, np. 2 lub 2,5.';
if(session&&!confirm('Zakończyć poprzednie betonowanie i rozpocząć nowe?'))return;
if(session)finishCurrent(false);resetTrip();lastAddAt=0;session={id:Date.now(),site:$('site').value.trim()||'Budowa bez nazwy',load,method,dose:dose,capacity:dose,bucketProfile:p?{id:p.id,name:p.name,capacity:p.capacity,shape:p.shape,dimensions:p.dimensions,verified:p.verified}:null,cycle:Math.round(cycleMin*60),startedAt:Date.now(),entries:[],trips:[],milestonesFired:{},sound:$('alarmOn').checked,confirm:$('confirmOn').checked};remember();if(method==='kibel'||method==='inne')rememberSiteBucket(session.site,p?p.id:'manual');refreshKnownSites();tab('work');sayBot('start');}
$('start').addEventListener('click',start);
function finishCurrent(showNotice=true){if(!session)return;const now=Date.now();archive.unshift({...session,endedAt:now,total:Math.round(entriesSum()*100)/100});storeHistory();session=null;resetTrip();try{localStorage.removeItem(KEY)}catch(err){}window.BKPnative?.cancel?.();if(showNotice){sayBot('finish')}}
$('finish').addEventListener('click',()=>{if(!session)return;if(!confirm('Zakończyć betonowanie i zapisać je w historii?'))return;finishCurrent();tab('history')});
$('new').addEventListener('click',()=>{if(session&&!confirm('Zakończyć aktualne betonowanie i rozpocząć nowe?'))return;finishCurrent(false);tab('setup')});
function depart(){if(!session||session.method==='taczka')return;if(phase==='away'||phase==='late')return announce('Kurs już jest w drodze');departed=Date.now();deadline=departed+meanTrip()*1000;phase='away';alarmVisible=false;nextReminder=0;remember();render();window.BKPnative?.schedule?.(deadline);sayBot('depart')}
function returned(){if(!session||session.method==='taczka')return;if(departed&&(phase==='away'||phase==='late')){const secs=Math.max(1,Math.round((Date.now()-departed)/1000));session.trips.push({seconds:secs,at:Date.now()})}departed=0;deadline=0;phase='returned';alarmVisible=false;nextReminder=0;remember();render();tick();window.BKPnative?.cancel?.();if(session.sound)beep();sayBot('arrived')}
function delay(){if(!session||session.method==='taczka')return;phase='late';alarmVisible=true;nextReminder=Date.now()+30000;deadline=nextReminder;remember();render();window.BKPnative?.schedule?.(nextReminder);sayBot('late')}
window.addEventListener('bkp:notification-action',e=>{const a=e.detail?.action;if(a==='ARRIVED')returned();else if(a==='LATER')delay()});
$('depart').addEventListener('click',depart);$('returned').addEventListener('click',returned);$('arrived').addEventListener('click',returned);$('late').addEventListener('click',delay);
function add(value){if(!session)return announce('Najpierw rozpocznij betonowanie');const raw=Number(value);if(!Number.isFinite(raw)||raw<=0)return announce('Suwakiem ustaw więcej niż 0 m³');const requested=Math.round(raw*100)/100;if(requested<=0)return announce('Porcja jest zbyt mała');const before=left();if(before<=0)return announce('Cały beton już naliczony — pozostało 0 m³');const amount=Math.min(requested,Math.round(before*100)/100);const now=Date.now();if(now-lastAddAt<380)return announce('Poczekaj moment, aby nie policzyć podwójnie');lastAddAt=now;
const prevState={tripPhase:phase,departed,deadline,alarmVisible,nextReminder};const prevMilestones={...(session.milestonesFired||{})};if(session.method!=='taczka'){
if(departed&&(phase==='away'||phase==='late'))session.trips.push({seconds:Math.max(1,Math.round((now-departed)/1000)),at:now});
if(amount>=before-0.00001){resetTrip();window.BKPnative?.cancel?.()}else{departed=now;deadline=now+meanTrip()*1000;phase='away';alarmVisible=false;nextReminder=0;}
}
session.entries.push({amount,at:now,prevState,prevMilestones});const remaining=left();session.milestonesFired=session.milestonesFired||{};
const reached=[{threshold:3,key:'left3'},{threshold:1.5,key:'left15'},{threshold:.5,key:'left05'}].filter(m=>before>m.threshold+0.00001&&remaining>0&&remaining<=m.threshold+0.00001&&!session.milestonesFired[m.key]);for(const m of reached)session.milestonesFired[m.key]=true;
remember();render();tick();if(session.confirm)beep();sayBot('added');if(requested>amount+0.00001)announce('Ostatnia porcja: '+fmt(amount)+' m³ — zostało 0 m³');const note=reached.length?reached[reached.length-1].key:null;const jobId=session.id;if(note)setTimeout(()=>{if(session?.id===jobId)sayBot(note)},1900);else if(remaining>0&&remaining<=Math.max(.5,session.load*.15)&&!session.milestonesFired.low){session.milestonesFired.low=true;remember();setTimeout(()=>{if(session?.id===jobId)sayBot('low')},1900)}
}
$('bucket').addEventListener('click',()=>add(session?.dose));$('pumpAdd').addEventListener('click',()=>add(number($('pumpAmount').value)));
function undo(){if(!session?.entries?.length)return announce('Nie ma czego cofnąć');let last=session.entries.pop();if(last.prevMilestones)session.milestonesFired={...last.prevMilestones};if(session.method!=='taczka'){
let p=last.prevState;if(p){phase=p.tripPhase;departed=p.departed;deadline=p.deadline;alarmVisible=p.alarmVisible;nextReminder=p.nextReminder}else{resetTrip()}
// If this entry implicitly ended a trip, undo that trip measurement too.
if(departed&&session.trips.length&&session.trips.at(-1).at===last.at)session.trips.pop();
}
remember();render();tick();sayBot('undo')}
$('undo').addEventListener('click',undo);$('pumpUndo').addEventListener('click',undo);
function changeDose(v,quiet=false){if(!session)return;const n=Math.round(Number(v)*100)/100;const cap=Number(session.capacity||session.dose||.5);if(!Number.isFinite(n)||n<0||n>5)return announce('Podaj ilość od zera do 5 m³');session.dose=Math.max(0,Math.min(n,cap));remember();render();if(!quiet)announce('Ustawiono '+fmt(session.dose)+' m³')}
function changeCapacity(v,alsoFill=true){if(!session)return;const n=Math.round(Number(v)*100)/100;if(!Number.isFinite(n)||n<=0||n>5)return;session.capacity=n;if(alsoFill||Number(session.dose||0)>n)session.dose=n;remember();render();announce('Kosz ustawiony na '+fmt(n)+' m³');if($('ttsOn').checked&&$('ttsProfile').value==='domino')playDomino('capacityChanged')}
$('less').addEventListener('click',()=>{if(!session)return;changeDose(Math.max(0,Number(session.dose||0)-bucketStep(session.capacity)))});
$('more').addEventListener('click',()=>{if(!session)return;changeDose(Math.min(session.capacity,Number(session.dose||0)+bucketStep(session.capacity)))});
$('setManual').addEventListener('click',()=>{changeDose(number($('manual').value));$('manual').value='';if($('ttsOn').checked&&$('ttsProfile').value==='domino')playDomino('portionChanged')});
$('bucketRange').addEventListener('input',e=>changeDose(number(e.target.value),true));
$('bucketRange').addEventListener('change',e=>changeDose(number(e.target.value),true));
function triggerAlarm(force=false){if(!session||session.method==='taczka')return;if(alarmVisible&&!force)return;phase='late';alarmVisible=true;nextReminder=Date.now()+30000;deadline=nextReminder;remember();render();if(session.sound)beep();sayBot('ask');const msg=$('alarmAudioStatus');if(msg)msg.textContent=document.hidden?'⚠️ Strona była w tle; iPhone mógł wyciszyć przypomnienie.':'🔊 Przypomnienie aktywne — sprawdź, czy DOMINO jest słyszalny.';}
$('testAlarm').addEventListener('click',()=>{if(!session)return announce('Najpierw rozpocznij betonowanie');triggerAlarm(true)});
function render(){if(!session)return;refreshLiveBuckets();let s=session;if(!s.capacity)s.capacity=s.dose||0.5;$('siteName').textContent=s.site;$('modeLabel').textContent={kibel:'KIBEL',taczka:'TACZKA',inne:'INNE'}[s.method];$('loaded').textContent=fmt(s.load);$('poured').textContent=fmt(entriesSum());$('left').textContent=fmt(left());$('progress').style.width=Math.min(100,100*entriesSum()/s.load)+'%';$('dose').textContent=fmt(s.dose||0);$('bucketCap').textContent=fmt(s.capacity||s.dose||0);$('activeBucketBadge').textContent=s.bucketProfile?'📸 '+s.bucketProfile.name+' · '+(s.bucketProfile.verified?'pojemność potwierdzona':'pojemność szacunkowa'):'✋ Kosz manualny · podziałka orientacyjna';$('bucketNow').textContent=fmt(s.dose||0);$('bucketRange').max=String(s.capacity||0.5);$('bucketRange').step=String(bucketStep(s.capacity||0.5));$('bucketRange').value=String(s.dose??0);$('less').textContent='− '+fmt(bucketStep(s.capacity||.5));$('more').textContent='+ '+fmt(bucketStep(s.capacity||.5));$('bucketSvgWrap').innerHTML=makeBucketSvg(s.capacity||.5,s.dose??0,s.method);$('bucketMarksText').textContent=bucketMarksLabel(s.capacity||s.dose||0.5);$('bucketPanel').classList.toggle('hide',false);$('travelPanel').classList.toggle('hide',s.method==='taczka');$('alert').classList.toggle('hide',!alarmVisible);
$('touchText').textContent=s.method==='taczka'?'DOTKNIJ, ABY DODAĆ TACZKĘ':(s.method==='inne'?'DOTKNIJ, ABY DODAĆ USTAWIONĄ ILOŚĆ DO INNEGO SPRZĘTU':'DOTKNIJ KOSZA, ABY DODAĆ USTAWIONĄ ILOŚĆ');$('bucket').setAttribute('aria-label','Dodaj '+fmt(s.dose)+' m³ z kosza '+fmt(s.capacity||s.dose)+' m³');
let q=$('quick');q.replaceChildren();(opts[s.method]||[]).forEach(v=>{let b=document.createElement('button');b.className='pill '+(Math.abs(v-(s.capacity||s.dose))<.0001?'on':'');b.textContent=(s.method==='taczka'?'Taczka ':(s.method==='inne'?'Profil ':'Kosz '))+fmt(v);b.addEventListener('click',()=>{if(session){session.bucketProfile=null;rememberSiteBucket(session.site,'manual')}changeCapacity(v,true)});q.append(b)});
$('status').textContent=s.method==='inne'?'Rozładunek na inny sprzęt — ustaw ilość i licz kursy jak przy koszu':s.method==='taczka'?'Taczka — ustaw ilość i dodawaj ręcznie':phase==='away'?'Kosz w drodze — trwa pomiar':phase==='late'?'Kosz się spóźnia — sprawdź powrót':phase==='returned'?'Kosz wrócił — ustaw ile wlano i kliknij kosz':'Gotowy — ustaw pojemność i ile wlano';$('entries').innerHTML=s.entries.length?s.entries.slice().reverse().map(e=>'<div class="history-entry"><span>'+new Date(e.at).toLocaleTimeString('pl-PL')+'</span><strong>+'+fmt(e.amount)+' m³</strong></div>').join(''):'<div class="help">Brak dolewek</div>';
}
function tick(){if(!session)return;const s=session,now=Date.now(),avg=meanTrip();$('elapsed').textContent=dur((now-s.startedAt)/1000);$('avg').textContent=s.method==='taczka'?'—':s.trips?.length?shortDur(avg):'—';$('timer').textContent=s.method==='taczka'?'—':phase==='away'||phase==='late'?shortDur((deadline-now)/1000):'—';let secs;{let remaining=left(),count=remaining>0?Math.ceil(remaining/Math.max(.01,s.dose||s.capacity||.5)):0;secs=count===0?0:(phase==='away'&&deadline>now?Math.max(0,(deadline-now)/1000):avg)+(count-1)*avg;}let eta=new Date(now+secs*1000);$('eta').textContent=left()===0?'Zrobione':Number.isFinite(secs)?eta.toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'}):'—';if($('pumpEst'))$('pumpEst').textContent=s.method==='inne'?'Prognoza końca opiera się na średnim czasie kursu i aktualnej porcji.':'';
if(s.method!=='taczka'&&phase==='away'&&deadline&&now>=deadline)triggerAlarm();else if(s.method!=='taczka'&&phase==='late'&&alarmVisible&&now>=nextReminder){nextReminder=now+30000;deadline=nextReminder;remember();if(s.sound)beep();sayBot('remind')}
}
function historyRender(){let r=$('historyRows');if(!archive.length){r.innerHTML='<p class="help">Jeszcze nie masz zakończonych betonowań.</p>';return}r.innerHTML='<table><thead><tr><th>Data i budowa</th><th>Wylano</th><th>Czas</th></tr></thead><tbody>'+archive.map(s=>'<tr><td><strong>'+escapeHTML(s.site||'Budowa')+'</strong><br><span class="help">'+new Date(s.startedAt).toLocaleDateString('pl-PL')+' · '+escapeHTML(s.method||'kibel')+'</span></td><td>'+fmt(s.total??(s.entries||[]).reduce((a,b)=>a+Number(b.amount||0),0))+' m³</td><td>'+dur(((s.endedAt||Date.now())-s.startedAt)/1000)+'</td></tr>').join('')+'</tbody></table>'}
$('export').addEventListener('click',()=>{let rows=['Data;Budowa;Metoda;Załadowano_m3;Wylano_m3;Czas_s',...archive.map(s=>[new Date(s.startedAt).toLocaleString('pl-PL'),s.site,s.method,s.load,s.total,Math.round((s.endedAt-s.startedAt)/1000)].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';'))];let blob=new Blob(['\ufeff'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'});let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='BetonKibelPlus_historia.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000)});
$('sample2').addEventListener('click',()=>playDomino('ask'));$('sampleWarm').addEventListener('click',()=>playDomino('arrived'));
// Safari does not consistently support continuous recognition. We show the actual microphone state and transcript.
const SpeechRec=window.SpeechRecognition||window.webkitSpeechRecognition;
function normalise(t){return t.toLowerCase().replace(/ł/g,'l').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/(\d)[,.](\d)/g,'$1.$2').replace(/[^a-z0-9.\s]/g,' ').replace(/\s+/g,' ').trim()}
function spokenNumber(t){const match=t.match(/\b(\d+(?:\.\d{1,2})?)\b/);if(match)return Number(match[1]);if(/\b(jeden i pol|poltora)\b/.test(t))return 1.5;if(/\b(trzy czwarte)\b/.test(t))return .75;if(/\b(pol|polowa|poloweczka)\b/.test(t))return .5;if(/\b(cwierc)\b/.test(t))return .25;
const dict={zero:0,jeden:1,jedna:1,jedno:1,dwa:2,dwie:2,trzy:3,cztery:4,piec:5,szesc:6,siedem:7,osiem:8,dziewiec:9};let tokens=t.split(/\s+/).filter(x=>Object.prototype.hasOwnProperty.call(dict,x)||x==='przecinek');let comma=tokens.indexOf('przecinek');if(comma>=0){let head=tokens.slice(0,comma).map(x=>dict[x]).join('')||'0';let tail=tokens.slice(comma+1).map(x=>dict[x]).join('');if(tail)return Number(head+'.'+tail)}
if(tokens.length>=2&&tokens[0]==='zero'){return Number('0.'+tokens.slice(1).map(x=>dict[x]).join(''))}if(tokens.length===1)return dict[tokens[0]];return NaN}
function voiceReport(text,key){announce(text);if($('ttsOn').checked)speakBot(text,key)}
function command(utterance){let t=normalise(utterance);if(!t)return false;
if(/\b(nie ma|jeszcze nie|nie wrocil|nie przyjechal|nie jest|nie ma go)\b/.test(t)){delay();return true}
if(/\b(tak|juz jest|kosz jest|kibel jest|kosz wrocil|kibel wrocil|wrocil|przyjechal)\b/.test(t)){returned();return true}
if(/\b(cofnij|anuluj ostatni|usun ostatni)\b/.test(t)){undo();return true}
if(/\b(ile zostalo|ile betonu zostalo|stan betonu)\b/.test(t)){voiceReport('Zostało '+fmt(left())+' metra sześciennego betonu','reportLeft');return true}
if(/\b(ile wylano|ile juz wylano|ile nalano)\b/.test(t)){voiceReport('Wylano '+fmt(entriesSum())+' metra sześciennego betonu','reportPoured');return true}
if(/\b(ile czasu|czas betonowania|jak dlugo lejemy)\b/.test(t)){voiceReport('Betonowanie trwa '+shortDur((Date.now()-(session?.startedAt||Date.now()))/1000)+' minuty');return true}
if(/\b(wyjechal|ruszyl|kosz wyjechal|kibel wyjechal)\b/.test(t)){depart();return true}
if(/\b(pelny kosz|pelny kibel|do pelna|pelna taczka)\b/.test(t)){if(session){changeDose(session.capacity);if($('ttsProfile').value==='domino'&&$('ttsOn').checked)playDomino('fullBucket')}return true}
if(/\b(pol kosza|pol kibla|polowa kosza|polowa kibla|pol taczki)\b/.test(t)){if(session){changeDose(session.capacity/2);if($('ttsProfile').value==='domino'&&$('ttsOn').checked)playDomino('halfBucket')}return true}
if(/\b(ustaw kosz|zmien kosz|kosz [0-9]|kibel [0-9]|pojemnosc kosza|pojemnosc kibla)\b/.test(t)){const n=spokenNumber(t);if(Number.isFinite(n)&&n>0&&n<=5){changeCapacity(n,true);return true}return false}
if(/\b(ustaw porcje|zmien porcje|leje |wlewam |ustaw ile|porcja [0-9])\b/.test(t)){const n=spokenNumber(t);if(Number.isFinite(n)&&n>=0){changeDose(n);return true}return false}
if(/\b(dodaj|nalicz|dolej|dodaj kibel|dodaj kosz)\b/.test(t)){add(session?.dose);return true}
return false}
function micDisplay(t){$('micStatus').textContent=t;$('mic').textContent=micWanted?'⏹ Wyłącz mikrofon':'🎙️ Włącz mikrofon'}
function stopMic(){micWanted=false;micLive=false;clearTimeout(voiceRetry);try{recognition?.abort()}catch(err){}micDisplay('Mikrofon wyłączony')}
function bootRecognition(){if(!micWanted||document.hidden)return;if(!SpeechRec){stopMic();micDisplay('Safari nie udostępnia tu rozpoznawania mowy. Użyj przycisków lub testu komend.');return}
try{recognition=new SpeechRec();recognition.lang='pl-PL';recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=1;
recognition.onstart=()=>{micLive=true;micDisplay('🟢 Słucham… Powiedz: „dodaj kibel”, „ustaw porcję 0,35”, „tak jest”')};
recognition.onresult=e=>{let t=e.results[e.resultIndex][0].transcript;micDisplay('Usłyszano: '+t);if(!command(t))sayBot('error')};
recognition.onerror=e=>{micLive=false;let err=e.error;if(err==='not-allowed'||err==='service-not-allowed'){stopMic();micDisplay('❌ Brak zgody na mikrofon. Sprawdź uprawnienia Safari.')}
else if(err==='network'){stopMic();micDisplay('❌ Rozpoznawanie głosu jest niedostępne — sprawdź internet / Safari.')}
else if(err!=='no-speech'&&err!=='aborted'){micDisplay('Błąd mikrofonu: '+err)}};
recognition.onend=()=>{micLive=false;if(micWanted&&!document.hidden){clearTimeout(voiceRetry);voiceRetry=setTimeout(bootRecognition,950)}};
recognition.start();}catch(e){micDisplay('Nie mogę uruchomić mikrofonu: '+(e.message||e));stopMic()}}
$('mic').addEventListener('click',()=>{if(micWanted){stopMic();return}if(!SpeechRec)return micDisplay('❌ Ta wersja Safari nie udostępnia rozpoznawania mowy. Mikrofon nie będzie działał głosowo; przyciski pozostają dostępne.');if(!window.isSecureContext)return micDisplay('❌ Mikrofon wymaga HTTPS. Otwórz aplikację przez hosting.');micWanted=true;micDisplay('Prośba o dostęp do mikrofonu…');bootRecognition()});
$('runCommand').addEventListener('click',()=>{let phrase=$('commandTest').value;if(!command(phrase))sayBot('error');else $('micStatus').textContent='Test komendy: '+phrase});
document.addEventListener('visibilitychange',()=>{
  const msg=$('foregroundStatus');
  if(document.hidden){if(micWanted){stopMic();micDisplay('Mikrofon zatrzymany przez iOS — wróć do aplikacji i włącz ponownie.')}}
  else { if(msg)msg.textContent='🟢 Aplikacja aktywna. Alarmy głosowe działają tylko, gdy iOS pozwala na odtwarzanie.'; tick();
    if(session&&session.method!=='taczka'&&(phase==='away'||phase==='late')&&Date.now()>=deadline){
      if(phase==='away')triggerAlarm(); else if(alarmVisible){nextReminder=Date.now()+30000;deadline=nextReminder;remember();render();sayBot('remind');}
    }
  }
});

try{let h=JSON.parse(localStorage.getItem(HKEY)||'[]');if(Array.isArray(h))archive=h;let old=JSON.parse(localStorage.getItem(KEY)||'null');if(old&&old.startedAt&&Array.isArray(old.entries)){session=old;if(!session.capacity)session.capacity=session.dose||0.5;phase=old.tripPhase||'ready';departed=Number(old.departed||0);deadline=Number(old.deadline||0);alarmVisible=!!old.alarmVisible;nextReminder=Number(old.nextReminder||0)}}catch(e){console.warn('Nie udało się odtworzyć danych:',e)}
selectMethod('kibel');if(session)tab('work');else tab('setup');refreshLiveBuckets();refreshKnownSites();setInterval(tick,500);


(function(){
  const savedKeys=['beton09','beton09history','beton_bucket_profiles_18','beton_site_bucket_assignments_24','beton_tts_enabled','beton_tts_voice','beton_tts_profile'];
  const exportEl=document.getElementById('backupExport');
  const importEl=document.getElementById('backupImport');
  if(exportEl)exportEl.addEventListener('click',()=>{
    const payload={app:'BetonKibelPlus',formatVersion:1,exportedAt:new Date().toISOString(),values:{}};
    for(const key of savedKeys){const v=localStorage.getItem(key);if(v!==null)payload.values[key]=v;}
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='BetonKibelPlus_kopia_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
  });
  if(importEl)importEl.addEventListener('change',async()=>{
    const f=importEl.files?.[0];if(!f)return;
    try{
      if(f.size>12000000)throw new Error('Plik jest zbyt duży (maks. 12 MB).');
      const data=JSON.parse(await f.text());
      if(!['Beton Licznik','BetonKibelPlus'].includes(data.app)||data.formatVersion!==1||!data.values||typeof data.values!=='object')throw new Error('To nie jest poprawna kopia BetonKibelPlus.');
      const entries=Object.entries(data.values);
      if(entries.some(([k,v])=>!savedKeys.includes(k)||typeof v!=='string'))throw new Error('Kopia zawiera nieznane dane.');
      if(!confirm('Przywrócić kopię? Zastąpi to aktualną historię, rozpoczęte betonowanie i profile koszy.'))return;
      for(const k of savedKeys)localStorage.removeItem(k);
      for(const [k,v] of entries)localStorage.setItem(k,v);
      location.reload();
    }catch(e){alert('Nie udało się przywrócić: '+(e.message||e));}
    finally{importEl.value='';}
  });
  let pendingInstall=null;
  const info=document.getElementById('installInfo'),help=document.getElementById('installHelp'),install=document.getElementById('installApp'),dismiss=document.getElementById('dismissInstall');
  const standalone=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const hideInstall=()=>{if(info)info.style.display='none';};
  let installDismissed=false;try{installDismissed=sessionStorage.getItem('beton_install_dismiss')==='1';}catch(e){}
  if(!standalone && !installDismissed){
    info.style.display='block';
    help.textContent=isIOS?'Na iPhonie: otwórz stronę w Safari → Udostępnij → Dodaj do ekranu początkowego → Dodaj.':'Zainstaluj aplikację z przeglądarki i uruchamiaj ją jak zwykłą aplikację.';
  }
  dismiss?.addEventListener('click',()=>{try{sessionStorage.setItem('beton_install_dismiss','1');}catch(e){}hideInstall();});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pendingInstall=e;install.style.display='block';if(info)info.style.display='block';});
  install?.addEventListener('click',async()=>{if(!pendingInstall)return;pendingInstall.prompt();try{await pendingInstall.userChoice;}catch(e){}pendingInstall=null;install.style.display='none';});
  window.addEventListener('appinstalled',hideInstall);
  if(!window.Capacitor?.isNativePlatform?.() && 'serviceWorker' in navigator && window.isSecureContext){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.warn('Offline cache:',e)));}
})();

// 2.1: widoczna pod ręką ściąga wszystkich OBSŁUGIWANYCH poleceń
(function(){
 const guide=document.getElementById('voiceGuideOverlay');
 const content=document.getElementById('voiceGuideContent');
 if(!guide||!content)return;
 const sections=[
  ['Naliczanie',[['Dodaj kibel','Dolicza porcję z suwaka'],['Cofnij','Cofa ostatnią dolewkę'],['Ile zostało?','Podaje pozostałe m³'],['Ile wylano?','Podaje naliczoną ilość'],['Ile czasu?','Podaje czas betonowania']]],
  ['Pojemność i porcja',[['Kosz 0,5','Wybiera kibel 0,5 m³'],['Kosz 0,75','Wybiera kibel 0,75 m³'],['Kosz 1','Wybiera kibel 1 m³'],['Kosz 1,5','Wybiera kibel 1,5 m³'],['Ustaw porcję 0,35','Ustawia nalanie na 0,35 m³'],['Pełny kosz','Ustawia maksymalną ilość'],['Pół kosza','Ustawia połowę pojemności']]],
  ['Kurs kosza',[['Kosz wyjechał','Rozpoczyna pomiar czasu'],['Tak, jest','Zapisuje powrót bez naliczania'],['Nie, nie ma','Ponowne przypomnienie za 30 sekund']]]
 ];
 for(const [heading,items] of sections){
  const group=document.createElement('div');group.className='guide-group';
  const h=document.createElement('h3');h.textContent=heading;group.appendChild(h);
  for(const [spoken,description] of items){const row=document.createElement('div');row.className='guide-entry';const a=document.createElement('strong');a.textContent='„'+spoken+'”';const b=document.createElement('small');b.textContent=description;row.append(a,b);group.appendChild(row)}
  content.appendChild(group);
 }
 let opener=null;
 function close(){guide.hidden=true;document.body.style.overflow='';opener?.focus()}
 function open(){opener=document.activeElement;guide.hidden=false;document.body.style.overflow='hidden';guide.querySelector('.guide-sheet').focus()}
 document.getElementById('openVoiceGuide')?.addEventListener('click',open);
 document.getElementById('voiceGuideClose')?.addEventListener('click',close);
 document.getElementById('voiceGuideDone')?.addEventListener('click',close);
 document.getElementById('voiceGuideBackdrop')?.addEventListener('click',close);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!guide.hidden)close()});
})();

// Bęben — wizualny podgląd poziomów; nie jest miarą fabryczną.
(function(){
 const slider=document.getElementById('drumRange');
 if(!slider)return;
 const fill=document.getElementById('drumFill');
 const line=document.getElementById('drumActiveLine');
 const dot=document.getElementById('drumActiveDot');
 const label=document.getElementById('drumValue');
 const marks=[...document.querySelectorAll('.drum-mark')];
 const pills=[...document.querySelectorAll('[data-drum-value]')];
 const fmtV=x=>Number(x).toLocaleString('pl-PL',{maximumFractionDigits:1})+' m³';
 function draw(x){
  x=Math.max(0,Math.min(3,Math.round(Number(x)*2)/2));
  slider.value=x;
  label.textContent=fmtV(x);
  const y=345-(x/3)*245;
  fill.setAttribute('y',String(y)); fill.setAttribute('height',String(Math.max(0,345-y)));
  line.setAttribute('d',`M79 ${y} H288`);dot.setAttribute('cy',String(y));
  for(const el of marks){const a=Number(el.dataset.value)===x;el.classList.toggle('active',a);el.classList.toggle('dim',!a)}
  for(const btn of pills)btn.classList.toggle('on',Number(btn.dataset.drumValue)===x);
 }
 slider.addEventListener('input',()=>draw(slider.value));
 for(const el of marks){el.addEventListener('click',()=>draw(el.dataset.value));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();draw(el.dataset.value)}})}
 for(const btn of pills)btn.addEventListener('click',()=>draw(btn.dataset.drumValue));
 draw(1.5);
})();
