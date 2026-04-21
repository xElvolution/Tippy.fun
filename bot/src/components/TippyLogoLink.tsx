import Image from 'next/image';
import Link from 'next/link';

type TippyLogoLinkProps = {
  href?: string;
  markSize: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
};

export function TippyLogoLink({
  href = '/landing',
  markSize,
  showWordmark = true,
  wordmarkClassName = 'font-headline font-black text-2xl tracking-tighter text-on-surface',
  className = '',
  priority = false,
  onClick,
}: TippyLogoLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${className}`}
    >
      <Image
        src="/logo.png"
        alt="Tippy"
        width={markSize}
        height={markSize}
        className="shrink-0 object-contain rounded-xl"
        priority={priority}
      />
      {showWordmark ? <span className={wordmarkClassName}>Tippy.</span> : null}
    </Link>
  );
}
