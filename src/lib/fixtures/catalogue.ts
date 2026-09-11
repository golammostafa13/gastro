import type { Author, Book, BookStatus, Category, Subject } from "@/types";

/**
 * Catalogue fixtures for the Gastroenterology Book Bank.
 *
 * Thirteen real files: the reference textbooks, revision titles and
 * subspecialty monographs a Bangladeshi physician, trainee or final-year
 * student actually reaches for on the gut, the liver and the biliary tract. A
 * compact seed list is expanded into full `Book` records by `buildBook` below,
 * so the verified metadata stays readable and the derived fields (codes,
 * shelves, counts) stay internally consistent.
 *
 * Everything here is deterministic (no `Math.random`), so server and client
 * renders always agree and there are no hydration mismatches.
 *
 * **Every fact below was read off the file itself**, with `pdfinfo` for the page
 * count and `pdftotext` on the title and copyright pages for everything else.
 * Not from the file names, which are wrong or useless on most of them: the
 * supplied `4. Cotton_and_Williams'_..._The_Fundamentals.pdf` carries no
 * edition and is in fact the **eighth**, first published 2024, and
 * `Gastrointestinal and Liver Secrets ALGrawany 6E 2025 .pdf` had the name of
 * an e-book piracy site written into its own Title, Author, Subject and
 * Keywords fields. That metadata was stripped before the file was accepted
 * here; a library should not serve a file that advertises where it was taken
 * from.
 *
 * Embedded metadata is a hint and never the record. Four of these files have no
 * `Title` at all, one has an empty `Author`, and `Clinical Gastroenterology`
 * reports a `CreationDate` of 2014 for an edition whose copyright page reads
 * 2011. The copyright page wins every time.
 *
 * One declared gap. *Gastrointestinal and Liver Secrets* has no `isbn`: its
 * front matter is a scanned image and no ISBN is extractable from the file. A
 * number nobody could read is a number nobody should type, and inventing one on
 * a downloadable file is worse than leaving it out — the detail page hides the
 * row.
 *
 * ## On `license`, which reads differently here than it did upstream
 *
 * This catalogue was forked from a library whose titles were WHO, Crown and
 * ministry publications carrying open licences that expressly permit
 * redistribution, where `license` was a credit the licence *required*.
 *
 * Not one title here is like that. All thirteen are commercially copyrighted
 * medical textbooks -- Springer Nature, John Wiley & Sons, Elsevier,
 * McGraw-Hill, Thieme, Oxford University Press -- and every `license` field
 * below is the notice as printed, all rights reserved. It is a statement of the
 * position rather than a permission, and it is a field on the record rather
 * than a line in a footer so that the position is visible on every book instead
 * of being left unsaid. `sourceUrl` is absent on all thirteen for the same
 * reason: there is no legitimate public source to point at, and a link to a
 * mirror would be a worse answer than a blank.
 */

export const categories: Category[] = [
  /*
   * Seven shelves, and they answer the reader's question -- "where do I look
   * for this" -- rather than the specialty's. The split that matters most here
   * is the first two: "I need the answer on the ward, now" and "I am sitting
   * the FCPS in March" send a reader to different books, and collapsing them
   * into one Reference shelf of six would lose the only distinction this
   * taxonomy exists to draw.
   */
  {
    id: "cat-bedside",
    slug: "bedside-reference",
    name: "Bedside Reference",
    nameBn: "\u09b6\u09af\u09cd\u09af\u09be\u09aa\u09be\u09b6\u09c7\u09b0 \u09b0\u09c7\u09ab\u09be\u09b0\u09c7\u09a8\u09cd\u09b8",
    description:
      "The books you open with the patient in front of you: what the symptom means, which test settles it, and what to do before the registrar arrives.",
    descriptionBn:
      "\u09b0\u09cb\u0997\u09c0 \u09b8\u09be\u09ae\u09a8\u09c7 \u09a5\u09be\u0995\u09be \u0985\u09ac\u09b8\u09cd\u09a5\u09be\u09af\u09bc \u09af\u09c7 \u09ac\u0987\u0997\u09c1\u09b2\u09cb \u0996\u09cb\u09b2\u09be \u09b9\u09af\u09bc: \u09b2\u0995\u09cd\u09b7\u09a3\u09c7\u09b0 \u0985\u09b0\u09cd\u09a5, \u0995\u09cb\u09a8 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09af\u09bc \u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u09b9\u09ac\u09c7\u09a8, \u098f\u09ac\u0982 \u09aa\u09b0\u09ac\u09b0\u09cd\u09a4\u09c0 \u09aa\u09a6\u0995\u09cd\u09b7\u09c7\u09aa \u0995\u09c0\u0964",
    icon: "Stethoscope",
    bookCount: 0,
  },
  {
    id: "cat-exam",
    slug: "exam-revision",
    name: "Exams & Revision",
    nameBn: "\u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be \u0993 \u09aa\u09c1\u09a8\u09b0\u09be\u09b2\u09cb\u099a\u09a8\u09be",
    description:
      "Question-and-answer books, board reviews and the named signs an examiner still asks for. Written to be read the week before, not the year before.",
    descriptionBn:
      "\u09aa\u09cd\u09b0\u09b6\u09cd\u09a8\u09cb\u09a4\u09cd\u09a4\u09b0\u09c7\u09b0 \u09ac\u0987, \u09ac\u09cb\u09b0\u09cd\u09a1 \u09b0\u09bf\u09ad\u09bf\u0989 \u098f\u09ac\u0982 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u0995\u09c7\u09b0 \u099c\u09bf\u099c\u09cd\u099e\u09be\u09b8\u09bf\u09a4 \u0987\u09aa\u09a8\u09bf\u09ae\u09bf\u0995 \u09b8\u09be\u0987\u09a8\u0964 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0 \u0986\u0997\u09c7\u09b0 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7\u0993 \u09aa\u09a1\u09bc\u09be \u09af\u09be\u09af\u09bc\u0964",
    icon: "GraduationCap",
    bookCount: 0,
  },
  {
    /*
     * A shelf of one, deliberately. Lanso D is a proton pump inhibitor, and a
     * library given away with a dexlansoprazole pack that has no reflux shelf
     * would be telling on itself.
     */
    id: "cat-upper-gi",
    slug: "reflux-upper-gut",
    name: "Reflux & the Upper Gut",
    nameBn: "\u09b0\u09bf\u09ab\u09cd\u09b2\u09be\u0995\u09cd\u09b8 \u0993 \u0989\u09aa\u09b0\u09c7\u09b0 \u09aa\u09b0\u09bf\u09aa\u09be\u0995\u09a4\u09a8\u09cd\u09a4\u09cd\u09b0",
    description:
      "Heartburn, regurgitation and the oesophagus: how acid reaches where it should not, what that does over years, and when a pill stops being the answer.",
    descriptionBn:
      "\u09ac\u09c1\u0995 \u099c\u09cd\u09ac\u09be\u09b2\u09be\u09aa\u09cb\u09a1\u09bc\u09be, \u0996\u09be\u09a6\u09cd\u09af \u0989\u09a0\u09c7 \u0986\u09b8\u09be \u098f\u09ac\u0982 \u0996\u09be\u09a6\u09cd\u09af\u09a8\u09be\u09b2\u09c0: \u0985\u09cd\u09af\u09be\u09b8\u09bf\u09a1 \u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u09ad\u09c1\u09b2 \u099c\u09be\u09af\u09bc\u0997\u09be\u09af\u09bc \u09aa\u09cc\u0981\u099b\u09be\u09af\u09bc, \u09ac\u099b\u09b0\u09c7\u09b0 \u09aa\u09b0 \u09ac\u099b\u09b0 \u09a4\u09be\u09b0 \u09ab\u09b2, \u098f\u09ac\u0982 \u0995\u0996\u09a8 \u0993\u09b7\u09c1\u09a7\u0987 \u09af\u09a5\u09c7\u09b7\u09cd\u099f \u09a8\u09af\u09bc\u0964",
    icon: "Flame",
    bookCount: 0,
  },
  {
    id: "cat-hepatobiliary",
    slug: "liver-bile-pancreas",
    name: "Liver, Bile & Pancreas",
    nameBn: "\u09af\u0995\u09c3\u09ce, \u09aa\u09bf\u09a4\u09cd\u09a4 \u0993 \u0985\u0997\u09cd\u09a8\u09cd\u09af\u09be\u09b6\u09af\u09bc",
    description:
      "The organs behind the gut. Abnormal liver tests, the diseases that cause them elsewhere in the body, and the biliary tree that drains into the same place.",
    descriptionBn:
      "\u09aa\u09b0\u09bf\u09aa\u09be\u0995\u09a4\u09a8\u09cd\u09a4\u09cd\u09b0\u09c7\u09b0 \u09aa\u09c7\u099b\u09a8\u09c7\u09b0 \u0985\u0999\u09cd\u0997\u0997\u09c1\u09b2\u09cb\u0964 \u0985\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09b2\u09bf\u09ad\u09be\u09b0 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be, \u09a6\u09c7\u09b9\u09c7\u09b0 \u0985\u09a8\u09cd\u09af\u09a4\u09cd\u09b0 \u09af\u09c7\u09b8\u09ac \u09b0\u09cb\u0997 \u09a4\u09be \u0998\u099f\u09be\u09af\u09bc, \u098f\u09ac\u0982 \u09aa\u09bf\u09a4\u09cd\u09a4\u09a8\u09be\u09b2\u09c0\u0964",
    icon: "Droplets",
    bookCount: 0,
  },
  {
    id: "cat-endoscopy",
    slug: "endoscopy-imaging",
    name: "Endoscopy & Imaging",
    nameBn: "\u098f\u09a8\u09cd\u09a1\u09cb\u09b8\u09cd\u0995\u09cb\u09aa\u09bf \u0993 \u0987\u09ae\u09c7\u099c\u09bf\u0982",
    description:
      "Looking inside. How the scope is handled and what the pictures mean: the two halves of seeing the gut without opening the abdomen.",
    descriptionBn:
      "\u09ad\u09c7\u09a4\u09b0\u09c7 \u09a6\u09c7\u0996\u09be\u0964 \u09b8\u09cd\u0995\u09cb\u09aa \u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u099a\u09be\u09b2\u09be\u09a8\u09cb \u09b9\u09af\u09bc \u098f\u09ac\u0982 \u099b\u09ac\u09bf\u0997\u09c1\u09b2\u09cb \u0995\u09c0 \u09ac\u09b2\u09c7: \u09aa\u09c7\u099f \u09a8\u09be \u0995\u09c7\u099f\u09c7 \u09aa\u09b0\u09bf\u09aa\u09be\u0995\u09a4\u09a8\u09cd\u09a4\u09cd\u09b0 \u09a6\u09c7\u0996\u09be\u09b0 \u09a6\u09c1\u0987 \u0985\u09b0\u09cd\u09a7\u09c7\u0995\u0964",
    icon: "ScanLine",
    bookCount: 0,
  },
  {
    id: "cat-oncology",
    slug: "gut-cancer",
    name: "Cancer of the Gut",
    nameBn: "\u09aa\u09b0\u09bf\u09aa\u09be\u0995\u09a4\u09a8\u09cd\u09a4\u09cd\u09b0\u09c7\u09b0 \u0995\u09cd\u09af\u09be\u09a8\u09cd\u09b8\u09be\u09b0",
    description:
      "Tumours of the oesophagus, stomach, pancreas, liver and bowel, and the team meeting that decides what happens to the patient who has one.",
    descriptionBn:
      "\u0996\u09be\u09a6\u09cd\u09af\u09a8\u09be\u09b2\u09c0, \u09aa\u09be\u0995\u09b8\u09cd\u09a5\u09b2\u09c0, \u0985\u0997\u09cd\u09a8\u09cd\u09af\u09be\u09b6\u09af\u09bc, \u09af\u0995\u09c3\u09ce \u0993 \u0985\u09a8\u09cd\u09a4\u09cd\u09b0\u09c7\u09b0 \u099f\u09bf\u0989\u09ae\u09be\u09b0, \u098f\u09ac\u0982 \u09b0\u09cb\u0997\u09c0\u09b0 \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u09be \u09a0\u09bf\u0995 \u0995\u09b0\u09be \u09ae\u09be\u09b2\u09cd\u099f\u09bf\u09a1\u09bf\u09b8\u09bf\u09aa\u09cd\u09b2\u09bf\u09a8\u09be\u09b0\u09bf \u09ac\u09c8\u09a0\u0995\u0964",
    icon: "Ribbon",
    bookCount: 0,
  },
  {
    id: "cat-paediatric",
    slug: "children-digestive-health",
    name: "Children's Digestive Health",
    nameBn: "\u09b6\u09bf\u09b6\u09c1\u09a6\u09c7\u09b0 \u09aa\u09b0\u09bf\u09aa\u09be\u0995 \u09b8\u09cd\u09ac\u09be\u09b8\u09cd\u09a5\u09cd\u09af",
    description:
      "A child is not a small adult here. Growth, feeding and malabsorption change what the same symptom means and what it costs to miss it.",
    descriptionBn:
      "\u09b6\u09bf\u09b6\u09c1 \u09ab\u09c7\u09b2\u09c7 \u099b\u09cb\u099f \u09ac\u09af\u09bc\u09b8\u09cd\u0995 \u09a8\u09af\u09bc\u0964 \u09ac\u09c3\u09a6\u09cd\u09a7\u09bf, \u0996\u09be\u09a6\u09cd\u09af\u0997\u09cd\u09b0\u09b9\u09a3 \u0993 \u09b6\u09cb\u09b7\u09a3\u09c7\u09b0 \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u098f\u0995\u0987 \u09b2\u0995\u09cd\u09b7\u09a3\u09c7\u09b0 \u0985\u09b0\u09cd\u09a5 \u09ac\u09a6\u09b2\u09c7 \u09a6\u09c7\u09af\u09bc\u0964",
    icon: "Baby",
    bookCount: 0,
  },
];

