import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { WhitelistService } from "@/services/whitelistService";

interface BulkEntry {
  email?: string;
  twitterId?: string;
  twitterUsername?: string;
}

export async function POST(request: NextRequest) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type - be more permissive for CSV files
    const allowedTypes = ['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel', 'text/x-csv'];
    const fileName = file.name.toLowerCase();
    const isCsvFile = fileName.endsWith('.csv') || fileName.endsWith('.txt');
    
    if (!allowedTypes.includes(file.type) && !isCsvFile) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Please upload a CSV or text file.` },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const text = await file.text();
    console.log('File content length:', text.length);
    console.log('First 500 characters:', text.substring(0, 500));
    
    const entries = parseWhitelistFile(text);
    console.log('Parsed entries count:', entries.length);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No valid entries found in file" },
        { status: 400 }
      );
    }

    // Validate all entries before processing
    const validationErrors = validateEntries(entries);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Validation errors found", 
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // Process entries in batches
    const results = {
      total: entries.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    const batchSize = 50; // Process 50 entries at a time
    const batches = [];
    
    for (let i = 0; i < entries.length; i += batchSize) {
      batches.push(entries.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      try {
        // First, handle Twitter username lookups for the batch
        const processedBatch = await Promise.allSettled(
          batch.map(async (entry) => {
            const finalEntry = { ...entry };

            // If a username is provided but no ID, look up the ID
            if (entry.twitterUsername && !entry.twitterId) {
              try {
                const cleanUsername = entry.twitterUsername.replace(/^@/, '');
                
                const response = await fetch(`https://twitter241.p.rapidapi.com/user?username=${encodeURIComponent(cleanUsername)}`, {
                  method: 'GET',
                  headers: {
                    'x-rapidapi-key': 'ec8ed93951msh6c550dd490fdcdep15947fjsn9059555be20f',
                    'x-rapidapi-host': 'twitter241.p.rapidapi.com'
                  }
                });
                if (response.ok) {
                  const data = await response.json();
                  if (data.result?.data?.user?.result?.rest_id) {
                    finalEntry.twitterId = data.result.data.user.result.rest_id;
                  } else {
                    throw new Error('Could not find Twitter ID for username');
                  }
                } else {
                  throw new Error('Failed to lookup Twitter ID');
                }
              } catch (lookupError) {
                throw new Error(`Failed to lookup Twitter ID - ${lookupError instanceof Error ? lookupError.message : 'Unknown error'}`);
              }
            }

            return finalEntry;
          })
        );

        // Process successful entries in batch
        const successfulEntries = processedBatch
          .filter((result): result is PromiseFulfilledResult<BulkEntry> => result.status === 'fulfilled')
          .map(result => result.value);

        const failedLookups = processedBatch
          .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
          .map((result, index) => ({
            entry: batch[index],
            error: result.reason
          }));

        // Add failed lookups to results
        for (const failed of failedLookups) {
          results.failed++;
          results.errors.push(`${failed.entry.email || failed.entry.twitterUsername}: ${failed.error}`);
        }

        // Batch process successful entries
        if (successfulEntries.length > 0) {
          await WhitelistService.batchAddToWhitelist(successfulEntries);
          results.successful += successfulEntries.length;
        }

      } catch (error) {
        // If batch processing fails, fall back to individual processing
        console.warn('Batch processing failed, falling back to individual processing:', error);
        
        for (const entry of batch) {
          try {
            const finalEntry = { ...entry };

            // Handle Twitter username lookup if needed
            if (entry.twitterUsername && !entry.twitterId) {
              try {
                const cleanUsername = entry.twitterUsername.replace(/^@/, '');
                
                const response = await fetch(`https://twitter241.p.rapidapi.com/user?username=${encodeURIComponent(cleanUsername)}`, {
                  method: 'GET',
                  headers: {
                    'x-rapidapi-key': 'ec8ed93951msh6c550dd490fdcdep15947fjsn9059555be20f',
                    'x-rapidapi-host': 'twitter241.p.rapidapi.com'
                  }
                });
                if (response.ok) {
                  const data = await response.json();
                  if (data.result?.data?.user?.result?.rest_id) {
                    finalEntry.twitterId = data.result.data.user.result.rest_id;
                  } else {
                    throw new Error('Could not find Twitter ID for username');
                  }
                } else {
                  throw new Error('Failed to lookup Twitter ID');
                }
              } catch (lookupError) {
                results.failed++;
                results.errors.push(`${entry.email || entry.twitterUsername}: Failed to lookup Twitter ID - ${lookupError instanceof Error ? lookupError.message : 'Unknown error'}`);
                continue;
              }
            }

            await WhitelistService.addToWhitelist(finalEntry.email, finalEntry.twitterId, finalEntry.twitterUsername);
            results.successful++;
          } catch (individualError) {
            results.failed++;
            const errorMessage = individualError instanceof Error ? individualError.message : 'Unknown error';
            results.errors.push(`${entry.email || entry.twitterId || entry.twitterUsername}: ${errorMessage}`);
          }
        }
      }
    }

    let message = `Bulk upload completed. ${results.successful} entries processed successfully`;
    if (results.failed > 0) {
      message += `, ${results.failed} failed`;
    }

    return NextResponse.json({
      message,
      results
    });

  } catch (error) {
    console.error("Error processing bulk whitelist upload:", error);
    return NextResponse.json(
      { error: "Failed to process bulk upload" },
      { status: 500 }
    );
  }
}

