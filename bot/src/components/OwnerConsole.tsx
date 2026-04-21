'use client';

import React from 'react';
import { Coins, Plus, FileText, Rocket, TrendingUp, Info, MessageSquare, Bell, Shield, Send } from 'lucide-react';
import { Button, Card, Badge, Modal } from './UI';
import type { ConsoleOverviewPayload, ConsoleEcosystem, Project } from '@/types/types';

const selectClass =
  'w-full rounded-xl bg-surface-container-high border border-outline-variant/30 px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40';

function formatCompactCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1e3).toFixed(1)}k`;
  return n.toLocaleString();
}

function ecosystemsToProjects(ecosystems: ConsoleEcosystem[]): Project[] {
  return ecosystems.map(({ currencies: _c, ...p }) => p);
}

/** Every manageable guild from Discord list, merged with overview stats so CSV is never a single row by accident. */
function projectsForFullCsvExport(ecosystems: ConsoleEcosystem[], guildOptions: { id: string; name: string }[]): Project[] {
  const fromEco = ecosystemsToProjects(ecosystems);
  const byId = new Map(fromEco.map((p) => [p.id, p]));
  for (const g of guildOptions) {
    if (!byId.has(g.id)) {
      byId.set(g.id, {
        id: g.id,
        name: g.name,
        ticker: '—',
        members: null,
        pointsIssued: '0',
        activeCampaigns: 0,
        status: 'inactive',
        rails: ['CFX'],
      });
    }
  }
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function downloadGuildsCsv(guilds: Project[]) {
  const header = ['guild_id', 'name', 'members_approx', 'points_minted_display', 'point_currencies'];
  const lines = [header.join(',')];
  for (const g of guilds) {
    const row = [
      g.id,
      `"${g.name.replace(/"/g, '""')}"`,
      g.members ?? '',
      `"${g.pointsIssued}"`,
      g.activeCampaigns,
    ];
    lines.push(row.join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tippy-console-guilds-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function RegisterGuildForm({
  guildOptions,
  reauthGuilds,
  guildsError,
  registerGuildId,
  setRegisterGuildId,
  registerState,
  registerMsg,
  onRegister,
  envHint,
}: {
  guildOptions: { id: string; name: string }[];
  reauthGuilds: boolean;
  guildsError: string | null;
  registerGuildId: string;
  setRegisterGuildId: (v: string) => void;
  registerState: 'idle' | 'loading' | 'ok' | 'err';
  registerMsg: string | null;
  onRegister: () => void;
  envHint: string | null;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Pick a server you manage where the bot is already invited with{' '}
        <strong className="text-on-surface">applications.commands</strong>, then register so{' '}
        <code className="text-xs bg-surface-container-high px-1 rounded">/points</code>,{' '}
        <code className="text-xs bg-surface-container-high px-1 rounded">/tip</code>, etc. appear (usually within a minute).
      </p>
      {envHint ? (
        <p className="text-xs text-on-surface-variant">
          Default guild in <code className="bg-surface-container-high px-1 rounded">.env</code>:{' '}
          <span className="font-mono text-on-surface">{envHint}</span>
        </p>
      ) : null}
      {guildsError ? <p className="text-sm text-error">{guildsError}</p> : null}
      {reauthGuilds ? (
        <p className="text-sm text-on-surface-variant">
          <Button variant="outline" className="inline-flex" href="/api/auth/signout" target="_self" rel="noopener">
            Sign out and sign in
          </Button>{' '}
          to grant the Discord <code className="text-xs bg-surface-container-high px-1">guilds</code> scope.
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <label className="flex flex-col gap-2 flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Discord server</span>
            <select
              className={selectClass}
              value={registerGuildId}
              onChange={(e) => setRegisterGuildId(e.target.value)}
            >
              {guildOptions.length === 0 ? (
                <option value="">No manageable servers</option>
              ) : (
                <>
                  <option value="">Choose server…</option>
                  {guildOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </label>
          <Button className="shrink-0" disabled={!registerGuildId || registerState === 'loading'} onClick={onRegister}>
            {registerState === 'loading' ? 'Registering…' : 'Register guild'}
          </Button>
        </div>
      )}
      {registerMsg ? (
        <p className={`text-sm font-medium ${registerState === 'ok' ? 'text-tertiary' : 'text-error'}`}>{registerMsg}</p>
      ) : null}
    </div>
  );
}

export const OwnerConsole = () => {
  const [view, setView] = React.useState<'dashboard' | 'manage'>('dashboard');
  const [manageGuildId, setManageGuildId] = React.useState<string | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = React.useState(false);
  const [airdropDevVisible, setAirdropDevVisible] = React.useState(false);

  const [overview, setOverview] = React.useState<ConsoleOverviewPayload | null>(null);
  const [overviewLoading, setOverviewLoading] = React.useState(true);
  const [overviewErr, setOverviewErr] = React.useState<string | null>(null);

  const [guildOptions, setGuildOptions] = React.useState<{ id: string; name: string }[]>([]);
  const [guildsReauth, setGuildsReauth] = React.useState(false);
  const [guildsFetchErr, setGuildsFetchErr] = React.useState<string | null>(null);

  const [registerGuildId, setRegisterGuildId] = React.useState('');
  const [registerState, setRegisterState] = React.useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [registerMsg, setRegisterMsg] = React.useState<string | null>(null);

  const [manageCmdBusy, setManageCmdBusy] = React.useState<'reg' | 'unreg' | null>(null);
  const [manageCmdMsg, setManageCmdMsg] = React.useState<string | null>(null);
  const [manageCmdOk, setManageCmdOk] = React.useState(false);

  const [ptName, setPtName] = React.useState('');
  const [ptSymbol, setPtSymbol] = React.useState('');
  const [ptCap, setPtCap] = React.useState('');
  const [ptBusy, setPtBusy] = React.useState(false);
  const [ptMsg, setPtMsg] = React.useState<string | null>(null);

  const loadOverview = React.useCallback(() => {
    setOverviewLoading(true);
    setOverviewErr(null);
    fetch('/api/me/console/overview')
      .then(async (res) => {
        const json = (await res.json()) as ConsoleOverviewPayload & { error?: string };
        if (!res.ok) throw new Error(json.error || res.statusText);
        return json;
      })
      .then(setOverview)
      .catch((e: Error) => setOverviewErr(e.message))
      .finally(() => setOverviewLoading(false));
  }, []);

  React.useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const submitPointCurrency = React.useCallback(async () => {
    const gid = manageGuildId;
    if (!gid || ptBusy) return;
    const name = ptName.trim();
    const symbol = ptSymbol.trim();
    const cap = ptCap.trim();
    if (!name || !symbol || !cap) {
      setPtMsg('Fill in name, symbol, and cap.');
      return;
    }
    setPtBusy(true);
    setPtMsg(null);
    try {
      const res = await fetch('/api/me/console/point-currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: gid, name, symbol, cap }),
      });
      const j = (await res.json()) as {
        error?: string;
        currency?: { name: string; symbol: string };
        masterTipTx?: string | null;
        masterTipError?: string | null;
      };
      if (!res.ok) throw new Error(j.error || res.statusText);
      let m = `Created **${j.currency?.name}** (${j.currency?.symbol}) — saved in Supabase.`;
      if (j.masterTipTx) {
        m += ` MasterTip tx \`${j.masterTipTx}\`.`;
      } else if (j.masterTipError) {
        m += ` On-chain: ${j.masterTipError}`;
      }
      setPtMsg(m);
      setPtName('');
      setPtSymbol('');
      setPtCap('');
      loadOverview();
    } catch (e) {
      setPtMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setPtBusy(false);
    }
  }, [manageGuildId, ptName, ptSymbol, ptCap, ptBusy, loadOverview]);

  React.useEffect(() => {
    fetch('/api/me/discord-guilds')
      .then(async (r) => {
        const j = (await r.json()) as { reauthRequired?: boolean; guilds?: { id: string; name: string }[]; error?: string };
        if (!r.ok) {
          setGuildsFetchErr(j.error ?? r.statusText);
          setGuildOptions([]);
          return;
        }
        setGuildsReauth(j.reauthRequired === true);
        setGuildOptions(Array.isArray(j.guilds) ? j.guilds : []);
        setGuildsFetchErr(null);
      })
      .catch(() => {
        setGuildsFetchErr('Failed to load server list');
        setGuildOptions([]);
      });
  }, []);

  const openRegisterModal = () => {
    setRegisterGuildId('');
    setRegisterState('idle');
    setRegisterMsg(null);
    setRegisterModalOpen(true);
  };

  const closeRegisterModal = () => {
    setRegisterModalOpen(false);
  };

  const registerCommands = React.useCallback(() => {
    if (!registerGuildId) return;
    setRegisterState('loading');
    setRegisterMsg(null);
    fetch('/api/me/console/register-commands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guildId: registerGuildId }),
    })
      .then(async (res) => {
        const json = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(json.error || res.statusText);
      })
      .then(() => {
        setRegisterState('ok');
        setRegisterMsg('Registered. Slash commands should appear in that server within about a minute.');
        loadOverview();
      })
      .catch((e: Error) => {
        setRegisterState('err');
        setRegisterMsg(e.message);
      });
  }, [registerGuildId, loadOverview]);

  const postGuildCommand = (path: 'register-commands' | 'unregister-commands', guildId: string) => {
    setManageCmdBusy(path === 'register-commands' ? 'reg' : 'unreg');
    setManageCmdMsg(null);
    setManageCmdOk(false);
    return fetch(`/api/me/console/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guildId }),
    })
      .then(async (res) => {
        const json = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(json.error || res.statusText);
      })
      .then(() => {
        setManageCmdOk(true);
        setManageCmdMsg(
          path === 'register-commands'
            ? 'Slash commands registered for this server (may take up to a minute to appear).'
            : 'Guild slash commands removed for this server.',
        );
        loadOverview();
      })
      .catch((e: Error) => {
        setManageCmdOk(false);
        setManageCmdMsg(e.message);
      })
      .finally(() => {
        setManageCmdBusy(null);
      });
  };

  const openManage = (guildId: string) => {
    setManageGuildId(guildId);
    setManageCmdMsg(null);
    setManageCmdOk(false);
    setManageCmdBusy(null);
    setView('manage');
  };

  const networkLabel = overview?.network === 'mainnet' ? 'eSpace mainnet' : 'eSpace testnet';

  if (overviewLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-12 bg-surface-container-low rounded-lg w-1/2" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-surface-container-low rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-surface-container-low rounded-2xl" />
      </div>
    );
  }

  if (overviewErr) {
    return (
      <Card className="p-8 border-error/30">
        <p className="font-bold text-error mb-2">Console unavailable</p>
        <p className="text-sm text-on-surface-variant">{overviewErr}</p>
        <Button className="mt-4" variant="secondary" onClick={loadOverview}>
          Retry
        </Button>
      </Card>
    );
  }

  if (!overview) {
    return null;
  }

  if (overview.needsReauth) {
    return (
      <div className="space-y-8">
        <Card className="p-8 border-primary/30 max-w-xl">
          <p className="font-bold text-on-surface mb-2">Discord needs a fresh login</p>
          <p className="text-sm text-on-surface-variant mb-6">
            Sign out and sign in so Tippy can load the servers you manage and show real console data.
          </p>
          <Button variant="secondary" href="/api/auth/signout" target="_self" rel="noopener">
            Sign out
          </Button>
        </Card>
      </div>
    );
  }

  const projects = ecosystemsToProjects(overview.ecosystems);
  const csvRows = projectsForFullCsvExport(overview.ecosystems, guildOptions);
  const { stats } = overview;

  const selectedEcosystem =
    manageGuildId != null ? overview.ecosystems.find((e) => e.id === manageGuildId) ?? null : null;
  const manageName =
    selectedEcosystem?.name ?? guildOptions.find((g) => g.id === manageGuildId)?.name ?? 'Discord server';
  const manageProject: Project | null =
    selectedEcosystem != null
      ? ecosystemsToProjects([selectedEcosystem])[0]
      : manageGuildId != null
        ? {
            id: manageGuildId,
            name: manageName,
            ticker: '—',
            members: null,
            pointsIssued: '0',
            activeCampaigns: 0,
            status: 'inactive',
            rails: ['CFX'],
          }
        : null;
  const currenciesForManage = selectedEcosystem?.currencies ?? [];

  if (view === 'manage' && manageGuildId && manageProject) {
    return (
      <div className="space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-primary font-bold tracking-widest text-[0.6875rem] uppercase mb-2 block">Manage server</span>
            <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">{manageProject.name}</h1>
            <p className="text-xs font-mono text-outline mt-2">{manageGuildId}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setView('dashboard');
              setManageGuildId(null);
            }}
          >
            Back to console
          </Button>
        </header>

        <Card className="p-8 border-l-4 border-primary">
          <h3 className="text-lg font-bold font-headline mb-2">Slash commands</h3>
          <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
            Register puts Tippy&apos;s commands on this server. Unregister removes them (users lose slash commands until you register again).
          </p>
          {manageCmdMsg ? (
            <p className={`text-sm mb-4 font-medium ${manageCmdOk ? 'text-tertiary' : 'text-error'}`}>{manageCmdMsg}</p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button disabled={manageCmdBusy !== null} onClick={() => postGuildCommand('register-commands', manageGuildId)}>
              {manageCmdBusy === 'reg' ? 'Registering…' : 'Register slash commands'}
            </Button>
            <Button
              variant="error"
              disabled={manageCmdBusy !== null}
              onClick={() => {
                if (typeof window !== 'undefined' && !window.confirm('Remove all Tippy slash commands from this server?')) return;
                void postGuildCommand('unregister-commands', manageGuildId);
              }}
            >
              {manageCmdBusy === 'unreg' ? 'Removing…' : 'Unregister slash commands'}
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <Card className="p-8 border-l-2 border-primary/20">
              <h3 className="text-lg font-bold font-headline mb-2">Create token / tpoints</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                <strong className="text-on-surface">Discord server owners</strong> can create capped currencies here or with{' '}
                <strong className="text-on-surface">/points create</strong>. Each create is stored in Supabase (off-chain ledger); tips and withdrawals use{' '}
                <strong className="text-on-surface">Conflux eSpace</strong> (CFX / ERC-20).
              </p>
              {ptMsg ?
                <p
                  className={`text-sm mb-6 font-medium ${ptMsg.includes('Created') ? 'text-tertiary' : 'text-error'}`}
                >
                  {ptMsg}
                </p>
              : null}
              {currenciesForManage.length > 0 ? (
                <div className="mb-8 overflow-x-auto rounded-xl border border-outline-variant/10">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] uppercase tracking-widest text-outline border-b border-outline-variant/10">
                      <tr>
                        <th className="p-3 font-bold">Symbol</th>
                        <th className="p-3 font-bold">Name</th>
                        <th className="p-3 font-bold">Minted</th>
                        <th className="p-3 font-bold">Cap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currenciesForManage.map((c) => (
                        <tr key={c.id} className="border-b border-outline-variant/5 last:border-0">
                          <td className="p-3 font-mono font-bold">{c.symbol}</td>
                          <td className="p-3">{c.name}</td>
                          <td className="p-3 font-mono">{c.minted_total}</td>
                          <td className="p-3 font-mono">{c.cap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant mb-8">No point currencies in this server yet. Use the bot to create one.</p>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Display name</label>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 text-on-surface placeholder:text-outline/30"
                    placeholder="e.g. Community Points"
                    value={ptName}
                    onChange={(e) => setPtName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Symbol</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 text-on-surface placeholder:text-outline/30"
                      placeholder="PTS"
                      value={ptSymbol}
                      onChange={(e) => setPtSymbol(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Supply cap</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-4 text-on-surface placeholder:text-outline/30"
                      placeholder="1000000"
                      value={ptCap}
                      onChange={(e) => setPtCap(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full sm:w-auto" disabled={ptBusy} onClick={() => void submitPointCurrency()}>
                  {ptBusy ? 'Creating…' : 'Create points'}
                </Button>
              </div>
            </Card>
            <div className="bg-surface-container-low/40 p-6 rounded-xl border border-outline-variant/15 flex gap-4">
              <Info className="text-primary mt-0.5 shrink-0" size={20} />
              <div>
                <h4 className="text-on-surface text-sm font-bold mb-1">Project points</h4>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  Point balances live in Postgres. Creating a currency also calls the <strong className="text-on-surface">MasterTip</strong> Solidity contract when{' '}
                  <code className="text-xs bg-surface-container-high px-1 rounded">MASTER_TIP_CONTRACT</code> is set (gas from the owner&apos;s Tippy wallet).
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield size={96} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-primary mb-6">Stack preview</h3>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center py-4 border-b border-outline-variant/20">
                  <span className="text-sm text-outline">Conflux eSpace</span>
                  <span className="text-sm font-bold">{networkLabel}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-outline-variant/20">
                  <span className="text-sm text-outline">Points storage</span>
                  <span className="text-sm font-bold">Supabase</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-sm text-outline">Custodial tips</span>
                  <span className="text-sm font-bold text-primary">CFX</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Send className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-headline">Send points</h3>
                  <p className="text-xs text-outline uppercase tracking-widest font-bold">Distribution</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Use <strong className="text-on-surface">/points</strong> and tipping flows in Discord to mint and send to members. A web-based send console for this guild will ship here next.
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const membersValue =
    stats.aggregatedMembersKnown && stats.aggregatedMembers > 0
      ? formatCompactCount(stats.aggregatedMembers)
      : stats.aggregatedMembersKnown
        ? stats.aggregatedMembers.toLocaleString()
        : '—';
  const membersSub = stats.aggregatedMembersKnown
    ? `${stats.serverCount} server(s) with bot member counts`
    : stats.serverCount > 0
      ? `${stats.serverCount} server(s) · add bot for member counts`
      : 'No servers in scope';

  const statCards: {
    label: string;
    value: string;
    sub: string;
    icon: typeof TrendingUp;
    color: 'text-primary' | 'text-outline' | 'text-tertiary';
    dashed: boolean;
    onClick?: () => void;
  }[] = [
    {
      label: 'Aggregated Members',
      value: membersValue,
      sub: membersSub,
      icon: TrendingUp,
      color: 'text-primary',
      dashed: false,
    },
    {
      label: 'Global Points Supply',
      value: stats.globalPointsSupplyFormatted,
      sub:
        stats.serverCount > 0
          ? `Distributed across ${stats.serverCount} project${stats.serverCount === 1 ? '' : 's'}`
          : 'No projects yet',
      icon: Coins,
      color: 'text-outline',
      dashed: false,
    },
    {
      label: 'Active Campaigns',
      value: String(stats.activeCampaigns).padStart(2, '0'),
      sub:
        stats.activeCampaigns > 0
          ? `${stats.activeCampaigns} point currency${stats.activeCampaigns === 1 ? '' : 'ies'} total`
          : 'Create currencies in Discord',
      icon: Bell,
      color: 'text-tertiary',
      dashed: false,
    },
    {
      label: 'Quick Action',
      value: 'Export CSV',
      sub: `${csvRows.length} guild${csvRows.length === 1 ? '' : 's'} (manageable list)`,
      icon: FileText,
      color: 'text-primary',
      dashed: true,
      onClick: () => downloadGuildsCsv(csvRows),
    },
  ];

  return (
    <div className="space-y-12">
      <Modal isOpen={registerModalOpen} onClose={closeRegisterModal} title="Register Discord server">
        <RegisterGuildForm
          guildOptions={guildOptions}
          reauthGuilds={guildsReauth}
          guildsError={guildsFetchErr}
          registerGuildId={registerGuildId}
          setRegisterGuildId={setRegisterGuildId}
          registerState={registerState}
          registerMsg={registerMsg}
          onRegister={registerCommands}
          envHint={overview.envGuildId}
        />
      </Modal>

      <header className="mb-16 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
          <div>
            <span className="text-primary font-bold tracking-widest text-[0.6875rem] uppercase mb-2 block">Executive Overview</span>
            <h1 className="text-5xl font-extrabold font-headline tracking-tighter text-on-surface">Console.</h1>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2">
            {airdropDevVisible ? (
              <p className="text-sm text-tertiary font-medium text-right max-w-md">
                Airdrop is still in development — check back soon.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-4 justify-end">
              <Button
                variant="secondary"
                onClick={() => setAirdropDevVisible((v) => !v)}
                title={airdropDevVisible ? 'Hide notice' : undefined}
              >
                <Rocket size={18} />
                New Airdrop
              </Button>
              <Button onClick={openRegisterModal}>
                <Plus size={18} />
                Connect Server
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {statCards.map((stat, i) => {
          const body = (
            <>
              <span className="text-outline text-[0.6875rem] font-bold uppercase tracking-widest">{stat.label}</span>
              <div className="text-4xl font-extrabold font-headline text-on-surface">{stat.value}</div>
              <div className={`flex items-center gap-2 text-xs ${stat.color}`}>
                <stat.icon size={14} />
                <span>{stat.sub}</span>
              </div>
            </>
          );
          const cardClass = `p-8 flex flex-col justify-between h-48 ${
            stat.dashed ? 'border-2 border-dashed' : ''
          } hover:bg-surface-container transition-colors cursor-pointer`;
          if (stat.onClick) {
            return (
              <button
                key={i}
                type="button"
                onClick={stat.onClick}
                className="text-left w-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Card className={`${cardClass}`} hover>
                  {body}
                </Card>
              </button>
            );
          }
          return (
            <Card key={i} className={cardClass}>
              {body}
            </Card>
          );
        })}
      </div>

      <h3 className="text-xl font-bold font-headline mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-primary rounded-full" />
        Registered Discord
      </h3>

      <div className="space-y-6">
        {projects.length === 0 ? (
          <Card className="p-10 text-center text-on-surface-variant text-sm">
            No servers you manage were returned from Discord. Sign in again with the{' '}
            <code className="text-xs bg-surface-container-high px-1 rounded">guilds</code> scope, or check you are owner / Manage Server on at least one guild.
          </Card>
        ) : (
          projects.map((project) => (
            <Card
              key={project.id}
              className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-[#5865F2] flex items-center justify-center relative shadow-xl shrink-0">
                  <MessageSquare size={40} className="text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-surface-container" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-2xl font-bold font-headline text-on-surface truncate">{project.name}</h4>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {project.rails.map((rail) => (
                      <Badge key={rail} variant={rail === 'CFX' ? 'tertiary' : 'secondary'}>
                        {rail} Rail
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-12 flex-1 max-w-2xl">
                <div>
                  <p className="text-outline text-[10px] font-bold uppercase tracking-widest mb-1">Members</p>
                  <p className="text-2xl font-bold font-headline text-on-surface">
                    {project.members != null ? project.members.toLocaleString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-outline text-[10px] font-bold uppercase tracking-widest mb-1">Points Issued</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-2xl font-bold font-headline text-on-surface">{project.pointsIssued}</p>
                    <Badge variant="primary">POINTS</Badge>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-outline text-[10px] font-bold uppercase tracking-widest mb-1">Active Campaigns</p>
                  <p className="text-2xl font-bold font-headline text-on-surface">
                    {project.activeCampaigns.toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button onClick={() => openManage(project.id)}>Manage</Button>
              </div>
            </Card>
          ))
        )}

        <button
          type="button"
          onClick={openRegisterModal}
          className="w-full border-2 border-dashed border-outline-variant/20 rounded-xl p-12 flex flex-col items-center justify-center text-center group hover:border-primary/40 transition-all"
        >
          <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="text-outline group-hover:text-primary" size={32} />
          </div>
          <h5 className="text-lg font-bold font-headline text-on-surface">Next Register Discord</h5>
          <p className="text-sm text-outline max-w-xs mt-2">
            Expand your ecosystem and start tracking points for your next community project.
          </p>
        </button>
      </div>
    </div>
  );
};
