const fs = require('fs');
const path = require('path');

const out = `
module.exports = {
  credentials: {
    SilubridgeApi: require('./credentials/SilubridgeApi.credentials').SilubridgeApi,
  },
  nodes: {
    Silubridge: require('./nodes/Silubridge/Silubridge.node').Silubridge,
    SilubridgeChatModel: require('./nodes/Silubridge/SilubridgeChatModel.node').SilubridgeChatModel,
  },
};
`;

fs.writeFileSync(path.join(__dirname, 'dist', 'index.js'), out.trimStart(), 'utf8');

const srcSvg = path.join(__dirname, 'src', 'nodes', 'Silubridge', 'silubridge.svg');
const outDir = path.join(__dirname, 'dist', 'nodes', 'Silubridge');
const outSvg = path.join(outDir, 'silubridge.svg');

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(srcSvg, outSvg);
