const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Sample pets data
const samplePets = [
  {
    id: uuidv4(),
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    owner_name: 'Sarah Johnson',
    owner_phone: '555-0101'
  },
  {
    id: uuidv4(),
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Persian',
    age: 5,
    owner_name: 'Mike Chen',
    owner_phone: '555-0102'
  },
  {
    id: uuidv4(),
    name: 'Rex',
    species: 'Dog',
    breed: 'German Shepherd',
    age: 2,
    owner_name: 'Emily Davis',
    owner_phone: '555-0103'
  },
  {
    id: uuidv4(),
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    age: 1,
    owner_name: 'David Wilson',
    owner_phone: '555-0104'
  },
  {
    id: uuidv4(),
    name: 'Max',
    species: 'Dog',
    breed: 'Labrador Retriever',
    age: 4,
    owner_name: 'Lisa Brown',
    owner_phone: '555-0105'
  },
  {
    id: uuidv4(),
    name: 'Bella',
    species: 'Cat',
    breed: 'Maine Coon',
    age: 6,
    owner_name: 'James Miller',
    owner_phone: '555-0106'
  },
  {
    id: uuidv4(),
    name: 'Rocky',
    species: 'Dog',
    breed: 'Bulldog',
    age: 2,
    owner_name: 'Amanda Taylor',
    owner_phone: '555-0107'
  },
  {
    id: uuidv4(),
    name: 'Shadow',
    species: 'Cat',
    breed: 'Russian Blue',
    age: 3,
    owner_name: 'Robert Anderson',
    owner_phone: '555-0108'
  }
];

