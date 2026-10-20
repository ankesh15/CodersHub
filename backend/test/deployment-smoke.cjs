const { verifyDeployment } = require('../verification/deployment');
verifyDeployment({ frontendUrl: process.env.VERIFY_FRONTEND_URL, backendUrl: process.env.VERIFY_BACKEND_URL })
  .then(result => { console.log(JSON.stringify(result, null, 2)); if (!result.passed) process.exitCode = 1; })
  .catch(error => { console.error(error.message); process.exitCode = 1; });
