CREATE TABLE Users (
    uid INTEGER PRIMARY KEY,
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
    pid INTEGER PRIMARY KEY,
    uid INTEGER REFERENCES  Users(uid) ON DELETE CASCADE,
    radius INTEGER,
    imgLink VARCHAR(50),
    datetime TIMESTAMP,
    coordinate POINT
);