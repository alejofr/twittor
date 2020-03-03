//imports
importScripts('js/sw-utils.js');


//Creamos los nombre del cache, juntos con la versiones
const STATIC_CACHE    = 'static-v4';
const DYNAMIC_CACHE   = 'dynamic-v2';
const INMUTABLE_CACHE = 'inmutable-v1';

//creamos constantes donde se van a guardar los archivos o la informacion en el cache

const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js' 
];


//Ahora vamos a instalar el service worker y guarderemos la informacion en el cache

self.addEventListener('install', e => {

    const cacheStatic = caches.open( STATIC_CACHE ).then( cache => cache.addAll(APP_SHELL) );
    const cacheInmutable = caches.open( INMUTABLE_CACHE ).then( cache => cache.addAll( APP_SHELL_INMUTABLE ) );

    e.waitUntil( Promise.all([cacheStatic, cacheInmutable]));
});

//Actvando el Service Worker

self.addEventListener('activate', e => {

    const respuesta = caches.keys().then( keys => {
        //Aqui obtenemos todos los caches
        keys.forEach( key => {

            if( key !== STATIC_CACHE && key.includes('static') ){
                //luego de la validacion eliminamos la antigua version del static para agregar una nueva version
                return caches.delete(key);
            }

            if( key !== DYNAMIC_CACHE && key.includes('dynamic') ){
                return caches.delete(key);
            }
        });
    });

    e.waitUntil( respuesta );
});


//manejando unposible error con enlaces externos de la pagina, para guardar creamos un cache dinamico

self.addEventListener('fetch', e => {

    const respuesta = caches.match( e.request ).then( res => {

        if( res ){
            return res;
        }else{

            return fetch( e.request ).then( newRes => {
                return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);
            });
        }
    });

    e.respondWith( respuesta );
});


