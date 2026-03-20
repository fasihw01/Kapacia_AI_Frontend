import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface RecordHeaderProps {
  caseId: string;
  basePath?: string;
}

export const RecordHeader: React.FC<RecordHeaderProps> = ({
  caseId,
  basePath = "/practitioner/my-cases",
}) => {
  const navigate = useNavigate();
  const backPath = `${basePath}/${caseId}`;

  return (
    <div>
      <Link
        to={backPath}
        onClick={() => navigate(backPath)}
        className="flex items-center gap-2 mr-auto mb-4 text-accent hover:text-secondary transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">Back to Case</span>
      </Link>

      <h1 className="text-secondary text-lg sm:text-2xl">Record New Session</h1>
    </div>
  );
};
