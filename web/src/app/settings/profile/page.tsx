import { SettingsProfileForm } from '@/components/SettingsProfileForm';

export default function SettingsProfilePage() {
  return (
    <>
      <SettingsProfileForm />
      <section className="rounded-2xl border border-error/20 bg-error-container/15 p-6 sm:p-8 dark:bg-error-container/10">
        <h2 className="text-lg font-bold text-error font-headline mb-2">Danger zone</h2>
        <p className="text-on-surface-variant text-sm mb-6 max-w-xl leading-relaxed">
          Permanently delete your account and all associated campaign history. This cannot be undone and may forfeit pending rewards.
        </p>
        <button
          type="button"
          className="rounded-xl border border-error/30 bg-surface-container-lowest px-5 py-2.5 text-sm font-bold text-error transition-colors hover:bg-error hover:text-white dark:bg-surface-container-lowest"
        >
          Deactivate account
        </button>
      </section>
    </>
  );
}
