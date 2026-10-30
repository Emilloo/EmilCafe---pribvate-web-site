import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePhone,
  validateEmail,
  isDateValid,
  generateReservationReference,
  formatCurrency,
  filterMenuItems,
  MenuItem,
} from './cafeLogic.ts';

test('phone validation: accepts valid Azerbaijani phone numbers', () => {
  assert.equal(validatePhone('+994501234567'), true);
  assert.equal(validatePhone('050 123 45 67'), true);
  assert.equal(validatePhone('0707101252'), true);
  assert.equal(validatePhone('070 710 12 52'), true);
  assert.equal(validatePhone('+994 55 987-65-43'), true);
  assert.equal(validatePhone('0701112233'), true);
  assert.equal(validatePhone('0771234567'), true);
});

test('phone validation: rejects invalid phone numbers', () => {
  assert.equal(validatePhone('12345'), false);
  assert.equal(validatePhone('abcdefg'), false);
  assert.equal(validatePhone('+12025550192'), false);
  assert.equal(validatePhone(''), false);
});

test('email validation: correctly validates emails', () => {
  assert.equal(validateEmail('test@emilcafe.az'), true);
  assert.equal(validateEmail('guest.baku@domain.com'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail('missing@tld'), false);
  assert.equal(validateEmail(''), false);
});

test('date validation: accepts today and future dates, rejects past dates', () => {
  const futureYear = new Date().getFullYear() + 1;
  assert.equal(isDateValid(`${futureYear}-01-01`), true);
  assert.equal(isDateValid('2020-01-01'), false);
  assert.equal(isDateValid(''), false);
});

test('reservation reference: starts with EC- and has 5 digits', () => {
  const ref = generateReservationReference();
  assert.match(ref, /^EC-\d{5}$/);
});

test('currency formatting: formats with AZN symbol and 2 decimals', () => {
  assert.equal(formatCurrency(6), '6.00 ₼');
  assert.equal(formatCurrency(7.5), '7.50 ₼');
});

test('menu filtering: filters by category and search keyword', () => {
  const sampleItems: MenuItem[] = [
    {
      id: '1',
      name: 'Espresso',
      category: 'coffee_hot',
      categoryLabel: 'İsti qəhvələr',
      price: 4.0,
      description: 'Klassik tək doza zəngin kremalı espresso.',
      image: '',
    },
    {
      id: '2',
      name: 'Iced Latte',
      category: 'drinks_cold',
      categoryLabel: 'Soyuq içkilər',
      price: 8.0,
      description: 'Soyuq südlü və buzlu xüsusi espresso.',
      image: '',
    },
    {
      id: '3',
      name: 'San Sebastian Cheesecake',
      category: 'desserts',
      categoryLabel: 'Desertlər',
      price: 10.0,
      description: 'Karamelizə edilmiş xüsusi ispan çizkeyki.',
      image: '',
    },
  ];

  // All category
  assert.equal(filterMenuItems(sampleItems, 'all', '').length, 3);

  // Category filter
  const coldDrinks = filterMenuItems(sampleItems, 'drinks_cold', '');
  assert.equal(coldDrinks.length, 1);
  assert.equal(coldDrinks[0].name, 'Iced Latte');

  // Search filter
  const searchResults = filterMenuItems(sampleItems, 'all', 'cheesecake');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].name, 'San Sebastian Cheesecake');

  // Search case insensitivity & Azerbaijani description
  const searchDesc = filterMenuItems(sampleItems, 'all', 'zəngin');
  assert.equal(searchDesc.length, 1);
  assert.equal(searchDesc[0].name, 'Espresso');
});

