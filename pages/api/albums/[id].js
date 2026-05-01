import { sql } from '../../../src/database';

export default (req, res) => {
  if (req.method === 'GET') { return show(req, res); }
  if (req.method === 'POST') { return update(req, res); }
  if (req.method === 'DELETE') { return destroy(req, res); }

  return res.status(404).send({ error: 'Route not found' });
}

async function show(req, res) {
  try {
    const result = await sql(
      'SELECT * FROM albums WHERE id = $1',
      [req.query.id]
    );

    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    res.status(422).json(error);
  }
}

async function update(req, res) {
  const stickers = req.body.stickers;

  if (stickers) {
    const result = await sql(
      'UPDATE albums SET stickers = stickers || $1 WHERE id = $2 RETURNING stickers',
      [stickers, req.query.id]
    );

    res.json({ _id: req.query.id, stickers: result[0].stickers });
  } else {
    res.status(422).json({});
  }
}

async function destroy(req, res) {
  try {
    const result = await sql(
      'DELETE FROM albums WHERE id = $1 AND name = $2 RETURNING id',
      [req.query.id, req.body.name]
    );

    if (result.length > 0) {
      res.status(204).end();
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res.status(404).end();
  }
}
