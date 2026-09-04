// import BasicModal from "@/lib/modal";
import { Box, Button } from "@mui/material";
import type { DialogProps } from "@mui/material";

import { useCallback, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import BasicModal from "../../components/modal";

interface Props extends DialogProps {
  onClose: () => void;
  preview: any;
  handleCroppedFileChange: (file: any) => void;
}

const CropImageModal = ({
  onClose,
  preview,
  handleCroppedFileChange,
  ...props
}: Props) => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  // const [aspect, setAspect] = useState<number | undefined>(4 / 4);
  const aspect = 4 / 4;
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    function centerAspectCrop(
      mediaWidth: number,
      mediaHeight: number,
      aspect: number
    ) {
      return centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 30,
          },
          aspect,
          mediaWidth,
          mediaHeight
        ),
        mediaWidth,
        mediaHeight
      );
    }

    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const createFileFromCanvas = useCallback(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const canvas = previewCanvasRef.current;
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const pixelCrop = convertToPixelCrop(
      completedCrop,
      image.width,
      image.height
    );

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          console.error("Failed to create blob");
          return;
        }

        const file = new File([blob], `${Date.now()}.png`, {
          type: "image/png",
          lastModified: Date.now(),
        });
        // console.log(file);
        handleCroppedFileChange(file);
      },
      "image/png",
      1
    );
  }, [completedCrop, handleCroppedFileChange]);

  return (
    <Box>
      <BasicModal
        onClose={onClose}
        title="Crop Image"
        size={"xs"}
        content={
          !!preview && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              maxHeight={280}
              maxWidth={380}
            >
              {/* <Image
                ref={imgRef}
                alt="Crop me"
                src={preview}
                style={{ width: "400px", height: "300px" }}
                onLoad={onImageLoad}
              /> */}
              <img
                ref={imgRef}
                alt="Crop me"
                src={preview}
                style={{ width: 400, height: 300 }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          )
        }
        actions={
          <>
            <Button
              color="error"
              variant="outlined"
              onClick={onClose}
              sx={{ textTransform: "capitalize" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ textTransform: "capitalize" }}
              onClick={() => {
                createFileFromCanvas(); // Ensure cropping is finalized
                onClose(); // Optionally close the modal
              }}
            >
              Crop Image
            </Button>
          </>
        }
        {...props}
      />
      <div style={{ display: "block" }}>
        <canvas ref={previewCanvasRef} style={{ display: "none" }} />
      </div>
    </Box>
  );
};

export default CropImageModal;
