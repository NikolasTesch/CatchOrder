import { Router } from 'express';
import express from 'express';
import path from 'path';
import { authenticatePage } from '../middlewares/jwtAuth';

const router = Router();

// 1. Static Assets (Public)
router.use('/css', express.static(path.join(__dirname, '../../../public/css')));
router.use('/js', express.static(path.join(__dirname, '../../../public/js')));
router.use('/img', express.static(path.join(__dirname, '../../../public/img')));
router.use('/uploads', express.static(path.join(__dirname, '../../../public/uploads')));

// 2. Public Pages (Explicit exceptions)
router.get('/pages/landingPage.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/landingPage.html'));
});
/* router.get('/pages/forgotPassword.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/pages/forgotPassword.html'));
}); */

// 3. Root Redirect
router.get('/', (req, res) => {
  res.redirect('/pages/landingPage.html');
});

// 4. Protected Pages (Rest of /pages)
router.use('/pages', authenticatePage, express.static(path.join(__dirname, '../../../public/pages')));

export { router as staticRoutes };
