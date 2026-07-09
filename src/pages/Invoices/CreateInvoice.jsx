import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createInvoice } from "../../api/invoices";
import { getCustomers } from "../../api/customers";
import { getBankInfos } from "../../api/bankInfo";
import { getCompanies } from "../../api/companies";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import CompanyForm from "../Settings/CompanyForm";
import CustomerForm from "../Customers/CustomerForm";
import BankInfoForm from "../Settings/BankInfoForm";
import {
  Plus,
  Trash2,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Building,
  Users,
  Building2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, title: "Company", icon: Building },
  { id: 2, title: "Customer", icon: Users },
  { id: 3, title: "Bank Info", icon: Building2 },
  { id: 4, title: "Invoice Details", icon: FileText },
];

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(0);

  // Modal states
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    invoiceDate: new Date().toISOString().split("T")[0],
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    companyName: "",
    companyTagline: "",
    currency: "USD",
    invoiceItems: [{ description: "", amount: 0 }],
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    contactPhone: "",
    contactEmail: "",
    contactWebsite: "",
  });

  // Selected IDs for dropdowns
  const [selectedIds, setSelectedIds] = useState({
    companyId: "",
    customerId: "",
    bankId: "",
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getCustomers({ size: 100 }),
  });

  const { data: bankInfosData } = useQuery({
    queryKey: ["bankInfos"],
    queryFn: () => getBankInfos(),
  });

  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getCompanies(),
  });

  const customers = customersData?.data?.docs || [];
  const bankInfos = bankInfosData?.data?.docs || [];
  const companies = companiesData?.data?.docs || [];

  // Options for Select components
  const companyOptions = companies.map((c) => ({
    label: c.companyName,
    value: c._id,
  }));
  const customerOptions = customers.map((c) => ({
    label: c.name,
    value: c._id,
  }));
  const bankOptions = bankInfos.map((b) => ({
    label: `${b.bankName} - ${b.currency}`,
    value: b._id,
  }));
  const currencyOptions = [
    { label: "USD - US Dollar", value: "USD" },
    { label: "EUR - Euro", value: "EUR" },
    { label: "GBP - British Pound", value: "GBP" },
    { label: "INR - Indian Rupee", value: "INR" },
    { label: "PKR - Pakistani Rupee", value: "PKR" },
  ];

  const handleCompanySelect = (e) => {
    const companyId = e.target.value;
    setSelectedIds((prev) => ({ ...prev, companyId }));

    const company = companies.find((c) => c._id === companyId);
    if (company) {
      setFormData((prev) => ({
        ...prev,
        companyName: company.companyName,
        companyTagline: company.companyTagline,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
        contactWebsite: company.contactWebsite,
      }));
    }
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    setSelectedIds((prev) => ({ ...prev, customerId }));

    const customer = customers.find((c) => c._id === customerId);
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        clientName: customer.name,
        clientEmail: customer.email,
        clientPhone: customer.phone,
        clientAddress: customer.address?.[0] || "",
      }));
    }
  };

  const handleBankSelect = (e) => {
    const bankId = e.target.value;
    setSelectedIds((prev) => ({ ...prev, bankId }));

    const bank = bankInfos.find((b) => b._id === bankId);
    if (bank) {
      setFormData((prev) => ({
        ...prev,
        bankName: bank.bankName,
        accountTitle: bank.accountTitle,
        accountNumber: bank.accountNumber,
        currency: bank.currency || "USD",
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.invoiceItems];
    newItems[index][field] =
      field === "amount" ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({ ...prev, invoiceItems: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      invoiceItems: [...prev.invoiceItems, { description: "", amount: 0 }],
    }));
  };

  const removeItem = (index) => {
    if (formData.invoiceItems.length > 1) {
      setFormData((prev) => ({
        ...prev,
        invoiceItems: prev.invoiceItems.filter((_, i) => i !== index),
      }));
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1: // Company
        if (!formData.companyName) return "Please select or add a company";
        return null;
      case 2: // Customer
        if (!formData.clientName) return "Please select or add a customer";
        return null;
      case 3: // Bank
        if (!formData.bankName) return "Please select or add bank details";
        return null;
      case 4: // Details
        if (formData.invoiceItems.some((item) => !item.description))
          return "All items must have a description";
        if (formData.invoiceItems.some((item) => item.amount <= 0))
          return "All items must have a valid amount";
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }

    setIsLoading(true);

    const payload = {
      ...formData,
      clientAddress: [formData.clientAddress],
      bankDetails: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountTitle: formData.accountTitle,
      },
    };

    try {
      const response = await createInvoice(payload);
      if (response.status) {
        toast.success(response.message || "Invoice created successfully");
        navigate("/");
      } else {
        toast.error(response.message || "Failed to create invoice");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = formData.invoiceItems.reduce(
    (acc, item) => acc + item.amount,
    0,
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-4 md:px-0">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div
            key={step.id}
            className="flex flex-col items-center relative z-10"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 
              ${
                isActive
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : isCompleted
                    ? "bg-indigo-100 border-indigo-600 text-indigo-600"
                    : "bg-white border-slate-200 text-slate-300"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>
            <span
              className={`text-xs font-medium mt-2 absolute -bottom-6 w-32 text-center transition-colors duration-300
              ${isActive || isCompleted ? "text-indigo-600" : "text-slate-300"}`}
            >
              {step.title}
            </span>
          </div>
        );
      })}
      {/* Progress Bar Background */}
      <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 z-0 hidden md:block" />
      {/* Active Progress Bar */}
      <div
        className="absolute top-5 left-0 h-0.5 bg-indigo-600 z-0 transition-all duration-300 hidden md:block"
        style={{
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
        }}
      />
    </div>
  );

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => (
      {
        x: direction < 0 ? 50 : -50,
        opacity: 0,
      },
      { position: "absolute" }
    ),
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[600px] flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          Create New Invoice
        </h1>
      </div>

      <div className="relative mb-12">
        {/* Step Indicator Wrapper for correct positioning */}
        <div className="relative">
          <StepIndicator />
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Select Company
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Choose the company profile issuing this invoice
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="flex-1 md:w-64">
                      <Select
                        options={companyOptions}
                        onChange={handleCompanySelect}
                        value={selectedIds.companyId}
                        placeholder="Select Company Profile"
                      />
                    </div>
                    <Button
                      onClick={() => setIsCompanyModalOpen(true)}
                      variant="outline"
                      className="px-3"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {formData.companyName ? (
                  <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600">
                        <Building className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900">
                          {formData.companyName}
                        </h3>
                        <p className="text-slate-600 italic">
                          {formData.companyTagline}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                          <span>{formData.contactEmail}</span>
                          <span>•</span>
                          <span>{formData.contactPhone}</span>
                          <span>•</span>
                          <span>{formData.contactWebsite}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Building className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      No company selected. Please select one from the list or
                      add a new one.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Customer Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Select Customer
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Who is this invoice for?
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="flex-1 md:w-64">
                      <Select
                        options={customerOptions}
                        onChange={handleCustomerSelect}
                        value={selectedIds.customerId}
                        placeholder="Select Customer"
                      />
                    </div>
                    <Button
                      onClick={() => setIsCustomerModalOpen(true)}
                      variant="outline"
                      className="px-3"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {formData.clientName ? (
                  <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600">
                        <Users className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900">
                          {formData.clientName}
                        </h3>
                        <div className="space-y-1 text-sm text-slate-600 mt-2">
                          <p>Email: {formData.clientEmail}</p>
                          <p>Phone: {formData.clientPhone}</p>
                          <p>Address: {formData.clientAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      No customer selected. Please select one from the list or
                      add a new one.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Bank Info */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Select Bank Account
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Where should the payment be sent?
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="flex-1 md:w-64">
                      <Select
                        options={bankOptions}
                        onChange={handleBankSelect}
                        value={selectedIds.bankId}
                        placeholder="Select Bank Account"
                      />
                    </div>
                    <Button
                      onClick={() => setIsBankModalOpen(true)}
                      variant="outline"
                      className="px-3"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {formData.bankName ? (
                  <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600">
                        <Building2 className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900">
                          {formData.bankName}
                        </h3>
                        <p className="text-sm text-slate-600 font-medium">
                          {formData.accountTitle}
                        </p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {formData.currency}
                        </div>
                        <p className="text-sm font-mono text-slate-600 mt-2">
                          {formData.accountNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      No bank account selected. Please select one from the list
                      or add a new one.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Invoice Details */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Invoice Details
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Add items and set dates.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Invoice Date
                    </label>
                    <Input
                      name="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Currency
                    </label>
                    <Select
                      options={currencyOptions}
                      value={formData.currency}
                      onChange={(e) =>
                        handleInputChange({
                          target: { name: "currency", value: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Items
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.invoiceItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg group"
                      >
                        <Input
                          placeholder="Description (e.g. Web Development)"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          required
                          className="flex-1 bg-white"
                        />
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.amount}
                          onChange={(e) =>
                            handleItemChange(index, "amount", e.target.value)
                          }
                          required
                          className="w-32 bg-white"
                          min="0"
                          step="0.01"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={formData.invoiceItems.length === 1}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-lg">
                      <span className="text-slate-400 mr-4 font-medium">
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold">
                        {formData.currency} {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          onClick={prevStep}
          variant="outline"
          disabled={currentStep === 1}
          className={`gap-2 ${currentStep === 1 ? "opacity-0 pointer-events-none" : ""}`}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        {currentStep < 4 ? (
          <Button onClick={nextStep} className="gap-2 min-w-[120px]">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2 min-w-[140px] bg-green-600 hover:bg-green-700 text-white ring-green-200"
          >
            {isLoading ? "Creating..." : "Create Invoice"}
            {!isLoading && <CheckCircle2 className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Modals */}
      <CompanyForm
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
      />
      <CustomerForm
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />
      <BankInfoForm
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
      />
    </div>
  );
};

export default CreateInvoice;
