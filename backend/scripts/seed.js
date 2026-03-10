const { MongoClient } = require('mongodb');
require('dotenv').config();

const ciudades = [
  { ciudad: 'Guatemala', pais: 'Guatemala', coords: [-90.5133, 14.6349] },
  { ciudad: 'Antigua Guatemala', pais: 'Guatemala', coords: [-90.7328, 14.5586] },
  { ciudad: 'Quetzaltenango', pais: 'Guatemala', coords: [-91.5183, 14.8444] },
  { ciudad: 'Escuintla', pais: 'Guatemala', coords: [-90.7856, 14.3050] },
  { ciudad: 'Cobán', pais: 'Guatemala', coords: [-90.3689, 15.4697] },
  { ciudad: 'Petén', pais: 'Guatemala', coords: [-89.8872, 16.9302] },
  { ciudad: 'Zacapa', pais: 'Guatemala', coords: [-89.5271, 14.9717] },
  { ciudad: 'Huehuetenango', pais: 'Guatemala', coords: [-91.4732, 15.3197] },
  { ciudad: 'Chiquimula', pais: 'Guatemala', coords: [-89.5398, 14.7994] },
  { ciudad: 'Retalhuleu', pais: 'Guatemala', coords: [-91.6771, 14.5394] },
  { ciudad: 'Mazatenango', pais: 'Guatemala', coords: [-91.5021, 14.5322] },
  { ciudad: 'Puerto Barrios', pais: 'Guatemala', coords: [-88.5945, 15.7286] },
];

