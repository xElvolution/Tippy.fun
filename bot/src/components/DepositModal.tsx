'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Wallet, Shield, Info, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button, Modal, Card, AddressCopy } from './UI';
import { publicAddressExplorerUrl, publicLearnUrl } from '@/lib/publicSiteLinks';

export const DepositModal = ({
  isOpen,
  onClose,
  address,
}: {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}) => {
  const [step, setStep] = React.useState(1);

  React.useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  const reset = () => {
    setStep(1);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={reset} title="Deposit Assets">
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Shield size={24} />
                  <h3 className="font-headline font-bold text-lg">Deposit Confirmation</h3>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  You are about to deposit assets to your Tippy account on <span className="text-primary font-bold">Conflux eSpace</span>.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Network Details</label>
                <Card className="p-4 bg-surface-container-lowest border-dashed">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant">Network</span>
                      <span className="font-bold text-on-surface">Conflux eSpace</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant">Asset Type</span>
                      <span className="font-bold text-on-surface">Native CFX / ERC-20</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant">Settlement</span>
                      <span className="font-bold text-on-surface">On-chain</span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-error/5 border border-error/10 p-4 rounded-xl flex gap-3">
                <AlertTriangle className="text-error shrink-0" size={18} />
                <p className="text-[11px] text-on-error-container leading-tight">
                  Do not send assets from unrelated networks to this address without a proper bridge. Mis-sent funds can be lost.
                </p>
              </div>

              <Button className="w-full py-4" onClick={() => setStep(2)}>
                I Understand, Show Address
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="text-primary" size={32} />
                </div>
                <h3 className="text-xl font-bold font-headline">Your Deposit Address</h3>
                <p className="text-sm text-on-surface-variant">Copy this address to send funds from your external wallet.</p>
              </div>

              <div className="space-y-4">
                <AddressCopy address={address} />

                <div className="grid grid-cols-2 gap-4">
                  <a
                    href={publicAddressExplorerUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <Card className="p-4 flex flex-col items-center gap-2 bg-surface-container-lowest hover:border-primary/30 transition-colors cursor-pointer group h-full">
                      <div className="p-2 bg-surface-container-high rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ExternalLink size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Explorer</span>
                    </Card>
                  </a>
                  <a
                    href={publicLearnUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <Card className="p-4 flex flex-col items-center gap-2 bg-surface-container-lowest hover:border-primary/30 transition-colors cursor-pointer group h-full">
                      <div className="p-2 bg-surface-container-high rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Info size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Guide</span>
                    </Card>
                  </a>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="secondary" className="w-full" onClick={reset}>
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};
