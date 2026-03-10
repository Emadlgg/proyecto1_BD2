const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET todas las reseñas (con filtros, sort, skip, limit, lookup)
router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const { restauranteId, userId, ordenId, skip = 0, limit = 10, sort = 'createdAt', order = '-1' } = req.query;

    const filtro = {};
    if (restauranteId) filtro.restauranteId = new ObjectId(restauranteId);
    if (userId) filtro.userId = new ObjectId(userId);
    if (ordenId) filtro.ordenId = new ObjectId(ordenId);

    const resenas = await db.collection('resenas').aggregate([
      { $match: filtro },
      { $sort: { [sort]: parseInt(order) } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      { $lookup: { from: 'usuarios', localField: 'userId', foreignField: '_id', as: 'usuario' } },
      { $lookup: { from: 'restaurantes', localField: 'restauranteId', foreignField: '_id', as: 'restaurante' } },
      { $unwind: { path: '$usuario', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$restaurante', preserveNullAndEmptyArrays: true } },
      { $project: {
        _id: 1, calificacion: 1, comentario: 1, createdAt: 1,
        'usuario.nombre': 1, 'usuario.email': 1,
        'restaurante.nombre': 1
      }}
    ]).toArray();

    res.json(resenas);
  } catch (err) { next(err); }
});

// GET reseña por ID
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const resena = await db.collection('resenas').findOne({ _id: new ObjectId(req.params.id) });
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json(resena);
  } catch (err) { next(err); }
});

// POST crear una o varias reseñas
router.post('/', async (req, res, next) => {
  try {
    const db = getDB();
    const data = req.body;

    if (Array.isArray(data)) {
      const docs = data.map(d => ({
        ...d,
        restauranteId: new ObjectId(d.restauranteId),
        userId: new ObjectId(d.userId),
        ordenId: d.ordenId ? new ObjectId(d.ordenId) : null,
        createdAt: new Date()
      }));
      const result = await db.collection('resenas').insertMany(docs);
      return res.status(201).json({ insertedCount: result.insertedCount });
    }

    data.restauranteId = new ObjectId(data.restauranteId);
    data.userId = new ObjectId(data.userId);
    if (data.ordenId) data.ordenId = new ObjectId(data.ordenId);
    data.createdAt = new Date();

    const result = await db.collection('resenas').insertOne(data);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) { next(err); }
});

// PUT actualizar una reseña
router.put('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('resenas').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// PUT actualizar varias reseñas
router.put('/bulk/update', async (req, res, next) => {
  try {
    const db = getDB();
    const { filtro, update } = req.body;
    if (filtro.restauranteId) filtro.restauranteId = new ObjectId(filtro.restauranteId);
    const result = await db.collection('resenas').updateMany(filtro, { $set: update });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// DELETE eliminar una reseña
router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('resenas').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Reseña no encontrada' });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) { next(err); }
});

// DELETE eliminar varias reseñas
router.delete('/bulk/delete', async (req, res, next) => {
  try {
    const db = getDB();
    const { filtro } = req.body;
    if (filtro.restauranteId) filtro.restauranteId = new ObjectId(filtro.restauranteId);
    if (filtro.userId) filtro.userId = new ObjectId(filtro.userId);
    const result = await db.collection('resenas').deleteMany(filtro);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) { next(err); }
});

module.exports = router;