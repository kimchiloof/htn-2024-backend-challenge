const typeDefs = `#graphql
    """
    A User contains its: name (required), company, email (required, unique to user), phone, list of Skill
    """
    type User {
        name: String!,
        company: String,
        email: String!,
        phone: String,
        skills: [Skill]
    }

    """
    Contains a skill (required), identifying what it is called, 
    and a rating (required) that a User has given themself for this skill
    """
    type Skill {
        skill: String!,
        rating: Int!
    }
    
    """
    A skill with the number of users that have it (frequency)
    """
    type SkillFreq {
        skill: String!,
        freq: Int!
    }
    
    """
    Input data for a new User
    """
    input NewUser {
        name: String!,
        company: String,
        email: String!,
        phone: String,
        skills: [NewSkill]
    }

    """
    Input data for editing an existing User
    """
    input ModifyUser {
        name: String,
        company: String,
        email: String,
        phone: String,
        skills: [NewSkill]
    }
    
    """
    Input data for editing or for a new Skill
    """
    input NewSkill {
        skill: String!,
        rating: Int!
    }

    """
    Query for a Skill with a rating within a specified range
    """
    input SkillQuery {
        skill: String!,
        min_rating: Int,
        max_rating: Int
    }
    
    """
    Query for a Skill with a freq within a specified range
    """
    input SkillFreqQuery {
        min_freq: Int,
        max_freq: Int
    }

    type Query {
        """
        Returns a list of all User in the database
        """
        allUsers(limit: Int): [User]
        
        """
        Returns the User corresponding to the given email, otherwise null
        """
        getUserInfo(email: String!): User
        
        """
        Returns a list of all Skill and their frequencies that match the given filter
        """
        getSkillsFreq(limit: Int, filter: SkillFreqQuery!): [SkillFreq]
    
        """
        Returns a list of User which match all given filters
        """
        getUsers(limit: Int, name: String, company: String, email: String, phone: String, skills: [SkillQuery]): [User]
    }
    
    type Mutation {
        """
        Creates a new User, returns the inserted result or null
        """
        newUser(data: NewUser!): User
        
        """
        Modifies an existing User given their email, returns the modified result or null
        """
        updateUser(email: String!, data: ModifyUser): User
        
        """
        Deletes an existing User given their email, returns the success value of the deletion
        """
        deleteUser(email: String!): Boolean!
    }
`;

export default typeDefs;