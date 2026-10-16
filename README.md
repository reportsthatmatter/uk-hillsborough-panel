# The Report of the Hillsborough Independent Panel

HC 581, ordered by the House of Commons and published 12 September 2012. The
Panel, chaired by the Rt Revd James Jones, Bishop of Liverpool, reviewed more
than 450,000 pages of disclosed material relating to the 1989 Hillsborough
stadium disaster.

## Source

`archive/hillsborough-panel-report.pdf` — the official publication as hosted on
GOV.UK (`attachment_data/file/229038/0581.pdf`). The imprint reserves
the rights to the Hillsborough Independent Panel (licence not confirmed; see `LICENSE`).

The served text comes from the Panel's own website edition of the report (`reference/raw/*.html`, 140 pages of hillsborough.independent.gov.uk as the Wayback Machine kept them; also "© Crown Copyright 2012"; each file's URL, capture and SHA-256 in `reference/manifest.json`), read by `panel-html.ts`. The archive lacks some pages (most of chapters 4, 7 and 9, the end of chapter 8, part of chapter 10, 12 and Part 3, the title pages): those stretches are the PDF's own text, as the PDF passes read it, each block keeping its PDF page (`fidelity.md` lists every gap filled). The PDF is still the citation target: every printed page number comes from it (reportsthatmatter-ivg.3). How the text was made, and its known limitations: `PROCESSING.md`.

## Licence

Text of the report: Status not confirmed. The report's imprint reserves rights to the Hillsborough Independent Panel; GOV.UK and the Panel's website say Crown copyright. Our markup, processing and editorial additions: CC BY 4.0. Code: MIT. Evidence, caveats and the full statement are in [LICENSE](LICENSE); the MIT text is in [LICENSE-MIT](LICENSE-MIT).

## Build

`ingest.ts` declares how the report is turned into Markdown. Rebuild from the
site repo with `pnpm ingest run uk-hillsborough-panel`.
