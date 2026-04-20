'use client';

import { useState } from 'react';
import { useActiveWallet } from '@/hooks/useTippyCampaigns';
import { useAuthedFetch } from '@/lib/apiClient';

type Props = { campaignId: string | number; onSubmitted?: (submissionId: string) => void };

export function SubmissionForm({ campaignId, onSubmitted }: Props) {
  const { address, authenticated, login } = useActiveWallet();
  const authedFetch = useAuthedFetch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!authenticated) {
      await login();
      return;
    }
    if (!content.trim()) {
      setErr('Submission content is required.');
      return;
    }
    setBusy(true);
    try {
      const links =
        linkUrl.trim().length > 0 ? [{ label: linkLabel.trim() || linkUrl, url: linkUrl }] : [];
      const res = await authedFetch<{ submission: { id: string } }>('/api/submissions', {
        method: 'POST',
        body: JSON.stringify({
          campaignId: String(campaignId),
          title: title.trim() || undefined,
          content: content.trim(),
          links,
          submitterWallet: address,
        }),
      });
      setOk(`Submitted! Submission id ${res.submission.id}`);
      setTitle('');
      setContent('');
      setLinkLabel('');
      setLinkUrl('');
      onSubmitted?.(res.submission.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 space-y-4"
    >
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface">Submit your work</h3>
        <p className="text-sm text-on-surface-variant">
          Your submission is stored off-chain in Supabase; its content hash is sealed on-chain when
          the AI arbiter rules on it.
        </p>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Title (optional)
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          maxLength={8000}
          placeholder="Paste your post, essay, pitch, or build description here."
          className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Link label (optional)
          </label>
          <input
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            maxLength={60}
            placeholder="GitHub / X post / Demo"
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Link URL (optional)
          </label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="primary-gradient rounded-xl px-8 py-3 text-base font-bold text-on-primary shadow-lg shadow-primary/20 disabled:opacity-60"
      >
        {busy ? 'Submitting…' : 'Submit'}
      </button>
      {err ? (
        <p className="rounded-lg bg-error-container/60 px-3 py-2 text-sm text-on-error-container">
          {err}
        </p>
      ) : null}
      {ok ? (
        <p className="rounded-lg bg-tertiary-container/60 px-3 py-2 text-sm text-on-tertiary-container">
          {ok}
        </p>
      ) : null}
    </form>
  );
}
