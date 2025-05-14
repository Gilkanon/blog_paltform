import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const alexPassword = await bcrypt.hash('alexpassword', 10);
  const johnPassword = await bcrypt.hash('johnpassword', 10);
  const janePassword = await bcrypt.hash('janepassword', 10);

  const userAlex = await prisma.user.upsert({
    where: { username: 'alex' },
    update: { password: alexPassword },
    create: {
      username: 'alex',
      email: 'alex@gmail.com',
      password: alexPassword,
      role: 'MODERATOR',
    },
  });

  const userJohn = await prisma.user.upsert({
    where: { username: 'john' },
    update: { password: johnPassword },
    create: {
      username: 'john',
      email: 'john@gmail.com',
      password: johnPassword,
    },
  });

  const userJane = await prisma.user.upsert({
    where: { username: 'jane' },
    update: { password: janePassword },
    create: {
      username: 'jane',
      email: 'jane@gmail.com',
      password: janePassword,
    },
  });

  console.log({ userAlex, userJohn, userJane });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
