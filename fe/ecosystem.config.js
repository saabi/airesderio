module.exports = {
	apps: [
		{
			name: 'airesderio',
			script: './build/index.js',
			instances: 1,
			exec_mode: 'fork',
			env: {
				NODE_ENV: 'production',
				PORT: process.env.PORT || 3100,
				HOST: process.env.HOST || '0.0.0.0'
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: process.env.PORT || 3100,
				HOST: process.env.HOST || '0.0.0.0'
			},
			error_file: './logs/err.log',
			out_file: './logs/out.log',
			log_file: './logs/combined.log',
			time: true,
			autorestart: true,
			max_restarts: 10,
			min_uptime: '10s',
			max_memory_restart: '1G'
		}
	]
};

