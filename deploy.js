const { execSync } = require('child_process');
const path = require('path');

const deployProject = (projectPath, projectName) => {
    console.log(`Deploying ${projectName}...`);
    try {
        // Navigate to project directory
        process.chdir(projectPath);
        
        // Install dependencies using Bun
        execSync('bun install', { stdio: 'inherit' });
        
        // Build if it's the client
        if (projectName === 'Client') {
            execSync('bun run build', { stdio: 'inherit' });
        }
        
        // Deploy to Vercel with Bun
        execSync('bunx --bun vercel --prod', { stdio: 'inherit' });
        
        console.log(`${projectName} deployed successfully!`);
    } catch (error) {
        console.error(`Error deploying ${projectName}:`, error);
        process.exit(1);
    }
};

const main = async () => {
    const rootDir = __dirname;
    
    // Deploy server
    deployProject(path.join(rootDir, 'server'), 'Server');
    
    // Deploy client
    deployProject(path.join(rootDir, 'client'), 'Client');
    
    console.log('All deployments completed successfully!');
};

main().catch(console.error);
