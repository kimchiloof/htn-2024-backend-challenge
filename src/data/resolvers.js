import db from './database.js'
import {getSkillsByUserId, getUserByEmail} from "./data-utils.js";

const resolvers = {
    Query: {
        allUsers: (parent, args) => args.limit
            ? db.prepare('SELECT * FROM users LIMIT ?').all(args.limit)
            : db.prepare('SELECT * FROM users').all(),
        
        getUserInfo: (parent, args) => {
            const user = getUserByEmail.get(args.email);
            
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
    },
};

export default resolvers;