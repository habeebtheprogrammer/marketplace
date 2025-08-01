const fs = require('fs');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify');
const path = require('path');

// Apple ID patterns to exclude
const APPLE_PATTERNS = [
    /@privaterelay\.appleid\.com$/i,
    /@icloud\.com$/i,
    /@me\.com$/i,
    /@mac\.com$/i,
    /@wlsom\.com$/i,
    /@webscash\.com$/i,
    /archive\.com$/i,
];

function isAppleEmail(email) {
    return APPLE_PATTERNS.some(pattern => pattern.test(email));
}

function cleanEmails(inputFile, outputFile) {
    const results = [];
    let totalRecords = 0;
    let filteredRecords = 0;

    console.log('Processing CSV file...');
    
    fs.createReadStream(inputFile)
        .pipe(csv({
            headers: ['email', 'firstName', 'lastName'],
            skipLines: 0 // Skip header row if exists
        }))
        .on('data', (data) => {
            totalRecords++;
            if (data.email && !isAppleEmail(data.email.trim().toLowerCase())) {
                results.push({
                    email: data.email.trim(),
                    firstName: data.firstName ? data.firstName.trim() : '',
                    lastName: data.lastName ? data.lastName.trim() : ''
                });
                filteredRecords++;
            }
        })
        .on('end', () => {
            // Create CSV string
            stringify(results, {
                header: true,
                columns: ['email', 'firstName', 'lastName']
            }, (err, output) => {
                if (err) {
                    console.error('Error generating CSV:', err);
                    return;
                }
                
                // Write to file
                fs.writeFile(outputFile, output, (err) => {
                    if (err) {
                        console.error('Error writing to file:', err);
                        return;
                    }
                    
                    console.log('\nProcessing complete!');
                    console.log(`Total records processed: ${totalRecords}`);
                    console.log(`Records after filtering: ${filteredRecords}`);
                    console.log(`Apple ID emails removed: ${totalRecords - filteredRecords}`);
                    console.log(`Cleaned data saved to: ${path.resolve(outputFile)}`);
                });
            });
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}

// Main execution
const inputFile = 'test.users.csv'; // Update this to your input file path
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputFile = `cleaned_emails_${timestamp}.csv`;

// Check if input file exists
if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file '${inputFile}' not found.`);
    process.exit(1);
}

cleanEmails(inputFile, outputFile);
