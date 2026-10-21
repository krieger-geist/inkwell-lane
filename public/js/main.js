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
    // Close the mobile menu after jumping to a home-page section.
    nav.querySelectorAll('a[data-section]').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // On the home page, highlight the menu link for the section in view.
  var sectionLinks = document.querySelectorAll('.site-nav a[data-section]');
  if (window.location.pathname === '/' && sectionLinks.length && 'IntersectionObserver' in window) {
    var setActive = function (id) {
      sectionLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('data-section') === id);
      });
    };
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'books', 'about', 'contact'].forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
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
