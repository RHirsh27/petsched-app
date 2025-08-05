const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class FileUploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '..', 'uploads');
    this.ensureUploadDirectory();
  }

  // Ensure upload directory exists
  ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // Configure multer for file uploads
  configureMulter() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req, file, cb) => {
      // Allow only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    };

    return multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file at a time
      }
    });
  }

  // Upload pet photo
  uploadPetPhoto() {
    return this.configureMulter().single('photo');
  }

  // Upload multiple pet photos
  uploadPetPhotos() {
    return this.configureMulter().array('photos', 5); // Max 5 photos
  }

  // Get file URL
  getFileUrl(filename) {
    return `/uploads/${filename}`;
  }

  // Delete file
  deleteFile(filename) {
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  // Get file info
  getFileInfo(filename) {
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        url: this.getFileUrl(filename)
      };
    }
    return null;
  }

  // Validate file type
  validateFileType(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.mimetype);
  }

  // Compress image (basic implementation)
  async compressImage(filePath) {
    // This is a placeholder for image compression
    // In a real implementation, you might use sharp or jimp
    return filePath;
  }
}

module.exports = new FileUploadService(); 