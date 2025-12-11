import React from "react";
import CommonModal from "../modals";
import Button from "../Button";
import { Checkbox } from "../ui/checkbox";

const ExportPrivateKey = ({
  onClose,
  onExportPrivateKey,
}: {
  onClose: () => void;
  onExportPrivateKey: () => void;
}) => {
  const [checked, setChecked] = React.useState(false);

  return (
    <CommonModal onClose={onClose} className="!w-[364px]">
      <div>
        <h2 className="text-[#F2F2FD] text-2xl font-semibold">
          Export Private Key
        </h2>

        <div className=" mt-5 flex items-center justify-center gap-3 flex-col">
          <p className=" text-[#FFFFFFA3] text-sm">
            Anyone with access to your private key can control your wallet and
            assets. Only export it if absolutely necessary and in a secure
            environment.
          </p>

          <div className=" flex items-center gap-2">
            <Checkbox
              id="export-private-key-checkbox"
              checked={checked}
              onCheckedChange={(checked) => setChecked(checked as boolean)}
            />
            <label
              htmlFor="export-private-key-checkbox"
              className="ml-2 text-[#FFFFFFA3] text-sm"
            >
              I understand the risks
            </label>
          </div>
        </div>

        <Button
          variant={checked ? "primary" : "ghost"}
          className="w-full h-[46px] mt-5 !text-sm !font-semibold"
          onClick={onExportPrivateKey}
          disabled={!checked}
        >
          Export Private Key
        </Button>
      </div>
    </CommonModal>
  );
};

export default ExportPrivateKey;
