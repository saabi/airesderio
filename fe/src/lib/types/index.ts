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
 * SVG element types for map places
 * @deprecated Use SvgShape and TextLabel from MapData types instead
 */
export type SvgElement =
	| { type: 'path'; d: string }
	| { type: 'rect'; x: number; y: number; width: number; height: number }
	| { type: 'circle'; cx: number; cy: number; r: number }
	| { type: 'text'; x: number; y: number; content: string; xmlSpace?: 'preserve' };

/**
 * SVG structure for a place on the map
 * @deprecated Use PlaceData from MapData types instead
 */
export interface PlaceSvgData {
	elements: SvgElement[];
	pin: { cx: number; cy: number; r: number };
}

/**
 * Extended place metadata with SVG data
 * @deprecated Use PlaceData from MapData types instead
 */
export interface PlaceWithSvg extends PlaceMetadata {
	svg: PlaceSvgData;
}

/**
 * Map configuration
 * @deprecated Use MapData structure instead (baseImage, detailImage, focal)
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
 * @deprecated Use MapData instead
 */
export interface PlacesDataWithSvg {
	places: Record<string, PlaceWithSvg>;
	mapConfig: MapConfig;
}

/**
 * Place data for Map component (simplified structure)
 * @deprecated Use PlaceData from MapData instead
 */
export interface MapPlaceData {
	id: string;
	name: string;
	svg: PlaceSvgData;
}

// ============================================================================
// NEW MAP DATA TYPES (map.json structure)
// ============================================================================

/**
 * ViewBox rectangle in SVG coordinate space
 */
export interface ViewBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * SVG shape types (excluding text which is a label)
 */
export type SvgShape =
	| { type: 'path'; d: string }
	| { type: 'rect'; x: number; y: number; width: number; height: number }
	| { type: 'circle'; cx: number; cy: number; r: number };

/**
 * Text label for annotating places on the map
 */
export interface TextLabel {
	type: 'text';
	x: number;
	y: number;
	content: string;
	xmlSpace?: 'preserve';
}

/**
 * Pin marker position for labels/tooltips
 */
export interface PinPosition {
	cx: number;
	cy: number;
	r: number;
}

/**
 * Base image configuration (defines the coordinate space)
 */
export interface BaseImage {
	src: string;
	width: number;
	height: number;
}

/**
 * Optional detail image overlay (higher resolution for specific area)
 */
export interface DetailImage {
	src: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Focal point - the main subject of the map (e.g., Aires de Río building)
 */
export interface Focal {
	/** Shapes that visually represent the focal subject */
	shapes?: SvgShape[];
	/** Center point for default view calculation and labels */
	center: { cx: number; cy: number };
}

/**
 * Place/zone data combining geometry and content
 */
export interface PlaceData {
	/** Unique identifier */
	id: string;
	
	// === Geometry ===
	/** Zone outline - single shape or array of shapes */
	shape: SvgShape | SvgShape[];
	/** Anchor point for labels/tooltips */
	pin: PinPosition;
	/** Optional text labels within the zone */
	labels?: TextLabel[];
	
	// === Content ===
	/** Display name */
	name: string;
	/** Short description */
	description?: string;
	/** Extended content (things to do) */
	details?: string;
	/** Photo filenames (relative to /places/{id}/) */
	photos?: string[];
}

/**
 * Complete map data structure (map.json)
 */
export interface MapData {
	/** Base image defines the coordinate space */
	baseImage: BaseImage;
	
	/** Optional higher-resolution overlay for a specific area */
	detailImage?: DetailImage;
	
	/** The main subject of the map */
	focal: Focal;
	
	/** Explicit default view (if omitted, computed from focal + defaultRadius) */
	defaultView?: ViewBox;
	
	/** Radius for computed default view when defaultView is omitted */
	defaultRadius?: number;
	
	/** Interactive places/zones on the map */
	places: PlaceData[];
}
