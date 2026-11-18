(function(){
'use strict';
const nav=document.createElement('div'),view=document.createElement('div');
nav.id='nv-proposals';nav.className='ni';nav.textContent='Proposals';nav.tabIndex=0;nav.setAttribute('role','button');nav.style.display='none';
view.id='view-proposals';view.style.display='none';document.getElementById('nv-fees').after(nav);document.getElementById('view-fees').after(view);
let frame;
function sendClients(){
 if(!frame||!isM())return;
 frame.contentWindow.postMessage({type:'taxportal-proposal-clients',clients:clients.map(c=>({name:c.name||'',contact:c.fao||'',email:c.email||'',address:c.address||''}))},location.origin);
}
window.addEventListener('message',e=>{if(e.origin===location.origin&&frame&&e.source===frame.contentWindow&&e.data?.type==='taxportal-proposal-ready')sendClients();});
const originalView=V;
V=function(section){
 if(section==='proposals'&&!isM())return;
 if(section!=='proposals'){view.style.display='none';nav.classList.remove('active');return originalView.apply(this,arguments);}
 originalView.call(this,'fees');
 if(curView!=='fees')return;
 curView='proposals';document.getElementById('view-fees').style.display='none';document.getElementById('nv-fees').classList.remove('active');document.getElementById('ttitle').textContent='Proposals';document.getElementById('add-btn').style.display='none';document.getElementById('sec-btn').style.display='none';
 view.style.display='';nav.classList.add('active');
 if(!frame){frame=document.createElement('iframe');frame.title='Proposal Studio and History';frame.style.cssText='display:block;width:100%;height:calc(100vh - 125px);min-height:720px;border:0';frame.src='proposal-studio/proposal-builder.html?embedded=1';view.append(frame);}else sendClients();
};
const originalEnter=enterDB;enterDB=function(){const result=originalEnter.apply(this,arguments);nav.style.display=isM()?'':'none';return result;};
const originalLogout=doLogout;doLogout=function(){frame?.remove();frame=undefined;view.style.display='none';nav.style.display='none';return originalLogout.apply(this,arguments);};
nav.onclick=()=>V('proposals');nav.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();V('proposals');}};
})();
