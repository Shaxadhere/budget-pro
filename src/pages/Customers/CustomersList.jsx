import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, deleteCustomer } from "../../api/customers";
import { Loader2, Plus, Pencil, Trash2, Search, Users } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import CustomerForm from "./CustomerForm";
import EmptyState from "../../components/ui/EmptyState";
import toast from "react-hot-toast";

const CustomersList = () => {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["customers", { search }],
    queryFn: () => getCustomers({ search }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      toast.success("Customer deleted successfully");
    },
    onError: () => toast.error("Failed to delete customer"),
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const customers = data?.data?.docs || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage your valuable clients</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="max-w-md">
            <Input
              placeholder="Search customers..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading || customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center cursor-wait">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
                        <p className="text-slate-500 font-medium">
                          Loading customers...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4">{customer.email}</td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No customers found"
            description={
              search
                ? "Try adjusting your search"
                : "Add your first customer to get started"
            }
            action={
              !search && (
                <Button onClick={handleAddNew} size="sm" className="mt-4">
                  Add Customer
                </Button>
              )
            }
          />
        )}
      </div>

      {isFormOpen && (
        <CustomerForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
};

export default CustomersList;
