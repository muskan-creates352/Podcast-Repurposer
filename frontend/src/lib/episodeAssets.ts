export interface EpisodeAssetInfo {
  episodeId: number | string;
  category: "Technology" | "Business" | "Creator Economy" | "Education";
  categoryColor: string;
  coverImage: string;
  hostName: string;
  hostAvatar: string;
  guestName?: string;
  guestAvatar?: string;
  tagline: string;
}

export const CATEGORIES = [
  {
    id: "Technology",
    title: "Technology & AI",
    description: "Multimodal LLMs, autonomous agents, and future tech",
    iconName: "Cpu",
    query: "multimodal AI agents",
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80",
    gradient: "from-purple-900/80 via-zinc-900 to-zinc-950",
    borderColor: "border-purple-500/30",
    tagColor: "bg-purple-500/20 text-purple-300",
  },
  {
    id: "Business",
    title: "Business & SaaS",
    description: "Creator monetization, product-market fit, and scaling",
    iconName: "TrendingUp",
    query: "monetization micro-SaaS",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    gradient: "from-emerald-950/80 via-zinc-900 to-zinc-950",
    borderColor: "border-emerald-500/30",
    tagColor: "bg-emerald-500/20 text-emerald-300",
  },
  {
    id: "Creator Economy",
    title: "Creator Economy",
    description: "Audio production, viral hooks, and studio craft",
    iconName: "Sparkles",
    query: "podcast repurposing creator",
    coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80",
    gradient: "from-violet-950/80 via-zinc-900 to-zinc-950",
    borderColor: "border-violet-500/30",
    tagColor: "bg-violet-500/20 text-violet-300",
  },
  {
    id: "Education",
    title: "Engineering & Deep Dives",
    description: "Pipelines, fine-tuning, and robust architecture",
    iconName: "BookOpen",
    query: "distributed pipelines fine-tuning",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    gradient: "from-sky-950/80 via-zinc-900 to-zinc-950",
    borderColor: "border-sky-500/30",
    tagColor: "bg-sky-500/20 text-sky-300",
  },
];

const KNOWN_EPISODES: Record<string, EpisodeAssetInfo> = {
  "1": {
    episodeId: 1,
    category: "Technology",
    categoryColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    hostName: "Alex Rivera",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    guestName: "Sarah Chen",
    guestAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    tagline: "Multimodal agents, vision models, and reasoning frameworks.",
  },
  "101": {
    episodeId: 101,
    category: "Technology",
    categoryColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    hostName: "Alex Rivera",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    guestName: "Sarah Chen",
    guestAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    tagline: "Multimodal agents, vision models, and reasoning frameworks.",
  },
  "2": {
    episodeId: 2,
    category: "Education",
    categoryColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    hostName: "Alex Rivera",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    guestName: "Sarah Chen",
    guestAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    tagline: "High-throughput data streaming and resilient cloud architectures.",
  },
  "102": {
    episodeId: 102,
    category: "Education",
    categoryColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    hostName: "Alex Rivera",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    guestName: "Sarah Chen",
    guestAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    tagline: "High-throughput data streaming and resilient cloud architectures.",
  },
  "3": {
    episodeId: 3,
    category: "Business",
    categoryColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    hostName: "Alex Rivera",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    guestName: "Marcus Vance",
    guestAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    tagline: "Building scalable recurring revenue from media & creator SaaS.",
  },
  "103": {
    episodeId: 103,
    category: "Business",
    categoryColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    hostName: "Alex Rivera",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    guestName: "Marcus Vance",
    guestAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    tagline: "Building scalable recurring revenue from media & creator SaaS.",
  },
  "4": {
    episodeId: 4,
    category: "Education",
    categoryColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    hostName: "Alex Rivera",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    guestName: "Dr. Elena Rostova",
    guestAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    tagline: "When to prompt engineer versus fine-tune custom model checkpoints.",
  },
  "104": {
    episodeId: 104,
    category: "Education",
    categoryColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    hostName: "Alex Rivera",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    guestName: "Dr. Elena Rostova",
    guestAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    tagline: "When to prompt engineer versus fine-tune custom model checkpoints.",
  },
  "5": {
    episodeId: 5,
    category: "Creator Economy",
    categoryColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    hostName: "Alex Rivera",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    guestName: "Devon Scott",
    guestAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    tagline: "Inside the studio: audio setup, raw interviews, and creator workflows.",
  },
  "105": {
    episodeId: 105,
    category: "Creator Economy",
    categoryColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    hostName: "Alex Rivera",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    guestName: "Devon Scott",
    guestAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    tagline: "Inside the studio: audio setup, raw interviews, and creator workflows.",
  },
};

export function getEpisodeAssets(episodeId: number | string, title = ""): EpisodeAssetInfo {
  const key = String(episodeId);
  if (KNOWN_EPISODES[key]) {
    return KNOWN_EPISODES[key];
  }

  // Dynamic context-aware analysis based on title
  const t = title.toLowerCase();
  if (t.includes("ai") || t.includes("agent") || t.includes("model") || t.includes("prompt") || t.includes("neural") || t.includes("tech")) {
    return {
      episodeId,
      category: "Technology",
      categoryColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
      hostName: "Creator Studio",
      hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      tagline: title || "AI & Technological Advancements",
    };
  }

  if (t.includes("business") || t.includes("saas") || t.includes("growth") || t.includes("monetiz") || t.includes("revenue")) {
    return {
      episodeId,
      category: "Business",
      categoryColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      hostName: "Creator Studio",
      hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      tagline: title || "Business Strategy and Growth",
    };
  }

  if (t.includes("podcast") || t.includes("creator") || t.includes("repurpose") || t.includes("mic") || t.includes("studio")) {
    return {
      episodeId,
      category: "Creator Economy",
      categoryColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
      coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
      hostName: "Creator Studio",
      hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      tagline: title || "Media Production & Repurposing",
    };
  }

  return {
    episodeId,
    category: "Education",
    categoryColor: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    hostName: "Creator Studio",
    hostAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    tagline: title || "Engineering & Learning Concepts",
  };
}
