import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the current directory (frontend)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Format API base URL (VITE_API_URL or VITE_API_BASE_URL)
  const apiBaseUrl = env.VITE_API_BASE_URL || 
    (env.VITE_API_URL ? `${env.VITE_API_URL.replace(/\/$/, '')}/api` : '');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
    }
  }
})
