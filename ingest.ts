import { layoutPageJoins,
  pipeline,
  pageBreakContinuations,
  runningFurniture,
  quoteInset,
  numberedParagraphs,
  listedHeadings,
  numberedHeadings,
  allCapsHeadings,
} from "@rtm/ingest";

/**
 * How this report is built. Owned by the report: every decision that shaped
 * its text is named here, and the passes it composes are library code, so a
 * fix to a shared pass reaches every report that calls it.
 */
export default pipeline({
  id: "uk-hillsborough-panel",
  title: "The Report of the Hillsborough Independent Panel",
  authors: "Hillsborough Independent Panel (the Rt Revd James Jones, Chair)",
  published_at: "12 September 2012",
  source_url: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/229038/0581.pdf",
  repo: ".",
  volumes: [
    {
      path: "archive/hillsborough-panel-report.pdf",
      sha256: "8dbea5f6fa8c565f4c69c9390637d8903b236dc85e1fc63bbc54ae0248b90d8e",
    },
  ],
  // Numbered "1.1", "1.2" paragraphs (reportsthatmatter-hzf). Chapter and
  // part headings are set by colour and size only, with no textual
  // convention pdftotext preserves — they were being stripped outright as
  // running-header furniture, since the same title recurs verbatim as the
  // header on every later page of that chapter. numbersTrackPages keeps
  // that stripped only where the furniture's own number tracks the page (a
  // real running header), recovering the one true occurrence — the chapter
  // opening itself — as a heading (reportsthatmatter-r19).
  passes: [
    // A paragraph run over a page break that opens on a capital, a digit or a
    // quotation mark (or follows a full stop on a justified page) joins when the
    // layout says it runs on: no first-line indent, same face (reportsthatmatter-38s.10).
    layoutPageJoins(),
    runningFurniture({ numbersTrackPages: true }),
    quoteInset(10),
    numberedParagraphs(),
    // The report quotes press cuttings ("SHAME OF BOOZY YOBS") and legal
    // memorials with their own numbered paragraphs ("18. TO HER MAJESTY'S
    // ATTORNEY GENERAL...") that read as headings on their own. The
    // structure is Parts, Chapters and Appendices, never a numbered or
    // all-caps line, so only a heading the contents lists is kept.
    numberedHeadings(false),
    allCapsHeadings(false),
    listedHeadings(),
    // A paragraph that stops mid-sentence at a page foot and resumes in lower
    // case on the next page was read as a block quotation (4 cases).
    pageBreakContinuations(),
  ],
});
