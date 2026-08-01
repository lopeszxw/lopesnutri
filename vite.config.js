import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { neon } from '@neondatabase/serverless'

const neonPlugin = () => ({
  name: 'neon-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/api/register-nutricionista' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const { id, nome, email } = JSON.parse(body);
            // Carrega variáveis de ambiente manualmente se não estiverem no process.env
            const env = loadEnv(server.config.mode, process.cwd(), '')
            const sql = neon(env.NEON_DB_URL);
            
            await sql`INSERT INTO nutricionistas (id, nome, email) VALUES (${id}, ${nome}, ${email})`;
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            console.error('Erro ao inserir nutricionista:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      } else {
        next();
      }
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), neonPlugin()],
})
