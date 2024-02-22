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

        // Gets all skills with a frequency between min_freq and max_freq
        getSkillsFreq: (_, { limit, filter }) => {
            const { min_freq, max_freq } = filter;
            let query = `
                SELECT skills.skill, COUNT(user_skills.user_id) AS freq
                FROM user_skills
                JOIN skills ON skills.id = user_skills.skill_id
                GROUP BY user_skills.skill_id
                HAVING freq BETWEEN ? AND ?
            `
            if (limit) 
                query += ` LIMIT ?`;
            
            const skills = limit
                ? db.prepare(query).all(
                    min_freq || Number.MIN_SAFE_INTEGER,
                    max_freq || Number.MAX_SAFE_INTEGER,
                    limit)
                : db.prepare(query).all(
                    min_freq || Number.MIN_SAFE_INTEGER,
                    max_freq || Number.MAX_SAFE_INTEGER);
            
            return skills.map(skill => ({
                skill: skill.skill,
                freq: skill.freq
            }));
        },

        // Gets all users who match all given filters
        getUsers: (_, { limit, name, company, email, phone, skills }) => {
            let query = `SELECT * FROM users WHERE true`
            let params = [];
            
            if (name) {
                query += ` AND name = ?`;
                params.push(name);
            }
            if (company) {
                query += ` AND company = ?`;
                params.push(company);
            }
            if (email) {
                query += ` AND email = ?`;
                params.push(email);
            }
            if (phone) {
                query += ` AND phone = ?`;
                params.push(phone);
            }

            let users = db.prepare(query).all(params);
            
            // Skills
            if (skills && skills.length > 0) {
                users = users.filter(user => {
                    return skills.every(skillQuery => {
                        const skillCheckQuery = `
                            SELECT COUNT(*) AS match
                            FROM user_skills
                            JOIN skills ON user_skills.skill_id = skills.id
                            WHERE user_skills.user_id = ? AND skills.skill = ? AND user_skills.rating >= ? AND user_skills.rating <= ?
                        `;
                        
                        const skillCheckParams = [
                            user.id,
                            skillQuery.skill,
                            skillQuery.min_rating || Number.MIN_SAFE_INTEGER,
                            skillQuery.max_rating || Number.MAX_SAFE_INTEGER
                        ];
                        
                        const result = db.prepare(skillCheckQuery).get(skillCheckParams);
                        return result.match > 0;
                    });
                });
            }

            users = users.map(user => {
                const skillsQuery = `
                    SELECT skills.skill, user_skills.rating
                    FROM user_skills
                    JOIN skills ON user_skills.skill_id = skills.id
                    WHERE user_skills.user_id = ?
                `;
                
                const userSkills = db.prepare(skillsQuery).all(user.id);
                return { ...user, skills: userSkills };
            });
            
            if (limit) {
                users = users.slice(0, limit);
            }
            
            return users.map(user => ({
                name: user.name,
                company: user.company,
                email: user.email,
                phone: user.phone,
                skills: user.skills
            }));
        }
    },
    
    Mutation: {
        // Update the user at the given email with given data. Non-specified info remains unchanged
        updateUser: (_, { email, data }) => {
            if (!data) {
                return getUserInfo(email);
            }

            let errors = false;

            const updateUserTransaction = db.transaction( () => {
                const user = getUserByEmail.get(email);

                // User does not exist, return null
                if (!user) {
                    console.warn(`User ${email} does not exist. Cannot update.`)
                    errors = true;
                }

                db.prepare(`UPDATE users SET name = ?, company = ?, phone = ?, email = ? WHERE email = ?`).run(
                    data.name || user.name,
                    data.company || user.company,
                    data.phone || user.phone,
                    data.email || user.email,
                    email
                );

                InsertSkillsForUser(data.skills, user);
            });

            try{
                updateUserTransaction();
                return errors
                    ? null
                    : getUserInfo(data.email || email);
            } catch (error) {
                if (error && error.message.includes("UNIQUE constraint failed: users.email")) {
                    console.error(`Email ${data.email} already exists for another user!`)
                }

                console.error("Failed to update user:", error);
                return null;
            }
        },
        
        // Attempts to create a user, returns the created user or null if failed
        newUser: (_, { data }) => {
            let errors = false;
            
            const newUserTransaction = db.transaction( () => {
                const insertNewUser = db.prepare(`INSERT OR IGNORE INTO users (name, company, email, phone) VALUES (?, ?, ?, ?)`).run(
                    data.name,
                    data.company, 
                    data.email, 
                    data.phone
                );
                
                if (insertNewUser.changes === 0) {
                    console.error("Failed to insert new user");
                    errors = true;
                } 
                
                const user = getUserByEmail.get(data.email);

                InsertSkillsForUser(data.skills, user);
            });

            try {
                newUserTransaction();
                return errors 
                    ? null
                    : getUserInfo(data.email);
            } catch (error) {
                if (error && error.message.includes("UNIQUE constraint failed: users.email")) {
                    console.error(`Email ${data.email} already exists for another user!`)
                }

                console.error("Failed to add user:", error);
                return null;
            }
        },

        // Attempts to delete the user associated with email, returns true on deletion success, false otherwise
        deleteUser: (_, { email }) => {
            let errors = false;
            
            const deleteUserTransaction = db.transaction(() => {
                const user = getUserByEmail.get(email);

                if (!user) {
                    console.warn(`User ${email} does not exist.`)
                    errors = true;
                }

                // Delete user and skill links
                db.prepare(`DELETE FROM user_skills WHERE user_id = ?`).run(user.id);
                db.prepare(`DELETE FROM users WHERE id = ?`).run(user.id);
            })

            try {
                deleteUserTransaction();
                return !errors;
            } catch (error) {
                console.error('Failed to delete user:', error);
                return false;
            }
        }
    }
};

export default resolvers;

// =================
// Utility functions
// =================

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

function InsertSkillsForUser(skills, user) {
    if (skills && skills.length > 0) {
        skills.forEach(skill => {
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
}