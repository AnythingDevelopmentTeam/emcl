import vue from '@vitejs/plugin-vue'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

const projectRootDir = resolve(__dirname)
const appLibEnvDir = resolve(projectRootDir, '../../packages/app-lib')
const apiClientSource = resolve(projectRootDir, '../../packages/api-client/src/index.ts')

// Load .env from app-lib manually instead of using Vite's envDir, which would auto-load .env.local and override values
const envFilePath = resolve(appLibEnvDir, '.env')
if (existsSync(envFilePath)) {
	for (const line of readFileSync(envFilePath, 'utf-8').split('\n')) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) continue
		const eqIndex = trimmed.indexOf('=')
		if (eqIndex === -1) continue
		const key = trimmed.slice(0, eqIndex)
		const value = trimmed.slice(eqIndex + 1)
		if (!(key in process.env)) {
			process.env[key] = value
		}
	}
}

// https://vitejs.dev/config/
export default defineConfig({
	css: {
		preprocessorOptions: {
			scss: {
				// TODO: dont forget about this
				silenceDeprecations: ['import'],
			},
		},
	},
	resolve: {
		alias: [
			{
				find: '@emcl/api-client',
				replacement: apiClientSource,
			},
			{
				find: '@',
				replacement: resolve(projectRootDir, 'src'),
			},
		],
	},
	plugins: [
		vue(),
		svgLoader({
			svgoConfig: {
				plugins: [
					{
						name: 'preset-default',
						params: {
							overrides: {
								removeViewBox: false,
								cleanupIds: {
									minify: false,
								},
							},
						},
					},
				],
			},
		}),
	],

	// prevent vite from obscuring errors
	clearScreen: false,
	base: './',
	// tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		headers: {
			'content-security-policy': (() => {
				const csp: Record<string, string | string[]> = {
					'default-src': "'self' customprotocol: asset:",
					'connect-src': "ipc: http://ipc.localhost https://modrinth.com https://*.modrinth.com https://*.nodes.modrinth.com https://*.posthog.com https://posthog.modrinth.com https://*.sentry.io https://api.mclo.gs http://textures.minecraft.net https://textures.minecraft.net https://js.stripe.com https://*.stripe.com wss://*.stripe.com https://*.intercom.io wss://*.intercom.io https://*.intercomcdn.com https://www.intercom-reporting.com https://app.getsentry.com wss://*.nodes.modrinth.com https://*.taila228c5.ts.net https://*.taila228c5.ts.net wss://*.taila228c5.ts.net https://fill.papermc.io https://api.purpurmc.org 'self' data: blob:",
					'font-src': ['https://cdn-raw.modrinth.com/fonts/', 'https://js.intercomcdn.com'],
					'img-src': "https: 'unsafe-inline' 'self' asset: http://asset.localhost http://textures.minecraft.net blob: data:",
					'style-src': "'unsafe-inline' 'self'",
					'script-src': "https://*.posthog.com https://posthog.modrinth.com https://js.stripe.com https://widget.intercom.io https://js.intercomcdn.com https://tally.so/widgets/embed.js 'self'",
					'frame-src': "https://www.youtube.com https://www.youtube-nocookie.com https://discord.com https://tally.so/popup/ https://js.stripe.com https://hooks.stripe.com https://*.intercom.io https://intercom-sheets.com https://www.intercom-reporting.com https://app.intercom.com 'self'",
					'media-src': 'https://*.githubusercontent.com',
				}

				return Object.entries(csp)
					.map(([directive, sources]) => {
						if (directive === 'connect-src') {
							sources = Array.isArray(sources) ? [...sources] : [sources]
							sources.push('ws://localhost:1420')
						}

						return Array.isArray(sources)
							? `${directive} ${sources.join(' ')}`
							: `${directive} ${sources}`
					})
					.join('; ')
			})(),
		},
	},
	// to make use of `TAURI_ENV_DEBUG` and other env variables
	// https://v2.tauri.app/reference/environment-variables/#tauri-cli-hook-commands
	envPrefix: ['VITE_', 'TAURI_', 'MODRINTH_'],
	build: {
		rolldownOptions: {
			onwarn(warning, defaultHandler) {
				if (warning.code === 'INEFFECTIVE_DYNAMIC_IMPORT') return
				defaultHandler(warning)
			},
		},
		// Electron uses Chromium, Tauri uses system webview
		target: process.env.TAURI_ENV_PLATFORM == 'windows' ? 'chrome105' : 'chrome105',
		// don't minify for debug builds
		minify: !process.env.TAURI_ENV_DEBUG, // eslint-disable-line turbo/no-undeclared-env-vars
		// produce sourcemaps for debug builds
		sourcemap: !!process.env.TAURI_ENV_DEBUG, // eslint-disable-line turbo/no-undeclared-env-vars
	},
})
