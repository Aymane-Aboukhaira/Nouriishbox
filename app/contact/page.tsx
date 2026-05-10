"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Mail, Phone, MapPin, Clock, Send, Instagram, Facebook, Twitter, ArrowRight, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F4] overflow-x-hidden">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative pt-[140px] pb-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-sm font-bold text-[#C4602A] uppercase tracking-[0.2em] font-sans block mb-4">Contact</span>
          <h1 className="font-serif text-5xl md:text-6xl text-[#1A1A1A] tracking-tight mb-4">Parlons ensemble</h1>
          <p className="text-lg text-[#6B6B6B] font-sans max-w-xl mx-auto">Une question, un partenariat, ou simplement envie de discuter nutrition ? Nous sommes là.</p>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* LEFT: Contact info */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-8">
            <div className="bg-[#2C3E2D] rounded-[24px] p-8 text-[#F5F0E8]">
              <h3 className="font-serif text-2xl mb-6">Coordonnées</h3>
              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Email", value: "hello@nourishbox.ma", href: "mailto:hello@nourishbox.ma" },
                  { icon: Phone, label: "Téléphone", value: "+212 6 00 00 00 00", href: "tel:+212600000000" },
                  { icon: MapPin, label: "Adresse", value: "Tanger, Maroc", href: "#" },
                  { icon: Clock, label: "Horaires", value: "Lun–Ven, 9h–18h", href: "#" },
                ].map((item, i) => (
                  <a key={i} href={item.href} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F0E8]/10 flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-[#C4602A]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#F5F0E8]/50 font-sans font-semibold uppercase tracking-wider">{item.label}</p>
                      <p className="text-[#F5F0E8] font-sans font-medium group-hover:text-[#C4602A] transition-colors">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              <hr className="border-[#F5F0E8]/10 my-8" />

              <h4 className="text-xs text-[#F5F0E8]/50 font-sans font-semibold uppercase tracking-wider mb-4">Suivez-nous</h4>
              <div className="flex gap-3">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full border border-[#F5F0E8]/20 flex items-center justify-center text-[#F5F0E8] hover:bg-[#C4602A] hover:border-[#C4602A] transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="space-y-3">
              {[
                { label: "Centre d'aide & FAQ", href: "/help" },
                { label: "Demande presse", href: "/press" },
                { label: "Carrières", href: "/careers" },
              ].map((link, i) => (
                <a key={i} href={link.href} className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#E8E3DB] hover:border-[#C4602A] transition-colors group">
                  <span className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#C4602A] transition-colors">{link.label}</span>
                  <ArrowRight size={16} className="text-[#9C9C9C] group-hover:text-[#C4602A] transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3">
            <div className="bg-white rounded-[24px] p-8 md:p-10 border border-[#E8E3DB] shadow-sm">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle size={56} className="text-[#6BC4A0] mb-6" />
                  <h3 className="font-serif text-2xl text-[#1A1A1A] mb-2">Message envoyé !</h3>
                  <p className="text-[#6B6B6B] font-sans mb-8">Nous reviendrons vers vous dans les 24 heures ouvrées.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="text-sm font-bold text-[#C4602A] hover:underline">Envoyer un autre message</button>
                </motion.div>
              ) : (
                <>
                  <h3 className="font-serif text-2xl text-[#1A1A1A] mb-6">Envoyez-nous un message</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-[#6B6B6B] mb-2 uppercase tracking-wider">Nom complet</label>
                        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" className="w-full px-5 py-3.5 rounded-xl bg-[#FAFAF7] border border-[#E8E3DB] text-[#1A1A1A] placeholder:text-[#9C9C9C] outline-none focus:border-[#6BC4A0] transition-colors font-sans" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6B6B6B] mb-2 uppercase tracking-wider">Email</label>
                        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="votre@email.com" className="w-full px-5 py-3.5 rounded-xl bg-[#FAFAF7] border border-[#E8E3DB] text-[#1A1A1A] placeholder:text-[#9C9C9C] outline-none focus:border-[#6BC4A0] transition-colors font-sans" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6B6B6B] mb-2 uppercase tracking-wider">Sujet</label>
                      <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-5 py-3.5 rounded-xl bg-[#FAFAF7] border border-[#E8E3DB] text-[#1A1A1A] outline-none focus:border-[#6BC4A0] transition-colors font-sans">
                        <option value="">Choisir un sujet</option>
                        <option>Question générale</option>
                        <option>Problème de livraison</option>
                        <option>Facturation</option>
                        <option>Partenariat / Presse</option>
                        <option>Candidature spontanée</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6B6B6B] mb-2 uppercase tracking-wider">Message</label>
                      <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Décrivez votre demande..." rows={5} className="w-full px-5 py-3.5 rounded-xl bg-[#FAFAF7] border border-[#E8E3DB] text-[#1A1A1A] placeholder:text-[#9C9C9C] outline-none focus:border-[#6BC4A0] transition-colors font-sans resize-none" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-[#2C3E2D] text-[#F5F0E8] py-4 rounded-full text-base font-bold font-sans shadow-lg hover:bg-[#1A1A1A] transition-colors flex items-center justify-center gap-3">
                      <Send size={18} /> Envoyer le message
                    </motion.button>
                    <p className="text-xs text-[#9C9C9C] text-center font-sans">Nous répondons généralement sous 24h les jours ouvrables.</p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
