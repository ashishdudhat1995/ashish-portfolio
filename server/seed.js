import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { initialPortfolio } from './src/data/initialPortfolio.js';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding PostgreSQL database with AdminUser, Experience, Skills, Projects, Education, Contact, SocialLinks, & Navigation...');

  const adminEmail = process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Ashishkumar Dudhat';

  const passwordHash = await bcrypt.hash(adminPass, 12);

  // 1. AdminUser
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: adminName, role: 'ADMIN', isActive: true },
    create: { email: adminEmail, name: adminName, passwordHash, role: 'ADMIN', isActive: true },
  });

  // 2. PersonalInformation
  await prisma.personalInformation.deleteMany();
  await prisma.personalInformation.create({
    data: {
      fullName: initialPortfolio.personal.name,
      professionalTitle: initialPortfolio.personal.primaryRole,
      email: initialPortfolio.personal.email,
      phone: initialPortfolio.personal.phone,
      location: initialPortfolio.personal.location,
      availability: initialPortfolio.personal.availabilityStatus,
      bio: initialPortfolio.personal.bio,
      profileImageId: initialPortfolio.personal.photoUrl,
      enabled: true
    }
  });

  // 3. Hero
  await prisma.hero.deleteMany();
  await prisma.hero.create({
    data: {
      eyebrow: 'Senior Software Engineer & Technical Lead',
      headline: initialPortfolio.personal.name,
      subheadline: 'Full Stack MERN & MEAN Stack Specialist',
      description: initialPortfolio.personal.tagline,
      primaryCtaLabel: 'Explore Production Projects',
      primaryCtaTarget: '#projects',
      secondaryCtaLabel: 'Initiate Contact',
      secondaryCtaTarget: '#contact',
      enabled: true
    }
  });

  // 4. HeroStat
  await prisma.heroStat.deleteMany();
  for (const stat of initialPortfolio.heroStats) {
    await prisma.heroStat.create({
      data: {
        id: stat.id,
        label: stat.label,
        value: stat.value,
        description: stat.description,
        iconName: stat.iconName,
        order: stat.order,
        enabled: stat.enabled
      }
    });
  }

  // 5. About & AboutHighlight
  await prisma.about.deleteMany();
  const aboutRecord = await prisma.about.create({
    data: {
      editorialHeading: initialPortfolio.about.editorialHeading,
      introduction: initialPortfolio.about.introduction,
      domains: initialPortfolio.about.domains,
      enabled: true
    }
  });

  for (const h of initialPortfolio.about.metrics) {
    await prisma.aboutHighlight.create({
      data: {
        aboutId: aboutRecord.id,
        label: h.label,
        value: h.value,
        description: h.sublabel || h.label,
        order: initialPortfolio.about.metrics.indexOf(h) + 1,
        enabled: true
      }
    });
  }

  // 6. ExperienceItem
  await prisma.experienceItem.deleteMany();
  const experienceSeedData = [
    {
      id: 'thirdrock-techkno',
      company: 'ThirdRock Techkno LLP',
      role: 'Lead Engineer',
      startDate: '2025-07',
      endDate: '2026-01',
      isCurrent: false,
      location: 'Ahmedabad, Gujarat, India',
      summary: 'Architecting scalable web applications across Fintech, Healthcare, and SaaS domains. Leading engineering teams and streamlining API response times.',
      highlights: [
        { id: 'h1', text: 'Architected distributed MERN/MEAN microservices handling high-concurrency workloads.', order: 1, enabled: true },
        { id: 'h2', text: 'Improved API response time by 40% using Redis caching and PostgreSQL query indexing.', order: 2, enabled: true },
        { id: 'h3', text: 'Accelerated feature delivery by 30% through CI/CD automation and team mentorship.', order: 3, enabled: true }
      ],
      metrics: [
        { id: 'm1', label: 'API Latency Boost', value: '40%', description: 'Sub-50ms API response time' },
        { id: 'm2', label: 'Release Speedup', value: '30%', description: 'Faster sprint execution' }
      ],
      technologies: ['Node.js', 'React.js', 'Angular', 'TypeScript', 'AWS', 'Docker', 'PostgreSQL', 'Redis'],
      isBreak: false,
      order: 1,
      enabled: true
    },
    {
      id: 'credify-technologies',
      company: 'Credify Technologies Pvt. Ltd.',
      role: 'Senior Full Stack Developer',
      startDate: '2023-07',
      endDate: '2025-05',
      isCurrent: false,
      location: 'Ahmedabad, Gujarat, India',
      summary: 'Engineered PCI-compliant digital micro-lending platforms and instant loan processing workflows.',
      highlights: [
        { id: 'h1', text: 'Integrated PCI-DSS compliant Razorpay payment gateway and credit scoring pipelines.', order: 1, enabled: true },
        { id: 'h2', text: 'Engineered sub-15 minute automated loan approval workflows handling high transaction volumes.', order: 2, enabled: true }
      ],
      metrics: [
        { id: 'm1', label: 'Loan Processing Speed', value: '15 Min', description: 'Automated credit pipeline' }
      ],
      technologies: ['Node.js', 'Angular', 'MongoDB', 'Redis', 'Express.js', 'REST APIs'],
      isBreak: false,
      order: 2,
      enabled: true
    },
    {
      id: 'priya-softweb',
      company: 'Priya Softweb Solutions Pvt. Ltd.',
      role: 'Technical Analyst',
      startDate: '2021-07',
      endDate: '2023-06',
      isCurrent: false,
      location: 'Ahmedabad, Gujarat, India',
      summary: 'Led system design, code reviews, and microservices architecture for client web applications.',
      highlights: [
        { id: 'h1', text: 'Designed modular NestJS dependency injection architecture for enterprise multi-tenant apps.', order: 1, enabled: true },
        { id: 'h2', text: 'Mentored 5+ junior developers in TypeScript, Angular, and Node.js best practices.', order: 2, enabled: true }
      ],
      metrics: [
        { id: 'm1', label: 'Team Leadership', value: '5+ Devs', description: 'Agile mentorship' }
      ],
      technologies: ['React.js', 'Node.js', 'NestJS', 'PostgreSQL', 'TypeScript', 'Docker'],
      isBreak: false,
      order: 3,
      enabled: true
    },
    {
      id: 'solution-analysts',
      company: 'Solution Analysts Pvt. Ltd.',
      role: 'Software Engineer',
      startDate: '2020-08',
      endDate: '2021-07',
      isCurrent: false,
      location: 'Ahmedabad, Gujarat, India',
      summary: 'Developed custom web applications, RESTful web services, and responsive client UIs.',
      highlights: [
        { id: 'h1', text: 'Built state-hydrated React.js components with Context API and Redux state management.', order: 1, enabled: true },
        { id: 'h2', text: 'Optimized frontend bundle size reducing first contentful paint by 25%.', order: 2, enabled: true }
      ],
      metrics: [
        { id: 'm1', label: 'Bundle Size Drop', value: '25%', description: 'Faster initial render' }
      ],
      technologies: ['React.js', 'Node.js', 'Express.js', 'JavaScript', 'MongoDB'],
      isBreak: false,
      order: 4,
      enabled: true
    },
    {
      id: 'hupp-technologies',
      company: 'Hupp Technologies Pvt. Ltd.',
      role: 'JavaScript Developer',
      startDate: '2017-08',
      endDate: '2020-07',
      isCurrent: false,
      location: 'Ahmedabad, Gujarat, India',
      summary: 'Engineered web applications and document management systems using AngularJS and Node.js.',
      highlights: [
        { id: 'h1', text: 'Built secure intranet document management platform with role-based access control.', order: 1, enabled: true },
        { id: 'h2', text: 'Constructed real-time WebSocket messaging channels for multi-user collaboration.', order: 2, enabled: true }
      ],
      metrics: [
        { id: 'm1', label: 'WebSocket Latency', value: 'Sub-50ms', description: 'Real-time telemetry' }
      ],
      technologies: ['AngularJS', 'Node.js', 'MongoDB', 'Express.js', 'Socket.IO'],
      isBreak: false,
      order: 5,
      enabled: true
    },
    {
      id: 'career-break',
      company: 'Career Break - Family Medical Care',
      role: 'Full-Time Family Caregiver',
      startDate: '2026-02',
      endDate: null,
      isCurrent: true,
      location: 'Ahmedabad, Gujarat, India',
      summary: 'Stepped away briefly to serve as primary caregiver during a critical family medical situation. Maintained active technical skill currency and continuous learning.',
      highlights: [
        { id: 'h1', text: 'Provided full-time dedicated primary medical care for family member.', order: 1, enabled: true },
        { id: 'h2', text: 'Maintained active skill currency in Next.js 14, React 19, TypeScript 5, and Prisma ORM.', order: 2, enabled: true }
      ],
      metrics: [
        { id: 'm1', label: 'Skill Currency', value: '100%', description: 'Active engineering learning' }
      ],
      technologies: ['React.js', 'Next.js', 'TypeScript', 'Prisma ORM', 'Node.js'],
      isBreak: true,
      order: 6,
      enabled: true
    }
  ];

  for (const exp of experienceSeedData) {
    await prisma.experienceItem.create({ data: exp });
  }

  // 7. SkillCategory & Skill
  await prisma.skill.deleteMany();
  await prisma.skillCategory.deleteMany();

  const skillsSeedData = [
    {
      id: 'cat-languages',
      name: 'Languages',
      slug: 'languages',
      description: 'Core programming and scripting languages',
      order: 1,
      enabled: true,
      skills: ['JavaScript (ES6+)', 'TypeScript']
    },
    {
      id: 'cat-frontend',
      name: 'Frontend',
      slug: 'frontend',
      description: 'UI frameworks, state management, and modern styling',
      order: 2,
      enabled: true,
      skills: ['Angular', 'React.js', 'Next.js', 'Redux', 'Context API', 'Tailwind CSS', 'HTML5', 'CSS3']
    },
    {
      id: 'cat-backend',
      name: 'Backend',
      slug: 'backend',
      description: 'Server frameworks, API design, and asynchronous queues',
      order: 3,
      enabled: true,
      skills: ['Node.js', 'Express.js', 'NestJS', 'REST APIs', 'GraphQL', 'Socket.IO', 'JWT', 'OAuth2', 'RabbitMQ']
    },
    {
      id: 'cat-architecture',
      name: 'Architecture',
      slug: 'architecture',
      description: 'Enterprise system design patterns & microservices topology',
      order: 4,
      enabled: true,
      skills: ['Monolithic', 'Microservices', 'MVC', 'Serverless', 'API Gateway']
    },
    {
      id: 'cat-databases',
      name: 'Databases',
      slug: 'databases',
      description: 'Relational, NoSQL, in-memory caching, and search engines',
      order: 5,
      enabled: true,
      skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch']
    },
    {
      id: 'cat-cloud-devops',
      name: 'Cloud & DevOps',
      slug: 'cloud-devops',
      description: 'AWS & GCP infrastructure, containerization, and DNS routing',
      order: 6,
      enabled: true,
      skills: ['AWS', 'EC2', 'S3', 'RDS', 'Lambda', 'Route 53', 'CloudFront', 'GCP', 'Docker']
    },
    {
      id: 'cat-version-control',
      name: 'Version Control & CI/CD',
      slug: 'version-control-cicd',
      description: 'Distributed version control & continuous deployment pipelines',
      order: 7,
      enabled: true,
      skills: ['Git', 'GitHub', 'Bitbucket', 'GitHub Actions', 'Bitbucket Pipelines']
    },
    {
      id: 'cat-testing-tools',
      name: 'Testing & Tools',
      slug: 'testing-tools',
      description: 'Test frameworks, API documentation, design, and agile tools',
      order: 8,
      enabled: true,
      skills: ['Jest', 'Mocha', 'Postman', 'Swagger', 'OpenAPI', 'Jira', 'Figma', 'Agile', 'Scrum']
    },
    {
      id: 'cat-os',
      name: 'OS',
      slug: 'os',
      description: 'Development and deployment operating systems',
      order: 9,
      enabled: true,
      skills: ['Linux', 'Windows', 'macOS']
    }
  ];

  for (const catData of skillsSeedData) {
    const { skills, ...catFields } = catData;
    const categoryRecord = await prisma.skillCategory.create({ data: catFields });

    for (let i = 0; i < skills.length; i++) {
      const skName = skills[i];
      const skSlug = skName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await prisma.skill.create({
        data: {
          id: `sk-${catFields.slug}-${skSlug}`,
          categoryId: categoryRecord.id,
          name: skName,
          slug: skSlug,
          order: i + 1,
          enabled: true
        }
      });
    }
  }

  // 8. Project (6 Documented Resume Case Studies)
  await prisma.project.deleteMany();

  const projectsSeedData = [
    {
      id: 'scanofe',
      name: 'ScanOFe – Fetal Diagnosis Platform',
      title: 'ScanOFe – Fetal Diagnosis Platform',
      subtitle: 'Cloud Ultrasound & DICOM Diagnostic Platform',
      domain: 'Healthcare & Medical Systems',
      category: 'Healthcare',
      period: '2025-07 - 2026-01',
      description: 'Cloud-based DICOM medical imaging and ultrasound diagnostic platform allowing doctors to track fetal growth and eliminate manual clinical calculations.',
      capabilities: [
        'Integrated cornerstone DICOM web library to extract and render ultrasound pixel telemetry.',
        'Eliminated manual obstetrics growth calculations with automated fetal curve algorithms.',
        'Engineered real-time interactive SVG growth velocity graphs for obstetricians.',
        'Accelerated clinical decision-making and reduced patient report compilation time by 50%.'
      ],
      highlights: [
        'Integrated cornerstone DICOM web library to extract and render ultrasound pixel telemetry.',
        'Engineered real-time interactive SVG growth velocity graphs for obstetricians.'
      ],
      technologies: ['React.js', 'Redux', 'Node.js', 'Strapi', 'MySQL', 'AWS'],
      architecturePoints: [
        'Event-driven DICOM streaming architecture',
        'High-concurrency patient telemetry pipeline'
      ],
      featured: true,
      images: [],
      order: 1,
      enabled: true,
      status: 'PUBLISHED'
    },
    {
      id: 'creditt-plus',
      name: 'Creditt+ – Digital Lending Platform',
      title: 'Creditt+ – Digital Lending Platform',
      subtitle: 'Instant Micro-Lending & Credit Scoring Engine',
      domain: 'Fintech & Digital Lending',
      category: 'Fintech',
      period: '2023-07 - 2025-05',
      description: 'PCI-DSS compliant digital micro-lending platform providing instant loan processing and automated credit risk evaluation for salaried professionals.',
      capabilities: [
        'Automated end-to-end loan processing pipeline from KYC verification to bank disbursement.',
        'Constructed secure high-throughput REST APIs handling thousands of daily loan applications.',
        'Integrated real-time credit score aggregation & automated underwriting decision matrix.',
        'Reduced total loan approval lifecycle from 2 days to under 15 minutes.'
      ],
      highlights: [
        'Constructed secure high-throughput REST APIs handling thousands of daily loan applications.',
        'Reduced total loan approval lifecycle from 2 days to under 15 minutes.'
      ],
      technologies: ['Angular', 'Node.js', 'MongoDB', 'MySQL', 'AWS'],
      architecturePoints: [
        'PCI-DSS compliant microservices architecture',
        'Automated underwriting decision matrix pipeline'
      ],
      featured: true,
      images: [],
      order: 2,
      enabled: true,
      status: 'PUBLISHED'
    },
    {
      id: 'project-management-tool',
      name: 'Project Management Tool – SaaS Platform',
      title: 'Project Management Tool – SaaS Platform',
      subtitle: 'Multi-Tenant Corporate Workflow & Agile Platform',
      domain: 'Enterprise SaaS',
      category: 'SaaS',
      period: '2022-06 - 2023-06',
      description: 'Subscription multi-tenant SaaS platform enabling enterprise organizations to manage multi-team projects, sprint boards, and RBAC security.',
      capabilities: [
        'Engineered seamless multi-tenant company onboarding & organization workspace isolation.',
        'Built real-time interactive Kanban task boards with drag-and-drop state synchronization.',
        'Implemented granular role-based access control (RBAC) and automated subscription billing.',
        'Streamlined multi-team collaboration across cross-functional engineering departments.'
      ],
      highlights: [
        'Built real-time interactive Kanban task boards with drag-and-drop state synchronization.',
        'Implemented granular role-based access control (RBAC) and automated subscription billing.'
      ],
      technologies: ['React.js', 'NestJS', 'MongoDB', 'AWS'],
      architecturePoints: [
        'Multi-tenant schema isolation pattern',
        'Real-time WebSocket event synchronization'
      ],
      featured: true,
      images: [],
      order: 3,
      enabled: true,
      status: 'PUBLISHED'
    },
    {
      id: 'mediswift',
      name: 'MediSwift – Healthcare Management System',
      title: 'MediSwift – Healthcare Management System',
      subtitle: 'Real-Time EHR & Telehealth Management System',
      domain: 'Healthcare IT',
      category: 'Healthcare',
      period: '2021-07 - 2022-06',
      description: 'Comprehensive healthcare portal managing electronic health records (EHR), online appointment scheduling, and real-time patient-doctor telemetry.',
      capabilities: [
        'Constructed patient appointment scheduling and digital lab test report generation.',
        'Implemented HIPAA-compliant role-based access control for medical staff and patients.',
        'Integrated WebSocket-based real-time doctor-patient communication channels.',
        'Streamlined clinic workflows and reduced appointment wait times.'
      ],
      highlights: [
        'Implemented HIPAA-compliant role-based access control for medical staff and patients.',
        'Integrated WebSocket-based real-time doctor-patient communication channels.'
      ],
      technologies: ['React.js', 'Redux', 'Node.js', 'MongoDB', 'GCP'],
      architecturePoints: [
        'HIPAA-compliant data encryption at rest and in transit',
        'Low-latency WebSocket telemetry channel'
      ],
      featured: true,
      images: [],
      order: 4,
      enabled: true,
      status: 'PUBLISHED'
    },
    {
      id: 'pego-intranet',
      name: 'Pego Intranet – Enterprise Document Management',
      title: 'Pego Intranet – Enterprise Document Management',
      subtitle: 'Secure Corporate Vault & Versioning System',
      domain: 'Enterprise Intranet',
      category: 'Enterprise',
      period: '2021-12 - 2022-07',
      description: 'Enterprise document management platform providing secure centralized document storage, document versioning, and access control audit logs.',
      capabilities: [
        'Engineered centralized document storage vault with AES-256 encrypted file uploads.',
        'Implemented document version control enabling instant rollback of corporate policy assets.',
        'Enforced granular role-based permissions preventing unauthorized document exposure.'
      ],
      highlights: [
        'Engineered centralized document storage vault with AES-256 encrypted file uploads.'
      ],
      technologies: ['Angular', 'Node.js', 'PostgreSQL', 'GCP'],
      architecturePoints: [
        'AES-256 encrypted object storage vault',
        'Audit-logged document versioning engine'
      ],
      featured: false,
      images: [],
      order: 5,
      enabled: true,
      status: 'PUBLISHED'
    },
    {
      id: 'workmingle',
      name: 'WorkMingle',
      title: 'WorkMingle Enterprise Networking Platform',
      subtitle: 'Corporate Networking & Mentorship Platform',
      domain: 'Corporate / Social',
      category: 'Networking',
      period: '2022 - 2023',
      description: 'Corporate social network connecting verified employees across enterprises for professional networking, mentorship, and real-time collaboration.',
      capabilities: [
        'Implemented domain-level employee verification and professional profile management.',
        'Architected real-time WebSocket instant messaging channels supporting group chats.',
        'Optimized REST API database queries and client rendering for thousands of concurrent users.'
      ],
      highlights: [
        'Architected real-time WebSocket instant messaging channels supporting group chats.'
      ],
      technologies: ['React.js', 'Redux', 'NestJS', 'MongoDB', 'AWS'],
      architecturePoints: [
        'High-concurrency instant messaging pipeline',
        'Enterprise domain-verified SSO pattern'
      ],
      featured: false,
      images: [],
      order: 6,
      enabled: true,
      status: 'PUBLISHED'
    }
  ];

  for (const projData of projectsSeedData) {
    await prisma.project.upsert({
      where: { id: projData.id },
      update: projData,
      create: projData
    });
  }

  // 9. AcademicEducation
  await prisma.academicEducation.deleteMany();
  await prisma.academicEducation.create({
    data: {
      degree: 'Bachelor of Engineering – Information Technology (BE-IT)',
      field: 'Information Technology',
      institution: 'Saffrony Institute of Technology, Gujarat',
      location: 'Gujarat, India',
      period: '2013-06 - 2017-07',
      startDate: '2013-06',
      endDate: '2017-07',
      isCurrent: false,
      description: 'Comprehensive 4-year degree in Information Technology with focus on Software Engineering, Data Structures, Database Management Systems, and Web Application Architecture.',
      order: 1,
      enabled: true
    }
  });

  // 10. Certification & Achievement
  await prisma.professionalCertification.deleteMany();
  await prisma.achievement.deleteMany();

  // 11. ContactSettings
  await prisma.contactSettings.deleteMany();
  await prisma.contactSettings.create({
    data: {
      id: 'default-contact',
      heading: "Let's Build Something Exceptional Together.",
      description: "Have a high-concurrency microservices project, fintech integration, or engineering leadership role in mind? Reach out directly.",
      primaryCtaLabel: "Initiate Discussion",
      primaryCtaTarget: "#contact",
      enabled: true
    }
  });

  // 12. SocialLink (Seeding ONLY verified links from project dataset)
  await prisma.socialLink.deleteMany();
  const verifiedSocialLinks = [
    {
      id: 'soc-github',
      platform: 'GitHub',
      label: 'github.com/ashishkumar-dudhat',
      url: 'https://github.com/ashishkumar-dudhat',
      iconKey: 'github',
      order: 1,
      enabled: true
    },
    {
      id: 'soc-linkedin',
      platform: 'LinkedIn',
      label: 'linkedin.com/in/ashishkumar-dudhat',
      url: 'https://linkedin.com/in/ashishkumar-dudhat',
      iconKey: 'linkedin',
      order: 2,
      enabled: true
    }
  ];

  for (const soc of verifiedSocialLinks) {
    await prisma.socialLink.create({ data: soc });
  }

  // 13. NavigationItem (7 Single-Page Navigation Anchors in Order)
  await prisma.navigationItem.deleteMany();
  const navigationSeedData = [
    { id: 'nav-home', label: 'Home', target: '#home', type: 'section', openInNewTab: false, order: 1, enabled: true },
    { id: 'nav-about', label: 'About', target: '#about', type: 'section', openInNewTab: false, order: 2, enabled: true },
    { id: 'nav-experience', label: 'Experience', target: '#experience', type: 'section', openInNewTab: false, order: 3, enabled: true },
    { id: 'nav-skills', label: 'Skills', target: '#skills', type: 'section', openInNewTab: false, order: 4, enabled: true },
    { id: 'nav-projects', label: 'Projects', target: '#projects', type: 'section', openInNewTab: false, order: 5, enabled: true },
    { id: 'nav-education', label: 'Education', target: '#education', type: 'section', openInNewTab: false, order: 6, enabled: true },
    { id: 'nav-contact', label: 'Contact', target: '#contact', type: 'section', openInNewTab: false, order: 7, enabled: true }
  ];

  for (const nav of navigationSeedData) {
    await prisma.navigationItem.create({ data: nav });
  }

  // 14. SeoSettings (Singleton safe upsert derived from portfolio data)
  const defaultStructuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Ashishkumar Dudhat",
    "jobTitle": "Senior Software Engineer & Technical Lead",
    "sameAs": [
      "https://github.com/ashishkumar-dudhat",
      "https://linkedin.com/in/ashishkumar-dudhat"
    ]
  }, null, 2);

  await prisma.seoSettings.upsert({
    where: { id: 'default-seo' },
    update: {},
    create: {
      id: 'default-seo',
      title: 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
      description: 'Senior Software Engineer & Lead Engineer with 8+ years of experience architecting and scaling production web applications across MERN & MEAN full stack environments.',
      keywords: 'Senior Software Engineer, Technical Lead, Full Stack Developer, React, Node.js, TypeScript, PostgreSQL, Angular, MERN, Microservices',
      canonicalUrl: null,
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
      ogDescription: 'Senior Software Engineer & Lead Engineer with 8+ years of experience architecting and scaling production web applications across MERN & MEAN full stack environments.',
      ogImageId: null,
      twitterCard: 'summary_large_image',
      twitterTitle: 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
      twitterDescription: 'Senior Software Engineer & Lead Engineer with 8+ years of experience architecting and scaling production web applications across MERN & MEAN full stack environments.',
      twitterImageId: null,
      faviconMediaId: null,
      structuredDataEnabled: true,
      structuredDataJson: defaultStructuredData
    }
  });

  // 15. SiteSettings (Singleton safe upsert)
  await prisma.siteSettings.upsert({
    where: { id: 'default-site-settings' },
    update: {},
    create: {
      id: 'default-site-settings',
      siteName: 'Ashishkumar Dudhat Portfolio',
      defaultTitle: 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
      defaultDescription: 'Senior Software Engineer & Lead Engineer specializing in full stack Web Applications, Microservices, and Cloud Architecture.',
      locale: 'en-US',
      timezone: 'Asia/Kolkata',
      maintenanceMode: false,
      analyticsProvider: null,
      analyticsId: null
    }
  });

  // 16. PortfolioSettings (Singleton safe upsert)
  await prisma.portfolioSettings.upsert({
    where: { id: 'default-portfolio-settings' },
    update: {},
    create: {
      id: 'default-portfolio-settings',
      status: 'PUBLISHED',
      draftVersion: 1,
      publishedVersion: 1,
      lastPublishedAt: new Date()
    }
  });

  // 17. MediaItem
  await prisma.mediaItem.deleteMany();
  for (const media of initialPortfolio.media) {
    await prisma.mediaItem.create({ data: media });
  }

  console.log('✅ [Seed] PostgreSQL Database seeded cleanly with SEO Settings, Site Settings, Verified Social Links, Navigation, & Global Portfolio Settings!');
}

main()
  .catch((e) => {
    console.error('❌ [Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
