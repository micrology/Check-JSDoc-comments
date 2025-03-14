# Check-JSDoc-comments
Utility to check whether all functions in a Javascript module/script have JSDoc comments, and report those that are missing

# Usage
```
# Scan a single file (script mode)
node check-jsdoc.js --type script myfile.js

# Scan a single file (module mode)
node check-jsdoc.js --type module myfile.js

# Scan a directory (script mode)
node check-jsdoc.js --type script mydirectory

# Scan a directory (module mode)
node check-jsdoc.js --type module mydirectory
```
# Example output
```
Scanning directory: mydirectory

File: script1.js
- processData (Line 10)

File: utils.js
- helperFunction (Line 5)
```
