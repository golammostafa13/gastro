# Gastroenterology Book Bank: a digital library on the gut, the liver and the biliary tract

A bilingual (বাংলা / English) library for doctors, trainees and medical
students, opened by the password printed inside the sponsored copy, plus a
private admin for the librarian who maintains it. Sponsored by Square
Pharmaceuticals (Lanso D 30).

Porcelain ground, a midnight-navy ink, a sapphire that acts and a sky blue that
emits, and books rendered as physical objects rather than as cards with pictures
on them.

```bash
npm install
cp .env.example .env.local   # then fill it in; see "Getting in" below
npm run dev                  # http://localhost:3000 → /en/signin or /bn/signin
```

The bare domain opens the door rather than the library: `/` lands on sign-in,
and there is no way past it. Nothing on this site opens without a session,
not a book page, not the reader, not a file.

This library is a fork of the Maternity Book Bank, which is where most of the
architecture and nearly all of the reasoning in the comments comes from. Where
this one had to depart from it, the comment says so and why — those are the
places worth reading.

## Languages

Both languages are first-class, and the language is part of the URL:

| | |
|---|---|
| `/en/books` | English catalogue |
| `/bn/books` | the same catalogue in Bengali |
| `/` | redirects to whichever the browser asks for (`Accept-Language`) |

Everything switches: interface strings, book and author names, category
descriptions, dates, and numerals. The switch in the header is a plain link to
the same page in the other language, so it works without JavaScript and can be
shared.

- **Interface strings** live in [`src/lib/i18n/dictionaries/`](src/lib/i18n/dictionaries/).
  English is the source of truth; `Dictionary` is derived from it, so a key that
  is missing from Bengali fails `tsc` rather than shipping an English sentence
  into a Bengali page.
- **Catalogue content** picks its language in [`src/lib/i18n/content.ts`](src/lib/i18n/content.ts).
  All thirteen titles are English-language books carrying Bengali display
  titles, so `?language=bn` legitimately returns nothing.

## Getting in

The door asks for an **email address** and a **password**. They answer two
different questions, and keeping them apart is the whole model.

**Reading** is the password, printed inside the sponsored copy, so every reader
types the same word (`SITE_PASSWORD`, `LansoD`). There are no accounts to sign
up for. The address beside it grants an ordinary reader nothing at all and is
checked against nothing: it is required, shape-tested, and written down, so the
sponsor can see the print run is being read.

**Administering** needs *both* halves:

- the address must be listed in `ADMIN_EMAILS`, and
- `ADMIN_PASSWORD` (`LansoDD`) must be typed, not the reader one.

An address on the list that types the *reader* password is an ordinary reader
for that session. An address that is **not** on the list and types the admin
password is turned away outright rather than downgraded to a reader. That is
deliberate: the admin password is the reader password plus one character, so
"downgrade to reader" would quietly turn that extra character into no
protection at all. `passwordRole` tests the admin word first and compares it
exactly, and that order is insurance rather than a consequence of `===`.

The rejection message is the same sentence for every kind of wrong, so the form
cannot be used to discover who the administrators are.

The door is rate-limited — ten attempts per address per ten minutes, successes
included. Whether a session may administer is recomputed on every request from
the live `ADMIN_EMAILS` rather than stamped into the cookie, so removing an
address takes effect on the next request rather than when an eight-hour cookie
expires.

**This library is standalone.** The library it was forked from has a third door
path: an address and password belonging to a sibling site sharing one Redis
database, reached through an *unprefixed* key that `KV_PREFIX` could not
isolate. That path, the `sharedKey` helper that made it possible, and the
`SHARED_LOGIN_BEFORE` variable are all removed here, so `doorRole` is once
again the whole door and there is no way to reach an unprefixed key at all.

Three names must not collide with the maternity library in one browser or one
database, and all three are changed: the session cookie is `gbb_session`, the
intro curtain's `sessionStorage` key is `gbb:intro-seen`, and `KV_PREFIX`
defaults to `gbb` **in code**, so an unset variable fails safe rather than
silently rejoining a neighbour's keyspace — including the rate limiter's.

### The book files

They are not in `public/`. The proxy's matcher has to skip anything with a file
extension, so a PDF there would be reachable without ever meeting the password.

They live in `private/books/` and
[`src/app/api/file/[slug]/route.ts`](src/app/api/file/[slug]/route.ts) is the
only way to them. It checks the same signed cookie the proxy would have — before
a single byte is read — serves `inline` for the reader and `attachment` for the
download button, and supports range requests, without which opening the 116 MB
*Mayo Clinic Board Review* would pull the whole file before drawing page one.

Locally, with `BOOKS_RELEASE_BASE` unset, the file is read off disk. In
production that variable points at a GitHub Release holding the same slug-named
files and the route **proxies** the bytes rather than redirecting: GitHub
redirects to `release-assets.githubusercontent.com`, which sends no CORS
headers, and pdf.js reads through `fetch`, so a redirect is blocked by the
browser while a proxy is not.

## Licensing — read this before deploying

The library this was forked from carries a table naming the fourteen of its
thirty-three files that must not go into a public release, and a command that
names only the nineteen that may. That section exists because nineteen of its
titles were WHO, Crown-copyright or ministry publications under licences that
permit redistribution.

**This collection has none of those.** Every copyright page was read. The set is
Springer Nature, John Wiley & Sons, Elsevier, McGraw-Hill, Thieme and Oxford
University Press — commercial medical publishing, all rights reserved, no open
licence anywhere in it.

