const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "public", "images", "israelevitz");
const files = ["1.jpg", "2.jpg", "3.jpg", "4.jpg"];

async function resize() {
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const outName = file.replace(".jpg", "-web.jpg");
    const outPath = path.join(srcDir, outName);
    const thumbPath = path.join(srcDir, file.replace(".jpg", "-thumb.jpg"));

    await sharp(srcPath)
      .resize(2000, null, { withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outPath);

    await sharp(srcPath)
      .resize(800, null, { withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(thumbPath);

    const stat = fs.statSync(outPath);
    const thumbStat = fs.statSync(thumbPath);
    console.log(`${file}: web ${(stat.size / 1024).toFixed(0)}KB, thumb ${(thumbStat.size / 1024).toFixed(0)}KB`);
  }
}

resize().catch((e) => {
  console.error(e);
  process.exit(1);
});
