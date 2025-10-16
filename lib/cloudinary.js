// Cloudinary configuration and upload functions
const CLOUDINARY_UPLOAD_PRESET = 'uiu_vc_cup'; // Custom preset for UIU VC Cup
const CLOUDINARY_CLOUD_NAME = 'dav7houtb'; // Your Cloudinary cloud name

export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'team-logos'); // Organize uploads in folders

    console.log('Uploading to Cloudinary with preset:', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cloudinary error response:', errorData);
      throw new Error(`Upload failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    // Note: Deletion requires server-side implementation with API secret
    // For now, we'll just log the public ID for manual cleanup
    console.log('Image to delete:', publicId);
    // TODO: Implement server-side deletion endpoint
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

// Generate optimized image URLs
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 200,
    height = 200,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
};
