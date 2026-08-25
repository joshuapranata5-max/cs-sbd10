const { validationResult } = require('express-validator');
const { userRegistrationValidation } = require('../../../src/utils/validators');

describe('Validators', () => {
  it('should have validation chains defined', () => {
    expect(userRegistrationValidation).toBeDefined();
    expect(Array.isArray(userRegistrationValidation)).toBe(true);
  });
});
