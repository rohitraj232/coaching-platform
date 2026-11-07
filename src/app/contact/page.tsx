
import Link from "next/link";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    ArrowRight,
    MessageCircle,
    GraduationCap,
} from "lucide-react";

import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaYoutube
} from "react-icons/fa";
import BannerCarousel from "@/components/home/BannerCarousel";

const contactDetails = [
    {
        icon: Phone,
        title: "Call Us",
        description: "Talk to our admission team",
        value: "+91 7974393519",
        href: "tel:7974393519",
    },
    {
        icon: Mail,
        title: "Email Us",
        description: "Send us your questions",
        value: "accelerateacademy0@gmail.com",
        href: "mailto:accelerateacademy0@gmail.com",
    },
    {
        icon: MapPin,
        title: "Visit Us",
        description: "Come and meet our team",
        value: "Pal Nagar, near Circus Ground, Fathepur, Siwan, Bihar",
        href: "#",
    },
    {
        icon: Clock,
        title: "Working Hours",
        description: "We are available for you",
        value: "Mon – Sat, 6am to 9am and 3pm to 8pm",
        href: null,
    },
];

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-slate-950 px-5 py-20 sm:py-24">
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-600/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl flex items-center justify-center">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-orange-300">
                            <MessageCircle size={16} />
                            We'd love to hear from you
                        </span>

                        <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Let's Start a
                            <span className="block text-orange-500">
                                Conversation.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                            Have questions about our courses, admissions, or learning
                            programs? Our team is here to help you take the next step
                            towards your academic goals.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <a
                                href="#contact-form"
                                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-700"
                            >
                                Get in Touch
                                <ArrowRight size={18} />
                            </a>

                            <a
                                href="tel:+919876543210"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
                            >
                                <Phone size={17} />
                                Call Our Team
                            </a>
                        </div>
                    </div>
                    <div className="relative z-10 mx-auto aspect-[4/5] w-[76%] max-w-[390px] hidden md:block">
                        <img
                            src="/images/teacher/main.png"
                            alt="Manish Sir"
                            className="object-contain object-bottom drop-shadow-xl"
                        />
                    </div>
                </div>
            </section>

            {/* CONTACT DETAILS */}
            <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {contactDetails.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                    <Icon size={23} />
                                </div>

                                <h3 className="mt-5 font-bold text-slate-900">
                                    {item.title}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {item.description}
                                </p>

                                {item.href ? (
                                    <a
                                        href={item.href}
                                        className="mt-4 inline-block break-words text-sm font-semibold text-orange-600 transition hover:text-orange-700"
                                    >
                                        {item.value}
                                    </a>
                                ) : (
                                    <p className="mt-4 text-sm font-semibold text-slate-800">
                                        {item.value}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CONTACT FORM SECTION */}
            <section
                id="contact-form"
                className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
            >
                {/* LEFT CONTENT */}
                <div className="flex flex-col justify-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-orange-600">
                        Contact Our Team
                    </span>

                    <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                        Have a question?
                        <span className="block text-orange-600">
                            We're here to help.
                        </span>
                    </h2>

                    <p className="mt-5 leading-8 text-slate-600">
                        Whether you need guidance choosing the right course or want
                        to know more about our learning programs, just send us a
                        message. We'll be happy to assist you.
                    </p>

                    <div className="mt-9 rounded-2xl bg-slate-950 p-7 text-white">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
                                <GraduationCap size={26} />
                            </div>
                            <div>
                                <h3 className="font-bold">Need admission guidance?</h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    Speak with our academic experts.
                                </p>
                            </div>
                        </div>

                        <a
                            href="tel:7974393519"
                            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300"
                        >
                            Talk to an expert
                            <ArrowRight size={17} />
                        </a>
                    </div>

                    <div className="mt-8">
                        <p className="text-sm font-semibold text-slate-800">
                            Follow us on social media
                        </p>

                        <div className="mt-4 flex gap-3">
                            {[
                                { icon: FaFacebookF, href: "#", label: "Facebook" },
                                { icon: FaInstagram, href: "#", label: "Instagram" },
                                // { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
                                { icon: FaYoutube, href: "https://www.youtube.com/@AccelerateAcademy2.0", label: "Youtube" },
                            ].map((social) => {
                                const Icon = social.icon;

                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        <Icon size={19} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT FORM */}
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-slate-900">
                            Send Us a Message
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Fill out the form below and we'll get back to you shortly.
                        </p>
                    </div>

                    <form action="#" method="POST" className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Full Name *
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Phone Number *
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="Enter phone number"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Email Address *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email address"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="subject"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                I am interested in *
                            </label>
                            <select
                                id="subject"
                                name="subject"
                                required
                                defaultValue=""
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-600 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                            >
                                <option value="" disabled>
                                    Select your interest
                                </option>
                                <option value="school">School Preparation</option>
                                <option value="kvs">KVS / NVS Preparation</option>
                                <option value="sainik">Sainik School Preparation</option>
                                <option value="jee">BSEB Preparation</option>
                                <option value="neet">CBSE Preparation</option>
                                <option value="other">Other Enquiry</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="message"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Your Message *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={5}
                                placeholder="Tell us how we can help you..."
                                required
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700"
                        >
                            Send Message
                            <ArrowRight size={18} />
                        </button>

                        <p className="text-center text-xs text-slate-400">
                            Your information will only be used to respond to your enquiry.
                        </p>
                    </form>
                </div>
            </section>

            {/* GOOGLE MAP */}
            <section className="px-5 py-8 mx-auto max-w-7xl">
                <div className="mb-6 ">
                    <span className="font-semibold text-orange-600">
                        Find Us
                    </span>

                    <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        Visit Accelerate Academy
                    </h2>

                    <p className="mt-2 text-slate-600">
                        Find our location on Google Maps and plan your visit.
                    </p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.1208209453466!2d84.366638474479!3d26.225263489296783!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3992fd1ef135dbc5%3A0xd3d6b749ba75a3b2!2sAccelerate%20Academy!5e0!3m2!1sen!2sin!4v1794039140091!5m2!1sen!2sin"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        title="Accelerate Academy Google Maps Location"
                        className="w-full"
                    />
                </div>
            </section>
        </main>
    );
}
