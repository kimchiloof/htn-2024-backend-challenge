import db from './database.js'

export const getUserByEmail = db.prepare(`SELECT * FROM users WHERE email = ?`);
export const getSkillByName = db.prepare('SELECT * FROM skills WHERE skill = ?');
export const getSkillsByUserId = db.prepare(`
    SELECT skills.skill, user_skills.rating
    FROM user_skills
    JOIN skills ON user_skills.skill_id = skills.id
    WHERE user_skills.user_id = ?
`);