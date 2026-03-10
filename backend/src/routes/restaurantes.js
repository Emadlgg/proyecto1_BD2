const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET todos los restaurantes (con filtros, proyección, sort, skip, limit)
router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const { ciudad, activo, sort = 'nombre', order = '1', skip = 0, limit = 10, fields } = req.query;

    const filtro = {};
    if (ciudad) filtro['direccion.ciudad'] = { $regex: ciudad, $options: 'i' };
    if (activo !== undefined) filtro.activo = activo === 'true';

    const proyeccion = {};
    if (fields) fields.split(',').forEach(f => proyeccion[f.trim()] = 1);

    const restaurantes = await db.collection('restaurantes')
      .find(filtro, { projection: Object.keys(proyeccion).length ? proyeccion : undefined })
      .sort({ [sort]: parseInt(order) })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();

    res.json(restaurantes);
  } catch (err) { next(err); }
});

// GET restaurante por ID
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const restaurante = await db.collection('restaurantes').findOne({ _id: new ObjectId(req.params.id) });
    if (!restaurante) return res.status(404).json({ error: 'Restaurante no encontrado' });
    res.json(restaurante);
  } catch (err) { next(err); }
});

// GET búsqueda por texto
router.get('/buscar/texto', async (req, res, next) => {
  try {
    const db = getDB();
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Parámetro q requerido' });
    const resultados = await db.collection('restaurantes')
      .find({ $text: { $search: q } })
      .project({ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .toArray();
    res.json(resultados);
  } catch (err) { next(err); }
});

// GET restaurantes cercanos (geoespacial)
router.get('/buscar/cercanos', async (req, res, next) => {
  try {
    const db = getDB();
    const { lng, lat, distancia = 5000 } = req.query;
    if (!lng || !lat) return res.status(400).json({ error: 'lng y lat requeridos' });
    const resultados = await db.collection('restaurantes').find({
      ubicacion: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(distancia)
        }
      }
    }).toArray();
    res.json(resultados);
  } catch (err) { next(err); }
});

// POST crear uno o varios restaurantes
router.post('/', async (req, res, next) => {
  try {
    const db = getDB();
    const data = req.body;
    if (Array.isArray(data)) {
      const result = await db.collection('restaurantes').insertMany(data);
      return res.status(201).json({ insertedCount: result.insertedCount, insertedIds: result.insertedIds });
    }
    data.createdAt = new Date();
    const result = await db.collection('restaurantes').insertOne(data);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) { next(err); }
});

// PUT actualizar un restaurante
router.put('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const result = await db.collection('restaurantes').updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Restaurante no encontrado' });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// PUT actualizar varios restaurantes (por ciudad)
router.put('/bulk/update', async (req, res, next) => {
  try {
    const db = getDB();
    const { filtro, update } = req.body;
    const result = await db.collection('restaurantes').updateMany(filtro, { $set: update });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// DELETE eliminar un restaurante
router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('restaurantes').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Restaurante no encontrado' });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) { next(err); }
});

// DELETE eliminar varios restaurantes
router.delete('/bulk/delete', async (req, res, next) => {
  try {
    const db = getDB();
    const { filtro } = req.body;
    const result = await db.collection('restaurantes').deleteMany(filtro);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) { next(err); }
});

module.exports = router;