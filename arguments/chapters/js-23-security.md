# Security: Defending JavaScript Applications

> XSS, CSRF, injection, authentication, dependency auditing, and security practices.

---

## Table of Contents

- [1. XSS](#1-xss)
- [2. CSRF and Injection](#2-csrf-and-injection)
- [3. Authentication](#3-authentication)
- [4. Dependencies and Secrets](#4-dependencies-and-secrets)

---

## 1. XSS

Cross-Site Scripting (XSS) is the single most common web vulnerability, and it has been for over two decades. The concept is deceptively simple: an attacker gets their JavaScript to run inside your page, in your user's browser, with full access to cookies, localStorage, the DOM, and anything your legitimate code can touch.

Here is how it happens at the most fundamental level:

```mermaid
flowchart LR
    A["Attacker submits malicious input"] --> B["Your app stores or reflects it"]
    B --> C["Browser renders it as HTML/JS"]
    C --> D["Attacker's code runs as YOUR site"]
    D --> E["Steals cookies, tokens, data"]
```

There are three flavors. **Stored XSS** means the malicious script lives in your database and gets served to every user who views that page -- a poisoned comment on a blog post, for example. **Reflected XSS** means the script is embedded in a URL or form submission and gets bounced back in the response. **DOM-based XSS** happens entirely client-side, when your JavaScript reads something from `location.hash` or `document.referrer` and shoves it into the page without sanitizing it.

The root cause is always the same: **treating user input as trusted markup**.

### The innerHTML Trap

This is the number one mistake junior developers make:

```js
// VULNERABLE -- never do this
const comment = getUserComment(); // Could be: <img src=x onerror=alert(document.cookie)>
document.getElementById("comments").innerHTML = comment;
```

The browser does not know or care that `comment` came from an untrusted source. It parses the string as HTML, finds the `<img>` tag, tries to load the broken `src`, fires the `onerror` handler, and now the attacker owns your user's session.

The fix is almost embarrassingly simple:

```js
// SAFE -- textContent escapes everything
document.getElementById("comments").textContent = comment;
```

`textContent` treats the string as plain text. No parsing, no script execution, no surprises. If the user types `<script>alert(1)</script>`, that is exactly what appears on screen, angle brackets and all.

> **Rule of thumb:** If you did not write the HTML yourself, it does not go into `innerHTML`. Ever.

### When You Actually Need HTML

Sometimes you legitimately need to render rich content -- a WYSIWYG editor, markdown-to-HTML conversion, or content from a CMS. In those cases, sanitize aggressively:

```js
import DOMPurify from "dompurify";

// DOMPurify strips dangerous tags and attributes
const clean = DOMPurify.sanitize(userHTML);
document.getElementById("content").innerHTML = clean;
```

DOMPurify removes `<script>` tags, `onerror` attributes, `javascript:` URLs, and dozens of other attack vectors. It is battle-tested and maintained. Do not try to write your own sanitizer with regex -- you will miss edge cases that attackers have been cataloging for years.

### Content Security Policy (CSP)

CSP is your second line of defense. It is an HTTP header that tells the browser which sources of scripts, styles, images, and other resources are allowed:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src *;
```

With this policy, even if an attacker manages to inject a `<script>` tag, the browser refuses to execute it because the script does not come from `'self'`. Inline scripts are blocked by default. You can allowlist specific domains, use nonces for legitimate inline scripts, and report violations to a monitoring endpoint.

```js
// In Express
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self';"
  );
  next();
});
```

> **Gotcha:** Adding `'unsafe-inline'` to `script-src` defeats most of CSP's XSS protection. Avoid it. Use nonces or hashes instead if you must inline scripts.

### Subresource Integrity (SRI)

When you load scripts from CDNs, how do you know the CDN has not been compromised? SRI lets you pin a hash of the expected file content:

```html
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxAhL..."
  crossorigin="anonymous"
></script>
```

If the file content does not match the hash, the browser refuses to execute it. This is free protection against supply-chain attacks on your CDN dependencies.

### The React Safety Net

If you use React, Vue, or Angular, you already have significant XSS protection -- these frameworks escape output by default. But the escape hatches are real and dangerous:

```js
// React -- this is the equivalent of innerHTML
// Only use with sanitized content
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userHTML) }} />
```

The name `dangerouslySetInnerHTML` is intentional. React is warning you. Listen to it.

---

## 2. CSRF and Injection

### Cross-Site Request Forgery (CSRF)

CSRF exploits the fact that browsers automatically attach cookies to every request to a domain. If you are logged into your bank and visit a malicious page, that page can submit a form to your bank's transfer endpoint -- and your browser will helpfully include your session cookie.

```mermaid
sequenceDiagram
    participant User as User (logged into bank)
    participant Evil as evil-site.com
    participant Bank as bank.com

    User->>Evil: Visits malicious page
    Evil->>Bank: Hidden form POST /transfer (amount=10000&to=attacker)
    Note over Bank: Browser attaches bank.com cookies automatically
    Bank->>Bank: Processes transfer as authenticated user
