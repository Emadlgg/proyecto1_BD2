const express = require('express');
const router = express.Router();
const { getDB, getClient } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET explain plans de índices
router.get('/explain', async (req, res, next) => {
  try {
    const db = getDB();
    const resultados = []

    // 1. Índice simple — email de usuarios
    const explainEmail = await db.collection('usuarios')
      .find({ email: 'maria@ejemplo.com' })
      .explain('executionStats')
    resultados.push({
      nombre: 'Búsqueda por email (usuarios)',
      indice: '{ email: 1 } unique',
      coleccion: 'usuarios',
      query: '{ email: "maria@ejemplo.com" }',
      tipo: explainEmail.executionStats.executionStages.stage === 'FETCH'
        ? 'IXSCAN' : explainEmail.executionStats.executionStages.stage,
      docsExaminados: explainEmail.executionStats.totalDocsExamined,
      docsDevueltos: explainEmail.executionStats.nReturned,
      tiempoMs: explainEmail.executionStats.executionTimeMillis
    })

    // 2. Índice compuesto — ordenes por restaurante y fecha
    const primeraOrden = await db.collection('ordenes').findOne({})
    if (primeraOrden) {
      const explainOrden = await db.collection('ordenes')
        .find({ restauranteId: primeraOrden.restauranteId })
        .sort({ fecha: -1 })
        .explain('executionStats')
      const stage = explainOrden.executionStats.executionStages
      resultados.push({
        nombre: 'Órdenes por restaurante ordenadas por fecha',
        indice: '{ restauranteId: 1, fecha: -1 }',
        coleccion: 'ordenes',
        query: '{ restauranteId, sort: { fecha: -1 } }',
        tipo: stage.inputStage?.stage || stage.stage,
        docsExaminados: explainOrden.executionStats.totalDocsExamined,
        docsDevueltos: explainOrden.executionStats.nReturned,
        tiempoMs: explainOrden.executionStats.executionTimeMillis
      })
    }

    // 3. Índice compuesto — menu por restaurante y categoria
    const primerMenu = await db.collection('articulos_menu').findOne({})
    if (primerMenu) {
      const explainMenu = await db.collection('articulos_menu')
        .find({ restauranteId: primerMenu.restauranteId, categoria: primerMenu.categoria })
        .explain('executionStats')
      const stage = explainMenu.executionStats.executionStages
      resultados.push({
        nombre: 'Menú por restaurante y categoría',
        indice: '{ restauranteId: 1, categoria: 1 }',
        coleccion: 'articulos_menu',
        query: '{ restauranteId, categoria }',
        tipo: stage.inputStage?.stage || stage.stage,
        docsExaminados: explainMenu.executionStats.totalDocsExamined,
        docsDevueltos: explainMenu.executionStats.nReturned,
        tiempoMs: explainMenu.executionStats.executionTimeMillis
      })
    }

    // 4. Índice texto — búsqueda en restaurantes
    const explainTexto = await db.collection('restaurantes')
      .find({ $text: { $search: 'burger' } })
      .explain('executionStats')
    const stageTexto = explainTexto.executionStats.executionStages
    resultados.push({
      nombre: 'Búsqueda de texto en restaurantes',
      indice: '{ nombre: "text", descripcion: "text" }',
      coleccion: 'restaurantes',
      query: '{ $text: { $search: "burger" } }',
      tipo: stageTexto.inputStage?.stage || stageTexto.stage,
      docsExaminados: explainTexto.executionStats.totalDocsExamined,
      docsDevueltos: explainTexto.executionStats.nReturned,
      tiempoMs: explainTexto.executionStats.executionTimeMillis
    })

    // 5. Índice compuesto — reseñas por restaurante
    const primeraResena = await db.collection('resenas').findOne({})
    if (primeraResena) {
      const explainResena = await db.collection('resenas')
        .find({ restauranteId: primeraResena.restauranteId })
        .sort({ calificacion: -1 })
        .explain('executionStats')
      const stage = explainResena.executionStats.executionStages
      resultados.push({
        nombre: 'Reseñas por restaurante ordenadas por calificación',
        indice: '{ restauranteId: 1, calificacion: -1 }',
        coleccion: 'resenas',
        query: '{ restauranteId, sort: { calificacion: -1 } }',
        tipo: stage.inputStage?.stage || stage.stage,
        docsExaminados: explainResena.executionStats.totalDocsExamined,
        docsDevueltos: explainResena.executionStats.nReturned,
        tiempoMs: explainResena.executionStats.executionTimeMillis
      })
    }

    res.json(resultados)
  } catch (err) { next(err) }
})

// GET ejemplo de documento embebido
router.get('/embebido', async (req, res, next) => {
  try {
    const db = getDB()
    const orden = await db.collection('ordenes').findOne(
      { 'items.0': { $exists: true } },
      { projection: { _id: 1, estado: 1, montoTotal: 1, fecha: 1, items: 1 } }
    )
    res.json({
      descripcion: 'Los items de la orden están embebidos directamente en el documento de la orden (no en colección separada)',
      documento: orden
    })
  } catch (err) { next(err) }
})

