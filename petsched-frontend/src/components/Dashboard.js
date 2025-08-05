import React, { useState, useEffect } from 'react';
import { petsAPI, appointmentsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPets: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    recentPets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [petsResponse, appointmentsResponse] = await Promise.all([
          petsAPI.getAll(),
          appointmentsAPI.getAll()
        ]);

        const pets = petsResponse.data.data || [];
        const appointments = appointmentsResponse.data.data || [];

        // Calculate upcoming appointments (next 7 days)
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= today && aptDate <= nextWeek && apt.status !== 'cancelled';
        });

        setStats({
          totalPets: pets.length,
          totalAppointments: appointments.length,
          upcomingAppointments: upcomingAppointments.length,
          recentPets: pets.slice(0, 5) // Show last 5 pets
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Pets</h3>
          <p className="stat-number">{stats.totalPets}</p>
        </div>
        <div className="stat-card">
          <h3>Total Appointments</h3>
          <p className="stat-number">{stats.totalAppointments}</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Appointments</h3>
          <p className="stat-number">{stats.upcomingAppointments}</p>
        </div>
      </div>

      <div className="recent-pets">
        <h2>Recent Pets</h2>
        {stats.recentPets.length > 0 ? (
          <div className="pets-grid">
            {stats.recentPets.map(pet => (
              <div key={pet.id} className="pet-card">
                <h4>{pet.name}</h4>
                <p><strong>Species:</strong> {pet.species}</p>
                <p><strong>Breed:</strong> {pet.breed || 'N/A'}</p>
                <p><strong>Age:</strong> {pet.age || 'N/A'} years</p>
                <p><strong>Owner:</strong> {pet.owner_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No pets found. Add some pets to get started!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 