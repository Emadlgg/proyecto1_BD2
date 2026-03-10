const { MongoClient } = require('mongodb');
require('dotenv').config();

async function createIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    console.log('Creando índices...');

    // SIMPLE - usuarios.email (único)
    await db.collection('usuarios').createIndex(
      { email: 1 },
      { unique: true, name: 'idx_usuarios_email' }
    );
    console.log('✓ Simple: usuarios.email');

    // COMPUESTO - ordenes por restaurante y fecha
    await db.collection('ordenes').createIndex(
      { restauranteId: 1, fecha: -1 },
      { name: 'idx_ordenes_restaurante_fecha' }
    );
    console.log('✓ Compuesto: ordenes.restauranteId + fecha');

    // COMPUESTO - ordenes por usuario y estado
    await db.collection('ordenes').createIndex(
      { userId: 1, estado: 1 },
      { name: 'idx_ordenes_usuario_estado' }
    );
    console.log('✓ Compuesto: ordenes.userId + estado');

    // MULTIKEY - ordenes.items.nombre (array embebido)
    await db.collection('ordenes').createIndex(
      { 'items.nombre': 1 },
      { name: 'idx_ordenes_items_nombre' }
    );
    console.log('✓ Multikey: ordenes.items.nombre');

    // GEOESPACIAL - restaurantes.ubicacion
    await db.collection('restaurantes').createIndex(
      { ubicacion: '2dsphere' },
      { name: 'idx_restaurantes_ubicacion' }
    );
    console.log('✓ Geoespacial: restaurantes.ubicacion');

    // TEXTO - restaurantes nombre y descripcion
    await db.collection('restaurantes').createIndex(
      { nombre: 'text', descripcion: 'text' },
      { name: 'idx_restaurantes_texto' }
    );
    console.log('✓ Texto: restaurantes.nombre + descripcion');

    // COMPUESTO - articulos_menu por restaurante y categoria
    await db.collection('articulos_menu').createIndex(
      { restauranteId: 1, categoria: 1 },
      { name: 'idx_menu_restaurante_categoria' }
    );
    console.log('✓ Compuesto: articulos_menu.restauranteId + categoria');

    // COMPUESTO - reseñas por restaurante y calificacion
    await db.collection('resenas').createIndex(
      { restauranteId: 1, calificacion: -1 },
      { name: 'idx_resenas_restaurante_calificacion' }
    );
    console.log('✓ Compuesto: resenas.restauranteId + calificacion');

    console.log('\n✅ Todos los índices creados exitosamente');
  } catch (err) {
    console.error('Error creando índices:', err);
  } finally {
    await client.close();
  }
}

createIndexes();