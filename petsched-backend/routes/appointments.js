const express = require('express');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// GET /api/appointments - Get all appointments
router.get('/', (req, res) => {
  const query = `
    SELECT 
      a.*,
      p.name as pet_name,
      p.species as pet_species,
      p.breed as pet_breed,
      p.owner_name
    FROM appointments a
    LEFT JOIN pets p ON a.pet_id = p.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch appointments',
        message: err.message 
      });
    }
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  });
});

// GET /api/appointments/:id - Get a specific appointment
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      a.*,
      p.name as pet_name,
      p.species as pet_species,
      p.breed as pet_breed,
      p.owner_name
    FROM appointments a
    LEFT JOIN pets p ON a.pet_id = p.id
    WHERE a.id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching appointment:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch appointment',
        message: err.message 
      });
    }
    
    if (!row) {
      return res.status(404).json({ 
        error: 'Appointment not found',
        message: `No appointment found with id: ${id}` 
      });
    }
    
    res.json({
      success: true,
      data: row
    });
  });
});

// GET /api/appointments/pet/:petId - Get appointments for a specific pet
router.get('/pet/:petId', (req, res) => {
  const { petId } = req.params;
  
  const query = `
    SELECT 
      a.*,
      p.name as pet_name,
      p.species as pet_species,
      p.breed as pet_breed,
      p.owner_name
    FROM appointments a
    LEFT JOIN pets p ON a.pet_id = p.id
    WHERE a.pet_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;
  
  db.all(query, [petId], (err, rows) => {
    if (err) {
      console.error('Error fetching pet appointments:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch pet appointments',
        message: err.message 
      });
    }
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  });
});

