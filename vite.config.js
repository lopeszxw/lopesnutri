import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { neon } from '@neondatabase/serverless'
import gerarPlanoHandler from './api/gerar-plano.js'

const apiPlugin = () => ({
  name: 'local-api-endpoints',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // 1. Endpoint /api/register-nutricionista
      if (req.url === '/api/register-nutricionista' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const { id, nome, email } = JSON.parse(body);
            const env = loadEnv(server.config.mode, process.cwd(), '')
            const sql = neon(env.NEON_DB_URL || process.env.NEON_DB_URL);
            
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
        return;
      }

      // 2. Endpoint /api/gerar-plano
      if (req.url === '/api/gerar-plano' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const env = loadEnv(server.config.mode, process.cwd(), '')
            process.env.GOOGLE_API_KEY = env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
            
            const parsedBody = body ? JSON.parse(body) : {};
            const mockReq = {
              method: 'POST',
              body: parsedBody
            };

            const mockRes = {
              status(code) {
                res.statusCode = code;
                return this;
              },
              json(data) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return this;
              }
            };

            await gerarPlanoHandler(mockReq, mockRes);
          } catch (err) {
            console.error('Erro ao processar /api/gerar-plano no Vite:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message, fallback: true }));
          }
        });
        return;
      }

      next();
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
})

