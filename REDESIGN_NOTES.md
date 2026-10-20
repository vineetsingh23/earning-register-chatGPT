# Metro Earnings Register — UI Redesign

## Visual direction
- Professional metro/operations palette: deep teal + emerald, slate neutrals, amber highlights.
- Light mode uses a cool `#f4f7fb` canvas with white panels.
- Dark mode uses navy/slate surfaces with teal accents.
- Rounded 12–24px surfaces, subtle borders, restrained shadows and compact typography.
- Responsive navigation and dashboard layout.
- Accessible focus rings and clearer status indicators.

## Main improvements
- Reworked station login into a focused access card with brand treatment and clearer hierarchy.
- Rebuilt the application header/navigation with station identity, sync status, responsive tabs, theme and logout actions.
- Redesigned dashboard date/data toolbar into grouped controls.
- Redesigned earning summary cards with a strong Total Earning hero card and compact KPI cards.
- Updated entry toolbar, buttons, inputs and final earning presentation.
- Restyled earning tables for a cleaner operational spreadsheet appearance while preserving existing data behavior.
- Added global scrollbar, selection, typography, background and form-control styling.

## Data/business logic
No business logic, handlers, hooks, Supabase integration, schema, or register calculations were intentionally changed. The redesign is primarily Tailwind/CSS and presentation-level component changes.

## Run
```bash
npm install
npm run dev
```

The project already uses Tailwind CSS through the Tailwind Vite plugin, so no separate Tailwind CLI configuration is required.
