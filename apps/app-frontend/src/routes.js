import { createRouter, createWebHashHistory,createWebHistory } from 'vue-router'

import * as Pages from '@/pages'
import BrowseDiscover from '@/pages/browse/Discover.vue'
import * as Instance from '@/pages/instance'
import * as Library from '@/pages/library'
import Project from '@/pages/project/Project.vue'

// createWebHistory() doesn't work with file:// protocol (Electron)
// because the pathname is the full filesystem path, not a route path.
const isElectron = typeof window !== 'undefined' && 'electronAPI' in window

export default new createRouter({
	history: isElectron ? createWebHashHistory() : createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'Home',
			component: Pages.Index,
			meta: {
				breadcrumb: [{ name: 'Home' }],
			},
		},
		{
			path: '/worlds',
			name: 'Worlds',
			component: Pages.Worlds,
			meta: {
				breadcrumb: [{ name: 'Worlds' }],
			},
		},
		{
			path: '/skins',
			name: 'Skin selector',
			component: Pages.Skins,
			meta: {
				breadcrumb: [{ name: 'Skin selector' }],
			},
		},
		{
			path: '/library',
			name: 'Library',
			component: Library.Index,
			meta: {
				breadcrumb: [{ name: 'Library' }],
			},
			children: [
				{
					path: '',
					name: 'Overview',
					component: Library.Overview,
				},
				{
					path: 'downloaded',
					name: 'Downloaded',
					component: Library.Downloaded,
				},
				{
					path: 'modpacks',
					name: 'Modpacks',
					component: Library.Modpacks,
				},
				{
					path: 'servers',
					name: 'LibraryServers',
					component: Library.Servers,
				},
				{
					path: 'custom',
					name: 'Custom',
					component: Library.Custom,
				},
			],
		},
		{
			path: '/instance/:id',
			name: 'Instance',
			component: Instance.Index,
			props: true,
			children: [
				{
					path: 'worlds',
					name: 'InstanceWorlds',
					component: Instance.Worlds,
					meta: {
						useRootContext: true,
						breadcrumb: [{ name: '?Instance', link: '/instance/{id}/' }, { name: 'Worlds' }],
					},
				},
				{
					path: '',
					name: 'Mods',
					component: Instance.Mods,
					meta: {
						useRootContext: true,
						breadcrumb: [{ name: '?Instance', link: '/instance/{id}/' }, { name: 'Content' }],
					},
				},
				{
					path: 'projects/:type',
					name: 'ModsFilter',
					component: Instance.Mods,
					meta: {
						useRootContext: true,
						breadcrumb: [{ name: '?Instance', link: '/instance/{id}/' }, { name: 'Content' }],
					},
				},
				{
					path: 'files',
					name: 'Files',
					component: Instance.Files,
					meta: {
						useRootContext: true,
						breadcrumb: [{ name: '?Instance', link: '/instance/{id}/' }, { name: 'Files' }],
					},
				},
				{
					path: 'logs',
					name: 'Logs',
					component: Instance.Logs,
					meta: {
						renderMode: 'fixed',
						useRootContext: true,
						breadcrumb: [{ name: '?Instance', link: '/instance/{id}/' }, { name: 'Logs' }],
					},
				},
			],
		},
		{
			path: '/project/:slug',
			name: 'Project',
			component: Project,
			meta: {
				breadcrumb: [{ name: 'Project' }],
			},
		},
		{
			path: '/browse/:type',
			name: 'BrowseDiscover',
			component: BrowseDiscover,
		},
	],
	linkActiveClass: 'router-link-active',
	linkExactActiveClass: 'router-link-exact-active',
	scrollBehavior(to, from) {
		if (to.path === from.path) return
		document.querySelector('.app-viewport')?.scrollTo(0, 0)
		return {
			el: '.app-viewport',
			top: 0,
		}
	},
})
