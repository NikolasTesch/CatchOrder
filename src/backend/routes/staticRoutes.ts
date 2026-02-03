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
});

// 2. Public Pages (Explicit exceptions)
const serveSellingPage = (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/sellingPage.html'));
};
const serveLandingPage = (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/landingPage.html'));
};

router.get('/pages/landingPage.html', serveLandingPage);
router.get('/pages/sellingPage.html', serveSellingPage);

// 3. Root & App Redirects
router.get('/', (req, res) => {
  res.redirect('/pages/sellingPage.html');
});

// App Entry Points
const appHandler = (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/landingPage.html'));
};

router.get('/app', appHandler);

// 4. Protected Pages (Rest of /pages)
router.use('/pages', authenticatePage, express.static(path.join(__dirname, '../../../public/pages')));

export { router as staticRoutes };
