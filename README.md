
# 📂 JustiFi

**JustiFi** is a full-stack Next.js application that helps legal professionals organize case files, chat with an AI assistant, and generate AI-powered insights. It features:

- **Clerk-powered authentication** (Sign-in, SSO, webhooks)
- **MongoDB** via Mongoose for Users, Spaces, Documents, Threads, Messages & Insights
- **Cloudinary** document uploads
- **AI chat threads** per case, with messages stored separately
- **AI-generated case insights** (summary, support & opposition)
- Fully responsive UI built with Tailwind CSS & Radix UI components

---

## 🚀 Quick Start

1. **Clone & install**  
   bash
   git clone https://github.com/your-org/justifi.git
   cd justifi
   npm install
`

2. **Environment Variables**
   Create a `.env.local` in the project root with:

   env
   # MongoDB
   MONGODB_URI=your_mongo_connection_string

   # Clerk
   CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   CLERK_WEBHOOK_SECRET=whsec_...

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # (Optional) If you need absolute URLs in server code
   NEXT_PUBLIC_API_URL=http://localhost:3000
   

3. **Run locally**

   bash
   npm run dev
   

4. **Expose webhooks in development**

   bash
   npx ngrok http 3000
   

   Copy the HTTPS forwarding URL into your Clerk Webhooks settings.



## 🧩 Technologies

* **Framework**: Next.js (App Router)
* **Auth**: Clerk
* **Database**: MongoDB + Mongoose
* **File Storage**: Cloudinary
* **UI**: Tailwind CSS, Radix UI primitives, Lucide icons
* **AI & HTTP**: Axios, react-markdown, Sonner toasts

---

## 🛠 Development Tips

* **Multiple developers & webhooks**
  Deploy to Vercel (or any single stable URL). In Clerk Webhooks, point to your Vercel URL so all teammates share the same endpoint.
* **Database connection**
  `lib/mongoose.ts` uses a global cache to avoid reconnecting during hot reloads.
* **Clerk**
  Make sure your `CLERK_*` vars match your Clerk dashboard settings (Publishable & Secret keys).

