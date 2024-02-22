import db from './database.js'

const resolvers = {
    Query: {
        allUsers: (parent, args) => args.limit
            ? db.prepare('SELECT * FROM users LIMIT ?').all(args.limit)
            : db.prepare('SELECT * FROM users').all(),
        getUserInfo: (parent, args) => {
            
        }
    },
};

export default resolvers;