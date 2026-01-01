import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/user.entity';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();

  const repo = dataSource.getRepository(User);

  const existingUser = await repo.findOne({
    where: { email: 'admin@mail.com' },
  });

  if (existingUser) {
    console.log('⚠️ Admin user already exists');
    await dataSource.destroy();
    return;
  }

  const password = await bcrypt.hash('Admin123@', 10);

  await repo.save({
    fullname: 'Admin User',
    email: 'admin@mail.com',
    password,
    is_active: true,
  });

  console.log('✅ User seeded successfully');
  await dataSource.destroy();
}

seed().catch(async (err) => {
  console.error('❌ Seeding failed:', err);
  await dataSource.destroy();
});
