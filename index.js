document.querySelector('.loader').addEventListener('click', function() {
    var url = document.querySelector('.loadUrl').value;
    initCropper(url);
});

document.querySelector('.picker').addEventListener('change', function () {
    var file = this.files[0];
    var url = URL.createObjectURL(file);
    initCropper(url);
});

function initCropper(url) {
    console.log('started');

    var img = document.querySelector('.source');
    img.onload = imageLoaded;
    img.src = url;

    document.querySelector('.spinner').classList.add('show');
    document.querySelector('body').classList.add('modal-open');

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
            document.querySelector('.spinner').classList.remove('show');
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

        var startCopy = new Date;
        var ctx = canvas.getContext('2d');
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var resultCanvas = document.querySelector('.cropped');
        resultCanvas.width = canvas.width;
        resultCanvas.height = canvas.height;
        var resultCtx = resultCanvas.getContext('2d');
        resultCtx.putImageData(imageData, 0, 0);
        console.log('copy end: ', new Date - startCopy, 'ms.');
        document.querySelector('body').classList.remove('modal-open');
    });

    window.addEventListener('resize', function() {
        console.log('resize');

        /**
         * это хак для IOS, которая на успевает обновить размеры элемента с position: fixed
         */
        var modal = cropper.container.parentElement;
        modal.style.width = window.innerWidth + 'px';
        modal.style.height = window.innerHeight + 'px';

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
}

function imageLoaded(event) {
    var img = event.target;
    console.log('loaded: ', img.width, img.height);
}
