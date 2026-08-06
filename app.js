const http = require("http");

const PORT = process.env.PORT || 3000;
const OWNER = "Edison Priyadarshi";
const BUILD_NUMBER = process.env.BUILD_NUMBER || "local";
const GIT_COMMIT = process.env.GIT_COMMIT || "unknown";
const IMAGE_NAME = process.env.IMAGE_NAME || "edison-cicd-app";
// "2026-08-06 23:26 UTC" reads better on the card than a raw ISO string.
const DEPLOYED_AT = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

const page = () => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Edison CI/CD Pipeline</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    font-family: ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif;
    background: #0b1120;
    background-image:
      radial-gradient(900px 500px at 15% -10%, #1e3a8a55, transparent),
      radial-gradient(800px 500px at 110% 20%, #0f766e55, transparent);
    color: #e2e8f0;
  }
  .card {
    width: min(680px, 100%);
    background: #111a2eee;
    border: 1px solid #1e293b;
    border-radius: 18px;
    padding: 40px;
    box-shadow: 0 24px 60px #00000066;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 999px;
    background: #052e1a;
    border: 1px solid #14532d;
    color: #4ade80;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 0 0 #22c55eaa;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    70%  { box-shadow: 0 0 0 10px #22c55e00; }
    100% { box-shadow: 0 0 0 0 #22c55e00; }
  }
  h1 {
    margin: 22px 0 10px;
    font-size: clamp(28px, 5vw, 40px);
    line-height: 1.15;
    background: linear-gradient(92deg, #60a5fa, #34d399);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .sub { color: #94a3b8; font-size: 16px; line-height: 1.6; }
  .owner { color: #f1f5f9; font-weight: 600; }
  .grid {
    margin-top: 30px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 12px;
  }
  .cell {
    background: #0b1424;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 14px 16px;
  }
  .k {
    font-size: 11px;
    letter-spacing: .09em;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 6px;
  }
  .v {
    font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
    font-size: 15px;
    color: #e2e8f0;
    word-break: break-all;
  }
  footer {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid #1e293b;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
    justify-content: space-between;
    font-size: 13px;
    color: #64748b;
  }
  a { color: #60a5fa; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <main class="card">
    <span class="badge"><span class="dot"></span>Deployed via Jenkins</span>
    <h1>CI/CD Pipeline is Live</h1>
    <p class="sub">
      This page was built and deployed automatically by a Jenkins pipeline
      running in Docker. Every push to <code>main</code> rebuilds this image
      and restarts the container &mdash; no manual steps.<br>
      Maintained by <span class="owner">${OWNER}</span>.
    </p>

    <section class="grid">
      <div class="cell"><div class="k">Build Number</div><div class="v">#${BUILD_NUMBER}</div></div>
      <div class="cell"><div class="k">Git Commit</div><div class="v">${GIT_COMMIT.slice(0, 12)}</div></div>
      <div class="cell"><div class="k">Docker Image</div><div class="v">${IMAGE_NAME}</div></div>
      <div class="cell"><div class="k">Deployed At (UTC)</div><div class="v">${DEPLOYED_AT}</div></div>
    </section>

    <footer>
      <span>Node ${process.version} &middot; port ${PORT}</span>
      <a href="https://github.com/29edu/CI-CD">github.com/29edu/CI-CD</a>
    </footer>
  </main>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      owner: OWNER,
      build: BUILD_NUMBER,
      commit: GIT_COMMIT,
      image: IMAGE_NAME,
      deployedAt: DEPLOYED_AT
    }));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(page());
});

server.listen(PORT, () => {
  console.log(`[${OWNER}] CI/CD app listening on port ${PORT} (build #${BUILD_NUMBER})`);
});
