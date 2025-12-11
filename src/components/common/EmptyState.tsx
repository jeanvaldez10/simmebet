import { AiOutlineHeart } from "react-icons/ai";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
}

const EmptyState = ({
  icon = <AiOutlineHeart className="w-8 h-8 text-gray-400" />,
  title,
  description,
  actionLabel,
  actionLink,
}: EmptyStateProps) => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-[#1F1F3A] flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#F2F2FD] mb-2">{title}</h3>
      <p className="text-[#F2F2FD] opacity-60 text-center max-w-md mb-8">
        {description}
      </p>
      {actionLabel && actionLink && (
        <Button variant="ghost" onClick={() => router.push(actionLink)}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
