## 🚕Vehicle Rental Management System(Backend)

A complete backend API for managing vehicles, bookings, users, and role-based access control. Built with <b>Nodejs, Express, TypeScript, PostgreSQL and JWT Authentication.</b>

<hr>

## 🌐 Live Deployment

🔗 API Base URL: https://vehicle-rental-backend-app.vercel.app

<hr>

## 🎯 Features

### 👤 User Management

- User registration & login.
- JWT based authentication
- Role-based access(<code>admin</code>, <code>customer</code>)
- Admin can manage users, vehicles and all booking.
- Customer can register, update own profile details, view vehicles, create/manage own bookings.
- User can delete when no active booking exist

### 🚗 Vehicle Management

- Add, Update & delete vehicle (Admin only)
- Add new vehicle with name, type, registration, daily rent price and availability status
- Availability tracking: <code> available </code> / <code>booked</code>
- Customer see all and single vehicle details in the system
- Vehicle can delete when no active bookings exist

### 📆 Booking System

- Customers can book vehicles
- Customer can cancel before start date
- Admin can mark booking as returned
- Updates vehicle status automatically
- System: Auto-mark as "returned" when period ends

## 🔐 Security

- Encrypted passwords
- Protected routes using JWT
- Role based middleware for authentication

<hr>

## ⚒ Technology Stack

| Layer            | Technology        |
| ---------------- | ----------------- |
| Language         | TypeScript        |
| Runtime          | Node.js           |
| Web Framework    | Express           |
| Database         | PostgreSQL        |
| Authentication   | jsonwebtoken      |
| Password Hashing | bcryptjs          |
| ORM / Querying   | pg(node-postgres) |
| Deployment       | Vercel            |

<hr>

## ⚙ Setup & Usage Instructions

### 1️⃣ Clone the Repository

```bash
   git clone https://github.com/shahidul50/next-Level-2-assaignment-two your-repo-name
   cd your-repo-name
```

### 2️⃣ Install Dependencies

```bash
   npm install
```

### 3️⃣ Environment Variables

```bash
   PORT = 5000
   DB_CON_STRING=postgresql://postgres:Admin12345@localhost:5432/vehicle-rental-db
   JWT_SECRET=$2b$10$VMa3tY5zA62a5dR7fXJQEOUdOcubzbfmaFS
```

### 4️⃣ Run the Server

```bash
   npm run dev
```

### 5️⃣ Run the Server

```bash
   http://localhost:5000/api/v1
```

<hr>

## 🚀 API Endpoints

### 🔐 Authentication Endpoints

### 1️⃣ User Registration

Access: Public <br>
Description: Register a new user account

Endpoint

```bash
POST /api/v1/auth/signup
```

Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "phone": "01712345678",
  "role": "customer"
}
```

Success Response (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "01712345678",
    "role": "customer"
  }
}
```

<hr>

### 2️⃣ User Login

Access: Public <br>
Description: Login and receive JWT authentication token

Endpoint

```bash
POST /api/v1/auth/signin
```

Request Body

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "role": "customer"
    }
  }
}
```

<hr>

### 🚗 Vehicle Endpoints

### 3️⃣ Create Vehicle

Access: Admin only <br>
Description: Add a new vehicle to the system

Endpoint

```bash
POST /api/v1/vehicles
```

Request Headers

```bash
 Authorization: Bearer <jwt_token>
```

Request Body

```json
{
  "vehicle_name": "Toyota Camry 2024",
  "type": "car",
  "registration_number": "ABC-1234",
  "daily_rent_price": 50,
  "availability_status": "available"
}
```

Success Response (201 Created)

```json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {
    "id": 1,
    "vehicle_name": "Toyota Camry 2024",
    "type": "car",
    "registration_number": "ABC-1234",
    "daily_rent_price": 50,
    "availability_status": "available"
  }
}
```

<hr>

### 4️⃣ Get All Vehicles

Access: Public <br>
Description: Retrieve all vehicles in the system

Endpoint

```bash
GET /api/v1/vehicles
```

Success Response (200 OK)

```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": [
    {
      "id": 1,
      "vehicle_name": "Toyota Camry 2024",
      "type": "car",
      "registration_number": "ABC-1234",
      "daily_rent_price": 50,
      "availability_status": "available"
    },
    {
      "id": 2,
      "vehicle_name": "Honda Civic 2023",
      "type": "car",
      "registration_number": "XYZ-5678",
      "daily_rent_price": 45,
      "availability_status": "available"
    }
  ]
}
```

Success Response - Empty List (200 OK)

```json
{
  "success": true,
  "message": "No vehicles found",
  "data": []
}
```

<hr>

### 5️⃣ Get Vehicle by ID

Access: Public <br>
Description: Retrieve specific vehicle details

Endpoint

```bash
GET /api/v1/vehicles/:vehicleId
```

Example:

```bash
GET /api/v1/vehicles/2
```

Success Response (200 OK)

```json
{
  "success": true,
  "message": "Vehicle retrieved successfully",
  "data": {
    "id": 2,
    "vehicle_name": "Honda Civic 2023",
    "type": "car",
    "registration_number": "XYZ-5678",
    "daily_rent_price": 45,
    "availability_status": "available"
  }
}
```

<hr>

### 6️⃣ Update Vehicle

Access: Admin only <br>
Description: Update vehicle details, price, or availability status

Endpoint

```bash
PUT /api/v1/vehicles/:vehicleId
```

Example:

```bash
PUT /api/v1/vehicles/1
```

Request Headers

```bash
Authorization: Bearer <jwt_token>
```

Request Body (All fields optional)

```json
{
  "vehicle_name": "Toyota Camry 2024 Premium",
  "type": "car",
  "registration_number": "ABC-1234",
  "daily_rent_price": 55,
  "availability_status": "available"
}
```

Success Response (200 OK)

```json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {
    "id": 1,
    "vehicle_name": "Toyota Camry 2024 Premium",
    "type": "car",
    "registration_number": "ABC-1234",
    "daily_rent_price": 55,
    "availability_status": "available"
  }
}
```

<hr>

### 7️⃣ Delete Vehicle

Access: Admin only <br>
Description: Delete a vehicle (only if no active bookings exist)

Endpoint

```bash
DELETE /api/v1/vehicles/:vehicleId
```

Example:

```bash
DELETE /api/v1/vehicles/1
```

Request Headers

```bash
Authorization: Bearer <jwt_token>
```

Success Response (200 OK)

```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

