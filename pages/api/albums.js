import { sql } from '../../src/database';

export default (req, res) => {
  if (req.method === 'POST') { return create(req, res); }

  return res.status(404).send({ error: 'Route not found' });
}

async function create(req, res) {
  try {
    const result = await sql(
      'INSERT INTO albums (name, stickers) VALUES ($1, $2) RETURNING id, name',
      [req.body.name, {}]
    );

    const album = result[0];
    res.json({ name: album.name, token: album.id });
  } catch (error) {
    res.status(422).json(error);
  }
}
