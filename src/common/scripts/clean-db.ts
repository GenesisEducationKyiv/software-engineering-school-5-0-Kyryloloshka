import { DataSource } from 'typeorm';
import dataSource from 'src/data-source';

async function cleanDatabase() {
  const ds: DataSource = await dataSource.initialize();

  const queryRunner = ds.createQueryRunner();
  await queryRunner.connect();

  await queryRunner.query('SET session_replication_role = replica;');

  const tables = await queryRunner.getTables();
  for (const table of tables) {
    await queryRunner.query(`DROP TABLE IF EXISTS "${table.name}" CASCADE;`);
  }

  await queryRunner.query('SET session_replication_role = DEFAULT;');

  await queryRunner.release();
  await ds.destroy();
  console.log('Database cleaned!');
}

cleanDatabase().catch((err) => {
  console.error('Error cleaning database:', err);
  process.exit(1);
});
