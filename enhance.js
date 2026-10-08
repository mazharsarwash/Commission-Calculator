const UI_ICONS={grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',clients:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M20 21v-2a4 4 0 0 0-3-3.8"/><circle cx="9" cy="7" r="4"/><path d="M16 3a4 4 0 0 1 0 8"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18M8 16h2"/>',invoice:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/>',tasks:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m7 12 3 3 7-7"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m5 12 4 4L19 6"/>',activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'};
function uiIcon(name){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(UI_ICONS[name]||UI_ICONS.grid)+'</svg>';}
function uiText(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function uiMoney(amount){return Number(amount||0).toLocaleString('en-AE',{minimumFractionDigits:0,maximumFractionDigits:2});}
function invoiceTotals(){const totals={};Object.values(feesData).filter(i=>i&&i.service&&i.status!=='void').forEach(i=>{const cur=i.currency||i.igCurrency||'AED';totals[cur]??={raised:0,paid:0,outstanding:0};const a=parseFloat(i.amount)||0;totals[cur].raised+=a;totals[cur][i.status==='paid'?'paid':'outstanding']+=a;});return totals;}
function totalLabel(field,empty='AED 0'){const totals=invoiceTotals();return Object.keys(totals).sort().map(cur=>uiText(cur)+' '+uiMoney(totals[cur][field])).join(' · ')||empty;}
function toggleNavigation(open){document.body.classList.toggle('nav-open',open??!document.body.classList.contains('nav-open'));document.getElementById('nav-toggle').setAttribute('aria-expanded',String(document.body.classList.contains('nav-open')));}
const previousV=V;
V=function(v){previousV(v);toggleNavigation(false);renderWorkspaceHeading();document.querySelectorAll('.ni[id]').forEach(n=>{n.setAttribute('aria-current',n.classList.contains('active')?'page':'false');});};
const previousEnterDB=enterDB;
enterDB=function(){previousEnterDB();V(isOffice()?'clients':'overview');renderWorkspaceHeading();};
const previousLogout=doLogout;
doLogout=function(){toggleNavigation(false);closeCommand();previousLogout();};
function renderWorkspaceHeading(){if(!CU)return;const texts={overview:['Your practice, at a glance.','A clear view of your clients, deadlines, and work in progress.'],clients:['Good relationships start here.','Client information, compliance details, and documents in one place.'],entries:['Stay one step ahead.','Manage VAT and corporate tax deadlines with confidence.'],accounting:['Keep the work moving.','Track each assignment from preparation through review and completion.'],reviews:['A fresh pair of eyes.','Review submissions and help your team deliver their best work.'],fees:['Every invoice, accounted for.','Track what you’ve raised, collected, and still need to collect.'],calendar:['A little planning goes a long way.','Your compliance deadlines, laid out month by month.'],advisors:['Meet your team.','Manage advisors and the clients they look after.'],workload:['Workload & staff performance.','Review delivery, quality and billing contributions.'],tasks:['Make room for focused work.','Turn priorities into clear assignments and completed tasks.'],activity:['Your workspace in motion.','See the latest changes and updates.'],users:['The right access for everyone.','Manage staff logins and roles.'],'client-detail':['Everything about your client.','Notes, documents, and important details.']};const [title,desc]=texts[curView]||['Your workspace.',''];const heading=document.getElementById('workspace-heading');heading.innerHTML='<div><div class="eyebrow">'+uiText(document.getElementById('ttitle').textContent)+'</div><h1>'+title+'</h1><p>'+desc+'</p></div><div class="heading-date">'+new Date().toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Dubai'})+'</div>';document.getElementById('slbl').textContent='Connected';}
renderStats=function(){
 if(!CU)return;
 const active=clients.filter(c=>(c.status||'active')==='active').length;
 const overdue=entries.filter(e=>stOf(e)==='overdue').length,soon=entries.filter(e=>stOf(e)==='soon').length;
 const myTasks=isM()?tasksData:tasksData.filter(t=>t.advisorId===myAId());
 const pending=myTasks.filter(t=>!['completed','cancelled'].includes(t.status)).length;
 const done=acctEntries.filter(e=>e.status==='done').length,pct=acctEntries.length?Math.round(done/acctEntries.length*100):0;
 function card(label,value,detail,view,icon){return '<div class="sc" role="button" tabindex="0" data-view="'+view+'"><div class="stat-head"><div class="sc-l">'+label+'</div><div class="stat-icon">'+uiIcon(icon)+'</div></div><div class="sc-v">'+value+'</div><div class="sc-foot"><div class="sc-s">'+detail+'</div><span class="stat-arrow">↗</span></div></div>';}
 document.getElementById('stats-grid').innerHTML=card('Active clients',active,clients.length+' total in your portfolio','clients','clients')+card('Tax deadlines',entries.length,overdue?'<span style="color:var(--red)">'+overdue+' overdue</span> · '+soon+' due soon':entries.length?soon+' due within 14 days':'Add your first tax entry','entries','calendar')+(isM()?card('Paid invoices',Object.values(feesData).filter(i=>i&&i.service&&i.status==='paid').length,Object.values(feesData).filter(i=>i&&i.service&&!['paid','void'].includes(i.status)).length+' invoices outstanding','fees','invoice'):card('Accounting completed',done+'/'+acctEntries.length,pct+'% of assignments completed','accounting','check'))+card('Open tasks',pending,myTasks.filter(t=>t.status==='completed').length+' completed','tasks','tasks');
 const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hour12:false,timeZone:'Asia/Dubai'}).format(new Date()));const greeting=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
 document.getElementById('welcome-greeting').textContent=greeting+', '+CU.name.split(' ')[0]+'.';
 document.getElementById('welcome-message').textContent=clients.length?(overdue?overdue+' overdue tax '+(overdue===1?'deadline needs':'deadlines need')+' your attention. Your next priority is below.':soon?soon+' tax '+(soon===1?'deadline is':'deadlines are')+' due in the next 14 days. Let’s keep everything on track.':'You’re ready for the day. Review your upcoming deadlines and keep the work moving.'):'A fresh workspace for your practice. Add your first client, then organise their deadlines, accounts, and invoices.';
 document.getElementById('welcome-button').innerHTML=uiIcon(clients.length?'calendar':'plus')+(clients.length?'Open calendar':'Add your first client');document.getElementById('welcome-button').onclick=()=>clients.length?V('calendar'):openClientM(null);
 const health=document.getElementById('health-card');health.innerHTML='<div class="section-heading">Accounting progress <small>'+acctEntries.length+' assignments</small></div><div class="health-body"><div class="health-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="41" stroke="#eef3ec" stroke-width="7" fill="none"/><circle cx="50" cy="50" r="41" stroke="#729e7b" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="'+(pct*2.576)+' 257.6"/></svg><span>'+pct+'%</span></div><div class="health-copy"><b>'+done+' completed</b><p>'+(acctEntries.length-done)+' assignments remaining.<br>'+(acctEntries.length?'Keep each client moving towards completion.':'Add accounting work to start tracking progress.')+'</p></div></div><button class="btn btn-g health-link" onclick="V(\'accounting\')">View accounting '+uiIcon('arrow')+'</button>';
 document.querySelectorAll('[data-manager-only]').forEach(el=>el.hidden=!isM());document.querySelectorAll('[data-finance-only]').forEach(el=>el.hidden=!(isM()||isOffice()));
 renderOverviewSections();
};
const previousRenderFees=renderFees;
renderFees=function(){
 previousRenderFees();
 const totals=invoiceTotals(),currencies=[...new Set(['AED','USD',...Object.keys(totals)])];
 const sum=document.getElementById('fee-sum');
 if(sum)sum.innerHTML=[['raised','Total invoiced','invoice'],['paid','Collected','check'],['outstanding','Outstanding','tasks']].map(([key,label,icon])=>'<div class="currency-summary"><div class="currency-summary-title">'+uiIcon(icon)+label+'</div>'+currencies.map(cur=>'<div class="currency-summary-row"><span class="currency-tag currency-'+uiText(cur.toLowerCase())+'">'+uiText(cur)+'</span><strong class="money-'+key+'">'+Number(totals[cur]?.[key]||0).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2})+'</strong></div>').join('')+'</div>').join('');
 if(CU)renderStats();
};