// Sample appointments data
const sampleAppointments = [
  {
    id: uuidv4(),
    pet_id: samplePets[0].id, // Buddy
    service_type: 'Grooming',
    appointment_date: '2024-01-15',
    appointment_time: '10:00',
    duration_minutes: 90,
    notes: 'Full grooming session - needs special shampoo for sensitive skin',
    status: 'scheduled'
  },
  {
    id: uuidv4(),
    pet_id: samplePets[1].id, // Whiskers
    service_type: 'Vaccination',
    appointment_date: '2024-01-16',
    appointment_time: '14:30',
    duration_minutes: 30,
    notes: 'Annual vaccination - FVRCP and rabies',
    status: 'scheduled'
  },
  {
    id: uuidv4(),
    pet_id: samplePets[2].id, // Rex
    service_type: 'Training',
    appointment_date: '2024-01-17',
    appointment_time: '09:00',
    duration_minutes: 60,
    notes: 'Basic obedience training session',
    status: 'scheduled'
  },
  {
    id: uuidv4(),
    pet_id: samplePets[3].id, // Luna
    service_type: 'Check-up',
    appointment_date: '2024-01-18',
    appointment_time: '11:00',
    duration_minutes: 45,
    notes: 'Regular health check-up',
    status: 'scheduled'
  },
  {
    id: uuidv4(),
    pet_id: samplePets[4].id, // Max
    service_type: 'Dental Cleaning',
    appointment_date: '2024-01-19',
    appointment_time: '13:00',
    duration_minutes: 120,
    notes: 'Professional dental cleaning and examination',
    status: 'scheduled'
  },
  {
    id: uuidv4(),
    pet_id: samplePets[5].id, // Bella
    service_type: 'Grooming',
    appointment_date: '2024-01-20',
    appointment_time: '15:30',
    duration_minutes: 75,
    notes: 'Bath and brush - long hair maintenance',
    status: 'scheduled'
  },
  {
    id: uuidv4(),
    pet_id: samplePets[6].id, // Rocky
    service_type: 'Vaccination',
    appointment_date: '2024-01-21',
    appointment_time: '10:30',
    duration_minutes: 30,
    notes: 'DHPP and rabies vaccination',
    status: 'scheduled'
  },
  {
    id: uuidv4(),
    pet_id: samplePets[7].id, // Shadow
    service_type: 'Check-up',
    appointment_date: '2024-01-22',
    appointment_time: '16:00',
    duration_minutes: 45,
    notes: 'Annual wellness exam',
    status: 'scheduled'
  },
  {
    id: uuidv4(),
    pet_id: samplePets[0].id, // Buddy - second appointment
    service_type: 'Training',
    appointment_date: '2024-01-23',
    appointment_time: '14:00',
    duration_minutes: 60,
    notes: 'Advanced training - working on recall commands',
    status: 'scheduled'
  },
  {
    id: uuidv4(),
    pet_id: samplePets[1].id, // Whiskers - second appointment
    service_type: 'Grooming',
    appointment_date: '2024-01-24',
    appointment_time: '11:30',
    duration_minutes: 60,
    notes: 'Bath and nail trim',
    status: 'scheduled'
  }
];

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create pets table
      db.run(`
        CREATE TABLE IF NOT EXISTS pets (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          species TEXT NOT NULL,
          breed TEXT,
          age INTEGER,
          owner_name TEXT NOT NULL,
          owner_phone TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create appointments table
      db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          pet_id TEXT NOT NULL,
          service_type TEXT NOT NULL,
          appointment_date TEXT NOT NULL,
          appointment_time TEXT NOT NULL,
          duration_minutes INTEGER DEFAULT 60,
          notes TEXT,
          status TEXT DEFAULT 'scheduled',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (pet_id) REFERENCES pets (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
        } else {
          console.log('Database tables initialized successfully');
          resolve();
        }
      });
    });
  });
};

// Function to seed the database
const seedDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🌱 Starting database seeding...');
      
      // Clear existing data
      db.run('DELETE FROM appointments', (err) => {
        if (err) {
          console.error('Error clearing appointments:', err);
          reject(err);
          return;
        }
      });
      
      db.run('DELETE FROM pets', (err) => {
        if (err) {
          console.error('Error clearing pets:', err);
          reject(err);
          return;
        }
      });
      
      // Insert sample pets
      const petStmt = db.prepare(`
        INSERT INTO pets (id, name, species, breed, age, owner_name, owner_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      samplePets.forEach((pet, index) => {
        petStmt.run([
          pet.id,
          pet.name,
          pet.species,
          pet.breed,
          pet.age,
          pet.owner_name,
          pet.owner_phone
        ], (err) => {
          if (err) {
            console.error(`Error inserting pet ${pet.name}:`, err);
          } else {
            console.log(`✅ Added pet: ${pet.name} (${pet.species})`);
          }
        });
      });
      
      petStmt.finalize((err) => {
        if (err) {
          console.error('Error finalizing pets insert:', err);
          reject(err);
          return;
        }
        
        // Insert sample appointments
        const appointmentStmt = db.prepare(`
          INSERT INTO appointments (id, pet_id, service_type, appointment_date, appointment_time, duration_minutes, notes, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        sampleAppointments.forEach((appointment, index) => {
          appointmentStmt.run([
            appointment.id,
            appointment.pet_id,
            appointment.service_type,
            appointment.appointment_date,
            appointment.appointment_time,
            appointment.duration_minutes,
            appointment.notes,
            appointment.status
          ], (err) => {
            if (err) {
              console.error(`Error inserting appointment ${index + 1}:`, err);
            } else {
              const pet = samplePets.find(p => p.id === appointment.pet_id);
              console.log(`✅ Added appointment: ${appointment.service_type} for ${pet.name} on ${appointment.appointment_date}`);
            }
          });
        });
        
        appointmentStmt.finalize((err) => {
          if (err) {
            console.error('Error finalizing appointments insert:', err);
            reject(err);
            return;
          }
          
          console.log('\n🎉 Database seeding completed successfully!');
          console.log(`📊 Added ${samplePets.length} pets and ${sampleAppointments.length} appointments`);
          console.log('\n📋 Sample data includes:');
          console.log('   • Various pet species (Dogs, Cats)');
          console.log('   • Different service types (Grooming, Vaccination, Training, Check-up, Dental)');
          console.log('   • Multiple appointments per pet');
          console.log('   • Realistic scheduling with different durations');
          
          resolve();
        });
      });
    });
  });
};

// Run the seeding
const runSeeding = async () => {
  try {
    await initDatabase();
    await seedDatabase();
    console.log('\n🚀 Ready to start the server!');
    console.log('   Run: npm start');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeeding(); 