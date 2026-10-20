function text(value, label, { required = true, max = 100 } = {}) {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
    throw Object.assign(new Error(`${label} must be a ${required ? 'non-empty ' : ''}string of at most ${max} characters.`), { status: 400 });
  }
  return value.trim();
}
function handle(value, label = 'Profile handle', required = true) {
  const result = text(value, label, { required, max: 64 });
  if (result && !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/.test(result)) {
    throw Object.assign(new Error(`${label} must contain only letters, numbers, underscores, dots or hyphens.`), { status: 400 });
  }
  return result.toLowerCase();
}
function password(value, registration = false) {
  if (typeof value !== 'string' || !value.length || Buffer.byteLength(value) > 72 || (registration && value.length < 6)) {
    throw Object.assign(new Error('Password must be between 6 characters and 72 bytes when registering (maximum 72 bytes when signing in).'), { status: 400 });
  }
  return value;
}
module.exports = { text, handle, password };
