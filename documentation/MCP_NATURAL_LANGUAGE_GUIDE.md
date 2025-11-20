# MCP Context Server - Natural Language Usage Guide

## 🎯 Overview

The MCP (Model Context Protocol) Context Server enhances your development experience by providing intelligent, context-aware assistance through natural language interactions. This guide shows you how to effectively communicate with the server using conversational prompts.

## 🚀 Getting Started

### Prerequisites
- MCP Context Server is running (automatically starts with your workspace)
- VS Code or compatible IDE with MCP integration
- Your project codebase is accessible

### Basic Interaction
The server understands natural language queries about your codebase. Instead of technical commands, you can ask questions like:

> "Show me all the authentication-related files"
> "How does the user registration work?"
> "Find components that handle form validation"

## 📋 Query Categories & Examples

### 1. 🔍 Code Discovery & Search

**Find specific files or components:**
```
"Where can I find the user profile component?"
"Show me all API route handlers"
"Find files related to payment processing"
```

**Search for patterns:**
```
"Which files use the Supabase client?"
"Show me all database queries in the project"
"Find components that handle user input"
```

### 2. 🏗️ Architecture Analysis

**Understand project structure:**
```
"How is the application organized?"
"Show me the main data flow"
"What's the relationship between these components?"
```

**Component relationships:**
```
"How does the authentication system work?"
"Show me how data flows from login to dashboard"
"Which services depend on the database?"
```

### 3. 🔧 Code Analysis & Refactoring

**Code quality insights:**
```
"Are there any unused imports in this file?"
"Suggest improvements for this function"
"How can I optimize this database query?"
```

**Refactoring assistance:**
```
"How should I restructure this component?"
"Show me similar patterns in the codebase"
"What would be a better way to organize this code?"
```

### 4. 🐛 Debugging & Troubleshooting

**Error analysis:**
```
"Why is this test failing?"
"Help me debug this authentication issue"
"What's causing this performance problem?"
```

**Issue investigation:**
```
"Find where this error is being thrown"
"Show me all places that call this function"
"Who uses this API endpoint?"
```

### 5. 📚 Documentation & Learning

**Code understanding:**
```
"Explain how this feature works"
"What does this function do?"
"Show me examples of how to use this service"
```

**Project knowledge:**
```
"How do I add a new user role?"
"What's the deployment process?"
"Where are the environment configurations?"
```

## 💡 Best Practices for Effective Queries

**Test coverage:**
```
"Which parts of the app aren't tested?"
"Show me the test files for this component"
"How can I test this API endpoint?"
```

**Quality checks:**
```
"Are there any security vulnerabilities?"
"Find potential performance issues"
"Show me code that might need refactoring"
```

## 💡 Best Practices for Effective Queries

### Be Specific but Conversational
❌ "Show files"
✅ "Show me all the React components in the user dashboard"

### Use Context from Your Current Work
❌ "Find the bug"
✅ "Find the bug in the login form that prevents users from signing in"

### Ask Follow-up Questions
After getting results, you can ask:
- "Show me more details about this function"
- "How does this relate to the other components?"
- "What would be the best way to modify this?"

### Combine Multiple Concerns
```
"Show me the authentication flow and suggest any security improvements"
"Find all database operations and check if they're properly error-handled"
```

## 🎨 Advanced Query Techniques

### Contextual Queries
```
"In the context of user management, show me all related files"
"Considering the current architecture, how should I implement this feature?"
```

### Comparative Analysis
```
"Compare how authentication is handled in different parts of the app"
"Show me the differences between these two similar components"
```

### Process-Oriented Questions
```
"Walk me through the user registration process"
"Explain the data flow from frontend to database"
```

## 🔧 Troubleshooting Common Issues

### Query Not Understood
- **Rephrase**: Try saying the same thing differently
- **Be more specific**: Add context about what you're working on
- **Break it down**: Ask smaller, focused questions

