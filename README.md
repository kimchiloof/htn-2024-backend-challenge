## HTN 2024 BackEnd Challenge

## 🌐 API Documentation

<details>
  <summary>Main Types</summary>
  <br/>
  
  ```gql
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
  ```
</details>

### Queries

<details>
  <summary>All Users</summary>
  <br/>

  ```gql
  # allUsers
  # - limit: the maximum number of responses
  # - returns: a list of all User in the database
  allUsers(limit: Int): [User]
  ```

Example:
```gql
query ExampleQuery {
  allUsers(limit: 3) {
    name
    company
    email
    phone
    skills {
      skill
      rating
    }
  }
}
```
</details>

<details>
  <summary>Get User Info</summary>
  <br/>

  ```gql
  # getUserInfo
  # - email (required): the email of the user requested
  # - returns: the corresponding User or null
  getUserInfo(email: String!): User 
  ```

Example:
```gql
query ExampleQuery {
  getUserInfo(email: "lorettabrown@example.net") {
    name
    company
    email
    phone
    skills {
      skill
      rating
    }
  }
}
```
</details>

<details>
  <summary>Get Skills By Frequency</summary>
  <br/>

  ```gql
  # getSkillsFreq
  # - limit: the maximum number of responses
  # - filter (required): specified range for requested skills
  # - returns: a list of all skills and their frequencies that match the given filter
  getSkillsFreq(limit: Int, filter: SkillFreqQuery!): [SkillFreq]

  # SkillFreqQuery
  # - min_freq: the minimum frequency a skill can have to match, inclusive
  # - max_freq: the maximum frequency a skill can have to match, inclusive
  input SkillFreqQuery {
      min_freq: Int,
      max_freq: Int
  }

  # SkillFreq
  # - skill (required): the name of this skill
  # - freq (required): the number of users who have this skill
  type SkillFreq {
      skill: String!,
      freq: Int!
  }
  ```

Example:
```gql
query ExampleQuery {
  getSkillsFreq(limit: 4, filter: {min_freq: 5}) {
    skill
    freq
  }
}
```
</details>

<details>
  <summary>Get Users</summary>
  <br/>

  ```gql
  # getUsers
  # - limit: the maximum number of responses
  # - name: must be exact match
  # - company: must be exact match
  # - email: must be exact match
  # - phone: must be exact match
  # - skills: a list of SkillQuery to filter for
  # - returns: a list of User which match all given filters
  getUsers(limit: Int, name: String, company: String, email: String, phone: String, skills: [SkillQuery]): [User]

  # SkillQuery
  # - skill (required): the skill to filter for
  # - min_rating: the minimum rating a skill can have to match, inclusive
  # - max_rating: the maximum rating a skill can have to match, inclusive
  input SkillQuery {
      skill: String!,
      min_rating: Int,
      max_rating: Int
  }
  ```

Example:
```gql
query ExampleQuery {
  getUsers(limit: 4, company: "Jackson Ltd", skills: {skill: "Swift", max_rating: 5}) {
    name
    company
    email
    phone
    skills {
      skill
      rating
    }
  }
}
```
</details>

### Mutations

<details>
  <summary>New User</summary>
  <br/>

  ```gql
  # newUser
  # - data (required): the information of the new user
  # - returns: the inserted user, or null if failed
  newUesr(data: User!): User
  ```

Example:
```gql
mutation ExampleMutation {
  newUser(data: {name: "John Doe the Third", email: "john@doethird.com", skills: [{skill: "C", rating: 2}}]) {
    name
    company
    email
    phone
    skills {
      rating
      skill
    }
  }
}
```
</details>

<details>
  <summary>Update User</summary>
  <br/>

  ```gql
  # updateUser
  # - email (required): the email of the user to edit
  # - data: the new information to overwrite with (name and email are not required here)
  # - returns: the edited user, or null if not found
  updateUser(email: String!, data: User): User
  ```

Example:
```gql
mutation ExampleMutation {
  updateUser(email: "john@doethird.com", data: {name: "John Barry", skills: [{skill: "C", rating: 4}, {skill: "Fortran", rating: 1}]}) {
    name
    company
    email
    phone
    skills {
      rating
      skill
    }
  }
}
```
</details>

<details>
  <summary>Delete User</summary>
  <br/>

  ```gql
  # deleteUser
  # - email (required): the email of the user to delete
  # - returns: the success value of the deletion (true/false)
  deleteUser(email: String!): Boolean!
  ```

Example:
```gql
mutation ExampleMutation {
  deleteUser(email: "john@doethirdfourth.com")
}
```
</details>

## 🧰 Built with

- [Node.js](https://nodejs.org/en/)
- [Express.js](https://expressjs.com/)
- ApolloGraphQL's [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [Better SQLite3](https://www.npmjs.com/package/better-sqlite3)

## 🏗️ Build Instructions

1. Clone the repository
2. Navigate to project directory
3. Install dependencies
4. **Create the database** - either via `npm run create-database` or (IDE permitting) from the script in package.json
5. Start the application

```bash
git clone https://github.com/kimchiloof/htn-2024-backend-challenge.git
cd htn-2024-backend-challenge
npm install
npm run create-database
npm start
```