/**
 * The clinical subjects: the second way into the catalogue.
 *
 * `Category` files a book by where the reader is standing -- at a bedside,
 * before an exam, in front of a scope -- which is the question a clinician
 * asks about *themselves*. `Subject` files the same book by the subspecialty
 * that owns it, which is the question they ask about the *patient*, and the
 * two do not nest: *RadCases Gastrointestinal Imaging* is "Endoscopy &
 * Imaging" to someone looking for it and "Gastrointestinal Radiology" to
 * someone who reports it. Neither is a sub-tree of the other, so they are two
 * flat taxonomies over one shelf rather than one hierarchy pretending to serve
 * both.
 *
 * Six of the thirteen land on Luminal Gastroenterology, and that imbalance is
 * declared rather than fixed. The obvious remedies -- an Inflammatory Bowel
 * Disease subject, a Pancreatobiliary Medicine subject -- would each hold zero
 * books today and be two broken pages. The answer to a lopsided shelf is more
 * books, not a tidier taxonomy.
 *
 * The seven are the standard subspecialty division of gastroenterology and
 * hepatology, and they are fixed: a library does not get to invent an eighth
 * branch of the specialty. That is why there is no admin screen to add one,
 * where categories have one.
 */
export const subjects: Subject[] = [
  {
    id: "sub-luminal",
    slug: "luminal-gastroenterology",
    name: "Luminal Gastroenterology",
    nameBn: "\u09b2\u09c1\u09ae\u09bf\u09a8\u09be\u09b2 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf",
    description:
      "The tube itself, mouth to anus: the diseases of the lumen and the mucosa that lines it.",
    descriptionBn:
      "\u09a8\u09b2\u09bf\u099f\u09bf \u09a8\u09bf\u099c\u09c7\u0987, \u09ae\u09c1\u0996 \u09a5\u09c7\u0995\u09c7 \u09aa\u09be\u09af\u09bc\u09c1 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4: \u09b2\u09c1\u09ae\u09c7\u09a8 \u0993 \u09ae\u09bf\u0989\u0995\u09cb\u09b8\u09be\u09b0 \u09b0\u09cb\u0997\u0964",
    icon: "Activity",
    image: "/subjects/luminal-gastroenterology.webp",
    bookCount: 0,
  },
  {
    id: "sub-hepatology",
    slug: "hepatology",
    name: "Hepatology",
    nameBn: "\u09b9\u09c7\u09aa\u09be\u099f\u09cb\u09b2\u099c\u09bf",
    description:
      "The liver and the biliary tree: how they fail, what the tests show, and what the rest of the body does to them.",
    descriptionBn:
      "\u09af\u0995\u09c3\u09ce \u0993 \u09aa\u09bf\u09a4\u09cd\u09a4\u09a8\u09be\u09b2\u09c0: \u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u09ac\u09bf\u0995\u09b2 \u09b9\u09af\u09bc, \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09af\u09bc \u0995\u09c0 \u09a7\u09b0\u09be \u09aa\u09a1\u09bc\u09c7, \u098f\u09ac\u0982 \u09a6\u09c7\u09b9\u09c7\u09b0 \u0985\u09a8\u09cd\u09af \u0985\u0982\u09b6 \u09a4\u09be\u09a6\u09c7\u09b0 \u0995\u09c0 \u0995\u09b0\u09c7\u0964",
    icon: "Droplets",
    image: "/subjects/hepatology.webp",
    bookCount: 0,
  },
  {
    id: "sub-motility",
    slug: "neurogastroenterology-motility",
    name: "Neurogastroenterology & Motility",
    nameBn: "\u09a8\u09bf\u0989\u09b0\u09cb\u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf \u0993 \u0997\u09a4\u09bf\u09b6\u09c0\u09b2\u09a4\u09be",
    description:
      "Movement and sensation: reflux, the sphincters, and the gut disorders where the anatomy is normal and the function is not.",
    descriptionBn:
      "\u0997\u09a4\u09bf \u0993 \u0985\u09a8\u09c1\u09ad\u09c2\u09a4\u09bf: \u09b0\u09bf\u09ab\u09cd\u09b2\u09be\u0995\u09cd\u09b8, \u09b8\u09cd\u09aa\u09bf\u0999\u09cd\u0995\u09cd\u099f\u09be\u09b0, \u098f\u09ac\u0982 \u09af\u09c7\u09b8\u09ac \u09b0\u09cb\u0997\u09c7 \u0997\u09a0\u09a8 \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u0995\u09bf\u09a8\u09cd\u09a4\u09c1 \u0995\u09be\u099c \u09a8\u09af\u09bc\u0964",
    icon: "Waves",
    image: "/subjects/neurogastroenterology-motility.webp",
    bookCount: 0,
  },
  {
    id: "sub-endoscopy",
    slug: "gastrointestinal-endoscopy",
    name: "Gastrointestinal Endoscopy",
    nameBn: "\u09aa\u09b0\u09bf\u09aa\u09be\u0995\u09a4\u09a8\u09cd\u09a4\u09cd\u09b0\u09c7\u09b0 \u098f\u09a8\u09cd\u09a1\u09cb\u09b8\u09cd\u0995\u09cb\u09aa\u09bf",
    description:
      "The procedure as a craft: holding the scope, reading what it shows, and the complications that follow doing either badly.",
    descriptionBn:
      "\u098f\u0995\u099f\u09bf \u09a6\u0995\u09cd\u09b7\u09a4\u09be \u09b9\u09bf\u09b8\u09c7\u09ac\u09c7 \u09aa\u09cd\u09b0\u0995\u09cd\u09b0\u09bf\u09af\u09bc\u09be: \u09b8\u09cd\u0995\u09cb\u09aa \u09a7\u09b0\u09be, \u09af\u09be \u09a6\u09c7\u0996\u09be \u09af\u09be\u09af\u09bc \u09a4\u09be \u09aa\u09a1\u09bc\u09be, \u098f\u09ac\u0982 \u09ad\u09c1\u09b2\u09c7\u09b0 \u099c\u099f\u09bf\u09b2\u09a4\u09be\u0964",
    icon: "Search",
    image: "/subjects/gastrointestinal-endoscopy.webp",
    bookCount: 0,
  },
  {
    id: "sub-imaging",
    slug: "gastrointestinal-radiology",
    name: "Gastrointestinal Radiology",
    nameBn: "\u09aa\u09b0\u09bf\u09aa\u09be\u0995\u09a4\u09a8\u09cd\u09a4\u09cd\u09b0\u09c7\u09b0 \u09b0\u09c7\u09a1\u09bf\u0993\u09b2\u099c\u09bf",
    description:
      "Plain films, contrast studies, CT and MRI of the abdomen, and the case-by-case habit of reading them.",
    descriptionBn:
      "\u09aa\u09cd\u09b2\u09c7\u0987\u09a8 \u09ab\u09bf\u09b2\u09cd\u09ae, \u0995\u09a8\u09cd\u099f\u09cd\u09b0\u09be\u09b8\u09cd\u099f \u09b8\u09cd\u099f\u09be\u09a1\u09bc\u09bf, \u09aa\u09c7\u099f\u09c7\u09b0 \u09b8\u09bf\u099f\u09bf \u0993 \u098f\u09ae\u0986\u09b0\u0986\u0987, \u098f\u09ac\u0982 \u0995\u09c7\u09b8 \u09a7\u09b0\u09c7 \u09aa\u09a1\u09bc\u09be\u09b0 \u0985\u09ad\u09cd\u09af\u09be\u09b8\u0964",
    icon: "ScanLine",
    image: "/subjects/gastrointestinal-radiology.webp",
    bookCount: 0,
  },
  {
    id: "sub-onc",
    slug: "gastrointestinal-oncology",
    name: "Gastrointestinal Oncology",
    nameBn: "\u09aa\u09b0\u09bf\u09aa\u09be\u0995\u09a4\u09a8\u09cd\u09a4\u09cd\u09b0\u09c7\u09b0 \u0995\u09cd\u09af\u09be\u09a8\u09cd\u09b8\u09be\u09b0\u09ac\u09bf\u09a6\u09cd\u09af\u09be",
    description:
      "Cancer of the digestive organs, staged and treated by a team rather than by one specialty.",
    descriptionBn:
      "\u09aa\u09b0\u09bf\u09aa\u09be\u0995 \u0985\u0999\u09cd\u0997\u09c7\u09b0 \u0995\u09cd\u09af\u09be\u09a8\u09cd\u09b8\u09be\u09b0, \u098f\u0995\u099f\u09bf \u09a6\u09b2 \u09b9\u09bf\u09b8\u09c7\u09ac\u09c7 \u09b8\u09cd\u099f\u09c7\u099c \u0993 \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u09be \u0995\u09b0\u09be \u09b9\u09af\u09bc\u0964",
    icon: "Ribbon",
    image: "/subjects/gastrointestinal-oncology.webp",
    bookCount: 0,
  },
  {
    id: "sub-paediatric",
    slug: "paediatric-gastroenterology",
    name: "Paediatric Gastroenterology",
    nameBn: "\u09b6\u09bf\u09b6\u09c1 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf",
    description:
      "The gut from birth to adolescence, where growth and nutrition are part of the diagnosis rather than a consequence of it.",
    descriptionBn:
      "\u099c\u09a8\u09cd\u09ae \u09a5\u09c7\u0995\u09c7 \u0995\u09bf\u09b6\u09cb\u09b0 \u09ac\u09af\u09bc\u09b8 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u09aa\u09b0\u09bf\u09aa\u09be\u0995\u09a4\u09a8\u09cd\u09a4\u09cd\u09b0, \u09af\u09c7\u0996\u09be\u09a8\u09c7 \u09ac\u09c3\u09a6\u09cd\u09a7\u09bf \u0993 \u09aa\u09c1\u09b7\u09cd\u099f\u09bf \u09b0\u09cb\u0997\u09a8\u09bf\u09b0\u09cd\u09a3\u09af\u09bc\u09c7\u09b0\u0987 \u0985\u0982\u09b6\u0964",
    icon: "Baby",
    image: "/subjects/paediatric-gastroenterology.webp",
    bookCount: 0,
  },
];