```

The attacker never sees the cookie. They do not need to. The browser sends it on their behalf.

### SameSite Cookies

The modern fix is the `SameSite` cookie attribute:

```js
// Express session configuration
app.use(
  session({
    cookie: {
      sameSite: "lax", // or 'strict'
      secure: true, // HTTPS only
      httpOnly: true, // no JavaScript access
    },
  })
);
```

- **`Strict`**: The cookie is never sent on cross-site requests. Maximum protection, but breaks legitimate flows like clicking a link from an email.
- **`Lax`**: The cookie is sent on top-level navigations (clicking a link) but not on embedded requests (forms, iframes, AJAX). This is the sweet spot for most apps.
- **`None`**: The old behavior. Requires `Secure` flag. Only use if you genuinely need cross-site cookie access.

> **Note:** `HttpOnly` in the example above prevents JavaScript from reading the cookie via `document.cookie`. This means even if an XSS attack succeeds, the attacker cannot exfiltrate the session cookie directly. Always set this on session cookies.

### CSRF Tokens

For apps that need to support older browsers or want defense in depth, CSRF tokens remain effective:

```js
// Server generates a unique token per session
const csrfToken = crypto.randomUUID();
req.session.csrfToken = csrfToken;

// Embed in forms
// <input type="hidden" name="_csrf" value="${csrfToken}">

// Validate on submission
app.post("/transfer", (req, res) => {
  if (req.body._csrf !== req.session.csrfToken) {
    return res.status(403).send("Invalid CSRF token");
  }
  // Process the request
});
```

The attacker cannot read the token from your page (same-origin policy prevents that), so they cannot include it in their forged request.

### SQL Injection

Injection attacks happen when you build queries by concatenating user input:

```js
// VULNERABLE -- classic SQL injection
const query = `SELECT * FROM users WHERE name = '${userInput}'`;
// If userInput is: ' OR '1'='1' --
// Query becomes: SELECT * FROM users WHERE name = '' OR '1'='1' --'
// Returns ALL users
```

The fix is **parameterized queries**. Every database library supports them:

```js
// SAFE -- parameterized query (node-postgres)
const result = await pool.query(
  "SELECT * FROM users WHERE name = $1",
  [userInput]
);

// SAFE -- Prisma ORM (parameterized by default)
const user = await prisma.user.findMany({
  where: { name: userInput },
});

// SAFE -- Knex query builder
const user = await knex("users").where("name", userInput);
```

The database treats the parameter as a value, not as part of the SQL syntax. Even if the user types `'; DROP TABLE users; --`, it is treated as a literal string to search for.

> **This applies to every query language**, not just SQL. NoSQL injection exists too. If you are building MongoDB queries from user input, use the driver's parameterization. If you are interpolating into GraphQL queries, use variables. The principle is universal: **never mix code and data in the same string**.

### Input Validation with Zod

Sanitization catches attacks. Validation prevents them from getting close. Validate every input at the boundary of your system:

```js
import { z } from "zod";

const TransferSchema = z.object({
  to: z.string().email(),
  amount: z.number().positive().max(10000),
  memo: z.string().max(200).optional(),
});

app.post("/transfer", (req, res) => {
  const result = TransferSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  // result.data is typed and validated
  processTransfer(result.data);
});
```

Zod gives you runtime type checking that matches your TypeScript types. If someone sends `amount: "DROP TABLE"`, it fails before your business logic ever sees it.

---

## 3. Authentication

Authentication is the highest-stakes code in your application. Get it wrong and everything else you built is meaningless -- the attacker walks in through the front door.

Here is the most important piece of advice in this entire chapter: **do not roll your own authentication**.

