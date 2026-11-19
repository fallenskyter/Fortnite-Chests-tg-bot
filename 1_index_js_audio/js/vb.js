
(function(){
"use strict";
function OC(){return window.boxCost?window.boxCost():50}
var START=5000,KEY="fnwallet",MAXV=1e15;
var UPS=[
{id:"u1",n:"Улучшенный клик",p:250,b:1,c:"#5fbf2a",d:"Прокачай палец: каждый тап приносит больше V-Bucks."},
{id:"u2",n:"Суперклик",p:1500,b:3,c:"#2fa5f0",d:"Мощный удар по иконке — заметный прирост за клик."},
{id:"u3",n:"Мегаклик",p:8000,b:8,c:"#b45cf5",d:"Серьёзный буст для настоящих фармеров V-Bucks."},
{id:"u4",n:"Ультраклик",p:40000,b:25,c:"#f5a623",d:"Каждое нажатие — как вскрытие целого хранилища."},
{id:"u5",n:"Бог кликера",p:200000,b:80,c:"#ffc400",d:"Легендарная мощь. V-Bucks льются рекой."}];
var FARMS=[
{id:"f1",n:"Скин-фермер",r:1,p:500,c:"#5fbf2a",d:"Тихо фармит V-Bucks за тебя."},
{id:"f2",n:"Добытчик",r:4,p:4000,c:"#2fa5f0",d:"Копает V-Bucks без перерыва."},
{id:"f3",n:"Хранилище",r:20,p:30000,c:"#b45cf5",d:"Целое хранилище, которое работает на тебя."},
{id:"f4",n:"Фабрика V-Bucks",r:100,p:250000,c:"#ffc400",d:"Промышленные объёмы V-Bucks."}];
var W={vb:START,ups:[],farms:{}},fresh=false,lock=false,lock2=false,tt,sv,combo=0,lastTap=0,lastTing=0,SOUND=true;
try{SOUND=localStorage.getItem("fnclick")!=="0"}catch(e){}
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
function fmt(n){return n.toLocaleString("ru-RU")}
function has(id){return W.ups.indexOf(id)>-1}
function fcount(id){return W.farms[id]||0}
function fcost(f){return Math.ceil(f.p*Math.pow(1.3,fcount(f.id))-1e-6)}
function cpc(){var s=1;UPS.forEach(function(u){if(has(u.id))s+=u.b});return s}
function aps(){var s=0;FARMS.forEach(function(f){s+=f.r*fcount(f.id)});return s}
function flush(){try{localStorage.setItem(KEY,JSON.stringify({v:2,vb:W.vb,cpc:cpc(),aps:aps(),ups:W.ups,farms:W.farms}))}catch(e){}}
function saveSoon(){clearTimeout(sv);sv=setTimeout(flush,300)}
function load(){var raw=null,o=null;
 try{raw=localStorage.getItem(KEY)}catch(e){}
 try{o=raw?JSON.parse(raw):null}catch(e){o=null}
 if(o&&typeof o==="object"){
  var v=Number(o.vb);W.vb=isFinite(v)&&v>0?Math.min(Math.floor(v),MAXV):0;
  W.ups=(Array.isArray(o.ups)?o.ups:[]).filter(function(id,i,a){return UPS.some(function(u){return u.id===id})&&a.indexOf(id)===i});
  W.farms={};var fo=o.farms&&typeof o.farms==="object"?o.farms:{};
  FARMS.forEach(function(f){var n=Math.floor(Number(fo[f.id]));if(isFinite(n)&&n>0)W.farms[f.id]=Math.min(n,9999)});
 }else{W={vb:START,ups:[],farms:{}};fresh=true;flush()}
}
function anim(el,c){el.classList.remove(c);void el.offsetWidth;el.classList.add(c)}
function hideT(){$("toast").classList.remove("show")}
function toast(msg,kind,act){var T=$("toast");T.className="";T.innerHTML="";
 var s=document.createElement("span");s.textContent=msg;T.appendChild(s);
 if(act){var b=document.createElement("button");b.className="tbtn";b.textContent=act.t;b.onclick=function(){hideT();act.f()};T.appendChild(b)}
 void T.offsetWidth;T.classList.add("show",kind||"good");clearTimeout(tt);tt=setTimeout(hideT,act?4500:2600)}
var ICON='<svg class="vi" aria-hidden="true"><use href="#vb"/></svg>';
function buildShop(){
 $("shop").innerHTML=UPS.map(function(u){
 return '<div class="up" id="up_'+u.id+'" style="--rc:'+u.c+'"><div class="uh"><div class="un">'+u.n+'</div><div class="ub">+'+u.b+' за клик</div></div>'
 +'<div class="ud">'+u.d+'</div><div class="ucur"></div>'
 +'<div class="uf"><div class="uprice">'+ICON+'<span>'+fmt(u.p)+'</span></div><button class="ubuy" data-id="'+u.id+'"></button></div></div>'}).join("");
 $("farm").innerHTML=FARMS.map(function(f){
 return '<div class="up" id="fm_'+f.id+'" style="--rc:'+f.c+'"><div class="uh"><div class="un">'+f.n+'</div><div class="ub">+'+fmt(f.r)+'/сек</div></div>'
 +'<div class="ud">'+f.d+'</div><div class="ucur"></div>'
 +'<div class="uf"><div class="uprice">'+ICON+'<span class="fp"></span></div><button class="ubuy fbuy" data-id="'+f.id+'"></button></div></div>'}).join("")}
function setNum(el,to){var from=el._v==null?to:el._v;el._v=to;cancelAnimationFrame(el._r);
 if(RM||from===to||Math.abs(to-from)<2){el.textContent=fmt(to);return}
 var t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/280),v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));el.textContent=fmt(v);if(k<1)el._r=requestAnimationFrame(f)})(t0)}
