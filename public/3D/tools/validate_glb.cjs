// Validates the exported GLB with the official Khronos glTF Validator.
const fs = require('fs');
const path = require('path');
const validator = require('gltf-validator');

const file = path.join(__dirname, '..', 'doraemon.glb');
const bytes = new Uint8Array(fs.readFileSync(file));

validator
  .validateBytes(bytes, { uri: 'doraemon.glb', maxIssues: 200 })
  .then((report) => {
    const { issues, info } = report;
    console.log('validator', info.validatorVersion);
    console.log('file size  ', (bytes.length / 1024).toFixed(1), 'KiB');
    console.log('draw calls ', info.drawCallCount, '| tris', info.totalTriangleCount,
      '| verts', info.totalVertexCount, '| materials', info.materialCount);
    console.log('errors     ', issues.numErrors, '| warnings', issues.numWarnings,
      '| infos', issues.numInfos, '| hints', issues.numHints);
    for (const msg of issues.messages) {
      console.log(`[${msg.severity}] ${msg.code} ${msg.pointer || ''} ${msg.message}`);
    }
    process.exitCode = issues.numErrors ? 1 : 0;
  })
  .catch((err) => {
    console.error('validation failed to run:', err);
    process.exitCode = 2;
  });