```mermaid
flowchart TD
    A["Need authentication?"] --> B{"Is this a learning project?"}
    B -->|Yes| C["Build it yourself to learn"]
    B -->|No| D{"Production app?"}
    D -->|Yes| E["Use a proven solution"]
    E --> F["Clerk"]
    E --> G["Auth.js / NextAuth"]
    E --> H["Supabase Auth"]
    E --> I["Firebase Auth"]
    C --> J["Then replace it before shipping"]
```

This is not elitism. Authentication involves session management, password hashing, token rotation, rate limiting, account recovery, multi-factor authentication, brute force protection, timing attack prevention, and dozens of edge cases that have tripped up companies with dedicated security teams. A mature library has already been attacked, reported, patched, and hardened. Your weekend implementation has not.

### If You Must Handle Passwords

Sometimes you are maintaining legacy code, or the learning exercise demands it. In that case, these are the non-negotiable rules:

**Never store plaintext passwords.** Never store them with MD5, SHA-1, or SHA-256 either. Those are fast hashes designed for file integrity -- an attacker with a GPU can brute-force billions per second.

Use **bcrypt** or **argon2**. These are deliberately slow, memory-hard hashing algorithms designed for passwords:

```js
import bcrypt from "bcrypt";

// Hashing a password (registration)
const saltRounds = 12; // Higher = slower = more secure
const hash = await bcrypt.hash(password, saltRounds);
// Store `hash` in the database, never the password

// Verifying a password (login)
const isValid = await bcrypt.compare(submittedPassword, storedHash);
```

```js
import argon2 from "argon2";

// Argon2 is the newer, recommended choice
const hash = await argon2.hash(password);
const isValid = await argon2.verify(hash, submittedPassword);
```

> **Gotcha:** `bcrypt.compare` is constant-time, meaning it takes the same amount of time whether the password is wrong on the first character or the last. This prevents timing attacks where an attacker measures response times to guess passwords character by character. Never write your own comparison with `===`.

### Tokens and Sessions

Whether you use JWTs or server-side sessions, the rules are the same:

```js
// Short-lived access tokens
const accessToken = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "15m" } // Short! Not "30d"
);

// Longer-lived refresh tokens (stored securely)
const refreshToken = crypto.randomBytes(64).toString("hex");
// Store in HttpOnly cookie or secure server-side storage
```

Keep access tokens short-lived (15 minutes or less). Use refresh tokens to issue new access tokens. If a token is compromised, the damage window is small.

**Always use HTTPS.** Without it, every token, cookie, and password flies across the network in plaintext. In 2026, there is zero excuse -- Let's Encrypt is free, and every hosting platform enables HTTPS by default. HTTP in production is malpractice.

### CORS: Controlling Who Talks to Your API

Cross-Origin Resource Sharing is not authentication, but misconfiguring it can undermine everything else:

```js
import cors from "cors";

// BAD -- allows any origin
app.use(cors());

// GOOD -- explicit allowlist
app.use(
  cors({
    origin: ["https://myapp.com", "https://staging.myapp.com"],
    credentials: true, // if you send cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
```

Setting `origin: "*"` with `credentials: true` is the equivalent of leaving your front door open with a sign saying "take whatever you want." Be explicit about which domains can access your API.

### Rate Limiting

Even perfect authentication is vulnerable to brute force without rate limiting:

```js
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: "Too many login attempts. Try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/login", loginLimiter, loginHandler);
```

Five login attempts per 15-minute window is reasonable. An attacker trying thousands of passwords per second gets stopped cold. A legitimate user who mistyped their password five times gets a clear message to wait.

---

## 4. Dependencies and Secrets

Your application is not just the code you write. It is every line of code in every package in your `node_modules` folder. A typical React app has hundreds of dependencies, each one a potential attack vector.

```mermaid
flowchart TD
    A["Your App"] --> B["12 direct dependencies"]
    B --> C["847 transitive dependencies"]
    C --> D["Any ONE of these can be compromised"]
    D --> E["Supply chain attack"]
```

### npm audit and Beyond

The `npm audit` command scans your dependency tree against a database of known vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Automatically fix what can be fixed
npm audit fix

# See what would change without applying
npm audit fix --dry-run
```

This is a minimum. For production applications, you need continuous monitoring:

- **Dependabot** (GitHub): Automatically opens pull requests to update vulnerable dependencies. Free for all GitHub repos. Enable it in your repository settings and it will watch your `package-lock.json` like a hawk.
- **Snyk**: Deeper analysis, with fix suggestions and monitoring for license compliance issues. Integrates into CI/CD pipelines.
- **Socket.dev**: Focuses specifically on supply-chain attacks -- detects when a package suddenly adds network calls, filesystem access, or obfuscated code.

> **Make this automatic.** If you rely on someone remembering to run `npm audit` manually, it will not happen consistently. Put it in your CI pipeline and fail the build on critical vulnerabilities.

### Typosquatting

This is sneakier than it sounds. An attacker publishes a package called `expresss` (three s's), `lodahs`, or `react-dom-utils` hoping developers will mistype their install command:

```bash
# Intended
npm install express

