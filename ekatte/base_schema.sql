create table areas (
    id VARCHAR(3) PRIMARY KEY,                                --Unique code of area
    name VARCHAR(25) NOT NULL,                                  --Name of area
    region VARCHAR(4) NOT NULL                                  --Region of level 2 to which the area belong                                   
);

create table municipalities (
    id VARCHAR(5) PRIMARY KEY,                                --Unique code of municipality                
    name VARCHAR(25) NOT NULL,                                  --Name of municipality
    area_id VARCHAR(3) REFERENCES areas(id)              --Area to which the municipality belongs
);
create table settlements (
    id INTEGER PRIMARY KEY,                         --Unique id of settlement
    name VARCHAR(25) NOT NULL,                             --Name of settlement
    t_v_m VARCHAR(4) NOT NULL,                             --Prefix of name
    muni_id VARCHAR(5) REFERENCES municipalities(id)   --Municipality to which the settlement belongs
);