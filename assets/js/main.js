/**
 * Sparkle & Shine Eco-Cleaning Co.
 * Interactive Application Logic & Price Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. CALCULATOR LOGIC & STATE
     ========================================================================== */
  const state = {
    service: 'standard', // 'standard', 'deep', 'move', 'commercial'
    beds: 2,
    baths: 2,
    frequency: 'biweekly', // 'onetime', 'monthly', 'biweekly', 'weekly'
    addons: [] // array of { id, cost, name }
  };

  // Pricing Matrix configuration
  const serviceMultipliers = {
    standard: 1.0,
    deep: 1.35,
    move: 1.6,
    commercial: 1.25
  };

  const serviceNames = {
    standard: 'Standard Clean',
    deep: 'Deep Eco Clean',
    move: 'Move-In / Move-Out Clean',
    commercial: 'Commercial & Office Clean'
  };

  const bedBaseRates = {
    0: 110, // Studio
    1: 130, // 1 Bed
    2: 155, // 2 Beds
    3: 185, // 3 Beds
    4: 220, // 4 Beds
    5: 260  // 5+ Beds
  };

  const bathAdditionRate = 25; // per bathroom beyond 1

  const frequencyDiscounts = {
    onetime: 0,
    monthly: 0.10,
    biweekly: 0.15,
    weekly: 0.20
  };

  const frequencyNames = {
    onetime: 'One-Time Clean',
    monthly: 'Monthly (10% OFF)',
    biweekly: 'Bi-Weekly (15% OFF)',
    weekly: 'Weekly (20% OFF)'
  };

  // DOM Elements for Calculator
  const serviceButtons = document.querySelectorAll('.service-type-btn');
  const bedButtons = document.querySelectorAll('#bedrooms-selector .pill-option-btn');
  const bathButtons = document.querySelectorAll('#bathrooms-selector .pill-option-btn');
  const freqButtons = document.querySelectorAll('.frequency-btn');
  const addonCards = document.querySelectorAll('.addon-card');

  // Summary DOM Elements
  const summaryServiceText = document.getElementById('summary-service-text');
  const priceDisplayVal = document.getElementById('price-display-val');
  const pricePeriodLabel = document.getElementById('price-period-label');
  const savingsBadge = document.getElementById('savings-badge');
  const breakdownBaseVal = document.getElementById('breakdown-base-val');
  const breakdownAddonsRow = document.getElementById('breakdown-addons-row');
  const breakdownAddonsVal = document.getElementById('breakdown-addons-val');
  const breakdownDiscountRow = document.getElementById('breakdown-discount-row');
  const breakdownDiscountLabel = document.getElementById('breakdown-discount-label');
  const breakdownDiscountVal = document.getElementById('breakdown-discount-val');
  const breakdownTotalVal = document.getElementById('breakdown-total-val');
  const specDurationVal = document.getElementById('spec-duration-val');

  // Number Counter Animation Helper
  let currentPrice = 144;
  let counterAnimationId = null;

  function animatePriceTo(targetVal) {
    if (counterAnimationId) cancelAnimationFrame(counterAnimationId);

    const startVal = currentPrice;
    const difference = targetVal - startVal;
    if (difference === 0) {
      priceDisplayVal.textContent = targetVal;
      return;
    }

    const duration = 280; // ms
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      const ease = 1 - (1 - progress) * (1 - progress);
      const val = Math.round(startVal + difference * ease);
      priceDisplayVal.textContent = val;

      if (progress < 1) {
        counterAnimationId = requestAnimationFrame(updateCounter);
      } else {
        currentPrice = targetVal;
        priceDisplayVal.textContent = targetVal;
      }
    }

    counterAnimationId = requestAnimationFrame(updateCounter);
  }

  // Recalculate & Render
  function updateCalculator() {
    // 1. Calculate Base Space Cost
    const baseBedCost = bedBaseRates[state.beds] || 155;
    const additionalBaths = Math.max(0, state.baths - 1);
    const bathCost = additionalBaths * bathAdditionRate;
    const spaceSubtotal = (baseBedCost + bathCost) * serviceMultipliers[state.service];

    // 2. Addons Total
    const addonsTotal = state.addons.reduce((acc, curr) => acc + curr.cost, 0);

    // 3. Gross Subtotal
    const grossSubtotal = Math.round(spaceSubtotal + addonsTotal);

    // 4. Discount
    const discountRate = frequencyDiscounts[state.frequency] || 0;
    const discountAmount = Math.round(grossSubtotal * discountRate);
    const netTotal = grossSubtotal - discountAmount;

    // 5. Estimated Duration
    let hoursMin = 2.0 + (state.beds * 0.4) + (state.baths * 0.35);
    if (state.service === 'deep' || state.service === 'move') hoursMin *= 1.35;
    if (state.addons.length > 0) hoursMin += (state.addons.length * 0.3);
    const hoursMax = hoursMin + 0.8;
    const durationString = `~${hoursMin.toFixed(1)} - ${hoursMax.toFixed(1)} Hours`;

    // 6. Update UI
    animatePriceTo(netTotal);

    // Update Subtitles & Breakdown
    const bedLabel = state.beds === 0 ? 'Studio' : `${state.beds} ${state.beds === 1 ? 'Bed' : 'Beds'}`;
    const bathLabel = `${state.baths} ${state.baths === 1 ? 'Bath' : 'Baths'}`;
    summaryServiceText.textContent = `${serviceNames[state.service]} • ${bedLabel} / ${bathLabel}`;

    breakdownBaseVal.textContent = `$${Math.round(spaceSubtotal)}`;

    if (addonsTotal > 0) {
      breakdownAddonsRow.style.display = 'flex';
      breakdownAddonsVal.textContent = `+$${addonsTotal}`;
    } else {
      breakdownAddonsRow.style.display = 'none';
    }

    if (discountAmount > 0) {
      breakdownDiscountRow.style.display = 'flex';
      const pct = Math.round(discountRate * 100);
      breakdownDiscountLabel.textContent = `${frequencyNames[state.frequency].split(' ')[0]} Savings (${pct}%)`;
      breakdownDiscountVal.textContent = `-$${discountAmount}`;

      savingsBadge.style.display = 'inline-flex';
      savingsBadge.querySelector('span').textContent = `You save $${discountAmount} (${pct}% OFF)`;
    } else {
      breakdownDiscountRow.style.display = 'none';
      savingsBadge.style.display = 'none';
    }

    breakdownTotalVal.textContent = `$${netTotal}`;
    specDurationVal.textContent = durationString;

    if (state.frequency === 'onetime') {
      pricePeriodLabel.textContent = 'total';
    } else {
      pricePeriodLabel.textContent = '/ clean';
    }

    // Update modal banner info in case it opens
    updateModalSummary(netTotal, bedLabel, bathLabel);
  }

  // Update summary in the modal
  function updateModalSummary(netTotal, bedLabel, bathLabel) {
    const modalSummaryPlanTitle = document.getElementById('modalSummaryPlanTitle');
    const modalSummaryFrequencyText = document.getElementById('modalSummaryFrequencyText');
    const modalSummaryPriceVal = document.getElementById('modalSummaryPriceVal');

    if (modalSummaryPlanTitle && modalSummaryPriceVal) {
      modalSummaryPlanTitle.textContent = `${serviceNames[state.service]} • ${bedLabel} / ${bathLabel}`;
      modalSummaryFrequencyText.textContent = `${frequencyNames[state.frequency]}`;
      modalSummaryPriceVal.textContent = `$${netTotal}`;
    }
  }

  // Event Listeners: Service Types
  serviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      serviceButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      state.service = btn.getAttribute('data-service');
      updateCalculator();
    });
  });

  // Event Listeners: Bedrooms
  bedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      bedButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.beds = parseInt(btn.getAttribute('data-beds'), 10);
      updateCalculator();
    });
  });

  // Event Listeners: Bathrooms
  bathButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      bathButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.baths = parseInt(btn.getAttribute('data-baths'), 10);
      updateCalculator();
    });
  });

  // Event Listeners: Frequency
  freqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      freqButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      state.frequency = btn.getAttribute('data-frequency');
      updateCalculator();
    });
  });

  // Event Listeners: Addons
  addonCards.forEach(card => {
    card.addEventListener('click', () => {
      const addonId = card.getAttribute('data-addon');
      const addonCost = parseInt(card.getAttribute('data-cost'), 10);
      const addonTitle = card.querySelector('.addon-title').textContent;

      const existingIndex = state.addons.findIndex(a => a.id === addonId);
      if (existingIndex > -1) {
        state.addons.splice(existingIndex, 1);
        card.classList.remove('active');
        card.setAttribute('aria-checked', 'false');
      } else {
        state.addons.push({ id: addonId, cost: addonCost, name: addonTitle });
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
      }
      updateCalculator();
    });
  });

  /* ==========================================================================
     2. BOOKING MODAL LOGIC
     ========================================================================== */
  const bookingModal = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const btnOpenBookingModal = document.getElementById('btn-open-booking-modal');
  const heroPrimaryCta = document.getElementById('hero-primary-cta');
  const navQuoteCta = document.getElementById('nav-quote-cta');
  const modalFormContainer = document.getElementById('modalFormContainer');
  const modalSuccessContainer = document.getElementById('modalSuccessContainer');
  const bookingCheckoutForm = document.getElementById('bookingCheckoutForm');
  const btnDoneSuccess = document.getElementById('btnDoneSuccess');
  const bookingDateInput = document.getElementById('bookingDate');

  // Set min date for booking to tomorrow
  if (bookingDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    bookingDateInput.min = tomorrow.toISOString().split('T')[0];
    bookingDateInput.value = tomorrow.toISOString().split('T')[0];
  }

  function openBookingModal() {
    bookingModal.classList.add('open');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalFormContainer.style.display = 'block';
    modalSuccessContainer.style.display = 'none';
    updateCalculator();
  }

  function closeBookingModal() {
    bookingModal.classList.remove('open');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnOpenBookingModal) btnOpenBookingModal.addEventListener('click', openBookingModal);
  if (navQuoteCta) navQuoteCta.addEventListener('click', (e) => {
    // If on mobile or user wants instant modal
    openBookingModal();
  });
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeBookingModal);
  if (btnDoneSuccess) btnDoneSuccess.addEventListener('click', closeBookingModal);

  // Close on backdrop click
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });

  // Close on Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal.classList.contains('open')) {
      closeBookingModal();
    }
  });

  // Booking Form Submission
  if (bookingCheckoutForm) {
    bookingCheckoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById('submitBookingBtn');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        Securing Your Spot...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        const clientName = document.getElementById('clientFullName').value || 'Friend';
        const chosenDate = document.getElementById('bookingDate').value;
        const timeSlot = document.getElementById('bookingTimeSlot').selectedOptions[0].text;
        const address = document.getElementById('clientAddress').value;

        const successDetails = document.getElementById('successConfirmationDetails');
        if (successDetails) {
          successDetails.innerHTML = `
            Thank you, <strong>${clientName}</strong>! Your <strong>${serviceNames[state.service]}</strong> is reserved for <strong>${chosenDate}</strong> during <strong>${timeSlot}</strong> at <strong>${address}</strong>.
          `;
        }

        modalFormContainer.style.display = 'none';
        modalSuccessContainer.style.display = 'block';

        // Trigger celebratory sparkle burst
        triggerSparkleBurst();
      }, 700);
    });
  }

  // Commercial Walkthrough Button
  const btnCommercialWalkthrough = document.getElementById('btn-commercial-walkthrough');
  if (btnCommercialWalkthrough) {
    btnCommercialWalkthrough.addEventListener('click', () => {
      // Switch service to commercial in calculator
      const commBtn = document.querySelector('.service-type-btn[data-service="commercial"]');
      if (commBtn) commBtn.click();

      // Open booking modal with prefill
      openBookingModal();
    });
  }

  /* ==========================================================================
     3. FAQ ACCORDION LOGIC
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items for clean accordion effect
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ==========================================================================
     4. NAVBAR SCROLL EFFECT & MOBILE MENU
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNavDrawer.classList.contains('open');
      if (isOpen) {
        mobileNavDrawer.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      } else {
        mobileNavDrawer.classList.add('open');
        mobileMenuBtn.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    mobileNavDrawer.addEventListener('click', (e) => {
      if (e.target === mobileNavDrawer) {
        mobileNavDrawer.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ==========================================================================
     5. SPARKLE CELEBRATION EFFECT (Confetti / Sparkles)
     ========================================================================== */
  function triggerSparkleBurst() {
    const colors = ['#0EA5E9', '#10B981', '#38BDF8', '#F59E0B', '#34D399'];
    for (let i = 0; i < 40; i++) {
      const sparkle = document.createElement('div');
      sparkle.style.position = 'fixed';
      sparkle.style.zIndex = '9999';
      sparkle.style.width = `${Math.random() * 8 + 6}px`;
      sparkle.style.height = `${Math.random() * 8 + 6}px`;
      sparkle.style.borderRadius = '50%';
      sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.pointerEvents = 'none';

      const startX = window.innerWidth / 2;
      const startY = window.innerHeight / 2 - 50;

      sparkle.style.left = `${startX}px`;
      sparkle.style.top = `${startY}px`;
      document.body.appendChild(sparkle);

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 200 + 80;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance + 50;

      sparkle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
      ], {
        duration: Math.random() * 600 + 600,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }).onfinish = () => sparkle.remove();
    }
  }

  // Initial Calculation Run
  updateCalculator();
});
