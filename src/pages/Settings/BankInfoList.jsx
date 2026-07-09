import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBankInfos, deleteBankInfo } from "../../api/bankInfo";
import { Loader2, Plus, Pencil, Trash2, Building2 } from "lucide-react";
import Button from "../../components/ui/Button";
import BankInfoForm from "./BankInfoForm";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const BankInfoList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["bankInfos"],
    queryFn: () => getBankInfos(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBankInfo,
    onSuccess: () => {
      queryClient.invalidateQueries(["bankInfos"]);
      toast.success("Bank info deleted successfully");
    },
    onError: () => toast.error("Failed to delete bank info"),
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bank account?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (bank) => {
    setSelectedBank(bank);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedBank(null);
    setIsModalOpen(true);
  };

  const bankInfos = data?.data?.docs || [];

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bank Accounts</h1>
          <p className="text-sm text-slate-500">
            Manage your payment receiving accounts
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add Account
        </Button>
      </div>

      {bankInfos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankInfos.map((bank) => (
            <div
              key={bank._id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(bank)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(bank._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-1">
                {bank.bankName}
              </h3>
              <p className="text-sm text-slate-500 mb-4 font-mono bg-slate-50 inline-block px-2 py-1 rounded">
                {bank.accountNumber}
              </p>

              <div className="space-y-1 text-sm">
                <p className="text-slate-600">
                  <span className="font-medium text-slate-900">Title:</span>{" "}
                  {bank.accountTitle}
                </p>
                <p className="text-slate-600">
                  <span className="font-medium text-slate-900">Currency:</span>{" "}
                  {bank.currency || "USD"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No bank accounts"
          description="Add a bank account to start receiving payments"
          action={
            <Button onClick={handleAddNew} size="sm" className="mt-4">
              Add Bank Account
            </Button>
          }
        />
      )}

      {isModalOpen && (
        <BankInfoForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          bankInfo={selectedBank}
        />
      )}
    </div>
  );
};

export default BankInfoList;
