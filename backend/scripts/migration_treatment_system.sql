-- MIGRATION: ADD TREATMENT SYSTEM COLUMN TO DOCTORS

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Doctors]') AND name = 'treatment_system')
BEGIN
    ALTER TABLE Doctors ADD treatment_system NVARCHAR(200);
    PRINT 'Added treatment_system column to Doctors table.';
END
ELSE
BEGIN
    ALTER TABLE Doctors ALTER COLUMN treatment_system NVARCHAR(200);
    PRINT 'Updated treatment_system column size to NVARCHAR(200).';
END

-- Note: Constraint for multi-select is better handled in application logic
-- but if we want a simple check for single values we could, 
-- but since we might support multi-select (Allopathy,Siddha), we skip the strict DB CHECK constraint for now to avoid breaking multi-select.
