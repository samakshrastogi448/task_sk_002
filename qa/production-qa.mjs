import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const url = process.env.PRODUCTION_URL
if (!url) process.exit(2)
const out = path.resolve('qa-artifacts')
fs.mkdirSync(out,{recursive:true})
const viewports=[['mobile',390,844],['tablet',768,1024],['laptop',1366,768],['desktop',1920,1080]]
const report={url,generatedAt:new Date().toISOString(),viewports:[],reducedMotion:null,summary:{blockers:0,majors:0,warnings:0,pass:false}}
const browser=await chromium.launch({headless:true})

async function settleImages(page){
  await page.evaluate(async()=>{
    const imgs=[...document.images]
    await Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{
      const done=()=>resolve()
      img.addEventListener('load',done,{once:true})
      img.addEventListener('error',done,{once:true})
      setTimeout(done,5000)
    })))
  })
  await page.waitForTimeout(300)
}

for(const [name,width,height] of viewports){
  const context=await browser.newContext({viewport:{width,height}})
  const page=await context.newPage(); const consoleErrors=[],pageErrors=[],failed=[]
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())})
  page.on('pageerror',e=>pageErrors.push(e.message))
  page.on('requestfailed',r=>{if(['document','script','stylesheet','font'].includes(r.resourceType()))failed.push(r.url())})
  let response=null,navError=null
  try{response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForLoadState('networkidle',{timeout:12000}).catch(()=>{});await page.waitForTimeout(600)}catch(e){navError=e.message}
  let interaction='not-present'
  if(!navError){
    const b=page.locator('button:visible').first()
    if(await b.count()){try{await b.click({timeout:5000});interaction='PASS';await page.waitForTimeout(500)}catch{interaction='FAIL'}}
    const h=await page.evaluate(()=>document.documentElement.scrollHeight)
    for(let y=0;y<h;y+=Math.max(360,Math.floor(height*.72))){await page.evaluate(v=>scrollTo(0,v),y);await page.waitForTimeout(110)}
    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight))
    await settleImages(page)
  }
  const metrics=navError?null:await page.evaluate(()=>{
    const brokenImages=[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>({src:i.currentSrc||i.src,alt:i.alt||''}))
    return {overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),brokenImages,text:document.body?.innerText.trim().length||0,transfer:performance.getEntriesByType('resource').reduce((s,r)=>s+(r.transferSize||0),0)}
  })
  let severe=[]
  if(!navError){
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze()
    severe=axe.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,html:n.html,failureSummary:n.failureSummary}))}))
  }
  if(!navError)await page.screenshot({path:path.join(out,`${name}-${width}x${height}.png`),fullPage:true})
  const blockers=[],majors=[],warnings=[];const status=response?.status()??null
  if(navError)blockers.push(`navigation:${navError}`)
  if(status!==null&&(status<200||status>=400))blockers.push(`http:${status}`)
  if(pageErrors.length)blockers.push(`page-errors:${pageErrors.length}`)
  if(consoleErrors.length)majors.push(`console-errors:${consoleErrors.length}`)
  if(failed.length)majors.push(`failed-core:${failed.length}`)
  if(metrics?.brokenImages?.length)majors.push(`broken-images:${metrics.brokenImages.length}`)
  if((metrics?.overflow||0)>2)majors.push(`overflow:${metrics.overflow}`)
  if(severe.length)majors.push(`a11y:${severe.map(v=>v.id).join(',')}`)
  if(interaction==='FAIL')majors.push('interaction')
  if((metrics?.text||0)<10&&!navError)majors.push('empty')
  const mb=(metrics?.transfer||0)/1048576
  if(mb>15)majors.push(`transfer:${mb.toFixed(1)}MB`);else if(mb>8)warnings.push(`transfer:${mb.toFixed(1)}MB`)
  report.summary.blockers+=blockers.length;report.summary.majors+=majors.length;report.summary.warnings+=warnings.length
  report.viewports.push({name,width,height,status,interaction,metrics,severe,consoleErrors,pageErrors,failed,blockers,majors,warnings})
  await context.close()
}

const rc=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'})
const rp=await rc.newPage();let reducedOk=true
try{const r=await rp.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await rp.waitForTimeout(500);const b=rp.locator('button:visible').first();if(await b.count())await b.click();await settleImages(rp);reducedOk=(r?.status()??500)<400&&await rp.evaluate(()=>document.body.innerText.trim().length>0);await rp.screenshot({path:path.join(out,'reduced-motion.png'),fullPage:true})}catch{reducedOk=false}
report.reducedMotion={pass:reducedOk};if(!reducedOk)report.summary.majors++
await rc.close();await browser.close()
report.summary.pass=report.summary.blockers===0&&report.summary.majors===0
fs.writeFileSync(path.join(out,'qa-report.json'),JSON.stringify(report,null,2))
const detail=report.viewports.flatMap(v=>[
  `## ${v.name} ${v.width}x${v.height}`,
  `- HTTP: ${v.status??'n/a'}`,
  `- Interaction: ${v.interaction}`,
  `- Broken images: ${v.metrics?.brokenImages?.length??'n/a'}`,
  ...(v.metrics?.brokenImages||[]).map(x=>`  - ${x.src} | ${x.alt}`),
  `- A11y severe: ${v.severe.length}`,
  ...v.severe.flatMap(a=>a.nodes.map(n=>`  - ${a.id}: ${Array.isArray(n.target)?n.target.join(' '):n.target}`)),
  `- Majors: ${v.majors.length?v.majors.join('; '):'0'}`,
  ''
]).join('\n')
fs.writeFileSync(path.join(out,'qa-summary.md'),`# Production QA\n\n- URL: ${url}\n- Result: ${report.summary.pass?'PASS':'FAIL'}\n- Blockers: ${report.summary.blockers}\n- Majors: ${report.summary.majors}\n- Warnings: ${report.summary.warnings}\n\n${detail}`)
console.log(report.summary)
process.exit(report.summary.pass?0:1)
