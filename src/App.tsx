import { useState, useEffect, useMemo } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link, 
  useNavigate,
  useParams
} from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  Plus, 
  LogOut, 
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Upload,
  Loader2,
  BrainCircuit,
  Filter,
  HelpCircle,
  Lightbulb,
  Edit2,
  Trash2,
  Sparkles,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  orderBy,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from './lib/firebase';
import { useAuth, AuthProvider } from './lib/AuthContext';
import { cn } from './lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { screenResume, generateJobDescription, generateHiringEmail } from './lib/gemini';
import { extractTextFromFile } from './lib/fileParser';

// --- Components ---

const HiringEmailModal = ({ data, onClose }: { data: any, onClose: () => void }) => {
  const [email, setEmail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const result = await generateHiringEmail(
          data.candidate.name,
          data.jobTitle,
          data.recruiterName,
          "AI Recruitment Corp" 
        );
        setEmail(result);
      } catch (error) {
        console.error(error);
        setError("Failed to generate email content.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmail();
  }, [data]);

  const handleSend = async () => {
    setIsSending(true);
    setError(null);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.candidate.email,
          subject: email.subject,
          body: email.body
        })
      });

      const result = await response.json();
      if (result.success) {
        setSent(true);
        if (result.simulated) {
          console.info("Email was simulated because SMTP is not configured.");
        }
        setTimeout(onClose, 2500);
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || "An unexpected error occurred while sending.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200"
      >
        {/* Header */}
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-200">
              <Mail className="w-7 h-7 text-zinc-100" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight italic">AI OFFER LETTER</h2>
              <p className="text-sm text-zinc-500 font-medium">Crafting a personalized welcome for {data.candidate.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-zinc-200/50 rounded-full transition-all group">
            <XCircle className="w-7 h-7 text-zinc-300 group-hover:text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-white">
          {loading ? (
            <div className="h-80 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-zinc-100 border-t-zinc-900 animate-spin" />
                <Sparkles className="w-8 h-8 text-zinc-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-bold text-zinc-900">AI is composing...</p>
                <p className="text-sm text-zinc-400 max-w-[250px]">Analyzing candidate profile and job requirements to draft the perfect offer.</p>
              </div>
            </div>
          ) : sent ? (
            <div className="h-80 flex flex-col items-center justify-center space-y-6 text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center border-4 border-green-100"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-zinc-900">OFFER SENT!</h3>
                <p className="text-zinc-500 font-medium">The official offer letter has been dispatched to<br/><span className="text-zinc-900 font-bold underline decoration-zinc-200">{data.candidate.email}</span></p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                  <XCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">Recipient</label>
                  <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px]">{data.candidate.name.charAt(0)}</div>
                    {data.candidate.name} ({data.candidate.email})
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">Sender</label>
                  <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-100">{data.recruiterName.charAt(0)}</div>
                    {data.recruiterName} (Recruiter)
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">Subject Line</label>
                <input 
                  type="text"
                  value={email?.subject}
                  onChange={(e) => setEmail({...email, subject: e.target.value})}
                  className="w-full p-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-base font-bold text-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">Email Content</label>
                <div className="relative group">
                  <textarea 
                    value={email?.body}
                    onChange={(e) => setEmail({...email, body: e.target.value})}
                    className="w-full h-[400px] p-8 bg-zinc-50 border border-zinc-100 rounded-3xl text-base text-zinc-700 leading-relaxed focus:ring-4 focus:ring-zinc-900/5 outline-none resize-none transition-all font-serif"
                  />
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-zinc-400 bg-white px-2 py-1 rounded-md border border-zinc-100">AI Generated Draft</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !sent && (
          <div className="p-8 border-t border-zinc-100 bg-zinc-50/80 flex gap-4 sticky bottom-0 z-10">
            <button 
              onClick={onClose}
              className="px-8 py-4 text-zinc-500 font-black uppercase tracking-widest text-xs hover:text-zinc-900 transition-colors"
            >
              Discard
            </button>
            <div className="flex-1" />
            <button 
              onClick={handleSend}
              disabled={isSending}
              className="px-10 py-4 bg-zinc-900 text-zinc-100 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-200 disabled:opacity-50 active:scale-95"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
              {isSending ? 'Sending...' : 'Send Official Offer'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Sidebar = () => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Users, label: 'Candidates', path: '/candidates' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  ];

  return (
    <div className="w-64 bg-zinc-950 text-zinc-400 h-screen flex flex-col border-r border-zinc-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-zinc-950" />
        </div>
        <span className="text-zinc-100 font-semibold tracking-tight">ResumeScreen</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-900 hover:text-zinc-100 transition-colors group"
          >
            <item.icon className="w-4 h-4 group-hover:text-zinc-100" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-100">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-100 truncate">{profile?.name}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{profile?.role}</p>
          </div>
        </div>
        <button 
          onClick={() => logout().then(() => navigate('/login'))}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-900 hover:text-zinc-100 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Header = ({ title, actions }: { title: string; actions?: React.ReactNode }) => (
  <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-8">
    <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
    <div className="flex items-center gap-4">
      {actions}
    </div>
  </header>
);

// --- Pages ---

const Login = () => {
  const { signIn, user, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (user) return <Navigate to="/" />;

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl p-8 bg-white border border-zinc-200 rounded-2xl shadow-sm text-center grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div className="md:border-r border-zinc-100 pr-0 md:pr-8 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center mb-6">
            <BrainCircuit className="w-7 h-7 text-zinc-100" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Recruiter Login</h2>
          <p className="text-zinc-500 mb-8 text-sm">Manage your recruitment pipeline and screen candidates with AI.</p>
          
          <button 
            onClick={() => signIn('recruiter')}
            className="w-full flex items-center justify-center gap-3 bg-zinc-950 text-zinc-100 py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 brightness-200" alt="Google" />
            Recruiter Sign In
          </button>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-6">
            <Users className="w-7 h-7 text-zinc-950" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Candidate Login</h2>
          <p className="text-zinc-500 mb-8 text-sm">Upload your resume and track your application status.</p>
          
          <button 
            onClick={() => signIn('candidate')}
            className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 py-3 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Candidate Sign In
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ jobs: 0, candidates: 0, screening: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number>>({
    applied: 0,
    screening: 0,
    shortlisted: 0,
    interview: 0,
    hired: 0,
    onboarding: 0
  });
  const [jobMap, setJobMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const qJobs = query(collection(db, 'jobs'));
    const qCands = query(collection(db, 'candidates'), orderBy('appliedAt', 'desc'));
    
    const unsubJobs = onSnapshot(qJobs, (s) => {
      setStats(prev => ({ ...prev, jobs: s.size }));
      const mapping: Record<string, string> = {};
      s.docs.forEach(d => mapping[d.id] = d.data().title);
      setJobMap(mapping);
      
      // Seed default jobs if empty (Recruiter/Admin side only)
      if (s.empty) {
        const defaultJobs = [
          { title: 'Senior Frontend Engineer', description: 'Expert in React, TypeScript, and modern CSS.', requirements: ['5+ years React', 'TypeScript mastery'], status: 'open', createdAt: Timestamp.now() },
          { title: 'Product Designer', description: 'Create beautiful and intuitive user experiences.', requirements: ['Figma expert', 'UI/UX focus'], status: 'open', createdAt: Timestamp.now() },
          { title: 'Backend Developer', description: 'Scale our infrastructure with Node.js and Cloud.', requirements: ['Node.js', 'NoSQL databases'], status: 'open', createdAt: Timestamp.now() }
        ];
        defaultJobs.forEach(job => addDoc(collection(db, 'jobs'), job));
      }
    });

    const unsubCands = onSnapshot(qCands, (s) => {
      const allCands = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecentApps(allCands.slice(0, 5));
      
      const pipe = {
        applied: 0,
        screening: 0,
        shortlisted: 0,
        interview: 0,
        hired: 0,
        onboarding: 0
      };
      
      allCands.forEach((c: any) => {
        const status = c.status?.toLowerCase();
        if (status in pipe) {
          pipe[status as keyof typeof pipe]++;
        }
      });
      
      setPipeline(pipe);
      setStats(prev => ({ 
        ...prev, 
        candidates: s.size,
        screening: pipe.screening
      }));
    });

    return () => { unsubJobs(); unsubCands(); };
  }, []);

  const pipelineSteps = [
    { key: 'applied', label: 'Applied' },
    { key: 'screening', label: 'Screening' },
    { key: 'shortlisted', label: 'Shortlist' },
    { key: 'interview', label: 'Interview' },
    { key: 'hired', label: 'Hired' },
    { key: 'onboarding', label: 'Onboarding' }
  ];

  const maxPipe = Math.max(...Object.values(pipeline), 1);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-full overflow-x-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { label: 'Active Jobs', value: stats.jobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Candidates', value: stats.candidates, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Currently Screening', value: stats.screening, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white border border-zinc-200 rounded-2xl flex items-center gap-4 shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-x-auto pb-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px] min-w-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              Recent Applications
            </h3>
            <button 
              onClick={() => navigate('/candidates')}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 space-y-4">
            {recentApps.length > 0 ? (
              recentApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors border border-transparent hover:border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 font-bold text-xs">
                      {app.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{app.name}</p>
                      <p className="text-xs text-zinc-500 truncate max-w-[150px]">{jobMap[app.jobId] || 'Unknown Position'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      app.status === 'hired' ? "bg-green-50 text-green-600" :
                      app.status === 'onboarding' ? "bg-blue-50 text-blue-600" :
                      app.status === 'rejected' ? "bg-red-50 text-red-600" :
                      "bg-zinc-100 text-zinc-500"
                    )}>
                      {app.status}
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {app.appliedAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Users className="w-8 h-8 text-zinc-200 mb-2" />
                <p className="text-sm text-zinc-400">No recent applications found.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px] min-w-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              Hiring Pipeline
            </h3>
            <button 
              onClick={() => navigate('/candidates')}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
            >
              Manage <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="h-64 flex items-end justify-between gap-4 px-4 pb-4 min-w-[450px]">
              {pipelineSteps.map((step, i) => {
                const count = pipeline[step.key as keyof typeof pipeline] || 0;
                const height = (count / maxPipe) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-xs font-bold text-zinc-900 mb-1">{count}</div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      className="w-full bg-zinc-900 rounded-t-lg relative group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    </motion.div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 text-center whitespace-nowrap">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Jobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStep, setAiStep] = useState<'initial' | 'generating' | 'review'>('initial');
  const [tempJob, setTempJob] = useState({ 
    title: '', 
    experience: 'fresher', 
    mode: 'remote', 
    context: '', 
    description: '', 
    requirements: '',
    idealCandidate: '',
    suggestedQuestions: ''
  });
  const { profile } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (s) => setJobs(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const handleGenerateAI = async (isRefining = false) => {
    if (!tempJob.title) return;
    setIsGenerating(true);
    setAiStep('generating');
    try {
      const context = isRefining 
        ? `Current Description: ${tempJob.description}\nCurrent Requirements: ${tempJob.requirements}\nRefinement Instructions: ${tempJob.context}`
        : tempJob.context;
        
      const result = await generateJobDescription(tempJob.title, tempJob.experience, context);
      setTempJob(prev => ({
        ...prev,
        description: result.description,
        requirements: result.skills.join('\n'),
        idealCandidate: result.idealCandidate,
        suggestedQuestions: result.suggestedQuestions.join('\n'),
        context: '' // Clear context after use
      }));
      setAiStep('review');
    } catch (error) {
      console.error(error);
      setAiStep('initial');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jobData = {
      title: formData.get('title'),
      mode: formData.get('mode'),
      description: formData.get('description'),
      requirements: (formData.get('requirements') as string).split('\n').filter(r => r.trim()),
      idealCandidate: formData.get('idealCandidate'),
      suggestedQuestions: (formData.get('suggestedQuestions') as string).split('\n').filter(q => q.trim()),
      status: 'open',
      updatedAt: Timestamp.now(),
    };

    if (editingJob) {
      await updateDoc(doc(db, 'jobs', editingJob.id), jobData);
    } else {
      await addDoc(collection(db, 'jobs'), {
        ...jobData,
        createdAt: Timestamp.now(),
        createdBy: profile?.email
      });
    }

    setShowAdd(false);
    setEditingJob(null);
    setAiStep('initial');
    setTempJob({ 
      title: '', 
      experience: 'fresher', 
      mode: 'remote', 
      context: '', 
      description: '', 
      requirements: '',
      idealCandidate: '',
      suggestedQuestions: ''
    });
  };

  const handleDeleteJob = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      await deleteDoc(doc(db, 'jobs', id));
    }
  };

  const startEdit = (job: any) => {
    setEditingJob(job);
    setTempJob({
      title: job.title,
      experience: '1-5+ years', // Default for edit
      mode: job.mode || 'remote',
      context: '',
      description: job.description,
      requirements: job.requirements.join('\n'),
      idealCandidate: job.idealCandidate || '',
      suggestedQuestions: (job.suggestedQuestions || []).join('\n')
    });
    setAiStep('review');
    setShowAdd(true);
  };

  return (
    <div className="p-8">
      <Header 
        title="Job Postings" 
        actions={
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-zinc-900 text-zinc-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI-Powered Posting
          </button>
        } 
      />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <motion.div 
            layoutId={job.id}
            key={job.id}
            onClick={() => startEdit(job)}
            className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
                <Briefcase className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); startEdit(job); }}
                  className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }}
                  className="p-1.5 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  job.status === 'open' ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-500"
                )}>
                  {job.status}
                </span>
              </div>
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">{job.title}</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md">
                {job.mode || 'Remote'}
              </span>
            </div>
            <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{job.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              <span className="text-xs text-zinc-400">
                {job.createdAt?.toDate().toLocaleDateString()}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold">{editingJob ? 'Edit Job Posting' : 'Post New Job'}</h2>
                <button onClick={() => { setShowAdd(false); setEditingJob(null); }} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <XCircle className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-4">

                {aiStep === 'initial' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Job Title</label>
                        <input 
                          value={tempJob.title}
                          onChange={(e) => setTempJob(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none" 
                          placeholder="e.g. Senior Frontend Engineer" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Experience Level</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => setTempJob(prev => ({ ...prev, experience: 'fresher' }))}
                            className={cn(
                              "py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                              tempJob.experience === 'fresher' ? "bg-zinc-900 text-zinc-100 border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                            )}
                          >
                            Fresher
                          </button>
                          <button 
                            onClick={() => setTempJob(prev => ({ ...prev, experience: '1-5+ years' }))}
                            className={cn(
                              "py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                              tempJob.experience === '1-5+ years' ? "bg-zinc-900 text-zinc-100 border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                            )}
                          >
                            1-5+ Years
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Job Mode</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Remote', 'Hybrid', 'Offline'].map((m) => (
                            <button 
                              key={m}
                              onClick={() => setTempJob(prev => ({ ...prev, mode: m.toLowerCase() }))}
                              className={cn(
                                "py-2 px-4 rounded-lg border text-sm font-medium transition-all",
                                tempJob.mode === m.toLowerCase() ? "bg-zinc-900 text-zinc-100 border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                              )}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Additional Context (Optional)</label>
                        <textarea 
                          value={tempJob.context}
                          onChange={(e) => setTempJob(prev => ({ ...prev, context: e.target.value }))}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none text-sm" 
                          placeholder="e.g. Focus on React/Next.js, fast-paced startup environment, remote-first culture..." 
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="sticky bottom-0 bg-white border-t border-zinc-100 pt-4 -mx-8 px-8 pb-2 mt-6">
                      <button 
                        onClick={() => handleGenerateAI(false)}
                        disabled={!tempJob.title || isGenerating}
                        className="w-full bg-zinc-900 text-zinc-100 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                        Generate Description with AI
                      </button>
                    </div>
                  </div>
                )}

                {aiStep === 'generating' && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
                      <BrainCircuit className="w-6 h-6 text-zinc-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">AI is crafting your job posting...</h3>
                      <p className="text-sm text-zinc-500">Tailoring description and skills for {tempJob.experience} level.</p>
                    </div>
                  </div>
                )}

                {aiStep === 'review' && (
                  <form onSubmit={handleAddJob} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Job Title</label>
                        <input 
                          name="title" 
                          required 
                          defaultValue={tempJob.title}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Job Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['remote', 'hybrid', 'offline'].map((m) => (
                            <label key={m} className="flex flex-col items-center gap-1 p-2 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50">
                              <input 
                                type="radio" 
                                name="mode" 
                                value={m} 
                                defaultChecked={tempJob.mode === m}
                                className="hidden" 
                              />
                              <span className="text-[10px] font-bold uppercase">{m}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Description</label>
                        <textarea 
                          name="description" 
                          required 
                          rows={6} 
                          defaultValue={tempJob.description}
                          onChange={(e) => setTempJob(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Requirements (one per line)</label>
                        <textarea 
                          name="requirements" 
                          required 
                          rows={4} 
                          value={tempJob.requirements}
                          onChange={(e) => setTempJob(prev => ({ ...prev, requirements: e.target.value }))}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Ideal Candidate Profile</label>
                        <textarea 
                          name="idealCandidate" 
                          required 
                          rows={3} 
                          value={tempJob.idealCandidate}
                          onChange={(e) => setTempJob(prev => ({ ...prev, idealCandidate: e.target.value }))}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none text-sm" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Suggested Interview Questions (one per line)</label>
                        <textarea 
                          name="suggestedQuestions" 
                          required 
                          rows={4} 
                          value={tempJob.suggestedQuestions}
                          onChange={(e) => setTempJob(prev => ({ ...prev, suggestedQuestions: e.target.value }))}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none text-sm" 
                        />
                      </div>
                      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase text-zinc-500">Refine with AI</label>
                          <Sparkles className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="flex gap-2">
                          <input 
                            value={tempJob.context}
                            onChange={(e) => setTempJob(prev => ({ ...prev, context: e.target.value }))}
                            placeholder="e.g. Make it more professional, add more focus on leadership..."
                            className="flex-1 px-3 py-1.5 text-xs border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900"
                          />
                          <button 
                            type="button"
                            onClick={() => handleGenerateAI(true)}
                            disabled={isGenerating || !tempJob.context}
                            className="bg-zinc-900 text-zinc-100 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-zinc-800 disabled:opacity-50"
                          >
                            Refine
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-6 sticky bottom-0 bg-white border-t border-zinc-100 mt-6 -mx-8 px-8 pb-2">
                      <button type="submit" className="flex-1 bg-zinc-900 text-zinc-100 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all">
                        {editingJob ? 'Update Posting' : 'Create Posting'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => editingJob ? setShowAdd(false) : setAiStep('initial')} 
                        className="flex-1 bg-zinc-100 text-zinc-900 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all"
                      >
                        {editingJob ? 'Cancel' : 'Back'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Candidates = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [screening, setScreening] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [hiringEmailData, setHiringEmailData] = useState<any | null>(null);
  const { profile } = useAuth();

  // Filter and Sort State
  const [filterJob, setFilterJob] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMinScore, setFilterMinScore] = useState<number | ''>('');
  const [filterName, setFilterName] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortField, setSortField] = useState<'appliedAt' | 'score' | 'name'>('appliedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const unsubCands = onSnapshot(query(collection(db, 'candidates'), orderBy('appliedAt', 'desc')), (s) => 
      setCandidates(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (s) => 
      setJobs(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubCands(); unsubJobs(); };
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter(cand => {
        const matchesJob = !filterJob || cand.jobId === filterJob;
        const matchesStatus = !filterStatus || cand.status === filterStatus;
        const matchesMode = !filterMode || cand.jobMode === filterMode;
        const matchesScore = filterMinScore === '' || (cand.score !== undefined && cand.score >= filterMinScore);
        const matchesName = !filterName || cand.name.toLowerCase().includes(filterName.toLowerCase());
        
        let matchesDate = true;
        if (filterStartDate || filterEndDate) {
          const appliedDate = cand.appliedAt?.toDate();
          if (appliedDate) {
            if (filterStartDate) {
              const start = new Date(filterStartDate);
              start.setHours(0, 0, 0, 0);
              if (appliedDate < start) matchesDate = false;
            }
            if (filterEndDate) {
              const end = new Date(filterEndDate);
              end.setHours(23, 59, 59, 999);
              if (appliedDate > end) matchesDate = false;
            }
          } else {
            matchesDate = false;
          }
        }

        return matchesJob && matchesStatus && matchesMode && matchesScore && matchesName && matchesDate;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Handle timestamps
        if (sortField === 'appliedAt') {
          valA = a.appliedAt?.toMillis() || 0;
          valB = b.appliedAt?.toMillis() || 0;
        }

        // Handle undefined scores
        if (sortField === 'score') {
          valA = a.score ?? -1;
          valB = b.score ?? -1;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [candidates, filterJob, filterStatus, filterMinScore, sortField, sortDirection]);

  const toggleSort = (field: 'appliedAt' | 'score' | 'name') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleUpdateStatus = async (candidateId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'candidates', candidateId), { status: newStatus });
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate({ ...selectedCandidate, status: newStatus });
      }

      // Trigger AI Email if hired
      if (newStatus === 'hired') {
        const candidate = candidates.find(c => c.id === candidateId) || selectedCandidate;
        if (candidate) {
          const job = jobs.find(j => j.id === candidate.jobId);
          setHiringEmailData({
            candidate,
            jobTitle: job?.title || 'the position',
            recruiterName: profile?.name || 'Recruiter'
          });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleScreen = async (candidate: any) => {
    setScreening(candidate.id);
    try {
      const job = jobs.find(j => j.id === candidate.jobId);
      if (!job) return;

      const result = await screenResume(candidate.resumeText, job.description);
      
      const updatedData = {
        score: result.score,
        summary: result.summary,
        analysis: result.analysis,
        keyStrengths: result.keyStrengths || [],
        gaps: result.gaps || [],
        improvementSuggestions: result.improvementSuggestions || [],
        interviewQuestions: result.interviewQuestions || [],
        status: result.score > 70 ? 'shortlisted' : 'rejected'
      };

      await updateDoc(doc(db, 'candidates', candidate.id), updatedData);
      
      // Update selected candidate if modal is open
      if (selectedCandidate?.id === candidate.id) {
        setSelectedCandidate({ ...selectedCandidate, ...updatedData });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setScreening(null);
    }
  };

  return (
    <div className="p-8">
      <Header title="Candidate Pipeline" />

      {/* Filter Bar */}
      <div className="mt-8 flex flex-wrap items-center gap-4 bg-white p-4 border border-zinc-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-bold uppercase text-zinc-500">Filters:</span>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-1.5 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
          />
        </div>
        
        <select 
          value={filterJob}
          onChange={(e) => setFilterJob(e.target.value)}
          className="text-sm border border-zinc-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-zinc-900 bg-white min-w-[150px]"
        >
          <option value="">All Job Roles</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>

        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-zinc-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="screening">Screening</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="hired">Hired</option>
          <option value="onboarding">Onboarding</option>
          <option value="rejected">Rejected</option>
        </select>

        <select 
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          className="text-sm border border-zinc-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
        >
          <option value="">All Modes</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="offline">Offline</option>
        </select>

        <div className="flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-1.5 bg-white">
          <span className="text-xs font-medium text-zinc-500 whitespace-nowrap">Min Score:</span>
          <input 
            type="number" 
            min="0" 
            max="100"
            value={filterMinScore}
            onChange={(e) => setFilterMinScore(e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-12 text-sm outline-none"
            placeholder="0"
          />
        </div>

        <div className="flex items-center gap-2 border border-zinc-200 rounded-lg px-3 py-1.5 bg-white">
          <span className="text-xs font-medium text-zinc-500 whitespace-nowrap">From:</span>
          <input 
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="text-sm outline-none bg-transparent"
          />
          <span className="text-xs font-medium text-zinc-500 whitespace-nowrap ml-2">To:</span>
          <input 
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="text-sm outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-bold uppercase text-zinc-500">Sort By:</span>
          <button 
            onClick={() => toggleSort('appliedAt')}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1",
              sortField === 'appliedAt' ? "bg-zinc-900 text-zinc-100 border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            )}
          >
            Date {sortField === 'appliedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => toggleSort('score')}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1",
              sortField === 'score' ? "bg-zinc-900 text-zinc-100 border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            )}
          >
            AI Match {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            onClick={() => toggleSort('name')}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1",
              sortField === 'name' ? "bg-zinc-900 text-zinc-100 border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            )}
          >
            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
      
      <div className="mt-4 bg-white border border-zinc-200 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 whitespace-nowrap">Candidate</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 whitespace-nowrap">Job Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 whitespace-nowrap">Mode</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 whitespace-nowrap">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 text-center whitespace-nowrap bg-zinc-100/50">AI Match</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredCandidates.map((cand) => (
              <tr key={cand.id} className="hover:bg-zinc-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{cand.name}</p>
                      <p className="text-xs text-zinc-500">{cand.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-zinc-600">
                    {jobs.find(j => j.id === cand.jobId)?.title || 'Unknown Job'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-bold uppercase px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-md">
                    {cand.jobMode || 'Remote'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={cand.status}
                    onChange={(e) => handleUpdateStatus(cand.id, e.target.value)}
                    className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none cursor-pointer appearance-none",
                      cand.status === 'hired' ? "bg-green-50 text-green-600" :
                      cand.status === 'onboarding' ? "bg-blue-50 text-blue-600" :
                      cand.status === 'interview' ? "bg-purple-50 text-purple-600" :
                      cand.status === 'shortlisted' ? "bg-green-50/50 text-green-700" :
                      cand.status === 'rejected' ? "bg-red-50 text-red-600" :
                      cand.status === 'screening' ? "bg-amber-50 text-amber-600" :
                      "bg-zinc-100 text-zinc-500"
                    )}
                  >
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interview</option>
                    <option value="hired">Hired</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center bg-zinc-50/30">
                  <div className="flex flex-col items-center gap-1">
                    {cand.score !== undefined ? (
                      <div className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold",
                        cand.score >= 80 ? "border-green-500 text-green-600 bg-green-50" :
                        cand.score >= 60 ? "border-amber-500 text-amber-600 bg-amber-50" :
                        "border-red-500 text-red-600 bg-red-50"
                      )}>
                        {cand.score}%
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-300">—</span>
                    )}
                    <button 
                      onClick={() => setSelectedCandidate(cand)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-900 underline"
                    >
                      View Details
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleScreen(cand)}
                      disabled={screening === cand.id}
                      title="Run AI Screening"
                      className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors disabled:opacity-50"
                    >
                      {screening === cand.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {candidates.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
            <p className="text-zinc-500">No candidates in the pipeline yet.</p>
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-100 font-bold text-xl">
                    {selectedCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">{selectedCandidate.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-zinc-500">{selectedCandidate.email} • {jobs.find(j => j.id === selectedCandidate.jobId)?.title}</p>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded-md">
                        {selectedCandidate.jobMode || 'Remote'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const job = jobs.find(j => j.id === selectedCandidate.jobId);
                      setHiringEmailData({
                        candidate: selectedCandidate,
                        jobTitle: job?.title || 'the position',
                        recruiterName: profile?.name || 'Recruiter'
                      });
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-zinc-100 text-xs font-bold rounded-lg hover:bg-zinc-800 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Send Offer Email
                  </button>
                  <select
                    value={selectedCandidate.status}
                    onChange={(e) => handleUpdateStatus(selectedCandidate.id, e.target.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider outline-none border transition-all cursor-pointer",
                      selectedCandidate.status === 'hired' ? "bg-green-50 text-green-600 border-green-200" :
                      selectedCandidate.status === 'onboarding' ? "bg-blue-50 text-blue-600 border-blue-200" :
                      selectedCandidate.status === 'interview' ? "bg-purple-50 text-purple-600 border-purple-200" :
                      selectedCandidate.status === 'shortlisted' ? "bg-green-50/50 text-green-700 border-green-100" :
                      selectedCandidate.status === 'rejected' ? "bg-red-50 text-red-600 border-red-200" :
                      selectedCandidate.status === 'screening' ? "bg-amber-50 text-amber-600 border-amber-200" :
                      "bg-zinc-100 text-zinc-500 border-zinc-200"
                    )}
                  >
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview">Interview</option>
                    <option value="hired">Hired</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {selectedCandidate.score !== undefined && (
                    <div className={cn(
                      "px-4 py-2 rounded-xl border-2 flex items-center gap-2 font-bold",
                      selectedCandidate.score >= 80 ? "border-green-500 text-green-600 bg-green-50" :
                      selectedCandidate.score >= 60 ? "border-amber-500 text-amber-600 bg-amber-50" :
                      "border-red-500 text-red-600 bg-red-50"
                    )}>
                      <BrainCircuit className="w-5 h-5" />
                      {selectedCandidate.score}% Match
                    </div>
                  )}
                  <button 
                    onClick={() => setSelectedCandidate(null)}
                    className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-zinc-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex">
                {/* Resume View */}
                <div className="flex-1 border-r border-zinc-100 flex flex-col">
                  <div className="p-4 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Uploaded Resume Content
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/30">
                    <div className="bg-white p-10 shadow-sm border border-zinc-200 rounded-lg min-h-full font-serif text-zinc-800 leading-relaxed whitespace-pre-wrap">
                      {selectedCandidate.resumeText}
                    </div>
                  </div>
                </div>

                {/* AI Analysis View */}
                <div className="w-[400px] flex flex-col bg-white">
                  <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" />
                      AI Analysis
                    </h3>
                    {!selectedCandidate.score && (
                      <button 
                        onClick={() => handleScreen(selectedCandidate)}
                        disabled={screening === selectedCandidate.id}
                        className="text-xs bg-zinc-900 text-zinc-100 px-3 py-1 rounded-md font-medium hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2"
                      >
                        {screening === selectedCandidate.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Run AI Screen'}
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {selectedCandidate.score !== undefined ? (
                      <>
                        {selectedCandidate.summary && (
                          <div className="p-4 bg-zinc-900 text-zinc-100 rounded-xl shadow-lg border border-zinc-800">
                            <p className="text-sm font-medium leading-relaxed">
                              {selectedCandidate.summary}
                            </p>
                          </div>
                        )}

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase text-zinc-400">Match Summary</h4>
                          <p className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-100 italic">
                            "{selectedCandidate.analysis}"
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase text-zinc-400">Key Strengths</h4>
                          <div className="space-y-2">
                            {selectedCandidate.keyStrengths?.map((s: string, i: number) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-green-50/50 border border-green-100 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-zinc-700">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase text-zinc-400">Identified Gaps</h4>
                          <div className="space-y-2">
                            {selectedCandidate.gaps?.map((g: string, i: number) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-red-50/50 border border-red-100 rounded-lg">
                                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <span className="text-sm text-zinc-700">{g}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase text-zinc-400">Improvement Suggestions</h4>
                          <div className="space-y-2">
                            {selectedCandidate.improvementSuggestions?.map((s: string, i: number) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-zinc-700">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase text-zinc-400">Suggested Interview Questions</h4>
                          <div className="space-y-2">
                            {selectedCandidate.interviewQuestions?.map((q: string, i: number) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                                <HelpCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-zinc-700">{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <BrainCircuit className="w-12 h-12 text-zinc-200" />
                        <p className="text-sm text-zinc-500">No analysis available yet.<br/>Click "Run AI Screen" to analyze this resume.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {hiringEmailData && (
        <HiringEmailModal 
          data={hiringEmailData} 
          onClose={() => setHiringEmailData(null)} 
        />
      )}
    </div>
  );
};

const CandidatePortal = () => {
  const { user, profile, logout } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [viewingJob, setViewingJob] = useState<any | null>(null);

  useEffect(() => {
    const unsubJobs = onSnapshot(query(collection(db, 'jobs'), orderBy('title', 'asc')), (s) => {
      const jobsData = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setJobs(jobsData);
    });
    const unsubApps = onSnapshot(query(collection(db, 'candidates'), where('email', '==', user?.email)), (s) => 
      setApplications(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubJobs(); unsubApps(); };
  }, [user]);

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('resume') as File;
    const jobId = formData.get('jobId') as string;
    const jobMode = formData.get('jobMode') as string;
    
    if (!file || file.size === 0 || !jobId) return;

    setIsUploading(true);
    try {
      const text = await extractTextFromFile(file);
      
      await addDoc(collection(db, 'candidates'), {
        name: user?.displayName || profile?.name,
        email: user?.email,
        jobId: jobId,
        jobMode: jobMode,
        resumeText: text,
        status: 'applied',
        appliedAt: Timestamp.now()
      });
      
      setSuccess(true);
      setSelectedJobId('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error(error);
      alert('Failed to upload resume.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Career Portal</h1>
          <p className="text-zinc-500 mt-1">Find your next role and join our mission.</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-zinc-400" />
              Open Positions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => (
                <div 
                  key={job.id} 
                  className={cn(
                    "p-6 border rounded-2xl transition-all cursor-pointer group",
                    selectedJobId === job.id ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200 bg-white hover:border-zinc-400"
                  )}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <h3 className="font-bold text-zinc-900 group-hover:text-zinc-950">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-md">
                      {job.mode || 'Remote'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{job.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Full Time</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setViewingJob(job); }}
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-900 underline"
                      >
                        Details
                      </button>
                      <span className="text-xs font-medium text-zinc-900 flex items-center gap-1">
                        Apply Now <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-400" />
              Your Applications
            </h2>
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app.id} className="p-4 bg-white border border-zinc-100 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-semibold text-zinc-900">{jobs.find(j => j.id === app.jobId)?.title || 'Position'}</p>
                    <p className="text-xs text-zinc-400">Applied on {app.appliedAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    app.status === 'shortlisted' ? "bg-green-50 text-green-600" :
                    app.status === 'rejected' ? "bg-red-50 text-red-600" :
                    "bg-zinc-100 text-zinc-500"
                  )}>
                    {app.status}
                  </span>
                </div>
              ))}
              {applications.length === 0 && (
                <div className="text-center py-12 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                  <p className="text-sm text-zinc-400">You haven't applied for any roles yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-zinc-400" />
              Quick Apply
            </h2>
            
            <form onSubmit={handleApply} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Select Position</label>
                <select 
                  name="jobId" 
                  required 
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none bg-white text-sm"
                >
                  <option value="">Choose a role...</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Job Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Remote', 'Hybrid', 'Offline'].map((mode) => (
                    <label key={mode} className="flex flex-col items-center gap-1 p-2 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50">
                      <input 
                        type="radio" 
                        name="jobMode" 
                        value={mode.toLowerCase()} 
                        defaultChecked={mode === 'Remote'}
                        className="hidden" 
                      />
                      <span className="text-[10px] font-bold uppercase">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Resume (PDF, DOCX)</label>
                <div className="relative border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:border-zinc-400 transition-colors group bg-zinc-50/50">
                  <input 
                    type="file" 
                    name="resume" 
                    accept=".pdf,.docx,.txt" 
                    required 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-zinc-300 mx-auto mb-2 group-hover:text-zinc-900 transition-colors" />
                  <p className="text-xs text-zinc-500 font-medium">Click to upload resume</p>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUploading || !selectedJobId}
                className="w-full bg-zinc-900 text-zinc-100 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
              </button>
              {success && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-green-600 font-bold text-center flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Application submitted!
                </motion.p>
              )}
            </form>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {viewingJob && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">{viewingJob.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded-md">
                      {viewingJob.mode || 'Remote'}
                    </span>
                    <span className="text-xs text-zinc-400">Full Time</span>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingJob(null)}
                  className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase text-zinc-400">Job Description</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
                    {viewingJob.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase text-zinc-400">Key Requirements</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {viewingJob.requirements?.map((req: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {viewingJob.idealCandidate && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase text-zinc-400">Ideal Candidate</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 italic">
                      "{viewingJob.idealCandidate}"
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-zinc-100">
                  <button 
                    onClick={() => { setSelectedJobId(viewingJob.id); setViewingJob(null); }}
                    className="w-full bg-zinc-900 text-zinc-100 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Apply for this Position
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Analytics = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (s) => {
      setJobs(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubCands = onSnapshot(collection(db, 'candidates'), (s) => {
      setCandidates(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => { unsubJobs(); unsubCands(); };
  }, []);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const totalCandidates = candidates.length;
    const hired = candidates.filter(c => c.status === 'hired').length;
    const avgScore = candidates.filter(c => c.score !== undefined).reduce((acc, c) => acc + c.score, 0) / (candidates.filter(c => c.score !== undefined).length || 1);
    
    // Pipeline Data
    const pipelineData = [
      { name: 'Applied', value: candidates.filter(c => c.status === 'applied').length },
      { name: 'Screening', value: candidates.filter(c => c.status === 'screening').length },
      { name: 'Shortlisted', value: candidates.filter(c => c.status === 'shortlisted').length },
      { name: 'Interview', value: candidates.filter(c => c.status === 'interview').length },
      { name: 'Hired', value: candidates.filter(c => c.status === 'hired').length },
      { name: 'Onboarding', value: candidates.filter(c => c.status === 'onboarding').length },
      { name: 'Rejected', value: candidates.filter(c => c.status === 'rejected').length },
    ];

    // Applications over time (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const timelineData = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: candidates.filter(c => c.appliedAt?.toDate().toISOString().split('T')[0] === date).length
    }));

    // Job distribution
    const jobData = jobs.map(job => ({
      name: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
      count: candidates.filter(c => c.jobId === job.id).length,
      avgScore: candidates.filter(c => c.jobId === job.id && c.score !== undefined).reduce((acc, c) => acc + c.score, 0) / (candidates.filter(c => c.jobId === job.id && c.score !== undefined).length || 1)
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    return { totalJobs, totalCandidates, hired, avgScore, pipelineData, timelineData, jobData };
  }, [jobs, candidates]);

  const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#22c55e', '#3b82f6', '#ef4444'];

  if (loading) return <div className="p-8 flex items-center justify-center h-64"><Loader2 className="animate-spin text-zinc-400" /></div>;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <Header title="Recruitment Analytics" />

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Candidates', value: stats.totalCandidates, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Hired Rate', value: `${((stats.hired / (stats.totalCandidates || 1)) * 100).toFixed(1)}%`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg AI Score', value: stats.avgScore.toFixed(1), icon: BrainCircuit, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-zinc-200 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Application Timeline */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            Application Volume (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timelineData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717a'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717a'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="count" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            Pipeline Distribution
          </h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pipelineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/3 space-y-2">
              {stats.pipelineData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs text-zinc-500 truncate">{item.name}</span>
                  <span className="text-xs font-bold text-zinc-900 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Jobs by Applications */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            Top Job Roles by Applications
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.jobData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#18181b', fontWeight: 500}} width={150} />
                <Tooltip 
                  cursor={{fill: '#f4f4f5'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#18181b" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const AppContent = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/*" 
          element={
            user ? (
              <div className="flex h-screen bg-zinc-50 overflow-hidden">
                {profile?.role === 'recruiter' && <Sidebar />}
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    {profile?.role === 'recruiter' ? (
                      <>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/candidates" element={<Candidates />} />
                        <Route path="/analytics" element={<Analytics />} />
                      </>
                    ) : (
                      <Route path="/" element={<CandidatePortal />} />
                    )}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
