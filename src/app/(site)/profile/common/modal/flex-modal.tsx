import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import CommonModal from "@/components/modals";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/AuthProvider";
import { createSnapshotAndShare } from "@/utils/flexSnapshot";
// import { getShareUrl } from "@/utils/flexSnapshot";

type FlexModalProps = {
  onClose: () => void;
  image: string;
  type: "flex9" | "flex10" | "flex11" | "flex12" | "flex13" | "flex14" | "flex15";
  isLoading: boolean;
};

const FlexModal: React.FC<FlexModalProps> = ({
  onClose,
  image,
  type,
  isLoading,
}) => {
  const { dbUser } = useAuthContext();
  // const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Reset image loading state when image changes
  useEffect(() => {
    if (image && image !== "loading") {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [image]);

  // Extract snapshot ID from image URL if it's an OG image
  const getSnapshotIdFromImage = () => {
    if (image.includes('/api/og/flex?snapshotId=')) {
      return image.split('snapshotId=')[1];
    }
    return null;
  };

  const handleShareToSocial = async () => {
    if (!dbUser?.id || isSharing) return;
    
    setIsSharing(true);
    
    try {
      // Check if we have an existing snapshot ID from the image URL
      const snapshotId = getSnapshotIdFromImage();
      
      if (snapshotId) {
        // Use existing snapshot - construct share URL and open Twitter
        const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/share/flex/${snapshotId}`;
        const twitterText = encodeURIComponent(
          `Check out my latest belief on @CallMyBluff_io`
        );
        const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, "_blank");
      } else {
        // Fallback: create new snapshot (for non-OG images)
        await createSnapshotAndShare(type, dbUser.username || undefined);
      }
    } catch (error) {
      console.error('❌ Error sharing to social:', error);
      // Fallback: could show a toast notification here
    } finally {
      setIsSharing(false);
    }
  };

  // const handleCopyLink = async () => {
  //   try {
  //     const snapshotId = getSnapshotIdFromImage();
  //     if (snapshotId) {
  //       const url = getShareUrl(snapshotId);
  //       await navigator.clipboard.writeText(url);
  //       setCopied(true);
  //       setTimeout(() => setCopied(false), 2000);
  //     } else {
  //       // Fallback: copy the image URL
  //       await navigator.clipboard.writeText(image);
  //       setCopied(true);
  //       setTimeout(() => setCopied(false), 2000);
  //     }
  //   } catch (error) {
  //     console.error('Failed to copy link:', error);
  //   }
  // };

  return (
    <CommonModal
      onClose={() => {
        if (!isLoading) {
          onClose();
        }
      }}
      className="w-[440px] max-w-[calc(100vw-2rem)]"
    >
      <div className="relative flex flex-col items-center z-10">
        <div className="flex items-center gap-2">
          <h1 className=" text-2xl font-semibold text-[#F2F2FD]">Flex Card</h1>
          {process.env.NODE_ENV === 'development' && (
            <span className="px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded">
              {type.toUpperCase()}
            </span>
          )}
        </div>
        <p className=" text-[#FFFFFFA3] text-sm font-normal text-center">
          Flex your stats and share it with the community!
        </p>

        <div className="relative w-[400px] max-w-[calc(100vw-4rem)] h-[200px] rounded-[16px] overflow-hidden my-4 bg-[#070708] mx-4 sm:mx-0">
          {/* Loader - shows while loading or until image is loaded */}
          {(isLoading || !imageLoaded) && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse" />
          )}
          
          {/* Image - directly in container */}
          {image && image !== "loading" && (
            <Image
              src={image}
              alt="flex"
              width={400}
              height={200}
              className={cn(
                "w-full h-full object-contain transition-opacity duration-200",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        
        {/* Hidden image to preload and detect when OG image is ready */}
        {image && image !== "loading" && !imageLoaded && !imageError && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            style={{ display: 'none' }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        <div className=" flex flex-col w-full gap-2">
          <button
            onClick={handleShareToSocial}
            className={cn(
              "justify-center  text-sm h-[46px] w-full flex items-center py-2 rounded-full bg-white text-black font-medium hover:bg-opacity-90 transition-colors",
              isLoading || !imageLoaded || !dbUser?.id || isSharing ? "!cursor-not-allowed opacity-70" : "pointer"
            )}
            disabled={isLoading || !imageLoaded || !dbUser?.id || isSharing}
          >
            {isSharing ? 'Preparing...' : 'Share on'}
            <Image
              src="/icon-X.png"
              alt="Twitter"
              width={34}
              height={34}
              className={cn(
                "border border-[#FFFFFF52] rounded-full p-2 w-9 h-9",
                isLoading || !dbUser?.id ? "!cursor-not-allowed opacity-70" : "pointer"
              )}
            />
          </button>

          {/* <button
            className={cn(
              "gap-2 justify-center  text-sm h-[46px] w-full flex items-center py-2 rounded-full bg-transparent text-white border border-[#FFFFFF52] font-medium hover:bg-opacity-90 transition-colors",
              isLoading || !imageLoaded ? "!cursor-not-allowed" : "pointer"
            )}
            onClick={handleCopyLink}
            disabled={isLoading || !imageLoaded}
          >
            {copied ? (
              <>
                Copied! <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                Copy link <Copy className="w-5 h-5" />
              </>
            )}
          </button> */}

          <button
            className={cn(
              "gap-2 justify-center  text-sm h-[46px] w-full flex items-center py-2 rounded-full bg-transparent text-white border border-[#FFFFFF52] font-medium hover:bg-opacity-90 transition-colors",
              isLoading || !imageLoaded ? "!cursor-not-allowed" : "pointer"
            )}
            onClick={() => {
              if (isLoading || !imageLoaded) return;
              // For server-side generated images, we can download directly
              const link = document.createElement('a');
              link.href = image;
              link.download = `flex-card-${type}-${new Date().toISOString()}.jpg`;
              link.click();
            }}
            disabled={isLoading || !imageLoaded}
          >
            Download image{" "}
            <Download
              className={cn(
                "w-5 h-5",
                isLoading ? "!cursor-not-allowed" : "pointer"
              )}
            />
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default FlexModal;
