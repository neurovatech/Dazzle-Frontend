"use client";

/**
 * SeoCardModal
 *
 * Renders one card per SEO content section (hseogl1–4 from site-settings,
 * each already split on its own headings by the caller — see
 * splitSeoSections). Each card shows its section's full HTML content
 * directly, styled by the tags the CMS content already carries (heading
 * bold and larger, paragraphs plain) — no excerpt, no "Read more", no
 * click-to-expand modal.
 */

import { SEO_RICH_TEXT_CLASS } from "@/lib/seo-content";

/**
 * The CMS's WYSIWYG editor bakes an inline `style="..."` onto practically
 * every tag it produces — headings carry `font-size: inherit`, and text
 * runs are wrapped in their own `<span style="color: ...">` with whatever
 * dark, light-mode-only color the content was originally authored in. An
 * inline style always beats a plain class no matter its selector or source
 * order, so:
 *
 *  - `[&_h1]:text-xl! [&_h2]:text-xl!` etc. — forces the headings to look
 *    like headings instead of inheriting the card's body text size.
 *  - `[&_*]:dark:text-gray-200!` — in dark mode specifically, forces EVERY
 *    descendant's text to one consistent light-on-dark color, overriding
 *    whatever dark, light-mode-only color a given span/heading/paragraph
 *    was individually authored with (otherwise that text is unreadable —
 *    dark grey on this card's own dark background). Left alone in light
 *    mode, where the CMS's own colors are already legible on a light card.
 */
const CARD_CONTENT_CLASS = `${SEO_RICH_TEXT_CLASS} [&_h1]:text-xl! [&_h1]:mt-0! [&_h1]:mb-2! [&_h2]:text-xl! [&_h2]:mt-0! [&_h2]:mb-2! [&_*]:dark:text-gray-200!`;

interface SeoCard {
  label: string;
  html: string;
  wrapper: string;
}

interface Props {
  cards: SeoCard[];
}

export default function SeoCardModal({ cards }: Props) {
  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {cards.map((card, i) => (
        <div key={i} className={`rounded-2xl p-6 ${card.wrapper}`}>
          <div
            className={CARD_CONTENT_CLASS}
            dangerouslySetInnerHTML={{ __html: card.html }}
          />
        </div>
      ))}
    </div>
  );
}
