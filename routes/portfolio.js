// ============================================================
//  routes/portfolio.js — list & delete portfolio items
// ============================================================
const express   = require('express');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/portfolio — list all items
router.get('/', async (req, res) => {
  try {
    const imgResult = await cloudinary.search
      .expression('folder:chat-tpg-portfolio')
      .with_field('tags')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    let vidItems = [];
    try {
      const vidResult = await cloudinary.search
        .expression('resource_type:video AND folder:chat-tpg-portfolio')
        .with_field('tags')
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();
      vidItems = (vidResult.resources || []).map(r => formatItem(r, 'video'));
    } catch (e) { /* no videos yet — fine */ }

    const imgItems = (imgResult.resources || []).map(r => formatItem(r, 'image'));
    const all = [...imgItems, ...vidItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({ items: all });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/portfolio — remove an item (admin only)
router.delete('/', async (req, res) => {
  try {
    const { id, resourceType, adminPassword } = req.body;

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!id) return res.status(400).json({ error: 'Missing id' });
    await cloudinary.uploader.destroy(id, { resource_type: resourceType || 'image' });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function formatItem(resource, resourceType) {
  const tags     = resource.tags || [];
  const category = tags.find(t => ['graphics', 'web', 'video', 'game'].includes(t)) || 'graphics';
  const titleTag = tags.find(t => !['portfolio', 'graphics', 'web', 'video', 'game'].includes(t));
  const title    = titleTag ? decodeURIComponent(titleTag) : resource.public_id.split('/').pop();

  return {
    id:           resource.public_id,
    url:          resource.secure_url,
    thumbnailUrl: resourceType === 'video'
      ? resource.secure_url.replace('/video/upload/', '/video/upload/so_0/').replace(/\.\w+$/, '.jpg')
      : resource.secure_url,
    title,
    category,
    description:  '',
    fileType:     resourceType === 'video' ? 'video/mp4' : `image/${resource.format}`,
    resourceType,
    createdAt:    resource.created_at,
  };
}

module.exports = router;
