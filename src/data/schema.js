const typeDefs = `#graphql    
    type Skill {
        skill: String!,
        rating: Int!
    }

    type User {
        name: String!,
        company: String,
        email: String!,
        phone: String,
        skills: [Skill]
    }

    input ModifyData {
        newName: String,
        newCompany: String,
        newEmail: String,
        newPhone: String,
        newSkills: [SkillInput]
    }

    input SkillInput {
        skill: String!,
        rating: Int!
    }

    input SkillQuery {
        skill: String!,
        minRating: Int,
        maxRating: Int
    }

    input AnySkillQuery {
        minFreq: Int,
        maxFreq: Int,
        minRating: Int,
        maxRating: Int
    }

    type Query {
        allUsers(limit: Int): [User]
        getUserInfo(email: String!): User
        updateUser(email: String!, data: ModifyData): User
        getSkillsFreq(filter: [AnySkillQuery]): [Skill]
        
        getUsers(name: String, company: String, email: String, phone: String, skills: [SkillQuery]): [User]
        newUser(name: String!, company: String, email: String!, phone: String, skills: [SkillInput]): User
        deleteUser(email: String!): Boolean
    }
`;

export default typeDefs;