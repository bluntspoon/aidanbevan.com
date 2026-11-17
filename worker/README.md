# Car-dex worker

The API behind [aidanbevan.com/cardex](https://aidanbevan.com/cardex/): it looks at a photo,
asks Cloudflare Workers AI what car it is, and adds a rough rand price band. The photo is not
stored; the collection lives in the browser.

    POST /api/identify   {"image": "data:image/jpeg;base64,..."}
      -> {"ok": true, "car": {make, model, year, body_type, colour, confidence, notes},
          "value": {low, high, mid, currency, basis, year, body, matched}}

    POST /api/value      {"make": "Toyota", "model": "Hilux", "year": 2018}
      -> {"ok": true, "value": {...}}      (used when the user corrects a guess)

    GET  /api/health

## Deploy

    cd worker
    npm install
    npx wrangler deploy          # publishes cardex.bluntspoon.workers.dev

The Cloudflare API token needs **Workers Scripts: Edit** and **Workers AI: Read** for the
account. Keep it in the environment only, never in this repo:

    set -a; . ~/homelab/hermes.env; set +a
    CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler deploy

## Check a deploy

    node scripts/smoke.mjs https://cardex.bluntspoon.workers.dev ../polo.jpg

## Notes

- The default model is `@cf/llava-hf/llava-1.5-7b-hf`. It is good at make and body style and
  shaky on the exact model, so the app lets the user correct the guess before pricing it.
  `@cf/meta/llama-3.2-11b-vision-instruct` is sharper but needs its licence accepted once in
  the Cloudflare dashboard; switch it by editing `VISION_MODEL` in `wrangler.toml`.
- Prices are a rough guide for fun: a new-price table, one depreciation curve, a band that
  widens when the identification is unsure. Not a valuation.
