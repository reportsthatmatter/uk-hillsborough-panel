/**
 * Reads the Hillsborough Independent Panel's own website edition of the report
 * (reference/raw/, the panel's site as the Wayback Machine kept it) into the
 * blocks the hybrid source mode serves (@rtm/ingest `cleanEdition`).
 *
 * What the markup means is a property of this source, so it lives here. The
 * site set the report as one web page per few printed pages: the Foreword, the
 * Report summary, Part 1, Part 2's twelve chapters, Part 3 and the appendices,
 * each "page-1", "page-2" … under its own title. The Wayback Machine holds
 * most of them but not all (chapters 4, 7, 8 and 9 are mostly missing), so
 * wherever a page is missing this adapter says so with a `gap` block and the
 * PDF's own text fills it (`fillGaps`): the files are named
 * `<section>-page-<n>.html`, and a section that does not open on page 1, a
 * page number skipped, and every change of section are gaps.
 *
 * The page text is the `entry-content` div, its notes the `footnotes` div
 * inside it:
 *
 * - The page's `<h1 class="entry-title">` is the section's title ("Chapter 4:
 *   Emergency response and aftermath: …"), a heading on its first page only
 *   (on a later page it is the site's running title). `<h2>`, `<h3>` are the
 *   report's subsection headings, one and two levels below it.
 * - `<p>` is a paragraph ("2.1.4&nbsp;The 1981 FA Cup Semi-Final, …", the
 *   printed paragraph number part of its text); the site's markup nests and
 *   leaves them open (`<p><H2>…</H2><P>…</P>`), so any block tag closes the
 *   paragraph before it. Two `<br>` in a row end one.
 * - `<blockquote>`: a quotation, its `<p>`s one quotation of several
 *   paragraphs. `<ul>`/`<ol>` with (unclosed) `<li>`: a list.
 * - `<div class="boxout">`: a boxed passage (Part 1's private prosecution),
 *   read as the paragraphs it holds.
 * - `<span class="strike_through">`: words the report prints struck through
 *   (deletions in the police statements quoted in chapter 11), as `~~…~~`.
 * - `[12]` in the text: a note marker; the notes are "[12] Statement of …"
 *   lines in `div.footnotes`, numbered through each section across its web
 *   pages, as the printed notes are numbered through each chapter. Labelled
 *   `N-K`, K the section's number (1-12 the chapters, 50 + n the others), so
 *   that note 12 of chapter 4 is never chapter 5's.
 * - "Click here to watch …" paragraphs are the site's video links, and
 *   `<ul class="direction">` its "Previous / Page 2 of 11 / Next" links, and
 *   a list item that is only a link to another of its pages (Part 2's list
 *   of its chapters): not the report's text.
 */
import { htmlEvents, inlineMarkdown, inlineText, type Edition, type EditionBlock, type EditionNote, type InlinePiece } from "@rtm/ingest";

export type Diagnostics = string[];

/** A file's section and web page, from its name. */
type Page = { section: string; key: number; page: number; suffix: string; level: number };

const SECTIONS: Array<{ re: RegExp; section: (m: RegExpMatchArray) => string; key: (m: RegExpMatchArray) => number; level: number }> = [
  { re: /^foreword$/, section: () => "foreword", key: () => 50, level: 2 },
  { re: /^summary$/, section: () => "summary", key: () => 51, level: 2 },
  { re: /^part-(\d)$/, section: (m) => `part-${m[1]}`, key: (m) => 51 + Number(m[1]), level: 2 },
  { re: /^ch(\d{1,2})$/, section: (m) => `ch${m[1]}`, key: (m) => Number(m[1]), level: 3 },
  { re: /^appendix-(\d)$/, section: (m) => `appendix-${m[1]}`, key: (m) => 60 + Number(m[1]), level: 2 },
];