# Typosquatted -- malicious package
npm install expresss
```

The malicious package might look identical to the real one but includes a postinstall script that exfiltrates environment variables, installs a cryptocurrency miner, or opens a backdoor.

**Defenses:**
- Double-check package names before installing
- Verify the publisher and download count on npmjs.com
- Use `npm install --ignore-scripts` and review postinstall scripts before running them
- Lock your dependencies with `package-lock.json` and commit it to version control

### Prototype Pollution

This is a JavaScript-specific attack that exploits the prototype chain:

```js
// A vulnerable merge function
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === "object") {
      target[key] = merge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Attacker sends this as JSON input
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
merge({}, malicious);

// Now EVERY object in the application has isAdmin = true
const user = {};
console.log(user.isAdmin); // true -- catastrophic
```

The fix is to reject `__proto__`, `constructor`, and `prototype` keys when merging objects, or better yet, use `Object.create(null)` for dictionaries and validate input shapes with Zod before processing.

### Never Use eval()

`eval()` executes arbitrary strings as JavaScript. It is a direct code injection vector:

```js
// NEVER do this
const userExpression = getUserInput();
eval(userExpression); // User controls what code runs

// Also avoid these
new Function(userInput)();
setTimeout(userInput, 1000); // String form of setTimeout is eval
```

There is almost no legitimate use case for `eval` in application code. If you think you need it, you almost certainly need `JSON.parse`, a proper template engine, or a redesigned approach.

### Secrets Management

Secrets are API keys, database passwords, JWT signing keys, and third-party credentials. They do not belong in your code:

```bash
# .env file (NEVER committed to git)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=a-very-long-random-string-generated-by-crypto
STRIPE_SECRET_KEY=sk_live_...
```

```js
// Access via process.env
import dotenv from "dotenv";
dotenv.config();

const db = new Pool({ connectionString: process.env.DATABASE_URL });
```

Your `.gitignore` must include `.env` from day one:

```gitignore
# .gitignore
.env
.env.local
.env.production
```

> **Gotcha:** If you accidentally commit a secret and then remove it in a later commit, it is still in your git history. Anyone with repository access can find it. If this happens, consider the secret compromised -- rotate it immediately. Tools like `git-secrets` and `truffleHog` can scan your history for accidentally committed credentials.

For production deployments, use your platform's secrets management -- Vercel Environment Variables, AWS Secrets Manager, or Doppler. These inject secrets at runtime without them ever touching your codebase or build artifacts.

### The Security Checklist

Security is not a feature you add at the end. It is a practice woven into every decision. Here is your minimum viable security posture:

```mermaid
flowchart TD
    A["Security Essentials Checklist"] --> B["Input"]
    A --> C["Auth"]
    A --> D["Transport"]
    A --> E["Dependencies"]
    A --> F["Secrets"]

    B --> B1["Validate with Zod at boundaries"]
    B --> B2["Sanitize HTML with DOMPurify"]
    B --> B3["Use textContent, not innerHTML"]
    B --> B4["Parameterize all queries"]

    C --> C1["Use Clerk / Auth.js / Supabase"]
    C --> C2["bcrypt or argon2 for passwords"]
    C --> C3["Short-lived tokens"]
    C --> C4["Rate limit login endpoints"]

    D --> D1["HTTPS everywhere"]
    D --> D2["SameSite + HttpOnly cookies"]
    D --> D3["Strict CORS allowlist"]
    D --> D4["CSP headers"]

    E --> E1["npm audit in CI"]
    E --> E2["Dependabot or Snyk enabled"]
    E --> E3["Verify packages before install"]
    E --> E4["No eval, ever"]

    F --> F1[".env in .gitignore"]
    F --> F2["Platform secrets for production"]
    F --> F3["Rotate if exposed"]
    F --> F4["Never log secrets"]
```

Every item on this list has been learned through real breaches that cost real companies real money. The good news is that none of them are hard to implement. The bad news is that skipping even one can be enough for an attacker to get in.