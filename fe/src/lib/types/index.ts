/**
 * Type definitions for the Aires de Río application
 */

/**
 * Geographic coordinates
 */
export interface Coordinates {
	lat: number;
	lng: number;
}

/**
 * Category metadata
 */
export interface Category {
	name: string;
	color?: string;
	icon?: string;
	isAlwaysVisible?: boolean;
}

/**
 * Place/location data structure
 */
export interface Place {
	nombre: string;
	direccion?: string;
	direccion_aproximada?: string;
	direccion_confirmada?: boolean;
	tipo?: string;
	descripcion?: string;
	coordenadas_aproximadas: Coordinates;
	es_edificio_principal?: boolean;
	distancia_aproximada?: string;
	distancia_categoria?: string;
	distancia_cuadras?: string;
	distancia_metros?: number;
	fuente_direccion?: string;
	fuente_coordenadas?: string;
	photos?: string[];
}

/**
 * Places data metadata
 */
export interface PlacesMetadata {
	title?: string;
	description?: string;
	apartment_reference?: string;
	last_updated?: string;
	total_places?: number;
	categories: Record<string, Category>;
	apartment_reference_coords?: Coordinates;
}

/**
 * Complete places data structure
 */
export interface PlacesData {
	metadata: PlacesMetadata;
	lugares: Record<string, Record<string, Place>>;
}

/**
 * Generic marker interface for Google Maps component compatibility
 */
export interface GenericMarker {
	id: string;
	position: Coordinates;
	title: string;
	customElement?: HTMLElement;
	[key: string]: unknown;
}

/**
 * Marker data for Google Maps
 * Extends GenericMarker for compatibility with GoogleMap component
 */
export interface MarkerData extends GenericMarker {
	category: string;
	placeId: string;
	place: Place;
	isMainMarker: boolean;
}

/**
 * Main building information
 */
export interface MainBuilding {
	category: string;
	placeId: string;
	place: Place;
}

/**
 * Simple place metadata for photo carousel
 */
export interface PlaceMetadata {
	nombre: string;
	descripcion?: string;
	thingstodo?: string;
	photos?: string[];
}

/**
 * Places data structure for photo carousel (simple structure)
 */
export interface PlacesCarouselData {
	places: Record<string, PlaceMetadata>;
}

/**
 * SVG shape element types for map places
 */
export type SvgShape =
	| { type: 'path'; d: string }
	| { type: 'rect'; x: number; y: number; width: number; height: number }
	| { type: 'circle'; cx: number; cy: number; r: number };

/**
 * Additional SVG elements (text, etc.)
 */
export interface SvgTextElement {
	type: 'text';
	x: number;
	y: number;
	content: string;
	xmlSpace?: 'preserve';
}

/**
 * SVG structure for a place on the map
 */
export interface PlaceSvgData {
	shape: SvgShape;
	pin: { cx: number; cy: number; r: number };
	additionalElements?: SvgTextElement[];
}

/**
 * Extended place metadata with SVG data
 */
export interface PlaceWithSvg extends PlaceMetadata {
	svg: PlaceSvgData;
}

/**
 * Map configuration
 */
export interface MapConfig {
	fullViewBox: { x: number; y: number; width: number; height: number };
	nearViewBox: { x: number; y: number; width: number; height: number };
	airesderioCenter: { cx: number; cy: number };
	farImage: string;
	nearImage: string;
}

/**
 * Complete places data with SVG and map config
 */
export interface PlacesDataWithSvg {
	places: Record<string, PlaceWithSvg>;
	mapConfig: MapConfig;
}

/**
 * Place data for Map component (simplified structure)
 */
export interface MapPlaceData {
	id: string;
	name: string;
	svg: PlaceSvgData;
}
