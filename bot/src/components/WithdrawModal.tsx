'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { isAddress } from 'viem';
import { ArrowRight, Wallet, CheckCircle, Info, Loader2 } from 'lucide-react';
import { Button, Modal, Card } from './UI';

function parseCfxHuman(s: string): number {
  const n = parseFloat(String(s).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

export const WithdrawModal = ({
  isOpen,
  onClose,
  availableCfxHuman,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  availableCfxHuman: string;
  onSuccess?: () => void;
}) => {
  const [step, setStep] = React.useState(1);
  const [amount, setAmount] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [txHash, setTxHash] = React.useState<string | null>(null);

  const maxCfx = parseCfxHuman(availableCfxHuman);

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAmount('');
      setAddress('');
      setSubmitting(false);
      setFormError(null);
      setTxHash(null);
    }
  }, [isOpen]);

  const reset = () => {
    setStep(1);
    setAmount('');
    setAddress('');
    setSubmitting(false);
    setFormError(null);
    setTxHash(null);
    onClose();
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => {
    setFormError(null);
    setStep((s) => s - 1);
  };

  const setMax = () => {
    if (maxCfx > 0) setAmount(String(maxCfx));
  };

  const amountNum = parseFloat(amount);
  const amountOk = Number.isFinite(amountNum) && amountNum > 0 && amountNum <= maxCfx + 1e-12;

  const submitWithdraw = async () => {
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/me/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toAddress: address.trim(), amount: amountNum }),
      });
      const json = (await res.json()) as { ok?: boolean; txHash?: string; error?: string };
      if (!res.ok) throw new Error(json.error || 'Withdraw failed');
      setTxHash(json.txHash ?? null);
      setStep(4);
      onSuccess?.();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Withdraw failed');
    } finally {
      setSubmitting(false);
    }
  };

  const destOk = isAddress(address.trim() as `0x${string}`);

  return (
    <Modal isOpen={isOpen} onClose={reset} title="Withdraw assets">
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-surface-container-highest'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Asset</label>
                <div className="p-4 rounded-xl bg-surface-container-high border-2 border-primary flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">C</div>
                  <span className="text-sm font-bold">CFX (Conflux eSpace native)</span>
                  <span className="text-[10px] text-on-surface-variant text-center">Withdrawals broadcast on-chain from your Tippy wallet.</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Amount</label>
                  <span className="text-[10px] text-on-surface-variant font-medium">Available: {availableCfxHuman} CFX</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface-container-lowest border-none rounded-xl p-4 text-2xl font-headline font-bold text-on-surface focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={setMax}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:underline"
                  >
                    MAX
                  </button>
                </div>
                {maxCfx <= 0 ?
                  <p className="text-xs text-error">No CFX available to withdraw.</p>
                : null}
              </div>
              <Button className="w-full py-4" disabled={!amountOk || maxCfx <= 0} onClick={handleNext}>
                Continue
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Destination address</label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x…"
                    className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-4 font-mono text-sm text-on-surface focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="bg-surface-container-highest/30 p-4 rounded-xl flex gap-3">
                  <Info className="text-primary shrink-0" size={18} />
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Use any valid Conflux eSpace (EVM) 0x address. Funds cannot be recovered if you paste the wrong address.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="secondary" className="flex-1" onClick={handleBack}>
                  Back
                </Button>
                <Button className="flex-[2] py-4" disabled={!destOk} onClick={handleNext}>
                  Review
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="p-6 bg-surface-container-highest/20 border-dashed">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-on-surface-variant">Amount</span>
                    <span className="text-lg font-bold font-headline">
                      {amount} CFX
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs text-on-surface-variant shrink-0">To</span>
                    <span className="text-xs font-mono text-on-surface text-right break-all">{address.trim()}</span>
                  </div>
                  <div className="h-[1px] bg-outline-variant/20" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-on-surface-variant">Network fee</span>
                    <span className="text-xs font-bold text-primary">Paid from balance (chain)</span>
                  </div>
                </div>
              </Card>
              {formError ?
                <p className="text-sm text-error">{formError}</p>
              : null}
              <div className="flex gap-4">
                <Button variant="secondary" className="flex-1" onClick={handleBack} disabled={submitting}>
                  Back
                </Button>
                <Button className="flex-[2] py-4" onClick={submitWithdraw} disabled={submitting}>
                  {submitting ?
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Broadcasting…
                    </>
                  : 'Confirm & send'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-primary" size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-headline">Withdrawal sent</h3>
                <p className="text-on-surface-variant max-w-sm mx-auto text-sm break-all">
                  {txHash ? <>Tx: {txHash}</> : 'Transaction submitted.'}
                </p>
              </div>
              <Button className="w-full" onClick={reset}>
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};
