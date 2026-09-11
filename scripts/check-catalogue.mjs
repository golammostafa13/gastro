/**
 * Checks the joins the catalogue makes with bare strings.
 *
 *   node scripts/check-catalogue.mjs
 *
 * `buildBook` resolves `authorId`, `categoryId` and `subjectId` with
 * `.find(...)!`, and the slug is the join between `private/books/<slug>.pdf`,
 * `public/covers/<slug>.webp` and the `slug` field with nothing mapping
 * between them. Both of those are the right design and neither is checked by
 * `tsc`: a typo'd id is a runtime crash on a prerendered page, and a typo'd
 * slug is a book whose file 404s behind a password nobody can see past.
 *
 * So this asserts what the types cannot, and it runs alongside `npm run build`
 * rather than instead of it.
 */
import { existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { books, categories, subjects, authors, bookFiles } = await import(
  join(root, "src/lib/fixtures/catalogue.ts")
);

const problems = [];
const note = (m) => problems.push(m);

const seen = new Set();
for (const b of books) {
  if (seen.has(b.slug)) note(`duplicate slug: ${b.slug}`);
  seen.add(b.slug);

  const pdf = join(root, "private", "books", `${b.slug}.pdf`);
  if (!existsSync(pdf)) {
    note(`${b.slug}: no private/books/${b.slug}.pdf`);
    continue;
  }

  // Page count, off the file rather than off the record.
  const info = execFileSync("pdfinfo", [pdf], { encoding: "utf8" });
  const pages = Number(/^Pages:\s+(\d+)/m.exec(info)?.[1]);
  if (pages !== b.pages) note(`${b.slug}: pages ${b.pages} declared, ${pages} in the file`);

  const mb = Math.round((statSync(pdf).size / 1048576) * 10) / 10;
  if (Math.abs(mb - b.fileSizeMb) > 0.15)
    note(`${b.slug}: fileSizeMb ${b.fileSizeMb} declared, ${mb} on disk`);

  if (b.coverImage && !existsSync(join(root, "public", b.coverImage.replace(/^\//, ""))))
    note(`${b.slug}: coverImage ${b.coverImage} missing`);

  if (!bookFiles[b.slug]) note(`${b.slug}: absent from bookFiles`);
}

for (const [label, list, key] of [
  ["category", categories, "categoryId"],
  ["subject", subjects, "subjectId"],
  ["author", authors, "authorId"],
]) {
  const ids = new Set(list.map((x) => x.id));
  for (const b of books)
    if (!ids.has(b[key])) note(`${b.slug}: ${key} "${b[key]}" resolves to no ${label}`);
  // An empty shelf is a page that renders nothing, so it is a problem here.
  for (const x of list) if (x.bookCount === 0) note(`${label} "${x.slug}" holds no books`);
}

for (const s of subjects)
  if (!existsSync(join(root, "public", s.image.replace(/^\//, ""))))
    note(`subject "${s.slug}": plate ${s.image} missing`);

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(
  `✓ ${books.length} books, ${categories.length} categories, ` +
    `${subjects.length} subjects, ${authors.length} authors — all joins resolve.`,
);