### Too Many Results
- **Narrow scope**: "Show me authentication files in the components folder"
- **Specify type**: "Find TypeScript files that handle API calls"
- **Add constraints**: "Show me the 5 most important database models"

### Results Not Relevant
- **Provide context**: Mention the specific feature or component you're working on
- **Use file names**: Reference specific files you know exist
- **Describe functionality**: Explain what the code should do

## 📝 Example Conversation Flow

```
You: "I'm working on the user profile page and need to add avatar upload"

MCP: Shows profile-related files and upload components

You: "How does the current avatar display work?"

MCP: Explains the avatar component and data flow

You: "Suggest the best way to add upload functionality"

MCP: Provides implementation suggestions based on existing patterns
```

## 🚀 Power User Tips

### Leverage Project Knowledge
The server learns from your codebase, so it can suggest:
- Consistent naming conventions
- Established architectural patterns
- Common utility functions
- Project-specific best practices

### Use Natural Language for Complex Tasks
Instead of technical commands, try:
- "Set up a new API endpoint for user preferences"
- "Create a reusable component for data tables"
- "Implement error handling for network requests"

### Ask About Best Practices
```
"What's the recommended way to handle loading states in this project?"
"How should I structure error handling for API calls?"
"What's the standard pattern for form validation here?"
```

## 🎯 Integration with Development Workflow

### Daily Development
- **Morning**: "What did I work on yesterday?" (if integrated with git)
- **Planning**: "What's the next priority feature to implement?"
- **Implementation**: "Show me examples of similar features"

### Code Reviews
- **Before**: "Review this pull request for potential issues"
- **During**: "Explain what this complex function does"
- **After**: "Suggest improvements for this implementation"

### Onboarding New Team Members
- **Architecture**: "Give me an overview of how the app is structured"
- **Features**: "Explain the main user flows"
- **Standards**: "What are the coding conventions used here?"

## 📊 Measuring Effectiveness

Track how well your queries work:
- ✅ **Clear results**: Query gave exactly what you needed
- 🔄 **Refined query**: Had to ask follow-up questions
- ❌ **Unclear results**: Got irrelevant or confusing information

Use this feedback to improve your query formulation over time.

---

## 🎉 Getting Help

If you're having trouble with natural language queries:
1. Check that the MCP server is running (look for "MCP Context Server running on stdio" in terminal)
2. Try more specific or differently worded queries
3. Break complex questions into smaller parts
4. Reference specific files or components when possible

Remember: The MCP Context Server is designed to understand your intent, so focus on what you want to accomplish rather than how to technically achieve it! 🚀

## 🎯 How to Instruct MCP Server Usage

### Direct MCP Server Commands
To explicitly tell the system to use MCP servers, include these **magic phrases**:

#### For MCP Context Server (Code Understanding):
```
"Use MCP Context Server to find all authentication files"
"Use MCP Context Server to show me database operations"
"Ask the MCP server to find error handling patterns"
"With MCP Context Server: search for Supabase usage"
```

#### For EcoHub QA Server (Quality Audits):
```
"Run auth_audit using MCP QA Server"
"Use EcoHub QA Server to check build health"
"Run accessibility_audit with MCP"
"Use MCP QA to audit CSP configuration"
```

#### Combined Usage:
```
"Use MCP servers to analyze the authentication system"
"Leverage MCP Context Server and QA Server for code review"
```

### Key Elements for MCP Instructions:
1. **Include "MCP"** - Makes it clear you want MCP server usage
2. **Specify Server Type** - "Context Server" or "QA Server"/"EcoHub"
3. **Be Specific** - What do you want to find/audit?

### Practical Examples:
- **Code Search**: `"Use MCP Context Server to find all Supabase database calls"`
- **Security Audit**: `"Run auth_audit using MCP QA Server"`
- **Build Check**: `"Use EcoHub QA Server to check build health"`
- **Combined**: `"Use MCP servers to analyze the entire authentication system"`

**Note**: The difference between natural language queries and explicit MCP instructions is that explicit instructions ensure the system uses MCP server capabilities rather than direct file system tools.