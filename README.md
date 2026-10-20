# Station Earning Register — React + TypeScript + Vite + Tailwind CSS v4 + Supabase

## Requirements

- Latest Node.js and npm (`.nvmrc` says `node`; with nvm run `nvm install node && nvm use`). Minimum: Node 22.12, npm 10.
- All dependencies in `package.json` are set to `latest`, so `npm install` fetches the newest versions and writes them to `package-lock.json`.
  After that, commit the lock file so everyone gets the same versions. To update later: `npm update` (or `npx npm-check-updates -u && npm install`).

## Run

```
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build in dist/
```

## Tailwind CSS v4 setup (already done)

`npm install tailwindcss @tailwindcss/vite` -> plugin added in `vite.config.ts` -> `@import "tailwindcss";` in `src/index.css`.
There is no `tailwind.config.js` or PostCSS file in v4. Theme colours and the dark-mode variant live in `src/index.css`.

## Connect Supabase

1. Create a project at https://supabase.com.
2. SQL Editor -> New query -> paste `supabase/schema.sql` -> Run (creates tables, 2 sample stations, policies).
3. Copy `.env.example` to `.env` and fill in the values from Project Settings -> API:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
   ```
4. Restart `npm run dev`. On Vercel/Netlify set the same two variables.

Without `.env` the app still works and keeps data in the browser only.

## Project structure (camelCase file names)

```
src/
  applicationEntry.tsx          app entry
  globalStyles.css              Tailwind import, theme colours, dark mode
  components/
    earningRegisterApp.tsx      root: theme, station list, login gate
    stationLoginPage.tsx        station dropdown login
    registerWorkspace.tsx       header, page tabs, selected date
    shiftEntryPage.tsx          shift entry sheet
    tvmEarningPage.tsx          TVM earning sheet
    finalEarning.tsx            final earning page (shift + TVM in one row)
    earningSheetTable.tsx       grouped-header table used by all sheets
    entryToolbar.tsx            date, save button, sync status
    uiStyles.ts                 shared Tailwind class names
    dashboard/                  one file per dashboard card:
      dashboardPage, dateToolbar, earningSummaryCards, earningStatisticsCard, cashInHandCard,
      cashInPossessionCard, coinsCard, cashToBankCard, sendToBankDialog, detailListCard, earningHistogramCard
  handlers/                     cashToBankHandlers, cashCountHandlers, detailListHandlers,
                                entryCellHandlers, dataTransferHandlers, sheetKeyboardHandlers
  hooks/                        useRegisterData (browser + Supabase), useDashboardFigures, useBankNoteDraft
  lib/                          registerTypes, businessRules, earningColumns (columns + formulas),
                                earningCalculations, sampleDataGenerator, supabaseSync
```

Field keys such as `a`, `h1`, `ab2` are the column codes printed in the register; they are data keys, not variables.

Stations and their facilities (SV-4 recharge, parking) come from the `stations` table:
`insert into stations (name, has_sv4, has_parking) values ('Station name', true, false);`

## Security

The app only has a station dropdown (no passwords), so `schema.sql` lets the anon key read and write everything. Fine for an internal tool. For real access control enable Supabase Auth and change `to anon` to `to authenticated` in the policies.
git add readme.md
