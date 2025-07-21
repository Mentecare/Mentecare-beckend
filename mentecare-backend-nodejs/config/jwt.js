require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'asdf#FGSgvasgf$5$WGT',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  algorithm: 'HS256'
};

module.exports = jwtConfig;

