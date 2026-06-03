// Seed — наполнение базы тестовыми данными для разработки.
// Запуск: bunx --bun prisma db seed  (или bun run db:seed)
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient, Role } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // passwordHash — заглушка. Реальное хеширование argon2 появится в auth-модуле.
  const alice = await prisma.user.upsert({
    where: { email: 'alice@swift.dev' },
    update: {},
    create: {
      email: 'alice@swift.dev',
      name: 'Alice',
      passwordHash: 'seed-placeholder-not-a-real-hash',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@swift.dev' },
    update: {},
    create: {
      email: 'bob@swift.dev',
      name: 'Bob',
      passwordHash: 'seed-placeholder-not-a-real-hash',
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-team' },
    update: {},
    create: {
      name: 'Demo Team',
      slug: 'demo-team',
      ownerId: alice.id,
    },
  });

  await prisma.member.upsert({
    where: { userId_workspaceId: { userId: alice.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: alice.id, workspaceId: workspace.id, role: Role.OWNER },
  });

  await prisma.member.upsert({
    where: { userId_workspaceId: { userId: bob.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: bob.id, workspaceId: workspace.id, role: Role.MEMBER },
  });

  console.log('Seed complete:');
  console.log(`  Users: ${alice.email}, ${bob.email}`);
  console.log(`  Workspace: ${workspace.slug}`);
  console.log('  Members: Alice (OWNER), Bob (MEMBER)');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
