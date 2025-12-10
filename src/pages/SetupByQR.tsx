import { useEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import jsQR from "jsqr";
import { useAppStore } from "@state/AppStore";
import { get } from "@lib/paymentPointer";

export default function SetupByQR(_props: { path?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [decodedValue, setDecodedValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const nav = route;
  const {
    setPaymentPointer,
    setCurrency,
    setSignSecret,
    setError: setStoreError,
  } = useAppStore();

  const handleDecodedData = async (rawData: string) => {
    setError(null);
    try {
      console.log("[SetupByQR] decoded QR data", rawData);
      const parsed = JSON.parse(rawData);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("QR payload must be an object");
      }
      const { paymentPointer, signSec } = parsed as {
        paymentPointer?: unknown;
        signSec?: string;
      };

      if (typeof paymentPointer !== "string" || paymentPointer.trim() === "") {
        throw new Error("paymentPointer missing in QR code");
      }
      if (typeof signSec !== "string" || signSec.trim() === "") {
        //throw new Error("signSec missing in QR code");
      }

      const sanitizedPointer = paymentPointer.trim();
      const sanitizedSecret = signSec ? signSec.trim() : "";

      console.log("[SetupByQR] parsed QR payload", {
        paymentPointer: sanitizedPointer,
        signSecPreview:
          sanitizedSecret.length > 6
            ? `${sanitizedSecret.slice(0, 3)}…${sanitizedSecret.slice(-3)}`
            : "***",
      });

      setPaymentPointer(sanitizedPointer);
      setSignSecret(sanitizedSecret);
      setStoreError("");
      const displayPayload = JSON.stringify(
        {
          paymentPointer: sanitizedPointer,
          signSecPreview:
            sanitizedSecret.length > 6
              ? `${sanitizedSecret.slice(0, 3)}…${sanitizedSecret.slice(-3)}`
              : "(hidden)",
        },
        null,
        2,
      );
      setDecodedValue(displayPayload);
      console.log("[SetupByQR] stored QR settings", displayPayload);

      const ppData = await get(sanitizedPointer);

      if (!ppData || typeof ppData !== "object") {
        throw new Error("Failed to fetch payment pointer data");
      }

      setCurrency(ppData.assetCode || "EUR");

      nav("/payment-pointer");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid QR configuration payload";
      setStoreError(message);
      throw err;
    }
  };

  useEffect(() => {
    const videoEl = videoRef.current;

    if (!videoEl) {
      setError("Video element not available.");
      console.error("[SetupByQR] video element missing");
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Unable to access canvas context.");
      console.error("[SetupByQR] unable to create canvas context");
      return;
    }

    let isActive = true;
    let animationFrameId = 0;
    let mediaStream: MediaStream | null = null;

    const stopScan = (reason?: string) => {
      if (!isActive) {
        return;
      }
      console.log("[SetupByQR] stopScan", {
        reason,
        hadStream: !!mediaStream,
        videoReadyState: videoEl.readyState,
      });
      isActive = false;
      setIsScanning(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (videoEl) {
        try {
          videoEl.pause();
        } catch (pauseErr) {
          console.warn("[SetupByQR] video pause error", pauseErr);
        }
        videoEl.srcObject = null;
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
      }
    };

    const scanFrame = () => {
      if (!isActive || !videoEl) {
        return;
      }

      if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
        canvas.height = videoEl.videoHeight;
        canvas.width = videoEl.videoWidth;
        context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          try {
            handleDecodedData(code.data);
          } catch (parseError) {
            console.error("[SetupByQR] failed to process QR data", parseError);
            setError(
              parseError instanceof Error
                ? parseError.message
                : "Unable to process QR",
            );
          } finally {
            stopScan("decoded");
          }
          return;
        }
      }

      animationFrameId = requestAnimationFrame(scanFrame);
    };

    const handleSuccess = (stream: MediaStream) => {
      if (!isActive) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mediaStream = stream;

      videoEl.srcObject = stream;
      videoEl.play();

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          videoTrack.getSettings?.();
        } catch (settingsErr) {
          console.warn("[SetupByQR] getSettings error", settingsErr);
        }
      }

      animationFrameId = requestAnimationFrame(scanFrame);
    };

    const handleError = (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Unable to access camera.";
      console.error("[SetupByQR] Camera error", err);
      setError(message);
      stopScan("error");
    };

    const requestStream = () => {
      setError(null);
      setDecodedValue(null);
      setIsScanning(true);
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      };

      if (navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(handleSuccess)
          .catch((err) => {
            console.warn("[SetupByQR] mediaDevices.getUserMedia failed", err);
            handleError(err);
          });
        return;
      }

      const legacyGetUserMedia =
        (navigator as any).mozGetUserMedia ||
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia;

      if (legacyGetUserMedia) {
        legacyGetUserMedia.call(
          navigator,
          constraints,
          handleSuccess,
          (err: unknown) => {
            console.warn("[SetupByQR] legacy getUserMedia failed", err);
            handleError(err);
          },
        );
      } else {
        handleError(new Error("Camera API is not available on this device."));
      }
    };

    requestStream();

    return () => {
      stopScan("cleanup");
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Backspace" || event.key === "SoftLeft") {
        event.preventDefault();
        nav("/menu");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav]);

  return (
    <section
      className="flex flex-col gap-4 mt-4 w-full max-w-270 mx-auto px-2"
      style={{ minWidth: 0 }}
    >
      <header className="text-xl font-semibold" data-l10n-id="setup-qr-title">
        Setup by QR
      </header>

      <div className="rounded overflow-hidden bg-black h-40 flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
      </div>

      <div className="text-sm">
        {decodedValue ? (
          <div>
            <div className="font-semibold" data-l10n-id="setup-qr-result-label">
              QR Data
            </div>
            <pre className="bg-slate-800 text-white p-2 rounded break-words whitespace-pre-wrap">
              {decodedValue}
            </pre>
          </div>
        ) : error ? (
          <div className="text-red-500">
            <span data-l10n-id="setup-qr-error"></span>
            {error ? `: ${error}` : null}
          </div>
        ) : (
          <div className="text-gray-600" data-l10n-id="setup-qr-instructions">
            {isScanning
              ? "Point the camera at a QR code."
              : "No QR code detected."}
          </div>
        )}
      </div>

      {!decodedValue && !error && !isScanning && (
        <div
          className="text-sm text-gray-600"
          data-l10n-id="setup-qr-no-result"
        >
          No QR code detected.
        </div>
      )}
    </section>
  );
}
