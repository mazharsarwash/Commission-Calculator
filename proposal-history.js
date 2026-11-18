(function(){
'use strict';
const key='taxportal.proposalHistory.v1';
const states=['Draft','Pending','Accepted','Declined'];
function read(){const raw=localStorage.getItem(key);if(raw===null)return [];const data=JSON.parse(raw);if(!Array.isArray(data))throw Error('Could not read proposal history.');return data;}
function write(rows){localStorage.setItem(key,JSON.stringify(rows));}
function save(draft,client){
 const rows=read();let row=rows.find(r=>r.id===draft.historyId);
 if(!row&&draft.reference)row=rows.find(r=>r.reference.toUpperCase()===draft.reference.trim().toUpperCase());
 if(!row){row={id:crypto.randomUUID(),status:'Draft',note:'',followUp:'',createdAt:new Date().toISOString()};rows.push(row);}
 const snapshot={...draft,historyId:row.id};
 Object.assign(row,{client,reference:draft.reference.trim(),title:draft.title,date:draft.date,draft:snapshot,updatedAt:new Date().toISOString()});
 write(rows);return row.id;
}
function update(id,fields){
 const rows=read(),row=rows.find(r=>r.id===id);if(!row)throw Error('This proposal is no longer in the register.');
 if(!states.includes(fields.status))throw Error('Select a valid status.');
 Object.assign(row,{status:fields.status,note:fields.note.slice(0,2000),followUp:fields.followUp,updatedAt:new Date().toISOString()});write(rows);
}
const el=id=>document.getElementById(id);
function init(openDraft){
 if(!el('proposal-history'))return;
 const list=el('history-list'),message=el('history-message'),search=el('history-search'),filter=el('history-filter');let editing='';
 const create=(tag,value)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;return n;};
 function render(){
  list.replaceChildren();
  let rows;try{rows=read();}catch{message.textContent='Proposal history could not be loaded in this browser.';return;}
  const query=search.value.trim().toLowerCase(),status=filter.value,shown=rows.filter(r=>(!status||r.status===status)&&(!query||[r.reference,r.client,r.title,r.note].some(v=>String(v||'').toLowerCase().includes(query)))).sort((a,b)=>(status==='Pending'?(a.followUp||'9999').localeCompare(b.followUp||'9999'):0)||b.updatedAt.localeCompare(a.updatedAt));
  const pending=rows.filter(r=>r.status==='Pending').length;
  el('history-summary').textContent=rows.length+' saved · '+pending+' pending · '+rows.filter(r=>r.status==='Accepted').length+' accepted';
  if(!shown.length){list.append(create('p',rows.length?'No proposals match these filters.':'No saved proposals yet. Generate a proposal or open an older JSON draft and generate it to add it here.'));return;}
  const table=create('table'),thead=create('thead'),head=create('tr'),body=create('tbody');
  for(const label of ['Proposal','Status','Follow-up','Actions']){const th=create('th',label);th.scope='col';head.append(th);}thead.append(head);table.append(thead,body);list.append(table);
  for(const r of shown){
   const tr=create('tr'),proposal=create('td'),statusCell=create('td'),notes=create('td'),actions=create('td');
   proposal.append(create('strong',r.reference),create('small',[r.client,r.title,r.date].filter(Boolean).join(' · ')));
   const badge=create('span',r.status);badge.className='history-badge history-'+r.status.toLowerCase();statusCell.append(badge);
   const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Dubai'});const due=create('small',r.followUp?'Follow up: '+r.followUp+(r.status==='Pending'&&r.followUp<today?' · Overdue':''):'No follow-up date');
   notes.append(due);if(r.note)notes.append(create('p',r.note));
   const open=create('button','Open draft');open.type='button';open.onclick=()=>openDraft(r.draft);
   const edit=create('button','Update status');edit.type='button';edit.onclick=()=>{editing=r.id;el('history-edit-title').textContent='Update '+r.reference;el('history-edit-status').value=r.status;el('history-edit-date').value=r.followUp;el('history-edit-note').value=r.note;el('history-edit').hidden=false;el('history-edit-status').focus();};actions.append(open,edit);tr.append(proposal,statusCell,notes,actions);body.append(tr);
  }
 }
 el('history-toggle').onclick=()=>show(true);el('history-back').onclick=()=>show(false);search.oninput=render;filter.onchange=render;
 el('history-cancel').onclick=()=>{el('history-edit').hidden=true;editing='';};
 el('history-edit').onsubmit=e=>{e.preventDefault();try{update(editing,{status:el('history-edit-status').value,followUp:el('history-edit-date').value,note:el('history-edit-note').value.trim()});el('history-edit').hidden=true;editing='';message.textContent='Status and follow-up saved.';render();}catch{message.textContent='Could not save the update. Your changes are still in the form.';}};
 function show(open){el('proposal-history').hidden=!open;document.querySelector('.studio').hidden=open;el('history-toggle').setAttribute('aria-expanded',String(open));if(open){render();search.focus();}}
 window.addEventListener('storage',e=>{if(e.key===key&&!el('proposal-history').hidden)render();});
 return {show};
}
window.ProposalHistory={save,update,read,init};
})();
