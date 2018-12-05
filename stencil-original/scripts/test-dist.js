var path = require('path');
var fs = require('fs');


// used to double-triple check all the packages
// are good to go before publishing

function testPackage(testPkg) {
  var pkgDir = path.dirname(testPkg.packageJson);
  var pkgJson = require(testPkg.packageJson);

  if (!pkgJson.name) {
    throw new Error('missing package.json name: ' + testPkg.packageJson);
  }

  if (!pkgJson.main) {
    throw new Error('missing package.json main: ' + testPkg.packageJson);
  }

  var pkgPath = path.join(pkgDir, pkgJson.main);
  var pkgImport = require(pkgPath);

  if (testPkg.files) {
    if (!Array.isArray(pkgJson.files)) {
      throw new Error(testPkg.packageJson + ' missing "files" property');
    }
    testPkg.files.forEach(testPkgFile => {
      if (!pkgJson.files.includes(testPkgFile)) {
        throw new Error(testPkg.packageJson + ' missing file ' + testPkgFile);
      }

      var filePath = path.join(__dirname, pkgDir, testPkgFile);
      fs.accessSync(filePath);
    });
  }

  if (pkgJson.types) {
    var pkgTypes = path.join(__dirname, pkgDir, pkgJson.types);
    fs.accessSync(pkgTypes)
  }

  testPkg.exports.forEach(exportName => {
    var m = pkgImport[exportName];
    if (!m) {
      throw new Error('export "' + exportName + '" not found in: ' + testPkg.packageJson);
    }
  });
}


[
  {
    packageJson: '../compiler/package.json',
    exports: [
      'Compiler'
    ]
  },
  {
    packageJson: '../mock-doc/package.json',
    exports: [
      'applyWindowToGlobal',
      'MockComment',
      'mockDocument',
      'MockDocument',
      'MockElement',
      'MockElement',
      'MockNode',
      'MockTextNode',
      'mockWindow',
      'MockWindow',
      'parseHtmlToDocument',
      'parseHtmlToFragment',
      'serializeNodeToHtml'
    ]
  },
  {
    packageJson: '../screenshot/package.json',
    files: [
      'compare/',
      'index.js',
      'connector.js'
    ],
    exports: [
      'ScreenshotConnector',
      'ScreenshotLocalConnector'
    ]
  },
  {
    packageJson: '../server/package.json',
    exports: [
      'h',
      'ssrMiddleware',
      'ssrPathRegex',
      'loadConfig',
      'Renderer'
    ]
  },
  {
    packageJson: '../testing/package.json',
    exports: [
      'createJestPuppeteerEnvironment',
      'h',
      'jestPreprocessor',
      'jestSetupTestFramework',
      'newE2EPage',
      'Testing',
      'transpile'
    ]
  },
  {
    packageJson: '../sys/node/package.json',
    exports: [
      'NodeLogger',
      'NodeSystem'
    ]
  },
  {
    packageJson: '../package.json',
    files: [
      "bin/",
      "dist/",
      "compiler/",
      "mock-doc/",
      "screenshot/",
      "server/",
      "sys/",
      "testing/"
    ],
    exports: []
  }
].forEach(testPackage);



console.log(`✅ test.dist`);