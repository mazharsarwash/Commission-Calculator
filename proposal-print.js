/* Print Preview and download share one generated PDF, including fonts and pagination. */
(function(){
'use strict';
const RELEASE='2026.11.18-r23';window.ProposalPrintRelease=RELEASE;
const $=id=>document.getElementById(id);
let wanted='',revision=0,ready=null,pending=null,timer=null;
const asData=async path=>{const r=await fetch(path+'?v='+RELEASE,{cache:'no-store'});if(!r.ok)throw Error('Required proposal asset could not load: '+path);const blob=await r.blob();return new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(f.result);f.onerror=()=>reject(Error('Could not read proposal asset.'));f.readAsDataURL(blob);});};
let assets;
const loadAssets=()=>assets??=(Promise.all([asData('proposal-logo.jpeg'),Promise.resolve(null)]));
const inPdfView=()=>document.querySelector('[data-preview-mode="pdf"]')?.getAttribute('aria-pressed')==='true';
function status(message){$('pdf-preview-status').textContent=message;$('pdf-preview-status').hidden=!inPdfView();$('proposal-preview').hidden=true;$('open-print-pdf').hidden=true;}
function present(record){const frame=$('proposal-preview');frame.removeAttribute('srcdoc');if(frame.getAttribute('src')!==record.url+'#view=Fit&navpanes=0&pagemode=none')frame.src=record.url+'#view=Fit&navpanes=0&pagemode=none';frame.hidden=!inPdfView();$('pdf-preview-status').hidden=true;$('open-print-pdf').href=record.url;$('open-print-pdf').hidden=false;}
function invalidate(html){if(html===wanted)return;wanted=html;revision++;$('save-pdf').hidden=true;status('Updating Print Preview…');}
async function prepare(html){invalidate(html);if(ready?.html===html){present(ready);return ready;}if(pending?.html===html)return pending.promise;const token=revision;
 const promise=(async()=>{const [logo,signature]=await loadAssets();const bytes=await window.renderProposalPdf(html,logo,signature);if(token!==revision)throw Error('The proposal changed while the PDF was being prepared. Please try again.');const record={html,bytes,url:URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}))};const old=ready;ready=record;present(record);if(old)setTimeout(()=>URL.revokeObjectURL(old.url),30000);return record;})();
 pending={html,promise};try{return await promise;}finally{if(pending?.promise===promise)pending=null;}
}
function show(html){clearTimeout(timer);invalidate(html);return prepare(html).catch(e=>{if(html===wanted)status('Print Preview could not be prepared. '+e.message);return null;});}
window.ProposalPrint={schedule(html){invalidate(html);clearTimeout(timer);if(ready?.html===html){present(ready);return;}timer=setTimeout(()=>show(html),450);},show,prepare,viewChanged(){if(ready?.html===wanted)present(ready);else status('Updating Print Preview…');}};
})();
