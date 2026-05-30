import React, { useState } from "react";
import { FiMapPin, FiPhone, FiMail, FiSend } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";

const ContactUs = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.success("Message sent! We'll get back to you soon.");
    e.target.reset();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <ToastContainer position="top-right" />
      <div className="text-center mb-12">
        <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">Contact Us</span>
        <h1 className="text-4xl font-black text-slate-800 mt-2 mb-3">Get in Touch</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm">We'd love to hear from you — whether you have a question, want to track an order, or simply want to say hello.</p>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden shadow-card mb-10 h-56">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.0714494775457!2d77.87791539918724!3d29.880554210389647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390eb47c9a0667b7%3A0x6f04727d899afb28!2sRampur%20Rd%2C%20Roorkee%2C%20Uttarakhand%20247667%2C%20India!5e1!3m2!1sen!2sus!4v1723524560425!5m2!1sen!2sus"
          style={{ border: 0, width: "100%", height: "100%" }}
          allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Info */}
        <div className="lg:col-span-2 bg-slate-900 text-white rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Contact Information</h2>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0"><FiMapPin size={15}/></div>
              <div>
                <p className="font-medium text-sm">Address</p>
                <p className="text-slate-400 text-sm mt-0.5">43 Old Tehsil Rampur Road, Roorkee 247667, INDIA</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0"><FiPhone size={15}/></div>
              <div>
                <p className="font-medium text-sm">Phone</p>
                <a href="tel:+919837184618" className="text-slate-400 text-sm mt-0.5 hover:text-amber-400">+91 9837184618</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0"><FiMail size={15}/></div>
              <div>
                <p className="font-medium text-sm">Email</p>
                <a href="mailto:danmartglobal@gmail.com" className="text-slate-400 text-sm mt-0.5 hover:text-amber-400">danmartglobal@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input type="text" required placeholder="John Doe"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" required placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
              <input type="text" placeholder="How can we help?"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
              <textarea rows="4" required placeholder="Your message…"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <button type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
              <FiSend size={14}/> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
