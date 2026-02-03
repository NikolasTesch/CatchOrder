import { Router } from 'express';
import express from 'express';
import path from 'path';
import { authenticatePage } from '../middlewares/jwtAuth';

const router = Router();

// 1. Static Assets (Public)
// 1. Static Assets (Public)
const assetTypes = ['css', 'js', 'img', 'uploads'];
assetTypes.forEach(type => {
  router.use(`/${type}`, express.static(path.join(__dirname, `../../../public/${type}`)));
  router.use(`/server09/${type}`, express.static(path.join(__dirname, `../../../public/${type}`)));
});

// 2. Public Pages (Explicit exceptions)
router.get('/pages/landingPage.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/landingPage.html'));
});
router.get('/pages/sellingPage.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/sellingPage.html'));
});

/* router.get('/pages/forgotPassword.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/forgotPassword.html'));
}); */

// 3. Root & App Redirects
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/sellingPage.html'));
});

router.get('/server09', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/sellingPage.html'));
});

// App Entry Points
const appHandler = (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/landingPage.html'));
};

router.get('/app', appHandler);
router.get('/server09/app', appHandler);

// 4. Protected Pages (Rest of /pages)
router.use('/pages', authenticatePage, express.static(path.join(__dirname, '../../../public/pages')));

export { router as staticRoutes };
