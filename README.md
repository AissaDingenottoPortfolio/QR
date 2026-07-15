# Aïssa Dingenotto Portfolio

Visit <https://aissadingenottoportfolio.github.io/QR/> to view the live site.

## Updating the portfolio with an AI assistant

You do not need to edit code or use a terminal. A coding agent can prepare, check, and publish the update for you.

### 1. Upload the new PDF

1. [Upload the new PDF to the repository](https://github.com/AissaDingenottoPortfolio/QR/upload/main).
2. Add the PDF at the top level, alongside `index.html`, rather than inside `pdf-graveyard`.
3. Give it a clear, unique filename, then click **Commit changes**.

### 2. Connect a coding agent to GitHub

Grant access only to the `AissaDingenottoPortfolio/QR` repository when GitHub asks which repositories the agent may use.

#### Claude account: use Claude Code on the web

1. Open [Claude Code on the web](https://claude.ai/code) and sign in with your Claude account.
2. Follow the prompt to install the Claude GitHub App.
3. Grant it access to the `AissaDingenottoPortfolio/QR` repository and create an environment.

See Anthropic's official [Claude Code web setup guide](https://code.claude.com/docs/en/web-quickstart). Availability depends on the Claude plan attached to the account.

#### ChatGPT account: use Codex

1. Open [OpenAI Codex](https://chatgpt.com/codex) and sign in with your ChatGPT account.
2. Follow the prompt to connect your GitHub account.
3. Select the `AissaDingenottoPortfolio/QR` repository and create an environment for it.

See OpenAI's official [Codex cloud setup guide](https://developers.openai.com/codex/cloud/).

> Use **Codex**, not the ordinary ChatGPT GitHub connector. The ordinary connector can read repositories but cannot edit or publish them.

### 3. Ask the agent to prepare the update

Replace the example filename below with the exact PDF filename you uploaded, then send this prompt to the coding agent:

> Update the portfolio using `Aissa_Portfolio_EXAMPLE.pdf`. Follow every instruction in `AGENTS.md`. Prepare and validate the update, then show me preview screenshots in this chat. Do not publish it until I approve the screenshots.

The agent should convert every PDF page, update the website, archive the previous PDF, run the checks, and show desktop/mobile previews.

### 4. Approve and publish

After checking the screenshots, reply:

> The preview looks correct. Publish it to the live site and confirm when the push or pull request succeeds.

If the agent creates a pull request instead of publishing directly, follow its link and click **Merge pull request** after reviewing it. GitHub Pages may take a few minutes to update.

### Account safety

- Never send an AI your GitHub password, recovery codes, or personal access token.
- Connect through the official GitHub permission screen only.
- Give the AI access to this repository only, rather than every repository in the account.
- Access can be reviewed or removed later under [GitHub Installed Apps](https://github.com/settings/installations).

## Technical reference

The generator requires Node.js, Poppler (`pdfinfo` and `pdftocairo`), and ImageMagick (`magick`). It has no npm package dependencies. AI agents should read `AGENTS.md` for installation, generation, validation, screenshot, and publishing instructions.

Generate a portfolio:

```sh
npm run generate -- "path/to/portfolio.pdf"
```

Preview it locally on Windows, macOS, or Linux:

```sh
npm run preview
```

Then open <http://localhost:8080/> and press `Ctrl+C` to stop the preview server.
