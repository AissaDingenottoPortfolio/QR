# Aïssa Dingenotto Portfolio

Visit <https://aissadingenottoportfolio.github.io/QR/> to view the live site.

## Updating the portfolio

The build script requires Node.js, Poppler (`pdfinfo` and `pdftocairo`), and ImageMagick (`magick`). It has no npm package dependencies.

Install the required tools if they are not already available:

```sh
# Ubuntu/Debian
sudo apt install nodejs npm poppler-utils imagemagick

# macOS
brew install node poppler imagemagick
```

On Windows, open PowerShell and run:

```powershell
winget install --exact --id OpenJS.NodeJS.LTS
winget install --exact --id oschwartz10612.Poppler
winget install --exact --id ImageMagick.ImageMagick
```

Close and reopen the terminal after installing so the new commands are available.

To publish any PDF stored in this repository:

```sh
npm run portfolio -- "path/to/portfolio.pdf"
```

The script converts every page to a 300 DPI WebP in `web-assets/`, updates the generated image list and PDF link in `index.html`, and removes images referenced by the previous generated list. Do not remove the `portfolio:start` and `portfolio:end` comments from `index.html`.

Preview the site locally on Windows, macOS, or Linux:

```sh
npm run preview
```

Then open <http://localhost:8080/>. Press `Ctrl+C` in the terminal to stop the preview server.
