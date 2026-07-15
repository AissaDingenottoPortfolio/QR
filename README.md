# QR

Visit <https://aissadingenottoportfolio.github.io/QR/> to view the live site.

## Updating the portfolio PDF

1. Replace `Aissa_Portfolio_QR.18.April.26.pdf` with the new PDF export.
2. If the filename changes, update the `src=` parameter in `index.html`.
3. Test locally with a static server, for example:

   ```sh
   python3 -m http.server 8080
   ```

## Updating PDF.js

PDF.js is vendored into `pdfjs/` so the site can run as static files on GitHub
Pages.
The source version is tracked in `package.json` under `pdfjs.version` and
mirrored in `pdfjs/VERSION`.

To refresh the vendored viewer assets:

```sh
pnpm install
pnpm sync:pdfjs
```

To upgrade PDF.js, change `pdfjs.version` in `package.json`, then run
`pnpm sync:pdfjs`.
The sync script downloads the official PDF.js release zip and copies only the runtime
viewer assets needed by this site.
