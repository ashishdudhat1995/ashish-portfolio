import React, { useState, useEffect } from 'react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { fetchPublicSocialLinks, fetchPublicPersonal } from '../../services/apiClient';
import { ExternalLink } from 'lucide-react';

interface FooterProps {
  personal?: any;
}

export const Footer: React.FC<FooterProps> = ({ personal: inputPersonal }) => {
  const [personal, setPersonal] = useState<any>(inputPersonal || null);
  const [socialLinks, setSocialLinks] = useState<Array<{
    id: string;
    platform: string;
    label: string;
    url: string;
  }>>([]);

  useEffect(() => {
    if (inputPersonal) setPersonal(inputPersonal);
    else fetchPublicPersonal().then(p => { if (p) setPersonal(p); }).catch(() => {});

    fetchPublicSocialLinks().then((links) => {
      if (links) setSocialLinks(links);
    }).catch(() => {});
  }, [inputPersonal]);

  return (
    <footer className="relative z-10 border-t border-borderGlass bg-bgVoid/90 backdrop-blur-xl py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accentCyan to-accentBlue flex items-center justify-center text-white font-mono font-bold text-xs shadow-glow-cyan">
              AD
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">{personal?.fullName || personal?.name || ''}</p>
              <p className="text-xs text-gray-500 font-mono mt-1">{personal?.professionalTitle || personal?.primaryRole || ''}</p>
            </div>
          </div>

          {/* Center: Copyright & Tech statement */}
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400 font-mono">
              &copy; {new Date().getFullYear()} {personal?.fullName || personal?.name || ''}. Built with React, TypeScript, Node.js & PostgreSQL.
            </p>
          </div>

          {/* Right: Dynamic Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((soc) => {
              const isLinkedIn = soc.platform.toLowerCase().includes('linkedin');
              const isGithub = soc.platform.toLowerCase().includes('github');
              return (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-bgCard border border-borderGlass text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-mono"
                  aria-label={soc.platform}
                  title={soc.label}
                >
                  {isLinkedIn ? (
                    <LinkedinIcon className="w-4 h-4 text-accentCyan" />
                  ) : isGithub ? (
                    <GithubIcon className="w-4 h-4 text-gray-200" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-accentCyan" />
                  )}
                </a>
              );
            })}
          </div>

        </div>
      </div>
    </footer>
  );
};
