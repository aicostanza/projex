import assert from "node:assert/strict";
import test from "node:test";



test("serves the Project X dashboard from the production Worker", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>Project X/);
  assert.match(html, /Welcome back, Shaun/);
  assert.match(html, /Prototype · sample data/);
  assert.match(html, /Your champion pool/);
  assert.doesNotMatch(html, /Starter Project|codex-preview/);
});
