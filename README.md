# mish.calendar

a powerline calendar of your notes, by the dates you already write in them.

part of the [mish suite](https://github.com/mishtiiikrishnaa/mish.obsidian): the same pastel rainbow, the same typewriter feel, the same terminal manners as [mish.eza](https://github.com/mishtiiikrishnaa/mish.eza) and [mish.fastfetch](https://github.com/mishtiiikrishnaa/mish.fastfetch).

## what it does

- reads `created` or `date` (or whatever you list) from each note's properties, in `YYYY-MM-DD` or ISO form.
- draws a month grid with a note count on every day, month totals, and a note list you can browse.
- tracks extra date properties too, so a note can appear on more than one day with a small tag.
- flags undated notes, so nothing quietly disappears.
- opens notes straight from the list; `cmd`/`ctrl`-click opens in a new tab.
- keyboard driven: arrows move by day, page up/down changes month, shift changes year.
- follows the active note, opens on startup if you want it to, and can live in the sidebar.
- eight pastel palettes or your own six colours, powerline or terminal prompts, light and dark.
- bundled font. no network. no system commands. desktop only.

## install

**by hand.** download `main.js`, `manifest.json` and `styles.css` from the [latest release](https://github.com/mishtiiikrishnaa/mish.calendar/releases/latest), put them in `<your vault>/.obsidian/plugins/mish-calendar/`, reload obsidian, and switch it on under settings, community plugins.

**with brat.** add `mishtiiikrishnaa/mish.calendar` as a beta plugin.

then click the calendar in the ribbon, or run **open calendar** from the command palette.

## properties

by default the plugin looks for `created`, then `date`. change the order in settings, add extra formats, and list further properties under *also tracked* if a note belongs on several days.

## licence

mit. see [LICENSE](LICENSE).
