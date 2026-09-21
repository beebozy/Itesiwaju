"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from "lucide-react";
import { loginAgencyApi, setStoredSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [directToken, setDirectToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (showTokenInput && directToken.trim()) {
        setStoredSession(directToken.trim(), {
          fullName: "LAWMA Field Dispatcher",
          role: "AGENCY_OPERATOR",
        });
        router.push("/cases");
        return;
      }

      if (!email.trim() || !password.trim()) {
        setError("Email and password are required.");
        setIsLoading(false);
        return;
      }

      const data = await loginAgencyApi(email.trim(), password.trim());
      const role = data?.user?.role;

      if (role !== "AGENCY_OPERATOR" && role !== "ADMIN") {
        setError(
          `Access Restricted: Your account has role "${role}". Only AGENCY_OPERATOR and ADMIN accounts have authorization to dispatch and modify cases.`
        );
        setIsLoading(false);
        return;
      }

      router.push("/cases");
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-extrabold text-white text-2xl shadow-lg shadow-primary/20">
            I
          </div>
          <div>
            <div className="text-xl font-extrabold text-white tracking-wider flex items-center gap-2">
              ITESIWAJU
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase">
                LAWMA
              </span>
            </div>
            <div className="text-xs text-gray-400">Command & Dispatch Center</div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-white mb-1">Agency Authentication</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter your official LAWMA operator credentials to access dispatch routing and case state authorization.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-start gap-2.5 text-accent-red text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {!showTokenInput ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Official Agency Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@lawma.gov.ng"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-surface-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Operator Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-surface-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Direct Bearer Token (Development / Inspection)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <textarea
                  value={directToken}
                  onChange={(e) => setDirectToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  rows={4}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-surface-border rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary font-mono transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <span className="text-xs">Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-surface-border flex items-center justify-between text-xs text-gray-400">
          <button
            type="button"
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="text-primary hover:underline font-medium text-[11px]"
          >
            {showTokenInput ? "← Use Email & Password" : "Paste Bearer Token"}
          </button>
          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
