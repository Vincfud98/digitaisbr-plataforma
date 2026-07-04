importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDgbTuXzez0jpdbYv0sTY1oGwR2MaQ3ZPE',
  authDomain: 'digitaisbr-plataforma.firebaseapp.com',
  projectId: 'digitaisbr-plataforma',
  storageBucket: 'digitaisbr-plataforma.firebasestorage.app',
  messagingSenderId: '401371609866',
  appId: '1:401371609866:web:ccd98275d34b41ed4698f3',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'DigitaisBR';
  const options = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data,
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
