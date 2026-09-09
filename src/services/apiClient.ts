import { portfolioData } from '../data/portfolioData';
import type { PortfolioData } from '../types/portfolio';

const API_BASE_URL = 'http://localhost:5000/api';

function getAdminAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('adminToken');
  const csrfToken = localStorage.getItem('csrfToken');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  return headers;
}

function getAdminHeaders(): Record<string, string> {
  const token = localStorage.getItem('adminToken');
  const csrfToken = localStorage.getItem('csrfToken');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  return headers;
}

// ==================== PUBLIC ENDPOINTS ====================

export async function checkWebsiteHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return { online: false };
    const json = await res.json();
    return { online: json.success && json.status === 'ok' };
  } catch {
    return { online: false };
  }
}

export async function fetchPublicPersonal() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/personal`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function fetchPublicHero() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/hero`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function fetchPublicAbout() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/about`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function fetchPublicExperience() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/experience`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchPublicSkills() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/skills`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchPublicProjects() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/projects`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchPublicEducation() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/education`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchPublicCertifications() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/certifications`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchPublicAchievements() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/achievements`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function fetchPublicSocialLinks() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/social-links`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.socialLinks) ? json.socialLinks : (Array.isArray(json.data) ? json.data : []);
  } catch {
    return [];
  }
}

export async function fetchPublicContact() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/contact`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function fetchPublicNavigation() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/navigation`);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.items) ? json.items : (Array.isArray(json.data) ? json.data : []);
  } catch {
    return [];
  }
}

export async function fetchPublicResume() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/resume`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.resume || null;
  } catch {
    return null;
  }
}

export async function fetchPublicSeo() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/seo`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function fetchPublicSiteSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/site-settings`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function fetchPublicSiteConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio/site-config`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function fetchPortfolioData(): Promise<PortfolioData> {
  try {
    const res = await fetch(`${API_BASE_URL}/portfolio`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('API server returned error');
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return portfolioData;
  } catch {
    return portfolioData;
  }
}

// ==================== ADMIN AUTHENTICATION ====================

export async function checkAdminAuthSession() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/auth/status`, {
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return { authenticated: false };
    return await res.json();
  } catch {
    return { authenticated: false };
  }
}

export async function fetchAdminMe() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/auth/me`, {
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.user || null;
  } catch {
    return null;
  }
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Invalid email or password');
  if (data.token) {
    localStorage.setItem('adminToken', data.token);
  }
  if (data.csrfToken) {
    localStorage.setItem('csrfToken', data.csrfToken);
  }
  return data;
}

export async function adminLogout() {
  try {
    await fetch(`${API_BASE_URL}/admin/auth/logout`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });
  } catch {
    // Ignore error on logout
  } finally {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('csrfToken');
  }
}

export async function fetchDashboardSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/summary`, {
      headers: getAdminAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch summary');
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

// ==================== ADMIN CMS API MODULES ====================

// 1. Personal Information CMS API
export async function fetchAdminPersonal() {
  const res = await fetch(`${API_BASE_URL}/admin/personal`, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch personal information');
  return data.data;
}

export async function updateAdminPersonal(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/personal`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error?.message || 'Failed to update personal information');
  }
  return data.data;
}