/**
 * The people and teams whose names are on these thirteen.
 *
 * "and Colleagues" where a book is genuinely a committee -- a multi-author
 * textbook has an editor, not an author, and naming only the first of five
 * editors on the spine of a 900-page collaboration misrepresents it. Where one
 * person's name *is* the book, as with McNally's *Secrets* or Talley's
 * *Clinical Gastroenterology*, it stands alone.
 *
 * Bengali names are transliterations. These are English-language authors and
 * nothing is gained by translating a surname; what the Bengali reader needs is
 * to be able to say it.
 */
export const authors: Author[] = [
  {
    id: "a-longo-fauci",
    slug: "longo-and-fauci",
    name: "Dan L. Longo and Anthony S. Fauci",
    nameBn: "\u09a1\u09cd\u09af\u09be\u09a8 \u098f\u09b2. \u09b2\u0999\u09cd\u0997\u09cb \u0993 \u0985\u09cd\u09af\u09be\u09a8\u09cd\u09a5\u09a8\u09bf \u098f\u09b8. \u09ab\u09be\u0989\u099a\u09bf",
    bio:
      "Two of the editors of Harrison's Principles of Internal Medicine, and the pair whose names are on the gastroenterology extract drawn from it. Longo is at Harvard Medical School and the New England Journal of Medicine; Fauci led the US National Institute of Allergy and Infectious Diseases for thirty-eight years.",
    bioBn:
      "\u09b9\u09cd\u09af\u09be\u09b0\u09bf\u09b8\u09a8\u09cd\u09b8 \u09aa\u09cd\u09b0\u09bf\u09a8\u09cd\u09b8\u09bf\u09aa\u09b2\u09b8 \u0985\u09ac \u0987\u09a8\u09cd\u099f\u09be\u09b0\u09a8\u09be\u09b2 \u09ae\u09c7\u09a1\u09bf\u09b8\u09bf\u09a8-\u098f\u09b0 \u09a6\u09c1\u0987 \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u0995, \u098f\u09ac\u0982 \u09a4\u09be \u09a5\u09c7\u0995\u09c7 \u09a8\u09c7\u0993\u09af\u09bc\u09be \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf \u09b8\u0982\u0995\u09b2\u09a8\u09c7\u09b0 \u09a8\u09be\u09ae\u09be\u0999\u09cd\u0995\u09bf\u09a4 \u099c\u09c1\u09c7\u09be\u09a1\u09bc\u0964",
    bookCount: 0,
  },
  {
    id: "a-mcnally",
    slug: "peter-mcnally",
    name: "Peter R. McNally",
    nameBn: "\u09aa\u09bf\u099f\u09be\u09b0 \u0986\u09b0. \u09ae\u09cd\u09af\u09be\u0995\u09a8\u09cd\u09af\u09be\u09b2\u09bf",
    bio:
      "A gastroenterologist who has edited Gastrointestinal and Liver Secrets through six editions, and whose question-and-answer format is the reason a generation of trainees can recite the differential for painless jaundice.",
    bioBn:
      "\u098f\u0995\u099c\u09a8 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09be\u09b0\u09cb\u09b2\u099c\u09bf\u09b8\u09cd\u099f, \u09af\u09bf\u09a8\u09bf \u099b\u09af\u09bc\u099f\u09bf \u09b8\u0982\u09b8\u09cd\u0995\u09b0\u09a3 \u09a7\u09b0\u09c7 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u0987\u09a8\u09cd\u099f\u09c7\u09b8\u09cd\u099f\u09be\u0987\u09a8\u09be\u09b2 \u0985\u09cd\u09af\u09be\u09a8\u09cd\u09a1 \u09b2\u09bf\u09ad\u09be\u09b0 \u09b8\u09bf\u0995\u09cd\u09b0\u09c7\u099f\u09b8 \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be \u0995\u09b0\u09c7\u099b\u09c7\u09a8\u0964",
    bookCount: 0,
  },
  {
    id: "a-hauser",
    slug: "stephen-hauser",
    name: "Stephen C. Hauser and Colleagues",
    nameBn: "\u09b8\u09cd\u099f\u09bf\u09ab\u09c7\u09a8 \u09b8\u09bf. \u09b9\u09be\u0989\u099c\u09be\u09b0 \u0993 \u09b8\u09b9\u0995\u09b0\u09cd\u09ae\u09c0\u09b0\u09be",
    bio:
      "Editor-in-chief of the Mayo Clinic's board review, with Seth R. Sweetser and Michael D. Leise. Mayo Clinic Scientific Press publishes the series a fellow sits the American boards on.",
    bioBn:
      "\u09ae\u09c7\u09af\u09bc\u09cb \u0995\u09cd\u09b2\u09bf\u09a8\u09bf\u0995\u09c7\u09b0 \u09ac\u09cb\u09b0\u09cd\u09a1 \u09b0\u09bf\u09ad\u09bf\u0989\u09af\u09bc\u09c7\u09b0 \u09aa\u09cd\u09b0\u09a7\u09be\u09a8 \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u0995, \u09b8\u09c7\u09a5 \u0986\u09b0. \u09b8\u09c1\u0987\u099f\u09b8\u09be\u09b0 \u0993 \u09ae\u09be\u0987\u0995\u09c7\u09b2 \u09a1\u09bf. \u09b2\u09be\u0987\u099c\u09c7\u09b0 \u09b8\u0999\u09cd\u0997\u09c7\u0964",
    bookCount: 0,
  },
  {
    id: "a-guandalini",
    slug: "guandalini-and-colleagues",
    name: "Stefano Guandalini and Colleagues",
    nameBn: "\u09b8\u09cd\u099f\u09c7\u09ab\u09be\u09a8\u09cb \u0997\u09c1\u09af\u09bc\u09be\u09a8\u09cd\u09a6\u09be\u09b2\u09bf\u09a8\u09bf \u0993 \u09b8\u09b9\u0995\u09b0\u09cd\u09ae\u09c0\u09b0\u09be",
    bio:
      "Paediatric gastroenterologist at the University of Chicago and founder of its coeliac disease centre, with Anil Dhawan of King's College London and the late David Branski of Jerusalem.",
    bioBn:
      "\u09b6\u09bf\u0995\u09be\u0997\u09cb \u09ac\u09bf\u09b6\u09cd\u09ac\u09ac\u09bf\u09a6\u09cd\u09af\u09be\u09b2\u09af\u09bc\u09c7\u09b0 \u09b6\u09bf\u09b6\u09c1 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09be\u09b0\u09cb\u09b2\u099c\u09bf\u09b8\u09cd\u099f, \u0985\u09a8\u09bf\u09b2 \u09a7\u09be\u0993\u09af\u09bc\u09be\u09a8 \u0993 \u09aa\u09cd\u09b0\u09af\u09bc\u09be\u09a4 \u09a1\u09c7\u09ad\u09bf\u09a1 \u09ac\u09cd\u09b0\u09be\u09a8\u09b8\u09cd\u0995\u09bf\u09b0 \u09b8\u0999\u09cd\u0997\u09c7\u0964",
    bookCount: 0,
  },
  {
    id: "a-saunders",
    slug: "brian-saunders",
    name: "Brian P. Saunders and Colleagues",
    nameBn: "\u09ac\u09cd\u09b0\u09be\u09af\u09bc\u09be\u09a8 \u09aa\u09bf. \u09b8\u09a8\u09cd\u09a1\u09be\u09b0\u09cd\u09b8 \u0993 \u09b8\u09b9\u0995\u09b0\u09cd\u09ae\u09c0\u09b0\u09be",
    bio:
      "The editors who carry Cotton and Williams' endoscopy textbook into its eighth edition. Peter Cotton and Christopher Williams wrote the first in 1980; the book has outlived the instruments it originally described.",
    bioBn:
      "\u0995\u099f\u09a8 \u0985\u09cd\u09af\u09be\u09a8\u09cd\u09a1 \u0989\u0987\u09b2\u09bf\u09af\u09bc\u09be\u09ae\u09b8-\u098f\u09b0 \u098f\u09a8\u09cd\u09a1\u09cb\u09b8\u09cd\u0995\u09cb\u09aa\u09bf \u09aa\u09be\u09a0\u09cd\u09af\u09ac\u0987\u099f\u09bf\u09b0 \u0985\u09b7\u09cd\u099f\u09ae \u09b8\u0982\u09b8\u09cd\u0995\u09b0\u09a3\u09c7\u09b0 \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u0995\u09b0\u09be\u0964",
    bookCount: 0,
  },
  {
    id: "a-jankowski",
    slug: "janusz-jankowski",
    name: "Janusz A. Z. Jankowski",
    nameBn: "\u0987\u09af\u09bc\u09be\u09a8\u09c1\u09b6 \u098f. \u099c\u09c7\u09a1. \u09af\u09bc\u09be\u0999\u09cd\u0995\u09cb\u09b8\u09cd\u0995\u09bf",
    bio:
      "A gastroenterologist and epidemiologist trained in Glasgow, Oxford, Dundee and London, whose work on Barrett's oesophagus runs through the multidisciplinary approach this book argues for.",
    bioBn:
      "\u0997\u09cd\u09b2\u09be\u09b8\u0997\u09cb, \u0985\u0995\u09cd\u09b8\u09ab\u09cb\u09b0\u09cd\u09a1, \u09a1\u09be\u09a8\u09cd\u09a1\u09bf \u0993 \u09b2\u09a8\u09cd\u09a1\u09a8\u09c7 \u09aa\u09cd\u09b0\u09b6\u09bf\u0995\u09cd\u09b7\u09bf\u09a4 \u098f\u0995\u099c\u09a8 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09be\u09b0\u09cb\u09b2\u099c\u09bf\u09b8\u09cd\u099f \u0993 \u098f\u09aa\u09bf\u09a1\u09c7\u09ae\u09bf\u09af\u09bc\u09cb\u09b2\u099c\u09bf\u09b8\u09cd\u099f\u0964",
    bookCount: 0,
  },
  {
    id: "a-thomas-lorenz",
    slug: "thomas-and-lorenz",
    name: "Stephen Thomas and Jonathan M. Lorenz",
    nameBn: "\u09b8\u09cd\u099f\u09bf\u09ab\u09c7\u09a8 \u099f\u09ae\u09be\u09b8 \u0993 \u099c\u09a8\u09be\u09a5\u09a8 \u098f\u09ae. \u09b2\u09b0\u09c7\u09a8\u09cd\u099c",
    bio:
      "Radiologists who built the RadCases series around the way imaging is actually learned: one case at a time, findings first and diagnosis after.",
    bioBn:
      "\u09b0\u09c7\u09a1\u09bf\u0993\u09b2\u099c\u09bf\u09b8\u09cd\u099f, \u09af\u09be\u0981\u09b0\u09be \u09b0\u09cd\u09af\u09be\u09a1\u0995\u09c7\u09b8\u09c7\u09b8 \u09b8\u09bf\u09b0\u09bf\u099c\u099f\u09bf \u0997\u09a1\u09bc\u09c7\u099b\u09c7\u09a8 \u0995\u09c7\u09b8 \u09a7\u09b0\u09c7 \u09b6\u09c7\u0996\u09be\u09b0 \u09aa\u09a6\u09cd\u09a7\u09a4\u09bf\u09a4\u09c7\u0964",
    bookCount: 0,
  },
  {
    id: "a-chen-pitcher",
    slug: "chen-and-pitcher",
    name: "Yang Chen and Maxton Pitcher",
    nameBn: "\u0987\u09af\u09bc\u09be\u0982 \u099a\u09c7\u09a8 \u0993 \u09ae\u09cd\u09af\u09be\u0995\u09b8\u099f\u09a8 \u09aa\u09bf\u099a\u09be\u09b0",
    bio:
      "British gastroenterologists who wrote the guide they wanted as trainees: short, practical, and organised by the complaint the patient actually arrives with.",
    bioBn:
      "\u09ac\u09cd\u09b0\u09bf\u099f\u09bf\u09b6 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09be\u09b0\u09cb\u09b2\u099c\u09bf\u09b8\u09cd\u099f, \u09af\u09be\u0981\u09b0\u09be \u09aa\u09cd\u09b0\u09b6\u09bf\u0995\u09cd\u09b7\u09a3\u09be\u09b0\u09cd\u09a5\u09c0 \u09b9\u09bf\u09b8\u09c7\u09ac\u09c7 \u09af\u09c7 \u09ac\u0987\u099f\u09bf \u099a\u09c7\u09af\u09bc\u09c7\u099b\u09bf\u09b2\u09c7\u09a8 \u09b8\u09c7\u099f\u09bf\u0987 \u09b2\u09bf\u0996\u09c7\u099b\u09c7\u09a8\u0964",
    bookCount: 0,
  },
  {
    id: "a-talley",
    slug: "nicholas-talley",
    name: "Nicholas J. Talley",
    nameBn: "\u09a8\u09bf\u0995\u09cb\u09b2\u09be\u09b8 \u099c\u09c7. \u099f\u09cd\u09af\u09be\u09b2\u09bf",
    bio:
      "An Australian gastroenterologist and one of the most cited in the field, whose problem-based Clinical Gastroenterology teaches from the symptom rather than from the organ.",
    bioBn:
      "\u0985\u09b8\u09cd\u099f\u09cd\u09b0\u09c7\u09b2\u09c0\u09af\u09bc \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09be\u09b0\u09cb\u09b2\u099c\u09bf\u09b8\u09cd\u099f, \u09af\u09bf\u09a8\u09bf \u0985\u0999\u09cd\u0997 \u09a8\u09af\u09bc, \u09b2\u0995\u09cd\u09b7\u09a3 \u09a5\u09c7\u0995\u09c7 \u09aa\u09a1\u09bc\u09be\u09a8\u09cb\u09b0 \u09aa\u0995\u09cd\u09b7\u09aa\u09be\u09a4\u09c0\u0964",
    bookCount: 0,
  },
  {
    id: "a-talley-lindor",
    slug: "talley-lindor-vargas",
    name: "Nicholas J. Talley, Keith D. Lindor and Hugo E. Vargas",
    nameBn: "\u09a8\u09bf\u0995\u09cb\u09b2\u09be\u09b8 \u099c\u09c7. \u099f\u09cd\u09af\u09be\u09b2\u09bf, \u0995\u09bf\u09a5 \u09a1\u09bf. \u09b2\u09bf\u09a8\u09cd\u09a1\u09b0 \u0993 \u09b9\u09bf\u0989\u0997\u09cb \u0987. \u09ad\u09be\u09b0\u09cd\u0997\u09be\u09b8",
    bio:
      "Three Mayo Clinic-trained physicians whose Practical series splits gastroenterology into volumes a busy clinician can carry one of.",
    bioBn:
      "\u09ae\u09c7\u09af\u09bc\u09cb \u0995\u09cd\u09b2\u09bf\u09a8\u09bf\u0995\u09c7 \u09aa\u09cd\u09b0\u09b6\u09bf\u0995\u09cd\u09b7\u09bf\u09a4 \u09a4\u09bf\u09a8 \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u0995, \u09af\u09be\u0981\u09a6\u09c7\u09b0 \u09aa\u09cd\u09b0\u09cd\u09af\u09be\u0995\u099f\u09bf\u0995\u09be\u09b2 \u09b8\u09bf\u09b0\u09bf\u099c\u099f\u09bf \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf\u0995\u09c7 \u0995\u09af\u09bc\u09c7\u0995 \u0996\u09a8\u09cd\u09a1\u09c7 \u09ad\u09be\u0997 \u0995\u09b0\u09c7\u099b\u09c7\u0964",
    bookCount: 0,
  },
  {
    id: "a-hirschfield",
    slug: "hirschfield-and-colleagues",
    name: "Gideon M. Hirschfield and Colleagues",
    nameBn: "\u0997\u09bf\u09a1\u09bf\u0993\u09a8 \u098f\u09ae. \u09b9\u09be\u09b0\u09cd\u09b6\u09ab\u09bf\u09b2\u09cd\u09a1 \u0993 \u09b8\u09b9\u0995\u09b0\u09cd\u09ae\u09c0\u09b0\u09be",
    bio:
      "A hepatologist writing with Paramjit Gill and James Neuberger for the doctor who did not order a liver screen and got one back abnormal anyway.",
    bioBn:
      "\u098f\u0995\u099c\u09a8 \u09b9\u09c7\u09aa\u09be\u099f\u09cb\u09b2\u099c\u09bf\u09b8\u09cd\u099f, \u09aa\u09b0\u09ae\u099c\u09c0\u09a4 \u0997\u09bf\u09b2 \u0993 \u099c\u09c7\u09ae\u09b8 \u09a8\u09bf\u0989\u09ac\u09be\u09b0\u09cd\u0997\u09be\u09b0\u09c7\u09b0 \u09b8\u0999\u09cd\u0997\u09c7 \u09b2\u09bf\u0996\u099b\u09c7\u09a8\u0964",
    bookCount: 0,
  },
  {
    id: "a-yale",
    slug: "yale-and-tekiner",
    name: "Steven H. Yale and Halil Tekiner",
    nameBn: "\u09b8\u09cd\u099f\u09bf\u09ad\u09c7\u09a8 \u098f\u0987\u099a. \u0987\u09af\u09bc\u09c7\u09b2 \u0993 \u09b9\u09be\u09b2\u09bf\u09b2 \u09a4\u09c7\u0995\u09bf\u09a8\u09c7\u09b0",
    bio:
      "A physician and a medical historian who between them trace each named sign back to the doctor who first described it, and then test whether it still earns its place at the bedside.",
    bioBn:
      "\u098f\u0995\u099c\u09a8 \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u0995 \u0993 \u098f\u0995\u099c\u09a8 \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u09be-\u0987\u09a4\u09bf\u09b9\u09be\u09b8\u09ac\u09bf\u09a6, \u09af\u09be\u0981\u09b0\u09be \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u0987\u09aa\u09a8\u09bf\u09ae\u09bf\u0995 \u09b8\u09be\u0987\u09a8\u09c7\u09b0 \u0989\u09ce\u09b8 \u0996\u09c1\u0981\u099c\u09c7\u099b\u09c7\u09a8\u0964",
    bookCount: 0,
  },
  {
    id: "a-schlottmann",
    slug: "schlottmann-and-colleagues",
    name: "Francisco Schlottmann and Colleagues",
    nameBn: "\u09ab\u09cd\u09b0\u09be\u09a8\u09cd\u09b8\u09bf\u09b8\u0995\u09cb \u09b6\u09cd\u09b2\u099f\u09ae\u09be\u09a8 \u0993 \u09b8\u09b9\u0995\u09b0\u09cd\u09ae\u09c0\u09b0\u09be",
    bio:
      "Surgeons and physiologists -- with Fernando A. M. Herbella and Marco G. Patti -- who treat reflux as a mechanical problem first and a pharmacological one second.",
    bioBn:
      "\u09b6\u09b2\u09cd\u09af\u099a\u09bf\u0995\u09bf\u09ce\u09b8\u0995 \u0993 \u09b6\u09be\u09b0\u09c0\u09b0\u09ac\u09c3\u09a4\u09cd\u09a4\u09ac\u09bf\u09a6, \u09ab\u09be\u09b0\u09cd\u09a8\u09be\u09a8\u09cd\u09a6\u09cb \u098f. \u098f\u09ae. \u09b9\u09be\u09b0\u09cd\u09ac\u09c7\u09b2\u09be \u0993 \u09ae\u09be\u09b0\u09cd\u0995\u09cb \u099c\u09bf. \u09aa\u09be\u09a4\u09cd\u09a4\u09bf\u09b0 \u09b8\u0999\u09cd\u0997\u09c7\u0964",
    bookCount: 0,
  },
];

