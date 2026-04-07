export interface MarketingContentSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: string;
  description: string;
  sections: MarketingContentSection[];
}

export interface HelpArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  description: string;
  sections: MarketingContentSection[];
}

export interface DocsPageEntry {
  slug: string[];
  title: string;
  section: string;
  description: string;
  sections: MarketingContentSection[];
}

export interface SeoPageEntry {
  family: 'compare' | 'solutions' | 'templates';
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  sections: MarketingContentSection[];
}

export interface ScreenshotScene {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  metrics: { label: string; value: string }[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'multi-location-ops-without-spreadsheet-drift',
    title: 'Running multi-location operations without spreadsheet drift',
    excerpt:
      'Why branch leaders, dispatch teams, and executives all need the same operating system instead of separate reporting layers.',
    category: 'Operations strategy',
    publishedAt: '2026-04-07',
    readTime: '6 min read',
    description:
      'Learn how PulseOps positions branch-aware operations management without spreadsheet drift.',
    sections: [
      {
        title: 'The failure mode',
        paragraphs: [
          'Multi-location teams rarely fail because they lack effort. They fail because every branch tracks work differently, which makes the executive layer reactive and the operator layer noisy.',
          'PulseOps was built to keep jobs, incidents, tasks, SLAs, audit history, and analytics anchored to the same tenant and branch model.',
        ],
        bullets: [
          'One place for branch-aware work and oversight',
          'Shared metrics across operators and leadership',
          'Less reconciliation work before every review',
        ],
      },
      {
        title: 'What better looks like',
        paragraphs: [
          'A strong operational stack does not separate workflow from reporting. It lets buyers and operators move from signal to record to action without re-keying context.',
        ],
        callout:
          'The public Sprint 10 layer mirrors the same branch-aware product language already used throughout the authenticated app.',
      },
    ],
  },
  {
    slug: 'why-explainable-ai-matters-in-ops-software',
    title: 'Why explainable AI matters in operations software',
    excerpt:
      'Executives want faster summaries, but operators still need the evidence chain behind any recommendation.',
    category: 'AI operations',
    publishedAt: '2026-04-03',
    readTime: '5 min read',
    description:
      'PulseOps pairs AI summaries with supporting facts so operations teams can trust the recommendation path.',
    sections: [
      {
        title: 'Fast summaries are not enough',
        paragraphs: [
          'Operations software earns trust when guidance is inspectable. That is why PulseOps keeps supporting facts, direct record links, and generation metadata visible in the AI layer.',
        ],
      },
      {
        title: 'What inspectability changes',
        paragraphs: [
          'Teams move faster when the AI layer explains why a branch is high risk or why a job is likely to slip. That reduces the need to re-run the same analysis manually.',
        ],
        bullets: [
          'Branch-level pressure explanation',
          'Late-job risk drivers',
          'Direct links back into operational views',
        ],
      },
    ],
  },
  {
    slug: 'how-to-present-ops-health-to-buyers-and-leadership',
    title: 'How to present ops health to buyers and leadership',
    excerpt:
      'A practical way to show backlog, incidents, SLA pressure, and next steps without overwhelming the room.',
    category: 'Executive reporting',
    publishedAt: '2026-03-29',
    readTime: '4 min read',
    description:
      'A guide to presenting operational health with branch comparisons, SLA review, and AI summaries.',
    sections: [
      {
        title: 'Show a coherent operating story',
        paragraphs: [
          'Leadership does not need every raw metric first. They need to understand which branches are healthy, where risk is concentrating, and what action should happen next.',
        ],
      },
      {
        title: 'Recommended structure',
        paragraphs: [
          'Start with the executive summary, move into branch comparison, review SLA pressure, then connect the discussion back into the live job and incident surfaces.',
        ],
        bullets: [
          'Summary first',
          'Branch comparison second',
          'Drill-down paths ready when needed',
        ],
      },
    ],
  },
];

export const helpArticles: HelpArticle[] = [
  {
    slug: 'getting-started-with-your-first-workspace',
    title: 'Getting started with your first PulseOps workspace',
    excerpt:
      'Set up your organization, branch context, and first operator flow without losing tenant boundaries.',
    category: 'Onboarding',
    description:
      'Learn the quickest path to create a PulseOps workspace and start using the protected shell.',
    sections: [
      {
        title: 'Recommended starting order',
        paragraphs: [
          'Create the organization, confirm the first owner membership, then move into branch-aware operational setup before inviting a larger team.',
        ],
        bullets: [
          'Confirm organization ownership',
          'Create or review your first branch',
          'Open the dashboard and validate billing state',
        ],
      },
    ],
  },
  {
    slug: 'how-to-review-late-job-risk-signals',
    title: 'How to review late-job risk signals',
    excerpt:
      'Use the AI layer as a guide, then jump back into the underlying job records and branch context.',
    category: 'Analytics',
    description:
      'Understand how PulseOps late-job risk panels should be used in day-to-day operational review.',
    sections: [
      {
        title: 'Read the signal correctly',
        paragraphs: [
          'The risk panel is designed to rank likely slippage, not to replace operational judgment. Use the explanation sheet and then inspect the actual job detail view.',
        ],
      },
    ],
  },
  {
    slug: 'what-to-do-when-a-subscription-goes-past-due',
    title: 'What to do when a subscription goes past due',
    excerpt:
      'A practical guide for owners and admins using the Sprint 6 billing surfaces.',
    category: 'Billing',
    description:
      'Handle trial, past_due, and unpaid commercial states using the current PulseOps billing flow.',
    sections: [
      {
        title: 'Commercial recovery path',
        paragraphs: [
          'Review the billing page first, then use the billing portal when payment details or cancellation timing need to be updated.',
        ],
      },
    ],
  },
];

