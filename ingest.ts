import { pipeline, runningFurniture, quoteInset, numberedParagraphs } from "@rtm/ingest";

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
  // Numbered "1.1", "1.2" paragraphs (reportsthatmatter-hzf).
  passes: [runningFurniture(), quoteInset(10), numberedParagraphs()],
});
