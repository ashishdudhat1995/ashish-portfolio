export const initialPortfolio = {
  personal: {
    name: "Ashishkumar Dudhat",
    titles: ["Senior Software Engineer", "Lead Engineer", "Full Stack Developer"],
    primaryRole: "Senior Software Engineer & Technical Lead",
    tagline: "Building scalable, high-performance web applications & microservices across Fintech, Healthcare, and SaaS domains.",
    location: "Ahmedabad, Gujarat, India",
    email: "dudhatashish1995@gmail.com",
    phone: "+91 7600908370",
    bio: [
      "Lead Engineer with 8+ years of experience building scalable web applications using Angular, React.js, Next.js, and Node.js across MERN and MEAN stack architectures.",
      "Experienced in REST API design, microservices, cloud deployment (AWS, Docker), and performance optimization.",
      "Proven track record of technical leadership, mentoring engineering teams, architecting distributed systems, and delivering enterprise solutions in fintech, healthcare, and SaaS."
    ],
    photoUrl: "/ashish-photo.jpg",
    yearsOfExperience: 8,
    domains: ["Fintech", "Healthcare", "SaaS", "Enterprise Apps"],
    github: "https://github.com/ashishkumar-dudhat",
    linkedin: "https://linkedin.com/in/ashishkumar-dudhat",
    resumeDownloadUrl: "#",
    availabilityStatus: "Available to Join Immediately"
  },
  heroStats: [
    { id: "stat-1", label: "Years Experience", value: "8+", description: "Full Stack & Tech Leadership", iconName: "Briefcase", order: 1, enabled: true },
    { id: "stat-2", label: "API Response Boost", value: "40%", description: "Latency Reduction via Caching & Indexing", iconName: "Zap", order: 2, enabled: true },
    { id: "stat-3", label: "Delivery Acceleration", value: "30%", description: "Workflow & AI Integration Speedup", iconName: "TrendingUp", order: 3, enabled: true },
    { id: "stat-4", label: "Team Leadership", value: "5+", description: "Developers Mentored & Led in Agile", iconName: "Users", order: 4, enabled: true }
  ],
  about: {
    editorialHeading: "Engineering Scalable Digital Products with Architectural Depth & Precision.",
    introduction: [
      "Over 8+ years as a Senior Software Engineer and Lead Engineer, I have architected and scaled production web applications across full stack MERN and MEAN environments using Angular, React.js, Next.js, and Node.js. My work spans high-volume fintech platforms, real-time healthcare diagnostics, and enterprise SaaS systems.",
      "I specialize in modular REST API design, microservices containerization on AWS with Docker, database indexing across MongoDB, PostgreSQL, and MySQL, and Redis caching. By bridging frontend component engineering with backend systems design, I focus on delivering high-availability systems that accelerate release velocity while lowering API latency."
    ],
    pillars: [
      { id: "pillar-1", text: "Scalable Microservices Architecture", order: 1, enabled: true },
      { id: "pillar-2", text: "High-Concurrency Payment Infrastructure", order: 2, enabled: true },
      { id: "pillar-3", text: "Agile Team Mentorship", order: 3, enabled: true }
    ],
    metrics: [
      { value: "8+", label: "Years Experience", sublabel: "Full Stack & Technical Leadership" },
      { value: "40%", label: "API Response Boost", sublabel: "Latency Drop via Indexing & Redis" },
      { value: "30%", label: "Feature Speedup", sublabel: "Accelerated Release Cycles" },
      { value: "25%", label: "Deployment Time", sublabel: "Docker & AWS Containerization" },
      { value: "5+", label: "Scrum Leadership", sublabel: "Developers Mentored & Led" }
    ],
    domains: [
      {
        name: "Fintech & Lending",
        tagline: "High-Volume Transactions & Compliance",
        description: "Engineered automated digital loan processing platforms supporting high-concurrency credit evaluation and PCI-compliant Razorpay payment gateway integrations.",
        icon: "CreditCard",
        highlights: [
          "PCI-DSS compliant payment integration",
          "Automated credit scoring workflows",
          "Sub-15 min loan approval pipeline"
        ]
      },
      {
        name: "Healthcare & Diagnostics",
        tagline: "Medical Telemetry & Real-Time Data",
        description: "Built medical diagnostic platforms integrating DICOM ultrasound file parsing, real-time fetal growth charts, and WebSocket patient record management.",
        icon: "Activity",
        highlights: [
          "Automated DICOM ultrasound file parsing",
          "Real-time WebSocket telemetry updates",
          "Role-based patient record security"
        ]
      },
      {
        name: "SaaS & Cloud Platforms",
        tagline: "Multi-Tenant Workspaces & Microservices",
        description: "Architected multi-tenant subscription project management systems with fine-grained Role-Based Access Control (RBAC) and scalable NestJS backend services.",
        icon: "Cloud",
        highlights: [
          "Granular multi-tenant RBAC engine",
          "Modular NestJS dependency injection",
          "AWS EC2 Docker microservices"
        ]
      }
    ],
    technicalStrengths: [
      {
        category: "Frontend Engineering",
        description: "Building responsive, modern, component-driven interfaces with state hydration and memoization.",
        skills: ["Angular", "React.js", "Next.js", "Redux", "TypeScript", "Tailwind CSS", "Context API"],
        icon: "Code2"
      },
      {
        category: "Backend Engineering",
        description: "Architecting high-throughput RESTful APIs, microservices, GraphQL, and real-time socket channels.",
        skills: ["Node.js", "Express.js", "NestJS", "REST APIs", "GraphQL", "Socket.IO", "RabbitMQ", "JWT / OAuth2"],
        icon: "Cpu"
      },
      {
        category: "Cloud & Architecture",
        description: "Containerizing services, managing cloud infrastructure, and tuning relational and document datastores.",
        skills: ["AWS (EC2, S3, RDS, Lambda)", "GCP", "Docker", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch"],
        icon: "Cloud"
      },
      {
        category: "Technical Leadership",
        description: "Driving engineering standards, mentoring developers, establishing code reviews, and streamlining CI/CD.",
        skills: ["Agile Scrum", "Sprint Planning", "Code Reviews", "Developer Mentoring", "GitHub Actions", "Bitbucket Pipelines"],
        icon: "Award"
      }
    ]
  },
  experience: [
    {
      id: "thirdrock-techkno",
      company: "Third Rock Techkno",
      role: "Lead Engineer / Senior Software Engineer",
      period: "Jul 2021 – Present",
      location: "Ahmedabad, India",
      summary: "Architecting scalable web applications across Fintech, Healthcare, and SaaS domains.",
      highlights: ["Improved API response time by 40%", "Accelerated feature delivery by 30%"],
      technologies: ["Node.js", "React.js", "Angular", "TypeScript", "AWS", "Docker"],
      order: 1,
      enabled: true,
      status: "published"
    },
    {
      id: "career-transition-break",
      company: "Career Transition & Family Care",
      role: "Engineering Lead (Family Medical Care Transition)",
      period: "Dec 2020 – Jun 2021",
      location: "Gujarat, India",
      summary: "Stepped away briefly to serve as primary caregiver during a critical family medical emergency.",
      highlights: ["Maintained active technical skill currency"],
      technologies: ["System Design", "React.js", "Node.js"],
      isBreak: true,
      order: 2,
      enabled: true,
      status: "published"
    },
    {
      id: "pego-cyber-tech",
      company: "Pego Cyber Tech",
      role: "Senior Software Engineer",
      period: "Jul 2017 – Nov 2020",
      location: "Ahmedabad, India",
      summary: "Engineered web applications and document management systems.",
      highlights: ["Built corporate intranet platform"],
      technologies: ["AngularJS", "Node.js", "MongoDB", "Express.js"],
      order: 3,
      enabled: true,
      status: "published"
    }
  ],
  skills: [
    { id: "cat-frontend", title: "Frontend Engineering", description: "Modern Web UI & Client Frameworks", skills: [{ name: "React.js" }, { name: "Angular" }, { name: "Next.js" }, { name: "TypeScript" }], order: 1, enabled: true, status: "published" },
    { id: "cat-backend", title: "Backend Architecture", description: "Microservices & Distributed Systems", skills: [{ name: "Node.js" }, { name: "Express.js" }, { name: "REST APIs" }, { name: "GraphQL" }], order: 2, enabled: true, status: "published" },
    { id: "cat-database", title: "Databases & Storage", description: "Relational & NoSQL Storage", skills: [{ name: "PostgreSQL" }, { name: "MongoDB" }, { name: "Redis" }, { name: "Elasticsearch" }], order: 3, enabled: true, status: "published" }
  ],
  projects: [
    {
      id: "scanofe",
      name: "ScanOFe",
      subtitle: "Cloud Ultrasound & DICOM Diagnostic Platform",
      domain: "Healthcare",
      category: "Healthcare",
      period: "2023 – 2024",
      description: "Cloud-based DICOM medical imaging and ultrasound diagnostic platform.",
      capabilities: ["DICOM Web Viewer", "HL7 Compliance"],
      technologies: ["React.js", "Node.js", "PostgreSQL", "AWS S3"],
      architecturePoints: ["Cloud Edge Ingestion", "High Concurrency Streaming"],
      featured: true,
      images: ["/assets/projects/scanofe.svg"],
      order: 1,
      enabled: true,
      status: "published"
    },
    {
      id: "creditt",
      name: "Creditt+",
      subtitle: "Digital Micro-Lending & Instant Loan Platform",
      domain: "Fintech",
      category: "Fintech",
      period: "2022 – 2023",
      description: "PCI-compliant digital micro-lending platform.",
      capabilities: ["PCI-DSS Compliance", "Razorpay Payment Gateway"],
      technologies: ["Node.js", "Angular", "MongoDB", "Redis"],
      architecturePoints: ["Distributed Transaction Queue", "Redis Caching"],
      featured: true,
      images: ["/assets/projects/creditt.svg"],
      order: 2,
      enabled: true,
      status: "published"
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Bachelor of Engineering (BE)",
      field: "Information Technology",
      institution: "Saffrony Institute of Technology",
      location: "Ahmedabad, Gujarat, India",
      period: "2013 – 2017",
      order: 1,
      enabled: true,
      status: "published"
    }
  ],
  certifications: [],
  achievements: [],
  socialLinks: [
    { id: "social-1", platform: "GitHub", url: "https://github.com/ashishkumar-dudhat", iconName: "Github", label: "github.com/ashishkumar-dudhat", order: 1, enabled: true },
    { id: "social-2", platform: "LinkedIn", url: "https://linkedin.com/in/ashishkumar-dudhat", iconName: "Linkedin", label: "linkedin.com/in/ashishkumar-dudhat", order: 2, enabled: true },
    { id: "social-3", platform: "Email", url: "mailto:dudhatashish1995@gmail.com", iconName: "Mail", label: "dudhatashish1995@gmail.com", order: 3, enabled: true },
    { id: "social-4", platform: "Phone", url: "tel:+917600908370", iconName: "Phone", label: "+91 7600908370", order: 4, enabled: true }
  ],
  navigation: [
    { id: "nav-hero", label: "Home", target: "#hero", order: 1, enabled: true },
    { id: "nav-about", label: "About", target: "#about", order: 2, enabled: true },
    { id: "nav-experience", label: "Experience", target: "#experience", order: 3, enabled: true },
    { id: "nav-skills", label: "Skills", target: "#skills", order: 4, enabled: true },
    { id: "nav-projects", label: "Projects", target: "#projects", order: 5, enabled: true },
    { id: "nav-education", label: "Education", target: "#education", order: 6, enabled: true },
    { id: "nav-contact", label: "Contact", target: "#contact", order: 7, enabled: true }
  ],
  seo: {
    title: "Ashishkumar Dudhat | Senior Software Engineer & Technical Lead",
    description: "Senior Software Engineer with 8+ years experience building scalable web applications.",
    keywords: ["Senior Software Engineer", "Lead Engineer", "Full Stack Developer"],
    ogTitle: "Ashishkumar Dudhat - Senior Software Engineer & Technical Lead",
    ogDescription: "Senior Software Engineer with 8+ years experience.",
    ogImage: "/ashish-photo.jpg",
    canonicalUrl: "https://ashish-dudhat.dev"
  },
  siteSettings: {
    siteName: "Ashishkumar Dudhat Portfolio",
    siteTitle: "Ashishkumar Dudhat | Senior Software Engineer",
    siteDescription: "Executive single-page engineering portfolio for Ashishkumar Dudhat.",
    favicon: "/favicon.ico",
    logo: "/ashish-photo.jpg",
    defaultOgImage: "/ashish-photo.jpg",
    maintenanceMode: false
  },
  media: [
    { id: "media-profile", type: "image", url: "/ashish-photo.jpg", alt: "Ashishkumar Dudhat Profile Photo", title: "Profile Portrait" },
    { id: "media-scanofe", type: "svg", url: "/assets/projects/scanofe.svg", alt: "ScanOFe Ultrasound Architecture", title: "ScanOFe Mockup" },
    { id: "media-creditt", type: "svg", url: "/assets/projects/creditt.svg", alt: "Creditt+ Digital Lending Architecture", title: "Creditt+ Mockup" }
  ]
};
