# Whitelist Management Script

This script helps you manage the user whitelist for the application. It can add, remove, and list whitelist entries.

## Usage

### Interactive Mode
Run the script without arguments to enter interactive mode:

```bash
node scripts/add-to-whitelist.js
```

This will show a menu with options:
1. Add single entry
2. Add from file
3. List all entries
4. Remove entry
5. Exit

### Command Line Mode

#### Add Single Entry
```bash
# Add by email only
node scripts/add-to-whitelist.js add user@example.com

# Add by email and Twitter ID
node scripts/add-to-whitelist.js add user@example.com 123456789

# Add by Twitter ID only
node scripts/add-to-whitelist.js add "" 123456789
```

#### Add Multiple Entries from File
```bash
node scripts/add-to-whitelist.js file scripts/whitelist-sample.csv
```

The file format should be CSV with the following structure:
```csv
# Comments start with #
email,twitterId
john@example.com,123456789
jane@example.com,
,987654321
```

- Lines starting with `#` are comments and will be ignored
- Empty lines are ignored
- You can have entries with just email, just Twitter ID, or both
- If you want to add only a Twitter ID, leave the email field empty

#### List All Entries
```bash
node scripts/add-to-whitelist.js list
```

#### Remove Entry
```bash
# Remove by email
node scripts/add-to-whitelist.js remove user@example.com

# Remove by Twitter ID
node scripts/add-to-whitelist.js remove 123456789
```

### Batch Mode (Separate Lists)

Maintain two simple newline-delimited list files (comments starting with `#` are allowed):

```bash
# emails list (one per line)
scripts/whitelist-emails.txt
# twitter IDs list (one per line)
scripts/whitelist-twitter-ids.txt
```

Run batch import:

```bash
node scripts/add-to-whitelist.js batch --emails scripts/whitelist-emails.txt --twitter scripts/whitelist-twitter-ids.txt
```

- You can pass just one of the flags if you only want to import emails or Twitter IDs
  - Example (emails only):
    ```bash
    node scripts/add-to-whitelist.js batch --emails scripts/whitelist-emails.txt
    ```
  - Example (twitter only):
    ```bash
    node scripts/add-to-whitelist.js batch --twitter scripts/whitelist-twitter-ids.txt
    ```

Note: Entries are deactivated rather than deleted, so they can be reactivated if needed.

## Examples

### Adding a single user
```bash
node scripts/add-to-whitelist.js add john@example.com
```

### Adding multiple users from a file
```bash
node scripts/add-to-whitelist.js file users-to-whitelist.csv
```

### Checking current whitelist
```bash
node scripts/add-to-whitelist.js list
```

### Removing a user
```bash
node scripts/add-to-whitelist.js remove john@example.com
```

## File Format

Create a CSV file with the following format:

```csv
# Whitelist entries
# Format: email,twitterId
john@example.com,123456789
jane@example.com,
,987654321
admin@company.com,555666777
```

## Notes

- Email addresses are validated for proper format
- Twitter IDs must be numeric
- Duplicate entries will be rejected
- The script uses the same database connection as the main application
- Make sure your `.env` file has the correct `DATABASE_URL` configured
