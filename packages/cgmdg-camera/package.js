Package.describe({
  name: "cgmdg:camera",
  summary: "Photos with one function call on mobile.",
  version: "2.4.1"
});

Cordova.depends({
  "cordova-plugin-camera": "2.4.1"
});

Package.onUse(function(api) {
  api.export('CGMeteorCamera');
  api.versionsFrom("METEOR@1.5");

  api.addFiles('photo.js');
  api.addFiles('photo-client.js', ['web.cordova']);  
  api.addFiles('photo-cordova.js', ['web.cordova']);
});
