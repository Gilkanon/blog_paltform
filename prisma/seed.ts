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

  const alexPost = await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'First Post',
      content: 'This is the content of the first post.',
      authorId: userAlex.id,
    },
  });

  const johnPost = await prisma.post.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Second Post',
      content: 'This is the content of the second post.',
      authorId: userJohn.id,
    },
  });

  const commentForAlexPost = await prisma.comment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content: 'Great post, Alex!',
      postId: alexPost.id,
      authorId: userJane.id,
    },
  });

  const commentForJohnPost = await prisma.comment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      content: 'Thanks for sharing, John!',
      postId: johnPost.id,
      authorId: userAlex.id,
    },
  });

  console.log({
    users: [userAlex, userJohn, userJane],
    posts: [alexPost, johnPost],
    comments: [commentForAlexPost, commentForJohnPost],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
