-- FINAL SCHEMA FOR HEALCARE PLATFORM

-- Users Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) DEFAULT 'patient', -- admin, doctor, patient
        profile_image NVARCHAR(MAX),
        reset_token NVARCHAR(100),
        reset_token_expiry DATETIME,
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Doctors Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Doctors' AND xtype='U')
BEGIN
    CREATE TABLE Doctors (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        age INT,
        specialization NVARCHAR(100),
        experience_years INT DEFAULT 0,
        consultation_fee DECIMAL(10,2) DEFAULT 0,
        clinic_name NVARCHAR(100),
        clinic_location NVARCHAR(255),
        contact_number NVARCHAR(20),
        reception_contact NVARCHAR(20),
        show_contact_preference NVARCHAR(20) DEFAULT 'Personal',
        medical_license_number NVARCHAR(100),
        languages_spoken NVARCHAR(255),
        treatment_system NVARCHAR(200), -- Ayurveda, Homeopathy, etc. (Multi-select support)
        verification_status NVARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
        subscription_status NVARCHAR(20) DEFAULT 'trial', -- trial, monthly, featured, expired
        subscription_expiry DATETIME,
        is_featured BIT DEFAULT 0,
        slug NVARCHAR(100) UNIQUE,
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Patients Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Patients' AND xtype='U')
BEGIN
    CREATE TABLE Patients (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        phone_number NVARCHAR(20),
        gender NVARCHAR(10),
        age INT,
        dob DATE,
        blood_group NVARCHAR(5),
        address NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Slots Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Slots' AND xtype='U')
BEGIN
    CREATE TABLE Slots (
        id INT PRIMARY KEY IDENTITY(1,1),
        doctor_id INT NOT NULL FOREIGN KEY REFERENCES Doctors(id),
        available_day NVARCHAR(20), -- Monday, Tuesday, etc.
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        max_patients INT DEFAULT 1,
        consultation_duration INT DEFAULT 15, -- minutes
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- LeaveDays Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LeaveDays' AND xtype='U')
BEGIN
    CREATE TABLE LeaveDays (
        id INT PRIMARY KEY IDENTITY(1,1),
        doctor_id INT NOT NULL FOREIGN KEY REFERENCES Doctors(id),
        leave_date DATE NOT NULL,
        reason NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Appointments Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Appointments' AND xtype='U')
BEGIN
    CREATE TABLE Appointments (
        id INT PRIMARY KEY IDENTITY(1,1),
        doctor_id INT NOT NULL FOREIGN KEY REFERENCES Doctors(id),
        patient_id INT NOT NULL FOREIGN KEY REFERENCES Patients(id),
        appointment_date DATE NOT NULL,
        appointment_start_time TIME NOT NULL,
        appointment_end_time TIME NOT NULL,
        consultation_type NVARCHAR(20) CHECK (consultation_type IN ('online','offline')),
        status NVARCHAR(30) DEFAULT 'pending' 
        CHECK (status IN (
            'pending', 'confirmed', 'rejected', 'cancelled_by_doctor', 
            'cancelled_by_patient', 'completed', 'reschedule_requested', 'no_show'
        )),
        payment_status NVARCHAR(20) DEFAULT 'pending',
        booked_by NVARCHAR(20) DEFAULT 'patient', -- patient, doctor
        commission_amt DECIMAL(10,2) DEFAULT 0,
        doctor_earnings DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) DEFAULT 0,
        visit_summary NVARCHAR(MAX),
        prescription_file NVARCHAR(MAX),
        follow_up_date DATE,
        follow_up_status NVARCHAR(20) DEFAULT 'none', -- none, pending, accepted, denied
        meeting_link NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- Reviews Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Reviews' AND xtype='U')
BEGIN
    CREATE TABLE Reviews (
        id INT PRIMARY KEY IDENTITY(1,1),
        reviewer_id INT NOT NULL FOREIGN KEY REFERENCES Users(id),
        doctor_id INT FOREIGN KEY REFERENCES Doctors(id), -- Null if platform review
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment NVARCHAR(MAX),
        type NVARCHAR(20) DEFAULT 'doctor', -- doctor, platform
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- DoctorSubscriptions Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DoctorSubscriptions' AND xtype='U')
BEGIN
    CREATE TABLE DoctorSubscriptions (
        id INT PRIMARY KEY IDENTITY(1,1),
        doctor_id INT NOT NULL FOREIGN KEY REFERENCES Doctors(id),
        plan_name NVARCHAR(50), -- monthly, yearly
        start_date DATETIME DEFAULT GETDATE(),
        trial_end_date DATETIME,
        expiry_date DATETIME,
        status NVARCHAR(20) DEFAULT 'trial', -- trial, active, expired, cancelled
        amount_paid DECIMAL(10,2) DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE()
    );
END

-- FeaturedDoctorPromotions Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FeaturedDoctorPromotions' AND xtype='U')
BEGIN
    CREATE TABLE FeaturedDoctorPromotions (
        id INT PRIMARY KEY IDENTITY(1,1),
        doctor_id INT UNIQUE NOT NULL FOREIGN KEY REFERENCES Doctors(id),
        start_date DATETIME DEFAULT GETDATE(),
        expiry_date DATETIME,
        status NVARCHAR(20) DEFAULT 'active', -- active, expired
        amount_paid DECIMAL(10,2) DEFAULT 999,
        created_at DATETIME DEFAULT GETDATE()
    );
END