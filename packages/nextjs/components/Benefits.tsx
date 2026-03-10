"use client";

export default function Benefits() {
  return (
    <section className="bg-blue-600 py-20 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Flexible Payment Options
            </h3>
            <p>Gradual payments towards full ownership without a mortgage.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Verified Properties</h3>
            <p>All listings are vetted and approved by our platform experts.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p>Built on blockchain technology for transparency and trust.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
