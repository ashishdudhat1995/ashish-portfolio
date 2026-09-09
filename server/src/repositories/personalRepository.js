import { PrismaClient } from '@prisma/client';
import { initialPortfolio } from '../data/initialPortfolio.js';

const prisma = new PrismaClient();

export const personalRepository = {
  async getPrimaryProfile() {
    try {
      const record = await prisma.personalInformation.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      return record;
    } catch {
      return null;
    }
  },

  async upsertPrimaryProfile(data) {
    try {
      const existing = await this.getPrimaryProfile();

      const updatedFullName = data.fullName ?? existing?.fullName ?? initialPortfolio.personal.name;
      const updatedTitle = data.professionalTitle ?? existing?.professionalTitle ?? initialPortfolio.personal.primaryRole;
      const updatedEmail = data.email ?? existing?.email ?? initialPortfolio.personal.email;
      const updatedPhone = data.phone ?? existing?.phone ?? initialPortfolio.personal.phone;
      const updatedLocation = data.location ?? existing?.location ?? initialPortfolio.personal.location;
      const updatedAvailability = data.availability ?? existing?.availability ?? initialPortfolio.personal.availabilityStatus;
      const updatedBio = data.bio !== undefined ? data.bio : existing?.bio ?? initialPortfolio.personal.bio;
      const updatedProfileImageId = data.profileImageId !== undefined ? data.profileImageId : existing?.profileImageId ?? initialPortfolio.personal.photoUrl;
      const updatedEnabled = data.enabled !== undefined ? data.enabled : (existing?.enabled ?? true);
      const newStatus = data.status || 'PUBLISHED';

      const updatedSnapshot = {
        fullName: updatedFullName,
        professionalTitle: updatedTitle,
        email: updatedEmail,
        phone: updatedPhone,
        location: updatedLocation,
        availability: updatedAvailability,
        bio: updatedBio,
        profileImageId: updatedProfileImageId,
        enabled: updatedEnabled,
        status: newStatus
      };

      if (existing) {
        return await prisma.personalInformation.update({
          where: { id: existing.id },
          data: {
            fullName: updatedFullName,
            professionalTitle: updatedTitle,
            email: updatedEmail,
            phone: updatedPhone,
            location: updatedLocation,
            availability: updatedAvailability,
            bio: updatedBio,
            profileImageId: updatedProfileImageId,
            enabled: updatedEnabled,
            status: newStatus,
            publishedAt: new Date(),
            publishedData: updatedSnapshot,
            version: { increment: 1 }
          }
        });
      }

      return await prisma.personalInformation.create({
        data: {
          fullName: updatedFullName,
          professionalTitle: updatedTitle,
          email: updatedEmail,
          phone: updatedPhone,
          location: updatedLocation,
          availability: updatedAvailability,
          bio: updatedBio,
          profileImageId: updatedProfileImageId,
          enabled: updatedEnabled,
          status: newStatus,
          publishedAt: new Date(),
          publishedData: updatedSnapshot
        }
      });
    } catch (err) {
      throw err;
    }
  }
};
