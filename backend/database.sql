CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  quantity INT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed initial admin user
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@eshop.com', SHA2('admin123', 256), 'admin');

-- Seed initial products with placeholders
INSERT INTO products (name, price, description, image_url) VALUES 
('Gaming Laptop', 999.99, 'High-performance laptop for gaming and work.', 'uploads/gaming-laptop.jpg'),
('Wireless Headphones', 149.99, 'Noise-cancelling wireless headphones with 20-hour battery.', 'uploads/headphones.jpg'),
('Smartphone', 699.99, 'Latest model with advanced camera and 5G support.', 'uploads/smartphone.jpg'),
('Coffee Maker', 79.99, 'Programmable coffee maker for daily brews.', 'uploads/coffee-maker.jpg');