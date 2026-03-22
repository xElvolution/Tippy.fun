const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\OVLE LAB\\AI-Tip\\design';
const appDir = 'C:\\Users\\OVLE LAB\\AI-Tip\\web\\src\\app';

const pages = [
  "landing_page", "404_not_found", "account_settings", "campaign_detail_judging_audit",
  "create_campaign_wizard", "discord_bot_installation", "draft_campaigns",
  "how_judging_works", "integrations_hub", "operator_dashboard",
  "payout_portal", "public_campaign_page", "telegram_bot_onboarding",
  "tippy_mint_orbit", "treasury_tx_history"
];

function convertHtmlToJsx(html) {
  let jsx = html;
  
  // Basic attributes
  jsx = jsx.replace(/class="/g, 'className="');
  jsx = jsx.replace(/for="/g, 'htmlFor="');
  
  // SVG attributes
  jsx = jsx.replace(/stroke-width="/g, 'strokeWidth="');
  jsx = jsx.replace(/stroke-linecap="/g, 'strokeLinecap="');
  jsx = jsx.replace(/stroke-linejoin="/g, 'strokeLinejoin="');
  jsx = jsx.replace(/fill-rule="/g, 'fillRule="');
  jsx = jsx.replace(/clip-rule="/g, 'clipRule="');
  jsx = jsx.replace(/stroke-miterlimit="/g, 'strokeMiterlimit="');
  jsx = jsx.replace(/fill-opacity="/g, 'fillOpacity="');
  jsx = jsx.replace(/font-family="/g, 'fontFamily="');
  
  // Clean invalid styles
  jsx = jsx.replace(/style="font-variation-settings:\s*'FILL'\s*1;"/g, "style={{ fontVariationSettings: \"'FILL' 1\" }}");
  jsx = jsx.replace(/style="([^"]*)"/g, ""); 

  // Self closing tags
  jsx = jsx.replace(/<img(.*?[^\/])>/g, '<img$1 />');
  jsx = jsx.replace(/<input(.*?[^\/])>/g, '<input$1 />');
  jsx = jsx.replace(/<br>/g, '<br />');
  jsx = jsx.replace(/<hr>/g, '<hr />');
  
  // Comments
  jsx = jsx.replace(/<!--/g, '{/*');
  jsx = jsx.replace(/-->/g, '*/}');
  
  // Remove scripts
  jsx = jsx.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  return `<>\n${jsx}\n</>`;
}

for (const page of pages) {
  const codePath = path.join(sourceDir, page, 'code.html');
  if (!fs.existsSync(codePath)) continue;

  const content = fs.readFileSync(codePath, 'utf8');
  
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    let bodyContent = bodyMatch[1];
    
    // Add routing logic natively via pure HTML structure since Next.js supports <a> tags.
    // Instead of using sophisticated next/link, we just fix the hrefs safely.
    bodyContent = bodyContent.replace(/href="#"/g, 'href="/"'); // default fallback
    bodyContent = bodyContent.replace(/>Dashboard<\/a>/gi, ' href="/operator_dashboard">Dashboard</a>');
    bodyContent = bodyContent.replace(/>Create Campaign<\/a>/gi, ' href="/create_campaign_wizard">Create Campaign</a>');
    bodyContent = bodyContent.replace(/>Marketing<\/a>/gi, ' href="/integrations_hub">Marketing</a>');
    
    // Convert to JSX
    let jsxContent = convertHtmlToJsx(bodyContent);
    
    const componentName = page === 'landing_page' ? 'LandingPage' : page.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    
    const tsxContent = `// Automatically generated\nimport Link from 'next/link';\n\nexport default function ${componentName}() {\n  return (\n    ${jsxContent}\n  );\n}\n`;
    
    const pageDir = page === 'landing_page' ? appDir : path.join(appDir, page);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(pageDir, 'page.tsx'), tsxContent, 'utf8');
    console.log(`Generated ${page}`);
  }
}
