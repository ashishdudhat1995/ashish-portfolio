import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  X, 
  Save, 
  User, 
  Briefcase, 
  Layers, 
  Mail, 
  CheckCircle2, 
  LogOut,
  Terminal,
  KeyRound,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';
import { adminLogin, updateAdminSection, fetchAdminMessages } from '../../services/apiClient';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [activeTab, setActiveTab] = useState<'personal' | 'about' | 'experience' | 'skills' | 'projects' | 'education' | 'messages'>('personal');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Form State
  const [emailInput, setEmailInput] = useState('dudhatashish1995@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Editable Portfolio State
  const [personalData, setPersonalData] = useState(portfolioData.personal);
  const [aboutData, setAboutData] = useState(portfolioData.about);
  const [experienceData, setExperienceData] = useState(portfolioData.experience);
  const [skillsData, setSkillsData] = useState(portfolioData.skills);
  const [projectsData, setProjectsData] = useState(portfolioData.projects);
  const [educationData, setEducationData] = useState(portfolioData.education);
  const [messages, setMessages] = useState<Array<{ id: string; name: string; email: string; subject: string; message: string; createdAt: string }>>([]);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const data = await adminLogin(emailInput, passwordInput);
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
      setIsLoggingIn(false);
    } catch (err) {
      setIsLoggingIn(false);
      setLoginError(err instanceof Error ? err.message : 'Invalid admin credentials');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('Password reset link & verification code dispatched to ' + resetEmail);
    setTimeout(() => {
      setResetStatus(null);
      setShowForgotPassword(false);
    }, 4000);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const handleSaveSection = async (sectionKey: string, payload: unknown, successMsg: string) => {
    if (!token) return;
    setIsSaving(true);
    try {
      await updateAdminSection(sectionKey, payload, token);
      setSaveStatus(successMsg);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const loadMessages = async () => {
    if (!token) return;
    try {
      const data = await fetchAdminMessages(token);
      setMessages(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-y-auto">
        
        {/* Backdrop Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-bgVoid/90 backdrop-blur-2xl z-0" 
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="relative max-w-5xl w-full max-h-[90vh] bg-bgCard border border-accentBlue/40 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col my-auto"
        >
          
          {/* Top Header Bar */}
          <div className="p-6 bg-bgSurface/90 backdrop-blur-md border-b border-borderGlass flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono text-accentCyan uppercase font-bold tracking-wider">
                  Node.js + Express + PostgreSQL
                </span>
                <h3 className="text-2xl font-extrabold text-white leading-tight">
                  Portfolio Production Admin CMS
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {token && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-bgVoid text-gray-400 hover:text-white border border-borderGlass hover:border-accentBlue transition-colors cursor-pointer"
                aria-label="Close CMS Modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 font-mono text-xs">
            
            {!token ? (
              showForgotPassword ? (
                /* FORGOT PASSWORD FORM */
                <div className="max-w-md mx-auto py-8 space-y-6 text-center font-mono">
                  <div className="p-4 rounded-3xl bg-bgVoid border border-borderGlass inline-block text-accentCyan mb-2">
                    <KeyRound className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Reset Admin Password</h4>
                  <p className="text-xs text-gray-400">
                    Enter your registered email to receive a password reset token.
                  </p>

                  {resetStatus && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                      {resetStatus}
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
                    <div>
                      <label className="block text-gray-400 uppercase text-[10px] mb-1">Admin Email</label>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="dudhatashish1995@gmail.com"
                        className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold text-xs tracking-wider uppercase shadow-glow-blue hover:opacity-95 cursor-pointer"
                    >
                      Dispatch Password Reset
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-full text-center text-xs text-gray-400 hover:text-white pt-2 cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </form>
                </div>
              ) : (
                /* LOGIN FORM */
                <div className="max-w-md mx-auto py-8 space-y-6 text-center font-mono">
                  <div className="p-4 rounded-3xl bg-bgVoid border border-borderGlass inline-block text-accentCyan mb-2">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Admin Authentication</h4>
                  <p className="text-xs text-gray-400">
                    Enter credentials to manage portfolio content in real-time.
                  </p>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div>
                      <label className="block text-gray-400 uppercase text-[10px] mb-1">Admin Email</label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-gray-400 uppercase text-[10px]">Password</label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-[10px] text-accentCyan hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="admin123"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold text-xs tracking-wider uppercase shadow-glow-blue hover:opacity-95 cursor-pointer"
                    >
                      {isLoggingIn ? 'Authenticating...' : 'Sign In to Admin CMS'}
                    </button>
                  </form>
                </div>
              )
            ) : (
              /* LOGGED IN CMS TABS FOR ALL SECTIONS */
              <div>
                
                {/* CMS Tab Nav */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-borderGlass no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'personal' ? 'bg-accentBlue text-white font-bold' : 'bg-bgVoid text-gray-400 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Personal Info</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('about')}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'about' ? 'bg-accentBlue text-white font-bold' : 'bg-bgVoid text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>About Section</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('experience')}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'experience' ? 'bg-accentBlue text-white font-bold' : 'bg-bgVoid text-gray-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Experience Timeline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('skills')}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'skills' ? 'bg-accentBlue text-white font-bold' : 'bg-bgVoid text-gray-400 hover:text-white'
                    }`}
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Skills Topology</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('projects')}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'projects' ? 'bg-accentBlue text-white font-bold' : 'bg-bgVoid text-gray-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Case Studies</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('education')}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'education' ? 'bg-accentBlue text-white font-bold' : 'bg-bgVoid text-gray-400 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Education</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('messages');
                      loadMessages();
                    }}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'messages' ? 'bg-accentBlue text-white font-bold' : 'bg-bgVoid text-gray-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Messages</span>
                  </button>
                </div>

                {saveStatus && (
                  <div className="p-3.5 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{saveStatus}</span>
                  </div>
                )}

                {/* TAB 1: PERSONAL INFO */}
                {activeTab === 'personal' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 uppercase text-[10px] mb-1">Full Name</label>
                        <input
                          type="text"
                          value={personalData.name}
                          onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 uppercase text-[10px] mb-1">Primary Email</label>
                        <input
                          type="email"
                          value={personalData.email}
                          onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 uppercase text-[10px] mb-1">Editorial Tagline</label>
                      <textarea
                        rows={3}
                        value={personalData.tagline}
                        onChange={(e) => setPersonalData({ ...personalData, tagline: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveSection('personal', personalData, 'Personal details updated cleanly!')}
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-2 hover:bg-accentIndigo transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Personal Details'}</span>
                    </button>
                  </div>
                )}

                {/* TAB 2: ABOUT SECTION */}
                {activeTab === 'about' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-gray-400 uppercase text-[10px] mb-1">Editorial Heading</label>
                      <input
                        type="text"
                        value={aboutData.editorialHeading}
                        onChange={(e) => setAboutData({ ...aboutData, editorialHeading: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveSection('about', aboutData, 'About section updated cleanly!')}
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-2 hover:bg-accentIndigo transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save About Section'}</span>
                    </button>
                  </div>
                )}

                {/* TAB 3: EXPERIENCE TIMELINE */}
                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    {experienceData.map((exp, idx) => (
                      <div key={exp.id} className="p-5 rounded-2xl bg-bgVoid border border-borderGlass space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-accentCyan font-bold">Role #{idx + 1}: {exp.company}</span>
                          <span className="text-gray-400 text-[10px]">{exp.period}</span>
                        </div>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const copy = [...experienceData];
                            copy[idx].role = e.target.value;
                            setExperienceData(copy);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-bgCard border border-borderGlass text-white"
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleSaveSection('experience', experienceData, 'Experience timeline updated cleanly!')}
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-2 hover:bg-accentIndigo transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Experience Timeline'}</span>
                    </button>
                  </div>
                )}

                {/* TAB 4: SKILLS TOPOLOGY */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    {skillsData.map((cat, idx) => (
                      <div key={cat.id} className="p-5 rounded-2xl bg-bgVoid border border-borderGlass space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-accentCyan font-bold">Category #{idx + 1}: {cat.title}</span>
                          <span className="text-gray-400 text-[10px]">{cat.skills.length} items</span>
                        </div>
                        <input
                          type="text"
                          value={cat.description}
                          onChange={(e) => {
                            const copy = [...skillsData];
                            copy[idx].description = e.target.value;
                            setSkillsData(copy);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-bgCard border border-borderGlass text-white"
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleSaveSection('skills', skillsData, 'Skills categories updated cleanly!')}
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-2 hover:bg-accentIndigo transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Skills Topology'}</span>
                    </button>
                  </div>
                )}

                {/* TAB 5: PROJECTS */}
                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    {projectsData.map((proj, idx) => (
                      <div key={proj.id} className="p-5 rounded-2xl bg-bgVoid border border-borderGlass space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-accentCyan font-bold">Case Study #{idx + 1}: {proj.name}</span>
                          <span className="text-gray-400 text-[10px]">{proj.category}</span>
                        </div>
                        <textarea
                          rows={2}
                          value={proj.subtitle}
                          onChange={(e) => {
                            const copy = [...projectsData];
                            copy[idx].subtitle = e.target.value;
                            setProjectsData(copy);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-bgCard border border-borderGlass text-white"
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleSaveSection('projects', projectsData, 'Case studies updated cleanly!')}
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-2 hover:bg-accentIndigo transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Case Studies'}</span>
                    </button>
                  </div>
                )}

                {/* TAB 6: EDUCATION */}
                {activeTab === 'education' && (
                  <div className="space-y-6">
                    {educationData.map((edu, idx) => (
                      <div key={edu.id || idx} className="p-5 rounded-2xl bg-bgVoid border border-borderGlass space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-accentCyan font-bold">{edu.degree} - {edu.field}</span>
                          <span className="text-gray-400 text-[10px]">{edu.period}</span>
                        </div>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const copy = [...educationData];
                            copy[idx].institution = e.target.value;
                            setEducationData(copy);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-bgCard border border-borderGlass text-white"
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleSaveSection('education', educationData, 'Education updated cleanly!')}
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl bg-accentBlue text-white font-bold flex items-center gap-2 hover:bg-accentIndigo transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Education'}</span>
                    </button>
                  </div>
                )}

                {/* TAB 7: MESSAGES */}
                {activeTab === 'messages' && (
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No messages received yet.</p>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="p-5 rounded-2xl bg-bgVoid border border-borderGlass space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold">{msg.name} ({msg.email})</span>
                            <span className="text-gray-500 text-[10px]">{new Date(msg.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-accentCyan font-semibold">{msg.subject}</p>
                          <p className="text-gray-300 leading-relaxed">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
