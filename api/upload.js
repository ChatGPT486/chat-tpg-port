// api/upload.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { dataUrl, title, category, description, fileType } = req.body;

    if (!dataUrl || !title || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const resourceType = fileType && fileType.startsWith('video') ? 'video' : 'image';

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: 'chat-tpg-portfolio',
      resource_type: resourceType,
      tags: ['portfolio', category, encodeURIComponent(title)],
    });

    return res.status(200).json({
      id:           result.public_id,
      url:          result.secure_url,
      thumbnailUrl: resourceType === 'video'
        ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${result.public_id}.jpg`
        : result.secure_url,
      title,
      category,
      description:  description || '',
      fileType,
      resourceType,
      createdAt:    result.created_at,
    });

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
};
