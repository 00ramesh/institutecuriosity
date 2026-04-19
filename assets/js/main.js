document.addEventListener('DOMContentLoaded', function () {
  function bind(toggleId, navId) {
    var t = document.getElementById(toggleId);
    var n = document.getElementById(navId);
    if (t && n) {
      t.addEventListener('click', function (e) {
        e.stopPropagation();
        n.classList.toggle('open');
      });
      // prevent clicks inside nav from bubbling to document
      n.addEventListener('click', function (e) { e.stopPropagation(); });
    }
  }

  bind('nav-toggle', 'site-nav');
  bind('nav-toggle-2', 'site-nav-2');
  bind('nav-toggle-3', 'site-nav-3');
  bind('nav-toggle-4', 'site-nav-4');
  bind('nav-toggle-5', 'site-nav-5');

  // Close any open mobile nav when clicking outside
  document.addEventListener('click', function () {
    document.querySelectorAll('.site-nav.open').forEach(function (nav) {
      nav.classList.remove('open');
    });
  });

  // Close nav when clicking a link (mobile), but keep hamburger visible
  document.querySelectorAll('.site-nav').forEach(function (nav) {
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 800) {
          nav.classList.remove('open');
        }
      });
    });
  });

  // Also close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.site-nav.open').forEach(function (nav) {
        nav.classList.remove('open');
      });
    }
  });

  /* Banner slider: simple, responsive, touch-enabled */
  function initBannerSlider(rootSelector){
    var root = document.querySelector(rootSelector);
    if(!root) return;
    var track = root.querySelector('.banner-track');
    var slides = Array.from(root.querySelectorAll('.banner-slide'));
    var prev = root.querySelector('.banner-prev');
    var next = root.querySelector('.banner-next');
    var dotsWrap = root.querySelector('.banner-dots');
    var idx = 0; var playing = true; var interval = 4500; var timer = null;

    // Pixel-accurate sliding that accounts for slide width and margins
    var slideFullWidth = 0;
    function getSlideFullWidth(slide){
      var rect = slide.getBoundingClientRect();
      var style = window.getComputedStyle(slide);
      var ml = parseFloat(style.marginLeft) || 0;
      var mr = parseFloat(style.marginRight) || 0;
      return rect.width + ml + mr;
    }

    function recalc(){
      if(!slides.length) return;
      slideFullWidth = getSlideFullWidth(slides[0]) || root.clientWidth;
      // ensure track transform stays correct after resize
      track.style.transition = 'none';
      track.style.transform = 'translate3d(' + (-idx * slideFullWidth) + 'px,0,0)';
      // force reflow then restore transition
      void track.offsetHeight;
      track.style.transition = '';
    }

    function go(i, animate){
      idx = (i + slides.length) % slides.length;
      if(animate===false) track.style.transition = 'none';
      track.style.transform = 'translate3d(' + (-idx * slideFullWidth) + 'px,0,0)';
      if(animate===false) void track.offsetHeight, track.style.transition = '';
      if(dotsWrap){ Array.from(dotsWrap.children).forEach(function(b,bi){ b.classList.toggle('active', bi===idx); }); }
    }

    function nextSlide(){ go(idx+1); }
    function prevSlide(){ go(idx-1); }

    // build dots (if wrapper exists)
    if(dotsWrap){
      slides.forEach(function(s, i){
        var b = document.createElement('button');
        if(i===0) b.classList.add('active');
        b.addEventListener('click', function(){ go(i); reset(); });
        dotsWrap.appendChild(b);
      });
    }

    next && next.addEventListener('click', function(e){ e.stopPropagation(); nextSlide(); reset(); });
    prev && prev.addEventListener('click', function(e){ e.stopPropagation(); prevSlide(); reset(); });

    // autoplay
    function play(){ if(timer) clearInterval(timer); timer = setInterval(nextSlide, interval); playing = true; }
    function stop(){ if(timer) clearInterval(timer); timer = null; playing = false; }
    function reset(){ stop(); play(); }

    // pause on hover/focus
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);

    // touch support (basic)
    var startX = 0, dx = 0;
    root.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; stop(); });
    root.addEventListener('touchmove', function(e){ dx = e.touches[0].clientX - startX; });
    root.addEventListener('touchend', function(e){ if(Math.abs(dx) > 40){ if(dx<0) nextSlide(); else prevSlide(); } dx=0; play(); });

    // init
    // calculate sizes after images/layout settle
    window.addEventListener('load', function(){ recalc(); go(0,false); play(); });
    window.addEventListener('resize', function(){ recalc(); });
  }

  // initialize on pages
  initBannerSlider('.banner-slider');
});
    // Submit contact form via fetch and clear on success
    var contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Basic email validation (extra check beyond HTML5)
        var emailInput = contactForm.querySelector('input[name="email"]');
        var email = emailInput ? emailInput.value.trim() : '';
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          // remove existing error if present
          var prevErr = contactForm.parentNode.querySelector('.contact-error');
          if (prevErr) prevErr.parentNode.removeChild(prevErr);
          var err = document.createElement('div');
          err.className = 'contact-error';
          err.textContent = 'Please enter a valid email address.';
          contactForm.parentNode.insertBefore(err, contactForm.nextSibling);
          setTimeout(function () { if (err && err.parentNode) err.parentNode.removeChild(err); }, 5000);
          if (emailInput) emailInput.focus();
          return;
        }

        var action = contactForm.getAttribute('action') || window.location.href;
        var method = (contactForm.getAttribute('method') || 'POST').toUpperCase();
        var fd = new FormData(contactForm);

        fetch(action, { method: method, body: fd })
          .then(function (res) {
            if (!res.ok) throw new Error('Network response was not ok');
            // try parse JSON if available
            return res.json().catch(function () { return res; });
          })
          .then(function () {
            contactForm.reset();
            // transient success message
            var msg = document.createElement('div');
            msg.className = 'contact-success';
            msg.textContent = 'Message sent. Thank you!';
            contactForm.parentNode.insertBefore(msg, contactForm.nextSibling);
            setTimeout(function () { if (msg && msg.parentNode) msg.parentNode.removeChild(msg); }, 5000);
          })
          .catch(function () {
            alert('There was an error sending the message. Please try again.');
          });
      });
    }
