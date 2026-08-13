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
the library's `node tools/layout-content.mjs <outDir>` + `aws s3 sync --size-only`.
Library checkout location defaults to `../WorshipCommonsContent`; override with
`CONTENT_LIBRARY_DIR`. Full provenance rules: `../.notes/source-of-truth.md`.
