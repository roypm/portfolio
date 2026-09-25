# Language

English is mandatory for the whole project: code, comments, file names, docs, commit messages, and this file.

Visitor-facing copy may exist in Spanish and Catalan only inside the locale content and UI dictionaries for those languages.

# Stack

- Astro
- TypeScript
- Tailwind
- MDX for site content (home, projects, experience, and education), via content collections
- Astro built-in i18n: locale routes, TypeScript dictionaries for the UI, and MDX split by locale
- Lucide via `@lucide/astro` for UI icons, rendered as inline SVG
- Custom artwork (favicon, logo, and similar) as SVG files in the repo
- Photos and screenshots in `src/`, optimized at build time with `astro:assets` (`Image`, `Picture`, or Markdown images in MDX). `public/` only for files that must be served unchanged, including certificate PDFs in `public/certificates/`
- pnpm as the package manager

# Git

- `main` is deployed. Cloudflare Workers publishes this branch. Do not commit directly to it.
- `develop` is the working branch. Commit there.
- Ship with a pull request from `develop` into `main`.
- CI runs on that pull request and must pass before merge.

# Publishing

- Cloudflare Workers, as static assets. The site stays pre-rendered. No Cloudflare adapter until a route needs a server.
- Build command: `pnpm build`. Deploy command: `pnpm exec wrangler deploy`. `pnpm deploy` runs both.
- Workers Builds on `main`: build with `pnpm build`, then deploy with `pnpm exec wrangler deploy`.
- Canonical URL: https://www.roypm.es
- `roypm.es` redirects to `https://www.roypm.es`

# Locales

- Spanish, English, and Catalan
- Spanish is the default locale: `/` with no prefix. English at `/en/`, Catalan at `/ca/`
- Missing translations fall back to Spanish

# Pages

One page per locale. The nav jumps to Intro, Projects, Experience, and Education. Bio and focus stay inside the intro block and have no nav link.

Order:

1. Intro: name, role, one sentence, and an optional photo
2. Bio: a few paragraphs
3. Current focus: the kind of work wanted now
4. Projects: one MDX entry per project (screenshot, stack, link)
5. Experience: one MDX entry per role (place, dates, what was done)
6. Education: qualifications on a timeline, then short courses. A course may link a PDF certificate
7. Contact: on a wide screen, two columns. The first is a call to get in touch and a short line about an idea, a proposal, or a job offer. The second is a compact form: name, email, message, and a send button. On a narrow screen those columns stack. The send button clears the form and does not deliver the message yet

A project gets its own URL only when it needs a long writeup.

# Format

