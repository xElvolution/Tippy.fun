export type TimelinePhase = {
  label: string;
  dateRight: string;
  active?: boolean;
  upcoming?: boolean;
};

export type PublicCampaign = {
  slug: string;
  imageSrc: string;
  imageAlt: string;
  /** Shown on card overlay, e.g. "24h left" */
  timeLeft: string;
  /** Sidebar timeline headline pill */
  statusLine: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  prizeShort: string;
  prizePool: {
    headline: string;
    subline?: string;
    breakdown: { label: string; value: string }[];
  };
  timeline: TimelinePhase[];
  tags: string[];
  location: string;
  organizer: { name: string; abbr: string };
  /** e.g. 128 — shown on card overlay */
  submissionsCount: number;
};

export const PUBLIC_CAMPAIGNS: PublicCampaign[] = [
  {
    slug: 'meme-lord',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA5PW9tVzXfAa3p9nel4d1pxBQXE7cSg8WWcDn2ubi_tdnv5FkwywnJ2e7p9BKbNU35298SSOFgv-_DombKwpiUfm5f-SsKUi7pG4tkDm9yAdGvd6A4o0vudAfVoVQSoV4X1nIfDNKzEJCehvcdyic5k5wzo3fdCGu0VIrqwbzTKhL82Fd8f4NGRiJmwbDBvxleRSNwpAAZ1uAdaXOXvQbrsgyscBbYqrQZxF5azV2qDW_94IA9W-uIQ0GqaWdZPt8q7nMKVKLGmwdi',
    imageAlt: 'Meme campaign preview',
    timeLeft: '24h left',
    statusLine: '24 hours left for submissions',
    title: 'Meme-Lord Masters',
    shortDescription: 'Create the best viral video for our new protocol launch on Discord.',
    longDescription:
      'Submit a short-form video showcasing our protocol on Discord. Judges score creativity, clarity, and reach. Winners paid in USDC within 7 days of close.',
    prizeShort: '2,500 USDC',
    prizePool: {
      headline: '2,500 USDC',
      subline: 'Total prize pool',
      breakdown: [
        { label: '1st place', value: '1,200 USDC' },
        { label: '2nd place', value: '800 USDC' },
        { label: 'Community picks', value: '500 USDC' },
      ],
    },
    timeline: [
      { label: 'Upcoming', dateRight: '—', upcoming: true },
      { label: 'Submissions open', dateRight: 'Mar 18, 2026', active: true },
      { label: 'Judging', dateRight: 'Mar 22, 2026' },
      { label: 'Winners announced', dateRight: 'Mar 24, 2026' },
    ],
    tags: ['Discord', 'Video', 'Community'],
    location: 'Virtual',
    organizer: { name: 'Tippy.Fun', abbr: 'T' },
    submissionsCount: 128,
  },
  {
    slug: 'docs',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBu2nxWNwsBloLyBh3jx5EIPgA7f0IC4mhZDbqyCwhE1H4Mu0ymrO4EmTOg6ZqTdQefKJFUYe0ZtiIyJgLaEFeJzX4q2ArkeEuOT_ldhrqmkirpIGUSb7-lfPLPfhrhDwYrn18Wia1Nx92qVmBPKWW_S-HYSBR8nzSz785YskfBgSA3PTMKbP8slD-1FV03dIi0-JiLOfRay-ZzUKSpz7hUpeQSRCa0GrJy3tTToPqYdJK-187rX01ziWYnxTdbTqNcgC_GMLs87eAm',
    imageAlt: 'Docs campaign preview',
    timeLeft: '3 days left',
    statusLine: '3 days left for submissions',
    title: 'Docs Translation',
    shortDescription: 'Translate our technical litepaper into Spanish, Japanese, and French.',
    longDescription:
      'Professional-quality translations of our litepaper. Submit via GitHub PR or the campaign form. Reviewers validate accuracy and tone.',
    prizeShort: '1.2 ETH',
    prizePool: {
      headline: '1.2 ETH',
      subline: 'Split by language tier',
      breakdown: [
        { label: 'Spanish', value: '0.45 ETH' },
        { label: 'Japanese', value: '0.45 ETH' },
        { label: 'French', value: '0.30 ETH' },
      ],
    },
    timeline: [
      { label: 'Pre-registration', dateRight: 'Closed' },
      { label: 'Translations due', dateRight: 'Mar 25, 2026', active: true },
      { label: 'Review', dateRight: 'Mar 28, 2026' },
      { label: 'Payouts', dateRight: 'Mar 30, 2026' },
    ],
    tags: ['Docs', 'i18n', 'Technical writing'],
    location: 'Virtual',
    organizer: { name: 'Tippy.Fun', abbr: 'T' },
    submissionsCount: 54,
  },
  {
    slug: 'alpha',
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBkn0VoIkBy3s02zh3m_NQhGfqIIIwZtqdBi7MJCZ38Gh-c1H9DYSC4WiS9qYlI5Ip_w7wnVFoKM-qIAISd27h5ys-59MZlpiH7Zlj4nPG8d56lnxpOFIrauMnTbiuVDSDQFaymbxGKL0pkHyWz_fm1TRt9Ae3ZDbTIOmdNKU6ZfsjScmugyxoHjyvWECE-JwPi1ClnMDdPDje6Z5weZvvBlR3VxX4sUshkdbx9fxE8VXj1R5b9DpLbc1_kppIwy3_-sjdf0E1DwIZR',
    imageAlt: 'Alpha testers campaign',
    timeLeft: 'Ending soon',
    statusLine: 'Ending soon — limited slots',
    title: 'Alpha Testers',
    shortDescription: 'Be the first to find bugs in our Telegram mini-app and win rewards.',
    longDescription:
      'Structured bug bash on the Telegram mini-app. File reproducible issues with severity tags. Rewards in TIPPY plus contributor NFT for top reporters.',
    prizeShort: '5,000 TIPPY',
    prizePool: {
      headline: '5,000 TIPPY',
      subline: '+ contributor NFTs',
      breakdown: [
        { label: 'Critical / High', value: '2,500 TIPPY' },
        { label: 'Medium', value: '1,500 TIPPY' },
        { label: 'Low / polish', value: '1,000 TIPPY' },
      ],
    },
    timeline: [
      { label: 'Alpha access', dateRight: 'Rolling', active: true },
      { label: 'Reporting window', dateRight: 'Mar 20, 2026' },
      { label: 'Fix sprint', dateRight: 'Mar 27, 2026' },
      { label: 'Rewards', dateRight: 'Apr 1, 2026' },
    ],
    tags: ['Telegram', 'QA', 'Mini app'],
    location: 'Virtual',
    organizer: { name: 'Tippy.Fun', abbr: 'T' },
    submissionsCount: 312,
  },
];

export function getPublicCampaign(slug: string): PublicCampaign | undefined {
  return PUBLIC_CAMPAIGNS.find((c) => c.slug === slug);
}
