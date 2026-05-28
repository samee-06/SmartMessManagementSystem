ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sid18mal18';
FLUSH PRIVILEGES;
-- 1. Create the database wrapper
CREATE DATABASE IF NOT EXISTS uniwallet_db;
USE uniwallet_db;

-- 2. Create the Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the Wallets Table
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Create the Transactions Table (Receipts)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mess_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('deduction', 'topup') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 1. Create the Menu Table
CREATE TABLE menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Snacks', 'Dinner') NOT NULL,
    items TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Create the Feedback/Suggestions Table
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'reviewed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shortcut: Clear existing dummy data and reset ID counters
TRUNCATE TABLE menu;
-- Bulk Insert the extracted Mess Menu
INSERT INTO menu (day, meal_type, items) VALUES 
-- MONDAY
('Monday', 'Breakfast', 'Aloo Pyaaz Paratha + Boiled Sprouts + Bread + Butter + Coffee + Tea'),
('Monday', 'Lunch', 'Rajma + Kofta + Rice + Roti + Mix Raita + Salad'),
('Monday', 'Snacks', 'Samosa + Tea'),
('Monday', 'Dinner', 'Aloo Sabji + Puri + Daal Makhani + Rice + Salad + Kheer'),

-- TUESDAY
('Tuesday', 'Breakfast', 'Pav Bhaji + Boiled Sprouts + Bread + Jam + Bournvita + Milk + Tea'),
('Tuesday', 'Lunch', 'Kadhi Pakoda + Aloo Jeera + Rice + Roti + Boondi Raita + Salad'),
('Tuesday', 'Snacks', 'Maggi + Tea'),
('Tuesday', 'Dinner', 'Sev Tamatar Sabji + Chana Daal + Rice + Roti + Salad + Gulaab Jamun (2)'),

-- WEDNESDAY
('Wednesday', 'Breakfast', 'Aloo Puri + Boiled Sprouts + Bread + Jam + Coffee + Tea'),
('Wednesday', 'Lunch', 'Seasonal Veg +Lal Masoor Daal + Rice + Roti + Jeera Raita + Salad'),
('Wednesday', 'Snacks', 'Sandwich (1) + Tea'),
('Wednesday', 'Dinner', 'Chhole + Sabji + Rice + Roti + Salad'),

-- THURSDAY
('Thursday', 'Breakfast', 'Methi Paratha + Dahi + Boiled Sprouts + Bread + Jam + Coffee + Tea'),
('Thursday', 'Lunch', 'Kaale Chane + Sabji + Rice + Roti + Mix Raita + Salad + Fried Mirchi'),
('Thursday', 'Snacks', 'Banana (2) + Tea'),
('Thursday', 'Dinner', 'Biryani + Dahi + Arhar Daal + Roti + Salad'),

-- FRIDAY
('Friday', 'Breakfast', 'Idli Sambhar (3) + Dahi + Boiled Egg (1) / Banana (1) + Boiled Sprouts + Bread + Butter + Bournvita + Milk + Tea'),
('Friday', 'Lunch', 'Chhole + Puri + Sabji + Rice + Roti + Chaach + Salad + Fried Mirchi'),
('Friday', 'Snacks', 'Red Sauce Pasta + Tea'),
('Friday', 'Dinner', 'Mix Veg + Daal Tadka + Rice + Roti + Salad'),

-- SATURDAY
('Saturday', 'Breakfast', 'Medu Vada (3) + Boiled Sprouts + Bread + Jam + Bournvita + Milk + Tea'),
('Saturday', 'Lunch', 'Sabji + Mix Daal + Rice + Roti + Boondi Raita + Salad'),
('Saturday', 'Snacks', 'Fruit Chaat + Tea'),
('Saturday', 'Dinner', 'Manchurian +Chana Daal + Fried Rice + Roti + Salad + Ice Cream'),

-- SUNDAY
('Sunday', 'Breakfast', 'Chhole Bhature + Boiled Sprouts + Bread + Butter + Coffee + Tea'),
('Sunday', 'Lunch', 'Fried Rice + Sambhar + Mix Veg + Rice + Roti + Dahi + Salad + Fried Mirchi'),
('Sunday', 'Snacks', 'Poha + Tea'),
('Sunday', 'Dinner', 'Kadhai Paneer/ Egg Curry + Rice + Roti + Daal + Salad');


UPDATE users SET password = '$2b$10$9bplAjActJ6M6CEQUMsPXOxDTJUEw48veN5FiDTKfxeDkw.raYsFG' WHERE email = 'sid@nitdelhi.ac.in';
