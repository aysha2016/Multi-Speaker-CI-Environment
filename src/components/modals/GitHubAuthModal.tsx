import React, { useState, useEffect } from 'react';
import { X, Github, ExternalLink, LogOut, CheckCircle2, Key, User, AlertCircle, Copy, Check } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'quick' | 'oauth' | 'token'>('quick');
  const [usernameInput, setUsernameInput] = useState('amunawwara');
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedShared, setCopiedShared] = useState(false);

  const DEV_CALLBACK = 'https://ais-dev-255pwrtlklnainnsipncvl-232209402704.asia-southeast1.run.app/auth/callback';
  const SHARED_CALLBACK = 'https://ais-pre-255pwrtlklnainnsipncvl-232209402704.asia-southeast1.run.app/auth/callback';

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
        setErrorMsg('GitHub OAuth App is not configured with GITHUB_CLIENT_ID yet. You can use Quick Username Login or enter your Personal Access Token below!');
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

  const copyToClipboard = (text: string, isDev: boolean) => {
    navigator.clipboard.writeText(text);
    if (isDev) {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2000);
    } else {
      setCopiedShared(true);
      setTimeout(() => setCopiedShared(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                GitHub Account
              </h3>
              <p className="text-xs text-slate-500">
                {currentUser ? 'Connected profile & repository access' : 'Sign in to sync your research profile'}
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

        {/* Content */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4">
          {currentUser ? (
            /* ==========================================================
               LOGGED IN STATE: SHOW PROFILE & REPOS
               ========================================================== */
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

              {/* Action Buttons to Open on GitHub */}
              <div className="space-y-2 pt-1">
                <a
                  href={currentUser.html_url || `https://github.com/${currentUser.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>Open Profile on GitHub.com</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 text-slate-400" />
                </a>

                <a
                  href={`${currentUser.html_url || `https://github.com/${currentUser.login}`}?tab=repositories`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  <span>View Repositories</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors pt-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* ==========================================================
               LOGGED OUT STATE: LOGIN OPTIONS
               ========================================================== */
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setActiveTab('quick')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quick Username
                </button>
                <button
                  onClick={() => setActiveTab('oauth')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'oauth' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  OAuth Popup
                </button>
                <button
                  onClick={() => setActiveTab('token')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'token' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Personal Token
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div>{errorMsg}</div>
                </div>
              )}

              {/* Tab 1: Quick Username Lookup */}
              {activeTab === 'quick' && (
                <form onSubmit={handleQuickUsernameLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      GitHub Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">@</span>
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
                      Instantly connects your public GitHub profile and repositories to the research lab.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Github className="w-4 h-4" />
                    <span>{isLoading ? 'Verifying...' : 'Connect GitHub Account'}</span>
                  </button>
                </form>
              )}

              {/* Tab 2: OAuth 3P Popup Flow */}
              {activeTab === 'oauth' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Authenticate via standard GitHub OAuth 2.0 popup. Requires registering an OAuth app on GitHub.
                  </p>

                  <button
                    onClick={handleStartOAuthPopup}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Github className="w-4 h-4" />
                    <span>{isLoading ? 'Connecting...' : 'Authorize via GitHub OAuth Popup'}</span>
                  </button>

                  {/* Setup Instructions & Callback URLs */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-slate-800">OAuth Callback URLs:</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Development Callback URL:</span>
                        <div className="flex items-center justify-between gap-2 p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[10px]">
                          <span className="truncate">{DEV_CALLBACK}</span>
                          <button
                            onClick={() => copyToClipboard(DEV_CALLBACK, true)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 shrink-0 cursor-pointer"
                          >
                            {copiedDev ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 block">Shared/Deployed Callback URL:</span>
                        <div className="flex items-center justify-between gap-2 p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[10px]">
                          <span className="truncate">{SHARED_CALLBACK}</span>
                          <button
                            onClick={() => copyToClipboard(SHARED_CALLBACK, false)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 shrink-0 cursor-pointer"
                          >
                            {copiedShared ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Personal Access Token */}
              {activeTab === 'token' && (
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
                      Create a read-only token on GitHub (Settings → Developer settings → Personal access tokens).
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Key className="w-4 h-4" />
                    <span>{isLoading ? 'Authenticating...' : 'Sign In with Token'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
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
