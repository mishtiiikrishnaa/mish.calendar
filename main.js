"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// calendar-src/core.js
var require_core = __commonJS({
  "calendar-src/core.js"(exports2, module2) {
    "use strict";
    var pad = (n) => String(n).padStart(2, "0");
    var dateKey = (y, m, d) => String(y).padStart(4, "0") + "-" + pad(m) + "-" + pad(d);
    var todayKey2 = (now = /* @__PURE__ */ new Date()) => dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
    function calendarDate2(y, m, d) {
      if (!Number.isInteger(y) || y < 1 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 31) return null;
      const v = /* @__PURE__ */ new Date(0);
      v.setUTCHours(12, 0, 0, 0);
      v.setUTCFullYear(y, m - 1, d);
      return v.getUTCFullYear() === y && v.getUTCMonth() === m - 1 && v.getUTCDate() === d ? v : null;
    }
    function parseDate2(value, formats = [], moment2 = null) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (Array.isArray(item)) continue;
          const key = parseDate2(item, formats, moment2);
          if (key) return key;
        }
        return null;
      }
      if (Object.prototype.toString.call(value) === "[object Date]") {
        return Number.isFinite(value.getTime()) ? dateKey(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()) : null;
      }
      if (typeof value !== "string") return null;
      const str = value.trim();
      const match = /^(\d{4})-(\d{2})-(\d{2})(?:[Tt ]([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d{1,9})?)?(?:\s?(?:[Zz]|[+-](?:[01]\d|2[0-3]):?[0-5]\d))?)?$/.exec(str);
      if (match && calendarDate2(+match[1], +match[2], +match[3])) return match[1] + "-" + match[2] + "-" + match[3];
      if (moment2 && formats.length && str) {
        const parsed = moment2(str, formats, true);
        if (parsed.isValid()) {
          const key = dateKey(parsed.year(), parsed.month() + 1, parsed.date());
          if (calendarDate2(parsed.year(), parsed.month() + 1, parsed.date())) return key;
        }
      }
      return null;
    }
    var lines2 = (v) => String(v || "").split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
    var folderList = (v) => lines2(v).map((x) => x.replace(/\\/g, "/").replace(/^\/+|\/+$/g, ""));
    var inside = (path, folder) => folder === "" || path === folder || path.startsWith(folder + "/");
    function inScope(path, settings) {
      const include = folderList(settings.includeFolders), exclude = folderList(settings.excludeFolders);
      return (!include.length || include.some((f) => inside(path, f))) && !exclude.some((f) => inside(path, f));
    }
    var slug = (v) => String(v).toLowerCase().replace(/[\s_-]+/g, "_");
    function findKey(frontmatter, name) {
      if (Object.prototype.hasOwnProperty.call(frontmatter, name)) return name;
      const want = slug(name);
      return Object.keys(frontmatter).find((k) => slug(k) === want);
    }
    function resolveDate(frontmatter, settings, moment2) {
      if (!frontmatter || typeof frontmatter !== "object") return null;
      const properties = lines2(settings.properties).length ? lines2(settings.properties) : ["created", "date"];
      const formats = String(settings.dateFormats || "").split("\n").map((x) => x.trim()).filter(Boolean);
      for (const name of properties) {
        const actual = findKey(frontmatter, name);
        if (actual === void 0) continue;
        const key = parseDate2(frontmatter[actual], formats, moment2);
        if (key) return { key, property: actual };
      }
      return null;
    }
    function parseDates2(value, formats = [], moment2 = null) {
      const out = [];
      for (const item of Array.isArray(value) ? value : [value]) {
        if (Array.isArray(item)) continue;
        const key = parseDate2(item, formats, moment2);
        if (key && !out.includes(key)) out.push(key);
      }
      return out;
    }
    function resolveTracked2(frontmatter, settings, moment2) {
      if (!frontmatter || typeof frontmatter !== "object") return [];
      const formats = String(settings.dateFormats || "").split("\n").map((x) => x.trim()).filter(Boolean);
      const out = [];
      for (const name of lines2(settings.trackProperties)) {
        const actual = findKey(frontmatter, name);
        if (actual === void 0) continue;
        for (const key of parseDates2(frontmatter[actual], formats, moment2)) out.push({ key, property: actual });
      }
      return out;
    }
    function shiftDay2(key, days) {
      const [y, m, d] = key.split("-").map(Number);
      const date = calendarDate2(y, m, d);
      if (!date) return key;
      date.setUTCDate(date.getUTCDate() + days);
      if (date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) return key;
      return dateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }
    function shiftMonth2(key, months) {
      const [y, m, d] = key.split("-").map(Number);
      let total = y * 12 + (m - 1) + months;
      const year = Math.floor(total / 12), month = (total % 12 + 12) % 12 + 1;
      if (year < 1 || year > 9999) return key;
      let day = d;
      while (day > 1 && !calendarDate2(year, month, day)) day--;
      return dateKey(year, month, day);
    }
    function monthGrid2(monthKey, weekStart = 1) {
      const [y, m] = monthKey.split("-").map(Number);
      const first = calendarDate2(y, m, 1);
      if (!first) return [];
      let days = 31;
      while (!calendarDate2(y, m, days)) days--;
      const offset = (first.getUTCDay() - weekStart + 7) % 7;
      const cells = Math.ceil((offset + days) / 7) * 7;
      return Array.from({ length: cells }, (_, i) => {
        const d = i - offset + 1;
        return d >= 1 && d <= days ? dateKey(y, m, d) : null;
      });
    }
    var NoteIndex2 = class {
      constructor(moment2 = null) {
        this.moment = moment2;
        this.records = /* @__PURE__ */ new Map();
        this.byDay = /* @__PURE__ */ new Map();
        this.undated = /* @__PURE__ */ new Map();
      }
      remove(path) {
        const old = this.records.get(path);
        if (old) for (const key of old.days.keys()) {
          const bucket = this.byDay.get(key);
          if (bucket) {
            bucket.delete(path);
            if (!bucket.size) this.byDay.delete(key);
          }
        }
        this.records.delete(path);
        this.undated.delete(path);
      }
      upsert(file, frontmatter, settings) {
        this.remove(file.path);
        if (String(file.extension).toLowerCase() !== "md" || !inScope(file.path, settings)) return;
        const date = resolveDate(frontmatter, settings, this.moment);
        const record = { path: file.path, name: file.basename, key: date ? date.key : null, property: date ? date.property : null, tracked: [], days: /* @__PURE__ */ new Map() };
        const entry = (key) => {
          if (!record.days.has(key)) record.days.set(key, { path: file.path, name: file.basename, key, property: null, tracked: [] });
          return record.days.get(key);
        };
        if (date) entry(date.key).property = date.property;
        for (const t of resolveTracked2(frontmatter, settings, this.moment)) {
          const e = entry(t.key);
          if (e.property !== t.property && !e.tracked.includes(t.property)) e.tracked.push(t.property);
        }
        this.records.set(file.path, record);
        if (!record.days.size) {
          this.undated.set(file.path, record);
          return;
        }
        for (const [key, e] of record.days) {
          if (!this.byDay.has(key)) this.byDay.set(key, /* @__PURE__ */ new Map());
          this.byDay.get(key).set(file.path, e);
        }
      }
      rebuild(files, frontmatterFor, settings) {
        this.records.clear();
        this.byDay.clear();
        this.undated.clear();
        for (const file of files) this.upsert(file, frontmatterFor(file), settings);
      }
      count(key) {
        return this.byDay.get(key)?.size || 0;
      }
      notes(key) {
        return this.sort(Array.from(this.byDay.get(key)?.values() || []));
      }
      sort(records) {
        return records.sort((a, b) => a.name.localeCompare(b.name, void 0, { numeric: true }) || a.path.localeCompare(b.path));
      }
      summary(month) {
        let notes = 0, days = 0, peak = 0;
        for (const [key, bucket] of this.byDay) if (key.startsWith(month + "-")) {
          notes += bucket.size;
          days++;
          peak = Math.max(peak, bucket.size);
        }
        return { notes, days, peak };
      }
    };
    module2.exports = { pad, dateKey, todayKey: todayKey2, calendarDate: calendarDate2, parseDate: parseDate2, lines: lines2, inScope, resolveDate, resolveTracked: resolveTracked2, parseDates: parseDates2, shiftDay: shiftDay2, shiftMonth: shiftMonth2, monthGrid: monthGrid2, NoteIndex: NoteIndex2 };
  }
});

