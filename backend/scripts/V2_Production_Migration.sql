-- PHASE 1: DATABASE AUDIT & FIXES - HEALCARE PRODUCTION MIGRATION

-- 1. ADD NEW COLUMNS TO APPOINTMENTS
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = 'appointment_source'
)
BEGIN
    ALTER TABLE Appointments
    ADD appointment_source NVARCHAR(20) DEFAULT 'online' CHECK (appointment_source IN ('online', 'walkin', 'admin'));
END

-- 2. CREATE PAYMENT TRANSACTIONS TABLE (COMMISSION TRACKING)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PaymentTransactions' AND xtype='U')
BEGIN
    CREATE TABLE PaymentTransactions (
        id INT PRIMARY KEY IDENTITY(1,1),
        doctor_id INT NOT NULL FOREIGN KEY REFERENCES Doctors(id),
        appointment_id INT NULL FOREIGN KEY REFERENCES Appointments(id),
        amount DECIMAL(10,2) NOT NULL,
        commission DECIMAL(10,2) DEFAULT 0,
        platform_fee DECIMAL(10,2) DEFAULT 0,
        status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
        payment_method NVARCHAR(50),
        transaction_reference NVARCHAR(100) UNIQUE,
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- 3. CREATE DOCTOR EARNINGS LEDGER TABLE
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DoctorEarningsLedger' AND xtype='U')
BEGIN
    CREATE TABLE DoctorEarningsLedger (
        id INT PRIMARY KEY IDENTITY(1,1),
        doctor_id INT NOT NULL FOREIGN KEY REFERENCES Doctors(id),
        transaction_type NVARCHAR(20) CHECK (transaction_type IN ('credit', 'debit', 'payout')),
        amount DECIMAL(10,2) NOT NULL,
        description NVARCHAR(MAX),
        reference_id INT, -- Could be appointment_id or payout_id
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- 4. FIX MISSING INDEXES & CONSTRAINTS

-- Ensure unique phone number for Patients ONLY IF NOT NULL
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Patients_Phone' AND object_id = OBJECT_ID('Patients'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX IX_Patients_Phone 
    ON Patients(phone_number) 
    WHERE phone_number IS NOT NULL;
END

-- Prevent duplicate appointments for same doctor & slot explicitly
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Appointments_Doctor_Date_Time' AND object_id = OBJECT_ID('Appointments'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Appointments_Doctor_Date_Time 
    ON Appointments(doctor_id, appointment_date, appointment_start_time)
    WHERE status NOT IN ('cancelled_by_patient', 'cancelled_by_doctor', 'rejected');
END

-- Index on Users Email & Role for faster auth
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Users_Email_Role' AND object_id = OBJECT_ID('Users'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_Email_Role ON Users(email, role);
END

-- Add Follow Up tracking fields to Patients if not exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Patients]') AND name = 'visit_history'
)
BEGIN
    ALTER TABLE Patients
    ADD visit_history NVARCHAR(MAX),
        last_visit_summary NVARCHAR(MAX),
        prescription_uploads NVARCHAR(MAX);
END

-- Add Reason support to LeaveDays
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[LeaveDays]') AND name = 'leave_type'
)
BEGIN
    ALTER TABLE LeaveDays
    ADD leave_type NVARCHAR(50) DEFAULT 'holiday' CHECK (leave_type IN ('holiday', 'emergency', 'travel', 'surgery_day'));
END

PRINT 'Phase 1 Database Audit & Fixes completed successfully.';
