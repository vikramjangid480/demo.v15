import React from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BlogCard from '../components/BlogCard'
import { blogAPI } from '../utils/api'

const LatestArticlesPage = ({ latestBlogs }) => {
  return (
    <>
      <Head>
        <title>Latest Articles - Boganto</title>
        <meta name="description" content="Stay up to date with the latest articles and insights on Boganto." />
        <meta property="og:title" content="Latest Articles - Boganto" />
        <meta property="og:description" content="Stay up to date with the latest articles and insights on Boganto." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://boganto.com/latest" />
      </Head>

      <Header />
      <main>
        <div className="min-h-screen bg-gray-50">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-navy-800 mb-4">Latest Articles</h1>
                <p className="text-xl text-navy-600 max-w-2xl mx-auto">
                  Stay up to date with our newest content and latest insights from the world of literature.
                </p>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {latestBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-navy-700 mb-4">No articles yet</h2>
                <p className="text-navy-500 mb-6">
                  Check back soon for our latest content.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export async function getServerSideProps() {
  return {
    props: {
      latestBlogs: []
    }
  }
}

export default LatestArticlesPage