// GET ejemplo de documento referenciado
router.get('/referenciado', async (req, res, next) => {
  try {
    const db = getDB()
    const resena = await db.collection('resenas').findOne({})
    if (!resena) return res.json({ descripcion: 'No hay reseñas', documento: null })

    const conLookup = await db.collection('resenas').aggregate([
      { $match: { _id: resena._id } },
      { $lookup: { from: 'restaurantes', localField: 'restauranteId', foreignField: '_id', as: 'restaurante' } },
      { $lookup: { from: 'usuarios', localField: 'userId', foreignField: '_id', as: 'usuario' } },
      { $unwind: { path: '$restaurante', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$usuario', preserveNullAndEmptyArrays: true } }
    ]).toArray()

    res.json({
      descripcion: 'La reseña referencia a restaurante y usuario por ID. Se usa $lookup para obtener los datos completos',
      documentoOriginal: {
        _id: resena._id,
        restauranteId: resena.restauranteId,
        userId: resena.userId,
        calificacion: resena.calificacion,
        comentario: resena.comentario
      },
      documentoConLookup: conLookup[0]
    })
  } catch (err) { next(err) }
})

// POST ejecutar transacción de prueba
router.post('/transaccion', async (req, res, next) => {
  const session = getClient().startSession()
  try {
    const db = getDB()
    let resultado = {}

    await session.withTransaction(async () => {
      // Buscar usuario y restaurante
      const usuario = await db.collection('usuarios').findOne({}, { session })
      const restaurante = await db.collection('restaurantes').findOne({}, { session })
      const articulo = await db.collection('articulos_menu').findOne(
        { restauranteId: restaurante._id }, { session }
      )

      if (!usuario || !restaurante || !articulo) {
        throw new Error('No hay datos suficientes para la transacción')
      }

      const orden = {
        userId: usuario._id,
        restauranteId: restaurante._id,
        items: [{
          articuloId: articulo._id,
          nombre: articulo.nombre,
          cantidad: 1,
          precioUnitario: articulo.precio,
          subtotal: articulo.precio
        }],
        estado: 'pendiente',
        montoTotal: articulo.precio,
        fecha: new Date()
      }

      // Operación 1: insertar orden
      const insertResult = await db.collection('ordenes').insertOne(orden, { session })

      // Operación 2: incrementar totalOrdenes del usuario
      await db.collection('usuarios').updateOne(
        { _id: usuario._id },
        { $inc: { totalOrdenes: 1 } },
        { session }
      )

      resultado = {
        ordenId: insertResult.insertedId,
        usuario: usuario.nombre,
        restaurante: restaurante.nombre,
        articulo: articulo.nombre,
        monto: articulo.precio,
        totalOrdenesUsuario: (usuario.totalOrdenes || 0) + 1
      }
    })

    res.json({
      exito: true,
      mensaje: 'Transacción completada: orden creada + totalOrdenes incrementado atómicamente',
      resultado
    })
  } catch (err) {
    res.json({ exito: false, mensaje: err.message })
  } finally {
    session.endSession()
  }
})

// POST ejecutar bulk operation de prueba
router.post('/bulk', async (req, res, next) => {
  try {
    const db = getDB()
    const restaurante = await db.collection('restaurantes').findOne({})
    if (!restaurante) return res.json({ error: 'No hay restaurantes' })

    const result = await db.collection('articulos_menu').bulkWrite([
      {
        updateMany: {
          filter: { restauranteId: restaurante._id, categoria: 'Bebida' },
          update: { $set: { disponible: true } }
        }
      },
      {
        updateMany: {
          filter: { restauranteId: restaurante._id, precio: { $gt: 100 } },
          update: { $set: { disponible: false } }
        }
      }
    ])

    res.json({
      exito: true,
      mensaje: 'BulkWrite ejecutado: 2 operaciones updateMany en articulos_menu',
      resultado: {
        operacionesEjecutadas: 2,
        documentosModificados: result.modifiedCount,
        restaurante: restaurante.nombre
      }
    })
  } catch (err) { next(err) }
})

// GET estadísticas generales
router.get('/stats', async (req, res, next) => {
  try {
    const db = getDB()
    const [restaurantes, usuarios, menu, ordenes, resenas, archivos] = await Promise.all([
      db.collection('restaurantes').countDocuments(),
      db.collection('usuarios').countDocuments(),
      db.collection('articulos_menu').countDocuments(),
      db.collection('ordenes').countDocuments(),
      db.collection('resenas').countDocuments(),
      db.collection('fs.files').countDocuments()
    ])
    res.json({ restaurantes, usuarios, menu, ordenes, resenas, archivos })
  } catch (err) { next(err) }
})

module.exports = router