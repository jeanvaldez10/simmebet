"use client";

import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Market } from "../types";

interface ResolutionEvidenceFormProps {
  formData: Market;
  setFormData: (data: Market) => void;
}

export const ResolutionEvidenceForm: React.FC<ResolutionEvidenceFormProps> = ({
  formData,
  setFormData,
}) => {
  // Only show if market is resolved
  if (formData.status !== "RESOLVED") {
    return null;
  }

  return (
    <div className="grid gap-4">
      <h3 className="text-lg font-semibold">Resolution Evidence</h3>
      <div className="grid gap-2">
        <Label htmlFor="resolutionEvidence">
          Evidence or sources that support the resolution
        </Label>
        <RichTextEditor
          content={formData.resolutionEvidence || ""}
          onChange={(content) =>
            setFormData({ ...formData, resolutionEvidence: content })
          }
          placeholder="Add evidence, links to news articles, official statements, or other sources that support this market's resolution..."
        />
        <p className="text-xs text-gray-500">
          This evidence will be displayed on the market page to show users why the market was resolved this way. You can add links, formatting, and bullet points.
        </p>
      </div>
    </div>
  );
};

