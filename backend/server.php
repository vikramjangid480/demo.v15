<?php
// Simple PHP development server script
// This script provides a basic routing mechanism for the API endpoints

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string from URI
$uri = parse_url($requestUri, PHP_URL_PATH);

// Handle CORS for all requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Route handling
switch ($uri) {
    case '/api/blogs':
    case (preg_match('/\/api\/blogs\/(\d+)/', $uri) ? true : false):
    case (preg_match('/\/api\/blogs\/slug\/([^\/]+)/', $uri) ? true : false):
        require_once 'getBlogs.php';
        break;
    
    case '/api/categories':
        require_once 'getCategories.php';
        break;
    
    case '/api/banner':
        require_once 'getBanner.php';
        break;
    
    case '/api/admin/blogs':
        require_once 'addBlog.php';
        break;
    
    case '/api/auth/login':
        require_once 'login.php';
        break;
    
    default:
        // Check if it's a static file request
        if (preg_match('/\/uploads\/(.+)/', $uri, $matches)) {
            $filePath = __DIR__ . '/../uploads/' . $matches[1];
            if (file_exists($filePath)) {
                $mimeType = mime_content_type($filePath);
                header("Content-Type: $mimeType");
                header("Cache-Control: public, max-age=31536000");
                readfile($filePath);
                exit();
            }
        }
        
        // Check if it's an assets file request
        if (preg_match('/\/assets\/(.+)/', $uri, $matches)) {
            $filePath = __DIR__ . '/../assets/' . $matches[1];
            if (file_exists($filePath)) {
                $mimeType = mime_content_type($filePath);
                header("Content-Type: $mimeType");
                header("Cache-Control: public, max-age=31536000");
                readfile($filePath);
                exit();
            } else {
                // Serve placeholder image for missing assets
                header("Content-Type: image/jpeg");
                header("Cache-Control: public, max-age=3600");
                // Generate a simple placeholder or redirect to a default image
                $placeholderUrl = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                header("Location: $placeholderUrl");
                exit();
            }
        }
        
        // 404 for unknown routes
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Route not found: ' . $uri]);
        break;
}
?>