- Intro, bio, and focus are one block. On a wide screen, photo, name, role, and sentence sit in one column, and bio plus focus sit in the other. On a narrow screen those columns stack.
- Projects, experience, education, and contact each open with a full-width accent line, and the heading sits just under it. Bio and focus have no line.
- Contact is two columns on a wide screen and one column on a narrow screen. The call and the short line sit in the first column. The compact form sits in the second.
- The contact call to action is a fixed bubble at the bottom-right. On a wide screen it is an elongated pill with the label. On a narrow screen it is a circle with the icon only. The bubble jumps to the contact section.
- Projects are cards in a grid: two columns, three when the screen is wide enough. Card order: screenshot, title, one line, stack, link.
- Experience is a vertical timeline. Each role is a dot, and a line connects it to the next dot downward. Entry order beside the dot: role, place, dates, what was done.
- Education uses that same timeline for qualifications. Short courses are cards in a grid, read left to right and then down: one column on a narrow screen, two when wider, four when the screen is wide enough. Each card is only as tall as its content. The newest course is the top-left card. Card order: title, issuer, date, an optional certificate, and an optional course link shown as an external-link icon. A qualification with no end date is ongoing. A course with no end date shows only its date.
- Certificate files live in `public/certificates/` and are linked as `/certificates/file.pdf` (PNG, JPEG, and WebP are also allowed). An `https` URL is also allowed. The certificate opens in a new tab.
- Projects are ordered manually in the content, not alphabetically. A pinned project shows a pin mark in the top-right corner of its card.
- Experience is ordered from newest to oldest.
- Education is ordered from newest to oldest, qualifications and courses separately. An entry with `hidden: true` stays in the content and is not shown.
- A floating bar never hides. On a wide screen the visitor chooses where it sits: top (horizontal, with section names), or left or right (vertical and centered, halfway between the screen edge and the content column, with a section icon and no name). On a narrow screen the bar stays at the bottom with section names, and that choice is hidden. One rounded box holds the section links. A round button beside it opens a side panel for preferences. The link for the section in view is highlighted.
- The side panel is a custom control, not a native browser control. Language is the first preference: each option shows its flag and full name. Choosing a language changes the whole page, keeps the visitor on the same block, and closes the side panel. On a wide screen, bar position is the next preference: top, left, or right. Palette is the next preference, including on a narrow screen: slate, night, garden, blossom, or garnet. Slate is the default. Each option shows the palette name and a strip of its own colors. Choosing one changes the page colors immediately and is remembered. The link to this portfolio's GitHub repository sits at the bottom of the panel.
- Do not use native browser controls (`select`, date inputs, and similar). Build custom controls styled with the palette.
- After the contact section, a tall sample block reserves the scroll distance for an image that moves while the visitor scrolls. A frame stays fixed in the viewport while that block passes. The animation is not designed yet.
- The footer is centered. It shows a rights-reserved line and “created by” with a link to https://github.com/roypm. It does not repeat the bar or the contact bubble.
- External links open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`. Internal links and `mailto` stay in the same tab.

# Colors

The page uses one palette at a time. The visitor picks it in the side panel. `slate` is the default. Components keep the garden color names as roles, and the chosen palette replaces those values. Text may use a darker or lighter step than `500` so it stays readable. Do not hardcode hex values in components. Flag artwork and the palette strips in the side panel use each artwork's own colors.

Scales run from `100` (darkest) to `900` (lightest). `500` is the named color. The second `rich_mahogany` scale is named `oxblood` here because the source name was repeated. The second `pale_slate` scale is named `ash` for the same reason.

## garden

- `tea_green`: 100 `#1d391e`, 200 `#39723b`, 300 `#57aa5a`, 400 `#90c792`, 500 `#c9e4ca`, 600 `#d4e9d4`, 700 `#deefdf`, 800 `#e9f4ea`, 900 `#f4faf4`
- `muted_teal`: 100 `#172920`, 200 `#2e5241`, 300 `#457b61`, 400 `#5da482`, 500 `#87bba2`, 600 `#9ec9b4`, 700 `#b7d6c7`, 800 `#cfe4da`, 900 `#e7f1ec`
- `pacific_cyan`: 100 `#111a1c`, 200 `#223438`, 300 `#334e53`, 400 `#44686f`, 500 `#55828b`, 600 `#719fa8`, 700 `#95b7be`, 800 `#b8cfd4`, 900 `#dce7e9`
- `dark_slate_grey`: 100 `#0c1314`, 200 `#172628`, 300 `#23393c`, 400 `#2f4c50`, 500 `#3b6064`, 600 `#558a90`, 700 `#7aabb1`, 800 `#a6c7cb`, 900 `#d3e3e5`
- `charcoal_blue`: 100 `#0b0f12`, 200 `#161d23`, 300 `#212c35`, 400 `#2b3b47`, 500 `#364958`, 600 `#527086`, 700 `#7694ab`, 800 `#a4b8c7`, 900 `#d1dbe3`

## blossom

- `soft_blush`: 100 `#61001a`, 200 `#c20034`, 300 `#ff245e`, 400 `#ff85a5`, 500 `#ffe5ec`, 600 `#ffebf0`, 700 `#fff0f4`, 800 `#fff5f8`, 900 `#fffafb`
- `pastel_pink`: 100 `#5a0016`, 200 `#b4002d`, 300 `#ff0e4a`, 400 `#ff688e`, 500 `#ffc2d1`, 600 `#ffceda`, 700 `#ffdae3`, 800 `#ffe7ed`, 900 `#fff3f6`
- `cherry_blossom`: 100 `#570016`, 200 `#ad002b`, 300 `#ff0544`, 400 `#ff5c85`, 500 `#ffb3c6`, 600 `#ffc2d1`, 700 `#ffd1dd`, 800 `#ffe0e8`, 900 `#fff0f4`
- `cotton_candy`: 100 `#500014`, 200 `#9f0028`, 300 `#ef003c`, 400 `#ff3f6f`, 500 `#ff8fab`, 600 `#ffa5bc`, 700 `#ffbccd`, 800 `#ffd2dd`, 900 `#ffe9ee`
- `petal_rouge`: 100 `#470213`, 200 `#8d0426`, 300 `#d40539`, 400 `#f9285d`, 500 `#fb6f92`, 600 `#fc8ca8`, 700 `#fda8be`, 800 `#fec5d3`, 900 `#fee2e9`