// calendar-src/appearance.js
var require_appearance = __commonJS({
  "calendar-src/appearance.js"(exports2, module2) {
    "use strict";
    var DARK2 = ["#ffa6c9", "#ffd6a6", "#fff1a8", "#c9ffa6", "#a6c9ff", "#c9b0ff"];
    var LIGHT2 = ["#ff8fb8", "#ffb27a", "#ffd54f", "#8ee07f", "#82b4ff", "#b79bff"];
    var NAMES2 = ["pink", "peach", "yellow", "green", "blue", "lilac"];
    var PRESETS2 = {
      catppuccin: ["#f5c2e7", "#fab387", "#f9e2af", "#a6e3a1", "#89b4fa", "#cba6f7"],
      dracula: ["#ff79c6", "#ffb86c", "#f1fa8c", "#50fa7b", "#8be9fd", "#bd93f9"],
      nord: ["#bf616a", "#d08770", "#ebcb8b", "#a3be8c", "#81a1c1", "#b48ead"],
      gruvbox: ["#fb4934", "#fe8019", "#fabd2f", "#b8bb26", "#83a598", "#d3869b"],
      ocean: ["#c4f1f9", "#7fe0e8", "#6fd3c2", "#7bc6f0", "#82a8ff", "#a98bff"],
      sunset: ["#ff8fa3", "#ff9e6b", "#ffc15e", "#ff7eb6", "#e08bff", "#b794ff"],
      forest: ["#e6c9a8", "#d9b26f", "#e3e08a", "#9fd58a", "#6fc2a0", "#7fa8c9"],
      greyscale: ["#f5f5f5", "#dcdcdc", "#c4c4c4", "#a8a8a8", "#8c8c8c", "#707070"]
    };
    var HEX2 = /^#[0-9a-f]{6}$/i;
    var DEFAULTS2 = {
      lowercaseUi: true,
      username: "",
      pills: { user: true, vault: true, month: true },
      pillShape: "arrow",
      palette: { preset: "theme", colours: DARK2.slice() },
      inkColour: "",
      card: { width: "fit", hAlign: "centre", vAlign: "top", ring: "palette", ringWidth: 1, radius: 10, pad: 10 },
      font: "theme",
      customFont: "",
      fontSize: 12,
      properties: "created, date",
      trackProperties: "attempted_on, redone_on",
      dateFormats: "",
      includeFolders: "",
      excludeFolders: "",
      weekStart: 1,
      heatmap: true,
      showZero: false,
      showSummary: true,
      showFolders: true,
      compact: true,
      animate: true,
      listLimit: 12,
      followActive: false,
      sidebar: "right",
      openOnStart: true,
      styleRev: 4
    };
    var clone2 = (v) => JSON.parse(JSON.stringify(v));
    var plain = (v) => !!v && typeof v === "object" && !Array.isArray(v);
    var clamp = (v, min, max, fallback) => Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Number(v))) : fallback;
    function settingsFrom2(saved) {
      const out = clone2(DEFAULTS2);
      const revision = plain(saved) && Number.isFinite(Number(saved.styleRev)) ? Number(saved.styleRev) : 0;
      const migrate = plain(saved) && revision < 2;
      if (plain(saved)) for (const key of Object.keys(out)) {
        if (plain(out[key])) {
          if (plain(saved[key])) {
            for (const sub of Object.keys(out[key])) if (saved[key][sub] !== void 0) out[key][sub] = saved[key][sub];
          }
        } else if (saved[key] !== void 0) out[key] = saved[key];
      }
      for (const key of ["lowercaseUi", "heatmap", "showZero", "showSummary", "showFolders", "compact", "animate", "followActive", "openOnStart"]) out[key] = typeof out[key] === "boolean" ? out[key] : DEFAULTS2[key];
      for (const key of ["username", "customFont", "properties", "trackProperties", "dateFormats", "includeFolders", "excludeFolders"]) out[key] = typeof out[key] === "string" ? out[key] : DEFAULTS2[key];
      for (const key of Object.keys(out.pills)) out.pills[key] = typeof out.pills[key] === "boolean" ? out.pills[key] : true;
      if (!["arrow", "round", "flat"].includes(out.pillShape)) out.pillShape = "arrow";
      if (!["theme", "bundled", "obsidian", "system", "custom"].includes(out.font)) out.font = "theme";
      if (!["left", "right"].includes(out.sidebar)) out.sidebar = "right";
      out.weekStart = [0, 1, 6].includes(Number(out.weekStart)) ? Number(out.weekStart) : 1;
      if (migrate) {
        out.card.radius = DEFAULTS2.card.radius;
        out.card.pad = DEFAULTS2.card.pad;
        out.fontSize = DEFAULTS2.fontSize;
      }
      if (plain(saved) && revision < 3) out.compact = true;
      if (plain(saved) && revision < 4 && String(out.trackProperties).trim().toLowerCase() === "attempted_on") out.trackProperties = DEFAULTS2.trackProperties;
      out.styleRev = 4;
      out.fontSize = clamp(out.fontSize, 11, 18, 12);
      out.listLimit = Math.round(clamp(out.listLimit, 5, 100, 12));
      if (!["fit", "full"].includes(out.card.width)) out.card.width = "fit";
      if (!["top", "centre"].includes(out.card.vAlign)) out.card.vAlign = "top";
      if (!["left", "centre"].includes(out.card.hAlign)) out.card.hAlign = "centre";
      if (!["palette", "accent", "subtle", "none"].includes(out.card.ring)) out.card.ring = "palette";
      for (const [key, lo, hi] of [["ringWidth", 1, 4], ["radius", 0, 28], ["pad", 0, 32]]) out.card[key] = clamp(out.card[key], lo, hi, DEFAULTS2.card[key]);
      if (!["theme", "custom", ...Object.keys(PRESETS2)].includes(out.palette.preset)) out.palette.preset = "theme";
      if (!Array.isArray(out.palette.colours) || out.palette.colours.length !== 6 || !out.palette.colours.every((c) => HEX2.test(c))) out.palette.colours = DARK2.slice();
      if (!HEX2.test(out.inkColour)) out.inkColour = "";
      return out;
    }
    function applyLook2(root, s) {
      const vars = {};
      if (s.palette.preset !== "theme") s.palette.colours.forEach((c, i) => {
        vars["--mc-c" + i] = c;
      });
      if (s.inkColour) vars["--mc-ink"] = s.inkColour;
      const fonts = {
        theme: 'var(--vf-mono, "mish calendar mono", ui-monospace, monospace)',
        bundled: '"mish calendar mono", ui-monospace, monospace',
        obsidian: "var(--font-monospace), ui-monospace, monospace",
        system: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        custom: (s.customFont.trim() || "ui-monospace") + ", monospace"
      };
      vars["--mc-font"] = fonts[s.font];
      vars["--mc-font-size"] = s.fontSize + "px";
      vars["--mc-radius"] = s.card.radius + "px";
      vars["--mc-pad"] = s.card.pad + "px";
      vars["--mc-ring-width"] = (s.card.ring === "none" ? 0 : s.card.ringWidth) + "px";
      for (const key of root.__mcVars || []) if (!(key in vars)) root.style.removeProperty(key);
      for (const [key, val] of Object.entries(vars)) root.style.setProperty(key, val);
      root.__mcVars = Object.keys(vars);
      root.dataset.shape = s.pillShape;
      root.dataset.ring = s.card.ring;
      root.dataset.width = s.card.width;
      root.dataset.horizontal = s.card.hAlign;
      root.dataset.vertical = s.card.vAlign;
      root.classList.toggle("mc-compact", s.compact);
      root.classList.toggle("mc-no-motion", !s.animate);
    }
    module2.exports = { DARK: DARK2, LIGHT: LIGHT2, NAMES: NAMES2, PRESETS: PRESETS2, HEX: HEX2, DEFAULTS: DEFAULTS2, clone: clone2, settingsFrom: settingsFrom2, applyLook: applyLook2 };
  }
});

