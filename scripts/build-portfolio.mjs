import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const indexPath = join(repositoryRoot, "index.html");
const assetsDirectory = join(repositoryRoot, "web-assets");
const density = 300;
const quality = 72;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function requireCommand(command, versionArgument) {
  try {
    execFileSync(command, [versionArgument], { stdio: "ignore" });
  } catch {
    fail(`Required command \`${command}\` was not found.`);
  }
}

function htmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function pathToUrl(value) {
  return value.split(sep).map(encodeURIComponent).join("/");
}

const pdfArgument = process.argv[2];
if (!pdfArgument || process.argv.length > 3) {
  fail("Usage: npm run generate -- path/to/portfolio.pdf");
}

const pdfPath = resolve(process.cwd(), pdfArgument);
const relativePdfPath = relative(repositoryRoot, pdfPath);
if (
  !relativePdfPath ||
  relativePdfPath.startsWith(`..${sep}`) ||
  isAbsolute(relativePdfPath)
) {
  fail("The target PDF must be inside this repository.");
}
if (extname(pdfPath).toLowerCase() !== ".pdf") {
  fail("The target must be a PDF file.");
}
if (!existsSync(pdfPath)) {
  fail(`PDF not found: ${pdfArgument}`);
}

requireCommand("pdfinfo", "-v");
requireCommand("pdftocairo", "-v");
requireCommand("magick", "-version");

const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
const pageCountMatch = pdfInfo.match(/^Pages:\s+(\d+)$/m);
if (!pageCountMatch) {
  fail("Could not determine the PDF page count.");
}
const pageCount = Number(pageCountMatch[1]);
const detailedPdfInfo = execFileSync(
  "pdfinfo",
  ["-f", "1", "-l", String(pageCount), pdfPath],
  { encoding: "utf8" },
);
const pageSizes = [...detailedPdfInfo.matchAll(
  /^Page\s+\d+\s+size:\s+([\d.]+) x ([\d.]+) pts/mg,
)].map((match) => ({
  width: Math.round((Number(match[1]) / 72) * density),
  height: Math.round((Number(match[2]) / 72) * density),
}));
if (pageSizes.length !== pageCount) {
  fail("Could not determine every PDF page size.");
}

const assetPrefix = basename(pdfPath, extname(pdfPath))
  .replace(/[^A-Za-z0-9._-]+/g, "-")
  .replace(/^-+|-+$/g, "");
if (!assetPrefix) {
  fail("Could not create a safe asset name from the PDF filename.");
}

const temporaryDirectory = mkdtempSync(
  join(assetsDirectory, ".portfolio-build-"),
);
const generatedAssets = [];

try {
  console.log(
    `Converting ${pageCount} pages at ${density} DPI and WebP quality ${quality}…`,
  );

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const pageNumber = pageIndex + 1;
    const filename = `${assetPrefix}-${pageNumber}.webp`;
    const temporaryPath = join(temporaryDirectory, filename);
    const pngPrefix = join(temporaryDirectory, `${assetPrefix}-${pageNumber}`);
    const pngPath = `${pngPrefix}.png`;
    const targetSize = pageSizes[pageIndex];

    console.log(`  Page ${pageNumber}/${pageCount}`);
    execFileSync(
      "pdftocairo",
      [
        "-f",
        String(pageNumber),
        "-l",
        String(pageNumber),
        "-r",
        String(density),
        "-singlefile",
        "-png",
        pdfPath,
        pngPrefix,
      ],
      { stdio: "inherit" },
    );
    execFileSync(
      "magick",
      [
        pngPath,
        "-crop",
        `${targetSize.width}x${targetSize.height}+0+0`,
        "+repage",
        "-background",
        "white",
        "-alpha",
        "remove",
        "-alpha",
        "off",
        "-strip",
        "-define",
        "webp:method=6",
        "-quality",
        String(quality),
        temporaryPath,
      ],
      { stdio: "inherit" },
    );
    rmSync(pngPath, { force: true });

    const dimensions = execFileSync(
      "magick",
      ["identify", "-format", "%w %h", temporaryPath],
      { encoding: "utf8" },
    ).trim();
    const [width, height] = dimensions.split(/\s+/).map(Number);
    if (width !== targetSize.width || height !== targetSize.height) {
      fail(
        `Page ${pageNumber} has unexpected dimensions: ${width}x${height}; expected ${targetSize.width}x${targetSize.height}.`,
      );
    }

    generatedAssets.push({ filename, temporaryPath, width, height });
  }

  const originalHtml = readFileSync(indexPath, "utf8");
  const generatedBlockPattern =
    /      <!-- portfolio:start -->[\s\S]*?      <!-- portfolio:end -->/;
  const existingBlock = originalHtml.match(generatedBlockPattern)?.[0];
  if (!existingBlock) {
    fail("Could not find the generated portfolio markers in index.html.");
  }

  const oldAssetPaths = [...existingBlock.matchAll(/src="\.\/([^"]+\.webp)"/g)]
    .map((match) => resolve(repositoryRoot, decodeURIComponent(match[1])))
    .filter((assetPath) => {
      const relativePath = relative(assetsDirectory, assetPath);
      return !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath);
    });

  const imageMarkup = generatedAssets
    .map(({ filename, width, height }, index) => {
      const pageNumber = index + 1;
      const alt =
        pageNumber === 1
          ? "Aïssa Dingenotto portfolio cover"
          : `Aïssa Dingenotto portfolio page ${pageNumber}`;
      const loadingAttributes =
        pageNumber === 1
          ? 'loading="eager"\n          fetchpriority="high"'
          : 'loading="lazy"\n          decoding="async"';

      return `      <img
        src="./web-assets/${htmlEscape(pathToUrl(filename))}"
        width="${width}"
        height="${height}"
        alt="${htmlEscape(alt)}"
        class="portfolio-page"
        ${loadingAttributes}
      />`;
    })
    .join("\n");

  const pdfUrl = pathToUrl(relativePdfPath);
  const generatedBlock = `      <!-- portfolio:start -->
${imageMarkup}

      <a class="pdf-link" href="./${htmlEscape(pdfUrl)}">
        Open or download the PDF
      </a>
      <!-- portfolio:end -->`;

  for (const asset of generatedAssets) {
    const destination = join(assetsDirectory, asset.filename);
    rmSync(destination, { force: true });
    renameSync(asset.temporaryPath, destination);
  }

  writeFileSync(
    indexPath,
    originalHtml.replace(generatedBlockPattern, generatedBlock),
  );

  const currentAssetPaths = new Set(
    generatedAssets.map(({ filename }) => join(assetsDirectory, filename)),
  );
  for (const oldAssetPath of oldAssetPaths) {
    if (!currentAssetPaths.has(oldAssetPath)) {
      rmSync(oldAssetPath, { force: true });
    }
  }

  console.log(`Updated ${relative(repositoryRoot, indexPath)} and web-assets/.`);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
