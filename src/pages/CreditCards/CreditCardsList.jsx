import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCreditCards, createCreditCard, updateCreditCard, deleteCreditCard } from "../../api/creditCards";
import { CreditCard, Plus, Loader2, Trash2, Edit } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

export default function CreditCardsList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const defaultForm = {
    cardName: "",
    last4Digits: "",
    currency: "PKR",
    creditLimit: "",
    billingCycleDate: "",
    dueDate: "",
    notes: ""
  };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => { document.title = "Credit Cards | InvoicingPro"; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["creditCards"],
    queryFn: getCreditCards,
  });

  const cards = data || [];

  const createMutation = useMutation({
    mutationFn: createCreditCard,
    onSuccess: () => {
      queryClient.invalidateQueries(["creditCards"]);
      setIsModalOpen(false);
      toast.success("Credit Card added");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add card"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCreditCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["creditCards"]);
      setIsModalOpen(false);
      toast.success("Credit Card updated");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update card"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCreditCard,
    onSuccess: () => {
      queryClient.invalidateQueries(["creditCards"]);
      toast.success("Credit Card deleted");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete card"),
  });

  const openModal = (card = null) => {
    if (card) {
      setEditingCard(card);
      setForm({
        cardName: card.cardName,
        last4Digits: card.last4Digits || "",
        currency: card.currency,
        creditLimit: card.creditLimit,
        billingCycleDate: card.billingCycleDate,
        dueDate: card.dueDate,
        notes: card.notes || ""
      });
    } else {
      setEditingCard(null);
      setForm(defaultForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      creditLimit: Number(form.creditLimit),
      billingCycleDate: Number(form.billingCycleDate),
      dueDate: Number(form.dueDate)
    };

    if (editingCard) {
      updateMutation.mutate({ id: editingCard._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-indigo-600" />
            Credit Cards
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage cards, track limits, and log monthly bills.</p>
        </div>
        <Button onClick={() => openModal()} className="shadow-md shadow-indigo-500/20">
          <Plus className="h-4 w-4 mr-2" /> Add Credit Card
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Credit Cards</h3>
          <p className="text-slate-500 text-sm mb-4">Start tracking your credit cards and monthly bills.</p>
          <Button onClick={() => openModal()} variant="outline">Add First Card</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map(card => (
            <div key={card._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80" />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{card.cardName}</h3>
                  {card.last4Digits && (
                    <p className="text-xs text-slate-500 font-medium font-mono mt-0.5">•••• {card.last4Digits}</p>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(card)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => { if(window.confirm("Delete this card?")) deleteMutation.mutate(card._id); }} className="text-slate-400 hover:text-red-600 transition-colors p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Credit Limit</p>
                  <p className="text-base font-black text-slate-900">{card.currency} {card.creditLimit.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Dates</p>
                  <p className="text-xs font-semibold text-slate-700">Bill: {card.billingCycleDate}th</p>
                  <p className="text-xs font-semibold text-slate-700">Due: {card.dueDate}th</p>
                </div>
              </div>

              <Link to={`/credit-cards/${card._id}`} className="block w-full text-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-sm py-2.5 rounded-xl transition-colors">
                View Calendar & Bills →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCard ? "Edit Credit Card" : "Add Credit Card"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Card Name / Bank</label>
              <Input
                required
                value={form.cardName}
                onChange={(e) => set("cardName", e.target.value)}
                placeholder="e.g. Chase Sapphire, HBL Platinum"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last 4 Digits</label>
              <Input
                value={form.last4Digits}
                onChange={(e) => set("last4Digits", e.target.value)}
                placeholder="e.g. 1234"
                maxLength={4}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
              <Input
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                placeholder="e.g. PKR, USD"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Credit Limit</label>
              <Input
                required
                type="number"
                value={form.creditLimit}
                onChange={(e) => set("creditLimit", e.target.value)}
                placeholder="e.g. 500000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Date (Day)</label>
              <Input
                required
                type="number"
                min="1" max="31"
                value={form.billingCycleDate}
                onChange={(e) => set("billingCycleDate", e.target.value)}
                placeholder="e.g. 5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date (Day)</label>
              <Input
                required
                type="number"
                min="1" max="31"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                placeholder="e.g. 25"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
              <Input
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
