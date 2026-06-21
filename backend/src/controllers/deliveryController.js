const Delivery = require('../models/Delivery');

exports.createDelivery = async (req, res) => {
  try {
    const deliveryData = {
      ...req.body,
      userId: req.userId,
    };

    const delivery = new Delivery(deliveryData);
    await delivery.save();

    res.status(201).json({
      success: true,
      delivery,
    });
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDeliveries = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const query = { userId: req.userId };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const deliveries = await Delivery.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      deliveries,
    });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({
      success: true,
      delivery,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({
      success: true,
      delivery,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({
      success: true,
      message: 'Delivery deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};