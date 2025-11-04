// utils/stripeTestUtils.js
export const stripeTestCards = {
  visa: {
    number: '4242424242424242',
    exp: '12/34',
    cvc: '123',
    name: 'Test User',
  },
  visa_debit: {
    number: '4000056655665556',
    exp: '12/34',
    cvc: '123',
    name: 'Test User',
  },
  mastercard: {
    number: '5555555555554444',
    exp: '12/34',
    cvc: '123',
    name: 'Test User',
  },
  amex: {
    number: '378282246310005',
    exp: '12/34',
    cvc: '1234',
    name: 'Test User',
  },
  discover: {
    number: '6011111111111117',
    exp: '12/34',
    cvc: '123',
    name: 'Test User',
  },
  // Special test cards for different scenarios
  requires_action: {
    number: '4000002500003155',
    exp: '12/34',
    cvc: '123',
    name: 'Test User',
  },
  declined: {
    number: '4000000000000002',
    exp: '12/34',
    cvc: '123',
    name: 'Test User',
  },
  insufficient_funds: {
    number: '4000000000009995',
    exp: '12/34',
    cvc: '123',
    name: 'Test User',
  },
}

export const getTestCard = (type = 'visa') => {
  return stripeTestCards[type] || stripeTestCards.visa
}

export const isTestCard = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  return Object.values(stripeTestCards).some((card) => card.number === cleanNumber)
}
