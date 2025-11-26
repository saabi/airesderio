# Aires de Río

Promotional website for **Aires de Río**, a residential development project in Santiago del Estero, Argentina.

## Quick Navigation

- **[Development Setup](fe/README.md)** - Get started with development
- **[Documentation](docs/README.md)** - Full project documentation
- **[Architecture](docs/specs/architecture.md)** - Technical architecture
- **[Tickets](docs/tickets/)** - Improvement tickets and tasks
- **[Process Documentation](docs/process/)** - Development processes and conventions
- **[Deployment Guide](#production-deployment)** - Production deployment instructions

## Quick Start

See [`fe/README.md`](fe/README.md) for development setup and project details.

## Production Deployment

This project is built with SvelteKit using `@sveltejs/adapter-node` for Node.js deployment. The application runs as a Node.js server using PM2 on a Linode VM with Nginx as a reverse proxy. This enables full API route support (including the contact form).

### Prerequisites

- Node.js 18+ and npm
- Google Maps API key
- (Optional) Resend API key for contact form (see [Contact Form](#contact-form) section)

### Build Process

1. **Navigate to the frontend directory:**
   ```bash
   cd fe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the `fe/` directory:
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   ```env
   # Google Maps API Key (required)
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   
   # Contact Form (optional - see Contact Form section)
   RESEND_API_KEY=re_your_key_here
   CONTACT_FORM_RECIPIENT=your_email@example.com
   CONTACT_FORM_FROM=onboarding@your_domain.com
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```
   
   The production build will be in `fe/build/` directory.

5. **Preview locally (optional):**
   ```bash
   npm run preview
   ```

### Deployment Options

#### Option 1: Netlify (Recommended for Static Sites)

1. **Connect your repository** to Netlify
2. **Configure build settings:**
   - **Base directory:** `fe`
   - **Build command:** `npm run build`
   - **Publish directory:** `fe/build`
3. **Set environment variables** in Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add `VITE_GOOGLE_MAPS_API_KEY` and other required variables
4. **Deploy:** Netlify will automatically deploy on every push to your main branch

**Note:** For contact form functionality, you can use [Netlify Forms](https://docs.netlify.com/forms/setup/) or set up Netlify Functions (see [Contact Form](#contact-form) section).

#### Option 2: Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd fe
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - Go to Project settings → Environment Variables
   - Add `VITE_GOOGLE_MAPS_API_KEY` and other required variables

4. **For automatic deployments:** Connect your Git repository in Vercel dashboard

**Note:** Vercel supports serverless functions, so you can deploy the contact form API route by switching to `@sveltejs/adapter-vercel` (see [Contact Form](#contact-form) section).

#### Option 3: GitHub Pages

1. **Install GitHub Pages adapter:**
   ```bash
   cd fe
   npm install -D @sveltejs/adapter-static
   ```

2. **Update `svelte.config.js`** to set the correct base path:
   ```js
   adapter: adapter({
     pages: 'build',
     assets: 'build',
     fallback: '200.html',
     precompress: false,
     strict: true
   })
   ```

3. **Create GitHub Actions workflow** (`.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: ['main']
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install dependencies
           run: |
             cd fe
             npm ci
         - name: Build
           run: |
             cd fe
             npm run build
           env:
             VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./fe/build
   ```

4. **Set secrets** in GitHub repository settings:
   - Go to Settings → Secrets and variables → Actions
   - Add `VITE_GOOGLE_MAPS_API_KEY`

#### Option 4: VM with PM2 (Node.js Server) ✅ **CHOSEN DEPLOYMENT METHOD**

This is the **chosen deployment method** for Aires de Río. The application runs as a Node.js server using PM2 process manager on a Linode VM running Debian, with Nginx as a reverse proxy. This enables full API route support (including the contact form).

1. **Switch to Node.js adapter:**
   ```bash
   cd fe
   npm install -D @sveltejs/adapter-node
   ```

2. **Update `svelte.config.js`:**
   ```js
   import adapter from '@sveltejs/adapter-node';
   
   // ... rest of config
   kit: {
     adapter: adapter({
       out: 'build',
       precompress: true,
       envPrefix: ''
     })
   }
   ```

3. **Install PM2 globally on your server:**
   ```bash
   npm install -g pm2
   ```

4. **Build the application:**
   ```bash
   cd fe
   npm install
   npm run build
   ```

5. **Create PM2 ecosystem file** (`fe/ecosystem.config.js`):
   ```js
   module.exports = {
     apps: [{
       name: 'airesderio',
       script: './build/index.js',
       instances: 1,
       exec_mode: 'fork',
       env: {
         NODE_ENV: 'production',
         PORT: process.env.PORT || 3000,
         HOST: process.env.HOST || '0.0.0.0'
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: process.env.PORT || 3000,
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
     }]
   };
   ```
   
   **Note:** The port can be configured in several ways:
   - Set `PORT` environment variable before starting PM2
   - Modify the default value in the ecosystem file (currently `3000`)
   - Pass environment variables when starting: `pm2 start ecosystem.config.js --env production --update-env -- PORT=8080`

6. **Create logs directory:**
   ```bash
   mkdir -p fe/logs
   ```

7. **Set up environment variables:**
   
   Create a `.env` file in the `fe/` directory:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   RESEND_API_KEY=re_your_key_here
   CONTACT_FORM_RECIPIENT=your_email@example.com
   CONTACT_FORM_FROM=onboarding@your_domain.com
   PORT=3000
   HOST=0.0.0.0
   ```
   
   **Note:** For PM2, you can also set environment variables in the ecosystem file or use PM2's environment variable management.

8. **Start the application with PM2:**
   
   **Option A: Use default port (3000) from ecosystem file:**
   ```bash
   cd fe
   pm2 start ecosystem.config.js --env production
   ```
   
   **Option B: Specify a custom port:**
   ```bash
   cd fe
   PORT=8080 pm2 start ecosystem.config.js --env production --update-env
   ```
   
   **Option C: Use a different port permanently:**
   
   Edit `fe/ecosystem.config.js` and change the default port:
   ```js
   PORT: process.env.PORT || 8080,  // Changed from 3000 to 8080
   ```
   
   Then start normally:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```
   
   **Option D: Set port in system environment:**
   ```bash
   export PORT=8080
   pm2 start ecosystem.config.js --env production --update-env
   ```

9. **Save PM2 process list** (so it restarts on server reboot):
   ```bash
   pm2 save
   pm2 startup
   ```
   
   Follow the instructions from `pm2 startup` to set up the systemd service.

10. **Configure Nginx as reverse proxy:**
    
    Create `/etc/nginx/sites-available/airesderio`:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        
        # Redirect HTTP to HTTPS (optional but recommended)
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;
        
        # SSL certificates (use Let's Encrypt)
        ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
        
        # Proxy to Node.js application
    # Update the port (3000) to match your PM2 configuration
        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Static assets caching
        # Update the port (3000) to match your PM2 configuration
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://localhost:3000;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    ```
    
    Enable the site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/airesderio /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    ```

11. **Set up SSL with Let's Encrypt** (recommended):
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com -d www.your-domain.com
    ```

**PM2 Management Commands:**
```bash
# View application status
pm2 status

# View logs
pm2 logs airesderio

# Restart application
pm2 restart airesderio

# Stop application
pm2 stop airesderio

# Delete application from PM2
pm2 delete airesderio

# Monitor resources
pm2 monit

# Reload application (zero-downtime)
pm2 reload airesderio
```

**Updating the Application:**
```bash
cd fe
git pull
npm install
npm run build
pm2 reload airesderio
```

#### Option 5: Traditional Web Server (Static Files - Apache/Nginx)

1. **Build the site:**
   ```bash
   cd fe
   npm run build
   ```

2. **Upload the `fe/build/` directory** to your web server

3. **Configure your web server** to serve `200.html` for all routes (for client-side routing):

   **Nginx configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/build;
       index 200.html;
       
       location / {
           try_files $uri $uri/ /200.html;
       }
   }
   ```

   **Apache configuration** (`.htaccess` in build directory):
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /200.html [L]
   </IfModule>
   ```

4. **Set environment variables** as build-time variables (they're embedded in the build)

### Contact Form

⚠️ **Important:** The contact form API route (`fe/src/routes/api/contact/+server.ts`) **will not work** with the current static adapter configuration. You have several options:

#### Option A: Use Netlify Forms (Easiest for Static Sites)

1. Update `ContactForm.svelte` to use Netlify's form format:
   ```html
   <form name="contact" netlify netlify-honeypot="honeypot" method="POST">
     <!-- form fields -->
   </form>
   ```

2. No backend code needed - Netlify handles form submissions automatically

#### Option B: Use a Third-Party Service

- **Formspree:** Simple form backend service
- **EmailJS:** Send emails directly from the client
- **Web3Forms:** Free form backend

#### Option C: Switch to Server-Side Adapter

If you need the full API route functionality:

1. **For Vercel:**
   ```bash
   cd fe
   npm install -D @sveltejs/adapter-vercel
   ```
   
   Update `svelte.config.js`:
   ```js
   import adapter from '@sveltejs/adapter-vercel';
   ```

2. **For Netlify:**
   ```bash
   cd fe
   npm install -D @sveltejs/adapter-netlify
   ```
   
   Update `svelte.config.js`:
   ```js
   import adapter from '@sveltejs/adapter-netlify';
   ```

3. **For Node.js server:**
   ```bash
   cd fe
   npm install -D @sveltejs/adapter-node
   ```
   
   Update `svelte.config.js`:
   ```js
   import adapter from '@sveltejs/adapter-node';
   ```

### Environment Variables

#### Required for Production

- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key for the interactive map
  - Get from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
  - **Important:** Restrict the API key to your production domain for security

#### Optional (for Contact Form)

- `RESEND_API_KEY` - Resend API key for email notifications
- `CONTACT_FORM_RECIPIENT` - Email address to receive form submissions
- `CONTACT_FORM_FROM` - Verified sender email address in Resend

**Note:** Environment variables prefixed with `VITE_` are embedded in the client-side build and are publicly accessible. Never put sensitive secrets in `VITE_` variables.

### Post-Deployment Checklist

- [ ] Verify Google Maps is loading correctly
- [ ] Test contact form functionality (if implemented)
- [ ] Check all internal links work correctly
- [ ] Verify responsive design on mobile devices
- [ ] Test theme switching (dark/light mode)
- [ ] Verify SEO meta tags are correct
- [ ] Check that all images load properly
- [ ] Test form validation and error messages
- [ ] Verify Google Maps API key restrictions are set correctly

### Troubleshooting

#### Google Maps not loading
- Check that `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- Verify API key restrictions allow your domain
- Check browser console for API errors

#### 404 errors on page refresh
- Ensure your server is configured to serve `200.html` for all routes (see web server configuration above)

#### Contact form not working
- Verify that the application is running with PM2: `pm2 status`
- Check PM2 logs: `pm2 logs airesderio`
- Verify environment variables are set correctly (especially `RESEND_API_KEY`)
- Check Nginx configuration is proxying to the correct port
- Verify API route is accessible: `curl http://localhost:3000/api/contact`

#### Build fails
- Ensure Node.js version is 18 or higher
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check that all environment variables are set

### CI/CD Integration

For automated deployments, you can set up CI/CD pipelines:

- **GitHub Actions:** See GitHub Pages example above
- **GitLab CI:** Similar workflow with GitLab runners
- **CircleCI/Travis CI:** Configure build and deploy steps

Example GitHub Actions workflow for Netlify:
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install and build
        run: |
          cd fe
          npm ci
          npm run build
        env:
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=fe/build --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Project Structure

```
airesderio/
├── fe/                    # Frontend application
│   ├── src/              # Source code
│   ├── static/           # Static assets
│   ├── build/            # Production build output
│   └── package.json      # Dependencies and scripts
└── docs/                 # Project documentation
```

For detailed development documentation, see [`fe/README.md`](fe/README.md).
