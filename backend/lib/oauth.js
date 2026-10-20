const User = require('../models/User');
const { handle } = require('./validation');
async function resolveGithubUser(profile, verifiedEmail) {
  // A public GitHub handle entered into another account is never proof of identity.
  const githubId = String(profile.id);
  const existing = await User.findOne({ githubId });
  if (existing) return existing;
  const email = (verifiedEmail || `${githubId}@users.noreply.github.com`).toLowerCase();
  if (await User.findOne({ email })) {
    throw Object.assign(new Error('This email already has an account. Sign in with your password.'), { status: 409 });
  }
  const github = handle(profile.username, 'GitHub username');
  let profileHandle = github;
  if (await User.findOne({ profile: profileHandle })) profileHandle = `${github}-${githubId}`;
  return User.create({ name: profile.displayName || github, email, profile: profileHandle, github, githubId });
}
module.exports = { resolveGithubUser };
