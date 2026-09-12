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
    try {
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
    } catch {
      return {
        name: 'ASHISHKUMAR DUDHAT',
        fullName: 'ASHISHKUMAR DUDHAT',
        professionalTitle: 'Senior Software Engineer | Lead Engineer | Full Stack Developer',
        primaryRole: 'Senior Software Engineer | Lead Engineer | Full Stack Developer',
        email: 'dudhatashish1995@gmail.com',
        phone: '+91 7600908370',
        location: 'Ahmedabad, Gujarat',
        availability: 'Available to rejoin immediately',
        availabilityStatus: 'Available to rejoin immediately',
        bio: 'Senior Software Engineer with 8+ years experience in full stack MERN/MEAN architectures.',
        profileImageId: '',
        photoUrl: ''
      };
    }
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
