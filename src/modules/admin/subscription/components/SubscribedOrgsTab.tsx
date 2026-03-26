import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "@/config/apiConfig";
import { Card } from "@/components/ui/card";
import { AlertCircle, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OrgItem {
  _id: string;
  name: string;
  email?: string;
  subscriptionStatus?: string;
  createdAt?: string;
}

interface OrgsResponse {
  organisations?: OrgItem[];
  data?: OrgItem[];
}

const getAuthHeader = () => ({
  "x-access-token": localStorage.getItem("auth_token") ?? "",
  "Content-Type": "application/json",
});

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  past_due: "bg-amber-100 text-amber-700",
  canceled: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-500",
};

export function SubscribedOrgsTab() {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery<OrgItem[]>({
    queryKey: ["admin", "subscribed-orgs"],
    queryFn: async () => {
      const res = await axios.get<OrgsResponse>(
        `${API_BASE_URL}/stripe/subscribed-organisations`,
        { headers: getAuthHeader() },
      );
      const list: OrgItem[] =
        res.data.organisations ?? (res.data.data as OrgItem[]) ?? (res.data as unknown as OrgItem[]) ?? [];
      return list;
    },
    staleTime: 2 * 60 * 1000,
  });

  const filtered = (data ?? []).filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto mb-2 w-7 h-7 text-red-400" />
        <p className="text-accent text-sm">Failed to load organisations.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search organisations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-full max-w-sm text-sm"
      />

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Building2 className="mx-auto mb-2 w-7 h-7 text-accent" />
          <p className="text-accent text-sm">No subscribed organisations found.</p>
        </Card>
      ) : (
        <Card className="border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-border/60">
              <tr>
                <th className="px-4 py-3 font-medium text-accent text-left">Organisation</th>
                <th className="px-4 py-3 font-medium text-accent text-left">Email</th>
                <th className="px-4 py-3 font-medium text-accent text-left">Status</th>
                <th className="px-4 py-3 font-medium text-accent text-left">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((org) => {
                const status = org.subscriptionStatus ?? "inactive";
                const badge = statusColors[status.toLowerCase()] ?? "bg-gray-100 text-gray-500";
                return (
                  <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex justify-center items-center bg-primary/10 rounded-full w-8 h-8 font-semibold text-primary text-sm shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-secondary">{org.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-accent">{org.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${badge}`}>
                        {status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-accent">
                      {org.createdAt
                        ? new Date(org.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