// POST /api/appointments - Create a new appointment
router.post('/', (req, res) => {
  const { 
    pet_id, 
    service_type, 
    appointment_date, 
    appointment_time, 
    duration_minutes = 60,
    notes,
    status = 'scheduled'
  } = req.body;
  
  // Validation
  if (!pet_id || !service_type || !appointment_date || !appointment_time) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'pet_id, service_type, appointment_date, and appointment_time are required'
    });
  }
  
  // Check if pet exists
  db.get('SELECT * FROM pets WHERE id = ?', [pet_id], (err, pet) => {
    if (err) {
      console.error('Error checking pet existence:', err);
      return res.status(500).json({ 
        error: 'Failed to check pet',
        message: err.message 
      });
    }
    
    if (!pet) {
      return res.status(404).json({
        error: 'Pet not found',
        message: `No pet found with id: ${pet_id}`
      });
    }
    
    // Check for scheduling conflicts
    const conflictQuery = `
      SELECT * FROM appointments 
      WHERE pet_id = ? 
      AND appointment_date = ? 
      AND appointment_time = ?
      AND status != 'cancelled'
    `;
    
    db.get(conflictQuery, [pet_id, appointment_date, appointment_time], (err, conflict) => {
      if (err) {
        console.error('Error checking conflicts:', err);
        return res.status(500).json({ 
          error: 'Failed to check scheduling conflicts',
          message: err.message 
        });
      }
      
      if (conflict) {
        return res.status(409).json({
          error: 'Scheduling conflict',
          message: 'An appointment already exists for this pet at this time'
        });
      }
      
      // Create appointment
      const id = uuidv4();
      const query = `
        INSERT INTO appointments (id, pet_id, service_type, appointment_date, appointment_time, duration_minutes, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [id, pet_id, service_type, appointment_date, appointment_time, duration_minutes, notes, status], function(err) {
        if (err) {
          console.error('Error creating appointment:', err);
          return res.status(500).json({ 
            error: 'Failed to create appointment',
            message: err.message 
          });
        }
        
        // Fetch the created appointment with pet details
        const fetchQuery = `
          SELECT 
            a.*,
            p.name as pet_name,
            p.species as pet_species,
            p.breed as pet_breed,
            p.owner_name
          FROM appointments a
          LEFT JOIN pets p ON a.pet_id = p.id
          WHERE a.id = ?
        `;
        
        db.get(fetchQuery, [id], (err, row) => {
          if (err) {
            console.error('Error fetching created appointment:', err);
            return res.status(500).json({ 
              error: 'Appointment created but failed to retrieve',
              message: err.message 
            });
          }
          
          res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: row
          });
        });
      });
    });
  });
});

// PUT /api/appointments/:id - Update an appointment
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { 
    pet_id, 
    service_type, 
    appointment_date, 
    appointment_time, 
    duration_minutes,
    notes,
    status
  } = req.body;
  
  // Check if appointment exists
  db.get('SELECT * FROM appointments WHERE id = ?', [id], (err, appointment) => {
    if (err) {
      console.error('Error checking appointment existence:', err);
      return res.status(500).json({ 
        error: 'Failed to check appointment',
        message: err.message 
      });
    }
    
    if (!appointment) {
      return res.status(404).json({ 
        error: 'Appointment not found',
        message: `No appointment found with id: ${id}` 
      });
    }
    
    // Check if pet exists (if pet_id is being updated)
    if (pet_id && pet_id !== appointment.pet_id) {
      db.get('SELECT * FROM pets WHERE id = ?', [pet_id], (err, pet) => {
        if (err) {
          console.error('Error checking pet existence:', err);
          return res.status(500).json({ 
            error: 'Failed to check pet',
            message: err.message 
          });
        }
        
        if (!pet) {
          return res.status(404).json({
            error: 'Pet not found',
            message: `No pet found with id: ${pet_id}`
          });
        }
        
        updateAppointment();
      });
    } else {
      updateAppointment();
    }
    
    function updateAppointment() {
      // Check for scheduling conflicts (if time/date is being changed)
      if (appointment_date && appointment_time && 
          (appointment_date !== appointment.appointment_date || appointment_time !== appointment.appointment_time)) {
        
        const conflictQuery = `
          SELECT * FROM appointments 
          WHERE pet_id = ? 
          AND appointment_date = ? 
          AND appointment_time = ?
          AND id != ?
          AND status != 'cancelled'
        `;
        
        db.get(conflictQuery, [pet_id || appointment.pet_id, appointment_date, appointment_time, id], (err, conflict) => {
          if (err) {
            console.error('Error checking conflicts:', err);
            return res.status(500).json({ 
              error: 'Failed to check scheduling conflicts',
              message: err.message 
            });
          }
          
          if (conflict) {
            return res.status(409).json({
              error: 'Scheduling conflict',
              message: 'An appointment already exists for this pet at this time'
            });
          }
          
          performUpdate();
        });
      } else {
        performUpdate();
      }
    }
    
    function performUpdate() {
      const query = `
        UPDATE appointments 
        SET pet_id = ?, service_type = ?, appointment_date = ?, appointment_time = ?, 
            duration_minutes = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [
        pet_id || appointment.pet_id,
        service_type || appointment.service_type,
        appointment_date || appointment.appointment_date,
        appointment_time || appointment.appointment_time,
        duration_minutes || appointment.duration_minutes,
        notes !== undefined ? notes : appointment.notes,
        status || appointment.status,
        id
      ], function(err) {
        if (err) {
          console.error('Error updating appointment:', err);
          return res.status(500).json({ 
            error: 'Failed to update appointment',
            message: err.message 
          });
        }
        
        // Fetch the updated appointment with pet details
        const fetchQuery = `
          SELECT 
            a.*,
            p.name as pet_name,
            p.species as pet_species,
            p.breed as pet_breed,
            p.owner_name
          FROM appointments a
          LEFT JOIN pets p ON a.pet_id = p.id
          WHERE a.id = ?
        `;
        
        db.get(fetchQuery, [id], (err, row) => {
          if (err) {
            console.error('Error fetching updated appointment:', err);
            return res.status(500).json({ 
              error: 'Appointment updated but failed to retrieve',
              message: err.message 
            });
          }
          
          res.json({
            success: true,
            message: 'Appointment updated successfully',
            data: row
          });
        });
      });
    }
  });
});

// DELETE /api/appointments/:id - Delete an appointment
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // Check if appointment exists
  db.get('SELECT * FROM appointments WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error checking appointment existence:', err);
      return res.status(500).json({ 
        error: 'Failed to check appointment',
        message: err.message 
      });
    }
    
    if (!row) {
      return res.status(404).json({ 
        error: 'Appointment not found',
        message: `No appointment found with id: ${id}` 
      });
    }
    
    // Delete appointment
    db.run('DELETE FROM appointments WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting appointment:', err);
        return res.status(500).json({ 
          error: 'Failed to delete appointment',
          message: err.message 
        });
      }
      
      res.json({
        success: true,
        message: 'Appointment deleted successfully',
        data: { id }
      });
    });
  });
});

module.exports = router; 