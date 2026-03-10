const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET artículos únicos agrupados por nombre
router.get('/unicos', async (req, res, next) => {
  try {
    const db = getDB();
    const { restauranteId, categoria, skip = 0, limit = 50 } = req.query;

    const match = {};
    if (restauranteId && restauranteId !== 'undefined') match.restauranteId = new ObjectId(restauranteId);
    if (categoria && categoria !== 'undefined') match.categoria = { $regex: categoria, $options: 'i' };

    const resultado = await db.collection('articulos_menu').aggregate([
      { $match: match },
      { $group: {
        _id: '$nombre',
        id: { $first: '$_id' },
        nombre: { $first: '$nombre' },
        descripcion: { $first: '$descripcion' },
        categoria: { $first: '$categoria' },
        precio: { $first: '$precio' },
        disponible: { $first: '$disponible' },
        restauranteId: { $first: '$restauranteId' },
        total: { $sum: 1 }
      }},
      { $sort: { nombre: 1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      { $project: {
        _id: '$id', nombre: 1, descripcion: 1,
        categoria: 1, precio: 1, disponible: 1,
        restauranteId: 1, total: 1
      }}
    ]).toArray();

    res.json(resultado);
  } catch (err) { next(err); }
});

// GET total de artículos
router.get('/count', async (req, res, next) => {
  try {
    const db = getDB();
    const { restauranteId, categoria } = req.query;
    const filtro = {};
    if (restauranteId && restauranteId !== 'undefined') filtro.restauranteId = new ObjectId(restauranteId);
    if (categoria && categoria !== 'undefined') filtro.categoria = { $regex: categoria, $options: 'i' };
    const total = await db.collection('articulos_menu').countDocuments(filtro);
    res.json({ total });
  } catch (err) { next(err); }
});

// GET categorías distintas de un restaurante
router.get('/categorias/:restauranteId', async (req, res, next) => {
  try {
    const db = getDB();
    if (!req.params.restauranteId || req.params.restauranteId === 'undefined') {
      return res.json([]);
    }
    const categorias = await db.collection('articulos_menu').distinct('categoria', {
      restauranteId: new ObjectId(req.params.restauranteId)
    });
    res.json(categorias);
  } catch (err) { next(err); }
});

// GET artículos del menú
router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const { restauranteId, categoria, disponible, skip = 0, limit = 20, sort = 'nombre', order = '1' } = req.query;

    const filtro = {};
    if (restauranteId && restauranteId !== 'undefined') filtro.restauranteId = new ObjectId(restauranteId);
    if (categoria && categoria !== 'undefined') filtro.categoria = { $regex: categoria, $options: 'i' };
    if (disponible !== undefined) filtro.disponible = disponible === 'true';

    const articulos = await db.collection('articulos_menu')
      .find(filtro)
      .sort({ [sort]: parseInt(order) })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    res.json(articulos);
  } catch (err) { next(err); }
});

// GET artículo por ID
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const articulo = await db.collection('articulos_menu').findOne({ _id: new ObjectId(req.params.id) });
    if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json(articulo);
  } catch (err) { next(err); }
});

// POST crear uno o varios artículos
router.post('/', async (req, res, next) => {
  try {
    const db = getDB();
    const data = req.body;
    if (Array.isArray(data)) {
      const docs = data.map(d => ({ ...d, restauranteId: new ObjectId(d.restauranteId), createdAt: new Date() }));
      const result = await db.collection('articulos_menu').insertMany(docs);
      return res.status(201).json({ insertedCount: result.insertedCount });
    }
    data.restauranteId = new ObjectId(data.restauranteId);
    data.createdAt = new Date();
    const result = await db.collection('articulos_menu').insertOne(data);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) { next(err); }
});

// POST bulk write
router.post('/bulk', async (req, res, next) => {
  try {
    const db = getDB();
    const { operaciones } = req.body;
    const result = await db.collection('articulos_menu').bulkWrite(operaciones);
    res.status(201).json({
      insertedCount: result.insertedCount,
      modifiedCount: result.modifiedCount,
      deletedCount: result.deletedCount
    });
  } catch (err) { next(err); }
});

// PUT actualizar un artículo
router.put('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('articulos_menu').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// PUT actualizar varios artículos
router.put('/bulk/update', async (req, res, next) => {
  try {
    const db = getDB();
    const { filtro, update } = req.body;
    if (filtro.restauranteId && filtro.restauranteId !== 'undefined') filtro.restauranteId = new ObjectId(filtro.restauranteId);
    const result = await db.collection('articulos_menu').updateMany(filtro, { $set: update });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// DELETE eliminar un artículo
router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('articulos_menu').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Artículo no encontrado' });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) { next(err); }
});

// DELETE eliminar varios artículos
router.delete('/bulk/delete', async (req, res, next) => {
  try {
    const db = getDB();
    const { filtro } = req.body;
    if (filtro.restauranteId && filtro.restauranteId !== 'undefined') filtro.restauranteId = new ObjectId(filtro.restauranteId);
    const result = await db.collection('articulos_menu').deleteMany(filtro);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) { next(err); }
});

module.exports = router;