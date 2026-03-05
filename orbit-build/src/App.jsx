import { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from 'react';

// ── THEME ─────────────────────────────────────────────────────────────────────
const Ctx = createContext({});
const LIGHT = {bg:"#F2F2F7",bg2:"#FFF",bg3:"#E5E5EA",label:"#000",label2:"rgba(60,60,67,.6)",label3:"rgba(60,60,67,.3)",sep:"rgba(60,60,67,.15)",glass:"rgba(255,255,255,.88)",sh:"0 2px 16px rgba(0,0,0,.08)",shH:"0 8px 32px rgba(0,0,0,.12)"};
const DARK  = {bg:"#000",bg2:"#1C1C1E",bg3:"#2C2C2E",label:"#FFF",label2:"rgba(235,235,245,.6)",label3:"rgba(235,235,245,.3)",sep:"rgba(84,84,88,.6)",glass:"rgba(28,28,30,.92)",sh:"0 2px 16px rgba(0,0,0,.5)",shH:"0 8px 32px rgba(0,0,0,.7)"};

const RC = {
  finance:{s:"#30D158",bg:"rgba(48,209,88,.15)",  dk:"rgba(48,209,88,.08)"},
  health: {s:"#FF375F",bg:"rgba(255,55,95,.15)",   dk:"rgba(255,55,95,.08)"},
  mind:   {s:"#35C0F6",bg:"rgba(53,192,246,.15)",  dk:"rgba(53,192,246,.08)"},
  connect:{s:"#FF6AD5",bg:"rgba(255,106,213,.15)", dk:"rgba(255,106,213,.08)"},
  growth: {s:"#FF9F0A",bg:"rgba(255,159,10,.15)",  dk:"rgba(255,159,10,.08)"},
  custom: {s:"#BF5AF2",bg:"rgba(191,90,242,.15)",  dk:"rgba(191,90,242,.08)"},
};
const CM = {finance:{l:"Finance",i:"💰"},health:{l:"Health",i:"🏃"},mind:{l:"Mind",i:"🧠"},connect:{l:"Connect",i:"❤️"},growth:{l:"Growth",i:"🌱"},custom:{l:"Custom",i:"⭐"}};

// ── DATA ──────────────────────────────────────────────────────────────────────
const PROFILES=[{id:"salary",l:"Salary",icon:"💼",sub:"Fixed monthly income"},{id:"corper",l:"NYSC Corper",icon:"🎖️",sub:"₦77k allawee + extras"},{id:"freelancer",l:"Freelancer",icon:"💻",sub:"Variable income"},{id:"student",l:"Student",icon:"🎓",sub:"Allowance based"},{id:"business",l:"Business",icon:"🛒",sub:"Running your own thing"},{id:"homemaker",l:"Homemaker",icon:"🏡",sub:"Home is your domain"}];
const CITIES=["Lagos","Abuja","Port Harcourt","Ibadan","Kano","Enugu","Other"];
const FOCUS=[{id:"finance",i:"💰",l:"Finance",d:"Budget, savings, debt"},{id:"health",i:"🏃",l:"Health",d:"Fitness & wellness"},{id:"mind",i:"🧠",l:"Mind",d:"Learning & clarity"},{id:"connect",i:"❤️",l:"Connect",d:"People & relationships"},{id:"growth",i:"🌱",l:"Growth",d:"Career & skills"}];
const ECATS=[
  {id:"rent",l:"Rent",i:"🏠",c:"#FF9F0A",g:"Housing"},{id:"elec",l:"Electricity/NEPA",i:"⚡",c:"#FF9F0A",g:"Housing"},{id:"gen",l:"Generator/Fuel",i:"⛽",c:"#FF9F0A",g:"Housing"},{id:"net",l:"Internet/WiFi",i:"📡",c:"#FF9F0A",g:"Housing"},
  {id:"trans",l:"Transport/Fare",i:"🚌",c:"#35C0F6",g:"Transport"},{id:"fuel",l:"Fuel",i:"⛽",c:"#35C0F6",g:"Transport"},{id:"car",l:"Car Repairs",i:"🔩",c:"#35C0F6",g:"Transport"},{id:"ride",l:"Uber/Bolt",i:"🚗",c:"#35C0F6",g:"Transport"},
  {id:"groc",l:"Groceries",i:"🛒",c:"#FF6AD5",g:"Food"},{id:"eat",l:"Eating Out",i:"🍽️",c:"#FF6AD5",g:"Food"},{id:"mkt",l:"Market/Foodstuff",i:"🌽",c:"#FF6AD5",g:"Food"},
  {id:"fam",l:"Family Support",i:"👪",c:"#FF375F",g:"Family"},{id:"dep",l:"Dependents",i:"👶",c:"#FF375F",g:"Family"},{id:"sch",l:"School Fees",i:"🎒",c:"#FF375F",g:"Family"},{id:"gift",l:"Gifts & Support",i:"🎁",c:"#FF375F",g:"Family"},{id:"wed",l:"Aso-ebi/Weddings",i:"💍",c:"#FF375F",g:"Family"},
  {id:"clo",l:"Clothing",i:"👕",c:"#BF5AF2",g:"Personal"},{id:"bty",l:"Beauty & Grooming",i:"💅",c:"#BF5AF2",g:"Personal"},{id:"dat",l:"Data & Airtime",i:"📱",c:"#BF5AF2",g:"Personal"},{id:"med",l:"Health/Medicine",i:"💊",c:"#BF5AF2",g:"Personal"},{id:"gym",l:"Gym & Fitness",i:"🏋️",c:"#BF5AF2",g:"Personal"},
  {id:"tth",l:"Tithe",i:"⛪",c:"#FF9F0A",g:"Faith & Giving"},{id:"off",l:"Offerings",i:"🙏",c:"#FF9F0A",g:"Faith & Giving"},{id:"chr",l:"Charity/Zakat",i:"🤲",c:"#FF9F0A",g:"Faith & Giving"},
  {id:"sav",l:"Savings",i:"🔒",c:"#30D158",g:"Savings"},{id:"eme",l:"Emergency Fund",i:"🛡️",c:"#30D158",g:"Savings"},{id:"inv",l:"Investment",i:"📊",c:"#30D158",g:"Savings"},{id:"pen",l:"Pension/NHF",i:"🏛️",c:"#30D158",g:"Savings"},
  {id:"loa",l:"Loan Repayment",i:"💳",c:"#FF375F",g:"Debt"},{id:"bnp",l:"Buy Now Pay Later",i:"🛍️",c:"#FF375F",g:"Debt"},
  {id:"fun",l:"Entertainment",i:"🎉",c:"#35C0F6",g:"Entertainment"},{id:"str",l:"Streaming/DSTV",i:"📺",c:"#35C0F6",g:"Entertainment"},{id:"trv",l:"Travel",i:"✈️",c:"#35C0F6",g:"Entertainment"},
  {id:"mis",l:"Miscellaneous",i:"🎲",c:"#8E8E93",g:"Other"},{id:"bks",l:"Books/Stationery",i:"📚",c:"#8E8E93",g:"Other"},
];
const GROUPED_ECATS = ECATS.reduce((g,c)=>{(g[c.g]=g[c.g]||[]).push(c);return g;},{});
// ── RING REPOSITORIES ─────────────────────────────────────────────────────────
// Curated goal templates per life category. Starting points, not prescriptions.
const RING_REPOS = {
  health:[
    {icon:"🏃",label:"Morning run",dailyT:1,unit:"km"},
    {icon:"💧",label:"Water intake",dailyT:8,unit:"glasses"},
    {icon:"🏋️",label:"Gym session",dailyT:1,unit:"session"},
    {icon:"🧘",label:"Stretch / yoga",dailyT:1,unit:"session"},
    {icon:"😴",label:"Sleep by 10pm",dailyT:1,unit:"done"},
    {icon:"🚶",label:"10,000 steps",dailyT:10000,unit:"steps"},
    {icon:"🥗",label:"Eat clean",dailyT:3,unit:"meals"},
    {icon:"💊",label:"Take medication",dailyT:1,unit:"done"},
    {icon:"🚴",label:"Cycle",dailyT:1,unit:"session"},
    {icon:"🏊",label:"Swim",dailyT:1,unit:"session"},
    {icon:"🌬️",label:"Breathing exercise",dailyT:5,unit:"mins"},
    {icon:"⚖️",label:"Weigh in",dailyT:1,unit:"done"},
  ],
  mind:[
    {icon:"📚",label:"Read",dailyT:20,unit:"mins"},
    {icon:"🧘",label:"Meditate",dailyT:10,unit:"mins"},
    {icon:"✍️",label:"Journal",dailyT:1,unit:"entry"},
    {icon:"🎯",label:"Deep work block",dailyT:1,unit:"session"},
    {icon:"📵",label:"No doom scroll",dailyT:1,unit:"done"},
    {icon:"🌅",label:"Morning routine",dailyT:1,unit:"done"},
    {icon:"🧩",label:"Learn something new",dailyT:1,unit:"done"},
    {icon:"🙏",label:"Gratitude practice",dailyT:1,unit:"done"},
    {icon:"🎵",label:"Intentional listening",dailyT:1,unit:"done"},
    {icon:"💭",label:"Reflect on the day",dailyT:1,unit:"done"},
  ],
  connect:[
    {icon:"☎️",label:"Call family",dailyT:1,unit:"call"},
    {icon:"🤝",label:"Quality time",dailyT:1,unit:"done"},
    {icon:"💌",label:"Check on a friend",dailyT:1,unit:"done"},
    {icon:"🙏",label:"Pray together",dailyT:1,unit:"done"},
    {icon:"🍽️",label:"Family meal",dailyT:1,unit:"done"},
    {icon:"💬",label:"Real conversation",dailyT:1,unit:"done"},
    {icon:"🎁",label:"Act of kindness",dailyT:1,unit:"done"},
    {icon:"📖",label:"Read to someone",dailyT:1,unit:"done"},
  ],
  growth:[
    {icon:"🛠️",label:"Skill practice",dailyT:1,unit:"hr"},
    {icon:"📝",label:"Work on application",dailyT:1,unit:"done"},
    {icon:"💼",label:"Network",dailyT:1,unit:"done"},
    {icon:"🎓",label:"Online course",dailyT:1,unit:"lesson"},
    {icon:"✍️",label:"Write content",dailyT:1,unit:"done"},
    {icon:"💻",label:"Build something",dailyT:1,unit:"hr"},
    {icon:"📊",label:"Review goals",dailyT:1,unit:"done"},
    {icon:"🌐",label:"LinkedIn update",dailyT:1,unit:"done"},
    {icon:"📖",label:"Read industry news",dailyT:1,unit:"done"},
    {icon:"🎙️",label:"Practice speaking",dailyT:1,unit:"done"},
  ],
  finance:[
    {icon:"🔒",label:"Log a saving",dailyT:1,unit:"done"},
    {icon:"📝",label:"Track spending",dailyT:1,unit:"done"},
    {icon:"📊",label:"Review budget",dailyT:1,unit:"done"},
    {icon:"💡",label:"No impulse buy",dailyT:1,unit:"done"},
    {icon:"🎯",label:"Stick to budget",dailyT:1,unit:"done"},
    {icon:"📈",label:"Check investment",dailyT:1,unit:"done"},
    {icon:"🧾",label:"File an expense",dailyT:1,unit:"done"},
  ],
  custom:[
    {icon:"⭐",label:"Personal goal",dailyT:1,unit:"done"},
    {icon:"🎯",label:"Daily target",dailyT:1,unit:"done"},
    {icon:"🌟",label:"Good habit",dailyT:1,unit:"done"},
    {icon:"✅",label:"Task complete",dailyT:1,unit:"done"},
    {icon:"🔁",label:"Repeat daily",dailyT:1,unit:"done"},
  ],
};

// ── NIGERIA TAX ENGINE (PITA 2011 as amended) ─────────────────────────────────
// • PITA Cap P8 LFN 2004 (as amended 2011) s.34 — graduated rates
// • s.33 — CRA = max(₦200k, 1% gross) + 20% gross
// • Pension Reform Act 2014 s.4(1)(b) — 8% employee contribution
// • NHF Act Cap N45 LFN 2004 s.4 — 2.5% monthly basic
// • Finance Act 2020 — minimum tax 1% gross (exempt if gross ≤ ₦300k p.a.)
const TAX_BRACKETS = [
  {limit:300000,  rate:0.07, label:"First ₦300,000"},
  {limit:300000,  rate:0.11, label:"Next ₦300,000"},
  {limit:500000,  rate:0.15, label:"Next ₦500,000"},
  {limit:500000,  rate:0.19, label:"Next ₦500,000"},
  {limit:1600000, rate:0.21, label:"Next ₦1,600,000"},
  {limit:Infinity,rate:0.24, label:"Above ₦3,200,000"},
];
function calcTax(monthlyGross) {
  const gross = monthlyGross * 12;
  const pension = Math.round(gross * 0.08);
  const nhf = Math.round(monthlyGross * 0.025 * 12);
  const craBase = Math.max(200000, gross * 0.01);
  const cra = Math.round(craBase + gross * 0.20);
  const taxableIncome = Math.max(0, gross - pension - nhf - cra);
  let computed = 0, rem = taxableIncome;
  const breakdown = [];
  for (const b of TAX_BRACKETS) {
    if (rem <= 0) break;
    const slice = isFinite(b.limit) ? Math.min(rem, b.limit) : rem;
    const btax = Math.round(slice * b.rate);
    if (slice > 0) breakdown.push({label:b.label, rate:b.rate, slice:Math.round(slice), tax:btax});
    computed += btax; rem -= slice;
  }
  const minTax = gross > 300000 ? Math.round(gross * 0.01) : 0;
  const annualTax = Math.max(computed, minTax);
  return {
    gross, pension, nhf, cra, taxableIncome,
    annualTax, monthlyTax: Math.round(annualTax/12),
    monthlyPension: Math.round(pension/12), monthlyNhf: Math.round(nhf/12),
    effectiveRate: gross > 0 ? annualTax/gross : 0,
    breakdown,
    takeHome: monthlyGross - Math.round(annualTax/12) - Math.round(pension/12) - Math.round(nhf/12),
    isMinTax: annualTax === minTax && minTax > computed,
  };
}


// ── GAME ──────────────────────────────────────────────────────────────────────
const LEVELS=[{min:0,name:"Starting",icon:"🌱",color:"#8E8E93"},{min:3,name:"Building",icon:"🔥",color:"#FF9F0A"},{min:10,name:"Consistent",icon:"⚡",color:"#35C0F6"},{min:30,name:"Committed",icon:"💎",color:"#BF5AF2"},{min:60,name:"Disciplined",icon:"🏆",color:"#FF375F"},{min:100,name:"Legend",icon:"⭐",color:"#30D158"}];
const getLevel = (n) => {let lv=LEVELS[0];for(const l of LEVELS)if(n>=l.min)lv=l;const ni=LEVELS.indexOf(lv)+1;const next=LEVELS[ni];return {...lv,next,prog:next?Math.min((n-lv.min)/(next.min-lv.min)*100,100):100};};
const ACHIEVEMENTS=[{id:"first",icon:"🌟",title:"First Orbit",desc:"First perfect day"},{id:"str3",icon:"🔥",title:"3-Day Streak",desc:"3 consecutive days"},{id:"str7",icon:"⚡",title:"Week Warrior",desc:"7 days in a row"},{id:"str14",icon:"💪",title:"Two Weeks",desc:"14 days in a row"},{id:"str30",icon:"💎",title:"Diamond Ring",desc:"30 days in a row"},{id:"str100",icon:"⭐",title:"Legend",desc:"100 days in a row"},{id:"week",icon:"🏆",title:"Perfect Week",desc:"All 7 days in a week"},{id:"friend",icon:"🤝",title:"Connected",desc:"Added your first friend"},{id:"budget",icon:"💰",title:"Money Moves",desc:"5 finance days in a row"}];
const checkAch = (stats,friends) => {const u=new Set();if(stats.total>=1)u.add("first");if(stats.streak>=3)u.add("str3");if(stats.streak>=7)u.add("str7");if(stats.streak>=14)u.add("str14");if(stats.streak>=30)u.add("str30");if(stats.streak>=100)u.add("str100");if(stats.bestWeek>=7)u.add("week");if((friends||[]).length>0)u.add("friend");if(stats.finStreak>=5)u.add("budget");return u;};
const calcStats = (history) => {
  let streak=0,total=0,finStreak=0,weekRun=0,bestWeek=0;
  const keys=Object.keys(history).sort();
  keys.forEach(k=>{if(history[k]?.perfect){total++;weekRun++;if(weekRun>bestWeek)bestWeek=weekRun;}else weekRun=0;});
  let d=new Date(),checking=true;
  while(checking){d=new Date(d);d.setDate(d.getDate()-1);const k=d.toISOString().slice(0,10);if(history[k]?.perfect)streak++;else checking=false;}
  let d2=new Date(),fc=true;
  while(fc){d2=new Date(d2);d2.setDate(d2.getDate()-1);const k=d2.toISOString().slice(0,10);if((history[k]?.cats?.finance||0)>=.85)finStreak++;else fc=false;}
  return {streak,total,bestWeek:Math.min(bestWeek,7),finStreak};
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const todayKey = () => new Date().toISOString().slice(0,10);
const genId = () => "ORBIT-"+Math.random().toString(36).substr(2,6).toUpperCase();
const genHistory = (focus=[]) => {
  const h={},now=new Date(),cats=focus.length?focus.slice(0,3):["finance","health","mind"];
  for(let i=90;i>=1;i--){
    const d=new Date(now);d.setDate(d.getDate()-i);
    const k=d.toISOString().slice(0,10);
    const good=Math.random()>0.28;
    const catData={};cats.forEach(c=>{catData[c]=good?(Math.random()*.35+.65):(Math.random()*.55);});
    const avg=Object.values(catData).reduce((s,v)=>s+v,0)/cats.length;
    h[k]={cats:catData,avg,perfect:avg>=0.85};
  }
  return h;
};
const pct = g => Math.min((g.todayP||0)/Math.max(g.dailyT||1,1)*100,100);

// ── RING REPOSITORIES ─────────────────────────────────────────────────────────
// Pre-built goal templates users can browse and add to their rings.
// These are *not* financial — they are behavioural/lifestyle habits.
const RING_REPOS = {
  health:[
    {icon:"🏃",label:"Morning Run",     dailyT:1, unit:"session",  desc:"Move before the day starts"},
    {icon:"💧",label:"Water Intake",    dailyT:8, unit:"glasses",   desc:"8 glasses, every day"},
    {icon:"🏋️",label:"Strength Train", dailyT:1, unit:"session",  desc:"Lift, push, pull"},
    {icon:"🚶",label:"10k Steps",       dailyT:10000,unit:"steps",  desc:"Walk everywhere you can"},
    {icon:"😴",label:"Sleep 8 hrs",     dailyT:1, unit:"night",    desc:"The foundation of everything"},
    {icon:"🥗",label:"Eat Clean",       dailyT:2, unit:"meals",    desc:"Two whole-food meals minimum"},
    {icon:"🧘",label:"Stretch/Yoga",    dailyT:1, unit:"session",  desc:"10 minutes of real presence"},
    {icon:"💊",label:"Take Medication", dailyT:1, unit:"done",     desc:"Never miss a dose"},
    {icon:"🚴",label:"Cycling",         dailyT:1, unit:"ride",     desc:"Eco, cheap, healthy"},
    {icon:"🏊",label:"Swimming",        dailyT:1, unit:"session",  desc:"Full body, low impact"},
  ],
  mind:[
    {icon:"📚",label:"Read",            dailyT:1, unit:"session",  desc:"20 pages or 20 minutes minimum"},
    {icon:"🧘",label:"Meditate",        dailyT:10,unit:"mins",     desc:"Sit still. Nothing else."},
    {icon:"📓",label:"Journal",         dailyT:1, unit:"entry",    desc:"Write what happened today"},
    {icon:"🎧",label:"Learn Podcast",   dailyT:1, unit:"episode",  desc:"Replace music with understanding"},
    {icon:"📵",label:"Phone-free hour", dailyT:1, unit:"hr",       desc:"One hour with no screen"},
    {icon:"🧩",label:"Deep Work",       dailyT:1, unit:"session",  desc:"90 mins of focused output"},
    {icon:"🌅",label:"Morning quiet",   dailyT:1, unit:"done",     desc:"Before your phone, 5 minutes"},
    {icon:"📝",label:"Brain dump",      dailyT:1, unit:"done",     desc:"Empty your head onto paper"},
  ],
  connect:[
    {icon:"☎️",label:"Call family",     dailyT:1, unit:"call",     desc:"Pick up the phone"},
    {icon:"🤝",label:"Quality time",    dailyT:1, unit:"done",     desc:"Present, phone-down time"},
    {icon:"💌",label:"Check in",        dailyT:1, unit:"message",  desc:"A real message, not a reaction"},
    {icon:"🍽️",label:"Eat together",   dailyT:1, unit:"meal",     desc:"Food is community"},
    {icon:"🚶",label:"Walk & talk",     dailyT:1, unit:"session",  desc:"The best conversations are moving"},
    {icon:"🙏",label:"Pray together",   dailyT:1, unit:"done",     desc:"Spiritual connection"},
  ],
  growth:[
    {icon:"🛠️",label:"Skill practice",  dailyT:1, unit:"hr",      desc:"1 hour compounds into mastery"},
    {icon:"📝",label:"Work on goal",    dailyT:1, unit:"done",     desc:"One deliberate step forward"},
    {icon:"🔍",label:"Send application",dailyT:1, unit:"sent",     desc:"Consistency beats perfection"},
    {icon:"🎓",label:"Course lesson",   dailyT:1, unit:"lesson",   desc:"One module a day"},
    {icon:"💼",label:"Network",         dailyT:1, unit:"contact",  desc:"One meaningful interaction"},
    {icon:"✍️",label:"Write / Create",  dailyT:1, unit:"session",  desc:"Make something that did not exist"},
    {icon:"🌐",label:"Language study",  dailyT:15,unit:"mins",     desc:"15 minutes a day changes you"},
  ],
  finance:[
    {icon:"🔒",label:"Log a saving",    dailyT:1, unit:"done",     desc:"Mark that you saved today"},
    {icon:"📝",label:"Track spending",  dailyT:1, unit:"done",     desc:"Know every naira that left"},
    {icon:"💳",label:"No impulse buy",  dailyT:1, unit:"day",      desc:"72-hour rule. Stick to it."},
    {icon:"📊",label:"Check balance",   dailyT:1, unit:"done",     desc:"Know your number daily"},
    {icon:"📦",label:"Cook at home",    dailyT:2, unit:"meals",    desc:"The most reliable money-saver"},
  ],
  custom:[
    {icon:"🌱",label:"Plant care",      dailyT:1, unit:"done",     desc:"Tends to patience"},
    {icon:"🎨",label:"Create art",      dailyT:1, unit:"session",  desc:"Make something beautiful"},
    {icon:"🎵",label:"Music practice",  dailyT:1, unit:"session",  desc:"15 minutes a day"},
    {icon:"🙏",label:"Prayer",          dailyT:1, unit:"done",     desc:"Intentional spiritual time"},
    {icon:"🧹",label:"Tidy space",      dailyT:1, unit:"done",     desc:"Your environment shapes your mind"},
    {icon:"🌄",label:"Morning routine", dailyT:1, unit:"done",     desc:"A consistent start changes everything"},
  ],
};

// ── NIGERIA STATUTORY TAX ──────────────────────────────────────────────────────
// Source: Personal Income Tax Act (PITA) Cap P8 LFN 2004 (as amended 2011, 2020)
// Finance Act 2020 updates included.
const TAX_BANDS=[
  {limit:300000,  rate:.07, label:"First ₦300,000",          statute:"PITA S.37(1)(a)"},
  {limit:300000,  rate:.11, label:"Next ₦300,000",           statute:"PITA S.37(1)(b)"},
  {limit:500000,  rate:.15, label:"Next ₦500,000",           statute:"PITA S.37(1)(c)"},
  {limit:500000,  rate:.19, label:"Next ₦500,000",           statute:"PITA S.37(1)(d)"},
  {limit:1600000, rate:.21, label:"Next ₦1,600,000",         statute:"PITA S.37(1)(e)"},
  {limit:Infinity,rate:.24, label:"Above ₦3,200,000",        statute:"PITA S.37(1)(f)"},
];
// CRA: Consolidated Relief Allowance (PITA S.33)
// Pension: PRA 2014 S.9(1)(b) — 8% employee contribution
// NHF: National Housing Fund Act S.4 — 2.5% of basic
// NHIS: deductible where applicable
function calcNigerianTax(annualGross, employmentType="salary") {
  if(!annualGross||annualGross<=0) return {tax:0,monthly:0,effectiveRate:0,breakdown:[],netAnnual:0,taxableIncome:0,cra:0,pension:0};
  // NYSC corpers: allawee is government stipend, exempt from PAYE per FIRS guidance
  if(employmentType==="corper") return {tax:0,monthly:0,effectiveRate:0,breakdown:[],netAnnual:annualGross,taxableIncome:0,cra:0,pension:0,exempt:true};
  // CRA = max(₦200,000 or 1% of gross) + 20% of gross  [PITA S.33(1)]
  const cra = Math.max(200000, annualGross*0.01) + annualGross*0.20;
  // Pension: 8% of gross (simplified — ideally 8% of basic+housing+transport)  [PRA 2014]
  const pension = employmentType==="salary"||employmentType==="business" ? annualGross*0.08 : 0;
  // NHF: 2.5% of basic (salary earners only, capped)
  const nhf = employmentType==="salary" ? Math.min(annualGross*0.025, 60000) : 0;
  const taxable = Math.max(0, annualGross - cra - pension - nhf);
  // Apply bands
  let remaining=taxable, tax=0;
  const breakdown=[];
  for(const band of TAX_BANDS){
    if(remaining<=0) break;
    const chunk=Math.min(remaining,band.limit);
    const t=chunk*band.rate;
    if(chunk>0) breakdown.push({...band,taxable:chunk,tax:t});
    tax+=t; remaining-=chunk;
  }
  // Minimum tax: 1% of gross if tax < minimum [PITA S.37(2)]
  const minTax = annualGross*0.01;
  const finalTax = Math.max(tax, minTax);
  const effectiveRate = finalTax/annualGross*100;
  const netAnnual = annualGross - finalTax - pension - nhf;
  return {tax:finalTax,monthly:finalTax/12,effectiveRate,breakdown,netAnnual,netMonthly:netAnnual/12,taxableIncome:taxable,cra,pension,nhf,minTax,usedMinTax:finalTax===minTax&&finalTax>tax};
}

const MOCK_FRIENDS=[{id:"ORBIT-9F2K",name:"Chidi O.",streak:12,total:31,todayPct:.75,focus:["finance","health","mind"]},{id:"ORBIT-4B7M",name:"Amaka N.",streak:5,total:14,todayPct:1,focus:["health","connect","growth"]},{id:"ORBIT-1X3P",name:"Tunde A.",streak:0,total:4,todayPct:.4,focus:["finance","growth"]}];

function buildGoals(profile) {
  let id=1;const g=[];const m=profile.gender==="male";const d=todayKey();
  const mk=(cat,icon,label,dailyT,unit,pinned=false)=>({id:id++,category:cat,icon,label,dailyT,todayP:0,lastDate:d,pinned,unit,active:true});
  if(profile.focus.includes("finance")){g.push(mk("finance","🔒","Log a saving",1,"done",true));g.push(mk("finance","📝","Track spending",1,"done",true));}
  if(profile.focus.includes("health")){g.push(mk("health","🏃",m?"Workout":"Exercise",1,"session",true));g.push(mk("health","💧","Water intake",8,"glasses",false));}
  if(profile.focus.includes("mind")){g.push(mk("mind","📚","Read",1,"session",false));g.push(mk("mind","🧘","Mindful moment",1,"done",false));}
  if(profile.focus.includes("connect")){g.push(mk("connect","☎️","Check in",1,"call",false));g.push(mk("connect","🤝","Quality time",1,"done",false));}
  if(profile.focus.includes("growth")){g.push(mk("growth","🛠️","Skill practice",1,"hr",false));g.push(mk("growth","📝","Work on goal",1,"done",false));}
  g.forEach((x,i)=>{if(i<3)x.pinned=true;});
  return g;
}
function buildBudget(p) {
  const inc=p.income,m=p.gender==="male";
  return [
    {id:"b1",l:"Savings",i:"🔒",c:"#30D158",amt:Math.round(inc*.15/500)*500},
    {id:"b2",l:"Transport",i:"🚌",c:"#35C0F6",amt:Math.round(inc*.18/500)*500},
    {id:"b3",l:"Groceries/Food",i:"🛒",c:"#FF6AD5",amt:Math.round(inc*.20/500)*500},
    {id:"b4",l:"Family Support",i:"👪",c:"#FF375F",amt:Math.round(inc*.10/500)*500},
    {id:"b5",l:"Data & Airtime",i:"📱",c:"#BF5AF2",amt:Math.round(inc*.05/500)*500},
    {id:"b6",l:m?"Entertainment":"Beauty & Grooming",i:m?"🎉":"💅",c:"#35C0F6",amt:Math.round(inc*.08/500)*500},
    {id:"b7",l:"Tithe",i:"⛪",c:"#FF9F0A",amt:Math.round(inc*.10/500)*500},
    {id:"b8",l:"Emergency Fund",i:"🛡️",c:"#30D158",amt:Math.round(inc*.07/500)*500},
    {id:"b9",l:"Miscellaneous",i:"🎲",c:"#8E8E93",amt:Math.round(inc*.05/500)*500},
  ];
}

// ── MINI RINGS ────────────────────────────────────────────────────────────────
function MiniRings({cats={},size=26}) {
  const entries=Object.entries(cats).slice(0,3);
  if(!entries.length) return <div style={{width:size,height:size,borderRadius:"50%",background:"rgba(128,128,128,.12)"}}/>;
  const sw=2.6,gap=1.1,cx=size/2;
  return (
    <svg width={size} height={size} style={{display:"block",flexShrink:0}}>
      {entries.map(([cat,v],i)=>{
        const r=cx-sw/2-i*(sw+gap);if(r<=1.5)return null;
        const c=2*Math.PI*r,off=c*(1-Math.min(v,1)),col=RC[cat]?.s||RC.custom.s;
        return <g key={cat}><circle cx={cx} cy={cx} r={r} fill="none" stroke={col} strokeOpacity=".2" strokeWidth={sw}/><circle cx={cx} cy={cx} r={r} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cx})`}/></g>;
      })}
    </svg>
  );
}

// ── BIG RINGS ─────────────────────────────────────────────────────────────────
function BigRings({goals=[],size=210,animated=true}) {
  const {T}=useContext(Ctx);
  const active=goals.filter(g=>g.active!==false&&g.pinned).slice(0,5);
  if(!active.length) return <div style={{width:size,height:size,borderRadius:"50%",background:"rgba(128,128,128,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:38,opacity:.3}}>⊙</span></div>;
  const sw=13,gap=5,R=size/2-sw-2,cx=size/2;
  const total=active.reduce((s,g)=>s+Math.min(pct(g),100),0)/active.length;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{position:"absolute",inset:0,overflow:"visible"}}>
        {active.map((g,i)=>{
          const r=R-i*(sw+gap),c=2*Math.PI*r,p=Math.min(pct(g),100),off=c-p/100*c,col=RC[g.category]?.s||RC.custom.s,a=(-90+p/100*360)*Math.PI/180;
          return <g key={g.id}>
            <circle cx={cx} cy={cx} r={r} fill="none" stroke={col} strokeOpacity=".18" strokeWidth={sw}/>
            <circle cx={cx} cy={cx} r={r} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={animated?off:c} transform={`rotate(-90 ${cx} ${cx})`} style={{transition:`stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1) ${i*.1}s`,filter:`drop-shadow(0 0 5px ${col}88)`}}/>
            {p>2&&p<99.5&&<circle cx={cx+r*Math.cos(a)} cy={cx+r*Math.sin(a)} r={sw*.35} fill={col}/>}
          </g>;
        })}
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
        <div style={{fontWeight:800,fontSize:size*.13,lineHeight:1,letterSpacing:"-.02em",color:T.label}}>{Math.round(total)}%</div>
        <div style={{fontSize:size*.052,color:T.label2,marginTop:3}}>today</div>
      </div>
    </div>
  );
}

// ── ONBOARDING ────────────────────────────────────────────────────────────────
function Onboarding({onComplete}) {
  const {dark,T}=useContext(Ctx);
  const [step,setStep]=useState(0);
  const [d,setD]=useState({name:"",gender:"",focus:[],income:"",profile:"",city:""});
  const [building,setBuilding]=useState(false);
  const set=(k,v)=>setD(p=>({...p,[k]:v}));
  const valid=[d.name.trim().length>=2&&!!d.gender,d.focus.length>=1,!d.focus.includes("finance")||parseInt(d.income.replace(/,/g,""))>=500,!!d.profile,!!d.city];
  const next=()=>{
    if(step===4){setBuilding(true);setTimeout(()=>{const p={...d,income:parseInt(d.income.replace(/,/g,""))||50000};onComplete(p,buildGoals(p),buildBudget(p));},1600);return;}
    if(step===1&&!d.focus.includes("finance")){setStep(3);return;}
    setStep(s=>s+1);
  };
  const back=()=>{if(step===3&&!d.focus.includes("finance")){setStep(1);return;}setStep(s=>Math.max(0,s-1));};
  const inp={width:"100%",padding:"13px 16px",borderRadius:14,border:`1.5px solid ${T.sep}`,background:T.bg3,color:T.label,fontSize:15,fontFamily:"inherit",fontWeight:600,outline:"none"};
  if(building) return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:dark?"#000":"#F2F2F7",gap:20,padding:32,textAlign:"center"}}>
      <BigRings goals={[{id:1,category:"finance",todayP:8,dailyT:10,active:true,pinned:true},{id:2,category:"health",todayP:5,dailyT:10,active:true,pinned:true},{id:3,category:"mind",todayP:4,dailyT:10,active:true,pinned:true}]} size={180} animated/>
      <div style={{fontWeight:800,fontSize:20,color:T.label}}>Setting up your orbit...</div>
      <div style={{fontSize:14,color:T.label2,lineHeight:1.7,maxWidth:280}}>Everything here is yours. You decide what gets tracked, logged, and what matters.</div>
    </div>
  );
  const steps=[
    <div key="0">
      <div style={{fontSize:42,marginBottom:12}}>👋</div>
      <div style={{fontWeight:800,fontSize:26,color:T.label,letterSpacing:"-.03em",lineHeight:1.2,marginBottom:8}}>First, what do we call you?</div>
      <div style={{fontSize:14,color:T.label2,marginBottom:22,lineHeight:1.75}}>Orbit shows you where you are — clearly and honestly. No nudges, no scores. Just truth.</div>
      <input value={d.name} onChange={e=>set("name",e.target.value)} placeholder="Your name" autoFocus style={{...inp,fontSize:20,fontWeight:700,marginBottom:20,borderColor:d.name.trim().length>=2?RC.finance.s:T.sep}}/>
      <div style={{fontSize:11,color:T.label3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10,fontWeight:600}}>Gender</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{id:"male",i:"🧔",l:"Male"},{id:"female",i:"👩",l:"Female"}].map(g=>(
          <button key={g.id} onClick={()=>set("gender",g.id)} style={{padding:"18px 14px",borderRadius:18,border:`2px solid ${d.gender===g.id?RC.finance.s:T.sep}`,background:d.gender===g.id?RC.finance.bg:T.bg2,cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>{g.i}</div><div style={{fontWeight:700,fontSize:15,color:T.label}}>{g.l}</div>
          </button>
        ))}
      </div>
    </div>,
    <div key="1">
      <div style={{fontSize:42,marginBottom:12}}>◎</div>
      <div style={{fontWeight:800,fontSize:26,color:T.label,letterSpacing:"-.03em",lineHeight:1.2,marginBottom:8}}>What areas matter right now?</div>
      <div style={{fontSize:14,color:T.label2,marginBottom:22,lineHeight:1.75}}>Each becomes a ring. You close it daily — one deliberate tap at a time.</div>
      {FOCUS.map(f=>{const sel=d.focus.includes(f.id),col=RC[f.id];return(
        <button key={f.id} onClick={()=>set("focus",sel?d.focus.filter(x=>x!==f.id):[...d.focus,f.id])} style={{display:"flex",alignItems:"center",gap:14,width:"100%",padding:"13px 16px",borderRadius:18,border:`2px solid ${sel?col.s:T.sep}`,background:sel?col.bg:T.bg2,cursor:"pointer",marginBottom:8,textAlign:"left"}}>
          <div style={{width:40,height:40,borderRadius:13,background:sel?col.s:T.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{f.i}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.label}}>{f.l}</div><div style={{fontSize:12,color:T.label2,marginTop:2}}>{f.d}</div></div>
          <div style={{width:20,height:20,borderRadius:99,background:sel?col.s:T.bg3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700}}>{sel?"✓":""}</div>
        </button>
      );})}
    </div>,
    <div key="2">
      <div style={{fontSize:42,marginBottom:12}}>💵</div>
      <div style={{fontWeight:800,fontSize:26,color:T.label,letterSpacing:"-.03em",lineHeight:1.2,marginBottom:8}}>What comes in each month?</div>
      <div style={{fontSize:14,color:T.label2,marginBottom:22,lineHeight:1.75}}>Private. Never leaves your phone. Honest numbers are the only kind that help.</div>
      <div style={{position:"relative",marginBottom:14}}>
        <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",fontSize:20,fontWeight:700,color:RC.finance.s}}>₦</span>
        <input value={d.income} type="tel" inputMode="numeric" placeholder="0" onChange={e=>{const r=e.target.value.replace(/\D/g,"");set("income",r?parseInt(r).toLocaleString():"");}} style={{...inp,paddingLeft:48,fontSize:24,fontWeight:800,borderColor:parseInt(d.income.replace(/,/g,""))>=500?RC.finance.s:T.sep}}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {[77000,100000,150000,200000,300000,500000].map(a=>(
          <button key={a} onClick={()=>set("income",a.toLocaleString())} style={{padding:"7px 13px",borderRadius:99,border:`1.5px solid ${d.income===a.toLocaleString()?RC.finance.s:T.sep}`,background:d.income===a.toLocaleString()?RC.finance.bg:T.bg2,fontSize:13,fontWeight:600,color:d.income===a.toLocaleString()?RC.finance.s:T.label2,cursor:"pointer"}}>₦{a.toLocaleString()}</button>
        ))}
      </div>
    </div>,
    <div key="3">
      <div style={{fontSize:42,marginBottom:12}}>💼</div>
      <div style={{fontWeight:800,fontSize:26,color:T.label,letterSpacing:"-.03em",lineHeight:1.2,marginBottom:8}}>What describes your situation?</div>
      <div style={{fontSize:14,color:T.label2,marginBottom:20,lineHeight:1.75}}>A corper and a business owner do not face the same pressures.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {PROFILES.map(p=>(
          <button key={p.id} onClick={()=>set("profile",p.id)} style={{padding:"15px 12px",borderRadius:18,border:`2px solid ${d.profile===p.id?RC.growth.s:T.sep}`,background:d.profile===p.id?RC.growth.bg:T.bg2,cursor:"pointer",textAlign:"left"}}>
            <div style={{fontSize:26,marginBottom:8}}>{p.icon}</div><div style={{fontWeight:700,fontSize:13,color:T.label}}>{p.l}</div><div style={{fontSize:11,color:T.label2,marginTop:2}}>{p.sub}</div>
          </button>
        ))}
      </div>
    </div>,
    <div key="4">
      <div style={{fontSize:42,marginBottom:12}}>📍</div>
      <div style={{fontWeight:800,fontSize:26,color:T.label,letterSpacing:"-.03em",lineHeight:1.2,marginBottom:8}}>Where are you based?</div>
      <div style={{fontSize:14,color:T.label2,marginBottom:20,lineHeight:1.75}}>₦50k goes differently in Lagos vs Kano. Where you live is part of the truth.</div>
      <div style={{background:T.bg2,borderRadius:20,overflow:"hidden",boxShadow:T.sh}}>
        {CITIES.map((city,i)=>(
          <button key={city} onClick={()=>set("city",city)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"15px 18px",background:d.city===city?RC.connect.bg:T.bg2,border:"none",borderBottom:i<CITIES.length-1?`1px solid ${T.sep}`:"none",cursor:"pointer",textAlign:"left"}}>
            <span style={{fontWeight:600,fontSize:16,color:T.label}}>{city}</span>
            {d.city===city&&<span style={{color:RC.connect.s,fontWeight:700}}>✓</span>}
          </button>
        ))}
      </div>
    </div>,
  ];
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:dark?"#000":"#F2F2F7"}}>
      <div style={{padding:"16px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <button onClick={back} style={{background:"none",border:"none",color:step>0?RC.mind.s:"transparent",fontSize:14,fontWeight:600,cursor:"pointer",padding:"4px 0"}}>Back</button>
          <span style={{fontSize:13,color:T.label3}}>{step+1} / 5</span>
        </div>
        <div style={{height:4,background:T.bg3,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,background:`linear-gradient(90deg,${RC.finance.s},${RC.mind.s})`,width:`${(step+1)/5*100}%`,transition:"width .4s"}}/>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 16px"}}>{steps[step]}</div>
      <div style={{padding:"12px 20px 20px"}}>
        <button onClick={next} disabled={!valid[step]} style={{width:"100%",padding:"16px",borderRadius:20,background:valid[step]?"#000":T.bg3,color:valid[step]?"#fff":T.label3,border:"none",fontSize:17,fontWeight:700,cursor:valid[step]?"pointer":"default",transition:"all .2s",boxShadow:valid[step]?"0 4px 24px rgba(0,0,0,.25)":"none"}}>
          {step===4?"Start my orbit →":"Continue →"}
        </button>
      </div>
    </div>
  );
}

// ── REPO SHEET ────────────────────────────────────────────────────────────────
function RepoSheet({onAdd,onClose,existingLabels=[]}) {
  const {dark,T}=useContext(Ctx);
  const [selCat,setSelCat]=useState("health");
  const cats=Object.keys(RING_REPOS);
  return (
    <div style={{position:"absolute",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)"}} onClick={onClose}/>
      <div style={{position:"relative",background:T.bg2,borderRadius:"26px 26px 0 0",maxHeight:"88%",display:"flex",flexDirection:"column",animation:"popIn .3s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${T.sep}`}}>
          <div style={{width:38,height:5,borderRadius:99,background:T.bg3,margin:"0 auto 14px"}}/>
          <div style={{fontWeight:800,fontSize:19,color:T.label,marginBottom:4}}>Goal Library</div>
          <div style={{fontSize:12,color:T.label2,marginBottom:12,lineHeight:1.5}}>Pre-built habits and routines. Tap any to add it to your rings.</div>
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:2}}>
            {cats.map(c=>{const col=RC[c]||RC.custom;const sel=selCat===c;return(
              <button key={c} onClick={()=>setSelCat(c)} style={{padding:"6px 13px",borderRadius:99,border:`2px solid ${sel?col.s:T.sep}`,background:sel?col.bg:T.bg2,color:sel?col.s:T.label2,fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                {CM[c]?.i} {CM[c]?.l}
              </button>
            );})}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 18px 24px"}}>
          {RING_REPOS[selCat].map((t,i)=>{
            const col=RC[selCat]||RC.custom;
            const already=existingLabels.includes(t.label);
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:16,background:T.bg3,marginBottom:8,opacity:already?.5:1}}>
                <div style={{width:42,height:42,borderRadius:13,background:col.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{t.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:T.label}}>{t.label}</div>
                  <div style={{fontSize:11,color:T.label2,marginTop:2}}>{t.desc}</div>
                  <div style={{fontSize:10,color:T.label3,marginTop:2}}>Daily target: {t.dailyT} {t.unit}</div>
                </div>
                <button onClick={()=>{if(!already)onAdd({category:selCat,icon:t.icon,label:t.label,dailyT:t.dailyT,unit:t.unit});}} style={{width:32,height:32,borderRadius:10,background:already?T.bg2:col.s,border:already?`1.5px solid ${T.sep}`:"none",color:already?T.label3:"#fff",fontSize:already?14:20,cursor:already?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>{already?"✓":"+"}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── TODAY TAB ─────────────────────────────────────────────────────────────────
function TodayTab({goals,setGoals,stats,level,burst,setBurst,loaded,editQL,setEditQL,setGoalSheet,setSheet,profile,setRepoSheet}) {
  const {dark,T}=useContext(Ctx);
  const active=goals.filter(g=>g.active!==false);
  const pinned=active.filter(g=>g.pinned);
  const fname=profile.name.split(" ")[0];
  const hr=new Date().getHours();
  const greet=hr<12?"Good morning,":hr<17?"Good afternoon,":"Good evening,";
  const card=(e={})=>({background:T.bg2,borderRadius:22,padding:18,boxShadow:T.sh,...e});
  const logProgress=(id,delta)=>setGoals(prev=>{
    const g=prev.find(x=>x.id===id);if(!g)return prev;
    const cur=g.todayP||0,np=Math.min(Math.max(0,cur+delta),g.dailyT);
    if(cur<g.dailyT&&np>=g.dailyT){setBurst(id);setTimeout(()=>setBurst(null),2000);}
    return prev.map(x=>x.id===id?{...x,todayP:np,lastDate:todayKey()}:x);
  });
  const togglePin=id=>setGoals(prev=>prev.map(g=>g.id===id?{...g,pinned:!g.pinned}:g));
  return (
    <div>
      <div style={{marginBottom:10}}><div style={{fontSize:14,color:T.label2}}>{greet}</div><div style={{fontWeight:800,fontSize:30,color:T.label,letterSpacing:"-.03em",lineHeight:1.15}}>{fname}.</div></div>
      {stats.streak>0&&<div style={{...card({padding:"12px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12})}}>
        <div style={{fontSize:26}}>🔥</div>
        <div><div style={{fontWeight:800,fontSize:16,color:T.label}}>{stats.streak}-day streak</div><div style={{fontSize:12,color:T.label2}}>Best: {stats.streak} · {level.icon} {level.name}</div></div>
        <div style={{marginLeft:"auto",fontWeight:700,fontSize:13,color:RC.finance.s}}>{stats.total} perfect days</div>
      </div>}
      <div style={{...card({padding:"24px 18px",display:"flex",flexDirection:"column",alignItems:"center",marginBottom:14,position:"relative",overflow:"hidden",boxShadow:T.shH})}}>
        <div style={{position:"absolute",inset:0,background:dark?"radial-gradient(ellipse at 50% 0%,rgba(48,209,88,.07),transparent 65%)":"radial-gradient(ellipse at 50% 0%,rgba(48,209,88,.05),transparent 65%)"}}/>
        <BigRings goals={active} size={190} animated={loaded}/>
        <div style={{marginTop:12,display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          {pinned.map(g=><div key={g.id} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:99,background:RC[g.category]?.s||RC.custom.s}}/><span style={{fontSize:10,color:T.label2}}>{g.icon} {g.label}</span></div>)}
        </div>
        <div style={{marginTop:8,fontSize:10,color:T.label3}}>Resets at midnight · tap Customise to change rings</div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{fontWeight:800,fontSize:18,color:T.label,letterSpacing:"-.02em"}}>Quick Log</div>
        <button onClick={()=>setEditQL(e=>!e)} style={{padding:"6px 13px",borderRadius:99,background:editQL?RC.mind.bg:T.bg2,border:`1.5px solid ${editQL?RC.mind.s:T.sep}`,color:editQL?RC.mind.s:T.label2,fontWeight:700,fontSize:12,cursor:"pointer"}}>{editQL?"Done":"Customise"}</button>
      </div>
      {editQL?(
        <div>
          <div style={{fontSize:12,color:T.label2,marginBottom:10,lineHeight:1.6}}>Choose which goals appear in your rings.</div>
          {active.map(g=>{
            const col=RC[g.category]?.s||RC.custom.s;
            return <div key={g.id} style={{...card({marginBottom:8,display:"flex",alignItems:"center",gap:12,border:`1.5px solid ${g.pinned?col+"55":T.sep}`})}}>
              <div style={{width:38,height:38,borderRadius:12,background:RC[g.category]?.bg||"rgba(128,128,128,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{g.icon}</div>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.label}}>{g.label}</div><div style={{fontSize:11,color:T.label2,marginTop:1}}>Daily: {g.dailyT} {g.unit}</div></div>
              <button onClick={()=>togglePin(g.id)} style={{padding:"6px 12px",borderRadius:99,border:`1.5px solid ${g.pinned?col:T.sep}`,background:g.pinned?col+"22":"transparent",color:g.pinned?col:T.label3,fontWeight:700,fontSize:11,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>{g.pinned?"★ In rings":"☆ Add"}</button>
            </div>;
          })}
        </div>
      ):(
        <div>
          {pinned.length===0&&<div style={{...card({marginBottom:10,textAlign:"center",padding:"20px"})}}>
            <div style={{fontSize:14,color:T.label2,lineHeight:1.7}}>No goals in your rings.<br/>Tap <b>Customise</b> to choose what shows here.</div>
          </div>}
          {active.map(g=>{
            const col=RC[g.category]?.s||RC.custom.s,p=pct(g),done=(g.todayP||0)>=g.dailyT;
            return <div key={g.id} onClick={()=>setSheet(g)} style={{...card({marginBottom:8,cursor:"pointer",border:`1.5px solid ${burst===g.id?col+"88":T.sep}`})}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:14,background:RC[g.category]?.bg||"rgba(128,128,128,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,position:"relative"}}>
                  {g.icon}{done&&<div style={{position:"absolute",bottom:-2,right:-2,width:14,height:14,borderRadius:99,background:col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",fontWeight:700}}>✓</div>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:T.label,marginBottom:4}}>{g.label}{!g.pinned&&<span style={{fontSize:10,color:T.label3,marginLeft:5}}>not in rings</span>}</div>
                  <div style={{height:5,background:T.bg3,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:col,width:`${p}%`,transition:"width .5s",boxShadow:`0 0 5px ${col}77`}}/></div>
                  <div style={{fontSize:10,color:T.label3,marginTop:3}}>{g.todayP||0} of {g.dailyT} {g.unit}</div>
                </div>
                <div style={{display:"flex",gap:5,flexShrink:0}}>
                  <button onClick={e=>{e.stopPropagation();logProgress(g.id,-1);}} style={{width:34,height:34,borderRadius:10,background:T.bg3,border:"none",color:T.label,fontSize:18,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                  <button onClick={e=>{e.stopPropagation();logProgress(g.id,1);}} style={{width:34,height:34,borderRadius:10,background:done?T.bg3:col,border:"none",color:done?T.label3:"#fff",fontSize:18,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:done?"none":`0 2px 10px ${col}55`}}>+</button>
                </div>
              </div>
            </div>;
          })}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
        <button onClick={()=>setGoalSheet(true)} style={{padding:"12px",borderRadius:15,background:T.bg2,border:`1.5px dashed ${T.sep}`,color:T.label2,fontWeight:600,fontSize:13,cursor:"pointer"}}>+ Custom goal</button>
        <button onClick={()=>setRepoSheet(true)} style={{padding:"12px",borderRadius:15,background:RC.mind.bg,border:`1.5px solid ${RC.mind.s}`,color:RC.mind.s,fontWeight:700,fontSize:13,cursor:"pointer"}}>⊞ Browse library</button>
      </div>
    </div>
  );
}

// ── RINGS TAB ─────────────────────────────────────────────────────────────────
function RingsTab({history,stats,level,achieved,profile}) {
  const {dark,T}=useContext(Ctx);
  const [calMonth,setCalMonth]=useState(()=>new Date());
  const year=calMonth.getFullYear(),month=calMonth.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=[...Array(firstDay).fill(null),...Array(daysInMonth).fill(0).map((_,i)=>i+1)];
  const tk=todayKey();
  const isCurrentMonth=calMonth.getMonth()===new Date().getMonth()&&calMonth.getFullYear()===new Date().getFullYear();
  const monthName=calMonth.toLocaleString("default",{month:"long",year:"numeric"});
  const card=(e={})=>({background:T.bg2,borderRadius:22,padding:18,boxShadow:T.sh,...e});
  const focusCats=profile.focus.filter(f=>Object.keys(RC).includes(f));
  const displayCats=focusCats.length?focusCats.slice(0,3):["finance","health","mind"];
  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#000,#1a1a1a)",borderRadius:22,padding:"20px",marginBottom:14,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:20,top:"50%",transform:"translateY(-50%)",fontSize:56,opacity:.12}}>{level.icon}</div>
        <div style={{fontSize:11,opacity:.45,textTransform:"uppercase",letterSpacing:".08em",fontWeight:600,marginBottom:6}}>Orbit Level</div>
        <div style={{fontWeight:800,fontSize:26,letterSpacing:"-.03em",marginBottom:4}}>{level.icon} {level.name}</div>
        <div style={{fontSize:13,opacity:.55,marginBottom:14}}>{stats.total} perfect days · {stats.streak} day streak</div>
        <div style={{height:6,background:"rgba(255,255,255,.12)",borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,background:level.color,width:`${level.prog}%`,transition:"width 1s"}}/>
        </div>
        {level.next&&<div style={{fontSize:11,opacity:.4,marginTop:5}}>{level.next.icon} {level.next.name} in {level.next.min-stats.total} more perfect days</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[["🔥","Streak",`${stats.streak}d`,RC.health.s],["💎","Longest",`${stats.streak}d`,RC.mind.s],["⭐","Perfect",`${stats.total}`,RC.growth.s]].map(([icon,label,val,col])=>(
          <div key={label} style={{...card({padding:"14px",textAlign:"center"})}}><div style={{fontSize:20,marginBottom:4}}>{icon}</div><div style={{fontWeight:800,fontSize:18,color:col}}>{val}</div><div style={{fontSize:10,color:T.label3,marginTop:2}}>{label}</div></div>
        ))}
      </div>
      <div style={{...card({padding:0,overflow:"hidden",marginBottom:14})}}>
        <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>{const d=new Date(calMonth);d.setMonth(d.getMonth()-1);setCalMonth(d);}} style={{background:"none",border:"none",color:RC.mind.s,fontSize:16,cursor:"pointer",padding:"4px 8px"}}>←</button>
          <div style={{fontWeight:800,fontSize:14,color:T.label}}>{monthName}</div>
          <button onClick={()=>{const d=new Date(calMonth);d.setMonth(d.getMonth()+1);if(d<=new Date())setCalMonth(d);}} style={{background:"none",border:"none",color:isCurrentMonth?T.label3:RC.mind.s,fontSize:16,cursor:"pointer",padding:"4px 8px"}}>→</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 8px",marginBottom:4}}>
          {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:T.label3,fontWeight:600,padding:"2px 0"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,padding:"0 8px 10px"}}>
          {cells.map((day,i)=>{
            if(!day)return <div key={`e${i}`}/>;
            const k=new Date(year,month,day).toISOString().slice(0,10);
            const entry=history[k];
            const isToday=k===tk;
            const isFuture=new Date(year,month,day)>new Date();
            const cats=entry?{...entry.cats}:displayCats.reduce((a,c)=>{a[c]=0;return a;},{});
            return (
              <div key={k} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 1px",borderRadius:9,background:isToday?`${RC.mind.s}18`:entry?.perfect?`${RC.finance.s}0a`:"transparent",border:isToday?`1.5px solid ${RC.mind.s}`:"1.5px solid transparent"}}>
                <div style={{fontSize:8,fontWeight:isToday?800:500,color:isToday?RC.mind.s:T.label3}}>{day}</div>
                {isFuture?<div style={{width:24,height:24}}/>:entry?<MiniRings cats={cats} size={24}/>:<div style={{width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:5,height:5,borderRadius:99,background:T.bg3}}/></div>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{fontWeight:800,fontSize:18,color:T.label,letterSpacing:"-.02em",marginBottom:12}}>Achievements</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {ACHIEVEMENTS.map(a=>{
          const u=achieved.has(a.id);
          return <div key={a.id} style={{...card({padding:"14px",opacity:u?1:.4,border:`1.5px solid ${u?RC.growth.s+"44":T.sep}`})}}><div style={{fontSize:22,marginBottom:6,filter:u?"none":"grayscale(1)"}}>{a.icon}</div><div style={{fontWeight:700,fontSize:13,color:T.label,marginBottom:2}}>{a.title}</div><div style={{fontSize:11,color:T.label2,lineHeight:1.4}}>{a.desc}</div>{u&&<div style={{fontSize:10,color:RC.finance.s,fontWeight:700,marginTop:5}}>✓ Unlocked</div>}</div>;
        })}
      </div>
    </div>
  );
}

// ── TAX CARD ─────────────────────────────────────────────────────────────────
function TaxCard({profile,incomes}) {
  const {dark,T}=useContext(Ctx);
  const [open,setOpen]=useState(false);
  const annualGross=incomes.reduce((s,x)=>s+x.amount,0)*12;
  const tx=calcNigerianTax(annualGross, profile.profile);
  const fmt=n=>"\u20a6"+(Math.round(n)).toLocaleString();
  return (
    <div style={{marginTop:20}}>
      <div style={{fontWeight:800,fontSize:18,color:T.label,letterSpacing:"-.02em",marginBottom:12}}>Tax (PAYE)</div>
      <div style={{background:T.bg2,borderRadius:22,padding:18,boxShadow:T.sh,cursor:"pointer",border:`1.5px solid ${open?RC.finance.s+"44":T.sep}`}}>
        <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div style={{flex:1}}>
            {tx.exempt?(
              <div>
                <div style={{fontWeight:700,fontSize:15,color:T.label,marginBottom:4}}>NYSC Allawee — Tax Exempt</div>
                <div style={{fontSize:12,color:T.label2,lineHeight:1.6}}>FIRS guidance: the \u20a677,000/mo NYSC allawee is a government stipend, not employment income. Not subject to PAYE. Any income earned above the allawee must be declared separately.</div>
              </div>
            ):(
              <div>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
                  <div style={{fontWeight:800,fontSize:22,color:RC.health.s}}>{fmt(tx.monthly)}</div>
                  <div style={{fontSize:12,color:T.label2}}>/ month to set aside</div>
                </div>
                <div style={{fontSize:12,color:T.label2}}>Effective rate: {tx.effectiveRate.toFixed(1)}% \u00b7 Annual tax: {fmt(tx.tax)}</div>
                {tx.usedMinTax&&<div style={{fontSize:11,color:RC.growth.s,marginTop:4}}>Minimum tax rule applied (1% of gross) \u2014 PITA S.37(2)</div>}
              </div>
            )}
          </div>
          {!tx.exempt&&<span style={{color:T.label3,fontSize:11,marginTop:4,display:"inline-block",transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}>\u25be</span>}
        </div>
        {open&&!tx.exempt&&(
          <div style={{marginTop:16,borderTop:`1px solid ${T.sep}`,paddingTop:14}}>
            <div style={{fontSize:11,fontWeight:700,color:T.label3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Annual Deductions</div>
            {[
              ["Gross Income", fmt(annualGross), T.label],
              ["CRA \u2014 PITA S.33(1)", "\u2212"+fmt(tx.cra), RC.mind.s],
              ...(tx.pension>0?[["Pension 8% \u2014 PRA 2014 S.9", "\u2212"+fmt(tx.pension), RC.connect.s]]:[]),
              ...(tx.nhf>0?[["NHF 2.5% \u2014 NHF Act S.4", "\u2212"+fmt(tx.nhf), RC.growth.s]]:[]),
              ["Taxable Income", fmt(tx.taxableIncome), T.label],
            ].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <span style={{fontSize:12,color:T.label2}}>{l}</span>
                <span style={{fontSize:12,fontWeight:700,color:c}}>{v}</span>
              </div>
            ))}
            <div style={{height:1,background:T.sep,margin:"10px 0"}}/>
            <div style={{fontSize:11,fontWeight:700,color:T.label3,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Tax Bands \u2014 PITA S.37(1)</div>
            {tx.breakdown.map((b,i)=>(
              <div key={i} style={{background:dark?RC.finance.dk:RC.finance.bg,borderRadius:10,padding:"8px 12px",marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:700,color:T.label}}>{b.label}</span>
                  <span style={{fontSize:12,fontWeight:800,color:RC.finance.s}}>{fmt(b.tax)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,color:T.label3}}>{(b.rate*100).toFixed(0)}% of {fmt(b.taxable)}</span>
                  <span style={{fontSize:10,color:T.label3,fontStyle:"italic"}}>{b.statute}</span>
                </div>
              </div>
            ))}
            <div style={{height:1,background:T.sep,margin:"10px 0"}}/>
            {[["Total Annual Tax",fmt(tx.tax),RC.health.s],["Monthly Tax",fmt(tx.monthly),RC.health.s],["Est. Net Monthly",fmt(tx.netMonthly||0),RC.finance.s]].map(([l,v,c])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:600,color:T.label}}>{l}</span>
                <span style={{fontSize:13,fontWeight:800,color:c}}>{v}</span>
              </div>
            ))}
            <div style={{background:T.bg3,borderRadius:10,padding:"10px 12px",marginTop:10}}>
              <div style={{fontSize:10,color:T.label3,lineHeight:1.65}}>Statutory basis: Personal Income Tax Act (PITA) Cap P8 LFN 2004, as amended by Finance Acts 2019 and 2020. Pension per Pension Reform Act 2014 S.9(1)(b). NHF per National Housing Fund Act Cap N45 LFN 2004 S.4. Rates current until further FIRS amendment.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── FINANCE TAB ───────────────────────────────────────────────────────────────
function FinanceTab({budget,setBudget,incomes,setIncomes,setIncSheet,setExpSheet,profile}) {
  const {dark,T}=useContext(Ctx);
  const [expanded,setExpanded]=useState(null);
  const [taxOpen,setTaxOpen]=useState(false);
  const totalInc=incomes.reduce((s,x)=>s+x.amount,0);
  const totalExp=budget.reduce((s,b)=>s+b.amt,0);
  const remaining=totalInc-totalExp;
  const over=totalExp>totalInc;
  const tax=useMemo(()=>calcTax(totalInc),[totalInc]);
  const taxApplies=!["corper","student","homemaker"].includes(profile?.profile||"");
  const card=(e={})=>({background:T.bg2,borderRadius:22,padding:18,boxShadow:T.sh,...e});
  return (
    <div>
      <div style={{...card({marginBottom:14,boxShadow:T.shH})}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
          <div><div style={{fontSize:10,color:T.label2,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Gross Income</div><div style={{fontWeight:800,fontSize:26,color:RC.finance.s,letterSpacing:"-.03em"}}>₦{totalInc.toLocaleString()}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,color:T.label2,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Take-Home</div><div style={{fontWeight:800,fontSize:20,color:taxApplies?RC.mind.s:over?RC.health.s:RC.finance.s}}>₦{taxApplies?tax.takeHome.toLocaleString():remaining.toLocaleString()}</div></div>
        </div>
        <div style={{height:8,background:T.bg3,borderRadius:99,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",borderRadius:99,background:over?`linear-gradient(90deg,${RC.health.s},${RC.connect.s})`:`linear-gradient(90deg,${RC.finance.s},${RC.mind.s})`,width:`${Math.min(totalExp/Math.max(totalInc,1)*100,100)}%`,transition:"width .8s"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:600}}>
          <span style={{color:RC.health.s}}>₦{totalExp.toLocaleString()} budgeted</span>
          <span style={{color:over?RC.health.s:T.label3}}>{over?`Over ₦${(totalExp-totalInc).toLocaleString()}`:`${Math.round(totalExp/Math.max(totalInc,1)*100)}% allocated`}</span>
        </div>
      </div>

      {taxApplies&&(
        <div style={{...card({padding:0,overflow:"hidden",marginBottom:14,border:`1.5px solid ${taxOpen?RC.growth.s+"44":T.sep}`})}}>
          <button onClick={()=>setTaxOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"14px 16px",background:"none",border:"none",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:10,background:RC.growth.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏛️</div>
              <div style={{textAlign:"left"}}>
                <div style={{fontWeight:700,fontSize:14,color:T.label}}>Tax Deductions (PITA)</div>
                <div style={{fontSize:11,color:T.label2,marginTop:1}}>₦{tax.monthlyTax.toLocaleString()}/mo · {(tax.effectiveRate*100).toFixed(1)}% effective rate</div>
              </div>
            </div>
            <span style={{color:T.label3,fontSize:10,display:"inline-block",transform:taxOpen?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span>
          </button>
          {taxOpen&&(
            <div style={{padding:"0 16px 16px"}}>
              <div style={{background:T.bg3,borderRadius:14,padding:"12px 14px",marginBottom:12}}>
                <div style={{fontSize:10,color:T.label3,textTransform:"uppercase",letterSpacing:".06em",fontWeight:700,marginBottom:8}}>Monthly statutory deductions</div>
                {[["PAYE Income Tax",`₦${tax.monthlyTax.toLocaleString()}`,RC.growth.s],["Pension — 8% (PRA 2014)",`₦${tax.monthlyPension.toLocaleString()}`,RC.mind.s],["NHF — 2.5% (NHF Act)",`₦${tax.monthlyNhf.toLocaleString()}`,RC.connect.s]].map(([l,v,col])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:12,color:T.label2}}>{l}</span>
                    <span style={{fontWeight:700,fontSize:13,color:col}}>{v}</span>
                  </div>
                ))}
                <div style={{height:1,background:T.sep,margin:"8px 0"}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,color:T.label}}>Monthly take-home</span>
                  <span style={{fontSize:15,fontWeight:800,color:RC.finance.s}}>₦{tax.takeHome.toLocaleString()}</span>
                </div>
              </div>
              <div style={{fontSize:10,color:T.label3,textTransform:"uppercase",letterSpacing:".06em",fontWeight:700,marginBottom:8}}>Annual tax computation</div>
              <div style={{marginBottom:10}}>
                {[["Gross annual income",`₦${tax.gross.toLocaleString()}`,T.label],["Less: Pension (PRA 2014 s.4)",`−₦${tax.pension.toLocaleString()}`,RC.mind.s],["Less: NHF (NHF Act s.4)",`−₦${tax.nhf.toLocaleString()}`,RC.connect.s],["Less: CRA (PITA s.33)",`−₦${tax.cra.toLocaleString()}`,RC.growth.s],["= Taxable income",`₦${tax.taxableIncome.toLocaleString()}`,T.label]].map(([l,v,col])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:11,color:T.label2,flex:1}}>{l}</span>
                    <span style={{fontSize:11,fontWeight:700,color:col,marginLeft:8}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:T.label3,textTransform:"uppercase",letterSpacing:".06em",fontWeight:700,marginBottom:8}}>PITA s.34 — graduated rates</div>
              <div style={{background:T.bg3,borderRadius:12,overflow:"hidden",marginBottom:10}}>
                {tax.breakdown.map((b,i)=>(
                  <div key={i} style={{padding:"8px 12px",borderBottom:i<tax.breakdown.length-1?`1px solid ${T.sep}`:"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:11,color:T.label2}}>{b.label}</span>
                      <span style={{fontSize:11,fontWeight:700,color:RC.growth.s}}>{(b.rate*100).toFixed(0)}% = ₦{b.tax.toLocaleString()}</span>
                    </div>
                    <div style={{height:3,background:T.bg2,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:RC.growth.s,width:`${Math.min(b.slice/Math.max(tax.taxableIncome,1)*100,100)}%`}}/></div>
                  </div>
                ))}
              </div>
              {tax.isMinTax&&<div style={{background:RC.growth.bg,borderRadius:10,padding:"8px 12px",marginBottom:10}}><div style={{fontSize:11,color:RC.growth.s,fontWeight:600}}>Minimum tax applies — 1% of gross (Finance Act 2020)</div></div>}
              <div style={{background:T.bg3,borderRadius:10,padding:"8px 12px"}}><div style={{fontSize:10,color:T.label3,lineHeight:1.7}}>Refs: PITA Cap P8 LFN 2004 (as amended 2011) · Finance Act 2020 · Pension Reform Act 2014 · NHF Act Cap N45 LFN 2004. CRA = max(₦200,000, 1% gross) + 20% gross.</div></div>
            </div>
          )}
        </div>
      )}
      {!taxApplies&&<div style={{...card({padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10})}}><span style={{fontSize:16}}>ℹ️</span><div style={{fontSize:12,color:T.label2,lineHeight:1.6}}>NYSC corpers, students, and homemakers typically fall below the ₦300k p.a. minimum tax threshold (Finance Act 2020).</div></div>}
      <div style={{fontWeight:800,fontSize:18,color:T.label,letterSpacing:"-.02em",marginBottom:12}}>Income</div>
      <div style={{background:T.bg2,borderRadius:22,overflow:"hidden",boxShadow:T.sh,marginBottom:10}}>
        {incomes.map((src,i)=>(
          <div key={src.id} style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:i<incomes.length-1?`1px solid ${T.sep}`:"none"}}>
            <div style={{width:36,height:36,borderRadius:11,background:RC.finance.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{src.i}</div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.label}}>{src.l}</div><div style={{fontSize:11,color:T.label2}}>Monthly</div></div>
            <div style={{fontWeight:800,fontSize:13,color:RC.finance.s}}>₦{src.amount.toLocaleString()}</div>
            {incomes.length>1&&<button onClick={()=>setIncomes(p=>p.filter(x=>x.id!==src.id))} style={{background:"none",border:"none",color:T.label3,fontSize:18,cursor:"pointer"}}>×</button>}
          </div>
        ))}
      </div>
      <button onClick={()=>setIncSheet(true)} style={{width:"100%",padding:"11px",borderRadius:13,background:T.bg2,border:`1.5px dashed ${T.sep}`,color:T.label2,fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:18}}>+ Add income source</button>
      <div style={{fontWeight:800,fontSize:18,color:T.label,letterSpacing:"-.02em",marginBottom:12}}>Budget</div>
      <div style={{background:T.bg2,borderRadius:22,overflow:"hidden",boxShadow:T.sh,marginBottom:10}}>
        {budget.map((item,i)=>{
          const exp=expanded===item.id;
          return <div key={item.id} style={{borderBottom:i<budget.length-1?`1px solid ${T.sep}`:"none"}}>
            <div onClick={()=>setExpanded(exp?null:item.id)} style={{padding:"11px 16px",display:"flex",alignItems:"center",gap:11,cursor:"pointer"}}>
              <div style={{width:34,height:34,borderRadius:10,background:item.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.i}</div>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:T.label,marginBottom:4}}>{item.l}</div><div style={{height:3,background:T.bg3,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:item.c,width:`${Math.min(item.amt/Math.max(totalInc,1)*100,100)}%`}}/></div></div>
              <div style={{fontWeight:700,fontSize:13,color:item.c,minWidth:68,textAlign:"right"}}>₦{item.amt.toLocaleString()}</div>
              <span style={{color:T.label3,fontSize:9,transform:exp?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span>
            </div>
            {exp&&<div style={{padding:"0 16px 12px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <button onClick={()=>setBudget(p=>p.map(x=>x.id===item.id?{...x,amt:Math.max(0,x.amt-1000)}:x))} style={{width:42,height:42,borderRadius:12,background:T.bg3,border:"none",color:T.label,fontSize:20,cursor:"pointer",fontWeight:700}}>−</button>
                <input type="number" value={item.amt} onChange={e=>setBudget(p=>p.map(x=>x.id===item.id?{...x,amt:parseInt(e.target.value)||0}:x))} style={{background:"transparent",border:"none",outline:"none",fontSize:22,fontWeight:800,color:item.c,textAlign:"center",width:120}}/>
                <button onClick={()=>setBudget(p=>p.map(x=>x.id===item.id?{...x,amt:x.amt+1000}:x))} style={{width:42,height:42,borderRadius:12,background:item.c,border:"none",color:"#fff",fontSize:20,cursor:"pointer",fontWeight:700,boxShadow:`0 2px 10px ${item.c}44`}}>+</button>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                {[500,1000,2000,5000,10000].map(s=><div key={s} style={{display:"flex",gap:3}}>
                  <button onClick={()=>setBudget(p=>p.map(x=>x.id===item.id?{...x,amt:Math.max(0,x.amt-s)}:x))} style={{padding:"4px 7px",borderRadius:7,background:dark?RC.health.dk:RC.health.bg,border:"none",color:RC.health.s,fontSize:11,cursor:"pointer",fontWeight:600}}>-{s>=1000?s/1000+"k":s}</button>
                  <button onClick={()=>setBudget(p=>p.map(x=>x.id===item.id?{...x,amt:x.amt+s}:x))} style={{padding:"4px 7px",borderRadius:7,background:dark?RC.finance.dk:RC.finance.bg,border:"none",color:RC.finance.s,fontSize:11,cursor:"pointer",fontWeight:600}}>+{s>=1000?s/1000+"k":s}</button>
                </div>)}
              </div>
              <button onClick={()=>setBudget(p=>p.filter(x=>x.id!==item.id))} style={{width:"100%",padding:"8px",borderRadius:9,background:dark?RC.health.dk:RC.health.bg,border:"none",color:RC.health.s,fontWeight:600,fontSize:12,cursor:"pointer"}}>Remove</button>
            </div>}
          </div>;
        })}
      </div>
      <button onClick={()=>setExpSheet(true)} style={{width:"100%",padding:"11px",borderRadius:13,background:T.bg2,border:`1.5px dashed ${T.sep}`,color:T.label2,fontWeight:600,fontSize:13,cursor:"pointer"}}>+ Add expense line</button>
      <TaxCard profile={profile} incomes={incomes}/>
    </div>
  );
}

// ── FRIENDS TAB ───────────────────────────────────────────────────────────────
function FriendsTab({friends,setFriends,userId,stats,goals,profile}) {
  const {T}=useContext(Ctx);
  const [copied,setCopied]=useState(false);
  const [addSheet,setAddSheet]=useState(false);
  const [addId,setAddId]=useState("");
  const card=(e={})=>({background:T.bg2,borderRadius:22,padding:18,boxShadow:T.sh,...e});
  const pinned=goals.filter(g=>g.active!==false&&g.pinned);
  const myTodayPct=pinned.reduce((s,g)=>s+pct(g),0)/Math.max(pinned.length,1)/100;
  const myCats=profile.focus.slice(0,3).reduce((a,c)=>{a[c]=myTodayPct;return a;},{});
  const all=[{id:userId,name:"You",streak:stats.streak,total:stats.total,todayPct:myTodayPct,focus:profile.focus,cats:myCats,isMe:true},...friends.map(f=>({...f,cats:f.focus.slice(0,3).reduce((a,c)=>{a[c]=f.todayPct||0;return a;},{})}))].sort((a,b)=>b.streak-a.streak);
  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#000,#1a1a1a)",borderRadius:22,padding:"20px",marginBottom:14,color:"#fff"}}>
        <div style={{fontSize:11,opacity:.45,textTransform:"uppercase",letterSpacing:".08em",fontWeight:600,marginBottom:8}}>Your Orbit ID</div>
        <div style={{fontWeight:800,fontSize:20,letterSpacing:".05em",marginBottom:4,color:RC.mind.s}}>{userId}</div>
        <div style={{fontSize:12,opacity:.5,lineHeight:1.6,marginBottom:14}}>Share with friends. They only see your rings and streak — never your income or spending.</div>
        <button onClick={()=>{navigator.clipboard?.writeText(userId);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{padding:"9px 18px",borderRadius:11,background:copied?RC.finance.s:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",transition:"background .2s"}}>{copied?"✓ Copied!":"Copy ID"}</button>
      </div>
      <div style={{fontWeight:800,fontSize:18,color:T.label,letterSpacing:"-.02em",marginBottom:12}}>Leaderboard</div>
      {all.map((f,rank)=>{
        const lv=getLevel(f.total);
        return <div key={f.id} style={{...card({marginBottom:10,border:f.isMe?`1.5px solid ${RC.mind.s}44`:`1.5px solid ${T.sep}`})}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontWeight:800,fontSize:16,width:22,color:rank===0?RC.growth.s:rank===1?T.label2:T.label3}}>{rank===0?"🥇":rank===1?"🥈":rank===2?"🥉":rank+1}</div>
            <div style={{width:42,height:42,borderRadius:99,background:T.bg3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><MiniRings cats={f.cats||{}} size={38}/></div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.label}}>{f.name}{f.isMe&&<span style={{fontSize:10,color:RC.mind.s,marginLeft:5}}>you</span>}</div><div style={{fontSize:11,color:T.label2,marginTop:2}}>{lv.icon} {lv.name} · {f.total} perfect days</div></div>
            <div style={{textAlign:"right"}}><div style={{fontWeight:800,fontSize:18,color:f.streak>0?RC.health.s:T.label3}}>{f.streak}</div><div style={{fontSize:9,color:T.label3}}>day streak</div></div>
          </div>
        </div>;
      })}
      <button onClick={()=>setAddSheet(true)} style={{width:"100%",padding:"12px",borderRadius:14,background:T.bg2,border:`1.5px dashed ${T.sep}`,color:T.label2,fontWeight:600,fontSize:14,cursor:"pointer",marginTop:4}}>+ Add friend by Orbit ID</button>
      {addSheet&&<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}} onClick={()=>{setAddSheet(false);setAddId("");}}/>
        <div style={{position:"relative",background:T.bg2,borderRadius:"26px 26px 0 0",padding:"22px 22px 32px",animation:"popIn .3s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{width:38,height:5,borderRadius:99,background:T.bg3,margin:"0 auto 18px"}}/>
          <div style={{fontWeight:800,fontSize:19,color:T.label,marginBottom:8}}>Add a Friend</div>
          <div style={{fontSize:13,color:T.label2,marginBottom:18,lineHeight:1.6}}>Ask your friend to share their Orbit ID. You will only see their rings and streak — never their spending.</div>
          <input value={addId} onChange={e=>setAddId(e.target.value.toUpperCase())} placeholder="ORBIT-XXXXXX" style={{width:"100%",padding:"14px 16px",borderRadius:14,border:`1.5px solid ${addId.length>=6?RC.finance.s:T.sep}`,background:T.bg3,color:T.label,fontSize:18,fontFamily:"inherit",fontWeight:700,outline:"none",letterSpacing:".04em",marginBottom:14}}/>
          <div style={{background:T.bg3,borderRadius:12,padding:"10px 13px",marginBottom:14,fontSize:11,color:T.label2,lineHeight:1.6}}>Live sync requires a backend (Firebase/Supabase). In this preview, adding an ID simulates the connection.</div>
          <button onClick={()=>{if(addId.length<6)return;const names=["Emeka","Ngozi","Bola","Yemi","Kemi","Fola"];const n=names[Math.floor(Math.random()*names.length)];setFriends(p=>[...p,{id:addId,name:n+" (friend)",streak:Math.floor(Math.random()*10),total:Math.floor(Math.random()*20),todayPct:Math.random(),focus:profile.focus}]);setAddSheet(false);setAddId("");}}
            style={{width:"100%",padding:"14px",borderRadius:16,background:addId.length>=6?"#000":T.bg3,color:addId.length>=6?"#fff":T.label3,border:"none",fontWeight:700,fontSize:16,cursor:addId.length>=6?"pointer":"default"}}>
            Add Friend
          </button>
        </div>
      </div>}
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────
function ProfileTab({profile,goals,stats,level,userId,toggle,setAboutSheet}) {
  const {dark,T}=useContext(Ctx);
  const active=goals.filter(g=>g.active!==false);
  return (
    <div>
      <div style={{background:"#000",borderRadius:22,padding:22,marginBottom:14,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-10,top:-10,opacity:.12}}>
          <svg width={130} height={130}>{active.slice(0,3).map((g,i)=>{const col=RC[g.category]?.s||"#fff",r=40+i*18,c2=2*Math.PI*r,off=c2-pct(g)/100*c2;return<circle key={g.id} cx={65} cy={65} r={r} fill="none" stroke={col} strokeWidth={7} strokeLinecap="round" strokeDasharray={c2} strokeDashoffset={off} transform="rotate(-90 65 65)"/>;})}
          </svg>
        </div>
        <div style={{position:"relative"}}>
          <div style={{fontSize:42,marginBottom:10}}>{profile.gender==="female"?"👩":"🧔"}</div>
          <div style={{fontWeight:800,fontSize:22,letterSpacing:"-.03em",marginBottom:3}}>{profile.name}</div>
          <div style={{fontSize:12,opacity:.55,marginBottom:12}}>{PROFILES.find(p=>p.id===profile.profile)?.icon} {PROFILES.find(p=>p.id===profile.profile)?.l} · {profile.city}</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            <span style={{padding:"4px 10px",borderRadius:99,background:"rgba(255,255,255,.15)",fontSize:11,fontWeight:600}}>₦{profile.income.toLocaleString()}/mo</span>
            <span style={{padding:"4px 10px",borderRadius:99,background:"rgba(255,255,255,.15)",fontSize:11,fontWeight:600}}>{level.icon} {level.name}</span>
          </div>
        </div>
      </div>
      <div style={{background:T.bg2,borderRadius:22,overflow:"hidden",boxShadow:T.sh}}>
        <div style={{padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.sep}`}}>
          <span style={{fontWeight:600,fontSize:15,color:T.label}}>Dark Mode</span>
          <div onClick={toggle} style={{width:48,height:28,borderRadius:99,background:dark?RC.mind.s:T.bg3,position:"relative",cursor:"pointer",transition:"background .25s"}}><div style={{position:"absolute",top:3,left:dark?21:3,width:22,height:22,borderRadius:99,background:"#fff",transition:"left .25s cubic-bezier(.34,1.56,.64,1)",boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}/></div>
        </div>
        {[["Orbit ID",userId],["Active goals",active.length],["Current streak",`${stats.streak} days`],["Total perfect",`${stats.total} days`]].map(([l,v],i,arr)=>(
          <div key={l} style={{padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:i<arr.length-1?`1px solid ${T.sep}`:"none"}}>
            <span style={{fontWeight:600,fontSize:15,color:T.label}}>{l}</span>
            <span style={{fontWeight:600,fontSize:13,color:T.label2}}>{v}</span>
          </div>
        ))}
        <button onClick={()=>setAboutSheet(true)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"13px 18px",background:"none",border:"none",cursor:"pointer"}}>
          <span style={{fontWeight:600,fontSize:15,color:T.label}}>About Orbit</span>
          <span style={{color:T.label3}}>→</span>
        </button>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({profile,goals:ig,budget:ib}) {
  const {dark,toggle,T}=useContext(Ctx);
  const [tab,setTab]=useState("today");
  const [goals,setGoals]=useState(ig);
  const [budget,setBudget]=useState(ib);
  const [incomes,setIncomes]=useState([{id:"i1",l:PROFILES.find(p=>p.id===profile.profile)?.l||"Income",i:"💼",amount:profile.income}]);
  const [loaded,setLoaded]=useState(false);
  const [burst,setBurst]=useState(null);
  const [sheet,setSheet]=useState(null);
  const [goalSheet,setGoalSheet]=useState(false);
  const [goalMode,setGoalMode]=useState("repo");
  const [repoCat,setRepoCat]=useState("health");
  const [expSheet,setExpSheet]=useState(false);
  const [incSheet,setIncSheet]=useState(false);
  const [aboutSheet,setAboutSheet]=useState(false);
  const [repoSheet,setRepoSheet]=useState(false);
  const [editQL,setEditQL]=useState(false);
  const [expSearch,setExpSearch]=useState("");
  const [selCat,setSelCat]=useState(null);
  const [newExpAmt,setNewExpAmt]=useState("");
  const [newGoal,setNewGoal]=useState({label:"",category:"finance",target:"",unit:""});
  const [newIncL,setNewIncL]=useState(""); const [newIncA,setNewIncA]=useState("");
  const [history,setHistory]=useState(()=>genHistory(profile.focus));
  const [friends,setFriends]=useState(MOCK_FRIENDS);
  const [userId]=useState(genId);
  const searchRef=useRef(null);

  useEffect(()=>{
    setTimeout(()=>setLoaded(true),100);
    const d=todayKey();
    setGoals(prev=>prev.map(g=>g.lastDate!==d?{...g,todayP:0,lastDate:d}:g));
  },[]);

  // Update history when goals change
  useEffect(()=>{
    const cats={};goals.filter(g=>g.active).forEach(g=>{if(!cats[g.category])cats[g.category]=(g.todayP||0)/(g.dailyT||1);});
    if(!Object.keys(cats).length)return;
    const avg=Object.values(cats).reduce((s,v)=>s+v,0)/Object.values(cats).length;
    const pinned=goals.filter(g=>g.pinned&&g.active);
    const perfect=pinned.length>0&&pinned.every(g=>(g.todayP||0)>=(g.dailyT||1));
    setHistory(h=>({...h,[todayKey()]:{cats,avg,perfect}}));
  },[goals]);

  const stats=useMemo(()=>calcStats(history),[history]);
  const level=useMemo(()=>getLevel(stats.total),[stats]);
  const achieved=useMemo(()=>checkAch(stats,friends),[stats,friends]);

  const openGoalSheet=(mode="repo")=>{setGoalMode(mode);setRepoCat(profile.focus[0]||"health");setGoalSheet(true);};
  const addFromRepo=(tmpl)=>{setGoals(p=>[...p,{id:Date.now(),category:repoCat,icon:tmpl.icon,label:tmpl.label,dailyT:tmpl.dailyT,todayP:0,lastDate:todayKey(),unit:tmpl.unit,active:true,pinned:false}]);setGoalSheet(false);};
  const filteredCats=useMemo(()=>{if(!expSearch.trim())return ECATS;const q=expSearch.toLowerCase();return ECATS.filter(c=>c.l.toLowerCase().includes(q)||c.g.toLowerCase().includes(q));},[expSearch]);

  const TABS=[{id:"today",icon:"⊙",label:"Today"},{id:"rings",icon:"◎",label:"Rings"},{id:"finance",icon:"₦",label:"Finance"},{id:"friends",icon:"👥",label:"Friends"},{id:"profile",icon:"○",label:"Profile"}];

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg,position:"relative"}}>
      <div style={{flex:1,overflowY:"auto",padding:"18px 16px 0"}}>
        <div style={{paddingBottom:82}}>
          {tab==="today"&&<TodayTab goals={goals} setGoals={setGoals} stats={stats} level={level} burst={burst} setBurst={setBurst} loaded={loaded} editQL={editQL} setEditQL={setEditQL} setGoalSheet={openGoalSheet} setSheet={setSheet} profile={profile}/>}
          {tab==="rings"&&<RingsTab history={history} stats={stats} level={level} achieved={achieved} profile={profile}/>}
          {tab==="finance"&&<FinanceTab budget={budget} setBudget={setBudget} incomes={incomes} setIncomes={setIncomes} setIncSheet={setIncSheet} setExpSheet={setExpSheet} profile={profile}/>}
          {tab==="friends"&&<FriendsTab friends={friends} setFriends={setFriends} userId={userId} stats={stats} goals={goals} profile={profile}/>}
          {tab==="profile"&&<ProfileTab profile={profile} goals={goals} stats={stats} level={level} userId={userId} toggle={toggle} setAboutSheet={setAboutSheet}/>}
        </div>
      </div>

      <div style={{background:T.glass,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:`1px solid ${T.sep}`,display:"flex",padding:"4px 0 8px",flexShrink:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"6px 0 2px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,opacity:tab===t.id?1:.38,transition:"opacity .15s"}}>
            <span style={{fontSize:t.id==="finance"?15:18,lineHeight:1,color:tab===t.id?RC.finance.s:T.label2}}>{t.icon}</span>
            <span style={{fontSize:9,fontWeight:tab===t.id?700:500,color:tab===t.id?RC.finance.s:T.label2}}>{t.label}</span>
            {tab===t.id&&<div style={{width:14,height:3,borderRadius:99,background:RC.finance.s}}/>}
          </button>
        ))}
      </div>

      {/* Goal detail sheet */}
      {sheet&&(()=>{const g=goals.find(x=>x.id===sheet.id)||sheet;const col=RC[g.category]?.s||RC.custom.s,p=pct(g);const circ=2*Math.PI*40,off=circ-p/100*circ;
        const logProgress=(id,delta)=>setGoals(prev=>{const g=prev.find(x=>x.id===id);if(!g)return prev;const cur=g.todayP||0,np=Math.min(Math.max(0,cur+delta),g.dailyT);if(cur<g.dailyT&&np>=g.dailyT){setBurst(id);setTimeout(()=>setBurst(null),2000);}return prev.map(x=>x.id===id?{...x,todayP:np,lastDate:todayKey()}:x);});
        return <div style={{position:"absolute",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}} onClick={()=>setSheet(null)}/>
          <div style={{position:"relative",background:T.bg2,borderRadius:"26px 26px 0 0",padding:"22px 22px 32px",animation:"popIn .3s cubic-bezier(.34,1.56,.64,1)"}}>
            <div style={{width:38,height:5,borderRadius:99,background:T.bg3,margin:"0 auto 18px"}}/>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
              <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
                <svg width={80} height={80} style={{position:"absolute",inset:0}}><circle cx={40} cy={40} r={38} fill="none" stroke={col} strokeOpacity=".15" strokeWidth={9}/><circle cx={40} cy={40} r={38} fill="none" stroke={col} strokeWidth={9} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} transform="rotate(-90 40 40)" style={{transition:"stroke-dashoffset 1s",filter:`drop-shadow(0 0 4px ${col}88)`}}/></svg>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{g.icon}</div>
              </div>
              <div><div style={{fontWeight:800,fontSize:18,color:T.label}}>{g.label}</div><div style={{fontSize:13,color:T.label2,marginTop:3}}>{CM[g.category]?.l} · {Math.round(p)}% today</div></div>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <button onClick={()=>logProgress(g.id,-1)} style={{width:50,height:50,borderRadius:16,background:T.bg3,border:"none",color:T.label,fontSize:22,cursor:"pointer",fontWeight:700}}>−</button>
              <div style={{textAlign:"center"}}><div style={{fontWeight:800,fontSize:38,color:col,lineHeight:1}}>{g.todayP||0}</div><div style={{fontSize:12,color:T.label3,marginTop:3}}>of {g.dailyT} {g.unit} today</div></div>
              <button onClick={()=>logProgress(g.id,1)} style={{width:50,height:50,borderRadius:16,background:col,border:"none",color:"#fff",fontSize:22,cursor:"pointer",fontWeight:700,boxShadow:`0 4px 16px ${col}55`}}>+</button>
            </div>
            <div style={{display:"flex",gap:7,marginBottom:14}}>{[1,2,3,5,10].map(s=><button key={s} onClick={()=>logProgress(g.id,s)} style={{flex:1,padding:"10px 0",borderRadius:11,background:col+"22",border:"none",color:col,fontWeight:700,fontSize:14,cursor:"pointer"}}>+{s}</button>)}</div>
            <button onClick={()=>{setGoals(p=>p.filter(x=>x.id!==g.id));setSheet(null);}} style={{width:"100%",padding:"10px",borderRadius:12,background:dark?RC.health.dk:RC.health.bg,border:"none",color:RC.health.s,fontWeight:600,fontSize:14,cursor:"pointer"}}>Remove goal</button>
          </div>
        </div>;
      })()}

      {/* Add goal */}
      {goalSheet&&<div style={{position:"absolute",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}} onClick={()=>setGoalSheet(false)}/>
        <div style={{position:"relative",background:T.bg2,borderRadius:"26px 26px 0 0",maxHeight:"88%",display:"flex",flexDirection:"column",animation:"popIn .3s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${T.sep}`}}>
          <div style={{width:38,height:5,borderRadius:99,background:T.bg3,margin:"0 auto 14px"}}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
            <div style={{fontWeight:800,fontSize:18,color:T.label}}>Add a Goal</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setGoalMode("repo")} style={{padding:"6px 13px",borderRadius:99,border:`1.5px solid ${goalMode==="repo"?RC.mind.s:T.sep}`,background:goalMode==="repo"?RC.mind.bg:"transparent",color:goalMode==="repo"?RC.mind.s:T.label2,fontWeight:700,fontSize:12,cursor:"pointer"}}>Browse</button>
              <button onClick={()=>setGoalMode("build")} style={{padding:"6px 13px",borderRadius:99,border:`1.5px solid ${goalMode==="build"?RC.growth.s:T.sep}`,background:goalMode==="build"?RC.growth.bg:"transparent",color:goalMode==="build"?RC.growth.s:T.label2,fontWeight:700,fontSize:12,cursor:"pointer"}}>Custom</button>
            </div>
          </div>
          </div>
          {goalMode==="repo"?(
            <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
              <div style={{display:"flex",gap:6,padding:"10px 14px",overflowX:"auto",flexShrink:0}}>
                {Object.keys(RING_REPOS).map(cat=>{const sel=repoCat===cat,col=RC[cat];return<button key={cat} onClick={()=>setRepoCat(cat)} style={{padding:"6px 12px",borderRadius:99,border:`1.5px solid ${sel?col.s:T.sep}`,background:sel?col.bg:T.bg2,color:sel?col.s:T.label2,fontWeight:600,fontSize:11,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>{CM[cat]?.i} {CM[cat]?.l}</button>;})}
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"0 14px 16px"}}>
                <div style={{fontSize:12,color:T.label2,marginBottom:10,lineHeight:1.6}}>Starting points — not prescriptions. Pick what resonates.</div>
                {(RING_REPOS[repoCat]||[]).map((tmpl,i)=>(
                  <button key={i} onClick={()=>addFromRepo(tmpl)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"11px 14px",borderRadius:15,background:T.bg3,border:`1px solid ${T.sep}`,cursor:"pointer",marginBottom:7,textAlign:"left"}}>
                    <div style={{width:40,height:40,borderRadius:13,background:RC[repoCat]?.bg||RC.custom.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{tmpl.icon}</div>
                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.label}}>{tmpl.label}</div><div style={{fontSize:11,color:T.label2,marginTop:2}}>Daily: {tmpl.dailyT.toLocaleString()} {tmpl.unit}</div></div>
                    <div style={{width:28,height:28,borderRadius:9,background:RC[repoCat]?.s||RC.custom.s,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700,flexShrink:0}}>+</div>
                  </button>
                ))}
              </div>
            </div>
          ):(
            <div style={{flex:1,overflowY:"auto",padding:"14px 18px 18px"}}>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:10,color:T.label3,textTransform:"uppercase",letterSpacing:".06em",fontWeight:600,marginBottom:7}}>Category</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{Object.keys(RC).map(c=>{const sel=newGoal.category===c;return<button key={c} onClick={()=>setNewGoal(p=>({...p,category:c}))} style={{padding:"5px 12px",borderRadius:99,border:`2px solid ${sel?RC[c].s:T.sep}`,background:sel?RC[c].bg:T.bg2,color:sel?RC[c].s:T.label2,fontWeight:600,fontSize:11,cursor:"pointer"}}>{CM[c]?.i} {CM[c]?.l}</button>;})}</div>
              </div>
              {[["Goal name","text","e.g. Morning workout","label"],["Daily target","number","e.g. 1","target"],["Unit","text","e.g. session, hr","unit"]].map(([lbl,type,ph,key])=>(
                <div key={key} style={{marginBottom:11}}>
                  <div style={{fontSize:10,color:T.label3,textTransform:"uppercase",letterSpacing:".06em",fontWeight:600,marginBottom:5}}>{lbl}</div>
                  <input type={type} placeholder={ph} value={newGoal[key]} onChange={e=>setNewGoal(p=>({...p,[key]:e.target.value}))} style={{width:"100%",padding:"11px 13px",borderRadius:12,border:`1.5px solid ${T.sep}`,background:T.bg3,color:T.label,fontSize:14,fontFamily:"inherit",fontWeight:600,outline:"none"}}/>
                </div>
              ))}
              <button onClick={()=>{if(!newGoal.label||!newGoal.target)return;setGoals(p=>[...p,{id:Date.now(),category:newGoal.category,icon:CM[newGoal.category]?.i||"🎯",label:newGoal.label,dailyT:parseInt(newGoal.target)||1,todayP:0,lastDate:todayKey(),unit:newGoal.unit||"",active:true,pinned:false}]);setNewGoal({label:"",category:"finance",target:"",unit:""});setGoalSheet(false);}}
                style={{width:"100%",padding:"13px",borderRadius:16,background:newGoal.label&&newGoal.target?"#000":T.bg3,color:newGoal.label&&newGoal.target?"#fff":T.label3,border:"none",fontWeight:700,fontSize:15,cursor:"pointer",marginTop:4}}>
                Create Goal
              </button>
            </div>
          )}
        </div>
      </div>}

      {/* Add expense */}
      {expSheet&&<div style={{position:"absolute",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}} onClick={()=>{setExpSheet(false);setSelCat(null);setExpSearch("");setNewExpAmt("");}}/>
        <div style={{position:"relative",background:T.bg2,borderRadius:"26px 26px 0 0",maxHeight:"88%",display:"flex",flexDirection:"column",animation:"popIn .3s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{padding:"16px 16px 10px",borderBottom:`1px solid ${T.sep}`}}>
            <div style={{width:38,height:5,borderRadius:99,background:T.bg3,margin:"0 auto 12px"}}/>
            <div style={{fontWeight:800,fontSize:18,color:T.label,marginBottom:10}}>Add Expense</div>
            <div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}>🔍</span><input ref={searchRef} value={expSearch} onChange={e=>{setExpSearch(e.target.value);setSelCat(null);}} placeholder="Search categories..." style={{width:"100%",padding:"10px 10px 10px 36px",borderRadius:12,border:`1.5px solid ${T.sep}`,background:T.bg3,color:T.label,fontSize:14,fontFamily:"inherit",outline:"none"}}/></div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"10px 16px"}}>
            {!selCat?(
              expSearch.trim()?(
                filteredCats.length===0?<div style={{textAlign:"center",padding:"30px 0",color:T.label3,fontSize:14}}>No matches</div>:
                filteredCats.map(cat=><button key={cat.id} onClick={()=>setSelCat(cat)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:12,background:T.bg2,border:`1px solid ${T.sep}`,cursor:"pointer",marginBottom:5,textAlign:"left"}}><div style={{width:32,height:32,borderRadius:10,background:cat.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{cat.i}</div><div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:T.label}}>{cat.l}</div><div style={{fontSize:10,color:T.label3}}>{cat.g}</div></div></button>)
              ):(
                Object.entries(GROUPED_ECATS).map(([group,cats])=>(
                  <div key={group} style={{marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:T.label3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6,paddingLeft:2}}>{group}</div>
                    <div style={{background:T.bg2,borderRadius:15,overflow:"hidden",border:`1px solid ${T.sep}`}}>
                      {cats.map((cat,j)=><button key={cat.id} onClick={()=>setSelCat(cat)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 13px",background:"transparent",border:"none",borderBottom:j<cats.length-1?`1px solid ${T.sep}`:"none",cursor:"pointer",textAlign:"left"}}><div style={{width:28,height:28,borderRadius:8,background:cat.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{cat.i}</div><span style={{fontWeight:600,fontSize:13,color:T.label,flex:1}}>{cat.l}</span></button>)}
                    </div>
                  </div>
                ))
              )
            ):(
              <div>
                <button onClick={()=>setSelCat(null)} style={{background:"none",border:"none",color:RC.mind.s,fontWeight:600,fontSize:14,cursor:"pointer",marginBottom:16,padding:0}}>← Back</button>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                  <div style={{width:48,height:48,borderRadius:15,background:selCat.c+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{selCat.i}</div>
                  <div><div style={{fontWeight:800,fontSize:18,color:T.label}}>{selCat.l}</div><div style={{fontSize:12,color:T.label2}}>{selCat.g}</div></div>
                </div>
                <div style={{position:"relative",marginBottom:10}}>
                  <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:18,fontWeight:700,color:selCat.c}}>₦</span>
                  <input type="tel" inputMode="numeric" autoFocus value={newExpAmt} placeholder="0" onChange={e=>{const r=e.target.value.replace(/\D/g,"");setNewExpAmt(r?parseInt(r).toLocaleString():"");}} style={{width:"100%",padding:"12px 12px 12px 42px",borderRadius:12,border:`1.5px solid ${newExpAmt?selCat.c:T.sep}`,background:T.bg3,color:T.label,fontSize:22,fontWeight:800,fontFamily:"inherit",outline:"none"}}/>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>{[5000,10000,20000,30000,50000].map(a=><button key={a} onClick={()=>setNewExpAmt(a.toLocaleString())} style={{padding:"6px 11px",borderRadius:99,border:`1.5px solid ${newExpAmt===a.toLocaleString()?selCat.c:T.sep}`,background:newExpAmt===a.toLocaleString()?selCat.c+"22":"transparent",color:newExpAmt===a.toLocaleString()?selCat.c:T.label2,fontWeight:600,fontSize:12,cursor:"pointer"}}>₦{a.toLocaleString()}</button>)}</div>
                <button onClick={()=>{if(!newExpAmt)return;setBudget(p=>[...p,{id:"b"+Date.now(),l:selCat.l,i:selCat.i,c:selCat.c,amt:parseInt(newExpAmt.replace(/,/g,""))||0}]);setNewExpAmt("");setSelCat(null);setExpSearch("");setExpSheet(false);}} style={{width:"100%",padding:"13px",borderRadius:15,background:newExpAmt?"#000":T.bg3,color:newExpAmt?"#fff":T.label3,border:"none",fontWeight:700,fontSize:15,cursor:newExpAmt?"pointer":"default"}}>Add {selCat.l}</button>
              </div>
            )}
          </div>
        </div>
      </div>}

      {/* Add income */}
      {incSheet&&<div style={{position:"absolute",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)"}} onClick={()=>{setIncSheet(false);setNewIncL("");setNewIncA("");}}/>
        <div style={{position:"relative",background:T.bg2,borderRadius:"26px 26px 0 0",padding:"22px 22px 32px",animation:"popIn .3s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{width:38,height:5,borderRadius:99,background:T.bg3,margin:"0 auto 16px"}}/>
          <div style={{fontWeight:800,fontSize:18,color:T.label,marginBottom:14}}>Add Income Source</div>
          {[["Source name","text","e.g. Side hustle","l"],["Monthly amount","number","0","a"]].map(([lbl,type,ph,key])=>(
            <div key={key} style={{marginBottom:12}}>
              <div style={{fontSize:10,color:T.label3,textTransform:"uppercase",letterSpacing:".06em",fontWeight:600,marginBottom:5}}>{lbl}</div>
              <input type={type} placeholder={ph} value={key==="l"?newIncL:newIncA} onChange={e=>{if(key==="l")setNewIncL(e.target.value);else{const r=e.target.value.replace(/\D/g,"");setNewIncA(r?parseInt(r).toLocaleString():"");}}} style={{width:"100%",padding:"11px 13px",borderRadius:12,border:`1.5px solid ${T.sep}`,background:T.bg3,color:T.label,fontSize:14,fontFamily:"inherit",fontWeight:600,outline:"none"}}/>
            </div>
          ))}
          <button onClick={()=>{if(!newIncL||!newIncA)return;setIncomes(p=>[...p,{id:"i"+Date.now(),l:newIncL,i:"💵",amount:parseInt(newIncA.replace(/,/g,""))||0}]);setNewIncL("");setNewIncA("");setIncSheet(false);}} style={{width:"100%",padding:"13px",borderRadius:16,background:newIncL&&newIncA?"#000":T.bg3,color:newIncL&&newIncA?"#fff":T.label3,border:"none",fontWeight:700,fontSize:15,cursor:"pointer",marginTop:4}}>Add Income Source</button>
        </div>
      </div>}

      {/* Repo sheet */}
      {repoSheet&&<RepoSheet
        existingLabels={goals.map(g=>g.label)}
        onAdd={t=>{setGoals(p=>[...p,{id:Date.now(),category:t.category,icon:t.icon,label:t.label,dailyT:t.dailyT,todayP:0,lastDate:todayKey(),unit:t.unit,active:true,pinned:false}]);}}
        onClose={()=>setRepoSheet(false)}
      />}

      {/* About */}
      {aboutSheet&&<div style={{position:"absolute",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)"}} onClick={()=>setAboutSheet(false)}/>
        <div style={{position:"relative",background:T.bg2,borderRadius:"26px 26px 0 0",maxHeight:"92%",display:"flex",flexDirection:"column",animation:"popIn .3s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{padding:"16px 20px 13px",borderBottom:`1px solid ${T.sep}`}}>
            <div style={{width:38,height:5,borderRadius:99,background:T.bg3,margin:"0 auto 14px"}}/>
            <div style={{fontWeight:800,fontSize:20,color:T.label}}>About Orbit</div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px 30px"}}>
            {[{icon:"🪞",title:"Orbit shows. You decide.",body:"No notifications. No scores. No grades. Orbit shows you clearly where you are — and what you do with that is entirely yours. Every feature exists to give you clarity, not compliance."},
              {icon:"◎",title:"Rings are daily. Deliberately.",body:"Every ring resets at midnight. Every tap is yours. The calendar shows your consistency over time — not your speed, not your score. Honest imperfection beats a fake streak."},
              {icon:"📚",title:"Ring repositories are starting points.",body:"Each life category — Health, Mind, Finance, Connect, Growth — has a curated library of goal templates. They are not prescriptions. Browse, pick what resonates, ignore the rest. Build your own from scratch at any time."},
              {icon:"🔥",title:"Streaks reward showing up.",body:"A streak measures how consistently you choose to show up. Not how perfectly you perform. That is the only thing that compounds."},
              {icon:"🏛️",title:"Tax is shown, not hidden.",body:"Orbit computes your PAYE using the actual Personal Income Tax Act (PITA 2011), Pension Reform Act 2014, and NHF Act. You see the real brackets, CRA deduction, pension and NHF — because your actual take-home is the only number that matters for budgeting."},
              {icon:"👥",title:"Friends see commitment, not spending.",body:"When you add a friend, they see your rings and your streak. They never see your income, budget, or spending. That is always private."},
              {icon:"🔒",title:"Your data lives on your phone.",body:"No accounts, no servers, no company watching. Everything in Orbit stays on your device. Delete the app and it is gone. That is a feature."},
            ].map((item,i,arr)=>(
              <div key={i} style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}><span style={{fontSize:18}}>{item.icon}</span><div style={{fontWeight:800,fontSize:14,color:T.label}}>{item.title}</div></div>
                <div style={{fontSize:13,color:T.label2,lineHeight:1.75}}>{item.body}</div>
                {i<arr.length-1&&<div style={{height:1,background:T.sep,marginTop:16}}/>}
              </div>
            ))}
            <div style={{background:T.bg3,borderRadius:12,padding:"10px 14px",marginTop:6,textAlign:"center"}}><div style={{fontSize:11,color:T.label3}}>Orbit v2.0 — Built for Nigeria — Your life, in motion.</div></div>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function Root() {
  const STORE='orbit_v2';
  const load=(key,fb)=>{try{const v=localStorage.getItem(STORE+':'+key);return v?JSON.parse(v):fb;}catch{return fb;}};
  const save=(key,val)=>{try{localStorage.setItem(STORE+':'+key,JSON.stringify(val));}catch{}};
  const [dark,setDark]=useState(()=>load('dark',false));
  const toggle=useCallback(()=>setDark(d=>{save('dark',!d);return !d;}),[]);
  const T=dark?DARK:LIGHT;
  const [screen,setScreen]=useState(()=>load('screen','onboard'));
  const [profile,setProfile]=useState(()=>load('profile',null));
  const [goals,setGoals]=useState(()=>load('goals',null));
  const [budget,setBudget]=useState(()=>load('budget',null));
  return (
    <Ctx.Provider value={{dark,toggle,T}}>
      {/* Global styles in index.css */}
      <div style={{height:"100%",background:T.bg,overflow:"hidden",position:"relative",color:T.label}}>
        {screen==="onboard"&&<Onboarding onComplete={(p,g,b)=>{setProfile(p);setGoals(g);setBudget(b);setScreen('app');save('profile',p);save('goals',g);save('budget',b);save('screen','app');}}/>}
        {screen==="app"&&profile&&goals&&budget&&<Dashboard profile={profile} goals={goals} budget={budget}/>}
      </div>
    </Ctx.Provider>
  );
}

