'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', category: 'Retreat', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setFormData({ name: '', email: '', phone: '', category: 'Retreat', message: '' })
  }

  return (
    <main className="bg-surface pb-20">
      {/* Header banner */}
      <section className="relative h-[350px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/45 z-10"></div>
          <img
            className="object-cover w-full h-full absolute inset-0"
            alt="Beautiful Himalayan sanctuary landscape"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDk30QEObl2k8oh7fcQBueTF65N9BWmaV3ZkFEx-IwV9X8AbWEGvDjdZsVeKDa6UjgtvTWYRkKdjnkPVJtV_3Nw8OPt-i6-1QwTChz_JIbN5Ajhbnk2Iiaa-OsDxXuHkjd2sEGQZieRNh469JeWf3tdoxY0lRn-r-qpLXngXofLaYSYrEE-fV_ga7ucnNT3Gme80JOeBQYFv0cPjN8Ysq3Nqh-SRqn8Y7DrMXS4hhXKsWN1m3KaUNhvQIohglA5nqLCXdQLDykF_B0o"
          />
        </div>
        <div className="relative z-20 text-center max-w-[1280px] mx-auto px-6 md:px-12 mt-16">
          <span className="text-tertiary-fixed font-label-price text-xs uppercase tracking-widest block mb-3">✦ Connect With Our Sages ✦</span>
          <h1 className="font-display-lg text-4xl md:text-6xl text-on-primary font-bold">Contact Our Sanctuary</h1>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Contact Methods */}
        <div className="lg:col-span-5 flex flex-col justify-between text-left">
          <div>
            <span className="text-secondary font-label-price text-xs uppercase tracking-widest block mb-2">Speak to a Guide</span>
            <h2 className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-6">We are here to help your journey</h2>
            <p className="font-body-md text-on-surface-variant text-sm md:text-base leading-relaxed mb-8">
              Whether you need customization for clinical therapies, want to query group bookings, or need help matching a retreat to your spiritual experience.
            </p>

            <div className="space-y-6">
              {/* WhatsApp */}
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/5"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">chat</span>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">WhatsApp Support</h4>
                  <p className="text-xs text-on-surface-variant">+91 99999 99999 (Realtime)</p>
                </div>
              </a>

              {/* Email */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/5">
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">Sanctuary Desk Email</h4>
                  <p className="text-xs text-on-surface-variant">info@indiayogatourism.com</p>
                </div>
              </div>

              {/* Office Address */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/5">
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">Himalayan Retreat Office</h4>
                  <p className="text-xs text-on-surface-variant">Cloud 9 Tower, Sec-1, Ghaziabad, UP 201010</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-xl">
          {submitted ? (
            <div className="py-12 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-secondary text-5xl mb-4 bg-secondary/10 p-4 rounded-full">check_circle</span>
              <h3 className="font-headline-md text-2xl text-primary font-bold mb-2">Message Sent Successfully!</h3>
              <p className="text-sm text-on-surface-variant max-w-sm">
                Thank you for connecting. Our retreat guides will review your enquiry and respond via email within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 bg-primary text-on-primary font-bold px-6 py-2.5 rounded-full hover:bg-primary-container transition-colors text-xs cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <h3 className="font-headline-md text-2xl text-primary font-bold mb-6">Send an Inquiry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-outline uppercase font-bold tracking-wider mb-2">Full Name *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors text-sm"
                    placeholder="Jane Doe"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline uppercase font-bold tracking-wider mb-2">Email Address *</label>
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors text-sm"
                    placeholder="jane@example.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-outline uppercase font-bold tracking-wider mb-2">Contact Number</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors text-sm"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline uppercase font-bold tracking-wider mb-2">Interest Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors appearance-none text-sm"
                  >
                    <option value="Retreat">Yoga Retreats</option>
                    <option value="Programme">Ayurveda Detox</option>
                    <option value="Online">Online Classes</option>
                    <option value="TeacherTraining">Teacher Training</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-outline uppercase font-bold tracking-wider mb-2">Your Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors resize-none text-sm"
                  placeholder="How can we help guide you?"
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-4 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                Submit Inquiry
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
