camera.cleanup
=================

Cleans up the image files that were taken by the camera, that were stored in a temporary storage location.

    navigator.camera.cleanup( cameraSuccess, cameraError );

Description
-----------

Cleans up the image files stored in the temporary storage location, when the function `camera.getPicture` is used with  `Camera.sourceType = Camera.PictureSourceType.CAMERA` and `Camera.destinationType = Camera.DestinationType.FILE_URI`


Supported Platforms
-------------------

- iOS


Example
-------------

    navigator.camera.cleanup(onSuccess, onFail); 

    function onSuccess() {
        console.log("Camera cleanup success.")
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }
