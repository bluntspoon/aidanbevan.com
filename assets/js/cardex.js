// Car-dex: photograph a car, get a guess and a price band, keep it on this phone.
// No framework and no build step — this file is served as-is by Jekyll.

const API = 'https://cardex.bluntspoon.workers.dev';
const MAX_EDGE = 1024;
const MAX_UPLOAD_BYTES = 5.5 * 1024 * 1024;

const $ = (id) => document.getElementById(id);

const el = {
  add: $('cx-add'),
  file: $('cx-file'),
  status: $('cx-status'),
  result: $('cx-result'),
  preview: $('cx-preview'),
  message: $('cx-message'),
  card: $('cx-card'),
  badges: $('cx-badges'),
  make: $('cx-make'),
  model: $('cx-model'),
  year: $('cx-year'),
  value: $('cx-value'),
  basis: $('cx-basis'),
  save: $('cx-save'),
  again: $('cx-again'),
  count: $('cx-count'),
  search: $('cx-search'),
  exportButton: $('cx-export'),
  importButton: $('cx-import'),
  importFile: $('cx-import-file'),
  empty: $('cx-empty'),
  grid: $('cx-grid'),
};

// The car currently on screen, once the API has answered.
let current = null;
let searching = false;

/* ------------------------------------------------------------------ numbers */

const rand = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
});

function priceBand(value) {
  if (!value) return '—';
  return `${rand.format(value.low)} – ${rand.format(value.high)}`;
}

function status(text, tone = 'info') {
  el.status.textContent = text;
  el.status.dataset.tone = tone;
}

/* -------------------------------------------------------------- photo input */

function downscale(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file did not look like a photo. Try a JPEG or PNG.'));
    };
    image.src = url;
  });
}

