# लोकल न्यूज़ पोर्टल (Next.js + Cloudinary)

यह प्रोजेक्ट अब हिंदी-ओनली न्यूज़ पोर्टल के रूप में अपडेट किया गया है।

## क्या बदला गया है

1. एडमिन से पोस्ट सेव करने पर:
- आर्टिकल JSON Cloudinary Raw resource में सेव होता है
- इमेज Cloudinary Image folder में अपलोड होती है

2. फ्रंटएंड डेटा सोर्स:
- पहले Cloudinary से आर्टिकल पढ़े जाते हैं
- अगर Cloudinary env configure नहीं है, तो `data/news.json` fallback चलता है
- site/categories/locations को भी Cloudinary JSON से मैनेज किया जा सकता है

3. भाषा:
- डिफॉल्ट और एकमात्र भाषा हिंदी
- Language switcher हटाया गया है

---

## जरूरी Cloudinary Environment Variables

`.env.local` में ये जोड़ें:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_AUTH_SECRET=Node
SUBADMIN_AUTH_SECRET=admin
```

नोट:
- `CLOUDINARY_API_SECRET` केवल server-side में उपयोग होता है
- इसे कभी public client code में expose न करें
- `ADMIN_AUTH_SECRET` से login करने पर full admin access (UI content + articles content + post management) मिलता है
- `SUBADMIN_AUTH_SECRET` से login करने पर only post management access मिलता है

---

## लोकल सेटअप (Run + Test)

1. dependencies install करें:

```bash
npm install
```

2. dev server चलाएं:

```bash
npm run dev
```

3. ब्राउज़र में खोलें:
- होम: `http://localhost:3000`
- एडमिन: `http://localhost:3000/admin-preview`

4. एडमिन से नई पोस्ट सेव करके टेस्ट करें:
- slug, title, summary, content भरें
- image upload करें (या image URL दें)
- "Cloudinary में सेव करें" क्लिक करें

5. verify करें:
- API preview: `http://localhost:3000/api/news-preview`
- साइट होम/श्रेणी/slug पेज पर नई खबर दिखनी चाहिए

---

## Cloudinary Integration Flow

### Save Flow

`/admin-preview` form -> `POST /api/admin/articles` ->

1. इमेज: Cloudinary folder `news-portal/images` में अपलोड
2. आर्टिकल JSON: Cloudinary raw `news-portal/articles/<slug>` में सेव

### Read Flow

`lib/news.js` -> `lib/cloudinaryNews.js` ->

1. Cloudinary raw resources list
2. हर JSON fetch + parse
3. publishedAt desc sort
4. data not found/Cloudinary missing => local JSON fallback

### UI Content Flow

- `GET /api/admin/ui-content` Cloudinary JSON से site/categories/locations लोड करता है
- `POST /api/admin/ui-content` वही JSON Cloudinary में सेव करता है
- Admin page पर "UI कंटेंट JSON (Cloudinary)" सेक्शन से यह कंटेंट edit करके save किया जा सकता है
- `data/news.json` local backup/fallback के रूप में रखा गया है

---

## इस्तेमाल हुए मुख्य फाइल बदलाव

- `lib/cloudinary.js` - Cloudinary client/config helper
- `lib/cloudinaryNews.js` - article save/read logic
- `app/api/admin/articles/route.js` - admin POST/GET API
- `components/AdminPostForm.js` - admin save form
- `lib/news.js` - Cloudinary-first read + fallback
- `app/api/news-preview/route.js` - active data response
- `components/Header.js` - language switcher remove
- `lib/i18n.js` - Hindi-only normalization
- `app/layout.js` - html lang + metadata Hindi

---

## Vercel Deploy Steps

1. कोड GitHub/GitLab/Bitbucket पर push करें
2. Vercel में नया project import करें
3. Framework: Next.js auto-detect होने दें
4. Vercel Project Settings -> Environment Variables में जोड़ें:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_SITE_URL` = production domain (e.g. `https://your-domain.vercel.app`)
5. Deploy करें

### Deploy के बाद Quick Smoke Test

1. `https://your-domain/admin-preview` खोलें
2. एक टेस्ट पोस्ट सेव करें
3. `https://your-domain/api/news-preview` में नई entry check करें
4. होम/slug पेज पर पोस्ट दिख रही है या नहीं verify करें

---

## Common Troubleshooting

1. Error: Cloudinary is not configured
- `.env.local` keys missing हैं या server restart नहीं किया गया

2. Image upload fail
- API key/secret गलत
- Cloudinary account limits/check

3. Post save success but list में नहीं दिख रही
- slug duplicate होने पर overwrite behavior check करें
- `/api/news-preview` response inspect करें

4. Vercel पर काम नहीं कर रहा
- Project env vars set हैं या नहीं verify करें
- Redeploy after env update

---

## Security Notes

- `CLOUDINARY_API_SECRET` केवल server env में रखें
- client-side JS में secret कभी न रखें
- production में admin route पर auth ज़रूर जोड़ें

---

## Next Recommended Improvements

1. `/admin-preview` और `/api/admin/articles` पर authentication जोड़ें
2. Article delete/update workflow जोड़ें
3. Cloudinary upload preset + moderation pipeline जोड़ें
4. Audit log या version history जोड़ें
