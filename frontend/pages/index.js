import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import HeroBanner from '../components/HeroBanner'
import CategoryFilter from '../components/CategoryFilter'
import BlogCard from '../components/BlogCard'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { blogAPI, bannerAPI } from '../utils/api'
import { TrendingUp, Calendar, Eye } from 'lucide-react'

const HomePage = ({ initialData, banners }) => {
  const router = useRouter()
  const [blogs, setBlogs] = useState(initialData?.blogs || [])
  const [featuredBlogs, setFeaturedBlogs] = useState(initialData?.featuredBlogs || [])
  const [latestBlogs, setLatestBlogs] = useState(initialData?.latestBlogs || [])
  const [popularBlogs, setPopularBlogs] = useState(initialData?.popularBlogs || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // URL parameters
  const { categorySlug, tag, search } = router.query
  const INITIAL_DISPLAY_COUNT = 3

  useEffect(() => {
    // Set category from URL
    if (categorySlug) {
      setSelectedCategory(categorySlug)
    } else {
      setSelectedCategory(null)
    }
  }, [categorySlug])

  useEffect(() => {
    if (router.isReady) {
      fetchData()
    }
  }, [selectedCategory, tag, search, router.isReady])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = {}
      if (selectedCategory) params.category = selectedCategory
      if (tag) params.tag = tag
      if (search) params.search = search

      // Fetch all blogs
      const allBlogsResponse = await blogAPI.getBlogs(params)
      setBlogs(allBlogsResponse.blogs || [])

      // Fetch featured blogs
      const featuredParams = { ...params, featured: true }
      const featuredResponse = await blogAPI.getBlogs(featuredParams)
      setFeaturedBlogs(featuredResponse.blogs || [])

      // Fetch latest blogs
      const latestResponse = await blogAPI.getBlogs(params)
      setLatestBlogs(latestResponse.blogs || [])

      // Fetch popular blogs (using featured as proxy for popular)
      const popularResponse = await blogAPI.getBlogs({ featured: true, limit: 4 })
      setPopularBlogs(popularResponse.blogs || [])

    } catch (err) {
      setError('Failed to load content. Please try again.')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug)
    // Update URL without page reload
    const newUrl = categorySlug ? `/category/${categorySlug}` : '/'
    router.push(newUrl, undefined, { shallow: true })
  }

  const displayFeaturedBlogs = featuredBlogs.slice(0, INITIAL_DISPLAY_COUNT)
  const displayLatestBlogs = latestBlogs.slice(0, 6) // 6 articles for 3x2 grid

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Boganto</title>
        </Head>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy-800 mb-4">Something went wrong</h2>
            <p className="text-navy-600 mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Boganto - Premium Bookstore Blog</title>
        <meta name="description" content="Discover the latest articles, book reviews, and literary insights on Boganto - your premium destination for book lovers and literature enthusiasts." />
        <meta property="og:title" content="Boganto - Premium Bookstore Blog" />
        <meta property="og:description" content="Discover the latest articles, book reviews, and literary insights on Boganto - your premium destination for book lovers and literature enthusiasts." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" />
        <link rel="canonical" href="https://boganto.com" />
      </Head>

      <Header />
      <main>
        <div className="min-h-screen bg-gray-50">
          {/* Hero Banner */}
          <HeroBanner banners={banners} />

          {/* Categories Section - Mobile: Below Hero, Desktop: Left Sidebar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden py-8">
              <CategoryFilter 
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Sidebar - Categories and Popular Articles */}
              <aside className="lg:col-span-1 order-2 lg:order-1">
                <div className="sticky top-24 space-y-8">
                  {/* Categories - Desktop only */}
                  <div className="hidden lg:block">
                    <CategoryFilter 
                      onCategorySelect={handleCategorySelect}
                      selectedCategory={selectedCategory}
                    />
                  </div>
                  
                  {/* Popular Articles */}
                  {popularBlogs.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-navy-800 mb-6 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
                        Popular Articles
                      </h3>
                      
                      <div className="space-y-1">
                        {popularBlogs.map((blog) => (
                          <div key={blog.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex-shrink-0">
                              <img
                                src={blog.featured_image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                                alt={blog.title}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-navy-800 leading-tight mb-1 hover:text-primary-600 transition-colors duration-200">
                                <Link href={`/blog/${blog.slug}`} className="line-clamp-2">
                                  {blog.title}
                                </Link>
                              </h4>
                              <div className="flex items-center text-xs text-navy-400">
                                <span>{blog.view_count || 0} views</span>
                                {blog.is_featured && (
                                  <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full text-xs">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>

              {/* Main Content */}
              <section className="lg:col-span-3 order-1 lg:order-2">
                {loading ? (
                  /* Loading State */
                  <div className="space-y-8">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="card p-6">
                        <div className="animate-pulse">
                          <div className="h-48 bg-gray-200 rounded mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-12">
                    {/* Featured Articles Section */}
                    {!search && !selectedCategory && !tag && featuredBlogs.length > 0 && (
                      <section className="relative">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6">
                            <TrendingUp className="h-8 w-8 text-white" />
                          </div>
                          <h2 className="text-4xl font-bold text-navy-800 mb-4">
                            Featured Articles
                          </h2>
                          <p className="text-lg text-navy-600 max-w-2xl mx-auto leading-relaxed">
                            Discover our handpicked articles that showcase the best insights, stories, and knowledge
                          </p>
                        </div>
                        
                        {/* Featured Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                          {displayFeaturedBlogs.map((blog, index) => (
                            <div key={blog.id} className={`group ${
                              index === 0 ? 'md:col-span-2 xl:col-span-1' : ''
                            }`}>
                              <article className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 h-full transform group-hover:-translate-y-2">
                                {/* Image Container with Overlay */}
                                <div className="relative h-56 overflow-hidden">
                                  <img
                                    src={blog.featured_image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  
                                  {/* Featured Badge */}
                                  <div className="absolute top-4 left-4">
                                    <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                                      ✨ Featured
                                    </span>
                                  </div>
                                  
                                  {/* Category Badge */}
                                  {blog.category && (
                                    <div className="absolute top-4 right-4">
                                      <Link href={`/category/${blog.category.slug}`}>
                                        <span className="bg-white/90 backdrop-blur-sm text-navy-800 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-white transition-colors shadow-lg">
                                          {blog.category.name}
                                        </span>
                                      </Link>
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                  {/* Meta Info */}
                                  <div className="flex items-center text-sm text-navy-500 mb-3">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span className="font-medium">{new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    <div className="flex items-center ml-4">
                                      <Eye className="h-4 w-4 mr-1" />
                                      <span>{blog.view_count || 0} views</span>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <h3 className="font-bold text-xl text-navy-800 mb-3 leading-tight group-hover:text-primary-600 transition-colors duration-300 line-clamp-2">
                                    <Link href={`/blog/${blog.slug}`}>
                                      {blog.title}
                                    </Link>
                                  </h3>

                                  {/* Excerpt */}
                                  <p className="text-navy-600 leading-relaxed line-clamp-3 mb-4">
                                    {blog.excerpt || (blog.content ? blog.content.substring(0, 120) + '...' : 'Click to read this amazing article...')}
                                  </p>

                                  {/* Read More Link */}
                                  <Link
                                    href={`/blog/${blog.slug}`}
                                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold group/link transition-colors duration-200"
                                  >
                                    Read Article
                                    <svg className="w-4 h-4 ml-2 transform group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                  </Link>
                                </div>
                              </article>
                            </div>
                          ))}
                        </div>
                        
                        {/* View More Button */}
                        {featuredBlogs.length > INITIAL_DISPLAY_COUNT && (
                          <div className="text-center">
                            <Link
                              href="/featured"
                              className="group inline-flex items-center bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                              Explore All Featured Articles
                              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </Link>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Latest Articles Section */}
                    <section className="relative">
                      {/* Section Header */}
                      <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-navy-700 to-navy-800 rounded-2xl shadow-lg mb-6">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h2 className="text-4xl font-bold text-navy-800 mb-4">
                          {search || selectedCategory || tag ? 'Articles' : 'Latest Articles'}
                        </h2>
                        <p className="text-lg text-navy-600 max-w-2xl mx-auto leading-relaxed">
                          {search || selectedCategory || tag 
                            ? 'Browse through our curated collection of articles'
                            : 'Stay up-to-date with our most recent publications and insights'}
                        </p>
                      </div>
                      
                      {(search || selectedCategory || tag ? blogs : latestBlogs).length === 0 ? (
                        <div className="text-center py-16">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                            <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-navy-700 mb-4">No articles found</h3>
                          <p className="text-navy-500 mb-8 max-w-md mx-auto text-lg">
                            {search && "We couldn't find articles matching your search. Try different keywords."}
                            {selectedCategory && "No articles in this category yet. Check back soon for new content."}
                            {tag && "No articles with this tag. Explore other topics."}
                            {!search && !selectedCategory && !tag && "No articles available at the moment."}
                          </p>
                          {(search || selectedCategory || tag) && (
                            <button
                              onClick={() => {
                                setSelectedCategory(null)
                                router.push('/')
                              }}
                              className="group inline-flex items-center bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                              View All Articles
                              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Articles Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {(search || selectedCategory || tag ? blogs : displayLatestBlogs).map((blog, index) => (
                              <article key={blog.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
                                {/* Image Container */}
                                <div className="relative h-48 overflow-hidden">
                                  <img
                                    src={blog.featured_image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                    }}
                                  />
                                  
                                  {/* Category Badge */}
                                  {blog.category && (
                                    <div className="absolute top-3 left-3">
                                      <Link href={`/category/${blog.category.slug}`}>
                                        <span className="bg-white/90 backdrop-blur-sm text-navy-800 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-white transition-colors shadow-lg">
                                          {blog.category.name}
                                        </span>
                                      </Link>
                                    </div>
                                  )}
                                  
                                  {/* Featured Indicator */}
                                  {blog.is_featured && (
                                    <div className="absolute top-3 right-3">
                                      <div className="w-3 h-3 bg-primary-500 rounded-full shadow-lg animate-pulse"></div>
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                  {/* Meta Information */}
                                  <div className="flex items-center justify-between text-sm text-navy-500 mb-3">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1.5" />
                                      <span className="font-medium">{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Eye className="h-4 w-4 mr-1" />
                                      <span>{blog.view_count || 0}</span>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <h3 className="font-bold text-lg text-navy-800 mb-3 leading-tight group-hover:text-primary-600 transition-colors duration-300 line-clamp-2">
                                    <Link href={`/blog/${blog.slug}`}>
                                      {blog.title}
                                    </Link>
                                  </h3>

                                  {/* Excerpt */}
                                  <p className="text-navy-600 text-sm leading-relaxed line-clamp-2 mb-4">
                                    {blog.excerpt || (blog.content ? blog.content.substring(0, 100) + '...' : 'Discover more in this article...')}
                                  </p>

                                  {/* Read More Link */}
                                  <Link
                                    href={`/blog/${blog.slug}`}
                                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-sm group/link transition-colors duration-200"
                                  >
                                    Continue Reading
                                    <svg className="w-3.5 h-3.5 ml-1.5 transform group-hover/link:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                  </Link>
                                </div>
                              </article>
                            ))}
                          </div>
                          
                          {/* View More Button */}
                          {!search && !selectedCategory && !tag && latestBlogs.length > 6 && (
                            <div className="text-center">
                              <Link
                                href="/latest"
                                className="group inline-flex items-center bg-navy-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-navy-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                              >
                                View All Latest Articles
                                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </Link>
                            </div>
                          )}
                        </>
                      )}
                    </section>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// Use SSR instead of SSG to avoid build-time issues
export async function getServerSideProps() {
  return {
    props: {
      initialData: {
        blogs: [],
        featuredBlogs: [],
        latestBlogs: [],
        popularBlogs: []
      },
      banners: []
    }
  }
}

export default HomePage