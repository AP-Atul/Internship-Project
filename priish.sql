CREATE DATABASE priish;

CREATE TABLE users(
    id INTEGER PRIMARY KEY AUTO INCREMENT,
    name VARCHAR(20),
    phone VARCHAR(12),
    password VARCHAR(12),
    email VARCHAR(255)
);