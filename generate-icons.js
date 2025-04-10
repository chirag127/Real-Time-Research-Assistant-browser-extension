const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

const inputSvg = path.join(__dirname, 'extension', 'icons', 'icon.svg');
const outputDir = path.join(__dirname, 'extension', 'icons');

const sizes = [16, 48, 128];

async function generateIcons() {
  try {
    await fs.ensureFile(inputSvg);
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `icon${size}.png`);
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      console.log(`Generated ${outputFile}`);
    }
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();