const usersService = require('./users.service');

async function me(req, res) {
  try {
    const user = await usersService.getMe(req.user?.id);
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
}

module.exports = { me };