function refresh(bump){
 setNum($("balv"),W.vb);setNum($("vbn"),W.vb);$("cpc").textContent=fmt(cpc());$("aps").textContent=fmt(aps());
 document.querySelectorAll(".pc").forEach(function(e){e.textContent=fmt(OC())});var poor=W.vb<OC(),n=fmt(Math.floor(W.vb/OC()));
 ["go","again","togo"].forEach(function(i){$(i).classList.toggle("poor",poor)});$("afford").textContent=n;$("afford2").textContent=n;
 UPS.forEach(function(u){var el=$("up_"+u.id),own=has(u.id),can=!own&&W.vb>=u.p,b=el.querySelector(".ubuy");
  el.classList.toggle("own",own);el.classList.toggle("no",!own&&!can);
  b.textContent=own?"Куплено ✓":can?"Купить":"Не хватает "+fmt(u.p-W.vb);
  b.setAttribute("aria-disabled",own||!can?"true":"false");
  el.querySelector(".ucur").textContent=(own?"Активно: +":"Даст: +")+u.b+" к доходу за клик"});
 FARMS.forEach(function(f){var el=$("fm_"+f.id),c=fcost(f),can=W.vb>=c,b=el.querySelector(".fbuy");
  el.classList.toggle("no",!can);el.querySelector(".fp").textContent=fmt(c);
  b.textContent=can?"Купить":"Не хватает "+fmt(c-W.vb);b.setAttribute("aria-disabled",can?"false":"true");
  el.querySelector(".ucur").textContent="В наличии: "+fcount(f.id)+" · даёт +"+fmt(f.r*fcount(f.id))+"/сек"});
 if(bump)anim($("bal"),"pop")}
function ting(){if(!SOUND||VOL<=0)return;var now=performance.now();if(now-lastTing<45)return;lastTing=now;
 try{var c=AC||(window._tc=window._tc||new(window.AudioContext||window.webkitAudioContext)());if(c.state==="suspended")c.resume();
  var t=c.currentTime,g=c.createGain(),k=1+Math.min(combo,12)*.02;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.2*VOL,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+.2);g.connect(c.destination);
  [[1318.5,"triangle"],[1975.5,"sine"],[2637,"sine"]].forEach(function(p,i){var o=c.createOscillator();o.type=p[1];o.frequency.value=p[0]*k;
   var gg=c.createGain();gg.gain.value=i==2?.3:1;o.connect(gg);gg.connect(g);o.start(t);o.stop(t+.22)})}catch(e){}}
