const express = require('express');
const path = require('path');
const fs = require('fs');
const fileUploadService = require('../services/fileUploadService');

const router = express.Router();

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'File not found',
      message: `File ${filename} does not exist`
    });
  }
});

// Upload pet photo
router.post('/upload/pet-photo', fileUploadService.uploadPetPhoto(), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    const fileInfo = fileUploadService.getFileInfo(req.file.filename);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUploadService.getFileUrl(req.file.filename),
        ...fileInfo
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      error: 'File upload failed',
      message: error.message
    });
  }
});

// Upload multiple pet photos
router.post('/upload/pet-photos', fileUploadService.uploadPetPhotos(), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select files to upload'
      });
    }

    const uploadedFiles = req.files.map(file => {
      const fileInfo = fileUploadService.getFileInfo(file.filename);
      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: fileUploadService.getFileUrl(file.filename),
        ...fileInfo
      };
    });

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({
      error: 'File upload failed',
      message: error.message
    });
  }
});

// Delete uploaded file
router.delete('/upload/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    if (fileUploadService.deleteFile(filename)) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        error: 'File not found',
        message: `File ${filename} does not exist`
      });
    }
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      error: 'File deletion failed',
      message: error.message
    });
  }
});

// Get file info
router.get('/upload/:filename/info', (req, res) => {
  try {
    const { filename } = req.params;
    const fileInfo = fileUploadService.getFileInfo(filename);
    
    if (fileInfo) {
      res.json({
        success: true,
        data: fileInfo
      });
    } else {
      res.status(404).json({
        error: 'File not found',
        message: `File ${filename} does not exist`
      });
    }
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({
      error: 'Failed to get file info',
      message: error.message
    });
  }
});

module.exports = router; 