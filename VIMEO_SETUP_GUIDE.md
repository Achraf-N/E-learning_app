# VIMEO INTEGRATION SETUP GUIDE

# Follow these steps to set up Vimeo integration for your e-learning platform

## 🎬 STEP 1: Create Vimeo Developer Account

1. Go to https://developer.vimeo.com/
2. Sign in with your Vimeo account (create one if needed)
3. Click "Create App"
4. Fill in app details:
   - App Name: "Your E-Learning Platform"
   - App Description: "Educational video platform"
   - App URL: "http://localhost:5173" (or your domain)

## 🔑 STEP 2: Generate Access Token

1. After creating the app, go to "Authentication" tab
2. Click "Generate Token"
3. Select these scopes:
   ✅ public - Access public data
   ✅ private - Access private data  
   ✅ upload - Upload videos
   ✅ edit - Edit videos
   ✅ video_files - Access video files

4. Copy the generated token - you'll need it for your backend

## 📝 STEP 3: Get Your App Credentials

From your app dashboard, copy these values:

- Client ID
- Client Secret
- Access Token (from step 2)

## 🔧 STEP 4: Backend Setup

1. Install required Python packages:

```bash
pip install python-vimeo requests
```

2. Add environment variables to your backend:

```env
VIMEO_CLIENT_ID=your_client_id_here
VIMEO_CLIENT_SECRET=your_client_secret_here
VIMEO_ACCESS_TOKEN=your_access_token_here
```

3. Add the provided endpoints to your FastAPI backend
4. Update your JWT verification logic in the `verify_admin` function

## 🎯 STEP 5: Frontend Setup

The frontend components are already created:

- AdminDashboard.jsx - Main admin interface
- VimeoUploader.jsx - Video upload component

## 🚀 STEP 6: Testing

1. Access the admin dashboard: http://localhost:5173/admin/dashboard
2. Click "Upload Video"
3. Fill in lesson details and select a video file
4. The video will upload to Vimeo and save lesson data to your database

## 📊 STEP 7: Features Included

✅ Drag & drop video upload
✅ Progress tracking during upload
✅ Automatic metadata setting on Vimeo
✅ Database integration for lessons
✅ Course selection and lesson ordering
✅ Error handling and user feedback
✅ Admin role verification
✅ Responsive design

## 🎨 STEP 8: Vimeo Settings Recommendations

In your Vimeo app settings:

- Privacy: Set to "Unlisted" for security
- Embed: Enable embedding for your domain
- Player: Customize colors to match your brand
- Analytics: Enable for tracking engagement

## 💡 STEP 9: Production Considerations

For production deployment:

- Use environment variables for all credentials
- Set up proper domain in Vimeo app settings
- Consider Vimeo Pro/Business for better features
- Implement video thumbnails and previews
- Add video compression and quality options

## 🔒 STEP 10: Security Notes

- Never expose Vimeo credentials in frontend code
- Always verify admin role before allowing uploads
- Consider rate limiting for uploads
- Validate file types and sizes
- Use HTTPS in production

## 📱 Next Steps

After Vimeo integration works:

1. Add video player improvements
2. Implement video analytics
3. Add subtitle/caption support
4. Create video library management
5. Add batch upload functionality

## 🆘 Troubleshooting

Common issues:

- "Invalid token" → Check access token and scopes
- "Upload failed" → Verify file size and format
- "Access denied" → Check admin role verification
- "Network error" → Check CORS settings

## 📋 File Structure

Your project should have:

```
src/
├── Components/
│   ├── Admin/
│   │   ├── AdminDashboard.jsx
│   │   └── VimeoUploader.jsx
│   └── ...
├── App.jsx (updated with admin routes)
└── ...

backend/
├── vimeo_endpoints.py (add to your FastAPI app)
└── ...
```

## 🎉 You're Ready!

Once you complete these steps, you'll have a professional video upload system that rivals major e-learning platforms like Udemy and Coursera!
