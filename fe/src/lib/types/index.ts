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
 * Interactive floor plan zone (apartment or region).
 * Coordinates use the same normalized system as map data: 0-1 on the smaller image dimension.
 */
export interface FloorPlanZone {
	id: string;
	label: string;
	/** One or more shapes (path, rect, circle) in normalized coordinates */
	shape: SvgShape | SvgShape[];
}

/**
 * Click behavior for interactive floor plan zones
 */
export type FloorPlanZoomMode = 'zoom' | 'highRes';

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
 * Base image configuration
 * Width and height are read from the loaded image automatically
 */
export interface BaseImage {
	src: string;
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
 * Coordinate system metadata for normalized coordinates
 * All coordinates in the data are normalized:
 * - Smallest dimension is 0-1
 * - Largest dimension maintains aspect ratio
 * To denormalize: multiply by image's smaller pixel dimension
 */
export interface CoordinateSystem {
	/** Whether coordinates are normalized */
	normalized: boolean;
	/** Original viewBox the coordinates were designed for */
	originalViewBox?: ViewBox;
	/** Factor used to normalize (divide original coords by this) */
	scaleFactor?: number;
	/** Human-readable explanation */
	note?: string;
}

/**
 * Complete map data structure (map.json)
 * 
 * Coordinates are normalized: smallest dimension = 1, largest scaled proportionally.
 * At runtime, multiply all coordinates by the image's smaller pixel dimension.
 */
export interface MapData {
	/** Base image (src only - dimensions read from loaded image) */
	baseImage: BaseImage;
	
	/** Optional higher-resolution overlay for a specific area */
	detailImage?: DetailImage;
	
	/** The main subject of the map */
	focal: Focal;
	
	/** Explicit default view in normalized coordinates */
	defaultView?: ViewBox;
	
	/** Radius for focal-centered default view (normalized, 0-1, default 0.1) */
	defaultRadius?: number;
	
	/** Interactive places/zones on the map */
	places: PlaceData[];
	
	/** Coordinate system metadata */
	coordinateSystem?: CoordinateSystem;
}
