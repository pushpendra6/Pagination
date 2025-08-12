const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '10.4.1.9', 
    user: 'root',      
    password: 'wood@123',      
    database: 'User'
});

db.connect(err => {
    if (err) throw err;
        console.log('Connected to MySQL database');
});

// Export the db connection so other files can use it
module.exports = db;
