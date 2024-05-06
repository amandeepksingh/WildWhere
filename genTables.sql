CREATE EXTENSION IF NOT EXISTS cube;

CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE TABLE users (
    uid VARCHAR(50) PRIMARY KEY, 
    email VARCHAR(50),
    username TEXT,
    bio TEXT,
    imgLink TEXT,
    superUser BOOLEAN,
    locationPerm BOOLEAN,
    notificationPerm BOOLEAN,
    colorBlindRating INTEGER
);

CREATE TABLE posts (
    pid VARCHAR(50) PRIMARY KEY,
    uid VARCHAR(50) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    imgLink TEXT,
    datetime TIMESTAMP,
    coordinate POINT NOT NULL,
    animalName TEXT,
    quantity INTEGER,
    activity TEXT,
    city TEXT,
    state TEXT
);

CREATE TABLE reports (
    pid VARCHAR(50) NOT NULL REFERENCES posts(pid) ON DELETE CASCADE,
    uid VARCHAR(50) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    reason TEXT
)