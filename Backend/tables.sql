CREATE TABLE Users(
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(50),
    radius INTEGER,
    notify BOOLEAN,
    bio VARCHAR(500)
);

CREATE TABLE Posts(
    author VARCHAR(50) REFERENCES Users(username),
    species VARCHAR(50),
    quantity INTEGER,
    comments VARCHAR(50),
    dt TIMESTAMP,
    coordinates POINT
);
