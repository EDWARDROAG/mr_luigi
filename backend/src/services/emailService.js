const { logger } = require('../utils/logger');

const sendRecoveryEmail = async (email, resetUrl) => {
  logger.info(`[emailService] Recuperación de contraseña para ${email}: ${resetUrl}`);
  return { success: true };
};

module.exports = {
  sendRecoveryEmail,
};
