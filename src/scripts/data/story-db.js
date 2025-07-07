// src/scripts/data/story-db.js

/* eslint-disable no-console */

const DB_NAME = 'StoryAppDatabase'; // Nama database Anda
const DB_VERSION = 1; // Versi database. Tingkatkan setiap kali ada perubahan skema (misal: object store baru)
const OBJECT_STORE_NAME = 'stories'; // Nama object store untuk data cerita

let db = null; // Variabel untuk menyimpan instance database IndexedDB

/**
 * Membuka koneksi ke database IndexedDB.
 * Jika database belum ada atau versinya lebih tinggi, event 'upgradeneeded' akan dipicu.
 * @returns {Promise<IDBDatabase>} Instance database IndexedDB.
 */
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    // Membuka atau membuat database
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handler ketika ada error dalam membuka database
    request.onerror = (event) => {
      console.error('IndexedDB Error:', event.target.errorCode);
      reject(new Error('Gagal membuka database IndexedDB.'));
    };

    // Handler ketika database berhasil dibuka
    request.onsuccess = (event) => {
      db = event.target.result; // Simpan instance database
      console.log(`IndexedDB '${DB_NAME}' versi ${DB_VERSION} berhasil dibuka.`);
      resolve(db);
    };

    // Handler ketika database pertama kali dibuat atau versi ditingkatkan
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log(`IndexedDB '${DB_NAME}' sedang di-upgrade atau dibuat baru.`);

      // Membuat object store jika belum ada
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        // Membuat object store dengan 'id' sebagai keyPath (kunci unik untuk setiap objek cerita)
        db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
        console.log(`Object store '${OBJECT_STORE_NAME}' berhasil dibuat.`);
      }
      // Jika Anda perlu indeks tambahan (misalnya untuk mencari berdasarkan 'author'):
      // const store = db.transaction(OBJECT_STORE_NAME, 'readwrite').objectStore(OBJECT_STORE_NAME);
      // store.createIndex('author', 'author', { unique: false });
    };
  });
};

/**
 * Fungsi pembantu untuk mendapatkan object store dalam transaksi.
 * Jika database belum terbuka, fungsi ini akan membukanya terlebih dahulu.
 * @param {string} storeName Nama object store.
 * @param {'readonly'|'readwrite'} mode Mode transaksi.
 * @returns {Promise<IDBObjectStore>} Instance object store.
 */
const getObjectStore = async (storeName, mode) => {
  if (!db) {
    // Jika instance database belum ada, buka dulu
    await openDatabase();
  }
  // Memulai transaksi dan mendapatkan object store
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

/**
 * Menyimpan data cerita baru ke IndexedDB.
 * @param {object} story Objek cerita yang akan disimpan. Harus memiliki properti 'id'.
 * @returns {Promise<void>}
 */
const addStory = async (story) => {
  const store = await getObjectStore(OBJECT_STORE_NAME, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.add(story); // Menambahkan objek ke object store

    request.onsuccess = () => {
      console.log(`Cerita dengan ID ${story.id} berhasil ditambahkan.`);
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Gagal menambahkan cerita dengan ID ${story.id}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Mengambil semua data cerita dari IndexedDB.
 * @returns {Promise<object[]>} Array berisi semua objek cerita.
 */
const getAllStories = async () => {
  const store = await getObjectStore(OBJECT_STORE_NAME, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.getAll(); // Mengambil semua objek dari object store

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('Gagal mengambil semua cerita:', event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Mengambil satu data cerita berdasarkan ID dari IndexedDB.
 * @param {string} id ID dari cerita yang akan diambil.
 * @returns {Promise<object|undefined>} Objek cerita atau undefined jika tidak ditemukan.
 */
const getStoryById = async (id) => {
  const store = await getObjectStore(OBJECT_STORE_NAME, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.get(id); // Mengambil objek berdasarkan keyPath 'id'

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error(`Gagal mengambil cerita dengan ID ${id}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Memperbarui data cerita yang sudah ada di IndexedDB.
 * Jika objek dengan ID yang sama tidak ada, ia akan ditambahkan.
 * @param {object} story Objek cerita yang akan diperbarui. Harus memiliki properti 'id'.
 * @returns {Promise<void>}
 */
const updateStory = async (story) => {
  const store = await getObjectStore(OBJECT_STORE_NAME, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(story); // put() akan memperbarui jika ada, atau menambahkan jika tidak ada

    request.onsuccess = () => {
      console.log(`Cerita dengan ID ${story.id} berhasil diperbarui.`);
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Gagal memperbarui cerita dengan ID ${story.id}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Menghapus data cerita dari IndexedDB berdasarkan ID.
 * @param {string} id ID dari cerita yang akan dihapus.
 * @returns {Promise<void>}
 */
const deleteStory = async (id) => {
  const store = await getObjectStore(OBJECT_STORE_NAME, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id); // Menghapus objek berdasarkan keyPath 'id'

    request.onsuccess = () => {
      console.log(`Cerita dengan ID ${id} berhasil dihapus.`);
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Gagal menghapus cerita dengan ID ${id}:`, event.target.error);
      reject(event.target.error);
    };
  });
};

// Ekspor semua fungsi yang akan digunakan oleh bagian lain aplikasi Anda
export {
  openDatabase, // Panggil ini sekali saat aplikasi dimulai
  addStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory,
};