export const docsPages: DocsPageEntry[] = [
  {
    slug: ['getting-started'],
    title: 'Getting started',
    section: 'Foundation',
    description:
      'Understand the PulseOps shell, organization model, and the shortest path to operational setup.',
    sections: [
      {
        title: 'What PulseOps covers',
        paragraphs: [
          'PulseOps combines branches, jobs, incidents, tasks, SLAs, notifications, billing, analytics, and AI guidance in one branch-aware product surface.',
        ],
      },
    ],
  },
  {
    slug: ['operations', 'jobs-and-incidents'],
    title: 'Jobs and incidents',
    section: 'Operations',
    description:
      'Learn how jobs, incidents, tasks, timelines, watchers, and escalations work together.',
    sections: [
      {
        title: 'Connected operational records',
        paragraphs: [
          'Jobs, incidents, and tasks all use typed repositories, timeline history, collaboration, and notifications. Incident flows also carry escalation and SLA state.',
        ],
      },
    ],
  },
  {
    slug: ['analytics', 'overview-and-branches'],
    title: 'Analytics overview and branch comparison',
    section: 'Analytics',
    description:
      'Use overview KPIs, branch comparison, SLA review, exports, and AI summaries for buyer and leadership review.',
    sections: [
      {
        title: 'Operational reporting model',
        paragraphs: [
          'Sprint 8 analytics surfaces reuse the current tenant and branch model instead of introducing a separate warehouse-only reporting system.',
        ],
      },
    ],
  },
  {
    slug: ['billing', 'plans-and-entitlements'],
    title: 'Plans and entitlements',
    section: 'Billing',
    description:
      'Understand how pricing, checkout, subscriptions, entitlements, and premium gates stay aligned.',
    sections: [
      {
        title: 'One commercial model',
        paragraphs: [
          'The public pricing page, billing page, Stripe flows, and entitlement checks all use the same plan definitions to avoid commercial drift.',
        ],
      },
    ],
  },
  {
    slug: ['ai', 'explanations-and-feedback'],
    title: 'AI explanations and feedback',
    section: 'AI layer',
    description:
      'Inspect supporting facts, generation metadata, and operator feedback inside the Sprint 9 AI layer.',
    sections: [
      {
        title: 'Trust through inspectability',
        paragraphs: [
          'PulseOps AI outputs persist as runs, expose feedback state, and link users back into the underlying operational views instead of hiding the reasoning path.',
        ],
      },
    ],
  },
];

export const seoPages: SeoPageEntry[] = [
  {
    family: 'solutions',
    slug: 'multi-location-field-service',
    title: 'PulseOps for multi-location field service teams',
    eyebrow: 'Solutions',
    description:
      'How PulseOps fits field service organizations that need branch-aware jobs, incidents, SLAs, and executive reporting.',
    sections: [
      {
        title: 'Where PulseOps fits',
        paragraphs: [
          'PulseOps is designed for service businesses operating across multiple branches where backlog, incidents, and SLA drift need to be reviewed centrally.',
        ],
      },
    ],
  },
  {
    family: 'compare',
    slug: 'pulseops-vs-generic-ticketing-tools',
    title: 'PulseOps vs generic ticketing tools',
    eyebrow: 'Compare',
    description:
      'Compare a branch-aware operations command center with general-purpose ticketing software.',
    sections: [
      {
        title: 'The difference',
        paragraphs: [
          'Generic ticketing tools can track issues, but they rarely connect dispatch, incidents, SLAs, executive analytics, billing, and explainable AI in one operational surface.',
        ],
      },
    ],
  },
  {
    family: 'templates',
    slug: 'branch-operations-review-template',
    title: 'Branch operations review template',
    eyebrow: 'Templates',
    description:
      'Use this branch review structure to walk backlog, incidents, SLA risk, and next actions consistently.',
    sections: [
      {
        title: 'Suggested review order',
        paragraphs: [
          'Begin with backlog and incident pressure, review SLA attainment and late-job risk, then assign the next actions by branch and owner.',
        ],
      },
    ],
  },
];

export const screenshotScenes: ScreenshotScene[] = [
  {
    slug: 'executive-dashboard',
    title: 'Executive dashboard',
    description:
      'A board-ready snapshot for backlog, incidents, SLA pressure, and next actions.',
    eyebrow: 'Leadership',
    metrics: [
      { label: 'Backlog', value: '27' },
      { label: 'Incidents', value: '4' },
      { label: 'At-risk branches', value: '3' },
    ],
  },
  {
    slug: 'branch-comparison',
    title: 'Branch comparison',
    description:
      'Side-by-side branch rankings for throughput, breaches, and first response attainment.',
    eyebrow: 'Analytics',
    metrics: [
      { label: 'Compared branches', value: '8' },
      { label: 'Top SLA branch', value: 'North' },
      { label: 'Highest backlog', value: 'Central' },
    ],
  },
  {
    slug: 'incident-escalation',
    title: 'Incident escalation center',
    description:
      'Escalation state, SLA due windows, collaboration, and audit history in one urgent workflow.',
    eyebrow: 'Incidents',
    metrics: [
      { label: 'Escalation level', value: 'L2' },
      { label: 'Response window', value: '18 min' },
      { label: 'Watchers', value: '6' },
    ],
  },
];
