import { Zap, Shield, Sparkles, Mail, ArrowRight } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E293B] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid opacity-[0.03]" />
        {/* Gradient overlays */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl gradient-ai flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">NEXUS-AI</span>
        </div>
        
        {/* Main content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-medium text-[#CBD5E1]">AI-Powered Marketing Platform</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
            Automate Your Marketing<br />
            <span className="gradient-ai-text">with AI</span>
          </h1>
          <p className="text-[#94A3B8] text-lg mb-10 leading-relaxed max-w-md">
            Generate compelling campaigns, reach your audience, and grow your business
            — all powered by artificial intelligence.
          </p>

          {/* Feature bullets */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.12] transition-colors duration-200">
                <Sparkles className="h-4 w-4 text-[#818CF8]" />
              </div>
              <div>
                <span className="text-white text-sm font-medium">AI-Generated Content</span>
                <p className="text-[#64748B] text-xs mt-0.5">Email & SMS campaigns in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.12] transition-colors duration-200">
                <Mail className="h-4 w-4 text-[#10B981]" />
              </div>
              <div>
                <span className="text-white text-sm font-medium">Multi-Channel Delivery</span>
                <p className="text-[#64748B] text-xs mt-0.5">Reach your audience everywhere</p>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.12] transition-colors duration-200">
                <Shield className="h-4 w-4 text-[#3B82F6]" />
              </div>
              <div>
                <span className="text-white text-sm font-medium">Enterprise Security</span>
                <p className="text-[#64748B] text-xs mt-0.5">Secure, stable, and easy to use</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[#475569] text-xs relative z-10">
          © 2026 NEXUS-AI. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl gradient-ai flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1E293B] tracking-tight">NEXUS-AI</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
