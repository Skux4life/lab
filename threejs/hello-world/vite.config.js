import { defineConfig } from 'vite';


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [],
    resolve: {
        alias: {
        },
    },
    build: {
        sourcemap: true,
    },
    server: {
        port: 5200
    },
    base: "/"
});