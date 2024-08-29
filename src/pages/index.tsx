import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useState, useRef, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [format, setFormat] = useState<string>("jpeg");
  const [quality, setQuality] = useState<number>(80);
  const [processedImage, setProcessedImage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  const sliderRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setOriginalImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!image) {
      setError("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("width", width.toString());
    formData.append("height", height.toString());
    formData.append("format", format);
    formData.append("quality", quality.toString());

    try {
      const response = await fetch("/api/image-processor", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const result = await response.json();
      setProcessedImage(result.image);
      setError(null);
    } catch (err) {
      setError("Error processing image");
      console.error(err);
    }
  };

  const handleSliderChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = sliderRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newPosition = (x / rect.width) * 100;
    setSliderPosition(newPosition);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setSliderPosition((x / rect.width) * 100);
      }
    };

    const sliderElement = sliderRef.current;
    if (sliderElement) {
      sliderElement.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (sliderElement) {
        sliderElement.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--clip-position",
      `${sliderPosition}%`
    );
  }, [sliderPosition]);

  return (
    <>
      <Head>
        <title>Image Processor</title>
        <meta name="description" content="Image processing app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <h1 className={styles.title}>Image Processor</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="file" className={styles.label}>
              Select Image:
            </label>
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>
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
          <button type="submit" className={styles.button}>
            Process Image
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        {processedImage && originalImageUrl && (
          <div className={styles.result}>
            <h2>Image Comparison:</h2>
            <div
              className={styles.comparisonSlider}
              ref={sliderRef}
              onClick={handleSliderChange}
            >
              <img
                src={originalImageUrl}
                alt="Original Image"
                className={styles.comparisonImage}
              />
              <img
                src={`/processed/${processedImage.filename}`}
                alt="Processed Image"
                className={styles.comparisonImage}
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
              Original Size: {(processedImage.originalSize / 1024).toFixed(2)}{" "}
              KB
            </p>
            <p>New Size: {(processedImage.newSize / 1024).toFixed(2)} KB</p>

            <p>
              Dimensions: {processedImage.width} x {processedImage.height}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
