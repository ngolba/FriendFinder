DROP DATABASE IF EXISTS users_db;
CREATE DATABASE users_db;

USE users_db;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT not null auto_increment, 
    name VARCHAR (100) not null,
    url VARCHAR (100),
    responses VARCHAR (100),
    PRIMARY KEY (id)
);