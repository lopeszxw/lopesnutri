import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, nome, email } = req.body;

    if (!id || !nome || !email) {
      return res.status(400).json({ error: "Campos obrigatórios: id, nome, email" });
    }

    const sql = neon(process.env.NEON_DB_URL);

    await sql`
      INSERT INTO nutricionistas (id, nome, email)
      VALUES (${id}, ${nome}, ${email})
      ON CONFLICT (id) DO NOTHING
    `;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro ao inserir nutricionista:", err);
    return res.status(500).json({ error: err.message });
  }
}
