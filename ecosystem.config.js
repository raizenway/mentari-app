module.exports = {
  apps: [
    {
      name: 'mentari-app',
      script: 'npm',
      args: 'start',
      cwd: '/home/mentoranaknegeri/htdocs/mentoranaknegeri.id/mentari-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/home/mentoranaknegeri/htdocs/mentoranaknegeri.id/mentari-app/logs/pm2-error.log',
      out_file: '/home/mentoranaknegeri/htdocs/mentoranaknegeri.id/mentari-app/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
