import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import UnpluginInjectPreload from 'unplugin-inject-preload/vite';

import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            filename: './stats/stats.html',
            open: false,
        }),
        UnpluginInjectPreload({
            files: [
                {
                    entryMatch: /logo-light.png$/,
                    outputMatch: /logo-light-.*.png$/,
                },
                {
                    entryMatch: /logo-dark.png$/,
                    outputMatch: /logo-dark-.*.png$/,
                },
            ],
        }),
        [
            {
                name: 'chartdb-auto-save',
                configureServer(server) {
                    server.middlewares.use(
                        '/api/auto-save-charts',
                        async (req, res) => {
                            if (req.method === 'POST') {
                                let body = '';
                                req.on('data', (chunk) => (body += chunk));
                                req.on('end', () => {
                                    try {
                                        const data = JSON.parse(body);
                                        const filePath = path.resolve(
                                            __dirname,
                                            'chartdb-data.json'
                                        );

                                        fs.writeFileSync(
                                            filePath,
                                            JSON.stringify(data, null, 2)
                                        );

                                        res.writeHead(200, {
                                            'Content-Type': 'application/json',
                                        });
                                        res.end(
                                            JSON.stringify({
                                                success: true,
                                                path: filePath,
                                                diagrams: data.length,
                                            })
                                        );
                                    } catch (error) {
                                        res.writeHead(500, {
                                            'Content-Type': 'application/json',
                                        });
                                        const errMsg =
                                            error instanceof Error
                                                ? error.message
                                                : String(error);
                                        res.end(
                                            JSON.stringify({
                                                success: false,
                                                error: errMsg,
                                            })
                                        );
                                    }
                                });
                            } else {
                                res.writeHead(405);
                                res.end('Method Not Allowed');
                            }
                        }
                    );
                },
            },
        ],
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            external: (id) => /__test__/.test(id),
            output: {
                assetFileNames: (assetInfo) => {
                    if (
                        assetInfo.names &&
                        assetInfo.originalFileNames.some((name) =>
                            name.startsWith('src/assets/templates/')
                        )
                    ) {
                        return 'assets/[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
});
