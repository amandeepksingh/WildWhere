CREATE EXTENSION IF NOT EXISTS cube;

CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE TABLE Users (
    uid SERIAL PRIMARY KEY, 
    email VARCHAR(50),
    username VARCHAR(50),
    bio VARCHAR(50),
    pfpLink VARCHAR(50),
    superUser BOOLEAN,
    locationPerm BOOLEAN,
    notificationPerm BOOLEAN,
    colorBlindRating INTEGER
);

CREATE TABLE POSTS (
    pid SERIAL PRIMARY KEY,
    uid INTEGER NOT NULL REFERENCES  Users(uid) ON DELETE CASCADE,
    imgLink VARCHAR(50),
    datetime TIMESTAMP,
    coordinate POINT NOT NULL
);