function fx(cx,cy,g){var layer=$("fx"),r=$("vbstage").getBoundingClientRect(),x=cx-r.left,y=cy-r.top;
 while(layer.children.length>60)layer.removeChild(layer.firstChild);
 var t=document.createElement("div");t.className="fltx";t.textContent="+"+fmt(g)+" V-Bucks";
 t.style.left=Math.max(60,Math.min(r.width-60,x+(Math.random()*40-20)))+"px";t.style.top=(y-10)+"px";layer.appendChild(t);
 setTimeout(function(){t.remove()},950);
 if(RM)return;
 var cols=["#ffffff","#7fb0ff","#fff22d"];
 for(var i=0;i<9;i++){var a=Math.random()*6.283,d=60+Math.random()*70,p=document.createElement("i");p.className="sp";
  p.style.left=x+"px";p.style.top=y+"px";p.style.setProperty("--dx",Math.cos(a)*d+"px");p.style.setProperty("--dy",Math.sin(a)*d+"px");
  p.style.setProperty("--c",cols[i%3]);if(i%3==2)p.style.background="#fff22d";layer.appendChild(p);
  (function(q){setTimeout(function(){q.remove()},700)})(p)}}
var lastOk=0;
function tap(cx,cy){var n0=performance.now();if(n0-lastOk<90)return;lastOk=n0;var g=cpc(),n=performance.now();combo=n-lastTap<400?combo+1:0;lastTap=n;
 W.vb=Math.min(W.vb+g,MAXV);refresh(false);anim($("vbtn"),"hit");fx(cx,cy,g);ting();hap("light");saveSoon()}
function buy(id){if(lock)return;var u=UPS.filter(function(z){return z.id===id})[0];if(!u||has(id))return;
 if(W.vb<u.p){toast("Не хватает "+fmt(u.p-W.vb)+" V-Bucks для «"+u.n+"»","bad");anim($("bal"),"bad");hap("error");return}
 lock=true;W.vb=Math.max(0,W.vb-u.p);W.ups.push(id);flush();refresh(true);
 anim($("up_"+id),"flash");hap("success");toast("Куплено: "+u.n+"! Теперь +"+fmt(cpc())+" за клик","good");
 setTimeout(function(){lock=false},350)}
function buyFarm(id){if(lock2)return;var f=FARMS.filter(function(z){return z.id===id})[0];if(!f)return;var c=fcost(f);
 if(W.vb<c){toast("Не хватает "+fmt(c-W.vb)+" V-Bucks для «"+f.n+"»","bad");anim($("bal"),"bad");hap("error");return}
 lock2=true;W.vb=Math.max(0,W.vb-c);W.farms[id]=fcount(id)+1;flush();refresh(true);
 anim($("fm_"+id),"flash");hap("success");toast(f.n+" ×"+fcount(id)+"! Авто: +"+fmt(aps())+"/сек","good");
 setTimeout(function(){lock2=false},250)}
window.vbRefresh=function(){refresh(false)};
window.vbAdd=function(n){W.vb=Math.min(W.vb+Math.max(0,Math.floor(n)),MAXV);flush();refresh(true)};
window.vbToast=toast;
window.spendOpen=function(){
 if(W.vb<OC()){toast("Недостаточно V-Bucks! Нужно "+OC()+", у тебя "+fmt(W.vb),"bad",{t:"Заработать",f:function(){tab(3)}});anim($("bal"),"bad");hap("error");return false}
 W.vb=Math.max(0,W.vb-OC());flush();refresh(true);hap("medium");return true};
var REC=[];try{REC=JSON.parse(localStorage.getItem("fnrecent"))||[]}catch(e){REC=[]}
if(!Array.isArray(REC))REC=[];REC=REC.filter(function(k){return I.some(function(x){return x.k===k})}).slice(0,7);
function recRender(){$("recw").style.display=REC.length?"":"none";
 $("rec").innerHTML=REC.map(function(k){var x=I.filter(function(z){return z.k===k})[0];return '<div class="mini" title="'+x.n+'" style="--rc:'+R[x.r][0]+'">'+art(x)+'</div>'}).join("")}
