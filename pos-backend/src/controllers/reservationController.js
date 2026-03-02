const Reservation = require('../models/Reservation');

// ✅ Create reservation
exports.createReservation = async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();
    console.log('✅ Reservation created:', reservation._id);
    res.status(201).json(reservation);
  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all reservations (for admin) or user's reservations
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    console.error('❌ Error fetching reservations:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update reservation (including status)
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    console.log('✅ Reservation updated:', reservation._id);
    res.json(reservation);
  } catch (error) {
    console.error('❌ Error updating reservation:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete reservation
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    console.log('✅ Reservation deleted:', reservation._id);
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting reservation:', error);
    res.status(500).json({ message: error.message });
  }
};