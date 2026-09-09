import React, { useEffect, useState } from 'react';
import { fetchPublicSeo, fetchPublicSiteSettings } from '../../services/apiClient';
import type { PublicSeoSettings, PublicSiteSettings } from '../../types/portfolio';

export const SeoHead: React.FC = () => {
  const [seo, setSeo] = useState<PublicSeoSettings | null>(null);
  const [siteSettings, setSiteSettings] = useState<PublicSiteSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    Promise.all([
      fetchPublicSeo(),
      fetchPublicSiteSettings()
    ]).then(([seoData, siteData]) => {
      if (isMounted) {
        if (seoData) setSeo(seoData);
        if (siteData) setSiteSettings(siteData);
      }
    }).catch(() => {
      // Safe fallback - index.html default metadata remains intact
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!seo && !siteSettings) return;

    // Helper to update or append meta tags
    const updateMetaTag = (nameAttr: 'name' | 'property', attrValue: string, content: string | null) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (content) {
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(nameAttr, attrValue);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      } else if (element) {
        element.remove();
      }
    };

    // 1. Page Title
    const title = seo?.title || siteSettings?.defaultTitle || siteSettings?.siteName || '';
    if (title) {
      document.title = title;
      updateMetaTag('name', 'title', title);
    }

    // 2. Meta Description
    const description = seo?.description || siteSettings?.defaultDescription || '';
    if (description) {
      updateMetaTag('name', 'description', description);
    }

    // 3. Meta Keywords
    if (seo?.keywords) {
      updateMetaTag('name', 'keywords', seo.keywords);
    }

    // 4. Robots Directives
    const robotsContent = seo?.robots || (seo?.robotsIndex === false ? 'noindex' : 'index') + ', ' + (seo?.robotsFollow === false ? 'nofollow' : 'follow');
    updateMetaTag('name', 'robots', robotsContent);

    // 5. Canonical Link Tag
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (seo?.canonicalUrl && seo.canonicalUrl.trim() !== '') {
      if (!canonicalElement) {
        canonicalElement = document.createElement('link');
        canonicalElement.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalElement);
      }
      canonicalElement.setAttribute('href', seo.canonicalUrl.trim());
    } else if (canonicalElement) {
      canonicalElement.remove();
    }

    // 6. Open Graph Meta Tags
    const ogTitle = seo?.ogTitle || title;
    const ogDescription = seo?.ogDescription || description;
    const ogImage = seo?.ogImageId || '';

    updateMetaTag('property', 'og:title', ogTitle);
    updateMetaTag('property', 'og:description', ogDescription);
    updateMetaTag('property', 'og:image', ogImage);

    // 7. Twitter Meta Tags
    const twitterCard = seo?.twitterCard || 'summary_large_image';
    const twitterTitle = seo?.twitterTitle || ogTitle;
    const twitterDescription = seo?.twitterDescription || ogDescription;
    const twitterImage = seo?.twitterImageId || ogImage;

    updateMetaTag('property', 'twitter:card', twitterCard);
    updateMetaTag('property', 'twitter:title', twitterTitle);
    updateMetaTag('property', 'twitter:description', twitterDescription);
    updateMetaTag('property', 'twitter:image', twitterImage);

    // 8. Favicon
    if (seo?.faviconMediaId && seo.faviconMediaId.trim() !== '') {
      let faviconLink = document.querySelector('link[rel="icon"]');
      if (faviconLink) {
        faviconLink.setAttribute('href', seo.faviconMediaId.trim());
      }
    }

    // 9. Structured Data (JSON-LD) Injection
    let jsonLdScript = document.getElementById('dynamic-json-ld-script');
    if (seo?.structuredDataEnabled && seo.structuredDataJson && seo.structuredDataJson.trim() !== '') {
      try {
        // Validate JSON before injection to prevent XSS / script breakage
        const parsed = JSON.parse(seo.structuredDataJson.trim());
        if (!jsonLdScript) {
          jsonLdScript = document.createElement('script');
          jsonLdScript.setAttribute('type', 'application/ld+json');
          jsonLdScript.setAttribute('id', 'dynamic-json-ld-script');
          document.head.appendChild(jsonLdScript);
        }
        jsonLdScript.textContent = JSON.stringify(parsed, null, 2);
      } catch {
        if (jsonLdScript) jsonLdScript.remove();
      }
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }

  }, [seo, siteSettings]);

  return null;
};
