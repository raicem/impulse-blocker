const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'web-ext-artifacts');
const manifestPath = path.join(projectRoot, 'extension', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const outputName = `impulse-blocker-${manifest.version}-source.zip`;
const outputPath = path.join(outputDir, outputName);
const archivePrefix = `impulse-blocker-${manifest.version}-source/`;

const excludedDirectories = new Set([
  '.git',
  '.idea',
  'extension/dist',
  'node_modules',
  'web-ext-artifacts',
]);

const excludedFiles = new Set([
  '.DS_Store',
  'npm-debug.log',
]);

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }

  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function dosTimestamp(date) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

  return { dosDate, dosTime };
}

function shouldExclude(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');

  if (excludedFiles.has(path.basename(normalized))) {
    return true;
  }

  return Array.from(excludedDirectories).some((directory) => (
    normalized === directory || normalized.startsWith(`${directory}/`)
  ));
}

function listFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(projectRoot, absolutePath);

    if (shouldExclude(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      listFiles(absolutePath, files);
    } else if (entry.isFile()) {
      files.push(relativePath.split(path.sep).join('/'));
    }
  }

  return files;
}

function createLocalFileHeader(fileName, data, stats) {
  const encodedName = Buffer.from(fileName);
  const { dosDate, dosTime } = dosTimestamp(stats.mtime);
  const header = Buffer.alloc(30);

  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(dosTime, 10);
  header.writeUInt16LE(dosDate, 12);
  header.writeUInt32LE(crc32(data), 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(encodedName.length, 26);
  header.writeUInt16LE(0, 28);

  return Buffer.concat([header, encodedName]);
}

function createCentralDirectoryHeader(fileName, data, stats, offset) {
  const encodedName = Buffer.from(fileName);
  const { dosDate, dosTime } = dosTimestamp(stats.mtime);
  const header = Buffer.alloc(46);

  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(dosTime, 12);
  header.writeUInt16LE(dosDate, 14);
  header.writeUInt32LE(crc32(data), 16);
  header.writeUInt32LE(data.length, 20);
  header.writeUInt32LE(data.length, 24);
  header.writeUInt16LE(encodedName.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);

  return Buffer.concat([header, encodedName]);
}

function createEndOfCentralDirectory(fileCount, centralDirectorySize, centralDirectoryOffset) {
  const header = Buffer.alloc(22);

  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(fileCount, 8);
  header.writeUInt16LE(fileCount, 10);
  header.writeUInt32LE(centralDirectorySize, 12);
  header.writeUInt32LE(centralDirectoryOffset, 16);
  header.writeUInt16LE(0, 20);

  return header;
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const relativePath of files) {
    const archivePath = `${archivePrefix}${relativePath}`;
    const absolutePath = path.join(projectRoot, relativePath);
    const data = fs.readFileSync(absolutePath);
    const stats = fs.statSync(absolutePath);
    const localHeader = createLocalFileHeader(archivePath, data, stats);

    localParts.push(localHeader, data);
    centralParts.push(createCentralDirectoryHeader(archivePath, data, stats, offset));
    offset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  return Buffer.concat([
    ...localParts,
    centralDirectory,
    createEndOfCentralDirectory(files.length, centralDirectory.length, offset),
  ]);
}

fs.mkdirSync(outputDir, { recursive: true });

const files = listFiles(projectRoot).sort();
fs.writeFileSync(outputPath, createZip(files));

console.log(`Created ${path.relative(projectRoot, outputPath)} with ${files.length} source files.`);
