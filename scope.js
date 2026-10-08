// Portal record scoping; Firebase Authentication and rules are still required
// to enforce authorization outside this interface.
const scopeSource={};
function teamOperations(){return isM()||isSupervisor();}
function scopeRecords(source){
 if(!CU)return {clients:[],entries:[],acctEntries:[],tasksData:[],activityLog:[],notesData:{},docsData:{},feesData:{}};
 const own=id=>id===myAId(),all=teamOperations();
 const accounts=(source.acctEntries||[]).filter(e=>all||own(e.advisorId)||(isReviewer()&&e.status==='review'&&e.reviewer===CU.name));
 const tax=(source.entries||[]).filter(e=>all||own(e.advisorId));
 const tasks=(source.tasksData||[]).filter(e=>all||own(e.advisorId));
 const linked=new Set([...accounts,...tax,...tasks].map(e=>e.clientId).filter(Boolean));
 const cs=(source.clients||[]).filter(c=>all||own(c.advisorId)||linked.has(c.id)),ids=new Set(cs.map(c=>c.id));
 const raw=d=>Object.fromEntries(Object.entries(d||{}).filter(([id])=>all||ids.has(id)));
 const finance=hasSectionAccess('fees')&&(isM()||isOffice());
 const visibleClients=cs.map(c=>{const copy={...c};if(!finance)delete copy.fee;return copy;});
 return {clients:visibleClients,entries:tax,acctEntries:accounts,tasksData:tasks,activityLog:(source.activityLog||[]).filter(e=>(all||own(e.advisorId))&&(finance||!['fee','invoice','payment','salary'].includes(e.type))),notesData:raw(source.notesData),docsData:raw(source.docsData),feesData:finance?(source.feesData||{}):{}};
}
function applyRecordScope(){const s=scopeRecords({clients,entries,acctEntries,tasksData,activityLog,notesData,docsData,feesData,...scopeSource});clients=s.clients;entries=s.entries;acctEntries=s.acctEntries;tasksData=s.tasksData;activityLog=s.activityLog;notesData=s.notesData;docsData=s.docsData;feesData=s.feesData;return s;}
for(const [apiName,field,raw] of [['_clients','clients'],['_entries','entries'],['_acctg','acctEntries'],['_tasks','tasksData'],['_activity','activityLog'],['_notes','notesData',true],['_docs','docsData',true],['_fees','feesData']]){const api=window[apiName],method=raw?'listenRaw':'listen',listen=api[method];api[method]=function(callback){return listen(data=>{scopeSource[field]=field==='feesData'?Object.fromEntries(data.map(i=>[i.id,i])):data;const scoped=applyRecordScope();callback(field==='feesData'?Object.values(scoped[field]):scoped[field]);});};}
const scopeRenderAll=renderAll;renderAll=function(){applyRecordScope();scopeRenderAll();};
const scopeEnter=enterDB;enterDB=function(){applyRecordScope();scopeEnter();};
const scopeRefresh=refreshCurrentAccess;refreshCurrentAccess=function(){scopeRefresh();applyRecordScope();if(CU)renderAll();};
const scopeLogout=doLogout;doLogout=function(){scopeLogout();applyRecordScope();document.getElementById('client-detail-content').innerHTML='';document.getElementById('workload-cards').innerHTML='';document.getElementById('staff-evidence-body').innerHTML='';document.querySelectorAll('.overlay.open').forEach(e=>e.classList.remove('open'));};
// Avoid exposing fee/salary fields on client profiles and cards to non-finance users.
const scopeOpenClient=openClientM;openClientM=function(...args){scopeOpenClient(...args);const el=document.getElementById('cfee');if(el){el.disabled=!hasSectionAccess('fees');const parent=el.closest?.('.fg');if(parent)parent.hidden=!hasSectionAccess('fees');}};
const scopeClientRender=renderClients;renderClients=function(){const hidden=[];if(!hasSectionAccess('fees'))clients.forEach(c=>{if(c.fee!==undefined){hidden.push([c,c.fee]);delete c.fee;}});try{scopeClientRender();}finally{hidden.forEach(([c,fee])=>c.fee=fee);}};
const scopeSaveClient=saveClient;saveClient=function(){if(!teamOperations()){const c=clients.find(c=>c.id===editCId);if(editCId&&(!c||!canEdit(c.advisorId))){toast('Only your assigned clients can be edited','err');return;}document.getElementById('cadvisor').value=myAId();}return scopeSaveClient();};
const scopePop=popDD;popDD=function(){scopePop();if(CU&&!teamOperations()){for(const id of ['fadvisor','cadvisor']){const el=document.getElementById(id);if(el){el.innerHTML='<option value="'+uiText(myAId())+'">'+uiText(CU.name)+'</option>';el.value=myAId();}}}};
// Guard normal application write APIs against records outside the visible scope.
for(const [apiName,section,getRecords] of [['_entries','entries',()=>entries],['_clients','clients',()=>clients],['_acctg','accounting',()=>acctEntries],['_tasks','tasks',()=>tasksData]]){const api=window[apiName],save=api.save,del=api.del,push=api.push;
 const authorized=(old,data)=>{if(!canChangeSection(section))return false;if(teamOperations())return true;if(!old)return !data?.advisorId||data.advisorId===myAId();const reviewer=apiName==='_acctg'&&isReviewer()&&old.status==='review'&&old.reviewer===CU.name;return (canEdit(old.advisorId)||reviewer)&&(!data||data.advisorId===undefined||data.advisorId===old.advisorId);};
 api.save=function(id,data){const old=getRecords().find(e=>e.id===id);if(!old||!authorized(old,data))return Promise.reject(new Error('This record is outside your permitted access'));if(apiName==='_clients'&&!hasSectionAccess('fees')){const original=(scopeSource.clients||[]).find(c=>c.id===id);data={...data,fee:original?.fee??''};}return save(id,data);};
 api.del=function(id){const old=getRecords().find(e=>e.id===id);if(!old||!authorized(old,null)||(!teamOperations()&&!canEdit(old.advisorId)))return Promise.reject(new Error('This record is outside your permitted access'));return del(id);};
 api.push=function(data){if(!authorized(null,data))return Promise.reject(new Error('Assign new work to your own account'));return push(data);};
}
const scopePermissionNav=applyAccessNavigation;applyAccessNavigation=function(){scopePermissionNav();if(CU&&!teamOperations()){const button=document.getElementById('add-btn');if(button&&curView==='advisors')button.style.display='none';}};
const scopeCanChange=canChangeSection;canChangeSection=function(section){if(isSupervisor()&&['advisors','users','fees'].includes(section))return false;return scopeCanChange(section);};
