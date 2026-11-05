import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, X, ZoomIn, ZoomOut, Crop } from "lucide-react";
import Cropper from "react-easy-crop";

interface PhotoCaptureModalProps {
  onClose: () => void;
  onImageSelect: (imageUrl: string, imageFile: File) => void;
  initialImage?: string | null;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  onClose,
  onImageSelect,
  initialImage,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [isCropMode, setIsCropMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const isBrowseMode = !!initialImage;

  // Start webcam
  useEffect(() => {
    // Do not access webcam when an image was selected through Browse
    if (isBrowseMode) {
      return;
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Unable to access webcam:", error);

        setCameraError(
          "Unable to access camera. Please allow camera permission and try again.",
        );
      }
    };

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [isBrowseMode]);
  useEffect(() => {
    if (!initialImage) return;

    setCapturedImage(initialImage);
    setCroppedImage(null);
    setCroppedFile(null);

    setCrop({ x: 0, y: 0 });
    setCropZoom(1);
    setIsCropMode(true);
  }, [initialImage]);
  useEffect(() => {
    if (!capturedImage && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [capturedImage]);
  // Capture webcam image
  const handleCapture = () => {
    const video = videoRef.current;

    if (!video) return;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageUrl = canvas.toDataURL("image/jpeg", 0.9);

    setCapturedImage(imageUrl);
    setCroppedImage(null);

    // Reset crop
    setCrop({ x: 0, y: 0 });
    setCropZoom(1);
    setIsCropMode(true);
  };

  // Crop area changed
  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );
  const dataUrlToFile = (dataUrl: string, fileName: string): File => {
    const [header, base64] = dataUrl.split(",");

    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch?.[1] || "image/jpeg";

    const byteString = atob(base64);
    const arrayBuffer = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }

    return new File([arrayBuffer], fileName, {
      type: mime,
    });
  };
  // Create cropped image
  const createCroppedImage = async () => {
    if (!capturedImage || !croppedAreaPixels) return;

    const image = new Image();

    image.src = capturedImage;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject();
    });

    const canvas = document.createElement("canvas");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );

    const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.9);

    const croppedFile = dataUrlToFile(croppedImageUrl, "enquiry-photo.jpg");

    setCroppedImage(croppedImageUrl);
    setCroppedFile(croppedFile);
    setIsCropMode(false);
  };

  // Use final photo
  const handleUsePhoto = () => {
    if (!croppedImage || !croppedFile) return;

    onImageSelect(croppedImage, croppedFile);
    handleClose();
  };

  const handleClose = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    onClose();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCroppedImage(null);
    setIsCropMode(false);

    setCrop({ x: 0, y: 0 });
    setCropZoom(1);
    setZoomLevel(1);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#0F4C81]" />

            <h2 className="text-base font-semibold text-gray-800">
              Capture Photo
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {/* Webcam / Crop */}
          <div className="border rounded-xl overflow-hidden bg-gray-50">
            <div className="px-4 py-2 border-b bg-white">
              <span className="text-sm font-medium text-gray-700">
                {isBrowseMode && !isCropMode
                  ? "Uploaded Photo"
                  : isCropMode
                    ? "Crop Photo"
                    : "Webcam"}
              </span>
            </div>

            <div className="aspect-[4/3] relative flex items-center justify-center bg-black overflow-hidden">
              {isCropMode && capturedImage ? (
                <Cropper
                  image={capturedImage}
                  crop={crop}
                  zoom={cropZoom}
                  aspect={4 / 3}
                  onCropChange={setCrop}
                  onZoomChange={setCropZoom}
                  onCropComplete={onCropComplete}
                  showGrid={true}
                />
              ) : cameraError ? (
                <p className="text-sm text-white text-center px-6">
                  {cameraError}
                </p>
              ) : capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{
                    transform: `scale(${zoomLevel})`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-xl overflow-hidden bg-gray-50">
            <div className="px-4 py-2 border-b bg-white">
              <span className="text-sm font-medium text-gray-700">
                Photo Preview
              </span>
            </div>

            <div className="aspect-[4/3] flex items-center justify-center bg-gray-100">
              {croppedImage ? (
                <img
                  src={croppedImage}
                  alt="Cropped preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <Camera className="w-8 h-8 mx-auto mb-2" />

                  <p className="text-sm">
                    {isCropMode
                      ? "Crop the photo to preview"
                      : "Capture a photo to preview"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t bg-gray-50">
          {/* Zoom */}
          {!isCropMode ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(1, prev - 0.1))}
                className="p-2 bg-white border rounded-lg hover:bg-gray-100"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs text-gray-500 min-w-[45px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(2, prev + 0.1))}
                className="p-2 bg-white border rounded-lg hover:bg-gray-100"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Crop Zoom */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCropZoom((prev) => Math.max(1, prev - 0.1))}
                className="p-2 bg-white border rounded-lg hover:bg-gray-100"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs text-gray-500 min-w-[45px] text-center">
                {Math.round(cropZoom * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setCropZoom((prev) => Math.min(3, prev + 0.1))}
                className="p-2 bg-white border rounded-lg hover:bg-gray-100"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
            >
              Cancel
            </button>

            {!capturedImage ? (
              <button
                type="button"
                onClick={handleCapture}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg bg-[#0F4C81] hover:bg-[#0c3f6b]"
              >
                <Camera className="w-4 h-4" />
                Capture
              </button>
            ) : isCropMode ? (
              <>
                {isBrowseMode ? (
                  <label className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer">
                    Replace
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        const imageUrl = URL.createObjectURL(file);

                        setCapturedImage(imageUrl);
                        setCroppedImage(null);
                        setCroppedFile(null);
                        setCrop({ x: 0, y: 0 });
                        setCropZoom(1);
                        setIsCropMode(true);

                        e.target.value = "";
                      }}
                    />
                  </label>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                  >
                    Retake
                  </button>
                )}

                <button
                  type="button"
                  onClick={createCroppedImage}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg bg-[#0F4C81] hover:bg-[#0c3f6b]"
                >
                  <Crop className="w-4 h-4" />
                  Crop
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsCropMode(true);
                    setCrop({ x: 0, y: 0 });
                    setCropZoom(1);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                >
                  <Crop className="w-4 h-4" />
                  Crop Again
                </button>

                {isBrowseMode ? (
                  <label className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer">
                    Replace
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        const imageUrl = URL.createObjectURL(file);

                        setCapturedImage(imageUrl);
                        setCroppedImage(null);
                        setCroppedFile(null);
                        setCrop({ x: 0, y: 0 });
                        setCropZoom(1);
                        setIsCropMode(true);

                        e.target.value = "";
                      }}
                    />
                  </label>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                  >
                    Retake
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleUsePhoto}
                  disabled={!croppedImage}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg bg-[#0F4C81] hover:bg-[#0c3f6b] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-4 h-4" />
                  Use Photo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCaptureModal;
