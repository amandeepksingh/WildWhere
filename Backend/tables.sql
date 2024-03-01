CREATE TABLE Users(
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    radius INTEGER,
    notify BOOLEAN,
    bio VARCHAR(500)
);

CREATE TABLE Posts(
    id VARCHAR(50) REFERENCES Users(id),
    species VARCHAR(50),
    quantity INTEGER,
    comments VARCHAR(50),
    dt TIMESTAMP,
    coordinates POINT
);
