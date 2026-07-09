import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompanies, deleteCompany } from "../../api/companies";
import { Loader2, Plus, Pencil, Trash2, Building } from "lucide-react";
import Button from "../../components/ui/Button";
import CompanyForm from "./CompanyForm";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const CompaniesList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompanies(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries(["companies"]);
      toast.success("Company deleted successfully");
    },
    onError: () => toast.error("Failed to delete company"),
  });

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this company profile?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const companies = data?.data?.docs || [];

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
          <p className="text-sm text-slate-500">
            Manage your company profiles for invoicing
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </div>

      {companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company._id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Building className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">
                      {company.companyName}
                    </h3>
                    <p className="text-xs text-slate-500 italic mt-1">
                      {company.companyTagline}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(company)}
                      className="text-slate-400 hover:text-indigo-600 p-1 bg-white/80 rounded"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(company._id)}
                      className="text-slate-400 hover:text-red-600 p-1 bg-white/80 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 w-16">
                      Email:
                    </span>
                    <span className="truncate flex-1">
                      {company.contactEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 w-16">
                      Phone:
                    </span>
                    <span className="truncate flex-1">
                      {company.contactPhone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 w-16">
                      Website:
                    </span>
                    <span className="truncate flex-1">
                      {company.contactWebsite}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building}
          title="No companies found"
          description="Add a company profile to start creating invoices"
          action={
            <Button onClick={handleAddNew} size="sm" className="mt-4">
              Add Company
            </Button>
          }
        />
      )}

      {isModalOpen && (
        <CompanyForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          company={selectedCompany}
        />
      )}
    </div>
  );
};

export default CompaniesList;
