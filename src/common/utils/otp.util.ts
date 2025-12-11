export const generateOtp = (len: number = 6) => {
  return Math.floor(Math.random() * Math.pow(10, len));
};

export const generateOtpExpiry = () => {
  return new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
};
