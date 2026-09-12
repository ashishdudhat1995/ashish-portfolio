import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff,
  Clock
} from 'lucide-react';
import { portfolioService } from '../../services/portfolioService';
import { 
  fetchAdminMe, 
  adminLogout, 
  adminLogin,
  requestAdminForgotPassword,
  verifyAdminResetCode,
  resetAdminPassword,
  fetchAdminPersonal,
  updateAdminPersonal,
  fetchAdminHero,
  updateAdminHero,
  fetchAdminAbout,
  updateAdminAbout,
  addAdminAboutHighlight,
  updateAdminAboutHighlight,
  deleteAdminAboutHighlight,
  toggleAdminAboutHighlightStatus,
  reorderAdminAboutHighlights,
  fetchAdminExperiences,
  createAdminExperience,
  updateAdminExperience,
  deleteAdminExperience,
  toggleAdminExperienceStatus,
  reorderAdminExperiences,
  fetchAdminSkillsCategories,
  createAdminSkillCategory,
  updateAdminSkillCategory,
  deleteAdminSkillCategory,
  toggleAdminSkillCategoryStatus,
  reorderAdminSkillCategories,
  createAdminSkill,
  updateAdminSkill,
  deleteAdminSkill,
  toggleAdminSkillStatus,
  reorderAdminSkills,
  fetchAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
  toggleAdminProjectStatus,
  toggleAdminProjectFeatured,
  reorderAdminProjects,
  fetchAdminEducation,
  createAdminEducation,
  updateAdminEducation,
  deleteAdminEducation,
  toggleAdminEducationStatus,
  reorderAdminEducation,
  fetchAdminCertifications,
  createAdminCertification,
  updateAdminCertification,
  deleteAdminCertification,
  toggleAdminCertificationStatus,
  reorderAdminCertifications,
  fetchAdminAchievements,
  createAdminAchievement,
  updateAdminAchievement,
  deleteAdminAchievement,
  toggleAdminAchievementStatus,
  reorderAdminAchievements,
  fetchAdminSocialLinks,
  createAdminSocialLink,
  updateAdminSocialLink,
  deleteAdminSocialLink,
  toggleAdminSocialLinkStatus,
  reorderAdminSocialLinks,
  fetchAdminContact,
  updateAdminContact,
  fetchAdminNavigation,
  createAdminNavigationItem,
  updateAdminNavigationItem,
  deleteAdminNavigationItem,
  toggleAdminNavigationStatus,
  reorderAdminNavigation,
  fetchAdminSeo,
  updateAdminSeo,
  fetchAdminSiteSettings,
  updateAdminSiteSettings,
  fetchAdminMediaList,
  fetchAdminResumes
} from '../../services/apiClient';
import type { 
  PortfolioData, 
  SeoSettings,
  SiteSettings
} from '../../types/portfolio';
import { AdminLayout } from './layout/AdminLayout';
import { DashboardView } from './dashboard/DashboardView';
import { PersonalModule } from './modules/PersonalModule';
import { ResumeModule } from './modules/ResumeModule';
import { HeroModule } from './modules/HeroModule';
import { AboutModule } from './modules/AboutModule';
import type { AboutHighlightData } from './modules/AboutModule';
import { ExperienceListModule } from './modules/ExperienceListModule';
import type { ExperienceAdminItem } from './modules/ExperienceListModule';
import { ExperienceFormModule } from './modules/ExperienceFormModule';
import { SkillsModule } from './modules/SkillsModule';
import type { AdminSkillCategory } from './modules/SkillsModule';
import { ProjectsListModule } from './modules/ProjectsListModule';
import type { AdminProject } from './modules/ProjectsListModule';
import { ProjectsFormModule } from './modules/ProjectsFormModule';
import { EducationModule } from './modules/EducationModule';
import type { AdminEducationItem } from './modules/EducationModule';
import { CertificationsModule } from './modules/CertificationsModule';
import type { AdminCertification } from './modules/CertificationsModule';
import { AchievementsModule } from './modules/AchievementsModule';
import type { AdminAchievement } from './modules/AchievementsModule';
import { SocialLinksModule } from './modules/SocialLinksModule';
import type { AdminSocialLink } from './modules/SocialLinksModule';
import { ContactModule } from './modules/ContactModule';
import type { AdminContactData } from './modules/ContactModule';
import { LeadsModule } from './modules/LeadsModule';
import { fetchAdminUnreadLeadsCount } from '../../services/apiClient';
import { NavigationModule } from './modules/NavigationModule';
import type { AdminNavigationItem } from './modules/NavigationModule';
import { SeoModule } from './modules/SeoModule';
import { SiteSettingsModule } from './modules/SiteSettingsModule';
import { MediaModule } from './modules/MediaModule';
import { PublishingModule } from './modules/PublishingModule';
import { AdminPreviewModal } from './AdminPreviewModal';
import { FormField } from './ui/FormField';
import { LoadingState } from './ui/StateFeedback';
import { getNavItemByPath } from '../../config/adminNavigation';

