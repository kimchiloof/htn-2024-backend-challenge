import {db} from '../index.js'

const resolvers = {
    Query: {
        allUsers: (parent, args) => args.limit
            ? db.prepare('SELECT * FROM users LIMIT ?').all(args.limit)
            : db.prepare('SELECT * FROM users').all(),
    },
};

export default resolvers;