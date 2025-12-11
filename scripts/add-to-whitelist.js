#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const fs = require('fs');

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate Twitter ID (should be numeric)
function isValidTwitterId(twitterId) {
  return /^\d+$/.test(twitterId);
}

// Add single entry to whitelist
async function addToWhitelist(email, twitterId) {
  try {
    const entry = await prisma.whitelist_entries.create({
      data: {
        id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email || null,
        twitterId: twitterId || null,
        isActive: true,
        updated_at: new Date()
      }
    });

    console.log('✅ Successfully added to whitelist:');
    console.log(`   ID: ${entry.id}`);
    if (entry.email) console.log(`   Email: ${entry.email}`);
    if (entry.twitterId) console.log(`   Twitter ID: ${entry.twitterId}`);
    console.log(`   Active: ${entry.isActive}`);
    console.log(`   Created: ${entry.created_at}`);
    
    return entry;
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Error: This email or Twitter ID is already in the whitelist');
    } else {
      console.log('❌ Error adding to whitelist:', error.message);
    }
    throw error;
  }
}

// Add multiple entries from a file
async function addFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n').filter(line => line.trim());
    
    console.log(`📄 Processing ${lines.length} entries from file...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue; // Skip empty lines and comments
      
      const parts = line.split(',').map(part => part.trim());
      const email = parts[0] ? parts[0].toLowerCase() : null; // Normalize email to lowercase
      const twitterId = parts[1] || null;
      
      console.log(`\n[${i + 1}/${lines.length}] Processing: ${email || twitterId}`);
      
      try {
        await addToWhitelist(email, twitterId);
        successCount++;
      } catch (error) {
        errorCount++;
        console.log(`   ⚠️  Skipped due to error`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully added: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
  } catch (error) {
    console.log('❌ Error reading file:', error.message);
  }
}

// Read newline-delimited list file (ignoring comments and blanks)
function readListFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const items = new Set();
  data.split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    items.add(line);
  });
  return Array.from(items);
}

// Add entries from an email-only list
async function addFromEmailList(filePath) {
  const emails = readListFile(filePath);
  console.log(`\n📄 Processing ${emails.length} emails from ${filePath}...`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i].toLowerCase(); // Normalize email to lowercase
    console.log(`\n[${i + 1}/${emails.length}] Email: ${email}`);
    if (!isValidEmail(email)) {
      console.log('   ❌ Skipped: invalid email format');
      errorCount++;
      continue;
    }
    try {
      await addToWhitelist(email, null);
      successCount++;
    } catch {
      errorCount++;
    }
  }

  console.log(`\n📊 Email import summary:`);
  console.log(`   ✅ Successfully added: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

// Add entries from a twitter-id-only list
async function addFromTwitterList(filePath) {
  const ids = readListFile(filePath);
  console.log(`\n📄 Processing ${ids.length} Twitter IDs from ${filePath}...`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < ids.length; i++) {
    const twitterId = ids[i];
    console.log(`\n[${i + 1}/${ids.length}] Twitter ID: ${twitterId}`);
    if (!isValidTwitterId(twitterId)) {
      console.log('   ❌ Skipped: Twitter ID must be numeric');
      errorCount++;
      continue;
    }
    try {
      await addToWhitelist(null, twitterId);
      successCount++;
    } catch {
      errorCount++;
    }
  }

  console.log(`\n📊 Twitter ID import summary:`);
  console.log(`   ✅ Successfully added: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

// Batch mode: handle two separate files
async function addFromLists(emailsPath, twitterPath) {
  if (!emailsPath && !twitterPath) {
    console.log('❌ Provide at least one of --emails or --twitter');
    return;
  }
  if (emailsPath) {
    try {
      await addFromEmailList(emailsPath);
    } catch (e) {
      console.log('❌ Failed processing emails list:', e.message);
    }
  }
  if (twitterPath) {
    try {
      await addFromTwitterList(twitterPath);
    } catch (e) {
      console.log('❌ Failed processing twitter list:', e.message);
    }
  }
}

// List current whitelist entries
async function listWhitelist() {
  try {
    const entries = await prisma.whitelist_entries.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`\n📋 Current whitelist entries (${entries.length} total):`);
    console.log('─'.repeat(80));
    
    if (entries.length === 0) {
      console.log('   No entries found');
      return;
    }
    
    entries.forEach((entry, index) => {
      console.log(`${index + 1}. ID: ${entry.id}`);
      if (entry.email) console.log(`   Email: ${entry.email}`);
      if (entry.twitterId) console.log(`   Twitter ID: ${entry.twitterId}`);
      console.log(`   Active: ${entry.isActive ? '✅' : '❌'}`);
      console.log(`   Created: ${entry.created_at.toISOString()}`);
      console.log('─'.repeat(40));
    });
    
  } catch (error) {
    console.log('❌ Error listing whitelist:', error.message);
  }
}

// Remove entry from whitelist
async function removeFromWhitelist(identifier) {
  try {
    // Try to find by email first, then by Twitter ID
    let entry = await prisma.whitelist_entries.findFirst({
      where: {
        OR: [
          { email: identifier },
          { twitterId: identifier }
        ]
      }
    });
    
    if (!entry) {
      console.log('❌ No whitelist entry found with that email or Twitter ID');
      return;
    }
    
    // Deactivate instead of deleting
    await prisma.whitelist_entries.update({
      where: { id: entry.id },
      data: {
        isActive: false,
        updated_at: new Date()
      }
    });
    
    console.log('✅ Successfully deactivated whitelist entry:');
    console.log(`   ID: ${entry.id}`);
    if (entry.email) console.log(`   Email: ${entry.email}`);
    if (entry.twitterId) console.log(`   Twitter ID: ${entry.twitterId}`);
    
  } catch (error) {
    console.log('❌ Error removing from whitelist:', error.message);
  }
}

// Main function
async function main() {
  console.log('🔐 Whitelist Management Script');
  console.log('=============================\n');
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Interactive mode
    console.log('Choose an option:');
    console.log('1. Add single entry');
    console.log('2. Add from file');
    console.log('3. List all entries');
    console.log('4. Remove entry');
    console.log('5. Exit');
    
    const choice = await askQuestion('\nEnter your choice (1-5): ');
    
    switch (choice) {
      case '1':
        await addSingleEntry();
        break;
      case '2':
        await addFromFilePrompt();
        break;
      case '3':
        await listWhitelist();
        break;
      case '4':
        await removeEntryPrompt();
        break;
      case '5':
        console.log('👋 Goodbye!');
        break;
      default:
        console.log('❌ Invalid choice');
    }
  } else {
    // Command line mode
    const command = args[0];
    
    switch (command) {
      case 'add':
        if (args.length < 2) {
          console.log('❌ Usage: node add-to-whitelist.js add <email> [twitterId]');
          process.exit(1);
        }
        const email = args[1] ? args[1].toLowerCase() : null; // Normalize email to lowercase
        const twitterId = args[2] || null;
        await addToWhitelist(email, twitterId);
        break;
        
      case 'file':
        if (args.length < 2) {
          console.log('❌ Usage: node add-to-whitelist.js file <filepath>');
          process.exit(1);
        }
        await addFromFile(args[1]);
        break;

      case 'batch': {
        // Example: node scripts/add-to-whitelist.js batch --emails scripts/whitelist-emails.txt --twitter scripts/whitelist-twitter-ids.txt
        const getFlag = (flag) => {
          const idx = args.indexOf(flag);
          if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
          return null;
        };
        const emailsPath = getFlag('--emails');
        const twitterPath = getFlag('--twitter');
        if (!emailsPath && !twitterPath) {
          console.log('❌ Usage: node add-to-whitelist.js batch [--emails <emails.txt>] [--twitter <twitter_ids.txt>]');
          process.exit(1);
        }
        await addFromLists(emailsPath, twitterPath);
        break;
      }
        
      case 'list':
        await listWhitelist();
        break;
        
      case 'remove':
        if (args.length < 2) {
          console.log('❌ Usage: node add-to-whitelist.js remove <email|twitterId>');
          process.exit(1);
        }
        await removeFromWhitelist(args[1]);
        break;
        
      default:
        console.log('❌ Unknown command. Available commands: add, file, list, remove');
        process.exit(1);
    }
  }
  
  rl.close();
  await prisma.$disconnect();
}

// Interactive functions
async function addSingleEntry() {
  console.log('\n📝 Add Single Entry');
  console.log('──────────────────');
  
  const email = await askQuestion('Email (optional): ');
  const twitterId = await askQuestion('Twitter ID (optional): ');
  
  if (!email && !twitterId) {
    console.log('❌ You must provide either an email or Twitter ID');
    return;
  }
  
  if (email && !isValidEmail(email)) {
    console.log('❌ Invalid email format');
    return;
  }
  
  if (twitterId && !isValidTwitterId(twitterId)) {
    console.log('❌ Twitter ID must be numeric');
    return;
  }
  
  // Normalize email to lowercase before adding
  const normalizedEmail = email ? email.toLowerCase() : null;
  await addToWhitelist(normalizedEmail, twitterId || null);
}

async function addFromFilePrompt() {
  const filePath = await askQuestion('\nEnter file path: ');
  await addFromFile(filePath);
}

async function removeEntryPrompt() {
  const identifier = await askQuestion('\nEnter email or Twitter ID to remove: ');
  await removeFromWhitelist(identifier);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the script
main().catch((error) => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
