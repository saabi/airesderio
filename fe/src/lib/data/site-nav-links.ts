/**
 * Main site nav (header + footer). Subset of home sections; each `id` must exist in the DOM for scroll-spy / anchors.
 */
export type SiteNavLink = {
	id: string;
	href: string;
	label: string;
};

export const siteNavLinks: SiteNavLink[] = [
	{ id: 'top', href: '/', label: 'Inicio' },
	{ id: 'ubicacion', href: '/#ubicacion', label: 'Ubicación' },
	{ id: 'interior', href: '/#interior', label: 'Interiores' },
	{ id: 'planos', href: '/#planos', label: 'Planos' },
	{ id: 'contacto', href: '/#contacto', label: 'Contacto' }
];
