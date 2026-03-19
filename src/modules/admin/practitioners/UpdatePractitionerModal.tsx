import { useState, useEffect } from "react";
import { X, Loader2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useUpdateUserCredentials,
  useToggleUserStatus,
} from "@/hooks/useUsers";
import { toast } from "react-toastify";

interface UpdatePractitionerModalProps {
  isOpen: boolean;
  onClose: () => void;
  practitioner: any;
  onUpdateSuccess?: () => void;
}

export const UpdatePractitionerModal = ({
  isOpen,
  onClose,
  practitioner,
  onUpdateSuccess,
}: UpdatePractitionerModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  const updateMutation = useUpdateUserCredentials();
  const toggleStatusMutation = useToggleUserStatus();

  useEffect(() => {
    if (practitioner && isOpen) {
      setName(practitioner.name || "");
      setEmail(practitioner.email || "");
      setPassword("");
      setShowPasswordField(false);
    }
  }, [practitioner, isOpen]);

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
    if (showPasswordField && password && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
        role: "practitioner",
      };

      if (showPasswordField && password) {
        updateData.password = password;
      }

      await updateMutation.mutateAsync({
        userId: practitioner._id,
        data: updateData,
      });

      toast.success("Practitioner updated successfully!");
      onUpdateSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update practitioner");
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleStatusMutation.mutateAsync({
        userId: practitioner._id,
        active: !practitioner.active,
      });

      const status = !practitioner.active ? "enabled" : "disabled";
      toast.success(`Practitioner ${status} successfully!`);
      onUpdateSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle practitioner status");
    }
  };

  if (!isOpen || !practitioner) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-2">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-semibold text-secondary text-xl">
            Edit Practitioner
          </h2>
          <button
            onClick={onClose}
            className="bg-primary/10 p-2 rounded-full text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6 max-h-[70vh] overflow-y-auto"
        >
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

          {/* Password Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPasswordField}
                onChange={(e) => setShowPasswordField(e.target.checked)}
                className="border-border/50 rounded w-4 h-4 text-primary"
              />
              <span className="font-medium text-secondary text-sm">
                Change Password
              </span>
            </label>
          </div>

          {/* Password (conditionally shown) */}
          {showPasswordField && (
            <div>
              <label className="block mb-1 font-medium text-secondary text-sm">
                New Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full"
              />
              <p className="mt-1 text-gray-500 text-xs">
                Leave empty to keep current password
              </p>
            </div>
          )}

          {/* Status */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-accent text-xs">Status</p>
            <div className="flex justify-between items-center mt-2">
              <p className="font-medium text-secondary text-sm">
                {practitioner.active ? (
                  <span className="text-ring">Active</span>
                ) : (
                  <span className="text-destructive">Disabled</span>
                )}
              </p>
              <Button
                type="button"
                onClick={handleToggleStatus}
                disabled={toggleStatusMutation.isPending}
                className={`h-8 px-3 text-xs ${
                  practitioner.active
                    ? "bg-destructive/20 hover:bg-destructive/30 text-destructive"
                    : "bg-ring/20 hover:bg-ring/30 text-ring"
                }`}
              >
                {toggleStatusMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Power className="inline mr-1 w-3 h-3" />
                    {practitioner.active ? "Disable" : "Enable"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Created Date */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-accent text-xs">Created</p>
            <p className="font-medium text-secondary text-sm">
              {practitioner.createdAt
                ? new Date(practitioner.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </p>
          </div>

          {/* Updated Date */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-accent text-xs">Last Updated</p>
            <p className="font-medium text-secondary text-sm">
              {practitioner.updatedAt
                ? new Date(practitioner.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="link"
              type="button"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Practitioner"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
