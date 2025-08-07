import bcrypt from 'bcrypt';

async function hashPassword(plainPassword: string) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        console.log('Original password:', plainPassword);
        console.log('Hashed password:', hashedPassword);
        console.log('\nSQL to update user:');
        console.log(`UPDATE users SET password = '${hashedPassword}' WHERE username = 'your-username';`);

        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
    }
}

// Get password from command line argument
const password = process.argv[2];

if (!password) {
    console.log('Usage: npx tsx scripts/hash-password.ts "your-password"');
    console.log('Example: npx tsx scripts/hash-password.ts "password123"');
    process.exit(1);
}

hashPassword(password);