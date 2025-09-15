import axios from 'axios'

// API base URL - works with Next.js environment variables and rewrites
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     (typeof window !== 'undefined' ? '/api' : 'http://localhost:8000')

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      // Clear any stored auth state and redirect to login
      import('./auth').then(({ authManager }) => {
        authManager.clearUser()
      })
    }
    
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error.response?.data || error)
  }
)

// Blog API functions
export const blogAPI = {
  // Get all blogs with optional filters
  getBlogs: (params = {}) => {
    return api.get('/getBlogs.php', { params })
  },
  
  // Get single blog by slug
  getBlogBySlug: (slug) => {
    return api.get(`/getBlogs.php?slug=${slug}`)
  },
  
  // Get single blog by ID
  getBlogById: (id) => {
    return api.get(`/getBlogs.php?id=${id}`)
  },
  
  // Create new blog (admin)
  createBlog: (formData) => {
    return api.post('/addBlog.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // Update blog (admin)
  updateBlog: (blogData) => {
    return api.put('/addBlog.php', blogData)
  },
  
  // Delete blog (admin)
  deleteBlog: (id) => {
    return api.delete(`/addBlog.php?id=${id}`)
  }
}

// Category API functions
export const categoryAPI = {
  // Get all categories
  getCategories: (params = {}) => {
    return api.get('/getCategories.php', { params })
  }
}

// Banner API functions
export const bannerAPI = {
  // Get banner images
  getBanners: () => {
    return api.get('/getBanner.php')
  }
}

// Utility functions
export const utils = {
  // Format date
  formatDate: (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },
  
  // Generate excerpt
  generateExcerpt: (content, maxLength = 150) => {
    const text = content.replace(/<[^>]*>/g, '') // Remove HTML tags
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  },
  
  // Generate slug
  generateSlug: (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }
}

export default api