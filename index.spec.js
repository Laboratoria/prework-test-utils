const esprima = require('esprima');

const { esprima: esprimaUtils } = require('./index.js');

const ast = esprima.parse(`
console.log(6 + 8)
`);

const consoleLogArgs = esprimaUtils.getAllConsoleLogLastArgs(ast);

describe('esprima utils', () => {
  it('getAll', () => {
    let result = esprimaUtils.getAll(ast);
    expect(result).toMatchSnapshot();

    result = esprimaUtils.getAll(ast, 'BinaryExpression');
    expect(result).toMatchSnapshot();

    result = esprimaUtils.getAll(ast, (node) => node.type === 'BinaryExpression');
    expect(result).toMatchSnapshot();
  });
  it('getAllConsoleLogLastArgs', () => {
    expect(consoleLogArgs).toMatchSnapshot();
  });
  it('getNestedExpressions,', () => {
    let result = esprimaUtils.getNestedExpressions(consoleLogArgs, 'VariableDeclaration');
    expect(result).toMatchSnapshot();

    result = esprimaUtils.getNestedExpressions(consoleLogArgs, 'ConditionalExpression');
    expect(result).toMatchSnapshot();
  });
  it('getNestedBinaryExpressions,', () => {
    const result = esprimaUtils.getNestedBinaryExpressions(consoleLogArgs, 'VariableDeclaration');
    expect(result).toMatchSnapshot();
  });
  it('getNestedUnaryExpressions,', () => {
    const result = esprimaUtils.getNestedUnaryExpressions(consoleLogArgs, 'VariableDeclaration');
    expect(result).toMatchSnapshot();
  });
});
