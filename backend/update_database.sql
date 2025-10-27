-- Update existing database to add role column
USE ecommerce;

-- Add role column to existing users table
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';

-- Update existing admin user to have admin role (if it exists)
UPDATE users SET role = 'admin' WHERE username = 'admin';

-- If no admin user exists, insert one
INSERT IGNORE INTO users (username, email, password, role) VALUES 
('admin', 'admin@eshop.com', SHA2('admin123', 256), 'admin');
