document.querySelector('.picker').addEventListener('change', function () {
    var file = this.files[0];
    var u = URL.createObjectURL(file);
    var img = document.querySelector('.source');
    img.onload = function initCropper() {
        console.log('loaded: ', file, img.width, img.height);

        function adoptContainer(imgWidth, imgHeight) {
            var container = document.querySelector('.container');
            container.style.width = container.width + 'px';
            container.style.height = container.height + 'px';

//			var cropContainer = document.querySelector('.cropper-container');
//			if (cropContainer) {
//				cropContainer.style.width = container.style.width;
//				cropContainer.style.height = container.style.height;
//			}
        }
        adoptContainer(img.width, img.height);
//		throw new Error('stop');

        var image = document.querySelector('.source');
        var options = {
            aspectRatio: 4 / 3,
            autoCropArea: 1,
            zoomable: false,
            dragMode: 'none',
            viewMode: 1,
            background: false,
            restore: false,
            minContainerWidth: 1,
            minContainerHeight: 1,
            ready: function (e) {
                console.log('ready: ', e.type);
            }
        };
        var cropper = new Cropper(image, options);
        console.log('cropper: ', cropper);

        document.querySelector('.rotate').addEventListener('click', function() {
            cropper.rotate(90);
//			var canvas = cropper.getCanvasData();
//			adoptContainer(canvas.width, canvas.height);
            fitCanvasToContainer();
            fitCropBoxToCanvas();
        });

        var horiz = 1;
        document.querySelector('.horiz').addEventListener('click', function() {
            horiz = horiz * -1;
            cropper.scale(horiz, vertic);
        });
        var vertic = 1;
        document.querySelector('.vertic').addEventListener('click', function() {
            vertic = vertic * -1;
            cropper.scale(horiz, vertic);
        });
        document.querySelector('.fit').addEventListener('click', function() {
            fitCanvasToContainer();
            fitCropBoxToCanvas();
        });
        document.querySelector('.crop').addEventListener('click', function() {
            console.log('canvas start');
            var startCanvas = new Date;
            var canvas = cropper.getCroppedCanvas();
            console.log('canvas end: ', new Date - startCanvas, 'ms. ', canvas.width, 'x', canvas.height);
            var startUrl = new Date;
            var dataUrl = canvas.toDataURL('image/jpeg', 1.0);
            console.log('dataUrl end: ', new Date - startUrl, 'ms. ', dataUrl.length, 'bytes. ');

            var img = document.querySelector('.cropped');
            img.onload = function() {
                console.log('loaded cropped: ', img.width, img.height);
            };
            img.src = dataUrl;
        });

        window.addEventListener('resize', function() {
            console.log('resize');
            fitCanvasToContainer();
            fitCropBoxToCanvas();
        });

        function fitCanvasToContainer() {
            var containerData = cropper.getContainerData();
            console.log('containerData: ', containerData);
            var canvasData = cropper.getCanvasData();
            console.log('canvasData: ', canvasData);

            var scaleWidth = canvasData.naturalWidth / containerData.width;
            var scaleHeight = canvasData.naturalHeight / containerData.height;
            var scale = Math.max(scaleWidth, scaleHeight);
            var newWidth = canvasData.naturalWidth / scale;
            var newHeight = canvasData.naturalHeight / scale;
            var newLeft = (containerData.width - newWidth) / 2;
            var newTop = (containerData.height - newHeight) / 2;

            var newCanvasDate = {
                width: newWidth,
                height: newHeight,
                left: newLeft,
                top: newTop
            };
            console.log('fitCanvasToContainer: newCanvasDate', newCanvasDate);
            cropper.setCropBoxData({width: 4, height: 3, left: containerData.width / 2, top: containerData.height / 2 });
            cropper.setCanvasData(newCanvasDate);
        }

        function fitCropBoxToCanvas() {
            var cropBoxData = cropper.getCropBoxData();
            var canvasData = cropper.getCanvasData();
            console.log('fitCropBoxToCanvas canvasData: ', canvasData);
            console.log('fitCropBoxToCanvas: cropBoxData', cropBoxData);

            var scaleWidth = cropBoxData.width / canvasData.width;
            var scaleHeight = cropBoxData.height / canvasData.height;
            var scale = Math.max(scaleWidth, scaleHeight) / cropper.options.autoCropArea;
            var newWidth = cropBoxData.width / scale;
            var newHeight = cropBoxData.height / scale;
            var newLeft = (canvasData.width - newWidth) / 2 + canvasData.left;
            var newTop = (canvasData.height - newHeight) / 2 + canvasData.top;

            var newCropBox = {
                width: newWidth,
                height: newHeight,
                left: newLeft,
                top: newTop
            };
            console.log('fitCropBoxToCanvas: newCropBox', newCropBox);
            cropper.setCropBoxData(newCropBox);
        }

        function fitIn(imageWidth, imageHeight, ratio) {
            console.log('imageWidth, imageHeight: ', imageWidth, imageHeight, ratio);
            var cropHeight = Math.min(imageHeight, imageWidth / ratio);
            var cropWidth = Math.min(imageWidth, imageHeight * ratio);
            var cropLeft = (imageWidth - cropWidth) / 2;
            var cropTop = (imageHeight - cropHeight) / 2;

            return {
                left: cropLeft,
                top: cropTop,
                width: cropWidth,
                height: cropHeight
            };
        }
    };
    img.src = u;
});
