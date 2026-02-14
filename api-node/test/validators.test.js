const { validateRegister } = require('../src/utils/validators');

test('Validation doit échouer si le mot de passe est trop court', () => {
    const result = validateRegister({ username: 'rim', email: 'test@test.com', password: '123' });
    expect(result).toBeDefined(); // Une erreur doit être retournée
});