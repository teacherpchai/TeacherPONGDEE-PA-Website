"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Camera, X, Check, RotateCcw, Loader2 } from "lucide-react";
import { firebaseService } from "@/lib/firebaseService";

interface ImageUploadCropProps {
    currentImageUrl?: string;
    onImageChange: (imageUrl: string) => void;
    aspectRatio?: number;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
): Crop {
    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export default function ImageUploadCrop({
    currentImageUrl,
    onImageChange,
    aspectRatio = 1, // Default square aspect ratio
}: ImageUploadCropProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageSrc(reader.result as string);
                setIsModalOpen(true);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspectRatio));
        },
        [aspectRatio]
    );

    const getCroppedImage = useCallback((): Promise<string | null> => {
        if (!imgRef.current || !crop) return Promise.resolve(null);

        const image = imgRef.current;
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const pixelCrop = {
            x: (crop.x / 100) * image.width * scaleX,
            y: (crop.y / 100) * image.height * scaleY,
            width: (crop.width / 100) * image.width * scaleX,
            height: (crop.height / 100) * image.height * scaleY,
        };

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return Promise.resolve(null);

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            resolve(canvas.toDataURL("image/jpeg", 0.9));
        });
    }, [crop]);

    // Convert base64 to file helper
    const base64ToFile = (base64: string, filename: string): File => {
        const arr = base64.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleCropComplete = async () => {
        const croppedDataUrl = await getCroppedImage();
        if (!croppedDataUrl) return;

        setIsUploading(true);

        try {
            // Convert to file for Firebase Storage
            const file = base64ToFile(croppedDataUrl, `profile-${Date.now()}.jpg`);

            // Upload to Firebase Storage
            const imageUrl = await firebaseService.uploadFile(file, "profile-images");

            if (imageUrl) {
                onImageChange(imageUrl);
                setIsModalOpen(false);
                setImageSrc(null);
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } else {
                alert("อัพโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
            }
        } catch (error) {
            console.error("Error uploading profile image:", error);
            alert("เกิดข้อผิดพลาดในการอัพโหลด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setImageSrc(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleReset = () => {
        if (imgRef.current) {
            const { width, height } = imgRef.current;
            setCrop(centerAspectCrop(width, height, aspectRatio));
        }
    };

    return (
        <div className="space-y-4">
            {/* Current Image Preview */}
            <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--royal-blue)] bg-gray-100 flex items-center justify-center">
                    {currentImageUrl ? (
                        <img
                            src={currentImageUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Camera className="text-gray-400" size={32} />
                    )}
                </div>
                <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[var(--royal-blue)] text-white rounded-lg hover:bg-[var(--royal-blue-dark)] transition-colors">
                        <Camera size={18} />
                        เลือกรูปภาพ
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={onSelectFile}
                            className="hidden"
                        />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                        รองรับ JPG, PNG ขนาดไม่เกิน 5MB
                    </p>
                </div>
            </div>

            {/* Crop Modal */}
            {isModalOpen && imageSrc && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[var(--royal-blue)]">
                                ครอบตัดรูปภาพ
                            </h3>
                            <button
                                onClick={handleCancel}
                                className="text-gray-500 hover:text-gray-700 p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Crop Area */}
                        <div className="p-4 flex justify-center bg-gray-100 max-h-[60vh] overflow-auto">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                aspect={aspectRatio}
                                circularCrop
                            >
                                <img
                                    ref={imgRef}
                                    src={imageSrc}
                                    alt="Upload"
                                    onLoad={onImageLoad}
                                    style={{ maxHeight: "50vh", maxWidth: "100%" }}
                                />
                            </ReactCrop>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t flex justify-between items-center">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <RotateCcw size={18} />
                                รีเซ็ต
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleCropComplete}
                                    disabled={isUploading}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--royal-blue-dark)] font-medium rounded-lg hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            กำลังอัพโหลด...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            ใช้รูปนี้
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
