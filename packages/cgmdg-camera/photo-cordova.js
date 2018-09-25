CGMeteorCamera.getPicture = function (options, callback) {
  // if options are not passed
  if (! callback) {
    callback = options;
    options = {};
  }

  var success = function (imageURI) {
    callback(null, imageURI);
  };

  var failure = function (error) {
    console.log(error);
    callback(new Meteor.Error("cordovaError", error));
  };

  navigator.camera.getPicture(success, failure, 
    _.extend(options, {
      quality: options.quality || 49,
      targetWidth: options.width || 640,
      targetHeight: options.height || 480,
      encodingType: Camera.EncodingType.PNG,
      destinationType: Camera.DestinationType.DATA_URL,
    })
  );
};

