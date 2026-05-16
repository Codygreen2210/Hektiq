export const config = { runtime: "edge" };

// Maps npm packages to known tools with estimated costs
const PACKAGE_MAP = {
  // AI / LLM
  "@anthropic-ai/sdk":        { name:"Claude API",       cat:"AI Core",   cost:20  },
  "@anthropic-ai/claude":     { name:"Claude API",       cat:"AI Core",   cost:20  },
  "openai":                   { name:"OpenAI API",        cat:"AI Core",   cost:20  },
  "@openai/openai":           { name:"OpenAI API",        cat:"AI Core",   cost:20  },

  // Auth
  "@clerk/clerk-react":       { name:"Clerk",             cat:"Auth",      cost:25  },
  "@clerk/nextjs":            { name:"Clerk",             cat:"Auth",      cost:25  },
  "@clerk/clerk-sdk-node":    { name:"Clerk",             cat:"Auth",      cost:25  },
  "next-auth":                { name:"NextAuth",          cat:"Auth",      cost:0   },
  "@auth0/auth0-react":       { name:"Auth0",             cat:"Auth",      cost:23  },

  // Database
  "@supabase/supabase-js":    { name:"Supabase",          cat:"Database",  cost:25  },
  "mongoose":                 { name:"MongoDB Atlas",     cat:"Database",  cost:57  },
  "@prisma/client":           { name:"Prisma",            cat:"Database",  cost:0   },
  "planetscale":              { name:"PlanetScale",       cat:"Database",  cost:39  },
  "@planetscale/database":    { name:"PlanetScale",       cat:"Database",  cost:39  },
  "drizzle-orm":              { name:"Drizzle ORM",       cat:"Database",  cost:0   },

  // Payments
  "stripe":                   { name:"Stripe",            cat:"Payments",  cost:0   },
  "@stripe/stripe-js":        { name:"Stripe",            cat:"Payments",  cost:0   },
  "lemonsqueezy":             { name:"Lemon Squeezy",     cat:"Payments",  cost:0   },

  // Hosting / Infra
  "@vercel/analytics":        { name:"Vercel",            cat:"Hosting",   cost:20  },
  "@vercel/og":               { name:"Vercel",            cat:"Hosting",   cost:20  },
  "next":                     { name:"Vercel",            cat:"Hosting",   cost:20  },

  // Email
  "resend":                   { name:"Resend",            cat:"Email",     cost:0   },
  "@sendgrid/mail":           { name:"SendGrid",          cat:"Email",     cost:20  },
  "nodemailer":               { name:"Nodemailer",        cat:"Email",     cost:0   },
  "postmark":                 { name:"Postmark",          cat:"Email",     cost:15  },

  // Analytics
  "posthog-js":               { name:"PostHog",           cat:"Analytics", cost:0   },
  "posthog-node":             { name:"PostHog",           cat:"Analytics", cost:0   },
  "mixpanel":                 { name:"Mixpanel",          cat:"Analytics", cost:28  },
  "@amplitude/analytics-browser": { name:"Amplitude",    cat:"Analytics", cost:49  },

  // Caching / Queue
  "@upstash/redis":           { name:"Upstash Redis",     cat:"Database",  cost:10  },
  "@upstash/ratelimit":       { name:"Upstash Redis",     cat:"Database",  cost:10  },
  "ioredis":                  { name:"Redis",             cat:"Database",  cost:10  },
  "bull":                     { name:"Bull Queue",        cat:"Infra",     cost:0   },
  "bullmq":                   { name:"BullMQ",            cat:"Infra",     cost:0   },

  // Search
  "algoliasearch":            { name:"Algolia",           cat:"Search",    cost:50  },
  "@algolia/client-search":   { name:"Algolia",           cat:"Search",    cost:50  },
  "typesense":                { name:"Typesense",         cat:"Search",    cost:0   },

  // Storage
  "@aws-sdk/client-s3":       { name:"AWS S3",            cat:"Storage",   cost:5   },
  "aws-sdk":                  { name:"AWS",               cat:"Hosting",   cost:30  },
  "@cloudflare/workers-types":{ name:"Cloudflare",        cat:"Hosting",   cost:0   },

  // Monitoring
  "@sentry/react":            { name:"Sentry",            cat:"Monitoring",cost:26  },
  "@sentry/node":             { name:"Sentry",            cat:"Monitoring",cost:26  },
  "@sentry/nextjs":           { name:"Sentry",            cat:"Monitoring",cost:26  },
  "datadog-metrics":          { name:"Datadog",           cat:"Monitoring",cost:15  },

  // Automation
  "zapier-platform-core":     { name:"Zapier",            cat:"Automation",cost:20  },

  // CMS
  "@sanity/client":           { name:"Sanity",            cat:"CMS",       cost:15  },
  "contentful":               { name:"Contentful",        cat:"CMS",       cost:300 },
  "@contentful/rich-text-react-renderer": { name:"Contentful", cat:"CMS", cost:300 },

  // Feature flags
  "@launchdarkly/node-client-sdk": { name:"LaunchDarkly", cat:"Infra",    cost:8   },
  "unleash-client":           { name:"Unleash",           cat:"Infra",     cost:0   },
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { repoUrl } = await req.json();
    if (!repoUrl) return new Response(JSON.stringify({ error: "No repo URL provided" }), { status: 400 });

    // Parse GitHub URL into owner/repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!match) return new Response(JSON.stringify({ error: "Invalid GitHub URL" }), { status: 400 });

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    // Fetch package.json from GitHub raw content
    const packageRes = await fetch(
      `https://raw.githubusercontent.com/${owner}/${cleanRepo}/main/package.json`
    );

    // Try master branch if main fails
    let packageJson;
    if (!packageRes.ok) {
      const masterRes = await fetch(
        `https://raw.githubusercontent.com/${owner}/${cleanRepo}/master/package.json`
      );
      if (!masterRes.ok) {
        return new Response(JSON.stringify({ error: "Could not find package.json. Make sure the repo is public." }), { status: 404 });
      }
      packageJson = await masterRes.json();
    } else {
      packageJson = await packageRes.json();
    }

    // Combine all deps
    const allDeps = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {},
    };

    // Map to tools, deduplicate by tool name
    const detected = {};
    for (const pkg of Object.keys(allDeps)) {
      const tool = PACKAGE_MAP[pkg];
      if (tool && !detected[tool.name]) {
        detected[tool.name] = {
          ...tool,
          id: tool.name.toLowerCase().replace(/\s/g, "-"),
          detectedFrom: pkg,
        };
      }
    }

    const tools = Object.values(detected);

    return new Response(JSON.stringify({
      success: true,
      repo: `${owner}/${cleanRepo}`,
      toolsFound: tools.length,
      tools,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
