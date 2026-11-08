# DF Field Designer

Visualizzatore dei tracciati dei campi di football americano (Master, Under 15/18, Senior, Flag, Personalizzato) con quote in metri/yard.

Un solo file statico (`index.html`), vanilla JS + SVG, nessuna build, nessuna dipendenza esterna.

## Pubblicazione
- **GitHub Pages**: Settings → Pages → Deploy from branch `main` / root.
- **WordPress**: carica `index.html` (es. `/wp-content/uploads/field-designer/index.html` o via FTP in una cartella dedicata) e incorporalo con
  `<iframe src=".../index.html?embed=1" style="width:100%;aspect-ratio:16/10;border:0"></iframe>`

## Parametri URL
| Parametro | Valori | Note |
|---|---|---|
| `campo` | `master`, `u1518`, `senior`, `flag`, `custom` | default `senior` |
| `numeri`, `metri`, `yard` | `0`/`1` | toggle |
| `embed` | `1` | nasconde header, footer e pulsanti export |
| `cl`, `cw`, `ce` | numeri | solo `custom`: campo di gioco, larghezza, end zone (yd) |
| `c5`, `ch`, `cn`, `ct` | `0`/`1` | solo `custom`: tratteggiate ogni 5 yd, hash, numeri, aree tecniche |

Esempio campo Daemons: `?campo=custom&cl=94&cw=53.3&ce=10&numeri=1`

## Personalizzazione
- Misure dei preset: oggetto `PRESETS` in testa allo script.
- Colori: variabili CSS in `:root` (`--turf`, `--endzone`, `--line`, `--dim`, `--accent`…).