const previousClients=renderClients;
renderClients=function(){previousClients();const count=document.getElementById('client-count');if(count)count.textContent=clients.length+' '+(clients.length===1?'client':'clients');if(clients.length&&document.getElementById('clients-grid').innerHTML.includes('No clients found.')){document.getElementById('clients-grid').innerHTML='<div class="empty-state">'+uiIcon('search')+'<h3>No matching clients.</h3><p>Try another name, email, or licence number, or change the status filter.</p></div>';}if(!clients.length){document.getElementById('clients-grid').innerHTML='<div class="empty-state">'+uiIcon('clients')+'<h3>Your clients belong here.</h3><p>Add a client to start organising their details, deadlines, and work.</p><button class="btn btn-p" onclick="openClientM(null)">'+uiIcon('plus')+' Add your first client</button></div>';}};
const ROUTES=[{id:'overview',name:'Overview',sub:'Your practice at a glance',icon:'grid'},{id:'clients',name:'Clients',sub:'Information, notes, and documents',icon:'clients'},{id:'entries',name:'Tax entries',sub:'VAT and corporate tax deadlines',icon:'invoice'},{id:'accounting',name:'Accounting',sub:'Assignments, progress, and reviews',icon:'calendar'},{id:'fees',name:'Fees & invoices',sub:'Raised, collected, and outstanding',icon:'invoice'},{id:'calendar',name:'Deadline calendar',sub:'Plan ahead',icon:'calendar'},{id:'advisors',name:'Advisors',sub:'Your people',icon:'clients'},{id:'workload',name:'Workload report',sub:'Team capacity',icon:'activity'},{id:'tasks',name:'Tasks',sub:'Priorities and assignments',icon:'tasks'},{id:'activity',name:'Activity',sub:'Workspace updates',icon:'activity'},{id:'users',name:'Manage logins',sub:'Staff access and roles',icon:'tasks'}];
function allowedRoutes(){return ROUTES.filter(r=>{const n=document.getElementById('nv-'+r.id);return n&&n.style.display!=='none'&&!(r.id==='users'&&!isM())&&!(isOffice()&&!['clients','fees','tasks'].includes(r.id));});}
let commandReturnFocus=null;
function openCommand(){if(!CU)return;commandReturnFocus=document.activeElement;document.getElementById('ov-command').classList.add('open');const inp=document.getElementById('command-search');inp.value='';renderCommand();inp.focus();}
function closeCommand(){document.getElementById('ov-command')?.classList.remove('open');commandReturnFocus?.focus();}
function renderCommand(){const q=document.getElementById('command-search').value.toLowerCase().trim();const out=document.getElementById('command-results');out.replaceChildren();const rows=allowedRoutes().filter(r=>(r.name+' '+r.sub).toLowerCase().includes(q)).map(r=>({...r,action:()=>V(r.id)}));if(q)clients.filter(c=>(c.name+' '+(c.email||'')).toLowerCase().includes(q)).slice(0,6).forEach(c=>rows.unshift({name:c.name,sub:'Client · '+(c.industry||'Notes & documents'),icon:'clients',action:()=>openClientDetail(c.id)}));for(const r of rows){const b=document.createElement('button');b.className='command-result';b.type='button';b.innerHTML=uiIcon(r.icon)+'<span><b>'+uiText(r.name)+'</b><small>'+uiText(r.sub)+'</small></span><span>↗</span>';b.onclick=()=>{closeCommand();r.action();};out.appendChild(b);}if(!rows.length)out.innerHTML='<div class="empty-td">No results. Try a client name or a section.</div>';}
async function exportWorkspaceBackup(){
 if(!isM())return;
 try{
  toast('Preparing your backup…');
  const paths=['entries','clients','advisors','accounting','users','activity','notes','docs','fees','tasks'];
  const snapshots=await Promise.all(paths.map(path=>db.ref(path).once('value')));
  const data=Object.fromEntries(paths.map((path,i)=>[path,snapshots[i].val()||{}]));
  const blob=new Blob([JSON.stringify({format:'taxportal-backup',version:1,exportedAt:new Date().toISOString(),data},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='TaxPortal_Backup_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Workspace backup downloaded','ok');
 }catch(err){toast('Could not download the backup. Please check your connection.','err');}
}

document.addEventListener('click',e=>{const card=e.target.closest('.sc[data-view]');if(card)V(card.dataset.view);});
document.addEventListener('keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand();return;}
 if(e.key==='Escape'){toggleNavigation(false);closeCommand();}
 if(e.target.matches('.sc[data-view]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();V(e.target.dataset.view);}
 const modal=document.getElementById('ov-command');if(modal.classList.contains('open')){const results=[...modal.querySelectorAll('.command-result')],input=document.getElementById('command-search');if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const idx=results.indexOf(document.activeElement);if(e.key==='ArrowUp'&&idx<=0)input.focus();else results[Math.min(results.length-1,e.key==='ArrowDown'?idx+1:idx-1)]?.focus();}if(e.key==='Enter'&&e.target===input){e.preventDefault();e.stopImmediatePropagation();results[0]?.click();}if(e.key==='Tab'){const els=[...modal.querySelectorAll('input,button')];const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
},true);
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.ni').forEach(n=>{n.setAttribute('role','button');n.tabIndex=0;n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();n.click();}});});
 document.querySelectorAll('.overlay .modal').forEach(m=>{m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');const title=m.querySelector('h2');if(title?.id)m.setAttribute('aria-labelledby',title.id);});
 document.querySelectorAll('.fg label,.lfg label').forEach(l=>{const field=l.parentElement.querySelector('input,select,textarea');if(field?.id)l.htmlFor=field.id;});
 document.querySelectorAll('.ib').forEach(b=>{if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',b.title||(/closeM/.test(b.getAttribute('onclick')||'')?'Close dialog':'Action'));});
 document.getElementById('toasts').setAttribute('role','status');document.getElementById('toasts').setAttribute('aria-live','polite');
 document.getElementById('lp').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();doLogin();}});
});

// Monthly agenda and a compact accounting view.
let calendarMode='list';
function setCalendarMode(mode){calendarMode=mode;renderCalendar();}
function calendarToday(){const now=new Date();calYear=now.getFullYear();calMonth=now.getMonth();renderCalendar();}
const originalCalendarRenderer=renderCalendar;
renderCalendar=function(){
 const search=(document.getElementById('agenda-search')?.value||'').trim().toLowerCase();
 const type=document.getElementById('agenda-type')?.value||'all';
 const advisorSelect=document.getElementById('agenda-advisor');
 if(advisorSelect){const selected=advisorSelect.value||'all';advisorSelect.innerHTML='<option value="all">All advisors</option>'+advisors.map(a=>'<option value="'+uiText(a.id)+'">'+uiText(a.name)+'</option>').join('');advisorSelect.value=selected;}
 const advisor=advisorSelect?.value||'all';
 const eligible=entries.filter(e=>(type==='all'||e.type===type)&&(advisor==='all'||e.advisorId===advisor)&&(!search||(cliName(e.clientId)+' '+(e.label||'')+' '+(e.type||'')).toLowerCase().includes(search)));
 const occurrences=getRecurringDeadlines(eligible,calYear,calMonth).sort((a,b)=>a.date-b.date||(cliName(a.entry.clientId)||'').localeCompare(cliName(b.entry.clientId)||''));
 // Apply the same filters to the grid while preserving the shared source array.
 const all=entries;try{entries=eligible;originalCalendarRenderer();}finally{entries=all;}
 const list=document.getElementById('calendar-agenda');if(!list)return;
 const today=new Date();today.setHours(0,0,0,0);
 const groups=new Map();occurrences.forEach(item=>{const key=item.date.getTime();if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);});
 document.getElementById('agenda-count').textContent=occurrences.length+' '+(occurrences.length===1?'deadline':'deadlines')+' this month';
 list.innerHTML=occurrences.length?[...groups.values()].map(items=>{
  const date=items[0].date,days=Math.round((date-today)/86400000);
  return '<section class="agenda-day"><div class="agenda-date"><strong>'+date.getDate()+'</strong><span>'+date.toLocaleDateString('en-GB',{weekday:'short'})+'</span><small>'+date.toLocaleDateString('en-GB',{month:'short'})+'</small></div><div class="agenda-day-items">'+items.map(({entry:e})=>{
   const name=cliName(e.clientId)||e.label||'Client',adv=advName(e.advisorId)||'Unassigned';
   const status=days<0?'Past date':days===0?'Due today':days===1?'Due tomorrow':'Due in '+days+' days';
   const cls=days<0?'past':days<=7?'urgent':'upcoming';
   return '<button class="agenda-row" data-entry-id="'+uiText(e.id)+'" onclick="openAgendaEntry(this.dataset.entryId)"><span class="agenda-client"><b>'+uiText(name)+'</b><small>'+uiText(adv)+(e.recurrence==='quarterly'?' · Quarterly':e.recurrence==='annual'?' · Annual':' · One time')+'</small></span><span class="badge '+(e.type==='VAT'?'bvat':'bcorp')+'">'+uiText(e.type||'Tax')+'</span><span class="agenda-status '+cls+'">'+status+'</span><span class="agenda-arrow">↗</span></button>';
  }).join('')+'</div></section>';
 }).join(''):'<div class="empty-state">'+uiIcon('calendar')+'<h3>No deadlines to show.</h3><p>Try another month or clear the filters.</p></div>';
 list.style.display=calendarMode==='list'?'':'none';document.getElementById('cal-body').style.display=calendarMode==='grid'?'grid':'none';document.getElementById('cal-dow').style.display=calendarMode==='grid'?'grid':'none';
 document.getElementById('calendar-list-button').classList.toggle('active',calendarMode==='list');document.getElementById('calendar-grid-button').classList.toggle('active',calendarMode==='grid');
};
function openAgendaEntry(id){const e=entries.find(e=>e.id===id);if(!e)return;if(canEdit(e.advisorId))openEntryM(id);else if(e.clientId)openClientDetail(e.clientId);}
const compactAccountingRenderer=renderAccounting;
renderAccounting=function(){compactAccountingRenderer();const labels=['Client','Advisor','Reviewer','Month','Service','Status','Report','Notes','Actions'];document.querySelectorAll('#acct-tbody tr').forEach(row=>{[...row.children].forEach((cell,i)=>cell.setAttribute('data-label',labels[i]||''));});};
const originalRecurringDeadlines=getRecurringDeadlines;
getRecurringDeadlines=function(records,year,month){return originalRecurringDeadlines(records,year,month).filter(({entry,date})=>date>=new Date(entry.deadline+'T00:00:00'));};
// Portal access management. Database authorization must be configured separately.
const ACCESS_SECTIONS=[['overview','Overview'],['clients','Clients'],['entries','Tax entries'],['accounting','Accounting'],['fees','Fees & invoices'],['calendar','Deadline calendar'],['advisors','Advisors'],['workload','Workload'],['tasks','Tasks'],['activity','Activity']];
function defaultAccessSections(role){if(role==='manager')return [...ACCESS_SECTIONS.map(s=>s[0]),'users'];if(role==='supervisor')return ['overview','clients','entries','accounting','calendar','advisors','workload','tasks','activity'];if(role==='office')return ['clients','fees','tasks'];return ['overview','clients','entries','accounting','calendar','workload','tasks','activity'];}
function hasSectionAccess(section){if(!CU||section==='reviews')return false;if(isM())return true;section=section==='client-detail'?'clients':section==='invoice-gen'?'fees':section;if(section==='users')return false;const baseline=defaultAccessSections(CU.role);const selected=Array.isArray(CU.permissions?.sections)?CU.permissions.sections:baseline;return baseline.includes(section)&&selected.includes(section);}
function canChangeSection(section){return hasSectionAccess(section)&&(isM()||!CU.permissions?.readOnly);}
function renderAccessOptions(reset=false){
 const role=document.getElementById('cred-role').value,cred=users[window._credId]||{};
 document.getElementById('cred-restricted-options').hidden=role==='manager';
 document.getElementById('access-description').textContent=role==='manager'?'All sections, editing, deletions, and login management.':role==='supervisor'?'Supervisor access covers team operations and delivery metrics. Billing, salary planning and login management are excluded.':role==='office'?'Office access covers clients, invoices, and assigned tasks. Choose the sections below.':'Advisor access covers the working sections. Accounting and tasks retain their existing assignment rules.';
 const editedName=advisors.find(a=>a.id===window._credId)?.name||cred.name||document.getElementById('cred-name').value;
 const allowed=defaultAccessSections(role==='advisor'&&REVIEWERS.includes(editedName)?'advisor-reviewer':role),selected=reset?allowed:(cred.permissions?.sections||allowed);
 document.getElementById('access-sections').innerHTML=ACCESS_SECTIONS.filter(([key])=>allowed.includes(key)).map(([key,label])=>'<label class="access-check"><input type="checkbox" data-access-section="'+key+'" '+(selected.includes(key)?'checked':'')+'> '+label+'</label>').join('');
}
const originalOpenCred=openCredM;
openCredM=function(id,name,role,isAdv){if(!isM()){toast('Only administrators can manage logins','err');return;}originalOpenCred(id,name,role,isAdv);const cred=users[id]||{};document.getElementById('cred-enabled').checked=cred.enabled!==false;document.getElementById('cred-readonly').checked=!!cred.permissions?.readOnly;renderAccessOptions();};
saveCred=async function(){
 if(!isM()){toast('Only administrators can manage logins','err');return;}
 const id=window._credId,role=document.getElementById('cred-role').value;
 const name=document.getElementById('cred-name').value.trim(),username=document.getElementById('cred-u').value.trim(),password=document.getElementById('cred-p').value;
 const enabled=document.getElementById('cred-enabled').checked;
 if(!username||!password){toast('Enter a username and password','err');return;}
 if(username.toLowerCase()==='manager'){toast('The username manager is reserved for the master login','err');return;}
 if(Object.entries(users).some(([uid,c])=>uid!==id&&c?.username?.toLowerCase()===username.toLowerCase())){toast('That username is already in use','err');return;}
 if(CU.loginId===id&&(!enabled||role!=='manager')){toast('Use another administrator to change your own access','err');return;}
 const sections=role==='manager'?defaultAccessSections(role):[...document.querySelectorAll('[data-access-section]')].filter(c=>c.checked).map(c=>c.dataset.accessSection);
 if(enabled&&role!=='manager'&&!sections.length){toast('Choose at least one allowed section','err');return;}
 const permissions={sections,readOnly:role==='manager'?false:document.getElementById('cred-readonly').checked};
 const newId=id||'usr_'+crypto.randomUUID();
 try{setSyncing(true);await db.ref('users/'+newId).set({...users[id],name:name||users[id]?.name||username,username,password,role,enabled,permissions,updatedAt:new Date().toISOString()});toast('Login and access saved','ok');closeM('cred');setSyncing(false);}catch(e){toast('Could not save this login','err');setSyncing(false);}
};
renderUsers=function(){
 const body=document.getElementById('users-tbody');if(!body||!isM())return;
 const ids=[...new Set([...advisors.map(a=>a.id),...Object.keys(users)])];
 body.innerHTML=ids.map(id=>{const cred=users[id]||{},adv=advisors.find(a=>a.id===id),name=adv?.name||cred.name||id,role=cred.role||'advisor',has=!!(cred.username&&cred.password),enabled=cred.enabled!==false,sections=cred.permissions?.sections||defaultAccessSections(role);
 const label=role==='manager'?'Full access':role==='supervisor'?'Restricted · Supervisor':role==='office'?'Restricted · Office':'Restricted · Advisor';
 const details=role==='manager'?'All sections · can manage logins':(cred.permissions?.readOnly?'View only · ':'Standard editing · ')+sections.length+' sections';
 return '<tr><td>'+uiText(name)+'</td><td><span class="badge '+(role==='manager'?'bactive':'bvat')+'">'+label+'</span></td><td>'+uiText(cred.username||'Not set')+'</td><td class="permissions-detail">'+uiText(details)+'</td><td><span class="badge '+(!has?'bna':enabled?'bactive':'bover')+'">'+(!has?'No login':enabled?'Enabled':'Disabled')+'</span></td><td><button class="btn btn-g" data-login-id="'+uiText(id)+'" onclick="editAccessLogin(this.dataset.loginId)">'+(has?'Edit login & access':'Set login')+'</button></td></tr>';
 }).join('')||'<tr><td colspan="6" class="empty-td">Add a login to give your team access.</td></tr>';
};
function editAccessLogin(id){const adv=advisors.find(a=>a.id===id),cred=users[id]||{};openCredM(id,adv?.name||cred.name||'',cred.role||'advisor',!!adv);}
const originalCanEdit=canEdit;
canEdit=function(id){return !!CU&&!CU.permissions?.readOnly&&originalCanEdit(id);};
function applyAccessNavigation(){if(!CU)return;ACCESS_SECTIONS.forEach(([key])=>{const n=document.getElementById('nv-'+key);if(n)n.style.display=hasSectionAccess(key)&&(key!=='reviews'||isReviewer())?'':'none';});document.getElementById('admin-wrap').style.display=isM()?'':'none';document.getElementById('urole').textContent=isM()?'Full access':isSupervisor()?'Supervisor · No finance':CU.permissions?.readOnly?'Restricted · View only':isOffice()?'Restricted · Office':'Restricted · Advisor';document.querySelectorAll('.quick-action').forEach(b=>{const click=b.getAttribute('onclick')||'';const module=click.includes('Client')?'clients':click.includes('Entry')?'entries':click.includes('Fee')?'fees':'tasks';b.hidden=!canChangeSection(module);});const exportBtn=document.querySelectorAll('.ni[onclick="exportExcel()"]')[0];if(exportBtn)exportBtn.hidden=!isM();const button=document.getElementById('add-btn');if(button&&!canChangeSection(curView))button.style.display='none';const second=document.getElementById('sec-btn');if(second&&!canChangeSection('advisors'))second.style.display='none';}
const accessEnterDB=enterDB;
enterDB=function(){accessEnterDB();applyAccessNavigation();if(!hasSectionAccess(curView)){const first=defaultAccessSections(CU.role).find(hasSectionAccess);if(first)V(first);else{toast('No sections are enabled for this login','err');doLogout();}}};
const accessRenderAll=renderAll;
renderAll=function(){accessRenderAll();applyAccessNavigation();};
function refreshCurrentAccess(){if(!CU?.loginId)return;const c=users[CU.loginId];if(!c||c.enabled===false){toast('This login has been disabled','err');doLogout();return;}CU.permissions=c.permissions||null;if(c.role==='manager')CU.role='manager';else if(c.role==='supervisor')CU.role='supervisor';else if(c.role==='office')CU.role='office';else CU.role=REVIEWERS.includes(CU.name)?'advisor-reviewer':'advisor';applyAccessNavigation();if(!hasSectionAccess(curView)){const first=defaultAccessSections(CU.role).find(hasSectionAccess);if(first)V(first);else doLogout();}}
const WRITE_ACTIONS={entries:['openEntryM','saveEntry','delEntry','advanceDeadline','markFiled'],clients:['openClientM','saveClient','delClient','toggleDoc','addNote'],advisors:['openAdvisorM','saveAdvisor','delAdvisor'],accounting:['openAcctM','saveAcctEntry','delAcctEntry','cycleAcctStatus','submitForReview','approveReview','sendBackReview','toggleReportShared','saveAcctNote','openBulkAcct','saveBulkAcct'],tasks:['openTaskM','saveTask','delTask','setTaskStatus','cycleTaskStatus'],fees:['openFeeM','saveFee','delFee','toggleFeePaid','saveInvoiceItems','printInvoice'],users:['delUserLogin']};
for(const [section,names] of Object.entries(WRITE_ACTIONS))for(const name of names){const fn=globalThis[name];if(typeof fn!=='function')continue;globalThis[name]=function(...args){if(!canChangeSection(section)){toast('You do not have permission to change this section','err');return;}return fn.apply(this,args);};}
const accessExport=exportExcel;
exportExcel=function(){if(!isM()){toast('Only full-access users can export the workspace','err');return;}return accessExport();};
