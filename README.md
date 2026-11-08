# DF Field Designer

Visualizzatore dei tracciati dei campi di football americano (Master, Under 15/18, Senior, Flag, Personalizzato) con quote in metri/yard.

File statici, vanilla JS + SVG, nessuna build, nessuna dipendenza esterna:
- `field-engine.js` — motore di disegno riusabile (anche dall'app play-by-play)
- `index.html` — interfaccia del designer

## Pubblicazione
- **GitHub Pages**: Settings → Pages → Deploy from branch `main` / root.
- **WordPress**: carica `index.html` e `field-engine.js` nella stessa cartella (es. `/wp-content/uploads/field-designer/index.html` o via FTP in una cartella dedicata) e incorporalo con
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

## Riuso del motore (es. drive chart)
```html
<script src="field-engine.js"></script>
<script>
  const F = FieldEngine;
  const cfg = F.buildCustom({ ...F.CUSTOM_DEFAULTS, play: 94 });
  el.innerHTML = F.renderField(cfg, { numbers: true, overlay: g =>
    `<circle cx="${g.x('away', 30)}" cy="${g.y(0.5)}" r="1" fill="orange"/>` });
</script>
```
`g.x('home'|'away', yard)` converte una posizione tipo "DAE 35" / "SEA 30" in coordinata; `g.y(f)` è la frazione di larghezza.
