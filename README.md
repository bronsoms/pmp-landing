# Grup PMP — Landing page

Web d'una sola pàgina (one-page) del Grup PMP. Està generada amb
[Eleventy](https://www.11ty.dev/) (11ty), un generador de llocs estàtics: no hi ha
base de dades ni servidor d'aplicació. El resultat del `build` és HTML, CSS, JS i
imatges estàtics que es publiquen a GitHub Pages.

- **Domini de producció:** https://grup-pmp.com
- **Repositori:** `git@github.com:bronsoms/pmp-landing.git`
- **Branca que publica:** `main`

---

## 1. Posar-ho en marxa en local

Necessites **Node.js 20 o superior** (desenvolupat amb Node 22; GitHub Actions
fa servir Node 20).

```bash
npm install          # instal·la dependències (crea node_modules/)
npm run dev          # servidor local amb recàrrega automàtica
```

Obre la URL que et mostra la consola (normalment http://localhost:8080).
Cada vegada que guardis un fitxer de `src/`, el navegador es refresca sol.

Per generar la versió de producció dins la carpeta `_site/`:

```bash
npm run build
```

> ⚠️ **`node_modules/` i `_site/` no s'han de pujar al repositori** (ja estan
> ignorats al `.gitignore`). `node_modules/` es regenera amb `npm install` i
> `_site/` amb `npm run build`.

---

## 2. Estructura del projecte

```
pmp-landing/
├── src/                        ← TOT el codi font. És aquí on s'edita.
│   ├── index.njk               ← pàgina principal: només crida els partials en ordre
│   ├── _includes/
│   │   ├── base.njk            ← plantilla HTML: <head>, títol, meta, favicons, SEO
│   │   └── partials/           ← cada secció de la pàgina, un fitxer per secció
│   │       ├── nav.njk         ← logo + punts de navegació laterals
│   │       ├── hero.njk        ← vídeo de portada + titular
│   │       ├── intro.njk       ← text "Grup PMP és una organització pionera..."
│   │       ├── companies.njk   ← carrusel de les 4 companyies
│   │       ├── khanvian.njk    ← secció Khanvian® + lightbox del vídeo
│   │       ├── factory.njk     ← secció Factoria PMP
│   │       ├── contact.njk     ← telèfon, correu i CTA final
│   │       ├── footer.njk      ← copyright i ciutats (NO s'usa, vegeu §6)
│   │       └── mobile-menu.njk ← menú mòbil (NO s'usa, vegeu §6)
│   ├── css/style.css           ← TOTS els estils, en un sol fitxer
│   ├── js/main.js              ← TOT el JavaScript, en un sol fitxer
│   ├── assets/                 ← imatges, vídeo, logos SVG, favicons
│   ├── fonts/                  ← tipografies (Purista, Neue Haas, Atrament)
│   ├── robots.txt              ← SEO
│   ├── sitemap.xml             ← SEO
│   ├── llms.txt                ← descripció del lloc per a cercadors amb IA
│   ├── _data/                  ← dades per a Storyblok (INACTIU, vegeu §5)
│   └── _utils/storyblok.js     ← client de Storyblok (INACTIU, vegeu §5)
├── eleventy.config.js          ← configuració d'Eleventy
├── package.json                ← dependències i comandes (dev / build)
├── .env                        ← claus de Storyblok (NO es puja al repositori)
├── .github/workflows/deploy.yml← publicació automàtica a GitHub Pages
└── _site/                      ← resultat del build (generat, no s'edita)
```

### La regla d'or

**Edita sempre dins de `src/`.** La carpeta `_site/` es sobreescriu
sencera a cada `npm run build`: qualsevol canvi fet allà es perdrà.

---

## 3. Com canviar les coses més habituals

### Canviar un text

Els textos estan **escrits directament dins dels fitxers `.njk`** de
`src/_includes/partials/`. Obre el partial de la secció que vols tocar i edita
el text entre etiquetes HTML.

| Vols canviar...                     | Edita aquest fitxer                      |
|-------------------------------------|------------------------------------------|
| Titular de portada                  | `src/_includes/partials/hero.njk`        |
| Text de presentació de l'empresa    | `src/_includes/partials/intro.njk`       |
| Descripcions de les 4 companyies    | `src/_includes/partials/companies.njk`   |
| Text de Khanvian®                   | `src/_includes/partials/khanvian.njk`    |
| Text de la Factoria / m² de fàbrica | `src/_includes/partials/factory.njk`     |
| Telèfon, correu i CTA final         | `src/_includes/partials/contact.njk`     |
| Títol de la pestanya i meta-dades   | `src/_includes/base.njk`                 |

**Els salts de línia importen.** Als titulars hi ha `<br>` col·locats a mà per
trencar les línies en el punt exacte que vol el disseny. En pantalles de menys
de 1024 px, `src/js/main.js` substitueix automàticament aquests `<br>` per
espais, així que al mòbil el text flueix sol. Si afegeixes o treus `<br>`,
comprova el resultat en escriptori.

### Canviar el telèfon o el correu

Apareixen en **dos** llocs i cal actualitzar-los tots dos:

1. `src/_includes/partials/contact.njk` — el que veu l'usuari (recorda els
   enllaços `href="tel:..."` i `href="mailto:..."`).