/**
 * A book that has a real file behind it.
 *
 * `isbn` is optional: several of these are ministry publications with no ISBN
 * at all, and a fabricated one on a downloadable file is worse than none.
 */
interface SeedFile {
  /**
   * The file's name in private storage: `private/books/<slug>.pdf`. Never a URL
   * a browser could ask for: the file is reached only through
   * `/api/file/[slug]`, which checks for a session first.
   */
  url: string;
  sizeMb: number;
  isbn?: string;
  /** ISO date. Real uploads sort by when they actually landed. */
  addedAt: string;
  uploadedBy?: string;
}

/** Seed record: keeps the fixture list scannable. */
interface Seed {
  title: string;
  titleBn?: string;
  subtitle?: string;
  /**
   * Declared rather than derived from the title.
   *
   * The ancestor of this file slugged the title, which works for *Nelson
   * Textbook of Pediatrics* and produces
   * `who-recommendations-on-antenatal-care-for-a-positive-pregnancy-experience`
   * here. The slug is also the join to `private/books/<slug>.pdf` and
   * `public/covers/<slug>.webp`, so it wants to be short, stable, and immune to
   * someone tidying up a title.
   */
  slug: string;
  authorId: string;
  categoryId: string;
  /**
   * The clinical subject. Independent of `categoryId` on purpose: the two
   * taxonomies cross rather than nest. See `subjects` above.
   */
  subjectId: string;
  year: number;
  publisher: string;
  pages: number;
  description: string;
  descriptionBn?: string;
  featured?: boolean;
  /**
   * Standing order, low first. Only the three clinical references carry one.
   * See `Book.priority` in `types` and the comparator in `lib/data/books`.
   */
  priority?: number;
  status?: BookStatus;
  /** Cover hue in degrees; drives the 3D spine and fallback generated art. */
  hue: number;
  /** Edition label as printed on the copyright page. */
  edition?: string;
  /**
   * Served path to the real cover WebP built by `scripts/build-covers.mjs`:
   * page one of the file itself, or, for the three references, the publisher's
   * jacket supplied in `private/covers/`. Present on every title, so the
   * generated art in `lib/cover-theme` never actually shows on this catalogue;
   * it is there for whatever the admin catalogues next.
   */
  coverImage?: string;
  /** Where the file came from, and the licence that permits redistributing it. */
  sourceUrl?: string;
  license?: string;
  /**
   * Language is always explicit; `buildBook` never infers it from `titleBn`.
   * These are English-language books that carry Bengali display titles, so the
   * `?language=bn` filter legitimately returns nothing.
   */
  language: "bn" | "en";
  file: SeedFile;
}