<hr>

### 👥 User Endpoints

### 8️⃣ Get All Users

Access: Admin only <br>
Description: Retrieve all users in the system

Endpoint

```bash
GET /api/v1/users
```

Request Headers

```bash
Authorization: Bearer <jwt_token>
```

Success Response (200 OK)

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "role": "customer"
    },
    {
      "id": 2,
      "name": "Admin User",
      "email": "admin@example.com",
      "phone": "+0987654321",
      "role": "admin"
    }
  ]
}
```

<hr>

### 9️⃣ Update User

Access: Admin or Own Profile<br>
Description: Admin can update any user's role or details. Customer can update own profile only

Endpoint

```bash
PUT /api/v1/users/:userId
```

Example:

```bash
PUT /api/v1/users/1
```

Request Headers

```bash
Authorization: Bearer <jwt_token>
```

Request Body (All fields optional)

```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "phone": "+1234567899",
  "role": "admin"
}
```

Success Response (200 OK)

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+1234567899",
    "role": "customer"
  }
}
```

<hr>

### 🔟 Delete User

Access: Admin only <br>
Description: Delete a user (only if no active bookings exist)

Endpoint

```bash
DELETE /api/v1/users/:userId
```

Example:

```bash
DELETE /api/v1/users/1
```

Request Headers

```bash
Authorization: Bearer <jwt_token>
```

Success Response (200 OK)

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

<hr>

### 📅 Booking Endpoints

<hr>

### 1️⃣1️⃣ Create Booking

Access: Customer or Admin <br>
Description: Create a new booking with automatic price calculation and vehicle status update

Endpoint

```bash
POST /api/v1/bookings
```

Request Headers

```bash
Authorization: Bearer <jwt_token>
```

Request Body

```json
{
  "customer_id": 1,
  "vehicle_id": 2,
  "rent_start_date": "2024-01-15",
  "rent_end_date": "2024-01-20"
}
```

Success Response (201 Created)

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "customer_id": 1,
    "vehicle_id": 2,
    "rent_start_date": "2024-01-15",
    "rent_end_date": "2024-01-20",
    "total_price": 250,
    "status": "active",
    "vehicle": {
      "vehicle_name": "Honda Civic 2023",
      "daily_rent_price": 45
    }
  }
}
```

<hr>

### 1️⃣2️⃣ Get All Bookings

Access: Role-based (Admin sees all, Customer sees own) <br>
Description: Retrieve bookings based on user role

Endpoint

```bash
GET /api/v1/bookings
```

Request Headers

```bash
Authorization: Bearer <jwt_token>
```

Success Response (200 OK) - Admin View

```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": 1,
      "customer_id": 1,
      "vehicle_id": 2,
      "rent_start_date": "2024-01-15",
      "rent_end_date": "2024-01-20",
      "total_price": 250,
      "status": "active",
      "customer": {
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "vehicle": {
        "vehicle_name": "Honda Civic 2023",
        "registration_number": "XYZ-5678"
      }
    }
  ]
}
```

Success Response (200 OK) - Customer View

```json
{
  "success": true,
  "message": "Your bookings retrieved successfully",
  "data": [
    {
      "id": 1,
      "vehicle_id": 2,
      "rent_start_date": "2024-01-15",
      "rent_end_date": "2024-01-20",
      "total_price": 250,
      "status": "active",
      "vehicle": {
        "vehicle_name": "Honda Civic 2023",
        "registration_number": "XYZ-5678",
        "type": "car"
      }
    }
  ]
}
```

<hr>

### 1️⃣3️⃣ Update Booking

Access: Role-based <br>
Description: Update booking status based on user role and business rules

Endpoint

```bash
PUT /api/v1/bookings/:bookingId
```

Example:

```bash
PUT /api/v1/bookings/1
```

Request Headers

```bash
Authorization: Bearer <jwt_token>
```

Request Body - Customer Cancellation

```json
{
  "status": "cancelled"
}
```

Request Body - Admin Mark as Returned

```json
{
  "status": "returned"
}
```

Success Response (200 OK) - Cancelled

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": 1,
    "customer_id": 1,
    "vehicle_id": 2,
    "rent_start_date": "2024-01-15",
    "rent_end_date": "2024-01-20",
    "total_price": 250,
    "status": "cancelled"
  }
}
```

Success Response (200 OK) - Returned

```json
{
  "success": true,
  "message": "Booking marked as returned. Vehicle is now available",
  "data": {
    "id": 1,
    "customer_id": 1,
    "vehicle_id": 2,
    "rent_start_date": "2024-01-15",
    "rent_end_date": "2024-01-20",
    "total_price": 250,
    "status": "returned",
    "vehicle": {
      "availability_status": "available"
    }
  }
}
```

<hr>

## 📦 Github Repository

🔗 https://github.com/shahidul50/next-Level-2-assaignment-two

## 🌐 Live Deployment

🔗 https://vehicle-rental-backend-app.vercel.app