window.recent=function(k){REC.unshift(k);REC=REC.slice(0,7);try{localStorage.setItem("fnrecent",JSON.stringify(REC))}catch(e){}recRender();var f=$("rec").firstChild;if(f)f.classList.add("new")};
function sndUi(){var b=$("snd");b.textContent=(SOUND?"🔊":"🔇")+" Звук клика";b.setAttribute("aria-pressed",SOUND?"true":"false")}
var MV=.4,MS=Object.assign(new Audio(),{preload:"none",src:"assets/audio/music.mp3?v=635e5143"}),MG=null;MS.loop=true;
try{var mv0=parseFloat(localStorage.getItem("fnmusic"));if(mv0>=0&&mv0<=1)MV=mv0}catch(e){}
function mApply(){var g=MV*.7;if(MG)MG.gain.value=g;else MS.volume=Math.min(1,g)}
function mIcon(){$("mi").textContent=MV<=0?"🔇":"🎵"}
function mStart(){if(MV<=0||!MS.paused||document.hidden)return;
 if(AC&&!MG){try{MG=AC.createGain();AC.createMediaElementSource(MS).connect(MG);MG.connect(AC.destination);MS.volume=1}catch(e){MG=null}}
 mApply();var p=MS.play();if(p&&p.catch)p.catch(function(){})}
function setupPanel(){var r=$("srow2");r.appendChild($("vi"));r.appendChild($("vol"));var old=r.parentNode.nextSibling;
 var mv=$("mvol");mv.value=Math.round(MV*100);mIcon();
 mv.oninput=function(){MV=mv.value/100;try{localStorage.setItem("fnmusic",MV)}catch(e){}mIcon();if(MV<=0){MS.pause()}else{mApply();mStart()}};
 var g=$("gear"),p=$("set");
 function tog(f){var o=f===undefined?!p.classList.contains("show"):f;p.classList.toggle("show",o);g.setAttribute("aria-expanded",o?"true":"false")}
 g.onclick=function(e){e.stopPropagation();tog()};
 document.addEventListener("pointerdown",function(e){if(p.classList.contains("show")&&!e.target.closest("#set,#gear"))tog(false)});
 document.addEventListener("keydown",function(e){if(e.key==="Escape")tog(false)})}
load();buildShop();refresh(false);recRender();sndUi();setupPanel();
$("t3").onclick=function(){tab(3)};$("togo").onclick=function(){tab(1)};$("again").onclick=function(){$("ok").click();open()};
$("snd").onclick=function(){SOUND=!SOUND;try{localStorage.setItem("fnclick",SOUND?"1":"0")}catch(e){}sndUi();if(SOUND)ting()};
var vb=$("vbtn");
vb.addEventListener("pointerdown",function(e){if(e.pointerType==="mouse"&&e.button!==0)return;tap(e.clientX,e.clientY)});
vb.addEventListener("click",function(e){if(e.detail===0){var r=vb.getBoundingClientRect();tap(r.left+r.width/2,r.top+r.height/2)}});
vb.addEventListener("contextmenu",function(e){e.preventDefault()});
$("shop").addEventListener("click",function(e){var b=e.target.closest(".ubuy");if(b)buy(b.getAttribute("data-id"))});
$("farm").addEventListener("click",function(e){var b=e.target.closest(".fbuy");if(b)buyFarm(b.getAttribute("data-id"))});
var acc=0,last=performance.now();
setInterval(function(){var n=performance.now(),dt=Math.min(n-last,2000);last=n;var r=aps();if(!r||document.hidden)return;
 acc+=r*dt/1000;var a=Math.floor(acc);if(a>0){acc-=a;W.vb=Math.min(W.vb+a,MAXV);refresh(false);saveSoon()}},250);
window.addEventListener("pagehide",flush);
document.addEventListener("visibilitychange",function(){if(document.hidden){flush();MS.pause()}else mStart()});document.addEventListener("pointerdown",mStart);
window.addEventListener("storage",function(e){if(e.key===KEY&&e.newValue){load();refresh(false)}});
if(fresh)setTimeout(function(){toast("Стартовый бонус: "+fmt(START)+" V-Bucks!","good")},500);
})();
