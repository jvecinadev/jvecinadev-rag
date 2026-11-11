<?php

namespace Database\Seeders;

use App\Models\Experience;
use App\Models\Post;
use App\Models\Project;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Project::query()->delete();
        Post::query()->delete();
        Experience::query()->delete();

        // =====================================================================
        // REAL PROJECTS
        // =====================================================================

        // 1. Plinth
        Project::create([
            'title' => 'Plinth',
            'slug' => 'plinth',
            'summary' => 'Multi-tenant SaaS for managing clients, projects, and tasks across workspaces with RBAC and a cached metrics dashboard.',
            'description' => "Plinth models a production-style multi-tenant SaaS. Data is workspace-scoped and role-based access is enforced on every mutating endpoint. Inputs are validated with Zod before controllers run, and a dashboard endpoint is cached in Redis with explicit invalidation on writes.\n\nThe project is built with a layered modular backend (routes/controller/service/model/validation) and an integration test suite with Jest + Supertest.",
            'highlights' => [
                'Workspace-based multi-tenancy with granular roles (owner, admin, member, viewer), member invites, and seamless workspace switching.',
                'Validation-first REST API using Zod schemas on every route and JWT authentication via httpOnly cookies.',
                'Jest + Supertest integration test suite verifying strict tenant isolation and soft-delete behavior across workspaces.',
                'Metrics dashboard powered by MongoDB aggregation pipelines and cached in Redis with explicit write-through invalidation.',
                'Dockerized frontend and backend with a GitHub Actions CI pipeline running build and integration tests on every push.',
            ],
            'tags' => [
                'React 19', 'TypeScript', 'Node.js', 'Express 5', 'MongoDB', 'Mongoose',
                'Redis', 'Zod', 'JWT', 'httpOnly Cookies', 'Jest', 'Supertest',
                'Docker', 'GitHub Actions', 'Tailwind CSS', 'Vite', 'REST API',
            ],
            'url' => 'https://workpilot-beige.vercel.app/',
            'github_url' => 'https://github.com/jvecinadev/plinth',
            'live_url' => 'https://workpilot-beige.vercel.app/',
            'images' => [
                'https://res.cloudinary.com/dn8e584nq/image/upload/v1787955399/plinth_cover.png',
            ],
            'featured' => true,
            'body' => implode("\n\n", [
                "Project Overview: Plinth (live at https://workpilot-beige.vercel.app/, repo at https://github.com/jvecinadev/plinth) is a featured multi-tenant SaaS platform built by John Francis Vecina for managing clients, projects, and tasks across team workspaces with strict role-based access control (RBAC) and a Redis-cached metrics dashboard.",
                "Multi-Tenancy & RBAC Architecture: Data in Plinth is strictly workspace-scoped. Every workspace supports four roles—owner, admin, member, and viewer—along with member invitations and workspace switching. Role permissions are enforced via middleware on every mutating endpoint so one tenant can never read or mutate another workspace's resources.",
                "Validation, Auth & Layered Backend: Structured using a clean layered modular architecture (routes, controller, service, model, validation). Every incoming request is validated with Zod schemas before controllers execute. Authentication uses JWTs stored in secure httpOnly cookies rather than localStorage to mitigate XSS risks.",
                "Caching, Testing & CI/CD: The workspace metrics dashboard runs MongoDB aggregation pipelines and caches results in Redis with explicit cache invalidation whenever underlying clients, projects, or tasks change. Reliability is enforced with a Jest and Supertest integration suite testing tenant isolation and soft-delete behavior, running inside Docker and GitHub Actions on every push.",
            ]),
        ]);

        // 2. Bantay PH
        Project::create([
            'title' => 'Bantay PH',
            'slug' => 'bantay-ph',
            'summary' => 'Full-stack community issue-reporting platform for barangay-level governance with RBAC and a strict verification/resolution pipeline.',
            'description' => "Bantay PH is a full-stack community issue-reporting platform designed for barangay-level (Philippine local government) governance. Residents submit reports (potholes, flooding, broken streetlights), which move through a strict verification and resolution pipeline handled by validators and staff. The backend uses Node.js, Express, Prisma, and MySQL with a layered modular architecture, while the frontend uses React, TypeScript, Tailwind, and TanStack Query.",
            'highlights' => [
                'Database-driven RBAC with role-to-permission mapping resolved dynamically per request rather than hardcoded in JWT payloads.',
                'Enforced report lifecycle state machine with transactional, race-condition-safe status updates and a complete audit trail.',
                'Deliberate Prisma + MySQL schema design: decimal-precision geolocation coordinates, unique verification constraints per validator, and explicit cascade/restrict delete rules.',
                'React 19 + TypeScript frontend using TanStack Query for server state, Zustand for auth state, and a Leaflet-based interactive location picker.',
                'Layered modular Express 5 backend deployed live at bantay-ph-five.vercel.app.',
            ],
            'tags' => [
                'React 19', 'TypeScript', 'Node.js', 'Express 5', 'Prisma', 'MySQL',
                'TanStack Query', 'Zustand', 'Tailwind CSS', 'Leaflet', 'Zod',
                'JWT', 'httpOnly Cookies', 'RBAC', 'Vite', 'REST API', 'Vercel', 'Render', 'Git',
            ],
            'url' => 'https://bantay-ph-five.vercel.app',
            'github_url' => 'https://github.com/jvecinadev/bantay-ph',
            'live_url' => 'https://bantay-ph-five.vercel.app',
            'images' => [
                'https://res.cloudinary.com/dn8e584nq/image/upload/v1789970739/bantaycover.png',
            ],
            'featured' => true,
            'body' => implode("\n\n", [
                "Project Overview: Bantay PH (formerly referenced as BarangayWatch, live at https://bantay-ph-five.vercel.app, repo at https://github.com/jvecinadev/bantay-ph) is a full-stack community issue-reporting platform built for Philippine local government (barangay) use. Residents report civic issues like potholes, flooding, and broken streetlights, which validators verify and barangay staff resolve through an enforced workflow.",
                "Database-Driven RBAC & State Machine: Instead of hardcoding permissions inside a static JWT, Bantay PH resolves role-to-permission mappings from the MySQL database per request. Report transitions follow a strict lifecycle state machine wrapped in database transactions so concurrent staff actions cannot trigger race conditions or skip verification steps, leaving a complete audit trail.",
                "Relational Schema Design (Prisma + MySQL): Engineered with deliberate relational constraints in Prisma and MySQL, including decimal-precision latitude/longitude coordinates for map pinning, unique compound constraints preventing duplicate verifications by the same validator, and explicit per-relation cascade vs. restrict delete rules.",
                "Frontend Architecture: Built with React 19, TypeScript, and Tailwind CSS, pairing TanStack Query for cache-aware server state synchronization, Zustand for client auth state, and Leaflet for interactive geolocation map picking.",
            ]),
        ]);

        // 3. Alaala Collections
        Project::create([
            'title' => 'Alaala Collections - Event Management Platform',
            'slug' => 'alaala-collections',
            'summary' => 'Production MERN platform for an events company: services, reservations, galleries, reviews, and a secure admin dashboard for content + operations.',
            'description' => "Alaala Collections is a full-stack event management platform built to modernize client booking and content management for a professional events business.\n\nClients can explore services, submit reservations, view galleries, and read/submit reviews. Administrators manage services, reservations, galleries, and review moderation through protected dashboard routes.",
            'highlights' => [
                'End-to-end event reservation workflow with booking status tracking and administrative approval controls.',
                'Protected admin dashboard for managing event service packages, reservations, galleries, and customer review moderation.',
                'Cloud-hosted media gallery pipeline integrated with Cloudinary for optimized event photography delivery.',
                'RESTful Node.js + Express API backed by MongoDB with JWT-based authentication and protected routes.',
                'Production case study deployed live at alaalacollections.site for a real events company.',
            ],
            'tags' => [
                'React', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'Tailwind CSS',
                'JWT', 'Cloudinary', 'Vite', 'REST API', 'Axios', 'React Router', 'Render',
            ],
            'url' => 'https://alaalacollections.site',
            'github_url' => 'https://github.com/jvecinadev/event-management-platform-case-study',
            'live_url' => 'https://alaalacollections.site',
            'images' => [
                'https://res.cloudinary.com/dn8e584nq/image/upload/v1787956838/alaala_cover.png',
            ],
            'featured' => true,
            'body' => implode("\n\n", [
                "Overview & Problem: Alaala Collections (live at https://alaalacollections.site, case study repo at https://github.com/jvecinadev/event-management-platform-case-study) is a production full-stack MERN event management platform built by John Francis Vecina to modernize client booking, service discovery, and daily operations for an events business.",
                "Client Booking & Gallery Experience: Prospective clients can browse event packages, submit reservations with event dates and details, explore high-resolution event galleries hosted on Cloudinary, and read or submit customer reviews.",
                "Admin Dashboard & Moderation: Administrators log in through JWT-protected dashboard routes to manage service listings, process and approve client reservations, upload gallery media, and moderate customer reviews before they go live.",
                "Tech Stack: Built with React, Vite, Tailwind CSS, React Router, and Axios on the frontend, and Node.js, Express, MongoDB, Mongoose, JWT authentication, and Cloudinary on the backend.",
            ]),
        ]);

        // 4. Vouch
        Project::create([
            'title' => 'Vouch — Local AI Security Reviewer for Git Diffs',
            'slug' => 'vouch',
            'summary' => 'Local, privacy-first security reviewer for git diffs combining static analysis (Bandit & Semgrep) with local AI triage and verified fix suggestions.',
            'description' => "Vouch is a local, privacy-first security reviewer for git diffs. It scans code changes with Bandit and Semgrep, detects removed security safeguards, triages findings using a local AI model, and suggests fixes that are automatically verified.",
            'highlights' => [
                'Privacy-first local security review pipeline that analyzes git diffs before code leaves the developer machine.',
                'Combines deterministic static analysis scanners (Bandit and Semgrep) with local AI model triage to reduce false positives.',
                'Detects removed security safeguards (such as deleted auth middleware or weakened validation checks) in diffs.',
                'Generates candidate code fixes and automatically re-verifies them against the scanners.',
            ],
            'tags' => [
                'Python', 'AI Tooling', 'Static Analysis', 'Bandit', 'Semgrep', 'Git', 'Security', 'Local LLM',
            ],
            'url' => 'https://github.com/jvecinadev/vouch',
            'github_url' => 'https://github.com/jvecinadev/vouch',
            'live_url' => null,
            'images' => [],
            'featured' => false,
            'body' => implode("\n\n", [
                "Project Overview: Vouch (repo at https://github.com/jvecinadev/vouch) is an AI-integrated developer security tool built in Python by John Francis Vecina. It acts as a local, privacy-first security reviewer for git diffs.",
                "How Vouch Works: When reviewing a git diff, Vouch runs static analysis with Bandit and Semgrep, specifically watching for newly introduced vulnerabilities as well as removed safeguards in existing code. It then uses a local AI model to triage findings, explain the risk, and propose code fixes that are automatically re-verified by the scanners.",
            ]),
        ]);

        // 5. jvecina.dev (RAG Portfolio & Predecessor)
        Project::create([
            'title' => 'jvecina.dev — AI RAG Developer Portfolio',
            'slug' => 'jvecina-dev',
            'summary' => 'Personal portfolio and citation-backed AI RAG agent built with Laravel 13, React, TypeScript, PostgreSQL pgvector, and Google Gemini.',
            'description' => "Full-stack developer & AI engineer portfolio for John Francis Vecina. Features a Retrieval-Augmented Generation (RAG) chat agent grounded over real project case studies, skills, and engineering architecture using PostgreSQL pgvector and Google Gemini.",
            'highlights' => [
                'End-to-end RAG pipeline in Laravel 13 + PHP 8.4 using raw HTTP calls to Google Gemini (gemini-embedding-001 & Gemini Flash).',
                'Paragraph-aware chunking (~400 tokens with 50-token overlap) stored in PostgreSQL 16 with 768-dimensional pgvector embeddings.',
                'Strict >0.50 cosine similarity threshold and deterministic fallback when retrieval returns 0 matching chunks to prevent hallucinations.',
                'Every AI response cites numbered sources [1], [2] and logs latency, token counts, and user feedback in rag_logs.',
            ],
            'tags' => [
                'Laravel', 'PHP', 'React', 'TypeScript', 'PostgreSQL', 'pgvector',
                'Google Gemini', 'Embeddings', 'Vector Search', 'RAG Pipelines', 'Tailwind CSS', 'Vite', 'Docker',
            ],
            'url' => 'https://jvecina-dev.vercel.app/',
            'github_url' => 'https://github.com/jvecinadev/jvecina.dev',
            'live_url' => 'https://jvecina-dev.vercel.app/',
            'images' => [],
            'featured' => false,
            'body' => implode("\n\n", [
                "Overview: jvecina.dev (predecessor live at https://jvecina-dev.vercel.app/, repo at https://github.com/jvecinadev/jvecina.dev) is John Francis Vecina's portfolio site, upgraded with a Laravel 13 + PostgreSQL pgvector + Google Gemini RAG agent.",
                "RAG Architecture: Portfolio content is split into paragraph-aware ~400-token chunks with 50-token overlap, prefixed with source titles, and embedded into 768-dimensional vectors using Google Gemini's embedding API. User questions are embedded and matched via pgvector cosine similarity (<=>) with a 0.50 floor, ensuring every answer cites its sources and refuses to hallucinate.",
            ]),
        ]);

        // =====================================================================
        // EXPERIENCES (Identity, Background, Skills Inventory & Positioning)
        // =====================================================================
        Experience::create([
            'title' => 'John Francis Vecina (jvecina.dev / jvecinadev) — Full-Stack & AI Engineer',
            'slug' => 'john-francis-vecina-profile',
            'summary' => 'Full-Stack & AI Engineer based in Manila, Philippines. Open to work for full-stack roles. Specializes in MERN + TypeScript, Prisma/MySQL, Laravel + PostgreSQL/pgvector, and RAG pipelines.',
            'tags' => [
                'React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
                'pgvector', 'Prisma', 'MySQL', 'Redis', 'Laravel', 'Google Gemini', 'RAG Pipelines',
            ],
            'url' => 'https://jvecina-dev.vercel.app/',
            'body' => implode("\n\n", [
                "Identity & Positioning: John Francis Vecina (handle: jvecina.dev / jvecinadev) is a Full-Stack & AI Engineer (Full-stack developer) based in Manila, Philippines. Status: Open to work for full-stack engineering roles.",
                "Background: IT student and full-stack developer with hands-on experience building production-style web applications end to end—spanning responsive React/TypeScript UIs, validation-first REST APIs, relational and NoSQL database design, multi-tenant application architecture, AI/RAG pipelines, and cloud deployment.",
                "Primary Stack: MERN + TypeScript (MongoDB, Express, React, Node.js, TypeScript), with recent production and capstone work spanning Prisma, MySQL, Redis, Laravel 13, PostgreSQL 16 with pgvector, and Google Gemini RAG systems.",
                "Complete Technical Skills Inventory by Group:\n"
                . "- Frontend: React, TypeScript, JavaScript, Tailwind CSS, Vite\n"
                . "- Backend: Node.js, Express, Zod, JWT, httpOnly Cookies, REST APIs\n"
                . "- Data & Caching: MongoDB, PostgreSQL, Redis, Prisma, MySQL, pgvector\n"
                . "- Quality & Infrastructure: Jest, Supertest, Docker, GitHub Actions\n"
                . "- Workflow: Git, GitHub, Postman, Figma\n"
                . "- Deployment: Vercel, Render, MongoDB Atlas\n"
                . "- AI / RAG (Differentiator): Laravel, Google Gemini, Embeddings, Vector Search, RAG Pipelines",
            ]),
        ]);

        Experience::create([
            'title' => 'Full-Stack Software Engineering & Production Case Studies',
            'slug' => 'fullstack-engineering-experience',
            'summary' => 'Built and deployed Plinth (multi-tenant SaaS), Bantay PH (LGU governance platform), Alaala Collections (live events platform), and Vouch (AI git diff security reviewer).',
            'tags' => [
                'Multi-Tenancy', 'RBAC', 'Zod', 'Jest', 'Supertest', 'Docker', 'GitHub Actions', 'Cloudinary',
            ],
            'url' => 'https://github.com/jvecinadev',
            'body' => implode("\n\n", [
                "Production & Capstone Engineering: Designed, tested, and shipped multiple end-to-end applications solving real operational problems: Alaala Collections (live event management platform at alaalacollections.site), Plinth (workspace-scoped multi-tenant SaaS with Redis caching and Jest/Supertest integration tests), Bantay PH (barangay issue-reporting system with database-driven RBAC and Prisma/MySQL state machines), and Vouch (Python + local AI security reviewer for git diffs).",
                "Engineering Discipline: Emphasizes layered backend architecture (routes, controllers, services, models, validation), strict tenant isolation, transactional database integrity, and automated CI testing with Docker and GitHub Actions.",
            ]),
        ]);

        // =====================================================================
        // POSTS (Engineering Themes: "How I Build" Story)
        // =====================================================================
        Post::create([
            'title' => 'How I Build: Auth Flows, Validation-First APIs, Tenant Isolation & Testing',
            'slug' => 'how-i-build-engineering-themes',
            'summary' => 'The core engineering themes across my projects: httpOnly cookie JWT auth, Zod validation, database-driven RBAC, Jest/Supertest integration testing, and Docker CI.',
            'tags' => ['Architecture', 'JWT', 'Zod', 'RBAC', 'Multi-Tenancy', 'Jest', 'Supertest', 'Docker'],
            'url' => 'https://github.com/jvecinadev',
            'body' => implode("\n\n", [
                "John Francis Vecina's core engineering philosophy ('How I Build') centers on five recurring themes applied across Plinth, Bantay PH, and Alaala Collections:",
                "1. Auth Flows — JWT via httpOnly Cookies & Protected Routes: Instead of storing sensitive tokens in localStorage where XSS scripts can read them, authentication flows issue JWTs inside secure httpOnly cookies paired with strict route-protection middleware on both the API and React frontend.",
                "2. Validation-First APIs — Zod Schemas & Consistent Error Responses: Every mutating API route validates request bodies, query parameters, and route params against strict Zod schemas before any controller or service logic executes, returning predictable, structured validation error responses.",
                "3. Tenant Isolation & Database-Driven RBAC: In multi-tenant and civic apps like Plinth and Bantay PH, access control goes beyond simple admin booleans. Plinth scopes every query to the active workspace across owner, admin, member, and viewer roles, while Bantay PH resolves role-to-permission mappings dynamically from the database on every request.",
                "4. Testing Mindset & Deployment-Ready Infrastructure: Where reliability and security boundaries matter—such as cross-workspace tenant isolation and soft deletes in Plinth—integration test suites using Jest and Supertest verify actual HTTP and database behavior inside Dockerized environments wired to GitHub Actions CI.",
            ]),
        ]);

        Post::create([
            'title' => 'Why I Built My Portfolio RAG Agent with Laravel, PostgreSQL pgvector, and Gemini',
            'slug' => 'why-laravel-pgvector-gemini-rag',
            'summary' => 'Keeping relational portfolio data and 768-dimensional vector embeddings in one PostgreSQL database with strict citation grounding.',
            'tags' => ['Laravel', 'PostgreSQL', 'pgvector', 'Google Gemini', 'RAG Pipelines', 'Vector Search'],
            'url' => '/work/jvecina-dev',
            'body' => implode("\n\n", [
                "As a Full-Stack & AI Engineer strong in MERN and TypeScript, building this RAG portfolio backend in Laravel 13 and PostgreSQL 16 with pgvector demonstrated cross-stack versatility while keeping vector search and relational data unified in a single database.",
                "Each project, experience entry, and engineering post is chunked into ~400-token segments with 50-token overlap, prefixed with its source title, and embedded via Google Gemini's embedding model. At query time, cosine similarity search retrieves the top 5 chunks above 0.50 similarity and requires the model to cite [1], [2] inline or say 'I don't know' when asked out-of-scope questions.",
            ]),
        ]);
    }
}