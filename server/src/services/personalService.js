import { personalRepository } from '../repositories/personalRepository.js';

export const personalService = {
  async getAdminProfile() {
    let profile = await personalRepository.getPrimaryProfile();
    if (!profile) {
      profile = await personalRepository.upsertPrimaryProfile({});
    }
    return profile;
  },

  async getPublicProfile() {
    const profile = await this.getAdminProfile();
    if (!profile || !profile.enabled) return null;

    // Strict Publishing Rule: If draft, return publishedData snapshot if available
    let source = profile;
    if (profile.status === 'DRAFT' && profile.publishedData) {
      source = typeof profile.publishedData === 'string' ? JSON.parse(profile.publishedData) : profile.publishedData;
    }

    if (source.status === 'ARCHIVED' || source.enabled === false) {
      return null;
    }

    const activeAvail = source.availability || 'Available to Join Immediately';

    // Return normalized schema matching both database and frontend models
    return {
      name: source.fullName,
      fullName: source.fullName,
      professionalTitle: source.professionalTitle,
      primaryRole: source.professionalTitle,
      email: source.email,
      phone: source.phone,
      location: source.location,
      availability: activeAvail,
      availabilityStatus: activeAvail,
      bio: source.bio,
      profileImageId: source.profileImageId,
      photoUrl: source.profileImageId
    };
  },

  async updateProfile(data) {
    if (!data.fullName || data.fullName.trim() === '') {
      throw new Error('Full Name is required');
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('A valid Email address is required');
    }
    if (!data.professionalTitle || data.professionalTitle.trim() === '') {
      throw new Error('Professional Title is required');
    }

    return await personalRepository.upsertPrimaryProfile(data);
  }
};
