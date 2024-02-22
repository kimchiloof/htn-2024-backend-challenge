import Database from "better-sqlite3";
import fetch from "node-fetch";

const db = new Database("database.db", {verbose: console.log});

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
        email TEXT UNIQUE,
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

function InsertUserData(userData, skillData) {
    // Insert
    const insertUser = db.prepare('INSERT INTO users (name, company, email, phone) VALUES (?, ?, ?, ?)');
    const insertSkill = db.prepare('INSERT OR IGNORE INTO skills (skill) VALUES (?)');
    const insertUserSkill = db.prepare('INSERT INTO user_skills (user_id, skill_id, rating) VALUES (?, ?, ?)');

    // Get
    const getSkillId = db.prepare('SELECT id FROM skills WHERE skill = ?');
    
    try {
        // Insert user
        const insertUserResult = insertUser.run(userData.name, userData.company, userData.email, userData.phone);
        const userId = insertUserResult.lastInsertRowid; 

        console.log(`User ${userData.name} added at row: ${userId}`);

        skillData.forEach(skill => {
            try {
                // Insert or ignore new skill
                const insertSkillResult = insertSkill.run(skill.skill);
                const skillId = insertSkillResult.lastInsertRowid;
                
                console.log(insertSkillResult.changes === 0 
                    ? `Skill ${skill.skill} ignored at row: ${skillId}` 
                    : `Skill ${skill.skill} added at row: ${skillId}`)
                
                // Add user-skill link
                const userSkill = getSkillId.get(skill.skill);
                if (userSkill) {
                    insertUserSkill.run(userId, userSkill.id, skill.rating);
                } else {
                    console.error(`Failed to retrieve or insert skill: ${skill.name}`);
                }
            } catch (error) {
                console.error(`Error inserting skill data for ${skill.name}:`, error);
            }
        });
    } catch (error) {
        console.error(`Error inserting user data for ${userData.name}:`, error);
        throw error;
    }
}

export default db;