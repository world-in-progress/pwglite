import { fileURLToPath, URL } from "node:url";
import vue from '@vitejs/plugin-vue'
import { exec } from 'child_process'
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'pwg-auto-build',
      handleHotUpdate({ file }) {
        // 只监听 pwg 目录下的 js 文件
        if (file.endsWith('.js') && file.includes('src/utils/core/pwg/') && !file.endsWith('pwg-module.js')) {
          exec('python ./src/utils/core/pwg/pwg-module-build.py', (err, stdout, stderr) => {
            if (err) {
              console.error('自动打包出错:', stderr);
            } else {
              console.log('pwg-module build completed.');
            }
          });
        }
      }
    }],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
