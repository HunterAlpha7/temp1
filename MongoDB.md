# MongoDB Implementation Guide for Blog Project (This is the showcase version of Projekt1)

## Table of Contents
1. [What is MongoDB?](#what-is-mongodb)
2. [Project Overview](#project-overview)
3. [MongoDB Setup & Configuration](#mongodb-setup--configuration)
4. [Data Models (Schemas)](#data-models-schemas)
5. [Database Operations (CRUD)](#database-operations-crud)
6. [Relationships & References](#relationships--references)
7. [Advanced MongoDB Features Used](#advanced-mongodb-features-used)
8. [Error Handling & Best Practices](#error-handling--best-practices)
9. [Common Issues & Improvements](#common-issues--improvements)
10. [MongoDB vs SQL Comparison](#mongodb-vs-sql-comparison)

---

## What is MongoDB?

MongoDB is a **NoSQL document database** that stores data in flexible, JSON-like documents called BSON (Binary JSON). Unlike traditional SQL databases that use tables and rows, MongoDB uses collections and documents.

### Key Concepts:
- **Database**: A container for collections (like a folder)
- **Collection**: A group of documents (like a table in SQL)
- **Document**: A record in a collection (like a row in SQL)
- **Field**: A key-value pair in a document (like a column in SQL)

---

## Project Overview

This blog project uses MongoDB to store:
1. **Users** - User accounts with authentication
2. **Blogs** - Blog posts created by users
3. **Relationships** - Users can have multiple blogs, blogs belong to users

### Project Structure:
```
├── config/
│   └── db.js          # MongoDB connection setup
├── models/
│   ├── userModel.js   # User schema definition
│   └── blogModel.js   # Blog schema definition
├── controllers/
│   ├── userController.js  # User operations
│   └── blogController.js  # Blog operations
└── routes/
    ├── userRoutes.js      # User API endpoints
    └── blogRoutes.js      # Blog API endpoints
```

---

## MongoDB Setup & Configuration

### 1. Dependencies
The project uses **Mongoose** (an ODM - Object Document Mapper) to interact with MongoDB:

```json
"dependencies": {
  "mongoose": "^8.5.2"
}
```

### 2. Database Connection (`config/db.js`)

```javascript
const mongoose = require("mongoose");

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log(`Connected to MongoDB Database. Database address:${mongoose.connection.host}`);
    }
    catch(error){
        console.log(`MONGO connect Error. ${error}`);
    }
};
```

**Key Points:**
- Uses environment variable `MONGO_URL` for connection string
- Async/await pattern for connection handling
- Error handling with try-catch
- Connection string format: `mongodb://localhost:27017/database_name` or MongoDB Atlas URL

### 3. Connection in Server (`server.js`)

```javascript
const connectDB = require('./config/db.js');
// MongoDB connection
connectDB();
```

---

## Data Models (Schemas)

### 1. User Model (`models/userModel.js`)

```javascript
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Just put any of the name']
    },
    email: {
        type: String,
        required: [true, 'Get that e-mail in']
    },
    password: {
        type: String,
        required: [true, 'Need to fill the secret words']
    },
    blogs: [{
        type: mongoose.Types.ObjectId,
        ref: "Blog",
    }],
}, {
    timestamps: true
})
```

**Schema Features:**
- **Field Types**: String for text data
- **Validation**: `required` with custom error messages
- **References**: Array of ObjectIds referencing Blog documents
- **Timestamps**: Automatically adds `createdAt` and `updatedAt` fields

### 2. Blog Model (`models/blogModel.js`)

```javascript
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        require: [true, 'title is required']
    },
    description: {
        type: String,
        required: [true, 'description is required']
    },
    image: {
        type: String,
        required: [true, '2 or more image is required.']
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        require: [true, "UserID required"],
    }
}, {timestamps: true})
```

**Schema Features:**
- **ObjectId Reference**: Links to User document
- **Validation**: All fields are required
- **Timestamps**: Automatic creation/update tracking

---

## Database Operations (CRUD)

### 1. Create Operations

#### User Registration (`userController.js`)
```javascript
const user = new userModel({username, email, password:hashedPassword})
await user.save()
```

#### Blog Creation (`blogController.js`)
```javascript
const newBlog = new blogModel({
    title, description, image, user
});
await newBlog.save({session});
```

### 2. Read Operations

#### Find All Users
```javascript
const users = await userModel.find({})
```

#### Find All Blogs with User Data (Population)
```javascript
const blogs = await blogModel.find({}).populate("user");
```

#### Find Single Document
```javascript
const user = await userModel.findOne({email})
const blog = await blogModel.findById(id)
```

### 3. Update Operations

#### Update Blog
```javascript
const blog = await blogModel.findByIdAndUpdate(
    id,
    {...req.body},
    {new: true}
);
```

### 4. Delete Operations

#### Delete Blog
```javascript
const blog = await blogModel.findByIdAndDelete(req.params.id)
```

---

## Relationships & References

### 1. One-to-Many Relationship
- **One User** can have **Many Blogs**
- **One Blog** belongs to **One User**

### 2. Reference Implementation

#### User Model (Parent)
```javascript
blogs: [{
    type: mongoose.Types.ObjectId,
    ref: "Blog",
}]
```

#### Blog Model (Child)
```javascript
user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    require: [true, "UserID required"],
}
```

### 3. Database Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│      User       │         │      Blog       │
├─────────────────┤         ├─────────────────┤
│ _id: ObjectId   │◄────────┤ _id: ObjectId   │
│ username: String│         │ title: String   │
│ email: String   │         │ description: Str│
│ password: String│         │ image: String   │
│ blogs: [ObjectId]│────────►│ user: ObjectId  │
│ createdAt: Date │         │ createdAt: Date │
│ updatedAt: Date │         │ updatedAt: Date │
└─────────────────┘         └─────────────────┘
        │                           │
        │                           │
        └─────── One-to-Many ───────┘
        (One User has Many Blogs)
        (One Blog belongs to One User)
```

### 3. Population (Joining Data)
```javascript
// Get blogs with user information
const blogs = await blogModel.find({}).populate("user");

// Get user with all their blogs
const userBlog = await userModel.findById(req.params.id).populate("blogs");
```

---

## Advanced MongoDB Features Used

### 1. Transactions (`blogController.js`)
```javascript
const session = await mongoose.startSession();
session.startTransaction();
await newBlog.save({session});
existingUser.blogs.push(newBlog);
await existingUser.save({session});
await session.commitTransaction();
```

**Why Transactions?**
- Ensures data consistency when updating multiple documents
- If any operation fails, all changes are rolled back
- Critical for maintaining referential integrity

### 2. Array Operations
```javascript
// Add blog to user's blogs array
existingUser.blogs.push(newBlog);

// Remove blog from user's blogs array
await blog.user.blogs.pull(blog);
```

### 3. Timestamps
```javascript
{timestamps: true}
```
Automatically adds:
- `createdAt`: When document was created
- `updatedAt`: When document was last modified

---

## Error Handling & Best Practices

### 1. Try-Catch Blocks
Every database operation is wrapped in try-catch for error handling:

```javascript
try {
    const user = await userModel.findOne({email})
    // ... operations
} catch(error) {
    console.log(error);
    return res.status(500).send({
        message: 'Error in Register callback',
        success: false,
        error
    })
}
```

### 2. Validation
- Schema-level validation with custom error messages
- Application-level validation before database operations
- Duplicate checking (e.g., email uniqueness)

### 3. Response Patterns
Consistent API response structure:
```javascript
{
    success: true/false,
    message: "Description",
    data: {...} // optional
}
```

---

## Common Issues & Improvements

### 1. Issues Found in Current Code

#### Typo in Schema
```javascript
// ❌ Wrong
require: [true, 'title is required']

// ✅ Correct
required: [true, 'title is required']
```

#### Duplicate Save Operation
```javascript
// ❌ In blogController.js - line 67
await newBlog.save(); // This is redundant after transaction
```

#### Inconsistent Error Status Codes
```javascript
// ❌ Wrong status code
return res.status(2201).send({...}) // 2201 is not a valid HTTP status
```

### 2. Recommended Improvements

#### 1. Add Indexes for Performance
```javascript
// In userModel.js
userSchema.index({ email: 1 }); // Unique index for email
userSchema.index({ username: 1 }); // Index for username searches

// In blogModel.js
blogSchema.index({ user: 1 }); // Index for user-based queries
blogSchema.index({ createdAt: -1 }); // Index for sorting by date
```

#### 2. Add Email Validation
```javascript
email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
}
```

#### 3. Add Password Strength Validation
```javascript
password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
}
```

#### 4. Environment Variables
Create a `.env` file:
```env
MONGO_URL=mongodb://localhost:27017/blog_app
PORT=8080
DEV_MODE=development
```

#### 5. Add Data Validation Middleware
```javascript
// Add to blogController.js
const validateBlogData = (req, res, next) => {
    const { title, description, image } = req.body;
    if (!title || title.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: 'Title must be at least 3 characters long'
        });
    }
    next();
};
```

---

## MongoDB vs SQL Comparison

| Feature | MongoDB (NoSQL) | SQL Database |
|---------|----------------|--------------|
| **Data Structure** | Documents (JSON-like) | Tables with rows/columns |
| **Schema** | Flexible (Schema-less) | Fixed schema |
| **Relationships** | References/Embedding | Foreign keys/Joins |
| **Query Language** | JavaScript-like queries | SQL |
| **Scaling** | Horizontal (sharding) | Vertical (bigger servers) |
| **ACID Transactions** | Limited (recently improved) | Full ACID support |

### Example Query Comparison

#### SQL (MySQL/PostgreSQL)
```sql
SELECT b.title, b.description, u.username 
FROM blogs b 
JOIN users u ON b.user_id = u.id 
WHERE u.email = 'user@example.com';
```

#### MongoDB (with Mongoose)
```javascript
const blogs = await blogModel.find({})
    .populate('user', 'username')
    .where('user.email').equals('user@example.com');
```

---

## Key Takeaways for Your Team

### 1. **MongoDB is Document-Based**
- Data is stored as JSON-like documents
- No need to define rigid table structures
- Easy to add new fields without migrations

### 2. **Mongoose is Your Friend**
- Provides schema validation
- Handles relationships between documents
- Offers middleware and hooks
- Converts JavaScript objects to MongoDB documents

### 3. **Relationships Work Differently**
- Use `ObjectId` references instead of foreign keys
- Use `populate()` instead of JOINs
- Can embed documents or reference them

### 4. **Performance Considerations**
- Add indexes for frequently queried fields
- Use transactions for multi-document operations
- Consider data modeling for your query patterns

### 5. **Error Handling is Critical**
- Always wrap database operations in try-catch
- Validate data before saving
- Provide meaningful error messages

---

## Next Steps for Learning

1. **Practice with MongoDB Compass** - Visual database browser
2. **Learn Aggregation Pipeline** - For complex data processing
3. **Study Indexing Strategies** - For performance optimization
4. **Explore MongoDB Atlas** - Cloud database service
5. **Understand Replication & Sharding** - For scaling

---

## Quick Reference

### Common MongoDB Operations in This Project

| Operation | Method | Example |
|-----------|--------|---------|
| **Create** | `new Model()` + `save()` | `const user = new userModel(data); await user.save()` |
| **Read All** | `find({})` | `await userModel.find({})` |
| **Read One** | `findOne()` or `findById()` | `await userModel.findOne({email})` |
| **Update** | `findByIdAndUpdate()` | `await blogModel.findByIdAndUpdate(id, data)` |
| **Delete** | `findByIdAndDelete()` | `await blogModel.findByIdAndDelete(id)` |
| **Populate** | `populate()` | `await blogModel.find({}).populate("user")` |

### File Locations

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **Database Connection** | `config/db.js` | MongoDB connection setup |
| **User Schema** | `models/userModel.js` | User data structure |
| **Blog Schema** | `models/blogModel.js` | Blog data structure |
| **User Operations** | `controllers/userController.js` | User CRUD operations |
| **Blog Operations** | `controllers/blogController.js` | Blog CRUD operations |
| **User Routes** | `routes/userRoutes.js` | User API endpoints |
| **Blog Routes** | `routes/blogRoutes.js` | Blog API endpoints |

### Environment Variables Needed

```env
MONGO_URL=mongodb://localhost:27017/blog_app
PORT=8080
DEV_MODE=development
```

---

*This guide covers the MongoDB implementation in your blog project. Use it to explain concepts to your team and as a reference for future development.*
