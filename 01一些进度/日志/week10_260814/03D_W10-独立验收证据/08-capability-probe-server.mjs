import http from "node:http";

const listenHost = "127.0.0.1";
const listenPort = 34191;
const upstreamHost = "127.0.0.1";
const upstreamPort = 34190;

const probeHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Codex capability probe</title>
  <style>
    body { font: 16px/1.5 system-ui, sans-serif; margin: 24px; max-width: 760px; }
    button { margin: 4px; padding: 8px 12px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; background: #f4f4f4; padding: 12px; }
    @media (prefers-reduced-motion: reduce) {
      #motion-probe { transition: none; }
    }
    @media (prefers-reduced-motion: no-preference) {
      #motion-probe { transition: transform 2s; }
    }
  </style>
</head>
<body>
  <h1>Disposable browser capability probe</h1>
  <p id="motion-probe">No ledger password or ledger data is used.</p>
  <button id="inspect">Inspect origin</button>
  <button id="create">Create and read probe DB</button>
  <button id="remove">Delete probe DB</button>
  <button id="download">Download probe JSON</button>
  <pre id="output">ready</pre>
  <script>
    const output = document.querySelector("#output");
    const setOutput = (value) => {
      output.textContent = JSON.stringify(value, null, 2);
    };

    async function inspectOrigin() {
      const response = await fetch("/", { cache: "no-store" });
      const cacheNames = await caches.keys();
      const registrations = await navigator.serviceWorker.getRegistrations();
      const databases =
        typeof indexedDB.databases === "function"
          ? await indexedDB.databases()
          : [];
      setOutput({
        action: "inspect",
        fetchStatus: response.status,
        fetchUrl: response.url,
        cacheNames,
        serviceWorkerScopes: registrations.map((item) => item.scope),
        indexedDbNames: databases.map((item) => item.name),
        viewport: { width: innerWidth, height: innerHeight },
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        resourceEntries: performance
          .getEntriesByType("resource")
          .slice(-10)
          .map((item) => ({ name: item.name, initiatorType: item.initiatorType })),
      });
    }

    async function createAndReadProbe() {
      const database = await new Promise((resolve, reject) => {
        const request = indexedDB.open("codex-capability-probe", 1);
        request.onupgradeneeded = () => {
          request.result.createObjectStore("probe");
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
      await new Promise((resolve, reject) => {
        const transaction = database.transaction("probe", "readwrite");
        transaction.objectStore("probe").put(
          { value: "fresh-disposable-origin" },
          "probe-key",
        );
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      const storedValue = await new Promise((resolve, reject) => {
        const transaction = database.transaction("probe", "readonly");
        const request = transaction.objectStore("probe").get("probe-key");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      database.close();
      const databases =
        typeof indexedDB.databases === "function"
          ? await indexedDB.databases()
          : [];
      setOutput({
        action: "create-read",
        database: "codex-capability-probe",
        store: "probe",
        key: "probe-key",
        storedValue,
        indexedDbNames: databases.map((item) => item.name),
      });
    }

    async function deleteProbe() {
      await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase("codex-capability-probe");
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("delete blocked"));
      });
      const databases =
        typeof indexedDB.databases === "function"
          ? await indexedDB.databases()
          : [];
      setOutput({
        action: "delete",
        deleted: true,
        indexedDbNames: databases.map((item) => item.name),
      });
    }

    function downloadProbe() {
      const json = JSON.stringify(
        { probe: "codex-capability", privateData: false },
        null,
        2,
      ) + "\\n";
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "codex-capability-probe.json";
      anchor.click();
      URL.revokeObjectURL(url);
      setOutput({
        action: "download",
        filename: anchor.download,
        bytes: new TextEncoder().encode(json).byteLength,
        json: JSON.parse(json),
      });
    }

    document.querySelector("#inspect").addEventListener("click", inspectOrigin);
    document.querySelector("#create").addEventListener("click", createAndReadProbe);
    document.querySelector("#remove").addEventListener("click", deleteProbe);
    document.querySelector("#download").addEventListener("click", downloadProbe);
  </script>
</body>
</html>`;

const server = http.createServer((request, response) => {
  if (request.url === "/__codex_probe") {
    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(probeHtml);
    return;
  }

  const upstreamRequest = http.request(
    {
      hostname: upstreamHost,
      port: upstreamPort,
      method: request.method,
      path: request.url,
      headers: request.headers,
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    },
  );
  upstreamRequest.on("error", (error) => {
    response.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(String(error));
  });
  request.pipe(upstreamRequest);
});

server.listen(listenPort, listenHost, () => {
  console.log(
    JSON.stringify({
      listen: `http://${listenHost}:${listenPort}`,
      upstream: `http://${upstreamHost}:${upstreamPort}`,
    }),
  );
});
