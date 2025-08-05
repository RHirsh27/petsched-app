import React, { useState, useEffect } from 'react';
import { appointmentsAPI, petsAPI } from '../services/api';
import './Appointments.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    pet_id: '',
    service_type: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 60,
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsResponse, petsResponse] = await Promise.all([
        appointmentsAPI.getAll(),
        petsAPI.getAll()
      ]);
      setAppointments(appointmentsResponse.data.data || []);
      setPets(petsResponse.data.data || []);
    } catch (err) {
      setError('Failed to load data');
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await appointmentsAPI.update(editingAppointment.id, formData);
      } else {
        await appointmentsAPI.create(formData);
      }
      setShowForm(false);
      setEditingAppointment(null);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appointment');
      console.error('Save appointment error:', err);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      pet_id: appointment.pet_id,
      service_type: appointment.service_type,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      duration_minutes: appointment.duration_minutes || 60,
      notes: appointment.notes || '',
      status: appointment.status
    });
    setShowForm(true);
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentsAPI.delete(appointmentId);
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete appointment');
        console.error('Delete appointment error:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      pet_id: '',
      service_type: '',
      appointment_date: '',
      appointment_time: '',
      duration_minutes: 60,
      notes: '',
      status: 'scheduled'
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getPetName = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown Pet';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-scheduled';
    }
  };

  if (loading) {
    return <div className="appointments-container"><div className="loading">Loading appointments...</div></div>;
  }

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>Appointments Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingAppointment(null);
            resetForm();
          }}
        >
          Schedule New Appointment
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h2>{editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Pet *</label>
                <select
                  name="pet_id"
                  value={formData.pet_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Pet</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Service Type *</label>
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Service</option>
                  <option value="Checkup">Checkup</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Grooming">Grooming</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  min="15"
                  max="480"
                  step="15"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAppointment(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="appointments-grid">
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <h3>{getPetName(appointment.pet_id)}</h3>
                <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="appointment-info">
                <p><strong>Service:</strong> {appointment.service_type}</p>
                <p><strong>Date:</strong> {formatDate(appointment.appointment_date)}</p>
                <p><strong>Time:</strong> {formatTime(appointment.appointment_time)}</p>
                <p><strong>Duration:</strong> {appointment.duration_minutes} minutes</p>
                {appointment.notes && (
                  <p><strong>Notes:</strong> {appointment.notes}</p>
                )}
              </div>
              <div className="appointment-actions">
                <button 
                  className="btn btn-small btn-secondary"
                  onClick={() => handleEdit(appointment)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => handleDelete(appointment.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No appointments found. Schedule your first appointment to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments; 