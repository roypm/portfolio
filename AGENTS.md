# Language

English is mandatory for the whole project: code, comments, file names, docs, commit messages, and this file.

Visitor-facing copy may exist in Spanish and Catalan only inside the locale content and UI dictionaries for those languages.

# Stack

- Astro
- TypeScript
- Tailwind
- MDX for site content (home, projects, and experience), via content collections
- Astro built-in i18n: locale routes, TypeScript dictionaries for the UI, and MDX split by locale
- Lucide via `@lucide/astro` for UI icons, rendered as inline SVG
- Custom artwork (favicon, logo, and similar) as SVG files in the repo
- Photos and screenshots in `src/`, optimized at build time with `astro:assets` (`Image`, `Picture`, or Markdown images in MDX). `public/` only for files that must be served unchanged
- pnpm as the package manager

# Git

- `main` is deployed. GitHub Pages publishes this branch. Do not commit directly to it.
- `develop` is the working branch. Commit there.
- Ship with a pull request from `develop` into `main`.
- CI runs on that pull request and must pass before merge.

# Publishing

- GitHub Pages
- Canonical URL: https://www.roypm.es
- `roypm.es` redirects to `https://www.roypm.es`

# Locales

- Spanish, English, and Catalan
- Spanish is the default locale: `/` with no prefix. English at `/en/`, Catalan at `/ca/`
- Missing translations fall back to Spanish

# Pages

One page per locale. The nav jumps to Intro, Projects, and Experience. Bio and focus stay inside the intro block and have no nav link.

Order:

1. Intro: name, role, one sentence, and an optional photo
2. Bio: a few paragraphs
3. Current focus: the kind of work wanted now
4. Projects: one MDX entry per project (screenshot, stack, link)
5. Experience: one MDX entry per role (place, dates, what was done)

A project gets its own URL only when it needs a long writeup.

# Format

- Intro, bio, and focus are one block. On a wide screen, photo, name, role, and sentence sit in one column, and bio plus focus sit in the other. On a narrow screen those columns stack.
- The mailto call to action is a fixed bubble at the bottom-right. On a wide screen it is an elongated pill with the label. On a narrow screen it is a circle with the icon only.
- Projects are cards in a grid: two columns, three when the screen is wide enough. Card order: screenshot, title, one line, stack, link.
- Experience is a vertical timeline. Each role is a dot, and a line connects it to the next dot downward. Entry order beside the dot: role, place, dates, what was done.
- Projects are ordered manually in the content, not alphabetically.
- Experience is ordered from newest to oldest.
- A fixed top bar holds the section links. On the right, a custom language menu sits beside the link to this portfolio's GitHub repository. The link for the section in view is highlighted.
- The language menu is not a native browser control. On a wide screen it shows the full language name and flag. On a narrow screen it shows the short code and flag. Choosing a language changes the whole page and keeps the visitor on the same block.
- Do not use native browser controls (`select`, date inputs, and similar). Build custom controls styled with the palette.
- The footer is centered. It shows a rights-reserved line and “created by” with a link to https://github.com/roypm. It does not repeat the bar or the contact bubble.
- External links open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`. Internal links and `mailto` stay in the same tab.

# Colors

Use only this palette in the Tailwind theme. Do not hardcode other hex values in components. Flag artwork uses each flag's own colors.

Scales run from `100` (darkest) to `900` (lightest). `500` is the named color.

- `tea_green`: 100 `#1d391e`, 200 `#39723b`, 300 `#57aa5a`, 400 `#90c792`, 500 `#c9e4ca`, 600 `#d4e9d4`, 700 `#deefdf`, 800 `#e9f4ea`, 900 `#f4faf4`
- `muted_teal`: 100 `#172920`, 200 `#2e5241`, 300 `#457b61`, 400 `#5da482`, 500 `#87bba2`, 600 `#9ec9b4`, 700 `#b7d6c7`, 800 `#cfe4da`, 900 `#e7f1ec`
- `pacific_cyan`: 100 `#111a1c`, 200 `#223438`, 300 `#334e53`, 400 `#44686f`, 500 `#55828b`, 600 `#719fa8`, 700 `#95b7be`, 800 `#b8cfd4`, 900 `#dce7e9`
- `dark_slate_grey`: 100 `#0c1314`, 200 `#172628`, 300 `#23393c`, 400 `#2f4c50`, 500 `#3b6064`, 600 `#558a90`, 700 `#7aabb1`, 800 `#a6c7cb`, 900 `#d3e3e5`
- `charcoal_blue`: 100 `#0b0f12`, 200 `#161d23`, 300 `#212c35`, 400 `#2b3b47`, 500 `#364958`, 600 `#527086`, 700 `#7694ab`, 800 `#a4b8c7`, 900 `#d1dbe3`
