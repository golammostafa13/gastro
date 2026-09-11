/**
 * Site constants.
 *
 * Anything with a Bengali counterpart carries it here rather than in the
 * dictionaries: these are facts about the library, not interface strings, and
 * the sitemap and metadata builders need them without a locale in hand.
 */
export const site = {
  name: "Gastroenterology Book Bank",
  /**
   * The short form, for places the full name will not fit: the imprint line on
   * a grid-size cover, mostly. Not an abbreviation to use in prose.
   */
  nameLead: "Lanso D",
  nameBn: "গ্যাস্ট্রোএন্টেরোলজি বুক ব্যাংক",
  tagline: "The gut, read closely",
  taglineBn: "পরিপাকতন্ত্র, গভীরভাবে পড়া",
  /**
   * This is the description a search engine sees, and the only page it can
   * reach is the sign-in form, so it describes what the password opens rather
   * than promising shelves a visitor cannot get to yet.
   */
  description:
    "Gastroenterology Book Bank is a digital library on the gut, the liver and the biliary tract for doctors, trainees and medical students in Bangladesh. Enter the password printed in your copy, then read or download every title, free, in your browser, in Bengali or English.",
  descriptionBn:
    "গ্যাস্ট্রোএন্টেরোলজি বুক ব্যাংক পরিপাকতন্ত্র, যকৃৎ ও পিত্তনালী বিষয়ে একটি ডিজিটাল গ্রন্থাগার, বাংলাদেশের চিকিৎসক, প্রশিক্ষণার্থী ও মেডিকেল শিক্ষার্থীদের জন্য। আপনার কপিতে ছাপা পাসওয়ার্ড দিন, তারপর সব বই পড়ুন বা ডাউনলোড করুন: বিনামূল্যে, ব্রাউজারেই, বাংলা বা ইংরেজিতে।",
  url: "https://gastroenterologybookbank.example.org",
  email: "info@squarepharma.com.bd",
  /**
   * The sponsor. Named here rather than in the dictionaries for the same
   * reason as the library's own name: it is a fact, not a translatable
   * string, and the courtesy credit needs it without a locale in hand.
   */
  sponsor: {
    product: "Lanso D 30",
    productBn: "ল্যানসো ডি ৩০",
    generic: "Dexlansoprazole 30 mg",
    genericBn: "ডেক্সল্যানসোপ্রাজল ৩০ মি.গ্রা.",
    company: "Square Pharmaceuticals PLC.",
    companyBn: "স্কয়ার ফার্মাসিউটিক্যালস পিএলসি.",
    /** The company mark, shown under the "Courtesy by" label. Drawn, not scanned. */
    logo: "/courtesy-by.png",
    /**
     * The pack shot. Drawn by `lib/lansod-canvas`, not photographed: the only
     * supplied photograph carries a stock-library watermark across the face of
     * the carton, and a flood fill that removes a studio ground cannot remove a
     * mark printed on the product. See `scripts/build-brand-assets.mjs`.
     */
    pack: "/lanso-d-30.png",
  },
  /**
   * Navigation is defined by route and dictionary key; the labels themselves
   * live in the dictionaries so a new language does not have to edit this file.
   */
  nav: [
    { href: "/books", key: "discover" },
    { href: "/categories", key: "categories" },
    { href: "/subjects", key: "subjects" },
    { href: "/authors", key: "authors" },
    { href: "/about", key: "about" },
    { href: "/contact", key: "contact" },
  ],
  social: {
    facebook: "https://facebook.com",
    x: "https://x.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
  },
} as const;

export type NavKey = (typeof site.nav)[number]["key"];
