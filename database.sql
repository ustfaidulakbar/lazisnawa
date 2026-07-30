-- Skema Database MySQL untuk Lazisna
-- Eksekusi query ini di phpMyAdmin atau cPanel MySQL Databases Anda.

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'reguler', 'rijal') DEFAULT 'reguler',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Query untuk membuat akun admin (password: admin123)
-- (Hash password ini digenerate menggunakan bcrypt cost 10)
INSERT INTO `users` (`nama`, `email`, `password`, `role`) 
VALUES ('Administrator Lazisna', 'admin@lazisna.org', '$2a$10$7rO.aK6R2yq0O9P4T.P6A.Lw6s1N5Q4v0T1Xq5Y4uUv2z4A7U.nE6', 'admin')
ON DUPLICATE KEY UPDATE `role` = 'admin';
