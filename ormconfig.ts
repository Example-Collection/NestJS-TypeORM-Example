module.exports = {
  port: 3306,
  host: process.env.DATASOURCE_URL,
  username: process.env.DATASOURCE_USERNAME,
  password: process.env.DATASOURCE_PASSWORD,
  database: 'sangwoo',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  type: 'mysql',
};
