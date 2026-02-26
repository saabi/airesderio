// ===== IMPORTS =====
// Terminal
import terminal1 from './terminal/exterior.png';
import terminal2 from './terminal/interior.png';

// Forum
import forum1 from './forum/1_Forum 02.jpg';
import forum2 from './forum/2_FORUM_03 de Tripadvisor.jpg';
import forum3 from './forum/3_Forum 01.jpg';
import forum4 from './forum/4_Forum 04.jpg';
import forum5 from './forum/5_Forum_Santiago_del_Estero_3.jpeg';
import forum6 from './forum/forum4.png';

// Casa de Gobierno
import casagob1 from './casa-de-gobierno/1.jpg';
import casagob2 from './casa-de-gobierno/aerea.JPG';
import casagob3 from './casa-de-gobierno/casayparque2.JPG';
import casagob4 from './casa-de-gobierno/casayparque3.JPG';
import casagob5 from './casa-de-gobierno/casayplaza.png';
import casagob6 from './casa-de-gobierno/estatuasanmartin.jpg';
import casagob7 from './casa-de-gobierno/nocturna.jpg';

// Plaza Vea
import plazavea1 from './plaza-vea/cinemas.png';
import plazavea2 from './plaza-vea/comidas.jpg';
import plazavea3 from './plaza-vea/exterior1.png';
import plazavea4 from './plaza-vea/exterior2.png';

// Parque Aguirre
import parqueaguirre1 from './parque-aguirre/aerea.png';
import parqueaguirre2 from './parque-aguirre/calecita.png';
import parqueaguirre3 from './parque-aguirre/deportes.png';
import parqueaguirre4 from './parque-aguirre/guardavidas.png';
import parqueaguirre5 from './parque-aguirre/juegos.png';
import parqueaguirre6 from './parque-aguirre/recital.png';
import parqueaguirre7 from './parque-aguirre/recital1.png';

// Avenida Roca
import avroca1 from './avenida-roca/1_Untitled-1.jpg';
import avroca2 from './avenida-roca/2__Calle Roca Confiterias_08.jpg';
import avroca3 from './avenida-roca/3__CALLE LA ROCA_ENCONTRARTE_02 de TURISMO.jpg';
import avroca4 from './avenida-roca/4_Calle Roca Confiterias_03.jpg';
import avroca5 from './avenida-roca/5_CALLE LA ROCA_ENCONTRARTE_03 de TURISMO.jpg';
import avroca6 from './avenida-roca/6_Calle Roca Confiterias_01.jpg';
import avroca7 from './avenida-roca/7_istockphoto-1091469178-612x612.jpg';
import avroca8 from './avenida-roca/8_CALLE LA ROCA_ENCONTRARTE_05 de TURISMO.jpg';

// ===== EXPORTS =====
// Create mapping object: placeId -> filename -> image URL
// Note: Using new place IDs that match the cleaned SVG (map-cleaner2.svg)
export const PLACE_PHOTOS_MAP: Record<string, Record<string, string>> = {
	terminal: {
		'exterior.png': terminal1,
		'interior.png': terminal2
	},
	forum: {
		'1_Forum 02.jpg': forum1,
		'2_FORUM_03 de Tripadvisor.jpg': forum2,
		'3_Forum 01.jpg': forum3,
		'4_Forum 04.jpg': forum4,
		'5_Forum_Santiago_del_Estero_3.jpeg': forum5,
		'forum4.png': forum6
	},
	// Map new ID to old photo directory
	'casa-de-gobierno': {
		'1.jpg': casagob1,
		'aerea.JPG': casagob2,
		'casayparque2.JPG': casagob3,
		'casayparque3.JPG': casagob4,
		'casayplaza.png': casagob5,
		'estatuasanmartin.jpg': casagob6,
		'nocturna.jpg': casagob7
	},
	// Map new ID to old photo directory
	'plaza-vea': {
		'cinemas.png': plazavea1,
		'comidas.jpg': plazavea2,
		'exterior1.png': plazavea3,
		'exterior2.png': plazavea4
	},
	// Map new ID to old photo directory
	'parque-aguirre': {
		'aerea.png': parqueaguirre1,
		'calecita.png': parqueaguirre2,
		'deportes.png': parqueaguirre3,
		'guardavidas.png': parqueaguirre4,
		'juegos.png': parqueaguirre5,
		'recital.png': parqueaguirre6,
		'recital1.png': parqueaguirre7
	},
	// Map new ID to old photo directory
	'avenida-roca': {
		'1_Untitled-1.jpg': avroca1,
		'2__Calle Roca Confiterias_08.jpg': avroca2,
		'3__CALLE LA ROCA_ENCONTRARTE_02 de TURISMO.jpg': avroca3,
		'4_Calle Roca Confiterias_03.jpg': avroca4,
		'5_CALLE LA ROCA_ENCONTRARTE_03 de TURISMO.jpg': avroca5,
		'6_Calle Roca Confiterias_01.jpg': avroca6,
		'7_istockphoto-1091469178-612x612.jpg': avroca7,
		'8_CALLE LA ROCA_ENCONTRARTE_05 de TURISMO.jpg': avroca8
	}
};

