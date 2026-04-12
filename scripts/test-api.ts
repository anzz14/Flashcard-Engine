const BASE = "http://localhost:3000";
const cookieJar = new Map<string, string>();
let testDeckId = "";
let testCardId = "";

function testAssert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function cookieHeader(): string {
  return Array.from(cookieJar.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

function updateCookiesFromResponse(res: Response): void {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) {
    return;
  }

  const cookieParts = setCookie.split(/,(?=\s*[^;,=\s]+=[^;]+)/g);
  for (const part of cookieParts) {
    const [pair] = part.split(";");
    const eqIndex = pair.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();
    if (key) {
      cookieJar.set(key, value);
    }
  }
}

// Helper
async function api(method: string, path: string, body?: object) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookieJar.size > 0 ? { Cookie: cookieHeader() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  updateCookiesFromResponse(res);

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function loginWithCredentials(email: string, password: string): Promise<boolean> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, {
    headers: cookieJar.size > 0 ? { Cookie: cookieHeader() } : undefined,
  });
  updateCookiesFromResponse(csrfRes);
  const csrfData = (await csrfRes.json().catch(() => null)) as
    | { csrfToken?: string }
    | null;

  const csrfToken = csrfData?.csrfToken;
  if (!csrfToken) {
    return false;
  }

  const form = new URLSearchParams({
    email,
    password,
    csrfToken,
    callbackUrl: `${BASE}/dashboard`,
    json: "true",
  });

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(cookieJar.size > 0 ? { Cookie: cookieHeader() } : {}),
    },
    body: form.toString(),
    redirect: "manual",
  });
  updateCookiesFromResponse(loginRes);

  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: cookieJar.size > 0 ? { Cookie: cookieHeader() } : undefined,
  });
  const session = await sessionRes.json().catch(() => null);
  return Boolean(session?.user?.email);
}

async function run() {
  // Register test user
  const reg = await api("POST", "/api/auth/register", {
    email: "api-test@flashcard.app",
    name: "API Test",
    password: "testpassword123",
  });

  // 201 = new user, 409 = already exists (both are fine)
  testAssert(
    [201, 409].includes(reg.status),
    `Register: expected 201/409, got ${reg.status}`
  );
  console.log("PASS Register (or already exists)");

  const loggedIn = await loginWithCredentials(
    "api-test@flashcard.app",
    "testpassword123"
  );
  testAssert(loggedIn, "Credentials login should produce an authenticated session");
  if (!loggedIn) {
    console.log("WARN Could not establish authenticated session cookie.");
    return;
  }
  console.log("PASS Credentials login");

  // GET /api/decks
  const decks = await api("GET", "/api/decks");
  testAssert(decks.status === 200, `GET /api/decks: ${decks.status}`);

  testAssert(Array.isArray(decks.data), "GET /api/decks returns array");
  console.log("PASS GET /api/decks");

  // POST /api/decks
  const newDeck = await api("POST", "/api/decks", { name: "Test API Deck" });
  testAssert(
    newDeck.status === 201,
    `POST /api/decks: expected 201, got ${newDeck.status}`
  );
  testDeckId = newDeck.data.id;
  console.log("PASS POST /api/decks");

  // GET /api/decks/:id
  const deck = await api("GET", `/api/decks/${testDeckId}`);
  testAssert(deck.status === 200, `GET /api/decks/:id: ${deck.status}`);
  console.log("PASS GET /api/decks/:id");

  // POST /api/decks/:id/cards
  const card = await api("POST", `/api/decks/${testDeckId}/cards`, {
    question: "Test question?",
    answer: "Test answer.",
    topicTag: "Testing",
  });
  testAssert(card.status === 201, `POST cards: expected 201, got ${card.status}`);
  testCardId = card.data.id;
  console.log("PASS POST /api/decks/:id/cards");

  // GET /api/decks/:id/cards
  const cards = await api("GET", `/api/decks/${testDeckId}/cards`);
  testAssert(cards.status === 200, "GET cards status");
  testAssert(Array.isArray(cards.data), "GET cards returns array");
  console.log("PASS GET /api/decks/:id/cards");

  // PATCH /api/decks/:id/cards/:cardId
  const updated = await api("PATCH", `/api/decks/${testDeckId}/cards/${testCardId}`, {
    question: "Updated question?",
  });
  testAssert(updated.status === 200, `PATCH card: ${updated.status}`);
  console.log("PASS PATCH /api/decks/:id/cards/:cardId");

  // DELETE /api/decks/:id/cards/:cardId
  const deleted = await api("DELETE", `/api/decks/${testDeckId}/cards/${testCardId}`);
  testAssert(deleted.status === 200, `DELETE card: ${deleted.status}`);
  console.log("PASS DELETE /api/decks/:id/cards/:cardId");

  // PATCH rename deck
  const renamed = await api("PATCH", `/api/decks/${testDeckId}`, { name: "Renamed Deck" });
  testAssert(renamed.status === 200, `PATCH deck: ${renamed.status}`);
  console.log("PASS PATCH /api/decks/:id (rename)");

  // DELETE deck (archive)
  const archived = await api("DELETE", `/api/decks/${testDeckId}`);
  testAssert(archived.status === 200, `DELETE deck: ${archived.status}`);
  console.log("PASS DELETE /api/decks/:id");

  // Test 404 on archived deck
  const notFound = await api("GET", `/api/decks/${testDeckId}`);
  testAssert(
    notFound.status === 404,
    `Archived deck should return 404: ${notFound.status}`
  );
  console.log("PASS 404 on archived deck");

  console.log("\nAll API tests passed.");
}

run().catch((e) => {
  console.error("FAIL", e);
  process.exit(1);
});
