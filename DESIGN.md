# Design system: White page, one photograph

Minimal and calm. Every page is type on white with generous space; the only photograph is the Earth at night on the home page, shown in a rounded plate. Structure comes from thin rules and a label column, not from cards, bands or imagery.

## Tokens (src/styles/main.css)
- Light (default, `:root`): ground `#FFFFFF`, surface `#F4F5F7`, text `#0A0F1A`, secondary `#434C5B`, muted `#626C7C`, hairline `#E1E4EA`, strong rule `#C3C8D2`, accent `#1D4ED8`.
- `.band-dark` still re-declares the tokens for a dark ground (ground `#070B14`, text `#F3F6FA`, accent `#8AB6FF`), but no page uses it now; only the unused CodeProof component does.
- Topic markers have a light and a dark set (Azure AI, Agents, .NET, Tinkering).
- `html` carries `data-theme="light"`. Container `.container-x` is 86rem wide.

## Type
- Mona Sans Variable (width axis) for headings: h1 and h2 at 114% width, weight 650, -0.035em tracking; smaller headings at normal width, weight 600. Geist Variable for body text; Geist Mono Variable for dates, reading time and labels. Self-hosted via Fontsource.
- Scale: home hero up to 96px, page title up to 72px (article title up to 60px), statements up to 64px, body 16-18px, measure 52-62ch.

## Images
- `.plate` is the one image frame: rounded (14px, 20px on desktop), cropped to cover. Used for the home photograph and for an article's own `heroImage` under its title.
- The home photograph is `earth-night` from `public/images/stock` (ids in `CREDITS.md` there), rendered by `Photo.astro`. The other five stock photos are no longer used.
- Projects show their artwork whole on a plate, never cropped. Article lists show no thumbnails.

## Components
- Header: fixed, transparent at the top, translucent white with blur and a hairline after 24px of scroll. Dark pill Contact button.
- PageHero: the title block for inner pages (title, lead, optional actions, `above` slot for a back link, optional `image` plate). `narrow` aligns it with the 44rem article column.
- Home: headline, lead and two buttons on white, then the photograph plate. Below it a plain index: section name in a narrow left column (sticky on desktop), content on the right, a rule between sections. Writing (five titles with topic and date), Services (tagline set large, service names), Projects (title and description), Contact. Blog list: every post is a PostRow (topic and date, title, summary), no featured post. Footer: white, with the name set very large in pale grey at 125% width, sized in cqw to span the column. CodeProof, ArchDiagram, FeaturedPost and Topics exist as components but are unused.
- Buttons: pill-shaped. `.btn-solid` is near-black with white text, blue on hover; `.btn-ghost` is outlined. `.link-arrow` for text links.

## Motion (all off under reduced motion; content is visible without JS)
- Page load: headline rises line by line; lead, actions and image plate fade up in sequence. On home the photograph settles from 112% scale.
- Home hero only (`HeroLights.astro`, 2D canvas, no library): the city lights in the photo flicker gently, a thin arc occasionally travels between two of them, and the photo drifts a few pixels with the mouse. Light positions are sampled from the photo itself. Paused off-screen.
- Scroll: `[data-reveal]` fades and rises once; `[data-stagger]` groups cascade; `[data-reveal="wipe"]` opens an image from the left.
- Hover: underline that draws in, arrows that travel, row background on article rows.
- Hover: image zoom inside frames, underline that draws in, arrows that travel.
- `src/scripts/motion.ts` arms reveals and toggles the header state.

## Content model
- Blog frontmatter `line: ai | agents | dotnet | hardware` (src/data/lines.ts). Missing falls back to .NET.