const seeds: Seed[] = [
  // ── 01 Harrison's Gastroenterology and Hepatology ────────────────────────
  {
    title: "Harrison's Gastroenterology and Hepatology",
    titleBn: "\u09b9\u09cd\u09af\u09be\u09b0\u09bf\u09b8\u09a8\u09b8 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf \u0985\u09cd\u09af\u09be\u09a8\u09cd\u09a1 \u09b9\u09c7\u09aa\u09be\u099f\u09cb\u09b2\u099c\u09bf",
    subtitle:
      "Derived from Harrison's Principles of Internal Medicine, 18th Edition",
    slug: "harrisons-gastroenterology-hepatology",
    authorId: "a-longo-fauci",
    categoryId: "cat-bedside",
    subjectId: "sub-luminal",
    year: 2013,
    publisher: "McGraw-Hill Education",
    pages: 784,
    edition: "Second edition",
    coverImage: "/covers/harrisons-gastroenterology-hepatology.webp",
    language: "en",
    description:
      "The gastroenterology and hepatology chapters of Harrison's, lifted out of the two-volume set and bound on their own. The same authors, the same mechanism-first argument, and none of the weight: a reader who wants the approach to jaundice or to gastrointestinal bleeding gets it here without carrying the cardiology to reach it. It opens on the cardinal presentations rather than on the diseases, which is the order a patient arrives in.",
    descriptionBn:
      "\u09b9\u09cd\u09af\u09be\u09b0\u09bf\u09b8\u09a8\u09b8-\u098f\u09b0 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf \u0993 \u09b9\u09c7\u09aa\u09be\u099f\u09cb\u09b2\u099c\u09bf \u0985\u09a7\u09cd\u09af\u09be\u09af\u09bc\u0997\u09c1\u09b2\u09cb, \u09a6\u09c1\u0987 \u0996\u09a8\u09cd\u09a1\u09c7\u09b0 \u09b8\u09c7\u099f \u09a5\u09c7\u0995\u09c7 \u0986\u09b2\u09be\u09a6\u09be \u0995\u09b0\u09c7 \u09ac\u09be\u0981\u09a7\u09be\u0964 \u098f\u0995\u0987 \u09b2\u09c7\u0996\u0995, \u098f\u0995\u0987 \u0995\u09be\u09b0\u09cd\u09af\u0995\u09be\u09b0\u09a3-\u09ad\u09bf\u09a4\u09cd\u09a4\u09bf\u0995 \u09af\u09c1\u0995\u09cd\u09a4\u09bf, \u0985\u09a5\u099a \u09ac\u09be\u09b9\u09c1\u09b2\u09cd\u09af \u09a8\u09c7\u0987\u0964 \u09ac\u0987\u099f\u09bf \u09b0\u09cb\u0997 \u09a6\u09bf\u09af\u09bc\u09c7 \u09a8\u09af\u09bc, \u09b0\u09cb\u0997\u09c0 \u09af\u09c7\u09ad\u09be\u09ac\u09c7 \u0986\u09b8\u09c7 \u09b8\u09c7\u0987 \u09b2\u0995\u09cd\u09b7\u09a3 \u09a6\u09bf\u09af\u09bc\u09c7 \u09b6\u09c1\u09b0\u09c1 \u09b9\u09af\u09bc\u0964",
    featured: true,
    priority: 1,
    hue: 23,
    license: "\u00a9 2013 McGraw-Hill Education, LLC. All rights reserved.",
    file: {
      url: "/books/harrisons-gastroenterology-hepatology.pdf",
      sizeMb: 35.2,
      isbn: "978-0-07-181488-1",
      addedAt: "2026-09-11",
    },
  },
  // ── 02 Gastrointestinal and Liver Secrets ────────────────────────────────
  {
    title: "Gastrointestinal and Liver Secrets",
    titleBn: "\u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u0987\u09a8\u09cd\u099f\u09c7\u09b8\u09cd\u099f\u09be\u0987\u09a8\u09be\u09b2 \u0985\u09cd\u09af\u09be\u09a8\u09cd\u09a1 \u09b2\u09bf\u09ad\u09be\u09b0 \u09b8\u09bf\u0995\u09cd\u09b0\u09c7\u099f\u09b8",
    slug: "gastrointestinal-liver-secrets",
    authorId: "a-mcnally",
    categoryId: "cat-exam",
    subjectId: "sub-luminal",
    year: 2025,
    publisher: "Elsevier",
    pages: 813,
    edition: "Sixth edition",
    coverImage: "/covers/gastrointestinal-liver-secrets.webp",
    language: "en",
    description:
      "Eight hundred pages of questions and the answers a consultant would actually give. The Secrets format is built for the last fortnight before an examination and for the ward round where somebody asks you something in front of the patient: short answers, the reasoning compressed to its load-bearing sentence, and key points boxed where the eye lands.",
    descriptionBn:
      "\u0986\u099f\u09b6\u09cb \u09aa\u09c3\u09b7\u09cd\u09a0\u09be\u09b0 \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 \u0993 \u09a4\u09be\u09b0 \u0989\u09a4\u09cd\u09a4\u09b0, \u09af\u09c7\u09ad\u09be\u09ac\u09c7 \u098f\u0995\u099c\u09a8 \u0995\u09a8\u09b8\u09be\u09b2\u099f\u09cd\u09af\u09be\u09a8\u09cd\u099f \u09a6\u09bf\u09a4\u09c7\u09a8\u0964 \u09b8\u09bf\u0995\u09cd\u09b0\u09c7\u099f\u09b8 \u09ab\u09b0\u09ae\u09cd\u09af\u09be\u099f\u099f\u09bf \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0 \u0986\u0997\u09c7\u09b0 \u09a6\u09c1\u0987 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9 \u0993 \u0993\u09af\u09bc\u09be\u09b0\u09cd\u09a1 \u09b0\u09be\u0989\u09a8\u09cd\u09a1\u09c7\u09b0 \u099c\u09a8\u09cd\u09af\u0987 \u09a4\u09c8\u09b0\u09bf\u0964",
    featured: true,
    priority: 2,
    hue: 68,
    // No `isbn`: this file's front matter is a scanned image and no ISBN is
    // extractable from it. A number nobody could read is a number nobody
    // should type.
    license: "\u00a9 2025 Elsevier Inc. All rights reserved.",
    file: {
      url: "/books/gastrointestinal-liver-secrets.pdf",
      sizeMb: 105.4,
      addedAt: "2026-09-11",
    },
  },
  // ── 03 Mayo Clinic Gastroenterology and Hepatology Board Review ──────────
  {
    title: "Mayo Clinic Gastroenterology and Hepatology Board Review",
    titleBn: "\u09ae\u09c7\u09af\u09bc\u09cb \u0995\u09cd\u09b2\u09bf\u09a8\u09bf\u0995 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf \u0985\u09cd\u09af\u09be\u09a8\u09cd\u09a1 \u09b9\u09c7\u09aa\u09be\u099f\u09cb\u09b2\u099c\u09bf \u09ac\u09cb\u09b0\u09cd\u09a1 \u09b0\u09bf\u09ad\u09bf\u0989",
    slug: "mayo-clinic-gastroenterology-hepatology-board-review",
    authorId: "a-hauser",
    categoryId: "cat-exam",
    subjectId: "sub-luminal",
    year: 2024,
    publisher: "Oxford University Press",
    pages: 493,
    edition: "Sixth edition",
    coverImage:
      "/covers/mayo-clinic-gastroenterology-hepatology-board-review.webp",
    language: "en",
    description:
      "The Mayo Clinic's own revision course, written for the American subspecialty boards and useful well beyond them. Chapters end in questions with worked answers, and the illustrations are endoscopic and radiological rather than diagrammatic: the examination asks you to recognise things, so the book shows them.",
    descriptionBn:
      "\u09ae\u09c7\u09af\u09bc\u09cb \u0995\u09cd\u09b2\u09bf\u09a8\u09bf\u0995\u09c7\u09b0 \u09a8\u09bf\u099c\u09b8\u09cd\u09ac 09\u09b0\u09bf\u09ad\u09bf\u09b6\u09a8 \u0995\u09cb\u09b0\u09cd\u09b8\u0964 \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u0985\u09a7\u09cd\u09af\u09be\u09af\u09bc \u09b6\u09c7\u09b7 \u09b9\u09af\u09bc \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 \u0993 \u09ac\u09cd\u09af\u09be\u0996\u09cd\u09af\u09be\u09b8\u09b9 \u0989\u09a4\u09cd\u09a4\u09b0\u09c7, \u098f\u09ac\u0982 \u099b\u09ac\u09bf\u0997\u09c1\u09b2\u09cb \u098f\u09a8\u09cd\u09a1\u09cb\u09b8\u09cd\u0995\u09cb\u09aa\u09bf\u0995 \u0993 \u09b0\u09c7\u09a1\u09bf\u0993\u09b2\u099c\u09bf\u0995\u09cd\u09af\u09be\u09b2\u0964",
    featured: true,
    priority: 3,
    hue: 113,
    license:
      "\u00a9 Mayo Foundation for Medical Education and Research 2024. All rights reserved.",
    file: {
      url: "/books/mayo-clinic-gastroenterology-hepatology-board-review.pdf",
      sizeMb: 115.9,
      isbn: "978-0-19-767975-3",
      addedAt: "2026-09-11",
    },
  },
  // ── 04 Clinical Gastroenterology ─────────────────────────────────────────
  {
    title: "Clinical Gastroenterology",
    titleBn: "\u0995\u09cd\u09b2\u09bf\u09a8\u09bf\u0995\u09cd\u09af\u09be\u09b2 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf",
    subtitle: "A practical problem-based approach",
    slug: "clinical-gastroenterology",
    authorId: "a-talley",
    categoryId: "cat-bedside",
    subjectId: "sub-luminal",
    year: 2011,
    publisher: "Elsevier Australia",
    pages: 421,
    edition: "Third edition",
    coverImage: "/covers/clinical-gastroenterology.webp",
    language: "en",
    description:
      "Organised by the problem rather than by the organ, which is the right way round for anyone who meets the patient before the diagnosis. Dyspepsia, dysphagia, diarrhoea and abdominal pain each get a chapter that starts with what the complaint could mean and narrows.",
    descriptionBn:
      "\u0985\u0999\u09cd\u0997 \u0985\u09a8\u09c1\u09af\u09be\u09af\u09bc\u09c0 \u09a8\u09af\u09bc, \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u0985\u09a8\u09c1\u09af\u09be\u09af\u09bc\u09c0 \u09b8\u09be\u099c\u09be\u09a8\u09cb \u2014 \u09af\u09bf\u09a8\u09bf \u09b0\u09cb\u0997\u09a8\u09bf\u09b0\u09cd\u09a3\u09af\u09bc\u09c7\u09b0 \u0986\u0997\u09c7 \u09b0\u09cb\u0997\u09c0\u09b0 \u09ae\u09c1\u0996\u09cb\u09ae\u09c1\u0996\u09bf \u09b9\u09a8, \u09a4\u09be\u0981\u09b0 \u099c\u09a8\u09cd\u09af \u098f\u099f\u09be\u0987 \u09b8\u09a0\u09bf\u0995 \u0995\u09cd\u09b0\u09ae\u0964",
    hue: 158,
    license: "\u00a9 2011 Elsevier Australia. All rights reserved.",
    file: {
      url: "/books/clinical-gastroenterology.pdf",
      sizeMb: 31.2,
      isbn: "978-0-7295-3948-7",
      addedAt: "2026-09-11",
    },
  },
  // ── 05 Clinical Guide to Gastroenterology ────────────────────────────────
  {
    title: "Clinical Guide to Gastroenterology",
    titleBn: "\u0995\u09cd\u09b2\u09bf\u09a8\u09bf\u0995\u09cd\u09af\u09be\u09b2 \u0997\u09be\u0987\u09a1 \u099f\u09c1 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf",
    slug: "clinical-guide-to-gastroenterology",
    authorId: "a-chen-pitcher",
    categoryId: "cat-bedside",
    subjectId: "sub-luminal",
    year: 2020,
    publisher: "Wiley-Blackwell",
    pages: 483,
    coverImage: "/covers/clinical-guide-to-gastroenterology.webp",
    language: "en",
    description:
      "Short, current and written by two people recently enough out of training to remember what was confusing. It is the book to read cover to cover at the start of a gastroenterology rotation, where the larger references are the ones to consult once you know what you are looking for.",
    descriptionBn:
      "\u09b8\u0982\u0995\u09cd\u09b7\u09bf\u09aa\u09cd\u09a4, \u09b9\u09be\u09b2\u09a8\u09be\u0997\u09be\u09a6 \u098f\u09ac\u0982 \u09a6\u09c1\u0987\u099c\u09a8 \u09a4\u09b0\u09c1\u09a3 \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u0995\u09c7\u09b0 \u09b2\u09c7\u0996\u09be\u0964 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf \u09b0\u09cb\u099f\u09c7\u09b6\u09a8\u09c7\u09b0 \u09b6\u09c1\u09b0\u09c1\u09a4\u09c7 \u09aa\u09c1\u09b0\u09cb\u099f\u09be \u09aa\u09a1\u09bc\u09be\u09b0 \u09ae\u09a4\u09cb \u09ac\u0987\u0964",
    hue: 203,
    license: "\u00a9 2020 John Wiley & Sons Ltd. All rights reserved.",
    file: {
      url: "/books/clinical-guide-to-gastroenterology.pdf",
      sizeMb: 27.7,
      isbn: "978-1-119-18916-9",
      addedAt: "2026-09-11",
    },
  },
  // ── 06 Gastrointestinal Eponymic Signs ───────────────────────────────────
  {
    title: "Gastrointestinal Eponymic Signs",
    titleBn: "\u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u0987\u09a8\u09cd\u099f\u09c7\u09b8\u09cd\u099f\u09be\u0987\u09a8\u09be\u09b2 \u0987\u09aa\u09a8\u09bf\u09ae\u09bf\u0995 \u09b8\u09be\u0987\u09a8",
    subtitle: "Bedside Approach to the Physical Examination",
    slug: "gastrointestinal-eponymic-signs",
    authorId: "a-yale",
    categoryId: "cat-exam",
    subjectId: "sub-luminal",
    year: 2023,
    publisher: "Springer Nature",
    pages: 438,
    coverImage: "/covers/gastrointestinal-eponymic-signs.webp",
    language: "en",
    description:
      "Murphy's, Courvoisier's, Cullen's, Grey Turner's: the signs an examiner still asks for, each traced back to the physician who described it and then tested against what is now known about how well it performs. Unusual in being both a history of medicine and an honest audit of the physical examination.",
    descriptionBn:
      "\u09ae\u09be\u09b0\u09cd\u09ab\u09bf, \u0995\u09c1\u09b0\u09ad\u09af\u09bc\u09be\u09b8\u09bf\u09af\u09bc\u09c7, \u0995\u09be\u09b2\u09c7\u09a8, \u0997\u09cd\u09b0\u09c7 \u099f\u09be\u09b0\u09cd\u09a8\u09be\u09b0 \u2014 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u0995\u09c7\u09b0 \u099c\u09bf\u099c\u09cd\u099e\u09be\u09b8\u09bf\u09a4 \u09b8\u09be\u0987\u09a8\u0997\u09c1\u09b2\u09cb, \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf\u09b0 \u0989\u09ce\u09b8 \u0993 \u09ac\u09be\u09b8\u09cd\u09a4\u09ac \u0995\u09be\u09b0\u09cd\u09af\u0995\u09be\u09b0\u09bf\u09a4\u09be\u09b8\u09b9\u0964",
    hue: 248,
    license:
      "\u00a9 The Author(s), under exclusive licence to Springer Nature Switzerland AG 2023. All rights reserved.",
    file: {
      url: "/books/gastrointestinal-eponymic-signs.pdf",
      sizeMb: 6.0,
      isbn: "978-3-031-33672-0",
      addedAt: "2026-09-11",
    },
  },
  // ── 07 Gastroesophageal Reflux Disease ───────────────────────────────────
  {
    title: "Gastroesophageal Reflux Disease",
    titleBn: "\u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u0987\u09b8\u09cb\u09ab\u09c7\u099c\u09bf\u09af\u09bc\u09be\u09b2 \u09b0\u09bf\u09ab\u09cd\u09b2\u09be\u0995\u09cd\u09b8 \u09a1\u09bf\u099c\u09bf\u099c",
    subtitle: "From Pathophysiology to Treatment",
    slug: "gastroesophageal-reflux-disease",
    authorId: "a-schlottmann",
    categoryId: "cat-upper-gi",
    subjectId: "sub-motility",
    year: 2023,
    publisher: "Springer Nature",
    pages: 166,
    coverImage: "/covers/gastroesophageal-reflux-disease.webp",
    language: "en",
    description:
      "Reflux treated as a mechanical failure first and a pharmacological problem second: the barrier, the sphincter, the hiatus, and what happens over decades when acid reaches mucosa that was never built for it. Short enough to read in a sitting, and the one title here squarely on the sponsor's own therapeutic ground.",
    descriptionBn:
      "\u09b0\u09bf\u09ab\u09cd\u09b2\u09be\u0995\u09cd\u09b8\u0995\u09c7 \u0986\u0997\u09c7 \u09af\u09be\u09a8\u09cd\u09a4\u09cd\u09b0\u09bf\u0995 \u09b8\u09ae\u09b8\u09cd\u09af\u09be, \u09aa\u09b0\u09c7 \u0993\u09b7\u09c1\u09a7\u09c7\u09b0 \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u09b9\u09bf\u09b8\u09c7\u09ac\u09c7 \u09a6\u09c7\u0996\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7: \u09ac\u09cd\u09af\u09be\u09b0\u09bf\u09af\u09bc\u09be\u09b0, \u09b8\u09cd\u09aa\u09bf\u0999\u09cd\u0995\u09cd\u099f\u09be\u09b0, \u09b9\u09be\u0987\u09af\u09bc\u09be\u099f\u09be\u09b8, \u098f\u09ac\u0982 \u09a6\u09c0\u09b0\u09cd\u0998\u09ae\u09c7\u09af\u09bc\u09be\u09a6\u09c7 \u09a4\u09be\u09b0 \u09ab\u09b2\u0964",
    featured: true,
    hue: 293,
    license:
      "\u00a9 The Author(s), under exclusive licence to Springer Nature Switzerland AG 2023. All rights reserved.",
    file: {
      url: "/books/gastroesophageal-reflux-disease.pdf",
      sizeMb: 3.9,
      isbn: "978-3-031-48240-3",
      addedAt: "2026-09-11",
    },
  },
  // ── 08 The Liver in Systemic Disease ─────────────────────────────────────
  {
    title: "The Liver in Systemic Disease",
    titleBn: "\u09a6\u09cd\u09af \u09b2\u09bf\u09ad\u09be\u09b0 \u0987\u09a8 \u09b8\u09bf\u09b8\u09cd\u099f\u09c7\u09ae\u09bf\u0995 \u09a1\u09bf\u099c\u09bf\u099c",
    subtitle: "A Clinician's Guide to Abnormal Liver Tests",
    slug: "liver-in-systemic-disease",
    authorId: "a-hirschfield",
    categoryId: "cat-hepatobiliary",
    subjectId: "sub-hepatology",
    year: 2023,
    publisher: "Wiley-Blackwell",
    pages: 285,
    coverImage: "/covers/liver-in-systemic-disease.webp",
    language: "en",
    description:
      "Written for the commonest hepatology problem there is, which is not a liver disease at all: a set of liver tests that came back abnormal in a patient nobody was investigating for one. It works outward from the result to the systemic illness behind it rather than inward from the organ.",
    descriptionBn:
      "\u09b9\u09c7\u09aa\u09be\u099f\u09cb\u09b2\u099c\u09bf\u09b0 \u09b8\u09ac\u099a\u09c7\u09af\u09bc\u09c7 \u09b8\u09be\u09a7\u09be\u09b0\u09a3 \u09b8\u09ae\u09b8\u09cd\u09af\u09be\u099f\u09bf \u09a8\u09bf\u09af\u09bc\u09c7 \u09b2\u09c7\u0996\u09be: \u098f\u09ae\u09a8 \u09b0\u09cb\u0997\u09c0\u09b0 \u0985\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09b2\u09bf\u09ad\u09be\u09b0 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be, \u09af\u09be\u0981\u09b0 \u09b2\u09bf\u09ad\u09be\u09b0 \u09b0\u09cb\u0997 \u0996\u09cb\u0981\u099c\u09be \u09b9\u099a\u09cd\u099b\u09bf\u09b2 \u09a8\u09be\u0964",
    hue: 338,
    license: "\u00a9 2023 John Wiley & Sons Ltd. All rights reserved.",
    file: {
      url: "/books/liver-in-systemic-disease.pdf",
      sizeMb: 6.7,
      isbn: "978-1-119-80213-6",
      addedAt: "2026-09-11",
    },
  },
  // ── 09 Practical Gastroenterology and Hepatology ─────────────────────────
  {
    title: "Practical Gastroenterology and Hepatology",
    titleBn: "\u09aa\u09cd\u09b0\u09cd\u09af\u09be\u0995\u099f\u09bf\u0995\u09be\u09b2 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf \u0985\u09cd\u09af\u09be\u09a8\u09cd\u09a1 \u09b9\u09c7\u09aa\u09be\u099f\u09cb\u09b2\u099c\u09bf",
    subtitle: "Liver and Biliary Disease",
    slug: "practical-gastroenterology-hepatology-liver-biliary",
    authorId: "a-talley-lindor",
    categoryId: "cat-hepatobiliary",
    subjectId: "sub-hepatology",
    year: 2010,
    publisher: "Wiley-Blackwell",
    pages: 421,
    coverImage:
      "/covers/practical-gastroenterology-hepatology-liver-biliary.webp",
    language: "en",
    description:
      "The liver and biliary volume of a series split so a clinician can carry one part of gastroenterology rather than all of it. Each chapter is a procedure or a presentation handled end to end, with the decision points marked rather than implied.",
    descriptionBn:
      "\u098f\u0995\u099f\u09bf \u09b8\u09bf\u09b0\u09bf\u099c\u09c7\u09b0 \u09b2\u09bf\u09ad\u09be\u09b0 \u0993 \u09aa\u09bf\u09a4\u09cd\u09a4\u09a8\u09be\u09b2\u09c0 \u0996\u09a8\u09cd\u09a1, \u09af\u09be \u098f\u09ae\u09a8\u09ad\u09be\u09ac\u09c7 \u09ad\u09be\u0997 \u0995\u09b0\u09be \u09af\u09c7\u09a8 \u09aa\u09c1\u09b0\u09cb \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf \u09a8\u09af\u09bc, \u098f\u0995\u099f\u09bf \u0985\u0982\u09b6 \u09b8\u0999\u09cd\u0997\u09c7 \u09b0\u09be\u0996\u09be \u09af\u09be\u09af\u09bc\u0964",
    hue: 23,
    license: "\u00a9 2010 Blackwell Publishing Ltd. All rights reserved.",
    file: {
      url: "/books/practical-gastroenterology-hepatology-liver-biliary.pdf",
      sizeMb: 8.2,
      isbn: "978-1-4051-8275-1",
      addedAt: "2026-09-11",
    },
  },
  // ── 10 Cotton and Williams' Practical Gastrointestinal Endoscopy ─────────
  {
    title: "Cotton and Williams' Practical Gastrointestinal Endoscopy",
    titleBn: "\u0995\u099f\u09a8 \u0985\u09cd\u09af\u09be\u09a8\u09cd\u09a1 \u0989\u0987\u09b2\u09bf\u09af\u09bc\u09be\u09ae\u09b8 \u09aa\u09cd\u09b0\u09cd\u09af\u09be\u0995\u099f\u09bf\u0995\u09be\u09b2 \u098f\u09a8\u09cd\u09a1\u09cb\u09b8\u09cd\u0995\u09cb\u09aa\u09bf",
    subtitle: "The Fundamentals",
    slug: "cotton-williams-practical-gi-endoscopy",
    authorId: "a-saunders",
    categoryId: "cat-endoscopy",
    subjectId: "sub-endoscopy",
    year: 2024,
    publisher: "Wiley-Blackwell",
    pages: 240,
    edition: "Eighth edition",
    coverImage: "/covers/cotton-williams-practical-gi-endoscopy.webp",
    language: "en",
    description:
      "The standard manual since 1980, now in its eighth edition and outliving most of the instruments the first one described. It teaches endoscopy as a manual craft — how to hold the scope, where the tip actually is, what to do when you have lost the lumen — which is the part a video atlas cannot teach.",
    descriptionBn:
      "\u09e7\u09ef\u09ee\u09e6 \u09b8\u09be\u09b2 \u09a5\u09c7\u0995\u09c7 \u09aa\u09cd\u09b0\u09ae\u09bf\u09a4 \u09ae\u09cd\u09af\u09be\u09a8\u09c1\u09af\u09bc\u09be\u09b2, \u098f\u0996\u09a8 \u0985\u09b7\u09cd\u099f\u09ae \u09b8\u0982\u09b8\u09cd\u0995\u09b0\u09a3\u09c7\u0964 \u098f\u09a8\u09cd\u09a1\u09cb\u09b8\u09cd\u0995\u09cb\u09aa\u09bf\u0995\u09c7 \u09b9\u09be\u09a4\u09c7\u09b0 \u09a6\u0995\u09cd\u09b7\u09a4\u09be \u09b9\u09bf\u09b8\u09c7\u09ac\u09c7 \u09b6\u09c7\u0996\u09be\u09af\u09bc \u2014 \u09af\u09c7 \u0985\u0982\u09b6\u099f\u09bf \u09ad\u09bf\u09a1\u09bf\u0993 \u0985\u09cd\u09af\u09be\u099f\u09b2\u09be\u09b8 \u09b6\u09c7\u0996\u09be\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7 \u09a8\u09be\u0964",
    featured: true,
    hue: 68,
    license: "\u00a9 2024 John Wiley & Sons Ltd. All rights reserved.",
    file: {
      url: "/books/cotton-williams-practical-gi-endoscopy.pdf",
      sizeMb: 7.1,
      isbn: "978-1-119-52520-2",
      addedAt: "2026-09-11",
    },
  },
  // ── 11 RadCases Gastrointestinal Imaging ─────────────────────────────────
  {
    title: "RadCases Gastrointestinal Imaging",
    titleBn: "\u09b0\u09cd\u09af\u09be\u09a1\u0995\u09c7\u09b8\u09c7\u09b8 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u0987\u09a8\u09cd\u099f\u09c7\u09b8\u09cd\u099f\u09be\u0987\u09a8\u09be\u09b2 \u0987\u09ae\u09c7\u099c\u09bf\u0982",
    slug: "radcases-gastrointestinal-imaging",
    authorId: "a-thomas-lorenz",
    categoryId: "cat-endoscopy",
    subjectId: "sub-imaging",
    year: 2020,
    publisher: "Thieme",
    pages: 258,
    edition: "Second edition",
    coverImage: "/covers/radcases-gastrointestinal-imaging.webp",
    language: "en",
    description:
      "A hundred abdominal cases, each presented the way it arrives on a reporting list: images first, then the findings, then the differential and the diagnosis. Radiology is learned case by case and this book refuses to teach it any other way.",
    descriptionBn:
      "\u098f\u0995\u09b6\u09cb \u09aa\u09c7\u099f\u09c7\u09b0 \u0995\u09c7\u09b8, \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09b0\u09bf\u09aa\u09cb\u09b0\u09cd\u099f\u09bf\u0982 \u09b2\u09bf\u09b8\u09cd\u099f\u09c7 \u09af\u09c7\u09ad\u09be\u09ac\u09c7 \u0986\u09b8\u09c7 \u09b8\u09c7\u09ad\u09be\u09ac\u09c7\u0987: \u0986\u0997\u09c7 \u099b\u09ac\u09bf, \u09aa\u09b0\u09c7 \u09ab\u09be\u0987\u09a8\u09cd\u09a1\u09bf\u0982\u09b8, \u09a4\u09be\u09b0\u09aa\u09b0 \u09b0\u09cb\u0997\u09a8\u09bf\u09b0\u09cd\u09a3\u09af\u09bc\u0964",
    hue: 113,
    license: "\u00a9 2020 Thieme Medical Publishers, Inc. All rights reserved.",
    file: {
      url: "/books/radcases-gastrointestinal-imaging.pdf",
      sizeMb: 43.4,
      isbn: "978-1-62623-868-8",
      addedAt: "2026-09-11",
    },
  },
  // ── 12 Gastrointestinal Oncology ─────────────────────────────────────────
  {
    title: "Gastrointestinal Oncology",
    titleBn: "\u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u0987\u09a8\u09cd\u099f\u09c7\u09b8\u09cd\u099f\u09be\u0987\u09a8\u09be\u09b2 \u0985\u09a8\u0995\u09cb\u09b2\u099c\u09bf",
    subtitle: "A Critical Multidisciplinary Team Approach",
    slug: "gastrointestinal-oncology",
    authorId: "a-jankowski",
    categoryId: "cat-oncology",
    subjectId: "sub-onc",
    year: 2024,
    publisher: "Wiley-Blackwell",
    pages: 629,
    edition: "Second edition",
    coverImage: "/covers/gastrointestinal-oncology.webp",
    language: "en",
    description:
      "Cancer of the digestive organs written around the meeting that decides what happens to the patient, rather than around any one specialty's part in it. Surgeon, oncologist, radiologist and pathologist each state their case in the same chapter, which is closer to how the decision is actually reached.",
    descriptionBn:
      "\u09aa\u09b0\u09bf\u09aa\u09be\u0995 \u0985\u0999\u09cd\u0997\u09c7\u09b0 \u0995\u09cd\u09af\u09be\u09a8\u09cd\u09b8\u09be\u09b0, \u098f\u0995\u099f\u09bf \u09ae\u09be\u09b2\u09cd\u099f\u09bf\u09a1\u09bf\u09b8\u09bf\u09aa\u09cd\u09b2\u09bf\u09a8\u09be\u09b0\u09bf \u09ac\u09c8\u09a0\u0995\u0995\u09c7 \u0995\u09c7\u09a8\u09cd\u09a6\u09cd\u09b0 \u0995\u09b0\u09c7 \u09b2\u09c7\u0996\u09be \u2014 \u09af\u09c7\u09ad\u09be\u09ac\u09c7 \u09b8\u09bf\u09a6\u09cd\u09a7\u09be\u09a8\u09cd\u09a4\u099f\u09bf \u09ac\u09be\u09b8\u09cd\u09a4\u09ac\u09c7 \u09a8\u09c7\u0993\u09af\u09bc\u09be \u09b9\u09af\u09bc\u0964",
    hue: 158,
    license: "\u00a9 2024 John Wiley & Sons Ltd. All rights reserved.",
    file: {
      url: "/books/gastrointestinal-oncology.pdf",
      sizeMb: 35.0,
      isbn: "978-1-119-75639-2",
      addedAt: "2026-09-11",
    },
  },
  // ── 13 Textbook of Pediatric Gastroenterology ────────────────────────────
  {
    title: "Textbook of Pediatric Gastroenterology, Hepatology and Nutrition",
    titleBn: "\u099f\u09c7\u0995\u09cd\u09b8\u099f\u09ac\u09c1\u0995 \u0985\u09ac \u09aa\u09bf\u09a1\u09bf\u09af\u09bc\u09be\u099f\u09cd\u09b0\u09bf\u0995 \u0997\u09cd\u09af\u09be\u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u098f\u09a8\u09cd\u099f\u09c7\u09b0\u09b2\u099c\u09bf",
    subtitle: "A Comprehensive Guide to Practice",
    slug: "textbook-of-pediatric-gastroenterology",
    authorId: "a-guandalini",
    categoryId: "cat-paediatric",
    subjectId: "sub-paediatric",
    year: 2016,
    publisher: "Springer",
    pages: 889,
    coverImage: "/covers/textbook-of-pediatric-gastroenterology.webp",
    language: "en",
    description:
      "Nearly nine hundred pages on the gut from birth to adolescence, where growth and nutrition are part of the diagnosis rather than a consequence of it. The chapters on chronic diarrhoea and malabsorption matter here for reasons that are not academic.",
    descriptionBn:
      "\u099c\u09a8\u09cd\u09ae \u09a5\u09c7\u0995\u09c7 \u0995\u09bf\u09b6\u09cb\u09b0 \u09ac\u09af\u09bc\u09b8 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u09aa\u09b0\u09bf\u09aa\u09be\u0995\u09a4\u09a8\u09cd\u09a4\u09cd\u09b0 \u09a8\u09bf\u09af\u09bc\u09c7 \u09aa\u09cd\u09b0\u09be\u09af\u09bc \u09a8\u09af\u09bc\u09b6\u09cb \u09aa\u09c3\u09b7\u09cd\u09a0\u09be\u0964 \u09a6\u09c0\u09b0\u09cd\u0998\u09ae\u09c7\u09af\u09bc\u09be\u09a6\u09c0 \u09a1\u09be\u09af\u09bc\u09b0\u09bf\u09af\u09bc\u09be \u0993 \u09ae\u09cd\u09af\u09be\u09b2\u0985\u09cd\u09af\u09be\u09ac\u09b8\u09b0\u09cd\u09aa\u09b6\u09a8\u09c7\u09b0 \u0985\u09a7\u09cd\u09af\u09be\u09af\u09bc\u0997\u09c1\u09b2\u09cb \u098f\u0996\u09be\u09a8\u09c7 \u0985\u09a8\u09c7\u0995 \u09ac\u09c7\u09b6\u09bf \u09aa\u09cd\u09b0\u09be\u09b8\u0999\u09cd\u0997\u09bf\u0995\u0964",
    featured: true,
    hue: 203,
    license:
      "\u00a9 Springer International Publishing Switzerland 2016. All rights reserved.",
    file: {
      url: "/books/textbook-of-pediatric-gastroenterology.pdf",
      sizeMb: 24.1,
      isbn: "978-3-319-17168-5",
      addedAt: "2026-09-11",
    },
  },
];

