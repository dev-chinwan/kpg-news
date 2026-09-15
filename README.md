# 📰 KPG News Portal (Next.js + Cloudinary)

A modern, Hindi-language news portal built with Next.js, React, and Cloudinary for seamless content management and media hosting.

**Live Site**: [https://kpg-news.vercel.app](https://kpg-news.vercel.app)

---

## 🎯 Project Overview

KPG News Portal is a fully-featured news management system with:
- **Hindi-first content** (language switcher removed)
- **Cloud-based article storage** via Cloudinary
- **Admin dashboard** for content management
- **Responsive design** for all devices
- **Automatic fallback** to local data if Cloudinary is unavailable

---

## ✨ Key Features

### 1. **Admin Panel** (`/admin-preview`)
- Create and publish news articles
- Upload images to Cloudinary
- Manage site categories and locations
- Edit UI content (site metadata, categories, locations)
- Real-time preview of changes

### 2. **Article Management**
- Store articles as JSON in Cloudinary
- Image auto-upload to Cloudinary storage
- URL-based slug system
- Automatic sorting by publish date
- Local JSON fallback support

### 3. **Content Organization**
- Categorized news sections
- Location-based news filtering
- Responsive article cards
- Full article pages with metadata

### 4. **Cloud Integration**
- Cloudinary raw resources for JSON storage
- Cloudinary image folder for media
- Secure API key management
- Production-ready deployment

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudinary account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dev-chinwan/kpg-news.git
cd kpg-news
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local` in the root directory:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENABLE_LEGACY_ARTICLES_MIGRATION=false
```

**⚠️ Important Security Notes:**
- `CLOUDINARY_API_SECRET` should **only** be in `.env.local` (server-side)
- Never expose the API secret in client-side code
- Enable legacy migration only if migrating from old articles

4. **Start development server**
```bash
npm run dev
```

5. **Access the application**
- Frontend: [http://localhost:3000](http://localhost:3000)
- Admin Panel: [http://localhost:3000/admin-preview](http://localhost:3000/admin-preview)

---

## 📝 Usage Guide

### Creating a News Article

1. Navigate to **Admin Panel**: `http://localhost:3000/admin-preview`
2. Fill in the article details:
   - **Slug**: URL-friendly identifier (auto-generated or custom)
   - **Title**: Article headline (Hindi)
   - **Summary**: Brief description
   - **Content**: Full article text
   - **Category**: News category
   - **Location**: Location tag
   
3. **Upload Image**:
   - Click "Choose Image" or paste image URL
   - Image will auto-upload to Cloudinary

4. **Save Article**:
   - Click "Cloudinary में सेव करें" (Save to Cloudinary)
   - JSON stored in Cloudinary raw resources
   - Image stored in Cloudinary image folder

5. **Verify**:
   - Check API preview: `http://localhost:3000/api/news-preview`
   - View on homepage or category pages

### Editing Site Content

1. Scroll to "UI Content JSON (Cloudinary)" section
2. Edit site metadata, categories, or locations
3. Click save to update Cloudinary storage
4. Changes reflect immediately on the frontend

---

## 🏗️ Architecture

### Data Flow

#### Save Flow
```
Admin Form 
  ↓
POST /api/admin/articles
  ├→ Upload Image to Cloudinary (news-portal/images)
  └→ Save JSON to Cloudinary (news-portal/articles/<slug>)
```

#### Read Flow
```
Frontend
  ↓
lib/news.js → lib/cloudinaryNews.js
  ├→ List Cloudinary raw resources
  ├→ Fetch and parse each JSON
  ├→ Sort by publishedAt (descending)
  └→ Fallback to data/news.json if unavailable
```

#### UI Content Flow
```
Admin → GET /api/admin/ui-content → Cloudinary JSON
Admin → POST /api/admin/ui-content → Save to Cloudinary
```

### File Structure
```
.
├── app/
│   ├── api/
│   │   ├── admin/articles/route.js       # Article CRUD API
│   │   └── admin/ui-content/route.js     # Site content API
│   │   └── news-preview/route.js         # Public news API
│   ├── layout.js                          # App layout (Hindi config)
│   └── pages/                            # Dynamic routes
├── components/
│   ├── AdminPostForm.js                  # Admin form component
│   └── Header.js                         # Header (no language switcher)
├── lib/
│   ├── cloudinary.js                     # Cloudinary config
│   ├── cloudinaryNews.js                 # Article read/write logic
│   ├── news.js                           # News data layer
│   └── i18n.js                           # Hindi-only i18n
├── data/
│   └── news.json                         # Local fallback data
└── public/                               # Static assets
```

---

## 🌐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Yes | Your Cloudinary account name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret (server-only) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Application URL (public) |
| `ENABLE_LEGACY_ARTICLES_MIGRATION` | No | Enable migration API (default: false) |

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.3.3 | React framework |
| React | 19.0.0 | UI library |
| Tailwind CSS | 3.4.17 | Styling |
| Lucide React | 0.469.0 | Icons |
| Cloudinary | 2.8.0 | Media & storage |

---

## 🚢 Deployment (Vercel)

### Step-by-Step

1. **Push code to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

3. **Configure Environment Variables**
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - **Important**: `NEXT_PUBLIC_SITE_URL` should be your production domain
     ```
     https://your-domain.vercel.app
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Post-Deployment Verification

1. Open admin panel: `https://your-domain.vercel.app/admin-preview`
2. Create a test article
3. Check API: `https://your-domain.vercel.app/api/news-preview`
4. Verify on homepage and category pages

---

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server (with hot reload)
npm run dev:insecure # Dev server with insecure TLS (if needed)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/news-preview` | GET | Fetch all articles |
| `/api/admin/articles` | GET | List articles |
| `/api/admin/articles` | POST | Save article |
| `/api/admin/ui-content` | GET | Fetch site content |
| `/api/admin/ui-content` | POST | Update site content |

---

## ⚠️ Troubleshooting

### Issue: "Cloudinary is not configured"
**Solution:**
- Verify `.env.local` has correct credentials
- Restart dev server after updating env vars
- Check Cloudinary dashboard for valid API keys

### Issue: Image upload fails
**Solution:**
- Verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
- Check Cloudinary account limits/quotas
- Ensure image format is supported (JPG, PNG, GIF, WebP)

### Issue: Articles save but don't appear in list
**Solution:**
- Check slug uniqueness (duplicates may overwrite)
- Inspect `/api/news-preview` response
- Verify Cloudinary raw resource contains the JSON
- Check browser console for errors

### Issue: Not working on Vercel after deploy
**Solution:**
- Verify all environment variables are set in Vercel dashboard
- Redeploy after updating env vars
- Check build logs for errors
- Ensure `NEXT_PUBLIC_SITE_URL` is production domain

### Issue: Articles not persisting after server restart
**Solution:**
- This is expected behavior (articles stored in Cloudinary)
- Verify Cloudinary credentials are correct
- Check local fallback in `data/news.json`

---

## 🔐 Security Best Practices

### Critical
- ✅ Keep `CLOUDINARY_API_SECRET` **only** in `.env.local`
- ✅ Never commit `.env.local` to git
- ✅ Add `.env.local` to `.gitignore`

### Recommended
- 🔒 **Add authentication** to `/admin-preview` route (required for production)
- 🔒 **Implement rate limiting** on article creation API
- 🔒 **Add article moderation** pipeline before publishing
- 🔒 **Enable request validation** for all admin endpoints
- 🔒 **Log all admin actions** for audit trail

---

## 📋 Roadmap & Improvements

### Planned Features
- [ ] **Admin Authentication**: Secure login system
- [ ] **Article Editing/Deletion**: Full CRUD workflow
- [ ] **Upload Presets**: Cloudinary upload presets + moderation
- [ ] **Version History**: Track article changes
- [ ] **Bulk Operations**: Import/export articles
- [ ] **Analytics**: View counts and engagement metrics
- [ ] **Scheduled Publishing**: Schedule articles for future publish
- [ ] **Draft System**: Save articles as draft before publishing

### Current Limitations
- No user authentication (add before production)
- No article versioning
- No bulk operations
- No moderation workflow

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Not specified. Add a license file if needed.

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review Cloudinary documentation: [cloudinary.com/docs](https://cloudinary.com/docs)
3. Check Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
4. Open an issue on GitHub

---

## 📍 Project Info

- **Author**: dev-chinwan
- **Repository**: [dev-chinwan/kpg-news](https://github.com/dev-chinwan/kpg-news)
- **Status**: Active Development
- **Last Updated**: September 2026

---

**Made with ❤️ for local Hindi news**
