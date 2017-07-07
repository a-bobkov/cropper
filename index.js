document.querySelector('.picker').addEventListener('change', function () {
    var file = this.files[0];
    var u = URL.createObjectURL(file);
    var img = document.querySelector('.source');
    img.onload = function initCropper() {
        console.log('loaded: ', file, img.width, img.height);

        var image = document.querySelector('.source');
        var options = {
            aspectRatio: 4 / 3,
            autoCropArea: 1,
            zoomable: false,
            dragMode: 'none',
            viewMode: 1,
            background: false,
            responsive: false,
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

            printSize('cropper.container', cropper.container);
            printSize('modal', cropper.container.parentElement);
            printSize('body', cropper.container.parentElement.parentElement);
            printSize('html', cropper.container.parentElement.parentElement.parentElement);
            console.log('window.innerWidth: ', window.innerWidth);
            console.log('window.innerHeight: ', window.innerHeight);

            function printSize(name, elem) {
                console.log(name + '.offsetWidth: ', elem.offsetWidth);
                console.log(name + '.offsetHeight: ', elem.offsetHeight);
            }

            var proportionalCropBox = getProportionalCropBox();
            cropper.clear();
            cropper.resize();
            cropper.crop();
            applyProportionalCropBox(proportionalCropBox);
        });

        function getProportionalCropBox() {
            var cropBoxData = cropper.getCropBoxData();
            var canvasData = cropper.getCanvasData();
            var proportionCropBox = {
                proportionalWidth: cropBoxData.width / canvasData.width,
                proportionalHeight: cropBoxData.height / canvasData.height,
                proportionalLeft: (cropBoxData.left - canvasData.left) / canvasData.width,
                proportionalTop: (cropBoxData.top - canvasData.top) / canvasData.height
            };
            return proportionCropBox;
        }

        function applyProportionalCropBox(propCropBox) {
            var canvasData = cropper.getCanvasData();
            var newCropBox = {
                width: propCropBox.proportionalWidth * canvasData.width,
                height: propCropBox.proportionalHeight * canvasData.height,
                left: propCropBox.proportionalLeft * canvasData.width + canvasData.left,
                top: propCropBox.proportionalTop * canvasData.height  + canvasData.top
            };
            cropper.setCropBoxData(newCropBox);
        }

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
            cropper.crop();

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
    };
    img.src = u;
});
