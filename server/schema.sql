-- ====================================================================
-- MILAN KERAMIK - DATABASE ABSENSI & ROSTER SHIFT PABRIK (MySQL 8.0+)
-- Skema Relasional Resmi PT Milan Keramik
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `milan_keramik_absensi` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `milan_keramik_absensi`;

-- 1. TABEL DEPARTEMEN & LOKASI PABRIK (GEOFENCING)
CREATE TABLE IF NOT EXISTS `departments` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `factory_name` VARCHAR(150) NOT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `radius_meters` INT NOT NULL DEFAULT 300,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABEL KARYAWAN & AKUN LOGIN
CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(50) PRIMARY KEY,
  `nik` VARCHAR(30) NOT NULL UNIQUE,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `role` ENUM('operator', 'supervisor', 'staff', 'admin') NOT NULL DEFAULT 'operator',
  `department_id` VARCHAR(50) NOT NULL,
  `position` VARCHAR(100) NOT NULL,
  `photo_url` TEXT,
  `phone` VARCHAR(30),
  `current_shift` VARCHAR(20) NOT NULL DEFAULT 'SHIFT_1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABEL DEFINISI SHIFT PABRIK KERAMIK
CREATE TABLE IF NOT EXISTS `shifts` (
  `code` VARCHAR(20) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `description` TEXT,
  `is_overnight` BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL ROSTER SHIFT BULANAN KARYAWAN
CREATE TABLE IF NOT EXISTS `shift_rosters` (
  `id` VARCHAR(50) PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `shift_code` VARCHAR(20) NOT NULL,
  `line_or_kiln` VARCHAR(100),
  `is_off` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_emp_date` (`employee_id`, `date`),
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`shift_code`) REFERENCES `shifts`(`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL LOG RIWAYAT KEHADIRAN (ABSENSI)
CREATE TABLE IF NOT EXISTS `attendance_logs` (
  `id` VARCHAR(50) PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `clock_in_time` TIME NULL,
  `clock_out_time` TIME NULL,
  `shift_code` VARCHAR(20) NOT NULL,
  `status` ENUM('ON_TIME', 'LATE', 'ABSENT', 'LEAVE', 'SICK') NOT NULL DEFAULT 'ON_TIME',
  `work_hours` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `clock_in_photo_url` MEDIUMTEXT NULL,
  `clock_out_photo_url` MEDIUMTEXT NULL,
  `clock_in_lat` DECIMAL(10, 7) NULL,
  `clock_in_lng` DECIMAL(10, 7) NULL,
  `clock_in_distance_meters` INT NULL,
  `is_geofence_valid` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_face_verified` BOOLEAN NOT NULL DEFAULT TRUE,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. TABEL PENGAJUAN CUTI, IZIN SAKIT & LEMBUR
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` VARCHAR(50) PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL,
  `type` ENUM('CUTI', 'SAKIT', 'LEMBUR') NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `duration_days_or_hours` VARCHAR(50) NOT NULL,
  `reason` TEXT NOT NULL,
  `doctor_letter_url` MEDIUMTEXT NULL,
  `overtime_task` TEXT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `reviewed_by` VARCHAR(100) NULL,
  `reviewed_at` TIMESTAMP NULL,
  `review_notes` TEXT NULL,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED DATA AWAL DEPARTEMEN MILAN KERAMIK
INSERT INTO `departments` (`id`, `name`, `code`, `factory_name`, `latitude`, `longitude`, `radius_meters`) VALUES
('dept-prod', 'Produksi & Kiln Ceramic Firing', 'PROD', 'Pabrik Milan Keramik Gresik (Plant A)', -7.1566400, 112.6555100, 300),
('dept-qc', 'Quality Control & Lab Glaze', 'QC', 'Pabrik Milan Keramik Karawang (Plant B)', -6.3056100, 107.3012400, 250),
('dept-log', 'Gudang Distribusi Keramik', 'LOG', 'Pusat Distribusi Surabaya', -7.2575200, 112.7521100, 350),
('dept-hr', 'HRD & Finance Kantor Pusat', 'HR', 'Graha Milan Keramik Jakarta Pusat', -6.1751100, 106.8271800, 200);

-- SEED DATA SHIFT
INSERT INTO `shifts` (`code`, `name`, `start_time`, `end_time`, `description`, `is_overnight`) VALUES
('SHIFT_1', 'Shift 1 (Pagi)', '07:00:00', '15:00:00', 'Operasional Pagi - Persiapan Pembakaran Kiln & Body Prep', FALSE),
('SHIFT_2', 'Shift 2 (Siang)', '15:00:00', '23:00:00', 'Operasional Siang - Glazing, Printing & Sortir Keramik', FALSE),
('SHIFT_3', 'Shift 3 (Malam)', '23:00:00', '07:00:00', 'Operasional Malam - Continuous Firing Kiln & Monitoring Suhu', TRUE),
('NON_SHIFT', 'Normal Office', '08:00:00', '17:00:00', 'Staf Administrasi, HRD & Manajemen', FALSE);
