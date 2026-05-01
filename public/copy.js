document.addEventListener("DOMContentLoaded", () => {
  const getMissingStickersText = () => {
    let text = 'Minha lista de faltantes é:\n';
    document.querySelectorAll('[js-sticker-button]').forEach((node) => {
      if (node.getAttribute('js-sticker-filled') !== 'true') {
        text = text.concat(node.getAttribute('js-sticker-id') + ' - ')
      }
    });
    return text.replace(/\s-\s$/g, '');
  };

  document.querySelector('[js-copy]').addEventListener('click', (event) => {
    event.preventDefault();
    navigator.clipboard.writeText(getMissingStickersText());
    event.target.focus();
  });
});
