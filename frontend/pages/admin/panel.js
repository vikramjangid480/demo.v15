import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '../../contexts/AuthContext'

const AdminPanel = () => {
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/admin')
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push('/admin')
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>Loading... - Admin Panel</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-navy-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Boganto</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-semibold text-navy-800">
                Boganto Admin Panel
              </h1>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy-800 mb-4">
              Welcome to the Admin Panel
            </h2>
            <p className="text-navy-600 mb-8">
              Manage your blog content and settings from here.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-navy-800 mb-2">
                  Manage Posts
                </h3>
                <p className="text-navy-600 text-sm">
                  Create, edit, and delete blog posts
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-navy-800 mb-2">
                  Categories
                </h3>
                <p className="text-navy-600 text-sm">
                  Manage blog categories and tags
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-navy-800 mb-2">
                  Settings
                </h3>
                <p className="text-navy-600 text-sm">
                  Configure site settings and preferences
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default AdminPanel