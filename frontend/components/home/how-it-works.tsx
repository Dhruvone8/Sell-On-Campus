import * as React from "react";
import { ShieldCheck, Camera, MessageSquare } from "lucide-react";

interface Step {
  step: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  {
    step: "01",
    title: "Verify with Campus Email",
    description:
      "Sign up using your university email address. Quick OTP verification ensures that every buyer and seller on the platform is an active, verified student from your campus network.",
    icon: ShieldCheck,
  },
  {
    step: "02",
    title: "List or Discover Dorm Essentials",
    description:
      "Snap a few photos from your phone, set your student-friendly price, and publish your listing in under 60 seconds. Zero seller fees, zero commissions, and instant visibility across campus.",
    icon: Camera,
  },
  {
    step: "03",
    title: "Chat In-App & Meet On Campus",
    description:
      "Coordinate securely with peer buyers through built-in real-time messaging. Agree on terms and hand off items conveniently at the university library, campus quad, or dorm lobby.",
    icon: MessageSquare,
  },
];

export function HowItWorks() {
  return (
    <section className="w-full py-16 sm:py-20 bg-white border-b border-charcoal-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight mt-2 font-jakarta">
            How SellOnCampus Works
          </h2>
          <p className="text-base sm:text-lg text-charcoal-600 mt-3 leading-relaxed">
            Eliminating shipping delays and costly platform cuts by connecting university students directly on campus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-6 sm:p-8 rounded-2xl bg-charcoal-50/50 border border-charcoal-200/80 shadow-2xs hover:border-charcoal-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-12 w-12 rounded-xl bg-white text-brand-600 border border-charcoal-200/80 shadow-2xs flex items-center justify-center">
                      <Icon className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-2xl font-black text-charcoal-300 font-jakarta">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-charcoal-900 mb-2 font-jakarta">
                    {item.title}
                  </h3>

                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

