import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
const ID=2101;
const isNative=Capacitor.isNativePlatform();
let allowed=false;
async function permission(){if(!isNative)return false;try{const state=await LocalNotifications.requestPermissions();allowed=state.display==='granted';return allowed}catch(e){console.warn('Notifications permissions',e);return false}}
async function schedule(at){if(!isNative)return; if(!(await permission()))return;try{await LocalNotifications.cancel({notifications:[{id:ID}]});await LocalNotifications.schedule({notifications:[{id:ID,title:'BetonKibelPlus — powrót kosza',body:'Czy kosz już jest?',schedule:{at:new Date(Math.max(Date.now()+1000,at))},sound:'default',actionTypeId:'KOSZ',extra:{kind:'bucket'}}]})}catch(e){console.warn('Schedule notification',e)}}
async function cancel(){if(!isNative)return;try{await LocalNotifications.cancel({notifications:[{id:ID}]})}catch(e){console.warn('Cancel notification',e)}}
window.BKPnative={schedule,cancel,isNative};
if(isNative){
 LocalNotifications.registerActionTypes({types:[{id:'KOSZ',actions:[{id:'ARRIVED',title:'Kosz jest'},{id:'LATER',title:'Jeszcze nie'}]}]}).catch(e=>console.warn('Actions',e));
 LocalNotifications.addListener('localNotificationActionPerformed',event=>{
   if(event.notification?.id===ID){window.dispatchEvent(new CustomEvent('bkp:notification-action',{detail:{action:event.actionId}}))}
 }).catch(e=>console.warn('Notification listener',e));
}
