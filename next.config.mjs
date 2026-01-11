/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public', // Folder tujuan file service worker
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // PWA mati pas mode dev biar gak ganggu
});

const nextConfig = {
  // Config lain kamu (kalau ada)
};

module.exports = withPWA(nextConfig);