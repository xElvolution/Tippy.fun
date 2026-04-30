'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check } from 'lucide-react';

export const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'error' | 'success';
}) => {
  const variants = {
    default: 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary-container/30 text-on-secondary-container border-secondary-container/30',
    tertiary: 'bg-tertiary-container/20 text-on-tertiary-container border-tertiary-container/30',
    error: 'bg-error-container/20 text-error border-error-container/30',
    success: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
  href,
  target,
  rel,
  title,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  title?: string;
}) => {
  const base =
    'px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-primary text-on-primary hover:shadow-[0_0_20px_-5px_rgb(132_85_239_/_0.45)]',
    secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
    outline: 'bg-transparent border border-outline-variant/30 text-on-surface hover:bg-surface-container-low',
    ghost: 'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
    error: 'bg-error-container text-on-error-container hover:bg-error-container/80',
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href && !disabled) {
    return (
      <a href={href} target={target ?? '_blank'} rel={rel ?? 'noopener noreferrer'} className={classes} title={title}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes} title={title}>
      {children}
    </button>
  );
};

export const Card = ({
  children,
  className = '',
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) => {
  return (
    <div
      className={`bg-surface-container-low rounded-2xl border border-outline-variant/5 ${
        hover ? 'group hover:border-primary/20 transition-all duration-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-headline tracking-tight">{title}</h2>
              <button type="button" onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const AddressCopy = ({ address }: { address: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
      className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between group cursor-pointer border border-transparent hover:border-primary/30 transition-all duration-200"
    >
      <code className="text-sm font-mono text-on-surface truncate pr-4">{address}</code>
      <span className="text-primary hover:text-on-primary-container transition-colors">
        {copied ? <Check size={18} /> : <Copy size={18} />}
      </span>
    </div>
  );
};
