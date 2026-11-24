// Public-page SEO invariants; the blog intentionally remains a draft.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base='https://psicoterapiapyp.com/';
const files=['index.html','quienes-somos.html','servicios.html','preguntas-frecuentes.html','contacto.html'];
const titles=new Set(), descriptions=new Set();
const sitemap=fs.readFileSync('sitemap.xml','utf8');
const locations=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);
assert.equal(locations.length,files.length,'Sitemap must contain only public pages');
for(const file of files){
 const html=fs.readFileSync(file,'utf8');
 const url=base+(file==='index.html'?'':file);
 const title=html.match(/<title>(.*?)<\/title>/)?.[1];
 const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
 assert.ok(title && description,`${file}: title and description required`);
 assert.ok(!titles.has(title)&&!descriptions.has(description),`${file}: metadata must be unique`);
 titles.add(title);descriptions.add(description);
 assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length,1,`${file}: one H1`);
 assert.equal([...html.matchAll(/<link rel="canonical"/g)].length,1,`${file}: one canonical`);
 assert.ok(html.includes(`rel="canonical" href="${url}"`));
 assert.ok(locations.includes(url),`${file}: missing from sitemap`);
 assert.ok(!/<meta[^>]+content="[^"]*noindex/i.test(html));
 assert.ok(!/href="(?:\/)?blog(?:\/|\.html)/.test(html),'Draft blog must not be linked');
 assert.ok(!/href="index\.html/.test(html),'Use canonical home URL');
 const keys=[...html.matchAll(/<meta (?:name|property)="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(keys).size,keys.length,`${file}: duplicate metadata`);
 const nodes=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(x=>{const d=JSON.parse(x[1]);return d['@graph']||[d];});
 assert.ok(nodes.some(x=>x.url===url && ['WebPage','AboutPage','ContactPage'].includes(x['@type'])),`${file}: page schema`);
 for(const image of html.matchAll(/<img\b[^>]*>/g)){
  assert.ok(/\balt="/.test(image[0]),`${file}: image alt required (empty for decoration)`);
  assert.ok(/\bwidth="/.test(image[0])&&/\bheight="/.test(image[0]),`${file}: image dimensions required`);
 }
}
assert.ok(/noindex/.test(fs.readFileSync('gracias/index.html','utf8')),'Thank-you page is not a landing page');
assert.ok(fs.readFileSync('robots.txt','utf8').includes('Sitemap: '+base+'sitemap.xml'));
console.log('SEO checks passed: 5 public pages, metadata, headings, canonical URLs, schema, images and draft exclusions.');
