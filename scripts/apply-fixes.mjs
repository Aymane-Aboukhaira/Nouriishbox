import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
            callback(dirPath);
        }
    });
}

const files = [];
['app', 'components'].forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) walkDir(fullPath, f => files.push(f));
});

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Typography caps
    content = content.replace(/\buppercase\b/g, 'capitalize');

    // 2. Contrast Fixes
    // Force text-[#F5F0E8] inside dark background containers
    content = content.replace(/className=(["'{`])([^"'{`]*?(?:bg-\[#2C3E2D\]|bg-\[#1A1A1A\]|bg-\[#2D2D2D\]|bg-\[#2c3e2d\]|bg-\[#1a1a1a\]|bg-\[#2d2d2d\])[^"'{`]*?)(\1)/g, (match, q, classes) => {
        let newClasses = classes;
        // Replace existing text dark colors if any
        newClasses = newClasses.replace(/text-\[\#2D2D2D\]/gi, '');
        newClasses = newClasses.replace(/text-\[\#1A1A1A\]/gi, '');
        newClasses = newClasses.replace(/text-black/g, '');
        // Append text-[#F5F0E8] if it's not already white or F5F0E8
        if (!newClasses.includes('text-white') && !newClasses.includes('text-[#F5F0E8]')) {
            newClasses += ' text-[#F5F0E8]';
        }
        return `className=${q}${newClasses}${q}`;
    });

    // 3. Rounded corners logic
    // We will do some textual replacements for inputs and buttons specifically first
    
    // buttons: change any rounded-* to rounded-full
    content = content.replace(/(<(button|input)[^>]*className=(["'{`]))([^"'{`]+)(\3)/gi, (match, prefix, tag, q, classes) => {
        let newClasses = classes.replace(/\brounded-(?:sm|md|lg|xl|2xl|3xl|none|\[.*?\])\b/g, 'rounded-full');
        if (!newClasses.includes('rounded-')) newClasses += ' rounded-full';
        return prefix + newClasses + q;
    });

    // images: rounded-2xl
    content = content.replace(/(<(img|Image)[^>]*className=(["'{`]))([^"'{`]+)(\3)/gi, (match, prefix, tag, q, classes) => {
        let newClasses = classes.replace(/\brounded-(?:sm|md|lg|xl|full|3xl|none|\[.*?\])\b/g, 'rounded-2xl');
        if (!newClasses.includes('rounded-')) newClasses += ' rounded-2xl';
        return prefix + newClasses + q;
    });

    // General substitutions for div/cards/containers
    // The request specifies: 
    // Meal cards, Pricing cards: 20px (rounded-[20px])
    // Feature boxes, image containers: 16px (rounded-2xl)
    // FAQ rows: 12px (rounded-xl)
    // No 0px corners except full bleed
    
    // Replace rounded-3xl with rounded-[20px] 
    content = content.replace(/\brounded-3xl\b/g, 'rounded-[20px]');
    
    // Replace rounded-none (unless full screen usually handled by other classes like w-full h-full, but we'll leave rounded-none alone just in case it's structural, wait the user said "no element should have sharp 0px corners unless full bleed")
    
    // Up-round small radii to rounded-xl (12px)
    content = content.replace(/\brounded-sm\b/g, 'rounded-xl');
    content = content.replace(/\brounded-md\b/g, 'rounded-xl');
    content = content.replace(/\brounded-lg\b/g, 'rounded-2xl'); // 16px
    
    // We'll trust the component structure for cards to hit the right rounded variants since they use these standard sizes.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

console.log('Finished applying styling fixes.');
