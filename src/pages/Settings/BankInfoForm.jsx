import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBankInfo, updateBankInfo } from "../../api/bankInfo";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

const BankInfoForm = ({ isOpen, onClose, bankInfo }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    currency: "USD",
  });

  useEffect(() => {
    if (bankInfo) {
      setFormData({
        bankName: bankInfo.bankName,
        accountTitle: bankInfo.accountTitle,
        accountNumber: bankInfo.accountNumber,
        currency: bankInfo.currency,
      });
    } else {
      setFormData({
        bankName: "",
        accountTitle: "",
        accountNumber: "",
        currency: "USD",
      });
    }
  }, [bankInfo]);

  const mutation = useMutation({
    mutationFn: (data) => {
      return bankInfo
        ? updateBankInfo(bankInfo._id, data)
        : createBankInfo(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bankInfos"]);
      toast.success(
        `Bank info ${bankInfo ? "updated" : "created"} successfully`,
      );
      onClose();
    },
    onError: () => toast.error("Something went wrong"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bankInfo ? "Edit Bank Account" : "Add New Bank Account"}
      description="Add your payment receiving account details."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Bank Name
          </label>
          <Input
            value={formData.bankName}
            onChange={(e) =>
              setFormData({ ...formData, bankName: e.target.value })
            }
            required
            placeholder="e.g. Chase Bank"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Account Title
          </label>
          <Input
            value={formData.accountTitle}
            onChange={(e) =>
              setFormData({ ...formData, accountTitle: e.target.value })
            }
            required
            placeholder="e.g. Acme Corp Inc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Account Number / IBAN
          </label>
          <Input
            value={formData.accountNumber}
            onChange={(e) =>
              setFormData({ ...formData, accountNumber: e.target.value })
            }
            required
            placeholder="IBAN or Account Number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Currency
          </label>
          <div className="relative">
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 appearance-none"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="PKR">PKR - Pakistani Rupee</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BankInfoForm;
