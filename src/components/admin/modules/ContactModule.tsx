import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Save, 
  AlertCircle, 
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { FormField } from '../ui/FormField';

export interface AdminContactData {
  personal: {
    fullName: string;
    professionalTitle: string;
    email: string;
    phone: string;
    location: string;
    availability: string;
  };
  presentation: {
    id?: string;
    heading: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaTarget: string;
    enabled: boolean;
  };
}

interface ContactModuleProps {
  data: AdminContactData;
  onSave: (payload: {
    heading: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaTarget: string;
    enabled: boolean;
    email?: string;
    phone?: string;
    location?: string;
    availability?: string;
  }) => Promise<void>;
  onNavigateToPersonal: () => void;
  isSaving: boolean;
}

export const ContactModule: React.FC<ContactModuleProps> = ({
  data,
  onSave,
  onNavigateToPersonal,
  isSaving
}) => {
  const [heading, setHeading] = useState(data.presentation?.heading || "Let's Build Something Exceptional Together.");
  const [description, setDescription] = useState(data.presentation?.description || "Have a high-concurrency microservices project, fintech integration, or engineering leadership role in mind? Reach out directly.");
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState(data.presentation?.primaryCtaLabel || "Initiate Discussion");
  const [primaryCtaTarget, setPrimaryCtaTarget] = useState(data.presentation?.primaryCtaTarget || "#contact");
  const [enabled, setEnabled] = useState(data.presentation?.enabled !== false);

  const [email, setEmail] = useState(data.personal?.email || 'dudhatashish1995@gmail.com');
  const [phone, setPhone] = useState(data.personal?.phone || '+91 7600908370');
  const [location, setLocation] = useState(data.personal?.location || 'Ahmedabad, Gujarat');
  const [availability, setAvailability] = useState(data.personal?.availability || 'Available to rejoin immediately');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data.presentation) {
      setHeading(data.presentation.heading);
      setDescription(data.presentation.description);
      setPrimaryCtaLabel(data.presentation.primaryCtaLabel);
      setPrimaryCtaTarget(data.presentation.primaryCtaTarget);
      setEnabled(data.presentation.enabled !== false);
    }
    if (data.personal) {
      setEmail(data.personal.email);
      setPhone(data.personal.phone);
      setLocation(data.personal.location);
      setAvailability(data.personal.availability);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!heading.trim()) {
      setErrorMessage('Contact Heading is required.');
      return;
    }
    if (!primaryCtaLabel.trim()) {
      setErrorMessage('Primary CTA Label is required.');
      return;
    }

    try {
      await onSave({
        heading: heading.trim(),
        description: description.trim(),
        primaryCtaLabel: primaryCtaLabel.trim(),
        primaryCtaTarget: primaryCtaTarget.trim(),
        enabled,
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        availability: availability.trim()
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update contact configuration');
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
        <div>
          <span className="text-[10px] text-accentCyan uppercase font-bold tracking-widest block mb-1">
            CANONICAL CONTACT & PRESENTATION CMS
          </span>
          <h2 className="text-xl font-black text-white">Contact Section Configuration</h2>
        </div>

        <button
          type="button"
          onClick={onNavigateToPersonal}
          className="px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan font-bold flex items-center gap-2 hover:bg-bgVoid/80 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Manage Personal Info Record</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Canonical Contact Details (Single Source of Truth) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-borderGlass pb-4">
            <div className="flex items-center gap-2 text-white font-bold">
              <MessageSquare className="w-4 h-4 text-accentCyan" />
              <span>Canonical Personal Contact Information</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Single Source of Truth
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Email Address" required>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold"
                />
              </div>
            </FormField>

            <FormField label="Phone Number" required>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold"
                />
              </div>
            </FormField>

            <FormField label="Location">
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                />
              </div>
            </FormField>

            <FormField label="Availability Status">
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-emerald-400 font-bold"
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Section 2: Contact Presentation & CTA Parameters */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-borderGlass pb-4 text-white font-bold">
            <Sparkles className="w-4 h-4 text-accentCyan" />
            <span>Contact Section Presentation Parameters</span>
          </div>

          <FormField label="Main Editorial Heading" required>
            <input
              type="text"
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Let's Build Something Exceptional Together."
              className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-bold"
            />
          </FormField>

          <FormField label="Sub-Heading Description">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Have a high-concurrency microservices project..."
              className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white font-sans resize-none"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Primary CTA Button Label" required>
              <input
                type="text"
                required
                value={primaryCtaLabel}
                onChange={(e) => setPrimaryCtaLabel(e.target.value)}
                placeholder="Initiate Discussion"
                className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
              />
            </FormField>

            <FormField label="Primary CTA Target Anchor">
              <input
                type="text"
                value={primaryCtaTarget}
                onChange={(e) => setPrimaryCtaTarget(e.target.value)}
                placeholder="#contact"
                className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-accentCyan font-mono"
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-borderGlass">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-400"
              />
              <span className="text-gray-300">Public Contact Section Enabled</span>
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold flex items-center gap-2 shadow-glow-blue hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Contact Settings'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
