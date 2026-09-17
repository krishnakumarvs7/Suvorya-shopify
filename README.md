# Suvorya — Shopify theme

Liquid theme for the Suvorya store. The **home page and product page are fully
built**; the remaining templates are minimal stubs so the theme validates and
uploads — they get replaced as each design component is converted.

This repository is the theme's source of truth: theme files sit at the **repository
root** (`layout/`, `sections/`, `assets/`, `templates/`, `snippets/`, `config/`,
`locales/`) so it can be connected directly to Shopify's GitHub integration.

## Connect to Shopify

1. Commit these files to the repo root on `main`.
2. Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**.
3. Pick this repo and the `main` branch.

Shopify then syncs both ways: pushes to `main` update the theme, and edits made in
the theme editor are committed back to the branch. Two consequences worth knowing:

- **Theme-editor changes will appear as commits from Shopify** — mostly to
  `templates/*.json`, `config/settings_data.json`, and `locales/*.schema.json`.
  Pull before you push, or you will hit conflicts in those files.
- **Work on a branch for anything risky.** Connect a second, unpublished theme to a
  `dev` branch and merge to `main` to release.

## Assets you must add

Drop these into `assets/`:

| File | Used by |
|---|---|
| `hero-video.mp4` | hero section fallback |
| `hero-poster.jpg` | hero poster fallback |

Logos (`suvorya-logo-white.svg`, `suvorya-logo-black.svg`) and `kholic.otf` are
already committed. Hero media and logos are also exposed as image/video picker
settings, so they can be uploaded through the theme editor instead — the asset files
are only the fallback.

## Home-page section map

| Home block | Section file | Notes |
|---|---|---|
| Black promo banner | `sections/announcement-bar.liquid` | up to 5 rotating messages, per-message confetti toggle |
| Oversized header → compact header | `sections/header.liquid` | nav from a Shopify menu; overflow collapses into "More" |
| Hero video + headline | `sections/hero-video.liquid` | |
| Our Most Loved Pieces | `sections/product-rail.liquid` | collection-driven; ratings on |
| Onam / Diwali campaign pair | `sections/campaign-grid.liquid` | 2-up blocks |
| Our Collections | `sections/collection-tiles.liquid` | 7 tiles, per-tile background colour |
| New Arrivals | `sections/product-rail.liquid` | second instance; ratings off |
| Buy Less Buy Better marquee | `sections/marquee.liquid` | |
| Trust strip | `sections/trust-strip.liquid` | 4 icon blocks |
| Footer | `sections/footer.liquid` | link-list columns |

`product-rail` is one reusable section used twice. Arrows, hover image cycling, and
the scroll-progress track live in `assets/suvorya.js`; all design tokens are in the
`:root` block of `assets/suvorya.css`.

## Product-page section map

| Product block | Section file | Notes |
|---|---|---|
| Three-column PDP | `sections/main-product.liquid` | left info + accordions, centre gallery, right variants/purchase |
| Reviews | `sections/product-reviews.liquid` | score from metafields; bars and review bodies are section content |
| You May Also Like | `sections/product-recommendations.liquid` | Shopify recommendations API, collection fallback |

Template: `templates/product.json`. **There must be no `templates/product.liquid`** —
Shopify errors if both exist. Delete it from the repo if it is still there.

### Per-product accordion copy

The four accordions read `custom.<key>` metafields per product and fall back to the
text entered in the section. Create these metafield definitions (Settings →
Custom data → Products), type *Multi-line text* or *Rich text*:

`size_and_fit`, `details`, `care_guide`, `shipping_returns`

Without them every product shows the same generic copy from the section settings.

### Variant options

One option renders as image swatches (set its exact name in the section's **Option
shown as image swatches** field — default `Color`); all others render as pills.
Swatch images come from the product's images in order, so image 1 pairs with option
value 1. Price, add-to-bag state, and the `?variant=` URL update on selection, and
unavailable combinations are struck through.

## Header behaviour

Two states, class applied by `suvorya.js`. Over the hero: transparent, oversized
white logo (87px). Past 80px of scroll: compact bar, black logo, and a creme
(`--paper-warm`) strip behind the **nav row only** — the large state has no strip.
Non-home templates start in the compact state permanently.

## Ratings

`snippets/product-card.liquid` reads `product.metafields.reviews.rating` and
`reviews.rating_count` — the standard Shopify Product Reviews / Judge.me shape.
Products without those metafields render no stars. Using a different review app means
changing the two metafield lookups at the top of that snippet.

## Known gaps

- **Checkout is not themable** outside Shopify Plus — only approximated via Checkout
  branding settings (logo, colours, type).
- **Review bodies and the star distribution** cannot be read from Liquid — Shopify
  only exposes average and count. They are entered in the reviews section for now;
  install a review app and swap that section for the app's own block.
- **Wishlist** has no native Shopify object. Needs an app (Wishlist Plus, Swym) or a
  customer-metafield build. The header icon is hidden until a URL is set.
- **Kholic** needs a webfont licence for production. Serving `.otf` from `assets/`
  is redistribution — confirm the licence covers it, and convert to `.woff2`
  (`suvorya.css` already prefers `kholic.woff2` if present).
- Product-card hover cycles `product.images` in their Shopify order — reorder images
  on the product to control the sequence.
