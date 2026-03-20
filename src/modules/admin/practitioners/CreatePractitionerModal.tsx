import { useState } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateUserByAdmin } from "@/hooks/useUsers";
import { useAllOrganisations } from "@/hooks/useOrganisations";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "react-toastify";

interface CreatePractitionerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: () => void;
}

export const CreatePractitionerModal = ({
  isOpen,
  onClose,
  onCreateSuccess,
}: CreatePractitionerModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organisationId, setOrganisationId] = useState("");

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const createUserMutation = useCreateUserByAdmin();
  const { data: orgData, isLoading: loadingOrgs } = useAllOrganisations({
    limit: 100,
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setOrganisationId("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (isAdmin && !organisationId) {
      toast.error("Please select an organisation");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password,
        role: "practitioner",
        organisationId: isAdmin ? organisationId : user?._id,
      });

      toast.success("Practitioner created successfully!");
      resetForm();
      onCreateSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create practitioner");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-2">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-semibold text-secondary text-xl">
            Add New Practitioner
          </h2>
          <button
            onClick={handleClose}
            className="bg-primary/10 p-2 rounded-full text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium text-secondary text-sm">
              Full Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-secondary text-sm">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-secondary text-sm">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 6 characters)"
              className="w-full"
            />
          </div>

          {/* Organisation (admin only) */}
          {isAdmin && (
            <div>
              <label className="block mb-1 font-medium text-secondary text-sm">
                Organisation
              </label>
              <div className="relative">
                <select
                  value={organisationId}
                  onChange={(e) => setOrganisationId(e.target.value)}
                  disabled={loadingOrgs}
                  className="px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 w-full appearance-none"
                >
                  <option value="">
                    {loadingOrgs
                      ? "Loading organisations..."
                      : "Select organisation"}
                  </option>
                  {(orgData?.organisations || orgData?.users || []).map(
                    (org: any) => (
                      <option key={org._id} value={org._id}>
                        {org.organisationName || org.name}
                      </option>
                    ),
                  )}
                </select>
                <ChevronDown className="top-1/2 right-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Practitioner"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
