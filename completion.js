// Completing work is independent of the optional reviewer name.
function fillReviewerReferences(){const names=[...new Set([...advisors.map(a=>a.name),...Object.values(users).map(u=>u?.name)].filter(Boolean))].sort();document.getElementById('reviewer-reference-names').innerHTML=names.map(name=>'<option value="'+uiText(name)+'"></option>').join('');}
async function setAccountingStatus(id,status){const e=acctEntries.find(e=>e.id===id);if(!e||!canChangeSection('accounting')||!canEdit(e.advisorId)||!['','inprogress','pendingdocs','done'].includes(status))return;setSyncing(true);try{await window._acctg.save(id,{...e,status,completionMode:'direct',updatedAt:new Date().toISOString()});e.status=status;renderAccounting();if(curView==='workload')renderWorkload();toast(status==='done'?'Completed — no approval needed':'Status updated','ok');}catch(err){toast('Could not update status. Please retry.','err');renderAccounting();}finally{setSyncing(false);}}
cycleAcctStatus=function(id,current){const cycle=['','inprogress','pendingdocs','done'];return setAccountingStatus(id,cycle[(cycle.indexOf(current)+1)%cycle.length]);};
submitForReview=function(){toast('Reviewer names are for reference. Set the status to Completed when finished.');};
approveReview=sendBackReview=function(){toast('Approval steps have been removed. Use the accounting status to complete work.');};
renderReviews=function(){const body=document.getElementById('reviews-tbody');if(body)body.innerHTML='';const summary=document.getElementById('reviews-summary');if(summary)summary.innerHTML='';};
const directPermissionNav=applyAccessNavigation;applyAccessNavigation=function(){directPermissionNav();const n=document.getElementById('nv-reviews');if(n)n.style.display='none';};
// Normalize an old pending-review record only when it is saved, preserving data.
const directAccountingSave=window._acctg.save;window._acctg.save=function(id,data){return directAccountingSave(id,{...data,status:data.status==='review'?'inprogress':data.status,completionMode:'direct'});};
const directOpenAccount=openAcctM;openAcctM=function(...args){directOpenAccount(...args);document.getElementById('acct-advisor').disabled=!teamOperations();};
const directOpenTask=openTaskM;openTaskM=function(...args){directOpenTask(...args);document.getElementById('task-advisor').disabled=!teamOperations();};