2. `src/_includes/base.njk` — dins del bloc `application/ld+json`, les dades
   estructurades que llegeix Google.

### Canviar o afegir una imatge

1. Posa el fitxer dins de `src/assets/`.
2. Referencia'l al partial amb el filtre `| url`, que és obligatori perquè la
   ruta es construeixi bé:

```njk
<img src="{{ '/assets/el-meu-fitxer.jpg' | url }}" alt="Descripció de la imatge">
```

Posa sempre un `alt` descriptiu (accessibilitat i SEO) i afegeix
`loading="lazy"` a les imatges que no es veuen de bon principi.

> 📷 **Optimitza les imatges abans de pujar-les.** Ara mateix `src/assets/`
> pesa uns **138 MB** i hi ha fotos de més de 3 MB cadascuna, cosa que
> alenteix molt la càrrega de la web. Abans d'afegir-ne de noves, redimensiona-les
> (amplada màxima d'uns 2000 px) i comprimeix-les amb una eina com
> [Squoosh](https://squoosh.app/) o TinyPNG. És la millora de rendiment més
> gran i més senzilla que es pot fer en aquesta web.

### Canviar el vídeo de portada

El vídeo és `src/assets/factory-future.mp4` i la imatge que es veu mentre
carrega (el *poster*) és `src/assets/hero-robot-2.png`. Es defineixen a
`src/_includes/partials/hero.njk`.

### Canviar el vídeo de Khanvian®

Està allotjat a Vimeo i s'obre en una finestra superposada (*lightbox*). L'URL
està escrita a `src/js/main.js`, busca la variable `vimeoUrl`:

```js
var vimeoUrl = 'https://player.vimeo.com/video/1100597686?autoplay=1';
```

### Canviar colors o tipografies

Tot és a `src/css/style.css`. Els colors de la marca estan documentats al
comentari de les primeres línies del fitxer:

| Color              | Codi      |
|--------------------|-----------|
| Llima (corporatiu) | `#E4FE00` |
| Fosc               | `#2A2E34` |
| Gris clar          | `#CFD3D9` |
| Daurat             | `#B7A63A` |

Tipografies: **Purista** per a titulars i **Neue Haas** per al text corrent.
Es carreguen amb regles `@font-face` al principi del mateix CSS i els fitxers
viuen a `src/fonts/`.

---

## 4. Com funciona el disseny (per no trencar-lo)

Hi ha quatre efectes fets amb JavaScript (`src/js/main.js`) que convé conèixer
abans de tocar l'HTML o el CSS:

1. **La línia diagonal llima.** La línia groga que travessa tota la pàgina en
   diagonal no és una imatge: es dibuixa amb SVG, secció per secció. Cada
   secció conté un `<div class="diagonal-segment">` i el JavaScript calcula les
   coordenades perquè els trossos encaixin i formin una línia contínua.
   **Si afegeixes una secció nova, copia aquest `div` a dins** o la línia es
   tallarà en aquell punt.

2. **El carrusel de companyies.** Les 4 targetes de `companies.njk` es
   comporten de dues maneres diferents: en escriptori s'apilen i van rotant
   cada 15 segons (controlat per l'atribut `data-state`); en mòbil i tauleta es
   converteixen en un carrusel horitzontal. L'ordre de les targetes el marca
   l'atribut `data-index`.

3. **Aparició en fer scroll.** Qualsevol element amb la classe `sr` apareix
   suaument quan entra a la pantalla. Les classes `sr--d1`, `sr--d2` i `sr--d3`
   hi afegeixen un retard progressiu per encadenar les aparicions.

4. **Punts de navegació laterals.** Els punts de la dreta (`nav.njk`) salten a
   cada secció i es ressalten segons on ets. Estan lligats als `id` de les
   seccions (`#hero`, `#nosotros`, `#empresas`, `#khanvian`, `#factoria`,
   `#contacto`): **si canvies un `id` d'una secció, actualitza també el punt
   corresponent.**

**Responsive:** hi ha un únic punt de ruptura, a **1024 px**
(`@media (max-width: 1023px)`, línia 1099 del CSS). Per sota de 1024 px
s'activa la versió mòbil/tauleta. Comprova sempre els canvis a banda i banda
d'aquesta mida.

---

## 5. Storyblok (CMS) — preparat però NO actiu

Això és important per no perdre-hi temps:

El projecte té tot el connector d'un gestor de continguts (CMS) anomenat
**Storyblok** instal·lat i funcionant: `src/_utils/storyblok.js` es connecta a
l'API, `src/_data/home.js` descarrega els textos en castellà, català i anglès, i
les claus són a `.env`. **Però cap plantilla fa servir aquestes dades.** Tots
els textos estan escrits a mà dins dels partials.

Conseqüències pràctiques:

- **Editar un text a Storyblok NO canvia la web.** Els canvis s'han de fer als
  fitxers `.njk`.
- La web és **només en castellà**. El sistema multiidioma es va retirar (hi ha
  un commit `Remove multilanguage system, keep Spanish only`), tot i que el codi
  de traducció encara hi és.
- Si algun dia es vol activar el CMS, la feina pendent és substituir els textos
  fixos dels partials per variables (per exemple `{{ home.es.hero.title }}`).
  La canonada de dades ja està feta.
- Si no es vol fer servir mai, es poden esborrar `src/_data/`, `src/_utils/` i
  les dependències `@storyblok/*` i `dotenv` del `package.json`. El build
  continuarà funcionant.

### El fitxer `.env`

Conté tres claus de Storyblok i **no es puja al repositori** per seguretat
(està al `.gitignore`), de manera que **no vindrà dins del ZIP**. El build
funciona igual sense ell: si la connexió falla, `home.js` ho avisa per consola
i continua, perquè les dades no es fan servir enlloc. Si en algun moment
s'activa el CMS, caldrà demanar les claus i crear el fitxer:

```
STORYBLOK_DELIVERY_API_TOKEN=...
STORYBLOK_MANAGEMENT_TOKEN=...
STORYBLOK_REGION=eu
```

A GitHub, la clau de lectura està guardada com a *secret* del repositori
(`STORYBLOK_DELIVERY_API_TOKEN`), a Settings → Secrets and variables → Actions.

---

## 6. Codi sobrant (es pot esborrar sense por)

Durant el desenvolupament han quedat fitxers que **ja no formen part de la
web**. Els deixo documentats per si generen confusió:

- **`index.html` a la carpeta arrel** (65 KB) — és una versió antiga de la web
  en un sol fitxer. Eleventy **no la fa servir** (només llegeix `src/`), però
  encara està al repositori. No la toquis pensant que és la pàgina real: la
  pàgina real es genera a partir de `src/index.njk`.
- **`src/_includes/partials/footer.njk`** — el peu de pàgina amb el copyright i
  les ciutats. No es crida des de `src/index.njk`, així que **no surt a la web**.
  Si es vol recuperar, cal afegir `{% include "partials/footer.njk" %}` al final
  de `src/index.njk`.
- **`src/_includes/partials/mobile-menu.njk`** — menú mòbil d'una versió
  anterior. Tampoc no es crida. La navegació actual en mòbil es fa amb els
  punts laterals.
- **`src/_components/`** — carpeta buida.
- **`src/fonts/atrament/`** — tipografia d'una versió anterior del disseny que
  el CSS actual ja no carrega.
- **`src/assets/`** conté bastants fitxers duplicats o antics (parelles
  `imatge.jpg` i `imatge-v2.jpg`, fotogrames de vídeo `frame-XXs.jpg`...). Abans
  d'esborrar-ne cap, comprova amb un cercador de text que no es faci servir:

```bash
grep -rn "nom-del-fitxer" src/
```

---

## 7. Publicar canvis a producció

La publicació és **automàtica**. Està configurada a
`.github/workflows/deploy.yml` i funciona així: cada vegada que es fa `push` a
la branca **`main`**, GitHub Actions instal·la les dependències, executa
`npm run build` i publica la carpeta `_site/` a GitHub Pages.

El procés complet per publicar un canvi:

```bash
npm run dev                      # 1. comprova el canvi en local
# ...edita els fitxers de src/...
npm run build                    # 2. assegura't que el build no dóna error
git add .
git commit -m "Descripció del canvi"
git push origin main             # 3. això ja dispara la publicació
```

Pots veure si la publicació ha anat bé a la pestanya **Actions** del repositori
a GitHub. Acostuma a trigar entre 1 i 2 minuts. També es pot llançar a mà des
d'allà mateix amb el botó *Run workflow* (`workflow_dispatch`).

> Si treballes en una branca diferent de `main`, els canvis **no es publiquen**.
> Això és intencionat: permet provar coses sense tocar la web en directe. Fusiona
> a `main` quan ho vulguis publicar.

### El domini

La web es serveix a `https://grup-pmp.com` a través de GitHub Pages amb un
domini personalitzat. La variable `PATH_PREFIX: /` del workflow és el que fa que
les rutes funcionin amb domini propi.

⚠️ **No he trobat cap fitxer `CNAME` al repositori**, que és el mecanisme
habitual de GitHub Pages per fixar el domini personalitzat. Probablement està
configurat directament a Settings → Pages del repositori. Val la pena
comprovar-ho, perquè si el domini es perd en algun desplegament, la solució és
crear un fitxer `CNAME` amb el contingut `grup-pmp.com` dins de `src/` i
afegir-lo com a `addPassthroughCopy` a `eleventy.config.js`.

---

## 8. SEO

- **Meta títol i descripció:** `src/_includes/base.njk`.
- **Dades estructurades** (Schema.org Organization: adreça, telèfon, empreses
  del grup, ciutats on s'opera): bloc `application/ld+json` del mateix
  `base.njk`. Si canvien les dades de l'empresa, actualitza-les aquí.
- **`src/sitemap.xml`:** conté la data `lastmod`. Convindria actualitzar-la
  quan es facin canvis importants de contingut.
- **`src/robots.txt`:** permet la indexació completa i apunta al sitemap.
- **`src/llms.txt`:** resum del lloc per als cercadors basats en IA.

---

## 9. Resum de problemes coneguts

Ordenats de més a menys urgent, per si es vol continuar millorant la web:

1. **Pes de les imatges.** `src/assets/` fa 138 MB, amb fotos individuals de
   més de 3 MB. És el principal problema de rendiment. Comprimir-les i
   convertir-les a WebP milloraria molt la velocitat de càrrega.
2. **Contingut no editable sense tocar codi.** Qualsevol canvi de text
   requereix editar fitxers i fer `push`. Si el client vol autonomia, cal
   acabar de connectar Storyblok (§5).
3. **Fitxers sobrants** al repositori (§6), que fan més confús el projecte.
4. **L'idioma declarat de la pàgina** és `lang="es"` a `base.njk`, cosa que és
   correcta perquè el contingut és en castellà. Tingues-ho en compte si algun
   dia es tradueix.
