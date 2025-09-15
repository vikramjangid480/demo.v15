/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/getBlogs.php',
        destination: 'http://localhost:8000/getBlogs.php',
      },
      {
        source: '/getCategories.php',
        destination: 'http://localhost:8000/getCategories.php',
      },
      {
        source: '/getBanner.php',
        destination: 'http://localhost:8000/getBanner.php',
      },
      {
        source: '/addBlog.php',
        destination: 'http://localhost:8000/addBlog.php',
      },
      {
        source: '/login.php',
        destination: 'http://localhost:8000/login.php',
      },
    ]
  },
  env: {
    BACKEND_URL: process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-domain.com' 
      : 'http://localhost:8000',
  },
}

module.exports = nextConfig