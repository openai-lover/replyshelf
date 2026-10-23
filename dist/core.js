export const MODEL = 'Xenova/all-MiniLM-L6-v2';
export const VERSION = '3.8.1';
export const seed = [
  {id:'refund',title:'Request a refund',category:'Billing',question:'How do I get a refund for my subscription purchase?',answer:'Thanks for reaching out. For our sample policy, purchases made in the last 14 days are eligible for review. Please send your order reference and purchase date so we can check the request. Please do not send payment card details.'},
  {id:'cancel',title:'Cancel a subscription',category:'Billing',question:'How can I cancel my plan and stop the subscription from renewing?',answer:'You can cancel from Settings → Billing → Manage plan → Cancel subscription. Access continues until the end of your current billing period. Cancelling does not automatically request a refund.'},
  {id:'receipt',title:'Find an invoice',category:'Billing',question:'Where can I download an invoice or receipt for a payment?',answer:'Open Settings → Billing → Payment history, choose the relevant payment, then select Download invoice. If it is missing, send us the order reference and we will help locate it.'},
  {id:'password',title:'Reset a password',category:'Account',question:'I forgot my password and cannot sign in. How do I reset my password?',answer:'On the sign-in screen, select Forgot password and enter your account email. Follow the reset link in your inbox. Check your spam folder if it does not arrive. Never share your password or reset link with support.'},
  {id:'email',title:'Change an email address',category:'Account',question:'How can I change the email address associated with my account?',answer:'Open Settings → Profile → Email, enter the new address, and confirm it using the verification email. Keep access to your old address until the change is complete.'},
  {id:'invite',title:'Invite a teammate',category:'Workspace',question:'How do I invite another person to join our team workspace?',answer:'A workspace owner can open Settings → Members → Invite member. Enter your teammate’s work email and choose the appropriate role. Invitations expire after seven days in this fictional example.'},
  {id:'export',title:'Export project data',category:'Workspace',question:'Can I export and download a copy of all my project data?',answer:'Go to your project, open the More menu, and select Export → JSON. Save the file somewhere you control. Exports include project content, but do not include account credentials.'},
  {id:'transfer',title:'Transfer a workspace',category:'Workspace',question:'How do I transfer workspace ownership to another team member?',answer:'The current owner can open Settings → Members, select an existing member, and choose Transfer ownership. Review the new owner carefully before confirming.'}
];
export const benchmarkCases = [
  ['I paid yesterday but would like my money back.','refund'],
  ['I want to stop the recurring charge next month.','cancel'],
  ['My accountant needs proof that I paid.','receipt'],
  ['I cannot remember the secret I use to log in.','password'],
  ['I switched to a different mailbox. Can I update my profile?','email'],
  ['Our new colleague needs access to the shared space.','invite'],
  ['I need a portable backup of everything in my project.','export'],
  ['Someone else will be in charge of this workspace.','transfer']
];
export const unrelatedCases = ['What is the weather in Tokyo tomorrow?','Write a poem about a purple elephant.','How long should I bake sourdough bread?'];
export function dot(a,b) { if (a.length !== b.length) throw Error('Vector dimensions differ'); return a.reduce((s,v,i)=>s+v*b[i],0); }
export function rank(query, vectors, entries) {
  return entries.map((entry,i)=>({id:entry.id,score:dot(query,vectors[i])})).sort((a,b)=>b.score-a.score);
}
// Heuristics, not calibrated probabilities. The user must review every reply.
export function verdict(results) {
  if (!results.length || results[0].score < .42) return 'weak';
  if (results[1] && results[0].score-results[1].score < .06) return 'ambiguous';
  return 'match';
}
export function lexicalRank(query, entries) {
  const tokens=s=>new Set(s.toLowerCase().match(/[a-z0-9]+/g)||[]);
  const q=tokens(query);
  return entries.map(e=>{const t=tokens(e.question);const shared=[...q].filter(x=>t.has(x)).length;return {id:e.id,score:shared/(new Set([...q,...t]).size||1)};}).sort((a,b)=>b.score-a.score);
}
export function validateEntries(value) {
  const rows=Array.isArray(value)?value:value?.entries;
  if(!Array.isArray(rows)||rows.length>100) throw Error('Use a JSON shelf with up to 100 entries.');
  const ids=new Set();
  return rows.map((row,i)=>{
    if(!row||typeof row!=='object') throw Error(`Entry ${i+1} is not an object.`);
    const result={};
    for(const [key,max] of Object.entries({id:80,title:100,category:40,question:500,answer:4000})) {
      const value=row[key];
      if(typeof value!=='string'||!value.trim()||value.length>max) throw Error(`Entry ${i+1}: ${key} must contain 1–${max} characters.`);
      result[key]=value.trim();
    }
    if(ids.has(result.id)) throw Error('Each entry needs a unique id.');
    ids.add(result.id);return result;
  });
}
