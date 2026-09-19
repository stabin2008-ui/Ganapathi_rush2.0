const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPerformanceTest() {
  console.log('===============================================================');
  console.log('TEST_PERFORMANCE.JS — OBJECT POOLING & ZERO MEMORY LEAK TEST');
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--use-angle=swiftshader-webgl',
      '--enable-webgl',
      '--window-size=1280,720'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('Failed to load resource')) {
        consoleErrors.push(txt);
      }
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1000);
  await page.click('#btnStartGame');
  // Wait 1.5 seconds so game loop warms up and pools settle
  await sleep(1500);

  console.log('1. Starting continuous real-time gameplay test (15 seconds, ~900 frames)...');

  const getStats = async () => {
    return await page.evaluate(() => {
      const g = window.gameInstance;
      const r = g.three.renderer;
      return {
        geos: r.info.memory.geometries,
        texs: r.info.memory.textures,
        calls: r.info.render.calls,
        distance: Math.floor(g.distance),
        score: Math.floor(g.score),
        obstacles: g.obstacles.obstacles.length,
        collectibles: g.collectibles.items.length
      };
    });
  };

  const samples = [];
  const baseline = await getStats();
  samples.push({ time: '0s (Baseline)', ...baseline });

  // Play actively for 12 seconds
  for (let sec = 1; sec <= 12; sec++) {
    await sleep(1000);

    // Perform periodic gameplay actions
    if (sec % 3 === 0) {
      await page.keyboard.press('ArrowRight');
    } else if (sec % 3 === 1) {
      await page.keyboard.press('ArrowUp'); // Jump
    } else if (sec % 3 === 2) {
      await page.keyboard.press('ArrowLeft');
    }

    if (sec === 3 || sec === 6 || sec === 9 || sec === 12) {
      const s = await getStats();
      samples.push({ time: `${sec}s`, ...s });
    }
  }

  console.log('\n--- PERFORMANCE TELEMETRY SAMPLES ---');
  console.table(samples);

  const finalSample = samples[samples.length - 1];
  const geoDelta = finalSample.geos - baseline.geos;
  const texDelta = finalSample.texs - baseline.texs;

  console.log(`\nMemory Analysis:`);
  console.log(`- Geometries: baseline=${baseline.geos}, final=${finalSample.geos}, delta=${geoDelta}`);
  console.log(`- Textures: baseline=${baseline.texs}, final=${finalSample.texs}, delta=${texDelta}`);
  console.log(`- Distance traveled: ${finalSample.distance}m`);
  console.log(`- Active Obstacles on road: ${finalSample.obstacles}`);
  console.log(`- Active Collectibles on road: ${finalSample.collectibles}`);

  let allPassed = true;
  const assert = (condition, testName) => {
    if (condition) {
      console.log(`   [PASS] ${testName}`);
    } else {
      console.error(`   [FAIL] ${testName}`);
      allPassed = false;
    }
  };

  assert(geoDelta === 0, `Zero geometry allocation during gameplay (delta = ${geoDelta})`);
  assert(texDelta === 0, `Zero texture allocation during gameplay (delta = ${texDelta})`);
  assert(finalSample.distance > 10, `Player traveled active distance during run (distance = ${finalSample.distance}m)`);
  assert(consoleErrors.length === 0, `Zero console errors throughout gameplay (errors = ${consoleErrors.length})`);

  await browser.close();

  if (allPassed) {
    console.log('\n===============================================================');
    console.log('ALL PERFORMANCE & POOLING TESTS PASSED! (ZERO MEMORY LEAKS)');
    console.log('===============================================================\n');
    process.exit(0);
  } else {
    console.error('\nPERFORMANCE TEST FAILED.');
    process.exit(1);
  }
}

runPerformanceTest().catch(err => {
  console.error('Performance test error:', err);
  process.exit(1);
});
