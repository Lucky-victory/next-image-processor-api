import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import { LuUpload } from "react-icons/lu";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [format, setFormat] = useState<string>("jpeg");
  const [quality, setQuality] = useState<number>(80);
  const [processedImages, setProcessedImages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedThumbnails, setProcessedThumbnails] = useState<string[]>([]);

  const sliderRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prevImages) => [...prevImages, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    multiple: true,
    maxFiles: 10,
  });

  const handleDownload = (filename: string) => {
    const link = document.createElement("a");
    link.href = `/processed/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (images.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image`, image);
    });
    formData.append("width", width.toString());
    formData.append("height", height.toString());
    formData.append("format", format);
    formData.append("quality", quality.toString());

    try {
      const response = await axios("/api/image-processor", {
        method: "POST",
        data: formData,
        onUploadProgress(progressEvent) {
          if (progressEvent.total !== undefined) {
            setUploadProgress(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
          }
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to process images");
      }

      setProcessedImages(response.data.images);
      setError(null);
    } catch (err) {
      setError("Error processing images");
      console.error(err);
    } finally {
      setIsProcessing(false);
      setUploadProgress(100);
    }
  };

  const handleSliderChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newPosition = (x / rect.width) * 100;
      setSliderPosition(newPosition);
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--clip-position",
      `${sliderPosition}%`
    );
  }, [sliderPosition]);

  return (
    <>
      <Head>
        <title>Image Processor | Compressor</title>
        <meta
          name="description"
          content="Compress your images without losing the quality"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.container}>
          <h1 className={styles.title}>Image Processor</h1>
          <div {...getRootProps()} className={styles.dropzone}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <>
                <p>
                  Drag &apos;n&apos; drop some files here, or click to select
                  files
                </p>

                <button className={styles.button}>
                  <LuUpload /> <span> Upload Image(s)</span>
                </button>
              </>
            )}
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="width" className={styles.label}>
                Width:
              </label>
              <input
                type="number"
                id="width"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="height" className={styles.label}>
                Height:
              </label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="format" className={styles.label}>
                Format:
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className={styles.select}
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="quality" className={styles.label}>
                Quality:
              </label>
              <input
                type="number"
                id="quality"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className={styles.input}
              />
            </div>
            <motion.button
              type="submit"
              className={styles.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <BeatLoader color="#ffffff" size={10} />
              ) : (
                "Compress Images"
              )}
            </motion.button>
          </form>
          {uploadProgress > 0 && (
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBar}
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          {error && <p className={styles.error}>{error}</p>}
          {images.length > 0 && (
            <div className={styles.thumbnailGrid}>
              {images.map((image, index) => (
                <div key={index} className={styles.thumbnailContainer}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Thumbnail ${index + 1}`}
                    className={styles.thumbnail}
                  />
                </div>
              ))}
            </div>
          )}
          {processedImages.length > 0 && (
            <div className={styles.processedImagesContainer}>
              <h2>Processed Images</h2>
              <Swiper
                spaceBetween={10}
                slidesPerView="auto"
                className={styles.swiper}
              >
                {processedImages.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className={styles.processedImageItem}>
                      <img
                        src={`/processed/${image.filename}`}
                        alt={`Processed ${index + 1}`}
                        className={styles.thumbnail}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                      <button
                        className={styles.downloadButton}
                        onClick={() => handleDownload(image.filename)}
                      >
                        Download
                      </button>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
          {processedImages.length > 0 &&
            currentImageIndex < processedImages.length && (
              <div className={styles.result}>
                <h2>Image Comparison:</h2>
                <div
                  className={styles.comparisonSlider}
                  ref={sliderRef}
                  onClick={handleSliderChange}
                >
                  <Image
                    src={URL.createObjectURL(images[currentImageIndex])}
                    alt="Original Image"
                    className={styles.comparisonImage}
                    width={500}
                    height={300}
                  />
                  <Image
                    src={`/processed/${processedImages[currentImageIndex].filename}`}
                    alt="Processed Image"
                    className={styles.comparisonImage}
                    width={500}
                    height={300}
                  />
                  <div
                    className={styles.sliderHandle}
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className={styles.sliderLine}></div>
                    <div className={styles.sliderCircle}></div>
                  </div>
                </div>
                <p>
                  Original Size:{" "}
                  {(
                    processedImages[currentImageIndex].originalSize / 1024
                  ).toFixed(2)}{" "}
                  KB
                </p>
                <p>
                  New Size:{" "}
                  {(processedImages[currentImageIndex].newSize / 1024).toFixed(
                    2
                  )}{" "}
                  KB
                </p>
                <p>
                  Dimensions: {processedImages[currentImageIndex].width} x{" "}
                  {processedImages[currentImageIndex].height}
                </p>
              </div>
            )}
        </div>
      </main>
    </>
  );
}
