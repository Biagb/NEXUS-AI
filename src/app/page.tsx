import Link from 'next/link';
import { Button } from '@/components/ui';
import { 
  Sparkles, Mail, BarChart3, ArrowRight, CheckCircle, 
  Zap, Shield, Clock, Send, Users, Play, Globe, ChevronRight
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== NAVIGATION ===== */}
      <nav className="fixed top-0 w-full glass z-50 border-b border-[#E2E8F0]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl gradient-ai flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:shadow-md group-hover:shadow-blue-500/25 transition-shadow">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-[#1E293B] tracking-tight">NEXUS-AI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#1E293B] rounded-lg hover:bg-[#F1F5F9] transition-all">
                Features
              </a>
              <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#1E293B] rounded-lg hover:bg-[#F1F5F9] transition-all">
                How It Works
              </a>
              <a href="#demo" className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#1E293B] rounded-lg hover:bg-[#F1F5F9] transition-all">
                Demo
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-[#1E293B] hover:bg-[#F1F5F9] font-medium">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="gradient-ai text-white border-0 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300">
                  Start for Free
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-blue-50/80 via-purple-50/40 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-50/50 to-transparent rounded-full blur-3xl" />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 -z-10 bg-grid opacity-30" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 bg-white text-[#475569] px-4 py-2 rounded-full text-sm font-medium mb-8 border border-[#E2E8F0] shadow-sm">
            <div className="w-5 h-5 rounded-full gradient-ai flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            AI-Powered Marketing for SMEs
            <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]" />
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1E293B] leading-[1.1] mb-6 tracking-tight">
            Write emails automatically{' '}
            <br className="hidden sm:block" />
            <span className="gradient-ai-text">with AI</span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-in-up delay-200 text-lg sm:text-xl text-[#64748B] mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate compelling marketing campaigns in seconds. Personalized 
            emails, SMS messages, and banners — tailored to your brand, powered by AI.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="gradient-ai text-white text-base px-8 h-12 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300 border-0 w-full sm:w-auto">
                Start for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg" className="text-base px-8 h-12 rounded-xl border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-300 w-full sm:w-auto">
                <Play className="mr-2 h-4 w-4 text-[#6366F1]" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in-up delay-400 mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#10B981]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#10B981]" />
              <span>Free plan available</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#10B981]" />
              <span>Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF / POWERED BY ===== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] border-y border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-[#94A3B8] uppercase tracking-[0.15em] mb-10">
            Powered by industry-leading technology
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
            {/* OpenAI */}
            <div className="flex items-center gap-2.5 opacity-40 hover:opacity-70 transition-opacity duration-300">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#1E293B">
                <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
              </svg>
              <span className="text-sm font-semibold text-[#1E293B]">OpenAI</span>
            </div>

            {/* Next.js */}
            <div className="flex items-center gap-2.5 opacity-40 hover:opacity-70 transition-opacity duration-300">
              <svg className="h-5 w-5" viewBox="0 0 180 180" fill="none">
                <mask id="mask0_408_134" style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                  <circle cx="90" cy="90" r="90" fill="black"/>
                </mask>
                <g mask="url(#mask0_408_134)">
                  <circle cx="90" cy="90" r="87" fill="black" stroke="white" strokeWidth="6"/>
                  <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear_408_134)"/>
                  <rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear_408_134)"/>
                </g>
                <defs>
                  <linearGradient id="paint0_linear_408_134" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white"/>
                    <stop offset="1" stopColor="white" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_408_134" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white"/>
                    <stop offset="1" stopColor="white" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-sm font-semibold text-[#1E293B]">Next.js</span>
            </div>

            {/* Supabase */}
            <div className="flex items-center gap-2.5 opacity-40 hover:opacity-70 transition-opacity duration-300">
              <svg className="h-5 w-5" viewBox="0 0 109 113" fill="none">
                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint0_linear)"/>
                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint1_linear)" fillOpacity="0.2"/>
                <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.04075L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#249361"/>
                    <stop offset="1" stopColor="#3ECF8E"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
                    <stop/>
                    <stop offset="1" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-sm font-semibold text-[#1E293B]">Supabase</span>
            </div>

            {/* Resend */}
            <div className="flex items-center gap-2.5 opacity-40 hover:opacity-70 transition-opacity duration-300">
              <div className="w-5 h-5 rounded bg-[#1E293B] flex items-center justify-center">
                <Send className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-[#1E293B]">Resend</span>
            </div>

            {/* Twilio */}
            <div className="flex items-center gap-2.5 opacity-40 hover:opacity-70 transition-opacity duration-300">
              <div className="w-5 h-5 rounded-full bg-[#F22F46] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <span className="text-sm font-semibold text-[#1E293B]">Twilio</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VISUAL DEMO / APP SCREENSHOT ===== */}
      <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#F1F5F9] text-[#475569] px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border border-[#E2E8F0]">
              <Zap className="h-3 w-3 text-[#6366F1]" />
              See it in action
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 tracking-tight">
              From idea to email in seconds
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              Watch how NEXUS-AI transforms a simple prompt into a complete, branded email campaign ready to send.
            </p>
          </div>

          {/* App Screenshot Mockup */}
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect behind */}
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/8 via-purple-500/8 to-blue-500/8 rounded-[2rem] blur-2xl" />
            
            {/* Browser chrome mockup */}
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-[#1E293B]/8 border border-[#E2E8F0] overflow-hidden">
              {/* Browser top bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]/70" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]/70" />
                  <div className="w-3 h-3 rounded-full bg-[#10B981]/70" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1 text-xs text-[#94A3B8] border border-[#E2E8F0] max-w-md mx-auto text-center">
                    app.nexus-ai.com/dashboard/campaigns/new
                  </div>
                </div>
              </div>

              {/* App content mockup */}
              <div className="flex min-h-[400px] sm:min-h-[500px]">
                {/* Sidebar mockup */}
                <div className="hidden sm:flex w-56 bg-[#F8FAFC] border-r border-[#E2E8F0] flex-col p-4">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-7 h-7 rounded-lg gradient-ai flex items-center justify-center">
                      <Zap className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-[#1E293B]">NEXUS-AI</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#94A3B8] text-xs">
                      <div className="w-4 h-4 rounded bg-[#E2E8F0]" />
                      Dashboard
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white text-[#1E293B] text-xs font-medium shadow-sm border border-[#E2E8F0]">
                      <div className="w-4 h-4 rounded gradient-ai" />
                      Campaigns
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#94A3B8] text-xs">
                      <div className="w-4 h-4 rounded bg-[#E2E8F0]" />
                      Subscribers
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#94A3B8] text-xs">
                      <div className="w-4 h-4 rounded bg-[#E2E8F0]" />
                      Settings
                    </div>
                  </div>
                </div>

                {/* Main content mockup */}
                <div className="flex-1 p-6 sm:p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#1E293B]">Create New Campaign</h3>
                    <p className="text-xs text-[#94A3B8]">Let AI generate compelling marketing content</p>
                  </div>

                  {/* Form mockup */}
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <div className="text-xs font-medium text-[#475569] mb-1">Campaign Topic</div>
                      <div className="h-10 rounded-lg border border-[#E2E8F0] bg-white px-3 flex items-center text-sm text-[#1E293B]">
                        Summer Sale - 30% off everything ✨
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#475569] mb-1">Type</div>
                      <div className="h-10 rounded-lg border border-[#E2E8F0] bg-white px-3 flex items-center text-sm text-[#1E293B]">
                        📧 Email Campaign
                      </div>
                    </div>
                    <button className="w-full h-11 rounded-lg gradient-ai text-white text-sm font-medium flex items-center justify-center gap-2 shadow-md shadow-blue-500/25">
                      <Sparkles className="h-4 w-4" />
                      Generate with AI
                    </button>

                    {/* Generated result preview */}
                    <div className="mt-6 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-[#10B981]" />
                        </div>
                        <span className="text-xs font-medium text-[#10B981]">AI Generated Successfully</span>
                      </div>
                      <div className="text-xs text-[#475569] leading-relaxed">
                        <strong>Subject:</strong> 🔥 Summer Sale: 30% Off Everything!<br />
                        <span className="text-[#94A3B8] mt-2 block">Dear valued customer, the summer heat is on and so are our deals! For a limited time, enjoy 30% off our entire collection...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white text-[#475569] px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border border-[#E2E8F0] shadow-sm">
              <Shield className="h-3 w-3 text-[#6366F1]" />
              Built for growth
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 tracking-tight">
              Everything you need to grow
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              Powerful AI tools designed specifically for small and medium businesses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] card-hover group">
              <div className="w-12 h-12 rounded-xl gradient-ai flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-blue-500/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                AI Content Generation
              </h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                Generate compelling email copy, SMS messages, and marketing banners 
                with just a few words describing your campaign.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] card-hover group">
              <div className="w-12 h-12 rounded-xl bg-[#10B981] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-emerald-500/20">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                Multi-Channel Campaigns
              </h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                Reach your audience through email and SMS. Send beautiful, 
                branded campaigns that convert visitors into customers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] card-hover group">
              <div className="w-12 h-12 rounded-xl bg-[#1E293B] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                Simple CRM
              </h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                Manage your subscribers, segment with tags, and track your 
                campaign performance all in one clean dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#F1F5F9] text-[#475569] px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border border-[#E2E8F0]">
              <Clock className="h-3 w-3 text-[#6366F1]" />
              Quick setup
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 tracking-tight">
              Up and running in 3 steps
            </h2>
            <p className="text-lg text-[#64748B]">
              From sign-up to your first AI campaign in under 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-[#E2E8F0] via-[#CBD5E1] to-[#E2E8F0]" />

            <div className="text-center relative">
              <div className="w-14 h-14 rounded-2xl gradient-ai text-white flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-blue-500/20 relative z-10 ring-4 ring-white">
                1
              </div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                Set Up Your Brand
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Tell us about your company, upload your logo, and set your brand colors and tone of voice.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-14 h-14 rounded-2xl gradient-ai text-white flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-blue-500/20 relative z-10 ring-4 ring-white">
                2
              </div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                Describe Your Campaign
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed max-w-xs mx-auto">
                Enter a simple topic like &quot;Summer Sale&quot; and let AI generate the perfect marketing content.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-14 h-14 rounded-2xl gradient-ai text-white flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-blue-500/20 relative z-10 ring-4 ring-white">
                3
              </div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                Review &amp; Send
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed max-w-xs mx-auto">
                Review your AI-generated content, make tweaks if needed, and deliver to your audience instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS / NUMBERS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-1">2 min</div>
              <p className="text-sm text-[#64748B]">Average setup time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold gradient-ai-text mb-1">10x</div>
              <p className="text-sm text-[#64748B]">Faster than manual</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-1">99.9%</div>
              <p className="text-sm text-[#64748B]">Uptime guarantee</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[#10B981] mb-1">Free</div>
              <p className="text-sm text-[#64748B]">To start, forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#1E293B] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#1E293B] to-[#0F172A]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-500/8 to-transparent rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-4 py-2 rounded-full text-xs font-semibold mb-8 border border-white/10 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Get started today
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            Ready to automate your marketing?
          </h2>
          <p className="text-lg text-[#94A3B8] mb-10 max-w-xl mx-auto leading-relaxed">
            Join SMEs that use AI to write better campaigns, save time, and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="gradient-ai text-white text-base px-8 h-12 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300 border-0 w-full sm:w-auto">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-[#64748B]">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>99.9% uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>GDPR compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg gradient-ai flex items-center justify-center shadow-sm">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">NEXUS-AI</span>
            </div>
            <p className="text-[#475569] text-sm">
              © 2026 NEXUS-AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
