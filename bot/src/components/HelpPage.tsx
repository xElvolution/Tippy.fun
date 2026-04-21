'use client';

import React from 'react';
import { MessageSquare, BookOpen, Shield, ArrowRight, ChevronDown } from 'lucide-react';
import { Card, Button } from './UI';

const faqs = [
  {
    q: 'How does Tippy secure my funds?',
    a: 'Tippy uses a custodial model: each user gets a dedicated Conflux eSpace (0x) address and keys are managed by the service. Withdrawals go to addresses you specify per policy. Use testnet for experiments.',
  },
  {
    q: "What are 'Rails'?",
    a: "Rails label the asset type: CFX (native on eSpace), TOKEN (ERC-20 you add to your watchlist), and PROJECT POINTS (capped points issued by a guild owner for that server).",
  },
  {
    q: 'Can I use Tippy on any Discord server?',
    a: 'An admin must invite the bot. Members link accounts to tip and earn based on that server’s configuration.',
  },
  {
    q: 'Are there any fees for tipping?',
    a: 'Discord tipping UX is designed to feel instant; on-chain transfers still pay Conflux eSpace gas (CFX). Check the latest policy for any service fees.',
  },
];

export const HelpPage = () => {
  return (
    <div className="space-y-16 max-w-4xl mx-auto">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold font-headline tracking-tight text-on-surface">How can we help?</h1>
        <p className="text-on-surface-variant text-lg">Everything you need to know about Tippy on Conflux eSpace.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: BookOpen, title: 'Docs', desc: 'Technical guides & API' },
          { icon: MessageSquare, title: 'Discord', desc: 'Community support' },
          { icon: Shield, title: 'Security', desc: 'Custody & safety' },
        ].map((item, i) => (
          <Card key={i} hover className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <item.icon size={24} />
            </div>
            <h3 className="font-bold font-headline">{item.title}</h3>
            <p className="text-xs text-on-surface-variant">{item.desc}</p>
          </Card>
        ))}
      </div>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-headline text-on-surface">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="p-6">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="font-bold text-on-surface pr-8">{faq.q}</h3>
                  <ChevronDown className="text-outline group-open:rotate-180 transition-transform shrink-0" size={20} />
                </summary>
                <div className="mt-4 pt-4 border-t border-outline-variant/10">
                  <p className="text-on-surface-variant leading-relaxed text-sm">{faq.a}</p>
                </div>
              </details>
            </Card>
          ))}
        </div>
      </section>

      <Card className="p-12 bg-primary-container/10 border-primary/20 text-center space-y-6">
        <h2 className="text-2xl font-bold font-headline">Still have questions?</h2>
        <p className="text-on-surface-variant max-w-md mx-auto">Join Conflux and ecosystem Discord communities for support.</p>
        <Button className="mx-auto">
          Join Conflux Discord
          <ArrowRight size={18} />
        </Button>
      </Card>
    </div>
  );
};