## garnet

- `pitch_black`: 100 `#030101`, 200 `#060202`, 300 `#090303`, 400 `#0c0505`, 500 `#0f0606`, 600 `#552222`, 700 `#9b3e3e`, 800 `#c77373`, 900 `#e3b9b9`
- `coffee_bean`: 100 `#060202`, 200 `#0c0404`, 300 `#120606`, 400 `#180808`, 500 `#200b0b`, 600 `#642222`, 700 `#aa3a3a`, 800 `#cf7373`, 900 `#e7b9b9`
- `rich_mahogany`: 100 `#090000`, 200 `#120000`, 300 `#1c0000`, 400 `#250000`, 500 `#2f0000`, 600 `#8b0000`, 700 `#e80000`, 800 `#ff4545`, 900 `#ffa2a2`
- `oxblood`: 100 `#0e0000`, 200 `#1d0000`, 300 `#2b0000`, 400 `#390000`, 500 `#490000`, 600 `#9f0000`, 700 `#f70000`, 800 `#ff5050`, 900 `#ffa7a7`
- `dark_garnet`: 100 `#140000`, 200 `#290000`, 300 `#3d0000`, 400 `#520000`, 500 `#650000`, 600 `#b80000`, 700 `#ff0a0a`, 800 `#ff5c5c`, 900 `#ffadad`

## slate

- `bright_snow`: 100 `#29323a`, 200 `#536475`, 300 `#8496a8`, 400 `#bfc8d1`, 500 `#f8f9fa`, 600 `#fafbfc`, 700 `#fbfcfc`, 800 `#fdfdfd`, 900 `#fefefe`
- `platinum`: 100 `#282f37`, 200 `#505f6e`, 300 `#7c8ea0`, 400 `#b3bec8`, 500 `#e9ecef`, 600 `#eef1f3`, 700 `#f3f4f6`, 800 `#f7f8f9`, 900 `#fbfbfc`
- `alabaster_grey`: 100 `#272d34`, 200 `#4e5b67`, 300 `#788899`, 400 `#abb6c0`, 500 `#dee2e6`, 600 `#e5e9ec`, 700 `#eceef1`, 800 `#f2f4f5`, 900 `#f9f9fa`
- `pale_slate`: 100 `#242a30`, 200 `#495561`, 300 `#6d7f91`, 400 `#9da9b5`, 500 `#ced4da`, 600 `#d7dce1`, 700 `#e1e5e9`, 800 `#ebeef0`, 900 `#f5f6f8`
- `ash`: 100 `#202428`, 200 `#404850`, 300 `#616d79`, 400 `#85919d`, 500 `#adb5bd`, 600 `#bdc4ca`, 700 `#ced3d8`, 800 `#dee1e5`, 900 `#eff0f2`
- `slate_grey`: 100 `#161819`, 200 `#2c2f32`, 300 `#41474b`, 400 `#575e64`, 500 `#6c757d`, 600 `#899199`, 700 `#a7adb2`, 800 `#c4c8cc`, 900 `#e2e4e5`
- `iron_grey`: 100 `#0e1011`, 200 `#1d2022`, 300 `#2b2f34`, 400 `#3a3f45`, 500 `#495057`, 600 `#68727d`, 700 `#8c959f`, 800 `#b2b9bf`, 900 `#d9dcdf`
- `gunmetal`: 100 `#0b0c0d`, 200 `#15171a`, 300 `#202327`, 400 `#2a2f34`, 500 `#343a40`, 600 `#58626c`, 700 `#7d8995`, 800 `#a9b0b8`, 900 `#d4d8dc`
- `carbon_black`: 100 `#070808`, 200 `#0e0f11`, 300 `#141719`, 400 `#1b1f22`, 500 `#212529`, 600 `#49525b`, 700 `#6f7d8b`, 800 `#9fa8b2`, 900 `#cfd4d8`

## night

The slate scales, read from dark to light. The page is `gunmetal` (`#343a40`), not black. Raised surfaces are `iron_grey` (`#495057`). The selected fill is a darker gray (`#2b2f34`). Text, borders, and the accent use the light end (`bright_snow`, `platinum`, `pale_slate`, `ash`).
