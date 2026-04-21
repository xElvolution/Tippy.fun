# Discord setup for Tippy

This guide walks through everything you need in the **Discord Developer Portal** so the Tippy bot can run and register slash commands.

You will end up with:

| Env variable | What it is |
|--------------|------------|
| `DISCORD_CLIENT_ID` | Your application’s **Application ID** (same as “OAuth2 Client ID”) |
| `DISCORD_BOT_TOKEN` | The **bot token** (secret - never commit or paste publicly) |
| `DISCORD_GUILD_ID` | *(Optional but recommended for dev)* Your test server’s ID - slash commands appear **immediately** in that server |

If you add **Discord login** on the web app later, you will also use **OAuth2 Client Secret** (`DISCORD_CLIENT_SECRET`) - not required for the bot alone.

---

## Start here (simplest order)

Do these in order. Skip a step if you already did it.

| Step | Where in the portal | What to do |
|------|---------------------|------------|
| **1** | [Applications](https://discord.com/developers/applications) | **New Application** → name it → create. |
| **2** | **General Information** | Copy **Application ID** → that’s `DISCORD_CLIENT_ID` in your `.env`. |
| **3** | **Bot** (left sidebar) | **Only if you see “Add Bot”:** click it → confirm. *(If you don’t see it, you already have a bot - go to step 4.)* |
| **4** | Same **Bot** page, **scroll to the top** | Under **Token**, copy or **Reset Token** → that’s `DISCORD_BOT_TOKEN`. |
| **5** | **OAuth2** → **URL Generator** | Scopes: **`bot`** + **`applications.commands`**. Bot permissions: same five as [§2c](#2c-bot-permissions--what-to-select-permission-calculator). Copy the **Generated URL**, open it in a browser, pick your server, authorize. |

After that, set `DISCORD_GUILD_ID` (optional, [§4](#4-recommended-discord_guild_id-for-development)) and run `pnpm dev:bot` ([§6](#6-run-the-bot-and-verify)).

The sections below explain the same things with more detail if something is confusing.

---

## Bot page: Add Bot, token, and Save

Discord **does not** say **Create Bot**. The button is **Add Bot**, and it only shows **once**, before your app has a bot user.

- **If you already see Bot Permissions / Token / username** (like your screenshot) → the bot **exists**. **Add Bot** will not appear again. That is expected.
- **Token:** Scroll **up** on the **Bot** page. **Token** is near the top (above intents and the permission grid). Use **Reset Token** or **Copy** → `DISCORD_BOT_TOKEN`.
- **Save Changes:** Discord only asks you to save when you change something that must persist (e.g. **Privileged Gateway Intents**, bot **username**). Look for a green **Save Changes** bar at the **bottom** of the portal; scroll down if needed.
- **Permissions Integer** (e.g. `2147568640`): fine for reference. **Adding the bot to your server** is done with **OAuth2 → URL Generator** → open the **Generated URL** in a browser. Ticking boxes on the Bot page alone does not “install” the bot; the invite URL does.

---

## 1. Create an application

1. Open the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application**, give it a name (e.g. `Tippy`), accept the terms, create it.
3. You are on the app’s **General Information** page.

**`DISCORD_CLIENT_ID`**  
Under **Application ID**, click **Copy**. That value is your `DISCORD_CLIENT_ID` in `.env` / `.env.local`.

---

## 2. Create the bot user and get the token

1. In the left sidebar, open **Bot**.
2. If you see **Add Bot** (not “Create Bot”) → click it → **Yes, do it!** If that button is missing, the bot already exists - see **[Bot page: Add Bot, token, and Save](#bot-page-add-bot-token-and-save)** above.
3. **Scroll to the top** of the Bot page. Under **Token**, click **Reset Token** (or **View Token** the first time) and copy it.

**`DISCORD_BOT_TOKEN`**  
Paste that token into `DISCORD_BOT_TOKEN` in your env file.

**Security**

- Anyone with the token can control your bot. **Do not** commit it to git or share it in screenshots/Discord chats.
- If it leaks, use **Reset Token** again and update your `.env`.

**Privileged Gateway Intents** (optional for Tippy v1)

- Tippy’s bot code uses **slash commands** and only enables the **Guilds** intent by default.
- You do **not** need **Message Content Intent** unless you add features that read normal message text.
- Leave other intents off unless you know you need them.

---

## 2b. App settings: URLs (Interactions, Linked Roles, Terms, Privacy)

You may see these fields under your application (e.g. **General Information**, **Installation**, or **Interactions** depending on Discord’s layout). Here’s what they mean for **Tippy**.

| Field | What Discord uses it for | What to do for Tippy |
|--------|---------------------------|------------------------|
| **Interactions Endpoint URL** | Discord **POST**s slash-command / button interactions to this **HTTPS** URL (HTTP mode). Used for **serverless** bots (Vercel, Workers, etc.) that **do not** keep a WebSocket open. | **Leave empty.** Tippy’s bot uses **discord.js + the Gateway** (your `pnpm dev:bot` process). No public interaction URL is required. Only fill this if you rewrite the bot to **Interactions over HTTP**. |
| **Linked Roles Verification URL** | For **Linked Roles**: Discord sends users here to verify identity before granting a special role. | **Leave empty** unless you build that feature. |
| **Terms of Service URL** | Public legal page for your app. | **Leave empty** for private / hackathon use. Add a real URL if you publish the bot broadly or apply for **verification**. |
| **Privacy Policy URL** | Public privacy page. | Same as Terms - **optional** until you need compliance or verification. |

**Summary:** For the current Tippy repo, you can **leave all of those URLs blank** and run the bot locally with the token + Gateway.

---

## 2c. Bot permissions - what to select (permission calculator)

The portal’s **Bot Permissions** grid builds a **permissions integer** for the invite link. Below is what Tippy actually needs.

### Check these (recommended minimum)

| Section | Permission | Why |
|---------|------------|-----|
| **General** | **View Channels** | Bot can see channels it’s allowed into (required for normal behavior). |
| **Text** | **Send Messages** | Public replies and some interaction responses need the bot to send messages in the channel. |
| **Text** | **Embed Links** | `/help`, `/tip`, and other replies use **embeds**. |
| **Text** | **Read Message History** | *(Optional but useful)* Helps in channels where context/history matters. |
| **Text** | **Use Slash Commands** | Lets the bot operate in line with channel rules for **application commands**; good to enable on real servers. |

### Do **not** need for Tippy

- **Administrator** - avoid on production; only for a throwaway private server if you’re debugging permissions.
- **Manage Server**, **Manage Roles**, **Manage Channels**, **Kick/Ban Members**, **Moderate Members**, etc. - Tippy does not manage the server.
- **Voice** permissions - not used unless you add voice features later.

### After you tick the boxes

Copy the **Generated URL** from **OAuth2 → URL Generator** (with scopes `bot` + `applications.commands`), not only this calculator page - the calculator is just to pick the permission bitmask that appears in that URL.

---

## 3. Invite the bot to your server

You need two **OAuth2 scopes**:

- `bot` - the bot user joins the server  
- `applications.commands` - slash commands (`/register`, `/tip`, etc.) can be registered and used  

**Using the URL Generator (easiest)**

1. In the portal, go to **OAuth2** → **URL Generator**.
2. Under **Scopes** (the big checkbox grid at the top - *not* “Bot Permissions” below), check exactly these two:
   - `bot` - usually in the **left** column  
   - `applications.commands` - usually in the **right** column (portal layout can vary; it is **not** the same as `applications.commands.permissions.update`, which is a different, longer name in the **left** column - **do not** use that one for a normal Tippy invite)

   **If you still can’t see it:** Press **Ctrl+F** (Windows) or **Cmd+F** (Mac) on the URL Generator page and search for `applications.commands` - pick the **short** label with **no** `.permissions.update` on the end.

3. Under **Bot Permissions**, enable the same set as **[§2c Bot permissions](#2c-bot-permissions--what-to-select-permission-calculator)** (at minimum: **View Channels**, **Send Messages**, **Embed Links**; plus **Read Message History** and **Use Slash Commands** as recommended).  
   For a **personal dev server** only, some people temporarily use **Administrator** to debug - **do not** use that on public production servers.
4. Copy the **Generated URL** at the bottom, open it in a browser, choose your server, authorize.

You must have **Manage Server** (or **Administrator**) on the server you pick, or you cannot add the bot.

### “Please enter a redirect URI” / no link in Generated URL

That usually means one of these:

1. **Wrong scope** - If only **`applications.commands.permissions.update`** is checked, **uncheck it**. It is **not** enough and it is **not** the same as **`applications.commands`**. You must check **`bot`** and the **short** **`applications.commands`** (see step 2 above). Until **`bot`** is checked, many layouts will not behave like a normal bot invite.

2. **Integration Type = Guild Install** - Discord may ask you to **pick a Redirect URI** from a dropdown before it fills the box. If the dropdown says **No results found**:
   - Go to **OAuth2** → **General** (not URL Generator).
   - Under **Redirects**, click **Add Redirect** and add something simple you own, e.g. `http://localhost:3000` or `http://127.0.0.1` (fine for this step - you only need it so the portal can build the link).
   - **Save Changes**, go back to **URL Generator**, refresh if needed, then choose that redirect in **Select redirect URI**.

3. **Skip the generator** - If the portal still won’t show a link, use a hand-built invite URL (same result as the generator when scopes and permissions match):

   ```text
   https://discord.com/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=2147568640&scope=bot%20applications.commands
   ```

   Replace **`YOUR_APPLICATION_ID`** with your **Application ID** (same as `DISCORD_CLIENT_ID`).  
   **`2147568640`** is the permissions integer for: *View Channels*, *Send Messages*, *Embed Links*, *Read Message History*, *Use Slash Commands* (see [§2c](#2c-bot-permissions--what-to-select-permission-calculator)). If you used different bot permissions on the **Bot** page calculator, paste **your** Permissions Integer instead.

   Open that URL in a browser, pick your server, authorize.

---

## 4. (Recommended) `DISCORD_GUILD_ID` for development

Slash commands can be registered **globally** (slow to update, up to ~1 hour) or **per guild** (usually **instant**).

Tippy’s bot uses `DISCORD_GUILD_ID` when set: it registers commands only to that server so you see `/register`, `/tip`, etc. right away.

**How to get a server (guild) ID**

1. In the Discord **desktop or web** app, enable **Developer Mode**:  
   **User Settings** → **App Settings** → **Advanced** → turn on **Developer Mode**.
2. Right‑click your **server icon** (left sidebar) → **Copy Server ID**.
3. Put that in `DISCORD_GUILD_ID`.

**If you omit `DISCORD_GUILD_ID`**

- Commands are registered **globally**. They can take a long time to show up.  
- Fine for production-style deploys; annoying for local iteration.

---

## 5. Put it in your env file

Example (`.env` or `.env.local` - whichever you use; **do not** commit):

```env
DISCORD_CLIENT_ID=your_application_id_here
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_SECRET=your_oauth2_client_secret_here
DISCORD_GUILD_ID=your_server_id_here
# Same Application ID - public; powers the Next.js “Add to Discord” button
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_application_id_here
NEXTAUTH_SECRET=random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

The **bot process** (`pnpm dev:bot` / `pnpm dev:all`) loads **`.env`** then **`.env.local`** from the project root (`.env.local` wins on duplicate keys). Put `DISCORD_GUILD_ID` and tokens in either file.

To push slash commands once without keeping the bot online: `pnpm register-commands` (same env files).

---

## 6. Run the bot and verify

From the project root:

```bash
pnpm dev:bot
```

or

```bash
pnpm dev:all
```

You should see a log like `Logged in as YourBot#1234` and a line about **Registered slash commands** for your guild (if `DISCORD_GUILD_ID` is set).

In Discord, type `/` in your server - you should see **Tippy** commands (`/ping`, `/register`, `/help`, etc.).

---

## Troubleshooting

| Problem | What to try |
|--------|----------------|
| URL Generator shows **Please enter a redirect URI** / empty link | Check **`bot`** + **`applications.commands`** (not `applications.commands.permissions.update`). Add a **Redirect** under **OAuth2 → General**, then select it on URL Generator - or use the **hand-built invite URL** in [§3](#3-invite-the-bot-to-your-server). |
| No slash commands appear | Set `DISCORD_GUILD_ID`, restart the bot, wait a minute. Confirm invite used **`applications.commands`**. |
| `401` / invalid token | Regenerate **Bot Token** in the portal; update `DISCORD_BOT_TOKEN`. |
| Bot online but “Unknown interaction” / errors | Often version mismatch or duplicate bots - remove old bot invites, re-invite with the correct application. |
| Commands show for you but not others | Check channel **Permissions** - users need permission to use application commands in that channel. |
| After Discord login, URL has **`error=OAuthCallback`** | Discord **rejected the token exchange**. Most often: wrong **`DISCORD_CLIENT_SECRET`** (must be **OAuth2 → General → Client Secret**, not the bot token), **extra spaces** in `.env` (fixed if you trim/re-copy), **redirect URI** not exactly `http://localhost:3000/api/auth/callback/discord` (same host as `NEXTAUTH_URL` - not `127.0.0.1` vs `localhost` mix), or **reset secret** in the portal without updating `.env`. Restart `pnpm dev` after changes. Set `NEXTAUTH_DEBUG=true` once to print details in the terminal. |

---

## 7. Web dashboard: “Log in with Discord” (NextAuth)

The Next.js app uses **NextAuth** with the Discord provider. Judges (and you) must complete OAuth on Discord’s site - not a fake one-click login.

1. **OAuth2** → **General** → **Redirects** → **Add Redirect**  
   - Local: `http://localhost:3000/api/auth/callback/discord`  
   - Production: `https://YOUR_DOMAIN/api/auth/callback/discord`  
   Save changes.

2. Copy **Client Secret** from the same page → `DISCORD_CLIENT_SECRET` in `.env` / `.env.local` (server-only; never commit).

3. In env, also set:
   - `NEXTAUTH_URL` - must match the **exact** URL you use in the browser (including host). **`http://localhost:3000` and `http://127.0.0.1:3000` use different cookies** - pick one and stick to it; add both redirect URIs in the portal if you switch.
   - `NEXTAUTH_SECRET` - random string (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)

`DISCORD_CLIENT_SECRET` and `NEXTAUTH_SECRET` are **not** the bot token. The bot still only needs **Bot Token + Client ID** for `pnpm dev:bot`.

---

## Quick links

- [Developer Portal - Applications](https://discord.com/developers/applications)  
- [Discord.js Guide - Slash commands](https://discordjs.guide/creating-your-bot/slash-commands.html)  
- [Discord Permission Calculator](https://discordapi.com/permissions.html) (third-party; useful for picking bot permission integers)
