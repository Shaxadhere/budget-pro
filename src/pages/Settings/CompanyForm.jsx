import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompany, updateCompany } from "../../api/companies";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

const CompanyForm = ({ isOpen, onClose, company }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    companyName: "",
    companyTagline: "",
    contactEmail: "",
    contactPhone: "",
    contactWebsite: "",
  });

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName,
        companyTagline: company.companyTagline,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
        contactWebsite: company.contactWebsite,
      });
    } else {
      setFormData({
        companyName: "",
        companyTagline: "",
        contactEmail: "",
        contactPhone: "",
        contactWebsite: "",
      });
    }
  }, [company]);

  const mutation = useMutation({
    mutationFn: (data) => {
      return company ? updateCompany(company._id, data) : createCompany(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["companies"]);
      toast.success(`Company ${company ? "updated" : "created"} successfully`);
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
      title={company ? "Edit Company Profile" : "Add New Company Profile"}
      description="Enter your company details to use in invoices."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Company Name
          </label>
          <Input
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            required
            placeholder="e.g. My Awesome Agency"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tagline
          </label>
          <Input
            value={formData.companyTagline}
            onChange={(e) =>
              setFormData({ ...formData, companyTagline: e.target.value })
            }
            required
            placeholder="e.g. Building the Future"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contact Email
          </label>
          <Input
            type="email"
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            required
            placeholder="billing@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contact Phone
          </label>
          <Input
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData({ ...formData, contactPhone: e.target.value })
            }
            required
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Website
          </label>
          <Input
            value={formData.contactWebsite}
            onChange={(e) =>
              setFormData({ ...formData, contactWebsite: e.target.value })
            }
            required
            placeholder="www.example.com"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompanyForm;
