module.exports = {
  apps: [
    {
      name: 'event-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/event-management/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 9002,
        HOST: '0.0.0.0',
        NEXT_PUBLIC_API_BASE_URL: 'https://event-management-be-2.onrender.com' // Update with your server IP
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/event-frontend-error.log',
      out_file: '/var/log/pm2/event-frontend-out.log',
      log_file: '/var/log/pm2/event-frontend-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ],

  deploy: {
    production: {
      user: 'www-data',
      host: '10.48.146.152', // Update with your server IP
      ref: 'origin/main',
      repo: 'https://github.com/your-username/your-project.git',
      path: '/var/www/event-management',
      'pre-deploy-local': '',
      'post-deploy': 'cd frontend && npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 