/* FCA Student Results Portal — current schema/release RPC */
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const db = window.fcaSupabase;
  const $ = id => document.getElementById(id);
  const loginView = $("loginView"), portalView = $("portalView");
  const form = $("studentLoginForm"), idInput = $("studentId"), passInput = $("studentPassword");
  const tbody = $("resultsTable")?.querySelector("tbody");
  const submit = form?.querySelector('button[type="submit"]');
  const SESSION_KEY = "fca_logged_in_student_id";
  if ($("currentYear")) $("currentYear").textContent = new Date().getFullYear();

  function message(text) {
    let box = $("fcaMessage");
    if (!box) { box = document.createElement("div"); box.id = "fcaMessage"; box.className = "error"; box.setAttribute("role","status"); form?.appendChild(box); }
    box.textContent = text;
  }
  function clearMessage(){ $("fcaMessage")?.remove(); }
  function showPortal(show){ loginView?.classList.toggle("hidden",show); portalView?.classList.toggle("hidden",!show); }
  function esc(v){ return String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }
  function val(o, keys, fallback="—"){ for(const k of keys) if(o && o[k] !== undefined && o[k] !== null && o[k] !== "") return o[k]; return fallback; }
  function rowsOf(p){ if(Array.isArray(p.results))return p.results; if(Array.isArray(p.student_results))return p.student_results; if(Array.isArray(p.data))return p.data; return []; }
  function formNo(s, rows){ let n=Number(val(s,["form_number"],0)); if(n>=1&&n<=4)return n; let text=String(val(s,["class_name","class"],"")); let m=text.match(/(?:form|f)\s*([1-4])/i)||text.match(/\b([1-4])\b/); return m?Number(m[1]):Number(val(rows[0],["form_number"],1)); }
  function markOf(r){ let n=Number(val(r,["percentage","mark","total","score"],NaN)); return Number.isFinite(n)?n:null; }
  function gradeOf(mark,n,stored){ if(stored!=="—"&&stored!==undefined&&stored!==null&&String(stored)!=="")return String(stored); if(mark===null)return "—"; if(n<=2)return mark>=75?"A":mark>=60?"B":mark>=50?"C":mark>=40?"D":"F"; return mark>=80?"1":mark>=70?"2":mark>=65?"3":mark>=60?"4":mark>=55?"5":mark>=50?"6":mark>=45?"7":mark>=40?"8":"9"; }
  function classOf(g,n,stored){ if(stored && stored!=="—")return String(stored); if(n<=2)return ({A:"Distinction",B:"Credit",C:"Credit",D:"Pass",F:"Fail"})[g]||"—"; let x=Number(g); return !Number.isFinite(x)?"—":x<=2?"Distinction":x<=4?"Credit":x<=6?"Competent":x<=8?"Ordinary Pass":"Fail"; }
  function render(p, typedId){
    const s=p.student||p.student_data||p.profile||p, rows=rowsOf(p), n=formNo(s,rows);
    const name=val(s,["full_name","name","student_name"],"Student"), sid=val(s,["student_id","student_number"],typedId);
    $("studentName").textContent=name; $("summaryStudentId").textContent=sid;
    $("summaryClass").textContent=val(s,["class_name","class"],`Form ${n}`);
    $("summaryGender").textContent=val(s,["gender"],"—"); $("studentSubjectCount").textContent=rows.length;
    $("studentPosition").textContent=val(p,["class_position","position_in_class","student_position"],val(s,["class_position","position_in_class"],"—"));
    $("reportYear").textContent=val(rows[0],["academic_year"],new Date().getFullYear());
    const term=val(rows[0],["term"],"Released Results"); $("termLabel").textContent=term;
    if(!tbody)return;
    if(!rows.length){tbody.innerHTML='<tr><td colspan="6">No released subject results were found.</td></tr>'; $("studentAggregate").textContent="—"; $("aggregateFooter").textContent="—"; $("overallResult").textContent="NOT AVAILABLE"; $("overallResult").className="result-status"; return;}
    const prepared=rows.map(r=>{const m=markOf(r),g=gradeOf(m,n,r.grade);return {r,m,g,subject:String(val(r,["subject","subject_name"],"—"))};}).sort((a,b)=>a.subject.localeCompare(b.subject));
    tbody.innerHTML=prepared.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.subject)}</td><td>${x.m===null?"—":esc(Number(x.m.toFixed(1))+"%")}</td><td>${esc(val(x.r,["subject_position","position"],"—"))}</td><td><span class="grade-pill">${esc(x.g)}</span></td><td>${esc(classOf(x.g,n,val(x.r,["classification","remark"],"—")))}</td></tr>`).join("");
    let aggregate="—", passed=false;
    if(n>=3){
      const points=prepared.map(x=>Number(x.g)).filter(x=>Number.isInteger(x)&&x>=1&&x<=9).sort((a,b)=>a-b);
      aggregate=points.length?String(points.slice(0,6).reduce((a,b)=>a+b,0)):"—";
      const english=prepared.find(x=>/english/i.test(x.subject));
      passed=points.length>=6&&points.slice(0,6).every(x=>x<=8)&&(!english||Number(english.g)<=8);
    } else {
      const passing=prepared.filter(x=>x.g!=="F"&&x.g!=="—").length;
      const english=prepared.find(x=>/english/i.test(x.subject));
      passed=passing>=6&&(!english||english.g!=="F");
    }
    aggregate=val(p,["aggregate_points","aggregate","aggregatePoints"],aggregate);
    $("studentAggregate").textContent=aggregate; $("aggregateFooter").textContent=aggregate;
    const override=val(p,["overall_result","overallResult","result_status"],"");
    const result=override&&override!=="—"?String(override).toUpperCase():(passed?"PASS":"FAIL");
    $("overallResult").textContent=result; $("overallResult").className="result-status "+(/^PASS/.test(result)?"pass":"fail");
  }
  async function fetchResults(studentId,password){
    const {data,error}=await db.rpc("fca_student_get_released_results",{p_student_id:studentId,p_access_password:password});
    if(error)throw error;
    let p=data; if(Array.isArray(p)&&p.length===1)p=p[0]; if(typeof p==="string"){try{p=JSON.parse(p)}catch{}}
    if(p?.success===false){if(/not.*released/i.test(p.message||""))throw new Error("Results have not been released by the school yet.");throw new Error(p.message||"Student ID or Access Password is incorrect.");}
    if(!p||p.success===false)throw new Error("Student ID or Access Password is incorrect.");
    return p;
  }
  if(!db){message("Database connection is unavailable. Check config.js and internet access."); if(submit)submit.disabled=true; return;}
  form?.addEventListener("submit",async e=>{
    e.preventDefault();clearMessage();const id=idInput.value.trim(),password=passInput.value.trim();
    if(!id||!password){message("Enter both your Student ID and Access Password.");return;}
    const old=submit?.textContent||"View Results";if(submit){submit.disabled=true;submit.textContent="Checking...";}
    try{const payload=await fetchResults(id,password);render(payload,id);sessionStorage.setItem(SESSION_KEY,id);passInput.value="";showPortal(true);window.scrollTo({top:0,behavior:"smooth"});}
    catch(err){console.error("FCA results lookup:",err);showPortal(false);message(err.message||"Unable to load results. Please try again.");}
    finally{if(submit){submit.disabled=false;submit.textContent=old;}}
  });
  $("downloadPdfBtn")?.addEventListener("click",()=>window.print());
  $("logoutBtn")?.addEventListener("click",()=>{sessionStorage.removeItem(SESSION_KEY);idInput.value="";passInput.value="";clearMessage();showPortal(false);window.scrollTo({top:0,behavior:"smooth"});});
  // Do not restore a portal using only a saved student ID; credentials must be checked again.
  sessionStorage.removeItem(SESSION_KEY);
  showPortal(false);
});
