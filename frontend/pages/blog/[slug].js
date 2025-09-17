import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { 
  Calendar, Eye, Tag, ExternalLink, ChevronRight, Share2, Twitter, Facebook, 
  Linkedin, MessageSquare, Copy, Clock, ThumbsUp, ThumbsDown, Moon, Sun, 
  Menu, X, ChevronUp, CheckCircle, Quote, ChevronDown, Search
} from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { blogAPI, utils } from '../../utils/api'

const BlogDetailPage = ({ blog: initialBlog, relatedArticles }) => {
  const router = useRouter()
  const { slug } = router.query
  const [blog, setBlog] = useState(initialBlog)
  const [relatedBooks, setRelatedBooks] = useState(initialBlog?.related_books || [])
  const [loading, setLoading] = useState(!initialBlog)
  const [error, setError] = useState(null)
  const [tableOfContents, setTableOfContents] = useState([])
  const [showMoreRelated, setShowMoreRelated] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  
  // New state for enhanced features
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [activeSection, setActiveSection] = useState('')
  const [visibleArticles, setVisibleArticles] = useState(3)
  
  const articleRef = useRef(null)

  useEffect(() => {
    if (!initialBlog && slug) {
      fetchBlogDetail()
    }
  }, [slug, initialBlog])

  useEffect(() => {
    if (blog) {
      generateTableOfContents()
    }
  }, [blog])

  // Enhanced scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300)
      
      // Update active section for TOC
      const sections = document.querySelectorAll('h2[id]')
      const scrollPos = window.pageYOffset + 100
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          setActiveSection(section.id)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchBlogDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await blogAPI.getBlogBySlug(slug)
      setBlog(response.blog)
      setRelatedBooks(response.blog.related_books || [])
    } catch (err) {
      if (err.status === 404) {
        setError('Blog post not found')
      } else {
        setError('Failed to load blog post. Please try again.')
      }
      console.error('Error fetching blog:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateTableOfContents = () => {
    if (!blog || !blog.content) return

    // Extract h2 and h3 tags from content
    const headingRegex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi
    const headings = []
    let match

    while ((match = headingRegex.exec(blog.content)) !== null) {
      const level = parseInt(match[1])
      const text = match[2].replace(/<[^>]*>/g, '') // Remove any HTML tags
      const id = utils.generateSlug(text)
      
      headings.push({
        level,
        text,
        id
      })
    }

    setTableOfContents(headings)
  }

  const scrollToHeading = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTagClick = (tag) => {
    router.push(`/tag/${encodeURIComponent(tag.trim())}`)
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = blog ? blog.title : ''

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      showNotificationMessage('Link copied to clipboard!')
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleFeedback = (type) => {
    setFeedback(type)
    showNotificationMessage('Thank you for your feedback!')
    // You can implement API call to save feedback here
  }

  const showNotificationMessage = (message) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 4000)
  }

  const shareOnSocial = (platform) => {
    switch(platform) {
      case 'facebook':
        window.open(shareLinks.facebook, '_blank')
        break
      case 'twitter':
        window.open(shareLinks.twitter, '_blank')
        break
      case 'whatsapp':
        window.open(shareLinks.whatsapp, '_blank')
        break
      case 'copy':
        copyToClipboard()
        break
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const loadMoreArticles = () => {
    if (visibleArticles < relatedArticles?.length) {
      setVisibleArticles(prev => Math.min(prev + 3, relatedArticles.length))
    }
  }

  // Process content to add IDs to headings
  const processContent = (content) => {
    return content.replace(/<h([23])[^>]*>(.*?)<\/h[23]>/gi, (match, level, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '')
      const id = utils.generateSlug(cleanText)
      return `<h${level} id="${id}" class="scroll-mt-24 text-2xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b-2 border-gray-200 dark:border-gray-700 relative ${level === '2' ? 'mt-12' : 'mt-8'}"><span class="absolute bottom-0 left-0 w-16 h-0.5 bg-orange-500"></span>${text}</h${level}>`
    })
  }

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200
    const words = content?.replace(/<[^>]*>/g, '').split(' ').length || 0
    return Math.ceil(words / wordsPerMinute)
  }

  // Display only visible related articles
  const displayedRelatedArticles = showMoreRelated ? relatedArticles : relatedArticles?.slice(0, visibleArticles) || []

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Head>
          <title>Loading... - Boganto</title>
        </Head>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Head>
          <title>Error - Boganto</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy-800 dark:text-white mb-4">{error}</h2>
            <p className="text-navy-600 dark:text-gray-400 mb-6">The blog post you're looking for might have been moved or deleted.</p>
            <Link href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!blog) {
    return null
  }

  const defaultImage = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  const readTime = calculateReadTime(blog.content)

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Head>
        <title>{blog.title} - Boganto</title>
        <meta name="description" content={blog.excerpt || blog.title} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt || blog.title} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={blog.featured_image || defaultImage} />
        <meta property="article:published_time" content={blog.created_at} />
        <meta property="article:author" content="Boganto" />
        {blog.tags && blog.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag.trim()} />
        ))}
        <link rel="canonical" href={`https://boganto.com/blog/${blog.slug}`} />
      </Head>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-5 right-5 z-50 bg-teal-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 transform transition-transform duration-300">
          <CheckCircle size={20} />
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <ChevronUp size={20} />
        </button>
      )}

      <Header />
      <main>
        {/* Breadcrumb */}
        <nav className="bg-gray-100 dark:bg-gray-800 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/" className="text-orange-500 hover:text-orange-600">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/" className="text-orange-500 hover:text-orange-600">Blog</Link>
              {blog.category && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <Link 
                    href={`/category/${blog.category.slug}`} 
                    className="hover:text-orange-500"
                  >
                    {blog.category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{blog.title}</span>
            </div>
          </div>
        </nav>

        {/* Article Hero */}
        <section className="py-12 bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {/* Category Tag */}
            {blog.category && (
              <div className="mb-6">
                <Link href={`/category/${blog.category.slug}`}>
                  <span className="inline-block bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide hover:bg-teal-600 transition-colors duration-200">
                    {blog.category.name}
                  </span>
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{utils.formatDate(blog.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{blog.view_count || 0} views</span>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Grid */}
        <section className="py-8 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-lg shadow-lg group">
                <img
                  src={blog.featured_image || defaultImage}
                  alt={blog.title}
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = defaultImage
                  }}
                />
              </div>
              <div className="relative overflow-hidden rounded-lg shadow-lg group">
                <img
                  src={blog.featured_image_2 || blog.featured_image || defaultImage}
                  alt={`${blog.title} - Image 2`}
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = defaultImage
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Article Content */}
              <article className="lg:col-span-3" ref={articleRef}>
                {/* Table of Contents */}
                {tableOfContents.length > 0 && (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8 border-l-4 border-orange-500">
                    <h3 className="text-lg font-semibold mb-4">Table of Contents</h3>
                    <ul className="space-y-2">
                      {tableOfContents.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => scrollToHeading(item.id)}
                            className={`block text-left w-full text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors pl-4 border-l-2 border-transparent hover:border-orange-500 hover:pl-6 ${
                              activeSection === item.id ? 'text-orange-500 border-orange-500 pl-6' : ''
                            } ${item.level === 3 ? 'ml-4 text-sm' : ''}`}
                          >
                            {item.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Article Body */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: processContent(blog.content) }}
                  />

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="py-8 border-t border-b border-gray-200 dark:border-gray-700 my-8">
                      <h4 className="text-lg font-semibold mb-4">Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.map((tag, index) => (
                          <button
                            key={index}
                            onClick={() => handleTagClick(tag)}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-500 hover:text-white transition-colors cursor-pointer inline-flex items-center"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag.trim()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Share */}
                  <div className="text-center py-8">
                    <h4 className="text-lg font-semibold mb-6">Share this article</h4>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                      <button
                        onClick={() => shareOnSocial('facebook')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                      >
                        <Facebook size={20} />
                        Share on Facebook
                      </button>
                      <button
                        onClick={() => shareOnSocial('twitter')}
                        className="flex items-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors w-full md:w-auto"
                      >
                        <Twitter size={20} />
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => shareOnSocial('whatsapp')}
                        className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors w-full md:w-auto"
                      >
                        <MessageSquare size={20} />
                        Share on WhatsApp
                      </button>
                      <button
                        onClick={() => shareOnSocial('copy')}
                        className={`flex items-center gap-2 rounded-lg px-6 py-3 transition-colors w-full md:w-auto ${
                          copySuccess 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        <Copy size={20} />
                        {copySuccess ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>

              {/* Sidebar - Related Books */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24">
                  {relatedBooks.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <div className="bg-orange-500 text-white p-4">
                        <h4 className="text-lg font-semibold">Related Books</h4>
                      </div>
                      <div className="p-4 space-y-4">
                        {relatedBooks.map((book) => (
                          <div key={book.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="w-12 h-18 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0 shadow"></div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                                {book.title}
                              </h5>
                              {book.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                  {book.description}
                                </p>
                              )}
                              {book.price && (
                                <p className="text-sm font-semibold text-orange-500 mb-2">{book.price}</p>
                              )}
                              <a
                                href={book.purchase_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium text-xs transition-colors duration-200 group"
                              >
                                Purchase Book
                                <ExternalLink className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="py-16 bg-gray-100 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedRelatedArticles.map((article) => (
                  <div key={article.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                    <Link href={`/blog/${article.slug}`}>
                      <div className="relative overflow-hidden">
                        <img
                          src={article.featured_image || defaultImage}
                          alt={article.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = defaultImage
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{utils.formatDate(article.created_at)}</span>
                          <span className="mx-2">•</span>
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{article.view_count || 0} views</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {relatedArticles.length > visibleArticles && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreArticles}
                    className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <span>Load More Articles</span>
                    <ChevronDown size={20} />
                  </button>
                </div>
              )}

              {relatedArticles.length > 3 && visibleArticles >= relatedArticles.length && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowMoreRelated(!showMoreRelated)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    {showMoreRelated ? 'See Less' : 'See More'}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Feedback Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-semibold mb-8">Was this article helpful?</h3>
            
            {feedback ? (
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg p-6">
                <p className="text-teal-800 dark:text-teal-200 font-medium">
                  Thank you for your feedback! 
                  {feedback === 'up' ? ' We\'re glad you found it helpful.' : ' We\'ll work on improving our content.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => handleFeedback('up')}
                  className="flex items-center gap-2 px-6 py-3 border-2 rounded-lg transition-all w-48 justify-center border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-teal-500 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                >
                  <ThumbsUp size={20} />
                  <span>Yes, it was helpful</span>
                </button>
                <button
                  onClick={() => handleFeedback('down')}
                  className="flex items-center gap-2 px-6 py-3 border-2 rounded-lg transition-all w-48 justify-center border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <ThumbsDown size={20} />
                  <span>No, it wasn't helpful</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

// Use SSR for blog posts to avoid build issues
export async function getServerSideProps({ params }) {
  try {
    // Make sure we have a slug
    if (!params?.slug) {
      return {
        notFound: true
      }
    }

    // Fetch the blog data from your API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/getBlogs.php?slug=${params.slug}`)
    const data = await response.json()

    if (!data.success || !data.blog) {
      return {
        notFound: true
      }
    }

    // Fetch related articles
    const relatedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/getBlogs.php?category=${data.blog.category_id}&limit=6&exclude=${params.slug}`)
    const relatedData = await relatedResponse.json()

    return {
      props: {
        blog: data.blog,
        relatedArticles: relatedData.success ? relatedData.blogs : []
      }
    }
  } catch (error) {
    console.error('Error fetching blog:', error)
    return {
      props: {
        blog: null,
        relatedArticles: []
      }
    }
  }
}

export default BlogDetailPage