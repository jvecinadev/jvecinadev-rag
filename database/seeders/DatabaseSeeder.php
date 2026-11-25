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
        // 5. PROJECTS (Top 4 Featured + Alaala Collections demoted)
        // =====================================================================

        // Project 1: Plinth
        Project::create([
            'title' => 'Plinth',
            'slug' => 'plinth',
            'summary' => 'Multi-tenant B2B SaaS for managing clients, projects, and tasks across workspaces with 4-tier RBAC and a Redis-cached metrics dashboard.',
            'description' => "Plinth models a production-style multi-tenant B2B SaaS. Data is workspace-scoped with tenant isolation enforced at the database query level, and 4-tier role-based access control (owner, admin, member, viewer) is enforced on every mutating endpoint. Inputs are validated with Zod before controllers run, and the metrics dashboard is cached in Redis with explicit write invalidation.\n\nBuilt with a layered modular backend (routes/controller/service/model/validation) and verified by a Jest + Supertest integration test suite.",
            'highlights' => [
                'Tenant isolation enforced directly at the database query level across workspaces.',
                '4-tier RBAC (owner, admin, member, viewer) enforced on every mutating endpoint, with member invites and workspace switching.',
                'Validation-first REST API using Zod schemas and JWT authentication via httpOnly cookies.',
                'Workspace metrics dashboard backed by MongoDB aggregation pipelines and cached in Redis with explicit invalidation on writes.',
                'Integration test suite with Jest + Supertest covering tenant isolation and soft-delete behavior inside Docker + GitHub Actions CI.',
            ],
            'tags' => [
                'React 19', 'TypeScript', 'Node.js', 'Express 5', 'MongoDB', 'Redis',
                'Zod', 'Docker', 'Jest', 'Supertest', 'JWT', 'httpOnly Cookies',
                'GitHub Actions', 'Tailwind CSS', 'Vite',
            ],
            'url' => 'https://workpilot-beige.vercel.app/',
            'github_url' => 'https://github.com/jvecinadev/plinth',
            'live_url' => 'https://workpilot-beige.vercel.app/',
            'images' => [
                'https://res.cloudinary.com/dn8e584nq/image/upload/v1787955399/plinth_cover.png',
            ],
            'featured' => true,
            'body' => implode("\n\n", [
                "What It Is: Plinth (live at https://workpilot-beige.vercel.app/, GitHub: https://github.com/jvecinadev/plinth) is a multi-tenant B2B SaaS platform built by John Francis Vecina for managing clients, projects, and tasks across team workspaces.",
                "Engineering Proof & Architecture: Tenant isolation is enforced at the database query level so workspace data never leaks across tenants. Every mutating endpoint enforces a 4-tier RBAC model (owner, admin, member, viewer) and validates inputs with Zod schemas before controllers run. Authentication uses JWTs in httpOnly cookies.",
                "Caching & Verification: The workspace metrics dashboard uses MongoDB aggregation pipelines cached in Redis with explicit cache invalidation on writes. Cross-tenant isolation and soft-delete behavior are verified with an automated Jest + Supertest integration test suite running in Docker and GitHub Actions.",
            ]),
        ]);

        // Project 2: Bantay PH
        Project::create([
            'title' => 'Bantay PH',
            'slug' => 'bantay-ph',
            'summary' => 'Civic issue-reporting platform for barangay-level governance with per-request DB RBAC and race-condition-safe verification workflows.',
            'description' => "Bantay PH is a full-stack community issue-reporting platform designed for barangay-level (Philippine local government) governance. Residents submit civic reports (potholes, flooding, broken streetlights), which move through a strict verification and resolution pipeline handled by validators and staff. The backend uses Node.js, Express 5, Prisma, and MySQL with a layered modular architecture, while the frontend uses React 19, TypeScript, Tailwind CSS, TanStack Query, and Zustand.",
            'highlights' => [
                'Per-request database permission resolution (role-to-permission mapping resolved dynamically from MySQL rather than relying on stale JWT roles).',
                'Race-condition-safe transactional state machine enforcing the report verification and resolution lifecycle.',
                'Complete status history and immutable audit trails for every civic report transition.',
                'Prisma + MySQL schema with decimal-precision geolocation coordinates, unique validator verification constraints, and explicit cascade/restrict rules.',
                'React 19 + TypeScript frontend powered by TanStack Query, Zustand, and a Leaflet interactive map picker.',
            ],
            'tags' => [
                'React 19', 'TypeScript', 'Node.js', 'Express 5', 'Prisma', 'MySQL',
                'TanStack Query', 'Zustand', 'Tailwind CSS', 'Leaflet', 'Zod', 'RBAC', 'Vercel',
            ],
            'url' => 'https://bantay-ph-five.vercel.app',
            'github_url' => 'https://github.com/jvecinadev/bantay-ph',
            'live_url' => 'https://bantay-ph-five.vercel.app',
            'images' => [
                'https://res.cloudinary.com/dn8e584nq/image/upload/v1789970739/bantaycover.png',
            ],
            'featured' => true,
            'body' => implode("\n\n", [
                "What It Is: Bantay PH (live at https://bantay-ph-five.vercel.app, GitHub: https://github.com/jvecinadev/bantay-ph) is a civic issue-reporting platform for barangay-level governance in the Philippines where residents submit issues, validators verify them, and staff resolve them.",
                "Engineering Proof & Architecture: Enforces per-request database permission resolution so role-to-permission changes take effect immediately without stale JWT roles. Report status transitions run inside a race-condition-safe transactional state machine in MySQL + Prisma with complete history and audit trails.",
                "Schema & Frontend State: The Prisma schema enforces decimal-precision map coordinates, unique verification per validator, and deliberate cascade/restrict rules. The React 19 + TypeScript frontend pairs TanStack Query for server state, Zustand for auth state, and Leaflet for map pinning.",
            ]),
        ]);

        // Project 3: Vouch
        Project::create([
            'title' => 'Vouch',
            'slug' => 'vouch',
            'summary' => 'Local, privacy-first AI security reviewer for git diffs using Bandit, Semgrep, tree-sitter, and Ollama with automated patch verification and SARIF export.',
            'description' => "Vouch is a local, privacy-first AI security reviewer for git diffs. It scans code changes with Bandit, Semgrep, and tree-sitter AST analysis, detects removed security safeguards, triages findings using a local AI model via Ollama, and verifies candidate patches through an automated apply → parse → confirm pipeline before exporting SARIF reports.",
            'highlights' => [
                'Detects both newly introduced vulnerabilities and removed security safeguards in git diffs using Bandit, Semgrep, and tree-sitter.',
                'Privacy-first local AI triage powered by Ollama so proprietary source code never leaves the developer machine.',
                'Automated patch verification loop (apply → parse → confirm) that validates AI-suggested fixes against syntax and security scanners.',
                'Exports standardized SARIF reports for seamless integration with GitHub Code Scanning and CI workflows.',
                'Interactive Gradio UI and CLI tested with pytest.',
            ],
            'tags' => [
                'Python', 'Gradio', 'Ollama', 'Bandit', 'Semgrep', 'tree-sitter', 'Git', 'pytest', 'SARIF',
            ],
            'url' => 'https://github.com/jvecinadev/vouch',
            'github_url' => 'https://github.com/jvecinadev/vouch',
            'live_url' => null,
            'images' => [],
            'featured' => true,
            'body' => implode("\n\n", [
                "What It Is: Vouch (GitHub: https://github.com/jvecinadev/vouch) is a local, privacy-first AI security reviewer for git diffs built in Python by John Francis Vecina.",
                "Engineering Proof & Pipeline: Vouch combines static analysis (Bandit, Semgrep) and AST parsing (tree-sitter) to detect vulnerabilities and removed safeguards in git diffs. It triages findings using a local LLM via Ollama and runs an automated patch verification loop (apply → parse → confirm) to guarantee suggested fixes compile and resolve the finding. Supports SARIF export and includes a Gradio interface and pytest test suite.",
            ]),
        ]);

        // Project 4: jvecina.dev
        Project::create([
            'title' => 'jvecina.dev',
            'slug' => 'jvecina-dev',
            'summary' => 'Full-stack developer portfolio with grounded RAG AI agent powered by PostgreSQL pgvector, Gemini embeddings, and live GitHub README sync.',
            'description' => "Full-stack portfolio and grounded Retrieval-Augmented Generation (RAG) AI agent for John Francis Vecina. Combines PostgreSQL pgvector and Google Gemini embeddings for citation-backed Q&A over projects and experience, with build-time project synchronization and live GitHub README fetching to prevent documentation drift.",
            'highlights' => [
                'Grounded RAG pipeline using PostgreSQL 16 pgvector (768-dim cosine similarity search) and Google Gemini embeddings.',
                'Build step syncs project metadata and pulls live GitHub README content to prevent portfolio drift.',
                'Strict >0.50 cosine similarity threshold and deterministic fallback when retrieval returns 0 matching chunks.',
                'Full request telemetry in rag_logs tracking latency, token consumption, cited chunks, and user feedback.',
            ],
            'tags' => [
                'PostgreSQL', 'pgvector', 'Laravel', 'FastAPI', 'Python', 'Gemini API', 'React 19', 'TypeScript', 'Tailwind CSS',
            ],
            'url' => 'https://jvecinadev-rag.vercel.app/',
            'github_url' => 'https://github.com/jvecinadev/jvecina.dev',
            'live_url' => 'https://jvecinadev-rag.vercel.app/',
            'images' => [],
            'featured' => true,
            'body' => implode("\n\n", [
                "What It Is: jvecina.dev (live at https://jvecinadev-rag.vercel.app/, GitHub: https://github.com/jvecinadev/jvecina.dev) is John Francis Vecina's developer portfolio featuring a grounded RAG AI agent.",
                "Engineering Proof: Uses PostgreSQL pgvector and Gemini embeddings (768 dimensions) for semantic retrieval with inline [1], [2] source citations and zero-hallucination guardrails. Syncs project data and pulls live GitHub READMEs to prevent documentation drift between repositories and the portfolio.",
            ]),
        ]);

        // Project 5: Alaala Collections (Demoted to non-featured / text mention)
        Project::create([
            'title' => 'Alaala Collections',
            'slug' => 'alaala-collections',
            'summary' => 'Production MERN event management and client reservation platform with Cloudinary galleries, review moderation, and a JWT admin dashboard.',
            'description' => "Alaala Collections is a production full-stack MERN event management platform built for a freelance events business client. Clients browse services, submit reservations, view Cloudinary galleries, and submit reviews, while administrators manage bookings and content through JWT-protected dashboard routes.",
            'highlights' => [
                'End-to-end client event reservation workflow and admin booking management.',
                'JWT-protected admin dashboard for services, galleries, reservations, and review moderation.',
                'Cloudinary media pipeline for event galleries, deployed to production at alaalacollections.site.',
            ],
            'tags' => [
                'React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'JWT', 'Cloudinary',
            ],
            'url' => 'https://alaalacollections.site',
            'github_url' => 'https://github.com/jvecinadev/event-management-platform-case-study',
            'live_url' => 'https://alaalacollections.site',
            'images' => [
                'https://res.cloudinary.com/dn8e584nq/image/upload/v1787956838/alaala_cover.png',
            ],
            'featured' => false,
            'body' => implode("\n\n", [
                "What It Is: Alaala Collections (live at https://alaalacollections.site, GitHub: https://github.com/jvecinadev/event-management-platform-case-study) is a production full-stack MERN event management platform built by John Francis Vecina for an events company.",
                "Features & Stack: Built with React, Node.js, Express, MongoDB, JWT auth, and Cloudinary. Includes public service discovery, event reservation submission, photo galleries, customer reviews, and a protected admin dashboard for operations and content moderation.",
            ]),
        ]);

        // =====================================================================
        // 1, 2, 3, 4, 6: IDENTITY, BACKGROUND, EXPERIENCE, EDUCATION & TECH STACK
        // =====================================================================

        // Core Identity, Contact, Education & Master Tech Stack
        Experience::create([
            'title' => 'John Francis Vecina — Full Stack Developer | Backend AI Engineer',
            'slug' => 'john-francis-vecina-identity-and-skills',
            'summary' => 'Full Stack Developer & Backend AI Engineer in the Philippines (UTC+8). IT Student at Pamantasan ng Lungsod ng Valenzuela. Open to work.',
            'tags' => [
                'TypeScript', 'React 19', 'Node.js', 'Express 5', 'Python', 'FastAPI',
                'PostgreSQL', 'pgvector', 'Prisma', 'MySQL', 'MongoDB', 'Redis', 'Docker',
            ],
            'url' => 'https://jvecinadev-rag.vercel.app/',
            'body' => implode("\n\n", [
                "Core Identity & Contact Information:\n"
                . "- Full Name: John Francis Vecina (handle: jvecina.dev / jvecinadev)\n"
                . "- Role / Title: Full Stack Developer | Backend AI Engineer\n"
                . "- Location: Valenzuela / Manila, Philippines (UTC+8)\n"
                . "- Status: Open to work (Full-Stack & Backend AI Engineering roles)\n"
                . "- Email: johnvecina640@gmail.com\n"
                . "- GitHub: https://github.com/jvecinadev\n"
                . "- LinkedIn: https://www.linkedin.com/in/john-francis-vecina-a76aa63b9/\n"
                . "- Portfolio: https://jvecinadev-rag.vercel.app/",

                "Background & Education:\n"
                . "John Francis Vecina is an Information Technology student at Pamantasan ng Lungsod ng Valenzuela (PLV) focusing on Web Development and backend systems engineering. He is driven by building production-grade software end to end—from responsive React 19 + TypeScript interfaces to validation-first APIs, multi-tenant relational/NoSQL databases, and grounded AI/RAG pipelines that solve real operational problems.",

                "Master Tech Stack Inventory:\n"
                . "- Frontend & State: TypeScript, JavaScript, React 19, TanStack Query, Zustand, Tailwind CSS, Vite\n"
                . "- Backend & Validation: Node.js, Express 5, Python, FastAPI, Laravel, Zod, Pydantic, JWT, httpOnly Cookies, REST APIs\n"
                . "- Data, ORM & Vectors: Prisma, PostgreSQL, pgvector, MySQL, MongoDB, Redis, SQL\n"
                . "- AI, Testing & Workflow: Google Gemini, Claude, OpenAI, DeepSeek, Ollama, Gradio, Jest, Supertest, pytest, Bandit, Semgrep, tree-sitter, Docker, GitHub Actions, Postman, Thunder Client, Git, Linux, Vercel, Render, VS Code, Figma",
            ]),
        ]);

        // Work Experience 1: FlyRank AI
        Experience::create([
            'title' => 'Backend AI Engineer - Intern | FlyRank AI (Remote, Aug 2026 – Present)',
            'slug' => 'backend-ai-engineer-intern-flyrank-ai',
            'summary' => 'Building and maintaining backend AI services, LLM/RAG workflows, and data pipelines using Python, FastAPI, Node.js, and PostgreSQL/pgvector.',
            'tags' => [
                'Python', 'FastAPI', 'Node.js', 'PostgreSQL', 'pgvector', 'Gemini', 'OpenAI', 'Claude', 'DeepSeek', 'Pydantic', 'Docker',
            ],
            'url' => 'https://www.linkedin.com/in/john-francis-vecina-a76aa63b9/',
            'body' => implode("\n\n", [
                "Role: Backend AI Engineer - Intern at FlyRank AI (Remote) | August 2026 – Present.",
                "What I Build & Maintain: Engineering backend AI microservices, Retrieval-Augmented Generation (RAG) pipelines, vector search workflows, and structured LLM integrations (leveraging Gemini, Claude, OpenAI, and DeepSeek APIs) with strict schema validation and low-latency API design.",
                "Stack Used at FlyRank AI: Python, FastAPI, Pydantic, Node.js, PostgreSQL, pgvector, Redis, Docker, and Git.",
            ]),
        ]);

        // Work Experience 2: Freelance Software Developer
        Experience::create([
            'title' => 'Freelance Software Developer | Self-Employed (Valenzuela, PH, Aug 2025 – Present)',
            'slug' => 'freelance-software-developer-valenzuela',
            'summary' => 'Designed, built, and deployed custom full-stack web applications and booking platforms for clients using MERN, TypeScript, Prisma, and SQL/NoSQL databases.',
            'tags' => [
                'React 19', 'TypeScript', 'Node.js', 'Express 5', 'MongoDB', 'MySQL', 'Prisma', 'Zod', 'Tailwind CSS', 'Vercel', 'Render',
            ],
            'url' => 'https://alaalacollections.site',
            'body' => implode("\n\n", [
                "Role: Freelance Software Developer (Self-Employed, Valenzuela, Philippines) | August 2025 – Present.",
                "What I Built for Clients: Delivered production end-to-end web platforms and business operations systems—most notably Alaala Collections (https://alaalacollections.site), a full-stack event management and client reservation platform featuring service catalogs, booking workflows, Cloudinary galleries, review moderation, and a JWT-protected admin dashboard.",
                "Primary Stack Used: React, TypeScript, Tailwind CSS, TanStack Query, Node.js, Express, Zod, MongoDB, MySQL, Prisma, Cloudinary, Vercel, and Render.",
            ]),
        ]);

        // =====================================================================
        // ENGINEERING THEMES POST ("How I Build")
        // =====================================================================
        Post::create([
            'title' => 'How I Build: Tenant Isolation, Per-Request RBAC, Validation-First APIs & Local AI Verification',
            'slug' => 'how-i-build-engineering-principles',
            'summary' => 'Architectural patterns across Plinth, Bantay PH, Vouch, and jvecina.dev: DB-level tenant isolation, transactional state machines, Zod/Pydantic validation, and grounded RAG.',
            'tags' => ['Architecture', 'RBAC', 'Multi-Tenancy', 'Zod', 'Prisma', 'Jest', 'Supertest', 'RAG'],
            'url' => 'https://github.com/jvecinadev',
            'body' => implode("\n\n", [
                "John Francis Vecina's engineering philosophy focuses on verifiable backend guarantees rather than happy-path demos:",
                "1. Tenant Isolation & Per-Request RBAC: In Plinth, tenant isolation is enforced at the database query level alongside 4-tier RBAC on every mutating route. In Bantay PH, permissions are resolved from MySQL per request so role updates take effect immediately without stale JWT claims.",
                "2. Validation-First APIs & Transactional State Machines: Inputs are validated at the boundary using Zod (Node/Express) or Pydantic (Python/FastAPI). Multi-step workflows like Bantay PH's civic report pipeline use transactional database state machines with complete audit trails to eliminate race conditions.",
                "3. Automated Verification & Testing: Critical security and tenancy boundaries are backed by Jest + Supertest integration tests (Plinth) and pytest + automated patch verification loops (`apply → parse → confirm` in Vouch).",
                "4. Grounded AI Systems: Both Vouch (local Ollama triage + SARIF static analysis) and jvecina.dev (PostgreSQL pgvector + Gemini embeddings RAG) treat LLMs as bounded components verified by deterministic checks, similarity thresholds, and explicit source citations.",
            ]),
        ]);
    }
}