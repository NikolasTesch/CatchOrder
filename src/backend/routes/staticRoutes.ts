import { Router } from 'express';
import express from 'express';
import path from 'path';
import { authenticatePage } from '../middlewares/jwtAuth';

const router = Router();

// BASE_PATH dinâmico (vazio para localhost, /server09 para produção)
const BASE_PATH = process.env.BASE_PATH || '';

/**
 * Helper para criar URL absoluta com base no contexto
 * Garante redirects corretos tanto em localhost quanto em produção
 */
const buildUrl = (relativePath: string): string => {
  // Remove barra inicial do relativePath se existir
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

  // Se BASE_PATH existir, retorna com o prefixo
  if (BASE_PATH) {
    return `${BASE_PATH}/${cleanPath}`;
  }

  // Caso contrário, retorna apenas com barra inicial
  return `/${cleanPath}`;
};

// 1. Static Assets (Public) - Serve assets tanto no BASE_PATH quanto na raiz
const assetTypes = ['css', 'js', 'img', 'uploads'];
assetTypes.forEach(type => {
  const assetPath = path.join(__dirname, `../../../public/${type}`);

  // Rota raiz (sempre disponível)
  router.use(`/${type}`, express.static(assetPath));

  // Rota com BASE_PATH (se configurado)
  if (BASE_PATH) {
    router.use(`${BASE_PATH}/${type}`, express.static(assetPath));
  }
});

// 2. Public Pages (Landing e Selling)
const serveLandingPage = (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/landingPage.html'));
};

const serveSellingPage = (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/sellingPage.html'));
};

// Landing Page
router.get('/pages/landingPage.html', serveLandingPage);
if (BASE_PATH) {
  router.get(`${BASE_PATH}/pages/landingPage.html`, serveLandingPage);
}

// Selling Page  
router.get('/pages/sellingPage.html', serveSellingPage);
if (BASE_PATH) {
  router.get(`${BASE_PATH}/pages/sellingPage.html`, serveSellingPage);
}

// 3. Root Redirects - Ponto crítico da correção
// Redirect da raiz sempre para selling page
router.get('/', (req, res) => {
  res.redirect(buildUrl('pages/sellingPage.html'));
});

// Redirect do BASE_PATH (com e sem barra)
if (BASE_PATH) {
  // Sem barra - adiciona barra e redireciona
  router.get(BASE_PATH, (req, res) => {
    // Se já termina com /, vai direto para a página
    if (req.originalUrl.endsWith('/')) {
      return res.redirect(buildUrl('pages/sellingPage.html'));
    }
    // Caso contrário, adiciona a barra
    return res.redirect(301, `${BASE_PATH}/`);
  });

  // Com barra - vai direto para a página
  router.get(`${BASE_PATH}/`, (req, res) => {
    res.redirect(buildUrl('pages/sellingPage.html'));
  });
}

// 4. App Entry Points
const appHandler = (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/landingPage.html'));
};

router.get('/app', appHandler);
if (BASE_PATH) {
  router.get(`${BASE_PATH}/app`, appHandler);
}

// 5. Protected Pages - Serve todas as outras páginas com autenticação
const protectedPagesPath = path.join(__dirname, '../../../public/pages');

router.use('/pages', authenticatePage, express.static(protectedPagesPath));
if (BASE_PATH) {
  router.use(`${BASE_PATH}/pages`, authenticatePage, express.static(protectedPagesPath));
}

export { router as staticRoutes };
