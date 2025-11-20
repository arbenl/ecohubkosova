# MCP Servers Integration Guide

## 🎯 Overview

Your EcoHub Kosova project now has **two powerful MCP servers** integrated:

### 1. **MCP Context Server** (`mcp-context-server`)
- **Purpose**: Intelligent code understanding and search
- **Location**: `/Users/arbenlila/development/mcp-context-server`
- **Use for**: Natural language code queries, architecture analysis, refactoring suggestions

### 2. **EcoHub QA Server** (`ecohub-qa`)
- **Purpose**: Comprehensive QA audits and diagnostics
- **Location**: `tools/ecohub-qa/`
- **Use for**: Security audits, build health, performance analysis, testing orchestration

## 🚀 Integration Status

### ✅ **Configuration Complete**
Both servers are configured in `.vscode/mcp.json`:
```json
{
  "mcpServers": {
    "mcp-context-server": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "/Users/arbenlila/development/mcp-context-server"
    },
    "ecohub-qa": {
      "command": "node",
      "args": ["tools/ecohub-qa/dist/index.js"],
      "cwd": "/Users/arbenlila/development/ecohubkosova"
    }
  }
}
```

### ✅ **Auto-Start Enabled**
Both servers start automatically via `.vscode/tasks.json` when you open the workspace.

## 💬 How to Use Both Servers

### **Context Server Queries** (Natural Language)
```
"Show me all authentication-related files"
"How does the user registration work?"
"Find components that handle form validation"
"Suggest improvements for this database query"
```

### **QA Server Queries** (Specific Audits)
```
"Run auth_audit and show me critical security issues"
"Check build_health before deployment"
"Audit CSP configuration and propose fixes"
"Run all security audits (auth, csp, supabase)"
"Check test coverage and show low-coverage areas"
```

## 🛠️ QA Server Tools Overview

### **Security & Auth**
- `auth_audit` - Authentication flow security analysis
- `csp_audit` - Content Security Policy validation
- `supabase_health` - Database configuration checks

### **Quality & Build**
- `build_health` - ESLint, TypeScript, build checks
- `dependency_audit` - Package security and updates
- `performance_audit` - Bundle size and optimization

### **Testing & Coverage**
- `tests_orchestrator` - Run all test suites
- `coverage_audit` - Test coverage analysis
- `runtime_log_scan` - Error log analysis

### **Architecture & UX**
- `navigation_audit` - Route protection analysis
- `accessibility_audit` - A11y compliance checks
- `i18n_audit` - Internationalization completeness

### **Environment**
- `env_audit` - Environment variable validation

## 🎯 Combined Usage Examples

### **Pre-Deployment Checklist**
```
"Run build_health, dependency_audit, and supabase_health. Is production ready?"
```

### **Security Review**
```
"Run auth_audit, csp_audit, and accessibility_audit for the user dashboard"
```

### **Performance Optimization**
```
"Check performance_audit and coverage_audit, then suggest improvements"
```

### **Full QA Suite**
```
"Run all audits and create a comprehensive quality report"
```

## 🔄 Workflow Integration

### **Daily Development**
1. **Morning**: Context Server - "What did I work on yesterday?"
2. **Planning**: QA Server - "Check for any critical issues"
3. **Implementation**: Context Server - "Show me similar patterns"
4. **Testing**: QA Server - "Run tests_orchestrator"

### **Code Reviews**
1. **Security**: "Run auth_audit on new authentication code"
2. **Quality**: "Check build_health and dependency_audit"
3. **Performance**: "Audit performance_audit for new features"

### **Deployment**
1. **Pre-deploy**: "Run all security and quality audits"
2. **Health check**: "Verify supabase_health and env_audit"
3. **Post-deploy**: "Scan runtime_log_scan for new errors"

## 📊 Understanding Outputs

### **Context Server Responses**
- File locations and code snippets
- Architecture explanations
- Refactoring suggestions
- Pattern analysis

### **QA Server Responses**
Structured format:
```
✅ TOOL_NAME
==================================================
Status: SUCCESS | WARNING | ERROR
Time: 2024-11-17T10:30:00.000Z

Findings (N):
🔴 CRITICAL (X) - Issues requiring immediate attention
🟠 HIGH (Y) - Important issues
🟡 MEDIUM (Z) - Should be addressed
🔵 LOW - Minor issues
ℹ️ INFO - Informational findings
```

## 🚨 Troubleshooting

### **Server Not Starting**
```bash
# Check if servers are running
ps aux | grep mcp

# Manual start
cd /Users/arbenlila/development/mcp-context-server && npm run dev
cd tools/ecohub-qa && npm run dev
```

### **Queries Not Working**
- Ensure both servers show "running on stdio" in terminals
- Try restarting VS Code
- Check `.vscode/mcp.json` configuration

### **Build Issues**
```bash
# Rebuild servers if needed
cd /Users/arbenlila/development/mcp-context-server && npm run build
cd tools/ecohub-qa && npm run build
```

## 🎯 Best Practices

### **Use the Right Tool for the Job**
- **Understanding code**: Context Server
- **Quality assurance**: QA Server
- **Security reviews**: Both servers
- **Performance analysis**: QA Server tools

### **Efficient Queries**
- **Be specific**: "Audit authentication in login component" vs "Check auth"
- **Combine related tools**: "Run auth_audit and navigation_audit together"
- **Use before critical actions**: Always run audits before deployment

### **Regular Maintenance**
- **Daily**: Quick health checks with QA server
- **Weekly**: Full audit suite
- **Pre-deploy**: Comprehensive quality review

## 🚀 Advanced Integration

### **Custom Workflows**
Create VS Code tasks for common audit combinations:
```json
{
  "label": "Security Audit",
  "command": "echo 'Run auth_audit, csp_audit, supabase_health'"
}
```

### **CI/CD Integration**
The QA server tools can be integrated into CI pipelines for automated quality gates.

### **Team Collaboration**
- Share audit results in pull requests
- Use Context Server for code walkthroughs
- Establish quality standards based on audit findings

---

## 🎉 You're All Set!

Both MCP servers are now fully integrated and will start automatically. You have access to:

- **Intelligent code assistance** via Context Server
- **Comprehensive quality assurance** via QA Server
- **Automated startup** on workspace open
- **Natural language interaction** for both

Try asking: *"Show me the authentication architecture and run a security audit"* to see both servers working together! 🚀