// Cada restaurante tiene su tipo y menú coherente
const restaurantes = [
  // CHAPINES / TRADICIONALES
  {
    nombre: 'La Cocina Chapina',
    descripcion: 'Cocina tradicional guatemalteca con ingredientes frescos del mercado',
    tipo: 'tradicional',
    menu: [
      { nombre: 'Pollo en Pepián Rojo', descripcion: 'Pollo tierno en salsa tradicional de pepián con especias mayas', categoria: 'Plato fuerte', precio: 75 },
      { nombre: 'Kak\'ik de Pavo', descripcion: 'Caldo tradicional q\'eqchi\' con pavo y chile cobán', categoria: 'Plato fuerte', precio: 85 },
      { nombre: 'Tamales Colorados', descripcion: 'Tamales tradicionales en recado rojo con pollo y aceitunas', categoria: 'Antojo', precio: 20 },
      { nombre: 'Hilachas en Salsa', descripcion: 'Carne deshebrada en salsa de tomate con papa y güisquil', categoria: 'Plato fuerte', precio: 65 },
      { nombre: 'Pepián Verde con Pollo', descripcion: 'Pollo en salsa de pepitoria, cilantro y chile verde', categoria: 'Plato fuerte', precio: 70 },
      { nombre: 'Enchiladas Guatemaltecas', descripcion: 'Tostadas con carne, betabel, zanahoria y queso', categoria: 'Antojo', precio: 35 },
      { nombre: 'Sopa de Tortilla', descripcion: 'Caldo de tomate con tiras de tortilla y crema', categoria: 'Sopa', precio: 40 },
      { nombre: 'Desayuno Chapín Completo', descripcion: 'Huevos fritos, frijoles, plátanos, queso y tortillas', categoria: 'Desayuno', precio: 55 },
      { nombre: 'Atol de Elote', descripcion: 'Bebida caliente tradicional de maíz con canela', categoria: 'Bebida', precio: 20 },
      { nombre: 'Rellenitos de Plátano', descripcion: 'Plátano maduro relleno de frijol dulce y fritos', categoria: 'Postre', precio: 25 },
    ]
  },
  {
    nombre: 'Sazón Guatemalteco',
    descripcion: 'El mejor sazón chapín en un ambiente acogedor y familiar',
    tipo: 'tradicional',
    menu: [
      { nombre: 'Revolcado de Puerco', descripcion: 'Guiso tradicional de menudo de cerdo en recado negro', categoria: 'Plato fuerte', precio: 70 },
      { nombre: 'Caldo de Res', descripcion: 'Caldo sustancioso con res, papa, güisquil, zanahoria y elote', categoria: 'Sopa', precio: 65 },
      { nombre: 'Chiles Rellenos de Queso', descripcion: 'Chiles pimientos rellenos de queso en caldillo de tomate', categoria: 'Plato fuerte', precio: 60 },
      { nombre: 'Tostadas de Pollo', descripcion: 'Tostadas crujientes con pollo desmenuzado y guacamole', categoria: 'Antojo', precio: 30 },
      { nombre: 'Pupusas de Chicharrón', descripcion: 'Pupusas rellenas de chicharrón con curtido', categoria: 'Antojo', precio: 25 },
      { nombre: 'Shucos Guatemaltecos', descripcion: 'Hot dog chapín con salchicha, guacamol y mostaza', categoria: 'Antojo', precio: 30 },
      { nombre: 'Plátanos con Crema', descripcion: 'Plátanos maduros fritos con crema y frijoles negros', categoria: 'Desayuno', precio: 35 },
      { nombre: 'Horchata Guatemalteca', descripcion: 'Bebida tradicional de arroz con canela y vainilla', categoria: 'Bebida', precio: 18 },
      { nombre: 'Buñuelos con Miel', descripcion: 'Buñuelos fritos crujientes con miel de chancaca', categoria: 'Postre', precio: 28 },
      { nombre: 'Arroz con Leche', descripcion: 'Arroz cremoso con canela y pasas al estilo tradicional', categoria: 'Postre', precio: 25 },
    ]
  },
  {
    nombre: 'Casa de los Tamales',
    descripcion: 'Especialistas en tamales y antojitos guatemaltecos desde 1985',
    tipo: 'tradicional',
    menu: [
      { nombre: 'Tamales Colorados de Pollo', descripcion: 'Tamales en recado rojo con pollo, aceitunas y alcaparras', categoria: 'Antojo', precio: 22 },
      { nombre: 'Tamales Negros de Chocolate', descripcion: 'Tamales dulces en recado negro con ciruelas y chocolate', categoria: 'Antojo', precio: 25 },
      { nombre: 'Tamales de Rajas', descripcion: 'Tamales con rajas de chile pimiento y queso', categoria: 'Antojo', precio: 20 },
      { nombre: 'Chuchitos de Res', descripcion: 'Chuchitos pequeños rellenos de carne de res en salsa', categoria: 'Antojo', precio: 15 },
      { nombre: 'Tamalitos de Chipilín', descripcion: 'Tamalitos verdes con chipilín y queso fresco', categoria: 'Antojo', precio: 18 },
      { nombre: 'Sopa Negra de Frijol', descripcion: 'Sopa espesa de frijol negro con huevo y cilantro', categoria: 'Sopa', precio: 40 },
      { nombre: 'Atol de Masa', descripcion: 'Atol tradicional espeso de masa de maíz con canela', categoria: 'Bebida', precio: 18 },
      { nombre: 'Café Guatemalteco', descripcion: 'Café 100% guatemalteco de alta calidad', categoria: 'Bebida', precio: 20 },
    ]
  },
  {
    nombre: 'El Caldero Mágico',
    descripcion: 'Sopas y caldos tradicionales preparados con recetas de generaciones',
    tipo: 'tradicional',
    menu: [
      { nombre: 'Caldo de Pollo Criollo', descripcion: 'Caldo de pollo criollo con verduras frescas y hierbas', categoria: 'Sopa', precio: 55 },
      { nombre: 'Pozole Guatemalteco', descripcion: 'Pozole de maíz cacahuazintle con cerdo y chile', categoria: 'Sopa', precio: 65 },
      { nombre: 'Crema de Chipilín', descripcion: 'Sopa cremosa con chipilín fresco y queso seco', categoria: 'Sopa', precio: 50 },
      { nombre: 'Consomé de Pollo', descripcion: 'Caldo limpio de pollo con arroz y verduras finas', categoria: 'Sopa', precio: 45 },
      { nombre: 'Sopa de Lima', descripcion: 'Caldo de pollo con jugo de lima, tortilla y aguacate', categoria: 'Sopa', precio: 55 },
      { nombre: 'Pollo en Pepián', descripcion: 'Pollo en salsa de pepitoria y tomate asado', categoria: 'Plato fuerte', precio: 75 },
      { nombre: 'Fresco de Jamaica', descripcion: 'Agua fresca de flor de jamaica con azúcar de caña', categoria: 'Bebida', precio: 18 },
      { nombre: 'Tres Leches', descripcion: 'Bizcocho esponjoso empapado en tres tipos de leche', categoria: 'Postre', precio: 35 },
    ]
  },
  {
    nombre: 'Delicias Mayas',
    descripcion: 'Gastronomía maya auténtica rescatando recetas ancestrales',
    tipo: 'tradicional',
    menu: [
      { nombre: 'Kak\'ik Tradicional', descripcion: 'Sopa ceremonial maya con pavo, chile cobán y especias', categoria: 'Plato fuerte', precio: 90 },
      { nombre: 'Jocon de Pollo', descripcion: 'Pollo en salsa verde de miltomate, cilantro y pepitoria', categoria: 'Plato fuerte', precio: 80 },
      { nombre: 'Subanik', descripcion: 'Guiso maya de carnes mixtas envuelto en hoja de maxán', categoria: 'Plato fuerte', precio: 95 },
      { nombre: 'Tamalitos de Elote', descripcion: 'Tamalitos dulces de elote tierno envueltos en tuza', categoria: 'Antojo', precio: 20 },
      { nombre: 'Atol Shuco', descripcion: 'Atol fermentado de maíz negro con chile y pepitoria', categoria: 'Bebida', precio: 22 },
      { nombre: 'Tiste', descripcion: 'Bebida tradicional de cacao, maíz tostado y canela', categoria: 'Bebida', precio: 25 },
      { nombre: 'Molletes de Yema', descripcion: 'Pan dulce tradicional de yema de huevo y ajonjolí', categoria: 'Postre', precio: 15 },
    ]
  },

  // PARRILLA / CARNES
  {
    nombre: 'La Parrilla del Chef',
    descripcion: 'Cortes premium a las brasas con técnicas de parrilla argentina',
    tipo: 'parrilla',
    menu: [
      { nombre: 'Churrasco Guatemalteco', descripcion: 'Corte de res marinado a las brasas con chimichurri casero', categoria: 'Parrilla', precio: 120 },
      { nombre: 'Costillas de Cerdo Ahumadas', descripcion: 'Costillas ahumadas por 6 horas con salsa BBQ artesanal', categoria: 'Parrilla', precio: 135 },
      { nombre: 'Combo Parrillero Familiar', descripcion: 'Mix de res, cerdo y pollo a la parrilla para 2 personas', categoria: 'Parrilla', precio: 220 },
      { nombre: 'Filete de Res al Punto', descripcion: 'Filete tierno al punto deseado con mantequilla de hierbas', categoria: 'Parrilla', precio: 150 },
      { nombre: 'Pincho de Res y Pollo', descripcion: 'Brocheta mixta con pimientos, cebolla y chimichurri', categoria: 'Parrilla', precio: 95 },
      { nombre: 'Ensalada César', descripcion: 'Lechuga romana, crutones, queso parmesano y aderezo césar', categoria: 'Ensalada', precio: 55 },
      { nombre: 'Papas a la Parrilla', descripcion: 'Papas asadas con mantequilla, crema agria y cebollín', categoria: 'Entrada', precio: 45 },
      { nombre: 'Chimichurri con Pan', descripcion: 'Pan artesanal tostado con chimichurri de la casa', categoria: 'Entrada', precio: 35 },
      { nombre: 'Limonada Fresca', descripcion: 'Limonada natural con agua mineral y menta fresca', categoria: 'Bebida', precio: 25 },
      { nombre: 'Flan de Caramelo', descripcion: 'Flan cremoso artesanal con caramelo dorado', categoria: 'Postre', precio: 35 },
    ]
  },
  {
    nombre: 'La Churrasquería',
    descripcion: 'Especialistas en churrasco y carnes a la parrilla desde 1990',
    tipo: 'parrilla',
    menu: [
      { nombre: 'Churrasco con Loroco', descripcion: 'Churrasco de res con salsa de loroco y crema', categoria: 'Parrilla', precio: 115 },
      { nombre: 'Pollo Asado con Arroz', descripcion: 'Pollo marinado asado a las brasas con arroz y ensalada', categoria: 'Parrilla', precio: 80 },
      { nombre: 'Medallones de Res', descripcion: 'Medallones de res en salsa de vino tinto y champiñones', categoria: 'Parrilla', precio: 145 },
      { nombre: 'Costillas BBQ', descripcion: 'Costillas de cerdo ahumadas con salsa BBQ y puré de papa', categoria: 'Parrilla', precio: 130 },
      { nombre: 'Caldo de Res', descripcion: 'Caldo sustancioso con res, papa, güisquil y zanahoria', categoria: 'Sopa', precio: 65 },
      { nombre: 'Guacamole con Totopostes', descripcion: 'Aguacate fresco con totopostes crujientes', categoria: 'Entrada', precio: 45 },
      { nombre: 'Tres Leches', descripcion: 'Bizcocho esponjoso empapado en tres tipos de leche', categoria: 'Postre', precio: 38 },
      { nombre: 'Café Guatemalteco', descripcion: 'Café negro 100% guatemalteco', categoria: 'Bebida', precio: 20 },
    ]
  },
  {
    nombre: 'El Rancho',
    descripcion: 'Ambiente ranchero con los mejores asados y carnes del país',
    tipo: 'parrilla',
    menu: [
      { nombre: 'Arrachera a la Parrilla', descripcion: 'Arrachera marinada en cerveza y especias con guacamole', categoria: 'Parrilla', precio: 125 },
      { nombre: 'Pechuga Rellena de Jamón', descripcion: 'Pechuga rellena de jamón y queso a la parrilla', categoria: 'Parrilla', precio: 95 },
      { nombre: 'Tacos de Carne Asada', descripcion: 'Tacos de tortilla de maíz con carne asada y pico de gallo', categoria: 'Antojo', precio: 55 },
      { nombre: 'Sopa de Pollo', descripcion: 'Caldo de pollo con fideos, zanahoria y apio', categoria: 'Sopa', precio: 50 },
      { nombre: 'Chicharrón en Salsa Verde', descripcion: 'Chicharrón de cerdo en salsa de tomatillo', categoria: 'Entrada', precio: 55 },
      { nombre: 'Horchata', descripcion: 'Horchata de arroz con canela bien fría', categoria: 'Bebida', precio: 20 },
      { nombre: 'Brownie con Helado', descripcion: 'Brownie de chocolate caliente con helado de vainilla', categoria: 'Postre', precio: 45 },
    ]
  },

  // MARISCOS
  {
    nombre: 'Mariscos El Puerto',
    descripcion: 'Mariscos frescos traídos directamente del Pacífico guatemalteco',
    tipo: 'mariscos',
    menu: [
      { nombre: 'Ceviche de Camarones', descripcion: 'Camarones frescos marinados en limón con chile y cilantro', categoria: 'Entrada', precio: 75 },
      { nombre: 'Ceviche de Pescado', descripcion: 'Pescado fresco marinado en limón con cebolla y cilantro', categoria: 'Entrada', precio: 70 },
      { nombre: 'Coctel de Camarones', descripcion: 'Camarones en salsa de tomate con aguacate y limón', categoria: 'Entrada', precio: 80 },
      { nombre: 'Camarones al Ajillo', descripcion: 'Camarones saltados en mantequilla con ajo y limón', categoria: 'Mariscos', precio: 120 },
      { nombre: 'Camarones a la Plancha', descripcion: 'Camarones frescos a la plancha con mantequilla y limón', categoria: 'Mariscos', precio: 115 },
      { nombre: 'Pulpo a la Parrilla', descripcion: 'Pulpo tierno a la parrilla con aceite de oliva y páprika', categoria: 'Mariscos', precio: 145 },
      { nombre: 'Filete de Tilapia', descripcion: 'Tilapia fresca a la plancha con arroz y ensalada', categoria: 'Mariscos', precio: 95 },
      { nombre: 'Filete de Pescado al Mojo', descripcion: 'Filete de pescado fresco al mojo de ajo con vegetales', categoria: 'Mariscos', precio: 105 },
      { nombre: 'Aguachile de Camarones', descripcion: 'Camarones en salsa verde picante con pepino y cebolla', categoria: 'Mariscos', precio: 110 },
      { nombre: 'Limonada con Soda', descripcion: 'Limonada natural con agua mineral bien fría', categoria: 'Bebida', precio: 25 },
      { nombre: 'Jugo de Naranja Natural', descripcion: 'Jugo exprimido al momento de naranjas frescas', categoria: 'Bebida', precio: 28 },
    ]
  },
  {
    nombre: 'La Lancha',
    descripcion: 'El mejor pescado y mariscos frescos con vista al lago',
    tipo: 'mariscos',
    menu: [
      { nombre: 'Pescado Frito Entero', descripcion: 'Mojarra frita entera con ensalada y tortillas', categoria: 'Mariscos', precio: 90 },
      { nombre: 'Caldo de Mariscos', descripcion: 'Caldo rico con camarones, pescado y almejas', categoria: 'Sopa', precio: 95 },
      { nombre: 'Tacos de Pescado', descripcion: 'Tacos de tortilla con pescado frito, repollo y salsa', categoria: 'Antojo', precio: 60 },
      { nombre: 'Camarones Empanizados', descripcion: 'Camarones empanizados crujientes con salsa tártara', categoria: 'Mariscos', precio: 115 },
      { nombre: 'Ensalada de Mariscos', descripcion: 'Mix de mariscos sobre hojas verdes con aderezo cítrico', categoria: 'Ensalada', precio: 95 },
      { nombre: 'Fresco de Tamarindo', descripcion: 'Agua fresca de tamarindo dulce bien fría', categoria: 'Bebida', precio: 18 },
      { nombre: 'Cheesecake de Limón', descripcion: 'Cheesecake cremoso con toque de limón y base de galleta', categoria: 'Postre', precio: 45 },
    ]
  },

  // CAFÉ Y REPOSTERÍA
  {
    nombre: 'Café Antigua',
    descripcion: 'Café artesanal de alta montaña y repostería hecha con amor',
    tipo: 'cafe',
    menu: [
      { nombre: 'Café Guatemalteco Americano', descripcion: 'Café negro de altura 100% guatemalteco', categoria: 'Bebida', precio: 22 },
      { nombre: 'Cappuccino', descripcion: 'Espresso con leche vaporizada y espuma cremosa', categoria: 'Bebida', precio: 32 },
      { nombre: 'Latte de Vainilla', descripcion: 'Café con leche y sirope de vainilla artesanal', categoria: 'Bebida', precio: 35 },
      { nombre: 'Té de Hierbas', descripcion: 'Infusión de hierbas locales con miel de abeja', categoria: 'Bebida', precio: 20 },
      { nombre: 'Cheesecake de Fresa', descripcion: 'Cheesecake cremoso con coulis de fresa fresca', categoria: 'Postre', precio: 48 },
      { nombre: 'Brownie de Chocolate', descripcion: 'Brownie húmedo de chocolate con nueces', categoria: 'Postre', precio: 38 },
      { nombre: 'Pastel de Chocolate', descripcion: 'Pastel húmedo de chocolate con ganache y frutos rojos', categoria: 'Postre', precio: 45 },
      { nombre: 'Croissant de Mantequilla', descripcion: 'Croissant hojaldrado artesanal con mantequilla francesa', categoria: 'Desayuno', precio: 28 },
      { nombre: 'French Toast con Fresas', descripcion: 'Pan brioche bañado en huevo y canela con fresas frescas', categoria: 'Desayuno', precio: 55 },
      { nombre: 'Waffles con Miel', descripcion: 'Waffles crujientes con miel de maple y fruta fresca', categoria: 'Desayuno', precio: 58 },
    ]
  },
  {
    nombre: 'Café de la Plaza',
    descripcion: 'El café más emblemático del centro histórico, tradición desde 1978',
    tipo: 'cafe',
    menu: [
      { nombre: 'Café de Olla', descripcion: 'Café tradicional preparado en olla de barro con canela', categoria: 'Bebida', precio: 18 },
      { nombre: 'Café con Leche', descripcion: 'Café guatemalteco con leche caliente al gusto', categoria: 'Bebida', precio: 22 },
      { nombre: 'Chocolate Caliente', descripcion: 'Chocolate artesanal de cacao guatemalteco con leche', categoria: 'Bebida', precio: 28 },
      { nombre: 'Molletes de Yema', descripcion: 'Pan dulce tradicional de yema de huevo y ajonjolí', categoria: 'Desayuno', precio: 15 },
      { nombre: 'Tostadas con Frijol', descripcion: 'Pan tostado con frijol negro y queso fresco', categoria: 'Desayuno', precio: 30 },
      { nombre: 'Tres Leches', descripcion: 'Bizcocho casero empapado en tres leches con crema', categoria: 'Postre', precio: 35 },
      { nombre: 'Flan de Caramelo', descripcion: 'Flan casero con caramelo hecho en casa', categoria: 'Postre', precio: 30 },
      { nombre: 'Empanadas de Queso', descripcion: 'Empanadas fritas rellenas de queso derretido', categoria: 'Antojo', precio: 25 },
    ]
  },
  {
    nombre: 'The Smoothie Bar',
    descripcion: 'Smoothies, jugos naturales y bowls saludables para tu día',
    tipo: 'saludable',
    menu: [
      { nombre: 'Smoothie de Mango y Coco', descripcion: 'Smoothie cremoso de mango con leche de coco', categoria: 'Bebida', precio: 45 },
      { nombre: 'Smoothie Verde Detox', descripcion: 'Espinaca, manzana verde, pepino, limón y jengibre', categoria: 'Bebida', precio: 48 },
      { nombre: 'Smoothie de Fresa y Banana', descripcion: 'Fresas y banana con leche de almendra y miel', categoria: 'Bebida', precio: 42 },
      { nombre: 'Jugo de Naranja Natural', descripcion: 'Jugo exprimido al momento de naranjas frescas', categoria: 'Bebida', precio: 28 },
      { nombre: 'Jugo Verde', descripcion: 'Jugo de apio, pepino, espinaca y manzana verde', categoria: 'Bebida', precio: 35 },
      { nombre: 'Bowl de Açaí', descripcion: 'Bowl de açaí con granola, fresas, banana y miel', categoria: 'Desayuno', precio: 65 },
      { nombre: 'Bowl de Quinoa con Frutas', descripcion: 'Quinoa con frutas frescas, yogur y granola crujiente', categoria: 'Desayuno', precio: 60 },
      { nombre: 'Ensalada de Frutas', descripcion: 'Mix de frutas frescas de temporada con miel y limón', categoria: 'Postre', precio: 35 },
    ]
  },
  {
    nombre: 'Juice Factory',
    descripcion: 'Jugos prensados en frío y bebidas naturales sin conservantes',
    tipo: 'saludable',
    menu: [
      { nombre: 'Jugo Energizante', descripcion: 'Remolacha, zanahoria, naranja y jengibre prensados en frío', categoria: 'Bebida', precio: 40 },
      { nombre: 'Limonada con Chía', descripcion: 'Limonada natural con semillas de chía y menta', categoria: 'Bebida', precio: 30 },
      { nombre: 'Agua de Sandía', descripcion: 'Agua fresca de sandía con limón y sal de mar', categoria: 'Bebida', precio: 28 },
      { nombre: 'Kombucha de Jengibre', descripcion: 'Kombucha artesanal de jengibre y limón', categoria: 'Bebida', precio: 45 },
      { nombre: 'Bowl de Proteína', descripcion: 'Yogur griego, granola, frutos secos y miel de abeja', categoria: 'Desayuno', precio: 55 },
      { nombre: 'Tostadas de Aguacate', descripcion: 'Pan integral tostado con aguacate, limón y semillas', categoria: 'Desayuno', precio: 50 },
      { nombre: 'Ensalada de Aguacate', descripcion: 'Aguacate, tomate cherry, cebolla morada y limón', categoria: 'Ensalada', precio: 55 },
    ]
  },

  // VEGETARIANO / VEGANO
  {
    nombre: 'El Rincón Vegano',
    descripcion: 'Opciones veganas y vegetarianas deliciosas para toda la familia',
    tipo: 'vegano',
    menu: [
      { nombre: 'Bowl de Quinoa con Vegetales', descripcion: 'Quinoa con vegetales asados, aguacate y aderezo de tahini', categoria: 'Vegetariano', precio: 70 },
      { nombre: 'Curry de Garbanzos', descripcion: 'Garbanzos en curry con leche de coco y arroz basmati', categoria: 'Vegetariano', precio: 75 },
      { nombre: 'Tacos de Frijol y Aguacate', descripcion: 'Tacos con frijoles negros, aguacate y pico de gallo', categoria: 'Antojo', precio: 50 },
      { nombre: 'Wrap Vegetal', descripcion: 'Tortilla de harina con hummus, vegetales y lechuga', categoria: 'Vegetariano', precio: 60 },
      { nombre: 'Pizza Margarita', descripcion: 'Pizza con salsa de tomate, mozzarella vegana y albahaca', categoria: 'Vegetariano', precio: 80 },
      { nombre: 'Ensalada Caprese Vegana', descripcion: 'Tomate, mozzarella de anacardo, albahaca y aceite de oliva', categoria: 'Ensalada', precio: 60 },
      { nombre: 'Sopa de Lentejas', descripcion: 'Sopa cremosa de lentejas rojas con especias y limón', categoria: 'Sopa', precio: 55 },
      { nombre: 'Smoothie Verde', descripcion: 'Espinaca, manzana, pepino y jengibre', categoria: 'Bebida', precio: 40 },
      { nombre: 'Cheesecake Vegano', descripcion: 'Cheesecake de anacardos con base de dátiles y frutos secos', categoria: 'Postre', precio: 50 },
    ]
  },
  {
    nombre: 'Green Kitchen',
    descripcion: 'Cocina saludable con ingredientes orgánicos locales',
    tipo: 'saludable',
    menu: [
      { nombre: 'Ensalada de Pollo a la Plancha', descripcion: 'Pollo asado sobre mix de lechugas con aderezo honey mustard', categoria: 'Ensalada', precio: 75 },
      { nombre: 'Ensalada Mixta de la Casa', descripcion: 'Mix de lechugas, tomate, zanahoria y aderezo de la casa', categoria: 'Ensalada', precio: 55 },
      { nombre: 'Bowl Fitness de Quinoa', descripcion: 'Quinoa, pollo grillado, aguacate y vegetales asados', categoria: 'Plato fuerte', precio: 85 },
      { nombre: 'Wrap de Pollo y Aguacate', descripcion: 'Tortilla integral con pollo, aguacate, lechuga y tomate', categoria: 'Antojo', precio: 65 },
      { nombre: 'Omelette de Vegetales', descripcion: 'Omelette con champiñones, espinaca, tomate y queso', categoria: 'Desayuno', precio: 60 },
      { nombre: 'Smoothie de Proteína', descripcion: 'Banana, mantequilla de maní, proteína y leche de almendra', categoria: 'Bebida', precio: 50 },
      { nombre: 'Agua de Pepino y Menta', descripcion: 'Agua detox de pepino, menta y limón', categoria: 'Bebida', precio: 22 },
    ]
  },
  {
    nombre: 'Healthy Bowl',
    descripcion: 'Bowls nutritivos y balanceados para un estilo de vida saludable',
    tipo: 'saludable',
    menu: [
      { nombre: 'Bowl Hawaiano', descripcion: 'Arroz, salmón, mango, aguacate y salsa ponzu', categoria: 'Plato fuerte', precio: 110 },
      { nombre: 'Bowl Mediterráneo', descripcion: 'Quinoa, garbanzos, pepino, tomate y aderezo de yogur', categoria: 'Plato fuerte', precio: 90 },
      { nombre: 'Bowl de Açaí', descripcion: 'Açaí con granola, fresas, banana y miel', categoria: 'Desayuno', precio: 65 },
      { nombre: 'Bowl Thai de Pollo', descripcion: 'Pollo en salsa de maní con fideos de arroz y vegetales', categoria: 'Plato fuerte', precio: 95 },
      { nombre: 'Ensalada César Light', descripcion: 'Lechuga romana, pollo grillado y aderezo césar light', categoria: 'Ensalada', precio: 70 },
      { nombre: 'Jugo Verde Detox', descripcion: 'Espinaca, pepino, apio, manzana y limón', categoria: 'Bebida', precio: 38 },
      { nombre: 'Granola con Yogur', descripcion: 'Yogur griego con granola artesanal y frutos del bosque', categoria: 'Desayuno', precio: 55 },
    ]
  },

  // ITALIANA / PASTA
  {
    nombre: 'Trattoria Bella Italia',
    descripcion: 'Pasta artesanal y pizza napolitana al horno de leña',
    tipo: 'italiana',
    menu: [
      { nombre: 'Spaghetti Carbonara', descripcion: 'Spaghetti con huevo, panceta, queso pecorino y pimienta negra', categoria: 'Pasta', precio: 95 },
      { nombre: 'Pasta Alfredo con Pollo', descripcion: 'Fettuccine en salsa cremosa con pollo y parmesano', categoria: 'Pasta', precio: 100 },
      { nombre: 'Lasaña de Carne', descripcion: 'Capas de pasta, carne molida, bechamel y queso gratinado', categoria: 'Pasta', precio: 110 },
      { nombre: 'Pasta al Pesto Genovese', descripcion: 'Pasta con salsa de albahaca fresca, piñones y parmesano', categoria: 'Pasta', precio: 90 },
      { nombre: 'Pizza Margarita', descripcion: 'Pizza con salsa de tomate San Marzano, mozzarella y albahaca', categoria: 'Plato fuerte', precio: 100 },
      { nombre: 'Pizza Pepperoni', descripcion: 'Pizza con salsa de tomate, mozzarella y pepperoni', categoria: 'Plato fuerte', precio: 115 },
      { nombre: 'Risotto de Champiñones', descripcion: 'Risotto cremoso con champiñones porcini y parmesano', categoria: 'Plato fuerte', precio: 105 },
      { nombre: 'Bruschetta al Tomate', descripcion: 'Pan tostado con tomate, ajo, albahaca y aceite de oliva', categoria: 'Entrada', precio: 45 },
      { nombre: 'Tiramisú', descripcion: 'Postre clásico italiano con mascarpone y café espresso', categoria: 'Postre', precio: 55 },
      { nombre: 'Panna Cotta', descripcion: 'Crema italiana con coulis de frutos rojos', categoria: 'Postre', precio: 50 },
      { nombre: 'Limonada Italiana', descripcion: 'Limonata fresca con agua con gas y limones sicilianos', categoria: 'Bebida', precio: 30 },
    ]
  },
  {
    nombre: 'La Pizzería Napolitana',
    descripcion: 'Pizza auténtica napolitana con masa de fermentación lenta 48 horas',
    tipo: 'italiana',
    menu: [
      { nombre: 'Pizza Margherita DOC', descripcion: 'Tomate San Marzano, fior di latte y albahaca fresca', categoria: 'Plato fuerte', precio: 105 },
      { nombre: 'Pizza Diavola', descripcion: 'Salame piccante, mozzarella y chile en aceite', categoria: 'Plato fuerte', precio: 120 },
      { nombre: 'Pizza Quattro Stagioni', descripcion: 'Jamón, alcachofas, champiñones y aceitunas', categoria: 'Plato fuerte', precio: 125 },
      { nombre: 'Calzone de Ricotta', descripcion: 'Calzone relleno de ricotta, jamón y mozzarella', categoria: 'Plato fuerte', precio: 115 },
      { nombre: 'Focaccia con Romero', descripcion: 'Pan focaccia con romero fresco, sal gruesa y aceite', categoria: 'Entrada', precio: 40 },
      { nombre: 'Ensalada Italiana', descripcion: 'Rúcula, tomate cherry, parmesano y prosciutto', categoria: 'Ensalada', precio: 70 },
      { nombre: 'Tiramisú Casero', descripcion: 'Tiramisú tradicional con bizcochos savoiardi y mascarpone', categoria: 'Postre', precio: 55 },
      { nombre: 'Agua con Gas Italiana', descripcion: 'Agua mineral italiana con gas bien fría', categoria: 'Bebida', precio: 25 },
    ]
  },

  // ASIÁTICA
  {
    nombre: 'Ramen House',
    descripcion: 'Ramen auténtico japonés con caldos preparados por 12 horas',
    tipo: 'japonesa',
    menu: [
      { nombre: 'Ramen Tonkotsu', descripcion: 'Caldo cremoso de hueso de cerdo con chashu, huevo y nori', categoria: 'Plato fuerte', precio: 115 },
      { nombre: 'Ramen Shoyu', descripcion: 'Caldo de soya con pollo, bambú, naruto y cebollín', categoria: 'Plato fuerte', precio: 105 },
      { nombre: 'Ramen Miso Vegetariano', descripcion: 'Caldo de miso con tofu, champiñones y vegetales', categoria: 'Plato fuerte', precio: 100 },
      { nombre: 'Gyoza de Cerdo', descripcion: 'Dumplings de cerdo y repollo fritos con salsa ponzu', categoria: 'Entrada', precio: 55 },
      { nombre: 'Karaage de Pollo', descripcion: 'Pollo frito japonés con mayonesa de yuzu y limón', categoria: 'Entrada', precio: 65 },
      { nombre: 'Takoyaki', descripcion: 'Bolitas de pulpo con salsa okonomiyaki y bonito seco', categoria: 'Entrada', precio: 60 },
      { nombre: 'Onigiri de Salmón', descripcion: 'Bola de arroz japonés rellena de salmón y envuelta en nori', categoria: 'Antojo', precio: 35 },
      { nombre: 'Té Verde Matcha', descripcion: 'Té matcha japonés preparado al estilo tradicional', categoria: 'Bebida', precio: 30 },
      { nombre: 'Mochi de Fresa', descripcion: 'Pastelito japonés de arroz glutinoso relleno de fresa', categoria: 'Postre', precio: 35 },
    ]
  },
  {
    nombre: 'Sushi Fusion',
    descripcion: 'Sushi tradicional y rolls de autor con ingredientes locales',
    tipo: 'japonesa',
    menu: [
      { nombre: 'Roll California', descripcion: 'Cangrejo, aguacate y pepino con sésamo tostado', categoria: 'Mariscos', precio: 75 },
      { nombre: 'Roll Spicy Tuna', descripcion: 'Atún fresco con mayo picante y jalapeño', categoria: 'Mariscos', precio: 90 },
      { nombre: 'Roll Dragón', descripcion: 'Camarón tempura cubierto de aguacate y salsa anguila', categoria: 'Mariscos', precio: 95 },
      { nombre: 'Sashimi de Salmón', descripcion: 'Láminas frescas de salmón noruego con wasabi y jengibre', categoria: 'Mariscos', precio: 110 },
      { nombre: 'Nigiri Mix', descripcion: 'Mix de 8 piezas de nigiri de salmón, atún y camarón', categoria: 'Mariscos', precio: 120 },
      { nombre: 'Edamame', descripcion: 'Frijoles de soya al vapor con sal de mar', categoria: 'Entrada', precio: 35 },
      { nombre: 'Sopa Miso', descripcion: 'Sopa tradicional de miso con tofu y alga wakame', categoria: 'Sopa', precio: 40 },
      { nombre: 'Té de Jazmín', descripcion: 'Té verde de jazmín caliente o frío', categoria: 'Bebida', precio: 28 },
      { nombre: 'Mochi de Mango', descripcion: 'Pastelito japonés de arroz glutinoso con mango tropical', categoria: 'Postre', precio: 38 },
    ]
  },
  {
    nombre: 'Thai Garden',
    descripcion: 'Cocina tailandesa auténtica con especias importadas directo de Bangkok',
    tipo: 'tailandesa',
    menu: [
      { nombre: 'Pad Thai de Camarones', descripcion: 'Fideos de arroz salteados con camarones, huevo y cacahuates', categoria: 'Plato fuerte', precio: 110 },
      { nombre: 'Green Curry con Pollo', descripcion: 'Curry verde tailandés con pollo, leche de coco y albahaca thai', categoria: 'Plato fuerte', precio: 105 },
      { nombre: 'Tom Yum de Camarones', descripcion: 'Sopa picante y ácida con camarones, champiñones y hierba limón', categoria: 'Sopa', precio: 90 },
      { nombre: 'Satay de Pollo', descripcion: 'Brochetas de pollo marinado con salsa de maní', categoria: 'Entrada', precio: 65 },
      { nombre: 'Rolls Primavera Thai', descripcion: 'Rolls frescos con vegetales, tofu y salsa de ciruela', categoria: 'Entrada', precio: 55 },
      { nombre: 'Arroz Frito con Piña', descripcion: 'Arroz jasmine frito con piña, camarones y curry en polvo', categoria: 'Plato fuerte', precio: 95 },
      { nombre: 'Té Thai con Leche', descripcion: 'Té negro tailandés con leche condensada y hielo', categoria: 'Bebida', precio: 35 },
      { nombre: 'Mango Sticky Rice', descripcion: 'Arroz glutinoso con mango fresco y leche de coco', categoria: 'Postre', precio: 50 },
    ]
  },

  // ÁRABE / MEDIO ORIENTE
  {
    nombre: 'El Shawarma',
    descripcion: 'Shawarma auténtico y comida árabe preparada con especias originales',
    tipo: 'arabe',
    menu: [
      { nombre: 'Shawarma de Pollo', descripcion: 'Pollo marinado en especias árabes con garlic sauce y vegetales', categoria: 'Antojo', precio: 65 },
      { nombre: 'Shawarma de Res', descripcion: 'Carne de res marinada con tahini, pepino y tomate', categoria: 'Antojo', precio: 75 },
      { nombre: 'Falafel en Pan Pita', descripcion: 'Falafel crujiente con hummus, lechuga y salsa de yogur', categoria: 'Antojo', precio: 60 },
      { nombre: 'Hummus con Pan Pita', descripcion: 'Hummus cremoso de garbanzo con aceite de oliva y paprika', categoria: 'Entrada', precio: 45 },
      { nombre: 'Ensalada Taboulé', descripcion: 'Bulgur con perejil, menta, tomate y aderezo de limón', categoria: 'Ensalada', precio: 50 },
      { nombre: 'Kibbeh Frito', descripcion: 'Croquetas de carne molida con trigo bulgur y especias', categoria: 'Entrada', precio: 55 },
      { nombre: 'Té de Menta Árabe', descripcion: 'Té negro con menta fresca bien azucarado al estilo árabe', categoria: 'Bebida', precio: 22 },
      { nombre: 'Baklava', descripcion: 'Pastelito árabe de hojaldre con nueces y miel de rosas', categoria: 'Postre', precio: 35 },
    ]
  },
  {
    nombre: 'Falafel & Co',
    descripcion: 'Comida del Medio Oriente fresca y sabrosa para llevar o comer aquí',
    tipo: 'arabe',
    menu: [
      { nombre: 'Bowl de Falafel', descripcion: 'Falafel sobre arroz, hummus, taboulé y salsa de yogur', categoria: 'Plato fuerte', precio: 80 },
      { nombre: 'Wrap de Falafel', descripcion: 'Tortilla árabe con falafel, lechuga, tomate y tahini', categoria: 'Antojo', precio: 65 },
      { nombre: 'Plato de Mezze', descripcion: 'Hummus, babaganoush, falafel y pan pita tostado', categoria: 'Entrada', precio: 90 },
      { nombre: 'Ensalada Griega', descripcion: 'Pepino, tomate, aceitunas, queso feta y orégano', categoria: 'Ensalada', precio: 60 },
      { nombre: 'Lenteja Roja con Especias', descripcion: 'Sopa cremosa de lenteja roja con comino y limón', categoria: 'Sopa', precio: 55 },
      { nombre: 'Limonada de Menta', descripcion: 'Limonada fresca con menta fresca y agua mineral', categoria: 'Bebida', precio: 28 },
      { nombre: 'Baklava de Pistacho', descripcion: 'Baklava con pistacho molido y miel de azahar', categoria: 'Postre', precio: 38 },
    ]
  },

  // HAMBURGUESAS
  {
    nombre: 'Burger Lab',
    descripcion: 'Hamburguesas smash artesanales con ingredientes premium',
    tipo: 'hamburguesas',
    menu: [
      { nombre: 'Smash Burger Clásica', descripcion: 'Carne de res smash, queso american, lechuga, tomate y pepinillo', categoria: 'Plato fuerte', precio: 85 },
      { nombre: 'BBQ Bacon Burger', descripcion: 'Doble smash con bacon crujiente, queso cheddar y salsa BBQ', categoria: 'Plato fuerte', precio: 105 },
      { nombre: 'Mushroom Swiss Burger', descripcion: 'Smash con champiñones salteados y queso suizo derretido', categoria: 'Plato fuerte', precio: 95 },
      { nombre: 'Spicy Jalapeño Burger', descripcion: 'Smash con jalapeños encurtidos, queso pepper jack y mayo picante', categoria: 'Plato fuerte', precio: 90 },
      { nombre: 'Veggie Burger', descripcion: 'Medallón de garbanzos y vegetales con aguacate y pico de gallo', categoria: 'Vegetariano', precio: 80 },
      { nombre: 'Papas Fritas Crujientes', descripcion: 'Papas fritas en aceite fresco con sal de mar', categoria: 'Entrada', precio: 35 },
      { nombre: 'Aros de Cebolla', descripcion: 'Aros de cebolla empanizados con salsa ranch', categoria: 'Entrada', precio: 40 },
      { nombre: 'Milkshake de Chocolate', descripcion: 'Milkshake espeso de chocolate con helado artesanal', categoria: 'Bebida', precio: 55 },
      { nombre: 'Milkshake de Vainilla', descripcion: 'Milkshake cremoso de vainilla con crema batida', categoria: 'Bebida', precio: 50 },
    ]
  },
  {
    nombre: 'Smash & Go',
    descripcion: 'Smash burgers rápidas y deliciosas para comer aquí o llevar',
    tipo: 'hamburguesas',
    menu: [
      { nombre: 'Classic Smash', descripcion: 'Smash de res con queso americano, lechuga y ketchup', categoria: 'Plato fuerte', precio: 75 },
      { nombre: 'Double Smash', descripcion: 'Doble smash de res con doble queso y salsa especial', categoria: 'Plato fuerte', precio: 95 },
      { nombre: 'Chicken Crispy', descripcion: 'Pechuga de pollo empanizada crujiente con coleslaw', categoria: 'Plato fuerte', precio: 80 },
      { nombre: 'Hot Dog Gourmet', descripcion: 'Salchicha artesanal con cebolla caramelizada y mostaza dijon', categoria: 'Antojo', precio: 60 },
      { nombre: 'Papas con Queso', descripcion: 'Papas fritas cubiertas con queso cheddar fundido', categoria: 'Entrada', precio: 45 },
      { nombre: 'Coca Cola', descripcion: 'Refresco frío bien servido', categoria: 'Bebida', precio: 18 },
      { nombre: 'Agua Pura', descripcion: 'Agua purificada fría', categoria: 'Bebida', precio: 12 },
    ]
  },
  {
    nombre: 'La Hamburguesería',
    descripcion: 'Hamburguesas artesanales con pan brioche horneado diariamente',
    tipo: 'hamburguesas',
    menu: [
      { nombre: 'Burger Chapina', descripcion: 'Hamburguesa con guacamol, frijoles negros y queso seco', categoria: 'Plato fuerte', precio: 90 },
      { nombre: 'Truffle Burger', descripcion: 'Burger con queso brie, arúgula y mayonesa de trufa', categoria: 'Plato fuerte', precio: 120 },
      { nombre: 'Pollo al Limón Burger', descripcion: 'Pollo grillado con tzatziki, lechuga y tomate', categoria: 'Plato fuerte', precio: 85 },
      { nombre: 'Papas Especiadas', descripcion: 'Papas con mezcla de especias cajún y dip de chipotle', categoria: 'Entrada', precio: 40 },
      { nombre: 'Ensalada Coleslaw', descripcion: 'Repollo, zanahoria y aderezo cremoso de la casa', categoria: 'Ensalada', precio: 35 },
      { nombre: 'Limonada de Coco', descripcion: 'Limonada con leche de coco y agua mineral', categoria: 'Bebida', precio: 35 },
      { nombre: 'Cheesecake de Oreo', descripcion: 'Cheesecake cremoso con galletas oreo trituradas', categoria: 'Postre', precio: 50 },
    ]
  },

  // INTERNACIONAL / FUSIÓN
  {
    nombre: 'Sabores del Mundo',
    descripcion: 'Fusión de sabores internacionales en el corazón de la ciudad',
    tipo: 'fusion',
    menu: [
      { nombre: 'Tacos Coreanos de Bulgogi', descripcion: 'Tacos de tortilla con carne bulgogi, kimchi y mayo de gochujang', categoria: 'Antojo', precio: 85 },
      { nombre: 'Bowl Hawaiano de Atún', descripcion: 'Arroz, atún marinado, mango, aguacate y salsa ponzu', categoria: 'Plato fuerte', precio: 110 },
      { nombre: 'Ceviche Nikkei', descripcion: 'Ceviche de pescado con influencia japonesa, leche de tigre y wasabi', categoria: 'Entrada', precio: 90 },
      { nombre: 'Pasta con Pesto de Loroco', descripcion: 'Pasta fresca con pesto de loroco y queso parmesano', categoria: 'Pasta', precio: 95 },
      { nombre: 'Burger de Pulled Pork', descripcion: 'Pan brioche con cerdo deshebrado ahumado y coleslaw asiático', categoria: 'Plato fuerte', precio: 105 },
      { nombre: 'Ensalada Thai de Mango', descripcion: 'Mango verde, cacahuates, cilantro y aderezo thai de limón', categoria: 'Ensalada', precio: 70 },
      { nombre: 'Limonada de Maracuyá', descripcion: 'Limonada con pulpa de maracuyá y agua mineral', categoria: 'Bebida', precio: 35 },
      { nombre: 'Brownie con Salsa de Miso', descripcion: 'Brownie de chocolate con salsa de miso caramelizado', categoria: 'Postre', precio: 55 },
    ]
  },
  {
    nombre: 'Cocina de Autor',
    descripcion: 'Cocina de autor con ingredientes locales y técnicas modernas',
    tipo: 'fusion',
    menu: [
      { nombre: 'Carpaccio de Res Local', descripcion: 'Res local en carpaccio con alcaparras, parmesano y rúcula', categoria: 'Entrada', precio: 95 },
      { nombre: 'Crema de Güisquil con Loroco', descripcion: 'Crema suave de güisquil con aceite de loroco y croutons', categoria: 'Sopa', precio: 65 },
      { nombre: 'Pato en Recado Negro Moderno', descripcion: 'Pato confitado en recado negro guatemalteco con puré de malanga', categoria: 'Plato fuerte', precio: 165 },
      { nombre: 'Tilapia con Salsa de Chipilín', descripcion: 'Tilapia local con emulsión de chipilín y verduras de temporada', categoria: 'Mariscos', precio: 130 },
      { nombre: 'Risotto de Loroco', descripcion: 'Risotto cremoso con loroco fresco y queso blanco guatemalteco', categoria: 'Plato fuerte', precio: 120 },
      { nombre: 'Tabla de Quesos Locales', descripcion: 'Selección de quesos guatemaltecos con mermeladas artesanales', categoria: 'Entrada', precio: 110 },
      { nombre: 'Café de Especialidad V60', descripcion: 'Café guatemalteco de altura preparado en V60', categoria: 'Bebida', precio: 45 },
      { nombre: 'Coulant de Chocolate', descripcion: 'Volcán de chocolate con helado de vainilla y sal de mar', categoria: 'Postre', precio: 75 },
    ]
  },

  // DESAYUNOS
  {
    nombre: 'Panadería San José',
    descripcion: 'Pan artesanal horneado diariamente y desayunos tradicionales',
    tipo: 'panaderia',
    menu: [
      { nombre: 'Pan de Yema', descripcion: 'Pan dulce tradicional de yema de huevo recién horneado', categoria: 'Desayuno', precio: 8 },
      { nombre: 'Pan de Mantequilla', descripcion: 'Pan suave de mantequilla horneado al momento', categoria: 'Desayuno', precio: 10 },
      { nombre: 'Desayuno Completo', descripcion: 'Huevos al gusto, frijoles, crema, queso y pan recién horneado', categoria: 'Desayuno', precio: 55 },
      { nombre: 'Tostadas con Frijol', descripcion: 'Pan tostado artesanal con frijol negro y queso fresco', categoria: 'Desayuno', precio: 35 },
      { nombre: 'Atol de Plátano', descripcion: 'Atol dulce de plátano maduro con canela', categoria: 'Bebida', precio: 20 },
      { nombre: 'Café con Leche', descripcion: 'Café guatemalteco con leche caliente al gusto', categoria: 'Bebida', precio: 20 },
      { nombre: 'Tres Leches Casero', descripcion: 'Tres leches horneado artesanalmente cada mañana', categoria: 'Postre', precio: 30 },
      { nombre: 'Quesadilla Salvadoreña', descripcion: 'Quesadilla de queso seco y azúcar recién horneada', categoria: 'Postre', precio: 18 },
    ]
  },
  {
    nombre: 'Dulces Típicos',
    descripcion: 'Dulces y postres tradicionales guatemaltecos hechos a mano',
    tipo: 'reposteria',
    menu: [
      { nombre: 'Camotes en Dulce', descripcion: 'Camotes cocidos en miel de panela con canela', categoria: 'Postre', precio: 20 },
      { nombre: 'Plátanos en Gloria', descripcion: 'Plátanos maduros cocidos en almíbar con pasas y canela', categoria: 'Postre', precio: 22 },
      { nombre: 'Mazapán de Pepitoria', descripcion: 'Mazapán tradicional de pepitoria y azúcar', categoria: 'Postre', precio: 15 },
      { nombre: 'Cocadas de Coco', descripcion: 'Dulce artesanal de coco rallado con azúcar y vainilla', categoria: 'Postre', precio: 12 },
      { nombre: 'Buñuelos de Viento', descripcion: 'Buñuelos esponjosos con miel de chancaca y canela', categoria: 'Postre', precio: 25 },
      { nombre: 'Manjar de Leche', descripcion: 'Manjar cremoso de leche con canela y vainilla', categoria: 'Postre', precio: 18 },
      { nombre: 'Atol de Masa con Canela', descripcion: 'Atol espeso de masa de maíz con canela y azúcar', categoria: 'Bebida', precio: 18 },
      { nombre: 'Chocolate de Agua', descripcion: 'Chocolate de cacao puro guatemalteco con agua caliente', categoria: 'Bebida', precio: 20 },
    ]
  },
  {
    nombre: 'Heladería Central',
    descripcion: 'Helados artesanales con sabores tradicionales y tropicales',
    tipo: 'heladeria',
    menu: [
      { nombre: 'Helado de Mango', descripcion: 'Helado artesanal de mango Manila con trozos de fruta', categoria: 'Postre', precio: 25 },
      { nombre: 'Helado de Coco', descripcion: 'Helado cremoso de coco con coco rallado tostado', categoria: 'Postre', precio: 25 },
      { nombre: 'Helado de Fresa', descripcion: 'Helado de fresa natural con trozos de fresa fresca', categoria: 'Postre', precio: 25 },
      { nombre: 'Helado de Chocolate', descripcion: 'Helado de chocolate oscuro con chips de chocolate', categoria: 'Postre', precio: 28 },
      { nombre: 'Copa de Helado Mixta', descripcion: 'Tres bolas de helado a elección con crema y cereza', categoria: 'Postre', precio: 55 },
      { nombre: 'Banana Split', descripcion: 'Banana con tres helados, crema, chocolate y nueces', categoria: 'Postre', precio: 65 },
      { nombre: 'Malteada de Fresa', descripcion: 'Malteada cremosa de fresa con helado artesanal', categoria: 'Bebida', precio: 45 },
      { nombre: 'Malteada de Vainilla', descripcion: 'Malteada de vainilla con helado y crema batida', categoria: 'Bebida', precio: 45 },
    ]
  },

  // FONDA / FAMILIAR
  {
    nombre: 'La Fonda Colonial',
    descripcion: 'Ambiente colonial y sabores que te transportan a la Guatemala de antes',
    tipo: 'tradicional',
    menu: [
      { nombre: 'Menú del Día', descripcion: 'Sopa, plato fuerte con arroz y frijoles, fresco y tortillas', categoria: 'Plato fuerte', precio: 55 },
      { nombre: 'Pollo Asado con Loroco', descripcion: 'Pollo asado en salsa de loroco con arroz y tortillas', categoria: 'Plato fuerte', precio: 70 },
      { nombre: 'Carne en Jocon', descripcion: 'Carne de res en salsa verde de miltomate y cilantro', categoria: 'Plato fuerte', precio: 75 },
      { nombre: 'Sopa de Lima con Pollo', descripcion: 'Caldo de pollo con lima, tortilla y aguacate', categoria: 'Sopa', precio: 50 },
      { nombre: 'Frijoles con Chicharrón', descripcion: 'Frijoles negros con chicharrón crujiente y tortillas', categoria: 'Antojo', precio: 40 },
      { nombre: 'Fresco de Horchata', descripcion: 'Horchata de arroz con canela bien fría', categoria: 'Bebida', precio: 15 },
      { nombre: 'Fresco de Tamarindo', descripcion: 'Agua fresca de tamarindo natural', categoria: 'Bebida', precio: 15 },
    ]
  },
  {
    nombre: 'La Mesa Grande',
    descripcion: 'La mesa donde cabe toda la familia, comida casera con sazón de abuela',
    tipo: 'tradicional',
    menu: [
      { nombre: 'Pollo en Crema con Loroco', descripcion: 'Pollo tierno en salsa de crema con loroco fresco', categoria: 'Plato fuerte', precio: 70 },
      { nombre: 'Caldo de Gallina India', descripcion: 'Caldo de gallina criolla con verduras del huerto', categoria: 'Sopa', precio: 75 },
      { nombre: 'Arroz con Leche Casero', descripcion: 'Arroz cremoso con leche, canela y pasas al estilo de abuela', categoria: 'Postre', precio: 25 },
      { nombre: 'Tostadas de Guacamol', descripcion: 'Tostadas con guacamol, pollo y zanahoria curtida', categoria: 'Antojo', precio: 30 },
      { nombre: 'Desayuno Familiar', descripcion: 'Huevos revueltos con jamón, frijoles, plátanos y tortillas', categoria: 'Desayuno', precio: 60 },
      { nombre: 'Limonada Natural', descripcion: 'Limonada hecha al momento con limones frescos', categoria: 'Bebida', precio: 15 },
      { nombre: 'Flan Casero', descripcion: 'Flan de huevo hecho en casa con caramelo', categoria: 'Postre', precio: 28 },
    ]
  },
  {
    nombre: 'El Sabor Nuestro',
    descripcion: 'Recetas familiares transmitidas por generaciones con ingredientes locales',
    tipo: 'tradicional',
    menu: [
      { nombre: 'Pepián de Res', descripcion: 'Carne de res en espesa salsa de pepitoria y tomate', categoria: 'Plato fuerte', precio: 80 },
      { nombre: 'Jocón de Pollo', descripcion: 'Pollo en salsa verde de miltomate y hierbas frescas', categoria: 'Plato fuerte', precio: 75 },
      { nombre: 'Sopa de Fideo con Pollo', descripcion: 'Sopa de fideo en caldo de pollo con zanahoria y apio', categoria: 'Sopa', precio: 45 },
      { nombre: 'Tamales de Rajas', descripcion: 'Tamales con rajas de chile pimiento y queso', categoria: 'Antojo', precio: 22 },
      { nombre: 'Molletes Chapines', descripcion: 'Pan tostado con frijoles y queso derretido', categoria: 'Desayuno', precio: 35 },
      { nombre: 'Café Negro Guatemalteco', descripcion: 'Café negro de alta montaña sin azúcar', categoria: 'Bebida', precio: 18 },
      { nombre: 'Tres Leches Tradicional', descripcion: 'Pastel tres leches con receta de la abuela', categoria: 'Postre', precio: 32 },
    ]
  },
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    console.log('Conectado. Iniciando seed...\n');

    await db.collection('articulos_menu').deleteMany({});
    console.log('✓ Colección articulos_menu limpiada');
    await db.collection('restaurantes').deleteMany({});
    console.log('✓ Colección restaurantes limpiada');

    // Insertar restaurantes con ubicación aleatoria por ciudad
    const restaurantesDocs = restaurantes.map((r) => {
      const ciudad = randomItem(ciudades);
      return {
        nombre: r.nombre,
        descripcion: r.descripcion,
        direccion: {
          calle: `${randomInt(1, 30)}a Calle ${randomInt(1, 20)}-${randomInt(10, 99)}`,
          ciudad: ciudad.ciudad,
          pais: ciudad.pais
        },
        ubicacion: {
          type: 'Point',
          coordinates: [
            parseFloat((ciudad.coords[0] + (Math.random() - 0.5) * 0.05).toFixed(6)),
            parseFloat((ciudad.coords[1] + (Math.random() - 0.5) * 0.05).toFixed(6))
          ]
        },
        horario: `${randomInt(6, 10)}:00-${randomInt(20, 23)}:00`,
        activo: Math.random() > 0.05,
        createdAt: new Date()
      };
    });

    const resRestaurantes = await db.collection('restaurantes').insertMany(restaurantesDocs);
    console.log(`✓ ${restaurantesDocs.length} restaurantes creados\n`);

    // Insertar artículos reales del menú de cada restaurante
    const todosRestaurantes = await db.collection('restaurantes').find().toArray();
    let articulosReales = [];
    todosRestaurantes.forEach((rest, i) => {
      const menuOriginal = restaurantes[i]?.menu || [];
      menuOriginal.forEach(item => {
        articulosReales.push({
          restauranteId: rest._id,
          nombre: item.nombre,
          descripcion: item.descripcion,
          categoria: item.categoria,
          precio: parseFloat((item.precio + (Math.random() * 10 - 5)).toFixed(2)),
          disponible: Math.random() > 0.05,
          createdAt: new Date()
        });
      });
    });

    await db.collection('articulos_menu').insertMany(articulosReales);
    console.log(`✓ ${articulosReales.length} artículos reales insertados`);

    // Completar hasta 50,000 con variaciones coherentes
    console.log(`\nGenerando artículos adicionales hasta 50,000...`);
    const TOTAL = 50000;
    const faltantes = TOTAL - articulosReales.length;
    const BATCH = 1000;
    let insertados = articulosReales.length;

    for (let i = 0; i < faltantes; i += BATCH) {
      const batch = [];
      const cantidad = Math.min(BATCH, faltantes - i);
      for (let j = 0; j < cantidad; j++) {
        const rest = randomItem(todosRestaurantes);
        const restOriginal = restaurantes.find(r => r.nombre === rest.nombre);
        const menuBase = restOriginal?.menu || restaurantes[0].menu;
        const itemBase = randomItem(menuBase);
        batch.push({
          restauranteId: rest._id,
          nombre: itemBase.nombre,
          descripcion: itemBase.descripcion,
          categoria: itemBase.categoria,
          precio: parseFloat((itemBase.precio + (Math.random() * 20 - 10)).toFixed(2)),
          disponible: Math.random() > 0.1,
          createdAt: new Date()
        });
      }
      await db.collection('articulos_menu').insertMany(batch);
      insertados += batch.length;
      process.stdout.write(`\r  Progreso: ${insertados}/${TOTAL} documentos insertados`);
    }

    console.log('\n\n✅ Seed completado exitosamente');
    console.log(`   - ${restaurantesDocs.length} restaurantes`);
    console.log(`   - ${TOTAL} artículos de menú`);

  } catch (err) {
    console.error('Error en seed:', err);
  } finally {
    await client.close();
  }
}

seed();