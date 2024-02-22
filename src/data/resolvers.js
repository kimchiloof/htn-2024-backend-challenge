import db from './database.js'
import {getSkillByName, getSkillsByUserId, getUserByEmail} from "./data-utils.js";

const resolvers = {
    Query: {
        // Get all information about all users (max limit if given)
        allUsers: (_, { limit }) => limit
            ? db.prepare('SELECT * FROM users LIMIT ?').all(limit)
            : db.prepare('SELECT * FROM users').all(),
        
        // Get all information about the user with the given email
        getUserInfo: (_, { email }) => {
            return getUserInfo(email);
        },
        
        // Update the user at the given email with given data. Non-specified info remains unchanged
        updateUser: (_, { email, data }) => {
            if (!data) {
                return getUserInfo(email);
            }
            
            const updateUserTransaction = db.transaction( () => {
                const user = getUserByEmail.get(email);
                
                // User does not exist, return null
                if (!user) {
                    console.warn(`User ${email} does not exist. Cannot update.`)
                    return null;
                }
                
                db.prepare(`UPDATE users SET name = ?, company = ?, phone = ?, email = ? WHERE email = ?`).run(
                    data.name || user.name,
                    data.company || user.company,
                    data.phone || user.phone, 
                    data.email || user.email,
                    email
                );
                
                if (data.skills && data.skills.length > 0) {
                    data.skills.forEach(skill => {
                        db.prepare(`INSERT OR IGNORE INTO skills (skill) VALUES (?)`).run(skill.skill);
                        const skillId = getSkillByName.get(skill.skill).id;
                        
                        db.prepare(`
                            INSERT INTO user_skills (user_id, skill_id, rating)
                            VALUES (?, ?, ?)
                            ON CONFLICT(user_id, skill_id)
                            DO UPDATE SET rating = excluded.rating
                        `).run(user.id, skillId, skill.rating);
                    })
                }
            });

            try{
                updateUserTransaction();
                return getUserInfo(data.email || email);
            } catch (error) {
                if (error && error.message.includes("UNIQUE constraint failed: users.email")) {
                    console.error(`Email ${data.email} already exists for another user!`)
                }
                
                console.error("Failed to update user:", error);
                return null;
            }
        },

        getSkillsFreq: (_, { filter }) => {
            const { min_freq, max_freq } = filter;
            const skills = db.prepare(`
                SELECT skills.skill, COUNT(user_skills.user_id) AS freq
                FROM user_skills
                JOIN skills ON skills.id = user_skills.skill_id
                GROUP BY user_skills.skill_id
                HAVING freq BETWEEN ? AND ?
            `).all(min_freq, max_freq);
            
            return skills.map(skill => ({
                skill: skill.skill,
                freq: skill.freq
            }));
        }
    },
};

function getUserInfo(email) {
    const user = getUserByEmail.get(email);

    // User does not exist, return null
    if (!user) {
        console.warn(`User ${email} does not exist.`)
        return null;
    }

    // User skills
    const skills = getSkillsByUserId.all(user.id).map(skill => ({
        skill: skill.skill,
        rating: skill.rating
    }));

    return {
        name: user.name,
        company: user.company,
        email: user.email,
        phone: user.phone,
        skills: skills
    };
}

export default resolvers;