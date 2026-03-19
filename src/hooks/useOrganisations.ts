import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrganisation,
  getAllOrganisations,
  updateOrganisation,
  toggleOrganisationStatus,
} from "@/services/organisationService/organisationService";

export const organisationKeys = {
  all: ["organisations"] as const,
  list: () => [...organisationKeys.all, "list"] as const,
  listParams: (params: any) => [...organisationKeys.list(), params] as const,
  detail: (id: string) => [...organisationKeys.all, "detail", id] as const,
};

// Create organisation mutation (Admin only)
export const useCreateOrganisation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await createOrganisation(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organisationKeys.list() });
    },
  });
};

// Get all organisations (Admin only)
export const useAllOrganisations = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}) => {
  return useQuery({
    queryKey: organisationKeys.listParams(params),
    queryFn: async () => {
      const response = await getAllOrganisations(params || {});
      return response.data;
    },
  });
};

// Update organisation mutation (Admin only)
export const useUpdateOrganisation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, data }: { orgId: string; data: any }) => {
      const response = await updateOrganisation(orgId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organisationKeys.detail(variables.orgId),
      });
      queryClient.invalidateQueries({ queryKey: organisationKeys.list() });
    },
  });
};

// Toggle organisation status mutation (Admin only)
export const useToggleOrganisationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orgId,
      active,
    }: {
      orgId: string;
      active: boolean;
    }) => {
      const response = await toggleOrganisationStatus(orgId, { active });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organisationKeys.detail(variables.orgId),
      });
      queryClient.invalidateQueries({ queryKey: organisationKeys.list() });
    },
  });
};
