# Putting it online at summeranneburton.com

## The short version

Host it on Cloudflare. It's free for a site like this, it's fast, and you already have an account from Scotland. If you ever want the site to do more (a guestbook, a live "now playing" from Spotify, an AI thing that answers questions about your work), Cloudflare can run that too without moving anything.

The domain stays registered at Squarespace. You only point it at Cloudflare. The old redirect went to Glitch, which stopped hosting projects in July 2025, so it's been pointing at nothing.

All of this happens in two dashboards, Cloudflare's and Squarespace's, and takes about half an hour plus some waiting.

## 1. Connect the repository to Cloudflare

1. In the Cloudflare dashboard, open Workers & Pages and choose Create application.
2. Choose to import a repository from GitHub and pick `ronnythebear-afk/sab`.
3. Settings:
   - Project name: `summeranneburton`
   - Branch: `main`
   - Build command: leave it empty
   - Deploy command: `npx wrangler deploy`
   - Root directory: leave it empty
4. Save and deploy. In a minute you'll have an address like `summeranneburton.your-name.workers.dev`. Open it and check the site.

From then on, anything pushed to `main` goes live on its own.

## 2. Move the domain's DNS to Cloudflare

Before you change anything, check whether summeranneburton.com does email. If you have Squarespace email forwarding or Google Workspace on it, note it. Cloudflare copies the domain's records when you add it, but Squarespace's email forwarding stops working once the domain points elsewhere. Cloudflare's own Email Routing does the same job for free.

1. In Cloudflare, choose Add a domain, type `summeranneburton.com`, and pick the Free plan.
2. Cloudflare scans the domain's current records. Look them over, delete any that point to Glitch, and keep any for email.
3. Cloudflare shows you two nameservers. Copy them.
4. In Squarespace, open Domains, then summeranneburton.com, then the DNS or nameserver settings. Choose to use custom nameservers, paste in Cloudflare's two, and save. If there's a domain forwarding rule pointing at Glitch, delete it too.
5. Wait. It's often minutes and can take up to a day. Cloudflare emails you when the domain is active.

## 3. Put the site on the domain

1. In Cloudflare, open Workers & Pages, then `summeranneburton`, then Settings, then Domains & Routes.
2. Add a custom domain: `summeranneburton.com`. Add `www.summeranneburton.com` too.
3. Give it a few minutes for the security certificate, then open summeranneburton.com.

## Afterwards

- The old Squarespace site (summeranne-burton.squarespace.com) is still up. If you're paying for a Squarespace website plan, you can cancel it once this is live. The domain renews separately.
- Later, if you want, you can transfer the domain registration itself to Cloudflare. They charge what the registry charges, with no markup. It isn't needed for any of this.
- Other hosts would work too (Netlify, GitHub Pages). Cloudflare is the pick because you're already set up there and it leaves room to grow.
