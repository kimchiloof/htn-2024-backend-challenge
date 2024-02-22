const typeDefs = `#graphql    
    type Skill {
        skill: String!,
        rating: Int!
    }

    type SkillFreq {
        skill: String!,
        freq: Int!
    }
    
    type User {
        name: String!,
        company: String,
        email: String!,
        phone: String,
        skills: [Skill]
    }
    
    input ModifyData {
        name: String,
        company: String,
        email: String,
        phone: String,
        skills: [SkillInput]
    }
    
    input SkillInput {
        skill: String!,
        rating: Int!
    }
    
    input SkillQuery {
        skill: String!,
        min_rating: Int,
        max_rating: Int
    }
    
    input SkillFreqQuery {
        min_freq: Int,
        max_freq: Int
    }
    
    type Query {
        allUsers(limit: Int): [User]
        getUserInfo(email: String!): User
        updateUser(email: String!, data: ModifyData): User
        getSkillsFreq(filter: SkillFreqQuery!): [SkillFreq]
    
        getUsers(name: String, company: String, email: String, phone: String, skills: [SkillQuery]): [User]
        newUser(name: String!, company: String, email: String!, phone: String, skills: [SkillInput]): User
        deleteUser(email: String!): Boolean
    }
`;

export default typeDefs;