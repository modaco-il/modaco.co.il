const fs = require("fs");
const path = require("path");
const https = require("https");

const files = [
  { id: "1z_-W-B6FfNCR418Dbeu9vPBhb6yu9bN1", name: "5F7A9286.jpg" },
  { id: "10mu7fl5p_mInymHY1WeOBD8LOuFxlPOR", name: "5F7A9291.jpg" },
  { id: "1Qvm6zBxJHWTCpd--yQIuwnXxFtLdj9KD", name: "5F7A9300.jpg" },
  { id: "14zUmUnF9gum8-7rxpI0syRlFrkEyj7tY", name: "5F7A9307.jpg" },
  { id: "1XFxeDF222LPr0z3gBK8grROiQctskrou", name: "5F7A9311.jpg" },
  { id: "1LKzaftScBxFkN2tt8N4YKYUAb73niMEn", name: "5F7A9331.jpg" },
  { id: "1XMU40bTehnoauFGAhbLmLDLHeSbaLGX3", name: "5F7A9368.jpg" },
  { id: "199UjtmHGC1zDatd2oAWY0q7M0MlpDWky", name: "5F7A9369.jpg" },
  { id: "1V_kYX9a9k1mrszyvUHdRPc28WDrru7RZ", name: "5F7A9369b.jpg" },
  { id: "1JeBIsuEsBuY-VIjN-nw5V9PRbEX1YhAb", name: "5F7A9376.jpg" },
  { id: "1uLAGcn5jcQ19PiNNaJ-oO57VxCuLxA1j", name: "5F7A9395.jpg" },
  { id: "18g4KjnlgeNlTJTxfhdqZkObWKYiPkQM4", name: "5F7A9411.jpg" },
  { id: "14p4YG1Z_iHKw-gkAAPaD0h7EEdRSXbr0", name: "5F7A9417.jpg" },
  { id: "1QV3dNeL-UCi4z8BBU0OyLgMIQxbbVOuz", name: "5F7A9450.jpg" },
  { id: "11O2b_yVgVchhmAItuHH17paU224A8rpe", name: "5F7A9454.jpg" },
  { id: "110_U6oDCmsQg58kiZig6An40JLZlE48R", name: "5F7A9537.jpg" },
  { id: "1AWndx6W1TGQ-WljQxIe_zW3lM3bwRRzA", name: "5F7A9537b.jpg" },
  { id: "14PouATj92sNlaLZWgGt_4KWBJnOq-7-u", name: "5F7A9550.jpg" },
  { id: "1x8AL5kuDQqvJcs30IakT2ry8c-ICeevJ", name: "5F7A9683.jpg" },
  { id: "1gudUZg8ivjNHnq9VsRKRrI9Zr2AEgtIN", name: "5F7A9697.jpg" },
  { id: "1Q-sQ5rTfcy_GpJMvbdHcnETFbnNmUhLT", name: "5F7A9761.jpg" },
  { id: "1U6K8aUju3uRdi8ojvWVSq8AulgFOn2EB", name: "5F7A9761b.jpg" },
  { id: "1D0Q51xfZmxKdLtXxN7l3R_LuprC61D3l", name: "5F7A9763.jpg" },
  { id: "1vSHHGykdCd6Bpm4XZKPm7pL6uHnIghPy", name: "5F7A9768.jpg" },
  { id: "18tKrIa4onjYkvIV8ae6WR_uE-XNdu3_u", name: "5F7A9813.jpg" },
  { id: "1rzMdwonyKnUofXYm1bwHCpBagK4Qjc3D", name: "5F7A9828.jpg" },
  { id: "1-IJB0Vc4JGkx8xFOsoIwFkjmDYIGQP1T", name: "5F7A9959.jpg" },
  { id: "1p5h7JHnVDb0_WN_41-0Z18nCdhpQdxkg", name: "5F7A9994.jpg" },
  { id: "1iATgRoNBa1AhOaW-pS87D2Ab4G2vgsdE", name: "8B23588B.png" },
  { id: "1Hbhn9KXAn8R4h-dPkD56FoZYBM92gA7s", name: "Facetune.jpg" },
  { id: "1cfIbYBPsR6-bweV8sy0alEQFSUfhi4Uf", name: "IMG_6144.jpg" },
];

const outDir = path.join(__dirname, "..", "public", "images", "modaco");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function download(url, dest, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          if (maxRedirects <= 0) return reject(new Error("Too many redirects"));
          return download(res.headers.location, dest, maxRedirects - 1).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      })
      .on("error", reject);
  });
}

async function main() {
  let ok = 0, fail = 0;
  for (const f of files) {
    const dest = path.join(outDir, f.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      ok++;
      continue;
    }
    const url = `https://drive.google.com/uc?export=download&id=${f.id}`;
    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      // Check for virus-scan HTML page instead of real image
      if (size < 10000) {
        const content = fs.readFileSync(dest, "utf8");
        if (content.includes("Google Drive") || content.includes("<html")) {
          fs.unlinkSync(dest);
          throw new Error("Got HTML virus-scan page instead of file");
        }
      }
      console.log(`  ${f.name}: ${(size / 1024 / 1024).toFixed(2)}MB`);
      ok++;
    } catch (e) {
      console.warn(`  ${f.name}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone. ok:${ok} fail:${fail}`);
}
main();
