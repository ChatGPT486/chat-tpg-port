// api/portfolio.js
// Returns all portfolio items from Cloudinary (no DB needed)
// Cloudinary stores metadata as "context" on each asset

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: list all portfolio items ──────────────────────────────
  if (req.method === 'GET') {
    try {
      const category = req.query.category; // optional filter

      const searchExpr = category && category !== 'all'
        ? `folder:chat-tpg-portfolio AND tags=${category}`
        : `folder:chat-tpg-portfolio`;

      // Fetch images
      const imageSearch = cloudinary.search
        .expression(searchExpr)
        .with_field('context')
        .with_field('tags')
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();

      // Fetch videos
      const videoSearch = cloudinary.search
        .expression(searchExpr.replace('folder:', 'resource_type:video AND folder:'))
        .with_field('context')
        .with_field('tags')
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();

      const [imgResult, vidResult] = await Promise.allSettled([imageSearch, videoSearch]);

      const imgItems = imgResult.status === 'fulfilled'
        ? (imgResult.value.resources || []).map(r => formatItem(r, 'image'))
        : [];

      const vidItems = vidResult.status === 'fulfilled'
        ? (vidResult.value.resources || []).map(r => formatItem(r, 'video'))
        : [];

      // Merge and sort by date
      const all = [...imgItems, ...vidItems].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return res.status(200).json({ items: all });

    } catch (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── DELETE: remove a portfolio item ───────────────────────────
  if (req.method === 'DELETE') {
    try {
      const { id, resourceType } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      await cloudinary.uploader.destroy(id, {
        resource_type: resourceType || 'image',
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

// ── Helper ──────────────────────────────────────────────────────
function formatItem(resource, resourceType) {
  const ctx = resource.context?.custom || {};
  return {
    id:           resource.public_id,
    url:          resource.secure_url,
    thumbnailUrl: resourceType === 'video'
      ? cloudinary.url(resource.public_id, {
          resource_type: 'video',
          format: 'jpg',
          transformation: [{ width: 600, height: 450, crop: 'fill' }],
        })
      : resource.secure_url,
    title:        ctx.title       || resource.public_id.split('/').pop(),
    category:     ctx.category    || (resource.tags && resource.tags[1]) || 'graphics',
    description:  ctx.description || '',
    fileType:     resourceType === 'video' ? 'video/mp4' : `image/${resource.format}`,
    resourceType,
    createdAt:    resource.created_at,
  };
}
