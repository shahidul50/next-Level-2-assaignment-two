import { bookingService } from "../modules/booking/booking.service";
import { vehicleService } from "../modules/vehicle/vehicle.service";

const updateBookingStatusBySystem = async () => {
  setInterval(async () => {
    const bookingData = await bookingService.getAllBookingForAutoUpdate();
    const activeData = await bookingData.rows.filter(
      (booking) => booking.status === "active"
    );
    await Promise.all(
      activeData.map(async (booking) => {
        if (new Date(booking.rent_end_date) < new Date()) {
          const bookingStatusUpdate = await bookingService.updateBooking(
            "returned",
            booking.id
          );
          if (bookingStatusUpdate.rowCount !== 0) {
            await vehicleService.updateVehicle(
              ["availability_status = $1"],
              ["available", booking.vehicle_id],
              2
            );
            console.log(
              `Booking Id: ${booking.id} is returned because its rent end date is over and admin isn't change status. And vehicle id: ${booking.vehicle_id} is available for booking`
            );
          }
        }
      })
    );
  }, 1000 * 60 * 60 * 24);
};

export default updateBookingStatusBySystem;
