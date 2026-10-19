// Run locally with Application Default Credentials, never in the browser.
// Input is a JSON array on stdin. It contains no passwords.
const fs=require('node:fs');
const {initializeApp,applicationDefault}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore}=require('firebase-admin/firestore');
const P=require('./policy.cjs');
initializeApp({credential:applicationDefault()});
(async()=>{const records=JSON.parse(fs.readFileSync(0,'utf8'));if(!Array.isArray(records)||!records.length||records.length>100)throw new Error('Provide 1–100 staff mappings.');for(const s of records){if(!['manager','supervisor','advisor'].includes(s.role))throw new Error('Unsupported staff role.');const user=await getAuth().getUserByEmail(P.text(s.email,254,true));await getFirestore().collection('staffAccess').doc(user.uid).set({name:P.text(s.name,200,true),role:s.role,legacyAdvisorId:P.id(s.legacyAdvisorId),enabled:s.enabled===true,readOnly:s.readOnly===true,updatedAt:new Date().toISOString()});process.stdout.write('Mapped '+s.name+' as '+s.role+'\n');}})().catch(e=>{process.stderr.write(e.message+'\n');process.exitCode=1;});
