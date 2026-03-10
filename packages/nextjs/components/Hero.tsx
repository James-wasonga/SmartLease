
"use client";

import Link from "next/link";
import {Routes} from "@/app/routes"; 

export default function Hero() {
  return (
    <section className="pt-28 relative overflow-hidden" style={{ height: '70vh' }}>
      {/* Background Image - ADJUST SIZE HERE */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80')`,
          backgroundPosition: 'center top',
          backgroundSize: 'cover' 
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-transparent" />
      
      {/* Content - ADJUST VERTICAL POSITION HERE */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10 pb-20 text-center" /* CHANGE pt-8 to pt-4, pt-12, pt-16 to move text up/down */>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
          Own Your Dream Home with Ease
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-8 drop-shadow-md">
          Rent to own properties designed to help you own a home at your pace.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href={Routes.BROWSE_PROPERTIES}>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            Browse Properties
          </button>
          </Link>
          <button className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg">
            Learn More
          </button>
        </div>
      </div>
      
    </section>
  );
}

// "use client";
// export default function Hero() {
//   return (
//     <section className="pt-28 bg-blue-50 text-center">
//       <div className="max-w-4xl mx-auto px-4 py-20">
//         <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
//           Own Your Dream Home with Ease
//         </h1>
//         <p className="text-lg md:text-xl text-gray-600 mb-8">
//           Rent to own properties designed to help you own a home at your pace.
//         </p>
//         <div className="flex justify-center space-x-4">
//           <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
//             Browse Properties
//           </button>
//           <button className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50">
//             Learn More
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }
