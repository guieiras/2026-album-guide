function init() {
  if (!getTokenFromStorage()) {
    populateTokenForm();
  } else {
    setupAlbum();
  }

  ViewFunctions.toggleMode('init');
  ViewFunctions.toggleViewMode('all');
}

function populateAlbum() {
  const albumNode = document.querySelector("[js-album]");
  albumNode.innerHTML = "";
  const albumSectionTemplate = document.querySelector("template[js-album-section]");
  const albumStickerTemplate = document.querySelector("template[js-album-sticker]");

  album.forEach((section) => {
    let sectionNode = document.importNode(albumSectionTemplate.content, true);
    let sectionContent = sectionNode.querySelector('[js-section-content]');
    sectionNode.querySelector('[js-section-name]').textContent = section.name;
    section.stickers.forEach((sticker) => {
      let stickerNode = document.importNode(albumStickerTemplate.content, true);
      let stickerButton = stickerNode.querySelector('[js-sticker-button]');
      stickerButton.textContent = sticker;
      stickerButton.setAttribute('js-sticker-id', sticker);
      sectionContent.appendChild(stickerNode);
      stickerButton.addEventListener('click', () => {
        const mode = localStorage.getItem('mode');
        if (mode == 'write' || mode == 'delete') {
          fetch(`${window.location.origin}/api/albums/${getTokenFromStorage()}`, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stickers: { [sticker]: (mode == 'write') } })
          })
          .then((response) => updateAlbum(response.json()))
          .catch((err) => alert('Não foi possível atualizar os dados do álbum'));
          if (mode == 'delete') {
            removeFromSandbox(sticker);
          }
        } else if (mode == 'sandbox') {
          if (stickerButton.getAttribute('js-sticker-filled') !== 'true') {
            if (stickerButton.getAttribute('js-sticker-sandbox') !== 'true') {
              addToSandbox(sticker);
              stickerButton.setAttribute('js-sticker-sandbox', 'true');
            }
          }
        }
      });
    });
    albumNode.appendChild(sectionNode);
  });
}

function populateTokenForm() {
  const albumNode = document.querySelector("[js-album]");
  albumNode.innerHTML = ""
  const tokenFormTemplate = document.querySelector("template[js-token-form]");
  albumNode.appendChild(document.importNode(tokenFormTemplate.content, true));
  setRequestTokenLink();
  document.querySelector('.js-btn-token').addEventListener('click', () => {
    tokenId = document.querySelector('#album-token').value;
    fetch(`${window.location.origin}/api/albums/${tokenId}`)
    .then((result) => {
      localStorage.setItem('albumToken', tokenId);
      setupAlbum(result.json());
    })
    .catch((err) => {
      albumNode.innerHTML = JSON.stringify(err);
      alert("Não foi possível configurar o Token");
    });
  });
  document.querySelector('.nav-status').classList.add('hidden');
}

function setupAlbum(contentPromise) {
  if (!contentPromise) {
    return fetch(`${window.location.origin}/api/albums/${getTokenFromStorage()}`)
    .then((result) => setupAlbum(result.json()))
    .catch((err) => { alert("Não foi possível sincronizar usando este Token"); });
  } else {
    return contentPromise.then(({ stickers }) => {
      populateAlbum();
      updateStickerCount(stickers);
      document.querySelector('.nav-status').classList.remove('hidden');
    });
  }
}

function updateAlbum(response) {
  response.then(({ stickers }) => updateStickerCount(stickers));
}

function updateStickerCount(object) {
  const sandboxStickers = getSandboxStickers();
  Object.keys(object || {}).forEach((sticker) => {
    const stickerButton = document.querySelector(`[js-sticker-id="${sticker}"]`);
    stickerButton.setAttribute('js-sticker-filled', object[sticker]);
  });
  sandboxStickers.forEach((sticker) => {
    const stickerButton = document.querySelector(`[js-sticker-id="${sticker}"]`);
    if (stickerButton && stickerButton.getAttribute('js-sticker-filled') !== 'true') {
      stickerButton.setAttribute('js-sticker-sandbox', 'true');
    }
  });
  ViewFunctions.filter(localStorage.getItem('viewMode'));
  updateStatusesCount();
}

function updateStatusesCount() {
  const totalCountStatus = document.querySelector("span[js-total-count]");
  const filledCountStatus = document.querySelector("span[js-filled-count]");
  const remainingCountStatus = document.querySelector("span[js-remaining-count]");
  const statusPercentStatus = document.querySelector("span[js-status-percent]");

  const totalStickers = document.querySelectorAll('[js-sticker-button]').length;
  const filledStickers = document.querySelectorAll('[js-sticker-filled="true"]').length;

  totalCountStatus.textContent = totalStickers;
  filledCountStatus.textContent = filledStickers;
  remainingCountStatus.textContent = totalStickers - filledStickers;
  statusPercentStatus.textContent = Math.round(100 * filledStickers / totalStickers);

  document.querySelectorAll('.section').forEach((section) => {
    let sectionTotal = section.querySelectorAll('[js-sticker-button]').length;
    let sectionFilled = section.querySelectorAll('[js-sticker-filled="true"]').length;

    section.querySelector('[js-section-count]').textContent = `${sectionFilled}/${sectionTotal}`;
  });
}

function getTokenFromStorage() {
  return albumToken = localStorage.getItem('albumToken');
}

function getSandboxStickers() {
  const stored = localStorage.getItem('sandboxStickers');
  return stored ? JSON.parse(stored) : [];
}

function setSandboxStickers(stickers) {
  localStorage.setItem('sandboxStickers', JSON.stringify(stickers));
}

function addToSandbox(sticker) {
  const stickers = getSandboxStickers();
  if (!stickers.includes(sticker)) {
    stickers.push(sticker);
    setSandboxStickers(stickers);
  }
}

function removeFromSandbox(sticker) {
  const stickers = getSandboxStickers();
  const filtered = stickers.filter(s => s !== sticker);
  setSandboxStickers(filtered);
}

init();
