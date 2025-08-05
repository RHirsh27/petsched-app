import React, { useState, useEffect } from 'react';
import { petsAPI } from '../services/api';
import './Pets.css';

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    owner_name: '',
    owner_phone: ''
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await petsAPI.getAll();
      setPets(response.data.data || []);
    } catch (err) {
      setError('Failed to load pets');
      console.error('Fetch pets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPet) {
        await petsAPI.update(editingPet.id, formData);
      } else {
        await petsAPI.create(formData);
      }
      setShowForm(false);
      setEditingPet(null);
      resetForm();
      fetchPets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save pet');
      console.error('Save pet error:', err);
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age || '',
      owner_name: pet.owner_name,
      owner_phone: pet.owner_phone || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (petId) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await petsAPI.delete(petId);
        fetchPets();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete pet');
        console.error('Delete pet error:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      species: '',
      breed: '',
      age: '',
      owner_name: '',
      owner_phone: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="pets-container"><div className="loading">Loading pets...</div></div>;
  }

  return (
    <div className="pets-container">
      <div className="pets-header">
        <h1>Pets Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingPet(null);
            resetForm();
          }}
        >
          Add New Pet
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h2>{editingPet ? 'Edit Pet' : 'Add New Pet'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Species *</label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Species</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Fish">Fish</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Breed</label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Owner Name *</label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Owner Phone</label>
                <input
                  type="tel"
                  name="owner_phone"
                  value={formData.owner_phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingPet ? 'Update Pet' : 'Add Pet'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPet(null);
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

      <div className="pets-grid">
        {pets.length > 0 ? (
          pets.map(pet => (
            <div key={pet.id} className="pet-card">
              <div className="pet-header">
                <h3>{pet.name}</h3>
                <div className="pet-actions">
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => handleEdit(pet)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(pet.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="pet-info">
                <p><strong>Species:</strong> {pet.species}</p>
                <p><strong>Breed:</strong> {pet.breed || 'N/A'}</p>
                <p><strong>Age:</strong> {pet.age || 'N/A'} years</p>
                <p><strong>Owner:</strong> {pet.owner_name}</p>
                {pet.owner_phone && (
                  <p><strong>Phone:</strong> {pet.owner_phone}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No pets found. Add your first pet to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pets; 