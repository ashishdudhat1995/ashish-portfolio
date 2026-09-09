import { publishingValidationService } from '../services/publishingValidationService.js';
import { publishingRepository } from '../repositories/publishingRepository.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Global Portfolio Settings & Draft / Published Workflow Tests', () => {

  beforeAll(async () => {
    // Ensure PortfolioSettings singleton exists
    await publishingRepository.getPortfolioSettings();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('PublishingValidationService Unit Tests', () => {
    test('validatePersonal should catch missing fullName', async () => {
      const errors = await publishingValidationService.validatePersonal({
        fullName: '',
        professionalTitle: 'Lead Engineer'
      });
      expect(errors.some(e => e.field === 'fullName')).toBe(true);
    });

    test('validateProject should catch missing description', async () => {
      const errors = await publishingValidationService.validateProject({
        name: 'Test Project',
        description: ''
      });
      expect(errors.some(e => e.field === 'description')).toBe(true);
    });

    test('validateSeo should catch invalid JSON-LD syntax', async () => {
      const errors = await publishingValidationService.validateSeo({
        title: 'Valid Title',
        description: 'Valid Meta Description',
        structuredDataEnabled: true,
        structuredDataJson: '{ invalid json syntax }'
      });
      expect(errors.some(e => e.field === 'structuredDataJson')).toBe(true);
    });
  });

  describe('PublishingRepository Integration Tests', () => {
    test('getPendingDraftsSummary should return valid summary object', async () => {
      const summary = await publishingRepository.getPendingDraftsSummary();
      expect(summary).toHaveProperty('isFullyPublished');
      expect(summary).toHaveProperty('totalDrafts');
      expect(summary).toHaveProperty('draftEntities');
      expect(Array.isArray(summary.draftEntities)).toBe(true);
    });

    test('publishEntity should set status to PUBLISHED for singletons', async () => {
      const res = await publishingRepository.publishEntity('personal');
      expect(res.success).toBe(true);
      expect(res.data.status).toBe('PUBLISHED');
    });

    test('publishAllChanges should execute transactionally', async () => {
      const res = await publishingRepository.publishAllChanges({ adminUser: { email: 'admin@portfolio.com' } });
      expect(res.success).toBe(true);
      
      const summary = await publishingRepository.getPendingDraftsSummary();
      expect(summary.totalDrafts).toBe(0);
      expect(summary.isFullyPublished).toBe(true);
    });
  });

});
