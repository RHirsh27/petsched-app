const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const router = express.Router();

// GET /api/pets - Get all pets
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM pets 
      ORDER BY created_at DESC
    `;
    
    const rows = await db.query(query);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pets',
      message: error.message 
    });
  }
});

// GET /api/pets/:id - Get a specific pet
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM pets WHERE id = ?';
    const rows = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Pet not found',
        message: `No pet found with id: ${id}` 
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pet',
      message: error.message 
    });
  }
});

// POST /api/pets - Create a new pet
router.post('/', async (req, res) => {
  try {
    const { name, species, breed, age, owner_name, owner_phone } = req.body;
    
    // Validation
    if (!name || !species || !owner_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, species, and owner_name are required'
      });
    }
    
    const id = uuidv4();
    const query = `
      INSERT INTO pets (id, name, species, breed, age, owner_name, owner_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.run(query, [id, name, species, breed, age, owner_name, owner_phone]);
    
    // Fetch the created pet
    const rows = await db.query('SELECT * FROM pets WHERE id = ?', [id]);
    
    res.status(201).json({
      success: true,
      message: 'Pet created successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ 
      error: 'Failed to create pet',
      message: error.message 
    });
  }
});

// PUT /api/pets/:id - Update a pet
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, species, breed, age, owner_name, owner_phone } = req.body;
    
    // Check if pet exists
    const existingRows = await db.query('SELECT * FROM pets WHERE id = ?', [id]);
    
    if (existingRows.length === 0) {
      return res.status(404).json({ 
        error: 'Pet not found',
        message: `No pet found with id: ${id}` 
      });
    }
    
    // Update pet
    const query = `
      UPDATE pets 
      SET name = ?, species = ?, breed = ?, age = ?, owner_name = ?, owner_phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.run(query, [name, species, breed, age, owner_name, owner_phone, id]);
    
    // Fetch the updated pet
    const rows = await db.query('SELECT * FROM pets WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ 
      error: 'Failed to update pet',
      message: error.message 
    });
  }
});

// DELETE /api/pets/:id - Delete a pet
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if pet exists
    const existingRows = await db.query('SELECT * FROM pets WHERE id = ?', [id]);
    
    if (existingRows.length === 0) {
      return res.status(404).json({ 
        error: 'Pet not found',
        message: `No pet found with id: ${id}` 
      });
    }
    
    // Check if pet has appointments
    const appointmentRows = await db.query('SELECT COUNT(*) as count FROM appointments WHERE pet_id = ?', [id]);
    
    if (appointmentRows[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete pet',
        message: 'Pet has existing appointments. Please delete appointments first.'
      });
    }
    
    // Delete pet
    await db.run('DELETE FROM pets WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Pet deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ 
      error: 'Failed to delete pet',
      message: error.message 
    });
  }
});

module.exports = router;