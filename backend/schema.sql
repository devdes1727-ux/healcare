-- Appointments table (FIXED STRUCTURE)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Appointments' AND xtype='U')
BEGIN
    CREATE TABLE Appointments (

        id INT PRIMARY KEY IDENTITY(1,1),

        doctor_id INT NOT NULL
        FOREIGN KEY REFERENCES Doctors(id),

        patient_id INT NOT NULL
        FOREIGN KEY REFERENCES Patients(id),

        appointment_date DATE NOT NULL,

        appointment_start_time TIME NOT NULL,

        appointment_end_time TIME NOT NULL,

        consultation_type NVARCHAR(20)
        CHECK (consultation_type IN ('online','offline')),

        status NVARCHAR(30)
        DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'confirmed',
            'rejected',
            'cancelled_by_doctor',
            'cancelled_by_patient',
            'completed',
            'reschedule_requested'
        )),

        payment_status NVARCHAR(20)
        DEFAULT 'pending'
        CHECK (payment_status IN ('pending','paid')),

        meeting_link NVARCHAR(MAX),

        created_at DATETIME DEFAULT GETDATE()

    );
END