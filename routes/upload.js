// ============================================================
//  routes/upload.js — upload a new portfolio item to Cloudinary
// ============================================================
const express    = require('express');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload
router.post('/', async (req, res) => {
  try {
    const { dataUrl, title, category, description, fileType, adminPassword } = req.body;

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!dataUrl) return res.status(400).json({ error: 'Missing file data' });

    const resourceType = fileType && fileType.startsWith('video') ? 'video' : 'image';

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: 'chat-tpg-portfolio',
      resource_type: resourceType,
      tags: [category || 'graphics', title ? encodeURIComponent(title) : 'untitled'],
    });

    res.status(200).json({
      id:           result.public_id,
      url:          result.secure_url,
      thumbnailUrl: resourceType === 'video'
        ? result.secure_url.replace('/video/upload/', '/video/upload/so_0/').replace(/\.\w+$/, '.jpg')
        : result.secure_url,
      title:        title || 'Untitled',
      category:     category || 'graphics',
      description:  description || '',
      fileType,
      resourceType,
      createdAt:    result.created_at,
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

module.exports = router;
