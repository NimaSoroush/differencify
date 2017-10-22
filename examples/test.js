var Differencify = require('differencify');
const differencify = new Differencify({ debug: true });

(async () => {
  let result = await differencify
    .init(TestOptions)
    .resize({ width: 1600, height: 1200 })
    .goto('https://github.com/NimaSoroush/differencify')
    .wait(3000)
    .capture()
    .close()
    .end();
  
  // or unchained

  const page = await differencify.init({ chain: false });
  await page.resize({ width: 1600, height: 1200 });
  await page.goto('https://github.com/NimaSoroush/differencify');
  await page.wait(3000);
  await page.capture();
  result = await page.close();

  console.log(result); // Prints true or false
})();
