/**
 * Playwright global setup.
 *
 * Playwright's `webServer` only waits for the Vite dev server (:5173), which is
 * ready in ~1s. The API (:4000) starts an in-memory MongoDB first and can take
 * much longer to listen — especially on a fresh CI runner that has to download
 * the mongod binary. Without this gate, tests fire register/login requests at an
 * API that isn't up yet and fail immediately. Here we block until the API's
 * /health endpoint answers 200 before any test runs.
 */
const API_HEALTH_URL = process.env.E2E_API_HEALTH_URL ?? 'http://localhost:4000/health';
const DEADLINE_MS = 120_000;
const INTERVAL_MS = 500;

async function globalSetup(): Promise<void> {
  const deadline = Date.now() + DEADLINE_MS;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(API_HEALTH_URL);
      if (res.ok) {
        console.log(`[e2e] API healthy at ${API_HEALTH_URL}`);
        return;
      }
      lastError = new Error(`Unexpected status ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }

  throw new Error(
    `[e2e] API did not become healthy at ${API_HEALTH_URL} within ${DEADLINE_MS / 1000}s. ` +
      `Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

export default globalSetup;
