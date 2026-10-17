import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  ExternalLink,
  LogOut,
  CheckCircle2,
  Key,
  User,
  AlertCircle,
  Copy,
  Check,
  UploadCloud,
  Rocket,
  Globe,
  Terminal,
  FolderGit2,
  ShieldCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { GitHubUser } from '../../types/simulation';

interface GitHubAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GitHubUser | null;
  onLoginSuccess: (user: GitHubUser) => void;
  onLogout: () => void;
}

export const GitHubAuthModal: React.FC<GitHubAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  // Top-level modal mode
  const [modalTab, setModalTab] = useState<'profile' | 'publish' | 'deploy'>('profile');

  // Sub-tabs for login method
  const [authMethod, setAuthMethod] = useState<'quick' | 'oauth' | 'token'>('quick');
  const [usernameInput, setUsernameInput] = useState('amunawwara');
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Publish form states
  const [repoName, setRepoName] = useState('ci-ai-research-lab');
  const [repoDesc, setRepoDesc] = useState(
    'Multi-Speaker Cochlear Implant Research Prototype for AI separation, identification, spatial filtering, and neural representation.'
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [publishToken, setPublishToken] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    repoUrl: string;
    cloneUrl: string;
    repoName: string;
  } | null>(null);

  // Copy tracking states
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedShared, setCopiedShared] = useState(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);

  const DEV_CALLBACK =
    'https://ais-dev-255pwrtlklnainnsipncvl-232209402704.asia-southeast1.run.app/auth/callback';
  const SHARED_CALLBACK =
    'https://ais-pre-255pwrtlklnainnsipncvl-232209402704.asia-southeast1.run.app/auth/callback';
  const LIVE_DEPLOYED_URL =
    'https://ais-pre-255pwrtlklnainnsipncvl-232209402704.asia-southeast1.run.app';

  // Listen for OAuth postMessage callback from popup window
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.user) {
        onLoginSuccess(event.data.user);
        setIsLoading(false);
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [onLoginSuccess]);

  if (!isOpen) return null;

  // Handle OAuth Popup Flow
  const handleStartOAuthPopup = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/github/url');
      const data = await res.json();

      if (!data.configured || !data.url) {
        setErrorMsg(
          'GitHub OAuth App is not configured with GITHUB_CLIENT_ID yet. You can use Quick Username Login or enter your Personal Access Token below!'
        );
        setIsLoading(false);
        return;
      }

      const popup = window.open(
        data.url,
        'github_oauth_popup',
        'width=600,height=720,status=no,resizable=yes'
      );

      if (!popup) {
        setErrorMsg('Browser popup was blocked. Please allow popups for this site.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate GitHub OAuth flow.');
      setIsLoading(false);
    }
  };

  // Handle Quick Username Verification
  const handleQuickUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/github/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'User not found on GitHub');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not verify GitHub username');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Token Login
  const handleTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/github/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid GitHub token');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate token with GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Publishing Repository to GitHub
  const handlePublishToGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = publishToken.trim() || tokenInput.trim();
    if (!token) {
      setErrorMsg('Please enter a GitHub Personal Access Token (PAT) with repo permissions to publish.');
      return;
    }

    setIsPublishing(true);
    setErrorMsg('');
    setSuccessMsg('');
    setPublishResult(null);

    try {
      const res = await fetch('/api/github/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          repoName: repoName.trim(),
          description: repoDesc.trim(),
          isPrivate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish repository to GitHub');
      }

      setPublishResult({
        repoUrl: data.repoUrl,
        cloneUrl: data.cloneUrl,
        repoName: data.repoName,
      });
      setSuccessMsg(`Repository published successfully!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Publish operation failed. Check your GitHub Personal Access Token.');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = (text: string, type: 'dev' | 'shared' | 'git') => {
    navigator.clipboard.writeText(text);
    if (type === 'dev') {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2000);
    } else if (type === 'shared') {
      setCopiedShared(true);
      setTimeout(() => setCopiedShared(false), 2000);
    } else {
      setCopiedGitCmd(true);
      setTimeout(() => setCopiedGitCmd(false), 2000);
    }
  };

  const gitCliCommands = `# In your local terminal, navigate to your project and run:
git init
git add .
git commit -m "feat: cochlear implant multi-speaker AI prototype"
git branch -M main
git remote add origin https://github.com/${currentUser?.login || usernameInput || 'amunawwara'}/${repoName}.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                GitHub & Deployment Hub
              </h3>
              <p className="text-xs text-slate-500">
                Manage GitHub account, publish source repository, and check deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top-Level Tabs */}
        <div className="flex items-center gap-1.5 pt-3 pb-2 border-b border-slate-100">
          <button
            onClick={() => setModalTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modalTab === 'profile'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>GitHub Account</span>
            {currentUser && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            )}
          </button>

          <button
            onClick={() => setModalTab('publish')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modalTab === 'publish'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Publish to GitHub</span>
          </button>

          <button
            onClick={() => setModalTab('deploy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modalTab === 'deploy'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Deployment Status</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4">
          {/* ==========================================================
              TAB 1: GITHUB ACCOUNT & PROFILE
              ========================================================== */}
          {modalTab === 'profile' && (
            <div>
              {currentUser ? (
                /* CONNECTED VIEW */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
                    <img
                      src={currentUser.avatar_url || 'https://github.com/identicons/user.png'}
                      alt={currentUser.login}
                      className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {currentUser.name || currentUser.login}
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Connected</span>
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-500">
                        @{currentUser.login}
                      </div>
                      {currentUser.bio && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {currentUser.bio}
                        </p>
                      )}
                      {currentUser.email && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {currentUser.email}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Strip */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Public Repositories</div>
                      <div className="text-lg font-mono font-bold text-slate-900">
                        {currentUser.public_repos ?? 0}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Followers</div>
                      <div className="text-lg font-mono font-bold text-slate-900">
                        {currentUser.followers ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <a
                      href={currentUser.html_url || `https://github.com/${currentUser.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span>Open GitHub Account (@{currentUser.login})</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-400" />
                    </a>

                    <a
                      href={`${currentUser.html_url || `https://github.com/${currentUser.login}`}?tab=repositories`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <span>View Repositories on GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>

                    <button
                      onClick={onLogout}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect GitHub Account</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* DISCONNECTED VIEW: SIGN IN */
                <div className="space-y-4">
                  {/* Direct link to open github profile immediately */}
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="text-xs text-blue-900">
                      <span className="font-bold">Target Account:</span> @amunawwara
                      <div className="text-[11px] text-blue-700">amunawwara@gmail.com</div>
                    </div>
                    <a
                      href="https://github.com/amunawwara"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-all shrink-0 cursor-pointer"
                    >
                      <span>Open Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Method selector */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                    <button
                      onClick={() => setAuthMethod('quick')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        authMethod === 'quick'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Quick Connect
                    </button>
                    <button
                      onClick={() => setAuthMethod('token')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        authMethod === 'token'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Personal Token
                    </button>
                    <button
                      onClick={() => setAuthMethod('oauth')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        authMethod === 'oauth'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      OAuth Popup
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div>{errorMsg}</div>
                    </div>
                  )}

                  {authMethod === 'quick' && (
                    <form onSubmit={handleQuickUsernameLogin} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          GitHub Username
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">
                            @
                          </span>
                          <input
                            type="text"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            placeholder="e.g. amunawwara"
                            className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Connects public profile, avatar, repository count, and followers.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <Github className="w-4 h-4" />
                            <span>Login & Connect Account</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {authMethod === 'token' && (
                    <form onSubmit={handleTokenLogin} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          GitHub Personal Access Token (PAT)
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                          <input
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="ghp_... or github_pat_..."
                            className="w-full text-xs font-mono text-slate-900 bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Allows authenticated repository access and direct 1-click publishing.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Key className="w-4 h-4" />
                        <span>{isLoading ? 'Verifying...' : 'Sign In with Token'}</span>
                      </button>
                    </form>
                  )}

                  {authMethod === 'oauth' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Authenticate via standard GitHub OAuth 2.0 popup.
                      </p>
                      <button
                        onClick={handleStartOAuthPopup}
                        disabled={isLoading}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Github className="w-4 h-4" />
                        <span>Authorize via GitHub OAuth Popup</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==========================================================
              TAB 2: PUBLISH TO GITHUB
              ========================================================== */}
          {modalTab === 'publish' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                  <FolderGit2 className="w-4 h-4 text-blue-600" />
                  <span>Publish CI-AI Research Lab to GitHub</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Create a public repository under your GitHub account and publish full code and scientific documentation.
                </p>
              </div>

              {publishResult ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Repository Successfully Published!</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Your research repository is now published and accessible on GitHub.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={publishResult.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                    >
                      <Github className="w-4 h-4" />
                      <span>Open Repository on GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setPublishResult(null)}
                      className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-200 cursor-pointer"
                    >
                      Publish Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePublishToGitHub} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="ci-ai-research-lab"
                      className="w-full text-xs font-mono font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Repository Description
                    </label>
                    <textarea
                      value={repoDesc}
                      onChange={(e) => setRepoDesc(e.target.value)}
                      rows={2}
                      className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      GitHub Personal Access Token (PAT)
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                      <input
                        type="password"
                        value={publishToken}
                        onChange={(e) => setPublishToken(e.target.value)}
                        placeholder="ghp_... (needs 'repo' permission)"
                        className="w-full text-xs font-mono text-slate-900 bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>Requires <code>repo</code> scope to create repositories.</span>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=CI-AI-Research-Lab-Publisher"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Generate Token</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                    <label htmlFor="isPrivate" className="text-xs text-slate-700 cursor-pointer select-none">
                      Make repository private (default is public)
                    </label>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div>{errorMsg}</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating & Publishing Repository...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Publish Website in GitHub</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Terminal Instructions */}
              <div className="p-3.5 bg-slate-900 rounded-xl text-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Or Publish via Git Terminal CLI</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(gitCliCommands, 'git')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedGitCmd ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-emerald-300/90 whitespace-pre overflow-x-auto p-2 bg-slate-950/70 rounded-lg">
                  {gitCliCommands}
                </pre>
              </div>
            </div>
          )}

          {/* ==========================================================
              TAB 3: DEPLOYMENT STATUS & DIAGNOSTICS
              ========================================================== */}
          {modalTab === 'deploy' && (
            <div className="space-y-4">
              {/* Deployment Root-Cause Alert */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Why Did Deployment Fail? Root Causes & Fixes</span>
                </div>
                <div className="text-[11px] text-amber-800 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>1. GitHub Actions Build Failed:</strong> npm encountered an <code>ERESOLVE</code> dependency conflict between <code>esbuild</code> and <code>vite@8.3.4</code>, and was missing <code>package-lock.json</code> for <code>npm ci</code>.
                  </p>
                  <p>
                    <strong>2. Cloud Run Shared URL (404 Not Found):</strong> The production URL (<code>ais-pre-...run.app</code>) returns 404 until you click the <strong>&quot;Publish&quot; / &quot;Deploy&quot;</strong> button in the top-right bar of Google AI Studio to build the cloud container.
                  </p>
                  <p>
                    <strong>3. GitHub Pages Subdirectory 404s:</strong> Default Vite builds used root absolute paths (<code>/assets/...</code>) which break when hosted at <code>https://user.github.io/repo/</code>.
                  </p>
                </div>
              </div>

              {/* Automated Fixes Applied */}
              <div className="p-3.5 bg-slate-900 rounded-xl text-white space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Deployment Fixes Applied to Codebase</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Resolved Dependency Conflict:</strong> Fixed esbuild peer version conflict in <code>package.json</code>.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Generated Clean Lockfile:</strong> Created <code>package-lock.json</code> (223 packages, 0 vulnerabilities).</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Relative Base Path:</strong> Set <code>base: &#39;./&#39;</code> in <code>vite.config.ts</code> for flawless GitHub Pages loading.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>CI/CD Workflow Hardened:</strong> Added fallback from <code>npm ci</code> to <code>npm install</code> in GitHub Actions.</span>
                  </div>
                </div>
              </div>

              {/* GitHub Pages Setup Guide */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Rocket className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Next Step to Activate GitHub Pages</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-blue-800 space-y-1 leading-relaxed">
                  <li>Open your repository on GitHub: <strong>github.com/amunawwara/ci-ai-research-lab</strong></li>
                  <li>Click <strong>Settings &rarr; Pages</strong> in the left sidebar</li>
                  <li>Under <strong>Build and deployment &gt; Source</strong>, choose <strong>GitHub Actions</strong></li>
                  <li>Go to the <strong>Actions</strong> tab to see the green automated deployment!</li>
                </ol>
              </div>

              {/* URL Cards */}
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span>Google Cloud Run Shared Production URL:</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">Requires Top-Bar Deploy</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs">
                    <span className="truncate text-slate-900">{LIVE_DEPLOYED_URL}</span>
                    <button
                      onClick={() => copyToClipboard(LIVE_DEPLOYED_URL, 'shared')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 shrink-0 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedShared ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">
                    Development Applet URL:
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs">
                    <span className="truncate text-slate-900">{DEV_CALLBACK.replace('/auth/callback', '')}</span>
                    <button
                      onClick={() => copyToClipboard(DEV_CALLBACK.replace('/auth/callback', ''), 'dev')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 shrink-0 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedDev ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Action */}
              <div className="flex gap-2">
                <a
                  href={`https://github.com/${currentUser?.login || 'amunawwara'}/${repoName || 'ci-ai-research-lab'}/actions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>Check GitHub Actions Runs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={LIVE_DEPLOYED_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Test Cloud Run URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            User: <span className="font-mono font-medium text-slate-700">amunawwara@gmail.com</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
