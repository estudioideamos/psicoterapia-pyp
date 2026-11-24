/** Build static blog pages; no runtime, CMS or client dependency required. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const write = (name, data) => { fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true }); fs.writeFileSync(path.join(root, name), data); };
const posts = JSON.parse(read('scripts/blog-content.json'));
const origin = 'https://psicoterapiapyp.com';
const date = '2026-11-24';
const esc = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const url = post => `/blog/${post.slug}/`;
const minutes = post => Math.max(1, Math.ceil((post.intro + post.sections.map(s => s.title + ' ' + s.html.replace(/<[^>]*>/g, ' ')).join(' ')).split(/\s+/).length / 200));
const image = (post, hero = false) => `<img src="/assets/img/blog/${post.image}-960.webp" srcset="/assets/img/blog/${post.image}-480.webp 480w, /assets/img/blog/${post.image}-960.webp 960w, /assets/img/blog/${post.image}-1200.webp 1200w" sizes="${hero ? '(max-width: 720px) 100vw, 85vw' : '(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 40vw'}" width="1200" height="800" alt="${esc(post.alt)}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const source = read('quienes-somos.html');
const absolutize = text => text.replace(/(href|src)="(?!https?:|\/|#|mailto:|tel:)([^"]+)"/g, '$1="/$2"');
let header = absolutize(source.slice(source.indexOf('<body>'), source.indexOf('<main'))).replace(/ aria-current="page"/g, '');
header = header.replace(/(<a href="\/blog\/"[^>]*)(>)/g, '$1 aria-current="page"$2');
const footer = absolutize(source.slice(source.indexOf('<footer')));
const fonts = source.match(/<link href="https:\/\/fonts.googleapis.com[^>]+>/)[0];
const gtm = source.match(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/)[0];
const card = post => `<article class="blog-card"><a class="blog-card-photo" href="${url(post)}" tabindex="-1" aria-hidden="true">${image(post)}</a><div class="blog-card-copy"><p class="blog-meta">${post.category}<span>${minutes(post)} min de lectura</span></p><h3><a href="${url(post)}">${post.title}</a></h3><p>${post.description}</p><a class="blog-read" href="${url(post)}" aria-label="Leer: ${esc(post.title)}">Leer artículo</a></div></article>`;
function page({ title, description, pathname, body, post }) {
  const canonical = origin + pathname;
  const social = `${origin}/assets/img/blog/${(post || posts[0]).image}-social.jpg`;
  const breadcrumbs = [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: origin + '/' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: origin + '/blog/' }];
  if (post) breadcrumbs.push({ '@type': 'ListItem', position: 3, name: post.title, item: canonical });
  const graph = [
    { '@type': 'Organization', '@id': origin + '/#organization', name: 'Psicoterapia P&P', url: origin + '/', logo: origin + '/assets/img/logo-color.svg' },
    { '@type': 'BreadcrumbList', itemListElement: breadcrumbs },
    post ? { '@type': 'BlogPosting', '@id': canonical + '#article', headline: post.title, description, image: [social], datePublished: date, dateModified: date, inLanguage: 'es-AR', author: { '@type': 'Organization', name: 'Psicoterapia P&P', url: origin + '/quienes-somos.html' }, publisher: { '@id': origin + '/#organization' }, mainEntityOfPage: canonical, articleSection: post.category, wordCount: (post.intro + post.sections.map(s => s.html.replace(/<[^>]*>/g, ' ')).join(' ')).split(/\s+/).length, citation: post.sources.map(s => s.url) }
    : { '@type': 'CollectionPage', '@id': canonical, name: title, description, url: canonical, inLanguage: 'es-AR', mainEntity: { '@type': 'ItemList', itemListElement: posts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: origin + url(p), name: p.title })) } }
  ];
  return `<!doctype html>
<html lang="es-AR"><head><meta charset="UTF-8">
${gtm}<script src="/assets/js/theme.js?v=20260909-switch"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="${post ? 'article' : 'website'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:locale" content="es_AR"><meta property="og:site_name" content="Psicoterapia P&amp;P"><meta property="og:image" content="${social}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc((post || posts[0]).alt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${social}">
${post ? `<meta property="article:published_time" content="${date}T12:00:00-03:00"><meta property="article:modified_time" content="${date}T12:00:00-03:00">` : ''}
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>${fonts}
<link rel="stylesheet" href="/assets/css/style.css?v=20261124-blog"><link rel="stylesheet" href="/assets/css/blog.css?v=20261124">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script>
</head>${header.replace('<body>', '<body class="blog-page">')}
<main id="contenido">${body}</main>${footer}`;
}
const featured = posts[0];
write('blog/index.html', page({ title: 'Blog de psicología y terapia | Psicoterapia P&P', description: 'Lecturas para pensar lo que te pasa. Guías sobre empezar terapia, sesiones online y vínculos, con la mirada de Psicoterapia P&P.', pathname: '/blog/', body: `
<section class="blog-intro container"><p class="eyebrow">Blog · Psicoterapia P&amp;P</p><div class="blog-intro-row"><h1>Un espacio<br>para <em>pensarte.</em></h1><p>Preguntas que nos acercan a lo que sentimos. Lecturas sobre terapia, vínculos y maneras de habitar lo cotidiano.</p></div></section>
<section class="container blog-feature" aria-labelledby="featured-title"><a class="blog-feature-photo" href="${url(featured)}" tabindex="-1" aria-hidden="true">${image(featured, true)}</a><div class="blog-feature-copy"><p class="blog-meta">Para empezar<span>${minutes(featured)} min de lectura</span></p><h2 id="featured-title"><a href="${url(featured)}">${featured.title}</a></h2><p>${featured.intro}</p><a class="blog-read" href="${url(featured)}">Leer artículo</a></div></section>
<section class="container blog-library" aria-labelledby="more-title"><div class="blog-section-heading"><h2 id="more-title">Seguí explorando</h2><p>Una lectura, una nueva pregunta.</p></div><div class="blog-grid">${posts.slice(1).map(card).join('')}</div></section>
<aside class="container blog-note"><p>Contenido informativo de Psicoterapia P&amp;P. Estas lecturas no reemplazan una consulta ni una evaluación profesional. Las imágenes son ilustrativas, generadas con IA; no representan pacientes ni espacios reales del equipo.</p></aside>` }));
for (const post of posts) {
  write(`blog/${post.slug}/index.html`, page({ title: post.seoTitle, description: post.description, pathname: url(post), post, body: `
<article class="blog-article"><header class="article-heading container"><nav class="blog-breadcrumbs" aria-label="Ruta de navegación"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/blog/">Blog</a><span aria-hidden="true">/</span><span>${post.category}</span></nav><p class="eyebrow">${post.category}</p><h1>${post.title}</h1><p class="article-deck">${post.intro}</p><div class="article-meta"><a href="/quienes-somos.html">Psicoterapia P&amp;P</a><time datetime="${date}">24 de noviembre de 2026</time><span>${minutes(post)} min de lectura</span></div></header>
<figure class="container article-cover">${image(post, true)}<figcaption>Imagen ilustrativa generada con IA. No representa pacientes ni espacios reales de P&amp;P.</figcaption></figure>
<div class="container article-layout"><aside class="article-sidebar"><nav aria-label="En este artículo"><p class="eyebrow">En esta lectura</p><ol>${post.sections.map(s => `<li><a href="#${s.id}">${s.title}</a></li>`).join('')}</ol></nav><a class="article-contact" href="/contacto.html">¿Te gustaría conversar?<span>Consultá por una primera entrevista</span></a></aside><div class="article-content">${post.sections.map(s => `<section aria-labelledby="${s.id}"><h2 id="${s.id}">${s.title}</h2>${s.html}</section>`).join('')}
<aside class="article-sources"><h2>Fuentes y lectura complementaria</h2><ul>${post.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.name}</a></li>`).join('')}</ul><p>Contenido informativo de Psicoterapia P&amp;P. No reemplaza una evaluación profesional ni ofrece un diagnóstico individual.</p></aside>
<div class="article-author"><img src="/assets/img/logo-color.svg" width="112" height="40" loading="lazy" alt="Psicoterapia P&P"><div><strong>Psicoterapia P&amp;P</strong><p>Un espacio de escucha para adultos. Atención online en español y presencial, con orientación psicoanalítica.</p><a href="/quienes-somos.html">Conocé al equipo y nuestro enfoque</a></div></div></div></div></article>
<section class="container blog-library blog-related" aria-labelledby="related-title"><div class="blog-section-heading"><h2 id="related-title">Para seguir pensando</h2><a class="blog-read" href="/blog/">Ver todo el blog</a></div><div class="blog-grid">${posts.filter(p => p.slug !== post.slug).map(card).join('')}</div></section>` }));
}
console.log(`Built blog index and ${posts.length} articles.`);
