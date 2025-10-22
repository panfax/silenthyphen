// Generate bcrypt hash for admin password
import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter admin password: ', (password) => {
  const hash = bcrypt.hashSync(password, 10);
  console.log('\nPassword hash generated:');
  console.log(hash);
  console.log('\nAdd this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
  rl.close();
});
