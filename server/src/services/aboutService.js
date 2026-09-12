import { aboutRepository } from '../repositories/aboutRepository.js';

const DEFAULT_TECHNICAL_STRENGTHS = [
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
];

export const aboutService = {
  async getAdminAbout() {
    let about = await aboutRepository.getAbout();
    if (!about) {
      about = await aboutRepository.upsertAbout({});
    }
    return about;
  },

  async getPublicAbout() {
    const about = await this.getAdminAbout();
    if (!about || !about.enabled) return null;

    let source = about;
    if (about.status === 'DRAFT' && about.publishedData) {
      source = typeof about.publishedData === 'string' ? JSON.parse(about.publishedData) : about.publishedData;
    }

    if (source.enabled === false) return null;

    const enabledHighlights = (source.highlights || [])
      .filter(h => h.enabled !== false)
      .sort((a, b) => a.order - b.order)
      .map(h => ({
        id: h.id,
        label: h.label,
        value: h.value,
        description: h.description,
        order: h.order
      }));

    const rawDomains = Array.isArray(source.domains) ? source.domains : [];
    const enabledDomains = rawDomains
      .filter(d => d.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const rawPillars = Array.isArray(source.pillars) ? source.pillars : [];
    const enabledPillars = rawPillars
      .filter(p => p.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const rawStrengths = Array.isArray(source.technicalStrengths) && source.technicalStrengths.length > 0
      ? source.technicalStrengths
      : DEFAULT_TECHNICAL_STRENGTHS;

    return {
      editorialHeading: source.editorialHeading,
      introduction: source.introduction,
      highlights: enabledHighlights,
      domains: enabledDomains,
      pillars: enabledPillars,
      technicalStrengths: rawStrengths
    };
  },

  async updateAbout(data) {
    if (!data.editorialHeading || data.editorialHeading.trim() === '') {
      throw new Error('About Editorial Heading is required');
    }
    return await aboutRepository.upsertAbout(data);
  }
};
