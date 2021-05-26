const utils = require('esprima-ast-utils');
const connect = require('connect');
const serveStatic = require('serve-static');

const handlers = {
  ConsoleLogExpressionStatement: (root) => (
    utils.filter(root, (node) => (
      node.type === 'ExpressionStatement'
      && node.expression
      && node.expression.type === 'CallExpression'
      && node.expression.callee
      && node.expression.callee.object
      && node.expression.callee.object.name === 'console'
      && node.expression.callee.property
      && node.expression.callee.property.name === 'log'
    ))
  ),
};

const defaultHandler = (root, nodeType) => (
  utils.filter(root, (node) => node.type === nodeType)
);

function getAll(root, nodeType) {
  if (!nodeType) {
    const result = [];
    utils.traverse(root, (node) => {
      result.push(node);
    });
    return result;
  }
  if (typeof nodeType === 'function') {
    return utils.filter(root, nodeType);
  }
  let handler = handlers[nodeType];
  if (!handler) {
    handler = defaultHandler;
  }
  return handler(root, nodeType) || [];
}

function getAllConsoleLogLastArgs(root) {
  return getAll(root, 'ConsoleLogExpressionStatement').map(
    (cl) => {
      const { arguments: args } = cl.expression;
      return args[args.length - 1];
    },
  );
}

function getNestedExpressions(nodeArr, nodeType) {
  return (
    nodeArr
      .filter((node) => (
        [
          'UnaryExpression',
          'BinaryExpression',
          'LogicalExpression',
          'ConditionalExpression',
          'Identifier',
        ].includes(node.type)
      ))
      .reduce((exprs, node) => (
        [...exprs, ...(getAll(node, nodeType))]
      ), [])
  );
}

function getNestedBinaryExpressions(nodeArr) {
  return [
    ...getNestedExpressions(nodeArr, 'BinaryExpression'),
    ...getNestedExpressions(nodeArr, 'LogicalExpression'),
  ];
}

function getNestedUnaryExpressions(nodeArr) {
  return getNestedExpressions(nodeArr, 'UnaryExpression');
}

function initStaticServer(folderPath, opts = {}, cb) {
  let { port } = opts;
  port = port || 5000;

  return connect()
    .use(serveStatic(folderPath))
    .listen(port, cb);
}

function stopStaticServer(server, cb) {
  server.close(cb);
  setImmediate(() => {
    server.emit('close');
  });
}

module.exports = {
  esprima: {
    getAll,
    getAllConsoleLogLastArgs,
    getNestedExpressions,
    getNestedBinaryExpressions,
    getNestedUnaryExpressions,
  },
  e2e: {
    initStaticServer,
    stopStaticServer,
  },
};
