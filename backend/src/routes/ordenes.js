const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId, MongoClient } = require('mongodb');
require('dotenv').config();

// GET todas las órdenes
router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const { restauranteId, userId, estado, skip = 0, limit = 10, sort = 'fecha', order = '-1' } = req.query;

    const filtro = {};
    if (restauranteId) filtro.restauranteId = new ObjectId(restauranteId);
    if (userId) filtro.userId = new ObjectId(userId);
    if (estado) filtro.estado = estado;

    const ordenes = await db.collection('ordenes').aggregate([
      { $match: filtro },
      { $sort: { [sort]: parseInt(order) } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      { $lookup: { from: 'usuarios', localField: 'userId', foreignField: '_id', as: 'usuario' } },
      { $lookup: { from: 'restaurantes', localField: 'restauranteId', foreignField: '_id', as: 'restaurante' } },
      { $unwind: { path: '$usuario', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$restaurante', preserveNullAndEmptyArrays: true } },
      { $project: {
        _id: 1, items: 1, montoTotal: 1, estado: 1, fecha: 1,
        'usuario.nombre': 1, 'usuario.email': 1,
        'restaurante.nombre': 1, 'restaurante.direccion': 1
      }}
    ]).toArray();

    res.json(ordenes);
  } catch (err) { next(err); }
});

// GET orden por ID
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const orden = await db.collection('ordenes').findOne({ _id: new ObjectId(req.params.id) });
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(orden);
  } catch (err) { next(err); }
});

// POST crear orden (con transacción)
router.post('/', async (req, res, next) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const session = client.startSession();
    let insertedId;

    await session.withTransaction(async () => {
      const db = client.db();
      const { userId, restauranteId, items } = req.body;

      const montoTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

      const orden = {
        userId: new ObjectId(userId),
        restauranteId: new ObjectId(restauranteId),
        items: items.map(i => ({ ...i, articuloId: new ObjectId(i.articuloId) })),
        montoTotal,
        estado: 'pendiente',
        fecha: new Date(),
        createdAt: new Date()
      };

      const result = await db.collection('ordenes').insertOne(orden, { session });
      insertedId = result.insertedId;

      await db.collection('usuarios').updateOne(
        { _id: new ObjectId(userId) },
        { $inc: { totalOrdenes: 1 } },
        { session }
      );
    });

    session.endSession();
    res.status(201).json({ insertedId });
  } catch (err) {
    next(err);
  } finally {
    await client.close();
  }
});

// ⚠️ IMPORTANTE: rutas específicas ANTES de /:id

// PUT actualizar varias órdenes
router.put('/bulk/update', async (req, res, next) => {
  try {
    const db = getDB();
    const { filtro, update } = req.body;
    if (filtro.restauranteId) filtro.restauranteId = new ObjectId(filtro.restauranteId);
    const result = await db.collection('ordenes').updateMany(filtro, { $set: update });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// PUT agregar ítem ($push)
router.put('/:id/items/add', async (req, res, next) => {
  try {
    const db = getDB();
    const item = { ...req.body, articuloId: new ObjectId(req.body.articuloId) };
    const result = await db.collection('ordenes').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $push: { items: item },
        $inc: { montoTotal: item.subtotal }
      }
    );
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// PUT quitar ítem ($pull)
router.put('/:id/items/remove', async (req, res, next) => {
  try {
    const db = getDB();
    const { articuloId, subtotal } = req.body;
    const result = await db.collection('ordenes').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $pull: { items: { articuloId: new ObjectId(articuloId) } },
        $inc: { montoTotal: -subtotal }
      }
    );
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// PUT actualizar cantidad de ítem existente
router.put('/:id/items/update', async (req, res, next) => {
  try {
    const db = getDB();
    const { articuloId, cantidad, precioUnitario } = req.body;
    const nuevoSubtotal = parseFloat((cantidad * precioUnitario).toFixed(2));

    const orden = await db.collection('ordenes').findOne({ _id: new ObjectId(req.params.id) });
    const itemAnterior = orden.items.find(i => i.articuloId.toString() === articuloId);
    const diferencia = nuevoSubtotal - itemAnterior.subtotal;

    const result = await db.collection('ordenes').updateOne(
      { _id: new ObjectId(req.params.id), 'items.articuloId': new ObjectId(articuloId) },
      {
        $set: {
          'items.$.cantidad': cantidad,
          'items.$.subtotal': nuevoSubtotal
        },
        $inc: { montoTotal: diferencia }
      }
    );
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// PUT actualizar estado de una orden ← al final
router.put('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('ordenes').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// DELETE eliminar varias órdenes ← antes de /:id
router.delete('/bulk/delete', async (req, res, next) => {
  try {
    const db = getDB();
    const { filtro } = req.body;
    if (filtro.restauranteId) filtro.restauranteId = new ObjectId(filtro.restauranteId);
    if (filtro.userId) filtro.userId = new ObjectId(filtro.userId);
    const result = await db.collection('ordenes').deleteMany(filtro);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) { next(err); }
});

// DELETE eliminar una orden ← al final
router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('ordenes').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) { next(err); }
});

module.exports = router;