// ===== IMPORTS =====
// Terminal
import terminal1 from './terminal/exterior.png?enhanced';
import terminal2 from './terminal/interior.png?enhanced';

// Forum
import forum1 from './forum/1_Forum 02.jpg?enhanced';
import forum2 from './forum/2_FORUM_03 de Tripadvisor.jpg?enhanced';
import forum3 from './forum/3_Forum 01.jpg?enhanced';
import forum4 from './forum/4_Forum 04.jpg?enhanced';
import forum5 from './forum/5_Forum_Santiago_del_Estero_3.jpeg?enhanced';
import forum6 from './forum/forum4.png?enhanced';

// Casa de Gobierno
import casagob1 from './casagob/1.jpg?enhanced';
import casagob2 from './casagob/aerea.JPG?enhanced';
import casagob3 from './casagob/casayparque2.JPG?enhanced';
import casagob4 from './casagob/casayparque3.JPG?enhanced';
import casagob5 from './casagob/casayplaza.png?enhanced';
import casagob6 from './casagob/estatuasanmartin.jpg?enhanced';
import casagob7 from './casagob/nocturna.jpg?enhanced';

// Plaza Vea
import plazavea1 from './plazavea/cinemas.png?enhanced';
import plazavea2 from './plazavea/comidas.jpg?enhanced';
import plazavea3 from './plazavea/exterior1.png?enhanced';
import plazavea4 from './plazavea/exterior2.png?enhanced';

// Parque Aguirre
import parqueaguirre1 from './parqueaguirre/aerea.png?enhanced';
import parqueaguirre2 from './parqueaguirre/calecita.png?enhanced';
import parqueaguirre3 from './parqueaguirre/deportes.png?enhanced';
import parqueaguirre4 from './parqueaguirre/guardavidas.png?enhanced';
import parqueaguirre5 from './parqueaguirre/juegos.png?enhanced';
import parqueaguirre6 from './parqueaguirre/recital.png?enhanced';
import parqueaguirre7 from './parqueaguirre/recital1.png?enhanced';

// Avenida Roca
import avroca1 from './avroca/1_Untitled-1.jpg?enhanced';
import avroca2 from './avroca/2__Calle Roca Confiterias_08.jpg?enhanced';
import avroca3 from './avroca/3__CALLE LA ROCA_ENCONTRARTE_02 de TURISMO.jpg?enhanced';
import avroca4 from './avroca/4_Calle Roca Confiterias_03.jpg?enhanced';
import avroca5 from './avroca/5_CALLE LA ROCA_ENCONTRARTE_03 de TURISMO.jpg?enhanced';
import avroca6 from './avroca/6_Calle Roca Confiterias_01.jpg?enhanced';
import avroca7 from './avroca/7_istockphoto-1091469178-612x612.jpg?enhanced';
import avroca8 from './avroca/8_CALLE LA ROCA_ENCONTRARTE_05 de TURISMO.jpg?enhanced';

// ===== EXPORTS =====
// Create mapping object: placeId -> filename -> enhanced image
export const PLACE_PHOTOS_MAP: Record<string, Record<string, any>> = {
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
	casagob: {
		'1.jpg': casagob1,
		'aerea.JPG': casagob2,
		'casayparque2.JPG': casagob3,
		'casayparque3.JPG': casagob4,
		'casayplaza.png': casagob5,
		'estatuasanmartin.jpg': casagob6,
		'nocturna.jpg': casagob7
	},
	plazavea: {
		'cinemas.png': plazavea1,
		'comidas.jpg': plazavea2,
		'exterior1.png': plazavea3,
		'exterior2.png': plazavea4
	},
	parqueaguirre: {
		'aerea.png': parqueaguirre1,
		'calecita.png': parqueaguirre2,
		'deportes.png': parqueaguirre3,
		'guardavidas.png': parqueaguirre4,
		'juegos.png': parqueaguirre5,
		'recital.png': parqueaguirre6,
		'recital1.png': parqueaguirre7
	},
	avroca: {
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

