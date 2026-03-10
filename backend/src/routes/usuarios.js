const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET todos los usuarios
router.get('/', async (req, res, next) => {
  try {
    const db = getDB();
    const { skip = 0, limit = 10, sort = 'nombre', order = '1' } = req.query;
    const usuarios = await db.collection('usuarios')
      .find()
      .sort({ [sort]: parseInt(order) })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();
    res.json(usuarios);
  } catch (err) { next(err); }
});

// GET usuario por ID
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const usuario = await db.collection('usuarios').findOne({ _id: new ObjectId(req.params.id) });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) { next(err); }
});

// GET usuario por email
router.get('/email/:email', async (req, res, next) => {
  try {
    const db = getDB();
    const usuario = await db.collection('usuarios').findOne({ email: req.params.email });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) { next(err); }
});

// POST crear uno o varios usuarios
router.post('/', async (req, res, next) => {
  try {
    const db = getDB();
    const data = req.body;
    if (Array.isArray(data)) {
      const result = await db.collection('usuarios').insertMany(data);
      return res.status(201).json({ insertedCount: result.insertedCount, insertedIds: result.insertedIds });
    }
    data.createdAt = new Date();
    data.totalOrdenes = 0;
    const result = await db.collection('usuarios').insertOne(data);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) { next(err); }
});

// PUT actualizar un usuario
router.put('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('usuarios').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// PUT actualizar varios usuarios
router.put('/bulk/update', async (req, res, next) => {
  try {
    const db = getDB();
    const { filtro, update } = req.body;
    const result = await db.collection('usuarios').updateMany(filtro, { $set: update });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) { next(err); }
});

// DELETE eliminar un usuario
router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDB();
    const result = await db.collection('usuarios').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) { next(err); }
});

// DELETE eliminar varios usuarios
router.delete('/bulk/delete', async (req, res, next) => {
  try {
    const db = getDB();
    const { filtro } = req.body;
    const result = await db.collection('usuarios').deleteMany(filtro);
    res.json({ deletedCount: result.deletedCount });
  } catch (err) { next(err); }
});

module.exports = router;