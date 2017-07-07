const DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'postgres://ikqipnsg:Sl_j_HtbHVTOjEXmBk9VYza5EWqqI9wn@pellefant.db.elephantsql.com:5432/ikqipnsg';

exports.DATABASE = {
  client: 'pg',
  connection: DATABASE_URL,
  pool: { min: 0, max: 3 },
  debug: true
};

exports.PORT = process.env.PORT || 8080;