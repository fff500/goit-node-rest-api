import bcrypt from 'bcryptjs';

const validatePassword = (password, hashPassword) =>
  bcrypt.compare(password, hashPassword);

export default validatePassword;
