# 🐾 PetSched - Veterinary Appointment Management System

A production-ready SaaS platform for veterinary clinics to manage appointments, pets, and client relationships.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (Admin, Vet, Client)
- **Password hashing** with bcrypt
- **Rate limiting** to prevent abuse
- **Helmet.js** security headers
- **CORS** configuration for production

### 🗄️ Database
- **Multi-database support** (SQLite for development, PostgreSQL for production)
- **Connection pooling** for better performance
- **Database migrations** for schema versioning
- **Multi-tenant architecture** ready

### 📱 API Endpoints
- **Authentication**: Register, Login, Logout, Profile management
- **Pets**: Full CRUD operations with clinic isolation
- **Appointments**: Scheduling with conflict detection
- **Health checks** and monitoring endpoints

### 🚀 Production Ready
- **Environment configuration** with dotenv
- **Error handling** and logging
- **Graceful shutdown** handling
- **File upload** support
- **Deployment guides** for multiple platforms

## 🏗️ Architecture

```
PetSched Backend
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── pets.js              # Pet management routes
│   └── appointments.js       # Appointment routes
├── migrations/
│   ├── 001_create_users_table.js
│   └── run-migrations.js
├── server.js                # Main application
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- SQLite (development) or PostgreSQL (production)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/petsched-backend.git
   cd petsched-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/petsched
USE_SQLITE=true
SQLITE_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "client"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Pets Endpoints

#### Get All Pets
```http
GET /api/pets
Authorization: Bearer <token>
```

#### Create Pet
```http
POST /api/pets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Buddy",
  "species": "Dog",
  "breed": "Golden Retriever",
  "age": 3,
  "owner_name": "Sarah Johnson",
  "owner_phone": "555-0101"
}
```

### Appointments Endpoints

#### Get All Appointments
```http
GET /api/appointments
Authorization: Bearer <token>
```

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "pet_id": "pet-uuid",
  "service_type": "Checkup",
  "appointment_date": "2024-01-15",
  "appointment_time": "10:00",
  "duration_minutes": 60,
  "notes": "Regular checkup"
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'client',
  clinic_id TEXT,
  refresh_token TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Clinics Table
```sql
CREATE TABLE clinics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  subscription_tier TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Pets Table
```sql
CREATE TABLE pets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age INTEGER,
  owner_name TEXT NOT NULL,
  owner_phone TEXT,
  clinic_id TEXT,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL,
  service_type TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  notes TEXT,
  status TEXT DEFAULT 'scheduled',
  clinic_id TEXT,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets (id)
);
```

## 🚀 Deployment

### Heroku (Recommended for MVP)
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-petsched-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key

# Deploy
git push heroku main
```

### Docker
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### AWS/EC2
See `DEPLOYMENT.md` for detailed AWS deployment instructions.

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password hashing** with bcrypt (12 rounds)
- **Rate limiting** to prevent abuse
- **CORS protection** with configurable origins
- **Helmet.js** security headers
- **Input validation** and sanitization
- **SQL injection protection** with parameterized queries

## 📊 Monitoring

### Health Check
```bash
curl https://your-api.com/api/health
```

### Logs
```bash
# Heroku
heroku logs --tail

# PM2
pm2 logs petsched-api
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Performance

- **Connection pooling** for database connections
- **Rate limiting** to prevent abuse
- **Compression** for API responses
- **Caching** ready for Redis integration
- **Load balancing** ready for horizontal scaling

## 🔄 Development

### Scripts
```bash
npm run dev          # Start development server
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
npm test             # Run tests
npm run lint         # Run ESLint
```

### Database Migrations
```bash
# Create new migration
npm run migrate:create -- migration_name

# Run migrations
npm run migrate

# Rollback migration
npm run migrate:rollback
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: See `DEPLOYMENT.md` for deployment guides
- **Issues**: Create an issue on GitHub
- **Email**: support@petsched.com

## 🚀 Roadmap

### Phase 1 (Complete)
- ✅ Authentication system
- ✅ Database migrations
- ✅ Production deployment
- ✅ Security features

### Phase 2 (Next)
- 🔄 Email notifications
- 🔄 Payment processing (Stripe)
- 🔄 File upload (AWS S3)
- 🔄 Mobile app (React Native)

### Phase 3 (Future)
- 📅 Advanced analytics
- 📅 Multi-language support
- 📅 White-label solution
- 📅 API for third-party integrations

---
