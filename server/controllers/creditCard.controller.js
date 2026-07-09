import CreditCard from '../models/creditCard.model.js';

// Get all credit cards
export const getCreditCards = async (req, res) => {
    try {
        const creditCards = await CreditCard.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(creditCards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single credit card
export const getCreditCard = async (req, res) => {
    try {
        const creditCard = await CreditCard.findOne({ _id: req.params.id, userId: req.user._id });
        if (!creditCard) {
            return res.status(404).json({ message: 'Credit card not found' });
        }
        res.json(creditCard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create credit card
export const createCreditCard = async (req, res) => {
    try {
        const creditCard = new CreditCard({
            ...req.body,
            userId: req.user._id
        });
        const savedCreditCard = await creditCard.save();
        res.status(201).json(savedCreditCard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update credit card
export const updateCreditCard = async (req, res) => {
    try {
        const creditCard = await CreditCard.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!creditCard) {
            return res.status(404).json({ message: 'Credit card not found' });
        }
        
        res.json(creditCard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete credit card
export const deleteCreditCard = async (req, res) => {
    try {
        const creditCard = await CreditCard.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user._id 
        });
        
        if (!creditCard) {
            return res.status(404).json({ message: 'Credit card not found' });
        }
        
        res.json({ message: 'Credit card deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
