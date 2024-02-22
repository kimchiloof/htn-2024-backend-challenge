import db from './database.js'
import {getSkillByName, getSkillsByUserId, getUserByEmail} from "./data-utils.js";

const resolvers = {
    Query: {
        // Get all information about all users (max limit if given)
        allUsers: (parent, { limit }) => limit
            ? db.prepare('SELECT * FROM users LIMIT ?').all(limit)
            : db.prepare('SELECT * FROM users').all(),
        
        // Get sll information about the user with the given email
        getUserInfo: (parent, { email }) => {
            return getUserInfo(email);
        },
        
        updateUser: (parent, { email, data }) => {
            const updateUserTransaction = db.transaction( () => {
                const user = getUserByEmail.get(email);
                
                // User does not exist, return null
                if (!user) {
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
                console.error("Failed to update user:", error);
                return null;
            }
        },
    },
};

function getUserInfo(email) {
    const user = getUserByEmail.get(email);

    // User does not exist, return null
    if (!user) {
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