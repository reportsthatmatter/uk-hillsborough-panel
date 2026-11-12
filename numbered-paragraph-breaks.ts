import type { BodyPass } from "@rtm/ingest";

/**
 * Every body paragraph of the report opens on its three-part number, "2.4.54
 * As with the call to SYMAS, …", at the left margin, and most pages set a
 * blank line between paragraphs. Some do not, and there `numberedParagraphs`
 * cannot help: it reads two-part numbers ("7.1") only. Runs of numbered
 * paragraphs were welded into one block in the stretches the PDF fills
 * (2.4.53 to 2.4.59 was one paragraph; reportsthatmatter-quam).
 *
 * A line at the margin that opens on a three-part number followed by a capital
 * or an opening quotation mark starts a paragraph: a blank line goes before it.
 * A cross-reference wrapped onto a line's start ("2.4.54 above") is followed by
 * lower case and is left alone.
 */
const OPENS = /^ {0,2}\d{1,2}\.\d{1,2}\.\d{1,3}\s+[A-Z‘“'"]/;

export const numberedParagraphBreaks = (): BodyPass => ({
  name: "numberedParagraphBreaks",
  stage: "body",
  run: (lines: string[]) =>
    lines.flatMap((line, i) => (i > 0 && lines[i - 1].trim() && OPENS.test(line) ? ["", line] : [line])),
});
