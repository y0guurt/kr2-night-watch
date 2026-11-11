/* KR №2. Small enhancement script: demo form validation and example price estimate.
   No backend, no payments, no actual reservation is created. */
(() => {
  'use strict';
  const tariffs = {
    '1h': { label: '1 час', price: 220 },
    '3h': { label: '3 часа', price: 590 },
    '5h': { label: '5 часов', price: 890 },
    'night': { label: 'Ночь · 22:00–06:00', price: 1290 }
  };
  const zones = {
    standard: { label: 'Standard Zone', coefficient: 1 },
    vip: { label: 'VIP Lounge', coefficient: 1.5 },
    team: { label: 'Full Room · 5 ПК', coefficient: 5, unit: 'room' }
  };
  const byId = (id) => document.getElementById(id);
  const formatMoney = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  const today = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  const toastElement = byId('demoToast');
  const toast = toastElement ? bootstrap.Toast.getOrCreateInstance(toastElement, { delay: 6500 }) : null;
  function notify(message) {
    const body = byId('demoToastBody');
    if (body) body.textContent = message;
    toast?.show();
  }

  const booking = byId('bookingForm');
  if (booking) {
    const field = (id) => byId('booking-' + id);
    const zone = field('zone');
    const tariff = field('tariff');
    const date = field('date');
    const time = field('time');
    const summaryZone = byId('summary-zone');
    const summaryTariff = byId('summary-tariff');
    const summaryDate = byId('summary-date');
    const summaryPrice = byId('summary-price');
    const summaryPriceLabel = byId('summary-price-label');
    date.min = today();
    const params = new URLSearchParams(location.search);
    if (zones[params.get('zone')]) zone.value = params.get('zone');
    if (tariffs[params.get('tariff')]) tariff.value = params.get('tariff');

    function updateSummary() {
      const chosenZone = zones[zone.value];
      const chosenTariff = tariffs[tariff.value];
      summaryZone.textContent = chosenZone ? chosenZone.label : 'Не выбрана';
      summaryTariff.textContent = chosenTariff ? chosenTariff.label : 'Не выбран';
      if (summaryPriceLabel) summaryPriceLabel.textContent = chosenZone?.unit === 'room' ? 'Стоимость за комнату' : 'Стоимость за место';
      summaryPrice.textContent = chosenZone && chosenTariff
        ? formatMoney(Math.round(chosenTariff.price * chosenZone.coefficient)) : '—';
      if (tariff.value === 'night') {
        time.value = '22:00';
        time.readOnly = true;
      } else {
        time.readOnly = false;
      }
      summaryDate.textContent = date.value ?
        new Date(date.value + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) + (time.value ? ' · ' + time.value : '')
        : '—';
    }
    [zone, tariff, date, time].forEach((el) => el.addEventListener('change', updateSummary));
    time.addEventListener('input', updateSummary);
    updateSummary();
    booking.addEventListener('submit', (event) => {
      // Validate chosen date again at submit time in case the tab was left open overnight.
      date.min = today();
      event.preventDefault();
      event.stopPropagation();
      booking.classList.add('was-validated');
      if (!booking.checkValidity()) {
        booking.querySelector(':invalid')?.focus();
        return;
      }
      notify('Демо: заявка прошла проверку. Реальная бронь не создавалась и данные никуда не отправлялись.');
      booking.reset();
      booking.classList.remove('was-validated');
      updateSummary();
    });
  }

  // Quick booking modal may be launched from any gaming-zone card.
  const quickModal = byId('quickBookingModal');
  quickModal?.addEventListener('show.bs.modal', (event) => {
    const value = event.relatedTarget?.getAttribute('data-zone');
    const target = byId('quick-zone');
    if (target) target.value = zones[value] ? value : '';
  });

  // Bootstrap styling for built-in HTML constraint checks; demo-only submission.
  document.querySelectorAll('.demo-form').forEach((form) => {
    if (form === booking) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add('was-validated');
      if (!form.checkValidity()) {
        form.querySelector(':invalid')?.focus();
        return;
      }
      if (form.closest('.modal')) {
        bootstrap.Modal.getInstance(quickModal)?.hide();
      }
      notify('Демо: форма заполнена корректно. Данные никуда не отправлены.');
      form.reset();
      form.classList.remove('was-validated');
    });
  });
})();
