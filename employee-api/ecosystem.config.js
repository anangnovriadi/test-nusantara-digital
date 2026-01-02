module.exports = {
    apps: [{
        name: 'employee-api',
        script: 'dist/main.js',
        instances: 1,  // Single instance for 1GB RAM server
        exec_mode: 'fork',

        // Node.js optimization flags for low-RAM environment
        node_args: [
            '--expose-gc',              // Enable manual garbage collection
            '--max-old-space-size=512', // Limit heap to 512MB (safe for 1GB RAM)
            '--optimize-for-size',      // Optimize for memory, not speed
        ].join(' '),

        // Environment variables
        env_production: {
            NODE_ENV: 'production',
        },

        // Auto-restart if memory exceeds 450MB
        max_memory_restart: '450M',

        // Logging
        error_file: 'logs/err.log',
        out_file: 'logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,

        // Auto-restart settings
        autorestart: true,
        watch: false,  // Disable in production

        // Graceful shutdown
        kill_timeout: 5000,  // 5 seconds to shutdown gracefully

        // Crash management
        min_uptime: '10s',      // Consider app crashed if uptime < 10s
        max_restarts: 10,       // Max restart attempts in 1 minute
        restart_delay: 4000,    // Wait 4s before restart

        // Cron restart (optional - restart every day at 3 AM)
        // cron_restart: '0 3 * * *',
    }]
};
