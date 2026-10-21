// Inkwell Lane front-end behaviours
(function () {
  'use strict';

  // Mobile navigation
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Confirmation dialogs for destructive forms
  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      if (!window.confirm(form.getAttribute('data-confirm'))) {
        event.preventDefault();
      }
    });
  });

  // Show the selected book cover before submitting the admin form.
  var coverInput = document.querySelector('[data-cover-input]');
  var coverPreview = document.querySelector('[data-cover-preview]');
  var coverPreviewContainer = document.querySelector('[data-cover-preview-container]');
  var coverCaption = document.querySelector('[data-cover-caption]');
  var coverPreviewUrl;
  if (coverInput && coverPreview && coverPreviewContainer) {
    coverInput.addEventListener('change', function () {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
      var file = coverInput.files && coverInput.files[0];
      if (!file) return;
      coverPreviewUrl = URL.createObjectURL(file);
      coverPreview.src = coverPreviewUrl;
      coverPreviewContainer.hidden = false;
      if (coverCaption) coverCaption.textContent = 'Selected cover preview:';
    });
  }

  // Auto-dismiss notices after 5 seconds
  document.querySelectorAll('.notice').forEach(function (notice) {
    window.setTimeout(function () {
      notice.style.transition = 'opacity .5s ease';
      notice.style.opacity = '0';
      window.setTimeout(function () { notice.remove(); }, 500);
    }, 5000);
  });
})();
