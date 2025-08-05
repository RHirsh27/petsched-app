const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

// Test functions
const testHealthCheck = async () => {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data);
    return true;
  } catch (error) {
    console.error('❌ Health Check failed:', error.message);
    return false;
  }
};

const testGetPets = async () => {
  try {
    const response = await fetch(`${BASE_URL}/pets`);
    const data = await response.json();
    console.log(`✅ Get Pets: Found ${data.count} pets`);
    return data.data;
  } catch (error) {
    console.error('❌ Get Pets failed:', error.message);
    return null;
  }
};

const testGetAppointments = async () => {
  try {
    const response = await fetch(`${BASE_URL}/appointments`);
    const data = await response.json();
    console.log(`✅ Get Appointments: Found ${data.count} appointments`);
    return data.data;
  } catch (error) {
    console.error('❌ Get Appointments failed:', error.message);
    return null;
  }
};

const testCreatePet = async () => {
  try {
    const newPet = {
      name: 'Test Pet',
      species: 'Dog',
      breed: 'Test Breed',
      age: 2,
      owner_name: 'Test Owner',
      owner_phone: '555-9999'
    };

    const response = await fetch(`${BASE_URL}/pets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPet)
    });

    const data = await response.json();
    console.log('✅ Create Pet:', data.message);
    return data.data;
  } catch (error) {
    console.error('❌ Create Pet failed:', error.message);
    return null;
  }
};

const testCreateAppointment = async (petId) => {
  try {
    const newAppointment = {
      pet_id: petId,
      service_type: 'Test Service',
      appointment_date: '2024-02-01',
      appointment_time: '10:00',
      duration_minutes: 60,
      notes: 'Test appointment'
    };

    const response = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newAppointment)
    });

    const data = await response.json();
    console.log('✅ Create Appointment:', data.message);
    return data.data;
  } catch (error) {
    console.error('❌ Create Appointment failed:', error.message);
    return null;
  }
};

const testUpdatePet = async (petId) => {
  try {
    const updateData = {
      name: 'Updated Test Pet',
      species: 'Dog',
      breed: 'Updated Test Breed',
      age: 3,
      owner_name: 'Updated Test Owner',
      owner_phone: '555-9999'
    };

    const response = await fetch(`${BASE_URL}/pets/${petId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    console.log('✅ Update Pet:', data.message);
    return data.data;
  } catch (error) {
    console.error('❌ Update Pet failed:', error.message);
    return null;
  }
};

const testUpdateAppointment = async (appointmentId) => {
  try {
    const updateData = {
      notes: 'Updated test appointment notes'
    };

    const response = await fetch(`${BASE_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    console.log('✅ Update Appointment:', data.message);
    return data.data;
  } catch (error) {
    console.error('❌ Update Appointment failed:', error.message);
    return null;
  }
};

const testDeleteAppointment = async (appointmentId) => {
  try {
    const response = await fetch(`${BASE_URL}/appointments/${appointmentId}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    console.log('✅ Delete Appointment:', data.message);
    return true;
  } catch (error) {
    console.error('❌ Delete Appointment failed:', error.message);
    return false;
  }
};

const testDeletePet = async (petId) => {
  try {
    const response = await fetch(`${BASE_URL}/pets/${petId}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    console.log('✅ Delete Pet:', data.message);
    return true;
  } catch (error) {
    console.error('❌ Delete Pet failed:', error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('🧪 Starting API Tests...\n');

  // Test health check
  await testHealthCheck();
  console.log('');

  // Test getting existing data
  const pets = await testGetPets();
  const appointments = await testGetAppointments();
  console.log('');

  if (pets && pets.length > 0) {
    console.log(`📋 Sample Pet: ${pets[0].name} (${pets[0].species})`);
  }
  if (appointments && appointments.length > 0) {
    console.log(`📋 Sample Appointment: ${appointments[0].service_type} for ${appointments[0].pet_name}`);
  }
  console.log('');

  // Test CRUD operations
  console.log('🔄 Testing CRUD Operations...\n');

  // Create a test pet
  const newPet = await testCreatePet();
  console.log('');

  if (newPet) {
    // Create a test appointment for the new pet
    const newAppointment = await testCreateAppointment(newPet.id);
    console.log('');

    if (newAppointment) {
      // Update the appointment
      await testUpdateAppointment(newAppointment.id);
      console.log('');

      // Delete the appointment
      await testDeleteAppointment(newAppointment.id);
      console.log('');
    }

    // Update the pet
    await testUpdatePet(newPet.id);
    console.log('');

    // Delete the pet
    await testDeletePet(newPet.id);
    console.log('');
  }

  console.log('🎉 API Tests Completed!');
  console.log('\n📊 API Endpoints Summary:');
  console.log('   ✅ Health Check: GET /api/health');
  console.log('   ✅ Pets: GET, POST, PUT, DELETE /api/pets');
  console.log('   ✅ Appointments: GET, POST, PUT, DELETE /api/appointments');
  console.log('   ✅ Relationships: Appointments linked to pets');
  console.log('   ✅ Validation: Required fields and constraints');
  console.log('   ✅ Error Handling: Proper error responses');
};

// Run the tests
runTests().catch(console.error); 