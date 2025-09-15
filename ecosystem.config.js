module.exports = {
  apps: [
    {
      name: 'boganto-backend',
      script: '/usr/bin/php',
      args: ['-S', '0.0.0.0:8000', '-t', './backend'],
      cwd: '/home/user/webapp',
      interpreter: 'none',
      env: {
        PORT: 8000,
      },
      log_file: './logs/backend.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 1000,
      max_restarts: 5,
      autorestart: true
    },
    {
      name: 'boganto-frontend',
      script: 'npm',
      args: ['run', 'dev'],
      cwd: '/home/user/webapp/frontend',
      interpreter: 'none',
      env: {
        PORT: 5173,
        HOST: '0.0.0.0'
      },
      log_file: './logs/frontend.log',
      out_file: './logs/frontend-out.log', 
      error_file: './logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 1000,
      max_restarts: 5,
      autorestart: true
    }
  ]
}