Two files also carried evidence of their provenance:

- *Gastrointestinal and Liver Secrets* had `https://bookbaz.ir` written into the
  PDF's own Title, Subject, Author and Keywords. That metadata is stripped here
  — the document information dictionary is replaced outright rather than blanked
  field by field — because a library should not serve a file that advertises
  where it was taken from.
- *Gastrointestinal Oncology* is stamped on **every page**: "Downloaded from
  onlinelibrary.wiley.com by University Of Wisconsin-Stout … 18/02/2024". That
  is burned into the page images and cannot be removed without re-rendering the
  file. It stays.

So the asymmetry is total: the maternity library could publish nineteen of
thirty-three at a guessable URL because those nineteen were licensed for it;
here that number is zero. A public release puts copyrighted textbooks at a
public URL, and the password then gates the reader and the download button
rather than the underlying file.

That was put to the library's owner, who decided to publish to a public GitHub
Release anyway, having weighed the risk as the library's to carry. It is their
call and the sponsor's, not one this repository should make quietly — but it
should also not be made silently, which is what this section is for.

```bash
gh release create v1.0-books private/books/*.pdf \
  --title "Book files v1.0" --notes "PDF assets served by /api/file/[slug]."
```

Unlike upstream, the glob is safe: the decision applies to the whole set, so
there is no mixed licence status to keep straight.

Every record's `license` field carries the notice as printed. `sourceUrl` is
absent on all thirteen: there is no legitimate public source to point at, and a
link to a mirror would be a worse answer than a blank.

### Picture credits are a licence condition

The chapter and hero plates are 3D medical renders from Wikimedia Commons, most
of them **CC BY-SA 4.0**, where attribution is a condition of use and the
duotoned derivatives inherit share-alike.

`scripts/build-chapter-art.mjs` generates
[`src/lib/data/chapter-art.ts`](src/lib/data/chapter-art.ts) with artist,
licence and source URL per plate. Upstream claimed the About page read that
module so a photograph could not reach the site without its credit — it did not;
nothing rendered it, which was survivable there because four of its seven
sources were CC0 or public domain. **The About page renders it here**, because
with these sources shipping without it would be a breach.

## Deploying

Vercel, or any host with a persistent disk. Nothing in the deploy is stateful
except Redis.

| Variable | Value |
|---|---|
| `SITE_PASSWORD` | the word printed in the sponsored copy |
| `ADMIN_PASSWORD` | the reader password plus one character; printed nowhere |
| `ADMIN_EMAILS` | the administrators, comma-separated |
| `AUTH_SECRET` | `openssl rand -base64 48` — **not** the development value |
| `BOOKS_RELEASE_BASE` | `https://github.com/golammostafa13/gastro/releases/download/v1.0-books` |
| `KV_PREFIX` | `gbb` |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | from the Upstash console |

**Redis is not optional in production.** The register, the door record and the
rate limit all fall back to the filesystem, which on a serverless host is
per-instance and wiped by every deploy. The admin Readers screen says which
store it is actually reading, so a misconfigured deploy is visible.

## How it is put together

| | |
|---|---|
| [`src/lib/data/books.ts`](src/lib/data/books.ts) | the only seam between pages and the catalogue store. |
| [`src/lib/fixtures/catalogue.ts`](src/lib/fixtures/catalogue.ts) | thirteen books, seven shelves, seven subjects. Every fact read off the file with `pdfinfo` and `pdftotext`, never off the filename — which was wrong twice. |
| [`src/components/book-3d.tsx`](src/components/book-3d.tsx) | a book as five faces of a bound volume. Pure CSS transforms, no WebGL, no library. |
| [`src/lib/lansod-canvas.ts`](src/lib/lansod-canvas.ts) | the Lanso D carton's artwork, drawn onto 2D canvases. The supplied photograph is a reference, never a texture — and it carries a watermark across the product, which is why. |
| [`src/lib/cover-theme.ts`](src/lib/cover-theme.ts) | eight cover schemes. Mostly spine stock here: all thirteen books have real publisher jackets. |
| [`src/app/globals.css`](src/app/globals.css) | design tokens, the 3D geometry, and one kill-switch that disables every transform under `prefers-reduced-motion`. |

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build; also typechecks
npm run lint    # eslint

node scripts/check-catalogue.mjs   # slug ↔ pdf ↔ cover, page counts, no empty shelves
PROBE_SESSION=<cookie> node probe.mjs <url> [shot.png] [waitMs]
```

The asset scripts are one-off tools, in this order — only the first touches the
network, and it is rate-limited:

```bash
node scripts/build-chapter-art.mjs   # fills .cache/, writes public/bg/ + the credits
node scripts/build-hero-art.mjs      # reads that cache; no network
node scripts/build-subject-art.mjs   # drawn from SVG; no network
node scripts/build-covers.mjs        # page one of each PDF; needs poppler-utils
node scripts/build-brand-assets.mjs  # renders the pack from lansod-canvas.ts
node scripts/build-icons.mjs         # after editing the mark in brand.tsx
node scripts/build-atmosphere.mjs    # needs GStreamer vp9enc
```

`scripts/build-bd-geo.mjs` should **not** be re-run: its output is committed and
identical for both libraries.

## Not done yet

- Books are held in memory, so admin edits last until the server restarts.
- The contact form validates but posts nowhere.
- The CSP in [`next.config.ts`](next.config.ts) still needs `'unsafe-inline'`
  for scripts; the note there explains how to remove it at the edge.
