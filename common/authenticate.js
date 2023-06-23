const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const saltRound = 10;


const hashPassword = async (password) => {
  let salt = await bcrypt.genSalt(saltRound)
  let hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword

}
const hashCompare = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}
const createToken = async (payload) => {
  let token = await jwt.sign(payload, process.env.secretkey, { expiresIn: '20m' })
  return token
}
const validate = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = await jwt.decode(token, process.env.secretKey);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Unauthorized' });
  }
}

module.exports = { hashPassword, hashCompare, createToken, validate }