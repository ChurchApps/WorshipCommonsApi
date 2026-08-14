# WorshipCommonsApi
API for WorshipCommons.org

## Catalog content

Catalog song masters live in the sibling **WorshipCommonsContent** repo (one
folder per song). This repo vendors its generated `catalog.json` as
`config/catalog.json` (committed; ships to the migrate Lambda via the
`config/**` serverless package pattern). `src/seed-data/catalog.ts` reads it.

After changing the content library:

```
yarn sync-catalog     # copies ../WorshipCommonsContent/catalog.json → config/catalog.json (commit it)
yarn seed             # local: reseed DB + content/ from the library checkout
```

Prod/staging rows update via data migrations (`buildCatalog`); bucket assets via
`aws s3 sync songs s3://<bucket>/songs` (+ `writers`) from the library checkout —
the bucket mirrors the repo layout exactly, no transform step.
Library checkout location defaults to `../WorshipCommonsContent`; override with
`CONTENT_LIBRARY_DIR`. Full provenance rules: `../.notes/source-of-truth.md`.

## Content bucket = library mirror

The content bucket holds `songs/` and `writers/` in the library repo's exact
layout and is the **operational master**: user submissions write library-shaped
folders into it (`ContentLibraryHelper`), and the library repo is refreshed from
it periodically (`aws s3 sync` down + `build-catalog` + commit — runbook in the
library README). Disaster recovery = repo → bucket sync + reseed from
`catalog.json`; song ids are frozen so votes/sings/libraries survive.
