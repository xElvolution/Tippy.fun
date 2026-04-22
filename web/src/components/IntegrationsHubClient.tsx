'use client';

import { publicBotInstallUrl, publicDiscordUrl, publicTelegramUrl } from '@/lib/siteLinks';

export function IntegrationsHubClient() {
  const botInstall = publicBotInstallUrl();
  const discord = publicDiscordUrl();
  const telegram = publicTelegramUrl();

  return (
    <main className="max-w-5xl mx-auto px-8 py-12 pb-16">
      <header className="mb-12">
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-4">
          Install the bots
        </h1>
        <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
          Tippy ships a Discord bot (and Telegram bot, coming soon) that lets your community submit
          and collect tips straight from chat. Both connect to the same TippyMaker contract your
          dashboard already uses. No extra custody.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IntegrationCard
          title="Discord bot"
          body="Install the Tippy bot in your guild to run /tip, /register, and /balance. Submissions land in Supabase and on-chain just like the web flow."
          icon="forum"
          primary={{
            href: botInstall || discord,
            label: botInstall ? 'Open install page' : 'Install on Discord',
            disabled: !(botInstall || discord),
          }}
        />
        <IntegrationCard
          title="Telegram bot"
          body="Drop the Tippy bot into a channel or group to reward submissions. Mini-app flow for claim + tip is on the roadmap."
          icon="send"
          primary={{
            href: telegram,
            label: telegram ? 'Open on Telegram' : 'Link coming soon',
            disabled: !telegram,
          }}
        />
      </div>

      <section className="mt-16 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-6 py-8">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Why a bot?</h2>
        <p className="mt-2 text-on-surface-variant max-w-2xl">
          Most campaigns happen in community chat, not on a dashboard. The bots give participants a
          zero-click path to submit proof and claim rewards, while organizers get the same
          on-chain guarantees from TippyMaker.
        </p>
      </section>

      {!botInstall && !discord && !telegram ? (
        <p className="mt-10 text-sm text-on-surface-variant">
          Admin note: set{' '}
          <code className="font-mono">NEXT_PUBLIC_TIPPY_BOT_INSTALL_URL</code>,{' '}
          <code className="font-mono">NEXT_PUBLIC_TIPPY_DISCORD_URL</code>, and{' '}
          <code className="font-mono">NEXT_PUBLIC_TIPPY_TELEGRAM_URL</code> in{' '}
          <code className="font-mono">web/.env.local</code> to activate these buttons.
        </p>
      ) : null}
    </main>
  );
}

function IntegrationCard({
  title,
  body,
  icon,
  primary,
}: {
  title: string;
  body: string;
  icon: string;
  primary: { href: string; label: string; disabled: boolean };
}) {
  const cta = primary.disabled ? (
    <span className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high text-on-surface/60 px-5 py-3 text-sm font-bold cursor-not-allowed">
      {primary.label}
    </span>
  ) : (
    <a
      href={primary.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-3 text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
    >
      {primary.label}
      <span className="material-symbols-outlined text-base">open_in_new</span>
    </a>
  );

  return (
    <article className="bg-surface-container-lowest rounded-2xl p-8 flex flex-col gap-6 border border-outline-variant/15">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-3xl" aria-hidden>
            {icon}
          </span>
        </div>
        <h3 className="font-headline text-2xl font-bold text-on-surface">{title}</h3>
      </div>
      <p className="text-on-surface-variant leading-relaxed">{body}</p>
      <div>{cta}</div>
    </article>
  );
}
