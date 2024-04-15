CREATE EXTENSION IF NOT EXISTS cube;

CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE TABLE users (
    uid VARCHAR(128) PRIMARY KEY, 
    email TEXT,
    username TEXT,
    bio TEXT,
    pfpLink TEXT,
    superUser BOOLEAN,
    locationPerm BOOLEAN,
    notificationPerm BOOLEAN,
    colorBlindRating INTEGER
);

CREATE TABLE posts (
    pid CHAR(16) PRIMARY KEY,
    uid VARCHAR(128) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    imgLink TEXT,
    datetime TIMESTAMP,
    coordinate POINT NOT NULL,
    animalName TEXT,
    quantity INTEGER,
    activity TEXT
);
