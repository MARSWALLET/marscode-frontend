import React from "react"
import Link from "next/link"
import { Terminal, ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-1.5 rounded-md">
              <Terminal size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold tracking-tight text-lg">Marscoder</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: May 3, 2026</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Information We Collect</h2>
            <p>
              When you use Marscoder, we collect information that you provide directly to us, including your name, email address, payment information, and the source code or prompts you submit to our AI agents.
            </p>
            <p>
              We also automatically collect certain technical data such as your IP address, browser type, and usage metrics regarding your interactions with our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, maintain, and improve the Marscoder platform and its AI capabilities.</li>
              <li>Process transactions and send related information including confirmations and invoices.</li>
              <li>Send technical notices, updates, security alerts, and support messages.</li>
              <li>Respond to your comments, questions, and requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. AI Training and Data Privacy</h2>
            <p>
              <strong>We respect your intellectual property.</strong> Code generated within private workspaces or submitted via prompts is explicitly excluded from being used to train our foundational models, unless you explicitly opt-in to help improve Marscoder.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf (such as payment processors like Korapay, or LLM providers like Anthropic and OpenAI for API routing).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@marscoder.com" className="text-primary hover:underline">privacy@marscoder.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
