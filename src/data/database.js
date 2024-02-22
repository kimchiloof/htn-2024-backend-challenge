import sqlite3 from "sqlite3";
import fetch from "node-fetch";

const db = new sqlite3.Database("database.db");

async function main() {
    const dataSource = 'https://gist.githubusercontent.com/DanielYu842/607c1ae9c63c4e83e38865797057ff8f/raw/HTN_2023_BE_Challenge_Data.json';
    const users = await fetchData(dataSource);

    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            company TEXT,
            email TEXT,
            phone TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS skills(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            skill TEXT,
            rating INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
        
        insertUserData(users)
    })
}

main().then(() => {
    console.log("Database setup and data insertion complete.");
    // db.close(); 
}).catch((error) => {
    console.error("Error in main operation:", error);
});

async function fetchData(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("Error fetching users data:", error);
        return [];
    }
}

function insertUserData(users) {
    if (users.length <= 0) return;
    
    users.forEach(async user => {
        const userExists = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [user.email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row); // Resolve true if row exists, false otherwise
                }
            });
        });
        
        if (userExists) {
            // User exists, skip insertion
            console.log(`User with email ${user.email} already exists in the database! Skipping.`)
        } else {
            // User does not exist, insert
            db.run(
                `INSERT INTO users (name, company, email, phone)
                 VALUES (?, ?, ?, ?)`,
                [user.name, user.company, user.email, user.phone],
                function (err) {
                    if (err) {
                        return console.log(err.message);
                    }

                    console.log(`A row has been inserted with rowid ${this.lastID}`);
                    
                    // If there are skills, insert
                    if (user.skills.length > 0) {
                        user.skills.forEach(skill => {
                            db.run(
                                `INSERT INTO skills (user_id, skill, rating)
                                 VALUES (?, ?, ?)`,
                                [this.lastID, skill.skill, skill.rating],
                                function (err) {
                                    if (err) {
                                        return console.log(err.message);
                                    }

                                    console.log(`A skill row has been inserted with rowid ${this.lastID}`);
                                }
                            );
                        });
                    }
                }
            );
        }
    });
}

export default db;