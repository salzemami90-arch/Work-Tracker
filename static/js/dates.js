import {getLanguage} from './i18n.js';
export function formatDate(value, withTime=false){
 if(!value)return '';
 const parsed=new Date(value);
 if(Number.isNaN(parsed.getTime()))return '';
 return new Intl.DateTimeFormat(getLanguage()==='ar'?'ar-KW':'en-GB',{calendar:'gregory',month:'short',day:'numeric',year:'numeric',...(withTime?{hour:'numeric',minute:'2-digit'}:{})}).format(parsed);
}
export function localDateTimeNow(){const date=new Date();return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);}
