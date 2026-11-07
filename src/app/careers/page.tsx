"use client";

import { useState } from "react";
import Link from "next/link";
import {
    GraduationCap,
    Users,
    BookOpen,
    Briefcase,
    MapPin,
    IndianRupee,
    Clock,
    CheckCircle2,
    ArrowRight,
    Send,
    Award,
    HeartHandshake,
    School,
    X,
} from "lucide-react";

const positions = [
    {
        title: "Fresher Teacher",
        experience: "No experience required",
        badge: "Freshers Welcome",
        description:
            "An excellent opportunity for passionate fresh graduates who love teaching and want to build a rewarding career in education.",
        responsibilities: [
            "Teach students from Classes 1 to 8.",
            "Explain concepts in a simple and engaging way.",
            "Prepare lesson plans, worksheets and assignments.",
            "Support students with their academic progress.",
            "Maintain a positive and interactive classroom.",
        ],
        requirements: [
            "Graduation in a relevant subject is preferred.",
            "Strong subject knowledge and communication skills.",
            "Passion for teaching and learning.",
            "Willingness to learn and grow professionally.",
        ],
        experienceLabel: "0 Years",
        color: "blue",
    },
    {
        title: "Experienced Teacher",
        experience: "Minimum 1 year experience",
        badge: "Experienced",
        description:
            "We are looking for dedicated educators with classroom experience who can deliver effective lessons and help students achieve academic excellence.",
        responsibilities: [
            "Teach and mentor students from Classes 1 to 8.",
            "Plan and deliver structured classroom sessions.",
            "Prepare tests, assignments and study materials.",
            "Track student performance and provide feedback.",
            "Communicate with parents regarding student progress.",
        ],
        requirements: [
            "Minimum 1 year of teaching experience.",
            "Strong command of the relevant subject.",
            "Good classroom management skills.",
            "Excellent communication and mentoring abilities.",
        ],
        experienceLabel: "1+ Years",
        color: "orange",
    },
];

const boards = [
    {
        name: "CBSE",
        subtitle: "Central Board of Secondary Education",
        description:
            "Teach students according to the CBSE curriculum with a focus on conceptual clarity, NCERT textbooks, classroom activities and regular assessments.",
        subjects: "Mathematics, Science, English, Hindi and Social Science",
    },
    {
        name: "BSEB",
        subtitle: "Bihar School Examination Board",
        description:
            "Help students understand the Bihar Board syllabus through structured lessons, textbook-based learning, practice questions and examination preparation.",
        subjects: "Mathematics, Science, English, Hindi and Social Science",
    },
    {
        name: "KVS",
        subtitle: "Kendriya Vidyalaya Sangathan",
        description:
            "Prepare students for KVS school entrance examinations with a focus on age-appropriate concepts, reasoning, mathematics, language and general awareness.",
        subjects: "Mathematics, Reasoning, English, Hindi and General Awareness",
    },
    {
        name: "NVS",
        subtitle: "Navodaya Vidyalaya Samiti",
        description:
            "Guide students preparing for Jawahar Navodaya Vidyalaya entrance examinations through mental ability, arithmetic, language and structured practice.",
        subjects: "Mental Ability, Arithmetic and Language",
    },
    {
        name: "Sainik School",
        subtitle: "Sainik School Entrance Preparation",
        description:
            "Train students for Sainik School entrance examinations with a focus on mathematics, intelligence, language, general knowledge and examination strategies.",
        subjects: "Mathematics, Intelligence, English, General Knowledge and Language",
    },
    {
        name: "ICSE",
        subtitle: "Indian Certificate of Secondary Education",
        description:
            "Teach students according to the ICSE curriculum, focusing on strong conceptual understanding, detailed subject knowledge, analytical thinking, practical learning and regular assessments.",
        subjects:
            "English, Mathematics, Science, History, Geography and Computer Applications",
    },
];

const benefits = [
    {
        icon: IndianRupee,
        title: "Best in Industry Salary",
        description: "Competitive salary packages based on skills and experience.",
    },
    {
        icon: GraduationCap,
        title: "Career Growth",
        description: "Opportunities to develop your teaching and professional skills.",
    },
    {
        icon: Users,
        title: "Supportive Team",
        description: "Work with a collaborative and learning-focused team.",
    },
    {
        icon: Award,
        title: "Recognition",
        description: "Get recognized for your contribution to student success.",
    },
];

