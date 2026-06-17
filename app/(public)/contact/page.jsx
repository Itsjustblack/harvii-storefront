'use client'
import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react'
import { useStorefront } from '@/context/StorefrontContext'

export default function ContactPage() {
    const { config } = useStorefront()

    if (!config) return null

    const social = config.social_links || {}
    const hasContact = config.contact_email || config.contact_phone || config.contact_address
    const hasSocial = social.instagram || social.twitter || social.facebook

    if (!hasContact && !hasSocial) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-400 mx-6">
                <p>Contact information not available.</p>
            </div>
        )
    }

    return (
        <div className="min-h-[80vh] mx-6 py-12">
            <div className="max-w-xl mx-auto">
                <h1 className="text-2xl font-semibold text-slate-800 mb-2">Get in Touch</h1>
                <p className="text-slate-500 text-sm mb-10">We'd love to hear from you.</p>

                {hasContact && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 mb-6">
                        {config.contact_email && (
                            <a href={`mailto:${config.contact_email}`} className="flex items-center gap-4 group">
                                <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-[var(--primary)] transition shrink-0">
                                    <Mail size={16} className="text-slate-500 group-hover:text-white transition" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Email</p>
                                    <p className="text-sm text-slate-800 font-medium group-hover:underline">{config.contact_email}</p>
                                </div>
                            </a>
                        )}
                        {config.contact_phone && (
                            <a href={`tel:${config.contact_phone}`} className="flex items-center gap-4 group">
                                <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-[var(--primary)] transition shrink-0">
                                    <Phone size={16} className="text-slate-500 group-hover:text-white transition" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Phone</p>
                                    <p className="text-sm text-slate-800 font-medium">{config.contact_phone}</p>
                                </div>
                            </a>
                        )}
                        {config.contact_address && (
                            <div className="flex items-start gap-4">
                                <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin size={16} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Address</p>
                                    <p className="text-sm text-slate-800">{config.contact_address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {hasSocial && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                        <p className="text-xs font-medium text-slate-500 mb-4 uppercase tracking-wide">Follow us</p>
                        <div className="flex gap-3">
                            {social.instagram && (
                                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-pink-50 hover:text-pink-600 rounded-xl text-sm text-slate-600 transition">
                                    <Instagram size={16} /> Instagram
                                </a>
                            )}
                            {social.twitter && (
                                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-600 rounded-xl text-sm text-slate-600 transition">
                                    <Twitter size={16} /> Twitter
                                </a>
                            )}
                            {social.facebook && (
                                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-sm text-slate-600 transition">
                                    <Facebook size={16} /> Facebook
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}