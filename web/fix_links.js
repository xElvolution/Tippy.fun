const fs = require('fs');
const path = require('path');

const appDir = 'C:\\Users\\OVLE LAB\\AI-Tip\\web\\src\\app';

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx')) {
      files.push(name);
    }
  }
  return files;
}

const tsxFiles = getFiles(appDir);

tsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Next/Link import (we can just use <a> tags for now to simplify, Next will full-page reload but it works)
  // Let's replace common `href="#"` patterns
  content = content.replace(/"#"/g, `"{#}"`); // temp placeholder
  
  // Dashboard -> /operator_dashboard
  content = content.replace(/>Dashboard<\/a>/gi, ' href="/operator_dashboard">Dashboard</a>');
  content = content.replace(/"{#}"> href="/g, '"/operator_dashboard">');

  // Create Campaign -> /create_campaign_wizard
  content = content.replace(/>Create Campaign<\/a>/gi, ' href="/create_campaign_wizard">Create Campaign</a>');
  content = content.replace(/"{#}"> href="/g, '"/create_campaign_wizard">');

  // Integrations -> /integrations_hub
  content = content.replace(/>Marketing<\/a>/gi, ' href="/integrations_hub">Integrations</a>');
  content = content.replace(/"{#}"> href="/g, '"/integrations_hub">');

  // Logo / Home
  content = content.replace(/>Tippy\.Fun<\/div>/g, '><a href="/">Tippy.Fun</a></div>');
  content = content.replace(/>Tippy\.Fun<\/a><\/div>/g, '><a href="/">Tippy.Fun</a></div>'); // dedup
  
  // Connect Wallet logic can just stay {#}
  
  // Replace buttons without href
  content = content.replace(/<button([^>]*)>([^<]*(?:Create a Campaign|Create Campaign)[^<]*)<\/button>/gi, '<a href="/create_campaign_wizard"><button$1>$2</button></a>');
  content = content.replace(/<button([^>]*)>([^<]*View Active Bounties[^<]*)<\/button>/gi, '<a href="/public_campaign_page"><button$1>$2</button></a>');

  // Clean up any remaining {#}
  content = content.replace(/"{#}"/g, '"#"');
  
  // Link nextjs
  if (!content.includes('import Link')) {
    content = content.replace(/<a href="\//gi, '<Link href="/');
    content = content.replace(/<\/a>/gi, '</Link>');
    if (content.includes('<Link ')) {
      content = `import Link from 'next/link';\n` + content;
    }
  }

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed navigation links');
