const typeDefs = `#graphql
    # User
    # - name (required): user's name
    # - company: user's company
    # - email (required, unique): user's email, associated with account
    # - phone: user's phone number
    # - skills: a list of Skill the user has
    type User {
        name: String!,
        company: String,
        email: String!,
        phone: String,
        skills: [Skill]
    }

    # Skill
    # - skill: the name of this skill
    # - rating: the user's proficiency in this skill
    type Skill {
        skill: String!,
        rating: Int!
    }
    
    # SkillFreq
    # - skill: the name of this skill
    # - freq: the number of users who have this skill
    type SkillFreq {
        skill: String!,
        freq: Int!
    }
    
    # Input data for a new User
    input NewUser {
        name: String!,
        company: String,
        email: String!,
        phone: String,
        skills: [NewSkill]
    }

    # Input data for editing an existing User
    input ModifyUser {
        name: String,
        company: String,
        email: String,
        phone: String,
        skills: [NewSkill]
    }
    
    # Input data for editing or for a new Skill
    input NewSkill {
        skill: String!,
        rating: Int!
    }
    
    # Query for a Skill with a rating within a specified range
    input SkillQuery {
        skill: String!,
        min_rating: Int,
        max_rating: Int
    }
    
    # Query for a Skill with a freq within a specified range
    input SkillFreqQuery {
        min_freq: Int,
        max_freq: Int
    }

    type Query {
        allUsers(limit: Int): [User]
        getUserInfo(email: String!): User
        getSkillsFreq(limit: Int, filter: SkillFreqQuery!): [SkillFreq]
    
        getUsers(limit: Int, name: String, company: String, email: String, phone: String, skills: [SkillQuery]): [User]
    }
    
    type Mutation {
        updateUser(email: String!, data: ModifyUser): User
        newUser(data: NewUser!): User
        deleteUser(email: String!): Boolean!
    }
`;

export default typeDefs;