async function handlePhoto(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    status('That is not a photo — try a JPEG or PNG from the camera.', 'error');
    return;
  }
  if (!navigator.onLine) {
    status('No signal. Car-dex needs a connection to identify a car, but your collection still works.', 'error');
    return;
  }

  searching = true;
  current = null;
  el.add.disabled = true;
  // Clear the old card straight away: the new photo must not show the previous car's
  // details while the API is still thinking.
  el.card.hidden = true;
  el.message.hidden = true;
  el.save.disabled = true;
  el.result.hidden = true;
  status('Looking at the car…');

  try {
    const dataUrl = await downscale(file);
    el.preview.src = dataUrl;
    el.result.hidden = false;

    if (dataUrl.length > MAX_UPLOAD_BYTES) {
      throw new Error('That photo is too big even after shrinking. Try again in better light.');
    }

    const response = await fetch(`${API}/api/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.ok !== true) {
      throw new Error(payload?.error?.message || 'The car-spotting robot did not answer. Try again.');
    }

    if (!payload.car || payload.car.is_car === false) {
      showMessage(payload.message || 'I could not see a car in that photo. Stand back a little and try again.');
      status('');
      return;
    }

    showResult(payload.car, payload.value, dataUrl);
    status('');
  } catch (error) {
    showMessage(error.message || 'Something went wrong. Try again.');
    status('');
  } finally {
    searching = false;
    el.add.disabled = false;
    el.file.value = '';
  }
}

function showMessage(text) {
  el.card.hidden = true;
  el.message.hidden = false;
  el.message.textContent = text;
  el.result.hidden = false;
}

function showResult(car, value, photo) {
  current = { car, value, photo };

  el.message.hidden = true;
  el.card.hidden = false;
  el.make.value = car.make || '';
  el.model.value = car.model || '';
  el.year.value = car.year || '';

  const badges = [];
  // Prefer the body style of the matched model: the photo guess says "SUV" for a Polo.
  const body = (value && value.body) || car.body_type;
  if (body && body !== 'unknown') badges.push({ text: body });
  if (car.colour) badges.push({ text: car.colour });
  if (typeof car.confidence === 'number') {
    const percent = Math.round(car.confidence * 100);
    badges.push({ text: `${percent}% sure`, tone: percent >= 70 ? 'good' : percent >= 45 ? 'ok' : 'weak' });
  }
  el.badges.replaceChildren(
    ...badges.map((badge) => {
      const span = document.createElement('span');
      span.className = `cx-badge${badge.tone ? ` cx-badge-${badge.tone}` : ''}`;
      span.textContent = badge.text;
      return span;
    }),
  );

  renderValue(value);
  el.save.disabled = false;
  el.make.focus({ preventScroll: true });
}

function renderValue(value) {
  el.value.textContent = priceBand(value);
  if (!value) {
    el.basis.textContent = '';
    return;
  }
  const bits = [];
  if (value.matched) bits.push(`closest match: ${titleCase(value.matched)}`);
  else bits.push('no exact model match, so this is a body-style estimate');
  bits.push(`priced as a ${value.year} model`);
  el.basis.textContent = bits.join(' · ');
}

/* ------------------------------------------------------- re-pricing on edit */

let repriceTimer = null;
function repriceSoon() {
  clearTimeout(repriceTimer);
  repriceTimer = setTimeout(reprice, 600);
}

async function reprice() {
  if (!current) return;
  const make = el.make.value.trim();
  const model = el.model.value.trim();
  const year = Number.parseInt(el.year.value, 10) || null;
  if (!make && !model && !year) return;

  try {
    const response = await fetch(`${API}/api/value`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ make, model, year, body_type: current.car.body_type, confidence: current.car.confidence }),
    });
    const payload = await response.json();
    if (payload?.ok && payload.value) {
      current.car = { ...current.car, make, model, year };
      current.value = payload.value;
      renderValue(payload.value);
    }
  } catch {
    el.basis.textContent = 'Could not re-price offline — the old estimate is still shown.';
  }
}

/* ---------------------------------------------------------------- storage */

const DB_NAME = 'cardex';
const STORE = 'cars';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, run) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const store = transaction.objectStore(STORE);
    let result;
    try {
      result = run(store);
    } catch (error) {
      reject(error);
      return;
    }
    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

const allCars = () => withStore('readonly', (store) => {
  const request = store.getAll();
  const box = {};
  request.onsuccess = () => { box.value = request.result; };
  return box;
}).then((box) => (box.value || []).sort((a, b) => b.added - a.added));

function saveCar(car) {
  return withStore('readwrite', (store) => store.add(car));
}

function deleteCar(id) {
  return withStore('readwrite', (store) => store.delete(id));
}

/* ------------------------------------------------------------- collection */

const CURRENCY = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 });

function titleCase(text) {
  return String(text || '')
    .split(' ')
    .map((word) => (word.length > 2 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function carTitle(car) {
  const name = [car.make, car.model].filter(Boolean).map(titleCase).join(' ');
  return name || 'Mystery car';
}

async function renderCollection() {
  let cars = [];
  try {
    cars = await allCars();
  } catch {
    el.empty.textContent = 'Could not open the collection on this device (private browsing blocks storage).';
    el.empty.hidden = false;
    return;
  }

  const query = el.search.value.trim().toLowerCase();
  const shown = query
    ? cars.filter((car) => `${carTitle(car)} ${car.year || ''}`.toLowerCase().includes(query))
    : cars;

  el.count.textContent = cars.length ? `${cars.length}` : '';
  el.empty.hidden = shown.length > 0;
  if (!cars.length) el.empty.textContent = 'No cars yet. Snap your first one.';
  else if (!shown.length) el.empty.textContent = `Nothing matches “${el.search.value.trim()}”.`;

  el.grid.replaceChildren(
    ...shown.map((car) => {
      const item = document.createElement('li');
      item.className = 'cx-card-item';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cx-tile';
      button.setAttribute('aria-label', `${carTitle(car)}${car.year ? `, ${car.year}` : ''}`);

      const img = document.createElement('img');
      img.src = car.photo;
      img.alt = `Photograph of ${carTitle(car)}`;
      img.loading = 'lazy';
      img.decoding = 'async';

      const caption = document.createElement('span');
      caption.className = 'cx-tile-text';
      const name = document.createElement('strong');
      name.textContent = carTitle(car);
      const meta = document.createElement('span');
      meta.textContent = [car.year, car.value ? CURRENCY.format(car.value.mid) : null].filter(Boolean).join(' · ');
      caption.append(name, meta);

      button.append(img, caption);
      button.addEventListener('click', () => openSaved(car));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'cx-remove';
      remove.setAttribute('aria-label', `Remove ${carTitle(car)} from the collection`);
      remove.textContent = '×';
      remove.addEventListener('click', async () => {
        if (!confirm(`Remove ${carTitle(car)} from your collection?`)) return;
        await deleteCar(car.id);
        renderCollection();
        status('Removed.', 'info');
      });

      item.append(button, remove);
      return item;
    }),
  );
}

function openSaved(car) {
  current = { car, value: car.value, photo: car.photo, savedId: car.id };
  el.preview.src = car.photo;
  el.result.hidden = false;
  el.message.hidden = true;
  el.card.hidden = false;
  el.make.value = car.make || '';
  el.model.value = car.model || '';
  el.year.value = car.year || '';
  el.badges.replaceChildren();
  renderValue(car.value);
  el.save.disabled = false;
  el.save.textContent = 'Update this car';
  el.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.make.focus({ preventScroll: true });
}

/* ------------------------------------------------------------ save / share */

async function saveCurrent() {
  if (!current) return;
  const car = {
    make: el.make.value.trim(),
    model: el.model.value.trim(),
    year: Number.parseInt(el.year.value, 10) || null,
    body_type: current.car.body_type || 'unknown',
    colour: current.car.colour || null,
    confidence: current.car.confidence ?? null,
    photo: current.photo,
    value: current.value || null,
    added: Date.now(),
  };

  if (current.savedId) await deleteCar(current.savedId);
  await saveCar(car);
  current = null;
  el.result.hidden = true;
  el.save.disabled = true;
  el.save.textContent = 'Add to my collection';
  status('Saved to your collection.', 'good');
  renderCollection();
}

function exportCollection() {
  allCars().then((cars) => {
    if (!cars.length) {
      status('Nothing to export yet.', 'info');
      return;
    }
    const blob = new Blob([JSON.stringify({ app: 'car-dex', version: 1, cars }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `car-dex-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    status(`Exported ${cars.length} car${cars.length === 1 ? '' : 's'}.`, 'good');
  });
}

