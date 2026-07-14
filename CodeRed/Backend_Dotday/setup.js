#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('🌸 DotDay Backend Setup 🌸');
  console.log('=============================\n');

  try {
    // Check if Firebase CLI is installed
    try {
      execSync('firebase --version', { stdio: 'ignore' });
      console.log('✅ Firebase CLI is installed');
    } catch (error) {
      console.log('❌ Firebase CLI is not installed');
      console.log('Please install Firebase CLI first:');
      console.log('npm install -g firebase-tools');
      process.exit(1);
    }

    // Check if user is logged in
    try {
      execSync('firebase projects:list', { stdio: 'ignore' });
      console.log('✅ Firebase CLI is logged in');
    } catch (error) {
      console.log('❌ Firebase CLI is not logged in');
      console.log('Please login to Firebase:');
      console.log('firebase login');
      process.exit(1);
    }

    // Get project ID
    const projectId = await question('Enter your Firebase project ID: ');
    
    // Set project
    execSync(`firebase use ${projectId}`, { stdio: 'inherit' });
    console.log(`✅ Project set to: ${projectId}`);

    // Get email configuration
    const emailUser = await question('Enter your Gmail address: ');
    const emailPassword = await question('Enter your Gmail app password: ');
    
    // Set Firebase config
    execSync(`firebase functions:config:set email.user="${emailUser}" email.password="${emailPassword}"`, { stdio: 'inherit' });
    console.log('✅ Email configuration set');

    // Install dependencies
    console.log('\n📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');

    // Deploy functions
    console.log('\n🚀 Deploying Firebase Functions...');
    execSync('firebase deploy --only functions', { stdio: 'inherit' });
    console.log('✅ Functions deployed successfully');

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📧 Email notifications will now be sent to partners when:');
    console.log('   • Period is expected to start within 3 days');
    console.log('   • User logs that their period has started');
    console.log('\n📊 Monitor your functions in Firebase Console:');
    console.log(`   https://console.firebase.google.com/project/${projectId}/functions`);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup(); 