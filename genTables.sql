CREATE EXTENSION IF NOT EXISTS cube;

CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE TABLE users (
    uid VARCHAR(50) PRIMARY KEY, 
    email VARCHAR(50),
    username VARCHAR(50),
    bio VARCHAR(50),
    imgLink VARCHAR(5000),
    superUser BOOLEAN,
    locationPerm BOOLEAN,
    notificationPerm BOOLEAN,
    colorBlindRating INTEGER
);

CREATE TABLE posts (
    pid VARCHAR(50) PRIMARY KEY,
    uid VARCHAR(128) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    imgLink TEXT,
    datetime TIMESTAMP,
    coordinate POINT NOT NULL,
    animalName TEXT,
    quantity INTEGER,
    activity TEXT
);
