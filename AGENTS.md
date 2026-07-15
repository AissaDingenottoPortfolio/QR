# AGENTS.md

## Purpose

This repository is the static portfolio site for Aïssa Dingenotto:
<https://aissadingenottoportfolio.github.io/QR/>

It is hosted by GitHub Pages from the `main` branch. There is no application framework or deployment build. The site consists of one HTML page, generated WebP images, and a downloadable PDF.

The repository owner may be non-technical. Complete routine portfolio updates without asking them for implementation details. Ask a question only when the intended PDF is ambiguous or a required file is missing.

## Repository map

- `index.html` — live page, analytics, styling, generated portfolio images, and PDF link.
- `scripts/build-portfolio.mjs` — converts a selected PDF and updates `index.html`.
- `scripts/serve.mjs` — runs the dependency-free local preview server on `http://localhost:8080/`.
- `package.json` — exposes the `npm run generate` and `npm run preview` commands. There are no npm dependencies.
- `web-assets/` — generated WebP page images.
- `pdf-graveyard/` — archived superseded PDFs. Never publish one unless explicitly requested.
- `README.md` — short human-facing update instructions.
- `magpie.svg` — favicon.

## Standard portfolio update

When asked to update, replace, publish, or deploy the portfolio:

1. Run `git status --short`. Preserve unrelated user changes and never discard work without permission.
2. Identify the new PDF. The active PDF should be in the repository root.
   - Prefer the PDF explicitly named by the user.
   - If exactly one newly added root-level PDF exists, use it.
   - If several PDFs are plausible, ask which one to publish.
   - Do not select a file from `pdf-graveyard/` unless the user explicitly names it.
3. Before generation, note the currently linked PDF from the `.pdf-link` in `index.html`. This is the previous active PDF.
4. Generate the site assets from the new PDF:

   ```sh
   npm run generate -- "./Name of Portfolio.pdf"
   ```

   The script:
   - renders every page at 300 DPI;
   - crops each render to the PDF's mathematically rounded pixel dimensions, preventing Cairo's fractional one-pixel overflow line;
   - writes WebPs to `web-assets/`;
   - updates filenames, intrinsic dimensions, page count, and the PDF link in `index.html`;
   - removes obsolete WebPs referenced by the previous generated block.
5. After successful generation, if the previous active PDF differs from the new one and is still in the repository root, move it to `pdf-graveyard/`. Do not overwrite an existing archive file; preserve both with distinct names if necessary.
6. Validate the result using the checklist below.
7. Summarize which PDF is active, how many pages were generated, and whether the change was published.

Do not manually maintain the generated image list. The content between these markers in `index.html` belongs to the script:

```html
<!-- portfolio:start -->
<!-- portfolio:end -->
```

Do not remove or rename those markers.

## Validation checklist

At minimum:

```sh
node --check scripts/build-portfolio.mjs
node --check scripts/serve.mjs
git diff --check
```

Also verify:

- `pdfinfo "the-active-file.pdf"` reports the expected page count.
- `index.html` contains the same number of `portfolio-page` images.
- Every local `src` and `href` in `index.html` points to an existing file.
- The first image uses eager loading and high fetch priority.
- Remaining images use lazy loading and async decoding.
- Generated images have non-zero dimensions and file sizes.
- Their dimensions match the PDF page size rounded to pixels at 300 DPI; do not accept an extra Cairo overflow row or column.
- Dark page edges do not contain a bright one-pixel line caused by fractional raster overflow.
- `git status --short` contains only intended changes.

Preview through the repository's cross-platform local server rather than opening `index.html` directly:

```sh
npm run preview
```

Then open <http://localhost:8080/>. This command works on Windows, macOS, and Linux and does not require Python. Stop it with `Ctrl+C`.

## Visual verification for the user

After generating the WebPs and updating `index.html`, use an available browser or screenshot tool to show the rendered result to the user in the AI chat.

- Prefer screenshots returned directly by the browser tool and attach them to the response.
- Capture at least the rendered cover. For a multi-page update, provide either one practical full-page screenshot or two to three viewport screenshots showing the top, a representative middle page, and the bottom/PDF link.
- Include a mobile-width screenshot when the tooling supports viewport selection, because most visitors arrive by QR code on a phone.
- Briefly label what each screenshot demonstrates and state the generated page count.
- Screenshots are verification artifacts, not repository content. Prefer the browser tool's temporary storage or the operating system's temporary directory. Do not assume a Unix-style `/tmp` directory exists on Windows.
- Never leave screenshot files or screenshot directories in this repository. If a tool can only write inside the repository, use a temporary directory, attach the images to the chat, delete the directory afterward, and confirm with `git status --short` that nothing remains.
- If screenshot tooling is unavailable, say so plainly instead of claiming visual verification. Still report the automated validation results and give the user the local preview command.

Do not wait until after publishing to perform this check. The screenshots should give the user an opportunity to catch an incorrect PDF, page order, crop, or layout before the change reaches the live site.

## Publishing

Editing and validation do not automatically imply permission to push. If the user explicitly asks to **publish**, **deploy**, **push**, or **update the live site**, that is authorization to:

1. Commit only the intended portfolio update files.
2. If the environment permits direct publishing, push the commit to `origin/main`.
3. If direct pushing is unavailable or the platform uses a review workflow, open a pull request targeting `main` and give the user its link. Explain that the live site will not change until the pull request is merged.
4. After a successful push or merge, explain that GitHub Pages may take a few minutes to refresh.

Never describe an open but unmerged pull request as published. If the user only asks to prepare or update files, stop after validation and leave the changes uncommitted unless asked otherwise.

## Required local tools

The generator needs:

- Node.js
- Poppler (`pdfinfo` and `pdftocairo`)
- ImageMagick (`magick`)

No `npm install` is necessary. If tools are missing:

```sh
# Ubuntu/Debian
sudo apt install nodejs npm poppler-utils imagemagick

# macOS
brew install node poppler imagemagick
```

On Windows, use PowerShell:

```powershell
winget install --exact --id OpenJS.NodeJS.LTS
winget install --exact --id oschwartz10612.Poppler
winget install --exact --id ImageMagick.ImageMagick
```

After a Windows installation, close and reopen the terminal so `node`, `npm`, `pdfinfo`, `pdftocairo`, and `magick` are added to `PATH`. If a package ID is unavailable, use `winget search nodejs`, `winget search poppler`, or `winget search imagemagick` to find the current ID; do not download executables from an unverified site.

Use platform-neutral Node/npm commands in instructions and quote PDF paths because Windows filenames commonly contain spaces. Do not add npm conversion libraries merely to work around missing system tools without first explaining the tradeoff.

## Guardrails

- Keep the site static and dependency-light.
- Preserve the Google Analytics ID `G-B6FJZNFFW6` unless explicitly asked to change it.
- Preserve the page title, favicon, responsive image sizing, lazy loading, and PDF download link.
- Do not hand-edit generated WebPs.
- Preserve the per-page rounded-dimension crop in `scripts/build-portfolio.mjs`; removing it reintroduces a visible one-pixel line along some dark page edges.
- Do not delete archived PDFs.
- Do not modify the source PDF’s contents.
- Do not add a framework, bundler, or deployment workflow for a routine portfolio update.
- Never claim the live site was updated unless the push succeeded.
