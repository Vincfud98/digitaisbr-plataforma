import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT || '5173'),
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/react-redux')) {
            return 'redux-vendor';
          }
          if (id.includes('node_modules/antd')) {
            return 'antd-core';
          }
          if (id.includes('node_modules/@ant-design/icons')) {
            return 'antd-icons';
          }
          if (id.includes('node_modules/firebase/auth')) {
            return 'firebase-auth';
          }
          if (id.includes('node_modules/recharts')) {
            return 'recharts';
          }
        },
      },
    },
  },
})