async function importCollection(file) {
  try {
    const parsed = JSON.parse(await file.text());
    const cars = Array.isArray(parsed) ? parsed : parsed.cars;
    if (!Array.isArray(cars)) throw new Error('That file does not look like a Car-dex export.');

    let added = 0;
    for (const car of cars) {
      if (!car || typeof car.photo !== 'string') continue;
      const { id, ...rest } = car;
      await saveCar({ ...rest, added: rest.added || Date.now() });
      added += 1;
    }
    status(`Imported ${added} car${added === 1 ? '' : 's'}.`, 'good');
    renderCollection();
  } catch (error) {
    status(error.message || 'Could not read that file.', 'error');
  } finally {
    el.importFile.value = '';
  }
}

/* ------------------------------------------------------------------ wiring */

el.add.addEventListener('click', () => el.file.click());
el.file.addEventListener('change', (event) => handlePhoto(event.target.files?.[0]));

el.save.addEventListener('click', saveCurrent);
el.again.addEventListener('click', () => {
  current = null;
  el.result.hidden = true;
  el.save.textContent = 'Add to my collection';
  el.file.click();
});

for (const input of [el.make, el.model, el.year]) input.addEventListener('input', repriceSoon);

el.search.addEventListener('input', renderCollection);

el.exportButton.addEventListener('click', exportCollection);
el.importButton.addEventListener('click', () => el.importFile.click());
el.importFile.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) importCollection(file);
});

window.addEventListener('online', () => status(''));
window.addEventListener('offline', () => status('You are offline — the collection still works, but new photos need a connection.', 'error'));

renderCollection();
