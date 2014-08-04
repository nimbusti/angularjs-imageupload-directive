angular.module('imageupload', [])
    .directive('image', ['$q', function($q) {
        'use strict'

        var debug = true;
        var URL = window.URL || window.webkitURL;


        var ExifTags = {

            // version tags
            0x9000 : "ExifVersion",             // EXIF version
            0xA000 : "FlashpixVersion",         // Flashpix format version

            // colorspace tags
            0xA001 : "ColorSpace",              // Color space information tag

            // image configuration
            0xA002 : "PixelXDimension",         // Valid width of meaningful image
            0xA003 : "PixelYDimension",         // Valid height of meaningful image
            0x9101 : "ComponentsConfiguration", // Information about channels
            0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

            // user information
            0x927C : "MakerNote",               // Any desired information written by the manufacturer
            0x9286 : "UserComment",             // Comments by user

            // related file
            0xA004 : "RelatedSoundFile",        // Name of related sound file

            // date and time
            0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
            0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
            0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
            0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
            0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

            // picture-taking conditions
            0x829A : "ExposureTime",            // Exposure time (in seconds)
            0x829D : "FNumber",                 // F number
            0x8822 : "ExposureProgram",         // Exposure program
            0x8824 : "SpectralSensitivity",     // Spectral sensitivity
            0x8827 : "ISOSpeedRatings",         // ISO speed rating
            0x8828 : "OECF",                    // Optoelectric conversion factor
            0x9201 : "ShutterSpeedValue",       // Shutter speed
            0x9202 : "ApertureValue",           // Lens aperture
            0x9203 : "BrightnessValue",         // Value of brightness
            0x9204 : "ExposureBias",            // Exposure bias
            0x9205 : "MaxApertureValue",        // Smallest F number of lens
            0x9206 : "SubjectDistance",         // Distance to subject in meters
            0x9207 : "MeteringMode",            // Metering mode
            0x9208 : "LightSource",             // Kind of light source
            0x9209 : "Flash",                   // Flash status
            0x9214 : "SubjectArea",             // Location and area of main subject
            0x920A : "FocalLength",             // Focal length of the lens in mm
            0xA20B : "FlashEnergy",             // Strobe energy in BCPS
            0xA20C : "SpatialFrequencyResponse",    //
            0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
            0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
            0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
            0xA214 : "SubjectLocation",         // Location of subject in image
            0xA215 : "ExposureIndex",           // Exposure index selected on camera
            0xA217 : "SensingMethod",           // Image sensor type
            0xA300 : "FileSource",              // Image source (3 == DSC)
            0xA301 : "SceneType",               // Scene type (1 == directly photographed)
            0xA302 : "CFAPattern",              // Color filter array geometric pattern
            0xA401 : "CustomRendered",          // Special processing
            0xA402 : "ExposureMode",            // Exposure mode
            0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
            0xA404 : "DigitalZoomRation",       // Digital zoom ratio
            0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
            0xA406 : "SceneCaptureType",        // Type of scene
            0xA407 : "GainControl",             // Degree of overall image gain adjustment
            0xA408 : "Contrast",                // Direction of contrast processing applied by camera
            0xA409 : "Saturation",              // Direction of saturation processing applied by camera
            0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
            0xA40B : "DeviceSettingDescription",    //
            0xA40C : "SubjectDistanceRange",    // Distance to subject

            // other tags
            0xA005 : "InteroperabilityIFDPointer",
            0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
        };

        var TiffTags = {
            0x0100 : "ImageWidth",
            0x0101 : "ImageHeight",
            0x8769 : "ExifIFDPointer",
            0x8825 : "GPSInfoIFDPointer",
            0xA005 : "InteroperabilityIFDPointer",
            0x0102 : "BitsPerSample",
            0x0103 : "Compression",
            0x0106 : "PhotometricInterpretation",
            0x0112 : "Orientation",
            0x0115 : "SamplesPerPixel",
            0x011C : "PlanarConfiguration",
            0x0212 : "YCbCrSubSampling",
            0x0213 : "YCbCrPositioning",
            0x011A : "XResolution",
            0x011B : "YResolution",
            0x0128 : "ResolutionUnit",
            0x0111 : "StripOffsets",
            0x0116 : "RowsPerStrip",
            0x0117 : "StripByteCounts",
            0x0201 : "JPEGInterchangeFormat",
            0x0202 : "JPEGInterchangeFormatLength",
            0x012D : "TransferFunction",
            0x013E : "WhitePoint",
            0x013F : "PrimaryChromaticities",
            0x0211 : "YCbCrCoefficients",
            0x0214 : "ReferenceBlackWhite",
            0x0132 : "DateTime",
            0x010E : "ImageDescription",
            0x010F : "Make",
            0x0110 : "Model",
            0x0131 : "Software",
            0x013B : "Artist",
            0x8298 : "Copyright"
        };

        var GPSTags = {
            0x0000 : "GPSVersionID",
            0x0001 : "GPSLatitudeRef",
            0x0002 : "GPSLatitude",
            0x0003 : "GPSLongitudeRef",
            0x0004 : "GPSLongitude",
            0x0005 : "GPSAltitudeRef",
            0x0006 : "GPSAltitude",
            0x0007 : "GPSTimeStamp",
            0x0008 : "GPSSatellites",
            0x0009 : "GPSStatus",
            0x000A : "GPSMeasureMode",
            0x000B : "GPSDOP",
            0x000C : "GPSSpeedRef",
            0x000D : "GPSSpeed",
            0x000E : "GPSTrackRef",
            0x000F : "GPSTrack",
            0x0010 : "GPSImgDirectionRef",
            0x0011 : "GPSImgDirection",
            0x0012 : "GPSMapDatum",
            0x0013 : "GPSDestLatitudeRef",
            0x0014 : "GPSDestLatitude",
            0x0015 : "GPSDestLongitudeRef",
            0x0016 : "GPSDestLongitude",
            0x0017 : "GPSDestBearingRef",
            0x0018 : "GPSDestBearing",
            0x0019 : "GPSDestDistanceRef",
            0x001A : "GPSDestDistance",
            0x001B : "GPSProcessingMethod",
            0x001C : "GPSAreaInformation",
            0x001D : "GPSDateStamp",
            0x001E : "GPSDifferential"
        };

        var StringValues = {
            ExposureProgram : {
                0 : "Not defined",
                1 : "Manual",
                2 : "Normal program",
                3 : "Aperture priority",
                4 : "Shutter priority",
                5 : "Creative program",
                6 : "Action program",
                7 : "Portrait mode",
                8 : "Landscape mode"
            },
            MeteringMode : {
                0 : "Unknown",
                1 : "Average",
                2 : "CenterWeightedAverage",
                3 : "Spot",
                4 : "MultiSpot",
                5 : "Pattern",
                6 : "Partial",
                255 : "Other"
            },
            LightSource : {
                0 : "Unknown",
                1 : "Daylight",
                2 : "Fluorescent",
                3 : "Tungsten (incandescent light)",
                4 : "Flash",
                9 : "Fine weather",
                10 : "Cloudy weather",
                11 : "Shade",
                12 : "Daylight fluorescent (D 5700 - 7100K)",
                13 : "Day white fluorescent (N 4600 - 5400K)",
                14 : "Cool white fluorescent (W 3900 - 4500K)",
                15 : "White fluorescent (WW 3200 - 3700K)",
                17 : "Standard light A",
                18 : "Standard light B",
                19 : "Standard light C",
                20 : "D55",
                21 : "D65",
                22 : "D75",
                23 : "D50",
                24 : "ISO studio tungsten",
                255 : "Other"
            },
            Flash : {
                0x0000 : "Flash did not fire",
                0x0001 : "Flash fired",
                0x0005 : "Strobe return light not detected",
                0x0007 : "Strobe return light detected",
                0x0009 : "Flash fired, compulsory flash mode",
                0x000D : "Flash fired, compulsory flash mode, return light not detected",
                0x000F : "Flash fired, compulsory flash mode, return light detected",
                0x0010 : "Flash did not fire, compulsory flash mode",
                0x0018 : "Flash did not fire, auto mode",
                0x0019 : "Flash fired, auto mode",
                0x001D : "Flash fired, auto mode, return light not detected",
                0x001F : "Flash fired, auto mode, return light detected",
                0x0020 : "No flash function",
                0x0041 : "Flash fired, red-eye reduction mode",
                0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
                0x0047 : "Flash fired, red-eye reduction mode, return light detected",
                0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
                0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
                0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
                0x0059 : "Flash fired, auto mode, red-eye reduction mode",
                0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
                0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
            },
            SensingMethod : {
                1 : "Not defined",
                2 : "One-chip color area sensor",
                3 : "Two-chip color area sensor",
                4 : "Three-chip color area sensor",
                5 : "Color sequential area sensor",
                7 : "Trilinear sensor",
                8 : "Color sequential linear sensor"
            },
            SceneCaptureType : {
                0 : "Standard",
                1 : "Landscape",
                2 : "Portrait",
                3 : "Night scene"
            },
            SceneType : {
                1 : "Directly photographed"
            },
            CustomRendered : {
                0 : "Normal process",
                1 : "Custom process"
            },
            WhiteBalance : {
                0 : "Auto white balance",
                1 : "Manual white balance"
            },
            GainControl : {
                0 : "None",
                1 : "Low gain up",
                2 : "High gain up",
                3 : "Low gain down",
                4 : "High gain down"
            },
            Contrast : {
                0 : "Normal",
                1 : "Soft",
                2 : "Hard"
            },
            Saturation : {
                0 : "Normal",
                1 : "Low saturation",
                2 : "High saturation"
            },
            Sharpness : {
                0 : "Normal",
                1 : "Soft",
                2 : "Hard"
            },
            SubjectDistanceRange : {
                0 : "Unknown",
                1 : "Macro",
                2 : "Close view",
                3 : "Distant view"
            },
            FileSource : {
                3 : "DSC"
            },

            Components : {
                0 : "",
                1 : "Y",
                2 : "Cb",
                3 : "Cr",
                4 : "R",
                5 : "G",
                6 : "B"
            }
        };

        function addEvent(element, event, handler) {
            if (element.addEventListener) {
                element.addEventListener(event, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + event, handler);
            }
        }

        function imageHasData(img) {
            return !!(img.exifdata);
        }


        function base64ToArrayBuffer(base64, contentType) {
            contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
            base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
            var binary = atob(base64);
            var len = binary.length;
            var buffer = new ArrayBuffer(len);
            var view = new Uint8Array(buffer);
            for (var i = 0; i < len; i++) {
                view[i] = binary.charCodeAt(i);
            }
            return buffer;
        }

        function objectURLToBlob(url, callback) {
            var http = new XMLHttpRequest();
            http.open("GET", url, true);
            http.responseType = "blob";
            http.onload = function(e) {
                if (this.status == 200 || this.status === 0) {
                    callback(this.response);
                }
            };
            http.send();
        }

        function getImageData(img, callback) {
            function handleBinaryFile(binFile) {
                var data = findEXIFinJPEG(binFile);
                img.exifdata = data || {};
                if (callback) {
                    callback.call(img);
                }
            }

            if (img instanceof Image || img instanceof HTMLImageElement) {
                if (/^data\:/i.test(img.src)) { // Data URI
                    var arrayBuffer = base64ToArrayBuffer(img.src);
                    handleBinaryFile(arrayBuffer);

                } else if (/^blob\:/i.test(img.src)) { // Object URL
                    var fileReader = new FileReader();
                    fileReader.onload = function(e) {
                        handleBinaryFile(e.target.result);
                    };
                    objectURLToBlob(img.src, function (blob) {
                        fileReader.readAsArrayBuffer(blob);
                    });
                } else {
                    var http = new XMLHttpRequest();
                    http.onload = function() {
                        if (http.status == "200") {
                            handleBinaryFile(http.response);
                        } else {
                            throw "Could not load image";
                        }
                        http = null;
                    };
                    http.open("GET", img.src, true);
                    http.responseType = "arraybuffer";
                    http.send(null);
                }
            } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    handleBinaryFile(e.target.result);
                };

                fileReader.readAsArrayBuffer(img);
            }
        }

        function findEXIFinJPEG(file) {
            var dataView = new DataView(file);

            if (debug) console.log("Got file of length " + file.byteLength);
            if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
                if (debug) console.log("Not a valid JPEG");
                return false; // not a valid jpeg
            }

            var offset = 2,
                length = file.byteLength,
                marker;

            while (offset < length) {
                if (dataView.getUint8(offset) != 0xFF) {
                    if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
                    return false; // not a valid marker, something is wrong
                }

                marker = dataView.getUint8(offset + 1);
                if (debug) console.log(marker);

                // we could implement handling for other markers here,
                // but we're only looking for 0xFFE1 for EXIF data

                if (marker == 225) {
                    if (debug) console.log("Found 0xFFE1 marker");

                    return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

                    // offset += 2 + file.getShortAt(offset+2, true);

                } else {
                    offset += 2 + dataView.getUint16(offset+2);
                }

            }

        }


        function readTags(file, tiffStart, dirStart, strings, bigEnd) {
            var entries = file.getUint16(dirStart, !bigEnd),
                tags = {},
                entryOffset, tag,
                i;

            for (i=0;i<entries;i++) {
                entryOffset = dirStart + i*12 + 2;
                tag = strings[file.getUint16(entryOffset, !bigEnd)];
                if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
                tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
            }
            return tags;
        }


        function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
            var type = file.getUint16(entryOffset+2, !bigEnd),
                numValues = file.getUint32(entryOffset+4, !bigEnd),
                valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
                offset,
                vals, val, n,
                numerator, denominator;

            switch (type) {
                case 1: // byte, 8-bit unsigned int
                case 7: // undefined, 8-bit byte, value depending on field
                    if (numValues == 1) {
                        return file.getUint8(entryOffset + 8, !bigEnd);
                    } else {
                        offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            vals[n] = file.getUint8(offset + n);
                        }
                        return vals;
                    }

                case 2: // ascii, 8-bit byte
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    return getStringFromDB(file, offset, numValues-1);

                case 3: // short, 16 bit int
                    if (numValues == 1) {
                        return file.getUint16(entryOffset + 8, !bigEnd);
                    } else {
                        offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                        }
                        return vals;
                    }

                case 4: // long, 32 bit int
                    if (numValues == 1) {
                        return file.getUint32(entryOffset + 8, !bigEnd);
                    } else {
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                        }
                        return vals;
                    }

                case 5:    // rational = two long values, first is numerator, second is denominator
                    if (numValues == 1) {
                        numerator = file.getUint32(valueOffset, !bigEnd);
                        denominator = file.getUint32(valueOffset+4, !bigEnd);
                        val = new Number(numerator / denominator);
                        val.numerator = numerator;
                        val.denominator = denominator;
                        return val;
                    } else {
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                            denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                            vals[n] = new Number(numerator / denominator);
                            vals[n].numerator = numerator;
                            vals[n].denominator = denominator;
                        }
                        return vals;
                    }

                case 9: // slong, 32 bit signed int
                    if (numValues == 1) {
                        return file.getInt32(entryOffset + 8, !bigEnd);
                    } else {
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                        }
                        return vals;
                    }

                case 10: // signed rational, two slongs, first is numerator, second is denominator
                    if (numValues == 1) {
                        return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
                    } else {
                        vals = [];
                        for (n=0;n<numValues;n++) {
                            vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                        }
                        return vals;
                    }
            }
        }

        function getStringFromDB(buffer, start, length) {
            var n;
            var outstr = "";
            for (n = start; n < start+length; n++) {
                outstr += String.fromCharCode(buffer.getUint8(n));
            }
            return outstr;
        }

        function readEXIFData(file, start) {
            if (getStringFromDB(file, start, 4) != "Exif") {
                if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
                return false;
            }

            var bigEnd,
                tags, tag,
                exifData, gpsData,
                tiffOffset = start + 6;

            // test for TIFF validity and endianness
            if (file.getUint16(tiffOffset) == 0x4949) {
                bigEnd = false;
            } else if (file.getUint16(tiffOffset) == 0x4D4D) {
                bigEnd = true;
            } else {
                if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
                return false;
            }

            if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
                if (debug) console.log("Not valid TIFF data! (no 0x002A)");
                return false;
            }

            var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

            if (firstIFDOffset < 0x00000008) {
                if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
                return false;
            }

            tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

            if (tags.ExifIFDPointer) {
                exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
                for (tag in exifData) {
                    switch (tag) {
                        case "LightSource" :
                        case "Flash" :
                        case "MeteringMode" :
                        case "ExposureProgram" :
                        case "SensingMethod" :
                        case "SceneCaptureType" :
                        case "SceneType" :
                        case "CustomRendered" :
                        case "WhiteBalance" :
                        case "GainControl" :
                        case "Contrast" :
                        case "Saturation" :
                        case "Sharpness" :
                        case "SubjectDistanceRange" :
                        case "FileSource" :
                            exifData[tag] = StringValues[tag][exifData[tag]];
                            break;

                        case "ExifVersion" :
                        case "FlashpixVersion" :
                            exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                            break;

                        case "ComponentsConfiguration" :
                            exifData[tag] =
                                StringValues.Components[exifData[tag][0]] +
                                StringValues.Components[exifData[tag][1]] +
                                StringValues.Components[exifData[tag][2]] +
                                StringValues.Components[exifData[tag][3]];
                            break;
                    }
                    tags[tag] = exifData[tag];
                }
            }

            if (tags.GPSInfoIFDPointer) {
                gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
                for (tag in gpsData) {
                    switch (tag) {
                        case "GPSVersionID" :
                            gpsData[tag] = gpsData[tag][0] +
                                "." + gpsData[tag][1] +
                                "." + gpsData[tag][2] +
                                "." + gpsData[tag][3];
                            break;
                    }
                    tags[tag] = gpsData[tag];
                }
            }

            return tags;
        }


        function getData(img, callback) {
            if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;

            if (!imageHasData(img)) {
                getImageData(img, callback);
            } else {
                if (callback) {
                    callback.call(img);
                }
            }
            return true;
        }

        function getTag(img, tag) {
            if (!imageHasData(img)) return;
            return img.exifdata[tag];
        }

        function getAllTags(img) {
            if (!imageHasData(img)) return {};
            var a,
                data = img.exifdata,
                tags = {};
            for (a in data) {
                if (data.hasOwnProperty(a)) {
                    tags[a] = data[a];
                }
            }
            return tags;
        }

        function pretty(img) {
            if (!imageHasData(img)) return "";
            var a,
                data = img.exifdata,
                strPretty = "";
            for (a in data) {
                if (data.hasOwnProperty(a)) {
                    if (typeof data[a] == "object") {
                        if (data[a] instanceof Number) {
                            strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                        } else {
                            strPretty += a + " : [" + data[a].length + " values]\r\n";
                        }
                    } else {
                        strPretty += a + " : " + data[a] + "\r\n";
                    }
                }
            }
            return strPretty;
        }

        function readFromBinaryFile(file) {
            return findEXIFinJPEG(file);
        }


        function detectSubsampling(img) {
            var iw = img.naturalWidth, ih = img.naturalHeight;
            if (iw * ih > 1024 * 1024) { // subsampling may happen over megapixel image
                var canvas = document.createElement('canvas');
                canvas.width = canvas.height = 1;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, -iw + 1, 0);
                // subsampled image becomes half smaller in rendering size.
                // check alpha channel value to confirm image is covering edge pixel or not.
                // if alpha value is 0 image is not covering, hence subsampled.
                return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
            } else {
                return false;
            }
        }

        /**
         * Detecting vertical squash in loaded image.
         * Fixes a bug which squash image vertically while drawing into canvas for some images.
         */
        function detectVerticalSquash(img, iw, ih) {
            var canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = ih;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var data = ctx.getImageData(0, 0, 1, ih).data;
            // search image edge pixel position in case it is squashed vertically.
            var sy = 0;
            var ey = ih;
            var py = ih;
            while (py > sy) {
                var alpha = data[(py - 1) * 4 + 3];
                if (alpha === 0) {
                    ey = py;
                } else {
                    sy = py;
                }
                py = (ey + sy) >> 1;
            }
            var ratio = (py / ih);
            return (ratio===0)?1:ratio;
        }

        /**
         * Rendering image element (with resizing) and get its data URL
         */
        function renderImageToDataURL(img, options, doSquash) {

            var q = $q.defer();

            var canvas = document.createElement('canvas');
            renderImageToCanvas(img, canvas, options, doSquash);
            //return canvas.toDataURL("image/jpeg", options.quality || 0.8);

            q.resolve(canvas.toDataURL(options.type, options.quality || 0.8));

            return q.promise;
        }


        /**
         * Rendering image element (with resizing) and return canvas
         */
        function renderImage(img, options, doSquash) {

            var q = $q.defer();

            var canvas = document.createElement('canvas');
            renderImageToCanvas(img, canvas, options, doSquash);
            //return canvas.toDataURL("image/jpeg", options.quality || 0.8);

            q.resolve(canvas);

            return q.promise;
        }

        /**
         * Rendering image element (with resizing) into the canvas element
         */
        function renderImageToCanvas(img, canvas, options, doSquash) {

            var iw = img.naturalWidth, ih = img.naturalHeight;
            var width = options.width, height = options.height;
            var ctx = canvas.getContext('2d');
            ctx.save();

            transformCoordinate(canvas, ctx, width, height, options.orientation);

            var subsampled = detectSubsampling(img);
            if (subsampled) {
                iw /= 2;
                ih /= 2;
            }
            var d = 1024; // size of tiling canvas
            var tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = tmpCanvas.height = d;
            var tmpCtx = tmpCanvas.getContext('2d');
            var vertSquashRatio = doSquash ? detectVerticalSquash(img, iw, ih) : 1;
            var dw = Math.ceil(d * width / iw);
            var dh = Math.ceil(d * height / ih / vertSquashRatio);
            var sy = 0;
            var dy = 0;
            while (sy < ih) {
                var sx = 0;
                var dx = 0;
                while (sx < iw) {
                    tmpCtx.clearRect(0, 0, d, d);
                    tmpCtx.drawImage(img, -sx, -sy);
                    ctx.drawImage(tmpCanvas, 0, 0, d, d, dx, dy, dw, dh);
                    sx += d;
                    dx += dw;
                }
                sy += d;
                dy += dh;
            }
            ctx.restore();
            tmpCanvas = tmpCtx = null;

        }

        /**
         * Transform canvas coordination according to specified frame size and orientation
         * Orientation value is from EXIF tag
         */
        function transformCoordinate(canvas, ctx, width, height, orientation) {
            switch (orientation) {
                case 5:
                case 6:
                case 7:
                case 8:
                    canvas.width = height;
                    canvas.height = width;
                    break;
                default:
                    canvas.width = width;
                    canvas.height = height;
            }
            switch (orientation) {
                case 2:
                    // horizontal flip
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    break;
                case 3:
                    // 180 rotate left
                    ctx.translate(width, height);
                    ctx.rotate(Math.PI);
                    break;
                case 4:
                    // vertical flip
                    ctx.translate(0, height);
                    ctx.scale(1, -1);
                    break;
                case 5:
                    // vertical flip + 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.scale(1, -1);
                    break;
                case 6:
                    // 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(0, -height);
                    break;
                case 7:
                    // horizontal flip + 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(width, -height);
                    ctx.scale(-1, 1);
                    break;
                case 8:
                    // 90 rotate left
                    ctx.rotate(-0.5 * Math.PI);
                    ctx.translate(-width, 0);
                    break;
                default:
                    break;
            }
        }




        /*MegaPixImage.prototype.render = function(target, options) {
            if (this.imageLoadListeners) {
                var _this = this;
                this.imageLoadListeners.push(function() { _this.render(target, options) });
                return;
            }
            options = options || {};
            var imgWidth = this.srcImage.naturalWidth, imgHeight = this.srcImage.naturalHeight,
                width = options.width, height = options.height,
                maxWidth = options.maxWidth, maxHeight = options.maxHeight,
                doSquash = !this.blob || this.blob.type === 'image/jpeg';
            if (width && !height) {
                height = (imgHeight * width / imgWidth) << 0;
            } else if (height && !width) {
                width = (imgWidth * height / imgHeight) << 0;
            } else {
                width = imgWidth;
                height = imgHeight;
            }
            if (maxWidth && width > maxWidth) {
                width = maxWidth;
                height = (imgHeight * width / imgWidth) << 0;
            }
            if (maxHeight && height > maxHeight) {
                height = maxHeight;
                width = (imgWidth * height / imgHeight) << 0;
            }
            var opt = { width : width, height : height };
            for (var k in options) opt[k] = options[k];

            var tagName = target.tagName.toLowerCase();
            if (tagName === 'img') {
                target.src = renderImageToDataURL(this.srcImage, opt, doSquash);
            } else if (tagName === 'canvas') {
                renderImageToCanvas(this.srcImage, target, opt, doSquash);
            }
            if (typeof this.onrender === 'function') {
                this.onrender(target);
            }
        };*/








        var getResizeArea = function () {
            var resizeAreaId = 'fileupload-resize-area';

            var resizeArea = document.getElementById(resizeAreaId);

            if (!resizeArea) {
                resizeArea = document.createElement('canvas');
                resizeArea.id = resizeAreaId;
                resizeArea.style.visibility = 'hidden';
                document.body.appendChild(resizeArea);
            }

            return resizeArea;
        }

        function b64toBlob(base64Data, contentType) {

            var q = $q.defer();

            contentType = contentType || '';
            var sliceSize = 1024;
            var byteCharacters = atob(base64Data);
            var bytesLength = byteCharacters.length;
            var slicesCount = Math.ceil(bytesLength / sliceSize);
            var byteArrays = new Array(slicesCount);

            for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                var begin = sliceIndex * sliceSize;
                var end = Math.min(begin + sliceSize, bytesLength);

                var bytes = new Array(end - begin);
                for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
                    bytes[i] = byteCharacters[offset].charCodeAt(0);
                }
                byteArrays[sliceIndex] = new Uint8Array(bytes);
            }

            console.log(contentType);



            try{

                var blob = new Blob(byteArrays, { type: contentType });

            }
            catch(e){
                // TypeError old chrome and FF
                window.BlobBuilder = window.BlobBuilder ||
                    window.WebKitBlobBuilder ||
                    window.MozBlobBuilder ||
                    window.MSBlobBuilder;
                if(e.name == 'TypeError' && window.BlobBuilder){
                    var bb = new BlobBuilder();
                    bb.append(byteArrays.buffer);
                    var blob = bb.getBlob(contentType);
                }
                else if(e.name == "InvalidStateError"){
                    // InvalidStateError (tested on FF13 WinXP)
                    var blob = new Blob( byteArrays.buffer, {type : contentType});
                }
                else{
                    console.log("Unsupported converter..");
                }
            }



            q.resolve(blob);

            return q.promise;

            //return new Blob(byteArrays, { type: contentType });

        }

        var resizeImage = function (origImage, options) {

            var q = $q.defer();

/*            options.orientation = getTag(origImage,0x0112);
            console.log("orientation:" + getTag(origImage,0x0112));*/




            var maxHeight = options.resizeMaxHeight || 600;
            var maxWidth = options.resizeMaxWidth || 500;
            var quality = options.resizeQuality || 0.7;
            var cover = options.cover || false;
            var coverHeight = options.coverHeight || 600;
            var coverWidth = options.coverWidth || 500;
            var coverX = options.coverX || 'left';
            var coverY = options.coverY || 'top';
            var type = options.resizeType || 'image/jpeg';

            var canvas = getResizeArea();

            var height = origImage.height;
            var width = origImage.width;

            var imgX = 0;
            var imgY = 0;


            if(!cover){
	            // calculate the width and height, constraining the proportions
                if(height / width < maxHeight / maxWidth) {
                     width = width * (maxHeight / height);
                     height = maxHeight;
	            } else {
                    height = height * (maxWidth / width);
                    width = maxWidth;
	            }

	            canvas.width = width;
	            canvas.height = height;

                var imgWidth = width, imgHeight = height,
                    width = options.width, height = options.height,
                    doSquash = true;
                    //doSquash = !this.blob || this.blob.type === 'image/jpeg';
                if (width && !height) {
                    height = (imgHeight * width / imgWidth) << 0;
                } else if (height && !width) {
                    width = (imgWidth * height / imgHeight) << 0;
                } else {
                    width = imgWidth;
                    height = imgHeight;
                }
                if (maxWidth && width > maxWidth) {
                    width = maxWidth;
                    height = (imgHeight * width / imgWidth) << 0;
                }
                if (maxHeight && height > maxHeight) {
                    height = maxHeight;
                    width = (imgWidth * height / imgHeight) << 0;
                }
                var opt = { width : width, height : height,orientation: options.orientation };



                for (var k in options) opt[k] = options[k];












	          }else{
	          	// Logic for calculating size when in cover-mode
	          	canvas.width = coverHeight;
					    canvas.height = coverWidth;
					    // Resize image to fit canvas and keep original proportions
					    var ratio = 1;
					    if(height < canvas.height)
					    {
					      ratio = canvas.height / height;
					      height = height * ratio;
					      width = width * ratio;
					    }
					    if(width < canvas.width)
					    {
					      ratio = canvas.width / width;
					      height = height * ratio;
					      width = width * ratio;
					    }

					    // Check if both are too big -> downsize
					    if(width > canvas.width && height > canvas.height)
					    {
					      ratio = Math.max(canvas.width/width, canvas.height/height);
					      height = height * ratio;
					      width = width * ratio;
					    }

					    // place img according to coverX and coverY values
					    if(width > canvas.width){
					    	if(coverX === 'right'){ imgX = canvas.width - width; }
					    	else if (coverX === 'center'){ imgX = (canvas.width - width) / 2; }
					    }else if(height > canvas.height){
					    	if(coverY === 'bottom'){ imgY = canvas.height - height; }
					    	else if (coverY === 'center'){ imgY = (canvas.height - height) / 2; }
					    }I

	          }

            //draw image on canvas
            //var ctx = canvas.getContext("2d");
            //ctx.drawImage(origImage, imgX, imgY, width, height);


            var resultImg = {};

            var orientation = 1;


            renderImage(origImage, opt, doSquash).then(function(data){

                resultImg.dataURL = data.toDataURL(type, options.quality || 0.9);

                if(resultImg.dataURL.split(',')[0].split(':')[1].split(';')[0] == type ){
                    resultImg.blob = window.dataURLtoBlob(resultImg.dataURL);
                    q.resolve(resultImg);
                }else{
                    //Bug on android 4.1.2
                    var encoder = new JPEGEncoder();
                    resultImg.dataURL = encoder.encode(data.getContext('2d').getImageData(0, 0, width, height),90);
                    resultImg.blob = window.dataURLtoBlob(resultImg.dataURL);
                    q.resolve(resultImg);
                }
            });


/*            renderImageToDataURL(origImage, opt, doSquash).then(function(data){

                    resultImg.dataURL = data;
                    resultImg.blob = window.dataURLtoBlob(data);
                    q.resolve(resultImg);

                    //    b64toBlob(data.substring( "data:image/jpeg;base64,".length ),type).then(function(data){
                    //        resultImg.blob = data;
                    //        q.resolve(resultImg);
                    //    })
            });*/




/*            resultImg.dataURL = renderImageToDataURL(origImage, opt, doSquash);
            //resultImg.dataURL = canvas.toDataURL(type, quality);
            resultImg.blob = b64toBlob(resultImg.dataURL.substring( "data:image/jpeg;base64,".length ),type);

            // get the data from canvas as 70% jpg (or specified type).
            return resultImg;*/


            return q.promise;
        };



        var createImage = function(url, callback) {
            var image = new Image();
            image.onload = function() {
                callback(image);
            };
            image.src = url;
        };

        var fileToDataURL = function (file) {
            var deferred = $q.defer();
            var reader = new FileReader();
            reader.onload = function (e) {
                deferred.resolve({
                    data: e.target.result,
                    file: file
            });
            };
            reader.readAsDataURL(file);
            return deferred.promise;
        };


        return {
            restrict: 'A',
            scope: {
                image: '=',
                resizeMaxHeight: '@?',
                resizeMaxWidth: '@?',
                resizeQuality: '@?',
                resizeType: '@?',
                cover: '@?',
                coverHeight: '@?',
                coverWidth: '@?',
                coverX: '@?',
                coverY: '@?'
            },
            link: function postLink(scope, element, attrs, ctrl) {





                var doResizing = function(imageResult, callback) {
                    createImage(imageResult.url, function(image) {
                        getImageData(image,function(data) {

                            if (this.exifdata) {
                                scope.orientation = this.exifdata.Orientation;
                            }


                            /*                            var dataURL = resizeImage(image, scope);
                             var imageType = dataURL.dataURL.substring(5, dataURL.dataURL.indexOf(';'));
                             imageResult.resized = {
                             dataURL: dataURL.dataURL,
                             type: imageType,
                             blob:dataURL.blob
                             };*/

                            resizeImage(image, scope).then(function (data) {

                                imageResult.resized = {
                                    dataURL: data.dataURL,
                                    type: data.dataURL.substring(5, data.dataURL.indexOf(';')),
                                    blob: data.blob
                                };
                                callback(imageResult);

                            });

                        });

                    });
                };


                var applyScope = function(imageResults) {
                    if(attrs.multiple) {
                        for(var i in imageResults) {
                            scope.image.push(imageResults[i]);
                        }
                    }
                    else {
                        //scope.$apply(function() {
                            scope.image = imageResults[0];
                        //});
                    }
                    scope.$emit('image-resized',imageResults);
                };

                element.bind('change', function (evt) {

/*                    var mpImg = new MegaPixImage(scope.image);
                    var imageRes;

                    mpImg.render(imageRes, { width: scope.resizeMaxWidth, height: scope.resizeMaxHeight });*/


                    //when multiple always return an array of images
                    if(attrs.multiple)
                        scope.image = [];

                    var files = evt.target.files;


                    var imageResults = [];

                    var addToImageResults = function(imageResult) {
                        imageResults.push(imageResult);
                        if(imageResults.length === files.length) {
                            applyScope(imageResults);
                            imageResults = [];
                        }
                    }





                    for(var i = 0; i < files.length; i++) {
                        //create a result object for each file in files


                        fileToDataURL(files[i]).then(function (object) {
                            var file = object.file;
                            var dataURL = object.data;
                            var imageResult = {
                                file: file,
                                url: URL.createObjectURL(file),
                                dataURL: dataURL
                            };

                            if(scope.resizeMaxHeight || scope.resizeMaxWidth) { //resize image
                                doResizing(imageResult, function(imageResult) {
                                    addToImageResults(imageResult);
                                });
                            }
                            else { //no resizing
                                addToImageResults(imageResult);
                            }

                        });
                    }
                });
            }
        };
    }]);
