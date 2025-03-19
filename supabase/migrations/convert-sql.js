import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert `import.meta.url` to a directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to format SQL file content
async function formatSQLFile(inputFile) {
  const inputFilePath = path.join(__dirname, inputFile);
  const outputFilePath = path.join(__dirname, inputFile.replace('.sql', '.txt'));

  try {
    // Read the SQL file content
    const sqlContent = await fs.promises.readFile(inputFilePath, 'utf8');

    // Split statements based on semicolon followed by a newline
    const statements = sqlContent
      .split(/;\s*\n/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Join statements into required JSON-like format
    const formattedOutput = `{${statements.map(stmt => `"${stmt.replace(/"/g, '\\"')}"`).join(",")}}`;

    // Write to output file
    await fs.promises.writeFile(outputFilePath, formattedOutput, 'utf8');
    console.log(`Conversion successful! Output written to: ${outputFilePath}`);
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
  }
}

// Get the filename from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide a .sql file name as an argument.');
  process.exit(1);
}

const inputFile = args[0];
if (!inputFile.endsWith('.sql')) {
  console.error('The input file must have a .sql extension.');
  process.exit(1);
}

formatSQLFile(inputFile);
