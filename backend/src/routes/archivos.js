const express = require('express');
const router = express.Router();
const multer = require('multer');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
require('dotenv').config();

const upload = multer({ storage: multer.memoryStorage() });

// POST subir archivo (imagen de restaurante)
router.post('/upload/:restauranteId', upload.single('imagen'), async (req, res, next) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'imagenes' });

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: {
        restauranteId: new ObjectId(req.params.restauranteId),
        mimetype: req.file.mimetype
      }
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      // Guardar referencia en el restaurante
      await db.collection('restaurantes').updateOne(
        { _id: new ObjectId(req.params.restauranteId) },
        { $set: { imagenId: uploadStream.id } }
      );
      res.status(201).json({ fileId: uploadStream.id, filename: req.file.originalname });
      await client.close();
    });

    uploadStream.on('error', async (err) => {
      await client.close();
      next(err);
    });

  } catch (err) {
    await client.close();
    next(err);
  }
});

// GET descargar archivo por ID
router.get('/download/:fileId', async (req, res, next) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'imagenes' });

    const fileId = new ObjectId(req.params.fileId);
    const files = await db.collection('imagenes.files').findOne({ _id: fileId });
    if (!files) return res.status(404).json({ error: 'Archivo no encontrado' });

    res.set('Content-Type', files.metadata.mimetype);
    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    await client.close();
    next(err);
  }
});

// GET listar archivos de un restaurante
router.get('/list/:restauranteId', async (req, res, next) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const archivos = await db.collection('imagenes.files')
      .find({ 'metadata.restauranteId': new ObjectId(req.params.restauranteId) })
      .toArray();
    res.json(archivos);
    await client.close();
  } catch (err) {
    await client.close();
    next(err);
  }
});

// DELETE eliminar archivo
router.delete('/:fileId', async (req, res, next) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'imagenes' });
    await bucket.delete(new ObjectId(req.params.fileId));
    res.json({ deleted: true });
    await client.close();
  } catch (err) {
    await client.close();
    next(err);
  }
});

module.exports = router;