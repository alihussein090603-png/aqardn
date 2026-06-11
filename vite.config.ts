/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      minify: 'terser', // Enforced Terser minification criteria
      terserOptions: {
        compress: {
          drop_console: true, // Purges debugging tracing console lines
          drop_debugger: true, // Purges debug breakpoints and triggers
        },
      },
      cssMinify: true, // Compress generated client style sheets 
      sourcemap: false, // Suppress map noise for visual speed
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Isolate the secure Admin system pages entirely from public core files
            if (id.includes('/pages/admin/') || id.includes('/admin/')) {
              return 'admin-system';
            }
            // Explicitly partition dependencies to maximize load speeds
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('motion')) {
                return 'vendor-react';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              return 'vendor-deps';
            }
          }
        }
      },
      chunkSizeWarningLimit: 1500
    },
    test: {
      globals: true,
      environment: 'jsdom',
      css: false,
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
