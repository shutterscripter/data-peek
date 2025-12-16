import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import { Header } from '@/components/marketing/header'
import { Footer } from '@/components/marketing/footer'
import { getBlogPost, getAllBlogSlugs } from '@/lib/blog'
import { mdxComponents } from '@/components/blog/mdx-components'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found | data-peek Blog',
    }
  }

  return {
    title: `${post.title} | data-peek Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20 md:pt-24">
        {/* Back link */}
        <div className="max-w-3xl mx-auto px-6 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[--color-text-muted] hover:text-[--color-accent] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>
        </div>

        {/* Article Header */}
        <header className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="animate-fade-in-up">
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs rounded-full bg-[--color-surface] border border-[--color-border] text-[--color-text-muted]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {post.title}
              </h1>

              <p className="text-lg text-[--color-text-secondary] mb-8">{post.description}</p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 py-4 border-y border-[--color-border] text-sm">
                <div className="flex items-center gap-2 text-[--color-text-muted]">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2 text-[--color-text-muted]">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </div>
                <div className="flex items-center gap-2 text-[--color-text-muted]">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="pb-16 md:pb-24">
          <div className="max-w-3xl mx-auto px-6">
            <div className="prose prose-invert max-w-none animate-fade-in-up delay-200">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    rehypePlugins: [
                      [
                        rehypePrettyCode,
                        {
                          theme: 'tokyo-night',
                          keepBackground: true,
                          defaultLang: 'plaintext',
                        },
                      ],
                    ],
                  },
                }}
              />
            </div>
          </div>
        </article>

        {/* Bottom CTA */}
        <section className="py-12 md:py-16 border-t border-[--color-border]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ready to try data-peek?
            </h2>
            <p className="text-[--color-text-secondary] mb-6">
              Download the free version and see why developers love it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/download"
                className="px-6 py-3 rounded-lg bg-[--color-accent] text-[--color-background] font-semibold hover:bg-[--color-accent-dim] transition-colors"
              >
                Download Free
              </Link>
              <Link
                href="/blog"
                className="px-6 py-3 rounded-lg border border-[--color-border] text-[--color-text-secondary] hover:text-[--color-text-primary] hover:border-[--color-text-muted] transition-colors"
              >
                More Articles
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