function parseWhitelistFile(text: string): BulkEntry[] {
  // Handle both Windows (\r\n) and Unix (\n) line endings
  const lines = text.split(/\r?\n/);
  const entries: BulkEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      continue;
    }

    // Check if this looks like a CSV line (contains comma)
    if (line.includes(',')) {
      // Parse CSV format: email,twitterId or email,username
      const parts = line.split(',').map(part => part.trim());
      
      if (parts.length >= 2) {
        const entry: BulkEntry = {};
        
        // First part should be email
        if (parts[0] && parts[0].includes('@')) {
          entry.email = parts[0].toLowerCase(); // Normalize email to lowercase
        }
        
        // Second part could be Twitter ID (numeric) or username
        if (parts[1]) {
          if (/^\d+$/.test(parts[1])) {
            entry.twitterId = parts[1];
          } else {
            entry.twitterUsername = parts[1].replace(/^@/, '');
          }
        }
        
        // Only add if we have at least one valid identifier
        if (entry.email || entry.twitterId || entry.twitterUsername) {
          entries.push(entry);
        }
      }
    } else {
      // Simple line-by-line format: each line is either an email or Twitter screen name
      if (line.includes('@') && !line.startsWith('@')) {
        // It's an email address - normalize to lowercase for consistent storage
        entries.push({ email: line.toLowerCase() });
      } else if (/^\d+$/.test(line)) {
        // It's a numeric Twitter ID
        entries.push({ twitterId: line });
      } else {
        // It's a Twitter screen name (with or without @)
        const cleanUsername = line.replace(/^@/, '');
        entries.push({ twitterUsername: cleanUsername });
      }
    }
  }

  return entries;
}

function validateEntries(entries: BulkEntry[]): string[] {
  const errors: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const lineNumber = i + 1;

    // Check if entry has at least one identifier
    if (!entry.email && !entry.twitterId && !entry.twitterUsername) {
      errors.push(`Line ${lineNumber}: Entry must have either email, Twitter ID, or Twitter username`);
      continue;
    }

    // Validate email format
    if (entry.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) {
        errors.push(`Line ${lineNumber}: Invalid email format: ${entry.email}`);
      }
    }

    // Validate Twitter ID format
    if (entry.twitterId) {
      if (!/^\d+$/.test(entry.twitterId)) {
        errors.push(`Line ${lineNumber}: Twitter ID must be numeric: ${entry.twitterId}`);
      }
    }

    // Validate Twitter username format
    if (entry.twitterUsername) {
      if (!/^[a-zA-Z0-9_]+$/.test(entry.twitterUsername)) {
        errors.push(`Line ${lineNumber}: Invalid Twitter username format: ${entry.twitterUsername}`);
      }
    }
  }

  return errors;
}