// 2. Hero CMS API
export async function fetchAdminHero() {
  const res = await fetch(`${API_BASE_URL}/admin/hero`, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch hero section');
  return data.data;
}

export async function updateAdminHero(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/hero`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update hero section');
  return data.data;
}

// 3. About & About Highlights CMS API
export async function fetchAdminAbout() {
  const res = await fetch(`${API_BASE_URL}/admin/about`, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch about section');
  return data.data;
}

export async function updateAdminAbout(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/about`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update about section');
  return data.data;
}

export async function addAdminAboutHighlight(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/about/highlights`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create about highlight');
  return data.data;
}

export async function updateAdminAboutHighlight(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/about/highlights/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update about highlight');
  return data.data;
}

export async function deleteAdminAboutHighlight(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/about/highlights/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete about highlight');
  return data;
}

export async function toggleAdminAboutHighlightStatus(id: string, enabled: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/about/highlights/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update highlight status');
  return data.data;
}

export async function reorderAdminAboutHighlights(orderedIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/admin/about/highlights/reorder`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reorder about highlights');
  return data;
}

// 4. Experience Management CMS API
export async function fetchAdminExperiences(search?: string) {
  const url = search ? `${API_BASE_URL}/admin/experience?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/admin/experience`;
  const res = await fetch(url, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch experiences');
  return data.data;
}

export async function createAdminExperience(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/experience`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create experience record');
  return data.data;
}

export async function updateAdminExperience(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/experience/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update experience record');
  return data.data;
}

export async function deleteAdminExperience(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/experience/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete experience record');
  return data;
}

export async function toggleAdminExperienceStatus(id: string, enabled: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/experience/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update experience status');
  return data.data;
}

export async function reorderAdminExperiences(orderedIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/admin/experience/reorder`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reorder experiences');
  return data;
}

// 5. Skills Topology CMS API
export async function fetchAdminSkillsCategories() {
  const res = await fetch(`${API_BASE_URL}/admin/skills/categories`, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch skill categories');
  return data;
}

export async function createAdminSkillCategory(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/skills/categories`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create skill category');
  return data.data;
}

export async function updateAdminSkillCategory(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/skills/categories/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update skill category');
  return data.data;
}

export async function deleteAdminSkillCategory(id: string, force = false) {
  const url = `${API_BASE_URL}/admin/skills/categories/${id}${force ? '?force=true' : ''}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete skill category');
  return data;
}

export async function toggleAdminSkillCategoryStatus(id: string, enabled: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/skills/categories/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update category status');
  return data.data;
}

export async function reorderAdminSkillCategories(orderedIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/admin/skills/categories/reorder`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reorder skill categories');
  return data;
}

export async function createAdminSkill(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/skills`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create skill');
  return data.data;
}

export async function updateAdminSkill(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/skills/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update skill');
  return data.data;
}

export async function deleteAdminSkill(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/skills/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete skill');
  return data;
}

export async function toggleAdminSkillStatus(id: string, enabled: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/skills/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update skill status');
  return data.data;
}

export async function reorderAdminSkills(categoryId: string, orderedIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/admin/skills/reorder`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ categoryId, orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reorder skills');
  return data;
}

// 6. Production Projects CMS API
export async function fetchAdminProjects(search?: string) {
  const url = search ? `${API_BASE_URL}/admin/projects?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/admin/projects`;
  const res = await fetch(url, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch projects');
  return data;
}

export async function fetchAdminProjectById(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/projects/${id}`, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch project details');
  return data.data;
}

export async function createAdminProject(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/projects`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create project');
  return data.data;
}

export async function updateAdminProject(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update project');
  return data.data;
}

export async function deleteAdminProject(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete project');
  return data;
}

export async function toggleAdminProjectStatus(id: string, enabled: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/projects/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update project status');
  return data.data;
}

export async function toggleAdminProjectFeatured(id: string, featured: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/projects/${id}/featured`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ featured })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update project featured status');
  return data.data;
}

export async function reorderAdminProjects(orderedIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/admin/projects/reorder`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reorder projects');
  return data;
}

// 7. Education CMS API
export async function fetchAdminEducation(search?: string) {
  const url = search ? `${API_BASE_URL}/admin/education?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/admin/education`;
  const res = await fetch(url, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch education records');
  return data;
}

export async function createAdminEducation(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/education`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create education record');
  return data.data;
}

export async function updateAdminEducation(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/education/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update education record');
  return data.data;
}

export async function deleteAdminEducation(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/education/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete education record');
  return data;
}

export async function toggleAdminEducationStatus(id: string, enabled: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/education/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update education status');
  return data.data;
}

export async function reorderAdminEducation(orderedIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/admin/education/reorder`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reorder education records');
  return data;
}

// 8. Certifications CMS API
export async function fetchAdminCertifications(search?: string) {
  const url = search ? `${API_BASE_URL}/admin/certifications?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/admin/certifications`;
  const res = await fetch(url, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch certifications');
  return data;
}

export async function createAdminCertification(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/certifications`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create certification');
  return data.data;
}

export async function updateAdminCertification(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/certifications/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update certification');
  return data.data;
}

export async function deleteAdminCertification(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/certifications/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete certification');
  return data;
}

export async function toggleAdminCertificationStatus(id: string, enabled: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/certifications/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update certification status');
  return data.data;
}

export async function reorderAdminCertifications(orderedIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/admin/certifications/reorder`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reorder certifications');
  return data;
}

// 9. Achievements CMS API
export async function fetchAdminAchievements(search?: string) {
  const url = search ? `${API_BASE_URL}/admin/achievements?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/admin/achievements`;
  const res = await fetch(url, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch achievements');
  return data;
}

export async function createAdminAchievement(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/achievements`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create achievement');
  return data.data;
}

export async function updateAdminAchievement(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/achievements/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update achievement');
  return data.data;
}

export async function deleteAdminAchievement(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/achievements/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete achievement');
  return data;
}

export async function toggleAdminAchievementStatus(id: string, enabled: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/achievements/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update achievement status');
  return data.data;
}

export async function reorderAdminAchievements(orderedIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/admin/achievements/reorder`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reorder achievements');
  return data;
}

// 10. Social Links CMS API
export async function fetchAdminSocialLinks(search?: string) {
  const url = search ? `${API_BASE_URL}/admin/social-links?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/admin/social-links`;
  const res = await fetch(url, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch social links');
  return data;
}

export async function createAdminSocialLink(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/social-links`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create social link');
  return data.data;
}

export async function updateAdminSocialLink(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/social-links/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update social link');
  return data.data;
}

export async function deleteAdminSocialLink(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/social-links/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete social link');
  return data;
}

export async function toggleAdminSocialLinkStatus(id: string, enabled: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/social-links/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update social link status');
  return data.data;
}

export async function reorderAdminSocialLinks(orderedIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/admin/social-links/reorder`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reorder social links');
  return data;
}

// 11. Contact Settings CMS API
export async function fetchAdminContact() {
  const res = await fetch(`${API_BASE_URL}/admin/contact`, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch contact settings');
  return data.data;
}

export async function updateAdminContact(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/contact`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update contact settings');
  return data.data;
}

// 12. Navigation CMS API
export async function fetchAdminNavigation() {
  const res = await fetch(`${API_BASE_URL}/admin/navigation`, { 
    headers: getAdminAuthHeaders(),
    credentials: 'include' 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch navigation items');
  return data;
}

export async function createAdminNavigationItem(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/navigation`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create navigation item');
  return data.data;
}

export async function updateAdminNavigationItem(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/navigation/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update navigation item');
  return data.data;
}

export async function deleteAdminNavigationItem(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/navigation/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete navigation item');
  return data;
}

export async function toggleAdminNavigationStatus(id: string, enabled: boolean) {
  const res = await fetch(`${API_BASE_URL}/admin/navigation/${id}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ enabled })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update navigation status');
  return data.data;
}

export async function reorderAdminNavigation(orderedIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/admin/navigation/reorder`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to reorder navigation items');
  return data;
}

export async function updateAdminSection(section: string, payload: unknown, token?: string) {
  const headers = getAdminHeaders();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/${section}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || `Failed to update ${section}`);
  return data;
}

export async function fetchAdminMessages(token?: string) {
  const headers = getAdminAuthHeaders();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/messages`, {
    headers,
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to fetch messages');
  return data;
}

// 13. SEO CMS API
export async function fetchAdminSeo() {
  const res = await fetch(`${API_BASE_URL}/admin/seo`, {
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch SEO settings');
  return data.data;
}

export async function updateAdminSeo(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/seo`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update SEO settings');
  return data.data;
}

// 14. Site Settings CMS API
export async function fetchAdminSiteSettings() {
  const res = await fetch(`${API_BASE_URL}/admin/site-settings`, {
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch site settings');
  return data.data;
}

export async function updateAdminSiteSettings(payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/site-settings`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update site settings');
  return data.data;
}

// 15. Media Library CMS API
export async function fetchAdminMediaList(params: {
  page?: number;
  limit?: number;
  search?: string;
  mediaType?: string;
  status?: string;
  visibility?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.search) query.append('search', params.search);
  if (params.mediaType) query.append('mediaType', params.mediaType);
  if (params.status) query.append('status', params.status);
  if (params.visibility) query.append('visibility', params.visibility);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const res = await fetch(`${API_BASE_URL}/admin/media?${query.toString()}`, {
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch media library');
  return {
    data: data.data || [],
    pagination: data.pagination
  };
}

export async function uploadAdminMediaFile(formData: FormData) {
  const token = localStorage.getItem('adminToken');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/media/upload`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to upload media file');
  return data.data;
}

export async function updateAdminMediaMetadata(id: string, payload: unknown) {
  const res = await fetch(`${API_BASE_URL}/admin/media/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update media metadata');
  return data.data;
}

export async function deleteAdminMediaAsset(id: string, force = false) {
  const res = await fetch(`${API_BASE_URL}/admin/media/${id}?force=${force}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete media asset');
  return data;
}

// 16. Publishing & Draft Workflow CMS API
export async function fetchPublishingSummary() {
  const res = await fetch(`${API_BASE_URL}/admin/publishing/summary`, {
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch publishing summary');
  return data.data;
}

export async function fetchAuditLogs(page = 1, limit = 50) {
  const res = await fetch(`${API_BASE_URL}/admin/publishing/audit-logs?page=${page}&limit=${limit}`, {
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch audit logs');
  return {
    data: data.data || [],
    pagination: data.pagination
  };
}

export async function publishAllChanges() {
  const res = await fetch(`${API_BASE_URL}/admin/publishing/publish-all`, {
    method: 'POST',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) {
    const errObj = new Error(data.message || 'Publish all operation failed');
    (errObj as any).errors = data.errors || [];
    throw errObj;
  }
  return data;
}

export async function discardDraftChanges() {
  const res = await fetch(`${API_BASE_URL}/admin/publishing/discard-drafts`, {
    method: 'POST',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to discard draft changes');
  return data;
}

export async function publishEntity(entity: string, id?: string) {
  const url = id ? `${API_BASE_URL}/admin/publish/${entity}/${id}` : `${API_BASE_URL}/admin/publish/${entity}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) {
    const errObj = new Error(data.message || `Failed to publish ${entity}`);
    (errObj as any).errors = data.errors || [];
    throw errObj;
  }
  return data;
}

export async function fetchAdminPreviewData() {
  const res = await fetch(`${API_BASE_URL}/admin/preview`, {
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch admin preview dataset');
  return data.data;
}

export async function fetchAdminResumes() {
  const res = await fetch(`${API_BASE_URL}/admin/resume`, {
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error?.message || 'Failed to fetch resumes');
  return data;
}

export async function uploadAdminResume(formData: FormData) {
  const headers = getAdminAuthHeaders();
  delete (headers as any)['Content-Type']; // Let browser auto-set multipart header with boundary
  const res = await fetch(`${API_BASE_URL}/admin/resume`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to upload resume PDF');
  }
  return data;
}

export async function publishAdminResume(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/resume/${id}/publish`, {
    method: 'POST',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to publish resume');
  return data;
}

export async function archiveAdminResume(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/resume/${id}/archive`, {
    method: 'POST',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to archive resume');
  return data;
}

export async function deleteAdminResume(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/resume/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to delete resume');
  return data;
}

// ==================== CONTACT FORM & LEADS CMS API ====================

export async function submitContactForm(payload: { name: string; email: string; subject?: string; message: string }) {
  const res = await fetch(`${API_BASE_URL}/portfolio/contact/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to submit message');
  return data;
}

export async function fetchAdminLeads(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.status && params.status !== 'ALL') query.append('status', params.status);
  if (params.search && params.search.trim()) query.append('search', params.search.trim());

  const res = await fetch(`${API_BASE_URL}/admin/leads?${query.toString()}`, {
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error?.message || 'Failed to fetch leads');
  return data;
}

export async function fetchAdminLeadById(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/leads/${id}`, {
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error?.message || 'Failed to fetch lead details');
  return data.data;
}

export async function updateAdminLead(id: string, payload: { status?: string; adminNotes?: string; repliedAt?: string | null }) {
  const res = await fetch(`${API_BASE_URL}/admin/leads/${id}`, {
    method: 'PUT',
    headers: getAdminAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error?.message || 'Failed to update lead');
  return data.data;
}

export async function deleteAdminLead(id: string) {
  const res = await fetch(`${API_BASE_URL}/admin/leads/${id}`, {
    method: 'DELETE',
    headers: getAdminAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error?.message || 'Failed to delete lead');
  return data;
}

export async function fetchAdminUnreadLeadsCount() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/leads/unread-count`, {
      headers: getAdminAuthHeaders(),
      credentials: 'include'
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.unreadCount || 0;
  } catch {
    return 0;
  }
}