export function pageOf(path: string): Page {
  const name = path.replace(/^.*\//, "").replace(/\.html$/, "");
  const m = name.match(/^(.*)-page-(\d+)([a-z]?)$/);
  if (!m) throw new Error(`panel-html: file name not understood: ${path}`);
  for (const s of SECTIONS) {
    const sm = m[1].match(s.re);
    if (sm) return { section: s.section(sm), key: s.key(sm), page: Number(m[2]), suffix: m[3], level: s.level };
  }
  throw new Error(`panel-html: section not understood: ${path}`);
}

/** The entry-content div's events, up to its close; the footnotes div's events apart. */
function contentOf(html: string, path: string): { title: string; body: ReturnType<typeof htmlEvents>; notes: ReturnType<typeof htmlEvents> } {
  const titleMatch = html.match(/<h1 class="entry-title[^"]*">([\s\S]*?)<\/h1>/);
  const title = titleMatch ? inlineText(htmlEvents(titleMatch[1]).flatMap((e) => (e.kind === "text" ? [{ text: e.text }] : []))) : "";
  const at = html.indexOf('class="entry-content"');
  if (at < 0) throw new Error(`panel-html: no entry-content in ${path}`);
  const start = html.lastIndexOf("<div", at);
  const body: ReturnType<typeof htmlEvents> = [];
  const notes: ReturnType<typeof htmlEvents> = [];
  let depth = 0;
  let inNotes = 0;
  let nav = 0;
  for (const e of htmlEvents(html.slice(start))) {
    // the site's own "Previous / Page 2 of 11 of this section / Next" links
    if (nav) {
      if (e.kind === "start" && e.tag === "ul") nav++;
      else if (e.kind === "end" && e.tag === "ul") nav--;
      continue;
    }
    if (e.kind === "start" && e.tag === "ul" && /\bdirection\b/.test(e.attrs.class ?? "")) {
      nav = 1;
      continue;
    }
    if (e.kind === "start" && e.tag === "div") {
      depth++;
      if (inNotes) inNotes++;
      else if (/\bfootnotes\b/.test(e.attrs.class ?? "")) {
        inNotes = 1;
        continue;
      }
    } else if (e.kind === "end" && e.tag === "div") {
      depth--;
      if (inNotes) {
        inNotes--;
        if (!inNotes) continue;
      }
      if (depth <= 0) break;
    }
    (inNotes ? notes : body).push(e);
  }
  return { title, body, notes };
}

const BLOCK_TAGS = new Set(["p", "h1", "h2", "h3", "h4", "h5", "blockquote", "ul", "ol", "li", "table", "div"]);

export function readPanelHtml(files: Array<{ path: string; text: string }>, diagnostics: Diagnostics = []): Edition {
  const blocks: EditionBlock[] = [];
  const notes: EditionNote[] = [];
  let previous: Page | undefined;

  for (const file of files) {
    const at = pageOf(file.path);
    const { title, body, notes: noteEvents } = contentOf(file.text, file.path);
    const source = { file: file.path };

    // what the archive lacks before this page
    if (!previous) blocks.push({ kind: "gap", reason: `before ${file.path}: the front matter, which the website does not carry` });
    else if (previous.section !== at.section) {
      blocks.push({
        kind: "gap",
        reason: at.page === 1 ? `between ${previous.section} and ${at.section}: any page of either not captured` : `${at.section} pages 1-${at.page - 1} not captured (and any page of ${previous.section} after page ${previous.page})`,
      });
    } else if (at.page > previous.page + 1 || (at.suffix && at.page > previous.page)) {
      blocks.push({ kind: "gap", reason: `${at.section} pages ${previous.page + 1}-${at.page - (at.suffix ? 0 : 1)} not captured` });
    }

    if (at.page === 1 && title) blocks.push({ kind: "heading", level: at.level, text: inlineMarkdown([{ text: title }]), source });
    // h2 is one level below the section's title, h3 two; the Report summary's are a level lower again, so that
    // it reads as one page (its twelve "Summary of Chapter N" are a page or two each, and split at their own
    // level the shorter ones fold into their neighbours and its "Introduction" names the page)
    const sub = at.section === "summary" ? at.level + 1 : at.level;

    // the page's blocks
    let pieces: InlinePiece[] = [];
    let kind: "paragraph" | "heading" | "item" | null = null;
    let headingLevel = 0;
    let quote: string[] | null = null;
    let list: { items: string[]; quoted: boolean } | null = null;
    let em = 0;
    let strong = 0;
    let strike = 0;
    let lastBr = false;
    const markers: string[] = [];
    // text inside a link to another page of the site, for telling a list of such links (Part 2's list of its chapters) from the report's own
    let inNav = 0;
    let navText = "";

    const flushText = () => {
      const text = inlineMarkdown(pieces).trim();
      const was = kind;
      pieces = [];
      kind = null;
      if (!text) return;
      if (was === "heading") {
        blocks.push({ kind: "heading", level: headingLevel, text, source });
        return;
      }
      if (/^Click here to /.test(text)) return;
      const nav = navText.replace(/\s+/g, " ").trim();
      navText = "";
      if ((was === "item" || list) && nav && nav === text.replace(/\\/g, "")) return;
      if (was === "item" && list) list.items.push(text);
      else if (quote) quote.push(text);
      else if (list) list.items.push(text);
      else blocks.push({ kind: "paragraph", text, source });
    };
    const flushList = () => {
      flushText();
      if (list?.items.length) blocks.push({ kind: "list", items: list.items, ...(list.quoted ? { quoted: true } : {}), source });
      list = null;
    };
    const flushQuote = () => {
      flushText();
      if (quote?.length) blocks.push({ kind: "quote", text: quote.join("\n\n"), source });
      quote = null;
    };
    const text = (s: string) => {
      if (!kind) kind = list ? "item" : "paragraph";
      let pos = 0;
      for (const m of s.matchAll(/\[(\d{1,3})\]/g)) {
        pieces.push({ text: s.slice(pos, m.index), em: em > 0, strong: strong > 0, strike: strike > 0 });
        const label = `${m[1]}-${at.key}`;
        pieces.push({ marker: label });
        markers.push(label);
        pos = m.index! + m[0].length;
      }
      pieces.push({ text: s.slice(pos), em: em > 0, strong: strong > 0, strike: strike > 0 });
    };

    for (const e of body) {
      if (e.kind === "text") {
        if (!e.text.trim() && !kind) continue;
        // "<BR>&nbsp;<BR>" is a paragraph break all the same
        if (e.text.trim()) lastBr = false;
        if (inNav) navText += e.text;
        text(e.text);
        continue;
      }
      const tag = e.tag;
      if (e.kind === "start") {
        if (tag === "br") {
          if (lastBr && kind === "paragraph") flushText();
          else if (kind) pieces.push({ text: " " });
          lastBr = true;
          continue;
        }
        lastBr = false;
        if (tag === "a" && /^\/report\//.test(e.attrs.href ?? "")) inNav++;
        else if (tag === "em" || tag === "i") em++;
        else if (tag === "strong" || tag === "b") strong++;
        else if (tag === "span" && /strike_through/.test(e.attrs.class ?? "")) strike++;
        else if (/^h[1-5]$/.test(tag)) {
          flushText();
          kind = "heading";
          headingLevel = Math.min(6, sub + Number(tag[1]) - 1);
        } else if (tag === "blockquote") {
          flushList();
          flushQuote();
          quote = [];
        } else if (tag === "ul" || tag === "ol") {
          flushText();
          if (!list) list = { items: [], quoted: quote !== null };
        } else if (tag === "li") {
          flushText();
          if (!list) list = { items: [], quoted: quote !== null };
          kind = "item";
        } else if (BLOCK_TAGS.has(tag)) {
          // a paragraph (or a div standing for one) closes the text before it; inside a list it is the item's own text
          if (!(list && kind === "item" && pieces.every((p) => "text" in p && !p.text.trim()))) flushText();
          if (list && tag === "p" && !kind) kind = "item";
        }
        continue;
      }
      // end tags
      if (tag === "a") inNav = Math.max(0, inNav - 1);
      else if (tag === "em" || tag === "i") em = Math.max(0, em - 1);
      else if (tag === "strong" || tag === "b") strong = Math.max(0, strong - 1);
      else if (tag === "span") strike = Math.max(0, strike - 1);
      else if (/^h[1-5]$/.test(tag)) flushText();
      else if (tag === "blockquote") {
        flushList();
        flushQuote();
      } else if (tag === "ul" || tag === "ol") flushList();
      else if (tag === "p" || tag === "li" || tag === "div") {
        if (!list) flushText();
      }
    }
    flushList();
    flushQuote();
    flushText();

    // the page's notes: "[12] Statement of …" lines
    const notePieces: Array<{ label: string; pieces: InlinePiece[] }> = [];
    for (const e of noteEvents) {
      if (e.kind === "start" && (e.tag === "br" || e.tag === "p")) {
        notePieces.length && notePieces[notePieces.length - 1].pieces.push({ text: " " });
        continue;
      }
      if (e.kind !== "text") continue;
      let pos = 0;
      for (const m of e.text.matchAll(/(?:^|\s)\[(\d{1,3})\]\s*/g)) {
        if (notePieces.length) notePieces[notePieces.length - 1].pieces.push({ text: e.text.slice(pos, m.index) });
        notePieces.push({ label: `${m[1]}-${at.key}`, pieces: [] });
        pos = m.index! + m[0].length;
      }
      if (notePieces.length) notePieces[notePieces.length - 1].pieces.push({ text: e.text.slice(pos) });
    }
    const defined = new Set<string>();
    for (const note of notePieces) {
      const noteText = inlineText(note.pieces).trim();
      if (!noteText) continue;
      if (defined.has(note.label) || notes.some((n) => n.label === note.label)) {
        diagnostics.push(`${file.path}: note ${note.label} defined twice; the second dropped`);
        continue;
      }
      defined.add(note.label);
      notes.push({ label: note.label, text: noteText });
    }
    for (const label of markers) if (!defined.has(label) && !notes.some((n) => n.label === label)) diagnostics.push(`${file.path}: marker ${label} has no note`);
    previous = at;
  }
  blocks.push({ kind: "gap", reason: `after ${files[files.length - 1].path}: any page the website does not carry` });

  // a marker with no note is left as its number, as printed
  const labels = new Set(notes.map((n) => n.label));
  const unmark = (s: string) => s.replace(/\[\^(\d+)-(\d+)\]/g, (whole, n: string, k: string) => (labels.has(`${n}-${k}`) ? whole : n));
  for (const block of blocks) {
    if (block.kind === "paragraph" || block.kind === "quote" || block.kind === "heading") block.text = unmark(block.text);
    else if (block.kind === "list") block.items = block.items.map(unmark);
  }
  // a note no marker cites is still the report's: kept, and reported
  const cited = new Set(blocks.flatMap((b) => [...JSON.stringify(b).matchAll(/\[\^(\d+-\d+)\]/g)].map((m) => m[1])));
  for (const note of notes) if (!cited.has(note.label)) diagnostics.push(`note ${note.label} is cited by no marker`);
  return { blocks, notes };
}
