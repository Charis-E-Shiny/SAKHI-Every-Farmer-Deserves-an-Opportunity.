# FoodFlow — From Every Harvest to Every Table

AI-assisted fresh-produce marketplace connecting smallholder farmers directly with households,
restaurants and community kitchens (UN SDG 2 — Zero Hunger).

## Run it locally

Requires Node.js 20.9+.

```bash
npm install
npm run setup   # creates .env, builds the SQLite database, seeds demo data
npm run dev
```

Open **http://localhost:3000** and use **Try the demo** to jump into any interface, or sign in at
`/login` with a demo phone number and PIN **1234**:

| Role | Phone | Who |
| --- | --- | --- |
| Farmer | 9000000101 | Ramesh Gowda (Doddaballapur) |
| Household | 9000000201 | Ananya Rao (Yelahanka) |
| Restaurant | 9000000301 | The Green Ladle (Hebbal) |
| Community kitchen | 9000000303 | Annapurna Community Kitchen |
| Admin | 9000000001 | Meera Krishnan |
| Delivery | 9000000401 | Imran Pasha |

To start over with fresh demo data at any time: `npm run db:reset`.

AI features work without any key (deterministic offline fallbacks). Add `GEMINI_API_KEY` to `.env`
to use the Gemini model.

Full documentation (architecture, SDG mapping, screenshots) lands at the end of the build — see
[PROGRESS.md](PROGRESS.md) for what's done so far.
