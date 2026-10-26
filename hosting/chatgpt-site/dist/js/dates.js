import {ApiError} from './store-core.js?v=1.0.4';

export function localDateInput(value){
 const d=new Date(value);
 return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
}

// A minute-only editor must not discard the seconds of an unchanged timestamp.
export function resolveLocalTimestamp(value,initial,field){
 const parsed=new Date(value);
 if(Number.isNaN(parsed.getTime()))throw new ApiError('invalid_input',{[field]:'invalid'});
 return value===localDateInput(initial)?initial:parsed.toISOString();
}
