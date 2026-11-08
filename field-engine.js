/*!
 * field-engine.js — motore SVG per campi di football americano (Digital Faber)
 * Nessuna dipendenza. Script classico (non modulo) così funziona anche da file://.
 * Espone window.FieldEngine = { PRESETS, CUSTOM_DEFAULTS, buildCustom, geometry, renderField }.
 *
 * Uso base:
 *   FieldEngine.renderField(FieldEngine.PRESETS.senior, { numbers: true, meters: true })
 *
 * Overlay (es. drive chart play-by-play):
 *   renderField(cfg, { overlay: g => `<circle cx="${g.x('home', 35)}" cy="${g.y(0.5)}" r="1" fill="orange"/>` })
 *   g.x('home'|'away', yard) → coordinata x della yard line misurata dalla meta di quella squadra
 *   g.y(f) → coordinata y a frazione f della larghezza (0 = sideline alta, 1 = bassa)
 */
(function (root) {
  'use strict';
  /* ------------------------------------------------------------------
   * CONFIGURAZIONE CAMPI
   * Tutte le misure sono in yard, misurate dalla linea di meta.
   * continuous / dashed: linee su un lato; vengono specchiate
   * automaticamente (tranne quella di metà campo).
   * ------------------------------------------------------------------ */
  const PRESETS = {
    master: {
      label: 'Master', totalLength: 90, totalWidth: 35, endzoneDepth: 10,
      continuous: [10, 20, 30, 35], dashed: [5, 15, 25], centerHash: true,
    },
    u1518: {
      label: 'Under 15/18', totalLength: 120, totalWidth: 45, endzoneDepth: 10,
      continuous: [10, 20, 30, 40, 50], dashed: [25, 35],
      tech: { startYard: 20, depth: 5, offset: 2 },
      hashes: [3 / 8, 5 / 8], numbers: true, numberOffset: 8,
    },
    senior: {
      label: 'Senior', totalLength: 120, totalWidth: 54, endzoneDepth: 10,
      continuous: [10, 20, 30, 40, 50], dashed: [25, 35],
      tech: { startYard: 20, depth: 5, offset: 2 },
      hashes: [3 / 8, 5 / 8], numbers: true, numberOffset: 8,
    },
    flag: {
      label: 'Flag', totalLength: 70, totalWidth: 35, endzoneDepth: 10,
      continuous: [25], dashed: [], flagMarkers: { distanceFromGoal: 5, length: 2 },
    },
    custom: { label: 'Personalizzato' },
  };

  const CUSTOM_DEFAULTS = { play: 94, width: 53.3, ez: 10, dash5: false, hash: true, num: true, tech: true };

  /* Campo personalizzato: linee continue ogni 10 yd + metà campo,
   * metà campo etichettata sempre "50" (come sui campi corti). */
  function buildCustom(c) {
    const half = c.play / 2;
    const tens = [], fives = [];
    for (let y = 10; y < half - 0.01; y += 10) tens.push(y);
    for (let y = 5; y < half - 0.01; y += 10) fives.push(y);
    return {
      label: 'Personalizzato', totalLength: c.play + 2 * c.ez, totalWidth: c.width, endzoneDepth: c.ez,
      continuous: [...tens, half], dashed: c.dash5 ? fives : [],
      tech: c.tech ? { startYard: Math.min(20, half - 5), depth: 5, offset: 2 } : null,
      hashes: c.hash ? [3 / 8, 5 / 8] : null,
      numbers: c.num, numberOffset: 8,
    };
  }


  /* ------------------------------------------------------------------
   * RENDER SVG
   * ------------------------------------------------------------------ */
  const YD_TO_M = 0.9144;
  const W = 0.5; // spessore linee (yd) — scala visiva, non regolamentare

  /* Mappatura yard → coordinate SVG, utile per overlay. "home" = meta di sinistra. */
  function geometry(cfg) {
    const { totalLength: L, totalWidth: H, endzoneDepth: ez } = cfg;
    const play = L - 2 * ez;
    return {
      L, H, ez, play, half: play / 2,
      x: (side, yard) => side === 'away' ? L - ez - yard : ez + yard,
      y: f => H * f,
    };
  }

  function renderField(cfg, opt = {}) {
    const uid = opt.id || 'f' + Math.random().toString(36).slice(2, 8);
    const { totalLength: L, totalWidth: H, endzoneDepth: ez } = cfg;
    const play = L - 2 * ez, half = play / 2;
    const pad = 15;
    const techDepth = cfg.tech ? cfg.tech.depth + cfg.tech.offset : 0;
    const vb = [-pad, -(pad + techDepth), L + 2 * pad, H + 2 * pad + 2 * techDepth];
    const out = [];
    const line = (x1, y1, x2, y2, extra = '') =>
      out.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--line,#fff)" stroke-width="${W}" ${extra}/>`);
    const isHalf = y => Math.abs(y - half) < 1e-6;
    const mirror = y => L - (ez + y);

    // Fondo, end zone, perimetro, linee di meta
    out.push(`<rect x="0" y="0" width="${L}" height="${H}" fill="var(--turf,#0a5d27)"/>`);
    if (ez > 0) {
      out.push(`<rect x="0" y="0" width="${ez}" height="${H}" fill="var(--endzone,#06421c)" fill-opacity=".7"/>`);
      out.push(`<rect x="${L - ez}" y="0" width="${ez}" height="${H}" fill="var(--endzone,#06421c)" fill-opacity=".7"/>`);
    }
    out.push(`<rect x="0" y="0" width="${L}" height="${H}" fill="none" stroke="var(--line,#fff)" stroke-width="${W}"/>`);
    line(ez, 0, ez, H); line(L - ez, 0, L - ez, H);

    // Misure (sotto le linee, come nell'originale)
    if (opt.meters || opt.yards) out.push(measurements(cfg, opt, pad, uid));

    // Linee continue e tratteggiate
    for (const y of cfg.continuous || []) {
      line(ez + y, 0, ez + y, H);
      if (!isHalf(y)) line(mirror(y), 0, mirror(y), H);
    }
    for (const y of cfg.dashed || []) {
      line(ez + y, 0, ez + y, H, 'stroke-dasharray="2 2"');
      if (!isHalf(y)) line(mirror(y), 0, mirror(y), H, 'stroke-dasharray="2 2"');
    }

    // Linee "numerate": multipli di 10 sotto metà campo + metà campo
    const numbered = (cfg.continuous || []).filter(y => y % 10 === 0 || isHalf(y));

    // Hash marks e tacche dei numeri (2 yd centrate sulla linea)
    if (cfg.hashes) {
      for (const y of numbered) {
        const xs = isHalf(y) ? [ez + y] : [ez + y, mirror(y)];
        for (const x of xs) {
          for (const f of cfg.hashes) line(x - 1, H * f, x + 1, H * f);
          if (cfg.numbers && cfg.numberOffset) {
            line(x - 1, cfg.numberOffset, x + 1, cfg.numberOffset);
            line(x - 1, H - cfg.numberOffset, x + 1, H - cfg.numberOffset);
          }
        }
      }
    }

    // Hash centrale (Master)
    if (cfg.centerHash) line(L / 2 - 1, H / 2, L / 2 + 1, H / 2);

    // Marker Flag
    if (cfg.flagMarkers) {
      const { distanceFromGoal: d, length: len } = cfg.flagMarkers;
      const y = H / 2 - len / 2;
      out.push(`<rect x="${ez + d}" y="${y}" width="${W}" height="${len}" fill="var(--line,#fff)"/>`);
      out.push(`<rect x="${L - ez - d}" y="${y}" width="${W}" height="${len}" fill="var(--line,#fff)"/>`);
    }

    // Aree tecniche
    if (cfg.tech) {
      const { startYard: s, depth: d, offset: o } = cfg.tech;
      const x = ez + s, w = play - 2 * s;
      out.push(`<g stroke="var(--line,#fff)" stroke-width="${W}" fill="none">
        <rect x="${x}" y="${-o - d}" width="${w}" height="${d}"/>
        <rect x="${x}" y="${H + o}" width="${w}" height="${d}"/></g>`);
    }

    // Numeri: leggibili dalla rispettiva sideline (in basso dritti, in alto ruotati di 180°)
    if (cfg.numbers && opt.numbers && cfg.numberOffset) {
      const g = ['<g fill="var(--line,#fff)" font-size="2.8" font-weight="700" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif">'];
      for (const y of numbered) {
        const label = isHalf(y) ? 50 : y;
        const xs = isHalf(y) ? [ez + y] : [ez + y, mirror(y)];
        for (const x of xs) {
          const yb = H - cfg.numberOffset - 2, yt = cfg.numberOffset + 2;
          g.push(`<text x="${x}" y="${yb}">${label}</text>`);
          g.push(`<text x="${x}" y="${yt}" transform="rotate(180 ${x} ${yt})">${label}</text>`);
        }
      }
      g.push('</g>');
      out.push(g.join(''));
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" preserveAspectRatio="xMidYMid meet"
      role="img" aria-label="Tracciato campo ${cfg.label}">
      <defs><marker id="${uid}-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" fill="var(--dim,#facc15)"/></marker></defs>
      ${out.join('\n')}
      ${opt.overlay ? `<g class="overlay">${opt.overlay(geometry(cfg))}</g>` : ''}</svg>`;
  }

  function measurements(cfg, opt, pad, uid) {
    const { totalLength: L, totalWidth: H, endzoneDepth: ez } = cfg;
    const play = L - 2 * ez;
    const fmt = v => {
      const r = +v.toFixed(2);
      const m = (v * YD_TO_M).toFixed(2) + 'm', y = r + 'yd';
      return opt.meters && opt.yards ? `${m} / ${y}` : opt.meters ? m : y;
    };
    const el = [];
    const ts = 'fill="var(--dim,#facc15)" font-size="2.8" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif"';
    const ls = 'stroke="var(--dim,#facc15)" stroke-width=".25"';
    const arrows = `marker-start="url(#${uid}-arrow)" marker-end="url(#${uid}-arrow)"`;
    const dash = 'stroke-dasharray="1 1"';
    const dim = (v, p1, p2, off, dir) => {
      if (dir === 'h') {
        const y = p1.y + off, ty = y + (off > 0 ? 3 : -2);
        el.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${p1.x}" y2="${y}" ${ls} ${dash}/>`,
                `<line x1="${p2.x}" y1="${p2.y}" x2="${p2.x}" y2="${y}" ${ls} ${dash}/>`,
                `<line x1="${p1.x}" y1="${y}" x2="${p2.x}" y2="${y}" ${ls} ${arrows}/>`,
                `<text x="${(p1.x + p2.x) / 2}" y="${ty}" ${ts}>${fmt(v)}</text>`);
      } else {
        const x = p1.x + off, tx = x + (off > 0 ? 4 : -2.5), my = (p1.y + p2.y) / 2;
        el.push(`<line x1="${p1.x}" y1="${p1.y}" x2="${x}" y2="${p1.y}" ${ls} ${dash}/>`,
                `<line x1="${p2.x}" y1="${p2.y}" x2="${x}" y2="${p2.y}" ${ls} ${dash}/>`,
                `<line x1="${x}" y1="${p1.y}" x2="${x}" y2="${p2.y}" ${ls} ${arrows}/>`,
                `<text x="${tx}" y="${my}" transform="rotate(90 ${tx} ${my})" ${ts}>${fmt(v)}</text>`);
      }
    };

    dim(L, { x: 0, y: 0 }, { x: L, y: 0 }, -pad / 2, 'h');
    dim(H, { x: L, y: 0 }, { x: L, y: H }, pad / 2, 'v');
    dim(play, { x: ez, y: H }, { x: L - ez, y: H }, pad / 2.5, 'h');
    if (ez > 0) dim(ez, { x: 0, y: H / 4 }, { x: ez, y: H / 4 }, -4, 'h');

    if (cfg.tech) {
      const { startYard: s, depth: d, offset: o } = cfg.tech;
      const x = ez + s, w = play - 2 * s, tx = x + w / 2;
      el.push(`<text x="${tx}" y="${-o - d / 2}" ${ts}>${fmt(w)}</text>`,
              `<text x="${tx}" y="${H + o + d / 2}" ${ts}>${fmt(w)}</text>`);
      dim(d, { x: x + w, y: -o - d }, { x: x + w, y: -o }, 4, 'v');
    }
    if (cfg.hashes && cfg.hashes.length >= 2) {
      const mx = L - ez + 5, [a, b] = cfg.hashes;
      dim(H * a, { x: mx, y: 0 }, { x: mx, y: H * a }, 4, 'v');
      dim(H * (b - a), { x: mx, y: H * a }, { x: mx, y: H * b }, 4, 'v');
      dim(H * (1 - b), { x: mx, y: H * b }, { x: mx, y: H }, 4, 'v');
    }
    if (cfg.numbers && cfg.numberOffset) {
      const mx = ez - 5, n = cfg.numberOffset;
      dim(n, { x: mx, y: 0 }, { x: mx, y: n }, -4, 'v');
      dim(H - 2 * n, { x: mx, y: n }, { x: mx, y: H - n }, -4, 'v');
      dim(n, { x: mx, y: H - n }, { x: mx, y: H }, -4, 'v');
    }
    dim(H / 2, { x: 0, y: 0 }, { x: 0, y: H / 2 }, -6, 'v');
    dim(H / 2, { x: 0, y: H / 2 }, { x: 0, y: H }, -6, 'v');
    return `<g>${el.join('')}</g>`;
  }


  root.FieldEngine = { PRESETS, CUSTOM_DEFAULTS, buildCustom, geometry, renderField };
})(typeof window !== 'undefined' ? window : globalThis);
