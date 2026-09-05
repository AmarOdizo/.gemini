const INITIAL_PROJECTS = [
  {
    id: "proj-1",
    title: "Aura AI Assistant",
    tagline: "Autonomous multi-modal AI workspace copilot with local LLM support",
    description: "An advanced desktop & web copilot designed for code synthesis, workflow automation, and real-time pair programming. Integrates seamlessly with local open-weights models and cloud endpoints.",
    category: "AI & ML",
    status: "In Progress",
    progress: 78,
    priority: "High",
    starred: true,
    startDate: "2026-01-15",
    targetDate: "2026-10-30",
    budget: "$45,000",
    tags: ["React", "TypeScript", "Python", "PyTorch", "WebSockets", "Electron"],
    team: [
      { name: "Alex Chen", role: "AI Lead", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
      { name: "Elena Rostova", role: "UI Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
      { name: "Marcus Vance", role: "Backend Architect", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" }
    ],
    milestones: [
      { id: "m1", title: "Local LLM Inference Engine API", completed: true },
      { id: "m2", title: "Context Window Compression Algorithm", completed: true },
      { id: "m3", title: "Multi-tab Workspace Canvas UI", completed: true },
      { id: "m4", title: "VS Code Extension Bridge", completed: false },
      { id: "m5", title: "End-to-End Encryption Sync", completed: false }
    ],
    metrics: { stars: 342, forks: 48, commits: 512 },
    links: { github: "https://github.com/example/aura-ai", demo: "https://aura-ai.example.io" }
  },
  {
    id: "proj-2",
    title: "Quantum Pay Gateway",
    tagline: "Ultra-low-latency crypto & fiat payment orchestration backend",
    description: "High-throughput financial processing API supporting decentralized micro-payments, cross-border currency conversion, and automated fraud prevention ML models.",
    category: "Web Applications",
    status: "Completed",
    progress: 100,
    priority: "High",
    starred: true,
    startDate: "2025-06-01",
    targetDate: "2026-02-15",
    budget: "$90,000",
    tags: ["Go", "Kafka", "PostgreSQL", "Redis", "Docker", "Kubernetes"],
    team: [
      { name: "Sarah Jenkins", role: "Lead Engineer", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" },
      { name: "David Kim", role: "DevOps Engineer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" }
    ],
    milestones: [
      { id: "m1", title: "Core Transaction Pipeline", completed: true },
      { id: "m2", title: "Real-time Fraud Detection System", completed: true },
      { id: "m3", title: "PCI-DSS Level 1 Compliance Audit", completed: true },
      { id: "m4", title: "Global CDN Multi-region Deployment", completed: true }
    ],
    metrics: { stars: 890, forks: 120, commits: 1430 },
    links: { github: "https://github.com/example/quantumpay", demo: "https://quantumpay.example.com" }
  },
  {
    id: "proj-3",
    title: "Nexus Design System",
    tagline: "Accessible, high-performance UI library with glassmorphic tokens",
    description: "A comprehensive design system built for web, mobile, and desktop applications. Features dark-first aesthetics, WCAG AAA accessibility compliance, and CSS custom property theme generators.",
    category: "Design Systems",
    status: "In Progress",
    progress: 62,
    priority: "Medium",
    starred: false,
    startDate: "2026-03-01",
    targetDate: "2026-11-15",
    budget: "$25,000",
    tags: ["CSS", "Web Components", "Figma", "Storybook", "JavaScript"],
    team: [
      { name: "Elena Rostova", role: "Design Lead", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
      { name: "Liam O'Connor", role: "Frontend Dev", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" }
    ],
    milestones: [
      { id: "m1", title: "Design Token Architecture in Figma", completed: true },
      { id: "m2", title: "Core Form Components & Validation", completed: true },
      { id: "m3", title: "Data Table & Dynamic Charting Components", completed: false },
      { id: "m4", title: "Storybook Interactive Playground", completed: false }
    ],
    metrics: { stars: 520, forks: 64, commits: 280 },
    links: { github: "https://github.com/example/nexus-ui", demo: "https://nexus-ui.example.org" }
  },
  {
    id: "proj-4",
    title: "Skyline Cloud Mesh",
    tagline: "Automated Kubernetes multi-cluster management and traffic routing",
    description: "Zero-trust service mesh control plane designed for hybrid multi-cloud infrastructure. Automatically handles TLS certificate rotation, mTLS policy enforcement, and circuit breaking.",
    category: "Cloud & DevOps",
    status: "In Progress",
    progress: 45,
    priority: "High",
    starred: true,
    startDate: "2026-02-10",
    targetDate: "2026-12-01",
    budget: "$120,000",
    tags: ["Rust", "Kubernetes", "eBPF", "Terraform", "Envoy", "Prometheus"],
    team: [
      { name: "David Kim", role: "Cloud Architect", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
      { name: "Marcus Vance", role: "Systems Engineer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" }
    ],
    milestones: [
      { id: "m1", title: "Rust-based Control Plane Daemon", completed: true },
      { id: "m2", title: "eBPF Kernel Packet Filtering Engine", completed: true },
      { id: "m3", title: "Grafana Telemetry Dashboard Integration", completed: false },
      { id: "m4", title: "Multi-Cloud Automated Failover Tests", completed: false }
    ],
    metrics: { stars: 610, forks: 85, commits: 740 },
    links: { github: "https://github.com/example/skyline-mesh", demo: "https://skyline.example.io" }
  },
  {
    id: "proj-5",
    title: "Pulse Mobile Health",
    tagline: "Real-time biometric analytics app connected to wearable sensors",
    description: "Cross-platform mobile application providing real-time heart rate variability, sleep quality modeling, and personalized AI health insights using Bluetooth Low Energy (BLE).",
    category: "Mobile Apps",
    status: "Planned",
    progress: 15,
    priority: "Low",
    starred: false,
    startDate: "2026-05-01",
    targetDate: "2027-01-20",
    budget: "$35,000",
    tags: ["React Native", "Swift", "Kotlin", "CoreBluetooth", "FastAPI"],
    team: [
      { name: "Sarah Jenkins", role: "Product Manager", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" },
      { name: "Alex Chen", role: "Mobile Developer", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" }
    ],
    milestones: [
      { id: "m1", title: "UI/UX Wireframes & User Journey", completed: true },
      { id: "m2", title: "BLE Peripheral Connection Manager", completed: false },
      { id: "m3", title: "Offline Data Sync Engine", completed: false },
      { id: "m4", title: "App Store & Play Store Submissions", completed: false }
    ],
    metrics: { stars: 125, forks: 15, commits: 95 },
    links: { github: "https://github.com/example/pulse-health", demo: "https://pulsehealth.example.com" }
  },
  {
    id: "proj-6",
    title: "CipherShield Sentinel",
    tagline: "Automated vulnerability scanner & dependency security checker",
    description: "Continuous security integration engine that intercepts pull requests to scan binary artifacts, source code ASTs, and container images for known CVEs and secret leaks.",
    category: "Cyber Security",
    status: "Completed",
    progress: 100,
    priority: "Medium",
    starred: false,
    startDate: "2025-09-01",
    targetDate: "2026-03-31",
    budget: "$50,000",
    tags: ["Python", "Docker", "GraphQL", "PostgreSQL", "GitHub API"],
    team: [
      { name: "Marcus Vance", role: "Security Engineer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" }
    ],
    milestones: [
      { id: "m1", title: "AST Parser for Python & JS", completed: true },
      { id: "m2", title: "NVD Database Synchronization Worker", completed: true },
      { id: "m3", title: "GitHub Actions Custom Runner", completed: true },
      { id: "m4", title: "Slack & Email Alerting System", completed: true }
    ],
    metrics: { stars: 430, forks: 52, commits: 390 },
    links: { github: "https://github.com/example/ciphershield", demo: "https://ciphershield.example.net" }
  }
];
