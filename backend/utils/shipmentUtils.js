const generateTrackingNumber = () => {
  const prefix = 'EP';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

module.exports = {
  generateTrackingNumber
};
