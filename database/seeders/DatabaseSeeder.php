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

        // ==========================================
        // 4 PROJECTS (matching your exact React shape + RAG body)
        // ==========================================
        Project::create([
            'title' => 'Alaala Collections - Event Management Platform',
            'slug' => 'alaala-collections',
            'summary' => 'Production MERN platform for an events company: services, reservations, galleries, reviews, and a secure admin dashboard for content + operations.',
            'description' => "Alaala Collections is a full-stack event management platform built to modernize client booking and content management for a professional events business.\n\nClients can explore services, submit reservations, view galleries, and read/submit reviews. Administrators manage services, reservations, galleries, and review moderation through protected dashboard routes.",
            'highlights' => [
                'End-to-end event reservation workflow with real-time booking status tracking and admin approval controls.',
                'Protected administrative dashboard for managing event packages, galleries, reservations, and customer review moderation.',
                'Cloud-hosted media gallery pipeline integrated with Cloudinary for optimized image delivery.',
                'RESTful Node.js + Express API backed by MongoDB with role-based JWT authentication.',
                'Deployed to production at alaalacollections.site serving real client inquiries.',
            ],
            'tags' => [
                'React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'JWT',
                'Cloudinary', 'Vite', 'REST API', 'Mongoose', 'Axios', 'React Router', 'Render',
            ],
            'url' => 'https://alaalacollections.site',
            'github_url' => 'https://github.com/jvecinadev/event-management-platform-case-study',
            'live_url' => 'https://alaalacollections.site',
            'images' => [
                'https://res.cloudinary.com/dn8e584nq/image/upload/v1787956838/alaala_cover.png',
            ],
            'featured' => true,
            'body' => implode("\n\n", [
                "Overview & Problem: Alaala Collections is a production full-stack MERN event management platform (live at https://alaalacollections.site) built to modernize client booking, service discovery, and operations for a professional events company.",
                "Client Features: Clients can browse curated event service packages, submit event reservations with date and guest details, explore high-resolution event galleries hosted on Cloudinary, and submit customer reviews.",
                "Admin Dashboard & Security: Built a protected administrative dashboard using JWT authentication and Express middleware. Administrators can create and update service offerings, track and approve reservations, manage Cloudinary gallery uploads, and moderate client reviews before they appear publicly.",
                "Tech Stack & Deployment: Engineered with React, Vite, Tailwind CSS, React Router, and Axios on the frontend, paired with a Node.js, Express, and MongoDB/Mongoose REST API on the backend.",
            ]),
        ]);

        Project::create([
            'title' => 'AI RAG Developer Portfolio',
            'slug' => 'ai-rag-developer-portfolio',
            'summary' => 'Full-stack portfolio featuring a citation-backed AI agent built with Laravel 13, React, PostgreSQL pgvector, and Google Gemini.',
            'description' => "An AI-augmented developer portfolio whose centerpiece is a Retrieval-Augmented Generation (RAG) chat agent grounded strictly in my projects, engineering posts, and work experience.\n\nEvery answer cites the exact source chunks used and deterministically refuses to hallucinate when asked out-of-scope questions.",
            'highlights' => [
                'Custom paragraph-aware chunker (~400 tokens with 50-token overlap) prefixing source titles to every vector chunk.',
                'Asynchronous embedding pipeline using Laravel database queues and Google Gemini text-embedding-004 (768 dimensions).',
                'Cosine similarity vector search in PostgreSQL 16 (pgvector) with a strict 0.50 similarity floor.',
                'Deterministic zero-hallucination guardrail that skips the LLM call entirely when retrieval returns 0 matching chunks.',
                'Full observability logging latency, token counts, cited chunk IDs, and user thumbs-up/down feedback in rag_logs.',
            ],
            'tags' => ['Laravel 13', 'PHP 8.4', 'React 18', 'PostgreSQL 16', 'pgvector', 'Gemini API', 'Tailwind CSS', 'Vite', 'Docker'],
            'url' => 'https://github.com/jvecinadev/jvecinadev-rag',
            'github_url' => 'https://github.com/jvecinadev/jvecinadev-rag',
            'live_url' => null,
            'images' => [],
            'featured' => true,
            'body' => implode("\n\n", [
                "Problem: Recruiters and engineering managers spend less than two minutes scanning a developer portfolio. Static project grids rarely answer specific technical questions about architectural trade-offs, database design, or production debugging experience.",
                "Architecture & Decisions: Built as a monorepo with Laravel 13 at the root and a Vite + React 18 SPA in the frontend directory. Instead of introducing an external vector database like Pinecone or Qdrant, I chose PostgreSQL 16 with the pgvector extension so relational content and 768-dimensional vector embeddings live in a single transactional database at $0 hosting cost.",
                "RAG Pipeline: Content from projects, engineering posts, and work experience is split on paragraph boundaries into ~400-token chunks with a 50-token overlap. Each chunk is prefixed with its source title for context preservation and embedded asynchronously via Laravel's database queue worker calling Google's text-embedding-004 model over raw HTTP.",
                "Results & Guardrails: Queries use cosine similarity (1 - (embedding <=> query_vector)) with a strict 0.5 similarity floor. When no chunk passes the threshold, the controller short-circuits the LLM call entirely and returns a deterministic fallback response, guaranteeing zero hallucination on out-of-scope questions while logging latency and token metrics in rag_logs.",
            ]),
        ]);

        Project::create([
            'title' => 'PulseOps Real-Time Incident Tracker',
            'slug' => 'pulseops-incident-tracker',
            'summary' => 'MERN + TypeScript incident response dashboard supporting real-time WebSocket status streams, SLA timers, and automated postmortem generation.',
            'description' => "Real-time incident coordination platform built for engineering teams to track outages, assign mitigation owners, monitor SLA countdowns, and export Markdown postmortems from an immutable event timeline.",
            'highlights' => [
                'Append-only immutable event log architecture in MongoDB tracking every incident state transition.',
                'Sub-50ms real-time state delta broadcasting across connected responders via Socket.io.',
                'Compound MongoDB indexing keeping dashboard p95 query latency under 18ms across 250k records.',
                'One-click automated Markdown postmortem generator compiled directly from timeline events.',
            ],
            'tags' => ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Tailwind CSS'],
            'url' => 'https://github.com/jvecinadev/pulseops',
            'github_url' => 'https://github.com/jvecinadev/pulseops',
            'live_url' => null,
            'images' => [],
            'featured' => false,
            'body' => implode("\n\n", [
                "Problem: Small engineering teams often coordinate outages in scattered chat threads, losing track of who owns mitigation steps, when SLA thresholds breach, and what timeline of events occurred for the postmortem.",
                "Architecture & Decisions: Built with Node.js, Express, TypeScript, and MongoDB using an append-only event log pattern. Every state transition (investigating, identified, monitoring, resolved) is stored as an immutable IncidentEvent document rather than mutating a status column in place. Socket.io broadcasts state deltas to connected responders in under 50ms.",
                "Database Indexing & Performance: Designed compound MongoDB indexes on (organizationId, status, createdAt) to keep dashboard p95 query latency under 18ms across 250,000 synthetic incident records. Used optimistic UI updates in React with rollback handlers when concurrent responders claim the same incident.",
                "Results: Reduced simulated mean time to coordinate (MTTC) during team game-day drills by 40% and automated Markdown postmortem exports directly from the immutable timeline.",
            ]),
        ]);

        Project::create([
            'title' => 'CartFlow Distributed Flash-Sale Checkout',
            'slug' => 'cartflow-flash-sale-checkout',
            'summary' => 'High-concurrency e-commerce checkout service handling inventory reservation without overselling under 500 concurrent requests per second.',
            'description' => "High-concurrency backend service engineered to eliminate race conditions and inventory overselling during flash sales using atomic PostgreSQL locking and idempotent webhook handlers.",
            'highlights' => [
                'Zero oversells across 50,000 k6 load-test requests with 500 concurrent virtual users.',
                'Atomic PostgreSQL inventory reservation queries with 10-minute automatic expiration workers.',
                'Idempotency key enforcement preventing duplicate charges or stock decrements on client retries.',
                '34ms p95 checkout reservation latency running inside Dockerized PostgreSQL and Node.js.',
            ],
            'tags' => ['Node.js', 'PostgreSQL', 'Express', 'TypeScript', 'Docker', 'k6'],
            'url' => 'https://github.com/jvecinadev/cartflow',
            'github_url' => 'https://github.com/jvecinadev/cartflow',
            'live_url' => null,
            'images' => [],
            'featured' => false,
            'body' => implode("\n\n", [
                "Problem: Naive checkouts that read stock count in application memory and then decrement it suffer from race conditions during flash sales, resulting in oversold inventory and failed payment reconciliations.",
                "Architecture & Decisions: Migrated the inventory reservation path from optimistic application-level checks to atomic PostgreSQL UPDATE statements with row-level locking (UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING stock). Reservations expire automatically after 10 minutes via a background reaper worker if payment webhook confirmation does not arrive.",
                "Idempotency & Reliability: Implemented idempotency keys on POST /checkout and payment webhook endpoints so network retries from mobile clients or Stripe webhooks never double-charge or double-decrement inventory.",
                "Results: Load-tested with k6 at 500 virtual users hammering a 100-item SKU pool. Achieved zero oversells across 50,000 total requests with a p95 checkout reservation latency of 34ms.",
            ]),
        ]);

        // ==========================================
        // 3 POSTS
        // ==========================================
        Post::create([
            'title' => 'Why I Chose PostgreSQL pgvector Over a Dedicated Vector DB',
            'slug' => 'why-pgvector-over-dedicated-vector-db',
            'summary' => 'When building RAG over tens of thousands of chunks, adding Pinecone or Qdrant introduces network hops and sync bugs you do not need.',
            'tags' => ['PostgreSQL', 'pgvector', 'RAG', 'Architecture'],
            'url' => '/work/ai-rag-developer-portfolio',
            'body' => implode("\n\n", [
                "When developers build their first Retrieval-Augmented Generation (RAG) system, the default tutorial stack often includes a separate cloud vector database alongside their primary relational database. While dedicated vector engines shine at tens of millions of vectors, they introduce dual-write consistency bugs for small-to-medium workloads.",
                "With pgvector inside PostgreSQL 16, your source records and their 768-dimensional embeddings live in the exact same database. When a project or blog post is deleted, cascading deletes or model observers clean up its chunks atomically without orphaned vectors lingering in a third-party SaaS index.",
                "Using the cosine distance operator (<=>), a dataset of several thousand portfolio chunks scans in single-digit milliseconds even without approximate HNSW indexing, keeping infrastructure simple, local-Docker friendly, and 100% free.",
            ]),
        ]);

        Post::create([
            'title' => 'Lessons from Shipping Alaala Collections to Production',
            'slug' => 'shipping-alaala-collections-to-production',
            'summary' => 'How I structured reservation workflows, Cloudinary media pipelines, and admin moderation for a live MERN events business.',
            'tags' => ['MERN', 'React', 'Node.js', 'MongoDB', 'Cloudinary'],
            'url' => 'https://alaalacollections.site',
            'body' => implode("\n\n", [
                "Building Alaala Collections for a real events business required designing for two very different users: prospective clients browsing event packages on mobile devices, and non-technical administrators managing bookings and galleries daily.",
                "To keep page loads fast on image-heavy event galleries, I integrated Cloudinary with responsive image transformations so high-resolution event photography never blocks initial React rendering.",
                "On the operations side, separating public client submissions (reservations and customer reviews) from public display via an admin moderation state machine prevented spam bookings and gave the business full control over live site content.",
            ]),
        ]);

        Post::create([
            'title' => 'Preventing Hallucinations in Portfolio Chatbots',
            'slug' => 'preventing-hallucinations-in-portfolio-chatbots',
            'summary' => 'How similarity thresholds, deterministic short-circuiting, and strict citation prompts stop LLMs from inventing skills you do not have.',
            'tags' => ['AI', 'RAG', 'Gemini', 'Prompt Engineering'],
            'url' => null,
            'body' => implode("\n\n", [
                "The worst failure mode for a portfolio AI agent is fabricating experience—claiming you worked at a company you never joined or built systems in Rust when your background is TypeScript, React, Node.js, and Laravel.",
                "Prompting alone is not enough to stop hallucinations when retrieval returns weak matches. Our RAG pipeline enforces defense in depth at two layers: first, the SQL query filters out any chunk with cosine similarity below 0.50. If zero chunks pass that gate, the backend skips the Gemini API call completely and returns a canned 'I don't have that information in my portfolio' response.",
                "Second, when relevant chunks are found, each chunk is numbered [1], [2], etc., with its source title prefixed inside the chunk text. The system instruction requires Gemini to answer strictly from the provided blocks and cite [1], [2] inline so every claim can be verified with a single click.",
            ]),
        ]);

        // ==========================================
        // 2 EXPERIENCES
        // ==========================================
        Experience::create([
            'title' => 'Full-Stack Developer — J. F Tech & Freelance Engineering (2024 – Present)',
            'slug' => 'fullstack-developer-jf-tech',
            'summary' => 'Designed and shipped production full-stack web applications including Alaala Collections using React, TypeScript, Node.js, Express, MongoDB, PostgreSQL, and Laravel.',
            'tags' => ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Laravel', 'PostgreSQL'],
            'url' => 'https://alaalacollections.site',
            'body' => implode("\n\n", [
                "Role Overview: Full-stack developer building and deploying production web platforms, REST APIs, and AI-augmented applications across the MERN stack (MongoDB, Express, React, Node.js, TypeScript) and Laravel + PostgreSQL.",
                "Key Contributions: Delivered the Alaala Collections Event Management Platform (https://alaalacollections.site) featuring service catalogs, reservation workflows, Cloudinary gallery management, review moderation, and a JWT-protected admin dashboard.",
                "AI & Systems Engineering: Architected end-to-end Retrieval-Augmented Generation (RAG) pipelines using PostgreSQL pgvector and Google Gemini API with asynchronous background embedding workers and strict citation grounding.",
            ]),
        ]);

        Experience::create([
            'title' => 'Software Engineering Student Developer (2022 – 2024)',
            'slug' => 'software-engineering-student-developer',
            'summary' => 'Built full-stack web applications, high-concurrency backend services, and responsive React interfaces across software engineering projects.',
            'tags' => ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
            'url' => null,
            'body' => implode("\n\n", [
                "Role Overview: Collaborated in agile engineering teams delivering full-stack web platforms, relational and document database schemas, and automated CI/CD workflows.",
                "Key Contributions: Implemented high-concurrency checkout services in Node.js and PostgreSQL using row-level locking and idempotency keys, and built mobile-first React + Tailwind CSS applications.",
                "Tooling & Practices: Standardized Git workflows, Docker Compose local development environments, and REST API documentation across team repositories.",
            ]),
        ]);
    }
}