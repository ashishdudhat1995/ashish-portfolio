import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Mail, 
  Phone, 
  MapPin,
  Send,
  Copy,
  Check,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../ui/Icons';
import { Card3D } from '../ui/Card3D';
import { fetchPublicContact, fetchPublicSocialLinks, submitContactForm } from '../../services/apiClient';

interface ContactSectionProps {
  personal?: any;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  personal: inputPersonal 
}) => {
  const fallbackPersonal = inputPersonal || null;

  const [contactData, setContactData] = useState<{
    enabled?: boolean;
    heading?: string;
    description?: string;
    contactInfo?: {
      name: string;
      title: string;
      email: string;
      phone: string;
      location: string;
      availability: string;
    };
  } | null>(null);

  const [socialLinks, setSocialLinks] = useState<Array<{
    id: string;
    platform: string;
    label: string;
    url: string;
    iconKey?: string;
  }>>([]);

  useEffect(() => {
    fetchPublicContact().then((res) => {
      if (res) setContactData(res);
    }).catch(() => {});

    fetchPublicSocialLinks().then((links) => {
      if (links) setSocialLinks(links);
    }).catch(() => {});
  }, []);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const personal = {
    email: fallbackPersonal?.email || contactData?.contactInfo?.email || '',
    phone: fallbackPersonal?.phone || contactData?.contactInfo?.phone || '+91 7600908370',
    location: fallbackPersonal?.location || contactData?.contactInfo?.location || 'Ahmedabad, Gujarat',
    availability: fallbackPersonal?.availability || fallbackPersonal?.availabilityStatus || contactData?.contactInfo?.availability || 'Available to Join Immediately'
  };

  const sectionHeading = contactData?.heading || "Let's Discuss Your Next Engineering Venture & Collaboration";
  const sectionDescription = contactData?.description || "Have a high-concurrency microservices project, fintech integration, or engineering leadership role in mind? Reach out directly.";

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitContactForm(formData);
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#2563eb', '#6366f1', '#10b981']
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 6000);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    }
  };

  if (contactData?.enabled === false) {
    return null;
  }

  return (
    <section id="contact" className="py-24 relative z-10 border-t border-borderGlass/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Drops down from Top (-30px) */}
        <motion.div 
          className="flex flex-col items-start mb-16"
          initial={{ opacity: 0, y: -40, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center gap-2 text-accentCyan text-xs font-mono tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-accentCyan" />
            <span>Initiate Direct Contact</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            {sectionHeading}
          </h2>
          {sectionDescription && (
            <p className="text-sm sm:text-base text-gray-300 font-sans mt-4 max-w-2xl">
              {sectionDescription}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Contact Details Cards - Fly in from Left (-50px) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Copy Email Card */}
            <motion.div
              initial={{ opacity: 0, x: -60, filter: 'blur(5px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Card3D depth={12} glowColor="rgba(37, 99, 235, 0.25)">
                <div className="p-6 rounded-3xl bg-bgCard/90 border border-borderGlass hover:border-accentBlue/40 transition-all flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-gray-400 uppercase">Primary Email</p>
                      <p className="text-sm sm:text-base font-bold text-white break-all">{personal.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(personal.email, 'email')}
                    className="p-2.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-white flex-shrink-0 transition-colors"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </Card3D>
            </motion.div>

            {/* Quick Copy Phone Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Card3D depth={12} glowColor="rgba(56, 189, 248, 0.25)">
                <div className="p-6 rounded-3xl bg-bgCard/90 border border-borderGlass hover:border-accentBlue/40 transition-all flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-gray-400 uppercase">Direct Phone</p>
                      <p className="text-sm sm:text-base font-bold text-white">{personal.phone}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(personal.phone, 'phone')}
                    className="p-2.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-white flex-shrink-0 transition-colors"
                    title="Copy Phone"
                  >
                    {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </Card3D>
            </motion.div>

            {/* Location & Availability Note */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Card3D depth={12} glowColor="rgba(99, 102, 241, 0.25)">
                <div className="p-6 rounded-3xl bg-bgCard/90 border border-borderGlass space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-bgVoid border border-borderGlass text-indigo-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-gray-400 uppercase">Location & Relocation</p>
                      <p className="text-sm font-bold text-white">{personal.location}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-mono pt-2 border-t border-borderGlass/60 flex items-center justify-between">
                    <span>{personal.availability}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </p>
                </div>
              </Card3D>
            </motion.div>

            {/* Social Network Links */}
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-mono text-gray-400 uppercase mb-3">PROFESSIONAL PROFILES:</p>
                <div className="flex flex-wrap items-center gap-3">
                  {socialLinks.map((soc) => {
                    const isLinkedIn = soc.platform.toLowerCase().includes('linkedin');
                    const isGithub = soc.platform.toLowerCase().includes('github');
                    return (
                      <a
                        key={soc.id}
                        href={soc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-3 rounded-2xl bg-bgCard border border-borderGlass text-gray-200 hover:text-white hover:border-accentBlue transition-all flex items-center gap-2 text-xs font-mono font-semibold"
                      >
                        {isLinkedIn ? (
                          <LinkedinIcon className="w-4 h-4 text-accentCyan" />
                        ) : isGithub ? (
                          <GithubIcon className="w-4 h-4 text-gray-200" />
                        ) : (
                          <ExternalLink className="w-4 h-4 text-accentCyan" />
                        )}
                        <span>{soc.platform}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Interactive Message Dispatch Form - Flies in from Right (+50px) */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Card3D depth={14} glowColor="rgba(37, 99, 235, 0.3)">
              <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-borderGlass relative shadow-2xl">
                
                <h3 className="text-2xl font-bold text-white mb-2">Send a Message</h3>
                <p className="text-xs font-mono text-gray-400 mb-6">
                  Fill out the form below to get in touch directly.
                </p>

                {errorMessage && (
                  <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                    <span>{errorMessage}</span>
                  </div>
                )}

                {isSubmitted && (
                  <div className="p-4 mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Message dispatched cleanly! Thank you for reaching out.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-400 mb-2 uppercase">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-2 uppercase">Your Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. sarah@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2 uppercase">Subject / Opportunity</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Technical Lead Role / System Architecture Inquiry"
                      className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2 uppercase">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Details regarding your project, timeline, or engineering opportunity..."
                      className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold text-sm tracking-wide shadow-glow-blue hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Dispatch Message'}</span>
                  </button>

                </form>

              </div>
            </Card3D>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
