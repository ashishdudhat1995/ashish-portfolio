import { mediaRepository } from '../repositories/mediaRepository.js';

export const publishingValidationService = {
  /**
   * Validate Personal Information
   */
  async validatePersonal(personal) {
    const errors = [];
    if (!personal) {
      errors.push({ entity: 'Personal', field: 'root', message: 'Personal Information profile is missing.' });
      return errors;
    }

    if (!personal.fullName?.trim()) {
      errors.push({ entity: 'Personal', field: 'fullName', message: 'Full name is required.' });
    }
    if (!personal.professionalTitle?.trim()) {
      errors.push({ entity: 'Personal', field: 'professionalTitle', message: 'Professional title is required.' });
    }

    if (personal.profileImageId) {
      const media = await mediaRepository.getMediaById(personal.profileImageId).catch(() => null);
      if (media && (media.visibility !== 'PUBLIC' || media.status !== 'ACTIVE')) {
        errors.push({
          entity: 'Personal',
          field: 'profileImageId',
          message: `Profile image references media '${media.filename}' which is ${media.visibility !== 'PUBLIC' ? 'PRIVATE' : 'ARCHIVED'}. Set media to PUBLIC and ACTIVE before publishing.`
        });
      }
    }

    return errors;
  },

  /**
   * Validate Hero Section
   */
  async validateHero(hero) {
    const errors = [];
    if (!hero) return errors;

    if (!hero.headline?.trim()) {
      errors.push({ entity: 'Hero', field: 'headline', message: 'Hero headline is required.' });
    }
    return errors;
  },

  /**
   * Validate About Section
   */
  async validateAbout(about) {
    const errors = [];
    if (!about) return errors;

    if (!about.editorialHeading?.trim()) {
      errors.push({ entity: 'About', field: 'editorialHeading', message: 'About section heading is required.' });
    }
    return errors;
  },

  /**
   * Validate Project
   */
  async validateProject(project) {
    const errors = [];
    if (!project) return errors;

    if (!project.name?.trim()) {
      errors.push({ entity: 'Project', field: 'name', message: 'Project name is required.' });
    }
    if (!project.description?.trim()) {
      errors.push({ entity: 'Project', field: 'description', message: `Project '${project.name || 'Untitled'}' description is required.` });
    }

    // Check media references in project images
    if (project.images && Array.isArray(project.images)) {
      for (const imgRef of project.images) {
        if (typeof imgRef === 'string' && imgRef.length > 20) {
          const media = await mediaRepository.getMediaById(imgRef).catch(() => null);
          if (media && (media.visibility !== 'PUBLIC' || media.status !== 'ACTIVE')) {
            errors.push({
              entity: 'Project',
              field: 'images',
              message: `Project '${project.name}' references media '${media.filename}' which is ${media.visibility !== 'PUBLIC' ? 'PRIVATE' : 'ARCHIVED'}.`
            });
          }
        }
      }
    }

    return errors;
  },

  /**
   * Validate Experience
   */
  async validateExperience(exp) {
    const errors = [];
    if (!exp) return errors;

    if (!exp.company?.trim()) {
      errors.push({ entity: 'Experience', field: 'company', message: 'Company name is required.' });
    }
    if (!exp.role?.trim()) {
      errors.push({ entity: 'Experience', field: 'role', message: `Role is required for ${exp.company || 'experience'}.` });
    }
    return errors;
  },

  /**
   * Validate Skill Category
   */
  async validateSkillCategory(category) {
    const errors = [];
    if (!category) return errors;

    if (!category.name?.trim()) {
      errors.push({ entity: 'Skills', field: 'name', message: 'Skill category name is required.' });
    }
    return errors;
  },

  /**
   * Validate SEO Settings
   */
  async validateSeo(seo) {
    const errors = [];
    if (!seo) return errors;

    if (!seo.title?.trim()) {
      errors.push({ entity: 'SEO', field: 'title', message: 'SEO meta title is required.' });
    }
    if (!seo.description?.trim()) {
      errors.push({ entity: 'SEO', field: 'description', message: 'SEO meta description is required.' });
    }

    if (seo.structuredDataEnabled && seo.structuredDataJson) {
      try {
        JSON.parse(seo.structuredDataJson);
      } catch (e) {
        errors.push({ entity: 'SEO', field: 'structuredDataJson', message: `Invalid Schema.org JSON-LD syntax: ${e.message}` });
      }
    }

    // Check media references
    const mediaCheck = async (mediaId, fieldName) => {
      if (mediaId) {
        const m = await mediaRepository.getMediaById(mediaId).catch(() => null);
        if (m && (m.visibility !== 'PUBLIC' || m.status !== 'ACTIVE')) {
          errors.push({
            entity: 'SEO',
            field: fieldName,
            message: `SEO ${fieldName} references media '${m.filename}' which is ${m.visibility !== 'PUBLIC' ? 'PRIVATE' : 'ARCHIVED'}.`
          });
        }
      }
    };

    await mediaCheck(seo.ogImageId, 'ogImageId');
    await mediaCheck(seo.twitterImageId, 'twitterImageId');
    await mediaCheck(seo.faviconMediaId, 'faviconMediaId');

    return errors;
  },

  /**
   * Validate Navigation Items
   */
  async validateNavigation(navItems = []) {
    const errors = [];
    for (const nav of navItems) {
      if (!nav.label?.trim()) {
        errors.push({ entity: 'Navigation', field: 'label', message: 'Navigation label is required.' });
      }
      if (!nav.target?.trim()) {
        errors.push({ entity: 'Navigation', field: 'target', message: `Navigation target anchor for '${nav.label}' is required.` });
      }
    }
    return errors;
  }
};