/**
 * Shelf-code prefix per category. Exported because newly catalogued books have
 * to be given a shelf position by the same rule as the seed data.
 *
 * These shelves are a fiction, and a deliberate one: there is no building. But
 * an accession code and a shelf mark are how a librarian talks about a book, the
 * admin table is built for someone doing that job, and a column of blanks would
 * be worse than a consistent invention.
 */
export const shelfPrefix: Record<string, string> = {
  "cat-bedside": "F1-BEDS",
  "cat-exam": "F2-EXAM",
  "cat-upper-gi": "F3-UPGI",
  "cat-hepatobiliary": "F4-HEPB",
  "cat-endoscopy": "F5-ENDO",
  "cat-oncology": "F6-ONCO",
  "cat-paediatric": "F7-PEDI",
};

const uploaders = ["Square Pharmaceuticals"];

function buildBook(seed: Seed, i: number): Book {
  const author = authors.find((a) => a.id === seed.authorId)!;
  const category = categories.find((c) => c.id === seed.categoryId)!;
  const subject = subjects.find((x) => x.id === seed.subjectId)!;
  const status: BookStatus = seed.status ?? "available";

  // Real files: every one of these has a single physical copy (the file).
  // Borrowed/damaged/lost states still work; they just aren't pre-salted.
  const copiesTotal = 1;
  const copiesAvailable = status === "available" ? 1 : 0;

  return {
    id: `bk-${String(i + 1).padStart(3, "0")}`,
    code: `BK-${String(8000 + i * 37).padStart(5, "0")}`,
    slug: seed.slug,
    title: seed.title,
    titleBn: seed.titleBn,
    subtitle: seed.subtitle,
    authorId: author.id,
    authorName: author.name,
    authorNameBn: author.nameBn,
    categoryId: category.id,
    categoryName: category.name,
    subjectId: subject.id,
    subjectName: subject.name,
    publisher: seed.publisher,
    year: seed.year,
    // Explicit: these are English-language books with Bengali *display* titles.
    // Inferring language from titleBn would label them all Bengali.
    language: seed.language,
    isbn: seed.file.isbn,
    edition: seed.edition,
    pages: seed.pages,
    description: seed.description,
    descriptionBn: seed.descriptionBn,
    sourceUrl: seed.sourceUrl,
    license: seed.license,
    status,
    copiesTotal,
    copiesAvailable,
    shelf: `${shelfPrefix[category.id]}-SH${(i % 6) + 1}-R${(i % 4) + 1}-P${String(
      (i % 12) + 1,
    ).padStart(2, "0")}`,
    coverHue: seed.hue,
    coverImage: seed.coverImage,
    format: "pdf",
    fileSizeMb: seed.file.sizeMb,
    fileUrl: `/api/file/${seed.slug}`,
    // Deterministic, and openly fictional. A download counter on a library that
    // has just launched is either zero everywhere, which makes the "popular"
    // shelf meaningless, or invented. This is invented from the index, so it is
    // stable across renders and obviously not a measurement.
    downloads: 480 + ((i * 613) % 9200),
    rating: Math.round((3.6 + ((i * 7) % 14) / 10) * 10) / 10,
    featured: seed.featured ?? false,
    priority: seed.priority,
    addedAt: seed.file.addedAt,
    uploadedBy: seed.file.uploadedBy ?? uploaders[i % uploaders.length],
  };
}

export const books: Book[] = seeds.map(buildBook);

/** The demo file served if a slug has no entry in `bookFiles`. */
export const sampleFileName = "sample.pdf";

/**
 * Slug → the file's name in private storage.
 *
 * Kept apart from `Book` deliberately. A `Book` is handed to Client Components
 * and therefore to the browser, and the one thing about a book that must not
 * travel with it is where the file actually is. The route handler looks the name
 * up here, on the server, after it has decided the reader is entitled to it.
 */
export const bookFiles: Record<string, string> = Object.fromEntries(
  books.map((book, i) => [
    book.slug,
    seeds[i].file.url.split("/").pop() ?? sampleFileName,
  ]),
);

// Backfill the denormalised counts now that every book exists.
for (const c of categories) {
  c.bookCount = books.filter((b) => b.categoryId === c.id).length;
}
for (const s of subjects) {
  s.bookCount = books.filter((b) => b.subjectId === s.id).length;
}
for (const a of authors) {
  a.bookCount = books.filter((b) => b.authorId === a.id).length;
}
