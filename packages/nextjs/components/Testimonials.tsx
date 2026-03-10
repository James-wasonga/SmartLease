"use client";
export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Clients Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* {[1, 2, 3].map((_, i) => ( */}
          <div className="bg-blue-50 p-6 rounded-xl shadow">
            <p className="text-gray-700 italic mb-4">
              “SmartLease helped me get a home I never thought I could afford.
              Transparent, smooth, and easy.”
            </p>
            <div className="text-blue-600 font-semibold">Jane Krus</div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl shadow">
            <p className="text-gray-700 italic mb-4">
              “SmartLease made me a own Owner within a short period of time.
              Transparently and easily.”
            </p>
            <div className="text-blue-600 font-semibold">Kevin Chike</div>
          </div>

          <div className="bg-blue-50 p-6 round-xl shadow">
            <p className="tesxt-gray-700 italic mb-4">
              "I have been able list my properties for sale using SmartLease
              platform"
            </p>
            <div className="text-blue-600 font-semibold">John Okyere</div>
          </div>

          {/* ))} */}
        </div>
      </div>
    </section>
  );
}