// calendar-src/main.js
var { Plugin, ItemView, PluginSettingTab, Setting, Notice, Platform, moment } = require("obsidian");
var { NoteIndex, todayKey, calendarDate, parseDate, shiftDay, shiftMonth, monthGrid, lines } = require_core();
var { DEFAULTS, DARK, LIGHT, NAMES, PRESETS, HEX, clone, settingsFrom, applyLook } = require_appearance();
var VIEW = "mish-calendar-view";
var MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
var WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
var FULL_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
var noteWord = (n) => n === 1 ? "note" : "notes";
var tier = (n) => n < 1 ? -1 : n === 1 ? 0 : n === 2 ? 1 : n === 3 ? 2 : n < 6 ? 3 : n < 10 ? 4 : 5;
var monthLabel = (key) => MONTHS[Number(key.slice(5, 7)) - 1] + " " + key.slice(0, 4);
var dayLabel = (key) => Number(key.slice(8, 10)) + " " + MONTHS[Number(key.slice(5, 7)) - 1].slice(0, 3) + " " + key.slice(0, 4);
function el(doc, tag, cls, text) {
  const node = doc.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}
function button(doc, cls, text, label, onClick, focus) {
  const b = el(doc, "button", cls, text);
  b.type = "button";
  b.setAttribute("aria-label", label);
  b.title = label;
  if (focus) b.dataset.focus = focus;
  b.addEventListener("click", onClick);
  return b;
}
function rainbowBar(doc, scroller) {
  const parent = scroller.parentElement;
  const sb = el(doc, "div", "mc-sb");
  const thumb = el(doc, "div", "mc-sb-thumb");
  sb.append(thumb);
  parent.append(sb);
  const update = () => {
    const { scrollHeight, clientHeight, scrollTop, offsetTop, offsetHeight } = scroller;
    if (!offsetHeight || scrollHeight <= clientHeight + 1) {
      sb.style.display = "none";
      return;
    }
    sb.style.display = "block";
    sb.style.top = offsetTop + "px";
    sb.style.height = clientHeight + "px";
    const h = Math.max(24, clientHeight * clientHeight / scrollHeight);
    const y = scrollTop / (scrollHeight - clientHeight) * (clientHeight - h);
    thumb.style.height = h + "px";
    thumb.style.transform = "translateY(" + y + "px)";
  };
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  };
  scroller.addEventListener("scroll", schedule, { passive: true });
  new ResizeObserver(schedule).observe(scroller);
  new MutationObserver(schedule).observe(scroller, { childList: true, subtree: true, characterData: true });
  sb.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startTop = scroller.scrollTop;
    const ratio = (scroller.scrollHeight - scroller.clientHeight) / Math.max(1, scroller.clientHeight - thumb.offsetHeight);
    sb.setPointerCapture(e.pointerId);
    const move = (ev) => {
      scroller.scrollTop = startTop + (ev.clientY - startY) * ratio;
    };
    const up = () => {
      sb.removeEventListener("pointermove", move);
      sb.removeEventListener("pointerup", up);
      sb.removeEventListener("pointercancel", up);
    };
    sb.addEventListener("pointermove", move);
    sb.addEventListener("pointerup", up);
    sb.addEventListener("pointercancel", up);
  });
  schedule();
}
function command(doc, text, arg) {
  const row = el(doc, "div", "mc-command");
  const arrow = el(doc, "span", "mc-chevron", "\u276F");
  arrow.setAttribute("aria-hidden", "true");
  row.append(arrow, el(doc, "span", "mc-executable", text));
  if (arg) row.append(el(doc, "span", "mc-argument", arg));
  return row;
}
function identity() {
  try {
    return require("os").userInfo().username.toLowerCase();
  } catch (_) {
    return "user";
  }
}
function osGlyph() {
  return Platform.isMacOS ? "\uF179" : Platform.isWin ? "\uF17A" : "\uF17C";
}
var CalendarView = class extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.selected = todayKey();
    this.month = this.selected.slice(0, 7);
    this.mode = "day";
    this.help = false;
    this.visibleNotes = plugin.settings.listLimit;
  }
  getViewType() {
    return VIEW;
  }
  getDisplayText() {
    return "calendar";
  }
  getIcon() {
    return "calendar-days";
  }
  getState() {
    return { month: this.month, selected: this.selected };
  }
  async setState(state, result) {
    const key = parseDate(state?.selected);
    if (key) {
      this.selected = key;
      this.month = key.slice(0, 7);
    }
    if (this.card) this.render();
    await super.setState(state, result);
  }
  async onOpen() {
    this.doc = this.contentEl.ownerDocument;
    this.contentEl.replaceChildren();
    this.contentEl.classList.add("mc-root");
    this.scroll = el(this.doc, "div", "mc-scroll");
    this.card = el(this.doc, "section", "mc-card");
    this.card.setAttribute("aria-label", "notes by creation date");
    this.scroll.append(this.card);
    this.contentEl.append(this.scroll);
    rainbowBar(this.doc, this.scroll);
    this.plugin.views.add(this);
    this.render();
  }
  async onClose() {
    this.plugin.views.delete(this);
    this.contentEl.replaceChildren();
    this.card = null;
  }
  applyLook() {
    applyLook(this.contentEl, this.plugin.settings);
  }
  select(key, focusDay = false) {
    this.selected = key;
    this.month = key.slice(0, 7);
    this.mode = "day";
    this.visibleNotes = this.plugin.settings.listLimit;
    this.render(focusDay ? "day-" + key : void 0);
    this.app.workspace.requestSaveLayout();
  }
  moveMonth(delta, focusDay = false) {
    this.select(shiftMonth(this.selected, delta), focusDay);
  }
  render(focusOverride) {
    if (!this.card) return;
    const active = this.doc.activeElement;
    const focus = focusOverride || (this.card.contains(active) ? active.dataset.focus : null);
    const oldScroll = this.scroll.scrollTop;
    const s = this.plugin.settings, doc = this.doc, card = this.card, index = this.plugin.index;
    this.applyLook();
    card.replaceChildren();
    const bar = el(doc, "div", "mc-bar");
    const segments = [];
    if (s.pills.user) segments.push(["mc-user", s.username || this.plugin.detected]);
    if (s.pills.vault) segments.push(["mc-path", "~/" + this.app.vault.getName()]);
    if (s.pills.month) {
      if (segments.length) segments.push(["mc-bridge mc-bridge-2", ""], ["mc-bridge mc-bridge-3", ""], ["mc-bridge mc-bridge-4", ""]);
      segments.push(["mc-month-pill", MONTHS[Number(this.month.slice(5)) - 1].slice(0, 3) + " " + this.month.slice(2, 4)]);
    }
    segments.forEach(([cls, text], i) => {
      const seg = el(doc, "span", "mc-segment " + cls);
      seg.style.zIndex = String(segments.length - i);
      if (cls === "mc-user" || cls === "mc-month-pill") {
        const logo = el(doc, "span", "mc-os", cls === "mc-user" ? osGlyph() : "\uF43A");
        logo.setAttribute("aria-hidden", "true");
        seg.append(logo);
      }
      const label = el(doc, "span", "mc-segment-label", text);
      seg.append(label);
      seg.title = text;
      if (cls.includes("mc-bridge")) seg.setAttribute("aria-hidden", "true");
      bar.append(seg);
    });
    if (segments.length) card.append(bar);
    card.append(command(doc, "cal", "--notes"));
    const nav = el(doc, "div", "mc-nav");
    nav.append(button(doc, "mc-nav-button", "\u2039", "previous month; shift-click for previous year", (e) => this.moveMonth(e.shiftKey ? -12 : -1), "prev"));
    const title = el(doc, "h3", "mc-month-title", monthLabel(this.month));
    title.id = this.plugin.nextId("month");
    nav.append(title, button(doc, "mc-nav-button", "\u203A", "next month; shift-click for next year", (e) => this.moveMonth(e.shiftKey ? 12 : 1), "next"));
    card.append(nav);
    const grid = el(doc, "div", "mc-grid");
    grid.setAttribute("role", "grid");
    grid.setAttribute("aria-labelledby", title.id);
    const headers = el(doc, "div", "mc-week mc-week-head");
    headers.setAttribute("role", "row");
    for (let i = 0; i < 7; i++) {
      const n = (i + s.weekStart) % 7;
      const h = el(doc, "span", "mc-weekday", WEEKDAYS[n]);
      h.setAttribute("role", "columnheader");
      h.setAttribute("aria-label", FULL_DAYS[n]);
      if (n === 0 || n === 6) h.classList.add("mc-weekend");
      headers.append(h);
    }
    grid.append(headers);
    const days = monthGrid(this.month, s.weekStart), today = todayKey();
    for (let start = 0; start < days.length; start += 7) {
      const row = el(doc, "div", "mc-week");
      row.setAttribute("role", "row");
      for (const key of days.slice(start, start + 7)) {
        const cell = el(doc, "div", "mc-cell");
        cell.setAttribute("role", "gridcell");
        if (key) {
          const n = index.count(key), selected = key === this.selected && this.mode === "day";
          cell.setAttribute("aria-selected", String(selected));
          const day = button(doc, "mc-day", null, dayLabel(key) + ": " + n + " " + noteWord(n), () => this.select(key, true), "day-" + key);
          day.tabIndex = key === this.selected ? 0 : -1;
          day.dataset.date = key;
          day.dataset.level = String(s.heatmap ? tier(n) : -1);
          day.classList.toggle("is-selected", selected);
          day.classList.toggle("is-today", key === today);
          if (key === today) day.setAttribute("aria-current", "date");
          day.append(el(doc, "span", "mc-day-number", String(Number(key.slice(8)))));
          const count = el(doc, "span", "mc-day-count", n || s.showZero ? String(n) : "\xB7");
          count.setAttribute("aria-hidden", "true");
          day.append(count);
          day.addEventListener("keydown", (event) => this.keyNavigate(event, key));
          cell.append(day);
        } else {
          cell.classList.add("mc-cell-empty");
          cell.setAttribute("aria-disabled", "true");
        }
        row.append(cell);
      }
      grid.append(row);
    }
    card.append(grid);
    if (s.showSummary) {
      const summary = el(doc, "div", "mc-summary"), totals = index.summary(this.month);
      for (const [label, value] of Object.entries(totals)) {
        const pair = el(doc, "div", "mc-stat");
        pair.append(el(doc, "span", "mc-stat-label", label), el(doc, "strong", "mc-stat-value", String(value)));
        summary.append(pair);
      }
      summary.setAttribute("aria-label", "month totals");
      card.append(summary);
    }
    const details = el(doc, "section", "mc-details");
    const records = this.mode === "undated" ? index.sort(Array.from(index.undated.values())) : index.notes(this.selected);
    const heading = el(doc, "div", "mc-list-heading");
    const headingText = el(doc, "h4", "mc-date-title", this.mode === "undated" ? "undated" : dayLabel(this.selected));
    headingText.id = this.plugin.nextId("day");
    const badge = el(doc, "span", "mc-count-pill", records.length + " " + noteWord(records.length));
    heading.append(headingText, badge);
    details.append(heading);
    details.setAttribute("aria-labelledby", headingText.id);
    const list = el(doc, "ul", "mc-note-list");
    records.slice(0, this.visibleNotes).forEach((record) => {
      const li = el(doc, "li", "mc-note-item");
      const via = [record.property, ...record.tracked].filter(Boolean);
      const link = button(doc, "mc-note", null, record.path + " \xB7 " + (via.length ? via.join(", ") : "no valid date"), (event) => this.openNote(record.path, event), "note-" + record.path);
      const mark = el(doc, "span", "mc-note-mark", "\xB7");
      mark.setAttribute("aria-hidden", "true");
      const text = el(doc, "span", "mc-note-text");
      text.append(el(doc, "span", "mc-note-name", record.name));
      const folder = record.path.includes("/") ? record.path.slice(0, record.path.lastIndexOf("/")) : "~/";
      if (s.showFolders) text.append(el(doc, "span", "mc-note-folder", folder));
      link.append(mark, text);
      if (record.tracked.length) link.append(el(doc, "span", "mc-note-tag", record.tracked.map((p) => p.replace(/[_-]+/g, " ")).join(", ")));
      li.append(link);
      list.append(li);
    });
    if (!records.length) {
      details.append(el(doc, "p", "mc-empty", this.mode === "undated" ? "every note has a usable date." : "no notes dated this day."));
    } else details.append(list);
    if (records.length > this.visibleNotes) details.append(button(doc, "mc-text-button mc-more", "show more (" + (records.length - this.visibleNotes) + ")", "show more notes", () => {
      this.visibleNotes += s.listLimit;
      this.render();
    }, "more"));
    card.append(details);
    const footer = el(doc, "div", "mc-footer");
    const prompt = el(doc, "span", "mc-footer-prompt");
    prompt.setAttribute("aria-hidden", "true");
    prompt.append(el(doc, "span", "mc-chevron", "\u276F"), el(doc, "span", "mc-caret"));
    footer.append(prompt);
    footer.append(button(doc, "mc-text-button", "today", "go to today", () => this.select(todayKey()), "today"));
    footer.append(button(doc, "mc-text-button", "undated " + index.undated.size, "show notes with no usable date property", () => {
      this.mode = "undated";
      this.visibleNotes = s.listLimit;
      this.render();
    }, "undated"));
    const help = button(doc, "mc-text-button", "help", "show calendar help", () => {
      this.help = !this.help;
      this.render();
    }, "help");
    help.setAttribute("aria-expanded", String(this.help));
    footer.append(help);
    card.append(footer);
    if (this.help) {
      const info = el(doc, "div", "mc-help");
      const source = lines(s.properties).length ? lines(s.properties) : ["created", "date"];
      info.append(el(doc, "p", "", "one note, one main day. first valid property: " + source.join(" \u2192 ") + "."));
      const tracked = lines(s.trackProperties);
      if (tracked.length) info.append(el(doc, "p", "", "also tracked: " + tracked.join(", ") + ". a note shows on each of those days too, with a small tag. a list of dates counts every date."));
      info.append(el(doc, "p", "", "the small number is the note count. click a day to see its notes. today has an underline; your selected day has an outline."));
      info.append(el(doc, "p", "", "arrow keys move by day or week. page up/down changes month; shift changes year. \u2318-click opens a note in a new tab."));
      info.append(el(doc, "p", "", "use YYYY-MM-DD or an ISO timestamp. the written calendar day is kept. add other formats in settings; undated includes missing or invalid values."));
      card.append(info);
    }
    const live = el(doc, "span", "mc-sr-only", monthLabel(this.month) + ", " + records.length + " " + noteWord(records.length) + " " + (this.mode === "undated" ? "without dates" : "on " + dayLabel(this.selected)));
    live.setAttribute("aria-live", "polite");
    card.append(live);
    if (focus) {
      for (const node of card.querySelectorAll("[data-focus]")) if (node.dataset.focus === focus) {
        node.focus({ preventScroll: true });
        break;
      }
    }
    this.scroll.scrollTop = oldScroll;
  }
  keyNavigate(event, key) {
    let next;
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in offsets) next = shiftDay(key, offsets[event.key]);
    else if (event.key === "PageUp" || event.key === "PageDown") next = shiftMonth(key, (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1));
    else if (event.key === "Home" || event.key === "End") {
      const [y, m, d] = key.split("-").map(Number);
      const weekday = (calendarDate(y, m, d).getUTCDay() - this.plugin.settings.weekStart + 7) % 7;
      next = shiftDay(key, event.key === "Home" ? -weekday : 6 - weekday);
    }
    if (next) {
      event.preventDefault();
      this.select(next, true);
    }
  }
  async openNote(path, event) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file || file.extension !== "md") {
      new Notice("that note has moved; refreshing the calendar.");
      this.plugin.rebuild();
      return;
    }
    try {
      await this.app.workspace.getLeaf(event.metaKey || event.ctrlKey ? "tab" : false).openFile(file);
    } catch (_) {
      new Notice("could not open " + file.basename);
    }
  }
};
var CalendarSettings = class extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { plugin, containerEl } = this, s = plugin.settings;
    containerEl.replaceChildren();
    containerEl.classList.add("mc-settings");
    const ui = (value) => s.lowercaseUi ? value : value.replace(/^[a-z]/, (v) => v.toUpperCase());
    const setting = (name, desc) => new Setting(containerEl).setName(ui(name)).setDesc(ui(desc || ""));
    const group = (name) => setting(name).setHeading();
    const holder = (g) => g ? s[g] : s;
    const change = (source = false) => plugin.changed(source);
    const text = (g, key, name, desc, placeholder, source = false, multi = false) => {
      const row = setting(name, desc);
      row[multi ? "addTextArea" : "addText"]((c) => c.setPlaceholder(placeholder || "").setValue(holder(g)[key]).onChange((v) => {
        holder(g)[key] = v;
        change(source);
      }));
    };
    const toggle = (g, key, name, desc) => setting(name, desc).addToggle((c) => c.setValue(holder(g)[key]).onChange((v) => {
      holder(g)[key] = v;
      change();
    }));
    const drop = (g, key, name, desc, opts2) => setting(name, desc).addDropdown((c) => c.addOptions(Object.fromEntries(Object.entries(opts2).map(([k, v]) => [k, ui(v)]))).setValue(String(holder(g)[key])).onChange((v) => {
      holder(g)[key] = key === "weekStart" ? Number(v) : v;
      change();
    }));
    const slide = (g, key, name, lo, hi, step) => {
      let slider;
      setting(name).addSlider((c) => {
        slider = c;
        c.setLimits(lo, hi, step).setValue(holder(g)[key]).setDynamicTooltip().onChange((v) => {
          holder(g)[key] = v;
          change();
        });
      }).addExtraButton((b) => b.setIcon("rotate-ccw").setTooltip("reset").onClick(() => {
        const value = g ? DEFAULTS[g][key] : DEFAULTS[key];
        holder(g)[key] = value;
        slider.setValue(value);
        change();
      }));
    };
    setting("lowercase ui", "matches mish.eza and mish.fastfetch; note names keep their original case.").addToggle((c) => c.setValue(s.lowercaseUi).onChange((v) => {
      s.lowercaseUi = v;
      change();
      this.display();
    }));
    group("dates and notes");
    text(null, "properties", "date properties, in order", "the first valid value wins; each note is counted once. names are case-insensitive. an empty list uses created, date.", "created, date", true);
    text(null, "trackProperties", "also track properties", "a note also appears on the days in these properties, on top of its date above. a list of dates counts every date (several attempts). names ignore case, spaces and underscores. empty tracks nothing.", "attempted_on, redone_on", true);
    text(null, "dateFormats", "additional date formats", "ISO dates and timestamps work automatically. add one strict Moment format per line. ambiguous day/month formats are never guessed.", "DD/MM/YYYY\nDD-MM-YYYY", true, true);
    text(null, "includeFolders", "include folders", "empty includes the whole vault. comma-separated folders include their subfolders.", "notes, projects", true, true);
    text(null, "excludeFolders", "exclude folders", "excluded folders and subfolders are omitted from counts and undated.", "templates, archive", true, true);
    setting("rebuild calendar", "re-read cached note properties. this does not change your notes.").addButton((b) => b.setButtonText("rebuild").onClick(() => {
      plugin.rebuild();
      new Notice("calendar refreshed.");
    }));
    group("calendar");
    drop(null, "weekStart", "week starts on", "", { 1: "monday", 0: "sunday", 6: "saturday" });
    toggle(null, "heatmap", "activity colours", "six flat pastel levels: 1, 2, 3, 4\u20135, 6\u20139 and 10+ notes; the exact count stays visible.");
    toggle(null, "showZero", "show zero counts", "off uses a quiet dot for empty days.");
    toggle(null, "showSummary", "month summary", "notes, active days and the busiest day\u2019s count.");
    toggle(null, "showFolders", "folder labels", "show the folder below each note name.");
    toggle(null, "followActive", "follow the active note", "select its property date when you open a note.");
    slide(null, "listLimit", "notes per page", 5, 100, 1);
    drop(null, "sidebar", "open in sidebar", "used when opening a new calendar panel.", { right: "right", left: "left" });
    toggle(null, "openOnStart", "open on startup", "add a panel if none is in your saved layout.");
    group("prompt");
    text(null, "username", "user name", "empty uses your macOS account name.", plugin.detected);
    toggle("pills", "user", "user pill", "your name and operating system logo.");
    toggle("pills", "vault", "vault pill", "the vault path segment.");
    toggle("pills", "month", "month pill", "the visible month, after the three bridge chevrons.");
    drop(null, "pillShape", "pill shape", "", { arrow: "arrow (powerline)", round: "round", flat: "flat" });
    group("colours");
    let preset, refreshing = false;
    const pickers = [], fallback = () => document.body.classList.contains("theme-light") ? LIGHT.slice() : DARK.slice();
    const shown = () => s.palette.preset === "theme" ? fallback() : s.palette.colours;
    const opts = { theme: "mish / follow theme", ...Object.fromEntries(Object.keys(PRESETS).map((k) => [k, k])), custom: "custom" };
    setting("palette", "same presets as mish.eza and mish.fastfetch. the default reads mish.shell\u2019s palette. colours stay flat; light-mode text is darkened.").addDropdown((c) => {
      preset = c;
      c.addOptions(opts).setValue(s.palette.preset).onChange((v) => {
        if (v === "custom" && s.palette.preset === "theme") s.palette.colours = fallback();
        s.palette.preset = v;
        if (PRESETS[v]) s.palette.colours = PRESETS[v].slice();
        refreshing = true;
        pickers.forEach((p, i) => p.setValue(shown()[i]));
        refreshing = false;
        change();
      });
    }).addExtraButton((b) => b.setIcon("rotate-ccw").setTooltip("back to mish").onClick(() => {
      s.palette = clone(DEFAULTS.palette);
      change();
      this.display();
    }));
    NAMES.forEach((name, i) => setting("colour " + (i + 1) + " \xB7 " + name, "prompt segments and activity level " + (i + 1)).addColorPicker((c) => {
      pickers.push(c);
      c.setValue(shown()[i]).onChange((hex) => {
        if (refreshing) return;
        if (s.palette.preset === "theme") s.palette.colours = fallback();
        s.palette.colours[i] = hex;
        s.palette.preset = "custom";
        preset.setValue("custom");
        change();
      });
    }));
    setting("pill text colour", "automatic uses the theme\u2019s dark ink.").addColorPicker((c) => c.setValue(HEX.test(s.inkColour) ? s.inkColour : "#0f0f12").onChange((hex) => {
      s.inkColour = hex;
      change();
    })).addExtraButton((b) => b.setIcon("rotate-ccw").setTooltip("automatic").onClick(() => {
      s.inkColour = "";
      change();
      this.display();
    }));
    group("card and layout");
    drop("card", "width", "card width", "", { fit: "fit (up to 360px)", full: "full sidebar width" });
    drop("card", "hAlign", "horizontal position", "", { centre: "centre", left: "left" });
    drop("card", "vAlign", "vertical position", "", { top: "top", centre: "centre" });
    drop("card", "ring", "border", "palette is the rainbow gradient, same as mish.fastfetch.", { palette: "palette", accent: "accent colour", subtle: "subtle", none: "none" });
    slide("card", "ringWidth", "border thickness", 1, 4, 1);
    slide("card", "radius", "corner radius", 0, 28, 1);
    slide("card", "pad", "outer margin", 0, 32, 1);
    toggle(null, "compact", "compact days", "small 30px-wide date chips; off uses 36px chips. counts stay visible.");
    toggle(null, "animate", "gentle motion", "short hover transitions and a blinking footer caret; macOS reduce motion takes precedence.");
    group("font");
    drop(null, "font", "font family", "theme is the same typewriter face as mish.fastfetch (or whatever your theme sets in --vf-mono).", { theme: "theme interface", bundled: "cmu typewriter (bundled)", obsidian: "obsidian monospace", system: "system monospace", custom: "custom family" });
    text(null, "customFont", "custom font", "used when custom family is selected.", "Menlo");
    slide(null, "fontSize", "font size", 11, 18, 1);
    setting("reset appearance", "resets colours, shape, card, font and motion; keeps your date properties, filters and name.").addButton((b) => b.setButtonText("reset appearance").onClick(() => {
      for (const key of ["palette", "inkColour", "pillShape", "card", "font", "customFont", "fontSize", "compact", "animate"]) s[key] = clone(DEFAULTS[key]);
      change();
      this.display();
    }));
  }
};
module.exports = class MishCalendar extends Plugin {
  async onload() {
    this.alive = true;
    this.sequence = 0;
    this.views = /* @__PURE__ */ new Set();
    this.settings = settingsFrom(await this.loadData());
    this.detected = identity();
    this.index = new NoteIndex(moment);
    this.lastToday = todayKey();
    this.registerView(VIEW, (leaf) => new CalendarView(leaf, this));
    this.addSettingTab(new CalendarSettings(this.app, this));
    const ribbon = this.addRibbonIcon("calendar-days", "open calendar", () => this.activate());
    ribbon.classList.add("mish-calendar-ribbon");
    this.addCommand({ id: "open-calendar", name: "open calendar", callback: () => this.activate() });
    this.addCommand({ id: "calendar-today", name: "go to today", callback: async () => {
      const view = await this.activate();
      if (view) view.select(todayKey());
    } });
    this.addCommand({ id: "refresh-calendar", name: "refresh counts", callback: () => this.rebuild() });
    this.registerEvent(this.app.workspace.on("css-change", () => this.repaint()));
    this.registerEvent(this.app.workspace.on("file-open", (file) => {
      if (!this.settings.followActive || !file) return;
      const record = this.index.records.get(file.path);
      const key = record?.key || record?.days.keys().next().value;
      if (key) for (const view of this.views) view.select(key);
    }));
    this.registerEvent(this.app.metadataCache.on("changed", (file, data, cache) => {
      if (!this.ready || !this.alive) return;
      if (!this.app.vault.getAbstractFileByPath(file.path)) return;
      this.index.upsert(file, cache?.frontmatter, this.settings);
      this.schedulePaint();
    }));
    this.registerEvent(this.app.metadataCache.on("resolved", () => {
      if (this.ready && !this.resolvedOnce) {
        this.resolvedOnce = true;
        this.rebuild();
      }
    }));
    this.app.workspace.onLayoutReady(async () => {
      if (!this.alive) return;
      this.ready = true;
      this.rebuild();
      this.registerEvent(this.app.vault.on("create", (file) => {
        if (file.extension === "md") this.upsert(file);
      }));
      this.registerEvent(this.app.vault.on("delete", (file) => {
        if (file.extension) this.index.remove(file.path);
        else for (const path of Array.from(this.index.records.keys())) if (path.startsWith(file.path + "/")) this.index.remove(path);
        this.schedulePaint();
      }));
      this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
        if (file.extension) {
          this.index.remove(oldPath);
          this.upsert(file);
        } else this.rebuild();
      }));
      if (this.settings.openOnStart && !this.app.workspace.getLeavesOfType(VIEW).length) await this.activate(false);
    });
    this.registerInterval(window.setInterval(() => {
      const now = todayKey();
      if (now === this.lastToday) return;
      this.lastToday = now;
      this.repaint();
    }, 3e4));
  }
  nextId(prefix) {
    return "mish-cal-" + prefix + "-" + ++this.sequence;
  }
  upsert(file) {
    this.index.upsert(file, this.app.metadataCache.getFileCache(file)?.frontmatter, this.settings);
    this.schedulePaint();
  }
  rebuild() {
    if (!this.alive) return;
    this.index.rebuild(this.app.vault.getMarkdownFiles(), (file) => this.app.metadataCache.getFileCache(file)?.frontmatter, this.settings);
    this.repaint();
  }
  schedulePaint() {
    window.clearTimeout(this.paintTimer);
    this.paintTimer = window.setTimeout(() => {
      this.paintTimer = 0;
      if (this.alive) this.repaint();
    }, 120);
  }
  repaint() {
    if (this.views) for (const view of this.views) view.render();
  }
  changed(source = false) {
    window.clearTimeout(this.saveTimer);
    if (source) {
      window.clearTimeout(this.sourceTimer);
      this.sourceTimer = window.setTimeout(() => {
        this.sourceTimer = 0;
        this.rebuild();
      }, 200);
    } else this.repaint();
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = 0;
      this.persist();
    }, 350);
  }
  persist() {
    const snapshot = clone(this.settings);
    this.saving = (this.saving || Promise.resolve()).catch(() => {
    }).then(() => this.saveData(snapshot)).catch((error) => {
      console.error("mish.calendar: could not save settings", error);
      new Notice("calendar settings could not be saved.");
    });
    return this.saving;
  }
  async activate(reveal = true) {
    if (!this.alive) return null;
    const ws = this.app.workspace;
    let leaf = ws.getLeavesOfType(VIEW)[0];
    if (!leaf) {
      leaf = this.settings.sidebar === "left" ? ws.getLeftLeaf(false) : ws.getRightLeaf(false);
      if (!leaf) return null;
      await leaf.setViewState({ type: VIEW, active: reveal });
    }
    if (reveal) await ws.revealLeaf(leaf);
    return leaf.view instanceof CalendarView ? leaf.view : null;
  }
  onunload() {
    this.alive = false;
    if (this.saveTimer) {
      window.clearTimeout(this.saveTimer);
      this.persist();
    }
    window.clearTimeout(this.paintTimer);
    window.clearTimeout(this.sourceTimer);
    if (this.views) this.views.clear();
  }
};
