const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const NOMBRES = [
  'Carlos Martínez', 'Ana García', 'Luis Pérez', 'Sofia Rodríguez', 'Diego López',
  'Valentina Morales', 'Andrés Hernández', 'Camila Torres', 'José Ramírez', 'Isabella Flores',
  'Miguel Castillo', 'Lucía Mendoza', 'Fernando Reyes', 'Gabriela Cruz', 'Pablo Ortiz',
  'Daniela Vargas', 'Ricardo Jiménez', 'Natalia Romero', 'Alejandro Navarro', 'Paola Gutiérrez',
  'Sebastián Moreno', 'Valeria Ruiz', 'Mateo Díaz', 'Mariana Herrera', 'Emilio Soto'
]

const COMENTARIOS_BUENOS = [
  'Excelente comida, muy recomendado', 'El servicio fue increíble, volveré pronto',
  'Los sabores son auténticos y deliciosos', 'Ambiente agradable y comida de calidad',
  'Perfecta relación calidad-precio', 'El mejor restaurante de la ciudad sin duda',
  'La atención al cliente es excepcional', 'Porciones generosas y muy sabroso',
  'Un lugar que definitivamente recomendaría a todos', 'La comida llegó caliente y bien presentada'
]

const COMENTARIOS_MEDIOS = [
  'Buena comida aunque el servicio tardó un poco', 'Sabores buenos pero el lugar es pequeño',
  'La comida estuvo bien, nada extraordinario', 'Precio justo para lo que ofrecen',
  'El ambiente podría mejorar pero la comida es buena'
]

const COMENTARIOS_MALOS = [
  'El servicio fue muy lento', 'La comida llegó fría',
  'No cumplió mis expectativas', 'Muy caro para la calidad que ofrecen'
]

const ESTADOS = ['pendiente', 'confirmado', 'en preparación', 'entregado', 'cancelado']
const PESOS_ESTADOS = [0.1, 0.15, 0.15, 0.5, 0.1]

function randomEstado() {
  const r = Math.random()
  let acum = 0
  for (let i = 0; i < ESTADOS.length; i++) {
    acum += PESOS_ESTADOS[i]
    if (r <= acum) return ESTADOS[i]
  }
  return 'entregado'
}

function randomFecha(diasAtras = 90) {
  const ahora = new Date()
  const offset = Math.floor(Math.random() * diasAtras * 24 * 60 * 60 * 1000)
  return new Date(ahora - offset)
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function seedExtra() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db()
  console.log('✅ Conectado a MongoDB Atlas')

  // 1. Crear 25 usuarios nuevos
  console.log('👤 Creando usuarios...')
  const usuariosExistentes = await db.collection('usuarios').find({}).toArray()
  const emailsExistentes = new Set(usuariosExistentes.map(u => u.email))

  const nuevosUsuarios = NOMBRES
    .filter(n => {
      const email = `${n.split(' ')[0].toLowerCase()}@gmail.com`
      return !emailsExistentes.has(email)
    })
    .map(nombre => ({
      nombre,
      email: `${nombre.split(' ')[0].toLowerCase()}${randomInt(1, 99)}@gmail.com`,
      totalOrdenes: 0,
      createdAt: randomFecha(180)
    }))

  let usuariosInsertados = []
  if (nuevosUsuarios.length > 0) {
    const result = await db.collection('usuarios').insertMany(nuevosUsuarios)
    usuariosInsertados = nuevosUsuarios.map((u, i) => ({
      ...u,
      _id: result.insertedIds[i]
    }))
    console.log(`   ✅ ${nuevosUsuarios.length} usuarios creados`)
  }

  // Todos los usuarios disponibles
  const todosUsuarios = await db.collection('usuarios').find({}).toArray()
  const todosRestaurantes = await db.collection('restaurantes').find({}).toArray()

  // 2. Crear 200 órdenes
  console.log('🛒 Creando órdenes...')
  const ordenes = []

  for (let i = 0; i < 200; i++) {
    const usuario = randomItem(todosUsuarios)
    const restaurante = randomItem(todosRestaurantes)

    // Obtener artículos reales del restaurante
    const articulos = await db.collection('articulos_menu')
      .find({ restauranteId: restaurante._id })
      .limit(20)
      .toArray()

    if (articulos.length === 0) continue

    const numItems = randomInt(1, 4)
    const items = []
    let montoTotal = 0

    for (let j = 0; j < numItems; j++) {
      const articulo = randomItem(articulos)
      const cantidad = randomInt(1, 3)
      const subtotal = parseFloat((articulo.precio * cantidad).toFixed(2))
      items.push({
        articuloId: articulo._id,
        nombre: articulo.nombre,
        cantidad,
        precioUnitario: articulo.precio,
        subtotal
      })
      montoTotal += subtotal
    }

    ordenes.push({
      userId: usuario._id,
      restauranteId: restaurante._id,
      items,
      estado: randomEstado(),
      montoTotal: parseFloat(montoTotal.toFixed(2)),
      fecha: randomFecha(90)
    })
  }

  await db.collection('ordenes').insertMany(ordenes)
  console.log(`   ✅ ${ordenes.length} órdenes creadas`)

  // 3. Actualizar totalOrdenes de cada usuario
  console.log('📊 Actualizando totalOrdenes...')
  for (const usuario of todosUsuarios) {
    const count = await db.collection('ordenes').countDocuments({ userId: usuario._id })
    await db.collection('usuarios').updateOne(
      { _id: usuario._id },
      { $set: { totalOrdenes: count } }
    )
  }
  console.log('   ✅ totalOrdenes actualizado')

  // 4. Crear 150 reseñas
  console.log('⭐ Creando reseñas...')
  const resenas = []

  for (let i = 0; i < 150; i++) {
    const usuario = randomItem(todosUsuarios)
    const restaurante = randomItem(todosRestaurantes)
    const calificacion = randomInt(1, 5)

    let comentario
    if (calificacion >= 4) comentario = randomItem(COMENTARIOS_BUENOS)
    else if (calificacion === 3) comentario = randomItem(COMENTARIOS_MEDIOS)
    else comentario = randomItem(COMENTARIOS_MALOS)

    resenas.push({
      userId: usuario._id,
      restauranteId: restaurante._id,
      calificacion,
      comentario,
      fecha: randomFecha(90)
    })
  }

  await db.collection('resenas').insertMany(resenas)
  console.log(`   ✅ ${resenas.length} reseñas creadas`)

  // Resumen final
  const counts = {
    usuarios: await db.collection('usuarios').countDocuments(),
    restaurantes: await db.collection('restaurantes').countDocuments(),
    menu: await db.collection('articulos_menu').countDocuments(),
    ordenes: await db.collection('ordenes').countDocuments(),
    resenas: await db.collection('resenas').countDocuments(),
  }

  console.log('\n📋 Resumen final de la base de datos:')
  Object.entries(counts).forEach(([k, v]) => console.log(`   ${k}: ${v.toLocaleString()}`))

  await client.close()
  console.log('\n🎉 seedExtra completado exitosamente')
}

seedExtra().catch(console.error)