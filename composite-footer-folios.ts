import type { SplitPage, VolumePass } from "@rtm/ingest";

/**
 * Part, chapter and appendix opening pages print their folio at the end of a
 * footer that names the division, "Part 2 Hillsborough: ‘what is added to
 * public understanding’   59" (reportsthatmatter-j8kw). The footer is unique
 * to its page, so `runningFurniture` neither strips it nor reads its number,
 * and the folios there are not in step with the PDF (59 on PDF p.63, 61 on
 * p.64: the blank verso between is not in the PDF), so the gap cannot be
 * inferred either: twelve pages were left with no page marker and their text
 * cited with the page before.
 *
 * On a page with no printed number yet, the last line (of the body or
 * of the notes), if it opens on "Part",
 * "Chapter" or "Appendix" and ends on a number set apart by spaces, gives the
 * page its number, as long as that number falls between the numbers of the
 * pages either side of it; the line is furniture and goes. Runs after
 * `runningFurniture`, which numbers the pages either side.
 */
const FOOTER = /^\s*(?:Part|Chapter|Appendix)\s+\d+\s+\S.*?\s{2,}(\d{1,4})\s*$/;

export const compositeFooterFolios = (): VolumePass => ({
  name: "compositeFooterFolios",
  stage: "volume",
  run: (pages: SplitPage[]) =>
    pages.map((page, i) => {
      if (page.printed !== null || page.roman) return page;
      // The footer is the page's last line: under the body, or read with the notes where the page has some.
      let found: { field: "body" | "footnotes"; at: number; value: number } | undefined;
      for (const field of ["body", "footnotes"] as const) {
        const lines = page[field];
        let last = lines.length - 1;
        while (last >= 0 && !lines[last].trim()) last--;
        const m = last >= 0 ? FOOTER.exec(lines[last]) : null;
        if (m) found = { field, at: last, value: Number.parseInt(m[1], 10) };
      }
      if (!found) return page;
      const { field, at, value } = found;
      const before = pages.slice(0, i).reverse().find((p) => p.printed !== null);
      const after = pages.slice(i + 1).find((p) => p.printed !== null);
      if (before && !(value > before.printed! && value - before.printed! <= 4 * (page.index - before.index))) return page;
      if (after && !(value < after.printed! && after.printed! - value <= 4 * (after.index - page.index))) return page;
      return { ...page, printed: value, [field]: page[field].filter((_, j) => j !== at) };
    }),
});
