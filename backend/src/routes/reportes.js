const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET restaurantes mejor calificados
router.get('/mejores-restaurantes', async (req, res, next) => {
  try {
    const db = getDB();
    const { limit = 10 } = req.query;

    const resultado = await db.collection('resenas').aggregate([
      {
        $group: {
          _id: '$restauranteId',
          promedioCalificacion: { $avg: '$calificacion' },
          totalResenas: { $sum: 1 }
        }
      },
      { $sort: { promedioCalificacion: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'restaurantes',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurante'
        }
      },
      { $unwind: '$restaurante' },
      {
        $project: {
          _id: 1,
          promedioCalificacion: { $round: ['$promedioCalificacion', 2] },
          totalResenas: 1,
          nombre: '$restaurante.nombre',
          'restaurante.direccion': 1,
          'restaurante.horario': 1
        }
      }
    ]).toArray();

    res.json(resultado);
  } catch (err) { next(err); }
});

// GET platillos más vendidos
router.get('/platillos-vendidos', async (req, res, next) => {
  try {
    const db = getDB();
    const { restauranteId, limit = 10 } = req.query;

    const matchFiltro = {};
    if (restauranteId) matchFiltro.restauranteId = new ObjectId(restauranteId);

    const resultado = await db.collection('ordenes').aggregate([
      { $match: matchFiltro },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.nombre',
          totalVendido: { $sum: '$items.cantidad' },
          ventasTotales: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalVendido: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          totalVendido: 1,
          ventasTotales: { $round: ['$ventasTotales', 2] }
        }
      }
    ]).toArray();

    res.json(resultado);
  } catch (err) { next(err); }
});

// GET órdenes paginadas con datos completos
router.get('/ordenes-detalle', async (req, res, next) => {
  try {
    const db = getDB();
    const { restauranteId, userId, estado, skip = 0, limit = 10 } = req.query;

    const filtro = {};
    if (restauranteId) filtro.restauranteId = new ObjectId(restauranteId);
    if (userId) filtro.userId = new ObjectId(userId);
    if (estado) filtro.estado = estado;

    const resultado = await db.collection('ordenes').aggregate([
      { $match: filtro },
      { $sort: { fecha: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      { $lookup: { from: 'usuarios', localField: 'userId', foreignField: '_id', as: 'usuario' } },
      { $lookup: { from: 'restaurantes', localField: 'restauranteId', foreignField: '_id', as: 'restaurante' } },
      { $unwind: { path: '$usuario', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$restaurante', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1, items: 1, montoTotal: 1, estado: 1, fecha: 1,
          'usuario.nombre': 1, 'usuario.email': 1,
          'restaurante.nombre': 1, 'restaurante.direccion': 1
        }
      }
    ]).toArray();

    res.json(resultado);
  } catch (err) { next(err); }
});

// GET conteo de órdenes por estado
router.get('/conteo-ordenes', async (req, res, next) => {
  try {
    const db = getDB();
    const { restauranteId } = req.query;

    const filtro = {};
    if (restauranteId) filtro.restauranteId = new ObjectId(restauranteId);

    const resultado = await db.collection('ordenes').aggregate([
      { $match: filtro },
      { $group: { _id: '$estado', total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]).toArray();

    res.json(resultado);
  } catch (err) { next(err); }
});

// GET conteo de reseñas por calificación
router.get('/conteo-resenas', async (req, res, next) => {
  try {
    const db = getDB();

    const resultado = await db.collection('resenas').aggregate([
      { $group: { _id: '$calificacion', total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    res.json(resultado);
  } catch (err) { next(err); }
});

module.exports = router;