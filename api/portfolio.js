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

  if (req.method === 'GET') {
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
      } catch(e) {}

      const imgItems = (imgResult.resources || []).map(r => formatItem(r, 'image'));
      const all = [...imgItems, ...vidItems].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return res.status(200).json({ items: all });
    } catch (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id, resourceType, adminPassword } = req.body;

      if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!id) return res.status(400).json({ error: 'Missing id' });
      await cloudinary.uploader.destroy(id, { resource_type: resourceType || 'image' });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

function formatItem(resource, resourceType) {
  const tags     = resource.tags || [];
  const category = tags.find(t => ['graphics','web','video','game'].includes(t)) || 'graphics';
  const titleTag = tags.find(t => !['portfolio','graphics','web','video','game'].includes(t));
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