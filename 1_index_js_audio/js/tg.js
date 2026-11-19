/* Мост между игрой и Telegram Mini App. Грузится ДО игры. */
(function(){
"use strict";
var T=window.Telegram&&window.Telegram.WebApp,IN=!!(T&&T.initData),
KEYS=["fnwallet","fnchest","fnrecent","fnvol","fnmusic","fnclick","fnmode","fnbox","fncol","fncnt","fnboxn"],CS=IN&&T.CloudStorage;
window.TG=IN?T:null;

/* вибро-отклик: light|medium|heavy|success|error|warning */
window.hap=function(k){try{var h=T.HapticFeedback;if(!IN||!h)return;
 if(k==="success"||k==="error"||k==="warning")h.notificationOccurred(k);else h.impactOccurred(k||"light")}catch(e){}};

if(IN){
 try{T.ready()}catch(e){}
 try{T.expand()}catch(e){}
 try{T.disableVerticalSwipes&&T.disableVerticalSwipes()}catch(e){}
 try{T.setHeaderColor("#050a2a");T.setBackgroundColor("#050a2a");T.setBottomBarColor&&T.setBottomBarColor("#050a2a")}catch(e){}
}

/* зеркалим сохранения в Telegram CloudStorage (общие для всех устройств аккаунта) */
var pend={},timers={};
function cloudSet(k,v){if(!CS||String(v).length>4000)return;pend[k]=v;clearTimeout(timers[k]);
 timers[k]=setTimeout(function(){flushKey(k)},1500)}
function flushKey(k){if(!(k in pend))return;var v=pend[k];delete pend[k];try{CS.setItem(k,v,function(){})}catch(e){}}
function flushAll(){Object.keys(pend).forEach(flushKey)}
if(CS){
 var orig=Storage.prototype.setItem;
 Storage.prototype.setItem=function(k,v){orig.call(this,k,v);if(this===window.localStorage&&KEYS.indexOf(k)>-1)cloudSet(k,String(v))};
 window.addEventListener("pagehide",flushAll);
 document.addEventListener("visibilitychange",function(){if(document.hidden)flushAll()});
 try{T.onEvent("deactivated",flushAll)}catch(e){}
}

function load(src,cb){var s=document.createElement("script");s.src=src;s.async=false;s.onload=cb;s.onerror=function(){fail("Не удалось загрузить "+src)};document.head.appendChild(s)}
function fail(m){var b=document.getElementById("boot");if(b)b.innerHTML='<div class="bt">'+m+'<br><small>Закрой и открой игру заново</small></div>'}
function boot(){
 load("js/game.js?v=d8c6d077",function(){
  /* кнопка «Назад» Telegram возвращает на главную вкладку */
  if(IN&&T.BackButton){var _tab=window.tab;
   window.tab=function(n){_tab(n);try{n===1?T.BackButton.hide():T.BackButton.show()}catch(e){}};
   try{T.BackButton.onClick(function(){window.tab(1)})}catch(e){}}
  load("js/vb.js?v=4708c199",function(){setTimeout(function(){try{[MS,SND,OS,RL].forEach(function(a){a.preload="auto";a.load()})}catch(e){}},2500);var b=document.getElementById("boot");if(b){b.classList.add("off");setTimeout(function(){b.remove()},400)}});
 });
}

/* перед стартом игры подтягиваем облачные данные в localStorage */
if(CS){
 var done=false;function go(){if(done)return;done=true;boot()}
 var guard=setTimeout(go,2500);
 try{CS.getItems(KEYS,function(err,vals){clearTimeout(guard);
  if(!err&&vals){KEYS.forEach(function(k){var cv=vals[k];
   try{if(cv){orig.call(localStorage,k,cv)}
    else{var lv=localStorage.getItem(k);if(lv)cloudSet(k,lv)}}catch(e){}})}
  go()})}catch(e){clearTimeout(guard);go()}
}else boot();
})();
