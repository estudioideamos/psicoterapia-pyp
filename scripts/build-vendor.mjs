import {build} from 'esbuild';
import {copyFile, readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await build({stdin:{contents:`export {BufferGeometry, Clock, Color, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer} from 'three';`,resolveDir:process.cwd()},bundle:true,minify:true,format:'esm',outfile:'assets/vendor/three/three.module.min.js'});
for (const [source,target] of [
 ['three/LICENSE','three/LICENSE'],
 ['intl-tel-input/LICENSE','intl-tel-input/LICENSE'],
 ['intl-tel-input/dist/css/intlTelInput.css','intl-tel-input/css/intlTelInput.css'],
 ['intl-tel-input/dist/js/intlTelInputWithUtils.min.js','intl-tel-input/js/intlTelInputWithUtils.min.js'],
 ['intl-tel-input/dist/img/flags.webp','intl-tel-input/img/flags.webp'],
 ['intl-tel-input/dist/img/flags@2x.webp','intl-tel-input/img/flags@2x.webp'],
 ['lenis/LICENSE','lenis/LICENSE'],['lenis/dist/lenis.min.js','lenis/lenis.min.js']
]) await copyFile('node_modules/'+source,'assets/vendor/'+target);
const manifest=JSON.parse(await readFile('docs/dependencies.json','utf8'));
const pkg=JSON.parse(await readFile('package.json','utf8'));
manifest.dependencies=pkg.dependencies;
manifest.checked=new Date().toISOString().slice(0,10);
manifest.audit='Run npm audit to check the locked package versions; no guarantee of zero risk.';
for(const file of Object.keys(manifest.sha256)) manifest.sha256[file]=createHash('sha256').update(await readFile(file)).digest('hex');
await writeFile('docs/dependencies.json',JSON.stringify(manifest,null,2)+'\n');
