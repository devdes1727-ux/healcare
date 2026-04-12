-- Create HealCareDB
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HealCareDB')
BEGIN
    CREATE DATABASE HealCareDB;
END
GO

USE HealCareDB;
GO

-- Users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) CHECK (role IN ('patient', 'doctor', 'admin')) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Doctors table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Doctors' AND xtype='U')
BEGIN
    CREATE TABLE Doctors (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        specialization NVARCHAR(100),
        experience_years INT,
        consultation_fee DECIMAL(10, 2),
        clinic_name NVARCHAR(100),
        clinic_location NVARCHAR(255),
        verification_status NVARCHAR(20) DEFAULT 'pending',
        license_document_path NVARCHAR(MAX)
    );
END

-- Patients table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Patients' AND xtype='U')
BEGIN
    CREATE TABLE Patients (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
        phone_number NVARCHAR(20),
        gender NVARCHAR(20),
        date_of_birth DATE
    );
END

-- Appointments table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Appointments' AND xtype='U')
BEGIN
    CREATE TABLE Appointments (
        id INT PRIMARY KEY IDENTITY(1,1),
        doctor_id INT FOREIGN KEY REFERENCES Doctors(id),
        patient_id INT FOREIGN KEY REFERENCES Patients(id),
        appointment_date DATE,
        appointment_time TIME,
        consultation_type NVARCHAR(20), -- 'online' / 'offline'
        status NVARCHAR(20) DEFAULT 'pending',
        payment_status NVARCHAR(20) DEFAULT 'pending'
    );
END

-- Payments table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Payments' AND xtype='U')
BEGIN
    CREATE TABLE Payments (
        id INT PRIMARY KEY IDENTITY(1,1),
        appointment_id INT FOREIGN KEY REFERENCES Appointments(id),
        amount DECIMAL(10, 2),
        payment_method NVARCHAR(50),
        transaction_id NVARCHAR(100),
        payment_date DATETIME DEFAULT GETDATE()
    );
END

-- Slots table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Slots' AND xtype='U')
BEGIN
    CREATE TABLE Slots (
        id INT PRIMARY KEY IDENTITY(1,1),
        doctor_id INT FOREIGN KEY REFERENCES Doctors(id),
        available_day NVARCHAR(20),
        start_time TIME,
        end_time TIME,
        max_patients INT
    );
END
