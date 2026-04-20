animal-tracker-backend/
├── server.js                 # Entry point, Express, Socket.io, and the Simulator interval
├── db.js                     # pg Pool connection
├── controllers/              # Put all logic and PostGIS SQL queries here directly
│   ├── animalController.js   # Add/remove animals
│   └── geofenceController.js # Set/get safe zone
├── routes/
│   └── index.js              # All API routes in one file
├── package.json
└── .env


// you need to inst =>
    npm i 
    npm i pq
    npm install dotenv express pg socket.io cors


// for create TABLE
psql -U postgres -d animal_tracker -c "TRUNCATE TABLE geofences;"

// run init.sql file
psql -U postgres -d animal_tracker -f database/init.sql