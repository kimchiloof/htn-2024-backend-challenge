export const typeDefs = `#graphql    
    type Skill {
        skill: String,
        rating: Int
    }

    type User {
        name: String,
        company: String,
        email: String,
        phone: String,
        skills: [Skill]
    }

    type Query {
        users: [User]
    }
`;

export const resolvers = {
    Query: {
        users: () => books,
    },
};

const books = [
    
];