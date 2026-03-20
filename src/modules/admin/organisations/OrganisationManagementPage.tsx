import { useState } from "react";
import { Search, ChevronDown, ChevronRight, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/Pagination";
import { useAllOrganisations } from "@/hooks/useOrganisations";
import { useDebounce } from "@/hooks/useDebounce";
import { CreateOrganisationModal } from "./CreateOrganisationModal";
import { UpdateOrganisationModal } from "./UpdateOrganisationModal";

export const OrganisationManagementPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState<any>(null);

  const itemsPerPage = 10;

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data, isLoading, isError, error, refetch } = useAllOrganisations({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchQuery || undefined,
    active: statusFilter === "" ? undefined : statusFilter === "active",
  });

  const organisations = data?.organisations || data?.users || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleOrganisationClick = (org: any) => {
    setSelectedOrganisation(org);
    setIsUpdateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleUpdateSuccess = () => {
    setIsUpdateModalOpen(false);
    setSelectedOrganisation(null);
    refetch();
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex sm:flex-row flex-col sm:justify-between items-center gap-4">
        <div>
          <h1 className="font-medium text-secondary text-lg sm:text-xl">
            Organisation Management
          </h1>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/80 rounded-lg w-full sm:w-auto text-white"
        >
          <Plus className="w-4 h-4" /> Add Organisation
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-10">
          <Search className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search organisations by name or email..."
            className="py-2.5 pl-10 h-auto"
          />
        </div>

        {/* Status Filter */}
        <div className="relative sm:col-span-1 lg:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 border border-border focus:border-blue-500 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 w-full text-gray-700 text-sm appearance-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Disabled</option>
          </select>
          <ChevronDown className="top-1/2 right-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-2 text-accent">Loading organisations...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="p-6 text-center">
          <p className="text-red-600">
            Error loading organisations:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </Card>
      )}

      {/* Organisations List */}
      {!isLoading && !isError && (
        <div className="space-y-3 bg-primary/5 p-3 rounded-lg">
          {organisations.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-accent">No organisations found</p>
            </Card>
          ) : (
            <>
              {organisations.map((org: any) => (
                <Card
                  key={org._id}
                  onClick={() => handleOrganisationClick(org)}
                  className="hover:shadow-md p-4 sm:p-5 transition-shadow cursor-pointer"
                >
                  <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-3 sm:gap-4">
                    {/* Left Side - Org Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-secondary text-xl">
                          {org.organisationName || org.name}
                        </h3>
                        <span className="bg-orange-100 px-2.5 py-1 rounded-full font-medium text-orange-700 text-xs">
                          organisation
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            org.active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {org.active ? "Active" : "Disabled"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-accent text-sm">
                        {org.name && org.organisationName && (
                          <>
                            <span>Admin: {org.name}</span>
                            <span className="hidden sm:inline text-primary/50">
                              •
                            </span>
                          </>
                        )}
                        <span>Email: {org?.createdBy?.email}</span>
                        <span className="hidden sm:inline text-primary/50">
                          •
                        </span>
                        <span>
                          Created:{" "}
                          {org.createdAt
                            ? new Date(org.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "N/A"}
                        </span>
                        <span className="hidden sm:inline text-primary/50">
                          •
                        </span>
                        <span>
                          Updated:{" "}
                          {org.updatedAt
                            ? new Date(org.updatedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Right Side - Arrow */}
                    <div className="self-start sm:self-center sm:shrink-0">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Card>
              ))}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      )}

      {/* Create Organisation Modal */}
      <CreateOrganisationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleCreateSuccess}
      />

      {/* Update Organisation Modal */}
      <UpdateOrganisationModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedOrganisation(null);
        }}
        organisation={selectedOrganisation}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};
