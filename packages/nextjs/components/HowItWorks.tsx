"use client";
import { Wallet, Search, FileText, Home, BarChart3, Shield, Users, ArrowRight } from "lucide-react";
import Link from "next/Link";
import {Routes} from "@/app/routes"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Wallet className="w-12 h-12" />,
      title: "Connect Wallet",
      description: "Connect your crypto wallet and choose your role as either a landlord or tenant",
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: <Search className="w-12 h-12" />,
      title: "Browse & List",
      description: "Tenants browse available properties. Landlords create listings with pricing and terms",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FileText className="w-12 h-12" />,
      title: "Apply & Sign",
      description: "Apply easily and sign agreements digitally with smart contract automation", 
      color: "from-cyan-500 to-green-500"
    },
    {
      icon: <Home className="w-12 h-12" />,
      title: "Move In & Track",
      description: "Move in and track your equity growth with real-time blockchain updates",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Blockchain Security",
      description: "Every transaction is secured on-chain with automatic tracking"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Analytics", 
      description: "Track equity growth, payment history, and ownership progress"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Dual Experience",
      description: "Tailored dashboards for both landlords and tenants"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of rent-to-own with blockchain technology. 
            Transparent, secure, and automated property ownership.
          </p>
        </div>

        {/* Main Steps */}
        <div className="grid lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 -right-4 z-0">
                  <ArrowRight className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors duration-300" />
                </div>
              )}
              
              {/* Step Card */}
              <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 group-hover:scale-105">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Role-Based Experience */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Landlord Experience */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white mr-4">
                <Home className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">For Landlords</h3>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Create property listings with custom pricing and terms
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Monitor tenant equity growth and payment history
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Dashboard with earnings overview and analytics
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Real-time blockchain tracking of all transactions
              </li>
            </ul>
          </div>

          {/* Tenant Experience */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white mr-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">For Tenants</h3>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Browse available rent-to-own properties
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Track equity progress with milestone visualizations
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Payment calendar with complete rent history
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Transparent ownership contribution tracking
              </li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <Link href={Routes.BROWSE_PROPERTIES}>Get Started Today</Link>
            <ArrowRight className="w-5 h-5 ml-2" />
          </div>
        </div>
      </div>
    </section>
  );
}


// "use client";
// export default function HowItWorks() {
//   return (
//     <section className="py-20 bg-white">
//       <div className="max-w-6xl mx-auto px-6">
//         <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
//         <div className="grid md:grid-cols-3 gap-10 text-center">
//           <div>
//             <div className="text-blue-600 text-4xl mb-4">🔍</div>
//             <h3 className="text-xl font-semibold mb-2">Browse Listings</h3>
//             <p className="text-gray-600">
//               Find rent-to-own homes that match your preferences and location.
//             </p>
//           </div>
//           <div>
//             <div className="text-blue-600 text-4xl mb-4">📝</div>
//             <h3 className="text-xl font-semibold mb-2">Apply & Sign</h3>
//             <p className="text-gray-600">
//               Apply easily and sign the agreement digitally through our
//               platform.
//             </p>
//           </div>
//           <div>
//             <div className="text-blue-600 text-4xl mb-4">🏠</div>
//             <h3 className="text-xl font-semibold mb-2">Move In & Pay</h3>
//             <p className="text-gray-600">
//               Move in right away and pay monthly towards your future ownership.
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }