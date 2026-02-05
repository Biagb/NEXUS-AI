import { Rocket } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div className="flex items-center gap-2 text-white">
          <Rocket className="h-8 w-8" />
          <span className="text-xl font-bold">AI Marketing Autopilot</span>
        </div>
        
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">
            Automate Your Marketing with AI
          </h1>
          <p className="text-blue-100 text-lg">
            Generate compelling campaigns, reach your audience, and grow your business
            — all powered by artificial intelligence.
          </p>
        </div>

        <div className="text-blue-200 text-sm">
          © 2026 AI Marketing Autopilot. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8 text-blue-600">
            <Rocket className="h-8 w-8" />
            <span className="text-xl font-bold">AI Marketing Autopilot</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
