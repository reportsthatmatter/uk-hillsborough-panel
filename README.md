# The Report of the Hillsborough Independent Panel

HC 581, ordered by the House of Commons and published 12 September 2012. The
Panel, chaired by the Rt Revd James Jones, Bishop of Liverpool, reviewed more
than 450,000 pages of disclosed material relating to the 1989 Hillsborough
stadium disaster.

## Source

`archive/hillsborough-panel-report.pdf` — the official publication as hosted on
GOV.UK (`attachment_data/file/229038/0581.pdf`). Crown copyright, published
under the Open Government Licence v3.0. See `datapackage.json`.

The served text comes from the Panel's own website edition of the report (`reference/raw/*.html`, 140 pages of hillsborough.independent.gov.uk as the Wayback Machine kept them; also Crown copyright under the OGL; each file's URL, capture and SHA-256 in `reference/manifest.json`), read by `panel-html.ts`. The archive lacks some pages (most of chapters 4, 7 and 9, the end of chapter 8, part of chapter 10, 12 and Part 3, the title pages): those stretches are the PDF's own text, as the PDF passes read it, each block keeping its PDF page (`fidelity.md` lists every gap filled). The PDF is still the citation target: every printed page number comes from it (reportsthatmatter-ivg.3). How the text was made, and its known limitations: `PROCESSING.md`.

## Build

`ingest.ts` declares how the report is turned into Markdown. Rebuild from the
site repo with `pnpm ingest run uk-hillsborough-panel`.
