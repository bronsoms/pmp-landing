import storyblok from '../_utils/storyblok.js';

/**
 * Flatten Storyblok structured content into the flat i18n key format
 * that main.js expects (e.g. "hero.title", "companies.pap.desc")
 */
// Static nav labels per language (not managed in CMS)
const navLabels = {
  es: { 'nav.subtitle': 'Construcción industrializada', 'nav.about': 'Nosotros', 'nav.companies': 'Empresas', 'nav.factory': 'Factoría', 'nav.contact': 'Contacto' },
  ca: { 'nav.subtitle': 'Construcció industrialitzada', 'nav.about': 'Nosaltres', 'nav.companies': 'Empreses', 'nav.factory': 'Factoria', 'nav.contact': 'Contacte' },
  en: { 'nav.subtitle': 'Industrialized Construction', 'nav.about': 'About', 'nav.companies': 'Companies', 'nav.factory': 'Factory', 'nav.contact': 'Contact' },
};

function flattenToI18n(data, lang = 'es') {
  const t = { ...navLabels[lang] };

  // Contact
  if (data.contact) {
    t['contact.label'] = data.contact.label;
    t['contact.title'] = data.contact.title;
    t['contact.phone'] = data.contact.phone_label;
    t['contact.cta'] = data.contact.cta;
  }

  // Hero
  if (data.hero) {
    t['hero.title'] = data.hero.title;
    t['hero.eyebrow'] = data.hero.eyebrow;
    t['hero.stat.projects'] = data.hero.stat_projects_label;
    t['hero.stat.years'] = data.hero.stat_years_label;
    t['hero.stat.factory'] = data.hero.stat_factory_label;
    t['hero.scroll'] = data.hero.scroll_text;
  }

  // Intro
  if (data.intro) {
    t['intro.founder'] = data.intro.founder_role;
    t['intro.lead'] = data.intro.lead;
    t['intro.text'] = data.intro.text;
  }

  // Companies
  if (data.companies) {
    t['companies.label'] = data.companies.label;
    t['companies.title'] = data.companies.title;

    if (data.companies.cards) {
      const cardKeys = ['pmp', 'pap', 'studio', 'aparts'];
      data.companies.cards.forEach((card, i) => {
        const key = cardKeys[i] || `card${i}`;
        t[`companies.${key}.desc`] = card.description;
        if (card.link_text) {
          t[`companies.${key}.link`] = card.link_text;
        }
      });
    }
  }

  // Khanvian
  if (data.khanvian) {
    t['khanvian.title'] = data.khanvian.title;
    t['khanvian.text'] = data.khanvian.text;
  }

  // Factory
  if (data.factory) {
    t['factory.badge'] = data.factory.badge_text;
    t['factory.label'] = data.factory.label;
    t['factory.title'] = data.factory.title;
    t['factory.text'] = data.factory.text;
    t['factory.highlight'] = data.factory.highlight;
  }

  // Footer
  if (data.footer) {
    t['footer.rights'] = data.footer.rights;
  }

  // Meta
  t['meta.title'] = data.meta_title;
  t['meta.description'] = data.meta_description;

  return t;
}

function parseStory(content) {
  const sections = {};
  if (content.body) {
    for (const blok of content.body) {
      sections[blok.component] = blok;
    }
  }
  return {
    meta_title: content.meta_title,
    meta_description: content.meta_description,
    ...sections,
  };
}

export default async function home() {
  try {
    const [esRes, caRes, enRes] = await Promise.all([
      storyblok.get('cdn/stories/home', { version: 'draft' }),
      storyblok.get('cdn/stories/home', { version: 'draft', language: 'ca' }),
      storyblok.get('cdn/stories/home', { version: 'draft', language: 'en' }),
    ]);

    const es = parseStory(esRes.data.story.content);
    const ca = parseStory(caRes.data.story.content);
    const en = parseStory(enRes.data.story.content);

    return {
      es,
      ca,
      en,
      // Flat translations for client-side i18n (same format as before)
      translations: {
        ca: flattenToI18n(ca, 'ca'),
        en: flattenToI18n(en, 'en'),
      },
    };
  } catch (e) {
    console.warn('⚠ Storyblok fetch failed:', e.message);
    return null;
  }
}
