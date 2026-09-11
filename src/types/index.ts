/**
 * Domain types for the Gastroenterology Book Bank catalogue.
 *
 * These shapes are the contract between the data layer and every page.
 * When the mock fixtures are swapped for Postgres, only `lib/data/*`
 * changes: these types and the components that consume them do not.
 */

export type BookStatus = "available" | "borrowed" | "damaged" | "lost";

export type BookLanguage = "bn" | "en";

export type BookFormat = "pdf" | "epub";

export interface Author {
  id: string;
  slug: string;
  name: string;
  nameBn?: string;
  bio: string;
  bioBn?: string;
  era?: string;
  bookCount: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  description: string;
  /** Bengali readers see this; falls back to `description` when absent. */
  descriptionBn?: string;
  icon: string;
  bookCount: number;
}

/**
 * A clinical subject: the second way into the catalogue.
 *
 * `Category` files a book by where the reader is standing — at a bedside,
 * before an exam, in front of a scope — which is the question a clinician asks
 * about themselves. `Subject` files the same book by the specialty that owns
 * it, which is the question they ask about the patient, and the two do not
 * nest: *RadCases Gastrointestinal Imaging* is "Endoscopy & Imaging" to
 * someone looking for it and "Gastrointestinal Radiology" to someone who
 * reports it. Neither is a sub-tree of the other, so they are two flat
 * taxonomies over one shelf rather than one hierarchy pretending to serve both.
 *
 * The seven are the standard subspecialty division of gastroenterology and
 * hepatology, and they are fixed: a library does not get to invent an eighth
 * branch of the specialty. That is why there is no admin screen to add one,
 * where categories have one.
 */
export interface Subject {
  id: string;
  slug: string;
  name: string;
  nameBn: string;
  description: string;
  /** Bengali readers see this; falls back to `description` when absent. */
  descriptionBn?: string;
  icon: string;
  /**
   * The subject's plate: `/subjects/<slug>.webp`, built by
   * `scripts/build-subject-art.mjs`. Required, not optional — a subject page
   * opens on this image, so a subject without one is a broken page rather than
   * a page with something missing. Seven subjects, seven files, checked in.
   */
  image: string;
  bookCount: number;
}

export interface Book {
  id: string;
  /** Human-facing accession code shown in the admin table, e.g. BK-08745. */
  code: string;
  slug: string;

  title: string;
  titleBn?: string;
  subtitle?: string;

  authorId: string;
  authorName: string;
  authorNameBn?: string;

  categoryId: string;
  categoryName: string;

  /**
   * The clinical subject. Denormalised alongside the id for the same reason
   * `categoryName` is: a card renders without a join.
   */
  subjectId: string;
  subjectName: string;

  publisher: string;
  year: number;
  language: BookLanguage;
  /**
   * ISBN-13 or equivalent accession reference. Optional: four of the twenty
   * real titles have no readable ISBN; a fabricated one on a downloadable file
   * is worse than none. The detail page hides the row when absent.
   */
  isbn?: string;
  /** Edition label as printed, e.g. "Twenty-second edition" or "8th". */
  edition?: string;
  pages: number;

  description: string;
  descriptionBn?: string;

  /**
   * Where this file came from, and on what terms.
   *
   * **Read this differently than the library this was forked from.** There,
   * every title was redistributed under an open licence — WHO's CC BY-NC-SA
   * 3.0 IGO, Crown copyright with permission to reproduce — and `license` was
   * a credit those licences *required*, which is why it is a field on the
   * record rather than a line in a footer.
   *
   * Not one title here is like that. All thirteen are commercially copyrighted
   * medical textbooks, and every value is the notice as printed: all rights
   * reserved. The field does the same job in the opposite direction — it states
   * the position on every record instead of leaving it unsaid — but it is no
   * longer a permission, and nothing about its presence should be read as one.
   *
   * `sourceUrl` is absent on all thirteen for the matching reason: there is no
   * legitimate public source to point at, and a link to a mirror would be a
   * worse answer than a blank.
   *
   * Both are optional because the admin form can catalogue a book before its
   * paperwork is known. The detail page hides the row when absent.
   */
  sourceUrl?: string;
  license?: string;

  /** Physical-inventory fields: these drive the admin table columns. */
  status: BookStatus;
  copiesTotal: number;
  copiesAvailable: number;
  shelf: string;

  /**
   * Base hue (degrees) for the generated cover art when no real cover exists.
   * The 3D spine and the search index both read this, so it is always present
   * even when `coverImage` is set.
   */
  coverHue: number;

  /**
   * Path to the real cover image served from `public/covers/`, e.g.
   * `/covers/nelson-textbook-of-pediatrics.webp`. When present, `CoverArt`
   * renders this instead of the generated art. When absent, the generated art
   * is used as before.
   */
  coverImage?: string;

  /** File metadata. `fileUrl` points at R2 in production. */
  format: BookFormat;
  fileSizeMb: number;
  fileUrl: string;

  downloads: number;
  rating: number;
  featured: boolean;

  /**
   * Standing order, low first. Absent on almost every book.
   *
   * The library has three cornerstone references — the *Johns Hopkins Manual*,
   * *Obstetric Decisions* and *Te Linde's* — and they are meant to be the first
   * thing a reader meets, on every shelf, under every sort. `featured` cannot
   * say that: it is a boolean, so it can mark a book as important but not say
   * which important book comes first, and it is a curator's flag that the
   * admin form lets anyone toggle.
   *
   * So this is a separate, ordered field, and the data layer applies it as the
   * primary sort key on *every* ordering it returns — recent, popular, title,
   * year, related, the shelves, the search index. A sort the reader chose still
   * happens; it just happens below these three. See `lib/data/books`.
   */
  priority?: number;

  addedAt: string;
  uploadedBy: string;
}

/**
 * What the admin actually supplies when cataloguing a book. Everything else on
 * `Book` (accession code, slug, shelf position, counters) is derived by the
 * data layer, so two librarians can never disagree about the format of a code.
 */
export interface NewBookInput {
  title: string;
  titleBn?: string;
  authorId: string;
  categoryId: string;
  /** The clinical subject. Fixed list; see `Subject`. */
  subjectId: string;
  publisher: string;
  year: number;
  language: BookLanguage;
  /** Optional: a title with no readable ISBN leaves this absent. */
  isbn?: string;
  /** Edition label, e.g. "9th" or "Twenty-second edition". */
  edition?: string;
  /**
   * Served path to a real cover image, e.g. `/covers/<slug>.webp`.
   * Set by the seed / build script, not by the admin form.
   */
  coverImage?: string;
  pages: number;
  description: string;
  descriptionBn?: string;
  status: BookStatus;
  copiesTotal: number;
  format: BookFormat;
  fileSizeMb: number;
  featured: boolean;
  /** Cover scheme seed. See `lib/cover-theme`. */
  coverHue: number;
}

export interface NewAuthorInput {
  name: string;
  nameBn?: string;
  bio: string;
  bioBn?: string;
  era?: string;
}

export interface NewCategoryInput {
  name: string;
  nameBn: string;
  description: string;
  descriptionBn?: string;
  icon: string;
}

export interface CatalogueQuery {
  q?: string;
  category?: string;
  subject?: string;
  language?: BookLanguage;
  status?: BookStatus;
  sort?: "recent" | "popular" | "title" | "year";
  page?: number;
  perPage?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
