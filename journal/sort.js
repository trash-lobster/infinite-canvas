const args = process.argv;

if (!args.includes('--file') && !args.includes('-f')) {
    console.error('Require file to parse');
    return;
}

let fileIndex = args.indexOf('--file');
if (fileIndex === -1) {
    fileIndex = args.indexOf('-f');
}

let fileName;

if (fileIndex !== -1 && args.length > fileIndex + 1) {
  fileName = args[fileIndex + 1];
} else {
    console.error('No file name provided');
    return;
}

const fs = require('node:fs');
let content = '';

fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    content = data.split('\n').filter(line => line).sort(sortLinesAlphabetically).join('\n\n');
    fs.writeFileSync('./journal/00-glossary.md', content, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    })
});

// sort it based on the first alphabetical character
function sortLinesAlphabetically(a, b) {
    const aMatch = a.match(/[a-zA-Z0-9]/)[0];
    const bMatch = b.match(/[a-zA-Z0-9]/)[0]; 
    return aMatch.toLowerCase().charCodeAt(0) - bMatch.toLowerCase().charCodeAt(0);
}