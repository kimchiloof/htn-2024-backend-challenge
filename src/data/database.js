import Database from "better-sqlite3";
import fetch from "node-fetch";

const db = new Database("database.db");

Main().catch(console.error);

async function Main() {
    InitDB();
    const users = await FetchData("https://gist.githubusercontent.com/DanielYu842/607c1ae9c63c4e83e38865797057ff8f/raw/HTN_2023_BE_Challenge_Data.json");

    for (let user of users) {
        InsertUserData(user, user.skills);
    }
    
    console.log("Database setup complete!")
}

function InitDB() {
    const usersTable = `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        company TEXT,
        email TEXT UNIQUE, -- Users' accounts to be associated with an unique email
        phone TEXT
    )`;

    const skillsTable = `CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill TEXT UNIQUE
    )`;

    const userSkillsTable = `CREATE TABLE IF NOT EXISTS user_skills (
        user_id INTEGER,
        skill_id INTEGER,
        rating INTEGER,
        PRIMARY KEY (user_id, skill_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (skill_id) REFERENCES skills(id)
    )`;

    db.exec(usersTable);
    db.exec(skillsTable);
    db.exec(userSkillsTable);
}

async function FetchData(url) {
    try {
        const response = await fetch(url);
        return response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
}

function InsertUserData(user, skills) {
    // Inserters - Ignore duplicate entries on initial database setup
    const insertNewUser  = db.prepare(`INSERT OR IGNORE INTO users (name, company, email, phone) VALUES (?, ?, ?, ?)`);
    const insertNewSkill = db.prepare(`INSERT OR IGNORE INTO skills (skill) VALUES (?)`);
    const insertNewLink  = db.prepare(`INSERT OR IGNORE INTO user_skills (user_id, skill_id, rating) VALUES (?, ?, ?)`);
    
    // ID Getters
    const getUserByEmail = db.prepare(`SELECT id FROM users WHERE email = ?`);
    const getSkillByName = db.prepare('SELECT id FROM skills WHERE skill = ?');
    
    // User
    const newUser = insertNewUser.run(user.name, user.company, user.email, user.phone);
    const finalUser = getUserByEmail.get(user.email);
    newUser.changes === 0
        ? console.warn(`Duplicate user ${user.name} with email ${user.email}. Ignoring!`)
        : console.debug(`User ${user.name} inserted at row ${finalUser.id}.`);
    
    if (newUser.changes === 0) {
        // Duplicate email, ignore new entries
        return;
    }
    
    // Skills
    skills.forEach(skill => {
        const newSkill = insertNewSkill.run(skill.skill);
        const finalSkill = getSkillByName.get(skill.skill);
        newSkill.changes === 0
            ? console.debug(`----- ${skill.skill} was previously declared.`)
            : console.debug(`Skill ${skill.skill} inserted at row ${finalSkill.id}.`);
        
        // User-Skill link
        const newUserSkillLink = insertNewLink.run(finalUser.id, finalSkill.id, skill.rating);
        if (newUserSkillLink.changes === 0) {
            console.warn(`Duplicate skill ${skill.skill} for ${user.name}. Ignoring!`)
        }
    });
}

export default db;