export default function CareersPage() {
    const [selectedPosition, setSelectedPosition] = useState("");
    const [selectedBoard, setSelectedBoard] = useState("");
    const [showForm, setShowForm] = useState(false);

    const openApplication = (position: string) => {
        setSelectedPosition(position);
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const name = formData.get("name");
        const phone = formData.get("phone");
        const email = formData.get("email");
        const qualification = formData.get("qualification");
        const experience = formData.get("experience");
        const subject = formData.get("subject");
        const message = formData.get("message");

        const whatsappMessage = `
            Hello Accelerate Academy!

            I want to apply for a teaching position.

            Name: ${name}
            Phone: ${phone}
            Email: ${email}
            Position: ${selectedPosition}
            Board: ${selectedBoard}
            Qualification: ${qualification}
            Experience: ${experience}
            Preferred Subject: ${subject}
            Message: ${message}
        `;

        window.open(
            `https://wa.me/917974393519?text=${encodeURIComponent(whatsappMessage)}`,
            "_blank"
        );

        setShowForm(false);
    };

    return (
        <main className="overflow-hidden bg-white">

            {/* HERO SECTION */}
            <section className="relative isolate overflow-hidden bg-slate-950">
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8">

                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-semibold text-orange-300">
                            <HeartHandshake size={17} />
                            Build Your Career With Us
                        </span>

                        <h1 className="mt-7 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                            Inspire Students.
                            <span className="block text-orange-400">
                                Shape The Future.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                            Join Accelerate Academy as a teacher and make a meaningful
                            difference in students' lives. Whether you are a fresher or
                            an experienced educator, we welcome passionate teachers.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#openings"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-4 font-bold text-white transition hover:bg-orange-600"
                            >
                                Explore Openings
                                <ArrowRight size={18} />
                            </a>

                            <a
                                href="#why-join"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 font-bold text-white transition hover:bg-white/10"
                            >
                                Why Join Us?
                            </a>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="text-orange-400" size={17} />
                                Freshers Welcome
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="text-orange-400" size={17} />
                                1+ Year Experience
                            </span>
                        </div>
                    </div>

                    {/* HERO INFO CARD */}
                    <div className="relative mx-auto w-full max-w-md">
                        <div className="absolute inset-0 rotate-6 rounded-[32px] bg-orange-500/20" />

                        <div className="relative rounded-[32px] border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                                <GraduationCap size={34} />
                            </div>

                            <h2 className="mt-7 text-2xl font-extrabold text-slate-900">
                                We're Hiring Teachers!
                            </h2>

                            <p className="mt-3 leading-7 text-slate-600">
                                Become a part of an educational team that believes in
                                quality teaching, student development and continuous growth.
                            </p>

                            <div className="mt-7 space-y-4">
                                {[
                                    "Classes 1 to 8",
                                    "CBSE & BSEB Curriculum",
                                    "KVS, NVS & Sainik School Preparation",
                                    "Best in Industry Salary",
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <CheckCircle2
                                            size={19}
                                            className="shrink-0 text-emerald-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 rounded-2xl bg-orange-50 p-5">
                                <p className="text-sm font-semibold text-orange-700">
                                    Teaching Location
                                </p>
                                <p className="mt-2 flex items-center gap-2 font-bold text-slate-900">
                                    <MapPin size={18} className="text-orange-500" />
                                    Accelerate Academy, [Siwan, Bihar]
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    On-site teaching position
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* JOB OPENINGS */}
            <section id="openings" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <span className="font-bold text-orange-600">
                            CURRENT OPPORTUNITIES
                        </span>

                        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                            Teaching Positions
                        </h2>

                        <p className="mt-4 leading-7 text-slate-600">
                            Find the right opportunity and start your teaching journey
                            with Accelerate Academy.
                        </p>
                    </div>

                    <div className="grid gap-7 lg:grid-cols-2">
                        {positions.map((position) => (
                            <div
                                key={position.title}
                                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-8"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                                        <Briefcase size={27} />
                                    </div>

                                    <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                                        {position.badge}
                                    </span>
                                </div>

                                <h3 className="mt-6 text-2xl font-extrabold text-slate-900">
                                    {position.title}
                                </h3>

                                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={16} />
                                        {position.experience}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen size={16} />
                                        Classes 1–8
                                    </span>
                                </div>

                                <p className="mt-5 leading-7 text-slate-600">
                                    {position.description}
                                </p>

                                <div className="mt-7">
                                    <h4 className="font-bold text-slate-900">
                                        Key Responsibilities
                                    </h4>

                                    <ul className="mt-4 space-y-3">
                                        {position.responsibilities.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
                                            >
                                                <CheckCircle2
                                                    size={17}
                                                    className="mt-1 shrink-0 text-emerald-500"
                                                />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-7 border-t border-slate-100 pt-6">
                                    <h4 className="font-bold text-slate-900">
                                        Requirements
                                    </h4>

                                    <ul className="mt-4 space-y-3">
                                        {position.requirements.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
                                            >
                                                <CheckCircle2
                                                    size={17}
                                                    className="mt-1 shrink-0 text-orange-500"
                                                />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-7 rounded-2xl bg-orange-50 p-4">
                                    <p className="flex items-center gap-2 font-bold text-orange-800">
                                        <IndianRupee size={18} />
                                        Best in Industry Salary
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-orange-700">
                                        Attractive compensation based on qualification,
                                        subject expertise and experience.
                                    </p>
                                </div>

                                <button
                                    onClick={() => openApplication(position.title)}
                                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 font-bold text-white transition hover:bg-orange-700"
                                >
                                    Apply for This Position
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BOARD OPPORTUNITIES */}
            <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <span className="font-bold text-orange-600">
                            SUBJECT & EXAM EXPERTISE
                        </span>

                        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                            Teaching Opportunities Across Boards
                        </h2>

                        <p className="mt-4 leading-7 text-slate-600">
                            We welcome educators who can teach school curriculum and
                            prepare students for competitive school entrance examinations.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {boards.map((board, index) => (
                            <div
                                key={board.name}
                                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                    <School size={24} />
                                </div>

                                <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                                    {board.name}
                                </h3>

                                <p className="mt-1 text-xs font-semibold text-orange-600">
                                    {board.subtitle}
                                </p>

                                <p className="mt-4 text-sm leading-7 text-slate-600">
                                    {board.description}
                                </p>

                                <div className="mt-5 border-t border-slate-100 pt-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Relevant Subjects
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {board.subjects}
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedBoard(board.name);
                                        setSelectedPosition("");
                                        setShowForm(true);
                                    }}
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-600 transition hover:text-orange-700"
                                >
                                    Apply for this board
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY JOIN US */}
            <section id="why-join" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <span className="font-bold text-orange-600">
                            WHY ACCELERATE ACADEMY?
                        </span>

                        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                            Grow With a Purpose
                        </h2>

                        <p className="mt-4 leading-7 text-slate-600">
                            We believe great teachers create great futures. Join a team
                            that values your skills and supports your professional growth.
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {benefits.map((benefit) => {
                            const Icon = benefit.icon;

                            return (
                                <div
                                    key={benefit.title}
                                    className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                        <Icon size={24} />
                                    </div>

                                    <h3 className="mt-5 font-bold text-slate-900">
                                        {benefit.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {benefit.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* LOCATION */}
            <section className="bg-slate-950 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div>
                        <span className="font-bold text-orange-400">
                            WORK WITH US
                        </span>

                        <h2 className="mt-3 text-3xl font-extrabold text-white">
                            Join Our Teaching Team
                        </h2>

                        <p className="mt-4 max-w-xl leading-7 text-slate-300">
                            Our teaching positions are based at Accelerate Academy.
                            We welcome dedicated educators who want to help students
                            learn, improve and succeed.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-300">
                            <span className="flex items-center gap-2">
                                <MapPin size={18} className="text-orange-400" />
                                [Siwan, Bihar]
                            </span>

                            <span className="flex items-center gap-2">
                                <Briefcase size={18} className="text-orange-400" />
                                On-site
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedPosition("");
                            setSelectedBoard("");
                            setShowForm(true);
                        }}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-7 py-4 font-bold text-white transition hover:bg-orange-600"
                    >
                        Apply Now
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* APPLICATION MODAL */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
                    <div className="relative my-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                        <button
                            onClick={() => setShowForm(false)}
                            className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                            aria-label="Close application form"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-7 pr-10">
                            <span className="font-bold text-orange-600">
                                CAREER APPLICATION
                            </span>

                            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                                Apply at Accelerate Academy
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Fill in your details to apply for a teaching opportunity.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Full Name *
                                    </label>
                                    <input
                                        name="name"
                                        required
                                        placeholder="Enter your full name"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Phone Number *
                                    </label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        placeholder="10-digit mobile number"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Email Address *
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="Enter your email"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Qualification *
                                    </label>
                                    <input
                                        name="qualification"
                                        required
                                        placeholder="e.g. B.Sc, B.A, B.Ed"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Applying For *
                                    </label>
                                    <select
                                        required
                                        value={selectedPosition}
                                        onChange={(e) => setSelectedPosition(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    >
                                        <option value="">Select position</option>
                                        <option value="Fresher Teacher">Fresher Teacher</option>
                                        <option value="Experienced Teacher">Experienced Teacher</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Preferred Board *
                                    </label>
                                    <select
                                        required
                                        value={selectedBoard}
                                        onChange={(e) => setSelectedBoard(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    >
                                        <option value="">Select board</option>
                                        {boards.map((board) => (
                                            <option key={board.name} value={board.name}>
                                                {board.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Teaching Experience *
                                    </label>
                                    <select
                                        name="experience"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    >
                                        <option value="">Select experience</option>
                                        <option value="Fresher">Fresher</option>
                                        <option value="Less than 1 year">Less than 1 year</option>
                                        <option value="1–2 years">1–2 years</option>
                                        <option value="3–5 years">3–5 years</option>
                                        <option value="5+ years">5+ years</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Preferred Subject *
                                    </label>
                                    <input
                                        name="subject"
                                        required
                                        placeholder="e.g. Mathematics, Science"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Additional Information
                                </label>
                                <textarea
                                    name="message"
                                    rows={3}
                                    placeholder="Tell us about your teaching skills or experience..."
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 font-bold text-white transition hover:bg-orange-700"
                            >
                                <Send size={18} />
                                Submit Application on WhatsApp
                            </button>

                            <p className="text-center text-xs text-slate-500">
                                Your application details will be prepared in WhatsApp.
                                You must press Send there to submit your application.
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}