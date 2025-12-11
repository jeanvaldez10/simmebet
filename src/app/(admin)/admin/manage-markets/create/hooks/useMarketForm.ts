import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { uploadAdminFile } from "@/utils/blob";
import { AdminMarketService } from "@/services/adminMarketService";
import {
  AdminCategoryService,
  AdminCategory,
} from "@/services/adminCategoryService";
import { CreateMarketRequest } from "@/services/api/marketCreationService";
import { Market, MarketFormData } from "../types";
import {
  getDefaultMarketData,
  getDefaultFormData,
  getTestMarketData,
  getTestRulesText,
  getTestDate,
} from "../utils";

export const useMarketForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const marketId = searchParams.get("id");
  const isEditing = !!marketId;

  // Form state
  const [formData, setFormData] = useState<Market>(getDefaultMarketData());
  const [marketFormData, setMarketFormData] = useState<MarketFormData>(
    getDefaultFormData()
  );
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [rulesText, setRulesText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedSquareFile, setUploadedSquareFile] = useState<File | null>(
    null
  );
  const [uploadedSocialFile, setUploadedSocialFile] = useState<File | null>(
    null
  );
  const [uploadedYesIconFile, setUploadedYesIconFile] = useState<File | null>(
    null
  );
  const [uploadedNoIconFile, setUploadedNoIconFile] = useState<File | null>(
    null
  );
  const [useFileUpload, setUseFileUpload] = useState(true);
  const [useSquareFileUpload, setUseSquareFileUpload] = useState(true);
  const [useSocialFileUpload, setUseSocialFileUpload] = useState(true);
  const [useYesIconUpload, setUseYesIconUpload] = useState(true);
  const [useNoIconUpload, setUseNoIconUpload] = useState(true);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [isUploading] = useState(false);
  const [isUploadingYesIcon] = useState(false);
  const [isUploadingNoIcon] = useState(false);

  const loadMarketData = useCallback(async (id: string) => {
    setIsLoadingData(true);
    try {
      const market = await AdminMarketService.getMarket(id);

      const marketFormData: Market = {
        id: market.id,
        contractAddress: market.contractAddress,
        poolAddress: market.poolAddress,
        blockchain: market.blockchain,
        status: market.status,
        name: market.name,
        question: market.question,
        date: market.date,
        image: market.image,
        imageSquare: market.imageSquare,
        socialImage: market.socialImage,
        volume: market.volume,
        createdBy: market.createdBy,
        rules: market.rules,
        yesPrice: market.yesPrice,
        noPrice: market.noPrice,
        totalLiquidity: market.totalLiquidity,
        yesTokenAddress: market.yesTokenAddress,
        yesIcon: market.yesIcon,
        noTokenAddress: market.noTokenAddress,
        noIcon: market.noIcon,
        currentRatio: market.currentRatio,
        oracleMarketId: market.oracleMarketId,
        oracleType: market.oracleType,
        tieIsPossible: market.tieIsPossible,
        noSideIcon: market.noSideIcon,
        noSideName: market.noSideName || "No",
        noSideSymbol: market.noSideSymbol || "",
        yesSideIcon: market.yesSideIcon,
        yesSideName: market.yesSideName || "Yes",
        yesSideSymbol: market.yesSideSymbol || "",
        creatorAvatar: market.creatorAvatar,
        creatorName: market.creatorName,
        resolutionEvidence: market.resolutionEvidence,
        categoryIds: market.categories?.map((cat) => cat.id) || [],
        categories: market.categories || [],
        createdAt: market.createdAt,
        updatedAt: market.updatedAt,
      };

      setFormData(marketFormData);
      setRulesText(market.rules.join("\n"));

      // Sync currentRatio with initialOdds in marketFormData
      setMarketFormData((prev) => ({
        ...prev,
        initialOdds: market.currentRatio
          ? parseFloat(market.currentRatio.toString())
          : 50,
      }));

      // Set the selected date immediately
      if (market.date) {
        // Parse the full date string including time
        const date = new Date(market.date);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      } else if (marketFormData.date) {
        // Parse the full date string including time
        const date = new Date(marketFormData.date);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      }
    } catch (error) {
      console.error("Error loading market data:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load market data"
      );
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await AdminCategoryService.getCategories();
      setCategories(categoriesData.filter((cat) => cat.isActive));
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  const handleFileUpload = async (file: File, fileName: string) => {
    const fileExtension = file.name.split(".").pop();
    const finalFileName = `${fileName}-${Date.now()}.${fileExtension}`;
    return await uploadAdminFile(finalFileName, file);
  };

  const handleYesIconUpload = async (file: File) => {
    try {
      const uploadedUrl = await handleFileUpload(file, "yes-icon");
      setFormData({ ...formData, yesSideIcon: uploadedUrl.url });
      return uploadedUrl.url;
    } catch (error) {
      console.error("Yes icon upload failed:", error);
      throw error;
    }
  };

  const handleNoIconUpload = async (file: File) => {
    try {
      const uploadedUrl = await handleFileUpload(file, "no-icon");
      setFormData({ ...formData, noSideIcon: uploadedUrl.url });
      return uploadedUrl.url;
    } catch (error) {
      console.error("No icon upload failed:", error);
      throw error;
    }
  };

  const handleRegularImageUpload = async (file: File) => {
    try {
      const uploadedUrl = await handleFileUpload(file, "market");
      setFormData({ ...formData, image: uploadedUrl.url });
      return uploadedUrl.url;
    } catch (error) {
      console.error("Regular image upload failed:", error);
      throw error;
    }
  };

  const handleSquareImageUpload = async (file: File) => {
    try {
      const uploadedUrl = await handleFileUpload(file, "square-image");
      setFormData({ ...formData, imageSquare: uploadedUrl.url });
      return uploadedUrl.url;
    } catch (error) {
      console.error("Square image upload failed:", error);
      throw error;
    }
  };

  const handleSocialImageUpload = async (file: File) => {
    try {
      const uploadedUrl = await handleFileUpload(file, "social-image");
      setFormData({ ...formData, socialImage: uploadedUrl.url });
      return uploadedUrl.url;
    } catch (error) {
      console.error("Social image upload failed:", error);
      throw error;
    }
  };

  const fillTestData = () => {
    setFormData(getTestMarketData());
    setRulesText(getTestRulesText());
    setSelectedDate(getTestDate());
    setMarketFormData(getDefaultFormData());
    setUseFileUpload(false);
    setUploadedFile(null);
    setUseYesIconUpload(false);
    setUploadedYesIconFile(null);
    setUseNoIconUpload(false);
    setUploadedNoIconFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // All images and icons are now uploaded immediately when selected, so we can use the form data directly
      const finalImageSrc = formData.image;
      const finalSquareImageSrc = formData.imageSquare;
      const finalSocialImageSrc = formData.socialImage;
      const finalYesIconSrc = formData.yesSideIcon;
      const finalNoIconSrc = formData.noSideIcon;

      // Parse rules from textarea
      const rules = rulesText.split("\n").filter((rule) => rule.trim() !== "");
      const formattedDate = selectedDate
        ? selectedDate.toISOString() // Keep full datetime with timezone info
        : formData.date;

      let contractAddress = formData.contractAddress;
      let poolAddress = formData.poolAddress;

      if (!isEditing) {
        // Create market via external API
        try {
          toast.loading("Creating market contract...");

          const marketCreationRequest: CreateMarketRequest = {
            marketName: formData.name,
            additionalInfo: formData.question,
            outcomes: [
              {
                name: formData.noSideName,
                symbol: formData.noSideSymbol,
                icon: finalNoIconSrc || "",
              },
              {
                name: formData.yesSideName,
                symbol: formData.yesSideSymbol,
                icon: finalYesIconSrc || "",
              },
            ],
            collateralToken: marketFormData.collateralToken,
            collateralMultiplier: marketFormData.collateralMultiplier,
            oracle: marketFormData.oracle,
            oracleType: marketFormData.oracleType,
            creatorFeeBps: marketFormData.creatorFeeBps,
            poolFee: marketFormData.poolFee,
            liquidity: {
              initialOdds: marketFormData.initialOdds,
              tickSpacing: marketFormData.tickSpacing,
              initialLiquidity: marketFormData.initialLiquidity,
              minTick: marketFormData.minTick,
              maxTick: marketFormData.maxTick,
            },
            date: formattedDate || "",
            tieIsPossible: formData.tieIsPossible,
            categoryIds: formData.categoryIds || [],
            image: finalImageSrc || "",
            imageSquare: finalSquareImageSrc || "",
            socialImage: finalSocialImageSrc || "",
            rules: rules,
          };

          const marketCreationResponse = await fetch(
            "/api/admin/markets/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(marketCreationRequest),
            }
          );

          if (!marketCreationResponse.ok) {
            const errorData = await marketCreationResponse.json();
            throw new Error(errorData.error || "Failed to create market");
          }

          const marketCreationData = await marketCreationResponse.json();

          // Extract addresses from response
          contractAddress = marketCreationData.marketAddress;
          poolAddress = marketCreationData.poolKey;
          formData.yesTokenAddress = marketCreationData.yesTokenAddress;
          formData.noTokenAddress = marketCreationData.noTokenAddress;
          formData.oracleMarketId = marketCreationData.oracleMarketId;

          // Update form data with uploaded URLs
          formData.yesSideIcon = finalYesIconSrc;
          formData.noSideIcon = finalNoIconSrc;
          formData.image = finalImageSrc;

          toast.dismiss();
          toast.success("Market contract created successfully!");

          router.push("/admin/manage-markets");
          setIsLoading(false);
          return;
        } catch (contractError) {
          console.error("Market creation failed:", contractError);
          toast.dismiss();
          toast.error("Failed to create market contract");
          return;
        }
      }

      const submitData = {
        contractAddress,
        poolAddress,
        blockchain: formData.blockchain,
        status: formData.status,
        name: formData.name,
        question: formData.question,
        date: formattedDate || null,
        image: finalImageSrc || null,
        imageSquare: finalSquareImageSrc || null,
        socialImage: finalSocialImageSrc || null,
        volume: formData.volume,
        createdBy: formData.createdBy,
        rules,
        yesPrice: formData.yesPrice,
        noPrice: formData.noPrice,
        totalLiquidity: formData.totalLiquidity,
        yesTokenAddress: formData.yesTokenAddress || null,
        yesIcon: formData.yesIcon || null,
        noTokenAddress: formData.noTokenAddress || null,
        noIcon: formData.noIcon || null,
        currentRatio: marketFormData.initialOdds || null,
        oracleMarketId: formData.oracleMarketId || null,
        oracleType: formData.oracleType || null,
        tieIsPossible: formData.tieIsPossible,
        noSideIcon: finalNoIconSrc || null,
        noSideName: formData.noSideName || null,
        noSideSymbol: formData.noSideSymbol || null,
        yesSideIcon: finalYesIconSrc || null,
        yesSideName: formData.yesSideName || null,
        yesSideSymbol: formData.yesSideSymbol || null,
        creatorAvatar: formData.creatorAvatar || null,
        creatorName: formData.creatorName || null,
        resolutionEvidence: formData.resolutionEvidence || null,
        orderIndex: 0,
        categoryIds: formData.categoryIds || [],
      };

      if (isEditing && marketId) {
        await AdminMarketService.updateMarket(marketId, submitData);
        toast.success("Market updated successfully");
      } else {
        await AdminMarketService.createMarket(submitData);
        toast.success("Market created successfully");
      }

      router.push("/admin/manage-markets");
    } catch (error) {
      console.error("Error saving market:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save market"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/manage-markets");
  };

  const handleResolveMarket = async () => {
    if (!marketId) return;

    try {
      // Update market status to resolved
      await AdminMarketService.updateMarket(marketId, {
        ...formData,
        status: "RESOLVED",
        resolvedTime: new Date().toISOString(),
      });

      // Update local form data
      setFormData({
        ...formData,
        status: "RESOLVED",
        resolvedTime: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error resolving market:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (isEditing && marketId) {
      loadMarketData(marketId);
    }
    loadCategories();
  }, [isEditing, marketId, loadMarketData, loadCategories]);

  // Sync selectedDate with formData.date
  useEffect(() => {
    if (formData.date) {
      // Parse the full date string including time
      const date = new Date(formData.date);
      if (!isNaN(date.getTime())) {
        // Only update if the date is different to avoid infinite loops
        if (!selectedDate || selectedDate.getTime() !== date.getTime()) {
          setSelectedDate(date);
        }
      }
    }
  }, [formData.date, selectedDate]);

  return {
    // State
    formData,
    setFormData,
    marketFormData,
    setMarketFormData,
    categories,
    rulesText,
    setRulesText,
    selectedDate,
    setSelectedDate,
    datePickerOpen,
    setDatePickerOpen,
    uploadedFile,
    setUploadedFile,
    uploadedSquareFile,
    setUploadedSquareFile,
    uploadedSocialFile,
    setUploadedSocialFile,
    uploadedYesIconFile,
    setUploadedYesIconFile,
    uploadedNoIconFile,
    setUploadedNoIconFile,
    useFileUpload,
    setUseFileUpload,
    useSquareFileUpload,
    setUseSquareFileUpload,
    useSocialFileUpload,
    setUseSocialFileUpload,
    useYesIconUpload,
    setUseYesIconUpload,
    useNoIconUpload,
    setUseNoIconUpload,
    isLoading,
    isLoadingData,
    isUploading,
    isUploadingYesIcon,
    isUploadingNoIcon,
    isEditing,
    marketId,

    // Actions
    handleSubmit,
    handleCancel,
    handleResolveMarket,
    fillTestData,
    handleFileUpload,
    handleRegularImageUpload,
    handleSquareImageUpload,
    handleSocialImageUpload,
    handleYesIconUpload,
    handleNoIconUpload,
  };
};