interface AdminPageProps {
  onClose: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onClose }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [currentPath, setCurrentPath] = useState<string>('/admin/dashboard');
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Experience Sub-View ('list' | 'new' | 'edit')
  const [experienceSubView, setExperienceSubView] = useState<'list' | 'new' | 'edit'>('list');
  const [editingExperience, setEditingExperience] = useState<ExperienceAdminItem | null>(null);
  const [adminExperiences, setAdminExperiences] = useState<ExperienceAdminItem[]>([]);

  // Skills Categories State
  const [adminSkillCategories, setAdminSkillCategories] = useState<AdminSkillCategory[]>([]);
  const [totalSkillCategories, setTotalSkillCategories] = useState(0);
  const [totalEnabledSkills, setTotalEnabledSkills] = useState(0);

  // Projects State & Sub-View ('list' | 'new' | 'edit')
  const [projectSubView, setProjectSubView] = useState<'list' | 'new' | 'edit'>('list');
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [adminProjects, setAdminProjects] = useState<AdminProject[]>([]);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [enabledProjectsCount, setEnabledProjectsCount] = useState(0);
  const [featuredProjectsCount, setFeaturedProjectsCount] = useState(0);

  // Education State
  const [adminEducation, setAdminEducation] = useState<AdminEducationItem[]>([]);
  const [totalEducationCount, setTotalEducationCount] = useState(0);
  const [enabledEducationCount, setEnabledEducationCount] = useState(0);

  // Certifications State
  const [adminCertifications, setAdminCertifications] = useState<AdminCertification[]>([]);
  const [totalCertificationsCount, setTotalCertificationsCount] = useState(0);
  const [enabledCertificationsCount, setEnabledCertificationsCount] = useState(0);

  // Achievements State
  const [adminAchievements, setAdminAchievements] = useState<AdminAchievement[]>([]);
  const [totalAchievementsCount, setTotalAchievementsCount] = useState(0);
  const [enabledAchievementsCount, setEnabledAchievementsCount] = useState(0);

  // Social Links State
  const [adminSocialLinks, setAdminSocialLinks] = useState<AdminSocialLink[]>([]);
  const [totalSocialLinksCount, setTotalSocialLinksCount] = useState(0);
  const [enabledSocialLinksCount, setEnabledSocialLinksCount] = useState(0);

  // Contact Settings State
  const [adminContactData, setAdminContactData] = useState<AdminContactData | null>(null);

  // Navigation Items State
  const [adminNavigationItems, setAdminNavigationItems] = useState<AdminNavigationItem[]>([]);
  const [totalNavigationCount, setTotalNavigationCount] = useState(0);
  const [enabledNavigationCount, setEnabledNavigationCount] = useState(0);

  // SEO & Site Settings State
  const [adminSeoData, setAdminSeoData] = useState<SeoSettings | null>(null);
  const [adminSiteSettingsData, setAdminSiteSettingsData] = useState<SiteSettings | null>(null);

  // Dynamic Media & Resume Counts
  const [adminMediaCount, setAdminMediaCount] = useState<number>(0);
  const [adminResumesCount, setAdminResumesCount] = useState<number>(0);
  const [unreadLeadsCount, setUnreadLeadsCount] = useState<number>(0);
  const [contactActiveSubTab, setContactActiveSubTab] = useState<'leads' | 'settings'>('leads');

  useEffect(() => {
    fetchAdminUnreadLeadsCount().then(count => setUnreadLeadsCount(count)).catch(() => {});
  }, []);

  // Login & Password Reset Form State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  // Forgot Password 3-Step Workflow
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetToken, setResetToken] = useState<string>('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Portfolio State
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [personalState, setPersonalState] = useState<unknown>(null);
  const [heroState, setHeroState] = useState<unknown>(null);
  const [aboutState, setAboutState] = useState<unknown>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadAdminProfileAndData = async () => {
    setIsLoading(true);
    try {
      const user = await fetchAdminMe();
      if (!user) {
        setToken(null);
        localStorage.removeItem('adminToken');
        setIsLoading(false);
        return;
      }

      setAdminUser(user);

      const [
        data, 
        personal, 
        hero, 
        about, 
        experiences, 
        skillsRes, 
        projectsRes,
        educationRes,
        certificationsRes,
        achievementsRes,
        socialLinksRes,
        contactRes,
        navigationRes,
        seoRes,
        siteSettingsRes,
        mediaRes,
        resumesRes
      ] = await Promise.all([
        portfolioService.getFullPortfolio(),
        fetchAdminPersonal().catch(() => null),
        fetchAdminHero().catch(() => null),
        fetchAdminAbout().catch(() => null),
        fetchAdminExperiences().catch(() => []),
        fetchAdminSkillsCategories().catch(() => null),
        fetchAdminProjects().catch(() => null),
        fetchAdminEducation().catch(() => null),
        fetchAdminCertifications().catch(() => null),
        fetchAdminAchievements().catch(() => null),
        fetchAdminSocialLinks().catch(() => null),
        fetchAdminContact().catch(() => null),
        fetchAdminNavigation().catch(() => null),
        fetchAdminSeo().catch(() => null),
        fetchAdminSiteSettings().catch(() => null),
        fetchAdminMediaList({ limit: 1 }).catch(() => null),
        fetchAdminResumes().catch(() => null)
      ]);

      setPortfolio(data);
      if (personal) setPersonalState(personal);
      if (hero) setHeroState(hero);
      if (about) setAboutState(about);
      if (experiences) setAdminExperiences(experiences);

      if (skillsRes && skillsRes.data) {
        setAdminSkillCategories(skillsRes.data);
        setTotalSkillCategories(skillsRes.summary?.totalCategories || skillsRes.data.length);
        setTotalEnabledSkills(skillsRes.summary?.totalEnabledSkills || 0);
      }

      if (projectsRes && projectsRes.data) {
        setAdminProjects(projectsRes.data);
        setTotalProjectsCount(projectsRes.summary?.totalProjects || projectsRes.data.length);
        setEnabledProjectsCount(projectsRes.summary?.enabledProjects || 0);
        setFeaturedProjectsCount(projectsRes.summary?.featuredProjects || 0);
      }

      if (educationRes && educationRes.data) {
        setAdminEducation(educationRes.data);
        setTotalEducationCount(educationRes.summary?.totalEducation || educationRes.data.length);
        setEnabledEducationCount(educationRes.summary?.enabledEducation || 0);
      }

      if (certificationsRes && certificationsRes.data) {
        setAdminCertifications(certificationsRes.data);
        setTotalCertificationsCount(certificationsRes.summary?.totalCertifications || certificationsRes.data.length);
        setEnabledCertificationsCount(certificationsRes.summary?.enabledCertifications || 0);
      }

      if (achievementsRes && achievementsRes.data) {
        setAdminAchievements(achievementsRes.data);
        setTotalAchievementsCount(achievementsRes.summary?.totalAchievements || achievementsRes.data.length);
        setEnabledAchievementsCount(achievementsRes.summary?.enabledAchievements || 0);
      }

      if (socialLinksRes && socialLinksRes.data) {
        setAdminSocialLinks(socialLinksRes.data);
        setTotalSocialLinksCount(socialLinksRes.summary?.totalLinks || socialLinksRes.data.length);
        setEnabledSocialLinksCount(socialLinksRes.summary?.enabledLinks || 0);
      }

      if (contactRes) {
        setAdminContactData(contactRes);
      }

      if (navigationRes && navigationRes.items) {
        setAdminNavigationItems(navigationRes.items);
        setTotalNavigationCount(navigationRes.summary?.totalItems || navigationRes.items.length);
        setEnabledNavigationCount(navigationRes.summary?.enabledItems || 0);
      }

      if (seoRes) {
        setAdminSeoData(seoRes);
      }

      if (siteSettingsRes) {
        setAdminSiteSettingsData(siteSettingsRes);
      }

      if (mediaRes && mediaRes.pagination) {
        setAdminMediaCount(mediaRes.pagination.totalItems);
      } else if (mediaRes && Array.isArray(mediaRes.data)) {
        setAdminMediaCount(mediaRes.data.length);
      }

      if (resumesRes) {
        if (typeof resumesRes.summary?.totalResumes === 'number') {
          setAdminResumesCount(resumesRes.summary.totalResumes);
        } else if (Array.isArray(resumesRes.data)) {
          setAdminResumesCount(resumesRes.data.length);
        } else if (Array.isArray(resumesRes)) {
          setAdminResumesCount(resumesRes.length);
        }
      }
    } catch {
      // Fallback cleanly
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAdminProfileAndData();
    }
  }, [token]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await adminLogin(emailInput, passwordInput);
      const sessionToken = res.token || 'admin-session-' + Date.now();
      setToken(sessionToken);
      localStorage.setItem('adminToken', sessionToken);
      if (res.data?.user) setAdminUser(res.data.user);
      setCurrentPath('/admin/dashboard');
      setIsLoggingIn(false);
      await loadAdminProfileAndData();
    } catch (err) {
      setIsLoggingIn(false);
      setLoginError(err instanceof Error ? err.message : 'Invalid email or password');
    }
  };

  const handleRequestForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetError(null);
    setResetStatus(null);

    try {
      const res = await requestAdminForgotPassword(resetEmail);
      setIsResetting(false);
      setResetStatus(res.message || 'Verification code sent to your email.');
      setResetStep(2);
    } catch (err) {
      setIsResetting(false);
      setResetError(err instanceof Error ? err.message : 'Failed to request password reset code.');
    }
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetError(null);
    setResetStatus(null);

    if (!resetCodeInput || resetCodeInput.trim().length !== 6) {
      setIsResetting(false);
      setResetError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    try {
      const res = await verifyAdminResetCode({
        email: resetEmail,
        code: resetCodeInput.trim()
      });

      setIsResetting(false);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
      setResetStatus(res.message || 'Verification code confirmed! Set your new password below.');
      setResetStep(3);
    } catch (err) {
      setIsResetting(false);
      setResetError(err instanceof Error ? err.message : 'Invalid 6-digit verification code. Please try again.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetError(null);
    setResetStatus(null);

    if (!newPasswordInput || newPasswordInput.length < 6) {
      setIsResetting(false);
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setIsResetting(false);
      setResetError('New password and confirmation do not match.');
      return;
    }

    try {
      const res = await resetAdminPassword({
        email: resetEmail,
        resetToken: resetToken || undefined,
        code: resetCodeInput || undefined,
        newPassword: newPasswordInput,
        confirmPassword: confirmPasswordInput
      });

      setIsResetting(false);
      setResetStatus(res.message || 'Password reset successfully! Log in with your new password.');
      setPasswordInput(newPasswordInput);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetStep(1);
        setResetStatus(null);
        setResetError(null);
        setResetCodeInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      }, 2500);
    } catch (err) {
      setIsResetting(false);
      setResetError(err instanceof Error ? err.message : 'Failed to reset password.');
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setToken(null);
    localStorage.removeItem('adminToken');
    setAdminUser(null);
  };

  const showSaveSuccess = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Personal Info Save Handler
  const handleSavePersonal = async (data: unknown) => {
    setIsSaving(true);
    try {
      const updated = await updateAdminPersonal(data);
      setPersonalState(updated);
      showSaveSuccess('Personal information saved successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Hero Section Save Handler
  const handleSaveHero = async (data: unknown) => {
    setIsSaving(true);
    try {
      const updated = await updateAdminHero(data);
      setHeroState(updated);
      showSaveSuccess('Hero section saved successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // About Section Save Handlers
  const handleSaveAboutNarrative = async (data: unknown) => {
    setIsSaving(true);
    try {
      const updated = await updateAdminAbout(data);
      setAboutState(updated);
      showSaveSuccess('About narrative saved successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAboutHighlight = async (highlight: Omit<AboutHighlightData, 'id'>) => {
    setIsSaving(true);
    try {
      await addAdminAboutHighlight(highlight);
      const updatedAbout = await fetchAdminAbout();
      setAboutState(updatedAbout);
      showSaveSuccess('About highlight added successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAboutHighlight = async (id: string, highlight: Partial<AboutHighlightData>) => {
    setIsSaving(true);
    try {
      await updateAdminAboutHighlight(id, highlight);
      const updatedAbout = await fetchAdminAbout();
      setAboutState(updatedAbout);
      showSaveSuccess('About highlight updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAboutHighlight = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteAdminAboutHighlight(id);
      const updatedAbout = await fetchAdminAbout();
      setAboutState(updatedAbout);
      showSaveSuccess('About highlight deleted successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAboutHighlightStatus = async (id: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminAboutHighlightStatus(id, enabled);
      const updatedAbout = await fetchAdminAbout();
      setAboutState(updatedAbout);
      showSaveSuccess('Highlight status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderAboutHighlights = async (orderedIds: string[]) => {
    setIsSaving(true);
    try {
      await reorderAdminAboutHighlights(orderedIds);
      const updatedAbout = await fetchAdminAbout();
      setAboutState(updatedAbout);
      showSaveSuccess('Highlights reordered successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Experience CMS Handlers
  const handleCreateExperience = async (payload: Partial<ExperienceAdminItem>) => {
    setIsSaving(true);
    try {
      await createAdminExperience(payload);
      const updatedList = await fetchAdminExperiences();
      setAdminExperiences(updatedList);
      setExperienceSubView('list');
      setEditingExperience(null);
      showSaveSuccess('Experience record created successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateExperience = async (payload: Partial<ExperienceAdminItem>) => {
    if (!payload.id) return;
    setIsSaving(true);
    try {
      await updateAdminExperience(payload.id, payload);
      const updatedList = await fetchAdminExperiences();
      setAdminExperiences(updatedList);
      setExperienceSubView('list');
      setEditingExperience(null);
      showSaveSuccess('Experience record updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteAdminExperience(id);
      const updatedList = await fetchAdminExperiences();
      setAdminExperiences(updatedList);
      showSaveSuccess('Experience record deleted successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleExperienceStatus = async (id: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminExperienceStatus(id, enabled);
      const updatedList = await fetchAdminExperiences();
      setAdminExperiences(updatedList);
      showSaveSuccess('Experience status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderExperiences = async (orderedIds: string[]) => {
    setIsSaving(true);
    try {
      await reorderAdminExperiences(orderedIds);
      const updatedList = await fetchAdminExperiences();
      setAdminExperiences(updatedList);
      showSaveSuccess('Experiences reordered successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Skills CMS Handlers
  const refreshSkillsCategories = async () => {
    const res = await fetchAdminSkillsCategories();
    if (res && res.data) {
      setAdminSkillCategories(res.data);
      setTotalSkillCategories(res.summary?.totalCategories || res.data.length);
      setTotalEnabledSkills(res.summary?.totalEnabledSkills || 0);
    }
  };

  const handleCreateSkillCategory = async (data: { name: string; description?: string }) => {
    setIsSaving(true);
    try {
      await createAdminSkillCategory(data);
      await refreshSkillsCategories();
      showSaveSuccess('Skill category created successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSkillCategory = async (id: string, data: { name: string; description?: string }) => {
    setIsSaving(true);
    try {
      await updateAdminSkillCategory(id, data);
      await refreshSkillsCategories();
      showSaveSuccess('Skill category updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkillCategory = async (id: string, force = false) => {
    setIsSaving(true);
    try {
      await deleteAdminSkillCategory(id, force);
      await refreshSkillsCategories();
      showSaveSuccess('Skill category deleted successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSkillCategoryStatus = async (id: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminSkillCategoryStatus(id, enabled);
      await refreshSkillsCategories();
      showSaveSuccess('Category status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderSkillCategories = async (orderedIds: string[]) => {
    setIsSaving(true);
    try {
      await reorderAdminSkillCategories(orderedIds);
      await refreshSkillsCategories();
      showSaveSuccess('Categories reordered successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSkill = async (data: { categoryId: string; name: string; description?: string }) => {
    setIsSaving(true);
    try {
      await createAdminSkill(data);
      await refreshSkillsCategories();
      showSaveSuccess('Skill created successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSkill = async (id: string, data: { categoryId: string; name: string; description?: string }) => {
    setIsSaving(true);
    try {
      await updateAdminSkill(id, data);
      await refreshSkillsCategories();
      showSaveSuccess('Skill updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteAdminSkill(id);
      await refreshSkillsCategories();
      showSaveSuccess('Skill deleted successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSkillStatus = async (id: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminSkillStatus(id, enabled);
      await refreshSkillsCategories();
      showSaveSuccess('Skill status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderSkills = async (categoryId: string, orderedIds: string[]) => {
    setIsSaving(true);
    try {
      await reorderAdminSkills(categoryId, orderedIds);
      await refreshSkillsCategories();
      showSaveSuccess('Skills reordered successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Projects CMS Handlers
  const refreshProjectsList = async () => {
    const res = await fetchAdminProjects();
    if (res && res.data) {
      setAdminProjects(res.data);
      setTotalProjectsCount(res.summary?.totalProjects || res.data.length);
      setEnabledProjectsCount(res.summary?.enabledProjects || 0);
      setFeaturedProjectsCount(res.summary?.featuredProjects || 0);
    }
  };

  const handleCreateProject = async (payload: Partial<AdminProject>) => {
    setIsSaving(true);
    try {
      await createAdminProject(payload);
      await refreshProjectsList();
      setProjectSubView('list');
      setEditingProject(null);
      showSaveSuccess('Project created successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProject = async (payload: Partial<AdminProject>) => {
    if (!payload.id) return;
    setIsSaving(true);
    try {
      await updateAdminProject(payload.id, payload);
      await refreshProjectsList();
      setProjectSubView('list');
      setEditingProject(null);
      showSaveSuccess('Project updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteAdminProject(id);
      await refreshProjectsList();
      showSaveSuccess('Project deleted successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleProjectStatus = async (id: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminProjectStatus(id, enabled);
      await refreshProjectsList();
      showSaveSuccess('Project status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleProjectFeatured = async (id: string, featured: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminProjectFeatured(id, featured);
      await refreshProjectsList();
      showSaveSuccess('Project featured status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderProjects = async (orderedIds: string[]) => {
    setIsSaving(true);
    try {
      await reorderAdminProjects(orderedIds);
      await refreshProjectsList();
      showSaveSuccess('Projects reordered successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Education CMS Handlers
  const refreshEducationList = async () => {
    const res = await fetchAdminEducation();
    if (res && res.data) {
      setAdminEducation(res.data);
      setTotalEducationCount(res.summary?.totalEducation || res.data.length);
      setEnabledEducationCount(res.summary?.enabledEducation || 0);
    }
  };

  const handleCreateEducation = async (payload: Partial<AdminEducationItem>) => {
    setIsSaving(true);
    try {
      await createAdminEducation(payload);
      await refreshEducationList();
      showSaveSuccess('Education record created successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEducation = async (id: string, payload: Partial<AdminEducationItem>) => {
    setIsSaving(true);
    try {
      await updateAdminEducation(id, payload);
      await refreshEducationList();
      showSaveSuccess('Education record updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteAdminEducation(id);
      await refreshEducationList();
      showSaveSuccess('Education record deleted successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEducationStatus = async (id: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminEducationStatus(id, enabled);
      await refreshEducationList();
      showSaveSuccess('Education status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderEducation = async (orderedIds: string[]) => {
    setIsSaving(true);
    try {
      await reorderAdminEducation(orderedIds);
      await refreshEducationList();
      showSaveSuccess('Education records reordered successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Certifications CMS Handlers
  const refreshCertificationsList = async () => {
    const res = await fetchAdminCertifications();
    if (res && res.data) {
      setAdminCertifications(res.data);
      setTotalCertificationsCount(res.summary?.totalCertifications || res.data.length);
      setEnabledCertificationsCount(res.summary?.enabledCertifications || 0);
    }
  };

  const handleCreateCertification = async (payload: Partial<AdminCertification>) => {
    setIsSaving(true);
    try {
      await createAdminCertification(payload);
      await refreshCertificationsList();
      showSaveSuccess('Certification record created successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCertification = async (id: string, payload: Partial<AdminCertification>) => {
    setIsSaving(true);
    try {
      await updateAdminCertification(id, payload);
      await refreshCertificationsList();
      showSaveSuccess('Certification record updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCertification = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteAdminCertification(id);
      await refreshCertificationsList();
      showSaveSuccess('Certification record deleted successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCertificationStatus = async (id: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminCertificationStatus(id, enabled);
      await refreshCertificationsList();
      showSaveSuccess('Certification status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderCertifications = async (orderedIds: string[]) => {
    setIsSaving(true);
    try {
      await reorderAdminCertifications(orderedIds);
      await refreshCertificationsList();
      showSaveSuccess('Certifications reordered successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Achievements CMS Handlers
  const refreshAchievementsList = async () => {
    const res = await fetchAdminAchievements();
    if (res && res.data) {
      setAdminAchievements(res.data);
      setTotalAchievementsCount(res.summary?.totalAchievements || res.data.length);
      setEnabledAchievementsCount(res.summary?.enabledAchievements || 0);
    }
  };

  const handleCreateAchievement = async (payload: Partial<AdminAchievement>) => {
    setIsSaving(true);
    try {
      await createAdminAchievement(payload);
      await refreshAchievementsList();
      showSaveSuccess('Achievement record created successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAchievement = async (id: string, payload: Partial<AdminAchievement>) => {
    setIsSaving(true);
    try {
      await updateAdminAchievement(id, payload);
      await refreshAchievementsList();
      showSaveSuccess('Achievement record updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteAdminAchievement(id);
      await refreshAchievementsList();
      showSaveSuccess('Achievement record deleted successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAchievementStatus = async (id: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminAchievementStatus(id, enabled);
      await refreshAchievementsList();
      showSaveSuccess('Achievement status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderAchievements = async (orderedIds: string[]) => {
    setIsSaving(true);
    try {
      await reorderAdminAchievements(orderedIds);
      await refreshAchievementsList();
      showSaveSuccess('Achievements reordered successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Social Links CMS Handlers
  const refreshSocialLinksList = async () => {
    const res = await fetchAdminSocialLinks();
    if (res && res.data) {
      setAdminSocialLinks(res.data);
      setTotalSocialLinksCount(res.summary?.totalLinks || res.data.length);
      setEnabledSocialLinksCount(res.summary?.enabledLinks || 0);
    }
  };

  const handleCreateSocialLink = async (payload: Partial<AdminSocialLink>) => {
    setIsSaving(true);
    try {
      await createAdminSocialLink(payload);
      await refreshSocialLinksList();
      showSaveSuccess('Social link created successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSocialLink = async (id: string, payload: Partial<AdminSocialLink>) => {
    setIsSaving(true);
    try {
      await updateAdminSocialLink(id, payload);
      await refreshSocialLinksList();
      showSaveSuccess('Social link updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSocialLink = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteAdminSocialLink(id);
      await refreshSocialLinksList();
      showSaveSuccess('Social link deleted successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSocialLinkStatus = async (id: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminSocialLinkStatus(id, enabled);
      await refreshSocialLinksList();
      showSaveSuccess('Social link status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderSocialLinks = async (orderedIds: string[]) => {
    setIsSaving(true);
    try {
      await reorderAdminSocialLinks(orderedIds);
      await refreshSocialLinksList();
      showSaveSuccess('Social links reordered successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Contact Settings CMS Handler
  const handleSaveContact = async (payload: unknown) => {
    setIsSaving(true);
    try {
      const updated = await updateAdminContact(payload);
      setAdminContactData(updated);
      showSaveSuccess('Contact settings updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Navigation Items CMS Handlers
  const refreshNavigationList = async () => {
    const res = await fetchAdminNavigation();
    if (res && res.items) {
      setAdminNavigationItems(res.items);
      setTotalNavigationCount(res.summary?.totalItems || res.items.length);
      setEnabledNavigationCount(res.summary?.enabledItems || 0);
    }
  };

  const handleCreateNavigationItem = async (payload: Partial<AdminNavigationItem>) => {
    setIsSaving(true);
    try {
      await createAdminNavigationItem(payload);
      await refreshNavigationList();
      showSaveSuccess('Navigation item created successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateNavigationItem = async (id: string, payload: Partial<AdminNavigationItem>) => {
    setIsSaving(true);
    try {
      await updateAdminNavigationItem(id, payload);
      await refreshNavigationList();
      showSaveSuccess('Navigation item updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNavigationItem = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteAdminNavigationItem(id);
      await refreshNavigationList();
      showSaveSuccess('Navigation item deleted successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNavigationStatus = async (id: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAdminNavigationStatus(id, enabled);
      await refreshNavigationList();
      showSaveSuccess('Navigation item status updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorderNavigation = async (orderedIds: string[]) => {
    setIsSaving(true);
    try {
      await reorderAdminNavigation(orderedIds);
      await refreshNavigationList();
      showSaveSuccess('Navigation items reordered successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // SEO Save Handler
  const handleSaveSeo = async (payload: SeoSettings) => {
    setIsSaving(true);
    try {
      const updated = await updateAdminSeo(payload);
      setAdminSeoData(updated);
      showSaveSuccess('SEO configuration saved successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // Site Settings Save Handler
  const handleSaveSiteSettings = async (payload: SiteSettings) => {
    setIsSaving(true);
    try {
      const updated = await updateAdminSiteSettings(payload);
      setAdminSiteSettingsData(updated);
      showSaveSuccess('Site settings saved successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  // 1. UNAUTHENTICATED LOGIN SCREEN
  if (!token) {
    return (
      <div className="fixed inset-0 z-50 bg-bgVoid font-mono text-gray-100 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-bgCard border border-accentBlue/40 shadow-2xl space-y-6 text-center">
          
          {showForgotPassword ? (
            <div className="space-y-6">
              <div className="p-4 rounded-3xl bg-bgVoid border border-borderGlass inline-block text-accentCyan">
                <KeyRound className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-accentCyan font-bold tracking-widest block mb-1">
                  SECURITY & RECOVERY (STEP {resetStep} OF 3)
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  {resetStep === 1 && 'Forgot Password?'}
                  {resetStep === 2 && 'Enter 6-Digit Code'}
                  {resetStep === 3 && 'Set New Password'}
                </h3>
              </div>

              {resetStatus && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs leading-relaxed">
                  {resetStatus}
                </div>
              )}

              {resetError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {resetError}
                </div>
              )}

              {/* STEP 1: REQUEST CODE */}
              {resetStep === 1 && (
                <form onSubmit={handleRequestForgotPassword} className="space-y-4 text-left">
                  <p className="text-xs text-gray-400 font-sans">
                    Enter your administrator email address below to receive a 6-digit verification code.
                  </p>

                  <FormField label="Admin Email Address" required>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue text-xs"
                    />
                  </FormField>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold text-xs uppercase shadow-glow-blue cursor-pointer disabled:opacity-50"
                  >
                    {isResetting ? 'Sending Code...' : 'Send Verification Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetError(null);
                    }}
                    className="w-full text-center text-xs text-gray-400 hover:text-white pt-2 cursor-pointer"
                  >
                    ← Return to Sign In
                  </button>
                </form>
              )}

              {/* STEP 2: VERIFY 6-DIGIT CODE */}
              {resetStep === 2 && (
                <form onSubmit={handleVerifyResetCode} className="space-y-4 text-left">
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    A 6-digit verification code was sent to <strong className="text-accentCyan">{resetEmail}</strong>. Please check your email inbox and enter the code below.
                  </p>

                  <FormField label="6-Digit Verification Code" required>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value)}
                      placeholder="e.g. 849201"
                      className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan font-bold tracking-widest text-center text-base focus:outline-none focus:border-accentBlue"
                    />
                  </FormField>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold text-xs uppercase shadow-glow-blue cursor-pointer disabled:opacity-50"
                  >
                    {isResetting ? 'Verifying Code...' : 'Verify Code & Proceed'}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep(1);
                        setResetError(null);
                      }}
                      className="text-gray-400 hover:text-white cursor-pointer"
                    >
                      ← Back to Step 1
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestForgotPassword}
                      className="text-accentCyan hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: SET NEW PASSWORD */}
              {resetStep === 3 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-left">
                  <p className="text-xs text-emerald-400 font-mono">
                    ✓ Identity verified! Enter your new admin password below.
                  </p>

                  <FormField label="New Password" required>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="New password (min 6 chars)"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full px-4 py-3 pr-11 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white cursor-pointer p-1"
                        title={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>

                  <FormField label="Confirm New Password" required>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter new password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        className="w-full px-4 py-3 pr-11 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white cursor-pointer p-1"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold text-xs uppercase shadow-glow-blue cursor-pointer disabled:opacity-50"
                  >
                    {isResetting ? 'Saving New Password...' : 'Save New Password & Sign In'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-3xl bg-bgVoid border border-borderGlass inline-block text-accentCyan">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-accentCyan font-bold tracking-widest block mb-1">
                  SAAS PORTFOLIO CMS
                </span>
                <h3 className="text-2xl font-extrabold text-white">Admin Login</h3>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {loginError}
                </div>
              )}

              {resetStatus && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  {resetStatus}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <FormField label="Admin Email" required>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue text-xs"
                  />
                </FormField>

                <FormField label="Password" required>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white cursor-pointer p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormField>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(emailInput);
                      setShowForgotPassword(true);
                      setResetStep(1);
                      setResetError(null);
                      setResetStatus(null);
                    }}
                    className="text-xs text-accentCyan hover:underline cursor-pointer font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold text-xs uppercase shadow-glow-blue cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? 'Authenticating...' : 'Sign In to SaaS Dashboard'}
                </button>
              </form>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1 cursor-pointer pt-2"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Return to Public Portfolio</span>
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  if (isLoading || !portfolio) {
    return (
      <div className="fixed inset-0 z-50 bg-bgVoid flex items-center justify-center">
        <LoadingState message="Loading SaaS CMS Workspace & API Data..." />
      </div>
    );
  }

  const moduleCounts = {
    dashboard: 1,
    personal: 1,
    hero: 1,
    about: (aboutState as { highlights?: unknown[] })?.highlights?.length || 5,
    experience: adminExperiences.length,
    skills: adminSkillCategories.length,
    projects: adminProjects.length,
    education: adminEducation.length,
    certifications: adminCertifications.length,
    achievements: adminAchievements.length,
    'social-links': adminSocialLinks.length,
    contact: unreadLeadsCount,
    navigation: adminNavigationItems.length,
    seo: 1,
    settings: 1,
    'site-settings': 1,
    media: adminMediaCount,
    resume: adminResumesCount,
    profile: 1
  };

  const navItem = getNavItemByPath(currentPath);

  return (
    <AdminLayout
      currentPath={currentPath}
      onNavigate={(path) => {
        setCurrentPath(path);
        if (path === '/admin/experience') setExperienceSubView('list');
        if (path === '/admin/projects') setProjectSubView('list');
      }}
      onViewLive={onClose}
      onLogout={handleLogout}
      adminUser={adminUser}
      saveStatus={saveStatus}
      counts={moduleCounts}
    >
      {/* 1. DASHBOARD LANDING VIEW */}
      {(currentPath === '/admin/dashboard' || currentPath === '/admin') && (
        <DashboardView
          onNavigate={(path) => {
            const target = path.startsWith('/admin/') ? path : `/admin/${path}`;
            setCurrentPath(target);
            if (target === '/admin/experience') setExperienceSubView('new');
            if (target === '/admin/projects') setProjectSubView('new');
          }}
          adminName={adminUser?.name?.split(' ')[0] || 'Ashish'}
        />
      )}

      {/* 2. PERSONAL INFORMATION MODULE */}
      {currentPath === '/admin/personal' && (
        <PersonalModule
          data={(personalState || {
            fullName: 'ASHISHKUMAR DUDHAT',
            professionalTitle: 'Senior Software Engineer | Lead Engineer | Full Stack Developer',
            email: adminUser?.email || '',
            phone: '+91 7600908370',
            location: 'Ahmedabad, Gujarat',
            availability: 'Available to rejoin immediately',
            profileImageId: '',
            enabled: true
          }) as any}
          onSave={handleSavePersonal}
          isSaving={isSaving}
        />
      )}

      {/* RESUME MANAGEMENT MODULE */}
      {currentPath === '/admin/resume' && (
        <ResumeModule onCountChange={(count) => setAdminResumesCount(count)} />
      )}

      {/* 3. HERO SECTION MODULE */}
      {currentPath === '/admin/hero' && (
        <HeroModule
          data={(heroState || {
            eyebrow: 'Senior Software Engineer & Lead Engineer',
            headline: 'ASHISHKUMAR DUDHAT',
            subheadline: 'Full Stack MERN & MEAN Stack Specialist',
            description: 'Building scalable, high-performance web applications & microservices across Fintech, Healthcare, and SaaS domains.',
            primaryCtaLabel: 'Explore Projects',
            primaryCtaTarget: '#projects',
            secondaryCtaLabel: 'Initiate Contact',
            secondaryCtaTarget: '#contact',
            enabled: true
          }) as any}
          onSave={handleSaveHero}
          isSaving={isSaving}
        />
      )}

      {/* 4. ABOUT SECTION & HIGHLIGHTS MODULE */}
      {currentPath === '/admin/about' && (
        <AboutModule
          data={(aboutState || {
            editorialHeading: 'Engineering Scalable Digital Products with Architectural Depth & Precision.',
            introduction: [
              'Over 8+ years as a Senior Software Engineer and Lead Engineer, I have architected and scaled production web applications across full stack MERN and MEAN environments using Angular, React.js, Next.js, and Node.js. My work spans high-volume fintech platforms, real-time healthcare diagnostics, and enterprise SaaS systems.'
            ],
            enabled: true,
            highlights: []
          }) as any}
          onSaveAbout={handleSaveAboutNarrative}
          onAddHighlight={handleAddAboutHighlight}
          onUpdateHighlight={handleUpdateAboutHighlight}
          onDeleteHighlight={handleDeleteAboutHighlight}
          onToggleHighlightStatus={handleToggleAboutHighlightStatus}
          onReorderHighlights={handleReorderAboutHighlights}
          isSaving={isSaving}
        />
      )}

      {/* 5. EXPERIENCE TIMELINE CMS MODULE */}
      {currentPath === '/admin/experience' && (
        <>
          {experienceSubView === 'list' && (
            <ExperienceListModule
              items={adminExperiences}
              onAddNew={() => {
                setEditingExperience(null);
                setExperienceSubView('new');
              }}
              onEdit={(item) => {
                setEditingExperience(item);
                setExperienceSubView('edit');
              }}
              onDelete={handleDeleteExperience}
              onToggleStatus={handleToggleExperienceStatus}
              onReorder={handleReorderExperiences}
              isSaving={isSaving}
            />
          )}

          {(experienceSubView === 'new' || experienceSubView === 'edit') && (
            <ExperienceFormModule
              initialData={editingExperience}
              onSave={editingExperience ? handleUpdateExperience : handleCreateExperience}
              onCancel={() => {
                setExperienceSubView('list');
                setEditingExperience(null);
              }}
              isSaving={isSaving}
            />
          )}
        </>
      )}

      {/* 6. SKILLS TOPOLOGY CMS MODULE */}
      {currentPath === '/admin/skills' && (
        <SkillsModule
          categories={adminSkillCategories}
          totalCategories={totalSkillCategories}
          totalEnabledSkills={totalEnabledSkills}
          onCreateCategory={handleCreateSkillCategory}
          onUpdateCategory={handleUpdateSkillCategory}
          onDeleteCategory={handleDeleteSkillCategory}
          onToggleCategoryStatus={handleToggleSkillCategoryStatus}
          onReorderCategories={handleReorderSkillCategories}
          onCreateSkill={handleCreateSkill}
          onUpdateSkill={handleUpdateSkill}
          onDeleteSkill={handleDeleteSkill}
          onToggleSkillStatus={handleToggleSkillStatus}
          onReorderSkills={handleReorderSkills}
          isSaving={isSaving}
        />
      )}

      {/* 7. PRODUCTION PROJECTS CMS MODULE */}
      {currentPath === '/admin/projects' && (
        <>
          {projectSubView === 'list' && (
            <ProjectsListModule
              projects={adminProjects}
              totalProjects={totalProjectsCount}
              enabledProjects={enabledProjectsCount}
              featuredProjects={featuredProjectsCount}
              onAddNew={() => {
                setEditingProject(null);
                setProjectSubView('new');
              }}
              onEdit={(project) => {
                setEditingProject(project);
                setProjectSubView('edit');
              }}
              onDelete={handleDeleteProject}
              onToggleStatus={handleToggleProjectStatus}
              onToggleFeatured={handleToggleProjectFeatured}
              onReorder={handleReorderProjects}
              isSaving={isSaving}
            />
          )}

          {(projectSubView === 'new' || projectSubView === 'edit') && (
            <ProjectsFormModule
              initialData={editingProject}
              onSave={editingProject ? handleUpdateProject : handleCreateProject}
              onCancel={() => {
                setProjectSubView('list');
                setEditingProject(null);
              }}
              isSaving={isSaving}
            />
          )}
        </>
      )}

      {/* 8. ACADEMIC EDUCATION CMS MODULE */}
      {currentPath === '/admin/education' && (
        <EducationModule
          items={adminEducation}
          totalRecords={totalEducationCount}
          enabledRecords={enabledEducationCount}
          onCreate={handleCreateEducation}
          onUpdate={handleUpdateEducation}
          onDelete={handleDeleteEducation}
          onToggleStatus={handleToggleEducationStatus}
          onReorder={handleReorderEducation}
          isSaving={isSaving}
        />
      )}

      {/* 9. CERTIFICATIONS CMS MODULE */}
      {currentPath === '/admin/certifications' && (
        <CertificationsModule
          certifications={adminCertifications}
          totalCertifications={totalCertificationsCount}
          enabledCertifications={enabledCertificationsCount}
          onCreate={handleCreateCertification}
          onUpdate={handleUpdateCertification}
          onDelete={handleDeleteCertification}
          onToggleStatus={handleToggleCertificationStatus}
          onReorder={handleReorderCertifications}
          isSaving={isSaving}
        />
      )}

      {/* 10. ACHIEVEMENTS CMS MODULE */}
      {currentPath === '/admin/achievements' && (
        <AchievementsModule
          achievements={adminAchievements}
          totalAchievements={totalAchievementsCount}
          enabledAchievements={enabledAchievementsCount}
          onCreate={handleCreateAchievement}
          onUpdate={handleUpdateAchievement}
          onDelete={handleDeleteAchievement}
          onToggleStatus={handleToggleAchievementStatus}
          onReorder={handleReorderAchievements}
          isSaving={isSaving}
        />
      )}

      {/* 11. SOCIAL LINKS CMS MODULE */}
      {currentPath === '/admin/social-links' && (
        <SocialLinksModule
          links={adminSocialLinks}
          totalLinks={totalSocialLinksCount}
          enabledLinks={enabledSocialLinksCount}
          onCreate={handleCreateSocialLink}
          onUpdate={handleUpdateSocialLink}
          onDelete={handleDeleteSocialLink}
          onToggleStatus={handleToggleSocialLinkStatus}
          onReorder={handleReorderSocialLinks}
          isSaving={isSaving}
        />
      )}

      {/* 12. CONTACT SUBMISSIONS & LEADS CMS MODULE */}
      {currentPath === '/admin/contact' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-borderGlass pb-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => setContactActiveSubTab('leads')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                contactActiveSubTab === 'leads'
                  ? 'bg-accentBlue text-white shadow-glow-blue'
                  : 'bg-bgCard text-gray-400 hover:text-white'
              }`}
            >
              📥 Client Inquiries & Leads ({unreadLeadsCount} Unread)
            </button>
            <button
              type="button"
              onClick={() => setContactActiveSubTab('settings')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                contactActiveSubTab === 'settings'
                  ? 'bg-accentBlue text-white shadow-glow-blue'
                  : 'bg-bgCard text-gray-400 hover:text-white'
              }`}
            >
              ⚙️ Contact Section Heading & Settings
            </button>
          </div>

          {contactActiveSubTab === 'leads' ? (
            <LeadsModule onUnreadCountChange={(count) => setUnreadLeadsCount(count)} />
          ) : (
            <ContactModule
              data={adminContactData || {
                personal: {
                  fullName: 'ASHISHKUMAR DUDHAT',
                  professionalTitle: 'Senior Software Engineer | Lead Engineer | Full Stack Developer',
                  email: adminUser?.email || '',
                  phone: '+91 7600908370',
                  location: 'Ahmedabad, Gujarat',
                  availability: 'Available to rejoin immediately'
                },
                presentation: {
                  heading: "Let's Build Something Exceptional Together.",
                  description: "Have a high-concurrency microservices project, fintech integration, or engineering leadership role in mind? Reach out directly.",
                  primaryCtaLabel: "Initiate Discussion",
                  primaryCtaTarget: "#contact",
                  enabled: true
                }
              }}
              onSave={handleSaveContact}
              onNavigateToPersonal={() => setCurrentPath('/admin/personal')}
              isSaving={isSaving}
            />
          )}
        </div>
      )}

      {/* 13. WEBSITE NAVIGATION CMS MODULE */}
      {currentPath === '/admin/navigation' && (
        <NavigationModule
          items={adminNavigationItems}
          totalItems={totalNavigationCount}
          enabledItems={enabledNavigationCount}
          onCreate={handleCreateNavigationItem}
          onUpdate={handleUpdateNavigationItem}
          onDelete={handleDeleteNavigationItem}
          onToggleStatus={handleToggleNavigationStatus}
          onReorder={handleReorderNavigation}
          isSaving={isSaving}
        />
      )}

      {/* 14. SEO & METADATA CMS MODULE */}
      {currentPath === '/admin/seo' && (
        <SeoModule
          data={adminSeoData || {
            title: 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
            description: 'Senior Software Engineer & Lead Engineer with 8+ years of experience architecting and scaling production web applications across MERN & MEAN full stack environments.',
            keywords: 'Senior Software Engineer, Technical Lead, Full Stack Developer, React, Node.js, TypeScript, PostgreSQL, Angular, MERN, Microservices',
            canonicalUrl: '',
            robotsIndex: true,
            robotsFollow: true,
            ogTitle: '',
            ogDescription: '',
            ogImageId: '',
            twitterCard: 'summary_large_image',
            twitterTitle: '',
            twitterDescription: '',
            twitterImageId: '',
            faviconMediaId: '',
            structuredDataEnabled: true,
            structuredDataJson: ''
          }}
          mediaList={portfolio.media}
          onSave={handleSaveSeo}
          isSaving={isSaving}
        />
      )}

      {/* 15. MEDIA LIBRARY CMS MODULE */}
      {currentPath === '/admin/media' && (
        <MediaModule />
      )}

      {/* 16. PUBLISHING & DRAFT WORKFLOW CMS MODULE */}
      {currentPath === '/admin/publishing' && (
        <PublishingModule onOpenPreview={() => setIsPreviewOpen(true)} />
      )}

      {/* 17. SITE SETTINGS MODULE */}
      {(currentPath === '/admin/site-settings' || currentPath === '/admin/settings') && (
        <SiteSettingsModule
          data={adminSiteSettingsData || {
            siteName: 'Ashishkumar Dudhat Portfolio',
            defaultTitle: 'ASHISHKUMAR DUDHAT | Senior Software Engineer & Technical Lead',
            defaultDescription: 'Senior Software Engineer & Lead Engineer specializing in full stack Web Applications, Microservices, and Cloud Architecture.',
            locale: 'en-US',
            timezone: 'Asia/Kolkata',
            maintenanceMode: false,
            analyticsProvider: '',
            analyticsId: ''
          }}
          onSave={handleSaveSiteSettings}
          isSaving={isSaving}
        />
      )}

      {/* 18. ADMIN PROFILE MODULE */}
      {currentPath === '/admin/profile' && (
        <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-5 max-w-xl font-mono text-xs shadow-xl">
          <h3 className="text-base font-bold text-white border-b border-borderGlass pb-3">Administrator Profile</h3>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-gray-400 uppercase">Administrator Name</span>
              <p className="text-sm font-bold text-white">{adminUser?.name || 'Ashishkumar Dudhat'}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase">Admin Email Address</span>
              <p className="text-sm font-bold text-accentCyan">{adminUser?.email || ''}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase">Access Role</span>
              <p className="text-xs font-bold text-emerald-400">{adminUser?.role || 'ADMIN'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 19. PLACEHOLDER VIEW FOR UNIMPLEMENTED PATHS */}
      {!['/admin/dashboard', '/admin', '/admin/personal', '/admin/hero', '/admin/about', '/admin/experience', '/admin/skills', '/admin/projects', '/admin/education', '/admin/certifications', '/admin/achievements', '/admin/social-links', '/admin/contact', '/admin/navigation', '/admin/seo', '/admin/publishing', '/admin/site-settings', '/admin/settings', '/admin/media', '/admin/profile', '/admin/resume'].includes(currentPath) && (
        <div className="p-12 rounded-3xl bg-bgCard border border-borderGlass text-center font-mono text-xs space-y-4 max-w-xl mx-auto">
          <Clock className="w-10 h-10 text-accentCyan mx-auto" />
          <h3 className="text-base font-bold text-white">{navItem?.label || 'CMS Module'} - Coming Soon</h3>
          <p className="text-gray-400">The CRUD management interface for this module will be enabled in subsequent prompts.</p>
        </div>
      )}

      {/* PREVIEW DRAFT MODAL */}
      <AdminPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />

    </AdminLayout>
  );
};
